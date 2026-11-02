export function overlayPage(demo: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>ChaosForge Overlay</title>
<style>html,body{margin:0;overflow:hidden;background:transparent}canvas{width:100vw;height:100vh;display:block}</style></head>
<body data-demo="${demo}"><canvas id="arena" aria-label="ChaosForge arena"></canvas><script src="/overlay.js"></script></body></html>`;
}

export function deckPage(demo: boolean): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>ChaosForge Deck</title>
<style>body{background:#09101f;color:#f1f5ff;font:16px system-ui;margin:0;padding:28px}main{max-width:900px;margin:auto}.brand{color:#56e0ff}.panel{background:#121d35;border:1px solid #25385d;border-radius:12px;padding:20px;margin-top:18px}.badge{padding:5px 10px;background:#573249;border-radius:20px}button{padding:10px 14px;border:0;border-radius:8px;font-weight:700;margin-right:8px}button[disabled]{opacity:.5}</style></head>
<body data-demo="${demo}"><main><h1><span class="brand">ChaosForge</span> control deck</h1><span class="badge" id="twitch">Twitch: demo preview</span>
<section class="panel"><h2>Proposal queue</h2><p id="empty">The interactive queue loads with the control slice.</p><div id="queue"></div></section>
<section class="panel"><h2>Arena</h2><p>Open <code>/overlay${demo ? "?mode=demo" : ""}</code> as a 1920×1080 OBS Browser Source.</p><button disabled>Auto-Pilot</button><button disabled>Simulate Raid</button></section></main></body></html>`;
}
