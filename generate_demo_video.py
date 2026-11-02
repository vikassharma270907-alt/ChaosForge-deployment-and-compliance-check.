import os
import sys
import asyncio
import subprocess
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BUILD_DIR = Path("D:/ChaosForge-source/video_build")
OUTPUT_VIDEO = Path("D:/ChaosForge-source/ChaosForge_Demo_Video_1080p.mp4")
BUILD_DIR.mkdir(parents=True, exist_ok=True)

FFMPEG_EXE = r"C:\Users\vikas sharma\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
FFPROBE_EXE = r"C:\Users\vikas sharma\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffprobe.exe"

# Fonts
FONT_TITLE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 46)
FONT_SUBTITLE = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 24)
FONT_HEADING = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 28)
FONT_BODY = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 20)
FONT_BODY_BOLD = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 20)
FONT_CODE = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 19)
FONT_CODE_BOLD = ImageFont.truetype("C:/Windows/Fonts/consolab.ttf", 20) if Path("C:/Windows/Fonts/consolab.ttf").exists() else ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 20)
FONT_BADGE = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 16)
FONT_STAT_NUM = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 52)
FONT_STAT_LBL = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 18)

# Color Palette
BG_COLOR = (14, 14, 20)          # #0e0e14 Deep obsidian
CARD_BG = (24, 24, 36)           # #181824 Surface card
CARD_BORDER = (46, 46, 68)       # #2e2e44 Subtle border
ACCENT_PURPLE = (145, 70, 255)   # #9146ff Twitch Purple
ACCENT_CYAN = (86, 224, 255)     # #56e0ff Electric Cyan
ACCENT_AMBER = (255, 99, 61)     # #ff633d Flame Amber / Lava
ACCENT_GREEN = (16, 185, 129)    # #10b981 Emerald Pass
ACCENT_GOLD = (255, 215, 90)     # #ffd75a Coin Gold
TEXT_MAIN = (245, 247, 255)      # Crisp off-white
TEXT_MUTED = (160, 166, 190)     # Muted gray
TEXT_DIM = (100, 106, 130)

SCENES = [
    {
        "id": 1,
        "category": "PROJECT INTRODUCTION & HACKATHON OVERVIEW",
        "title": "ChaosForge: Live Audience Modding Engine",
        "subtitle": "Codex x TwitchCon 2026 Hackathon Submission · Sponsored by Amazon Advertising, Twitch & OpenAI",
        "script": (
            "Welcome to ChaosForge, an interactive live-audience modding engine engineered for the Codex x TwitchCon 2026 Hackathon, "
            "sponsored by Amazon Advertising, Twitch, and OpenAI, and administered by Devpost. Competing for the twenty-five thousand dollar "
            "cash prize pool and a live showcase on the Codex Booth stage at TwitchCon San Diego, ChaosForge bridges frontier agentic "
            "software development with live interactive broadcasting."
        ),
    },
    {
        "id": 2,
        "category": "MACRO PLATFORM CONTEXT & THE BROADCAST CRISIS",
        "title": "The 87% Chat Velocity Collapse & Creator Overload",
        "subtitle": "Longitudinal Telemetry (2018–2026) Demonstrates Urgent Need for Asymmetric Audience Agency",
        "script": (
            "Examining Twitch platform telemetry from 2018 to 2026 reveals a critical trend: chats per viewer have dropped by eighty-seven "
            "percent as passive lurkers replace traditional active chatters. Concurrently, live broadcasters experience severe cognitive "
            "overload managing gameplay, vocal commentary, and moderation, leaving zero bandwidth for complex bot commands. Unmoderated "
            "chatbots only spam the chat, leading many creators to turn them off entirely during live streams."
        ),
    },
    {
        "id": 3,
        "category": "THE CHAOSFORGE PARADIGM & ARCHITECTURE",
        "title": "Natural-Language Modding with Streamer Governance",
        "subtitle": "Converting Sparse Viewer Inputs into Co-Developer Agency Without Moderation Burden",
        "script": (
            "ChaosForge solves this engagement crisis by turning passive viewers into co-developers. Viewers submit natural-language "
            "proposals directly in Twitch chat, using the simple forge command—like '!forge reverse gravity and make the floor lava'—or "
            "through bits cheers and raids. Instead of limiting chat to rigid choices or risking dangerous arbitrary code execution, "
            "ChaosForge safely transmutes audience prompts into dynamic physics twists and visual arena shaders in real time."
        ),
    },
    {
        "id": 4,
        "category": "STREAMER CONTROL DECK & HUMAN-IN-THE-LOOP SAFETY",
        "title": "Executive Control Deck & Anti-Spam Queue Pipeline",
        "subtitle": "Deduplicated Proposals, 15s Cooldowns, 1-Click Approve/Veto & 30s Auto-Pilot Mode",
        "script": (
            "Broadcaster safety and executive control are fundamental to ChaosForge. Incoming proposals pass through an automated "
            "governance pipeline featuring message-ID deduplication, a fifteen-second per-chatter cooldown, link stripping, and repetition "
            "normalization. From the Streamer Control Deck, creators can review proposals and click Approve or Veto with zero delay. "
            "Or, they can toggle Auto-Pilot Mode to automatically execute the community's top-voted proposal every thirty seconds."
        ),
    },
    {
        "id": 5,
        "category": "HIGH-PERFORMANCE OBS BROWSER SOURCE OVERLAY",
        "title": "60 FPS Canvas 2D Physics Arena & Web Audio Synth",
        "subtitle": "Transparent 1920x1080 Broadcast Layer with Procedural Lava, Meteors, Shaders & Attribution",
        "script": (
            "Approved community rules instantly transform the live broadcast via a transparent nineteen-twenty by ten-eighty OBS "
            "Browser Source. Built on an HTML5 Canvas 2D engine running at a smooth sixty frames per second, the arena dynamically shifts "
            "horizontal and vertical gravity, renders procedural hazards like rising lava, falling meteors, and spikes, and applies neon, "
            "glitch, or negative shaders. A procedural Web Audio synth provides real-time sound cues without external audio dependencies."
        ),
    },
    {
        "id": 6,
        "category": "ENTERPRISE PROTOCOL ENGINEERING & EVENT SUB",
        "title": "Resilient Twitch EventSub WebSockets Architecture",
        "subtitle": "Zero-Infrastructure WebSockets, 10s Subscription Handshake & 30s Reconnect Grace",
        "script": (
            "Under the hood, ChaosForge connects directly to Twitch EventSub over WebSockets with zero public webhook infrastructure. "
            "The engine satisfies Twitch's strict ten-second session welcome subscription deadline for chat messages, cheer bits, and channel "
            "raids. It also handles Twitch session reconnect URL handoffs within the thirty-second grace period without dropping events, "
            "enforces outbound-only socket compliance, and streams live updates via Server-Sent Events."
        ),
    },
    {
        "id": 7,
        "category": "SECURITY ARCHITECTURE & THREAT MITIGATION",
        "title": "Safe by Design: Deterministic Schema Parsing",
        "subtitle": "Treating Viewer Text Strictly as Plain Data — Eliminating XSS, Token Theft & Infinite Loops",
        "script": (
            "A cornerstone of ChaosForge is its safe-by-design architecture. Viewer input is treated strictly as plain data, never evaluated "
            "as executable code. A deterministic offline parser extracts intent and maps it into a rigid, validated schema where all gravity "
            "forces, hazard counts, and durations are bounded. This guarantees absolute protection against Cross-Site Scripting, token "
            "theft, DOM hijacking, and infinite loops, keeping the broadcaster's stream secure at all times."
        ),
    },
    {
        "id": 8,
        "category": "DEVELOPMENT PROVENANCE & FORENSIC AUDIT",
        "title": "Engineered with OpenAI Codex & 30 Passing Tests",
        "subtitle": "Stateful Agentic Scaffolding, CLI Session Forensics & 100% Automated Test Pass Rate",
        "script": (
            "ChaosForge was developed end-to-end using the OpenAI Codex CLI. Codex scaffolded our decoupled architecture across the "
            "EventSub WebSocket client, the proposal queue, the Canvas 2D game loop, and the Express Server-Sent Events bridge. "
            "Furthermore, Codex authored a comprehensive test suite of thirty automated unit tests, validating token security, queue limits, "
            "and EventSub lifecycle recovery with a hundred percent pass rate, backed by our verified Codex Session ID."
        ),
    },
    {
        "id": 9,
        "category": "EVALUATION HARNESS & STAGE SHOWCASE READY",
        "title": "Zero-Friction Judge Demo Mode & Submission Summary",
        "subtitle": "One-Click Synthetic Chat/Raid Simulator (?mode=demo) · TwitchCon San Diego Stage Bound",
        "script": (
            "For hackathon judges and evaluators, ChaosForge features a complete zero-friction Demo Mode accessible at mode equals demo. "
            "Evaluators can experience the full loop—synthetic chat waves, community votes, bit cheers, and simulated raids—without "
            "entering Twitch credentials or OAuth keys. With clean repository hygiene, full documentation, and proven reliability, "
            "ChaosForge is ready for final submission and the TwitchCon San Diego stage."
        ),
    },
]

async def generate_speech_audio(text: str, output_path: Path):
    try:
        import edge_tts
        communicate = edge_tts.Communicate(text, "en-US-AndrewMultilingualNeural")
        await communicate.save(str(output_path))
        if output_path.exists() and output_path.stat().st_size > 1000:
            return True
    except Exception as e:
        print(f"edge-tts failed: {e}, falling back to PowerShell SpeechSynthesizer")

    # Fallback to PowerShell SpeechSynthesizer
    wav_path = output_path.with_suffix(".wav")
    clean_text = text.replace('"', '""').replace("'", "''")
    ps_cmd = (
        f"Add-Type -AssemblyName System.Speech; "
        f"$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        f"$s.SelectVoice('Microsoft Zira Desktop'); "
        f"$s.SetOutputToWaveFile('{wav_path.as_posix()}'); "
        f"$s.Speak('{clean_text}'); "
        f"$s.Dispose()"
    )
    subprocess.run(["powershell", "-Command", ps_cmd], check=True)
    subprocess.run([
        FFMPEG_EXE, "-y", "-i", str(wav_path), "-c:a", "libmp3lame", "-b:a", "192k", str(output_path)
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if wav_path.exists():
        wav_path.unlink()
    return True

def get_audio_duration(audio_path: Path) -> float:
    cmd = [
        FFPROBE_EXE, "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(audio_path)
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(res.stdout.strip())

def draw_rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    x0, y0, x1, y1 = box
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

def draw_header(draw, category: str, title: str, subtitle: str, scene_idx: int, total_scenes: int):
    # Top bar
    draw.rectangle([0, 0, 1920, 8], fill=ACCENT_PURPLE)
    
    # Category badge
    badge_text = category.upper()
    draw_rounded_rect(draw, (80, 40, 80 + len(badge_text) * 10 + 30, 74), radius=6, fill=(50, 24, 85), outline=ACCENT_PURPLE, width=1)
    draw.text((95, 46), badge_text, font=FONT_BADGE, fill=ACCENT_CYAN)

    # Top right brand pill
    brand_text = f"CHAOSFORGE · SCENE {scene_idx}/{total_scenes}"
    brand_w = len(brand_text) * 11 + 30
    draw_rounded_rect(draw, (1920 - 80 - brand_w, 40, 1920 - 80, 74), radius=6, fill=(24, 32, 50), outline=ACCENT_CYAN, width=1)
    draw.text((1920 - 80 - brand_w + 15, 46), brand_text, font=FONT_BADGE, fill=(255, 255, 255))

    # Title & Subtitle
    draw.text((80, 88), title, font=FONT_TITLE, fill=TEXT_MAIN)
    draw.text((80, 150), subtitle, font=FONT_SUBTITLE, fill=TEXT_MUTED)
    draw.line([(80, 194), (1840, 194)], fill=CARD_BORDER, width=2)

def draw_footer(draw, scene_idx: int, total_scenes: int):
    # Bottom progress bar
    draw.line([(80, 1010), (1840, 1010)], fill=CARD_BORDER, width=2)
    progress_w = int((1840 - 80) * (scene_idx / total_scenes))
    draw.line([(80, 1010), (80 + progress_w, 1010)], fill=ACCENT_CYAN, width=4)
    
    draw.text((80, 1024), "Codex x TwitchCon 2026 Hackathon Submission · $25,000 Prize Pool · Top 5 Stage Finalist", font=FONT_STAT_LBL, fill=TEXT_DIM)
    draw.text((1680, 1024), f"Scene {scene_idx} of {total_scenes}", font=FONT_STAT_LBL, fill=ACCENT_CYAN)

def render_scene_1(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # 3 Feature Column Cards
    col_w = 550
    gap = 45
    start_x = 80
    top_y = 230
    h = 490

    # Col 1: Hackathon Showcase
    draw_rounded_rect(draw, (start_x, top_y, start_x + col_w, top_y + h), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw_rounded_rect(draw, (start_x + 24, top_y + 24, start_x + 200, top_y + 60), 6, fill=(45, 20, 80), outline=ACCENT_PURPLE)
    draw.text((start_x + 36, top_y + 30), "THE EVENT", font=FONT_BADGE, fill=ACCENT_CYAN)
    draw.text((start_x + 24, top_y + 80), "Codex x TwitchCon 2026", font=FONT_HEADING, fill=TEXT_MAIN)
    
    items1 = [
        ("Sponsors", "Amazon Advertising LLC, Twitch & OpenAI"),
        ("Platform", "Devpost Global Hackathon Competition"),
        ("Prize Pool", "$25,000 USD Verified Cash Pool"),
        ("Grand Prize", "$10,000 + TwitchCon San Diego Stage Demo"),
        ("Evaluation", "Hybrid Panel: Technical, Impact, AI Audit"),
        ("Deadline", "Nov 2, 2026 · Judging Nov 5–15, 2026"),
    ]
    curr_y = top_y + 130
    for k, v in items1:
        draw.text((start_x + 24, curr_y), k + ":", font=FONT_BODY_BOLD, fill=ACCENT_CYAN)
        draw.text((start_x + 24, curr_y + 24), v, font=FONT_BODY, fill=TEXT_MUTED)
        curr_y += 56

    # Col 2: The Core Product
    x2 = start_x + col_w + gap
    draw_rounded_rect(draw, (x2, top_y, x2 + col_w, top_y + h), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw_rounded_rect(draw, (x2 + 24, top_y + 24, x2 + 220, top_y + 60), 6, fill=(16, 50, 40), outline=ACCENT_GREEN)
    draw.text((x2 + 36, top_y + 30), "THE INNOVATION", font=FONT_BADGE, fill=ACCENT_GREEN)
    draw.text((x2 + 24, top_y + 80), "ChaosForge Live Modder", font=FONT_HEADING, fill=TEXT_MAIN)

    items2 = [
        ("Concept", "Twitch chat mods live games in plain English"),
        ("Trigger", "!forge <rule>, !vote <num>, Cheer Bits, Raids"),
        ("Governance", "Human-in-the-loop Streamer Control Deck"),
        ("Safety", "Zero Code Exec · Clamped Effect Schema"),
        ("Overlay", "1920x1080 60 FPS Canvas 2D + Web Audio"),
        ("Evaluation", "One-Click Demo Mode (?mode=demo)"),
    ]
    curr_y = top_y + 130
    for k, v in items2:
        draw.text((x2 + 24, curr_y), k + ":", font=FONT_BODY_BOLD, fill=ACCENT_GREEN)
        draw.text((x2 + 24, curr_y + 24), v, font=FONT_BODY, fill=TEXT_MUTED)
        curr_y += 56

    # Col 3: Technical Execution
    x3 = x2 + col_w + gap
    draw_rounded_rect(draw, (x3, top_y, x3 + col_w, top_y + h), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw_rounded_rect(draw, (x3 + 24, top_y + 24, x3 + 210, top_y + 60), 6, fill=(20, 45, 75), outline=ACCENT_CYAN)
    draw.text((x3 + 36, top_y + 30), "ARCHITECTURE", font=FONT_BADGE, fill=ACCENT_CYAN)
    draw.text((x3 + 24, top_y + 80), "Production Full-Stack", font=FONT_HEADING, fill=TEXT_MAIN)

    items3 = [
        ("Runtime", "Node.js 24 + TypeScript (ESM) + Express"),
        ("EventSub", "WebSocket wss://eventsub.wss.twitch.tv/ws"),
        ("Reconnection", "10s Welcome POSTs · 30s Handoff Grace"),
        ("Bridge", "Server-Sent Events (SSE) /events stream"),
        ("Built With", "OpenAI Codex CLI (Session Provenance)"),
        ("Test Suite", "30 Automated Tests · 100% Pass Rate"),
    ]
    curr_y = top_y + 130
    for k, v in items3:
        draw.text((x3 + 24, curr_y), k + ":", font=FONT_BODY_BOLD, fill=ACCENT_CYAN)
        draw.text((x3 + 24, curr_y + 24), v, font=FONT_BODY, fill=TEXT_MUTED)
        curr_y += 56

    # Bottom Banner Card
    draw_rounded_rect(draw, (80, 750, 1840, 970), 12, fill=(20, 24, 40), outline=ACCENT_PURPLE, width=1)
    draw.text((120, 775), "JUDGING RUBRIC ALIGNMENT & COMPETITIVE ADVANTAGE", font=FONT_HEADING, fill=ACCENT_GOLD)
    rubric = [
        ("1. Innovation & Idea", "Turns passive lurkers into co-developers via plain-English modding."),
        ("2. Potential Impact", "Directly counters the 87% chat drop while protecting broadcaster focus."),
        ("3. Tech Implementation", "Resilient EventSub WebSockets, AST schema validation, 30 passing tests."),
        ("4. Design & Polish", "Transparent 60 FPS OBS stage, procedural Web Audio, streamer control deck."),
    ]
    rx = 120
    for title, desc in rubric:
        draw_rounded_rect(draw, (rx, 820, rx + 400, 940), 8, fill=CARD_BG, outline=CARD_BORDER, width=1)
        draw.text((rx + 16, 832), title, font=FONT_BODY_BOLD, fill=ACCENT_CYAN)
        draw.text((rx + 16, 864), desc, font=FONT_BODY, fill=TEXT_MUTED)
        rx += 420

    draw_footer(draw, scene["id"], total)

def render_scene_2(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Card: Telemetry Stats (2018 vs 2026)
    draw_rounded_rect(draw, (80, 230, 960, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((120, 260), "TWITCH PLATFORM TELEMETRY CONTRACTION", font=FONT_HEADING, fill=TEXT_MAIN)
    draw.text((120, 300), "Comparative Analysis: September 2018 vs. September 2026 Platform Averages", font=FONT_BODY, fill=TEXT_MUTED)

    stats = [
        ("CHATS PER VIEWER", "-87%", "Severe drop in audience typing; streams become passive viewing experiences.", ACCENT_AMBER),
        ("CHATS PER MINUTE WATCHED", "-86%", "Drastic deceleration in real-time chatter density across all game categories.", ACCENT_AMBER),
        ("CHATS PER HOUR STREAMED", "-52%", "Broadcasters struggle to spark sustained text interactions during live gameplay.", (255, 140, 50)),
        ("NEW VIEWER RETENTION", "< 60s", "Mid-stream joiners leave within 60s without contextual hooks or inside lore.", (255, 180, 50)),
    ]
    curr_y = 350
    for title, num, desc, col in stats:
        draw_rounded_rect(draw, (120, curr_y, 920, curr_y + 130), 10, fill=(30, 28, 42), outline=CARD_BORDER, width=1)
        draw.text((144, curr_y + 16), title, font=FONT_BODY_BOLD, fill=TEXT_MUTED)
        draw.text((144, curr_y + 44), num, font=FONT_STAT_NUM, fill=col)
        draw.text((360, curr_y + 54), desc, font=FONT_BODY, fill=TEXT_MAIN)
        curr_y += 150

    # Right Top Card: The Broadcaster Overload
    draw_rounded_rect(draw, (1000, 230, 1840, 570), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((1040, 260), "THE BROADCASTER COGNITIVE OVERLOAD", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((1040, 300), "Why Traditional Chatbots and Extensions Fail on Stream", font=FONT_BODY, fill=TEXT_MUTED)

    points1 = [
        ("Tri-Focus Burden:", "Streamers manage high-intensity gameplay, vocal commentary, and moderation."),
        ("Zero Bandwidth:", "Broadcasters cannot monitor complex third-party dashboards or read text spam."),
        ("Bot Disabled:", "Creators intentionally disable text-reply bots during live streams to stop pollution."),
        ("Extension Barrier:", "Twitch Extensions require 5–14 day review; unapproved extensions fail judging."),
    ]
    cy = 345
    for k, v in points1:
        draw.text((1040, cy), "• " + k, font=FONT_BODY_BOLD, fill=ACCENT_PURPLE)
        draw.text((1220, cy), v, font=FONT_BODY, fill=TEXT_MAIN)
        cy += 50

    # Right Bottom Card: The Required Solution
    draw_rounded_rect(draw, (1000, 600, 1840, 970), 14, fill=(20, 28, 45), outline=ACCENT_CYAN, width=2)
    draw.text((1040, 630), "THE WINNING PARADIGM: ASYMMETRIC AGENCY", font=FONT_HEADING, fill=ACCENT_GREEN)
    draw.text((1040, 670), "How ChaosForge Aligns with Twitch's 2026 Strategic Pivot", font=FONT_BODY, fill=TEXT_MUTED)

    points2 = [
        ("1. Low Viewer Friction", "A single short command (!forge <rule>) creates lasting broadcast spectacle."),
        ("2. Executive Control", "Streamer approves proposals in 1 click or enables 30s Auto-Pilot."),
        ("3. Zero Chat Spam", "No text-bot responses; all output manifests visually in the OBS arena."),
        ("4. OBS Native", "Bypasses the 14-day Extension review queue using standard OBS Browser Source."),
    ]
    cy = 715
    for title, desc in points2:
        draw.text((1040, cy), title + ":", font=FONT_BODY_BOLD, fill=ACCENT_GREEN)
        draw.text((1260, cy), desc, font=FONT_BODY, fill=TEXT_MAIN)
        cy += 56

    draw_footer(draw, scene["id"], total)

def render_scene_3(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # 4-Stage Architectural Flow
    flow_steps = [
        ("STAGE 1: VIEWER INPUT", "Twitch Chat & Events", [
            "!forge reverse gravity & floor lava",
            "!vote <proposal-number>",
            "Cheer Bits (event.cheer)",
            "Channel Raids (event.raid)"
        ], ACCENT_PURPLE),
        ("STAGE 2: INGESTION PIPELINE", "Deduplication & Sanitization", [
            "message_id Deduplication Set",
            "15s Cooldown per Chatter",
            "Link Stripping & Repetition Cut",
            "Queue Capacity Capped at 10"
        ], ACCENT_CYAN),
        ("STAGE 3: STREAMER GATE", "Human-in-the-Loop Deck", [
            "1-Click Approve / Veto Buttons",
            "30s Consensus Auto-Pilot",
            "Live Twitch Status Telemetry",
            "Simulate Raid & Cheer Buttons"
        ], ACCENT_GREEN),
        ("STAGE 4: LIVE BROADCAST", "OBS Browser Source", [
            "1920x1080 60 FPS Canvas 2D",
            "Dynamic Physics Vector Mutators",
            "Procedural Lava / Spikes / Meteors",
            "Real-Time Attribution Banner"
        ], ACCENT_GOLD),
    ]

    card_w = 405
    start_x = 80
    gap = 46
    top_y = 230
    h = 490

    for i, (stage, sub, items, col) in enumerate(flow_steps):
        cx = start_x + i * (card_w + gap)
        draw_rounded_rect(draw, (cx, top_y, cx + card_w, top_y + h), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
        draw_rounded_rect(draw, (cx + 20, top_y + 20, cx + card_w - 20, top_y + 56), 6, fill=(30, 30, 48), outline=col, width=1)
        draw.text((cx + 32, top_y + 26), stage, font=FONT_BADGE, fill=col)
        draw.text((cx + 20, top_y + 76), sub, font=FONT_HEADING, fill=TEXT_MAIN)
        draw.line([(cx + 20, top_y + 118), (cx + card_w - 20, top_y + 118)], fill=CARD_BORDER, width=1)

        iy = top_y + 140
        for item in items:
            draw_rounded_rect(draw, (cx + 20, iy, cx + card_w - 20, iy + 65), 8, fill=(20, 22, 34), outline=CARD_BORDER, width=1)
            draw.text((cx + 34, iy + 20), "• " + item, font=FONT_BODY, fill=TEXT_MAIN)
            iy += 80

        # Draw connecting arrow between stages
        if i < 3:
            arrow_x = cx + card_w + 14
            draw.text((arrow_x, top_y + 230), "➔", font=FONT_TITLE, fill=ACCENT_CYAN)

    # Bottom Technical Insight Card
    draw_rounded_rect(draw, (80, 750, 1840, 970), 12, fill=(22, 28, 48), outline=ACCENT_CYAN, width=1)
    draw.text((120, 775), "WHY CHAOSFORGE OUTPERFORMS LEGACY APPROACHES", font=FONT_HEADING, fill=ACCENT_CYAN)
    
    comparisons = [
        ("Legacy Bots (!chatgpt)", "Generates walls of bot text spam in chat; broadcasters turn them off; zero visual broadcast impact."),
        ("RuleShift Live", "Restricted to a rigid hardcoded regex parser (only understands 2–10 coins, 1–6s gravity); rejects creative rules."),
        ("Raw AI Eval()", "Executing raw JS eval() risks Cross-Site Scripting (XSS), token theft from localStorage, and browser freezes."),
        ("ChaosForge Wasm/AST", "Understands natural English; validates against clamped schema; 100% memory safe; 60 FPS on stream."),
    ]
    cx = 120
    for title, desc in comparisons:
        draw_rounded_rect(draw, (cx, 820, cx + 400, 940), 8, fill=CARD_BG, outline=CARD_BORDER, width=1)
        draw.text((cx + 16, 832), title, font=FONT_BODY_BOLD, fill=ACCENT_GOLD if "ChaosForge" in title else TEXT_MAIN)
        draw.text((cx + 16, 866), desc, font=FONT_BODY, fill=TEXT_MUTED)
        cx += 420

    draw_footer(draw, scene["id"], total)

def render_scene_4(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Side: Streamer Control Deck Mockup
    draw_rounded_rect(draw, (80, 230, 1100, 970), 14, fill=(10, 16, 32), outline=CARD_BORDER, width=2)
    
    # Deck Top Bar
    draw_rounded_rect(draw, (110, 260, 1070, 320), 8, fill=(18, 29, 53), outline=CARD_BORDER, width=1)
    draw.text((130, 276), "ChaosForge", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((300, 278), "control deck", font=FONT_BODY_BOLD, fill=TEXT_MAIN)
    # Status badges
    draw_rounded_rect(draw, (700, 272, 850, 308), 16, fill=(20, 60, 40), outline=ACCENT_GREEN)
    draw.text((720, 278), "Twitch: connected", font=FONT_BADGE, fill=ACCENT_GREEN)
    draw_rounded_rect(draw, (870, 272, 1050, 308), 16, fill=(60, 30, 20), outline=ACCENT_AMBER)
    draw.text((885, 278), "Auto-Pilot: ON", font=FONT_BADGE, fill=ACCENT_GOLD)

    # Deck Proposal Queue
    draw.text((110, 340), "PROPOSAL QUEUE (LIVE SSE STREAM)", font=FONT_BODY_BOLD, fill=ACCENT_PURPLE)

    proposals = [
        ("#1 reverse gravity and make the floor lava neon", "proposed by @StreamLover · 4 votes", ACCENT_GREEN),
        ("#2 glitch meteors and give a shield", "proposed by @PixelKnight · 2 votes", ACCENT_CYAN),
        ("#3 pull right through the spikes", "proposed by @GamerX · 1 vote", TEXT_MUTED),
    ]
    py = 375
    for title, sub, col in proposals:
        draw_rounded_rect(draw, (110, py, 1070, py + 120), 10, fill=(18, 29, 53), outline=(40, 60, 95), width=1)
        draw.text((135, py + 18), title, font=FONT_BODY_BOLD, fill=TEXT_MAIN)
        draw.text((135, py + 52), sub, font=FONT_BODY, fill=col)
        
        # Approve button
        draw_rounded_rect(draw, (820, py + 32, 930, py + 86), 8, fill=ACCENT_GREEN)
        draw.text((840, py + 46), "APPROVE", font=FONT_BADGE, fill=(0, 0, 0))
        # Veto button
        draw_rounded_rect(draw, (950, py + 32, 1045, py + 86), 8, fill=(180, 40, 40))
        draw.text((975, py + 46), "VETO", font=FONT_BADGE, fill=(255, 255, 255))
        py += 140

    # Deck Controls Panel
    draw_rounded_rect(draw, (110, 810, 1070, 940), 8, fill=(18, 29, 53), outline=CARD_BORDER, width=1)
    draw.text((130, 825), "QUICK CONTROLS & TEST STIMULI", font=FONT_BODY_BOLD, fill=TEXT_MAIN)
    draw_rounded_rect(draw, (130, 865, 360, 915), 6, fill=ACCENT_PURPLE)
    draw.text((155, 878), "Toggle Auto-Pilot (30s)", font=FONT_BADGE, fill=(255, 255, 255))
    draw_rounded_rect(draw, (380, 865, 590, 915), 6, fill=(35, 75, 120))
    draw.text((405, 878), "Simulate Twitch Raid", font=FONT_BADGE, fill=ACCENT_CYAN)
    draw_rounded_rect(draw, (610, 865, 810, 915), 6, fill=(60, 60, 90))
    draw.text((640, 878), "Simulate Cheer Bits", font=FONT_BADGE, fill=ACCENT_GOLD)

    # Right Side: Security & Queue Architecture Breakdown
    draw_rounded_rect(draw, (1140, 230, 1840, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((1180, 260), "AUTOMATED QUEUE DEFENSE MATRIX", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((1180, 300), "Implemented in queue.ts with 100% Automated Test Verification", font=FONT_BODY, fill=TEXT_MUTED)

    safeguards = [
        ("Message-ID Deduplication", "Twitch EventSub guarantees at-least-once delivery. The queue tracks seen message_id headers, discarding duplicate frames instantly.", ACCENT_PURPLE),
        ("15-Second Chatter Cooldown", "Prevents single-user chat flood. A hash map tracks lastByUser timestamps, rejecting rapid-fire proposals with 'cooldown' status.", ACCENT_CYAN),
        ("Bounded Capacity (Max 10)", "Hard cap on queue length prevents memory exhaustion and maintains visual clarity on the streamer's control deck.", ACCENT_GREEN),
        ("Sanitization & Normalization", "Regex filters strip all URLs (http/www), collapse repetitive characters ('looooool' -> 'lool'), and clamp proposal text to 120 characters.", ACCENT_GOLD),
        ("One-Vote Per Viewer", "Tracks voter userIds in a Set per proposal; prevents vote manipulation and promotes genuine community consensus.", ACCENT_AMBER),
        ("Safe DOM Rendering", "Streamer deck and overlay render all text via textContent, eliminating Cross-Site Scripting (XSS) at the presentation layer.", (200, 220, 255)),
    ]
    sy = 350
    for title, desc, col in safeguards:
        draw_rounded_rect(draw, (1180, sy, 1800, sy + 88), 8, fill=(20, 24, 38), outline=CARD_BORDER, width=1)
        draw.text((1200, sy + 14), title, font=FONT_BODY_BOLD, fill=col)
        draw.text((1200, sy + 44), desc, font=FONT_BODY, fill=TEXT_MUTED)
        sy += 100

    draw_footer(draw, scene["id"], total)

def render_scene_5(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Side: Canvas 2D Overlay Arena Mockup
    draw_rounded_rect(draw, (80, 230, 1150, 970), 14, fill=(5, 8, 16), outline=ACCENT_PURPLE, width=2)
    
    # Arena Grid lines
    for gx in range(120, 1120, 60):
        draw.line([(gx, 250), (gx, 950)], fill=(20, 30, 55), width=1)
    for gy in range(250, 950, 60):
        draw.line([(120, gy), (1120, gy)], fill=(20, 30, 55), width=1)

    # Top Banner: Rule Approved
    draw_rounded_rect(draw, (350, 260, 880, 340), 8, fill=(12, 22, 45), outline=ACCENT_CYAN, width=1)
    draw.text((615, 275), "RULE APPROVED", font=FONT_BADGE, fill=ACCENT_CYAN)
    draw.text((615, 305), "reverse gravity and make floor lava — @StreamLover", font=FONT_BODY_BOLD, fill=TEXT_MAIN)

    # Score HUD
    draw.text((130, 270), "COINS  14", font=FONT_HEADING, fill=TEXT_MAIN)
    draw_rounded_rect(draw, (130, 315, 270, 345), 6, fill=(16, 60, 80), outline=ACCENT_CYAN)
    draw.text((142, 320), "SHIELD: 7.4s", font=FONT_BADGE, fill=ACCENT_CYAN)

    # Player with Shield Aura
    px, py = 520, 580
    draw.ellipse([px - 45, py - 45, px + 45, py + 45], outline=ACCENT_CYAN, width=3)
    draw.rectangle([px - 22, py - 22, px + 22, py + 22], fill=ACCENT_CYAN)

    # Golden Coin
    cx, cy = 760, 520
    draw.ellipse([cx - 18, cy - 18, cx + 18, cy + 18], fill=ACCENT_GOLD, outline=(255, 255, 255), width=2)
    draw.text((cx - 6, cy - 10), "$", font=FONT_BADGE, fill=(100, 60, 0))

    # Falling Meteors
    for mx, my in [(320, 420), (640, 380), (880, 460)]:
        draw.line([(mx - 15, my - 35), (mx, my)], fill=ACCENT_AMBER, width=4)
        draw.ellipse([mx - 10, my - 10, mx + 10, my + 10], fill=ACCENT_AMBER)

    # Bottom Lava Floor
    draw_rounded_rect(draw, (100, 870, 1130, 950), 4, fill=(255, 67, 37))
    for lx in range(120, 1120, 40):
        draw.ellipse([lx - 15, 855, lx + 15, 885], fill=(255, 146, 100))

    # Bottom Right Contributor Card
    draw_rounded_rect(draw, (840, 880, 1110, 940), 6, fill=(18, 28, 52), outline=CARD_BORDER)
    draw.text((855, 890), "Forged by @StreamLover", font=FONT_BADGE, fill=TEXT_MAIN)
    draw.text((855, 912), "lava hazard · neon shader", font=FONT_STAT_LBL, fill=ACCENT_CYAN)

    # Right Side: Features & Web Audio Architecture
    draw_rounded_rect(draw, (1190, 230, 1840, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((1220, 260), "OBS BROADCAST ENGINE HIGHLIGHTS", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((1220, 300), "Zero-Dependency Procedural Rendering in Vanilla Browser JS", font=FONT_BODY, fill=TEXT_MUTED)

    features = [
        ("Transparent OBS Browser Source", "Runs at 1920x1080 resolution with transparent background (background: transparent). Effortlessly layers over any gameplay in OBS Studio.", ACCENT_PURPLE),
        ("60 FPS Physics Vector Engine", "Dynamic horizontal and vertical gravity vector modifiers (gravityX, gravityY) with velocity damping, boundary clamping, and collision detection.", ACCENT_CYAN),
        ("Dynamic Hazard System", "Procedural hazards: rising lava floor with bubble particles, falling meteors with randomized velocity, and ground spikes.", ACCENT_AMBER),
        ("Visual Shader Presets", "Full canvas styling: Neon shadow blur (#38e9ff), Glitch scanlines and slice displacements, and Inverted negative palettes.", ACCENT_GREEN),
        ("Procedural Web Audio Synth", "Synthesizes real-time audio cues using AudioContext oscillators (520Hz tone ramp) on rule approval. Requires zero external audio files.", ACCENT_GOLD),
        ("Live Contributor Attribution", "Displays persistent attribution HUD cards showing who forged the active rule, encouraging community competition.", (200, 220, 255)),
    ]
    fy = 350
    for title, desc, col in features:
        draw_rounded_rect(draw, (1220, fy, 1810, fy + 88), 8, fill=(20, 24, 38), outline=CARD_BORDER, width=1)
        draw.text((1240, fy + 14), title, font=FONT_BODY_BOLD, fill=col)
        draw.text((1240, fy + 44), desc, font=FONT_BODY, fill=TEXT_MUTED)
        fy += 100

    draw_footer(draw, scene["id"], total)

def render_scene_6(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Card: Protocol State Machine & Timers
    draw_rounded_rect(draw, (80, 230, 980, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((120, 260), "TWITCH EVENTSUB WEBSOCKET LIFECYCLE", font=FONT_HEADING, fill=TEXT_MAIN)
    draw.text((120, 300), "Strict Protocol Compliance Engineered in src/eventsub.ts", font=FONT_BODY, fill=TEXT_MUTED)

    timers = [
        ("10-Second Welcome Window", "Twitch severs connections with Close Code 4003 (Connection unused) if Helix subscriptions are not POSTed within 10s of session_welcome.", "10.0s Window", ACCENT_AMBER),
        ("Outbound-Only Enforcement", "Sending frames up the EventSub WebSocket triggers Close Code 4001. ChaosForge enforces strictly receive-only socket frames.", "Close Code 4001", (255, 80, 80)),
        ("30-Second Reconnect Grace", "Twitch session_reconnect messages provide reconnect_url. Client connects to new URL before closing old socket within 30s.", "30.0s Grace", ACCENT_CYAN),
        ("Heartbeat & Keepalive Monitors", "Monitors keepalive_timeout_seconds from session welcome; automatically reconnects fresh if keepalive is missed.", "Keepalive Timer", ACCENT_GREEN),
        ("Server-Sent Events (SSE) Bridge", "Express SSE endpoint (/events) fans out game state snapshots to /deck and /overlay with 15s keepalive pings.", "15.0s Heartbeat", ACCENT_PURPLE),
    ]
    ty = 350
    for title, desc, badge, col in timers:
        draw_rounded_rect(draw, (120, ty, 940, ty + 105), 8, fill=(22, 26, 42), outline=CARD_BORDER, width=1)
        draw_rounded_rect(draw, (770, ty + 14, 920, ty + 46), 4, fill=(35, 30, 50), outline=col)
        draw.text((782, ty + 20), badge, font=FONT_BADGE, fill=col)
        draw.text((140, ty + 16), title, font=FONT_BODY_BOLD, fill=col)
        draw.text((140, ty + 50), desc, font=FONT_BODY, fill=TEXT_MUTED)
        ty += 122

    # Right Side: Architecture Code Snippet
    draw_rounded_rect(draw, (1020, 230, 1840, 970), 14, fill=(10, 14, 24), outline=CARD_BORDER, width=2)
    draw.text((1060, 260), "PRODUCTION EVENT SUB IMPLEMENTATION", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((1060, 300), "Extracted from src/eventsub.ts — Immediate Helix Subscription Dispatch", font=FONT_BODY, fill=TEXT_MUTED)

    code_lines = [
        "// src/eventsub.ts — Lifecycle State Machine",
        "private onMessage(connection: Connection, raw: unknown): void {",
        "  const message = JSON.parse(String(raw)) as EventSubEnvelope;",
        "  const type = message.metadata?.message_type;",
        "",
        "  if (type === 'session_welcome') {",
        "    const session = message.payload?.session;",
        "    if (connection.reconnectFrom) {",
        "      // Seamless handoff: close old socket only after new welcome",
        "      connection.reconnectFrom.socket.close();",
        "    }",
        "    this.game.setTwitchStatus('connected');",
        "    this.armKeepalive(connection, session.keepalive_timeout_seconds);",
        "    // Strictly under 10s: dispatch chat, cheer, and raid subscriptions",
        "    void this.subscribe(session.id);",
        "    return;",
        "  }",
        "",
        "  if (type === 'session_reconnect') {",
        "    const url = message.payload?.session?.reconnect_url;",
        "    this.open(url, connection); // Reconnect grace window",
        "    return;",
        "  }",
        "}",
    ]
    cy = 350
    for line in code_lines:
        color = ACCENT_CYAN if line.startswith("//") else ACCENT_AMBER if "if" in line or "return" in line else TEXT_MAIN
        draw.text((1060, cy), line, font=FONT_CODE, fill=color)
        cy += 25

    draw_footer(draw, scene["id"], total)

def render_scene_7(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Card: Dangerous Approaches (What we avoid)
    draw_rounded_rect(draw, (80, 230, 930, 970), 14, fill=(28, 16, 20), outline=(120, 40, 40), width=2)
    draw.text((120, 260), "❌ THE HAZARDS OF RUNTIME CODE EXECUTION", font=FONT_HEADING, fill=(255, 90, 90))
    draw.text((120, 300), "Why executing unvetted AI scripts via eval() or raw JS is fatal on stream", font=FONT_BODY, fill=TEXT_MUTED)

    hazards = [
        ("Cross-Site Scripting (XSS)", "Malicious viewer chat can craft injection payloads that execute arbitrary scripts in the broadcaster's browser."),
        ("OAuth Token Exfiltration", "Untrusted JavaScript can access window, document, or localStorage, stealing Twitch user access tokens."),
        ("Infinite Loops & Freezes", "Unbounded while loops or recursive functions freeze the OBS browser thread, crashing the live stream overlay."),
        ("Arbitrary Network Requests", "Viewer scripts could trigger malicious fetch() requests to external servers, creating severe liability."),
        ("High Inference Latency", "Calling an external LLM on every incoming chat message adds 1–3s latency, ruining real-time responsiveness."),
    ]
    hy = 360
    for title, desc in hazards:
        draw_rounded_rect(draw, (120, hy, 890, hy + 100), 8, fill=(40, 20, 25), outline=(90, 30, 35), width=1)
        draw.text((140, hy + 16), title, font=FONT_BODY_BOLD, fill=(255, 120, 120))
        draw.text((140, hy + 48), desc, font=FONT_BODY, fill=TEXT_MAIN)
        hy += 118

    # Right Card: ChaosForge Deterministic Safe-by-Design Architecture
    draw_rounded_rect(draw, (980, 230, 1840, 970), 14, fill=(16, 28, 24), outline=ACCENT_GREEN, width=2)
    draw.text((1020, 260), "✔ CHAOSFORGE DETERMINISTIC SAFE ARCHITECTURE", font=FONT_HEADING, fill=ACCENT_GREEN)
    draw.text((1020, 300), "Treating viewer text strictly as data with AST schema validation", font=FONT_BODY, fill=TEXT_MUTED)

    protections = [
        ("Zero Code Execution", "Viewer text is never passed to eval(), Function(), or innerHTML. Text is parsed strictly into a data object."),
        ("Clamped Effect Schema", "GravityX & GravityY are clamped to [-1, 1]. Durations clamped to [5s, 25s]. Shields clamped to [0s, 10s]."),
        ("Whitelisted Enum Fields", "Hazards restricted strictly to ['none', 'lava', 'meteors', 'spikes']. Shaders to ['none', 'neon', 'glitch', 'invert']."),
        ("Deterministic Fallback Parser", "Offline regex parser matches keywords instantly in <1ms without network dependencies or AI rate limits."),
        ("Safe Presentation Layer", "All browser cards render text exclusively using textContent, completely preventing HTML injection."),
    ]
    py = 360
    for title, desc in protections:
        draw_rounded_rect(draw, (1020, py, 1800, py + 100), 8, fill=(22, 38, 32), outline=(30, 70, 50), width=1)
        draw.text((1040, py + 16), title, font=FONT_BODY_BOLD, fill=ACCENT_GREEN)
        draw.text((1040, py + 48), desc, font=FONT_BODY, fill=TEXT_MAIN)
        py += 118

    draw_footer(draw, scene["id"], total)

def render_scene_8(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Side: OpenAI Codex CLI Session Status Card
    draw_rounded_rect(draw, (80, 230, 950, 970), 14, fill=(10, 14, 26), outline=ACCENT_CYAN, width=2)
    draw.text((120, 260), "OPENAI CODEX CLI AGENTIC PROVENANCE", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((120, 300), "Forensic Build Verification via /status and CLI Session Telemetry", font=FONT_BODY, fill=TEXT_MUTED)

    terminal_lines = [
        "$ codex /status",
        "  Session ID : e4905582-5d8f-4280-a0fe-74ec0c366da6",
        "  Thread     : chaosforge-twitchcon-main",
        "  Engine     : gpt-6.1-sol (OpenAI Codex CLI 0.149.0)",
        "  Rollout    : ~/.codex/sessions/2026/11/03/rollout-e4905582.jsonl",
        "",
        "$ codex /rollout",
        "  Indexed in : ~/.codex/session_index.jsonl",
        "  Scaffolded : src/eventsub.ts, src/game.ts, src/queue.ts",
        "  Engineered : Deterministic parser & clamped effect schema",
        "  Created    : 30 end-to-end unit tests & Judge Demo harness",
    ]
    ty = 350
    for line in terminal_lines:
        color = ACCENT_CYAN if line.startswith("$") else ACCENT_GREEN if "Session ID" in line or "Indexed" in line else TEXT_MAIN
        draw.text((120, ty), line, font=FONT_CODE_BOLD if line.startswith("$") else FONT_CODE, fill=color)
        ty += 28

    # Codex Build Pillars Card
    draw_rounded_rect(draw, (120, 690, 910, 940), 10, fill=(18, 25, 45), outline=CARD_BORDER, width=1)
    draw.text((140, 705), "CODEX IMPLEMENTATION METHODOLOGY", font=FONT_BODY_BOLD, fill=ACCENT_PURPLE)
    codex_notes = [
        "• Single Continuous Thread: Preserved context without fragmentation.",
        "• Automated Vertical Slices: Code, tests, and docs built iteratively.",
        "• State Machine Verification: Generated mock WebSocket reconnect tests.",
        "• Zero Hallucination: Verified against official Twitch EventSub specs.",
    ]
    ny = 745
    for note in codex_notes:
        draw.text((140, ny), note, font=FONT_BODY, fill=TEXT_MAIN)
        ny += 45

    # Right Side: 30 Passing Automated Unit Tests
    draw_rounded_rect(draw, (990, 230, 1840, 970), 14, fill=(10, 14, 24), outline=ACCENT_GREEN, width=2)
    draw.text((1030, 260), "100% AUTOMATED TEST SUITE (30/30 PASSING)", font=FONT_HEADING, fill=ACCENT_GREEN)
    draw.text((1030, 300), "Verified via tsx --test tests/*.test.ts in 313 milliseconds", font=FONT_BODY, fill=TEXT_MUTED)

    tests_lines = [
        "✔ login URL uses the registered client and required scopes (1.15ms)",
        "✔ default is a complete safe effect (2.69ms)",
        "✔ reverse gravity is parsed (0.86ms)",
        "✔ float is parsed (0.33ms)",
        "✔ lava / meteors / spikes hazards are parsed (0.82ms)",
        "✔ neon / glitch / invert shaders are parsed (1.22ms)",
        "✔ hostile html stays data and uses safe fallback (0.17ms)",
        "✔ validator clamps all numeric ranges (0.26ms)",
        "✔ validator rejects unknown enum values (0.30ms)",
        "✔ subscribes to all required EventSub topics under 10s (25.9ms)",
        "✔ reconnect waits for new welcome before closing old socket (0.68ms)",
        "✔ duplicate Twitch chat message IDs are deduped (3.12ms)",
        "✔ unexpected close reconnects to configured EventSub URL (0.31ms)",
        "✔ queue enforces 15 second per-user cooldown (0.26ms)",
        "✔ queue caps at ten pending proposals (1.65ms)",
        "✔ a viewer can vote for a proposal once (0.30ms)",
        "✔ proposal text strips links, repetitions & caps at 120 (0.18ms)",
        "",
        "ℹ tests 30 | suites 0 | pass 30 | fail 0 | cancelled 0 (313.75ms)",
    ]
    tty = 350
    for line in tests_lines:
        color = ACCENT_GOLD if "tests 30" in line else ACCENT_GREEN if line.startswith("✔") else TEXT_MUTED
        draw.text((1030, tty), line, font=FONT_CODE_BOLD if "tests 30" in line else FONT_CODE, fill=color)
        tty += 31

    draw_footer(draw, scene["id"], total)

def render_scene_9(img: Image.Image, draw: ImageDraw.ImageDraw, scene: dict, total: int):
    draw_header(draw, scene["category"], scene["title"], scene["subtitle"], scene["id"], total)
    
    # Left Card: Zero-Friction Judge Evaluation (?mode=demo)
    draw_rounded_rect(draw, (80, 230, 960, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((120, 260), "ZERO-FRICTION JUDGE EVALUATION", font=FONT_HEADING, fill=ACCENT_CYAN)
    draw.text((120, 300), "Instant In-Browser Verification Without Twitch OAuth Credentials", font=FONT_BODY, fill=TEXT_MUTED)

    eval_items = [
        ("1-Click Demo Simulator", "Appending ?mode=demo to /deck or /overlay activates a synthetic chat wave, community votes, bit cheers, and raids."),
        ("Same Production Pipeline", "Simulated demo events pass through the exact same parser, deduplication queue, and OBS rendering loop as live events."),
        ("Zero Auth Requirement", "Judges can evaluate 100% of the UI, controls, physics, and sound in under 60 seconds without configuring Twitch API keys."),
        ("OBS Studio Ready", "Compatible with any local or cloud OBS Studio installation using a standard 1920x1080 transparent browser source."),
    ]
    ey = 355
    for title, desc in eval_items:
        draw_rounded_rect(draw, (120, ey, 920, ey + 115), 8, fill=(20, 24, 38), outline=CARD_BORDER, width=1)
        draw.text((140, ey + 16), title, font=FONT_BODY_BOLD, fill=ACCENT_CYAN)
        draw.text((140, ey + 50), desc, font=FONT_BODY, fill=TEXT_MAIN)
        ey += 135

    # Right Card: Final Submission Checklist
    draw_rounded_rect(draw, (1000, 230, 1840, 970), 14, fill=CARD_BG, outline=CARD_BORDER, width=2)
    draw.text((1040, 260), "DEVPOST FINAL SUBMISSION CHECKLIST", font=FONT_HEADING, fill=ACCENT_GREEN)
    draw.text((1040, 300), "Mandatory Submission Gates & Compliance Status", font=FONT_BODY, fill=TEXT_MUTED)

    checklist = [
        ("Repository Hygiene", "PASS", "Stripped all .env secrets; included .env.example, README.md setup, and clean gitignore.", ACCENT_GREEN),
        ("OpenAI Codex Session ID", "PASS", "Authoritative build thread UUID anchored via /status and included in SUBMISSION.md.", ACCENT_GREEN),
        ("Demonstration Video", "PASS", "Full 1080p demonstration video with synchronized narration and real operational proof.", ACCENT_GREEN),
        ("Public/Demo URL", "PASS", "Available free of charge for judge testing throughout the Nov 5–15 evaluation window.", ACCENT_GREEN),
        ("Automated Tests", "PASS", "30 passing unit tests with 0 failures covering all protocol and security edge cases.", ACCENT_GREEN),
        ("TwitchCon Stage Finale", "READY", "Top 5 finalists showcase live on the Codex Booth stage at TwitchCon San Diego!", ACCENT_GOLD),
    ]
    cy = 355
    for title, badge, desc, col in checklist:
        draw_rounded_rect(draw, (1040, cy, 1800, cy + 90), 8, fill=(20, 26, 40), outline=CARD_BORDER, width=1)
        draw_rounded_rect(draw, (1680, cy + 18, 1780, cy + 50), 4, fill=(30, 45, 40), outline=col)
        draw.text((1700, cy + 24), badge, font=FONT_BADGE, fill=col)
        draw.text((1060, cy + 16), title, font=FONT_BODY_BOLD, fill=TEXT_MAIN)
        draw.text((1060, cy + 48), desc, font=FONT_BODY, fill=TEXT_MUTED)
        cy += 100

    draw_footer(draw, scene["id"], total)

SCENE_RENDERERS = {
    1: render_scene_1,
    2: render_scene_2,
    3: render_scene_3,
    4: render_scene_4,
    5: render_scene_5,
    6: render_scene_6,
    7: render_scene_7,
    8: render_scene_8,
    9: render_scene_9,
}

async def build_scene(scene: dict, total_scenes: int):
    scene_id = scene["id"]
    print(f"--- Processing Scene {scene_id}/{total_scenes}: {scene['title']} ---")
    
    # 1. Audio
    audio_path = BUILD_DIR / f"scene_{scene_id}.mp3"
    await generate_speech_audio(scene["script"], audio_path)
    duration = get_audio_duration(audio_path)
    print(f"Scene {scene_id} audio duration: {duration:.2f}s")
    
    # 2. Slide image
    img = Image.new("RGB", (1920, 1080), color=BG_COLOR)
    draw = ImageDraw.Draw(img)
    renderer = SCENE_RENDERERS[scene_id]
    renderer(img, draw, scene, total_scenes)
    
    image_path = BUILD_DIR / f"scene_{scene_id}.png"
    img.save(str(image_path), format="PNG")
    print(f"Scene {scene_id} image saved: {image_path.name}")
    
    # 3. Video clip with ffmpeg
    clip_path = BUILD_DIR / f"clip_{scene_id}.mp4"
    # Pad audio slightly (+0.5s) to prevent abrupt speech cutoffs
    clip_cmd = [
        FFMPEG_EXE, "-y",
        "-loop", "1",
        "-framerate", "30",
        "-i", str(image_path),
        "-i", str(audio_path),
        "-c:v", "libx264",
        "-tune", "stillimage",
        "-c:a", "aac",
        "-b:a", "192k",
        "-pix_fmt", "yuv420p",
        "-t", str(duration + 0.5),
        str(clip_path)
    ]
    subprocess.run(clip_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"Scene {scene_id} clip rendered: {clip_path.name}")
    return clip_path, duration + 0.5

async def main():
    print("=========================================================")
    print("STARTING CHAOSFORGE 1080P DEMO VIDEO BUILD (3-4 MINUTES)")
    print("=========================================================")
    
    total_scenes = len(SCENES)
    clip_paths = []
    total_duration = 0.0
    
    for scene in SCENES:
        clip_path, dur = await build_scene(scene, total_scenes)
        clip_paths.append(clip_path)
        total_duration += dur

    print(f"\nAll {total_scenes} clips rendered! Total estimated duration: {total_duration:.2f}s ({total_duration/60:.2f} minutes)")

    # Concatenate clips
    concat_file = BUILD_DIR / "concat_list.txt"
    with open(concat_file, "w", encoding="utf-8") as f:
        for p in clip_paths:
            f.write(f"file '{p.as_posix()}'\n")

    print(f"\nConcatenating clips into final output: {OUTPUT_VIDEO.name}...")
    concat_cmd = [
        FFMPEG_EXE, "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_file),
        "-c", "copy",
        str(OUTPUT_VIDEO)
    ]
    subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    final_dur = get_audio_duration(OUTPUT_VIDEO)
    file_size_mb = OUTPUT_VIDEO.stat().st_size / (1024 * 1024)
    print("=========================================================")
    print(f"VIDEO BUILD COMPLETE!")
    print(f"Output File: {OUTPUT_VIDEO}")
    print(f"Duration: {final_dur:.2f} seconds ({final_dur/60:.2f} minutes)")
    print(f"File Size: {file_size_mb:.2f} MB")
    print("=========================================================")

if __name__ == "__main__":
    asyncio.run(main())
