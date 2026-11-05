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
// 1. cold load
{const {pg,logs}=await newPage();await pg.goto('http://localhost:8765/');await pg.waitForTimeout(800);
 out.coldLogs=logs;
 out.continueVisible=await pg.isVisible('#btn-continue');
 out.activeScreen=await pg.$$eval('.screen.active',e=>e.map(x=>x.id));
 // missions
 await pg.click('#btn-new-game');await pg.waitForTimeout(300);
 out.missionCards=await pg.$$eval('#missions-container > *',e=>e.map(x=>({cls:x.className,txt:x.innerText.replace(/\n/g,' | ').slice(0,80)})));
 // start mission 1
 await pg.click('#missions-container > *:first-child');await pg.waitForTimeout(500);
 out.afterClickMission=await pg.$$eval('.screen.active',e=>e.map(x=>x.id));
 await pg.waitForTimeout(3000);
 await pg.click('#story-continue');await pg.waitForTimeout(2500);
 out.inGame=await pg.$$eval('.screen.active',e=>e.map(x=>x.id));
 out.canvas=await pg.evaluate(()=>{const c=document.querySelector('#game-container canvas');return c?[c.width,c.height,c.getBoundingClientRect().width|0,c.getBoundingClientRect().height|0]:null});
 out.sources=await pg.evaluate(()=>window.gameScene?.sources?.map(s=>({n:s.name,type:s.type,base:s.base})));
 // geiger toggle by key
 await pg.keyboard.press('g');await pg.waitForTimeout(1200);
 out.geiger=await pg.textContent('#geiger-reading');
 // pause via ESC
 await pg.keyboard.press('Escape');await pg.waitForTimeout(400);
 out.pauseModalActive=await pg.$eval('#pause-modal',e=>e.classList.contains('active'));
 await pg.click('#btn-resume');await pg.waitForTimeout(300);
 out.pausedAfterResume=await pg.evaluate(()=>GameState.paused);
 // ESC while pause open twice
 await pg.keyboard.press('Escape');await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
 out.doublePauseModal=await pg.$eval('#pause-modal',e=>e.classList.contains('active'));
 await pg.click('#btn-restart');await pg.waitForTimeout(1500);
 out.afterRestart={sources:await pg.evaluate(()=>window.gameScene?.sources?.length),paused:await pg.evaluate(()=>GameState.paused),started:await pg.evaluate(()=>window.gameScene?.gameStarted),score:await pg.evaluate(()=>GameState.score)};
 await pg.keyboard.press('Escape');await pg.waitForTimeout(300);await pg.click('#btn-quit');await pg.waitForTimeout(500);
 out.afterQuit=await pg.$$eval('.screen.active',e=>e.map(x=>x.id));
 out.afterQuitSceneActive=await pg.evaluate(()=>!!document.querySelector('#game-container canvas'));
 out.logs1=logs;
 // progress persistence w/o beforeunload
 await pg.evaluate(()=>{GameState.unlockedMissions.push(2)});
 await pg.reload();await pg.waitForTimeout(500);
 out.unlockAfterReload=await pg.evaluate(()=>GameState.unlockedMissions);
 await pg.evaluate(()=>{GameState.unlockedMissions.push(2);});
 await pg.evaluate(()=>window.dispatchEvent(new Event('beforeunload')));
 await pg.reload();await pg.waitForTimeout(500);
 out.unlockAfterBeforeunload=await pg.evaluate(()=>GameState.unlockedMissions);
 out.lsKeys=await pg.evaluate(()=>Object.fromEntries(Object.entries(localStorage)));
 // settings checkboxes persisted?
 await pg.click('#btn-settings');await pg.click('#show-hints');
 out.showHintsState=await pg.evaluate(()=>GameState.settings.showHints);
 await pg.click('#music-volume').catch(()=>{});
 out.musicState=await pg.evaluate(()=>GameState.settings.musicVolume);
}
// 2. corrupted localStorage
for(const [name,init] of [
 ['corrupt-json',()=>{localStorage.setItem('radiationHunters','{bad');}],
 ['unlocked-not-array',()=>{localStorage.setItem('radiationHunters',JSON.stringify({unlockedMissions:5,settings:null}));}],
 ['storage-denied',()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denied','SecurityError')}});}],
 ['lang-bad',()=>{localStorage.setItem('radiationHuntersLang','es');}]]){
 const {pg,logs}=await newPage(init);await pg.goto('http://localhost:8765/');await pg.waitForTimeout(800);
 let ok=true;let err='';try{await pg.click('#btn-new-game',{timeout:2000});await pg.waitForTimeout(300);}catch(e){ok=false;err=e.message.split('\n')[0]}
 out['ls_'+name]={logs:logs.slice(0,4),newGameClickable:ok,err,missions:await pg.$$eval('#missions-container > *',e=>e.length).catch(()=>'n/a')};
 if(name==='storage-denied'){try{await pg.click('.lang-btn[data-lang=pt]');}catch{}; out.ls_storage_denied_langclick_logs=logs.slice(0,6)}
}
console.log(JSON.stringify(out,null,1));
await b.close();srv.close();
