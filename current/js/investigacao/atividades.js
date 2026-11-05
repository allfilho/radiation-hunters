import {observarAtividade} from './modelos.js';
const T=(pt,en)=>({pt,en});
const ROTULOS={
 aquisicao:{ativa:T('Ativar aquisição','Start acquisition'),pausada:T('Pausar aquisição','Pause acquisition')},
 feixe:{ligado:T('Acelerador ligado (em tratamento)','Accelerator on (treating)'),desligado:T('Acelerador desligado','Accelerator off')},
 objeto:{longe:T('Geiger longe do objeto','Geiger far from the object'),perto:T('Geiger junto ao objeto','Geiger next to the object')},
 distribuicao:{A:T('Composto A','Compound A'),B:T('Composto B','Compound B')},
 amostras:{carvao:T('Carvão','Charcoal'),zircao:T('Zircão','Zircon'),apatita:T('Apatita','Apatite')},
 'dados-upb':{incompleta:T('Ficha 1 · dado isolado','Card 1 · isolated data'),contextualizada:T('Ficha 2 · dados e contexto','Card 2 · data and context')},
 tracos:{preservado:T('Registro preservado','Preserved record'),aquecido:T('Após aquecimento','After heating')},
 'serie-radon':{curto:T('Primeiros 30 dias','First 30 days'),longo:T('Campanha de 360 dias','360-day campaign')},
 'sala-radon':{fechada:T('Tudo fechado','All closed'),janelas:T('Janelas e porta abertas na aula','Windows and door open in class'),mecanica:T('Ventilação mecânica programada','Scheduled mechanical ventilation')},
 'ambiente-radon':{sala:T('Sala de aula','Classroom'),deposito:T('Depósito sem janelas','Storeroom, no windows'),porao:T('Porão','Basement'),andar1:T('Sala do 1º andar','1st-floor classroom'),sotao:T('Sótão','Attic')},
 protocolo:{incomparavel:T('Proposta 1','Proposal 1'),comparavel:T('Proposta 2','Proposal 2')},
 'ataque-apatita':{polido:T('Grão polido','Polished grain'),atacado:T('Depois do ataque','After etching')},
 'contagem-grao':{g1:T('Grão 1','Grain 1'),g2:T('Grão 2','Grain 2'),g3:T('Grão 3','Grain 3')},
 conjunto:{montagem:T('Montagem','Package'),irradiacao:T('No reator','In the reactor')},
 mica:{latente:T('Mica sem ataque','Mica not etched'),atacada:T('Mica atacada (HF)','Etched mica (HF)')},
 tabela:{'grao-a-grao':T('Tabela grão a grão','Grain-by-grain table')},
 zeta:{padrao:T('Padrão de idade conhecida','Known-age standard')},
 idade:{homogeneo:T('Conjunto 1','Set 1'),sobredisperso:T('Conjunto 2','Set 2'),amostra:T('Seus grãos','Your grains')},
 'annealing-medidas':{'1h':T('1 h','1 h'),'10h':T('10 h','10 h'),'100h':T('100 h','100 h'),'1000h':T('1000 h','1000 h')},
 'zeta-verifica':{'padrao-b':T('Segundo padrão','Second standard')},
 'annealing-lab':{'1h':T('1 h','1 h'),'10h':T('10 h','10 h'),'100h':T('100 h','100 h'),'1000h':T('1000 h','1000 h')},
 comprimentos:{longos:T('Distribuição 1','Distribution 1'),curtos:T('Distribuição 2','Distribution 2'),amostra:T('Sua amostra','Your sample')},
};
// Gerador pseudoaleatório determinístico (os mesmos traços aparecem sempre para o mesmo grão).
const semente=(n)=>{let s=(n*2654435761)>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};};
const tracos=(n,cor,largura,sem,x0=20,y0=20,w=200,h=150)=>{const r=semente(sem);return Array.from({length:n},()=>{const x=x0+r()*w,y=y0+r()*h,a=r()*Math.PI,l=9+r()*5;return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x+Math.cos(a)*l).toFixed(1)}" y2="${(y+Math.sin(a)*l).toFixed(1)}" stroke="${cor}" stroke-width="${largura}" stroke-linecap="round"/>`;}).join('');};
const el=(tag,cls,texto)=>{const e=document.createElement(tag);e.className=cls||'';if(texto!==undefined)e.textContent=texto;return e;};
const svg=(label,corpo)=>`<svg viewBox="0 0 360 230" class="inv-svg" role="img" aria-label="${label}">${corpo}</svg>`;
const text=(x,y,s,c='#e8f1e9',size=13)=>`<text x="${x}" y="${y}" fill="${c}" font-size="${size}" text-anchor="middle">${s}</text>`;

function desenhar(obs,lang,alvo){
 const pt=lang==='pt',{modelo,estado,dados}=obs;
 alvo.replaceChildren();
 if(modelo==='aquisicao'){
  const ativa=dados.aquisicaoAtiva;
  const desenho=svg(pt?'Fonte emissora e gama-câmara; aquisição '+(ativa?'ativa':'pausada'):'Emitting source and gamma camera; acquisition '+(ativa?'active':'paused'),
   '<rect x="30" y="25" width="110" height="145" rx="30" fill="#624d57" stroke="#dba691"/><circle cx="85" cy="90" r="19" fill="#eac85e"/>'+text(85,95,pt?'FONTE':'SOURCE','#17252c',11)+
   [0,1,2,3].map(i=>`<circle cx="${151+i*25}" cy="${73+(i%2)*24}" r="4" fill="#eac85e"/>`).join('')+
   `<rect x="269" y="42" width="55" height="94" rx="5" fill="${ativa?'#468c95':'#475463'}" stroke="#afd4d9"/>`+text(297,155,pt?'Detector':'Detector')+text(85,193,pt?'Emissão representada':'Represented emission')+text(278,193,ativa?(pt?'Novos dados':'New data'):(pt?'Sem novos dados':'No new data')));
  const d=el('div');d.innerHTML=desenho;alvo.append(d);

 }else if(modelo==='feixe'){
  const lig=dados.feixe;
  const d=el('div');d.innerHTML=svg(pt?'Acelerador de elétrons '+(lig?'ligado, com feixe':'desligado, sem feixe')+'; Geiger '+(lig?'acima do fundo':'perto do fundo'):'Electron accelerator '+(lig?'on, with beam':'off, no beam')+'; Geiger '+(lig?'above background':'near background'),
   '<rect x="25" y="30" width="100" height="70" rx="10" fill="#516a7a" stroke="#afd4d9"/><rect x="95" y="52" width="48" height="26" rx="4" fill="#3d5260" stroke="#afd4d9"/>'+
   (lig?'<polygon points="143,58 260,45 260,85 143,72" fill="#efca57" opacity=".55"/>':'')+
   '<rect x="230" y="110" width="90" height="26" rx="12" fill="#6e5c64" stroke="#dba691"/>'+text(75,66,pt?'Acelerador':'Accelerator','#e8f1e9',11)+text(275,152,pt?'Paciente (modelo)':'Patient (model)')+
   '<rect x="40" y="150" width="86" height="52" rx="6" fill="#182a36" stroke="#80cbd5"/>'+text(83,172,'Geiger','#e8f1e9',11)+text(83,192,lig?(pt?'acima do fundo':'above background'):(pt?'perto do fundo':'near background'),lig?'#efca57':'#9be3b9',11));
  alvo.append(d);
 }else if(modelo==='objeto'){
  const pe=dados.perto;
  const d=el('div');d.innerHTML=svg(pt?'Geiger '+(pe?'junto ao objeto: um pouco acima do fundo':'longe do objeto: perto do fundo'):'Geiger '+(pe?'next to the object: a little above background':'far from the object: near background'),
   '<rect x="215" y="70" width="70" height="52" rx="6" fill="#7b6a58" stroke="#d9c7ae"/>'+text(250,142,pt?'Objeto do chamado':'Call object')+
   '<rect x="'+(pe?140:30)+'" y="82" width="52" height="30" rx="6" fill="#182a36" stroke="#80cbd5"/>'+text(pe?166:56,102,'Geiger','#e8f1e9',11)+
   '<rect x="40" y="170" width="250" height="14" rx="4" fill="#26414d" stroke="#80cbd5"/><rect x="40" y="170" width="'+(pe?96:58)+'" height="14" rx="4" fill="'+(pe?'#efca57':'#9be3b9')+'"/>'+text(165,206,pe?(pt?'um pouco acima do fundo':'a little above background'):(pt?'perto do fundo':'near background'),'#e8f1e9',11));
  alvo.append(d);
 }else if(modelo==='distribuicao'){
  // 24 eventos nos dois modelos. Posição muda; o total não muda.
  const pontos=Array.from({length:24},(_,i)=>{const x=estado==='A'?(i<8?175+(i%3-1)*4:(i%2?190:160)):[165,185][i%2]+(i%3-1)*4,y=estado==='A'?(i<8?54+Math.floor(i/3)*14:112+Math.floor((i-8)/2)*10):89+Math.floor(i/4)*7;return `<circle cx="${x}" cy="${y}" r="3.5" fill="#efca57"/>`;}).join('');
  const d=el('div');d.innerHTML=svg(pt?'Distribuição fictícia '+estado+', 24 eventos':'Fictional distribution '+estado+', 24 events','<circle cx="175" cy="25" r="17" fill="#637480"/><path d="M145 47 L205 47 L220 134 L198 134 L195 205 L179 205 L175 138 L171 205 L155 205 L152 134 L130 134 Z" fill="#384f60" stroke="#91bdc6"/>'+pontos+text(290,70,'24 '+(pt?'eventos':'events'))+text(290,95,pt?'mesmo total':'same total'));
  alvo.append(d);
 }else if(modelo==='tracos'){
  const linhas=Array.from({length:dados.contagem},(_,j)=>{const i=estado==='aquecido'?[0,3,5,10][j]:j,x=53+(i%4)*65,y=53+Math.floor(i/4)*55;return `<line x1="${x}" y1="${y}" x2="${x+42*dados.comprimentoRelativo}" y2="${y+22*dados.comprimentoRelativo}" stroke="#153f50" stroke-width="3"/>`;}).join('');
  const d=el('div');d.innerHTML=svg(pt?'Modelo qualitativo: '+dados.contagem+' marcas; sem escala de idade':'Qualitative model: '+dados.contagem+' marks; no age scale','<rect x="24" y="18" width="308" height="183" rx="8" fill="#c4dcd0" stroke="#628f97"/>'+linhas+text(180,223,pt?'Modelo sem calibração de tempo/temperatura':'Model without time/temperature calibration'));
  alvo.append(d);
 }else if(modelo==='serie-radon'){
  const resumo=el('p','inv-dado-destaque',(pt?'Médias no intervalo: A = ':'Window averages: A = ')+dados.mediaA.toLocaleString(lang==='pt'?'pt-BR':'en-US',{maximumFractionDigits:1})+' · B = '+dados.mediaB.toLocaleString(lang==='pt'?'pt-BR':'en-US',{maximumFractionDigits:1})+' Bq/m³');alvo.append(resumo);
  const table=el('table','inv-tabela');const caption=el('caption','',pt?'Modelo didático · períodos iguais de 30 dias':'Teaching model · equal 30-day periods');table.append(caption);
  const thead=el('thead'),hr=el('tr');for(const s of [pt?'Período':'Period','A (Bq/m³)','B (Bq/m³)']){const th=el('th','',s);th.scope='col';hr.append(th);}thead.append(hr);table.append(thead);
  const body=el('tbody');dados.a.forEach((v,i)=>{const row=el('tr');row.append(el('th','',String(i+1)),el('td','',String(v)),el('td','',String(dados.b[i])));row.firstChild.scope='row';body.append(row);});table.append(body);alvo.append(table);
  alvo.append(el('p','inv-legenda',pt?`${dados.diasTotais} dias representados. A média usa períodos de igual duração; não é dose nem diagnóstico.`:`${dados.diasTotais} represented days. The average uses equal-duration periods; it is neither dose nor diagnosis.`));

 }else if(modelo==='sala-radon'||modelo==='ambiente-radon'){
  const X0=36,X1=348,Y0=190,Y1=36,YMAX=Math.max(320,Math.ceil(Math.max(...dados.C,...(dados.Cfechada||[0]))*1.1/50)*50),x=(t)=>X0+(X1-X0)*t/168,y=(c)=>Y0-(Y0-Y1)*Math.min(c,YMAX)/YMAX;
  const dias=pt?['S','T','Q','Q','S','S','D']:['M','T','W','T','F','S','S'];
  const aula=[0,1,2,3,4].map(d=>`<rect x="${x(d*24+8).toFixed(1)}" y="${Y1}" width="${(x(9)-x(0)).toFixed(1)}" height="${Y0-Y1}" fill="#468c95" fill-opacity=".22"/>`).join('');
  const eixoDias=dias.map((n,i)=>text(x(i*24+12).toFixed(1),206,n,'#e8f1e9',11)).join('');
  const ref=(v,cor,rot)=>`<line x1="${X0}" y1="${y(v).toFixed(1)}" x2="${X1}" y2="${y(v).toFixed(1)}" stroke="${cor}" stroke-dasharray="5 4" stroke-width="1.4"/><text x="${X0+4}" y="${(y(v)+(v<200?12:-3)).toFixed(1)}" fill="${cor}" font-size="10" text-anchor="start">${rot}</text>`;
  const pts=dados.tH.map((t,i)=>`${i?'L':'M'}${x(t).toFixed(1)} ${y(dados.C[i]).toFixed(1)}`).join('');
  const css='<style>.rn-linha{stroke-dasharray:1;stroke-dashoffset:1;animation:rn-tracar 1.8s ease-out forwards}@keyframes rn-tracar{to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){.rn-linha{animation:none;stroke-dashoffset:0}}</style>';
  const d=el('div');
  d.innerHTML=svg(pt?`Concentração de radônio simulada em uma semana: média ${Math.round(dados.media)} Bq/m³, média nas horas de aula ${Math.round(dados.mediaOcupado)} Bq/m³`:`Simulated radon concentration over one week: mean ${Math.round(dados.media)} Bq/m³, class-hours mean ${Math.round(dados.mediaOcupado)} Bq/m³`,
   css+`<line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" stroke="#91bdc6"/><line x1="${X0}" y1="${Y1}" x2="${X0}" y2="${Y0}" stroke="#91bdc6"/>`+aula+
   ref(100,'#efca57',pt?'100 · referência OMS':'100 · WHO reference')+ref(300,'#e0795c',pt?'300 · máximo OMS':'300 · WHO maximum')+
   (dados.Cfechada?`<path d="${dados.tH.map((t,i)=>`${i?'L':'M'}${x(t).toFixed(1)} ${y(dados.Cfechada[i]).toFixed(1)}`).join('')}" fill="none" stroke="#e8f1e9" stroke-width="1.6" stroke-dasharray="2 3"/>`:'')+`<path class="rn-linha" pathLength="1" d="${pts}" fill="none" stroke="#63d8ba" stroke-width="2.4" stroke-linejoin="round"/>`+eixoDias+
   text(X0-4,Y0+4,'0','#e8f1e9',10).replace('text-anchor="middle"','text-anchor="end"')+text(180,14,pt?'Bq/m³ ao longo da semana · faixas azuis = horas de aula':'Bq/m³ over the week · blue bands = class hours','#e8f1e9',11)+text(180,224,pt?'Modelo didático · valores de jogo (hipóteses)':'Teaching model · game values (hypotheses)','#c8d7d0',10));
  alvo.append(d);
  const nf=(v,n=0)=>v.toLocaleString(pt?'pt-BR':'en-US',{maximumFractionDigits:n,minimumFractionDigits:n});
  const leit=el('dl','inv-leituras');
  const itens=modelo==='ambiente-radon'?[[pt?'Fechado (média)':'Closed (mean)',nf(dados.mediaFechada)+' Bq/m³'],[pt?'Vinda do solo':'From the ground',nf(dados.fracaoSolo*100)+'%'],[pt?'Com ventilação · aulas':'Ventilated · class',nf(dados.mediaOcupado)+' Bq/m³'],[pt?'Aulas ÷ semana':'Class ÷ week',nf(dados.fator,2)]]:[[pt?'Troca de ar na aula':'Air change in class',nf(dados.trocaAr,2)+' h⁻¹'],[pt?'Média da semana':'Weekly mean',nf(dados.media)+' Bq/m³'],[pt?'Média nas aulas':'Class-hours mean',nf(dados.mediaOcupado)+' Bq/m³'],[pt?'Aulas ÷ semana':'Class ÷ week',nf(dados.fator,2)]];
  for(const [r,v] of itens){const q=el('div','inv-leitura');q.append(el('dt','',r),el('dd','',v));leit.append(q);}
  alvo.append(leit);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='ataque-apatita'){
  const d=el('div');d.innerHTML=svg(pt?'Grão de apatita '+(estado==='atacado'?'após o ataque, com traços visíveis':'polido, sem traços visíveis'):'Apatite grain '+(estado==='atacado'?'after etching, tracks visible':'polished, no visible tracks'),
   '<rect x="20" y="20" width="220" height="170" rx="10" fill="#d4ddd3" stroke="#6f8f8a" stroke-width="3"/>'+(estado==='atacado'?tracos(14,'#1d3f4e',2.4,7,32,32,196,146):'<line x1="40" y1="40" x2="220" y2="170" stroke="#c0cbc0" stroke-width="1"/>')+text(300,80,pt?'Grão':'Grain','#e8f1e9',12)+text(300,100,estado==='atacado'?(pt?'Traços ≈ 1 µm':'Tracks ≈ 1 µm'):(pt?'Dano latente':'Latent damage'),'#e8f1e9',12));alvo.append(d);
 }else if(modelo==='contagem-grao'){
  const k=dados.grao;const d=el('div');d.innerHTML=svg(pt?'Grão '+k+' com '+dados.Ns+' traços espontâneos':'Grain '+k+' with '+dados.Ns+' spontaneous tracks',
   '<rect x="20" y="20" width="220" height="170" rx="10" fill="#d4ddd3" stroke="#6f8f8a" stroke-width="3"/>'+tracos(dados.Ns,'#1d3f4e',2.4,k*31,32,32,196,146)+text(300,80,'Ns = '+dados.Ns,'#ffd45a',16)+text(300,104,pt?'área fictícia':'fictional area','#e8f1e9',11)+text(300,122,'A = 4,0×10⁻⁵ cm²'.replace(',',pt?',':'.'),'#e8f1e9',11));alvo.append(d);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='conjunto'){
  const irr=estado==='irradiacao',d=el('div');
  d.innerHTML=svg(pt?'Conjunto de apatita, mica e dosímetro '+(irr?'sob nêutrons térmicos':'montado'):'Apatite, mica and dosimeter package '+(irr?'under thermal neutrons':'assembled'),
   '<rect x="40" y="150" width="190" height="26" rx="4" fill="#8a7a64" stroke="#e7dfb8"/>'+text(135,168,pt?'Apatita em resina':'Apatite in resin','#17252c',11)+
   '<rect x="40" y="124" width="190" height="22" rx="4" fill="#c9d7e0" fill-opacity=".85" stroke="#aac3d0"/>'+text(135,139,pt?'Mica (detector externo)':'Mica (external detector)','#17252c',11)+
   '<rect x="250" y="150" width="70" height="26" rx="4" fill="#9a8760" stroke="#e7dfb8"/>'+text(285,168,pt?'Vidro dosímetro':'Dosimeter glass','#17252c',10)+
   (irr?[70,110,150,190].map(x=>`<line x1="${x}" y1="30" x2="${x}" y2="112" stroke="#63d8ba" stroke-width="3" stroke-dasharray="6 5"/><polygon points="${x-6},108 ${x+6},108 ${x},120" fill="#63d8ba"/>`).join('')+text(135,22,pt?'Nêutrons térmicos':'Thermal neutrons','#63d8ba',13)+tracos(5,'#ffd45a',2,3,60,126,160,16):text(135,40,pt?'Antes do reator':'Before the reactor','#e8f1e9',13)));alvo.append(d);
 }else if(modelo==='mica'){
  const vis=dados.tracosVisiveis,d=el('div');d.innerHTML=svg(pt?'Mica '+(vis?'atacada com '+dados.Ni+' traços induzidos':'sem ataque'):'Mica '+(vis?'etched with '+dados.Ni+' induced tracks':'not etched'),
   '<rect x="20" y="20" width="220" height="170" rx="10" fill="#cfdde6" fill-opacity=".9" stroke="#8aa5b2" stroke-width="3"/>'+(vis?tracos(dados.Ni,'#2a4d63',1.8,11,30,30,200,150):'')+text(300,80,vis?'Ni = '+dados.Ni:(pt?'Latente':'Latent'),'#ffd45a',16)+text(300,104,pt?'mesma área do grão':'same grain area','#e8f1e9',11));alvo.append(d);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='tabela'){
  const table=el('table','inv-tabela');table.append(el('caption','',pt?`Dados fictícios · ${dados.graos.length} grãos`:`Fictional data · ${dados.graos.length} grains`));
  const hr=el('tr');for(const s of ['#','Ns','Ni','Ns/Ni',pt?'Idade (Ma)':'Age (Ma)']){const th=el('th','',s);th.scope='col';hr.append(th);}const thead=el('thead');thead.append(hr);table.append(thead);
  const body=el('tbody'),f=(v,n=1)=>v.toLocaleString(pt?'pt-BR':'en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
  dados.graos.forEach((g,i)=>{const row=el('tr');row.append(el('th','',String(i+1)),el('td','',String(g.Ns)),el('td','',String(g.Ni)),el('td','',f(g.razao,2)),el('td','',f(g.idadeMa)+' ± '+f(g.erroMa)));row.firstChild.scope='row';body.append(row);});table.append(body);alvo.append(table);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='zeta'){
  const f=(v,n=1)=>v.toLocaleString(pt?'pt-BR':'en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
  alvo.append(el('p','inv-dado-destaque','ζ = [exp(λD·t) − 1] / (λD·g·ρd·ρs/ρi) = '+f(dados.zeta)+(pt?' ano·cm²':' yr·cm²')));alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='idade'){
  const f=(v,n=1)=>v.toLocaleString(pt?'pt-BR':'en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
  alvo.append(el('p','inv-dado-destaque','t = (1/λD) · ln[1 + λD · g · ζ · ρd · (ρs/ρi)]'));
  const table=el('table','inv-tabela');table.append(el('caption','',pt?'Dados fictícios':'Fictional data'));
  const linhas=[[pt?'Grãos':'Grains',dados.n],['ΣNs / ΣNi',dados.sNs+' / '+dados.sNi],['χ² (g.l.)',f(dados.chi2,2)+' ('+dados.gl+')'],['P(χ²)',dados.p<1e-4?'< 0,01%'.replace(',',pt?',':'.'):f(dados.p*100,dados.p>0.9999?1:2)+'%'],[pt?'Idade pooled (Ma)':'Pooled age (Ma)',f(dados.pooledMa)+' ± '+f(dados.pooledErroMa)],[pt?'Idade central (Ma)':'Central age (Ma)',f(dados.centralMa)+' ± '+f(dados.centralErroMa)],[pt?'Dispersão':'Dispersion',f(dados.dispersao*100,0)+'%']];
  const body=el('tbody');for(const [a,b] of linhas){const row=el('tr');row.append(el('th','',a),el('td','',String(b)));row.firstChild.scope='row';body.append(row);}table.append(body);alvo.append(table);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='annealing-lab'){
  const k=dados.ordem,rel=[0.92,0.8,0.62,0.4],barras=rel.map((r,i)=>`<rect x="${40+i*75}" y="${190-r*140}" width="50" height="${r*140}" rx="4" fill="${i+1===k?'#ffd45a':'#5e8a8c'}" stroke="#e7dfb8"/>`+text(65+i*75,208,['1 h','10 h','100 h','1000 h'][i],'#e8f1e9',11)).join('');
  const d=el('div');d.innerHTML=svg(pt?'Esquema: o comprimento dos traços diminui com o tempo de aquecimento':'Schematic: track length decreases with heating time',barras+text(180,18,pt?'Comprimento dos traços (esquemático, sem escala)':'Track length (schematic, no scale)','#e8f1e9',12));alvo.append(d);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='annealing-medidas'){
  const k=dados.ordem,barras=dados.todos.map((r,i)=>`<rect x="${40+i*75}" y="${190-r*150}" width="50" height="${r*150}" rx="4" fill="${i+1===k?'#ffd45a':'#5e8a8c'}" stroke="#e7dfb8"/>`+text(65+i*75,208,['1 h','10 h','100 h','1000 h'][i],'#e8f1e9',11)+text(65+i*75,184-r*150,String(r.toFixed(2)).replace('.',pt?',':'.'),'#e8f1e9',11)).join('');
  const d=el('div');d.innerHTML=svg(pt?'Comprimento reduzido r = l/l0 por tempo de aquecimento (fictício)':'Reduced length r = l/l0 by heating time (fictional)',barras+text(180,16,pt?'r = l/l0 numa temperatura fixa · dados fictícios':'r = l/l0 at a fixed temperature · fictional data','#e8f1e9',12));alvo.append(d);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='zeta-verifica'){
  const f=(v,n=1)=>v.toLocaleString(pt?'pt-BR':'en-US',{minimumFractionDigits:n,maximumFractionDigits:n});
  const table=el('table','inv-tabela');table.append(el('caption','',pt?'Dados fictícios · segundo padrão':'Fictional data · second standard'));
  const linhas=[[pt?'Idade conhecida (Ma)':'Known age (Ma)',f(dados.tMa,0)],['ΣNs / ΣNi',dados.Ns+' / '+dados.Ni],['ζ ('+(pt?'ano·cm²':'yr·cm²')+')',f(dados.zeta)],[pt?'Idade calculada (Ma)':'Calculated age (Ma)',f(dados.idadeMa)+' ± '+f(dados.erroMa)],[pt?'Diferença':'Difference',f(Math.abs(dados.dif))+'σ']];
  const body=el('tbody');for(const [a,b] of linhas){const row=el('tr');row.append(el('th','',a),el('td','',String(b)));row.firstChild.scope='row';body.append(row);}table.append(body);alvo.append(table);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else if(modelo==='comprimentos'){
  const h=dados.hist,max=Math.max(...h.map(x=>x[1]))||1,barras=h.map(([x,v],i)=>`<rect x="${30+i*30}" y="${180-v/max*130}" width="26" height="${v/max*130}" fill="#5e8a8c" stroke="#e7dfb8"/>`+text(43+i*30,196,String(x),'#e8f1e9',10)).join('');
  const d=el('div');d.innerHTML=svg(pt?'Histograma de comprimentos de traço confinado':'Confined track length histogram',barras+text(180,18,pt?'Comprimento (µm) · dados fictícios':'Length (µm) · fictional data','#e8f1e9',12));alvo.append(d);
  alvo.append(el('p','inv-legenda',obs.texto[lang]));
 }else{
  const cartao=el('div','inv-cartao-dado');
  const icon=el('div','inv-amostra-icon');icon.setAttribute('aria-hidden','true');
  if(modelo==='amostras'){
   // Formas de cristais desenhadas no mesmo espírito dos objetos do mapa, sem fotografias externas.
   icon.innerHTML=svg('',estado==='carvao'?'<path d="M80 100 L125 60 L245 77 L280 130 L224 163 L111 151 Z" fill="#34333c" stroke="#9e8d83" stroke-width="4"/>':`<path d="M170 24 L231 68 L231 160 L170 207 L109 160 L109 68 Z" fill="${estado==='zircao'?'#d1a86b':'#8cb7a0'}" stroke="#e7dfb8" stroke-width="3"/><path d="M170 24 L170 207 M109 68 L231 68 M109 160 L231 160" fill="none" stroke="#547580" stroke-width="2"/>`);cartao.append(icon);
  }
  cartao.append(el('p','',obs.texto[lang]));alvo.append(cartao);
 }
 if(['aquisicao','distribuicao','tracos','feixe','objeto'].includes(modelo))alvo.append(el('p','inv-legenda',obs.texto[lang]));
}

/** Renderiza controles sobre o painel existente. Só o botão Registrar guarda uma observação. */
export function criarAtividade(c,lang,sessao,registrar,aoCompletar){
 const config=c.atividade,estados=config.estados;
 let estado=sessao.estadosModelos?.[c.id];if(!estados.includes(estado))estado=estados[0];
 const caixa=el('section','inv-atividade'),controles=el('div','inv-modelo-controles'),visor=el('div','inv-modelo-visor');
 caixa.dataset.modelo=config.tipo;
 const titulo=el('h3','',lang==='pt'?'Explore e registre':'Explore and record');titulo.id='modelo-'+c.id;caixa.setAttribute('aria-labelledby',titulo.id);
 const botoes=[];
 const atualizar=()=>{botoes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.estado===estado)));desenhar(observarAtividade(config.tipo,estado,config.dados),lang,visor);};
 for(const v of estados){const b=el('button','inv-botao',ROTULOS[config.tipo]?.[v]?.[lang]||v);b.type='button';b.dataset.estado=v;b.addEventListener('click',()=>{estado=v;sessao.estadosModelos||={};sessao.estadosModelos[c.id]=v;atualizar();});botoes.push(b);controles.append(b);}
 const botao=el('button','inv-botao',lang==='pt'?'Registrar observação':'Record observation');botao.type='button';botao.id='inv-registrar-observacao';
 const lista=el('ul','inv-resumo');lista.id='inv-observacoes';lista.setAttribute('aria-live','polite');
 const listaAtual=()=>{lista.replaceChildren();for(const o of sessao.observacoesCampo.filter(o=>o.cena===c.id))lista.append(el('li','',o.texto[lang]));};
 botao.addEventListener('click',()=>{registrar(c.id,observarAtividade(config.tipo,estado,config.dados));listaAtual();aoCompletar();});
 caixa.append(titulo,controles,visor,botao,lista);atualizar();listaAtual();return caixa;
}
