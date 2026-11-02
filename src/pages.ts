export function overlayPage(demo: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>ChaosForge Overlay</title>
<style>html,body{margin:0;overflow:hidden;background:transparent}canvas{width:100vw;height:100vh;display:block}</style></head>
<body data-demo="${demo}"><canvas id="arena" aria-label="ChaosForge arena"></canvas><script src="/overlay.js"></script></body></html>`;
}

export function deckPage(demo: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>ChaosForge Deck</title>
<style>body{background:#09101f;color:#f1f5ff;font:16px system-ui;margin:0;padding:28px}main{max-width:900px;margin:auto}.brand{color:#56e0ff}.panel{background:#121d35;border:1px solid #25385d;border-radius:12px;padding:20px;margin-top:18px}.badge{padding:5px 10px;background:#573249;border-radius:20px}button{padding:10px 14px;border:0;border-radius:8px;font-weight:700;margin-right:8px}button[disabled]{opacity:.5}</style></head>
<body data-demo="${demo}"><main><h1><span class="brand">ChaosForge</span> control deck</h1><span class="badge" id="twitch">Twitch: connecting…</span>
<section class="panel"><h2>Proposal queue</h2><p id="empty">Waiting for proposals…</p><div id="queue"></div></section>
<section class="panel"><h2>Arena</h2><p>Open <code>/overlay${demo ? "?mode=demo" : ""}</code> as a 1920×1080 OBS Browser Source.</p><button id="autopilot">Auto-Pilot: off</button><button id="raid">Simulate Raid</button></section></main><script src="/deck.js"></script></body></html>`;
}

export function homePage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>ChaosForge — Live Audience Modding Engine</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #09101f;
      color: #f1f5ff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 960px;
      width: 90%;
      margin: 40px auto;
    }
    .badge-pill {
      display: inline-block;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #56e0ff;
      background: rgba(86, 224, 255, 0.12);
      border: 1px solid rgba(86, 224, 255, 0.3);
      border-radius: 999px;
      margin-bottom: 16px;
      letter-spacing: 0.5px;
    }
    h1 {
      font-size: 40px;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }
    .brand {
      color: #56e0ff;
      text-shadow: 0 0 25px rgba(86, 224, 255, 0.4);
    }
    .subtitle {
      font-size: 18px;
      color: #a2b4d6;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }
    .card {
      background: #121d35;
      border: 1px solid #25385d;
      border-radius: 14px;
      padding: 26px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: #56e0ff;
    }
    .card h2 {
      font-size: 22px;
      margin: 0 0 10px 0;
      color: #ffffff;
    }
    .card p {
      font-size: 15px;
      color: #9cb1d4;
      line-height: 1.5;
      margin: 0 0 20px 0;
      flex-grow: 1;
    }
    .btn {
      display: inline-block;
      text-align: center;
      padding: 12px 20px;
      font-size: 15px;
      font-weight: 700;
      color: #09101f;
      background: #56e0ff;
      text-decoration: none;
      border-radius: 8px;
      transition: background 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 14px rgba(86, 224, 255, 0.3);
    }
    .btn:hover {
      background: #7ae8ff;
      box-shadow: 0 6px 20px rgba(86, 224, 255, 0.45);
    }
    .btn-secondary {
      background: #9146ff;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(145, 70, 255, 0.3);
    }
    .btn-secondary:hover {
      background: #a366ff;
      box-shadow: 0 6px 20px rgba(145, 70, 255, 0.45);
    }
    .sublinks {
      margin-top: 12px;
      font-size: 13px;
      color: #7289b0;
    }
    .sublinks a {
      color: #56e0ff;
      text-decoration: none;
    }
    .sublinks a:hover {
      text-decoration: underline;
    }
    .info-panel {
      background: #0e162a;
      border: 1px solid #1c2b48;
      border-radius: 12px;
      padding: 20px 24px;
      font-size: 14px;
      color: #8fa5ca;
      line-height: 1.6;
    }
    .info-panel strong {
      color: #e3ecfc;
    }
    .code-pill {
      background: #17243e;
      padding: 3px 8px;
      border-radius: 5px;
      font-family: monospace;
      color: #72f5ff;
    }
    #oauth-view {
      display: none;
      background: #121d35;
      border: 1px solid #25385d;
      border-radius: 14px;
      padding: 36px;
      text-align: center;
      max-width: 500px;
      margin: 40px auto;
    }
  </style>
</head>
<body>
  <div id="oauth-view">
    <div class="badge-pill">Twitch OAuth Callback</div>
    <h1>Connecting to Twitch…</h1>
    <p id="status" style="color: #9cb1d4;">Reading the secure callback.</p>
  </div>

  <div id="portal-view" class="container">
    <div class="badge-pill">Codex x TwitchCon 2026 Hackathon</div>
    <h1><span class="brand">ChaosForge</span> Portal</h1>
    <p class="subtitle">Live audience modding engine for Twitch streams and transparent OBS Browser Source canvas arenas.</p>

    <div class="grid">
      <div class="card">
        <div>
          <h2>Streamer Control Deck</h2>
          <p>Real-time queue of viewer rule proposals. Streamers approve or veto rules, toggle 30s Auto-Pilot, or simulate live raids.</p>
        </div>
        <div>
          <a class="btn" href="/deck?mode=demo" target="_blank">Launch Demo Deck &rarr;</a>
          <div class="sublinks">Or open <a href="/deck" target="_blank">Live Deck</a> (requires Twitch token)</div>
        </div>
      </div>

      <div class="card">
        <div>
          <h2>OBS Canvas Overlay</h2>
          <p>1920×1080 transparent procedural 2D canvas arena with dynamic physics, hazards, Web Audio, and shader presets.</p>
        </div>
        <div>
          <a class="btn btn-secondary" href="/overlay?mode=demo" target="_blank">Launch Demo Overlay &rarr;</a>
          <div class="sublinks">OBS Browser Source: <a href="/overlay" target="_blank">/overlay</a> (transparent)</div>
        </div>
      </div>
    </div>

    <div class="info-panel">
      <strong>How to test:</strong> Open the <strong>Demo Deck</strong> and <strong>Demo Overlay</strong> in two side-by-side browser tabs. The demo engine generates synthetic viewer proposals (such as <span class="code-pill">!forge reverse gravity and make floor lava</span>), votes, and cheers through the exact same parsing and approval pipeline as live Twitch events.
    </div>
  </div>

  <script>
    const hash = location.hash.slice(1);
    const token = new URLSearchParams(hash).get('access_token');
    if (token) {
      document.getElementById('oauth-view').style.display = 'block';
      document.getElementById('portal-view').style.display = 'none';
      fetch('/auth/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      .then(async r => ({ ok: r.ok, body: await r.json() }))
      .then(({ ok, body }) => {
        document.querySelector('#status').textContent = ok ? 'Connected as ' + body.login : body.error;
        history.replaceState({}, '', location.pathname);
      })
      .catch(() => {
        document.querySelector('#status').textContent = 'Could not save the Twitch connection.';
      });
    }
  </script>
</body>
</html>`;
}
