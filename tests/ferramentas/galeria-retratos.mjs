// Galeria de retratos: todos os personagens (neutro) e 4 expressões de dois deles. Uso: node ferramentas/galeria-retratos.mjs [SAIDA=/caminho.png]
import { servidor, abrirNavegador } from '../helpers/navegador.mjs';
const srv = await servidor(), nav = await abrirNavegador();
try {
  const pg = await (await nav.newContext({ viewport: { width: 1400, height: 700 } })).newPage();
  await pg.goto(srv.url + '/index.html');
  await pg.evaluate(async () => {
    const R = await import('/js/investigacao/retratos.js');
    const lista = Object.keys(R.NOMES).map((k) => `<figure>${R.retratoSvg(k)}<figcaption>${k}</figcaption></figure>`).join('');
    const ex = ['marta', 'teo', 'yara'].flatMap((k) => R.EXPRESSOES.map((e) => `<figure>${R.retratoSvg(k, e)}<figcaption>${k} · ${e}</figcaption></figure>`)).join('');
    document.body.innerHTML = '<style>body{margin:0;background:#0b1520;color:#9fd8ff;font:11px monospace}.g{display:flex;flex-wrap:wrap;gap:8px;padding:8px}figure{margin:0;width:150px}figure svg{width:150px;height:150px;display:block}</style>' + `<div class="g">${lista}</div><div class="g">${ex}</div>`;
  });
  await pg.screenshot({ path: process.env.SAIDA || '/tmp/claude-0/work/retratos.png', fullPage: true });
} finally { await nav.close(); await srv.fechar(); }
