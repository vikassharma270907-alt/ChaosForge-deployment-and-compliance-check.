import type { Effect } from "./effects.js";

export interface ProposalInput {
  messageId: string;
  userId: string;
  userName: string;
  text: string;
  effect: Effect;
}

export interface Proposal {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  text: string;
  effect: Effect;
  votes: number;
  createdAt: number;
}

interface StoredProposal extends Proposal { voters: Set<string> }

export type QueueResult =
  | { ok: true; proposal: Proposal }
  | { ok: false; reason: "duplicate" | "cooldown" | "full" | "empty" };

export function cleanProposalText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/(?:https?:\/\/|www\.)\S+/giu, "")
    .replace(/(.)\1{3,}/gu, "$1$1$1")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 120);
}

export class ProposalQueue {
  private readonly pending: StoredProposal[] = [];
  private readonly seenMessageIds = new Set<string>();
  private readonly lastByUser = new Map<string, number>();
  private nextId = 1;

  constructor(private readonly now: () => number = Date.now) {}

  enqueue(input: ProposalInput): QueueResult {
    if (this.seenMessageIds.has(input.messageId)) return { ok: false, reason: "duplicate" };
    const text = cleanProposalText(input.text);
    if (!text) return { ok: false, reason: "empty" };
    const time = this.now();
    const last = this.lastByUser.get(input.userId);
    if (last !== undefined && time - last < 15_000) return { ok: false, reason: "cooldown" };
    if (this.pending.length >= 10) return { ok: false, reason: "full" };
    const proposal: StoredProposal = {
      id: `proposal_${this.nextId++}`,
      messageId: input.messageId,
      userId: input.userId,
      userName: input.userName,
      text,
      effect: input.effect,
      votes: 0,
      createdAt: time,
      voters: new Set(),
    };
    this.seenMessageIds.add(input.messageId);
    this.lastByUser.set(input.userId, time);
    this.pending.push(proposal);
    return { ok: true, proposal: this.public(proposal) };
  }

  vote(userId: string, visibleNumber: number): boolean {
    const proposal = this.ordered()[visibleNumber - 1];
    if (!proposal || proposal.voters.has(userId)) return false;
    proposal.voters.add(userId);
    proposal.votes += 1;
    return true;
  }

  remove(id: string): Proposal | undefined {
    const index = this.pending.findIndex((proposal) => proposal.id === id);
    if (index < 0) return undefined;
    return this.public(this.pending.splice(index, 1)[0]);
  }

  top(): Proposal | undefined {
    const proposal = this.ordered()[0];
    return proposal && this.public(proposal);
  }

  list(): Proposal[] {
    return this.ordered().map((proposal) => this.public(proposal));
  }

  private ordered(): StoredProposal[] {
    return [...this.pending].sort((a, b) => b.votes - a.votes || a.createdAt - b.createdAt);
  }

  private public(proposal: StoredProposal): Proposal {
    const { voters: _voters, ...safeProposal } = proposal;
    return { ...safeProposal, effect: { ...safeProposal.effect } };
  }
}
