import assert from "node:assert/strict";
import test from "node:test";
import { SAFE_EFFECT, validateEffect } from "../src/effects.js";
import { parseRule } from "../src/parser.js";

test("default is a complete safe effect", () => assert.deepEqual(parseRule("gibberish only"), SAFE_EFFECT));
test("reverse gravity is parsed", () => assert.equal(parseRule("reverse gravity").gravityY, -1));
test("float is parsed", () => assert.equal(parseRule("make us float").gravityY, 0.25));
test("left gravity is parsed", () => assert.equal(parseRule("gravity left").gravityX, -1));
test("right pull is parsed", () => assert.equal(parseRule("pull right").gravityX, 1));
test("lava is parsed", () => assert.equal(parseRule("the floor is lava").hazard, "lava"));
test("meteors are parsed", () => assert.equal(parseRule("send meteors").hazard, "meteors"));
test("spikes are parsed", () => assert.equal(parseRule("more spikes").hazard, "spikes"));
test("neon shader is parsed", () => assert.equal(parseRule("go neon").shader, "neon"));
test("glitch shader is parsed", () => assert.equal(parseRule("glitch it").shader, "glitch"));
test("shield is parsed", () => assert.equal(parseRule("give a shield").shieldSeconds, 8));
test("hostile html stays data and uses the safe fallback", () => assert.deepEqual(parseRule("<script>alert('x')</script>"), SAFE_EFFECT));
test("long text remains bounded", () => assert.equal(parseRule("lava ".repeat(50000)).hazard, "lava"));
test("unicode spam uses the safe fallback", () => assert.deepEqual(parseRule("💥🔥漢字".repeat(300)), SAFE_EFFECT));
test("validator clamps all numeric ranges", () => {
  const effect = validateEffect({ gravityX: 10, gravityY: -4, hazardIntensity: 99, shieldSeconds: -1, durationSeconds: 900 });
  assert.deepEqual(effect, { ...SAFE_EFFECT, gravityX: 1, gravityY: -1, hazardIntensity: 5, shieldSeconds: 0, durationSeconds: 25 });
});
test("validator rejects unknown enum values", () => {
  const effect = validateEffect({ hazard: "code execution", shader: "evil" });
  assert.equal(effect.hazard, "none");
  assert.equal(effect.shader, "none");
});
