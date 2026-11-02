export const HAZARDS = ["none", "lava", "meteors", "spikes"] as const;
export const SHADERS = ["none", "neon", "glitch", "invert"] as const;

export type Hazard = (typeof HAZARDS)[number];
export type Shader = (typeof SHADERS)[number];

export interface Effect {
  gravityX: number;
  gravityY: number;
  hazard: Hazard;
  hazardIntensity: number;
  shader: Shader;
  shieldSeconds: number;
  durationSeconds: number;
}

export const SAFE_EFFECT: Readonly<Effect> = Object.freeze({
  gravityX: 0,
  gravityY: 1,
  hazard: "none",
  hazardIntensity: 1,
  shader: "none",
  shieldSeconds: 0,
  durationSeconds: 20,
});

type EffectInput = Partial<Record<keyof Effect, unknown>>;

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const numberValue = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, numberValue));
}

function enumOr<T extends readonly string[]>(value: unknown, choices: T, fallback: T[number]): T[number] {
  return typeof value === "string" && (choices as readonly string[]).includes(value) ? value as T[number] : fallback;
}

export function isEffect(value: unknown): value is Effect {
  if (!value || typeof value !== "object") return false;
  const effect = value as EffectInput;
  return typeof effect.gravityX === "number" && effect.gravityX >= -1 && effect.gravityX <= 1
    && typeof effect.gravityY === "number" && effect.gravityY >= -1 && effect.gravityY <= 1
    && typeof effect.hazard === "string" && (HAZARDS as readonly string[]).includes(effect.hazard)
    && typeof effect.hazardIntensity === "number" && effect.hazardIntensity >= 1 && effect.hazardIntensity <= 5
    && typeof effect.shader === "string" && (SHADERS as readonly string[]).includes(effect.shader)
    && typeof effect.shieldSeconds === "number" && effect.shieldSeconds >= 0 && effect.shieldSeconds <= 10
    && typeof effect.durationSeconds === "number" && effect.durationSeconds >= 5 && effect.durationSeconds <= 25;
}

/** Returns only a safe, complete effect. Invalid enum values fall back; numeric values clamp. */
export function validateEffect(value: unknown, fallback: Effect = SAFE_EFFECT): Effect {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...fallback };
  const input = value as EffectInput;
  return {
    gravityX: clamp(input.gravityX, -1, 1, fallback.gravityX),
    gravityY: clamp(input.gravityY, -1, 1, fallback.gravityY),
    hazard: enumOr(input.hazard, HAZARDS, fallback.hazard),
    hazardIntensity: clamp(input.hazardIntensity, 1, 5, fallback.hazardIntensity),
    shader: enumOr(input.shader, SHADERS, fallback.shader),
    shieldSeconds: clamp(input.shieldSeconds, 0, 10, fallback.shieldSeconds),
    durationSeconds: clamp(input.durationSeconds, 5, 25, fallback.durationSeconds),
  };
}

export function describeEffect(effect: Effect): string {
  const parts: string[] = [];
  if (effect.gravityY < 0) parts.push("reverse gravity");
  else if (effect.gravityY < 1) parts.push("low gravity");
  if (effect.gravityX < 0) parts.push("pull left");
  if (effect.gravityX > 0) parts.push("pull right");
  if (effect.hazard !== "none") parts.push(effect.hazard);
  if (effect.shader !== "none") parts.push(`${effect.shader} visual`);
  if (effect.shieldSeconds) parts.push(`${effect.shieldSeconds}s shield`);
  return parts.length ? parts.join(" + ") : "standard arena";
}
