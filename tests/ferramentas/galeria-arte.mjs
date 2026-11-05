// Galeria de arte: todos os blocos da planta (de cima) e as salas em corte, numa só imagem. Uso: node ferramentas/galeria-arte.mjs [SAIDA=/caminho.png]
import { servidor, abrirNavegador } from '../helpers/navegador.mjs';
const srv = await servidor(), nav = await abrirNavegador();
try {
  const pg = await (await nav.newContext({ viewport: { width: 1500, height: 900 } })).newPage();
  await pg.goto(srv.url + '/index.html');
  await pg.evaluate(async () => {
    const A = await import('/js/arte/planta.js'), B = await import('/js/agencia/base-svg.js');
    const tipos = ['hangar', 'comando', 'academia', 'cofre', 'alojamento', 'oficina', 'biblioteca', 'laboratorio', 'vazio'];
    const gente = [{ cor: 'verde', i: 1 }, { cor: 'amarelo', i: 2 }, { cor: 'verde', i: 3 }, { cor: 'vermelho', i: 4 }];
    const css = '<style>body{margin:0;background:#1a120d;color:#fff;font:12px monospace}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:0;width:1100px}.ag-mod-svg{position:static!important;display:block}.g svg{width:220px!important;height:220px!important}.c{display:grid;grid-template-columns:repeat(4,300px);gap:6px;padding:6px}.c svg{width:300px!important;height:180px!important}.ag-pisca,.ag-pulsa,.ag-varre,.ag-bolha{animation:none}.ag-svg-rot{font-size:11px;fill:#dff5ff}.ag-svg-h{font:bold 16px monospace;fill:#fc0}.ag-svg-mini{font-size:6px;fill:#fc0}</style>';
    const viz = { n: true, s: true, o: true, l: true };
    const planta = tipos.map((t) => A.planta(t, { viz, naves: ['tripulacao', 'resgate'], pessoas: gente })).join('') + A.planta('hangar', { obra: true, viz });
    const corte = ['hangar', 'comando', 'academia', 'cofre', 'alojamento', 'oficina', 'biblioteca', 'laboratorio'].map((t) => B.moduloSvg(t)).join('');
    document.body.innerHTML = css + `<div class="g">${planta}</div><div class="c">${corte}</div>`;
  });
  await pg.waitForTimeout(400);
  await pg.screenshot({ path: process.env.SAIDA || '/tmp/claude-0/work/galeria.png', fullPage: true });
} finally { await nav.close(); await srv.fechar(); }
