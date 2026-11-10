// ============================================
// ARTE (v3.48): CONJUNTO DE ÍCONES desenhados (traço, 24×24, cor do texto) no lugar dos emojis.
// Os emojis mudavam de desenho de um sistema para outro e misturavam estilos. Aqui cada símbolo tem um desenho
// próprio e genérico. `iconizar(raiz)` troca, na árvore de texto do DOM, cada emoji conhecido pelo seu ícone;
// `vigiarIcones()` faz isso também com o que for criado depois (textos dos idiomas, telas montadas por código).
// Sinais tipográficos (✓ ✗ ★ ☆ × ≈ ○) continuam como texto: são letras da fonte, não emojis.
// ============================================
const P = {
    pausa: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    voltar: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v5h5"/>',
    radiacao: '<circle cx="12" cy="12" r="1.6"/><path d="M12 3.5a8.5 8.5 0 0 1 7.4 4.3l-5 2.9A2.8 2.8 0 0 0 12 9.2zM4.6 7.8A8.5 8.5 0 0 1 12 3.5v5.7a2.8 2.8 0 0 0-2.4 1.5zM9.6 13.3a2.8 2.8 0 0 0 4.8 0l5 2.9a8.5 8.5 0 0 1-14.8 0z"/>',
    engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.6v.6"/><path d="M12 17h.01"/>',
    estrela: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
    corrida: '<circle cx="15" cy="4.5" r="1.8"/><path d="M8 21l3-6 3 3v4M6 12l3-4 4 1 2 3 3 1M11 15l-1-4"/>',
    medalha: '<circle cx="12" cy="15" r="5"/><path d="M8.5 3h7l-2 7h-3z"/>',
    trofeu: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/>',
    prancheta: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 11h7M8.5 15h5"/>',
    caderno: '<path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M6 3v18M3.5 7h3M3.5 12h3M3.5 17h3M10 8h6"/>',
    alfinete: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    antena: '<path d="M5 19L12 8l7 11"/><path d="M8.5 14h7M12 8V5M8.3 4.3a5 5 0 0 1 7.4 0M6.2 2.5a8 8 0 0 1 11.6 0"/>',
    lupa: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
    alerta: '<path d="M12 3.5l9.5 17h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
    controle: '<path d="M7 8h10a4 4 0 0 1 4 4v1a4 4 0 0 1-7 2.6h-4A4 4 0 0 1 3 13v-1a4 4 0 0 1 4-4z"/><path d="M7 11v3M5.5 12.5h3M16 11.5h.01M18 13.5h.01"/>',
    lampada: '<path d="M9 17h6M10 20.5h4M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1V17h6v-2c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3z"/>',
    grafico: '<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>',
    livros: '<path d="M4 5h4v15H4zM9 5h4v15H9z"/><path d="M14.5 6.2l3.8-1 3.9 14.5-3.9 1z"/>',
    chave: '<circle cx="8" cy="12" r="4"/><path d="M12 12h9M18 12v3M21 12v2"/>',
    cadeado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    aberto: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.7-1.5"/>',
    ferramenta: '<path d="M14.5 5.5a4 4 0 0 0 4.9 5L20 11l-9 9-4-4 9-9 .5.6z" transform="translate(-1 0)"/>',
    certo: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    errado: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    brilho: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    joinha: '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2.5L12 10h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7"/>',
    livro: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
    duvida: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15.5c1.5-1 4.5-1 6 0"/>',
    tubo: '<path d="M9 3h6M10 3v12a2 2 0 0 0 4 0V3"/><path d="M10 10h4"/>',
    microscopio: '<path d="M6 21h12M9 21v-3a6 6 0 0 1 9-5"/><path d="M10 3l3 1-3 8-3-1z"/><path d="M12 13h3"/>',
    jornal: '<rect x="3" y="5" width="15" height="15" rx="1"/><path d="M18 9h3v9a2 2 0 0 1-2 2M6 9h9M6 13h4M6 16h4M12 13h3v3h-3z"/>',
    globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    ampulheta: '<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/>',
    escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6z"/>',
    caixa: '<path d="M3 8l9-4 9 4-9 4zM3 8v8l9 4 9-4V8M12 12v8"/>',
    picareta: '<path d="M4 8c4-4 12-4 16 0M12 6v15"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    moeda: '<circle cx="12" cy="12" r="8.5"/><path d="M14.5 9.3c-.5-.8-1.4-1.3-2.5-1.3-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.5.8 2.5 2-1 2-2.5 2c-1.1 0-2-.5-2.5-1.3M12 6.5v11"/>',
    queda: '<path d="M3 6l6 6 4-4 8 8"/><path d="M15 16h6v-6"/>',
    aperto: '<path d="M3 11l4-4 5 3 3-2 6 5M7 14l3 3 2-1 3 2 3-3M3 11l4 4"/>',
    hospital: '<rect x="4" y="4" width="16" height="17" rx="1"/><path d="M12 8v6M9 11h6M9 21v-3h6v3"/>',
    pessoa: '<circle cx="12" cy="6" r="2.6"/><path d="M8 21v-6l-2-1 1.5-4.5h9L18 14l-2 1v6"/>',
    saude: '<path d="M12 21v-9M8 6c0-2 1.8-3 4-3s4 1 4 3-2 3-4 3-4 1-4 3 1.8 3 4 3 4-1 4-3"/>',
    feminino: '<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
};
/** Emoji → nome do ícone. */
export const EMOJI = {
    '⏸': 'pausa', '▶': 'play', '↺': 'voltar', '☢': 'radiacao', '⚙': 'engrenagem', '❓': 'ajuda', '⭐': 'estrela', '🌟': 'estrela',
    '🏃': 'corrida', '🏅': 'medalha', '🏆': 'trofeu', '📋': 'prancheta', '📓': 'caderno', '📘': 'livro', '📖': 'livro', '📍': 'alfinete',
    '📡': 'antena', '🔍': 'lupa', '⚠': 'alerta', '🎮': 'controle', '💡': 'lampada', '📊': 'grafico', '📚': 'livros', '🔑': 'chave',
    '🔒': 'cadeado', '🔓': 'aberto', '🔧': 'ferramenta', '✅': 'certo', '❌': 'errado', '👍': 'joinha', '🤔': 'duvida', '🧪': 'tubo',
    '🔬': 'microscopio', '📰': 'jornal', '🌍': 'globo', '⏳': 'ampulheta', '🛡': 'escudo', '📦': 'caixa', '⛏': 'picareta', '✕': 'fechar',
    '💰': 'moeda', '📉': 'queda', '🤝': 'aperto', '🏥': 'hospital', '🧍': 'pessoa', '🧑': 'pessoa', '⚕': 'saude', '♀': 'feminino', '🎲': 'caixa',
};
/** Ícone em SVG (texto). `nome` = chave de P. */
export function icone(nome, extra = '') {
    const p = P[nome]; if (!p) return '';
    return `<svg class="ico ico-${nome}${extra ? ' ' + extra : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}
export const temIcone = (nome) => !!P[nome];
const CHAVES = Object.keys(EMOJI).sort((a, b) => b.length - a.length).map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
// emoji conhecido, com seletor de variante opcional; bandeiras somem (o rótulo EN/PT já diz o idioma)
const RE = new RegExp(`(?:${CHAVES.join('|')})\\uFE0F?|[\\u{1F1E6}-\\u{1F1FF}]{2}\\s?`, 'gu');
const PULAR = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION', 'CANVAS', 'svg', 'SVG', 'TITLE']);

function trocarTexto(no) {
    const t = no.nodeValue.replace(/\u200D[\u2640\u2642\u2695]\uFE0F?/g, ''); RE.lastIndex = 0; if (!RE.test(t)) return;   // 🧍‍♀️ e 🧑‍⚕️: fica só a figura
    const pai = no.parentNode; if (!pai || PULAR.has(pai.nodeName) || (pai.closest && pai.closest('[data-sem-icone]'))) return;
    const frag = document.createDocumentFragment(); let i = 0; RE.lastIndex = 0; let m;
    while ((m = RE.exec(t))) {
        if (m.index > i) frag.append(t.slice(i, m.index));
        const nome = EMOJI[m[0].replace(/️/g, '')];
        if (nome) { const s = document.createElement('span'); s.className = 'ico-w'; s.innerHTML = icone(nome); frag.append(s); }
        i = m.index + m[0].length;
    }
    if (i < t.length) frag.append(t.slice(i));
    pai.replaceChild(frag, no);
}
/** Troca os emojis conhecidos dentro de `raiz` (elemento ou nó de texto). */
export function iconizar(raiz = document.body) {
    if (!raiz) return;
    if (raiz.nodeType === 3) { trocarTexto(raiz); return; }
    if (raiz.nodeType !== 1 || PULAR.has(raiz.nodeName)) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), lista = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) { RE.lastIndex = 0; if (RE.test(n.nodeValue)) lista.push(n); }
    lista.forEach(trocarTexto);
}
let vigia = null;
/** Mantém a troca para tudo o que for criado ou mudado depois. */
export function vigiarIcones() {
    if (vigia || typeof MutationObserver === 'undefined') return;
    iconizar(document.body);
    vigia = new MutationObserver((rs) => { for (const r of rs) { if (r.type === 'characterData') trocarTexto(r.target); else r.addedNodes.forEach((n) => iconizar(n)); } });
    vigia.observe(document.body, { childList: true, subtree: true, characterData: true });
}
