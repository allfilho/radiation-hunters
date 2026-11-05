// Calibração dos encontros (etapa 5d-1): simula alunos com probabilidade fixa de acertar, 8 missões x 3 encontros.
// Mede cobertura do banco, repetições, nós de história, créditos e aproveitamento. Não altera o jogo.
// Uso: RH_ROOT=../current node simulacao/encontros-sim.mjs [alunos=300]
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const RAIZ = process.env.RH_ROOT || path.resolve('../current');
const imp = (p) => import(pathToFileURL(path.join(RAIZ, p)).href);
const { CONCEITOS: C } = await imp('js/data/encontros/conceitos.js');
const { PERGUNTAS: P } = await imp('js/data/encontros/perguntas.js');
const M = await imp('js/encontros/motor.js');
const A = await imp('js/encontros/aproveitamento.js');
const N = Number(process.argv[2]) || 300;

const rng = M.rng;
function aluno(pAcerto, seed) {
  const r = rng(seed); let ap = M.aprendizadoVazio();
  const creditosPorMissao = [], vistas = new Set(), nosVistos = new Set(); let repet = 0, semEnc = 0, hist = 0, perg = 0;
  for (let m = 1; m <= 8; m++) {
    const usadas = [], nosUsados = [], cred = [];
    for (let k = 0; k < 3; k++) {
      const enc = M.iniciar(C, P, ap, { missao: m, gatilho: k === 2 ? 'geiger' : 'fixo', semente: seed * 1000 + m * 10 + k, usadas, nosUsados });
      if (!enc) { semEnc++; cred.push(0); continue; }
      usadas.push(enc.cadeia[0].id); nosUsados.push(enc.no);
      let q = enc.cadeia[0], res = null;
      for (;;) {
        perg++; if (vistas.has(q.id)) repet++; vistas.add(q.id); nosVistos.add(q.no);
        const ok = r() < pAcerto;
        res = M.responder(enc, C, P, ap, ok ? q.correta : (q.formato === 'mf' ? (q.correta === 'mito' ? 'fato' : 'mito') : (q.correta + 1) % 3));
        if (res.fim) break; q = res.proxima;
      }
      if (C.find((c) => c.id === enc.no).historia) hist++;
      cred.push(res.fim.credito); ap = M.aplicarResultado(ap, enc);
    }
    creditosPorMissao.push(cred);
  }
  return { creditosPorMissao, vistas: vistas.size, nos: nosVistos.size, repet, semEnc, hist, perg };
}
const med = (a) => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`Banco: ${C.length} nós, ${P.length} perguntas. ${N} alunos simulados por perfil.\n`);
console.log('pAcerto | perguntas feitas | distintas | repetidas | nós vistos/21 | enc. de história | sem encontro | crédito médio | aproveit. (caçador 90% precisão, no tempo)');
for (const p of [0.3, 0.5, 0.7, 0.9, 1]) {
  const rs = Array.from({ length: N }, (_, i) => aluno(p, 1 + i));
  const cred = med(rs.map((x) => med(x.creditosPorMissao.flat())));
  const apv = med(rs.map((x) => med(x.creditosPorMissao.map((c) => A.aproveitamento({ precisao: 0.9, tempo: 200, meta: 240, creditos: c }).total))));
  console.log([p, med(rs.map((x) => x.perg)).toFixed(1), med(rs.map((x) => x.vistas)).toFixed(1), med(rs.map((x) => x.repet)).toFixed(1), med(rs.map((x) => x.nos)).toFixed(1), med(rs.map((x) => x.hist)).toFixed(1), med(rs.map((x) => x.semEnc)).toFixed(2), cred.toFixed(2), apv.toFixed(1)].join(' | '));
}
