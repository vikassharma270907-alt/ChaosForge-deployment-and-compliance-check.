import type { ChaosForgeGame } from "./game.js";

export interface EventSubConfig {
  url: string;
  clientId: string;
  token: string;
  broadcasterId: string;
  userId: string;
}

export interface WebSocketLike {
  addEventListener(type: "message" | "close" | "error", listener: (event: { data?: unknown }) => void): void;
  close(): void;
}

export type WebSocketFactory = (url: string) => WebSocketLike;
export type StatusLogger = (message: string) => void;

interface Connection {
  socket: WebSocketLike;
  url: string;
  reconnectFrom?: Connection;
}

interface EventSubEnvelope {
  metadata?: { message_type?: string };
  payload?: {
    session?: { id?: string; keepalive_timeout_seconds?: number };
    subscription?: { type?: string };
    event?: Record<string, unknown>;
  };
}

const subscriptionTypes = ["channel.chat.message", "channel.cheer", "channel.raid"] as const;

/** Twitch EventSub WebSocket client. It only receives socket frames. */
export class EventSubClient {
  private active: Connection | undefined;
  private handoff: Connection | undefined;
  private keepaliveTimer: ReturnType<typeof setTimeout> | undefined;
  private keepaliveSeconds = 10;
  private stopped = false;

  constructor(
    private readonly config: EventSubConfig,
    private readonly game: ChaosForgeGame,
    private readonly createSocket: WebSocketFactory = (url) => new WebSocket(url),
    private readonly fetcher: typeof fetch = fetch,
    private readonly log: StatusLogger = (message) => console.log(message),
  ) {}

  connect(): void {
    this.stopped = false;
    this.game.setTwitchStatus("reconnecting");
    this.open(this.config.url);
  }

  stop(): void {
    this.stopped = true;
    if (this.keepaliveTimer) clearTimeout(this.keepaliveTimer);
    this.active?.socket.close();
    this.handoff?.socket.close();
    this.active = undefined;
    this.handoff = undefined;
    this.game.setTwitchStatus("disconnected");
  }

  private open(url: string, reconnectFrom?: Connection): void {
    const connection: Connection = { socket: this.createSocket(url), url, reconnectFrom };
    if (reconnectFrom) this.handoff = connection;
    else this.active = connection;
    connection.socket.addEventListener("message", (event) => this.onMessage(connection, event.data));
    connection.socket.addEventListener("close", () => this.onClose(connection));
    connection.socket.addEventListener("error", () => {
      if (connection === this.active) this.game.setTwitchStatus("error");
    });
  }

  private onMessage(connection: Connection, raw: unknown): void {
    let message: EventSubEnvelope;
    try { message = JSON.parse(String(raw)) as EventSubEnvelope; } catch { return; }
    const type = message.metadata?.message_type;
    if (type === "session_welcome") {
      const session = message.payload?.session;
      if (!session?.id) { this.game.setTwitchStatus("error"); return; }
      if (connection.reconnectFrom) {
        const old = connection.reconnectFrom;
        this.active = connection;
        this.handoff = undefined;
        old.socket.close();
      }
      if (connection !== this.active) return;
      this.game.setTwitchStatus("connected");
      this.armKeepalive(connection, session.keepalive_timeout_seconds);
      // This begins all three HTTPS POSTs immediately after the welcome message.
      void this.subscribe(session.id);
      return;
    }
    if (connection !== this.active) return;
    this.refreshKeepalive(connection);
    if (type === "session_reconnect") {
      const url = (message.payload as { session?: { reconnect_url?: unknown } } | undefined)?.session?.reconnect_url;
      if (typeof url === "string" && url.startsWith("wss://")) {
        this.game.setTwitchStatus("reconnecting");
        this.open(url, connection);
      } else this.game.setTwitchStatus("error");
      return;
    }
    if (type === "notification") this.routeNotification(message.payload?.subscription?.type, message.payload?.event ?? {});
  }

  private onClose(connection: Connection): void {
    if (this.stopped) return;
    if (connection === this.active && this.handoff) return;
    if (connection === this.handoff) this.handoff = undefined;
    if (connection === this.active || !this.active) this.reconnectFresh();
  }

  private reconnectFresh(): void {
    if (this.stopped) return;
    if (this.keepaliveTimer) clearTimeout(this.keepaliveTimer);
    this.game.setTwitchStatus("reconnecting");
    this.open(this.config.url);
  }

  private armKeepalive(connection: Connection, seconds: number | undefined): void {
    if (this.keepaliveTimer) clearTimeout(this.keepaliveTimer);
    if (!seconds || seconds <= 0) return;
    this.keepaliveSeconds = seconds;
    this.keepaliveTimer = setTimeout(() => {
      if (connection !== this.active || this.stopped) return;
      this.log("EventSub keepalive missed");
      this.reconnectFresh();
      connection.socket.close();
    }, (seconds + 1) * 1000);
    this.keepaliveTimer.unref?.();
  }

  private refreshKeepalive(connection: Connection): void {
    const delay = this.keepaliveTimer;
    if (delay) { clearTimeout(delay); this.keepaliveTimer = undefined; }
    // Twitch sends keepalives with no payload; the next session welcome re-arms the timer.
    if (connection === this.active) this.armKeepalive(connection, this.keepaliveSeconds);
  }

  private async subscribe(sessionId: string): Promise<void> {
    const requests = subscriptionTypes.map((type) => {
      const condition = type === "channel.chat.message"
        ? { broadcaster_user_id: this.config.broadcasterId, user_id: this.config.userId }
        : type === "channel.cheer"
          ? { broadcaster_user_id: this.config.broadcasterId }
          : { to_broadcaster_user_id: this.config.broadcasterId };
      return this.fetcher("https://api.twitch.tv/helix/eventsub/subscriptions", {
        method: "POST",
        headers: { "Client-Id": this.config.clientId, Authorization: `Bearer ${this.config.token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type, version: "1", condition, transport: { method: "websocket", session_id: sessionId } }),
      }).then((response) => {
        this.log(`EventSub subscription status ${response.status}`);
        if (!response.ok) this.game.setTwitchStatus("error");
      }).catch(() => { this.log("EventSub subscription status 0"); this.game.setTwitchStatus("error"); });
    });
    await Promise.all(requests);
  }

  private routeNotification(type: string | undefined, event: Record<string, unknown>): void {
    if (type === "channel.chat.message") {
      const message = event.message as { text?: unknown } | undefined;
      const messageId = event.message_id;
      const userId = event.chatter_user_id;
      const userName = event.chatter_user_name;
      if (typeof messageId === "string" && typeof userId === "string" && typeof userName === "string" && typeof message?.text === "string") {
        this.game.receiveChat({ messageId, userId, userName, text: message.text });
      }
    } else if (type === "channel.cheer") {
      const user = typeof event.user_name === "string" ? event.user_name : "Anonymous";
      const bits = typeof event.bits === "number" ? event.bits : 1;
      this.game.receiveCheer(user, bits);
    } else if (type === "channel.raid") {
      const user = typeof event.from_broadcaster_user_name === "string" ? event.from_broadcaster_user_name : "Raid party";
      const viewers = typeof event.viewer_count === "number" ? event.viewer_count : 1;
      this.game.simulateRaid(user, viewers);
    }
  }
}
