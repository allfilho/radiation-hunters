#!/usr/bin/env node
// Divide o game.js (script clássico) em ES modules, por recorte MECÂNICO do texto.
// Nenhum trecho de lógica é redigitado: cada declaração de topo é copiada byte a byte
// do original, ganhando apenas `export ` na frente; os `import` são calculados pela
// análise de escopo (eslint-scope). Edições de texto, todas declaradas abaixo:
//   E1  UIManager:  `currentLang = btn.dataset.lang;`  ->  `setLang(btn.dataset.lang);`
//   E2  main.js:    `currentLang = savedLang;`         ->  `setLang(savedLang);`
//   (um módulo não pode reatribuir uma variável importada; setLang vive em i18n/index.js)
// Cola nova (não existia no original): imports/exports, setLang(), o objeto i18n
// montado de en/pt, o array MISSIONS montado dos 8 arquivos e a exposição de globais
// para testes no fim de main.js.
// Uso: node dividir-modulos.mjs <game.js original> <pasta de saída>
import fs from 'node:fs';
import path from 'node:path';
import * as acorn from 'acorn';
import * as escope from 'eslint-scope';

const [, , ENTRADA, SAIDA] = process.argv;
if (!ENTRADA || !SAIDA) { console.error('uso: dividir-modulos.mjs <game.js> <saida>'); process.exit(2); }
const src = fs.readFileSync(ENTRADA, 'utf8');
const comentarios = [];
const ast = acorn.parse(src, { ecmaVersion: 2022, sourceType: 'script', ranges: true, onComment: comentarios });
const sm = escope.analyze(ast, { ecmaVersion: 2022, sourceType: 'script', range: true });
const global = sm.globalScope;

// ---- declarações de topo --------------------------------------------------
const topo = ast.body.map((n, i) => {
  let nomes = [];
  if (n.type === 'ClassDeclaration' || n.type === 'FunctionDeclaration') nomes = [n.id.name];
  else if (n.type === 'VariableDeclaration') nomes = n.declarations.map((d) => d.id.name);
  return { i, n, nomes, ini: n.range[0], fim: n.range[1] };
});
const porNome = Object.fromEntries(topo.flatMap((t) => t.nomes.map((nm) => [nm, t])));
const dono = (pos) => topo.find((t) => pos >= t.ini && pos < t.fim);
topo.forEach((t) => { t.usa = new Set(); });
(function varre(esc) {
  for (const r of esc.references) {
    const d = dono(r.identifier.range[0]);
    if (d && r.resolved && r.resolved.scope === global && porNome[r.identifier.name] && porNome[r.identifier.name] !== d)
      d.usa.add(r.identifier.name);
  }
  esc.childScopes.forEach(varre);
})(global);

// texto que precede cada declaração (banners e comentários soltos) vai junto com ela
const cabecalho = comentarios[0];                       // bloco de autoria
topo.forEach((t, k) => {
  const ant = k === 0 ? cabecalho.end : topo[k - 1].fim;
  t.lead = src.slice(ant, t.ini).replace(/^\s*\n/, '').replace(/\s+$/, '');
  t.texto = src.slice(t.ini, t.fim);
});
const resto = src.slice(topo.at(-1).fim);
if (resto.trim() !== '') throw new Error('sobrou texto depois da última declaração');

// ---- mapeamento declaração -> módulo ---------------------------------------
const nomeMissao = ['01-treinamento', '02-goiania', '03-radium-girls', '04-chernobyl', '05-lia-georgia', '06-zaragoza', '07-mayapuri', '08-fukushima'];
const modulos = {
  'js/data/config.js': ['CONFIG'],
  'js/data/isotopes.js': ['ISOTOPES'],
  'js/data/shields.js': ['SHIELDS'],
  'js/data/moveis.js': ['FURNITURE_TYPES'],
  'js/mapa/temas.js': ['MAP_THEMES'],
  'js/estado.js': ['GameState'],
  'js/util.js': ['randomRange', 'shuffleArray', 'distance', 'formatTime'],
  'js/fisica/poisson.js': ['poissonRandom'],
  'js/fisica/linha-de-visao.js': ['hasLineOfSight'],
  'js/mapa/gerador.js': ['MapGenerator'],
  'js/audio.js': ['AudioManager', 'audioManager'],
  'js/ui.js': ['UIManager', 'ui'],
  'js/render/moveis.js': ['FurnitureRenderer'],
  'js/scenes/GameScene.js': ['GameScene'],
  'js/i18n/index.js': ['currentLang', 't', 'updateTexts'],   // + i18n (colagem) + setLang (colagem)
};
const ondeEsta = { i18n: 'js/i18n/index.js', setLang: 'js/i18n/index.js', MISSIONS: 'js/data/missoes/index.js' };
for (const [arq, nomes] of Object.entries(modulos)) nomes.forEach((n) => { ondeEsta[n] = arq; });
const iMain = topo.findIndex((t) => t.nomes.includes('game'));       // tudo daqui em diante vai para main.js
topo.slice(iMain).forEach((t) => t.nomes.forEach((n) => { ondeEsta[n] = 'js/main.js'; }));

const E1 = ['currentLang = btn.dataset.lang;', 'setLang(btn.dataset.lang);'];
const E2 = ['currentLang = savedLang;', 'setLang(savedLang);'];
function editar(txt, [de, para]) {
  const partes = txt.split(de);
  if (partes.length !== 2) throw new Error(`edição esperava 1 ocorrência de «${de}», achou ${partes.length - 1}`);
  return partes.join(para);
}
porNome.UIManager.texto = editar(porNome.UIManager.texto, E1); porNome.UIManager.usa.add('setLang');
const mainStmts = topo.slice(iMain);
const alvoE2 = mainStmts.filter((t) => t.texto.includes(E2[0]));
if (alvoE2.length !== 1) throw new Error('E2 não localizado de forma única');
alvoE2[0].texto = editar(alvoE2[0].texto, E2); alvoE2[0].usa.add('setLang');

// ---- geração de arquivos ---------------------------------------------------
const arquivos = {};
const rel = (de, para) => { let r = path.relative(path.dirname(de), para); if (!r.startsWith('.')) r = './' + r; return r; };
function importacoes(arq, usados, locais) {
  const por = {};
  for (const n of usados) {
    if (locais.has(n)) continue;
    const alvo = ondeEsta[n]; if (!alvo) throw new Error(`sem módulo para ${n} (usado em ${arq})`);
    (por[alvo] ||= []).push(n);
  }
  return Object.entries(por).sort().map(([a, ns]) => `import { ${ns.sort().join(', ')} } from '${rel(arq, a)}';`).join('\n');
}
function montar(arq, stmts, { antes = '', exportar = true, sufixo = '', cab = '' } = {}) {
  const locais = new Set(stmts.flatMap((t) => t.nomes));
  const usados = new Set(stmts.flatMap((t) => [...t.usa]));
  const imp = importacoes(arq, usados, locais);
  const corpo = stmts.map((t) => (t.lead ? t.lead + '\n' : '') + (exportar && t.nomes.length ? 'export ' : '') + t.texto).join('\n\n');
  arquivos[arq] = [cab.trim(), imp, antes.trim(), corpo, sufixo.trim()].filter(Boolean).join('\n\n') + '\n';
}
for (const [arq, nomes] of Object.entries(modulos)) montar(arq, nomes.map((n) => porNome[n]));

// i18n: en.js, pt.js, index.js
const decI18n = porNome.i18n.n.declarations[0].init;
const idiomas = Object.fromEntries(decI18n.properties.map((p) => [p.key.name, p.value]));
if (Object.keys(idiomas).join() !== 'en,pt') throw new Error('i18n inesperado: ' + Object.keys(idiomas));
for (const c of comentarios) if (c.start > decI18n.range[0] && c.end < decI18n.range[1] &&
  !Object.values(idiomas).some((v) => c.start >= v.range[0] && c.end <= v.range[1])) throw new Error('comentário solto no i18n: ' + c.value.slice(0, 40));
for (const l of ['en', 'pt']) arquivos[`js/i18n/${l}.js`] = `export const ${l} = ${src.slice(idiomas[l].range[0], idiomas[l].range[1])};\n`;
{
  const stmts = modulos['js/i18n/index.js'].map((n) => porNome[n]);
  const ordem = [porNome.currentLang, porNome.t, porNome.updateTexts];
  const cola = `import { en } from './en.js';\nimport { pt } from './pt.js';\n\nexport const i18n = { en, pt };`;
  const setLang = `// Um módulo importador não pode reatribuir \`currentLang\`; quem troca o idioma chama setLang().\nexport function setLang(lang) {\n    currentLang = lang;\n}`;
  const lead0 = porNome.i18n.lead;
  const corpo = [cola, (ordem[0].lead ? ordem[0].lead + '\n' : '') + 'export ' + ordem[0].texto, setLang,
    ...ordem.slice(1).map((t) => (t.lead ? t.lead + '\n' : '') + 'export ' + t.texto)].join('\n\n');
  arquivos['js/i18n/index.js'] = (lead0 ? lead0 + '\n' : '') + corpo + '\n';
}

// missões: um arquivo por missão + índice
{
  const dec = porNome.MISSIONS.n.declarations[0].init;
  if (dec.type !== 'ArrayExpression' || dec.elements.length !== 8) throw new Error('MISSIONS inesperado');
  for (const c of comentarios) if (c.start > dec.range[0] && c.end < dec.range[1] &&
    !dec.elements.some((e) => c.start >= e.range[0] && c.end <= e.range[1])) throw new Error('comentário solto em MISSIONS');
  const imps = [], nomes = [];
  dec.elements.forEach((e, k) => {
    const f = nomeMissao[k], v = 'missao' + String(k + 1).padStart(2, '0');
    arquivos[`js/data/missoes/${f}.js`] = `export const missao = ${src.slice(e.range[0], e.range[1])};\n`;
    imps.push(`import { missao as ${v} } from './${f}.js';`); nomes.push(v);
  });
  const lead = porNome.MISSIONS.lead;
  arquivos['js/data/missoes/index.js'] = `${imps.join('\n')}\n\n${lead ? lead + '\n' : ''}export const MISSIONS = [\n    ${nomes.join(',\n    ')},\n];\n`;
}

// main.js: cabeçalho de autoria (verbatim) + restante
{
  const stmts = mainStmts;
  const locais = new Set(stmts.flatMap((t) => t.nomes));
  const usados = new Set(stmts.flatMap((t) => [...t.usa]));
  const todos = ['i18n', 'CONFIG', 'ISOTOPES', 'SHIELDS', 'MISSIONS', 'GameState', 'hasLineOfSight', 'GameScene', 'UIManager', 'ui', 'currentLang'];
  todos.forEach((n) => usados.add(n));
  const imp = importacoes('js/main.js', usados, locais);
  const corpo = stmts.map((t) => (t.lead ? t.lead + '\n' : '') + t.texto).join('\n\n');
  const expor = `// ============================================
// GLOBAIS PARA TESTES E DEPURAÇÃO
// ============================================
// Os módulos não criam globais. Estes nomes eram globais no game.js antigo e a
// suíte de testes (tests/) os lê pelo console da página; \`currentLang\` é um
// getter para refletir o valor atual.
Object.assign(globalThis, { i18n, CONFIG, ISOTOPES, SHIELDS, MISSIONS, GameState, hasLineOfSight, GameScene, UIManager, ui });
Object.defineProperty(globalThis, 'currentLang', { get: () => currentLang, configurable: true });`;
  arquivos['js/main.js'] = [src.slice(cabecalho.start, cabecalho.end), imp, corpo, expor].join('\n\n') + '\n';
}

// ---- grava -----------------------------------------------------------------
// o projeto usa CRLF; o recorte já vem em CRLF e a cola nova em LF -> uniformiza em CRLF
for (const arq of Object.keys(arquivos)) arquivos[arq] = arquivos[arq].replace(/\r?\n/g, '\r\n');
for (const [arq, txt] of Object.entries(arquivos)) {
  const f = path.join(SAIDA, arq); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt);
}
// validação sintática como módulo (modo estrito)
for (const [arq, txt] of Object.entries(arquivos)) acorn.parse(txt, { ecmaVersion: 2022, sourceType: 'module' });
console.log(Object.keys(arquivos).sort().map((a) => `${String(arquivos[a].split('\n').length).padStart(5)}  ${a}`).join('\n'));
