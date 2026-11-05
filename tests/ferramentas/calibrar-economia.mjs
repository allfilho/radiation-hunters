// Calibragem da economia e da dose da Agência: simula um ano de jogo com um "jogador" simples e imprime médias.
// Uso: RH_ROOT=../current node ferramentas/calibrar-economia.mjs [K] [fatorTempo]
// Entradas medidas no navegador (28/10/2026, robô que anda e mede, 10 s junto de cada fonte; seeds 100/107/114): cps·s gama por missão.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const RAIZ = process.env.RH_ROOT ? path.resolve(process.env.RH_ROOT) : path.resolve('../current');
const mod = (f) => import(pathToFileURL(path.join(RAIZ, 'js', f)).href);
const S = await mod('agencia/simulacao.js'), F = await mod('agencia/frota.js'), E = await mod('agencia/equipe.js'), D = await mod('agencia/dados.js');

const K = Number(process.argv[2] || 1e-4), FT = Number(process.argv[3] || 1.5);
// 4º argumento opcional: JSON {"custos":{...}, "params":{...}} para testar valores sem editar os arquivos
const ov = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const fund = (alvo, o) => { for (const [k, v] of Object.entries(o || {})) { if (v && typeof v === 'object') fund(alvo[k], v); else alvo[k] = v; } };
fund(F.CUSTOS, ov.custos); fund(S.PARAMETROS, ov.params);   // K em mSv por cps·s; FT: tempo real de jogador ÷ tempo do robô
const CPS_S = { m2: 14300, m3: 0, m4: 11100, m5: 9450, m6: 12150, m7: 19300, m8: 14300 };   // média de 3 sorteios (missão 3: sem gama)
const semente = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function rodar(seed, dias = 720) {
  const r = semente(seed), e = S.sanear(null);
  S.iniciar(e, F.CUSTOS.creditosIniciais);
  const marcos = {}, marca = (k) => { if (!(k in marcos)) marcos[k] = e.dia; };
  const st = { verba: 0, entregaCred: 0, missoes: 0, invest: 0, tratamentos: 0, expirados: 0, receita: 0, coletas: 0, perdidas: 0, creditosMes: [], gastos: 0 };
  let ultimoMes = 0, caixaMes = e.creditos;
  const gasta = (fn) => { const antes = e.creditos; const x = fn(); st.gastos += antes - e.creditos; return x; };
  for (let d = 0; d < dias; d++) {
    const ev = S.avancarDia(e, r);
    for (const x of ev) { if (x.tipo === 'expirou') st.expirados++; if (x.tipo === 'coleta-perdida') st.perdidas++; if (x.tipo === 'entrega') { st.coletas++; st.entregaCred += x.valor; } if (x.tipo === 'mes') st.verba += x.valor; }
    // jogador: atende 1 alerta por dia com 85 % de chance, se houver 2 cientistas e a nave
    for (const a of [...e.ativos]) {
      if (r() > 0.85) continue;
      const al = D.ALERTAS.find((q) => q.id === a.id); if (!al) { S.concluir(e, a.id, 2); continue; }
      const disp = F.equipeDisponivel(e); if (!disp.length || !F.primeiraNaveLivre(e, 'tripulacao')) break;
      // escolhe quem tem menor dose relativa; vão até 2
      disp.sort((p, q) => E.razao(p, e.dia) - E.razao(q, e.dia));
      const ids = disp.slice(0, 2).map((m) => m.id);
      // evita mandar quem já está no amarelo, se houver alternativa (ainda manda se não houver)
      let dose = al.tipo === 'missao' ? (CPS_S[a.id] || 0) * K * FT * (0.7 + 0.6 * r()) : 0;
      if (al.tipo === 'missao' && F.foiLevantado(e, a.id)) dose *= 0.8;   // levantamento ajuda a ir direto às fontes
      const res = E.distribuirDoseMissao(e.equipe, ids, ids[0], dose, e.dia);
      st.tratamentos += res.filter((q) => q.tratamento).length;
      const estrelas = al.tipo === 'missao' ? Math.max(1, Math.min(3, 1 + Math.round(r() * 2))) : S.PARAMETROS.pontosInvestigacao;
      const antes = e.creditos; S.concluir(e, a.id, estrelas); st.receita += e.creditos - antes;
      if (al.tipo === 'missao') { st.missoes++; if (al.missaoId > 1) F.registrarColeta(e, a.id, 4 + Math.floor(r() * 3)); } else st.invest++;
    }
    // coletas: manda a nave de resgate se houver nave e 2 cientistas
    for (const c of [...e.coleta]) { const disp = F.equipeDisponivel(e); if (disp.length >= 2 && F.primeiraNaveLivre(e, 'resgate')) { const antes = e.creditos; F.enviarResgate(e, c.id, disp.slice(0, 2).map((m) => m.id)); } }
    // compras por prioridade (um "jogador razoável")
    const comprar = [
      () => F.navesDoTipo(e, 'resgate').length < 1 && e.naves.length < F.baiasTotal(e) && e.creditos >= F.CUSTOS.nave.resgate && gasta(() => F.comprarNave(e, 'resgate')) && marca('1ª nave de resgate'),
      () => !F.temLaboratorio(e) && !e.modulos.some((m) => m.tipo === 'laboratorio') && e.creditos >= F.CUSTOS.modulo.laboratorio && F.celulasLivres(e)[0] && gasta(() => F.construirModulo(e, 'laboratorio', F.celulasLivres(e)[0].x, F.celulasLivres(e)[0].y)) && marca('laboratório'),
      () => F.temLaboratorio(e) && !e.pesquisa.detectorAereo && e.creditos >= F.CUSTOS.pesquisa.detectorAereo.custo && gasta(() => F.iniciarPesquisa(e, 'detectorAereo')) && marca('pesquisa iniciada'),
      () => e.equipe.length < F.camasTotal(e) && (e.equipe.length < 6 || e.naves.some((n) => n.tipo === 'levantamento')) && e.candidatos[0] && e.creditos >= F.CUSTOS.contratar + 200 && gasta(() => F.contratar(e, e.candidatos[0].id)) && marca('contratações ' + (e.equipe.length)),
      () => F.pesquisaPronta(e, 'detectorAereo') && !e.naves.some((n) => n.tipo === 'levantamento') && e.naves.length < F.baiasTotal(e) && e.creditos >= F.CUSTOS.nave.levantamento && gasta(() => F.comprarNave(e, 'levantamento')) && marca('nave de levantamento'),
      () => e.naves.length >= F.baiasTotal(e) && e.creditos >= F.CUSTOS.modulo.hangar && F.celulasLivres(e)[0] && gasta(() => F.construirModulo(e, 'hangar', F.celulasLivres(e)[0].x, F.celulasLivres(e)[0].y)) && marca('2º hangar'),
      () => e.equipe.length >= F.camasTotal(e) && e.creditos >= F.CUSTOS.modulo.alojamento && F.celulasLivres(e)[0] && gasta(() => F.construirModulo(e, 'alojamento', F.celulasLivres(e)[0].x, F.celulasLivres(e)[0].y)) && marca('2º alojamento'),
      () => e.naves.length < F.baiasTotal(e) && e.creditos >= F.CUSTOS.nave.tripulacao && gasta(() => F.comprarNave(e, F.navesDoTipo(e, 'tripulacao').length <= F.navesDoTipo(e, 'resgate').length ? 'tripulacao' : 'resgate')) && marca('nave ' + e.naves.length),
      () => F.celulasLivres(e)[0] && e.naves.length >= F.baiasTotal(e) - 0 && e.creditos >= F.CUSTOS.modulo.hangar + 300 && gasta(() => F.construirModulo(e, F.modulosProntos(e, 'hangar').length <= F.modulosProntos(e, 'alojamento').length ? 'hangar' : 'alojamento', F.celulasLivres(e)[0].x, F.celulasLivres(e)[0].y)) && marca('módulo extra ' + e.modulos.length),
      () => F.celulasLivres(e).length === 0 && e.creditos >= F.CUSTOS.expandirColuna && gasta(() => F.expandirBase(e, 'coluna')) && marca('escavou ' + (e.grade.cols - 3) + 'ª coluna'),
      () => F.celulasLivres(e).length === 0 && e.grade.cols >= 6 && e.creditos >= F.CUSTOS.expandirLinha && gasta(() => F.expandirBase(e, 'linha')) && marca('escavou linha'),
    ];
    for (const c of comprar) c();
    if (e.dia % 30 === 0) { st.creditosMes.push(e.creditos); }
    if (e.grade.cols >= 6 && e.grade.rows >= 3 && F.celulasLivres(e).length === 0) marca('BASE COMPLETA');
  }
  return { st, marcos, e };
}

const N = 200, soma = {}, marcosAll = {};
let ult = null;
for (let s = 1; s <= N; s++) { const { st, marcos, e } = rodar(s); ult = e; for (const [k, v] of Object.entries(st)) if (typeof v === 'number') soma[k] = (soma[k] || 0) + v; for (const [k, v] of Object.entries(marcos)) (marcosAll[k] = marcosAll[k] || []).push(v); soma.equipe = (soma.equipe || 0) + e.equipe.length; soma.caixaFinal = (soma.caixaFinal || 0) + e.creditos; soma.fatorFinal = (soma.fatorFinal || 0) + e.fator; soma.celulas = (soma.celulas || 0) + e.modulos.length; }
const med = (a) => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
console.log(`K=${K} fatorTempo=${FT}  (${N} simulações de 720 dias; valores por simulação)`);
for (const [k, v] of Object.entries(soma)) console.log('  ' + k.padEnd(12), (v / N).toFixed(1));
console.log('Marcos (mediana do dia; n = quantos dos ' + N + ' chegaram lá):');
for (const [k, v] of Object.entries(marcosAll).sort((a, b) => med(a[1]) - med(b[1]))) console.log('  ' + k.padEnd(28), 'dia', med(v), ` (n=${v.length})`);
