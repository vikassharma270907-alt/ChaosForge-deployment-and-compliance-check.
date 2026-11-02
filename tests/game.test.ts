import assert from "node:assert/strict";
import test from "node:test";
import { ChaosForgeGame } from "../src/game.js";

test("approved chat proposal becomes the active schema-validated effect", () => {
  const game = new ChaosForgeGame(() => 1_000);
  assert.equal(game.receiveChat({ messageId: "a", userId: "u", userName: "Viewer", text: "!forge reverse gravity and lava" }), true);
  const proposal = game.snapshot().queue[0];
  game.approve(proposal.id);
  assert.equal(game.snapshot().active?.effect.gravityY, -1);
  assert.equal(game.snapshot().active?.effect.hazard, "lava");
});

test("chat votes flow through the same queue", () => {
  const game = new ChaosForgeGame();
  game.receiveChat({ messageId: "a", userId: "author", userName: "Author", text: "!forge neon" });
  assert.equal(game.receiveChat({ messageId: "b", userId: "voter", userName: "Voter", text: "!vote 1" }), true);
  assert.equal(game.snapshot().queue[0].votes, 1);
});
