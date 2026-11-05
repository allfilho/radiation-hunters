// Partida completa da Academia, como um jogador: lições pelo painel, chaves, portas, Geiger, 5 fontes identificadas,
// tela de conclusão. Em 3 sementes. (O robô de 06-jogabilidade só entende o mapa compacto; este usa o mapa grande.)
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina, iniciarMissao, lerLicao } from './helpers/navegador.mjs';

let srv, nav;
before(async () => { srv = await servidor(); nav = await abrirNavegador(); });
after(async () => { await nav?.close(); await srv?.fechar(); });

const ir = (pg, x, y) => pg.evaluate(([x, y]) => { window.gameScene.player.setPosition(x * 32, y * 32); }, [x, y]);
const modalAtivo = (pg) => pg.$eval('#licao-modal', (e) => e.classList.contains('active'));

async function lerObjetivoEIr(pg) {
  // vai ao alvo do objetivo atual (teleporte; o caminho em si é coberto por 20-objetivo)
  await pg.waitForTimeout(350);
  return pg.evaluate(() => { const o = window.gameScene.objAtual; return o && { id: o.id, n: o.n, cor: o.cor, alvo: o.alvo }; });
}

for (const semente of [2, 5, 9]) {
  test(`partida completa (semente ${semente}): seguindo só o objetivo da tela até concluir`, async () => {
    const { pg, ctx, erros } = await novaPagina(nav, srv.url, { semEncontros: true, academia: true, semente });
    try {
      await iniciarMissao(pg, 1);
      const ordem = [];
      for (let passo = 0; passo < 40; passo++) {
        const o = await lerObjetivoEIr(pg);
        if (!o || o.id === 'fontes' || o.id === 'fim') break;
        ordem.push(o.id + (o.n ?? o.cor ?? ''));
        await ir(pg, o.alvo.x, o.alvo.y);
        await pg.waitForTimeout(450);
        if (await modalAtivo(pg)) {
          await lerLicao(pg);
          for (let k = 0; k < 6 && await modalAtivo(pg); k++) { await pg.click('.licao-opcao:not([disabled]) >> nth=0'); await pg.click('#licao-seguir'); }
        }
        if (o.id === 'porta') { await ir(pg, o.alvo.x - 0.8, o.alvo.y); await pg.waitForTimeout(500); }
      }
      assert.deepEqual(ordem, ['licao1', 'chaveazul', 'licao2', 'licao3', 'portaazul', 'geiger', 'licao4', 'chavevermelha', 'licao5', 'licao6', 'licao7', 'portavermelha', 'licao8'], `ordem seguida: ${ordem}`);
      const est = await pg.evaluate(() => ({ lic: window.gameScene.licoesFeitas.length, g: window.gameScene.temGeiger, portas: window.gameScene.portasEstado.map(p => p.aberta), obj: window.gameScene.objAtual.id }));
      assert.deepEqual(est, { lic: 8, g: true, portas: [true, true], obj: 'fontes' });
      // as 5 fontes: com todas as portas abertas, chega perto de cada móvel, mede com o Geiger e identifica
      const rel = await pg.evaluate(async () => {
        const { posicoesAlcancaveis } = await import('./js/fisica/acessibilidade.js');
        const s = window.gameScene, T = 32, rel = [];
        s.toggleGeiger();
        const blocked = new Set(s.blockedTiles.map(b => b.x + ',' + b.y));
        const alc = posicoesAlcancaveis({ cols: s.mapCols, rows: s.mapRows, blocked, inicio: { x: s.player.x, y: s.player.y }, tile: T });
        for (const src of s.sources.filter(q => !q.found)) {
          const r = s.rectDoMovel(src.furniture);
          const cands = alc.map(p => ({ ...p, d: Geiger.distanciaAoRetangulo(r, p.x, p.y) })).filter(c => c.d <= CONFIG.IDENTIFY_DISTANCE * 0.9).sort((a, b) => a.d - b.d).filter((_, i) => i % 3 === 0).slice(0, 80);
          let feito = false;
          for (const c of cands) {
            s.player.setPosition(c.x * T, c.y * T);
            const pm = Geiger.pontoMaisProximo(r, c.x, c.y);
            s.playerDirection = Math.atan2(pm.y - c.y, pm.x - c.x);
            s.janelaGeiger.reset();
            for (let i = 0; i < 15; i++) s.measureRadiation();
            if (s.currentReading <= CONFIG.BG_RADIATION * 2) continue;
            s.handleIdentify();
            if (!document.getElementById('identify-modal').classList.contains('active')) continue;
            const alvo = s.selectedFurniture.source;
            const btn = [...document.querySelectorAll('#isotope-buttons .isotope-btn')].find(b => b.dataset.name === alvo.name);
            if (!btn) return { erro: 'sem botão ' + alvo.name, rel };
            rel.push(alvo.name + '@sala' + (alvo.sala + 1));
            btn.click(); feito = true; break;
          }
          if (!feito) return { erro: 'não detectou ' + src.name + ' sala ' + (src.sala + 1), rel };
          if (s.sources.some(q => !q.found)) ui.hideModal('identify');
        }
        return { ok: true, rel };
      });
      assert.ok(rel.ok, JSON.stringify(rel));
      assert.equal(rel.rel.length, 5);
      // conclusão: o jogo agenda o modal final (9 s no jogo; aqui basta o estado de conclusão)
      assert.equal(await pg.evaluate(() => window.gameScene.concluindo), true, 'Academia concluída com 5 fontes e 8 lições');
      assert.deepEqual(erros, []);
    } finally { await ctx.close(); }
  });
}
