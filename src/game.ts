import { SAFE_EFFECT, type Effect } from "./effects.js";
import { parseRule } from "./parser.js";
import { ProposalQueue, type Proposal } from "./queue.js";

export type TwitchStatus = "disconnected" | "connected" | "reconnecting" | "error" | "demo";
export interface ActiveEffect { id: string; text: string; user: string; effect: Effect; endsAt: number }
export interface Contributor { label: string; kind: "proposal" | "cheer" | "raid" }
export interface GameState {
  queue: Proposal[];
  active: ActiveEffect | null;
  contributors: Contributor[];
  autopilot: boolean;
  twitch: TwitchStatus;
}

type Listener = (state: GameState) => void;

export class ChaosForgeGame {
  readonly queue: ProposalQueue;
  private active: ActiveEffect | null = null;
  private contributors: Contributor[] = [];
  private listeners = new Set<Listener>();
  private autopilot = false;
  private twitch: TwitchStatus = "disconnected";
  private expiryTimer: ReturnType<typeof setTimeout> | undefined;
  private autopilotTimer: ReturnType<typeof setInterval> | undefined;
  private demoTimer: ReturnType<typeof setInterval> | undefined;
  private demoStarted = false;
  private demoStep = 0;

  constructor(private readonly now: () => number = Date.now) {
    this.queue = new ProposalQueue(now);
  }

  snapshot(): GameState {
    return {
      queue: this.queue.list(),
      active: this.active && { ...this.active, effect: { ...this.active.effect } },
      contributors: this.contributors.map((contributor) => ({ ...contributor })),
      autopilot: this.autopilot,
      twitch: this.twitch,
    };
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  setTwitchStatus(status: TwitchStatus): void { this.twitch = status; this.broadcast(); }

  receiveChat(event: { messageId: string; userId: string; userName: string; text: string }): boolean {
    const forge = /^!forge\s+(.+)/is.exec(event.text);
    if (forge) {
      const result = this.queue.enqueue({ ...event, text: forge[1], effect: parseRule(forge[1]) });
      if (result.ok) { this.addContributor(`proposed by ${result.proposal.userName}`, "proposal"); this.broadcast(); }
      return result.ok;
    }
    const vote = /^!vote\s+(\d+)\s*$/i.exec(event.text);
    if (vote && this.queue.vote(event.userId, Number(vote[1]))) { this.broadcast(); return true; }
    return false;
  }

  approve(id: string): Proposal | undefined {
    const proposal = this.queue.remove(id);
    if (!proposal) return undefined;
    this.activate(proposal);
    return proposal;
  }

  veto(id: string): Proposal | undefined {
    const proposal = this.queue.remove(id);
    if (proposal) this.broadcast();
    return proposal;
  }

  setAutopilot(enabled: boolean): void {
    this.autopilot = enabled;
    if (enabled && !this.autopilotTimer) {
      this.autopilotTimer = setInterval(() => { const top = this.queue.top(); if (top) this.approve(top.id); }, 30_000);
      this.autopilotTimer.unref?.();
    }
    if (!enabled && this.autopilotTimer) { clearInterval(this.autopilotTimer); this.autopilotTimer = undefined; }
    this.broadcast();
  }

  simulateRaid(userName = "Raid party", viewers = 42): void {
    this.addContributor(`${userName} raided with ${viewers}`, "raid");
    this.broadcast();
  }

  receiveCheer(userName: string, bits: number): void {
    this.addContributor(`${userName} cheered ${Math.max(1, Math.floor(bits))} bits`, "cheer");
    this.broadcast();
  }

  startDemo(): void {
    if (this.demoStarted) return;
    this.demoStarted = true;
    this.twitch = "demo";
    const rules = ["reverse gravity and make the floor lava neon", "glitch meteors and give a shield", "pull right through the spikes", "float in an inverted arena"];
    const emit = () => {
      const step = this.demoStep++;
      const viewer = `DEMO · Viewer${(step % 20) + 1}`;
      if (step % 3 === 1 && this.queue.list().length) this.receiveChat({ messageId: `demo-vote-${step}`, userId: `demo-voter-${step % 20}`, userName: viewer, text: "!vote 1" });
      else this.receiveChat({ messageId: `demo-forge-${step}`, userId: `demo-user-${step % 20}`, userName: viewer, text: `!forge ${rules[step % rules.length]}` });
      if (step === 5) this.receiveCheer("DEMO · CheerBot", 250);
      if (step === 16) this.simulateRaid("DEMO · RaidTrain", 75);
      const top = this.queue.top();
      if (top && !this.active) this.approve(top.id);
    };
    emit();
    this.demoTimer = setInterval(emit, 2_800);
    this.demoTimer.unref?.();
    this.broadcast();
  }

  private activate(proposal: Proposal): void {
    if (this.expiryTimer) clearTimeout(this.expiryTimer);
    this.active = { id: proposal.id, text: proposal.text, user: proposal.userName, effect: proposal.effect, endsAt: this.now() + proposal.effect.durationSeconds * 1000 };
    this.expiryTimer = setTimeout(() => { this.active = null; this.broadcast(); }, proposal.effect.durationSeconds * 1000);
    this.expiryTimer.unref?.();
    this.broadcast();
  }

  private addContributor(label: string, kind: Contributor["kind"]): void {
    this.contributors = [{ label, kind }, ...this.contributors.filter((item) => item.label !== label)].slice(0, 8);
  }

  private broadcast(): void { const state = this.snapshot(); for (const listener of this.listeners) listener(state); }
}

export const DEFAULT_EFFECT = SAFE_EFFECT;
