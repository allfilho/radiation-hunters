// Teste diferencial: roda as 8 missões em duas versões do jogo (ex.: game.js antigo
// vs módulos) com a MESMA semente e compara o que o jogo gera: mapa, móveis, fontes
// e leituras do Geiger. Se o código foi só movido, tudo deve ser idêntico.
// Uso: node comparar-versoes.mjs <pasta A> <pasta B>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
const [, , A, B] = process.argv;
const aqui = path.dirname(fileURLToPath(import.meta.url));
const PHASER = fs.readFileSync(path.join(aqui, '../node_modules/phaser/dist/phaser.min.js'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const serve = (raiz) => new Promise((ok) => { const s = http.createServer((q, r) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(raiz, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); })
  .listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${s.address().port}/`, s })); });
const SEED = `(()=>{let a=424242>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
async function coletar(raiz, nav) {
  const srv = await serve(raiz); const saida = {};
  for (let id = 1; id <= 8; id++) {
    const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage(); const erros = [];
    pg.on('pageerror', (e) => erros.push(e.message)); pg.on('console', (m) => m.type() === 'error' && erros.push(m.text()));
    await pg.route('**/*', (rt) => { const u = rt.request().url(); if (u.includes('phaser')) return rt.fulfill({ body: PHASER, contentType: 'text/javascript' }); if (u.includes('fonts.g')) return rt.fulfill({ body: '', contentType: 'text/css' }); return rt.continue(); });
    await pg.addInitScript(SEED); await pg.addInitScript(`localStorage.setItem('radiationHunters', JSON.stringify({unlockedMissions:[1,2,3,4,5,6,7,8]}))`);
    await pg.goto(srv.url); await pg.waitForSelector('#btn-new-game');
    await pg.click('#btn-new-game'); await pg.click(`#missions-container > *:nth-child(${id})`); await pg.waitForSelector('#story-continue', { state: 'visible' }); await pg.click('#story-continue');
    await pg.waitForFunction(() => window.gameScene?.gameStarted && window.gameScene.sources); await pg.evaluate(() => window.gameScene.scene.pause()); await pg.waitForTimeout(300);
    saida[id] = await pg.evaluate(() => {
      const s = window.gameScene;
      const fonte = s.sources.map((x) => [x.name, x.type, x.base, Math.round(x.furniture.centerX), Math.round(x.furniture.centerY)]);
      const medidas = [];
      for (const x of s.sources) { s.sources.forEach((y) => { y.found = y !== x; }); s.player.x = x.furniture.centerX - 32; s.player.y = x.furniture.centerY; s.playerDirection = 0; for (let sh = 0; sh < 4; sh++) { GameState.currentShield = sh; s.measureRadiation(); medidas.push(s.currentReading); } }
      return { mapa: JSON.stringify(s.mapData.map), moveis: s.furniture.length, fonte, medidas, jogador: [Math.round(s.player.x), Math.round(s.player.y)], pixels: document.querySelector('#game-container canvas').toDataURL() };
    });
    saida[id].erros = erros; await ctx.close();
  }
  srv.s.close(); return saida;
}
const nav = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] });
const [ra, ra2, rb] = [await coletar(A, nav), await coletar(A, nav), await coletar(B, nav)]; await nav.close();
// ra2 = a própria versão A de novo: se os pixels de A já diferem de A, a animação depende do tempo
// e a comparação de pixels com B não prova nada naquela missão.
let difs = 0;
for (let id = 1; id <= 8; id++) {
  const h = (o) => crypto.createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 10);
  const comparavel = ra[id].pixels === ra2[id].pixels;
  const px = !comparavel ? null : ra[id].pixels === rb[id].pixels;
  const pxTxt = px === null ? 'pixels não comparáveis (animação por tempo)' : px ? 'pixels do canvas iguais' : 'pixels do canvas DIFERENTES';
  const semPx = (o) => ({ ...o, pixels: undefined });
  const igual = h(semPx(ra[id])) === h(semPx(rb[id])) ; if (!igual) difs++; // pixels: só informativo (animação depende do tempo)
  console.log(`missão ${id}: ${igual ? 'IDÊNTICA' : 'DIFERENTE'}  mapa ${ra[id].mapa.length}B, ${ra[id].moveis} móveis, ${ra[id].fonte.length} fontes, ${ra[id].medidas.length} leituras, ${pxTxt}, erros A/B: ${ra[id].erros.length}/${rb[id].erros.length}  [${h(ra[id])} / ${h(rb[id])}]`);
}
process.exit(difs ? 1 : 0);
