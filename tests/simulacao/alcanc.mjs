import fs from 'node:fs';
const M=JSON.parse(fs.readFileSync(new URL('./mapas.json', import.meta.url))); let ruins=0,tot=0;
for(const m of M){
  const bl=new Set(m.blocked.map(b=>b.x+','+b.y)); const walk=(x,y)=>x>=0&&y>=0&&x<24&&y<16&&!bl.has(x+','+y);
  const s=[Math.floor(m.start[0]/32),Math.floor(m.start[1]/32)]; const seen=new Set([s.join()]); const q=[s];
  while(q.length){const [x,y]=q.shift(); for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[x+dx,y+dy]; if(walk(...n)&&!seen.has(n.join())){seen.add(n.join());q.push(n);}}}
  for(const f of m.furn){ if(!f.src)continue; tot++; const w=f.w||1,h=f.h||1; let ok=false;
    for(let y=f.y-1;y<=f.y+h;y++)for(let x=f.x-1;x<=f.x+w;x++) if(seen.has(x+','+y)) ok=true;
    if(!ok){ruins++;console.log('fonte inalcançável: missão',m.missao,'sem',m.semente,f.src.name,f.name,w+'x'+h,'em',f.x,f.y);} }
}
console.log('inalcançáveis',ruins,'de',tot);
