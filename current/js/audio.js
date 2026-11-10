// ============================================
// AUDIO MANAGER
// ============================================
import { compilar } from './musica/partitura.js';
import { trilhaDaMissao } from './musica/trilhas.js';
import { Sequenciador } from './musica/sequenciador.js';

/** Ganho mestre da música (multiplicado pelo volume das Configurações, 0–1). */
export const GANHO_MUSICA = 0.5;

export class AudioManager {
    constructor() {
        this.audioContext = null;
        this.geigerOscillator = null;
        this.volume = 0.7;
        this.musicVolume = 0.5;
        this.music = null;
        this.efeitosLigados = true;   // chave geral dos efeitos (Configurações)
        this.musicaLigada = true;     // chave geral da música (Configurações)
    }
    
    init() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.log('Audio not available');
            }
        }
        this.desbloquear();
    }
    
    /** Navegadores (Safari em especial) deixam o áudio suspenso até um gesto do jogador: retoma no próximo toque, clique ou tecla. */
    desbloquear() {
        const ctx = this.audioContext;
        if (!ctx || this._desbloqueio) return;
        const retomar = () => {
            if (ctx.state !== 'running') { try { ctx.resume(); } catch (e) {} }
            if (ctx.state === 'running') {
                for (const ev of ['pointerdown', 'keydown', 'touchend']) document.removeEventListener(ev, retomar, true);
                this._desbloqueio = false;
            }
        };
        this._desbloqueio = true;
        for (const ev of ['pointerdown', 'keydown', 'touchend']) document.addEventListener(ev, retomar, true);
        retomar();
    }
    
    playGeigerClick() {
        if (!this.audioContext || this.volume === 0 || !this.efeitosLigados) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = 800 + Math.random() * 400;
            osc.type = 'square';
            
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
            
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (e) {}
    }
    
    /** Sons curtos da interface da Base (v3.15): 'menu' (bip), 'sala' (dois tons), 'obra' (batida grave). Respeita volume e a chave de efeitos. */
    playClique(tipo = 'menu') {
        if (!this.audioContext || this.volume === 0 || !this.efeitosLigados) return;
        try {
            const ctx = this.audioContext, now = ctx.currentTime;
            const tons = { menu: [[660, 0, 'square', 0.05]], sala: [[440, 0, 'triangle', 0.09], [660, 0.06, 'triangle', 0.09]], obra: [[120, 0, 'sawtooth', 0.12]] }[tipo] || [[660, 0, 'square', 0.05]];
            for (const [freq, atraso, onda, dur] of tons) {
                const osc = ctx.createOscillator(), gain = ctx.createGain();
                osc.connect(gain); gain.connect(ctx.destination);
                osc.type = onda; osc.frequency.value = freq;
                const t0 = now + atraso;
                gain.gain.setValueAtTime(0, t0);
                gain.gain.linearRampToValueAtTime(this.volume * 0.08, t0 + 0.005);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
                osc.start(t0); osc.stop(t0 + dur + 0.01);
            }
        } catch (e) {}
    }

    playSuccess() {
        if (!this.audioContext || this.volume === 0 || !this.efeitosLigados) return;
        
        try {
            const notes = [523, 659, 784]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.frequency.value = freq;
                osc.type = 'sine';
                
                const now = this.audioContext.currentTime + i * 0.1;
                gain.gain.setValueAtTime(this.volume * 0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
                
                osc.start(now);
                osc.stop(now + 0.3);
            });
        } catch (e) {}
    }
    
    playError() {
        if (!this.audioContext || this.volume === 0 || !this.efeitosLigados) return;
        
        try {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.frequency.value = 200;
            osc.type = 'sawtooth';
            
            const now = this.audioContext.currentTime;
            gain.gain.setValueAtTime(this.volume * 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {}
    }
    
    /** v3.38: alarme do dosímetro (três bipes curtos e agudos). */
    playAlarmeDose() {
        if (!this.audioContext || this.volume === 0 || !this.efeitosLigados) return;
        try {
            const now = this.audioContext.currentTime;
            for (let k = 0; k < 3; k++) {
                const osc = this.audioContext.createOscillator(), gain = this.audioContext.createGain();
                osc.connect(gain); gain.connect(this.audioContext.destination);
                osc.frequency.value = 2400; osc.type = 'square';
                const t0 = now + k * 0.18;
                gain.gain.setValueAtTime(this.volume * 0.08, t0);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
                osc.start(t0); osc.stop(t0 + 0.12);
            }
        } catch (e) {}
    }

    setEfeitosLigados(ligado) { this.efeitosLigados = ligado !== false; }
    
    setMusicaLigada(ligado) {
        this.musicaLigada = ligado !== false;
        this.setMusicVolume(this.musicVolume * 100);
    }
    
    setVolume(value) {
        this.volume = value / 100;
    }
    
    // Trilha sonora por missão: composições originais sintetizadas em tempo real (js/musica/). Sem arquivos de áudio.
    startMusic(idMissao) {
        if (!this.audioContext) return;
        const trilha = trilhaDaMissao(idMissao);
        if (!trilha) { this.stopMusic(); return; }
        if (this.music && this.music.id === trilha.id) return;
        this.stopMusic();
        try {
            const ctx = this.audioContext;
            if (ctx.state === 'suspended') ctx.resume();
            const gain = ctx.createGain();
            gain.gain.value = 0;
            const comp = ctx.createDynamicsCompressor();   // limita picos quando várias vozes somam
            comp.threshold.value = -14; comp.ratio.value = 6; comp.attack.value = 0.005; comp.release.value = 0.2;
            gain.connect(comp); comp.connect(ctx.destination);
            const seq = new Sequenciador(ctx, gain);
            seq.tocar(compilar(trilha));
            this.music = { id: trilha.id, nivel: trilha.nivel || 1, gain, comp, seq };
            this.setMusicVolume(this.musicVolume * 100);
        } catch (e) { console.warn('Trilha sonora indisponível:', e); this.music = null; }
    }
    
    stopMusic() {
        if (!this.music) return;
        const { gain, comp, seq } = this.music;
        this.music = null;
        try {
            seq.parar();
            gain.gain.cancelScheduledValues(this.audioContext.currentTime);
            gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.12);
            setTimeout(() => { try { gain.disconnect(); comp.disconnect(); } catch (e) {} }, 1500);
        } catch (e) {}
    }
    
    setMusicVolume(value) {
        this.musicVolume = value / 100;
        if (this.music) {
            try { this.music.gain.gain.setTargetAtTime((this.musicaLigada ? this.musicVolume : 0) * GANHO_MUSICA * this.music.nivel, this.audioContext.currentTime, 0.15); } catch (e) {}
        }
    }
}

export const audioManager = new AudioManager();
