// v3.15.0: pessoas andam nos corredores da Base (CSS, sem sorteio), param com "reduzir movimento"; sons de clique não quebram sem áudio.
import test from 'node:test';
import assert from 'node:assert/strict';
import { planta } from '../current/js/arte/planta.js';
import { AudioManager } from '../current/js/audio.js';

test('planta: cada pessoa vem num grupo .ag-anda com deslocamento determinístico', () => {
  const pes = [{ cor: 'verde', i: 1 }, { cor: 'amarelo', i: 2 }];
  const a = planta('comando', { pessoas: pes }), b = planta('comando', { pessoas: pes });
  assert.equal(a, b, 'saída igual nas duas chamadas');
  assert.equal((a.match(/class="ag-anda"/g) || []).length, 2);
  assert.match(a, /--ag-dx:-?\d+px/);
  assert.ok(!/<g class="ag-anda"/.test(planta('vazio', { pessoas: pes })), 'bloco vazio não tem gente');
});

test('AudioManager.playClique: sem contexto de áudio não lança erro e aceita os 3 tipos', () => {
  const am = new AudioManager();
  for (const t of ['menu', 'sala', 'obra', 'inexistente']) assert.doesNotThrow(() => am.playClique(t));
});

test('AudioManager.playClique: com contexto falso cria osciladores e respeita a chave de efeitos', () => {
  const am = new AudioManager(); let n = 0;
  const no = () => ({ connect() {}, frequency: {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, start() {}, stop() {} });
  am.audioContext = { currentTime: 0, destination: {}, createOscillator() { n++; return no(); }, createGain: no };
  am.playClique('sala'); assert.equal(n, 2);
  am.efeitosLigados = false; am.playClique('sala'); assert.equal(n, 2, 'efeitos desligados: mudo');
});
