// Distribuição dos estados de pixel de UMA missão em N execuções, para uma versão.
// Uso: node pixels-missao.mjs <pasta> <missão> <N>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url'; import { chromium } from 'playwright-core';
const [, , RAIZ, ID, N] = process.argv; const aqui = path.dirname(fileURLToPath(import.meta.url));
const PHASER = fs.readFileSync(path.join(aqui, '../node_modules/phaser/dist/phaser.min.js')); const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const s = http.createServer((q, r) => { let p = q.url.split('?')[0]; if (p === '/') p = '/index.html'; const f = path.join(RAIZ, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'text/plain' }); r.end(fs.readFileSync(f)); }).listen(0);
await new Promise((r) => s.on('listening', r)); const url = `http://127.0.0.1:${s.address().port}/`;
const SEED = `(()=>{let a=424242>>>0;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();`;
const nav = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] }); const cont = {};
for (let k = 0; k < +N; k++) {
  const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } }); const pg = await ctx.newPage();
  await pg.route('**/*', (rt) => { const u = rt.request().url(); if (u.includes('phaser')) return rt.fulfill({ body: PHASER, contentType: 'text/javascript' }); if (u.includes('fonts.g')) return rt.fulfill({ body: '', contentType: 'text/css' }); return rt.continue(); });
  await pg.addInitScript(SEED); await pg.addInitScript(`localStorage.setItem('radiationHunters', JSON.stringify({unlockedMissions:[1,2,3,4,5,6,7,8]}))`);
  await pg.goto(url); await pg.click('#btn-new-game'); await pg.click(`#missions-container > *:nth-child(${ID})`); await pg.waitForSelector('#story-continue', { state: 'visible' }); await pg.click('#story-continue');
  await pg.waitForFunction(() => window.gameScene?.gameStarted && window.gameScene.sources); await pg.evaluate(() => window.gameScene.scene.pause()); await pg.waitForTimeout(300);
  const h = crypto.createHash('sha1').update(await pg.evaluate(() => document.querySelector('#game-container canvas').toDataURL())).digest('hex').slice(0, 8);
  cont[h] = (cont[h] || 0) + 1; await ctx.close();
}
console.log(JSON.stringify(cont)); await nav.close(); s.close();
