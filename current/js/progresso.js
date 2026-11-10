// ============================================
// PROGRESSO: leitura/gravação do localStorage com saneamento
// (o armazenamento pode estar bloqueado, vazio ou conter lixo de versões antigas)
// ============================================
import { MISSIONS } from './data/missoes/index.js';
import { GameState } from './estado.js';
import { CONCEITOS } from './data/encontros/conceitos.js';
import { PERGUNTAS } from './data/encontros/perguntas.js';
import { normalizarAprendizado } from './encontros/motor.js';
import { saneaSementeTurma } from './corridas.js';

const CHAVE = 'radiationHunters';
const CHAVE_LANG = 'radiationHuntersLang';

export function lerArmazenado(chave) {
    try { return localStorage.getItem(chave); } catch (e) { return null; }
}
export function gravarArmazenado(chave, valor) {
    try { localStorage.setItem(chave, valor); return true; } catch (e) { return false; }
}
export const lerIdioma = () => { const l = lerArmazenado(CHAVE_LANG); return l === 'en' || l === 'pt' ? l : null; };
export const gravarIdioma = (l) => gravarArmazenado(CHAVE_LANG, l);

const limitar = (v, lo, hi, padrao) => {
    const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : padrao;
};
const booleano = (v, padrao) => (typeof v === 'boolean' ? v : padrao);

/** Aplica dados salvos (qualquer formato) ao GameState, sempre produzindo valores válidos. */
export function sanear(dados) {
    const d = dados && typeof dados === 'object' ? dados : {};
    const n = MISSIONS.length;
    const lista = Array.isArray(d.unlockedMissions) ? d.unlockedMissions : [];
    const ids = new Set([1]);
    lista.forEach((x) => { if (Number.isInteger(x) && x >= 1 && x <= n) ids.add(x); });
    const s = d.settings && typeof d.settings === 'object' ? d.settings : {};
    const base = { soundVolume: 70, musicVolume: 50, musicOn: true, soundOn: true, showHints: true, screenShake: true, encontros: true, revisao: false };
    const estrelas = {};
    if (d.bestStars && typeof d.bestStars === 'object') {
        for (const [k, v] of Object.entries(d.bestStars)) {
            const id = Number(k);
            if (Number.isInteger(id) && id >= 1 && id <= n) estrelas[id] = limitar(v, 0, 3, 0);
        }
    }
    return {
        unlockedMissions: [...ids].sort((a, b) => a - b),
        bestStars: estrelas,
        settings: {
            soundVolume: limitar(s.soundVolume, 0, 100, base.soundVolume),
            musicVolume: limitar(s.musicVolume, 0, 100, base.musicVolume),
            musicOn: booleano(s.musicOn, base.musicOn),
            soundOn: booleano(s.soundOn, base.soundOn),
            showHints: booleano(s.showHints, base.showHints),
            screenShake: booleano(s.screenShake, base.screenShake),
            encontros: booleano(s.encontros, base.encontros),
            revisao: booleano(s.revisao, base.revisao),
            sementeTurma: saneaSementeTurma(s.sementeTurma),   // v3.43: modo professor
        },
        aprendizado: normalizarAprendizado(d.aprendizado, CONCEITOS, PERGUNTAS),
    };
}

export function carregar() {
    let dados = null;
    const bruto = lerArmazenado(CHAVE);
    if (bruto) { try { dados = JSON.parse(bruto); } catch (e) { dados = null; } }
    const ok = sanear(dados);
    GameState.unlockedMissions = ok.unlockedMissions;
    GameState.bestStars = ok.bestStars;
    GameState.settings = ok.settings;
    GameState.aprendizado = ok.aprendizado;
    return !!bruto;
}

export function salvar() {
    return gravarArmazenado(CHAVE, JSON.stringify({
        unlockedMissions: GameState.unlockedMissions,
        bestStars: GameState.bestStars,
        settings: GameState.settings,
        aprendizado: GameState.aprendizado,
    }));
}

/** Registra conclusão: desbloqueia a próxima e guarda o melhor número de estrelas. */
export function registrarConclusao(missaoId, estrelas) {
    if (missaoId >= 100) { GameState.ultimaConclusao = { id: missaoId, estrelas }; return; }   // missão rápida: não desbloqueia nem guarda melhor nota
    const prox = missaoId + 1;
    if (prox <= MISSIONS.length && !GameState.unlockedMissions.includes(prox)) GameState.unlockedMissions.push(prox);
    GameState.bestStars[missaoId] = Math.max(GameState.bestStars[missaoId] || 0, estrelas);
    GameState.ultimaConclusao = { id: missaoId, estrelas };   // lido pela Agência para pagar o alerta (não é salvo)
    salvar();
}

/** Pula a Academia (missão 1): libera a missão 2 sem estrelas. */
export function pularAcademia() {
    if (!GameState.unlockedMissions.includes(2) && MISSIONS.length >= 2) GameState.unlockedMissions.push(2);
    salvar();
}

/** Missão a retomar: a última desbloqueada. */
export const ultimaDesbloqueada = () => Math.max(...GameState.unlockedMissions);
export const temProgresso = () => GameState.unlockedMissions.length > 1 || Object.keys(GameState.bestStars).length > 0;
