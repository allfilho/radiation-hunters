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
 // Geiger stats: stand still far from sources, shield 0, 300 samples
 await pg.evaluate(()=>{window.gameScene.geigerActive=true});
 const samples=await pg.evaluate(()=>{const s=window.gameScene;const a=[];for(let i=0;i<400;i++){s.measureRadiation();a.push(s.currentReading)}return a});
 const m=samples.reduce((x,y)=>x+y)/samples.length;const v=samples.reduce((x,y)=>x+(y-m)**2,0)/samples.length;
 out.bgOnlyStats={mean:+m.toFixed(2),var:+v.toFixed(2),note:'Poisson => var~mean'};
 // put player right next to a gamma source, face it, sample
 const res=await pg.evaluate(()=>{const s=window.gameScene;const src=s.sources.find(x=>x.type==='gama');
   const out={};const c=[...Array(3).keys()];
   s.player.x=src.furniture.centerX-32*1.0;s.player.y=src.furniture.centerY;s.playerDirection=0;
   for(const sh of [0,1,2,3]){GameState.currentShield=sh;const a=[];for(let i=0;i<300;i++){s.measureRadiation();a.push(s.currentReading)}
     const mm=a.reduce((x,y)=>x+y)/a.length;const vv=a.reduce((x,y)=>x+(y-mm)**2,0)/a.length;out['shield'+sh]={mean:+mm.toFixed(1),var:+vv.toFixed(1),base:src.base}}
   // distance law for gamma
   GameState.currentShield=0;out.dist={};
   for(const d of [1,2,4,6]){s.player.x=src.furniture.centerX-32*d;s.player.y=src.furniture.centerY;const a=[];for(let i=0;i<200;i++){s.measureRadiation();a.push(s.currentReading-0)}
     out.dist[d]=+(a.reduce((x,y)=>x+y)/a.length-5).toFixed(1)}
   return out});
 out.gammaProbe=res;
 // identify flow: walk next to a source, wrong then right
 const flow=await pg.evaluate(async()=>{const s=window.gameScene;const src=s.sources[0];
   s.player.x=src.furniture.centerX-32;s.player.y=src.furniture.centerY;s.playerDirection=0;s.geigerActive=true;GameState.currentShield=0;s.measureRadiation();
   s.currentReading=999;s.handleIdentify();return {modal:document.getElementById('identify-modal').classList.contains('active'),buttons:[...document.querySelectorAll('.isotope-btn')].map(b=>b.innerText.replace(/\n/g,' '))}});
 out.identifyModal=flow;
 // ESC while identify modal open
 await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
 out.escWithIdentifyOpen={pause:await pg.$eval('#pause-modal',e=>e.classList.contains('active')),identify:await pg.$eval('#identify-modal',e=>e.classList.contains('active'))};
 await pg.click('#btn-resume');
 // Complete all sources via API
 await pg.evaluate(()=>{const s=window.gameScene;s.sources.forEach(x=>{x.found=true;s.foundSources.push(x)});s.completeMission()});
 await pg.waitForTimeout(400);
 out.complete={active:await pg.$eval('#complete-modal',e=>e.classList.contains('active')),msg:await pg.textContent('#complete-message'),stars:await pg.textContent('#complete-stars')};
 await pg.click('#btn-next-mission');await pg.waitForTimeout(3500);
 out.afterNext=await pg.$$eval('.screen.active',e=>e.map(x=>x.id));
 await pg.click('#story-continue').catch(e=>out.nextErr=e.message.slice(0,80));await pg.waitForTimeout(2000);
 out.mission2={cur:await pg.evaluate(()=>GameState.currentMission?.id),sources:await pg.evaluate(()=>window.gameScene?.sources?.map(x=>x.name)),score:await pg.evaluate(()=>GameState.score),attempts:await pg.evaluate(()=>GameState.attempts),combo:await pg.evaluate(()=>GameState.combo),found:await pg.evaluate(()=>GameState.foundSources.length)};
 // mission 3 Ra-226 and mission 5/6
 for(const id of [3,4,6,7,8]){
   const r=await pg.evaluate((id)=>{const m=MISSIONS.find(x=>x.id===id);pendingMission=m;GameState.currentMission=m;return true},id);
   await pg.evaluate(()=>{['identify','pause','complete'].forEach(m=>ui.hideModal(m));ui.showScreen('storyIntro')});await pg.click('#story-continue');await pg.waitForTimeout(2200);
   out['m'+id]=await pg.evaluate(()=>({n:window.gameScene?.sources?.length,names:[...new Set(window.gameScene?.sources?.map(x=>x.name))],theme:window.gameScene?.missionData?.mapTheme,timer:!!document.querySelector('#hud-timer')}));
 }
 out.logs=[...new Set(logs)];
}
// mobile
{const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const pg=await ctx.newPage();
 await pg.route('**/*',rt=>{const u=rt.request().url();if(u.includes('phaser'))return rt.fulfill({body:phaser,contentType:'text/javascript'});if(u.includes('fonts.g'))return rt.fulfill({body:'',contentType:'text/css'});return rt.continue()});
 await pg.goto('http://localhost:8765/');await pg.waitForTimeout(500);
 await pg.tap('#btn-new-game');await pg.tap('#missions-container > *:first-child');await pg.waitForTimeout(500);await pg.tap('#story-continue');await pg.waitForTimeout(2500);
 out.mobile=await pg.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};
  return {canvas:r('#game-container canvas'),hudTop:r('.hud-top'),hudBottom:r('.hud-bottom'),shield0:r('.shield-btn'),geigerBtn:r('#btn-geiger'),pause:r('#btn-pause'),minimap:r('#minimap-container'),scrollW:document.documentElement.scrollWidth,vw:innerWidth}});
 out.mobileTouchControls=await pg.evaluate(()=>!!document.querySelector('.touch-controls,#joystick,#dpad'));
 await pg.screenshot({path:'./mobile.png'});
}
console.log(JSON.stringify(out,null,1));await b.close();srv.close();
