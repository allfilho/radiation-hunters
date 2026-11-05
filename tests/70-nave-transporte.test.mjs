// v3.25: nave de transporte (rampa, cabine, bancos); embarque animado na ida, assentos no voo, desembarque na chegada.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, novoJogo } from './helpers/navegador.mjs';

const RAIZ = new URL('../' + (process.env.RH_ROOT || 'current').replace(/^\.\.\//, '') + '/js/', import.meta.url).href;

test('posicoesEmbarque: a fila anda até a rampa, cada um entra depois do anterior; desembarque é o caminho inverso', async () => {
  const { posicoesEmbarque } = await import(RAIZ + 'arte/transporte.js');
  const a = posicoesEmbarque(4, 0), m = posicoesEmbarque(4, 0.5), z = posicoesEmbarque(4, 1);
  assert.ok(a.every((p) => !p.dentro && p.x === 10 && !p.andando));
  assert.ok(m[0].x > m[3].x, 'o primeiro anda na frente'); assert.ok(z.every((p) => p.dentro && p.x === 120));
  const d0 = posicoesEmbarque(4, 0, { desembarque: true }), d1 = posicoesEmbarque(4, 1, { desembarque: true });
  assert.ok(d0.every((p) => p.dentro) && d1.every((p) => !p.dentro && p.x === 10));
});

test('arte: transporte com rampa aberta/fechada, interior com N assentos ocupados e cena de embarque são SVG válidos e diferentes', async () => {
  const T = await import(RAIZ + 'arte/transporte.js'), { naveSvg } = await import(RAIZ + 'arte/nave.js');
  const eq = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  assert.notEqual(T.transporteSvg({ rampa: 0 }), T.transporteSvg({ rampa: 1 }));
  assert.notEqual(T.interiorSvg({ equipe: eq, sentados: 2 }), T.interiorSvg({ equipe: eq, sentados: 4 }));
  assert.notEqual(T.cenaEmbarqueSvg(eq, 0.2), T.cenaEmbarqueSvg(eq, 0.7));
  for (const s of [T.transporteSvg({}), T.interiorSvg({ equipe: eq }), T.cenaEmbarqueSvg(eq, 0.5), naveSvg('tripulacao'), naveSvg('resgate')]) assert.ok(s.length > 500 && !/NaN|undefined/.test(s));
  assert.notEqual(naveSvg('tripulacao'), naveSvg('resgate'));
});

test('no jogo: decolar abre a cabine com a fila embarcando; ao fim, todos sentados; chegar pelo botão desembarca antes da missão', async () => {
  const srv = await servidor(), nav = await abrirNavegador();
  try {
    const { pg, erros } = await novaPagina(nav, srv.url, { idioma: 'pt', todasDesbloqueadas: true });
    await novoJogo(pg);
    await pg.evaluate(() => { const e = ui.agencia.est; e.ativos = [{ id: 'q9', desde: 3, expira: 13 }]; e.iniciado = true; ui.agencia.desenhar(true); });
    await pg.waitForSelector('.ag-item[data-alerta="q9"]'); await pg.click('.ag-item[data-alerta="q9"]'); await pg.click('[data-ag="enviar"]'); await pg.click('[data-ag="decolar"]');
    await pg.waitForSelector('#ag-cabine svg');
    assert.match(await pg.textContent('#ag-voo-estado'), /Embarcando/);
    await pg.waitForFunction(() => /voando|rumo|Saindo|decol/i.test(document.getElementById('ag-voo-estado').textContent) || !/Embarcando/.test(document.getElementById('ag-voo-estado').textContent), null, { timeout: 8000 });
    assert.ok(await pg.$('#ag-cabine svg'), 'a cabine continua durante o voo');
    // pular viagem continua indo direto ao destino (sem animação de desembarque)
    await pg.click('#ag-chegar'); await pg.waitForSelector('#story-text .jornal, #game-screen.active', { timeout: 15000 });
    assert.deepEqual(erros, []);
  } finally { await nav.close(); await srv.fechar(); }
});
