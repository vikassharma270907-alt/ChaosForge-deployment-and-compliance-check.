import express, { type Request, type Response } from "express";
import { loadEnv } from "./env.js";
import { saveValidatedToken, TwitchAuthError } from "./auth.js";

export const app = express();
app.use(express.json({ limit: "4kb" }));

app.get("/", (_request: Request, response: Response) => {
  response.type("html").send(`<!doctype html><meta charset="utf-8"><title>ChaosForge Twitch login</title>
<main><h1>Connecting to Twitch…</h1><p id="status">Reading the secure callback.</p></main>
<script>
const token = new URLSearchParams(location.hash.slice(1)).get('access_token');
if (!token) document.querySelector('#status').textContent = 'No access token was returned. Please start login again.';
else fetch('/auth/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})})
  .then(async r => ({ok:r.ok, body:await r.json()})).then(({ok,body}) => {
    document.querySelector('#status').textContent = ok ? 'Connected as ' + body.login : body.error;
    history.replaceState({}, '', location.pathname);
  }).catch(() => document.querySelector('#status').textContent = 'Could not save the Twitch connection.');
</script>`);
});

app.post("/auth/save", async (request: Request, response: Response) => {
  const ip = (request.ip ?? "").replace("::ffff:", "");
  if (ip !== "127.0.0.1" && ip !== "::1") {
    response.status(403).json({ error: "This endpoint accepts localhost callbacks only." });
    return;
  }
  const token = typeof request.body?.token === "string" ? request.body.token : "";
  if (!token || token.length > 4096) {
    response.status(400).json({ error: "No valid access token was received. Start login again." });
    return;
  }
  try {
    const validation = await saveValidatedToken(token);
    response.json({ login: validation.login });
  } catch (error: unknown) {
    const message = error instanceof TwitchAuthError ? error.message : "Could not validate the Twitch connection.";
    response.status(401).json({ error: message });
  }
});

if (import.meta.url === `file://${process.argv[1]?.replaceAll("\\", "/")}`) {
  const port = Number(loadEnv().PORT ?? 3000);
  app.listen(port, "127.0.0.1", () => console.log(`ChaosForge auth server at http://localhost:${port}`));
}
