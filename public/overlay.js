(() => {
  const canvas = document.querySelector('#arena');
  const ctx = canvas.getContext('2d');
  const demo = document.body.dataset.demo === 'true';
  let width = 1920, height = 1080, last = performance.now();
  let effect = { gravityX: 0, gravityY: 1, hazard: 'none', hazardIntensity: 1, shader: 'none', shieldSeconds: 0, durationSeconds: 20 };
  let player = { x: 460, y: 540, vx: 0, vy: 0, shieldUntil: 0, coins: 0 };
  let coin = { x: 980, y: 620 };
  let banner = null, contributor = null, meteors = [], startedAudio = false;
  const colors = { neon: '#43efff', lava: '#ff633d', spikes: '#d8e1fb', coin: '#ffd75a' };

  function resize() { const scale = Math.min(2, devicePixelRatio || 1); canvas.width = innerWidth * scale; canvas.height = innerHeight * scale; ctx.setTransform(scale, 0, 0, scale, 0, 0); width = innerWidth; height = innerHeight; }
  addEventListener('resize', resize); resize();
  function audio() { if (startedAudio) return; startedAudio = true; try { const ac = new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 520; g.gain.setValueAtTime(.04, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .22); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .22); } catch {} }
  function approve(event) { effect = event.effect; banner = { text: event.text, user: event.user, until: performance.now() + 4400 }; contributor = { user: event.user, effect, until: performance.now() + effect.durationSeconds * 1000 }; player.shieldUntil = performance.now() + effect.shieldSeconds * 1000; meteors = []; audio(); }
  function demoEvent(index) { const rules = [
    ['reverse gravity and make the floor lava', 'NovaByte', { gravityX:0,gravityY:-1,hazard:'lava',hazardIntensity:3,shader:'neon',shieldSeconds:0,durationSeconds:12 }],
    ['glitch meteors, give us a shield', 'PixelWitch', { gravityX:0,gravityY:1,hazard:'meteors',hazardIntensity:4,shader:'glitch',shieldSeconds:8,durationSeconds:12 }],
    ['pull right through the spikes', 'ForgeFan', { gravityX:1,gravityY:1,hazard:'spikes',hazardIntensity:3,shader:'invert',shieldSeconds:0,durationSeconds:12 }]
  ][index % 3];
    approve({ text: rules[0], user: 'DEMO · ' + rules[1], effect: rules[2] });
  }
  if (demo) { setTimeout(() => demoEvent(0), 1800); let i = 1; setInterval(() => demoEvent(i++), 14500); }
  function drawHazard() { if (effect.hazard === 'lava') { ctx.fillStyle = 'rgba(255,67,37,.78)'; ctx.fillRect(0, height - 94, width, 94); for (let x=0;x<width;x+=46) { ctx.beginPath();ctx.arc(x, height-94, 20, 0, Math.PI,true);ctx.fillStyle='#ff9264';ctx.fill(); } }
    if (effect.hazard === 'spikes') { ctx.fillStyle=colors.spikes; for(let x=0;x<width;x+=50){ctx.beginPath();ctx.moveTo(x,height-42);ctx.lineTo(x+25,height-94);ctx.lineTo(x+50,height-42);ctx.fill();} }
    if (effect.hazard === 'meteors') { if(Math.random()<.025*effect.hazardIntensity) meteors.push({x:Math.random()*width,y:-20,vy:4+effect.hazardIntensity}); ctx.fillStyle='#ff764c'; meteors.forEach(m=>{m.y+=m.vy;ctx.beginPath();ctx.arc(m.x,m.y,12,0,7);ctx.fill();}); meteors=meteors.filter(m=>m.y<height+40); }
  }
  function frame(now) { const dt=Math.min(32,now-last)/16.67; last=now; ctx.clearRect(0,0,width,height); if(effect.shader==='neon'){ctx.shadowBlur=35;ctx.shadowColor='#38e9ff';} ctx.strokeStyle='rgba(130,170,255,.18)';ctx.lineWidth=2;for(let x=0;x<width;x+=96){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,height);ctx.stroke();}for(let y=0;y<height;y+=96){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(width,y);ctx.stroke();} ctx.shadowBlur=0;
    drawHazard(); const dx=coin.x-player.x,dy=coin.y-player.y; player.vx+=(Math.sign(dx)*.12+effect.gravityX*.18)*dt; player.vy+=(Math.sign(dy)*.05+effect.gravityY*.12)*dt; player.vx*=.94;player.vy*=.94; player.x=Math.max(30,Math.min(width-30,player.x+player.vx*dt));player.y=Math.max(30,Math.min(height-120,player.y+player.vy*dt)); if(Math.hypot(dx,dy)<32){player.coins++;coin={x:100+Math.random()*(width-200),y:140+Math.random()*(height-320)};}
    ctx.fillStyle=colors.coin;ctx.beginPath();ctx.arc(coin.x,coin.y,14,0,7);ctx.fill();ctx.fillStyle=effect.shader==='invert'?'#101a30':'#72f5ff';ctx.fillRect(player.x-17,player.y-17,34,34); if(performance.now()<player.shieldUntil){ctx.strokeStyle='#77f7ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x,player.y,34,0,7);ctx.stroke();}
    ctx.fillStyle='#f6f8ff';ctx.font='bold 22px system-ui';ctx.fillText('COINS '+String(player.coins).padStart(2,'0'),40,54); if(banner&&now<banner.until){ctx.fillStyle='rgba(8,16,35,.88)';ctx.fillRect(width/2-330,45,660,90);ctx.fillStyle='#69edff';ctx.font='bold 23px system-ui';ctx.textAlign='center';ctx.fillText('RULE APPROVED',width/2,78);ctx.fillStyle='#fff';ctx.font='18px system-ui';ctx.fillText(banner.text+' — '+banner.user,width/2,110);ctx.textAlign='left';}
    if(contributor&&now<contributor.until){ctx.fillStyle='rgba(15,25,48,.86)';ctx.fillRect(width-305,height-104,265,65);ctx.fillStyle='#fff';ctx.font='15px system-ui';ctx.fillText('Forged by '+contributor.user,width-286,height-76);ctx.fillStyle='#85eaff';ctx.fillText(contributor.effect.hazard+' · '+contributor.effect.shader,width-286,height-54);}
    if(effect.shader==='glitch'&&Math.random()<.15){ctx.fillStyle='rgba(255,30,190,.2)';ctx.fillRect(Math.random()*width,Math.random()*height,width*.25,5);} requestAnimationFrame(frame); }
  window.ChaosForgeArena = { approve }; requestAnimationFrame(frame);
})();
