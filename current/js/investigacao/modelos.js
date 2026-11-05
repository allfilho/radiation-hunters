import {campanha12,AMBIENTES,agenda,simular,resumo,entradas,trocaDeAr,constanteDeTempo,PARAMETROS} from '../fisica/radonio.js';
// Modelos didáticos: dados sintéticos identificados. Não são instrumentos, laudos ou simuladores clínicos.
// Campanha de 12 períodos de 30 dias, gerada pelo modelo físico (js/fisica/radonio.js), mesma sala de aula do térreo nas duas salas:
//   Sala A: janelas (2) e porta abertas na aula e uma janela deixada aberta o tempo todo na época quente; tudo fechado no frio (períodos 4 a 8).
//   Sala B: ventilação mecânica programada o ano todo (1 h antes até 1 h depois da aula, seg a sex).
// No frio o modelo multiplica a entrada do solo por FATOR_SOLO_FRIO (valor de jogo). Valores inteiros, como em um relatório de dispositivo passivo.
const FRIO=(p)=>p>=3&&p<=7;
export const RADON_A=Object.freeze(campanha12(AMBIENTES['sala-terreo'],(p)=>FRIO(p)?{}:{janelasNaAula:2,portaNaAula:1,janelasFora:1}).map(Math.round));
export const RADON_B=Object.freeze(campanha12(AMBIENTES['sala-terreo'],()=>({mecanica:'programada'})).map(Math.round));
export function media(valores){if(!valores.length||valores.some(v=>!Number.isFinite(v)))return null;return valores.reduce((s,v)=>s+v,0)/valores.length;}
export function modeloAquisicao(ativa){return {fonteEmite:true,aquisicaoAtiva:ativa,novosDados:ativa,leitura:ativa?'sinal-modelado':null};}
export function compararRadon(longo){const a=longo?[...RADON_A]:[RADON_A[0]],b=longo?[...RADON_B]:[RADON_B[0]];return {sintetico:true,periodos:a.length,diasPorPeriodo:30,diasTotais:a.length*30,unidade:'Bq/m³',a,b,mediaA:media(a),mediaB:media(b)};}
export function modeloTracos(aquecido){return {qualitativo:true,mesmaAmostra:true,mesmoConteudoU:true,contagem:aquecido?4:12,comprimentoRelativo:aquecido?.45:1,idadeCalculavel:false};}

import {DADOS_PADRAO,idadesDosGraos,resumoConjunto,zetaCalculado,resumoComprimentos,LAMBDA_D} from './dados-fissao.js';
const T=(pt,en)=>({pt,en});
const num=(v,d,l)=>v.toLocaleString(l==='pt'?'pt-BR':'en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const expo=(v,l)=>{const e=Math.floor(Math.log10(Math.abs(v))),m=v/10**e,sup=String(e).replace(/-/g,'⁻').replace(/\d/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[c]);return num(m,1,l)+'×10'+sup;};
const por=(f)=>T(f('pt'),f('en'));
const pc=(p,l)=>p<1e-4?'< '+num(0.01,2,l)+'%':p>0.999?'> '+num(99.9,1,l)+'%':'= '+num(p*100,2,l)+'%';
/** Observação do estado realmente aberto; não atribui acerto nem inventa uma resposta do jogador. */
export function observarAtividade(tipo,estado,ctx){
 // `ctx`: conjunto de dados fictícios do episódio (dados-fissao.js); sem ele vale o conjunto padrão.
 const D=ctx||DADOS_PADRAO,ZETA=D.zeta,RHOD=D.rhod,ND=D.nd,AREA_CONTAGEM_CM2=D.area,GRAOS=D.graos,GRAOS_SOBREDISPERSOS=D.sobredisperso,T_PADRAO_MA=D.padrao.tMa,RAZAO_PADRAO=D.padrao.razao,COMPRIMENTOS_LONGOS=D.comprimentos.longos,COMPRIMENTOS_CURTOS=D.comprimentos.curtos;
 let dados,texto;
 switch(tipo){
  case 'aquisicao':
   if(!['ativa','pausada'].includes(estado))throw Error('Estado de aquisição inválido');
   dados=modeloAquisicao(estado==='ativa');
   texto=estado==='ativa'?T('Aquisição ativa no modelo: a fonte emite e novos eventos são registrados.','Acquisition active in the model: the source emits and new events are recorded.'):T('Aquisição pausada no modelo: a fonte continua representada como emissora; não há novos dados registrados. Isso não é uma medida de emissão zero.','Acquisition paused in the model: the source is still represented as emitting; no new data are recorded. This is not a zero-emission measurement.');break;
  case 'feixe':
   if(!['ligado','desligado'].includes(estado))throw Error('Estado do feixe inválido');
   // Modelo didático (v3.21): o acelerador de elétrons só produz o feixe ligado e em tratamento; desligado, o Geiger fica perto do fundo [H].
   dados={sintetico:true,feixe:estado==='ligado',leitura:estado==='ligado'?'acima-do-fundo-durante-o-feixe':'proxima-do-fundo',fonteArmazenada:false};
   texto=estado==='ligado'?T('Acelerador ligado, em tratamento (no modelo): há feixe e o Geiger, fora da sala blindada, só mediria o que atravessa a parede. A dose do paciente depende da energia e do tempo do feixe.','Accelerator on, treating (in the model): there is a beam, and a Geiger outside the shielded room would only measure what crosses the wall. The patient dose depends on the beam energy and time.'):T('Acelerador desligado (no modelo): não há feixe e o Geiger marca perto do fundo. Não existe material radioativo guardado emitindo o tempo todo.','Accelerator off (in the model): there is no beam and the Geiger reads close to background. There is no stored radioactive material emitting all the time.');break;
  case 'objeto':
   if(!['longe','perto'].includes(estado))throw Error('Estado da medida do objeto inválido');
   // Modelo didático (v3.21): chamados sem fonte perdida. Junto ao objeto o Geiger sobe pouco acima do fundo; a alguns metros volta ao fundo [H].
   dados={sintetico:true,perto:estado==='perto',leitura:estado==='perto'?'um-pouco-acima-do-fundo':'proxima-do-fundo',fonteLocalizada:false};
   texto=estado==='perto'?T('Geiger junto ao objeto (no modelo): a leitura sobe um pouco acima do fundo. Isso mostra que há alguma radiação saindo dele, mas pouca; não mostra perigo por si só.','Geiger next to the object (in the model): the reading rises a little above background. This shows some radiation comes from it, but only a little; it does not show danger by itself.'):T('Geiger a alguns metros do objeto (no modelo): a leitura fica perto do fundo. A radiação diminui rápido com a distância.','Geiger a few metres from the object (in the model): the reading stays close to background. Radiation drops quickly with distance.');break;
  case 'distribuicao':
   if(!['A','B'].includes(estado))throw Error('Distribuição inválida');
   dados={sintetico:true,composto:estado,radionuclideo:'mesmo-nos-dois-modelos',eventosTotais:24,regiaoPredominante:estado==='A'?'esqueleto-representado':'regiao-abdominal-representada'};
   texto=estado==='A'?T('Composto A: 24 eventos fictícios, predominantes no esqueleto representado.','Compound A: 24 fictional events, predominantly in the represented skeleton.'):T('Composto B: 24 eventos fictícios, predominantes na região abdominal representada. Mesmo total e radionuclídeo; distribuição diferente.','Compound B: 24 fictional events, predominantly in the represented abdominal region. Same total and radionuclide; different distribution.');break;
  case 'amostras':{
   const amostras={
    carvao:{material:'carvao',metodo:'C-14',pt:'Carvão: material de origem biológica; C-14 (carbono-14) pode investigar o tempo ligado ao fim das trocas de carbono. Contexto, contaminação e calibração precisam ser considerados.',en:'Charcoal: biologically derived material; C-14 (carbon-14) can investigate time related to the end of carbon exchange. Context, contamination and calibration must be considered.'},
    zircao:{material:'zircao',metodo:'U-Pb',pt:'Zircão: mineral para investigar eventos com U-Pb (urânio–chumbo), mediante dados isotópicos e avaliação do contexto e do sistema mineral. A presença de urânio não fornece uma idade.',en:'Zircon: a mineral for investigating events with U-Pb (uranium–lead), with isotopic data and evaluation of context and mineral system. Uranium presence does not provide an age.'},
    apatita:{material:'apatita',metodo:'tracos-de-fissao',pt:'Apatita: o registro de traços de fissão e seus comprimentos pode contribuir para investigar a história térmica. O registro depende da acumulação e da preservação.',en:'Apatite: fission tracks and their lengths can contribute to investigating thermal history. The record depends on accumulation and preservation.'},
   };
   const a=amostras[estado];if(!a)throw Error('Amostra inválida');dados={material:a.material,metodo:a.metodo,idadeCalculada:null};texto=T(a.pt,a.en);break;
  }
  case 'dados-upb':
   if(!['incompleta','contextualizada'].includes(estado))throw Error('Ficha U-Pb inválida');
   dados={sintetico:true,temU:true,razoesIsotopicas:estado==='contextualizada',contextoMineral:estado==='contextualizada',idadeCalculada:null};
   texto=estado==='incompleta'?T('Ficha 1: urânio detectado; sem razões isotópicas de U e Pb nem contexto para atribuir uma idade.','Card 1: uranium detected; no U and Pb isotope ratios or context for assigning an age.'):T('Ficha 2: prevê razões isotópicas U-Pb, avaliação de chumbo que não veio do decaimento analisado, alterações do sistema e contexto mineral. Não há resultado numérico de idade nesta ficha.','Card 2: calls for U-Pb isotope ratios, evaluation of lead not produced by the analyzed decay, system changes and mineral context. This card has no numerical age result.');break;
  case 'tracos':
   if(!['preservado','aquecido'].includes(estado))throw Error('Estado dos traços inválido');
   dados=modeloTracos(estado==='aquecido');
   texto=estado==='preservado'?T('Modelo qualitativo da mesma amostra: 12 marcas longas representadas antes da modificação térmica. Não há idade calculada.','Qualitative model of the same sample: 12 long marks represented before thermal modification. No age is calculated.'):T('Após o aquecimento representado: 4 marcas mais curtas permanecem visíveis. O urânio da amostra foi mantido no modelo; o registro foi modificado. Sem calibração de tempo ou temperatura.','After represented heating: 4 shorter marks remain visible. Sample uranium was held constant in the model; the record was modified. No time or temperature calibration.');break;
  case 'serie-radon':
   if(!['curto','longo'].includes(estado))throw Error('Janela de radônio inválida');
   dados=compararRadon(estado==='longo');
   texto=estado==='curto'?por(l=>l==='pt'?`Primeiro período de 30 dias (modelo didático): A = ${num(dados.mediaA,0,l)} e B = ${num(dados.mediaB,0,l)} Bq/m³; A tem a menor média nessa janela.`:`First 30-day period (teaching model): A = ${num(dados.mediaA,0,l)} and B = ${num(dados.mediaB,0,l)} Bq/m³; A has the lower average in this window.`)
    :por(l=>l==='pt'?`Doze períodos iguais, 360 dias (modelo didático): média A = ${num(dados.mediaA,1,l)} e B = ${num(dados.mediaB,1,l)} Bq/m³. A ordem se inverte em relação ao primeiro período.`:`Twelve equal periods, 360 days (teaching model): average A = ${num(dados.mediaA,1,l)} and B = ${num(dados.mediaB,1,l)} Bq/m³. The ranking reverses relative to the first period.`);break;
  case 'sala-radon':{
   const CEN={fechada:{janelasNaAula:0,portaNaAula:0,mecanica:'nenhuma'},janelas:{janelasNaAula:2,portaNaAula:1,mecanica:'nenhuma'},mecanica:{janelasNaAula:0,portaNaAula:0,mecanica:'programada'}};
   if(!CEN[estado])throw Error('Cenário de sala inválido');
   const sala=AMBIENTES['sala-terreo'],serie14=simular(sala,agenda(CEN[estado]),{dias:14,dtH:0.5}),k0=serie14.tH.findIndex(t=>t>168),serie={tH:serie14.tH.slice(k0).map(t=>t-168),C:serie14.C.slice(k0),ocupado:serie14.ocupado.slice(k0)},r=resumo(serie),e=entradas(sala);
   const lv=trocaDeAr(sala,{janelas:CEN[estado].janelasNaAula,portas:CEN[estado].portaNaAula,mecanica:estado==='mecanica'});
   dados={sintetico:true,hipotese:true,estado,sala:sala.id,cenario:CEN[estado],tH:serie.tH,C:serie.C,ocupado:serie.ocupado,media:r.media,mediaOcupado:r.mediaOcupado,fator:r.fator,maximo:r.maximo,horaDoPico:r.horaDoPico,trocaAr:lv,tauH:constanteDeTempo(lv),entradaSolo:e.solo,entradaMat:e.mat,limites:[PARAMETROS.limiteOmsBqM3,PARAMETROS.limiteMaximoBqM3]};
   const plano=r.maximo-Math.min(...serie.C)<2,dia=['segunda','terça','quarta','quinta','sexta','sábado','domingo'][Math.floor(r.horaDoPico/24)%7],day=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][Math.floor(r.horaDoPico/24)%7];
   const base={fechada:[T('Sala do térreo com janelas e portas fechadas o tempo todo','Ground-floor room with windows and doors closed all the time')],janelas:[T('Sala do térreo com 2 janelas e a porta abertas durante a aula','Ground-floor room with 2 windows and the door open during class')],mecanica:[T('Sala do térreo com ventilação mecânica ligada 1 h antes até 1 h depois da aula','Ground-floor room with mechanical ventilation from 1 h before to 1 h after class')]}[estado][0];
   texto=por(l=>{const m=(v)=>num(v,0,l),pico=plano?(l==='pt'?'praticamente constante o tempo todo':'practically constant all the time'):(l==='pt'?`máximo ${m(r.maximo)} Bq/m³, na ${dia}, ${m(r.horaDoPico%24)} h`:`maximum ${m(r.maximo)} Bq/m³, on ${day}, ${m(r.horaDoPico%24)} h`);
    return l==='pt'?`${base[l]}, uma semana simulada (modelo didático; valores de jogo, hipóteses de ensino): média da semana ${m(r.media)} Bq/m³; média nas horas de aula ${m(r.mediaOcupado)} Bq/m³ (${num(r.fator,2,l)} da média da semana); ${pico}. Não descreve uma escola real.`
     :`${base[l]}, one simulated week (teaching model; game values, teaching hypotheses): weekly mean ${m(r.media)} Bq/m³; mean during class hours ${m(r.mediaOcupado)} Bq/m³ (${num(r.fator,2,l)} of the weekly mean); ${pico}. It does not describe a real school.`;});
   break;
  }
  case 'ambiente-radon':{
   const MAPA={sala:'sala-terreo',deposito:'deposito-terreo',porao:'porao',andar1:'sala-andar1',sotao:'sotao'};
   if(!MAPA[estado])throw Error('Ambiente de radônio inválido');
   const amb=AMBIENTES[MAPA[estado]],ag=agenda({mecanica:'programada'}),ag0=agenda({}),corte=(sr)=>{const k0=sr.tH.findIndex(t=>t>168);return {tH:sr.tH.slice(k0).map(t=>t-168),C:sr.C.slice(k0),ocupado:sr.ocupado.slice(k0)};};
   const serie=corte(simular(amb,ag,{dias:14,dtH:0.5})),fech=corte(simular(amb,ag0,{dias:14,dtH:0.5})),r=resumo(serie),r0=resumo(fech),e=entradas(amb);
   const lv=trocaDeAr(amb,{mecanica:true}),fSolo=e.solo/e.total;
   dados={sintetico:true,hipotese:true,estado,ambiente:amb.id,andar:amb.andar,tH:serie.tH,C:serie.C,Cfechada:fech.C,ocupado:serie.ocupado,media:r.media,mediaOcupado:r.mediaOcupado,fator:r.fator,maximo:r0.maximo,mediaFechada:r0.media,trocaAr:lv,tauH:constanteDeTempo(lv),fracaoSolo:fSolo,entradaSolo:e.solo,entradaMat:e.mat,limites:[PARAMETROS.limiteOmsBqM3,PARAMETROS.limiteMaximoBqM3]};
   const nome={sala:T('Sala de aula do térreo','Ground-floor classroom'),deposito:T('Depósito do térreo, sem janelas','Ground-floor storeroom, no windows'),porao:T('Porão, sem janelas, com o piso encostado no solo','Basement, no windows, floor against the ground'),andar1:T('Sala de aula do 1º andar','First-floor classroom'),sotao:T('Sótão sob o telhado, longe do solo','Attic under the roof, far from the ground')}[estado];
   texto=por(l=>{const m=(v)=>num(v,0,l);return l==='pt'
    ?`${nome[l]} (modelo didático; valores de jogo, hipóteses de ensino): fechado o tempo todo, fica perto de ${m(r0.media)} Bq/m³, e cerca de ${m(fSolo*100)}% da entrada de radônio vem do solo e ${m(100-fSolo*100)}% dos materiais da construção. Com ventilação mecânica programada nos dias de aula, a média nas horas de aula cai para ${m(r.mediaOcupado)} Bq/m³ (${num(r.fator,2,l)} da média da semana, ${m(r.media)} Bq/m³); à noite e no fim de semana o ar volta a se acumular. Não descreve uma escola real.`
    :`${nome[l]} (teaching model; game values, teaching hypotheses): kept closed all the time, it sits near ${m(r0.media)} Bq/m³, and about ${m(fSolo*100)}% of the radon input comes from the ground and ${m(100-fSolo*100)}% from the building materials. With scheduled mechanical ventilation on school days, the mean during class hours falls to ${m(r.mediaOcupado)} Bq/m³ (${num(r.fator,2,l)} of the weekly mean, ${m(r.media)} Bq/m³); at night and on weekends the air builds up again. It does not describe a real school.`;});
   break;
  }
  case 'protocolo':
   if(!['incomparavel','comparavel'].includes(estado))throw Error('Protocolo inválido');
   dados={proposta:estado,sintetico:true};
   texto=estado==='incomparavel'?T('Proposta 1: métodos diferentes, períodos distintos e ausência de registro das condições: andar, tipo de ambiente (sala de aula, depósito, porão, sótão) e uso das janelas e da ventilação não são anotados. Os valores não sustentam a comparação pretendida.','Proposal 1: different methods, different periods and no record of conditions: floor, type of environment (classroom, storeroom, basement, attic) and use of windows and ventilation are not noted. The values do not support the intended comparison.'):T('Proposta 2: método adequado à medição de radônio, controle de qualidade, períodos comparáveis e condições documentadas: ambientes escolhidos por andar e tipo de uso, com a ventilação dentro e fora do horário de aula registrada. Os limites devem acompanhar os resultados.','Proposal 2: a suitable radon measurement method, quality control, comparable periods and documented conditions: environments chosen by floor and type of use, with ventilation recorded both during and outside class hours. Limits must accompany results.');break;

  case 'ataque-apatita':
   if(!['polido','atacado'].includes(estado))throw Error('Estado de ataque inválido');
   dados={qualitativo:true,tracosVisiveis:estado==='atacado'};
   texto=estado==='polido'?T('Grão de apatita polido, ainda sem ataque: os traços espontâneos existem como dano latente no cristal e não aparecem ao microscópio óptico.','Polished apatite grain, not yet etched: spontaneous tracks exist as latent damage in the crystal and are not visible under the optical microscope.'):T('Depois do ataque com HNO₃ diluído, o material danificado se dissolve mais depressa que a matriz e os traços alargam até cerca de 1 µm, ficando visíveis. Molaridade, temperatura e tempo variam por laboratório e devem ser reportados (por exemplo, 5 M, 20 s, 20 °C).','After etching with dilute HNO₃, the damaged material dissolves faster than the matrix and the tracks widen to about 1 µm and become visible. Molarity, temperature and time vary between laboratories and must be reported (for example, 5 M, 20 s, 20 °C).');break;
  case 'contagem-grao':{
   const k=['g1','g2','g3'].indexOf(estado);if(k<0)throw Error('Grão inválido');
   const [Ns]=GRAOS[k],rho=Ns/AREA_CONTAGEM_CM2;dados={sintetico:true,grao:k+1,Ns,areaCm2:AREA_CONTAGEM_CM2,rhoS:rho};
   texto=por(l=>`${l==='pt'?'Grão':'Grain'} ${k+1}: Ns = ${Ns} ${l==='pt'?'traços espontâneos contados em':'spontaneous tracks counted in'} ${expo(AREA_CONTAGEM_CM2,l)} cm² (${l==='pt'?'área fictícia':'fictional area'}). ρs = Ns/A = ${expo(rho,l)} ${l==='pt'?'traços/cm². Dados fictícios.':'tracks/cm². Fictional data.'}`);break;
  }
  case 'conjunto':
   if(!['montagem','irradiacao'].includes(estado))throw Error('Estado do conjunto inválido');
   dados={qualitativo:true,etapa:estado,razaoU235U238:'1/137,88'};
   texto=estado==='montagem'?T('Conjunto para o reator: grãos de apatita já atacados, mica muscovita (detector externo, com urânio desprezível) fixada sobre a superfície e vidro dosímetro de urânio conhecido, que monitora o fluxo de nêutrons (ρd).','Package for the reactor: etched apatite grains, a muscovite mica sheet (external detector, negligible uranium) fixed on the surface, and a dosimeter glass of known uranium that monitors the neutron flux (ρd).'):T('No reator de pesquisa, nêutrons térmicos induzem a fissão do ²³⁵U do grão e os fragmentos gravam traços induzidos na mica. Como ²³⁵U/²³⁸U = 1/137,88 é constante nas amostras terrestres comuns, o número de traços induzidos mede o urânio do grão.','In the research reactor, thermal neutrons induce fission of the grain’s ²³⁵U and the fragments record induced tracks in the mica. Because ²³⁵U/²³⁸U = 1/137.88 is constant in ordinary terrestrial samples, the number of induced tracks measures the grain’s uranium.');break;
  case 'mica':{
   if(!['latente','atacada'].includes(estado))throw Error('Estado da mica inválido');
   const [Ns,Ni]=GRAOS[0];dados={sintetico:true,tracosVisiveis:estado==='atacada',Ni,Ns,areaCm2:AREA_CONTAGEM_CM2,rhoI:Ni/AREA_CONTAGEM_CM2};
   texto=estado==='latente'?T('Mica irradiada, ainda sem ataque: os traços induzidos são latentes e não aparecem ao microscópio.','Irradiated mica, not yet etched: the induced tracks are latent and not visible under the microscope.'):por(l=>l==='pt'?`Depois do ataque com HF (ácido fluorídrico, em capela e com EPI próprio), os traços induzidos aparecem. No grão 1 contam-se Ni = ${Ni} na mesma área em que se contou Ns = ${Ns}: ρi = Ni/A = ${expo(Ni/AREA_CONTAGEM_CM2,l)} traços/cm² (dados fictícios).`:`After etching with HF (hydrofluoric acid, in a fume hood with specific PPE), the induced tracks appear. In grain 1, Ni = ${Ni} are counted in the same area where Ns = ${Ns} was counted: ρi = Ni/A = ${expo(Ni/AREA_CONTAGEM_CM2,l)} tracks/cm² (fictional data).`);break;
  }
  case 'tabela':{
   if(estado!=='grao-a-grao')throw Error('Estado da tabela inválido');
   const g=idadesDosGraos(D),kmin=g.reduce((m,x,i)=>x.Ns<g[m].Ns?i:m,0);dados={sintetico:true,graos:g,zeta:ZETA,rhoD:RHOD,Nd:ND,kmin};
   texto=por(l=>l==='pt'?`${g.length} grãos fictícios com Ns, Ni e idade de cada grão (± 1σ). ζ = ${num(ZETA,ZETA%1?1:0,l)} ano·cm² e ρd = ${expo(RHOD,l)} traços/cm² (ilustrativos). O grão ${kmin+1} (Ns = ${g[kmin].Ns}, Ni = ${g[kmin].Ni}) dá ${num(g[kmin].idadeMa,1,l)} ± ${num(g[kmin].erroMa,1,l)} Ma: poucos traços, incerteza relativa grande (erro de Poisson √N).`:`${g.length} fictional grains with Ns, Ni and each grain age (± 1σ). ζ = ${num(ZETA,ZETA%1?1:0,l)} yr·cm² and ρd = ${expo(RHOD,l)} tracks/cm² (illustrative). Grain ${kmin+1} (Ns = ${g[kmin].Ns}, Ni = ${g[kmin].Ni}) gives ${num(g[kmin].idadeMa,1,l)} ± ${num(g[kmin].erroMa,1,l)} Ma: few tracks, large relative uncertainty (Poisson error √N).`);break;
  }
  case 'zeta':{
   if(estado!=='padrao')throw Error('Estado de ζ inválido');
   const z=zetaCalculado(D);dados={sintetico:true,tPadraoMa:T_PADRAO_MA,razao:RAZAO_PADRAO,rhoD:RHOD,zeta:z};
   texto=por(l=>l==='pt'?`Padrão de idade conhecida: ${num(T_PADRAO_MA,1,l)} Ma (exemplo didático; num trabalho real usa-se um padrão publicado). Contagem fictícia ρs/ρi = ${num(RAZAO_PADRAO,4,l)} e ρd = ${expo(RHOD,l)}. ζ = [exp(λD·t) − 1] / (λD·g·ρd·ρs/ρi) = ${num(z,1,l)} ano·cm², com λD = 1,55125×10⁻¹⁰ ano⁻¹ e g = 0,5. Na prática, cada analista calibra o seu ζ com vários padrões e o reporta com a incerteza.`:`Standard of known age: ${num(T_PADRAO_MA,1,l)} Ma (didactic example; real work uses a published standard). Fictional count ρs/ρi = ${num(RAZAO_PADRAO,4,l)} and ρd = ${expo(RHOD,l)}. ζ = [exp(λD·t) − 1] / (λD·g·ρd·ρs/ρi) = ${num(z,1,l)} yr·cm², with λD = 1.55125×10⁻¹⁰ yr⁻¹ and g = 0.5. In practice each analyst calibrates their own ζ with several standards and reports it with its uncertainty.`);break;
  }
  case 'idade':{
   if(!['homogeneo','sobredisperso','amostra'].includes(estado))throw Error('Conjunto de grãos inválido');
   const r=resumoConjunto(estado==='sobredisperso'?GRAOS_SOBREDISPERSOS:GRAOS,D);dados={sintetico:true,estado,...r,idadeFT:true};
   texto=por(l=>{
    const base=l==='pt'?`${r.n} grãos fictícios: ΣNs = ${r.sNs}, ΣNi = ${r.sNi}; χ² = ${num(r.chi2,2,l)} com ${r.gl} g.l.; P(χ²) ${pc(r.p,l)}. `:`${r.n} fictional grains: ΣNs = ${r.sNs}, ΣNi = ${r.sNi}; χ² = ${num(r.chi2,2,l)} with ${r.gl} d.o.f.; P(χ²) ${pc(r.p,l)}. `;
    if(r.homogeneo)return base+(l==='pt'?`Consistente com uma única idade. Idade pooled = ${num(r.pooledMa,1,l)} ± ${num(r.pooledErroMa,1,l)} Ma; idade central = ${num(r.centralMa,1,l)} ± ${num(r.centralErroMa,1,l)} Ma (dispersão ≈ ${num(r.dispersao*100,0,l)}%). A idade pooled é adequada.`:`Consistent with a single age. Pooled age = ${num(r.pooledMa,1,l)} ± ${num(r.pooledErroMa,1,l)} Ma; central age = ${num(r.centralMa,1,l)} ± ${num(r.centralErroMa,1,l)} Ma (dispersion ≈ ${num(r.dispersao*100,0,l)}%). The pooled age is appropriate.`);
    return base+(l==='pt'?`Sobredispersão. Idade central = ${num(r.centralMa,1,l)} ± ${num(r.centralErroMa,1,l)} Ma, dispersão ≈ ${num(r.dispersao*100,0,l)}%. A idade pooled (${num(r.pooledMa,1,l)} ± ${num(r.pooledErroMa,1,l)} Ma) subestima a incerteza.`:`Overdispersion. Central age = ${num(r.centralMa,1,l)} ± ${num(r.centralErroMa,1,l)} Ma, dispersion ≈ ${num(r.dispersao*100,0,l)}%. The pooled age (${num(r.pooledMa,1,l)} ± ${num(r.pooledErroMa,1,l)} Ma) underestimates the uncertainty.`);
   });break;
  }
  case 'annealing-lab':{
   const k=['1h','10h','100h','1000h'].indexOf(estado);if(k<0)throw Error('Duração de aquecimento inválida');
   const horas=[1,10,100,1000][k];dados={qualitativo:true,horas,ordem:k+1,temperaturaConstanteNoModelo:true};
   texto=por(l=>l==='pt'?`Conjunto de annealing (esquemático): a mesma apatita é aquecida por ${horas} h numa temperatura constante do experimento. Quanto maior o tempo, mais os traços encurtam. Repetido em várias temperaturas, o conjunto fornece dados de laboratório para calibrar os modelos de annealing. Este modelo é qualitativo: sem valores calibrados de tempo e temperatura.`:`Annealing set (schematic): the same apatite is heated for ${horas} h at one constant experimental temperature. The longer the time, the more the tracks shorten. Repeated at several temperatures, the set provides laboratory data to calibrate annealing models. This model is qualitative: no calibrated time and temperature values.`);break;
  }
  case 'comprimentos':{
   if(estado==='amostra'){
    if(!D.comprimentos.amostra)throw Error('Este conjunto de dados não tem comprimentos da amostra');
    const r=resumoComprimentos(D.comprimentos.amostra);dados={sintetico:true,estado,n:r.n,mediaUm:r.media,sdUm:r.sd,hist:r.hist};
    texto=por(l=>l==='pt'?`Distribuição de comprimentos de traço confinado da sua amostra (n = ${r.n}; média ${num(r.media,1,l)} µm; DP ${num(r.sd,1,l)} µm; mín. ${num(r.min,1,l)}, máx. ${num(r.max,1,l)} µm; dados fictícios). Observe a forma do histograma: a média e o DP sozinhos não distinguem uma população única de duas. O comprimento de referência depende da convenção (traço espontâneo ou induzido).`:`Confined track length distribution of your sample (n = ${r.n}; mean ${num(r.media,1,l)} µm; SD ${num(r.sd,1,l)} µm; min ${num(r.min,1,l)}, max ${num(r.max,1,l)} µm; fictional data). Look at the shape of the histogram: the mean and SD alone do not distinguish one population from two. The reference length depends on the convention (spontaneous or induced track).`);break;
   }
   if(!['longos','curtos'].includes(estado))throw Error('Distribuição de comprimentos inválida');
   const r=resumoComprimentos(estado==='longos'?COMPRIMENTOS_LONGOS:COMPRIMENTOS_CURTOS);dados={sintetico:true,estado,n:r.n,mediaUm:r.media,sdUm:r.sd,hist:r.hist};
   texto=estado==='longos'?por(l=>l==='pt'?`Distribuição estreita e longa (n = ${r.n}; média ${num(r.media,1,l)} µm; DP ${num(r.sd,1,l)} µm; dados fictícios): padrão típico de resfriamento rápido através da zona de annealing parcial. O comprimento de referência depende da convenção (traço espontâneo ou induzido).`:`Narrow, long distribution (n = ${r.n}; mean ${num(r.media,1,l)} µm; SD ${num(r.sd,1,l)} µm; fictional data): a pattern typical of fast cooling through the partial annealing zone. The reference length depends on the convention (spontaneous or induced track).`):por(l=>l==='pt'?`Distribuição mais curta e larga (n = ${r.n}; média ${num(r.media,1,l)} µm; DP ${num(r.sd,1,l)} µm; dados fictícios): sugere residência prolongada na zona de annealing parcial ou uma história complexa, como reaquecimento. Só a modelagem tempo–temperatura testa histórias específicas.`:`Shorter, wider distribution (n = ${r.n}; mean ${num(r.media,1,l)} µm; SD ${num(r.sd,1,l)} µm; fictional data): suggests prolonged residence in the partial annealing zone or a complex history such as reheating. Only time–temperature modelling tests specific histories.`);break;
  }
  case 'annealing-medidas':{
   const k=['1h','10h','100h','1000h'].indexOf(estado);if(k<0)throw Error('Duração de aquecimento inválida');
   const horas=[1,10,100,1000][k],rr=D.annealing[k];dados={sintetico:true,horas,ordem:k+1,rObs:rr,todos:[...D.annealing],temperaturaConstanteNoModelo:true};
   texto=por(l=>l==='pt'?`Aquecimento de ${horas} h numa temperatura fixa do experimento (fictícia): comprimento reduzido observado r = l/l0 = ${num(rr,2,l)} (l é o comprimento médio de traço confinado após o aquecimento e l0 o do material sem aquecer, na convenção do laboratório). Valores fictícios e esquemáticos: este conjunto tem uma única temperatura; um conjunto de annealing completo repete a série em várias temperaturas.`:`Heating for ${horas} h at a fixed experimental temperature (fictional): observed reduced length r = l/l0 = ${num(rr,2,l)} (l is the mean confined track length after heating and l0 that of the unheated material, in the laboratory’s convention). Fictional, schematic values: this set has a single temperature; a complete annealing set repeats the series at several temperatures.`);break;
  }
  case 'zeta-verifica':{
   if(estado!=='padrao-b')throw Error('Estado da verificação inválido');
   const v=D.verificacao;if(!v)throw Error('Este conjunto de dados não tem verificação de ζ');
   dados={sintetico:true,...v,zeta:ZETA};
   texto=por(l=>l==='pt'?`Segundo padrão, de idade conhecida ${num(v.tMa,0,l)} Ma, tratado com o ζ que você acabou de calibrar (${num(ZETA,1,l)} ano·cm²): ΣNs = ${v.Ns}, ΣNi = ${v.Ni}. Idade calculada = ${num(v.idadeMa,1,l)} ± ${num(v.erroMa,1,l)} Ma, diferença de ${num(Math.abs(v.dif),1,l)}σ em relação à idade conhecida (dados fictícios).`:`Second standard, of known age ${num(v.tMa,0,l)} Ma, treated with the ζ you have just calibrated (${num(ZETA,1,l)} yr·cm²): ΣNs = ${v.Ns}, ΣNi = ${v.Ni}. Calculated age = ${num(v.idadeMa,1,l)} ± ${num(v.erroMa,1,l)} Ma, ${num(Math.abs(v.dif),1,l)}σ away from the known age (fictional data).`);break;
  }
  default:throw Error('Modelo de investigação desconhecido: '+tipo);
 }
 return {modelo:tipo,estado,dados,texto,origem:'modelo-didatico'};
}
