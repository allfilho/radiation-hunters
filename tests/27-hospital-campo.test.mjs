// A investigação usa a cena, gerador, controles e câmera do jogo existente.
import test from 'node:test';
import assert from 'node:assert/strict';
import { encerrarNoJato } from './helpers/jato.mjs';
import { servidor, abrirNavegador, novaPagina, iniciarMissao } from './helpers/navegador.mjs';

async function hospital(fn, opcoes={}){
 const srv=await servidor(),nav=await abrirNavegador();
 try{const r=await novaPagina(nav,srv.url+'?investigacao=hospital',{idioma:'pt',...opcoes});await r.pg.waitForFunction(()=>window.gameScene?.pontosHospital?.length===7);await fn(r);assert.deepEqual(r.erros,[]);await r.ctx.close();}
 finally{await nav.close();await srv.fechar();}
}

test('hospital herda mapa, mobiliário, personagem, movimento, colisão e câmera da GameScene',async()=>{
 await hospital(async({pg})=>{
  const r=await pg.evaluate(async()=>{
   const {GameScene}=await import('./js/scenes/GameScene.js');const s=window.gameScene;
   return {iguais:['drawMap','createPlayer','handleMovement','isBlocked','ajustarCamera','setupInput'].map(k=>s[k]===GameScene.prototype[k]),tema:s.mapData.themeName,ativo:s.mapData.theme.hospitalAtivo,cols:s.mapCols,rows:s.mapRows,canvases:document.querySelectorAll('#game-container canvas').length,old:!!document.getElementById('inv-hospital-palco'),fontes:s.sources.length,zonas:s.mapData.specialZones.length,pontos:s.pontosHospital.map(p=>({id:p.id,livre:!s.isBlocked(p.x*32,p.y*32)}))};
  });
  assert.ok(r.iguais.every(Boolean));assert.equal(r.tema,'hospital');assert.equal(r.ativo,true);assert.equal(r.cols,52);assert.equal(r.rows,40);assert.equal(r.canvases,1);assert.equal(r.old,false);assert.equal(r.fontes,0);assert.equal(r.zonas,0);assert.ok(r.pontos.every(p=>p.livre));
  const x=await pg.evaluate(()=>window.gameScene.player.x);await pg.keyboard.down('d');await pg.waitForTimeout(250);await pg.keyboard.up('d');assert.ok(await pg.evaluate(x=>window.gameScene.player.x>x+10,x));
  assert.equal(await pg.isVisible('#btn-identify'),true);
 });
});

test('percurso por NPCs/objetos, retornos ao mesmo mapa, ficha final, saída e missão comum sem efeitos residuais',async()=>{
 await hospital(async({pg})=>{
  const cena=async(i)=>{
   // Robô posicionado junto ao ponto real; movimento de teclado é verificado separadamente.
   await pg.evaluate(()=>{window.gameScene.velAtores=25;});
   await pg.waitForFunction(i=>{const s=window.gameScene,p=s.pontosHospital[i],a=p.npcPonto&&s.atores[p.npc];return !a||!a.andando;},i,{timeout:20000});   // o NPC termina de caminhar até o ponto
   await pg.evaluate(i=>{const s=window.gameScene,p=s.pontosHospital[i];s.player.setPosition(p.x*32,p.y*32);},i);
   await pg.keyboard.press('e');await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
  };
  const op=async(id)=>pg.click(`.inv-opcao[data-id="${id}"]`);
  const seguir=async(i)=>{await pg.click('#inv-continuar');if(i<6){await pg.waitForSelector('#investigacao-screen.active',{state:'hidden'});assert.equal(await pg.evaluate(()=>GameState.modalAberto),false);assert.equal(await pg.evaluate(()=>window.gameScene.input.keyboard.enabled),true);}};
  for(let i=0;i<7;i++){
   await cena(i);
   if(i===0)await op('a');
   if(i===1){await pg.click('#inv-registrar-observacao');await pg.click('#inv-liga');await pg.click('#inv-registrar-observacao');await op('tubo');await op('liga');}
   if(i===2){await op('rx');await op('seta');}
   if(i===3){await pg.click('#inv-registrar-observacao');await pg.click('#inv-liga');await pg.click('#inv-registrar-observacao');await op('dif');await op('estado');}
   if(i===4){for(const id of ['c1','c2','c3','c4'])await pg.click(`.inv-cartao[data-id="${id}"]`);await pg.click('#inv-verificar');}
   if(i===5){await op('zero');await op('ok');}
   if(i===6){await op('ok');}
   await seguir(i);
  }
  await encerrarNoJato(pg);await pg.waitForSelector('#inv-menu');assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.concluida),true);assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.revisao),'revisada');assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.observacoesCampo.length),4);
  assert.ok(await pg.evaluate(()=>ui.investigacao.ficha.historico.some(r=>r.opcao==='zero'&&!r.correta)));
  await pg.evaluate(()=>ui.investigacao.voltarAoCampo());assert.equal(await pg.evaluate(()=>document.getElementById('game-screen').inert),false);assert.equal(await pg.evaluate(()=>ui.investigacao.proximaCenaCampo()),7);
  await pg.keyboard.press('e');await pg.waitForSelector('#inv-menu',{state:'visible'});await pg.click('#inv-menu');await pg.click('#btn-back-missions');
  await iniciarMissao(pg,1);assert.equal(await pg.evaluate(()=>window.gameScene.missionData.id),1);assert.equal(Boolean(await pg.$('#inv-modo-leitura')),false);assert.equal(await pg.evaluate(()=>document.getElementById('game-screen').classList.contains('hospital-investigacao')),false);
 });
});

test('celular: conversa cabe na tela, foco fica no diálogo e Escape retorna aos controles originais',async()=>{
 await hospital(async({pg})=>{
  await pg.evaluate(()=>{const s=window.gameScene,p=s.pontosHospital[0];s.player.setPosition(p.x*32,p.y*32);});
  await pg.keyboard.press('e');await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
  const antes=await pg.evaluate(()=>({x:window.gameScene.player.x,y:window.gameScene.player.y}));
  await pg.keyboard.press('d');assert.deepEqual(await pg.evaluate(()=>({x:window.gameScene.player.x,y:window.gameScene.player.y})),antes);
  for(let i=0;i<20;i++){await pg.keyboard.press('Tab');assert.equal(await pg.evaluate(()=>document.getElementById('investigacao-screen').contains(document.activeElement)),true);}
  const largura=await pg.evaluate(()=>({w:innerWidth,corpo:document.querySelector('.inv-corpo').getBoundingClientRect().width,scroll:document.documentElement.scrollWidth}));assert.ok(largura.corpo<=largura.w&&largura.scroll<=largura.w);
  await pg.keyboard.press('Escape');assert.equal(await pg.evaluate(()=>GameState.modalAberto),false);assert.equal(await pg.evaluate(()=>document.getElementById('game-screen').inert),false);assert.equal(await pg.evaluate(()=>window.gameScene.input.keyboard.enabled),true);
 },{viewport:{width:360,height:640}});
});
