import { saveEnv } from "./env.js";

export const TWITCH_CLIENT_ID = "62kid1hd2lof776aye7tqf3ailo0y4";
export const REQUIRED_SCOPES = ["user:read:chat", "bits:read"];

export interface TwitchValidation {
  client_id: string;
  login: string;
  user_id: string;
  scopes: string[];
  expires_in: number;
}

export class TwitchAuthError extends Error {
  constructor(message: string, public readonly reason: "expired" | "scope" | "invalid") {
    super(message);
  }
}

export function authorizeUrl(): string {
  return "https://id.twitch.tv/oauth2/authorize?response_type=token"
    + `&client_id=${TWITCH_CLIENT_ID}`
    + "&redirect_uri=http://localhost:3000"
    + "&scope=user:read:chat+bits:read";
}

export async function validateTwitchToken(token: string): Promise<TwitchValidation> {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${token}` },
  });
  if (!response.ok) {
    throw new TwitchAuthError(
      "Token validation failed. It may be expired; rerun npm run twitch:login.",
      "expired",
    );
  }
  const validation = await response.json() as TwitchValidation;
  if (validation.client_id !== TWITCH_CLIENT_ID) {
    throw new TwitchAuthError("Token belongs to a different Twitch client; rerun npm run twitch:login.", "invalid");
  }
  const missing = REQUIRED_SCOPES.filter((scope) => !validation.scopes.includes(scope));
  if (missing.length) {
    throw new TwitchAuthError("Token is missing required scopes; rerun npm run twitch:login.", "scope");
  }
  return validation;
}

export async function saveValidatedToken(token: string): Promise<TwitchValidation> {
  const validation = await validateTwitchToken(token);
  saveEnv({
    TWITCH_CLIENT_ID,
    TWITCH_USER_TOKEN: token,
    TWITCH_BROADCASTER_ID: validation.user_id,
    TWITCH_USER_ID: validation.user_id,
    EVENTSUB_URL: "wss://eventsub.wss.twitch.tv/ws",
    PORT: "3000",
  });
  return validation;
}
