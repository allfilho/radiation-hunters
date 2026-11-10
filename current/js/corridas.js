// ============================================
// CORRIDAS (v3.43): arcanos oferecidos NO MEIO da missão e semente da turma. Lógica PURA (sem DOM nem Phaser).
//
// Inspiração (claude/radhunter-ideias-cult-of-the-lamb.md): as cartas de tarô que o jogador escolhe durante a corrida em
// Cult of the Lamb. Aqui, ao achar a 1ª e a 3ª fonte, o jogo oferece 2 arcanos e o jogador escolhe 1 (ou deixa passar);
// o efeito vale até o fim daquela missão. No modo professor, uma "semente da turma" faz todos jogarem a mesma corrida
// (mesma posição das fontes e mesmos arcanos oferecidos), para a turma comparar resultados. Valores [H].
// ============================================

export const ARCANOS = {
    radar: { segundos: 25 },     // a fonte não achada mais próxima pisca no minimapa por 25 s
    folego: { stamina: 0.5 },    // correr gasta metade do fôlego
    escudo: {},                  // o próximo erro de identificação não custa dose nem quebra o combo
    passos: { velocidade: 1.1 }, // anda 10 % mais rápido
    tempo: { segundos: 30 },     // +30 s na meta de tempo
    pontos: { fator: 1.5 },      // +50 % de pontos nas próximas fontes
};
export const IDS_ARCANOS = Object.keys(ARCANOS);
export const OFERTA = { quando: [1, 3], escolhas: 2, segundos: 20 };   // ao achar a 1ª e a 3ª fonte; 2 opções; some em 20 s

/** Hash FNV-1a de um texto (32 bits). */
export function hashTexto(s) { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; return h; }
/** Gerador determinístico (mulberry32). */
export function prng(semente) { let a = (semente >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Semente da turma válida: letras e números, 1 a 12 caracteres, em maiúsculas; '' se inválida. */
export const saneaSementeTurma = (s) => { const v = String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); return v; };

/** Oferta de arcanos: `n` diferentes, sem repetir os já escolhidos. */
export function sortearOferta(rand, ja = [], n = OFERTA.escolhas) {
    const livres = IDS_ARCANOS.filter((id) => !ja.includes(id)), out = [];
    while (out.length < n && livres.length) out.push(livres.splice(Math.floor(rand() * livres.length), 1)[0]);
    return out;
}
/** Esta fonte achada abre uma oferta? (contagem de fontes já achadas, incluindo a atual) */
export const abreOferta = (achadas, total) => OFERTA.quando.includes(achadas) && achadas < total;
