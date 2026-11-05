// ============================================
// KIT DE ARTE · PALETA (v3.12). Cores e utilitários de tom. Módulo PURO (só texto), testável em Node.
// Regra do kit: toda cor desenhada vem daqui. Para sombrear/iluminar use tom(cor, k), nunca um hexadecimal solto.
// Estilo: "corte lateral de base subterrânea" em pixel art vetorial, luz fria vinda de cima, realces em amarelo/verde de painel.
// ============================================
export const P = {
    // aço azulado (parede, painéis): do mais escuro ao mais claro
    aco0: '#070e15', aco1: '#0f1b27', aco2: '#182a3b', aco3: '#233e55', aco4: '#355a78', aco5: '#5b88a8', aco6: '#a9cde3',
    // rocha e terra (do fundo para a frente)
    rocha0: '#0e0a08', rocha1: '#18110d', rocha2: '#251a13', rocha3: '#34261b', rocha4: '#47342a',
    // concreto da superfície
    concreto: '#59707f', concretoClaro: '#7d94a3',
    // sinalização
    verde: '#00ff88', verdeEsc: '#0a8f55', ambar: '#ffcc00', ambarEsc: '#8a6a00', laranja: '#ff6b35', vermelho: '#ff4a4a', ciano: '#9fd8ff',
    luzFria: '#bfe6ff', luzQuente: '#ffd9a0',
    // pessoas
    peles: ['#e0b48a', '#c58c5f', '#8d5a3b', '#f0cba6', '#a86f4a'],
    cabelos: ['#2a1d14', '#5a3a22', '#c9a15a', '#9a9aa0', '#161616', '#7b3b1d'],
    jalecos: ['#e8f0f5', '#e8f0f5', '#cfe3ee', '#f3ead3'],
};

const hex = (c) => { if (/^#?[0-9a-f]{3}$/i.test(c)) c = '#' + c.replace('#', '').split('').map((d) => d + d).join(''); const m = /^#?([0-9a-f]{6})$/i.exec(c); if (!m) throw new Error('cor inválida: ' + c); return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)); };
const para = (v) => '#' + v.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');

/** Clareia (k > 0, até 1 = branco) ou escurece (k < 0, até -1 = preto) uma cor. */
export function tom(cor, k) {
    const v = hex(cor);
    return para(k >= 0 ? v.map((n) => n + (255 - n) * k) : v.map((n) => n * (1 + k)));
}

/** Gerador pseudoaleatório determinístico (mulberry32): a arte "aleatória" é sempre a mesma para a mesma semente. */
export function prng(semente) {
    let a = semente >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
