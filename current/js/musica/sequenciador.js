// ============================================
// SEQUENCIADOR: toca uma trilha compilada com o Web Audio (síntese, sem arquivos de áudio).
// Agenda as notas um pouco à frente do relógio do AudioContext; o mesmo código serve para renderizar fora de tempo
// (OfflineAudioContext), usado nos testes para medir nível e silêncio.
// ============================================
import { frequencia, segundosPorPasso } from './partitura.js';

const PRESET = {
    quadrada: { tipo: 'square', g: 0.5, a: 0.008, r: 0.07 },
    pulso25: { pulso: 0.25, g: 0.6, a: 0.008, r: 0.07 },
    triangulo: { tipo: 'triangle', g: 0.9, a: 0.01, r: 0.1 },
    serra: { tipo: 'sawtooth', g: 0.28, a: 0.01, r: 0.1 },
    seno: { tipo: 'sine', g: 0.9, a: 0.02, r: 0.16 },
};
const PAPEL = { lead: 0.55, harm: 0.28, bass: 0.6 };   // balanço entre as vozes
const PERC = 0.4;

const ondas = new WeakMap();
function ondaPulso(ctx, duty) {
    let m = ondas.get(ctx);
    if (!m) { m = {}; ondas.set(ctx, m); }
    if (!m[duty]) {
        const n = 48, real = new Float32Array(n), imag = new Float32Array(n);
        for (let k = 1; k < n; k++) {
            real[k] = Math.sin(2 * Math.PI * k * duty) / (k * Math.PI);
            imag[k] = (1 - Math.cos(2 * Math.PI * k * duty)) / (k * Math.PI);
        }
        m[duty] = ctx.createPeriodicWave(real, imag);
    }
    return m[duty];
}
function ruido(ctx) {
    let m = ondas.get(ctx);
    if (!m) { m = {}; ondas.set(ctx, m); }
    if (!m.ruido) {
        const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0);
        let x = 22222;   // ruído determinístico (mesmo som em toda execução)
        for (let i = 0; i < d.length; i++) { x = (x * 1664525 + 1013904223) >>> 0; d[i] = x / 2147483648 - 1; }
        m.ruido = b;
    }
    return m.ruido;
}

function nota(ctx, dest, midi, t, dur, preset, vol, ataque) {
    const osc = ctx.createOscillator();
    if (preset.pulso) osc.setPeriodicWave(ondaPulso(ctx, preset.pulso)); else osc.type = preset.tipo;
    osc.frequency.value = frequencia(midi);
    const g = ctx.createGain();
    const a = Math.min(ataque || preset.a, dur), alvo = vol * preset.g, fim = t + Math.max(dur, a + 0.01);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(alvo, t + a);
    g.gain.setValueAtTime(alvo, fim);
    g.gain.linearRampToValueAtTime(0, fim + preset.r);
    osc.connect(g); g.connect(dest);
    osc.start(t); osc.stop(fim + preset.r + 0.02);
}

function percussao(ctx, dest, k, t, vol) {
    const v = vol * PERC;
    if (k === 'k') {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        g.gain.setValueAtTime(v * 1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.18);
        return;
    }
    const src = ctx.createBufferSource();
    src.buffer = ruido(ctx);
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    if (k === 's') { f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.13); }
    else { f.type = 'highpass'; f.frequency.value = 7000; g.gain.setValueAtTime(v * 0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.045); }
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t); src.stop(t + 0.2);
}

/** Indexa os eventos por passo (uma vez por trilha). */
export function indexar(c) {
    if (c._ix) return c._ix;
    const ix = Array.from({ length: c.total }, () => []);
    for (const [grupo, lista] of [['lead', c.melodia], ['harm', c.harmonia], ['bass', c.baixo]]) for (const e of lista) ix[e.s].push({ ...e, grupo });
    for (const e of c.perc) ix[e.s].push({ ...e, grupo: 'perc' });
    c._ix = ix;
    return ix;
}

/** Agenda os eventos de um passo (0 ≤ passo < total) no tempo t (do relógio do contexto). */
export function agendarPasso(ctx, dest, c, passo, t) {
    const dp = segundosPorPasso(c.bpm);
    const at = t + (passo % 2 === 1 ? c.swing * dp : 0);
    for (const e of indexar(c)[passo]) {
        if (e.grupo === 'perc') { percussao(ctx, dest, e.k, at, e.v); continue; }
        const preset = PRESET[c.voz[e.grupo]];
        const dur = Math.max(0.05, e.d * dp * (e.grupo === 'lead' ? 0.92 : e.grupo === 'bass' ? 0.9 : 0.97));
        nota(ctx, dest, e.midi, at, dur, preset, e.v === undefined ? 1 * PAPEL[e.grupo] : e.v * PAPEL[e.grupo], e.ataque);
    }
}

/** Renderização fora de tempo: agenda `segundos` de música a partir de t0 (para testes e ferramentas). */
export function agendarTudo(ctx, dest, c, segundos, t0 = 0) {
    const dp = segundosPorPasso(c.bpm);
    for (let i = 0, t = t0; t < t0 + segundos; i++, t += dp) agendarPasso(ctx, dest, c, i % c.total, t);
}

export class Sequenciador {
    constructor(ctx, destino) { this.ctx = ctx; this.destino = destino; this.timer = null; this.c = null; }

    tocar(c) {
        this.parar();
        this.c = c;
        this.passo = 0;
        this.t = this.ctx.currentTime + 0.1;
        this.timer = setInterval(() => this.tick(), 60);
        this.tick();
    }

    tick() {
        const c = this.c, ctx = this.ctx;
        if (!c) return;
        if (this.t < ctx.currentTime - 0.3) this.t = ctx.currentTime + 0.05;   // aba ficou em segundo plano: retoma sem rajada de notas
        const dp = segundosPorPasso(c.bpm);
        while (this.t < ctx.currentTime + 0.35) {
            agendarPasso(ctx, this.destino, c, this.passo, this.t);
            this.passo = (this.passo + 1) % c.total;
            this.t += dp;
        }
    }

    parar() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null; this.c = null;
    }
}
