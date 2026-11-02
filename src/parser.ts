import { SAFE_EFFECT, type Effect, validateEffect } from "./effects.js";

/** Deterministic, offline keyword parser. It treats all source text as plain data. */
export function parseRule(rawText: unknown): Effect {
  const text = typeof rawText === "string" ? rawText.toLocaleLowerCase("en-US") : "";
  const candidate: Partial<Effect> = { ...SAFE_EFFECT };

  if (/\b(reverse|upside[ -]?down)\b/.test(text) && /\b(gravity|fall|world)\b/.test(text)) {
    candidate.gravityY = -1;
  } else if (/\b(float|low gravity|moon)\b/.test(text)) {
    candidate.gravityY = 0.25;
  } else if (/\b(no gravity|zero gravity)\b/.test(text)) {
    candidate.gravityY = 0;
  }
  if (/\b(left|west)\b/.test(text) && /\b(gravity|pull|wind)\b/.test(text)) candidate.gravityX = -1;
  if (/\b(right|east)\b/.test(text) && /\b(gravity|pull|wind)\b/.test(text)) candidate.gravityX = 1;

  if (/\blava\b/.test(text)) candidate.hazard = "lava";
  else if (/\b(meteor|meteors)\b/.test(text)) candidate.hazard = "meteors";
  else if (/\b(spike|spikes)\b/.test(text)) candidate.hazard = "spikes";
  if (/\b(very|maximum|insane|extreme|hard)\b/.test(text)) candidate.hazardIntensity = 5;
  else if (/\b(mild|easy|gentle)\b/.test(text)) candidate.hazardIntensity = 2;

  if (/\bneon\b/.test(text)) candidate.shader = "neon";
  else if (/\bglitch\b/.test(text)) candidate.shader = "glitch";
  else if (/\b(invert|negative)\b/.test(text)) candidate.shader = "invert";

  if (/\b(shield|bubble|protect)\b/.test(text)) candidate.shieldSeconds = 8;
  if (/\b(short|quick)\b/.test(text)) candidate.durationSeconds = 8;
  else if (/\b(long|extended)\b/.test(text)) candidate.durationSeconds = 25;

  return validateEffect(candidate);
}
