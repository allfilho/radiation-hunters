import fs from 'node:fs';
const M=JSON.parse(fs.readFileSync(new URL('./mapas.json', import.meta.url)));
let tot=0,inacc=0; const por={};
for(const m of M){
  const bl=new Set(m.blocked.map(b=>b.x+','+b.y));
  const walk=(x,y)=>x>=0&&y>=0&&x<24&&y<16&&!bl.has(x+','+y);
  for(const f of m.furn){ if(!f.src) continue; tot++;
    let best=9; for(let y=0;y<16;y++)for(let x=0;x<24;x++) if(walk(x,y)){const d=Math.hypot(f.cx/32-(x+.5),f.cy/32-(y+.5)); if(d<best)best=d;}
    const k=m.missao; por[k]??=[0,0]; por[k][0]++; if(best>1.5){inacc++;por[k][1]++; if(por[k][1]<3)console.log('inacessível: missão',k,f.name,f.w+'x'+f.h,'dmin centro=',best.toFixed(2),f.src.name)}
  }}
console.log('fontes em móveis cuja menor distância (centro) a um tile andável > IDENTIFY_DISTANCE(1,5 tiles):',inacc,'de',tot);
console.log(JSON.stringify(por));
const tam={}; for(const m of M) for(const f of m.furn){const k=(f.w||1)+'x'+(f.h||1); tam[k]=(tam[k]||0)+1;} console.log(tam);
