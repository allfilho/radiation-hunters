// Expansão sobre o mesmo framework; dados sintéticos e ausência de dados são tratados explicitamente.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {encerrarNoJato} from './helpers/jato.mjs';
import {servidor,abrirNavegador,novaPagina,iniciarMissao} from './helpers/navegador.mjs';
import {INVESTIGACOES,investigacaoPorId} from '../current/js/investigacao/index.js';
import {criarSessao,resolver,registrarHipotese,avaliarOpcao,avaliarCartoes,registrarObservacao,montarFicha} from '../current/js/investigacao/motor.js';
import {modeloAquisicao,compararRadon,modeloTracos} from '../current/js/investigacao/modelos.js';
const novos=INVESTIGACOES.slice(1);
const folhas=(o)=>{if(!o||typeof o!=='object')return [];if(typeof o.pt==='string'&&typeof o.en==='string'&&Object.keys(o).length===2)return [o];return Object.values(o).flatMap(folhas);};

test('cinco episódios: cadastro, PT/EN, locais próprios e critérios de conclusão explícitos',()=>{
 assert.equal(INVESTIGACOES.length,5);assert.equal(new Set(INVESTIGACOES.map(i=>i.id)).size,5);
 for(const inv of INVESTIGACOES){
  assert.equal(investigacaoPorId(inv.atalho),inv);assert.equal(new Set(inv.cenas.map(c=>c.id)).size,inv.cenas.length);
  assert.deepEqual(inv.campo.locais.map(l=>l.id),inv.cenas.map(c=>c.id));
  for(const f of folhas(inv))assert.ok(f.pt.trim()&&f.en.trim());
  for(const chave of ['cenaHipotese','cenaDecisao','cenaLimite'])assert.ok(inv.cenas.some(c=>c.id===inv[chave]));
  for(const c of inv.cenas){if(c.tipo==='escolha')assert.equal(c.opcoes.filter(o=>o.ok).length,1,c.id);if(c.atividade)assert.ok(c.atividade.estados.length>=1);}
 }
 assert.deepEqual(novos.map(i=>i.cenas.length),[6,7,15,9]);
});

test('modelo físico e dados: pausar aquisição não zera emissão; radônio muda de ordem; traços não produzem idade',()=>{
 assert.deepEqual(modeloAquisicao(false),{fonteEmite:true,aquisicaoAtiva:false,novosDados:false,leitura:null});
 const curto=compararRadon(false),longo=compararRadon(true);
 assert.equal(curto.diasTotais,30);assert.equal(longo.diasTotais,360);
 assert.ok(curto.mediaA<curto.mediaB);assert.ok(longo.mediaA>longo.mediaB);
 assert.equal(longo.periodos,12);assert.ok(longo.a.every(Number.isInteger)&&longo.b.every(Number.isInteger));assert.ok(Math.abs(longo.mediaA-longo.a.reduce((s,v)=>s+v,0)/12)<1e-9);assert.ok(curto.mediaB-curto.mediaA>20);assert.ok(longo.mediaA-longo.mediaB>5);assert.equal(longo.unidade,'Bq/m³');
 assert.equal(modeloTracos(true).mesmoConteudoU,true);assert.equal(modeloTracos(true).idadeCalculavel,false);assert.ok(modeloTracos(true).contagem<modeloTracos(false).contagem);
});

test('motor: acertos guiados não substituem os registros obrigatórios (sem texto livre)',()=>{
 for(const original of novos){const inv=resolver(original,'pt'),s=criarSessao(inv);
  for(const c of inv.cenas){
   if(c.tipo==='registro')registrarHipotese(s,c,c.opcoes.find(o=>o.naoSei).id);
   if(c.tipo==='escolha'){avaliarOpcao(s,c,'principal',c.opcoes.find(o=>o.ok).id);if(c.evidencia)avaliarOpcao(s,c,'evidencia',c.evidencia.opcoes.find(o=>o.ok).id);}
   if(c.tipo==='cartoes')avaliarCartoes(s,c,c.cartoes.filter(o=>o.ok).map(o=>o.id));
  }
  assert.equal(montarFicha(s,original,'pt').concluida,false);
  for(const c of inv.cenas.filter(c=>c.atividade)){
   assert.equal(registrarObservacao(s,c,{estado:'inexistente'}),false);
   for(const estado of c.atividade.estados){assert.equal(registrarObservacao(s,c,{estado}),true);assert.equal(registrarObservacao(s,c,{estado}),false);}
  }
  const f=montarFicha(s,original,'pt');assert.equal(f.concluida,true);assert.ok(f.observacoesCampo.every(o=>o.origem&&o.dados));assert.equal(f.investigacao,original.id);
 }
});

async function comPagina(id,opcoes,fn){const srv=await servidor(),nav=await abrirNavegador();try{const r=await novaPagina(nav,srv.url+(id?'?investigacao='+id:''),opcoes);await fn(r,srv);assert.deepEqual(r.erros,[]);await r.ctx.close();}finally{await nav.close();await srv.fechar();}}

for(const original of novos)for(const lang of ['pt','en'])test(`${original.id}: percurso no campo ${lang}${lang==='en'?' · 360×640':''}, exportação e reinício do episódio correto`,async()=>{
 await comPagina(original.atalho,{idioma:lang,...(lang==='en'?{viewport:{width:360,height:640}}:{})},async({pg})=>{
  const inv=resolver(original,lang);
  await pg.waitForFunction(id=>window.gameScene?.missionData.investigacao===id,original.id);
  const estrutura=await pg.evaluate(async()=>{const {GameScene}=await import('./js/scenes/GameScene.js');const s=window.gameScene;window.__episodio=s;return {metodos:['drawMap','createPlayer','handleMovement','isBlocked','ajustarCamera','setupInput'].map(k=>s[k]===GameScene.prototype[k]),fontes:s.sources.length,canvas:document.querySelectorAll('#game-container canvas').length,pontos:s.pontosInvestigacao.map(p=>({id:p.id,livre:p.fora||!s.isBlocked(p.x*32,p.y*32)}))};});   // pontos de outro piso (fora) não existem neste mapa
  assert.ok(estrutura.metodos.every(Boolean));assert.equal(estrutura.fontes,0);assert.equal(estrutura.canvas,1);assert.equal(estrutura.pontos.length,inv.cenas.length);assert.ok(estrutura.pontos.every(p=>p.livre));
  for(let i=0;i<inv.cenas.length;i++){
   const c=inv.cenas[i];
   // Robô caminha por diálogos reais; posicionamento junto ao ponto encurta somente o deslocamento.
   // pontos em outro piso (radônio, 1º andar): sobe ou desce a escada antes de posicionar
   const pisoAlvo=await pg.evaluate(i=>window.gameScene.pontosInvestigacao[i].piso||'terreo',i);
   for(let salto=0;salto<4&&await pg.evaluate(()=>window.gameScene.piso)!==pisoAlvo;salto++){
    await pg.evaluate(async pi=>{const {proximaEscada}=await import('./js/investigacao/pisos.js');const g=window.gameScene;g.subirOuDescer(proximaEscada(g.definicao.campo,g.piso,pi));},pisoAlvo);
    await pg.waitForFunction(()=>{const g=window.gameScene;return !g.transicao&&g.player&&g.pontosInvestigacao?.length&&g.cameras.main.fadeEffect?.isRunning===false;});
    await pg.waitForTimeout(300);
   }
   await pg.waitForFunction(pi=>{const g=window.gameScene;return g.piso===pi&&!g.transicao&&g.player&&g.pontosInvestigacao?.length&&g.cameras.main.fadeEffect?.isRunning===false;},pisoAlvo);
   await pg.evaluate(i=>{const s=window.gameScene,p=s.pontosInvestigacao[i];s.player.setPosition(p.x*32,p.y*32);},i);
   await pg.keyboard.press('e');await pg.waitForSelector('#investigacao-screen.active .inv-titulo');assert.equal(await pg.textContent('.inv-titulo'),c.titulo);
   const tamanho=await pg.evaluate(()=>({x:document.documentElement.scrollWidth,w:innerWidth}));assert.ok(tamanho.x<=tamanho.w);
   if(c.atividade){
    assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(),0);
    for(const estado of c.atividade.estados){await pg.click(`.inv-modelo-controles [data-estado="${estado}"]`);await pg.click('#inv-registrar-observacao');await pg.click('#inv-registrar-observacao');}
    assert.equal(await pg.locator('#inv-observacoes li').count(),c.atividade.estados.length);
    if(c.atividade.tipo==='serie-radon')assert.equal(await pg.locator('.inv-tabela tbody tr').count(),12);
    if(c.atividade.tipo==='aquisicao')assert.match(await pg.textContent('.inv-modelo-visor'),lang==='pt'?/Sem novos dados/:/No new data/);
   }
   assert.equal(await pg.locator('textarea').count(),0,'a investigação do campo não tem resposta dissertativa');
   if(c.tipo==='registro')await pg.click(`.inv-opcao[data-id="${c.opcoes.find(o=>o.naoSei).id}"]`);
   if(c.tipo==='escolha'){
    if(i===1){const errada=c.opcoes.find(o=>!o.ok);await pg.click(`.inv-opcao[data-id="${errada.id}"]`);assert.equal(await pg.isDisabled('#inv-continuar'),true);}
    await pg.click(`.inv-opcao[data-id="${c.opcoes.find(o=>o.ok).id}"]`);
    if(c.evidencia)await pg.click(`.inv-opcao[data-id="${c.evidencia.opcoes.find(o=>o.ok).id}"]`);
   }
   if(c.tipo==='cartoes'){for(const o of c.cartoes.filter(o=>o.ok))await pg.click(`.inv-cartao[data-id="${o.id}"]`);await pg.click('#inv-verificar');}
   await pg.click('#inv-continuar');
   if(i<inv.cenas.length-1){await pg.waitForSelector('#investigacao-screen.active',{state:'hidden'});assert.equal(await pg.evaluate(()=>window.gameScene===window.__episodio),true);}
  }
  await encerrarNoJato(pg);await pg.waitForSelector('#inv-menu');
  const download=pg.waitForEvent('download');await (async()=>{await pg.evaluate(()=>{document.getElementById('inv-prof').open=true;});return pg.click('#inv-baixar');})();const arquivo=await download;const f=JSON.parse(await fs.readFile(await arquivo.path(),'utf8'));
  assert.equal(f.concluida,true);assert.equal(f.investigacao,original.id);assert.equal(f.idioma,lang);assert.equal(f.transferencia,null);assert.ok(f.historico.some(r=>r.correta===false));
  assert.equal(f.observacoesCampo.length,inv.cenas.reduce((n,c)=>n+(c.atividade?.estados.length||0),0));
  await pg.evaluate(()=>ui.investigacao.voltarAoCampo());await pg.click('#btn-pause');await pg.click('#btn-restart');
  await pg.waitForFunction(id=>window.gameScene?.missionData.investigacao===id&&ui.investigacao.proximaCenaCampo()===0,original.id);
  assert.equal(await pg.locator('#inv-caderno').count(),1);assert.equal(await pg.evaluate(()=>ui.investigacao.sessao.observacoesCampo.length),0);
 });
});

test('menu troca entre cinco investigações e volta à missão comum sem botões ou estilo residuais',async()=>{
 await comPagina(null,{idioma:'pt'},async({pg})=>{
  await pg.click('#btn-missions');await pg.click('#aba-investigacoes');assert.equal(await pg.locator('.investigacao-card').count(),5);
  for(const inv of INVESTIGACOES){
   await pg.click(`.investigacao-card[data-investigacao="${inv.id}"]`);await pg.waitForFunction(id=>window.gameScene?.missionData.investigacao===id,inv.id);
   assert.equal(await pg.textContent('.mission-name'),inv.pt.titulo);
   await pg.click('#inv-caderno');await pg.click('#inv-menu');assert.equal(await pg.getAttribute('#aba-investigacoes','aria-selected'),'true');
  }
  await pg.click('#btn-back-missions');await iniciarMissao(pg,1);
  assert.equal(await pg.locator('#inv-caderno').count(),0);assert.equal(await pg.locator('#inv-modo-leitura').count(),0);assert.equal(await pg.evaluate(()=>document.getElementById('game-screen').classList.contains('investigacao-campo')),false);
 });
});
