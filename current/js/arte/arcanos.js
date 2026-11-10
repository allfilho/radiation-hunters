// ============================================
// ARTE (v3.44): símbolos desenhados (SVG em linha, traço dourado) das cartas de campo e dos arcanos, no lugar dos emojis.
// Cada função devolve o SVG como texto. Desenhos originais e genéricos (satélite, cronômetro, vento, setas, prédio, radar,
// escudo, pegadas, ampulheta, estrela). Lógica pura: roda em Node.
// ============================================
const A = (corpo) => `<svg class="arcano-svg" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;

export const SIMBOLOS = {
    // cartas do preparo
    levantamento: A('<rect x="19" y="19" width="10" height="10" rx="1"/><path d="M19 24H8M29 24h11"/><rect x="3" y="20" width="6" height="8"/><rect x="39" y="20" width="6" height="8"/><path d="M24 29v6M18 41a8 8 0 0 1 12 0"/>'),
    pressa: A('<circle cx="24" cy="27" r="14"/><path d="M24 27l6-6M20 8h8M24 8v5M36 13l3-3"/>'),
    folego: A('<path d="M6 17h22a5 5 0 1 0-5-5"/><path d="M6 25h32a5 5 0 1 1-5 5"/><path d="M6 33h16"/>'),
    segundaChance: A('<path d="M36 18a14 14 0 0 0-25-2"/><path d="M11 9v7h7"/><path d="M12 30a14 14 0 0 0 25 2"/><path d="M37 39v-7h-7"/>'),
    patrocinio: A('<path d="M6 18L24 8l18 10z"/><path d="M10 22v14M18 22v14M30 22v14M38 22v14M6 40h36"/>'),
    // arcanos do meio da missão
    radar: A('<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="10"/><path d="M24 24l12-9"/><circle cx="31" cy="19" r="2" fill="currentColor"/>'),
    escudo: A('<path d="M24 5l15 6v11c0 10-7 17-15 21-8-4-15-11-15-21V11z"/><path d="M17 24l5 5 9-10"/>'),
    passos: A('<ellipse cx="16" cy="14" rx="5" ry="7"/><path d="M13 25h6"/><ellipse cx="31" cy="27" rx="5" ry="7"/><path d="M28 38h6"/>'),
    tempo: A('<path d="M13 6h22M13 42h22"/><path d="M15 6c0 10 18 12 18 18S15 32 15 42"/><path d="M33 6c0 10-18 12-18 18s18 8 18 18"/><path d="M20 38h8" stroke-width="3"/>'),
    pontos: A('<path d="M24 5l5.6 12 13 1.5-9.7 8.8 2.8 12.8L24 33.6l-11.7 6.5 2.8-12.8-9.7-8.8 13-1.5z"/>'),
};
/** Símbolo de uma carta ou arcano (o fôlego da carta e o do arcano são o mesmo desenho). */
export const simbolo = (id) => SIMBOLOS[id] || SIMBOLOS.pontos;
