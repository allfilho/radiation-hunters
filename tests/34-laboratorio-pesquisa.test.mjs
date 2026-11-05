// Laboratório de pesquisa: problemas sorteados com dados fictícios por semente, subconjunto de salas, Caderno com etapas.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { encerrarNoJato } from './helpers/jato.mjs';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';
import { gerarDados } from '../current/js/investigacao/sorteio-fissao.js';
import { resumoConjunto, resumoComprimentos, zetaCalculado } from '../current/js/investigacao/dados-fissao.js';
import { prepararProblema, PROBLEMAS, investigacaoPorId, INVESTIGACOES } from '../current/js/investigacao/index.js';
import { criarSessao, resolver, registrarHipotese, avaliarOpcao, registrarObservacao, montarFicha } from '../current/js/investigacao/motor.js';
import { observarAtividade } from '../current/js/investigacao/modelos.js';
import { MapGenerator } from '../current/js/mapa/gerador.js';

const IDS = ['pesquisa-datar', 'pesquisa-annealing', 'pesquisa-zeta', 'pesquisa-historia'];

test('sorteio: reprodutível por semente; ζ sai do padrão; amostra homogênea ou sobredispersa conforme pedido; histórias de comprimento', () => {
    assert.deepEqual(gerarDados(11), gerarDados(11));
    assert.notDeepEqual(gerarDados(11).graos, gerarDados(12).graos);
    const hist = new Set(), tipos = new Set();
    for (let s = 1; s <= 40; s++) {
        const d = gerarDados(s);
        assert.ok(Math.abs(zetaCalculado(d) - d.zeta) < 0.06, 'ζ vem do padrão: ' + s);
        const r = resumoConjunto(d.graos, d);
        assert.equal(r.homogeneo, d.amostraTipo === 'homogeneo');
        assert.ok(d.graos.every(([a, b]) => a >= 1 && b >= 25));
        const c = resumoComprimentos(d.comprimentos.amostra);
        if (d.historia === 'rapida') assert.ok(c.media > 13.8 && c.sd < 1.1, 'rápida ' + s); else assert.ok(c.media < 13.2 && c.sd > 1, d.historia + ' ' + s);
        assert.ok(d.annealing.every((v, i) => i === 0 || v < d.annealing[i - 1]) && d.annealing[0] < 1 && d.annealing[3] > 0.3);
        hist.add(d.historia); tipos.add(d.amostraTipo);
        assert.ok(Number.isFinite(d.verificacao.dif));
    }
    assert.equal(hist.size, 3); assert.equal(tipos.size, 2);
    assert.equal(gerarDados(5, { amostra: 'homogeneo' }).amostraTipo, 'homogeneo');
    assert.equal(gerarDados(5, { historia: 'reaquecimento' }).historia, 'reaquecimento');
});

test('quatro problemas: cenas, pontos de campo (um por cena, alcançáveis), subconjunto de salas e uma única resposta certa', () => {
    assert.deepEqual(PROBLEMAS.map((p) => p.id), IDS);
    assert.equal(INVESTIGACOES.length, 5, 'os problemas não viram cartões de investigação');
    const salasUsadas = { 'pesquisa-annealing': ['Lab 2', 'Lab 3', 'Lab 5'], 'pesquisa-zeta': ['Lab 1', 'Lab 4', 'Lab 5'] };
    for (const id of IDS) for (const semente of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
        const inv = prepararProblema(id, semente);
        assert.equal(inv.semente, semente); assert.equal(investigacaoPorId(id), inv);
        assert.deepEqual(inv.campo.locais.map((l) => l.id), inv.cenas.map((c) => c.id));
        assert.equal(new Set(inv.cenas.map((c) => c.id)).size, inv.cenas.length);
        for (const c of inv.cenas) {
            assert.match(c.titulo.pt, /^\d+ · /); assert.equal(c.titulo.pt.split(' · ')[0], String(inv.cenas.indexOf(c) + 1));
            if (c.tipo === 'escolha') assert.equal(c.opcoes.filter((o) => o.ok).length, 1, id + ':' + c.id + ' semente ' + semente);
            if (c.atividade) assert.ok(c.atividade.dados && c.atividade.estados.length >= 1);
            if (c.tipo === 'escolha') for (const o of c.opcoes) assert.ok(o.retorno.pt && o.retorno.en && o.txt.pt && o.txt.en);
        }
        if (salasUsadas[id]) { const txt = inv.cenas.map((c) => c.titulo.pt).join('|'); for (const lab of ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5']) if (!salasUsadas[id].includes(lab)) assert.doesNotMatch(txt, new RegExp(lab + '\\)'), id + ' não deveria usar ' + lab); }
        assert.ok(inv.cenas.some((c) => c.id === inv.cenaHipotese) && inv.cenas.some((c) => c.id === inv.cenaDecisao) && inv.cenas.some((c) => c.id === inv.cenaLimite));
    }
    // o annealing só usa os laboratórios 2, 3 e 5; o ζ não usa o Lab 2 nem o 3
    const an = prepararProblema('pesquisa-annealing', 1).cenas.map((c) => c.titulo.pt).join('|');
    assert.match(an, /Lab 2/); assert.doesNotMatch(an, /Lab 1\)|Lab 4\)/);
});

test('pontos de campo dos problemas são alcançáveis no mapa', () => {
    for (const id of IDS) {
        const inv = prepararProblema(id, 3), c = inv.campo;
        const m = { id: c.numero, mapTheme: c.tema, mapCols: c.planta.cols, mapRows: c.planta.rows, investigacaoCampo: c };
        const d = new MapGenerator(m.mapCols, m.mapRows, m.mapTheme, m).generate();
        const vis = new Set([d.playerStart.x + ',' + d.playerStart.y]), fila = [[d.playerStart.x, d.playerStart.y]];
        while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= d.map[0].length || ny >= d.map.length || vis.has(k) || d.map[ny][nx] === 1 || d.map[ny][nx] === 2) continue; vis.add(k); fila.push([nx, ny]); } }
        for (const l of c.locais) assert.ok([...vis].some((k) => { const [x, y] = k.split(',').map(Number); return Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y) < 1.6; }), id + ': ' + l.id + ' inalcançável');
    }
});

test('respostas dinâmicas: idade a reportar, interpretação dos comprimentos e verificação de ζ seguem os dados', () => {
    let vistos = { homog: 0, sobre: 0, rapida: 0, complexa: 0, compat: 0, incompat: 0 };
    for (let semente = 1; semente <= 60; semente++) {
        const inv = prepararProblema('pesquisa-historia', semente), D = inv.dados;
        const idade = inv.cenas.find((c) => c.id === 'idade-amostra'), comp = inv.cenas.find((c) => c.id === 'comprimentos-amostra');
        const r = resumoConjunto(D.graos, D);
        assert.equal(idade.opcoes.find((o) => o.ok).id, r.homogeneo ? 'pooled' : 'central'); r.homogeneo ? vistos.homog++ : vistos.sobre++;
        assert.equal(comp.opcoes.find((o) => o.ok).id, D.historia === 'rapida' ? 'rapido' : 'complexa'); D.historia === 'rapida' ? vistos.rapida++ : vistos.complexa++;
        const z = prepararProblema('pesquisa-zeta', semente), ver = z.cenas.find((c) => c.id === 'zeta-verifica');
        const compat = Math.abs(z.dados.verificacao.dif) <= 2; assert.equal(ver.opcoes.find((o) => o.ok).id, compat ? 'compativel' : 'recalibrar'); compat ? vistos.compat++ : vistos.incompat++;
    }
    for (const k of ['homog', 'sobre', 'rapida', 'complexa', 'compat']) assert.ok(vistos[k] > 3, k);
    // texto de retorno traz os números da amostra
    const inv = resolver(prepararProblema('pesquisa-historia', 4), 'pt'), comp = inv.cenas.find((c) => c.id === 'comprimentos-amostra');
    assert.match(comp.opcoes.find((o) => o.ok).retorno, /DP \d+,\d µm/);
});

test('observações usam o conjunto sorteado, em pt e en, sem ficar presas aos números do episódio padrão', () => {
    const D = gerarDados(21), padrao = observarAtividade('tabela', 'grao-a-grao');
    const a = observarAtividade('tabela', 'grao-a-grao', D), b = observarAtividade('contagem-grao', 'g1', D), m = observarAtividade('mica', 'atacada', D);
    assert.notEqual(a.texto.pt, padrao.texto.pt); assert.equal(a.dados.graos.length, 12);
    assert.match(b.texto.pt, new RegExp('Ns = ' + D.graos[0][0])); assert.match(m.texto.en, new RegExp('Ni = ' + D.graos[0][1]));
    for (const [t, e] of [['idade', 'amostra'], ['comprimentos', 'amostra'], ['annealing-medidas', '1000h'], ['zeta-verifica', 'padrao-b'], ['zeta', 'padrao']]) { const o = observarAtividade(t, e, D); assert.ok(o.texto.pt && o.texto.en && !/NaN|undefined/.test(o.texto.pt + o.texto.en), t); }
    assert.throws(() => observarAtividade('comprimentos', 'amostra'), /não tem comprimentos/);
});

test('motor: cada problema só conclui com observações de todos os estados e a ficha traz o sorteio', () => {
    for (const id of IDS) {
        const original = prepararProblema(id, 9), inv = resolver(original, 'pt'), s = criarSessao(original);
        for (const c of inv.cenas) {
            if (c.tipo === 'registro') registrarHipotese(s, c, c.opcoes.find((o) => o.naoSei).id);
            if (c.tipo === 'escolha') { avaliarOpcao(s, c, 'principal', c.opcoes.find((o) => o.ok).id); if (c.evidencia) avaliarOpcao(s, c, 'evidencia', c.evidencia.opcoes.find((o) => o.ok).id); }
        }
        assert.equal(montarFicha(s, original, 'pt').concluida, false);
        for (const c of original.cenas.filter((c) => c.atividade)) for (const estado of c.atividade.estados) assert.equal(registrarObservacao(s, c, { estado }), true);
        if (original.transferenciaObrigatoria) s.transferencia = { texto: 'Registro de teste: o que é observável e o que faltaria.', idioma: 'pt', antesDoRetorno: true };
        const f = montarFicha(s, original, 'pt');
        assert.equal(f.concluida, true, id); assert.deepEqual(f.sorteio, { problema: id, semente: 9 });
        assert.ok(f.observacoesCampo.every((o) => o.dados && o.texto.pt));
    }
});

async function comPagina(url, opcoes, fn) { const srv = await servidor(), nav = await abrirNavegador(); try { const r = await novaPagina(nav, srv.url + url, opcoes); await fn(r, srv); assert.deepEqual(r.erros, []); await r.ctx.close(); } finally { await nav.close(); await srv.fechar(); } }

for (const [id, semente, lang] of [['pesquisa-datar', 3, 'pt'], ['pesquisa-annealing', 5, 'pt'], ['pesquisa-zeta', 8, 'en'], ['pesquisa-historia', 12, 'en']]) {
    test(`${id} (semente ${semente}, ${lang}): percurso no mapa, Caderno com etapas marcadas e ficha com o sorteio`, async () => {
        const original = prepararProblema(id, semente), inv = resolver(original, lang);
        await comPagina(`?investigacao=${id}&semente=${semente}`, { idioma: lang, ...(lang === 'en' ? { viewport: { width: 360, height: 640 } } : {}) }, async ({ pg }) => {
            await pg.waitForFunction((i) => window.gameScene?.missionData.investigacao === i, id);
            assert.equal(await pg.evaluate(() => window.gameScene.pontosInvestigacao.length), inv.cenas.length);
            assert.equal(await pg.evaluate(() => ui.investigacao.invOriginal.semente), semente);
            for (let i = 0; i < inv.cenas.length; i++) {
                const c = inv.cenas[i];
                await pg.evaluate((k) => { const s = window.gameScene, p = s.pontosInvestigacao[k]; s.player.setPosition(p.x * 32, p.y * 32); }, i);
                await pg.keyboard.press('e'); await pg.waitForSelector('#investigacao-screen.active .inv-titulo');
                assert.equal(await pg.textContent('.inv-titulo'), c.titulo);
                assert.ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                if (c.atividade) {
                    assert.equal(await pg.locator('.inv-perguntas .inv-opcao').count(), 0);
                    for (const estado of c.atividade.estados) { await pg.click(`.inv-modelo-controles [data-estado="${estado}"]`); assert.ok((await pg.textContent('.inv-modelo-visor')).length > 5); await pg.click('#inv-registrar-observacao'); await pg.click('#inv-registrar-observacao'); }
                }
                if (c.tipo === 'registro') await pg.click(`.inv-opcao[data-id="${c.opcoes.find((o) => o.naoSei).id}"]`);
                if (c.tipo === 'escolha') { const errada = c.opcoes.find((o) => !o.ok); await pg.click(`.inv-opcao[data-id="${errada.id}"]`); assert.equal(await pg.isDisabled('#inv-continuar'), true); await pg.click(`.inv-opcao[data-id="${c.opcoes.find((o) => o.ok).id}"]`); }
                await pg.click('#inv-continuar');
                if (i < inv.cenas.length - 1) await pg.waitForSelector('#investigacao-screen.active', { state: 'hidden' });
            }
            await encerrarNoJato(pg); await pg.waitForSelector('#inv-etapas');
            assert.equal(await pg.locator('#inv-etapas li').count(), inv.cenas.length);
            assert.equal(await pg.locator('#inv-etapas li[data-feita="true"]').count(), inv.cenas.length);
            assert.match(await pg.textContent('.inv-ficha-bloco .inv-legenda'), new RegExp(String(semente)));
            const download = pg.waitForEvent('download'); await (async()=>{await pg.evaluate(()=>{document.getElementById('inv-prof').open=true;});return pg.click('#inv-baixar');})(); const f = JSON.parse(await fs.readFile(await (await download).path(), 'utf8'));
            assert.equal(f.concluida, true); assert.deepEqual(f.sorteio, { problema: id, semente });
        });
    });
}

test('menu: Laboratório de pesquisa com sorteio e os quatro problemas; o Caderno mostra etapas pendentes antes de concluir', async () => {
    await comPagina('', { idioma: 'pt' }, async ({ pg }) => {
        await pg.click('#btn-missions'); await pg.click('#aba-investigacoes');
        assert.equal(await pg.locator('.investigacao-card').count(), 5);
        assert.equal(await pg.locator('.pesquisa-card').count(), 1);
        assert.equal(await pg.locator('.pesquisa-problema').count(), 4); assert.equal(await pg.locator('#pesquisa-sortear').count(), 1);
        await pg.click('.pesquisa-problema[data-problema="pesquisa-annealing"]');
        await pg.waitForFunction(() => window.gameScene?.missionData.investigacao === 'pesquisa-annealing');
        assert.equal(await pg.evaluate(() => window.gameScene.pontosInvestigacao.length), 5);
        await pg.click('#inv-caderno'); await pg.waitForSelector('#inv-etapas');
        assert.equal(await pg.locator('#inv-etapas li[data-feita="true"]').count(), 0);
        assert.equal(await pg.locator('#inv-etapas li').count(), 5);
        await pg.click('#inv-voltar-mapa');
        await pg.click('#btn-pause'); await pg.click('#btn-menu').catch(() => {});
    });
});
