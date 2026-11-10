// ============================================
// UTILITY FUNCTIONS
// ============================================
// v3.43: fonte de acaso trocável (semente da turma); padrão = Math.random
let aleatorio = Math.random;
/** Troca o gerador de números aleatórios usado por randomRange e shuffleArray (null volta a Math.random). */
export function usarAleatorio(fn) { aleatorio = typeof fn === 'function' ? fn : Math.random; }
export function randomRange(min, max) {
    return Math.floor(aleatorio() * (max - min + 1)) + min;
}

export function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(aleatorio() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
