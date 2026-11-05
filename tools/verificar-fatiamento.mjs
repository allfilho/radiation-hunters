#!/usr/bin/env node
// Auditoria independente do recorte: lê o game.js original e os módulos gerados
// e confere que CADA declaração de topo do original aparece, byte a byte (após
// normalizar fim de linha), em exatamente um módulo, nas edições declaradas E1/E2.
// Uso: node verificar-fatiamento.mjs <game.js original> <pasta com js/>
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
const [, , ORIG, PASTA] = process.argv;
const norm = (s) => s.replace(/\r\n/g, '\n');
const src = norm(fs.readFileSync(ORIG, 'utf8'));
const ast = acorn.parse(src, { ecmaVersion: 2022, ranges: true });
const arqs = [];
(function ler(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); f.isDirectory() ? ler(p) : p.endsWith('.js') && arqs.push([path.relative(PASTA, p), norm(fs.readFileSync(p, 'utf8'))]); } })(path.join(PASTA, 'js'));
const todos = arqs.map(([, t]) => t);
const conta = (agulha) => todos.reduce((n, t) => n + t.split(agulha).length - 1, 0);
let falhas = 0, ok = 0;
const checa = (rotulo, agulha) => { const n = conta(agulha); if (n === 1) ok++; else { falhas++; console.log(`FALHA ${rotulo}: ${n} ocorrências`); } };
const unEdit = (t) => t.replace('setLang(btn.dataset.lang);', 'currentLang = btn.dataset.lang;').replace('setLang(savedLang);', 'currentLang = savedLang;');
for (const n of ast.body) {
  const texto = src.slice(n.range[0], n.range[1]);
  const nome = n.id?.name || n.declarations?.[0]?.id?.name || '(instrução)';
  if (nome === 'i18n') {
    for (const p of n.declarations[0].init.properties) checa('i18n.' + p.key.name, src.slice(p.value.range[0], p.value.range[1]));
  } else if (nome === 'MISSIONS') {
    n.declarations[0].init.elements.forEach((e, k) => checa('missão ' + (k + 1), src.slice(e.range[0], e.range[1])));
  } else {
    // a edição é aplicada ao módulo gerado; para comparar, desfaz-se a edição no módulo
    const n1 = conta(texto);
    const n2 = todos.reduce((s, t) => s + unEdit(t).split(texto).length - 1, 0);
    if (n1 === 1 || n2 === 1) ok++; else { falhas++; console.log(`FALHA ${nome}: ${n1}/${n2} ocorrências`); }
  }
}
// nada além do esperado: toda linha dos módulos que não está no original é cola conhecida
const linhasOrig = new Set(src.split('\n').map((l) => l.trim()).filter(Boolean));
const estranhas = [];
for (const [arq, t] of arqs) for (const l of t.split('\n').map((x) => x.trim()).filter(Boolean)) {
  if (linhasOrig.has(l) || linhasOrig.has(unEdit(l))) continue;
  if (/^(import |export (const|let|class|function) |\} from )/.test(l) || l.startsWith('export ')) continue;
  estranhas.push(`${arq}: ${l.slice(0, 90)}`);
}
console.log(`declarações conferidas: ${ok} ok, ${falhas} falhas`);
console.log(`linhas novas nos módulos (cola): ${estranhas.length}`);
estranhas.forEach((e) => console.log('  ' + e));
process.exit(falhas ? 1 : 0);
