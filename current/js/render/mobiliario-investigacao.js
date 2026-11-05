// Objetos de investigação desenhados com o mesmo pincel e paleta RPG do jogo.
import {pincel,paleta,T} from './estilo-rpg.js';
import {MOVEIS_EXTERNOS,ehMovelExterno,desenharExterno} from './mobiliario-externo.js';
export const MOVEIS_INVESTIGACAO=[
 ['tracer_bench',2,1,'Bancada de modelos de radiofármacos','Radiopharmaceutical model bench',0x739b9e],
 ['bookcase',1,2,'Estante da biblioteca','Library bookcase',0xa18762],
 ['sample_tray',2,1,'Bancada de amostras','Sample bench',0x8fa6a0],
 ['sample_drawer',1,2,'Arquivo de amostras','Sample archive',0x8398a1],
 ['radon_detector',1,1,'Detector integrador de radônio (representação)','Integrating radon detector (representation)',0x5f8693],
 ['school_desk',2,1,'Carteiras da sala de aula','Classroom desks',0xb99761],
 ['acquisition_panel',2,1,'Terminal de aquisição didática','Educational acquisition terminal',0x739ca3],
].map(([id,width,height,pt,en,color])=>({id,width,height,pt,en,name:en,color})).concat(MOVEIS_EXTERNOS);
export function desenharMovelInvestigacao(scene,f){
 if(!MOVEIS_INVESTIGACAO.some(m=>m.id===f.type.id))return null;
 const g=scene.add.graphics().setDepth(2),d=pincel(g,f.x*T,f.y*T),w=f.type.width*T,h=f.type.height*T,m=paleta(f.type.color);
 if(ehMovelExterno(f.type.id)){desenharExterno(d,f,w,h);return g;}
 d.sombra(3,h-7,w-4,7);
 if(f.type.id==='bookcase'){
  d.caixa(2,2,w-4,h-5,7,m).rect(5,6,w-10,h-15,m.fundo);
  const cores=[0x739d9c,0xc6a16e,0x9a7da3,0x7893af];
  for(let j=0;j<3;j++){for(let k=0;k<4;k++)d.rect(6+k*5,8+j*14,4,11,cores[(j+k)%4]).linha(7+k*5,10+j*14,8+k*5,10+j*14,m.luz);d.rect(4,20+j*14,w-8,2,m.luz);}
 }else if(f.type.id==='tracer_bench'){
  d.caixa(2,3,w-4,h-6,7,m).rect(5,6,w-10,h-16,0xd5dcca);
  for(let i=0;i<3;i++){const x=10+i*17;d.rect(x,10,10,11,[0x86a6b0,0xa5b87c,0x9b89a8][i]).borda(x,10,10,11,m.contorno).rect(x+1,7,8,4,0x516b7b).rect(x+2,14,6,4,0xf0e9d7);}
 }else if(f.type.id==='sample_drawer'){
  d.caixa(3,2,w-6,h-5,7,m);
  for(let i=0;i<4;i++){const y=7+i*12;d.rect(6,y,w-12,10,m.sombra).borda(6,y,w-12,10,m.contorno).rect(11,y+3,10,4,0xe8e2c9).linha(14,y+5,19,y+5,0x456174);}
 }else if(f.type.id==='radon_detector'){
  d.disco(16,17,11,m.sombra).anel(16,17,11,m.contorno).disco(16,13,10,m.base).anel(16,13,10,m.contorno).rect(11,10,10,6,0xe3dfcb).linha(13,12,19,12,0x456174);
  d.rect(11,22,10,2,m.luz);
 }else if(f.type.id==='school_desk'){
  for(let i=0;i<2;i++){const x=3+i*31;d.caixa(x,3,26,21,5,m).rect(x+6,7,13,8,0xf1ead6).linha(x+8,10,x+16,10,0x678390).rect(x+5,26,17,3,m.sombra);}
 }else if(f.type.id==='acquisition_panel'){
  d.caixa(2,6,w-4,h-9,6,m).rect(8,2,37,18,0x213e50).borda(8,2,37,18,m.contorno).rect(11,5,31,11,0x436f7e);
  for(let i=0;i<5;i++)d.disco(15+i*5,9+(i%2)*3,1.5,0xedd374);
  d.rect(12,23,28,4,0xd4dccc).rect(49,21,6,5,0xe2bd62);
 }else{
  d.caixa(2,3,w-4,h-6,8,m).rect(6,6,w-12,h-15,0xe6dfbe);
  d.poli([[12,9],[21,7],[26,15],[17,17]],0x393740,0x172b38);
  d.poli([[34,6],[40,10],[40,18],[34,21],[29,16],[29,10]],0xd2aa6f,0x607785);
  d.poli([[49,9],[55,7],[59,14],[52,19],[47,15]],0x8aba9b,0x436f76);
 }
 return g;
}
