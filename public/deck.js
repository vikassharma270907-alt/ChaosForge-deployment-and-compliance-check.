(() => {
  const queue = document.querySelector('#queue'), empty = document.querySelector('#empty'), twitch = document.querySelector('#twitch'), autopilot = document.querySelector('#autopilot');
  let current = { autopilot: false };
  const action = (path, body) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  function button(label, fn) { const el = document.createElement('button'); el.textContent = label; el.addEventListener('click', fn); return el; }
  function render(state) { current = state; twitch.textContent = 'Twitch: ' + state.twitch; autopilot.textContent = 'Auto-Pilot: ' + (state.autopilot ? 'on' : 'off'); queue.replaceChildren(); empty.hidden = state.queue.length > 0; state.queue.forEach((proposal, index) => { const card = document.createElement('article'); card.className = 'panel'; const title = document.createElement('strong'); title.textContent = '#' + (index + 1) + ' ' + proposal.text; const by = document.createElement('p'); by.textContent = 'proposed by ' + proposal.userName + ' · ' + proposal.votes + ' vote' + (proposal.votes === 1 ? '' : 's'); card.append(title, by, button('Approve', () => action('/api/approve/' + encodeURIComponent(proposal.id))), button('Veto', () => action('/api/veto/' + encodeURIComponent(proposal.id)))); queue.append(card); }); }
  new EventSource('/events').addEventListener('state', event => { try { render(JSON.parse(event.data)); } catch {} });
  autopilot.addEventListener('click', () => action('/api/autopilot', { enabled: !current.autopilot }));
  document.querySelector('#raid').addEventListener('click', () => action('/api/simulate-raid'));
})();
