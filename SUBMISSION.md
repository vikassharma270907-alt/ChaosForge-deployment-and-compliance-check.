# ChaosForge — Devpost submission draft

## Inspiration

Twitch chat is at its best when the audience can materially shape a shared moment. We wanted to turn chat’s playful chaos into a stream overlay that feels immediate for viewers but stays legible and controllable for the streamer.

## What it does

ChaosForge is an OBS Browser Source arcade arena. Viewers write `!forge` rules in plain English—such as `!forge reverse gravity and make the floor lava`—and the streamer sees those proposals in a control deck. The streamer can approve or veto each proposal, or turn on Auto-Pilot to approve the top-voted proposal every 30 seconds. An approved rule changes gravity, hazards, visual presets, and shields in the transparent Canvas 2D overlay for a limited round.

The included demo mode needs no Twitch login. It creates clearly labeled `DEMO` proposals, votes, cheers, and a raid, then sends them through the same parser, queue, and approval path used by live events.

## How we built it

The app is TypeScript on Node with Express and Server-Sent Events. The overlay and deck are vanilla browser JavaScript. A deterministic parser maps viewer text into a narrow, validated effect schema; text is never executed as code. The in-memory proposal queue limits capacity, strips links, normalizes repeated characters, enforces cooldowns, deduplicates message IDs, and allows one vote per viewer.

For live mode, the app uses Node’s built-in WebSocket client for Twitch EventSub. It creates chat-message, cheer, and raid subscriptions after a welcome, routes incoming events into the existing queue, and supports reconnect handoffs and fresh reconnection. The canvas arena is procedural, including Web Audio feedback rather than external audio assets.

## How we used Codex

We used Codex as an implementation partner for incremental vertical slices: safe token capture, effect validation and parser tests, the canvas overlay, the queue/deck/SSE loop, EventSub reconnect tests, and documentation. The session ID is required for the hackathon submission:

`[PASTE_SESSION_ID]`

## Challenges

The central challenge was balancing audience agency with safety. Viewer language is deliberately constrained to data that is clamped against a compact effect schema, while a streamer still has a clear approval gate. We also had to make the entire feedback loop demonstrable without a live token, which led to demo events using the same internal pipeline rather than a separate visual mock.

## Accomplishments that we're proud of

- A complete, login-free demo loop that a judge can watch in under a minute.
- A clear streamer control point for every live arena change.
- Tested queue controls for duplicate message IDs, cooldowns, capacity, text normalization, and vote-once behavior.
- EventSub tests covering immediate subscription initiation, reconnect handoff, duplicate chat routing, and unexpected-close recovery.
- A transparent 1920×1080 OBS-ready overlay with procedural visuals and sound.

## What's next

We would add durable event logging, richer arena objectives, a more complete in-deck contribution history, and a carefully schema-validated optional natural-language enhancer that still falls back to the deterministic parser. We would also validate the live Twitch flow with the streamer’s configured account before production use.
