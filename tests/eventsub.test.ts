import assert from "node:assert/strict";
import test from "node:test";
import { EventSubClient, type WebSocketLike } from "../src/eventsub.js";
import { ChaosForgeGame } from "../src/game.js";

class FakeSocket implements WebSocketLike {
  listeners = new Map<string, Array<(event: { data?: unknown }) => void>>();
  closed = false;
  constructor(readonly url: string) {}
  addEventListener(type: "message" | "close" | "error", listener: (event: { data?: unknown }) => void): void { this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]); }
  emit(type: string, data?: unknown): void { for (const listener of this.listeners.get(type) ?? []) listener({ data }); }
  close(): void { this.closed = true; this.emit("close"); }
}

const config = { url: "ws://mock.eventsub", clientId: "client", token: "secret", broadcasterId: "broadcaster", userId: "user" };
const welcome = (id: string) => JSON.stringify({ metadata: { message_type: "session_welcome" }, payload: { session: { id, keepalive_timeout_seconds: 60 } } });

function setup() {
  const sockets: FakeSocket[] = [], calls: Array<{ body?: string; at: number }> = [], log: string[] = [];
  let now = 0;
  const client = new EventSubClient(config, new ChaosForgeGame(), (url) => { const socket = new FakeSocket(url); sockets.push(socket); return socket; }, async (_url, init) => { calls.push({ body: String(init?.body), at: now }); return new Response(null, { status: 202 }); }, (line) => log.push(line));
  return { client, sockets, calls, log, setNow: (value: number) => { now = value; } };
}

test("subscribes to all required EventSub topics immediately on welcome (under 10 seconds)", () => {
  const testbed = setup(); testbed.client.connect(); testbed.setNow(9_999); testbed.sockets[0].emit("message", welcome("session-1"));
  assert.equal(testbed.calls.length, 3);
  assert.deepEqual(testbed.calls.map((call) => JSON.parse(call.body ?? "{}").type).sort(), ["channel.chat.message", "channel.cheer", "channel.raid"]);
  assert.ok(testbed.calls.every((call) => call.at < 10_000));
});

test("reconnect waits for the new welcome before closing the old socket and does not re-subscribe", () => {
  const testbed = setup(); testbed.client.connect(); const old = testbed.sockets[0]; old.emit("message", welcome("old"));
  assert.equal(testbed.calls.length, 3);
  old.emit("message", JSON.stringify({ metadata: { message_type: "session_reconnect" }, payload: { session: { reconnect_url: "wss://exact.reconnect" } } }));
  assert.equal(testbed.sockets[1].url, "wss://exact.reconnect"); assert.equal(old.closed, false);
  testbed.sockets[1].emit("message", welcome("new")); assert.equal(old.closed, true); assert.equal(testbed.calls.length, 3);
});

test("duplicate Twitch chat message IDs are deduped after EventSub routing", () => {
  const game = new ChaosForgeGame(); const sockets: FakeSocket[] = [];
  const client = new EventSubClient(config, game, (url) => { const socket = new FakeSocket(url); sockets.push(socket); return socket; }, async () => new Response(null, { status: 202 }), () => {});
  client.connect(); sockets[0].emit("message", welcome("s"));
  const notification = JSON.stringify({ metadata: { message_type: "notification" }, payload: { subscription: { type: "channel.chat.message" }, event: { message_id: "same", chatter_user_id: "viewer", chatter_user_name: "Viewer", message: { text: "!forge lava" } } } });
  sockets[0].emit("message", notification); sockets[0].emit("message", notification);
  assert.equal(game.snapshot().queue.length, 1);
});

test("an unexpected close reconnects to the configured EventSub URL", () => {
  const testbed = setup(); testbed.client.connect(); testbed.sockets[0].emit("close");
  assert.equal(testbed.sockets[1].url, config.url);
});
