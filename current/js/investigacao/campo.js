// Cena comum: herda mapa, personagem, colisões, câmera e controles do jogo.
import {GameScene} from '../scenes/GameScene.js';
import {CONFIG} from '../data/config.js';
import {GameState} from '../estado.js';
import {currentLang} from '../i18n/index.js';
import {ui} from '../ui.js';
import {ESCALA_SPRITE} from '../render/personagem.js';
import {registrarNpcsHospital} from '../render/npcs-hospital.js';
import {mapaDeDistancias} from '../academia/objetivo.js';
import {investigacaoPorId} from './index.js';
import {travarTeclasDoJogo} from './ui-investigacao.js';
import {abrirTreino,treinoFeito,treinoDaArea} from './treinamento-seguranca.js';
import {campoDoPiso,missaoDoPiso,proximaEscada,nomeDoPiso,pisoDoLocal,temPisos,escadaSobre,RAIO_LIBERA,PISO_PADRAO} from './pisos.js';
const SEM_AVISO=new Set(['desk','computer','shelf','cabinet','sink','bookcase','waiting_seats','work_table','learning_board','school_mural','reception_desk','sample_tray','sample_drawer','fridge','loupe','balance','locker','eyewash','safety_shower','extinguisher','first_aid','biohazard']);
const NOMES={helena:'Helena',rita:'Rita',camila:'Camila',andre:'André',lucia:'Lúcia',lara:'Lara',caio:'Caio',dora:'Dora',ines:'Inês',bia:'Bia',otto:'Otto',nina:'Nina',davi:'Davi',lea:'Léa',teo:'Teo',iris:'Íris',nelson:'Nelson',leo:'Léo',vera:'Vera',paulo:'Paulo',tania:'Tânia'};
export function missaoInvestigacao(id,lang){
 const inv=investigacaoPorId(id);if(!inv?.campo)throw Error('Investigação sem configuração de campo: '+id);
 const c=inv.campo;
 return {id:c.numero,investigacao:inv.id,titulo:inv[lang==='pt'?'pt':'en'].titulo,numSources:0,timeLimit:0,mapTheme:c.tema,mapCols:c.planta?.cols,mapRows:c.planta?.rows,hospitalAtivo:!!c.hospitalAtivo,geigerComoItem:true,allowedIsotopes:[],difficulty:'normal',investigacaoCampo:c};
}
export class InvestigacaoScene extends GameScene{
 init(data){
  // pisos: a missão-base (com todos os pisos) fica guardada; a cena recebe a visão do piso atual (mapa, salas, escadas)
  this.missaoBase=data?.mission||this.missaoBase||this.missionData;this.piso=data?.piso||'terreo';this.chegada=data?.chegada||null;this.transicao=false;this.escadaTravada=!!this.chegada;
  this.painelCampo=null;this.objChave=null;this.mdObj=null;this.escadasObj=[];   // a instância da cena é reaproveitada no restart: zera o que a criação anterior deixou
  super.init({...data,mission:missaoDoPiso(this.missaoBase,this.piso)});
  this.definicao=investigacaoPorId(this.missionData.investigacao);this.campo=campoDoPiso(this.definicao.campo,this.piso);
  this.pontosInvestigacao=[];this.pontosHospital=this.pontosInvestigacao; // compatibilidade com inspeções da investigação original
  this.hudInvestigacao=null;
  this.encontros.iniciar=()=>{};this.encontros.checar=()=>{};
 }
 placeSources(){}
 updateGeiger(){}
 toggleGeiger(){}
 setShield(){}
 verificarAssistencia(){}
 dicaDisponivel(){return false;}
 create(){
  super.create();registrarNpcsHospital(this);
  this.temGeiger=false;GameState.temGeiger=false;this.geigerDevice.setVisible(false);
  const T=CONFIG.TILE_SIZE,usadas=[],candidatas=this.posicoesDoJogador().filter(p=>p.x%1===.5&&p.y%1===.5);
  if(this.campo.locais.length!==this.definicao.cenas.length)throw Error('Cada cena precisa de um ponto de campo');
  for(const local of this.campo.locais){
   if(pisoDoLocal(local)!==this.piso){const f={visible:false,setVisible(){return f;},setStrokeStyle(){return f;}};this.pontosInvestigacao.push({...local,obj:f,halo:f,nome:null,fora:true});continue;}   // ponto de outro piso
   const p=candidatas.filter(q=>usadas.every(u=>Math.hypot(q.x-u.x,q.y-u.y)>1.4)).sort((a,b)=>Math.hypot(a.x-local.x,a.y-local.y)-Math.hypot(b.x-local.x,b.y-local.y))[0];
   if(!p)throw Error('Ponto de investigação não alcançável: '+local.id);
   usadas.push(p);
   if(local.npc){   // o personagem é um só (ator) e anda entre os seus pontos; este ponto só marca onde ele fica quando chega a sua vez
    const fantasma={visible:true,setVisible(v){this.visible=v;return this;},setStrokeStyle(){return this;}};
    this.pontosInvestigacao.push({...local,x:p.x,y:p.y,obj:fantasma,halo:fantasma,nome:null,npcPonto:true});continue;
   }
   const c=this.add.container(p.x*T,p.y*T).setDepth(6),halo=this.add.circle(0,0,16,0xffd45a,.15).setStrokeStyle(2,0xffd45a,.85);c.add(halo);
   {
    const g=this.add.graphics();g.lineStyle(2,0x80cbd5);g.fillStyle(0x294754);g.fillRoundedRect(-12,-11,24,22,3);g.strokeRoundedRect(-12,-11,24,22,3);
    if(local.icone==='frasco'){g.fillStyle(0xb9dfd4);g.fillRect(-5,-5,10,12);g.fillStyle(0x708d9e);g.fillRect(-4,-8,8,4);}
    else if(local.icone==='detector'){g.fillStyle(0x91c2c7);g.fillRect(-8,-7,16,14);g.lineStyle(1,0xe4efe0);g.lineBetween(0,-5,0,5);for(let j=-3;j<=3;j+=3)g.lineBetween(-5,j,5,j);}
    else{g.fillStyle(0xf1e6c8);g.fillRect(-8,-7,16,14);g.lineStyle(2,0x578c91);g.lineBetween(-5,-3,5,-3);g.lineBetween(-5,2,4,2);}c.add(g);
   }
   const nome=this.add.text(0,-30,local.curto?.[currentLang]||local[currentLang],{fontSize:'11px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#182a36',padding:{x:3,y:2}}).setOrigin(.5);
   c.add(nome);c.setSize(40,55).setInteractive({useHandCursor:true});const ponto={...local,x:p.x,y:p.y,obj:c,halo,nome};this.pontosInvestigacao.push(ponto);c.on('pointerdown',()=>this.interagirInvestigacao(ponto));
  }
  this.instrutores=[];
  for(const ins of this.campo.instrutores||[]){
   const p=candidatas.filter(q=>usadas.every(u=>Math.hypot(q.x-u.x,q.y-u.y)>1.4)).sort((a,b)=>Math.hypot(a.x-ins.x,a.y-ins.y)-Math.hypot(b.x-ins.x,b.y-ins.y))[0];
   if(!p)throw Error('Instrutor sem posição alcançável: '+ins.id);
   usadas.push(p);const c=this.add.container(p.x*T,p.y*T).setDepth(6),halo=this.add.circle(0,0,16,0x63d8ba,.12).setStrokeStyle(2,0x63d8ba,.8);
   c.add(halo);c.add(this.add.image(0,4,'hospital_npc_'+ins.npc).setScale(ESCALA_SPRITE).setOrigin(.5,.64));
   const nome=this.add.text(0,-30,NOMES[ins.npc]+' · '+(currentLang==='pt'?'segurança':'safety'),{fontSize:'11px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#1d4a43',padding:{x:3,y:2}}).setOrigin(.5);
   c.add(nome);c.setSize(40,55).setInteractive({useHandCursor:true});const item={...ins,x:p.x,y:p.y,obj:c,halo,nome};this.instrutores.push(item);c.on('pointerdown',()=>this.conversarInstrutor(item));
  }
  this.criarAtores(candidatas,usadas);
  this.criarJato(candidatas,usadas);
  const tela=document.getElementById('game-screen');tela.classList.add('investigacao-campo');if(this.definicao.id==='hospital-imagem')tela.classList.add('hospital-investigacao');
  ui.mostrarBotoesGeiger(false);const interagir=document.getElementById('btn-identify');interagir.hidden=false;interagir.querySelector('.action-label').textContent=currentLang==='pt'?'Conversar':'Talk';interagir.title=currentLang==='pt'?'Conversar / observar (E ou Q)':'Talk / observe (E or Q)';
  const controles=document.querySelector('.hud-bottom-right');
  const leitura=document.createElement('button');leitura.id='inv-modo-leitura';leitura.className='action-btn';leitura.type='button';leitura.textContent=currentLang==='pt'?'Leitura':'Reading';
  leitura.addEventListener('click',()=>{ui.investigacao.emCampo=false;GameState.modalAberto=true;travarTeclasDoJogo(true);ui.showScreen('investigacao');ui.investigacao.sessao.i=ui.investigacao.proximaCenaCampo();ui.investigacao.cena();});controles.append(leitura);
  const caderno=document.createElement('button');caderno.id='inv-caderno';caderno.className='action-btn';caderno.type='button';caderno.textContent=currentLang==='pt'?'Caderno':'Notebook';caderno.addEventListener('click',()=>{ui.investigacao.abrirCampo();ui.investigacao.fichaFinal();});controles.append(caderno);
  const limpar=()=>{leitura.remove();caderno.remove();if(!window.gameScene||window.gameScene===this)tela.classList.remove('investigacao-campo','hospital-investigacao');};this.events.once('shutdown',limpar);this.events.once('destroy',limpar);
  for(const sala of this.campo.salas)this.add.text(sala.x*T,sala.y*T,sala[currentLang],{fontSize:'11px',fontFamily:'Orbitron',color:'#dcf5ef',backgroundColor:'#203644',padding:{x:4,y:2}}).setDepth(4);
  const painel=this.campo.painel;
  if(painel)this.painelCampo=this.add.text(painel.x*T,painel.y*T,'',{fontSize:'9px',fontFamily:'Arial',color:'#203e4b',backgroundColor:'#f4ecd7',padding:{x:4,y:3},wordWrap:{width:90}}).setDepth(5);
  this.criarEscadas();
  if(this.chegada){   // chegada pela escada: posição de destino e câmera já nela (o createPlayer da GameScene continua herdado)
   const T=CONFIG.TILE_SIZE;this.player.setPosition(this.chegada.x*T,this.chegada.y*T);this.cameras.main.centerOn(this.player.x,this.player.y);this.cameras.main.fadeIn(220,10,15,20);this.mostrarAndar();
  }
  this.sincronizarAtores(true);this.atualizarObjetivo();this.drawMinimap();
 }
 atualizarObjetivo(){
  if(!this.pontosInvestigacao?.length)return;
  const inv=ui.investigacao,n=inv.proximaCenaCampo(),total=this.pontosInvestigacao.length,p=this.pontosInvestigacao[n],sessao=inv.sessao,estado=n+'|'+currentLang+'|'+sessao.historico.length+'|'+(this.instrutores||[]).filter(i=>treinoFeito(i.id)).length;
  if(this.hudInvestigacao===estado)return;this.hudInvestigacao=estado;
  this.sincronizarAtores(false);
  for(let i=0;i<total;i++){const q=this.pontosInvestigacao[i];
   if(q.npcPonto){const a=this.atores[q.npc];q.obj.setVisible(!!a&&a.idx===i&&!q.fora);if(a&&a.idx===i)a.halo.setStrokeStyle(i===n?2:1,i<n?0x63d8ba:i===n?0xffd45a:0x8aa5b2,.9);continue;}
   q.obj.setVisible(n>=(q.visivelDe??0)&&n<=(q.visivelAte??total));q.halo.setStrokeStyle(i===n?2:1,i<n?0x63d8ba:i===n?0xffd45a:0x8aa5b2,.9);}
  if(this.jato){this.jato.halo.setStrokeStyle(n>=total?3:1,n>=total?0xffd45a:0x8aa5b2,n>=total?1:.5);this.jato.obj.setVisible(this.piso===PISO_PADRAO);}
  const painel=this.campo.painel;
  if(this.painelCampo){
   const rascunho=sessao.mural&&!sessao.mural.revisado,decidiu=sessao.registro[painel.cenaDecisao],preparou=sessao.registro[painel.cenaCartoes];
   this.painelCampo.setText(rascunho?(currentLang==='pt'?'Rascunho\nRevisão necessária':'Draft\nRevision needed'):decidiu?painel.texto[currentLang]+'\n'+(currentLang==='pt'?'Mensagem revisada':'Message reviewed'):preparou?(currentLang==='pt'?'Painel preparado\nFalta revisar a mensagem':'Board prepared\nMessage needs review'):'');
  }
  ui.setProximo(`${this.campo.progresso[currentLang]} ${n}/${total}`,n===total?this.textoJato():(currentLang==='pt'?'Próximo: ':'Next: ')+p[currentLang]+(p.fora?' · '+nomeDoPiso(this.definicao.campo,pisoDoLocal(p),currentLang):''));
  const alvo=n>=total?this.alvoDoJato():this.alvoDoObjetivo(p);this.objAtual={id:this.definicao.id,alvo:alvo?{x:alvo.x,y:alvo.y}:null};const chave=(p?.id||'fim')+'|'+this.piso+'|'+(p?.npcPonto?'a':'');
  if(chave!==this.objChave){this.objChave=chave;this.mdObj=alvo?mapaDeDistancias(this.mapData.map,new Set(this.blockedTiles.map(b=>b.x+','+b.y)),alvo):null;}
  document.getElementById('sources-tracker').textContent=`${n}/${total} ${this.campo.progresso[currentLang].toLowerCase()}`+(temPisos(this.definicao.campo)?` · ${nomeDoPiso(this.definicao.campo,this.piso,currentLang)}`:'')+(this.instrutores?.length?` · ${currentLang==='pt'?'treinos':'training'} ${this.instrutores.filter(i=>treinoFeito(i.id)).length}/${this.instrutores.length}`:'');
 }
 desenharSeta(time){const antes=this.missionData.licoes;this.missionData.licoes=true;try{super.desenharSeta(time);}finally{this.missionData.licoes=antes;}}
 updateFurnitureInfo(){
  super.updateFurnitureInfo();if(!this.pontosInvestigacao?.length)return;
  const T=CONFIG.TILE_SIZE,movel=this.furniture.filter(f=>f.type[currentLang]).sort((a,b)=>Math.hypot(this.player.x-a.centerX,this.player.y-a.centerY)-Math.hypot(this.player.x-b.centerX,this.player.y-b.centerY))[0];
  if(movel&&Math.hypot(this.player.x-movel.centerX,this.player.y-movel.centerY)<70)this.furnitureInfoText.setText(movel.type[currentLang]);
  const p=this.maisPerto(),ins=this.instrutorPerto(),dp=p?Math.hypot(this.player.x/T-p.x,this.player.y/T-p.y):99,di=ins?Math.hypot(this.player.x/T-ins.x,this.player.y/T-ins.y):99;
  if(movel&&this.campo.planta&&this.instrutores?.length&&Math.hypot(this.player.x-movel.centerX,this.player.y-movel.centerY)<70&&!SEM_AVISO.has(movel.type.id)){
   const tr=treinoDaArea(this.campo.planta,Math.floor(movel.centerX/T),Math.floor(movel.centerY/T));
   if(tr&&!treinoFeito(tr.id))this.furnitureInfoText.setText(movel.type[currentLang]+(currentLang==='pt'?' · ⚠ treino de segurança pendente ('+NOMES[tr.npc]+')':' · ⚠ safety training pending ('+NOMES[tr.npc]+')'));
  }
  if(this.jatoPerto()&&this.pontosInvestigacao.length&&ui.investigacao.proximaCenaCampo()>=this.pontosInvestigacao.length){this.furnitureInfoText.setText(this.rotuloJato()+' · '+(currentLang==='pt'?'encerrar a investigação':'finish the investigation')+' · E / Q');return;}
  if(di<2&&di<dp)this.furnitureInfoText.setText(NOMES[ins.npc]+' · '+(currentLang==='pt'?'treino de segurança':'safety training')+(treinoFeito(ins.id)?' ✓':'')+' · E / Q');
  else if(dp<2)this.furnitureInfoText.setText(p[currentLang]+' · E / Q');
 }
 maisPerto(){const T=CONFIG.TILE_SIZE;return this.pontosInvestigacao.filter(p=>p.obj.visible).sort((a,b)=>Math.hypot(this.player.x/T-a.x,this.player.y/T-a.y)-Math.hypot(this.player.x/T-b.x,this.player.y/T-b.y))[0];}
 interagirInvestigacao(p=this.maisPerto()){
  if(this.bloqueado()||!p)return;
  if(Math.hypot(this.player.x/CONFIG.TILE_SIZE-p.x,this.player.y/CONFIG.TILE_SIZE-p.y)>2){ui.showNotification(currentLang==='pt'?'Aproxime-se para conversar ou observar.':'Move closer to talk or observe.','info');return;}
  const inv=ui.investigacao,n=inv.proximaCenaCampo(),i=this.pontosInvestigacao.indexOf(p);
  if(n>=this.pontosInvestigacao.length){this.avisarJato();return;}
  if(i>n){ui.showNotification((currentLang==='pt'?'Primeiro: ':'First: ')+this.pontosInvestigacao[n][currentLang],'info');return;}
  const a=p.npcPonto&&this.atores[p.npc];
  if(a&&a.andando&&Math.hypot(a.px-p.x*CONFIG.TILE_SIZE,a.py-p.y*CONFIG.TILE_SIZE)>1.6*CONFIG.TILE_SIZE){ui.showNotification(NOMES[p.npc]+(currentLang==='pt'?' ainda está a caminho. Aguarde um instante.':' is still on the way. Wait a moment.'),'info');return;}
  inv.sessao.i=i;inv.abrirCampo();inv.cena();
 }
 // ---- jato: ao concluir as etapas, a equipe volta à aeronave e é lá que a investigação se encerra ----
 rotuloJato(){return ui.origem==='agencia'?(currentLang==='pt'?'Jato':'Jet'):(currentLang==='pt'?'Saída':'Exit');}
 textoJato(){return ui.origem==='agencia'?(currentLang==='pt'?'Etapas concluídas · volte ao jato e pressione E para encerrar':'Steps complete · return to the jet and press E to finish'):(currentLang==='pt'?'Etapas concluídas · vá até a saída e pressione E para encerrar':'Steps complete · go to the exit and press E to finish');}
 avisarJato(){ui.showNotification(this.textoJato(),'info');}
 alvoDoJato(){
  if(!this.jato)return null;
  if(this.piso===PISO_PADRAO)return {x:this.jato.x,y:this.jato.y};
  const e=proximaEscada(this.definicao.campo,this.piso,PISO_PADRAO);
  return e?{x:e.x+.5,y:e.y+.5}:null;
 }
 jatoPerto(){const T=CONFIG.TILE_SIZE;return !!this.jato&&this.piso===PISO_PADRAO&&Math.hypot(this.player.x/T-this.jato.x,this.player.y/T-this.jato.y)<2.6;}
 interagirJato(){
  if(this.bloqueado()||!this.jato)return;
  const inv=ui.investigacao;
  if(inv.proximaCenaCampo()<this.pontosInvestigacao.length){ui.showNotification(currentLang==='pt'?'Ainda faltam etapas da investigação.':'Some steps of the investigation are still open.','info');return;}
  if(!this.jatoPerto()){ui.showNotification(currentLang==='pt'?'Aproxime-se do '+this.rotuloJato().toLowerCase()+' para encerrar.':'Move closer to the '+this.rotuloJato().toLowerCase()+' to finish.','info');return;}
  inv.abrirCampo();inv.fichaFinal();
 }
 criarJato(candidatas,usadas){
  this.jato=null;if(this.piso!==PISO_PADRAO)return;
  const T=CONFIG.TILE_SIZE,ini=this.mapData.playerStart;
  const livre=candidatas.filter(q=>usadas.every(u=>Math.hypot(q.x-u.x,q.y-u.y)>1.8)&&Math.hypot(q.x-ini.x,q.y-ini.y)>=3).sort((a,b)=>Math.hypot(a.x-ini.x,a.y-ini.y)-Math.hypot(b.x-ini.x,b.y-ini.y))[0];
  if(!livre)return;
  usadas.push(livre);
  const c=this.add.container(livre.x*T,livre.y*T).setDepth(6),halo=this.add.circle(0,2,26,0xffd45a,.12).setStrokeStyle(1,0x8aa5b2,.5),g=this.add.graphics();
  g.lineStyle(2,0x3a2c00);g.fillStyle(0xffd86b);
  for(const m of [-1,1]){g.fillPoints([{x:6,y:m*5},{x:-6,y:m*24},{x:-14,y:m*24},{x:-6,y:m*5}],true);g.strokePoints([{x:6,y:m*5},{x:-6,y:m*24},{x:-14,y:m*24},{x:-6,y:m*5}],true);g.fillPoints([{x:-22,y:m*3},{x:-30,y:m*12},{x:-34,y:m*12},{x:-28,y:m*3}],true);}
  g.fillStyle(0xf2c230);g.fillEllipse(0,0,64,15);g.strokeEllipse(0,0,64,15);g.fillStyle(0x294754);g.fillEllipse(18,0,12,6);
  const nome=this.add.text(0,-34,this.rotuloJato(),{fontSize:'11px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#182a36',padding:{x:3,y:2}}).setOrigin(.5);
  c.add([halo,g,nome]);c.setSize(80,50).setInteractive({useHandCursor:true});c.on('pointerdown',()=>this.interagirJato());
  this.jato={x:livre.x,y:livre.y,obj:c,halo,nome};
 }
 // ---- personagens que andam: um ator por NPC; ao resolver a etapa dele, caminha até o ponto seguinte ----
 criarAtores(candidatas,usadas){
  this.atores={};const T=CONFIG.TILE_SIZE;
  this.pontosInvestigacao.forEach((q,i)=>{
   if(!q.npc)return;
   const a=this.atores[q.npc]||(this.atores[q.npc]={npc:q.npc,pontos:[],idx:null,andando:false,espera:1+Math.random()*2,md:null,ancora:null,dest:null});
   a.pontos.push(i);
  });
  const blocked=new Set(this.blockedTiles.filter(t=>this.mapData.map[t.y][t.x]!==3).map(t=>t.x+','+t.y));this.bloqueadosAtores=blocked;
  for(const a of Object.values(this.atores)){
   const c=this.add.container(0,0).setDepth(6),halo=this.add.circle(0,0,16,0xffd45a,.15).setStrokeStyle(2,0xffd45a,.85),img=this.add.image(0,4,'hospital_npc_'+a.npc).setScale(ESCALA_SPRITE).setOrigin(.5,.64);
   const nome=this.add.text(0,-30,NOMES[a.npc],{fontSize:'11px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#182a36',padding:{x:3,y:2}}).setOrigin(.5);
   c.add([halo,img,nome]);c.setSize(40,55).setInteractive({useHandCursor:true});c.setVisible(false);
   a.obj=c;a.halo=halo;a.img=img;a.px=0;a.py=0;
   c.on('pointerdown',()=>{const q=this.pontosInvestigacao[a.idx];if(q)this.interagirInvestigacao(q);});
  }
 }
 /** Ponto atual de cada ator: o primeiro ainda pendente; sem pendentes, fica no último. Mudou de ponto: caminha (mesmo andar) ou aparece (outro andar). */
 sincronizarAtores(inicial){
  if(!this.atores)return;const T=CONFIG.TILE_SIZE,n=ui.investigacao.proximaCenaCampo();
  for(const a of Object.values(this.atores)){
   const idx=a.pontos.find(i=>i>=n)??a.pontos[a.pontos.length-1];
   if(idx===a.idx)continue;
   const q=this.pontosInvestigacao[idx],antes=a.idx;a.idx=idx;
   if(q.fora){a.obj.setVisible(false);a.visivelAntes=false;continue;}
   const alvo={x:q.x,y:q.y};a.ancora=alvo;a.md=mapaDeDistancias(this.mapData.map,this.bloqueadosAtores,alvo);
   if(inicial||antes===null||!a.visivelAntes){a.px=q.x*T;a.py=q.y*T;a.obj.setPosition(a.px,a.py).setVisible(true);a.andando=false;}
   else{a.andando=true;a.obj.setVisible(true);}
   a.visivelAntes=true;
  }
 }
 moverAtores(delta){
  if(!this.atores)return;const T=CONFIG.TILE_SIZE,dt=Math.min(delta,60)/1000,W=this.mapCols;
  for(const a of Object.values(this.atores)){
   if(!a.obj.visible||!a.md||!a.ancora)continue;
   const k=(x,y)=>y*a.md.W+x,tx=Math.floor(a.px/T),ty=Math.floor(a.py/T);
   let dest=null,vel=84*(this.velAtores||1);
   if(a.andando){
    const d=a.md.dist.get(k(tx,ty));
    if(d===undefined){a.px=a.ancora.x*T;a.py=a.ancora.y*T;a.andando=false;}
    else if(d===0){dest={x:a.ancora.x*T,y:a.ancora.y*T};if(Math.hypot(dest.x-a.px,dest.y-a.py)<3){a.andando=false;a.espera=1+Math.random()*2;dest=null;}}
    else{let m=null;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const v=a.md.dist.get(k(tx+dx,ty+dy));if(v!==undefined&&v<d&&(m===null||v<m.v))m={x:tx+dx,y:ty+dy,v};}if(m)dest={x:(m.x+.5)*T,y:(m.y+.5)*T};else{a.andando=false;}}
   }else{
    a.espera-=dt;
    if(a.dest){dest=a.dest;vel=34;if(Math.hypot(dest.x-a.px,dest.y-a.py)<2){a.dest=null;a.espera=1.5+Math.random()*3.5;dest=null;}}
    else if(a.espera<=0){   // fica por perto: dá um passo para um tile vizinho livre (dentro de 2 passos do ponto) e depois espera
     const ax=Math.floor(a.ancora.x),ay=Math.floor(a.ancora.y),opcoes=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:ax+dx,y:ay+dy})).filter(o=>{const v=a.md.dist.get(k(o.x,o.y));return v!==undefined&&v<=1;});
     const o=opcoes[Math.floor(Math.random()*opcoes.length)];a.dest=o?{x:(o.x+.5)*T,y:(o.y+.5)*T}:null;a.espera=o?0:2;
    }
   }
   if(dest){
    const dx=dest.x-a.px,dy=dest.y-a.py,dist=Math.hypot(dx,dy),passo=vel*dt;
    if(dist<=passo){a.px=dest.x;a.py=dest.y;}else{a.px+=dx/dist*passo;a.py+=dy/dist*passo;}
    if(Math.abs(dx)>.5)a.img.setFlipX(dx<0);
    a.img.y=4+Math.sin(this.time.now/90)*1.6;
   }else a.img.y=4;
   a.obj.setPosition(a.px,a.py);
  }
 }
 interagirHospital(p){this.interagirInvestigacao(p);}
 instrutorPerto(){const T=CONFIG.TILE_SIZE;return (this.instrutores||[]).slice().sort((a,b)=>Math.hypot(this.player.x/T-a.x,this.player.y/T-a.y)-Math.hypot(this.player.x/T-b.x,this.player.y/T-b.y))[0];}
 conversarInstrutor(ins){
  if(this.bloqueado()||!ins)return;const T=CONFIG.TILE_SIZE;
  if(Math.hypot(this.player.x/T-ins.x,this.player.y/T-ins.y)>2){ui.showNotification(currentLang==='pt'?'Aproxime-se para conversar com o instrutor.':'Move closer to talk to the instructor.','info');return;}
  GameState.modalAberto=true;
  abrirTreino(ins,currentLang,(r)=>{GameState.modalAberto=false;if(r.concluido){this.hudInvestigacao=null;ui.showNotification((currentLang==='pt'?'Treino de segurança concluído · ':'Safety training complete · ')+ins.lab[currentLang],'success');this.atualizarObjetivo();}});
 }
 handleIdentify(){
  const T=CONFIG.TILE_SIZE,d=(o)=>o?Math.hypot(this.player.x/T-o.x,this.player.y/T-o.y):99,ins=this.instrutorPerto(),p=this.maisPerto();
  if(ins&&d(ins)<2&&(d(p)>=2||d(ins)<=d(p))){this.conversarInstrutor(ins);return;}
  if(ui.investigacao.proximaCenaCampo()>=this.pontosInvestigacao.length){if(this.jatoPerto())this.interagirJato();else this.avisarJato();return;}
  this.interagirInvestigacao();
 }
 revisarLicao(){this.handleIdentify();}
 drawMinimap(){super.drawMinimap();if(!this.minimapCtx||!this.pontosInvestigacao)return;const g=this.minimapCtx,k=this.mmEscala,n=ui.investigacao.proximaCenaCampo();(this.instrutores||[]).forEach(i=>{g.fillStyle=treinoFeito(i.id)?'#63d8ba':'#3fa18c';g.fillRect((i.x-.25)*k,(i.y-.25)*k,k*.5,k*.5);});this.pontosInvestigacao.forEach((p,i)=>{if(!p.obj.visible)return;g.fillStyle=i===n?'#ffd45a':'#8ab5c6';g.fillRect((p.x-.3)*k,(p.y-.3)*k,k*.6,k*.6);});(this.campo.escadas||[]).forEach(e=>{g.fillStyle='#ffffff';g.beginPath();g.moveTo((e.x+.5)*k,(e.y-.2)*k);g.lineTo((e.x+1.2)*k,(e.y+1.1)*k);g.lineTo((e.x-.2)*k,(e.y+1.1)*k);g.closePath();g.fill();});}
 // ---- escadas entre pisos ----
 alvoDoObjetivo(p){
  if(!p)return null;
  if(!p.fora)return {x:p.x,y:p.y};
  const e=proximaEscada(this.definicao.campo,this.piso,pisoDoLocal(p));
  return e?{x:e.x+.5,y:e.y+.5}:null;
 }
 criarEscadas(){
  this.escadasObj=[];const T=CONFIG.TILE_SIZE;
  for(const e of this.campo.escadas||[]){
   const c=this.add.container((e.x+.5)*T,(e.y+.5)*T).setDepth(3),g=this.add.graphics(),w=T*1.5,h=T*1.5;
   g.fillStyle(0x3c4a52);g.fillRoundedRect(-w/2,-h/2,w,h,4);
   for(let i=0;i<5;i++){g.fillStyle(i%2?0xb9c3c8:0x8d9aa1);g.fillRect(-w/2+4,-h/2+4+i*(h-8)/5,w-8,(h-8)/5-1);}
   g.lineStyle(2,0xffd45a);g.strokeRoundedRect(-w/2,-h/2,w,h,4);
   const nivel=(id)=>this.definicao.campo.pisos?.[id]?.nivel??0;
   const seta=this.add.text(0,0,nivel(e.para)>nivel(this.piso)?'▲':'▼',{fontSize:'16px',fontFamily:'Arial',color:'#182a36'}).setOrigin(.5);
   const nome=this.add.text(0,-h/2-9,nomeDoPiso(this.definicao.campo,e.para,currentLang),{fontSize:'11px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#182a36',padding:{x:3,y:2}}).setOrigin(.5);
   c.add([g,seta,nome]);this.escadasObj.push({...e,obj:c});
  }
 }
 verificarEscadas(){
  if(this.transicao||this.bloqueado()||!this.player)return;
  const T=CONFIG.TILE_SIZE,px=this.player.x/T,py=this.player.y/T,esc=this.campo.escadas||[];
  if(this.escadaTravada){   // acabou de chegar: só destrava depois de se afastar das escadas
    if(!esc.some(e=>Math.hypot(px-(e.x+.5),py-(e.y+.5))<=RAIO_LIBERA))this.escadaTravada=false;
    return;
  }
  const e=escadaSobre(esc,px,py);if(e)this.subirOuDescer(e);
 }
 subirOuDescer(e){
  this.transicao=true;
  const base={mission:this.missaoBase,piso:e.para,chegada:e.chegada};
  const cam=this.cameras.main;cam.fadeOut(220,10,15,20);
  cam.once('camerafadeoutcomplete',()=>{this.scene.restart(base);});
 }
 /** Faixa "1º andar" que aparece e some sozinha após subir/descer; o andar fica também no rastreador e no objetivo (texto, não só cor). */
 mostrarAndar(){
  const nome=nomeDoPiso(this.definicao.campo,this.piso,currentLang),w=this.cameras.main.width;
  const faixa=this.add.text(w/2,56,nome,{fontSize:'22px',fontFamily:'Orbitron',color:'#f6f6e9',backgroundColor:'#182a36',padding:{x:18,y:8}}).setOrigin(.5).setScrollFactor(0).setDepth(9000).setAlpha(0);
  this.tweens.add({targets:faixa,alpha:1,y:64,duration:260,hold:1100,yoyo:true,onComplete:()=>faixa.destroy()});
 }
 update(time,delta){if(this.transicao)return;super.update(time,delta);this.moverAtores(delta);this.verificarEscadas();}   // durante o fade o jogador não anda (não reimplementa handleMovement: o hospital herda o da GameScene)
 restartMission(){ui.abrirInvestigacao(this.definicao.id);}
}
