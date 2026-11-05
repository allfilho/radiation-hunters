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
const {pg,logs}=await newPage();await pg.goto('http://localhost:8765/');await pg.waitForTimeout(500);
for(const mid of [1,2,3,4,5]){
 await pg.evaluate((id)=>{const m=MISSIONS.find(x=>x.id===id);pendingMission=m;GameState.currentMission=m;ui.showScreen('storyIntro')},mid);
 await pg.click('#story-continue');await pg.waitForTimeout(2200);
 out['m'+mid]=await pg.evaluate(()=>{
  const s=window.gameScene,T=32,res=[];
  // fundo puro: jogador longe de todas as fontes OU de costas (fora do cone)
  GameState.currentShield=0;
  const samp=(n=60)=>{let a=0;for(let i=0;i<n;i++){s.measureRadiation();a+=s.currentReading}return a/n};
  for(const src of s.sources){
    const cx=src.furniture.centerX,cy=src.furniture.centerY;
    const best={}; // por direção livre (8 direções), maior distância com sinal médio > 2x fundo (10)
    let maxD=0,dirs=0,curve={};
    for(let k=0;k<16;k++){
      const ang=k*Math.PI/8;let dmaxDir=0,free=false;
      for(let d=0.5;d<=10;d+=0.5){
        const x=cx-Math.cos(ang)*d*T,y=cy-Math.sin(ang)*d*T;
        const tx=Math.floor(x/T),ty=Math.floor(y/T);
        if(s.mapData.map[ty]?.[tx]!==0&&s.mapData.map[ty]?.[tx]!==undefined&&s.mapData.map[ty][tx]!==2)break; // parede/fora
        s.player.x=x;s.player.y=y;s.playerDirection=ang;s.geigerActive=true;
        // desconta outras fontes: só conta se esta é a única na linha — aproximação: medir e subtrair 5
        const m=samp(30)-5;
        (curve[d]=curve[d]||[]).push(m);
        if(m>5)dmaxDir=d; free=true;
      }
      if(free){dirs++;maxD=Math.max(maxD,dmaxDir)}
    }
    const avg=Object.fromEntries(Object.entries(curve).filter(([d])=>[0.5,1,1.5,2,3,4,6,8,10].includes(+d)).map(([d,v])=>[d,+(v.reduce((x,y)=>x+y)/v.length).toFixed(0)]));
    res.push({n:src.name,t:src.type,base:src.base,maxDetectTiles:maxD,dirsTested:dirs,meanSignalByTile:avg});
  }
  return res;});
}
console.log(JSON.stringify(out));await b.close();srv.close();
