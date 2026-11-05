// Configuração de cenários sobre os mapas existentes. Nenhum controlador de movimento novo.
import {TREINOS} from './treinamento-seguranca.js';
import {PLANTA_ESCOLA,PLANTA_ESCOLA_ANDAR1,PLANTA_ESCOLA_PORAO,PLANTA_ESCOLA_SOTAO,PLANTA_CRONOLOGIA,PLANTA_NUCLEAR,PLANTA_HOSPITAL} from '../mapa/plantas-investigacao.js';
const T = (pt,en)=>({pt,en});
const local=(id,x,y,pt,en,npc,extra={})=>({id,x,y,pt,en,npc,...extra});
const sala=(x,y,pt,en)=>({x,y,pt,en});
export const CAMPO_HOSPITAL={
 numero:9,tema:'hospital',hospitalAtivo:true,nome:T('hospital','hospital'),progresso:T('Observações','Observations'),
 locais:[
  local('recepcao',8,19,'Helena · recepção','Helena · reception','helena',{visivelAte:7}),
  local('equipamento',9,6,'Rita · radiografia','Rita · X-ray room','rita'),
  local('caminho',11,8,'Observar o detector','Observe the detector',null,{icone:'detector',curto:T('Detector','Detector')}),
  local('frasco',35,6,'Painel de comparação','Comparison display',null,{icone:'frasco',curto:T('Comparar','Compare')}),
  local('cartaz',34,19,'Preparar o mural','Prepare the board',null,{curto:T('Produzir','Create')}),
  local('mural',36,21,'Revisar a mensagem','Review the message',null,{curto:T('Mural','Board')}),
  local('retomada',43,20,'Helena · medicina nuclear','Helena · nuclear medicine','helena',{visivelDe:6}),
 ],
 salas:[sala(4,16,'Recepção','Reception'),sala(4,3,'Radiografia','X-ray room'),sala(14,3,'Laudos','Reports room'),sala(31,3,'Sala educativa','Learning room'),sala(39,3,'Apoio','Support'),sala(31,16,'Mural da escola','School board'),sala(39,16,'Medicina nuclear','Nuclear medicine'),sala(20,2,'Jardim interno','Inner garden'),sala(1,25,'Baia de ambulâncias','Ambulance bay'),sala(39,28,'Resíduos','Waste area')],
 planta:PLANTA_HOSPITAL,
 painel:{x:32.2,y:16.2,cenaCartoes:'cartaz',cenaDecisao:'mural',texto:T('EXPOSIÇÃO ≠ CONTAMINAÇÃO','EXPOSURE ≠ CONTAMINATION')},
};
export const CAMPO_ZARAGOZA={
 numero:20,tema:'hospital',hospitalAtivo:true,nome:T('hospital em Zaragoza (reconstituição)','hospital in Zaragoza (reconstruction)'),progresso:T('Pistas','Clues'),
 locais:[
  local('boato',8,19,'Helena · recepção','Helena · reception','helena',{visivelAte:5}),
  local('medicina-nuclear',41,18,'Camila · medicina nuclear','Camila · nuclear medicine','camila'),
  local('bunker',11,8,'Sala do acelerador (desligado)','Accelerator room (switched off)',null,{icone:'detector',curto:T('Acelerador','Accelerator')}),
  local('manutencao',9,6,'André · livro de manutenção','André · maintenance log','andre'),
  local('comparacao',35,6,'Painel: Goiânia × Zaragoza','Board: Goiânia × Zaragoza',null,{icone:'frasco',curto:T('Comparar','Compare')}),
  local('mensagem',36,21,'Lúcia · o que dizer ao bairro','Lúcia · what to tell the neighbourhood','lucia'),
  local('fecho',12,21,'Helena · o que ainda não sabemos','Helena · what we still do not know','helena',{visivelDe:6}),
 ],
 salas:[sala(4,16,'Recepção','Reception'),sala(4,3,'Sala do acelerador','Accelerator room'),sala(14,3,'Laudos','Reports room'),sala(31,3,'Sala de comparação','Comparison room'),sala(39,3,'Apoio','Support'),sala(31,16,'Comunicação','Communication'),sala(39,16,'Medicina nuclear','Nuclear medicine'),sala(20,2,'Jardim interno','Inner garden'),sala(1,25,'Baia de ambulâncias','Ambulance bay'),sala(39,28,'Resíduos','Waste area')],
 planta:PLANTA_HOSPITAL,
};
export const CAMPO_FALSO={
 numero:21,tema:'hospital',hospitalAtivo:true,nome:T('local do chamado (reconstituição)','call site (reconstruction)'),progresso:T('Pistas','Clues'),
 locais:[
  local('receio',8,19,'Helena · moradora','Helena · resident','helena',{visivelAte:3}),
  local('medida',11,8,'Medir com o Geiger','Measure with the Geiger',null,{icone:'detector',curto:T('Medir','Measure')}),
  local('explicacao',9,6,'André · técnico','André · technician','andre'),
  local('mensagem',36,21,'Lúcia · o que dizer','Lúcia · what to say','lucia'),
  local('fecho',12,21,'Helena · e agora?','Helena · and now?','helena',{visivelDe:4}),
 ],
 salas:[sala(4,16,'Entrada','Entrance'),sala(4,3,'Sala do objeto','Object room'),sala(14,3,'Apoio','Support'),sala(31,16,'Comunicação','Communication')],
 planta:PLANTA_HOSPITAL,
};
export const CAMPO_NUCLEAR={
 numero:10,tema:'lab',nome:T('serviço de medicina nuclear','nuclear medicine department'),progresso:T('Etapas','Steps'),
 locais:[local('acolhimento',8,22,'Camila · física médica','Camila · medical physicist','camila'),local('aquisicao',38,18,'Terminal de aquisição','Acquisition terminal',null,{icone:'detector',curto:T('Aquisição','Acquisition')}),local('distribuicao',36,10,'Bancada de radiofármacos','Radiopharmaceutical bench',null,{icone:'frasco',curto:T('Distribuição','Distribution')}),local('comunicacao',7,9,'Construir a explicação','Build an explanation',null,{curto:T('Síntese','Summary')}),local('mensagem-nuclear',19,7,'André · revisar a mensagem','André · review the message','andre'),local('limite-nuclear',20,22,'Lúcia · nova pergunta','Lúcia · a new question','lucia')],
 salas:[sala(4,3,'Comunicação','Communication'),sala(14,3,'Equipe','Team'),sala(4,17,'Acolhimento','Welcome'),sala(16,17,'Sala de conversa','Discussion room'),sala(31,7,'Radiofármacos (didático)','Radiopharmacy (educational)'),sala(42,7,'Controle','Control room'),sala(31,14,'Aquisição didática','Acquisition model'),sala(41,27,'Armazenamento cercado','Fenced storage'),sala(1,29,'Baia de embarque','Drop-off bay')],
 planta:PLANTA_NUCLEAR,
 painel:{x:5.2,y:3.2,cenaCartoes:'comunicacao',cenaDecisao:'mensagem-nuclear',texto:T('FONTE → CORPO → DETECTOR','SOURCE → BODY → DETECTOR')},
};
export const CAMPO_TEMPO={
 numero:11,tema:'lab',nome:T('laboratório de cronologia','chronology laboratory'),progresso:T('Etapas','Steps'),
 locais:[local('pergunta-tempo',33,18,'Lara · laboratório','Lara · laboratory','lara',{visivelAte:13}),
  local('montagem',5,5,'Montar e polir apatitas','Mount and polish apatites',null,{curto:T('Montagem','Mounting')}),
  local('ataque-apatita',29,6,'Atacar a apatita','Etch the apatite',null,{icone:'frasco',curto:T('Ataque','Etch')}),
  local('contagem',10,32,'Contar ρs ao microscópio','Count ρs under the microscope',null,{icone:'detector',curto:T('ρs','ρs')}),
  local('conjunto',9,3,'Preparar o conjunto de irradiação','Prepare the irradiation set',null,{curto:T('Conjunto','Set')}),
  local('reator',10,19,'Amostras para o reator','Samples to the reactor',null,{icone:'detector',curto:T('Reator','Reactor')}),
  local('ataque-mica',35,6,'Atacar a mica com HF','Etch the mica with HF',null,{icone:'frasco',curto:T('Mica','Mica')}),
  local('tabela',5,34,'Tabela grão a grão','Grain-by-grain table',null,{curto:T('Tabela','Table')}),
  local('zeta',11,34,'Calibração ζ','ζ calibration',null,{curto:T('ζ','ζ')}),
  local('idade',12,30,'Calcular a idade','Compute the age',null,{curto:T('Idade','Age')}),
  local('annealing',21,5,'Conjunto de annealing','Annealing set',null,{icone:'detector',curto:T('Annealing','Annealing')}),
  local('comprimentos',3,30,'Comprimentos de traço','Track lengths',null,{icone:'detector',curto:T('Comprimentos','Lengths')}),
  local('quadro-tempo',35,18,'Organizar o laudo educativo','Build the educational report',null,{curto:T('Laudo','Report')}),
  local('evento',19,6,'Caio · o evento registrado','Caio · the recorded event','caio'),
  local('limite-tempo',32,17,'Lara · o que falta saber','Lara · what is missing','lara',{visivelDe:14})],
 salas:[sala(1,9,'Lab 1 · Polimento, corte e montagem','Lab 1 · Polishing, cutting and mounting'),sala(14,9,'Lab 2 · Tratamento térmico','Lab 2 · Heat treatment'),sala(26,9,'Lab 3 · Ataque químico','Lab 3 · Chemical etching'),sala(1,22,'Lab 4 · Fontes radioativas','Lab 4 · Radioactive sources'),sala(20,16,'Vestiário e EPI','Locker room and PPE'),sala(1,35,'Lab 5 · Microscopia e contagem','Lab 5 · Microscopy and counting'),sala(15,34,'Lab 5 · Eletrônica básica','Lab 5 · Basic electronics'),sala(28,34,'Lab 5 · Impressão 3D','Lab 5 · 3D printing'),sala(30,17,'Recepção e laudo','Reception and report')],
 planta:PLANTA_CRONOLOGIA,
 instrutores:TREINOS,
 painel:{x:31,y:19,cenaCartoes:'quadro-tempo',cenaDecisao:'evento',texto:T('AMOSTRA + MÉTODO + EVENTO','SAMPLE + METHOD + EVENT')},
};
export const CAMPO_RADON={
 numero:12,tema:'lab',nome:T('escola','school'),progresso:T('Etapas','Steps'),
 locais:[
  local('pergunta-ar',8,7,'Dora · escola','Dora · school','dora',{visivelAte:7}),
  local('ventilacao',18,8,'Inês · ventilação da sala','Inês · room ventilation','ines',{curto:T('Ventilação','Ventilation'),icone:'detector'}),
  local('porao-ar',12,5,'Nelson · porão','Nelson · basement','nelson',{curto:T('Porão','Basement'),piso:'porao'}),
  local('sotao-ar',12,5,'Léo · sótão','Léo · attic','leo',{curto:T('Sótão','Attic'),piso:'sotao'}),
  local('serie',9,3,'Vera · registros do 1º andar','Vera · 1st-floor records','vera',{curto:T('Registros','Records'),piso:'andar1'}),
  local('protocolo',28,7,'Paulo · protocolo','Paulo · protocol','paulo',{curto:T('Protocolo','Protocol')}),
  local('quadro-ar',46,9,'Tânia · comunicação','Tânia · communication','tania',{curto:T('Comunicar','Communicate')}),
  local('conclusao-ar',48,12,'Inês · conclusão','Inês · conclusion','ines'),
  local('limite-ar',14,21,'Dora · nova situação','Dora · a new situation','dora',{visivelDe:8})],
 salas:[sala(4,3,'Secretaria · ventilação média','Office · medium ventilation'),sala(12,3,'Sala A · janelas conforme a estação','Room A · windows by season'),sala(22,3,'Sala B · ventilação mecânica programada','Room B · scheduled mechanical ventilation'),sala(35,3,'Professores','Teachers'),sala(42,3,'Conselho escolar','School meeting'),sala(4,31,'Biblioteca','Library'),sala(19,31,'Pavilhão de análise','Analysis pavilion'),sala(4,17,'Pátio','Courtyard'),sala(35,17,'Estacionamento','Parking lot'),sala(36,28,'Horta','Vegetable garden'),sala(42,27,'Quadra','Court')],
 planta:PLANTA_ESCOLA,
 // Piso 2 (protótipo de pisos, etapa 3b): a escada fica no extremo leste do corredor do prédio antigo; cada piso é um mapa próprio.
 pisos:{
  terreo:{nome:T('Térreo','Ground floor'),nivel:0,escadas:[{id:'sobe-andar1',x:29,y:13,para:'andar1',chegada:{x:27.5,y:11.5}},{id:'desce-porao',x:6,y:13,para:'porao',chegada:{x:4.5,y:12.5}}]},
  porao:{nome:T('Porão','Basement'),nivel:-1,planta:PLANTA_ESCOLA_PORAO,
   salas:[sala(2,1,'Porão · sem janelas','Basement · no windows'),sala(23,1,'Depósito do porão','Basement storeroom'),sala(2,10,'Corredor do porão','Basement corridor')],
   escadas:[{id:'sobe-terreo',x:2,y:12,para:'terreo',chegada:{x:8.5,y:13.5}}]},
  andar1:{nome:T('1º andar','1st floor'),nivel:1,planta:PLANTA_ESCOLA_ANDAR1,
   salas:[sala(2,1,'Sala C · 1º andar','Room C · 1st floor'),sala(13,1,'Sala D · muita ventilação','Room D · high ventilation'),sala(24,1,'Depósito · pouca ventilação','Storage · low ventilation'),sala(2,10,'Corredor do 1º andar','1st-floor corridor')],
   escadas:[{id:'desce-terreo',x:29,y:12,para:'terreo',chegada:{x:27.5,y:13.5}},{id:'sobe-sotao',x:3,y:12,para:'sotao',chegada:{x:4.5,y:12.5}}]},
  sotao:{nome:T('Sótão','Attic'),nivel:2,planta:PLANTA_ESCOLA_SOTAO,
   salas:[sala(2,1,'Sótão · sob o telhado','Attic · under the roof'),sala(23,1,'Arquivo do sótão','Attic archive'),sala(2,10,'Corredor do sótão','Attic corridor')],
   escadas:[{id:'desce-andar1',x:2,y:12,para:'andar1',chegada:{x:6.5,y:12.5}}]},
 },
 painel:{x:44.2,y:4.4,cenaCartoes:'quadro-ar',cenaDecisao:'conclusao-ar',texto:T('MEDIR, COMPARAR, DELIMITAR','MEASURE, COMPARE, QUALIFY')},
};
