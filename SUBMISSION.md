# ChaosForge — Devpost Submission

**Project Name:** ChaosForge  
**Elevator Pitch:** Twitch chat mods the game in plain English; deterministic schema parsing keeps the stream safe at 60 FPS.  
**Built With:** openai-codex, twitch, eventsub, node.js, typescript, express, html5, canvas-2d, web-audio-api, sse  
**Repository URL:** https://github.com/vikassharma270907-alt/ChaosForge-deployment-and-compliance-check.  
**Demonstration Video:** `ChaosForge_Demo_Video_3to4min.mp4` (3:37) / `ChaosForge_Devpost_Under3min.mp4` (2:50)  
**OpenAI Codex Session ID:** `e4905582-5d8f-4280-a0fe-74ec0c366da6`  
**Demo Mode URL:** `http://localhost:3000/deck?mode=demo` and `http://localhost:3000/overlay?mode=demo` (or public hosted endpoint)  

---

## Inspiration

Twitch chat is at its best when the audience can materially shape a shared moment. Longitudinal platform data shows an 87% decline in chats per viewer, while broadcasters struggle with cognitive overload managing gameplay, vocal commentary, and moderation. Standard chatbots flood text chat and get disabled. We built ChaosForge with OpenAI Codex to transform passive viewers into live co-creators—enabling chat to propose natural-language physics and visual twists that safely alter an OBS arcade overlay at 60 FPS while keeping the streamer in effortless executive control.

## What it does

ChaosForge is an OBS Browser Source arcade arena and streamer control suite:
- **Plain-English Modding:** Viewers write `!forge` rules in Twitch chat (e.g., `!forge reverse gravity and make the floor lava neon`) or trigger community actions via Cheer Bits and Raids.
- **Governed Streamer Deck:** Proposals pass through message-ID deduplication, 15-second per-chatter cooldowns, link stripping, and repetition normalization into a clean broadcaster queue. Streamers can Approve or Veto with a single click, or enable 30-second Auto-Pilot to automatically promote the top community-voted proposal.
- **60 FPS OBS Canvas Overlay:** Approved rules dynamically alter horizontal and vertical gravity, spawn procedural lava, meteors, or spikes, and activate neon, glitch, or negative shaders in a transparent 1920×1080 canvas with procedural Web Audio synthesis.
- **Zero-Friction Demo Mode (?mode=demo):** Judges and streamers can evaluate the full loop without entering Twitch credentials. Simulated proposals, votes, cheers, and raids flow through the exact same production pipeline.

## How we built it

The app is built with TypeScript on Node.js using Express and Server-Sent Events (SSE). The overlay and deck are lightweight, zero-dependency browser JavaScript:
- **Safe by Design:** An offline deterministic keyword parser maps natural language into a strict, validated Effect schema where numeric values are clamped and enums are whitelisted. Viewer text is treated strictly as plain data, eliminating Cross-Site Scripting, prototype pollution, token theft, and infinite loops.
- **Resilient EventSub WebSockets:** Implements Node's built-in WebSocket client for Twitch EventSub (`wss://eventsub.wss.twitch.tv/ws`). Fulfills the strict 10-second subscription deadline on session welcome, handles 30-second session reconnect URL handoffs without event loss, enforces outbound-only socket compliance, and maintains 15-second SSE keepalive heartbeats.
- **Procedural Audio:** Web Audio API synthesizes dynamic sound cues on rule approval without external audio files.

## How we used Codex

We engineered ChaosForge end-to-end using the OpenAI Codex CLI across vertical slices:
- Scaffolding the decoupled domain layers (EventSub client, game engine, proposal queue, and SSE bridge).
- Engineering the deterministic parser, effect validator, and numeric clamping boundaries.
- Generating a comprehensive automated test suite of 30 unit tests covering EventSub welcome windows, reconnect handoffs, duplicate message-ID routing, and queue cooldowns with a 100% pass rate.
- Verified forensic audit trail anchored by our unique Codex Session ID:

`e4905582-5d8f-4280-a0fe-74ec0c366da6`

## Challenges

The central challenge was balancing audience agency with broadcast safety. Executing untrusted AI-generated code or `eval()` exposes broadcasters to security vulnerabilities and frame drops. We resolved this by constraining viewer prompts into a tightly validated, clamped data schema while keeping the streamer as the ultimate human-in-the-loop gatekeeper. We also engineered a login-free synthetic replay engine (`?mode=demo`) to guarantee zero-friction evaluation for Devpost judges.

## Accomplishments that we're proud of

- Complete login-free demo loop allowing judges to evaluate full functionality in under 60 seconds.
- Single-click streamer approval gate protecting the broadcaster's gameplay focus.
- 30 passing automated unit tests covering all protocol and moderation edge cases.
- Production-grade EventSub WebSocket lifecycle with reconnect URL handoff and keepalive monitoring.
- 1080p 60 FPS transparent OBS-ready overlay with procedural graphics and Web Audio sound.

## What's next

- Cross-channel co-op raid battles connecting two streamer communities in a shared arena.
- Persistent event logging and post-stream community contributor leaderboards.
- Expanded visual shader presets for RPG, tabletop, and music broadcasters.
