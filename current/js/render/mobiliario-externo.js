// Objetos de áreas externas (campus, pátio, estacionamento, horta, quadra) no mesmo pincel e paleta RPG dos demais móveis.
import {paleta} from './estilo-rpg.js';
export const MOVEIS_EXTERNOS=[
 ['tree',1,1,'Árvore','Tree',0x3f7d3a],
 ['yard_bench',2,1,'Banco do pátio','Courtyard bench',0x9a7448],
 ['flagpole',1,1,'Mastro de bandeiras','Flagpole',0xb9bcc0],
 ['garden_bed',3,1,'Canteiro da horta','Vegetable garden bed',0x6b4a2f],
 ['goal',3,1,'Trave da quadra','Court goal',0xe9ecef],
 ['parked_car',3,2,'Carro estacionado','Parked car',0x5f7f9a],
 ['bike_rack',2,1,'Bicicletário','Bike rack',0x8a949c],
 ['sign',3,1,'Placa da escola','School sign',0x4f9a6b],
 ['ambulance',3,2,'Ambulância (esquema)','Ambulance (diagram)',0xe9ecef],
 ['waste_container',2,1,'Contêiner de resíduos','Waste container',0x6a8f6a],
 ['planter',2,1,'Jardineira','Planter',0x8a6a48],
 ['lamp_post',1,1,'Poste de luz','Lamp post',0x6c757c],
 ['generator_unit',2,2,'Gerador de emergência','Emergency generator',0x7c8c5a],
 ['bus_shelter',3,1,'Abrigo de ponto','Bus shelter',0x6e8fa6],
 ['lead_container',2,1,'Contêiner blindado (esquema)','Shielded container (diagram)',0x7d858c],
].map(([id,width,height,pt,en,color])=>({id,width,height,pt,en,name:en,color}));
const IDS=new Set(MOVEIS_EXTERNOS.map(m=>m.id));
export const ehMovelExterno=(id)=>IDS.has(id);
/** Desenha o móvel externo `f` num Graphics `g` com pincel `d` (d.sombra já foi usada pelo chamador). */
export function desenharExterno(d,f,w,h){
 const id=f.type.id,m=paleta(f.type.color);
 if(id==='tree'){
  d.sombra(5,22,24,8,0.30).rect(13,17,6,12,0x5a3d22).rect(13,17,2,12,0x7a5632);
  d.disco(16,13,13,0x2e6230).disco(11,11,8,0x3f7d3a).disco(21,10,7,0x4f9448).disco(15,7,5,0x62a857).disco(9,16,5,0x2e6230);
 }else if(id==='yard_bench'){
  d.sombra(3,h-8,w-6,6,0.28).rect(6,h-9,4,7,m.fundo).rect(w-10,h-9,4,7,m.fundo);
  d.caixa(3,9,w-6,11,4,m).rect(4,4,w-8,5,m.luz).borda(4,4,w-8,5,m.contorno).linha(8,12,w-8,12,m.sombra);
 }else if(id==='flagpole'){
  d.sombra(6,22,20,6,0.28).caixa(10,20,12,8,3,m).linha(16,20,16,1,0xcfd3d6,2).disco(16,2,2,0xe8c85a);
  d.poli([[17,3],[30,5],[28,9],[30,13],[17,12]],0x3f9d5e,0x1f4f30).poli([[17,7],[24,8],[17,10]],0xf1e9b0);
 }else if(id==='garden_bed'){
  d.caixa(2,4,w-4,h-7,6,paleta(0x6b4a2f)).rect(5,7,w-10,h-16,0x4a3320);
  const cores=[0x5fae4f,0x7bc062,0xd98a3a,0x5fae4f,0xc9503f,0x7bc062];
  for(let i=0;i<8;i++){const x=9+i*10;d.rect(x,9,2,7,0x2f6b2c).disco(x+1,9,4,cores[i%cores.length]).anel(x+1,9,4,0x1f4a22);}
 }else if(id==='goal'){
  d.sombra(3,h-6,w-6,5,0.2).rect(4,4,w-8,17,0xdfe6ea,0.35).borda(4,4,w-8,17,0xf4f6f7);
  for(let x=10;x<w-8;x+=6)d.linha(x,4,x,21,0xdfe6ea);for(let y=10;y<21;y+=6)d.linha(4,y,w-4,y,0xdfe6ea);
  d.rect(3,2,4,20,0xf4f6f7).rect(w-7,2,4,20,0xf4f6f7).rect(3,2,w-6,3,0xf4f6f7);
 }else if(id==='parked_car'){
  const cores=[0x5f7f9a,0xa5503f,0x6b8f62,0xb9a257],c=paleta(cores[(((f.x|0)*7+(f.y|0)*3)>>1)%cores.length]);
  d.sombra(5,h-9,w-10,8,0.34);
  for(const x of [14,w-26])for(const y of [5,h-13])d.rect(x,y,12,8,0x14171a).rect(x+2,y+2,8,4,0x3a3f44);   // rodas
  d.poli([[4,13],[10,7],[w-12,7],[w-4,13],[w-4,h-17],[w-12,h-11],[10,h-11],[4,h-17]],c.base,c.contorno);  // carroceria
  d.poli([[6,14],[10,9],[w-14,9],[w-6,14]],c.luz);                                                         // capô e porta-malas em luz
  d.poli([[w*0.30,12],[w*0.30,h-16],[w*0.62,h-14],[w*0.62,10]],0x1f3a4a,0x0e1c25);                         // cabine em vidro
  d.rect(w*0.34,12,w*0.24,h-27,c.base).linha(w*0.30,12,w*0.62,10,0x9fcde0).linha(w*0.30,h-16,w*0.62,h-14,0x9fcde0); // teto
  d.rect(w-9,13,4,5,0xf3e6a3).rect(w-9,h-19,4,5,0xf3e6a3).rect(5,13,3,5,0xb33a2f).rect(5,h-19,3,5,0xb33a2f);        // faróis e lanternas
 }else if(id==='bike_rack'){
  d.sombra(3,h-7,w-6,5,0.26).rect(4,h-9,w-8,3,0x6c757c);
  for(let i=0;i<3;i++){const x=9+i*16;d.anel(x,16,6,0x2a2f33,2).anel(x+7,16,6,0x2a2f33,2).linha(x,16,x+4,8,0xc0513f,2).linha(x+4,8,x+7,16,0xc0513f,2);}
 }else if(id==='sign'){
  d.sombra(3,h-7,w-6,5,0.28).rect(6,h-11,5,9,0x5a3d22).rect(w-11,h-11,5,9,0x5a3d22);
  d.caixa(2,3,w-4,h-10,5,m).rect(7,7,w-14,h-20,0xf1ead6);
  for(let i=0;i<3;i++)d.linha(11,10+i*3,w-12-(i%2)*14,10+i*3,0x35566e,2);
 }else if(id==='ambulance'){
  d.sombra(4,h-10,w-8,8,0.32);
  d.rect(8,h-12,12,8,0x15181b).rect(w-20,h-12,12,8,0x15181b).rect(8,6,12,8,0x15181b).rect(w-20,6,12,8,0x15181b);
  d.caixa(4,6,w-8,h-12,8,m).rect(w-26,10,16,h-24,0x9fcde0).rect(8,h-22,w-38,3,0xc0392b);
  d.rect(14,12,3,12,0xc0392b).rect(10,16,11,4,0xc0392b).rect(w-12,8,5,3,0xe2c64a).rect(w-12,h-18,5,3,0xe2c64a).rect(w-20,5,10,3,0xd9533f);
 }else if(id==='waste_container'){
  d.sombra(3,h-7,w-6,5,0.3).caixa(3,4,w-6,h-8,6,m).rect(6,7,w-12,6,m.luz).rect(6,15,w-12,2,m.sombra).rect(w/2-3,18,6,4,0xe8e2c9);
  d.rect(5,3,w-10,3,m.fundo).borda(3,4,w-6,h-8,m.contorno);
 }else if(id==='planter'){
  d.sombra(3,h-7,w-6,5,0.26).caixa(3,10,w-6,h-14,5,m);
  const cs=[0xd9533f,0xe8c85a,0xc77dc4,0xf1e9b0];
  for(let i=0;i<5;i++){const x=9+i*(w-18)/4;d.disco(x,9,5,0x3f7d3a).disco(x,6,3,cs[i%cs.length]);}
 }else if(id==='lamp_post'){
  d.sombra(8,24,16,5,0.28).rect(14,10,4,17,0x4c545a).rect(11,25,10,4,0x3c4348).rect(10,5,12,6,m.luz).borda(10,5,12,6,m.contorno).disco(16,8,3,0xf6e7a1);
 }else if(id==='generator_unit'){
  d.sombra(4,h-8,w-8,6,0.3).caixa(4,6,w-8,h-12,8,m).rect(8,10,w-16,h-26,m.sombra);
  for(let i=0;i<5;i++)d.linha(10,14+i*5,w-12,14+i*5,m.fundo);
  d.rect(w-20,h-24,10,8,0xd9b34a).linha(w-20,h-24,w-10,h-16,0x3a3320);
 }else if(id==='bus_shelter'){
  d.sombra(4,h-7,w-8,5,0.26).rect(6,6,4,h-12,0x4c545a).rect(w-10,6,4,h-12,0x4c545a);
  d.rect(2,3,w-4,7,0x6e8fa6).borda(2,3,w-4,7,0x2f4552).rect(10,16,w-20,6,0x9a7448).rect(12,13,w-24,3,0xb48c5a);
 }else if(id==='lead_container'){
  d.sombra(3,h-7,w-6,5,0.3).caixa(3,4,w-6,h-8,7,m).rect(7,8,w-14,8,m.luz).borda(7,8,w-14,8,m.contorno);
  d.disco(w/2,12,4,0xd9b34a).disco(w/2,12,1.5,0x111111).rect(6,19,6,3,0x3d4348).rect(w-12,19,6,3,0x3d4348);
 }
}
