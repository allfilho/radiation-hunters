// Treinamento de segurança no laboratório de cronologia: instrutores (NPCs), passos, pergunta, selo e aviso; nunca bloqueia o uso.
import test from 'node:test';
import assert from 'node:assert/strict';
import { servidor, abrirNavegador, novaPagina } from './helpers/navegador.mjs';

async function tempo(fn, idioma = 'pt') {
    const srv = await servidor(), nav = await abrirNavegador();
    try {
        const r = await novaPagina(nav, srv.url + '?investigacao=tempo', { idioma });
        await r.pg.waitForFunction(() => window.gameScene?.instrutores?.length === 7, null, { timeout: 30000 });
        await fn(r);
        assert.deepEqual(r.erros, []);
    } finally { await nav.close(); await srv.fechar(); }
}
const nPassos = async (pg) => +/(?:de|of) (\d+)/.exec(await pg.$eval('.treino-content', (e) => e.textContent))[1];
const ir = (pg, id) => pg.evaluate((i) => { const s = window.gameScene, p = s.instrutores.find((q) => q.id === i); s.player.setPosition(p.x * 32, p.y * 32 + 20); return true; }, id);

test('sete instrutores aparecem; conversar abre o treino, erro dá retorno e acerto registra o selo', async () => {
    await tempo(async ({ pg }) => {
        assert.equal(await pg.evaluate(() => window.gameScene.instrutores.every((i) => i.obj.visible)), true);
        await ir(pg, 'lab1');
        await pg.evaluate(() => window.gameScene.handleIdentify());
        assert.equal(await pg.$eval('#treino-modal', (e) => e.classList.contains('active')), true);
        assert.equal(await pg.evaluate(() => window.GameState?.modalAberto ?? true), true);
        for (let i = 1; i <= 4; i++) { assert.match(await pg.$eval('.treino-content', (e) => e.textContent), new RegExp('Passo ' + i + ' de 4')); await pg.click('.treino-content .licao-primario'); }
        assert.match(await pg.$eval('.treino-content', (e) => e.textContent), /Guia de segurança do laboratório/);
        const opcoes = await pg.$$('.treino-content .licao-opcao'); assert.equal(opcoes.length, 3);
        await opcoes[1].click();
        assert.match(await pg.$eval('.treino-content .enc-reforco', (e) => e.textContent), /Tente de novo/);
        assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('rh_treinos_seguranca_v1') || '[]').length), 0);
        await (await pg.$$('.treino-content .licao-opcao'))[0].click();
        await pg.click('.treino-content .ok-btn');
        assert.equal(await pg.$eval('#treino-modal', (e) => e.classList.contains('active')), false);
        assert.deepEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('rh_treinos_seguranca_v1'))), ['lab1']);
        await pg.evaluate(() => window.gameScene.atualizarObjetivo());
        assert.match(await pg.$eval('#sources-tracker', (e) => e.textContent), /treinos 1\/7/);
    });
});

test('equipamento sem treino mostra aviso e continua utilizável; depois do treino o aviso some; Esc fecha sem registrar', async () => {
    await tempo(async ({ pg }) => {
        const perto = (tipo) => pg.evaluate((t) => { const s = window.gameScene, f = s.furniture.find((q) => q.type.id === t); s.player.setPosition(f.centerX, f.centerY + 40); s.updateFurnitureInfo(); return s.furnitureInfoText.text; }, tipo);
        assert.match(await perto('saw'), /treino de segurança pendente \(Bia\)/);
        assert.match(await perto('furnace'), /pendente \(Otto\)/);
        assert.match(await perto('printer3d'), /pendente \(Íris\)/);
        assert.equal(await pg.evaluate(() => window.gameScene.bloqueado()), false);
        await ir(pg, 'lab2'); await pg.evaluate(() => window.gameScene.handleIdentify());
        await pg.keyboard.press('Escape');
        assert.equal(await pg.$eval('#treino-modal', (e) => e.classList.contains('active')), false);
        assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('rh_treinos_seguranca_v1') || '[]').length), 0);
        await pg.evaluate(() => window.gameScene.atualizarObjetivo());
        assert.equal(await pg.evaluate(() => window.gameScene.bloqueado()), false);
        // conclui o treino do Lab 2 e confere que o aviso do forno some
        await ir(pg, 'lab2'); await pg.evaluate(() => window.gameScene.handleIdentify());
        const n = await nPassos(pg); for (let i = 0; i < n; i++) await pg.click('.treino-content .licao-primario');
        await (await pg.$$('.treino-content .licao-opcao'))[0].click(); await pg.click('.treino-content .ok-btn');
        assert.doesNotMatch(await perto('furnace'), /pendente/);
        assert.match(await perto('saw'), /pendente \(Bia\)/);
    });
});

test('treino em inglês e os sete treinos de ponta a ponta', async () => {
    await tempo(async ({ pg }) => {
        for (const id of ['lab1', 'lab2', 'lab3', 'lab4', 'lab5a', 'lab5b', 'lab5c']) {
            await ir(pg, id); await pg.evaluate(() => window.gameScene.handleIdentify());
            assert.match(await pg.$eval('.treino-content', (e) => e.textContent), /Safety training/);
            const n = await nPassos(pg); for (let i = 0; i < n; i++) await pg.click('.treino-content .licao-primario');
            await (await pg.$$('.treino-content .licao-opcao'))[0].click(); await pg.click('.treino-content .ok-btn');
        }
        assert.equal(await pg.evaluate(() => JSON.parse(localStorage.getItem('rh_treinos_seguranca_v1')).length), 7);
        await pg.evaluate(() => window.gameScene.atualizarObjetivo());
        assert.match(await pg.$eval('#sources-tracker', (e) => e.textContent), /training 7\/7/);
    }, 'en');
});

test('o treino não atrapalha o percurso da investigação: o primeiro ponto continua sendo o da Lara', async () => {
    await tempo(async ({ pg }) => {
        const r = await pg.evaluate(() => { const s = window.gameScene, p = s.pontosInvestigacao[0]; s.player.setPosition(p.x * 32, p.y * 32 + 20); return { n: s.pontosInvestigacao.length, perto: s.maisPerto().id, ins: Math.hypot(s.player.x / 32 - s.instrutorPerto().x, s.player.y / 32 - s.instrutorPerto().y) > 2 }; });
        assert.equal(r.n, 15); assert.equal(r.perto, 'pergunta-tempo'); assert.equal(r.ins, true);
    });
});
