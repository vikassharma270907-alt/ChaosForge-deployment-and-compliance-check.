import express, { type Request, type Response } from "express";
import { pathToFileURL } from "node:url";
import { loadEnv } from "./env.js";
import { saveValidatedToken, TwitchAuthError } from "./auth.js";
import { deckPage, overlayPage } from "./pages.js";
import { ChaosForgeGame } from "./game.js";
import { EventSubClient } from "./eventsub.js";

export const app = express();
export const game = new ChaosForgeGame();
app.use(express.json({ limit: "4kb" }));
app.use(express.static("public"));

app.get("/overlay", (request: Request, response: Response) => {
  if (request.query.mode === "demo") game.startDemo();
  response.type("html").send(overlayPage(request.query.mode === "demo"));
});

app.get("/deck", (request: Request, response: Response) => {
  if (request.query.mode === "demo") game.startDemo();
  response.type("html").send(deckPage(request.query.mode === "demo"));
});

app.get("/events", (request: Request, response: Response) => {
  response.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
  response.flushHeaders();
  const unsubscribe = game.subscribe((state) => response.write(`event: state\ndata: ${JSON.stringify(state)}\n\n`));
  const heartbeat = setInterval(() => response.write(": keepalive\n\n"), 15_000);
  request.on("close", () => { clearInterval(heartbeat); unsubscribe(); response.end(); });
});

app.post("/api/approve/:id", (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const proposal = game.approve(id);
  response.status(proposal ? 200 : 404).json(proposal ? game.snapshot() : { error: "Proposal not found." });
});

app.post("/api/veto/:id", (request: Request, response: Response) => {
  const id = Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;
  const proposal = game.veto(id);
  response.status(proposal ? 200 : 404).json(proposal ? game.snapshot() : { error: "Proposal not found." });
});

app.post("/api/autopilot", (request: Request, response: Response) => {
  const enabled = typeof request.body?.enabled === "boolean" ? request.body.enabled : !game.snapshot().autopilot;
  game.setAutopilot(enabled);
  response.json(game.snapshot());
});

app.post("/api/simulate-raid", (_request: Request, response: Response) => {
  game.simulateRaid("DEMO · Simulated Raid", 75);
  response.json(game.snapshot());
});

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes("--demo")) game.startDemo();
  const port = Number(loadEnv().PORT ?? 3000);
  app.listen(port, "127.0.0.1", () => {
    console.log(`ChaosForge server at http://localhost:${port}`);
    const env = loadEnv();
    if (env.TWITCH_USER_TOKEN && env.TWITCH_BROADCASTER_ID && env.TWITCH_USER_ID) {
      new EventSubClient({
        url: env.EVENTSUB_URL ?? "wss://eventsub.wss.twitch.tv/ws",
        clientId: env.TWITCH_CLIENT_ID ?? "",
        token: env.TWITCH_USER_TOKEN,
        broadcasterId: env.TWITCH_BROADCASTER_ID,
        userId: env.TWITCH_USER_ID,
      }, game).connect();
    }
  });
}
