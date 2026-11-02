# ChaosForge

ChaosForge is a live audience modding engine and transparent OBS Browser Source arcade arena for the Codex x TwitchCon Hackathon. Viewers propose plain-English rules with `!forge`; the streamer approves or vetoes them from a control deck; approved rules safely change the live canvas arena for a short round.

## 🌐 Live Hosted Deployment (Render)

The application is deployed live with zero-downtime health probes on Render:
- **ChaosForge Portal**: [https://chaosforge-3ky4.onrender.com](https://chaosforge-3ky4.onrender.com)
- **Streamer Control Deck (Demo Mode)**: [https://chaosforge-3ky4.onrender.com/deck?mode=demo](https://chaosforge-3ky4.onrender.com/deck?mode=demo)
- **OBS Canvas Overlay (Demo Mode)**: [https://chaosforge-3ky4.onrender.com/overlay?mode=demo](https://chaosforge-3ky4.onrender.com/overlay?mode=demo)

## Quick start (demo, no Twitch login)

```powershell
npm install
npm test
npm run demo
```

Open [http://localhost:3000/deck?mode=demo](http://localhost:3000/deck?mode=demo) and [http://localhost:3000/overlay?mode=demo](http://localhost:3000/overlay?mode=demo). The demo generates labeled `DEMO` chat proposals, votes, cheers, and a raid; all proposals go through the same parser, queue, and approval pipeline as live messages.

For OBS, add a Browser Source at `http://localhost:3000/overlay` (or `https://chaosforge-3ky4.onrender.com/overlay`) with a 1920×1080 canvas. The page itself has a transparent background.

## Connect Twitch

Copy `.env.example` to `.env` and leave the token fields blank. Then, in order:

```powershell
npm run twitch:login
npm run twitch:check
npm run dev
```

Keep the `twitch:login` terminal open while authenticating: it hosts the localhost callback and opens the Twitch authorization page. The callback validates the returned token with Twitch, confirms the required scopes, writes it to the ignored `.env` file, and displays only the connected login. `twitch:check` prints the login, user ID, scopes, and expiry—never the token. Once `npm run dev` is running, a real `!forge reverse gravity and make the floor lava` in the configured broadcaster chat should enter the deck.

## What is safe by design

Viewer text is treated as data, not code. The offline deterministic parser maps a small set of keywords to a fixed effect schema, and `effects.ts` clamps every numeric field and rejects unknown enum values. Proposals are URL-stripped, character-normalized, capped at 120 characters, deduplicated by Twitch message ID, rate-limited per viewer, and held in a maximum queue of ten. The browser clients render text with `textContent`.

## Architecture

```text
Twitch EventSub / demo generator
            │
            ▼
 eventsub.ts → game.ts → queue.ts → parser.ts → effects.ts
                  │                        │
                  └────── SSE /events ─────┘
                       │              │
                       ▼              ▼
                 /deck controls   /overlay Canvas 2D
```

`eventsub.ts` uses Node’s built-in WebSocket client only to receive EventSub messages. It creates the three required subscriptions on each welcome, handles Twitch-directed handoffs, reconnects after unexpected close or missed keepalive, and reports subscription status codes without exposing credentials. State is in memory; `.env` is only for connection configuration and credentials.

## Useful commands

```powershell
npm run dev          # local deck + overlay; connects Twitch if .env is configured
npm run demo         # synthetic, login-free presentation mode
npm test             # all unit tests
npm run twitch:login # localhost implicit-flow capture
npm run twitch:check # validate a previously saved token
```

## Limitations

- State is intentionally in memory, so restarting the server clears the proposal queue and round history. An optional JSONL event log is not implemented.
- Live Twitch authentication and EventSub delivery require the streamer’s own token and broadcaster configuration. They are not exercised by this repository’s automated test run.
- Twitch does not replay missed EventSub events after a reconnect; the client reconnects and re-subscribes for future events.
- The optional OpenAI effect-conversion slice is not implemented; the deterministic offline parser is always used.
