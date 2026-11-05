import fs from 'node:fs';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from '../helpers/navegador.mjs';
const srv=await servidor(); const nav=await abrirNavegador();
const out=[];
for (let m=1;m<=8;m++) for (const semente of [11,22,33,44,55,66]) {
  const {pg,ctx}=await novaPagina(nav,srv.url,{todasDesbloqueadas:true,semente});
  await iniciarMissao(pg,m);
  const d=await pg.evaluate(()=>{const s=window.gameScene;
    return {missao:s.missionData.id,tl:s.missionData.timeLimit,n:s.missionData.numSources,
      map:s.mapData.map,blocked:[...(s.blockedTiles||[])],
      start:[s.player.x,s.player.y],
      furn:s.furniture.map(f=>({x:f.x,y:f.y,cx:f.centerX,cy:f.centerY,w:f.type?.width,h:f.type?.height,name:f.type?.name,src:f.source?{type:f.source.type,name:f.source.name,base:f.source.base}:null}))}});
  d.semente=semente; out.push(d); await ctx.close();
}
fs.writeFileSync(new URL('./mapas.json', import.meta.url), JSON.stringify(out));
console.log(out.length,'mapas; ex blocked:',JSON.stringify(out[0].blocked).slice(0,120), 'furn0',JSON.stringify(out[0].furn[0]));
await nav.close();await srv.fechar();
