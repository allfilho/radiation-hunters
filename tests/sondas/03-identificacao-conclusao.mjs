import { chromium } from 'playwright-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const ROOT=process.env.RH_ROOT||'./apps/radhunter/current';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const srv=http.createServer((q,r)=>{let p=q.url.split('?')[0];if(p==='/')p='/index.html';const f=path.join(ROOT,p);
 if(!fs.existsSync(f)){r.writeHead(404);return r.end();} r.writeHead(200,{'content-type':mime[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f));}).listen(8765);
const phaser=fs.readFileSync('node_modules/phaser/dist/phaser.min.js');
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
async function newPage(init){
  const ctx=await b.newContext({viewport:{width:1280,height:800}});
  const pg=await ctx.newPage(); const logs=[];
  pg.on('console',m=>{if(['error','warning'].includes(m.type()))logs.push(m.type()+': '+m.text())});
  pg.on('pageerror',e=>logs.push('PAGEERROR: '+e.message));
  await pg.route('**/*',rt=>{const u=rt.request().url();
    if(u.includes('phaser'))return rt.fulfill({body:phaser,contentType:'text/javascript'});
    if(u.includes('fonts.g'))return rt.fulfill({body:'',contentType:'text/css'});
    return rt.continue();});
  if(init)await pg.addInitScript(init);
  return {pg,logs};
}
const out={};
{const {pg,logs}=await newPage();await pg.goto('http://localhost:8765/');await pg.waitForTimeout(500);
 await pg.click('#btn-new-game');await pg.click('#missions-container > *:first-child');await pg.waitForTimeout(500);
 await pg.click('#story-continue');await pg.waitForTimeout(2000);
 // wrong answer then right answer through the real UI
 await pg.evaluate(()=>{const s=window.gameScene;const src=s.sources[0];s.player.x=src.furniture.centerX-32;s.player.y=src.furniture.centerY;s.playerDirection=0;s.geigerActive=true;s.measureRadiation();s.currentReading=999;s.handleIdentify()});
 const names=await pg.$$eval('.isotope-btn .isotope-name',e=>e.map(x=>x.textContent));
 const truth=await pg.evaluate(()=>window.gameScene.sources[0].name);
 const wrong=names.find(n=>n!==truth);
 await pg.click(`.isotope-btn:has-text("${wrong}")`);await pg.waitForTimeout(300);
 out.afterWrong={combo:await pg.evaluate(()=>GameState.combo),attempts:await pg.evaluate(()=>GameState.attempts),modalStillOpen:await pg.$eval('#identify-modal',e=>e.classList.contains('active')),feedback:(await pg.textContent('#identify-feedback')).slice(0,160)};
 // can the user pick again after wrong? (buttons disabled by pointer-events none)
 out.buttonsPE=await pg.$eval('#isotope-buttons',e=>getComputedStyle(e).pointerEvents);
 await pg.click('#btn-cancel-identify');
 // identify correct for all
 for(let i=0;i<2;i++){
  await pg.evaluate(()=>{const s=window.gameScene;const src=s.sources.find(x=>!x.found);s.selectedFurniture=src.furniture;ui.showIdentifyModal(s.sources.filter(x=>!x.found).map(x=>({name:x.name,type:x.type,symbol:x.symbol})),(sel)=>s.tryIdentify(sel))});
  const t=await pg.evaluate(()=>window.gameScene.selectedFurniture?.source?.name);
  await pg.click(`.isotope-btn:has-text("${t}")`);await pg.waitForTimeout(4000);
 }
 out.complete=await pg.$eval('#complete-modal',e=>e.classList.contains('active'));
 out.statsAtComplete=await pg.evaluate(()=>({score:GameState.score,att:GameState.attempts,cor:GameState.correct,combo:GameState.combo}));
 await pg.click('#btn-next-mission');await pg.waitForTimeout(3300);
 await pg.click('#story-continue');await pg.waitForTimeout(2200);
 out.mission2={cur:await pg.evaluate(()=>GameState.currentMission.id),scene:await pg.evaluate(()=>window.gameScene.missionData.id),sources:await pg.evaluate(()=>window.gameScene.sources.map(x=>x.name)),score:await pg.evaluate(()=>GameState.score),att:await pg.evaluate(()=>GameState.attempts),combo:await pg.evaluate(()=>GameState.combo),foundGS:await pg.evaluate(()=>GameState.foundSources.length),hudScore:await pg.textContent('#score-value'),hudName:await pg.textContent('#hud-mission-name')};
 // Replay from complete modal / restart: stats reset?
 await pg.evaluate(()=>{GameState.score=500;GameState.attempts=3;});
 await pg.keyboard.press('Escape');await pg.click('#btn-restart');await pg.waitForTimeout(1500);
 out.afterRestartStats=await pg.evaluate(()=>({score:GameState.score,att:GameState.attempts,combo:GameState.combo,hud:document.getElementById('score-value').textContent}));
 // tab key in menu: focus visible?
 await pg.evaluate(()=>{ui.showScreen('mainMenu')});
 await pg.keyboard.press('Tab');
 out.focusOutline=await pg.evaluate(()=>{const e=document.activeElement;const c=getComputedStyle(e);return [e.id||e.tagName,c.outlineStyle,c.outlineWidth]});
 out.logs=[...new Set(logs)];
 await pg.screenshot({path:'./desktop.png'});
}
console.log(JSON.stringify(out,null,1));await b.close();srv.close();
