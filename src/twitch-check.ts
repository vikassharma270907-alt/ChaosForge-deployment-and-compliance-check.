import { loadEnv } from "./env.js";
import { TwitchAuthError, validateTwitchToken } from "./auth.js";

const token = loadEnv().TWITCH_USER_TOKEN;
if (!token) {
  console.error("No saved Twitch token. Run npm run twitch:login first.");
  process.exitCode = 1;
} else {
  validateTwitchToken(token)
    .then((info) => {
      console.log(`login: ${info.login}`);
      console.log(`user_id: ${info.user_id}`);
      console.log(`scopes: ${info.scopes.join(", ")}`);
      console.log(`expires_in: ${info.expires_in}`);
    })
    .catch((error: unknown) => {
      const message = error instanceof TwitchAuthError ? error.message : "Twitch validation could not be completed. Check your connection and try again.";
      console.error(message);
      process.exitCode = 1;
    });
}
