import assert from "node:assert/strict";
import test from "node:test";
import { SAFE_EFFECT } from "../src/effects.js";
import { cleanProposalText, ProposalQueue } from "../src/queue.js";

function input(messageId: string, userId = "u1", text = "make lava") { return { messageId, userId, userName: userId, text, effect: { ...SAFE_EFFECT, hazard: "lava" as const } }; }

test("queue dedupes Twitch message IDs", () => {
  const queue = new ProposalQueue();
  assert.equal(queue.enqueue(input("m1")).ok, true);
  assert.deepEqual(queue.enqueue(input("m1")), { ok: false, reason: "duplicate" });
});

test("queue enforces a 15 second per-user cooldown", () => {
  let now = 0; const queue = new ProposalQueue(() => now);
  assert.equal(queue.enqueue(input("m1")).ok, true);
  now = 14_999; assert.deepEqual(queue.enqueue(input("m2")), { ok: false, reason: "cooldown" });
  now = 15_000; assert.equal(queue.enqueue(input("m3")).ok, true);
});

test("queue caps at ten pending proposals", () => {
  let now = 0; const queue = new ProposalQueue(() => now);
  for (let index = 0; index < 10; index++) { now += 15_000; assert.equal(queue.enqueue(input(`m${index}`, `u${index}`)).ok, true); }
  assert.deepEqual(queue.enqueue(input("overflow", "last")), { ok: false, reason: "full" });
});

test("a viewer can vote for a proposal once", () => {
  const queue = new ProposalQueue(); queue.enqueue(input("m1"));
  assert.equal(queue.vote("viewer", 1), true);
  assert.equal(queue.vote("viewer", 1), false);
  assert.equal(queue.list()[0].votes, 1);
});

test("proposal text strips links, repeated characters and caps to 120", () => {
  assert.equal(cleanProposalText("lava https://bad.example aaaaaa"), "lava aaa");
  assert.equal(cleanProposalText("x".repeat(500)).length, 3);
  assert.equal(cleanProposalText(Array(121).fill("z").join(" ")).length, 120);
});
