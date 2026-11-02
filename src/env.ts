import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");

export function loadEnv(): Record<string, string> {
  const values: Record<string, string> = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
      if (match) values[match[1]] = match[2];
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

export function saveEnv(updates: Record<string, string>): void {
  const existing = loadEnv();
  const merged = { ...existing, ...updates };
  const allowed = [
    "TWITCH_CLIENT_ID", "TWITCH_USER_TOKEN", "TWITCH_BROADCASTER_ID",
    "TWITCH_USER_ID", "OPENAI_API_KEY", "EVENTSUB_URL", "PORT",
  ];
  const body = allowed
    .filter((key) => key in merged)
    .map((key) => `${key}=${merged[key]}`)
    .join("\n") + "\n";
  writeFileSync(envPath, body, { encoding: "utf8", mode: 0o600 });
}

export function redactToken(token: string): string {
  return token.length <= 4 ? "****" : `${token.slice(0, 4)}…`;
}
