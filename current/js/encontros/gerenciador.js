// ============================================
// GERENCIADOR DOS ENCONTROS DE UMA MISSÃO
// Escolhe os 2 pontos fixos (semente da missão, sobre casas alcançáveis do mapa real), vigia o gatilho do
// Geiger, conduz a cadeia pergunta -> retorno -> reforço -> ensino e guarda o crédito de cada encontro.
// Regras: docs/encontros-5c.md. O relógio de jogo fica parado enquanto um encontro está aberto.
// ============================================
import { CONFIG } from '../data/config.js';
import { CONCEITOS, TEMAS } from '../data/encontros/conceitos.js';
import { PERGUNTAS } from '../data/encontros/perguntas.js';
import { GameState } from '../estado.js';
import { currentLang, t } from '../i18n/index.js';
import { salvar } from '../progresso.js';
import { TOTAL_ENCONTROS } from './aproveitamento.js';
import { aplicarResultado, iniciar, responder, rng } from './motor.js';
import { mastro } from '../jornal/jornal.js';
import { novoCofre, creditos as creditosDoCofre, registros as registrosDoCofre } from './cofre.js';

export const INTERVALO_MIN_MS = 40000;   // intervalo mínimo de jogo entre encontros
export const GEIGER_SINAL_MS = 1500;     // sinal contínuo acima do fundo para o gatilho do Geiger
export const GEIGER_APOS_MS = 15000;     // o gatilho do Geiger só vale depois de 15 s de jogo

const dormir = (ms) => new Promise((ok) => setTimeout(ok, ms));

export class Encontros {
    constructor(cena) {
        this.cena = cena;
        this.pontos = [];            // [{x, y}] em casas; cada um dispara uma vez
        this.feitos = 0;
        this.creditos = [];
        this.cofreCreditos = [];
        this.cofreFeito = false;
        this.usadas = [];
        this.nosUsados = [];
        this.usouGeiger = false;
        this.ultimoMs = -Infinity;
        this.sinalMs = 0;
        this.rodando = false;
        this.cancelado = false;
    }

    /** Setting do jogador. Desligado = sem encontros (aproveitamento máximo 75%). */
    get ativo() { return GameState.settings.encontros !== false && !(this.cena && this.cena.missionData && this.cena.missionData.rapida); }   // missão rápida: sem encontros
    get ui() { return this.cena.uiEncontro; }

    /** Casas alcançáveis a partir da largada, longe da largada e de fontes; escolha semeada pela missão. */
    calcularPontos() {
        const c = this.cena, T = CONFIG.TILE_SIZE, C = c.mapCols || CONFIG.MAP_COLS, R = c.mapRows || CONFIG.MAP_ROWS;
        const { playerStart } = c.mapData;
        const livre = (x, y) => x >= 0 && y >= 0 && x < C && y < R && !c.isBlocked(x * T + T / 2, y * T + T / 2);
        const dist = new Map([[`${playerStart.x},${playerStart.y}`, 0]]);
        const fila = [[playerStart.x, playerStart.y]];
        for (let i = 0; i < fila.length; i++) {
            const [x, y] = fila[i], d = dist.get(`${x},${y}`);
            for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nx = x + dx, ny = y + dy, k = `${nx},${ny}`;
                if (!dist.has(k) && livre(nx, ny)) { dist.set(k, d + 1); fila.push([nx, ny]); }
            }
        }
        const fontes = (c.sources || []).map((s) => ({ x: s.furniture.centerX / T, y: s.furniture.centerY / T }));
        const longeDeFonte = (x, y) => fontes.every((f) => Math.hypot(f.x - (x + 0.5), f.y - (y + 0.5)) >= 3);
        const todos = fila.map(([x, y]) => ({ x, y, d: dist.get(`${x},${y}`) }));
        for (const minimo of [8, 5, 3, 0]) {
            const cand = todos.filter((q) => q.d >= minimo && longeDeFonte(q.x, q.y));
            if (cand.length >= 8) { this.escolherPontos(cand); return; }
        }
        this.escolherPontos(todos);
    }

    escolherPontos(cand) {
        const r = rng(((this.cena.missionData.id | 0) * 104729 + 991) >>> 0);
        const l = [...cand].sort((a, b) => (a.x - b.x) || (a.y - b.y));   // ordem estável antes do sorteio
        for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
        const out = [];
        for (const q of l) {
            if (out.every((o) => Math.max(Math.abs(o.x - q.x), Math.abs(o.y - q.y)) >= 6)) out.push({ x: q.x, y: q.y });
            if (out.length === 2) break;
        }
        for (const q of l) { if (out.length >= 2) break; if (!out.some((o) => o.x === q.x && o.y === q.y)) out.push({ x: q.x, y: q.y }); }
        this.pontos = out;
    }

    iniciar() {
        this.cancelado = false;
        if (!this.ativo) return;
        this.calcularPontos();
    }

    cancelar() {
        this.cancelado = true;
        if (this.cena.uiEncontro) this.cena.uiEncontro.cancelar();
        this.rodando = false;
        this.cena.emEncontro = false;
    }

    /** Chamado a cada quadro livre (sem modal, sem pausa, sem fim). */
    checar(delta) {
        if (!this.ativo || this.rodando || this.cancelado || this.feitos >= TOTAL_ENCONTROS) return;
        const c = this.cena;
        if (c.elapsedMs - this.ultimoMs < INTERVALO_MIN_MS) return;
        const T = CONFIG.TILE_SIZE;
        const tx = Math.floor(c.player.x / T), ty = Math.floor(c.player.y / T);
        const i = this.pontos.findIndex((p) => p.x === tx && p.y === ty);
        if (i >= 0) {
            this.pontos.splice(i, 1);
            this.rodar('fixo');
            return;
        }
        // gatilho do Geiger: sinal contínuo acima de 2x o fundo, uma vez por missão
        if (!this.usouGeiger && c.geigerActive && c.currentReading > CONFIG.BG_RADIATION * 2 && c.elapsedMs >= GEIGER_APOS_MS) {
            this.sinalMs += delta || 0;
            if (this.sinalMs >= GEIGER_SINAL_MS) { this.usouGeiger = true; this.rodar('geiger'); }
        } else this.sinalMs = 0;
    }

    /** Executa um encontro completo. Resolve quando o jogador volta ao campo. */
    async rodar(gatilho) {
        if (this.rodando || this.cancelado) return;
        const c = this.cena;
        this.rodando = true;
        c.emEncontro = true;
        GameState.modalAberto = true;
        GameState.virtual = {}; GameState.virtualVec = null;
        try {
            await c.mostrarBalao();
            if (this.cancelado) return;
            const n = this.feitos + 1;
            const semente = ((c.missionData.id | 0) * 10007 + n * 131 + (gatilho === 'geiger' ? 7 : 3)) >>> 0;
            const enc = iniciar(CONCEITOS, PERGUNTAS, GameState.aprendizado, { missao: c.missionData.id, gatilho, semente, usadas: this.usadas, nosUsados: this.nosUsados });
            if (!enc) { this.feitos++; this.creditos.push(0); return; }
            const fim = await this.conduzir(enc, n, semente);
            if (this.cancelado || !fim) return;
            GameState.aprendizado = aplicarResultado(GameState.aprendizado, enc);
            salvar();
            this.usadas.push(...enc.cadeia.map((p) => p.id));
            this.nosUsados.push(enc.no);
            this.creditos.push(enc.fim.credito);
            this.feitos++;
            this.ultimoMs = c.elapsedMs;
        } finally {
            if (!this.cancelado) {
                this.ui.fechar();
                c.emEncontro = false;
                GameState.modalAberto = false;
            }
            this.rodando = false;
        }
    }

    async conduzir(enc, n, semente) {
        const ui = this.ui;
        const no = (id) => CONCEITOS.find((x) => x.id === id);
        const cartaDe = (id) => { const x = no(id); const l = x[currentLang] || x.pt; return { titulo: l.titulo, ficha: l.ficha, fonte: l.fonte }; };
        const nomeTema = (id) => t('encTheme_' + no(id).tema);
        let p = enc.cadeia[0];
        for (;;) {
            const resp = await ui.perguntar(p, { n, total: TOTAL_ENCONTROS, tema: nomeTema(p.no), reforco: enc.passo > 0, semente: semente + enc.passo, jornal: mastro((this.cena.missionData || {}).id, currentLang, { reforco: enc.passo > 0, formato: p.formato }) });
            if (this.cancelado || (resp && resp.cancelado)) return null;
            const r = responder(enc, CONCEITOS, PERGUNTAS, GameState.aprendizado, resp);
            if (r.pulou) break;
            ui.tocar(r.acertou);
            // errou: mostra a ficha de reforço do conceito; acertou: só a explicação
            const cont = await ui.retorno(p, r.acertou, r.acertou ? null : cartaDe(p.no), r.proxima ? t('encSimpler') : null, resp === 'naosei');
            if (this.cancelado || (cont && cont.cancelado)) return null;
            if (r.proxima) { p = r.proxima; continue; }
            break;
        }
        const f = enc.fim;
        // Ensino: soluções das perguntas anteriores (da mais simples à original); ficha se houve ajuda
        const itens = f.ensino.map((q) => ({ p: q }));
        const ficha = f.ficha ? cartaDe(f.ficha) : null;
        const sair = await ui.encerramento(f, f.credito === 0 && !f.pulou ? ficha : null, itens);
        if (this.cancelado || (sair && sair.cancelado)) return null;
        return f;
    }

    /**
     * Cofre de transporte (5e): o jogador guarda cada isótopo da missão na prateleira certa e escolhe a blindagem de cada
     * prateleira usada (interface em cofre-ui.js, regras em cofre.js). Tempo da missão congelado; Esc e pausa tratados pela interface.
     * Sair antes de terminar vale 0 para o que ficou sem guardar. Registra no caderno os conceitos N04/N09.
     */
    async cofre() {
        if (!this.ativo || this.cancelado || this.cofreFeito) return;
        const c = this.cena;
        const inicial = novoCofre(c.sources);
        if (!inicial.itens.length) return;
        this.cofreFeito = true;
        c.emEncontro = true;
        GameState.modalAberto = true;
        GameState.virtual = {}; GameState.virtualVec = null;
        try {
            const r = await c.uiCofre.abrir({ estado: inicial, fontes: c.sources, missaoId: c.missionData.id, titulo: t(c.missionData.titleKey), lang: currentLang });
            if (this.cancelado || !r || r.cancelado) return;
            this.cofreCreditos = creditosDoCofre(r.estado);
            for (const reg of registrosDoCofre(r.estado)) GameState.aprendizado = aplicarResultado(GameState.aprendizado, reg);
            salvar();
        } finally {
            if (!this.cancelado) {
                c.uiCofre.fechar();
                c.emEncontro = false;
                GameState.modalAberto = false;
            }
        }
    }

    /** No fim da missão: apresenta os encontros que não aconteceram no caminho. */
    async concluirRestantes() {
        while (this.ativo && !this.cancelado && this.feitos < TOTAL_ENCONTROS) {
            const antes = this.feitos;
            await this.rodar(this.feitos === 2 && !this.usouGeiger ? 'geiger' : 'fixo');
            if (this.feitos === antes) break;   // cancelado ou sem perguntas
        }
    }
}

export { TEMAS };
