// Objetos da visita educativa: desenhos esquemáticos, sem comandos de equipamento clínico.
export const MOVEIS_HOSPITAL = [
 ['reception_desk',3,1,'Balcão de recepção','Reception desk'],
 ['waiting_seats',3,1,'Assentos de espera','Waiting seats'],
 ['xray_unit',3,2,'Conjunto de radiografia (esquema)','X-ray unit (diagram)'],
 ['wall_detector',1,2,'Detector de raios X (esquema)','X-ray detector (diagram)'],
 ['image_console',2,1,'Estação de imagens','Image workstation'],
 ['display_case',2,1,'Vitrine educativa: modelo de fonte','Educational display: source model'],
 ['learning_board',3,1,'Painel de comparação','Comparison board'],
 ['school_mural',3,1,'Mural da escola','School board'],
 ['work_table',2,1,'Mesa de produção do cartaz','Poster worktable'],
 ['gamma_camera',3,2,'Gama-câmara (esquema)','Gamma camera (diagram)'],
 ['staff_sink',2,1,'Bancada de apoio e pia','Support counter and sink'],
].map(([id,width,height,pt,en])=>({id,width,height,name:en,pt,en,color:0x8faeb5}));

export function desenharMovelHospital(scene,f,T){
 if(!MOVEIS_HOSPITAL.some(m=>m.id===f.type.id))return null;
 const g=scene.add.graphics().setDepth(2),x=f.x*T+3,y=f.y*T+3,w=f.type.width*T-6,h=f.type.height*T-6;
 const rect=(a,b,c,d,color)=>{g.fillStyle(color);g.fillRect(x+a,y+b,c,d);};
 const round=(a,b,c,d,color)=>{g.fillStyle(color);g.fillRoundedRect(x+a,y+b,c,d,3);};
 const line=(a,b,c,d,color=0x426071)=>{g.lineStyle(2,color);g.lineBetween(x+a,y+b,x+c,y+d);};
 // Cast shadow and a dark lower edge match the original furniture's outlined, raised perspective.
 round(2,4,w,h,0x233b47);
 switch(f.type.id){
 case 'reception_desk':
  round(0,0,w,h-3,0x468b92);rect(2,1,w-4,7,0xd7e4d9);rect(7,10,25,9,0x284655);rect(10,11,19,5,0x8dd2d9);rect(w-23,10,14,8,0xf5eedb);line(38,10,38,h-4);break;
 case 'waiting_seats':
  rect(4,h-5,w-8,3,0x8b9ea8);for(let i=0;i<3;i++){round(3+i*29,0,23,14,0x499cad);round(3+i*29,12,23,9,0x80c0c4);line(7+i*29,21,7+i*29,26);line(22+i*29,21,22+i*29,26);}break;
 case 'xray_unit':
  rect(5,3,9,h-8,0xa8bdc5);rect(6,2,w-18,7,0xe2e9e6);round(w-27,7,22,15,0x638b9b);rect(w-21,20,10,4,0x263d50);round(23,31,w-29,18,0xe3e8dc);rect(28,33,w-39,11,0x91bcc0);rect(29,51,w-43,5,0x455f70);break;
 case 'wall_detector':
  round(1,1,w-2,h-6,0xc9deda);rect(5,5,w-10,h-17,0x30596e);line(w/2,9,w/2,h-18,0xd5ede6);for(let i=0;i<4;i++)line(8,14+i*7,w-8,14+i*7,0x90bdc0);rect(6,h-9,w-12,5,0x748f9e);break;
 case 'image_console':
  rect(0,h-9,w,7,0x90a6b1);round(4,0,w-8,17,0x334e60);rect(8,3,w-16,11,0xadd8d6);for(let i=0;i<4;i++)line(w/2-8,5+i*2,w/2+8,5+i*2,0xe8f0df);rect(w/2-2,17,4,4,0x8ea4af);break;
 case 'display_case':
  round(0,0,w,h-3,0x829ca6);rect(4,3,w-8,h-10,0xbde3de);round(w/2-8,5,16,14,0x526e7a);rect(w/2-5,3,10,4,0xd3d8c8);line(5,h-7,w-5,h-7);break;
 case 'learning_board':
 case 'school_mural':
  round(0,0,w,h-3,0xa87d4e);rect(4,3,w-8,h-9,0xd5c5a0);for(let i=0;i<3;i++){rect(8+i*27,6,20,13,0xf5efdc);rect(10+i*27,8,16,2,[0x478c9b,0xc88157,0x67916c][i]);line(11+i*27,13,22+i*27,13,0x718793);}break;
 case 'work_table':
  round(0,0,w,h-3,0xaa895e);rect(4,3,w-8,h-10,0xd7bd8a);rect(8,5,20,12,0xf5efdb);rect(32,9,16,10,0x8fc4c1);line(10,9,23,9);line(46,4,51,15,0xc17150);break;
 case 'gamma_camera':
  round(7,2,30,h-6,0xb7cdd0);round(13,7,24,h-18,0x3b6579);round(22,14,21,24,0xe7eddf);rect(27,18,10,15,0x6295a2);round(40,25,w-43,18,0xd4e5dd);rect(44,29,w-51,10,0x89b8bd);rect(w-15,44,7,10,0x7b949e);break;
 case 'staff_sink':
  round(0,0,w,h-3,0x8aaab5);rect(3,2,w-6,6,0xdfe7db);round(8,7,23,13,0x4d7486);rect(12,9,15,8,0xbed4d5);line(20,5,20,11);rect(w-15,9,7,10,0x79b7b2);break;
 }
 return g;
}
