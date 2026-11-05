// Comportamento do caderno e requisitos novos; sem presumir aprendizagem pelo acerto guiado.
import test from 'node:test';
import assert from 'node:assert/strict';
import {servidor,abrirNavegador,novaPagina} from './helpers/navegador.mjs';
import {criarSessao,montarFicha,resolver,avaliarOpcao,registrarHipotese,avaliarCartoes} from '../current/js/investigacao/motor.js';
import {HOSPITAL} from '../current/js/investigacao/hospital.js';

test('respostas guiadas sozinhas não concluem hospital sem observações do modelo',()=>{
 const s=criarSessao(HOSPITAL),inv=resolver(HOSPITAL,'pt');
 for(const c of inv.cenas){
  if(c.tipo==='registro')registrarHipotese(s,c,'b');
  if(c.tipo==='escolha'){avaliarOpcao(s,c,'principal',c.opcoes.find(o=>o.ok).id);if(c.evidencia)avaliarOpcao(s,c,'evidencia',c.evidencia.opcoes.find(o=>o.ok).id);}
  if(c.tipo==='cartoes')avaliarCartoes(s,c,c.cartoes.filter(o=>o.ok).map(o=>o.id));
 }
 assert.equal(montarFicha(s,HOSPITAL,'pt').concluida,false);
 for(const cena of HOSPITAL.observacoesObrigatorias)for(const emissao of [true,false])s.observacoesCampo.push({cena,emissao,texto:{pt:'Observação de teste',en:'Test observation'}});
 assert.equal(montarFicha(s,HOSPITAL,'pt').concluida,true,'sem texto livre: as escolhas e as observações bastam');
});

test('modelo exige dois estados, não duplica observações, conserva caderno e móveis específicos',async()=>{
 const srv=await servidor(),nav=await abrirNavegador();
 try{
  const {pg,ctx,erros}=await novaPagina(nav,srv.url+'?investigacao=hospital',{idioma:'pt'});
  await pg.waitForSelector('#inv-caderno');
  const ids=await pg.evaluate(()=>window.gameScene.furniture.map(f=>f.type.id));
  for(const id of ['reception_desk','waiting_seats','xray_unit','wall_detector','display_case','school_mural','work_table','gamma_camera','staff_sink'])assert.ok(ids.includes(id),id);
  await pg.click('#inv-caderno');assert.match(await pg.textContent('.inv-corpo'),/Investigação em andamento/);assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.concluida),false);
  await pg.click('#inv-voltar-mapa');await pg.click('#inv-modo-leitura');await pg.click('.inv-opcao[data-id="c"]');await pg.click('#inv-continuar');
  assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(),0);
  await pg.click('#inv-registrar-observacao');await pg.click('#inv-registrar-observacao');
  assert.equal(await pg.locator('#inv-observacoes li').count(),1);assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(),0);
  await pg.click('#inv-liga');assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(),0);
  await pg.click('#inv-registrar-observacao');assert.equal(await pg.locator('#inv-observacoes li').count(),2);assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(),3);
  await pg.click('.inv-opcao[data-id="tubo"]');
  // Sair entre interpretação e evidência não obriga a responder de novo à interpretação.
  await pg.click('#inv-voltar-mapa');await pg.click('#inv-modo-leitura');
  assert.equal(await pg.locator('.inv-opcao[data-id="tubo"]').count(),0);
  await pg.click('.inv-opcao[data-id="liga"]');await pg.click('#inv-continuar');
  await pg.click('#inv-voltar-mapa');await pg.click('#inv-caderno');
  assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.observacoesCampo.length),2);assert.equal(await pg.evaluate(()=>ui.investigacao.ficha.concluida),false);
  assert.deepEqual(erros,[]);await ctx.close();
 }finally{await nav.close();await srv.fechar();}
});

test('recarregar hospital reinicia a sessão e volta a inicializar mapa e controles',async()=>{
 const srv=await servidor(),nav=await abrirNavegador();
 try{
  const {pg,ctx,erros}=await novaPagina(nav,srv.url+'?investigacao=hospital',{idioma:'pt'});
  await pg.waitForSelector('#inv-caderno');await pg.reload();
  await pg.waitForFunction(()=>window.gameScene?.pontosHospital?.length===7);
  assert.equal(await pg.isVisible('#inv-caderno'),true);
  assert.equal(await pg.evaluate(()=>ui.investigacao.proximaCenaCampo()),0);
  assert.equal(await pg.evaluate(()=>document.getElementById('game-screen').inert),false);
  assert.deepEqual(erros,[]);await ctx.close();
 }finally{await nav.close();await srv.fechar();}
});
