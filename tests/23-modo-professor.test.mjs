// Etapa 2: Phaser local, modo professor (?missao=N, ?estudo=1), versão visível e aproveitamento sem tempo.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';
import { lerParametros, VERSAO } from '../current/js/modo.js';
import { aproveitamento } from '../current/js/encontros/aproveitamento.js';

const RAIZ = process.env.RH_ROOT || path.resolve(import.meta.dirname, '../current');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

test('Phaser é servido pelo próprio site: sem CDN, arquivo idêntico ao pacote oficial 3.60.0', () => {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  assert.ok(html.includes('src="vendor/phaser.min.js"'));
  assert.ok(!/jsdelivr|unpkg|cdnjs/.test(html), 'não deve haver outro CDN de script');
  const pacote = path.resolve(import.meta.dirname, 'node_modules/phaser');
  assert.equal(JSON.parse(fs.readFileSync(path.join(pacote, 'package.json'), 'utf8')).version, '3.60.0');
  assert.equal(sha(path.join(RAIZ, 'vendor/phaser.min.js')), sha(path.join(pacote, 'dist/phaser.min.js')));
});

test('lerParametros: valida missão 1–8 e estudo; lixo vira padrão', () => {
  assert.deepEqual(lerParametros('', 8), { missao: null, estudo: false, investigacao: null });
  assert.deepEqual(lerParametros('?missao=3&estudo=1', 8), { missao: 3, estudo: true, investigacao: null });
  assert.deepEqual(lerParametros('?estudo=true', 8), { missao: null, estudo: true, investigacao: null });
  for (const ruim of ['?missao=0', '?missao=9', '?missao=abc', '?missao=', '?missao=-1', '?estudo=talvez']) {
    const r = lerParametros(ruim, 8);
    assert.equal(r.missao, null, ruim); assert.equal(r.estudo, false, ruim);
  }
});

test('aproveitamento: modo estudo ignora o tempo e reescala para 100; sem a opção nada muda', () => {
  const base = { precisao: 1, meta: 100, creditos: [1, 1, 1], cofre: [1] };
  const normalLento = aproveitamento({ ...base, tempo: 1000 });
  assert.ok(normalLento.total < 100);
  assert.ok(!('semTempo' in normalLento));
  const estudoLento = aproveitamento({ ...base, tempo: 1000, semTempo: true });
  const estudoRapido = aproveitamento({ ...base, tempo: 10, semTempo: true });
  assert.equal(estudoLento.total, 100); assert.equal(estudoRapido.total, 100);
  assert.equal(estudoLento.tempo, 0); assert.equal(estudoLento.semTempo, true);
  const s = estudoLento; assert.ok(Math.abs(s.fontes + s.encontros + s.cofre - s.total) < 0.11);
  const semEnc = aproveitamento({ precisao: 1, tempo: 500, meta: 100, encontrosAtivos: false, semTempo: true });
  assert.equal(semEnc.total, semEnc.maximo); assert.equal(semEnc.maximo, 68.8);
  assert.equal(aproveitamento({ ...base, tempo: 100 }).total, 100);
});

test('navegador: versão no menu; ?missao=3 abre a história da missão 3 direto; ?estudo=1 mostra o aviso', async () => {
  const s = await servidor(); const nav = await abrirNavegador();
  try {
    let r = await novaPagina(nav, s.url, { idioma: 'pt' });
    assert.ok((await r.pg.textContent('#versao-jogo')).includes(VERSAO));
    assert.ok(!(await r.pg.textContent('#versao-jogo')).includes('estudo'));
    assert.equal(await r.pg.$eval('#story-intro', (e) => e.classList.contains('active')), false);
    assert.deepEqual(r.erros, []);
    await r.ctx.close();

    r = await novaPagina(nav, s.url + '?missao=3&estudo=1', { idioma: 'pt' });
    await r.pg.waitForSelector('#story-intro.active');
    assert.equal(await r.pg.evaluate(() => GameState.currentMission.id), 3);
    assert.ok((await r.pg.textContent('#versao-jogo')).includes('Modo estudo'));
    assert.deepEqual(r.erros, []);
    await r.ctx.close();

    r = await novaPagina(nav, s.url + '?missao=99', { idioma: 'pt' });
    assert.equal(await r.pg.$eval('#story-intro', (e) => e.classList.contains('active')), false);
    await r.ctx.close();
  } finally { await nav.close(); await s.fechar?.(); }
});
