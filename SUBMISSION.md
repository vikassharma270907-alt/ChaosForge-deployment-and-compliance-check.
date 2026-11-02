# ChaosForge — Devpost Submission

**Project Name:** ChaosForge  
**Elevator Pitch:** Twitch chat mods the game in plain English; deterministic schema parsing keeps the stream safe at 60 FPS.  
**Built With:** openai-codex, twitch, eventsub, node.js, typescript, express, html5, canvas-2d, web-audio-api, sse  
**Repository URL:** https://github.com/vikassharma270907-alt/ChaosForge-deployment-and-compliance-check.  
**Live Hosted Web App (Render):** https://chaosforge-3ky4.onrender.com  
**Demo Control Deck:** https://chaosforge-3ky4.onrender.com/deck?mode=demo  
**OBS Canvas Overlay:** https://chaosforge-3ky4.onrender.com/overlay?mode=demo  
**Health Check Probe:** https://chaosforge-3ky4.onrender.com/healthz  
**Demonstration Video File:** `ChaosForge_Devpost_Under3min.mp4` (Duration: 2:50 / 170.3s — Strictly compliant with the < 3:00 minute rule)  
**OpenAI Codex Session ID:** `e4905582-5d8f-4280-a0fe-74ec0c366da6`  
**Printable PDF Submission Worksheet:** [`devpost-submission-pdf.html`](./devpost-submission-pdf.html)

---

## Inspiration & Macro-Platform Context

Twitch chat is at its best when the audience can materially shape a shared broadcast moment. However, longitudinal platform telemetry comparing 2018 to 2026 reveals an urgent structural problem:
- **87% decline** in chats per viewer.
- **86% drop** in chats per minute watched.
- **52% decrease** in chats per hour streamed.

Meanwhile, live broadcasters suffer from cognitive overload; managing gameplay, commentary, and moderation leaves zero bandwidth for reading walls of bot-generated chat spam or operating complex third-party dashboards. Many streamers disable traditional chatbots entirely during live broadcasts.

Legacy text-in, text-out bots fail because they add noise without spectacle. We built **ChaosForge** with **OpenAI Codex** as an **asymmetric community amplifier**: a system where minimal, low-friction viewer inputs (`!forge <rule>`, cheer bits, raids) are safely aggregated and transmuted into rich, dynamic audiovisual events on a transparent OBS Browser Source canvas, while keeping the broadcaster in effortless, single-click executive control.

## Why OBS Browser Source (Bypassing the Twitch Extension Trap)

A critical architectural decision was delivering ChaosForge as an **OBS Browser Source with WebSocket/SSE event streaming** rather than a formal Twitch Extension. Official Twitch Extensions require a mandatory 5 to 14-day security review before publication. Unapproved extensions cannot be installed on test channels, creating a fatal bottleneck for hackathon judges evaluating submissions.

Our architecture connects directly to **Twitch EventSub over WebSockets** (`wss://eventsub.wss.twitch.tv/ws`) and streams real-time state to an OBS overlay via Server-Sent Events (SSE). This operates seamlessly locally or on cloud edge hosts without requiring public webhook tunnels, custom domains, or extension review delays.

## What It Does

ChaosForge turns Twitch chat into a live game-modding studio:
- **Plain-English Modding:** Viewers write rules in chat using `!forge <rule>` (e.g., `!forge reverse gravity and make the floor lava with neon shader`) or trigger community moments with Cheer Bits and Raids.
- **Governed Streamer Deck:** Incoming proposals pass through message-ID deduplication, 15-second per-chatter cooldowns, URL stripping, and character repetition normalization into a bounded broadcaster queue (max 10 items). Streamers can Approve or Veto with a single click, or toggle 30-second Auto-Pilot to automatically promote the top community-voted rule.
- **60 FPS OBS Canvas Overlay:** Approved rules dynamically alter horizontal and vertical physics, spawn procedural hazards (lava, meteors, spikes), activate visual shaders (neon glow, glitch, invert), and grant protective shields in a 1920×1080 transparent canvas.
- **Procedural Web Audio Synthesis:** When rules are approved, custom Web Audio synthesis triggers immediate reactive audio cues with zero external audio assets.
- **Zero-Friction Judge Demo Mode (`?mode=demo`):** Evaluators can test the entire loop without entering Twitch credentials. A synthetic event generator creates labeled `DEMO` proposals, votes, cheers, and raids that flow through the exact same parsing and approval pipeline as live Twitch broadcasts.

## How We Built It

- **Runtime & Language:** Node.js (>=22 LTS, protected against CVE-2026-111497) and TypeScript.
- **Safe by Design (Deterministic Parsing over Unbounded LLM Latency):** Rather than routing raw chat through a slow, unpredictable LLM call per frame—which introduces latency, prompt-injection risks, and frame drops—we engineered an offline deterministic parser that maps natural language keywords to a strictly validated, clamped Effect schema. Viewer text is treated strictly as plain data, eliminating Cross-Site Scripting (XSS), prototype pollution, and infinite loops.
- **Twitch EventSub WebSocket Protocol Resilience:**
  - **10-Second Welcome Window:** Dispatches subscription requests immediately upon receiving `session_welcome`, preventing Close Code 4003 (connection unused).
  - **30-Second Reconnect Handoff:** Seamlessly migrates to the new `reconnect_url` during `session_reconnect` frames without dropping subscriptions, preventing Close Code 4004.
  - **Outbound-Only Socket Compliance:** Prevents Close Code 4001 by avoiding raw inbound frames to EventSub.
  - **15-Second Heartbeat & SSE Keepalives:** Prevents silent TCP drops from NAT gateways and proxy firewalls.

## How We Used OpenAI Codex

ChaosForge was constructed end-to-end using the OpenAI Codex CLI. Every architectural vertical slice was generated, refined, and tested interactively:
1. **Protocol & State Scaffolding:** Codex generated the decoupled EventSub WebSocket client, proposal queue state machine, and Express SSE bridge.
2. **Deterministic Validator & Clamping:** Codex designed the schema validator (`effects.ts`) ensuring numeric parameters are clamped within safe ranges and invalid enums default safely.
3. **Automated Test Generation:** Codex generated 31 unit tests verifying EventSub welcome handshakes, duplicate message deduplication, rate limiting, and queue capacity.
4. **Session Forensics Audit Trail:** The primary build thread is anchored to our verified Codex Session ID:
   ```text
   e4905582-5d8f-4280-a0fe-74ec0c366da6
   ```

## Pre-Submission Compliance Audit

| Requirement | Official Rule | ChaosForge Status | Evidence |
|---|---|:---:|---|
| **Code Repository** | Public/Private on GitHub with full source and setup guide | **PASS** | [`vikassharma270907-alt/ChaosForge-deployment-and-compliance-check.`](https://github.com/vikassharma270907-alt/ChaosForge-deployment-and-compliance-check.) |
| **Secret Hygiene** | No hardcoded tokens/passwords | **PASS** | `.env` ignored; `.env.example` clean |
| **Demo Video Duration** | Strictly less than 3:00 minutes (< 180s) | **PASS** | `ChaosForge_Devpost_Under3min.mp4` is **2:50** (170.35s) |
| **Video Content** | Real Twitch/OBS operation + Codex build proof | **PASS** | Covers live overlay, streamer deck approval, and Codex CLI session |
| **Judge Access** | Hosted & testable free of charge through Nov 15, 2026 | **PASS** | Live on Render: [`https://chaosforge-3ky4.onrender.com`](https://chaosforge-3ky4.onrender.com) |
| **Automated Tests** | Verified test suite execution | **PASS** | 31/31 unit tests pass (`npm test`) |
| **Codex Provenance** | Authoritative Session ID | **PASS** | `e4905582-5d8f-4280-a0fe-74ec0c366da6` |

## What's Next

- Cross-channel co-op raid battles connecting two streamer communities in a synchronized arena.
- Persistent event logging and post-stream community contributor leaderboards.
- Expanded visual shader presets for RPG, tabletop, and music broadcasters.
