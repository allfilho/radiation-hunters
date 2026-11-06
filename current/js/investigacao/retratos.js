import { tom } from '../arte/paleta.js';
// Retratos dos personagens das investigações: bustos vetoriais originais (formas simples), desenhados aqui com as paletas do jogo.
// Sem arte de terceiros. O retrato é decorativo: o nome fica em texto ao lado (aria-hidden no desenho).
const P = {
  rita: { estilo:'curto', blusa: '#e7f0f1', cabelo: '#34303a', pele: '#e7b697', jaleco: true },
  helena: { estilo:'longo', blusa: '#d28682', cabelo: '#674735', pele: '#e7b697' },
  camila: { estilo:'cacheado', blusa: '#dfeaf0', cabelo: '#403330', pele: '#a46d4e', jaleco: true, oculos: true },
  andre: { estilo:'curto', barba:true, blusa: '#69a7ab', cabelo: '#34303a', pele: '#c7926b' },
  lucia: { estilo:'coque', blusa: '#bd985f', cabelo: '#66433c', pele: '#d4a381' },
  lara: { estilo:'cacheado', blusa: '#739caf', cabelo: '#422d25', pele: '#a87552', oculos: true },
  caio: { estilo:'ondulado', blusa: '#9ca77b', cabelo: '#322f34', pele: '#d9ab86' },
  dora: { estilo:'longo', blusa: '#b381a3', cabelo: '#6a4e3c', pele: '#ddb08a', oculos: true },
  ines: { estilo:'curto', blusa: '#638fa4', cabelo: '#282c32', pele: '#956341' },
  nelson: { estilo:'calvo', bigode:true, blusa: '#7c8f5b', cabelo: '#a5a39c', pele: '#a9764f' },
  leo: { estilo:'ondulado', blusa: '#d98c50', cabelo: '#2a2430', pele: '#c58d66' },
  vera: { estilo:'coque', blusa: '#c8826f', cabelo: '#7a5a44', pele: '#e0b48e', oculos: true },
  paulo: { estilo:'calvo', barba:true, blusa: '#8fb0c8', cabelo: '#4a3a2e', pele: '#d6a47c', oculos: true },
  tania: { estilo:'longo', blusa: '#7d6396', cabelo: '#8c8a90', pele: '#b98563' },
  // Equipe da Base da Agência (nomes provisórios, a combinar)
  marta: { estilo:'curto', blusa: '#5b7f9a', cabelo: '#9a9aa2', pele: '#c9956f', oculos: true },
  teo: { estilo:'curto', barba:true, blusa: '#c9a24f', cabelo: '#2b2a30', pele: '#9c6a49' },
  yara: { estilo:'trança', blusa: '#6f9a7d', cabelo: '#3a2a26', pele: '#b98563', jaleco: true },
  cecilia: { estilo:'coque', blusa: '#e6eef1', cabelo: '#4a3a36', pele: '#d1a07a', oculos: true, jaleco: true },
  otavio: { estilo:'ondulado', blusa: '#8a6f9a', cabelo: '#5a4a3a', pele: '#dcae88' },
};
export const NOMES = { rita: 'Rita', helena: 'Helena', camila: 'Camila', andre: 'André', lucia: 'Lúcia', lara: 'Lara', caio: 'Caio', dora: 'Dora', ines: 'Inês', nelson: 'Nelson', leo: 'Léo', vera: 'Vera', paulo: 'Paulo', tania: 'Tânia', marta: 'Marta', teo: 'Téo', yara: 'Yara', otavio: 'Otávio', cecilia: 'Cecília' };

/** Estilos e expressões. O retrato é um busto 96×96 (pintura vetorial com luz de cima à esquerda), sem arte de terceiros. */
export const EXPRESSOES = ['neutro', 'sorriso', 'preocupado', 'surpreso'];
const tomC = (c, k) => tom(c, k);

function cabeloAtras(p) {
  const c = p.cabelo, e = p.estilo;
  if (e === 'longo') return `<path d="M26 44 C21 22 33 11 48 11 C63 11 75 22 70 44 L74 80 L22 80Z" fill="${tomC(c, -.25)}"/>`;
  if (e === 'trança') return `<path d="M27 44 C23 24 34 12 48 12 C62 12 73 24 69 44 L71 62 L25 62Z" fill="${tomC(c, -.25)}"/><g fill="${c}" stroke="${tomC(c, -.4)}" stroke-width=".8"><ellipse cx="66" cy="66" rx="4" ry="3.2"/><ellipse cx="68" cy="73" rx="4" ry="3.2"/><ellipse cx="66" cy="80" rx="4" ry="3.2"/><ellipse cx="68" cy="87" rx="4" ry="3.2"/></g>`;
  if (e === 'coque') return `<circle cx="48" cy="10" r="8" fill="${tomC(c, -.15)}"/><circle cx="46" cy="8" r="3" fill="${tomC(c, .2)}" opacity=".6"/>`;
  if (e === 'cacheado') return `<g fill="${tomC(c, -.2)}">${[[28, 30], [26, 40], [30, 20], [38, 13], [48, 11], [58, 13], [66, 20], [70, 30], [68, 40]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8"/>`).join('')}</g>`;
  return '';
}
function cabeloFrente(p) {
  const c = p.cabelo, e = p.estilo, luz = tomC(c, .22), sombra = tomC(c, -.35);
  if (e === 'calvo') return `<path d="M29 46 C27 36 30 31 34 30 C32 36 33 42 34 48Z M67 46 C69 36 66 31 62 30 C64 36 63 42 62 48Z" fill="${c}"/><path d="M36 22 Q48 15 60 22" fill="none" stroke="#fff" stroke-width="2" opacity=".18" stroke-linecap="round"/>`;
  const topo = e === 'cacheado'
    ? `<g fill="${c}">${[[34, 22], [42, 17], [51, 16], [60, 19], [66, 27], [31, 31]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7"/>`).join('')}</g><g fill="${luz}" opacity=".55">${[[40, 16], [55, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>`
    : e === 'ondulado'
      ? `<path d="M28 42 C24 22 36 13 49 13 C62 13 72 22 68 42 C66 32 62 26 56 24 C58 29 52 30 46 27 C42 31 33 30 30 38Z" fill="${c}"/><path d="M34 20 Q46 14 58 19" fill="none" stroke="${luz}" stroke-width="2" opacity=".5" stroke-linecap="round"/>`
      : `<path d="M28 42 C25 22 36 13 48 13 C61 13 71 22 68 42 C66 31 60 25 48 25 C38 25 31 31 28 42Z" fill="${c}"/><path d="M34 19 Q46 13 60 19" fill="none" stroke="${luz}" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
  return topo + `<path d="M28 42 C27 36 28 32 31 30 C30 36 30 40 31 45Z" fill="${sombra}" opacity=".7"/>`;
}
function olhos(ex) {
  const ry = ex === 'surpreso' ? 4.2 : ex === 'sorriso' ? 2.7 : 3.2;
  const um = (x) => `<ellipse cx="${x}" cy="42" rx="4.7" ry="${ry}" fill="#f4f1ea"/><circle cx="${x + .3}" cy="42.2" r="2.5" fill="#3b2a1e"/><circle cx="${x + .3}" cy="42.2" r="1.2" fill="#0b0705"/><circle cx="${x - .6}" cy="41.2" r=".9" fill="#fff"/><path d="M${x - 4.9} ${42 - ry + .2} Q${x} ${42 - ry - 1.8} ${x + 4.9} ${42 - ry + .2}" fill="none" stroke="#1a1210" stroke-width="1.3" stroke-linecap="round"/>`;
  return um(40) + um(56);
}
function sobrancelhas(ex, c) {
  const pt = { neutro: ['M34 36 Q40 33.5 45 35.5', 'M51 35.5 Q56 33.5 62 36'], sorriso: ['M34 35 Q40 32 45 34', 'M51 34 Q56 32 62 35'], preocupado: ['M34 37.5 Q39 35.5 45 33.5', 'M51 33.5 Q57 35.5 62 37.5'], surpreso: ['M34 32 Q40 28.5 45 31', 'M51 31 Q56 28.5 62 32'] }[ex];
  return `<g fill="none" stroke="${tomC(c, -.3)}" stroke-width="2.2" stroke-linecap="round"><path d="${pt[0]}"/><path d="${pt[1]}"/></g>`;
}
function boca(ex, pele) {
  const lab = '#9a4a3c';
  if (ex === 'sorriso') return `<path d="M41.5 56.5 Q48 64 54.5 56.5 Q48 58.6 41.5 56.5Z" fill="#7a2f26"/><path d="M43 57.6 Q48 60.4 53 57.6 Q48 58.8 43 57.6Z" fill="#fff"/><path d="M41 56 Q48 59.5 55 56" fill="none" stroke="${lab}" stroke-width="1.3" stroke-linecap="round"/>`;
  if (ex === 'preocupado') return `<path d="M42.5 60 Q48 56.4 53.5 60" fill="none" stroke="${lab}" stroke-width="1.8" stroke-linecap="round"/>`;
  if (ex === 'surpreso') return `<ellipse cx="48" cy="59" rx="2.8" ry="3.5" fill="#5a221c"/><ellipse cx="48" cy="57.6" rx="2" ry=".9" fill="#f4f1ea" opacity=".85"/>`;
  return `<path d="M43 58.2 Q48 60.2 53 58.2" fill="none" stroke="${lab}" stroke-width="1.8" stroke-linecap="round"/>`;
}

/** SVG de um busto 96×96. `expressao`: neutro | sorriso | preocupado | surpreso. `opcoes.engenheiro` (v3.34) põe capacete e colete refletivo. Retorna '' se o personagem não tem paleta. */
export function retratoSvg(npc, expressao = 'neutro', opcoes = {}) {
  const p = P[npc]; if (!p) return '';
  const ex = EXPRESSOES.includes(expressao) ? expressao : 'neutro';
  const id = `rt-${npc}`, pele = p.pele, c = p.cabelo;
  const oculos = p.oculos ? `<g fill="#cfe9ff" fill-opacity=".14" stroke="#14212a" stroke-width="1.7"><rect x="32" y="37" width="16" height="11" rx="4.5"/><rect x="48" y="37" width="16" height="11" rx="4.5"/></g><path d="M48 41 h0" stroke="#14212a" stroke-width="1.7"/><path d="M32 41 L28 40 M64 41 L68 40" stroke="#14212a" stroke-width="1.5"/><path d="M34 39 L38 39 M50 39 L54 39" stroke="#fff" stroke-width="1.2" opacity=".6" stroke-linecap="round"/>` : '';
  const barba = p.barba ? `<path d="M30 46 C29 66 67 66 66 46 C64 58 58 63 48 63 C38 63 32 58 30 46Z" fill="${tomC(c, -.05)}"/><path d="M42 59 Q48 56.6 54 59" fill="none" stroke="${tomC(c, -.05)}" stroke-width="4" stroke-linecap="round"/>` : '';
  const bigode = p.bigode ? `<path d="M40 56 Q44 53 48 55.5 Q52 53 56 56 Q52 57.6 48 56.6 Q44 57.6 40 56Z" fill="${tomC(c, -.05)}"/>` : '';
  const jaleco = p.jaleco
    ? `<path d="M10 96 C10 80 24 72 36 70 L48 88 L60 70 C72 72 86 80 86 96Z" fill="#f2f6f8" stroke="#0b1820" stroke-width="1.2"/><path d="M36 70 L48 88 L44 96 L26 96Z" fill="#dfe8ee"/><path d="M60 70 L48 88 L52 96 L70 96Z" fill="#e8f0f4"/><path d="M44 74 L48 88 L52 74 L48 70Z" fill="${p.blusa}"/><rect x="62" y="82" width="9" height="9" rx="1" fill="#d8e2e8"/><rect x="66" y="79" width="1.6" height="8" fill="#00c46a"/>`
    : `<path d="M10 96 C10 80 24 72 36 70 C42 74 54 74 60 70 C72 72 86 80 86 96Z" fill="${p.blusa}" stroke="#0b1820" stroke-width="1.2"/><path d="M36 70 C42 78 54 78 60 70 L56 68 C52 72 44 72 40 68Z" fill="${tomC(p.blusa, -.3)}"/><path d="M62 74 C76 78 86 86 86 96 L70 96 C70 86 66 80 62 74Z" fill="#000" opacity=".2"/>`;
  const eng = opcoes && opcoes.engenheiro === true;
  const colete = eng ? '<g data-colete="1"><path d="M26 96 L34 71 L40 68 L38 96Z" fill="#ff7a1a" stroke="#0b1820" stroke-width="1"/><path d="M70 96 L62 71 L56 68 L58 96Z" fill="#ff7a1a" stroke="#0b1820" stroke-width="1"/><path d="M29.5 90 L38 88.4 M31 82 L38.6 80.6 M66.5 90 L58 88.4 M65 82 L57.4 80.6" stroke="#e8f1f4" stroke-width="1.8" stroke-linecap="round"/></g>' : '';
  const capacete = eng ? '<g data-capacete="1"><path d="M27 32 C27 14 37 10 48 10 C59 10 69 14 69 32 Q48 27.5 27 32Z" fill="#f2b01e" stroke="#0b1820" stroke-width="1.2"/><path d="M48 10 V28.2" stroke="#c98a00" stroke-width="2.2"/><path d="M34 15 Q40 11.5 46 11.4" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.6" stroke-linecap="round"/><path d="M24.5 32.6 Q48 27 71.5 32.6 L71.5 35 Q48 29.6 24.5 35Z" fill="#d9951a" stroke="#0b1820" stroke-width="1.1"/></g>' : '';
  const bochecha = ex === 'sorriso' ? '<ellipse cx="35" cy="52" rx="4" ry="2.4" fill="#e0675a" opacity=".22"/><ellipse cx="61" cy="52" rx="4" ry="2.4" fill="#e0675a" opacity=".22"/>' : '';
  return `<svg viewBox="0 0 96 96" class="inv-retrato-svg"${eng ? ' data-retrato-eng="1"' : ''} aria-hidden="true" focusable="false">`
    + `<defs><linearGradient id="${id}-f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tomC(pele, .18)}"/><stop offset=".6" stop-color="${pele}"/><stop offset="1" stop-color="${tomC(pele, -.28)}"/></linearGradient>`
    + `<radialGradient id="${id}-b" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="#3d6a82"/><stop offset=".6" stop-color="#1c3a4b"/><stop offset="1" stop-color="#0a1822"/></radialGradient></defs>`
    + `<rect width="96" height="96" rx="14" fill="url(#${id}-b)"/><path d="M0 70 H96 M0 76 H96" stroke="#9fd8ff" stroke-width=".6" opacity=".08"/><rect x="6" y="8" width="26" height="30" rx="3" fill="#9fd8ff" opacity=".05"/>`
    + cabeloAtras(p) + jaleco + colete
    + `<path d="M40 58 L40 72 Q48 78 56 72 L56 58Z" fill="${tomC(pele, -.22)}"/><path d="M40 70 Q48 76 56 70 L56 66 Q48 72 40 66Z" fill="#000" opacity=".25"/>`
    + `<ellipse cx="29.5" cy="46" rx="3" ry="5" fill="${tomC(pele, -.08)}"/><ellipse cx="66.5" cy="46" rx="3" ry="5" fill="${tomC(pele, -.25)}"/>`
    + `<path d="M29 40 C29 24 37 21 48 21 C59 21 67 24 67 40 C67 56 59 66 48 66 C37 66 29 56 29 40Z" fill="url(#${id}-f)" stroke="#0b1820" stroke-width="1.2"/>`
    + `<path d="M66 44 C66 58 58 66 48 66 C55 62 61 54 62 42Z" fill="#000" opacity=".12"/>`
    + `<path d="M48 44 Q45.5 51 47 52.4 Q48.6 53 51 52" fill="none" stroke="${tomC(pele, -.35)}" stroke-width="1.5" stroke-linecap="round"/>`
    + bochecha + cabeloFrente(p) + sobrancelhas(ex, c) + olhos(ex) + barba + boca(ex, pele) + bigode + oculos + capacete
    + `<rect x=".6" y=".6" width="94.8" height="94.8" rx="13.4" fill="none" stroke="#9fd8ff" stroke-opacity=".25" stroke-width="1.2"/></svg>`;
}
export const temRetrato = (npc) => Boolean(npc && P[npc]);
