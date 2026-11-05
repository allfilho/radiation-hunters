// Infraestrutura comum dos testes do Radiation Hunters.
// - Serve apps/radhunter/current por HTTP local (módulos ES exigem servidor).
// - Entrega o Phaser 3.60.0 do node_modules (a CDN não é necessária).
// - Responde vazio às fontes do Google (testes não dependem de rede).
// - Semeia Math.random (mulberry32) para o mapa e as leituras serem reprodutíveis.
// Os testes NUNCA alteram os arquivos do jogo.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ_TESTES = path.resolve(AQUI, '..');
export const RAIZ_JOGO = process.env.RH_ROOT
  || path.resolve(RAIZ_TESTES, '..', 'current');
const PHASER = fs.readFileSync(path.join(RAIZ_TESTES, 'node_modules/phaser/dist/phaser.min.js'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json' };

export function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]);
      if (p === '/') p = '/index.html';
      const f = path.join(RAIZ_JOGO, p);
      if (!f.startsWith(RAIZ_JOGO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        r.writeHead(404); return r.end();
      }
      r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      r.end(fs.readFileSync(f));
    }).listen(0, '127.0.0.1', () => ok({
      url: `http://127.0.0.1:${s.address().port}/`,
      fechar: () => new Promise((f) => s.close(f)),
    }));
  });
}

export async function abrirNavegador() {
  return chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--no-sandbox'],
  });
}

const SEMENTE = `
(() => { let a = (window.__SEED__ || 12345) >>> 0;
  Math.random = function () { a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;

/**
 * Abre uma página nova. opcoes:
 *  - todasDesbloqueadas: grava no localStorage as 8 missões liberadas
 *  - semEncontros: desliga os encontros (e libera as 8 missões só se todasDesbloqueadas) de aprendizado (testes de fluxo antigos)
 *  - antes: função (ou string) executada antes de qualquer script da página
 *  - idioma: 'en' | 'pt'
 *  - semente: número
 * Devolve { pg, ctx, erros } — erros acumula console.error e pageerror
 * (avisos do Phaser ficam em `avisos`).
 */
export async function novaPagina(navegador, url, opcoes = {}) {
  const ctx = await navegador.newContext({ viewport: opcoes.viewport || { width: 1280, height: 800 }, ...(opcoes.toque ? { hasTouch: true, isMobile: true } : {}) });
  const pg = await ctx.newPage();
  const erros = [], avisos = [];
  pg.on('console', (m) => {
    if (m.type() === 'error') erros.push('console.error: ' + m.text());
    if (m.type() === 'warning') avisos.push(m.text());
  });
  pg.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
  await pg.route('**/*', async (rt) => {
    const u = rt.request().url();
    if (opcoes.transformarHtml && (u.endsWith('/') || u.endsWith('index.html'))) {
      const r = await rt.fetch();
      return rt.fulfill({ response: r, body: opcoes.transformarHtml(await r.text()) });
    }
    if (u.includes('phaser')) return rt.fulfill({ body: PHASER, contentType: 'text/javascript' });
    if (u.includes('fonts.googleapis') || u.includes('fonts.gstatic')) return rt.fulfill({ body: '', contentType: 'text/css' });
    return rt.continue();
  });
  await pg.addInitScript(`window.__SEED__ = ${opcoes.semente ?? 12345};`);
  await pg.addInitScript(SEMENTE);
  if (opcoes.todasDesbloqueadas) {
    await pg.addInitScript(`try { if (!localStorage.getItem('radiationHunters')) localStorage.setItem('radiationHunters',
      JSON.stringify({ unlockedMissions: [1,2,3,4,5,6,7,8] })); } catch (e) {}`);
  }
  if (opcoes.semEncontros) {
    await pg.addInitScript(`try { localStorage.setItem('radiationHunters',
      JSON.stringify({ unlockedMissions: ${opcoes.todasDesbloqueadas ? '[1,2,3,4,5,6,7,8]' : '[1]'}, settings: { encontros: false } })); } catch (e) {}`);
  }
  if (opcoes.idioma) {
    await pg.addInitScript(`try { localStorage.setItem('radiationHuntersLang', ${JSON.stringify(opcoes.idioma)}); } catch (e) {}`);
  }
  if (opcoes.antes) await pg.addInitScript(opcoes.antes);
  await pg.goto(url);
  await pg.waitForFunction(() => typeof ui !== 'undefined' && typeof MISSIONS !== 'undefined');
  // A missão 1 shipada é a Academia (mapa grande, 8 fontes). Os testes de motor usam, por padrão, o
  // laboratório compacto de antes (24x16, 2 fontes); quem testa a Academia passa { academia: true }.
  if (!opcoes.academia) {
    await pg.evaluate(() => {
      const m = MISSIONS[0];
      for (const k of ['layout', 'mapCols', 'mapRows', 'umaFontePorSala', 'salasComFonte', 'isotopoPorSala', 'licoes', 'geigerComoItem']) delete m[k];
      m.numSources = 2; m.timeLimit = 0; m.allowedIsotopes = ['Am-241', 'Cs-137'];
    });
  }
  return { pg, ctx, erros, avisos };
}

/** A história vem em partes: clica "Próximo/Continuar" até a tela de história sair. */
export async function passarHistoria(pg) {
  for (let i = 0; i < 30 && await pg.$eval('#story-intro', (e) => e.classList.contains('active')); i++) {
    await pg.click('#story-continue');
    await pg.waitForTimeout(30);
  }
}

/** Inicia a missão pela interface real (menu -> cartão -> história -> jogo). */
export async function iniciarMissao(pg, id) {
  await pg.click('#btn-missions');
  await pg.click(`#missions-container > *:nth-child(${id}) .mission-title`);
  await pg.waitForSelector('#story-continue', { state: 'visible' });
  await passarHistoria(pg);
  await pg.waitForFunction(() => window.gameScene && window.gameScene.gameStarted && window.gameScene.sources);
  // um quadro extra para o Phaser terminar a primeira atualização
  await pg.waitForTimeout(150);
}

/** Espera a cena do Phaser voltar a rodar (scene.resume/restart são assíncronos:
 *  um Esc enviado no mesmo quadro é descartado pelo Phaser; humanos não fazem isso). */
export const aguardarCenaAtiva = (pg) =>
  pg.waitForFunction(() => window.gameScene && window.gameScene.scene.isActive() && window.gameScene.gameStarted);

export const ativos = (pg) => pg.$$eval('.screen.active', (e) => e.map((x) => x.id));
export const modalAtivo = (pg, id) => pg.$eval('#' + id, (e) => e.classList.contains('active'));

/** Estatística simples. */
export function mediaVar(a) {
  const m = a.reduce((x, y) => x + y, 0) / a.length;
  const v = a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length;
  return { media: m, variancia: v, n: a.length };
}

/** Lição em partes: avança "Próximo" até a última e clica no botão final (por padrão, "Ir para o quiz"). */
export async function lerLicao(pg, final = '#licao-iniciar') {
  for (let i = 0; i < 20 && await pg.$('#licao-proxima'); i++) await pg.click('#licao-proxima');
  await pg.click(final);
}

/** "Novo jogo" (v3.11 abre as vagas de save): continua a vaga ativa se ela já tem jogo; senão começa um jogo novo na primeira vaga vazia. */
export async function novoJogo(pg) {
  await pg.click('#btn-new-game');
  await pg.waitForSelector('#slots-modal.active .slot-card');
  const cont = await pg.$('#slots-modal .slot-card.ativa [data-slot="continuar"]');
  if (cont) await cont.click(); else await pg.click('#slots-modal [data-slot="novo"]');
}
