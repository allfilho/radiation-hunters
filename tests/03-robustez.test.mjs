// Robustez: localStorage ausente, corrompido ou com tipos errados.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

async function com(opc, fn) {
  const p = await novaPagina(nav, srv.url, opc);
  try { return await fn(p); } finally { await p.ctx.close(); }
}
const cartoes = (pg) => pg.$$eval('#missions-container > *', (e) => e.length);

test('JSON corrompido no localStorage: o jogo abre e lista as 8 missões', () =>
  com({ antes: `try { localStorage.setItem('radiationHunters', '{ruim'); } catch (e) {}` }, async ({ pg, erros }) => {
    await pg.click('#btn-missions');
    assert.equal(await cartoes(pg), 8);
    assert.deepEqual(erros, []);
  }));

test('idioma salvo inválido é ignorado (cai no padrão en)', () =>
  com({ antes: `try { localStorage.setItem('radiationHuntersLang', 'es'); } catch (e) {}` }, async ({ pg, erros }) => {
    assert.equal(await pg.evaluate(() => currentLang), 'en');
    assert.deepEqual(erros, []);
  }));

test('configurações salvas parciais são mescladas com os padrões', () =>
  com({ antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1,2], settings: { soundVolume: 20 } })); } catch (e) {}` },
    async ({ pg }) => {
      const s = await pg.evaluate(() => GameState.settings);
      assert.deepEqual(s, { soundVolume: 20, musicVolume: 50, musicOn: true, soundOn: true, showHints: true, screenShake: true, encontros: true, revisao: false });
    }));

// ---- correções da etapa 3d (antes eram 'todo') ----
test('robustez: unlockedMissions com tipo errado não derruba a lista de missões', () =>
  com({ antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: 5, settings: null })); } catch (e) {}` },
    async ({ pg, erros }) => {
      await pg.click('#btn-missions');
      assert.deepEqual(erros, []);
      assert.equal(await cartoes(pg), 8);
    }));

test('robustez: localStorage bloqueado não gera erro na carga nem na troca de idioma', () =>
  com({ antes: `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('negado', 'SecurityError'); } });` },
    async ({ pg, erros }) => {
      await pg.click('.lang-btn[data-lang="pt"]');
      assert.deepEqual(erros, []);
      assert.equal(await pg.evaluate(() => currentLang), 'pt');
    }));

test('robustez: valores de configuração fora de faixa/tipo são saneados', () =>
  com({ antes: `try { localStorage.setItem('radiationHunters', JSON.stringify({ unlockedMissions: [1], settings: { soundVolume: 'alto', showHints: 'sim' } })); } catch (e) {}` },
    async ({ pg }) => {
      const s = await pg.evaluate(() => GameState.settings);
      assert.equal(typeof s.soundVolume, 'number');
      assert.equal(typeof s.showHints, 'boolean');
    }));
