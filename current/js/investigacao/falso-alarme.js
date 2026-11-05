import {T,opcao as O,escolha as E,hipotese} from './autoria.js';
import {CAMPO_FALSO} from './configuracoes-campo.js';
import {gerarPlantaRapida,TEMA_DO_BIOMA} from '../mapa/plantas-rapidas.js';
// ============================================
// "FALSO ALARME" (v3.21): chamados rápidos em que o boato é maior que a radiação. Não há fonte perdida: o jogador ouve o morador com receio,
// mede com o Geiger (longe e junto ao objeto), entende de onde vem a leitura e escolhe a mensagem que tranquiliza sem prometer risco zero.
// Quatro casos curtos, mesma estrutura de 5 cenas, texto próprio. Episódios montados sob demanda (não aparecem na lista de investigações).
// FICÇÃO [H]: personagens, lugares e cenas. Fatos gerais [C], a conferir com físico/especialista em proteção radiológica antes de uso em aula:
//   - rochas como o granito têm traços de urânio, tório e potássio-40 naturais; o corpo humano e os alimentos também têm potássio-40;
//   - o potássio-40 é cerca de 0,012% do potássio natural e tem meia-vida de cerca de 1,25 bilhão de anos (ex.: cloreto de potássio de fertilizante);
//   - detectores de fumaça por ionização trazem uma fonte selada minúscula de amerício-241; intacta, o risco é baixo; não deve ser aberta nem queimada;
//   - vidro de urânio (peça antiga colorida com sais de urânio) brilha em verde sob luz ultravioleta e dá leitura acima do fundo junto à peça.
// Nenhum desses casos descreve um evento real. Exposição ≠ contaminação: CDC [V]. Não orienta ninguém numa situação real.
// ============================================
const base='Princípios gerais de proteção radiológica (tempo, distância e blindagem) e fontes naturais de radiação, conforme material da AIEA e do CDC [V]. Os valores e exemplos de cada caso são conhecimento geral [C], pendentes de revisão por especialista. Personagens e lugares são fictícios [H].';
const baseEn='General radiation protection principles (time, distance and shielding) and natural radiation sources, as in IAEA and CDC material [V]. Values and examples in each case are general knowledge [C], pending specialist review. Characters and places are fictional [H].';

/** Casos: `biomas` diz onde o chamado pode surgir (rapidas.js usa os ids e os biomas daqui por cópia, ver REGISTRO_FALSO). */
export const CASOS_FALSO=[
 {id:'granito',biomas:['urbano','costa','rural'],
  titulo:T('Bancada de granito "que emite radiação"','Granite countertop "that emits radiation"'),
  manchete:T('Cozinha de moradora vira alvo de boato: bancada de pedra "radioativa"','Resident’s kitchen at the centre of a rumour: "radioactive" stone countertop'),
  fala:T('"Reformei a cozinha e vi na internet que a pedra emite radiação. Meus netos comem ali todo dia."','"I redid the kitchen and read online that the stone emits radiation. My grandchildren eat there every day."'),
  relato:T('Uma moradora viu na internet que a bancada de granito da cozinha "emite radiação" e ligou assustada para a Agência. O vídeo foi compartilhado no bairro. Vá ao local, meça e converse com ela antes que o boato cresça.','A resident read online that her kitchen’s granite countertop "emits radiation" and phoned the Agency, frightened. The video was shared around the neighbourhood. Go to the site, measure and talk to her before the rumour grows.'),
  objeto:T('a bancada de granito','the granite countertop'),
  explOk:O('natural','A pedra tem, em traços, elementos radioativos naturais (urânio, tório e potássio-40), como solos e tijolos; a leitura pouco acima do fundo é compatível com isso.','The stone contains trace natural radioactive elements (uranium, thorium and potassium-40), like soils and bricks; a reading slightly above background fits that.',true,'Boa leitura: o resultado tem uma explicação natural, sem fonte escondida.','Good reading: the result has a natural explanation, with no hidden source.'),
  msgOk:O('ok','Medi a bancada: a leitura fica um pouco acima do fundo junto à pedra e volta ao normal a poucos metros, como se espera de uma rocha natural. Não achei fonte radioativa. Se quiser mais segurança, posso pedir uma avaliação a um especialista.','I measured the countertop: the reading is a little above background next to the stone and goes back to normal a few metres away, as expected for a natural rock. I found no radioactive source. If you want more certainty, I can ask a specialist for an assessment.',true,'Mensagem verdadeira e calma: diz o que se mediu, não promete risco zero e oferece um próximo passo.','A truthful, calm message: it says what was measured, does not promise zero risk and offers a next step.')},
 {id:'fertilizante',biomas:['rural','floresta'],
  titulo:T('Sacos de fertilizante fazem o Geiger apitar','Fertiliser sacks make the Geiger beep'),
  manchete:T('Detector de portaria apita em depósito rural; vizinhos temem "material radioativo"','Gate detector beeps at rural store; neighbours fear "radioactive material"'),
  fala:T('"O aparelho apitou perto dos sacos. Nós mexemos neles a manhã toda. Será que ficamos contaminados?"','"The device beeped near the sacks. We handled them all morning. Are we contaminated?"'),
  relato:T('Num depósito rural, o detector portátil de um comprador apitou perto de uma pilha de sacos de adubo. Os trabalhadores ficaram com receio de terem se contaminado e a notícia correu pela região. Meça os sacos e converse com o responsável.','At a rural store, a buyer’s handheld detector beeped near a pile of fertiliser sacks. The workers were afraid they had been contaminated and the news spread through the region. Measure the sacks and talk to the manager.'),
  objeto:T('os sacos de adubo','the fertiliser sacks'),
  explOk:O('potassio','O adubo tem sais de potássio, e uma pequena fração do potássio é o isótopo natural potássio-40 (cerca de 0,012%), que é radioativo; muitos sacos juntos elevam a leitura um pouco.','The fertiliser contains potassium salts, and a small fraction of potassium is the natural isotope potassium-40 (about 0.012%), which is radioactive; many sacks together raise the reading a little.',true,'Boa leitura: radiação natural de um material comum, não uma fonte perdida.','Good reading: natural radiation from a common material, not a lost source.'),
  msgOk:O('ok','O adubo tem potássio natural, que é um pouco radioativo; junto aos sacos o Geiger sobe pouco e, a poucos metros, volta ao normal. Mexer neles não contamina: contaminação seria material espalhado no corpo, e aqui só há radiação natural fraca. Se quiserem, posso pedir uma avaliação a um especialista.','The fertiliser has natural potassium, which is slightly radioactive; next to the sacks the Geiger rises a little and a few metres away goes back to normal. Handling them does not contaminate you: contamination would be material spread on the body, and here there is only weak natural radiation. If you want, I can ask a specialist for an assessment.',true,'Mensagem correta: separa exposição de contaminação [CDC] e não promete risco zero.','Correct message: separates exposure from contamination [CDC] and does not promise zero risk.')},
 {id:'fumaca',biomas:['industrial','clinica','urbano'],
  titulo:T('Caixa de detectores de fumaça antigos','Box of old smoke detectors'),
  manchete:T('Caixa de detectores de fumaça achada num depósito: "tem material radioativo", diz vizinho','Box of smoke detectors found in a storeroom: "it has radioactive material," neighbour says'),
  fala:T('"Li na etiqueta um símbolo de radiação. Tem criança que brinca aqui perto. Isso pode ser perigoso?"','"I read a radiation symbol on the label. Children play near here. Could this be dangerous?"'),
  relato:T('Ao esvaziar um depósito, o zelador achou uma caixa de detectores de fumaça antigos, com um símbolo de radiação na etiqueta. A notícia de "material radioativo no bairro" já passou na rádio local. Meça e converse com ele: aqui a resposta não é "nada".','While emptying a storeroom, the caretaker found a box of old smoke detectors with a radiation symbol on the label. News of "radioactive material in the neighbourhood" is already on local radio. Measure and talk to him: here the answer is not "nothing".'),
  objeto:T('a caixa de detectores','the box of detectors'),
  explOk:O('selada','Cada detector por ionização leva uma fonte selada minúscula de amerício-241: existe, é fraca e fica dentro da peça fechada; junto à caixa a leitura sobe pouco e cai rápido com a distância.','Each ionisation detector carries a tiny sealed americium-241 source: it exists, is weak and stays inside the closed unit; next to the box the reading rises a little and drops quickly with distance.',true,'Boa leitura: há uma fonte, mas selada e muito pequena; tranquilizar sem dizer que "não é nada".','Good reading: there is a source, but sealed and very small; reassure without saying it is "nothing".'),
  msgOk:O('ok','Cada detector tem uma fonte selada muito pequena, e a leitura junto à caixa é baixa. Intactos e fechados, o risco é baixo. O que não se deve fazer é abrir, quebrar ou queimar os aparelhos; mantenham a caixa fechada, longe das crianças, até o recolhimento adequado.','Each detector has a very small sealed source, and the reading next to the box is low. Intact and closed, the risk is low. What must not be done is open, break or burn the units; keep the box closed, away from children, until proper collection.',true,'Mensagem equilibrada: reconhece a fonte, dá o motivo de ela ser de baixo risco e diz o que evitar.','Balanced message: acknowledges the source, explains why it is low risk and says what to avoid.')},
 {id:'vidro',biomas:['urbano','costa'],
  titulo:T('Vaso de vidro antigo que brilha no escuro','Old glass vase that glows'),
  manchete:T('Antiquário diz que vaso "brilha radioativo"; clientes se afastam','Antique shop says vase "glows radioactive"; customers back away'),
  fala:T('"Alguém postou que o meu vaso brilha em verde com luz negra e que é radioativo. Perdi três clientes hoje."','"Someone posted that my vase glows green under blacklight and that it is radioactive. I lost three customers today."'),
  relato:T('Um antiquário viu um vídeo mostrando que um vaso de vidro verde-amarelado brilha com luz ultravioleta e que "é radioativo". Os clientes se afastaram e a loja chamou a Agência. Meça a peça e converse com o dono.','An antique dealer saw a video showing that a yellow-green glass vase glows under ultraviolet light and "is radioactive". Customers backed away and the shop called the Agency. Measure the piece and talk to the owner.'),
  objeto:T('o vaso de vidro','the glass vase'),
  explOk:O('vidro-uranio','Pode ser vidro de urânio: peças antigas coloridas com sais de urânio brilham em verde sob luz ultravioleta e dão leitura um pouco acima do fundo junto à peça; é fraca e cai rápido com a distância.','It may be uranium glass: old pieces coloured with uranium salts glow green under ultraviolet light and give a reading a little above background next to the piece; it is weak and drops quickly with distance.',true,'Boa leitura: o brilho verde e a leitura baixa se explicam pelo mesmo material, sem fonte perdida.','Good reading: the green glow and the low reading are explained by the same material, with no lost source.'),
  msgOk:O('ok','A peça pode ser de vidro de urânio, comum em objetos antigos: a leitura junto ao vaso é baixa e some com a distância. Como enfeite intacto, o risco é baixo; evitem usá-lo para comida ou bebida e não o quebrem nem o lixem. Posso pedir a um especialista uma avaliação mais precisa.','The piece may be uranium glass, common in old objects: the reading next to the vase is low and fades with distance. As an intact ornament, the risk is low; avoid using it for food or drink and do not break or sand it. I can ask a specialist for a more precise assessment.',true,'Mensagem equilibrada: reconhece que há radiação fraca, explica o brilho e diz o que evitar.','Balanced message: acknowledges weak radiation, explains the glow and says what to avoid.')},
];
export const REGISTRO_FALSO=CASOS_FALSO.map(c=>({id:c.id,biomas:c.biomas}));

const fontes=base,fontesEn=baseEn;
export function episodioFalso(c){
 const obj=c.objeto;
 return {
  id:'falso-'+c.id,atalho:'falso-'+c.id,versao:'0.1-teste',campo:CAMPO_FALSO,cenaHipotese:'receio',cenaDecisao:'mensagem',cenaLimite:'fecho',transferenciaObrigatoria:false,
  pt:{titulo:c.titulo.pt,descricao:'Um boato virou notícia. Ouça o morador, meça com o Geiger e diga o que os dados sustentam.',nota:'Chamado fictício de treino. Nenhum evento real é descrito.',aviso:'Versão de teste. Caso fictício, sem orientação para situações reais; o conteúdo será revisado por especialista.'},
  en:{titulo:c.titulo.en,descricao:'A rumour became news. Listen to the resident, measure with the Geiger and say what the data support.',nota:'Fictional training call. No real event is described.',aviso:'Test version. Fictional case, no guidance for real situations; the content will be reviewed by a specialist.'},
  fontes:T(fontes,fontesEn),fontesPublicas:T(fontes,fontesEn),
  rotulosFicha:{decisao:T('Mensagem ao morador','Message to the resident'),limite:T('Limites da conclusão','Limits of the conclusion'),observacoes:T('Registros da investigação','Investigation records')},
  cenas:[
   hipotese('receio','1 · A notícia e o receio','1 · The news and the fear',
    'No rádio e na TV: “'+c.manchete.pt+'”. Helena (fictícia), moradora, conta o que ouviu: '+c.fala.pt+' Antes de medir, qual é a sua primeira explicação?',
    'On radio and TV: “'+c.manchete.en+'”. Helena (fictional), a resident, tells what she heard: '+c.fala.en+' Before measuring, what is your first explanation?',
    [{id:'perigosa',txt:T('Há radiação perigosa aqui e é preciso evacuar o local.','There is dangerous radiation here and the place must be evacuated.'),compativel:false},
     {id:'pequena',txt:T('Pode haver alguma radiação, talvez pequena e conhecida; preciso medir antes de concluir.','There may be some radiation, perhaps small and known; I must measure before concluding.'),compativel:true},
     {id:'naosei',txt:T('Ainda não sei.','I do not know yet.'),naoSei:true}]),
   E('medida','2 · Medir longe e junto ao objeto','2 · Measure far from and next to the object',
    'Você liga o Geiger e mede em dois pontos: longe de '+obj.pt+' e junto a ele. Anote as duas leituras antes de concluir.',
    'You switch on the Geiger and measure at two points: far from '+obj.en+' and next to it. Record both readings before concluding.',
    'O que as duas leituras permitem dizer?','What do the two readings allow us to say?',[
     O('perigo','Que há uma fonte perigosa escondida, porque o Geiger subiu junto ao objeto.','That there is a dangerous hidden source, because the Geiger rose next to the object.',false,'Subir um pouco junto ao objeto mostra que há alguma radiação vindo dele; o tamanho da subida e a queda com a distância é que dizem se é perigoso, e aqui ela é pequena.','Rising a little next to the object shows some radiation comes from it; how big the rise is and how it drops with distance tell whether it is dangerous, and here it is small.'),
     O('pouca','Que sai pouca radiação do objeto: um pouco acima do fundo junto a ele e perto do fundo a alguns metros. Isso não é uma fonte perdida nem uma emergência.','That little radiation comes from the object: a little above background next to it and near background a few metres away. This is not a lost source nor an emergency.',true,'Boa leitura: você comparou os dois pontos e viu o efeito da distância.','Good reading: you compared the two points and saw the effect of distance.'),
     O('zero','Que não há nenhuma radiação, porque a leitura longe do objeto é baixa.','That there is no radiation at all, because the reading far from the object is low.',false,'Sempre há radiação de fundo, e junto ao objeto a leitura subiu um pouco: “nenhuma” seria falso.','There is always background radiation, and next to the object the reading rose a little: “none” would be false.')
    ],{atividade:{tipo:'objeto',estados:['longe','perto']}}),
   E('explicacao','3 · De onde vem essa leitura','3 · Where this reading comes from',
    'André, técnico (fictício), ouve suas medidas e pergunta o que explica a leitura junto a '+obj.pt+'.',
    'André, a (fictional) technician, hears your measurements and asks what explains the reading next to '+obj.en+'.',
    'Qual explicação é a melhor?','Which explanation is best?',[
     c.explOk,
     O('escondida','Uma fonte radioativa perdida está escondida atrás ou dentro do objeto.','A lost radioactive source is hidden behind or inside the object.',false,'Nada nas medidas aponta isso: a leitura é fraca e cai rápido com a distância. Dizer o contrário seria alarmar sem base.','Nothing in the measurements points to that: the reading is weak and drops quickly with distance. Saying otherwise would alarm people without a basis.'),
     O('defeito','O Geiger está com defeito e a leitura não vale nada.','The Geiger is faulty and the reading is worthless.',false,'Nada indica defeito: a leitura longe é o fundo esperado e junto ao objeto sobe, como um detector que funciona.','Nothing points to a fault: the reading far away is the expected background and next to the object it rises, as a working detector does.')
    ]),
   E('mensagem','4 · O que dizer ao morador','4 · What to tell the resident',
    'Lúcia (fictícia) lembra que o boato já passou na TV e que Helena está com receio. A mensagem deve ser verdadeira, calma e sem falsa promessa.',
    'Lúcia (fictional) reminds you that the rumour was already on TV and that Helena is afraid. The message must be truthful, calm and without a false promise.',
    'Qual mensagem é correta e equilibrada?','Which message is correct and balanced?',[
     O('alarme','É melhor sair daí, jogar tudo fora e ninguém voltar ao local.','It is best to leave, throw everything out and have nobody return to the place.',false,'Não há dado que justifique isso, e assustar sem base também faz mal.','There is no data to justify this, and frightening people without a basis also does harm.'),
     c.msgOk,
     O('zero','Pode ficar tranquila: radiação não existe aqui e o risco é exatamente zero.','Rest easy: there is no radiation here and the risk is exactly zero.',false,'Há alguma radiação fraca e ninguém pode prometer risco zero; tranquilizar é dizer o que se mediu e o que não precisa de medo.','There is some weak radiation and nobody can promise zero risk; reassuring means saying what was measured and what does not need fear.')
    ],{explicacaoPrevia:T('Antes das alternativas, pense: o que ela precisa ouvir para se sentir segura sem ser enganada?','Before the options, think: what does she need to hear to feel safe without being misled?')}),
   E('fecho','5 · O que ainda não sabemos','5 · What we still do not know',
    'Helena agradece, mais calma: “Então posso ficar tranquila? O que a sua medida não consegue dizer?”',
    'Helena thanks you, calmer: “So can I rest easy? What can your measurement not tell us?”',
    'Qual é a conclusão justificada?','What is the justified conclusion?',[
     O('tudo','A medida substitui qualquer laudo: já sei tudo sobre o objeto.','The measurement replaces any report: I already know everything about the object.',false,'Um Geiger é uma medida rápida de campo; não é laudo nem identifica o material.','A Geiger is a quick field measurement; it is not a report and does not identify the material.'),
     O('limite','A medida de campo sustenta que não há fonte perdida nem emergência aqui; ela não identifica o material com certeza, e uma avaliação de especialista pode confirmar. O caso aqui é fictício.','The field measurement supports that there is no lost source or emergency here; it does not identify the material with certainty, and a specialist assessment can confirm it. The case here is fictional.',true,'Conclusão com limites claros: o que a medida mostra e o que ela não mostra.','A conclusion with clear limits: what the measurement shows and what it does not.'),
     O('nada','Nada se pode concluir de uma medida simples.','Nothing can be concluded from a simple measurement.',false,'Dá para concluir o que os dados sustentam; o que falta deve ser dito, não ignorado.','One can conclude what the data support; what is missing should be stated, not ignored.')
    ])
  ]
 };
}
const cache=new Map();
// v3.24: o falso alarme acontece num mapa sorteado do bioma do chamado (rua, quintal, depósito...), não mais na planta do hospital.
// A Agência chama prepararFalso(semente, bioma) ao desembarcar; sem isso (teste de menu), vale a planta fixa antiga.
let sorteio=null;
export function prepararFalso(sem,bioma){sorteio=sem==null?null:{sem,bioma};}
const local=(id,x,y,pt,en,npc,extra={})=>({id,x,y,pt,en,npc,...extra});
export function campoAleatorio(sem,bioma){
 const g=gerarPlantaRapida(sem,bioma),p=g.planta,w=g.cols,h=g.rows,ix=p.inicio.x,iy=p.inicio.y,R=Math.round;
 return {numero:21,tema:TEMA_DO_BIOMA[bioma],hospitalAtivo:false,nome:T('local do chamado','call site'),progresso:T('Pistas','Clues'),
  locais:[
   local('receio',R(ix+4),iy,'Helena · moradora','Helena · resident','helena',{visivelAte:3}),
   local('medida',R(w*.4),R(h*.35),'Medir com o Geiger','Measure with the Geiger',null,{icone:'detector',curto:T('Medir','Measure')}),
   local('explicacao',R(w*.55),R(h*.65),'André · técnico','André · technician','andre'),
   local('mensagem',R(w*.75),R(h*.4),'Lúcia · o que dizer','Lúcia · what to say','lucia'),
   local('fecho',R(ix+6),Math.min(h-3,iy+3),'Helena · e agora?','Helena · and now?','helena',{visivelDe:4}),
  ],
  salas:[],planta:p};
}
/** Episódio de um chamado sem fonte perdida (`falso-<caso>`), ou null se o id não for de um deles. */
export function falsoAlarmePorId(id){
 const c=CASOS_FALSO.find(x=>'falso-'+x.id===id||x.id===id);
 if(!c)return null;
 const k=c.id+(sorteio?'@'+sorteio.sem:'');
 if(!cache.has(k)){const e=episodioFalso(c);cache.set(k,sorteio?{...e,campo:campoAleatorio(sorteio.sem,sorteio.bioma)}:e);}
 return cache.get(k);
}
