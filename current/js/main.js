/**
 * RADIATION HUNTERS - The Isotope Chronicles
 * Version 3.40.0
 * 
 * A gamified physics education tool for teaching about radioactive decay,
 * radiation types, and shielding materials.
 * 
 * Based on REAL radioactive accidents for educational purposes.
 * 
 * By Grupo de Cronologia - IFGW - Arnaldo Filho
 */

import { temJornal } from './jornal/jornal.js';
import { jornalRapida, jornalInvestigacao } from './jornal/reportagens.js';
import { audioManager } from './audio.js';
import { CONFIG } from './data/config.js';
import { ISOTOPES } from './data/isotopes.js';
import { MISSIONS } from './data/missoes/index.js';
import { SHIELDS } from './data/shields.js';
import { GameState } from './estado.js';
import * as Geiger from './fisica/geiger.js';
import { hasLineOfSight } from './fisica/linha-de-visao.js';
import { currentLang, i18n, setLang, t, updateTexts } from './i18n/index.js';
import { VERSAO, parametros } from './modo.js';
import { superficieSvg } from './agencia/base-svg.js';
import { carregar, lerIdioma, salvar } from './progresso.js';
import { GameScene } from './scenes/GameScene.js';
import { InvestigacaoScene, missaoInvestigacao } from './investigacao/campo.js';
import { investigacaoPorId } from './investigacao/index.js';
import { UIManager, ui } from './ui.js';

// ============================================
// INITIALIZE PHASER GAME
// ============================================
let game = null;

let pendingMission = null;

// Start game when mission is selected
const originalStartMission = UIManager.prototype.startMission;

UIManager.prototype.startMission = function(mission) {
    GameState.currentMission = mission;
    pendingMission = mission;
    
    // Show story intro first
    this.mostrarHistoria(mission.storyText || t(mission.storyKey), mission.rapida ? jornalRapida(mission) : mission.tutorial ? 'tutorial' : (temJornal(mission.id) ? mission.id : null));
    
    this.showScreen('storyIntro');
};

// When story continues, actually start the game
document.getElementById('story-voltar').addEventListener('click', () => ui.avancarHistoria(-1));
document.getElementById('story-continue').addEventListener('click', () => {
    if (!pendingMission) return;
    if (ui.avancarHistoria(1)) return; // ainda há partes da história
    
    iniciarJogoPendente();
});

function iniciarJogoPendente() {
    // First show the game screen so the container is visible
    ui.hideScreen('storyIntro');
    ui.showScreen('gameScreen');
    
    // Wait a frame for the DOM to update
    requestAnimationFrame(() => {
        // Initialize or restart Phaser game
        if (game) {
            game.destroy(true);
            game = null;
        }
        
        // Get container dimensions
        const container = document.getElementById('game-container');
        const rect = container.getBoundingClientRect();
        
        // Create GameScene class with pending mission data
        class GameSceneInstance extends (pendingMission.investigacao ? InvestigacaoScene : GameScene) {
            constructor() {
                super();
                this.missionData = pendingMission;
            }
        }
        
        // Create new game config with the mission
        const config = {
            type: Phaser.CANVAS,
            width: CONFIG.WIDTH,
            height: CONFIG.HEIGHT,
            parent: 'game-container',
            backgroundColor: '#0a0a0f',
            callbacks: { preBoot: (g) => g.registry.set('dpr', dprDoJogo()) },
            scene: [GameSceneInstance],
            render: {
                pixelArt: false,
                antialias: true,
            },
            scale: {
                // O canvas tem (tamanho do contêiner x dpr) pixels e o CSS o estica a 100%; a câmera do jogo adapta
                // zoom e enquadramento (GameScene.ajustarCamera). Mudanças de tamanho: ajustarTamanhoDoJogo.
                mode: Phaser.Scale.NONE,
                width: Math.max(2, Math.round(rect.width * dprDoJogo())),
                height: Math.max(2, Math.round(rect.height * dprDoJogo())),
            }
        };
        
        game = new Phaser.Game(config);
        if (!window.__rhObservador) {
            window.__rhObservador = new ResizeObserver(() => ajustarTamanhoDoJogo());
            window.__rhObservador.observe(document.getElementById('game-container'));
            window.addEventListener('orientationchange', () => setTimeout(ajustarTamanhoDoJogo, 150));
        }
    });
}

document.addEventListener('rh:investigacao',(evento)=>{
    pendingMission=missaoInvestigacao(evento.detail.id,currentLang);GameState.currentMission=pendingMission;
    if(ui.origem==='agencia'||evento.detail.relato){   // v3.24/3.26: pela Agência ou pelo menu, a investigação abre como reportagem (jornal, TV ou rádio) antes do mapa
        const inv=investigacaoPorId(evento.detail.id);
        if(inv){ui.mostrarHistoria('',jornalInvestigacao(inv));ui.showScreen('storyIntro');return;}
    }
    iniciarJogoPendente();
});

/** Densidade de pixels do canvas: a da tela, no máximo 1,5 (nitidez sem pesar no renderizador Canvas). */
function dprDoJogo() { return Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.5); }

/** Acompanha o tamanho do contêiner (rotação do celular, janela do computador). */
function ajustarTamanhoDoJogo() {
    if (!game || !game.scale) return;
    const r = document.getElementById('game-container').getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const d = dprDoJogo(), w = Math.round(r.width * d), h = Math.round(r.height * d);
    if (game.scale.width !== w || game.scale.height !== h) game.scale.resize(w, h);
}

// Encerra o jogo Phaser quando o jogador volta ao menu (evento emitido por ui.encerrarJogo)
function encerrarPhaser() {
    if (game) {
        try { game.destroy(true); } catch (e) {}
        game = null;
    }
    window.gameScene = null;
    // destroy() remove o canvas só no próximo quadro; limpamos já para o menu não ficar com restos
    const c = document.getElementById('game-container');
    if (c) c.replaceChildren();
}
document.addEventListener('rh:encerrar', encerrarPhaser);

// Initialize on load
function iniciar() {
    // Idioma salvo (o armazenamento pode estar bloqueado: lerIdioma nunca lança)
    const savedLang = lerIdioma();
    if (savedLang) {
        setLang(savedLang);
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLang);
        });
    }
    
    updateTexts();
    
    // Progresso e configurações, sempre saneados
    carregar();
    
    document.getElementById('sound-volume').value = GameState.settings.soundVolume;
    document.getElementById('music-volume').value = GameState.settings.musicVolume;
    // elementos novos: se a página em cache for antiga, o menu continua funcionando (sem as chaves)
    const chaveMusica = document.getElementById('music-on'), chaveEfeitos = document.getElementById('sound-on');
    if (chaveMusica) chaveMusica.checked = GameState.settings.musicOn !== false;
    if (chaveEfeitos) chaveEfeitos.checked = GameState.settings.soundOn !== false;
    document.getElementById('show-hints').checked = GameState.settings.showHints;
    document.getElementById('screen-shake').checked = GameState.settings.screenShake;
    document.getElementById('encontros-toggle').checked = GameState.settings.encontros !== false;
    document.getElementById('revisao-toggle').checked = GameState.settings.revisao === true;
    
    audioManager.setVolume(GameState.settings.soundVolume);
    audioManager.setMusicVolume(GameState.settings.musicVolume);
    audioManager.setMusicaLigada(GameState.settings.musicOn !== false);
    audioManager.setEfeitosLigados(GameState.settings.soundOn !== false);
    ui.atualizarContinuar();

    // Cena noturna atrás do menu (v3.14): desenho vetorial do kit de arte, só decoração (sem leitor de tela, sem cliques)
    const menu = document.getElementById('main-menu');
    if (menu && !document.getElementById('menu-cena')) {
        const cena = document.createElement('div');
        cena.id = 'menu-cena'; cena.setAttribute('aria-hidden', 'true');
        cena.innerHTML = superficieSvg([{ tipo: 'tripulacao' }, { tipo: 'levantamento' }, { tipo: 'resgate' }], 3);
        menu.insertBefore(cena, menu.firstChild);
    }

    // Versão visível e modo professor (?missao=N abre direto; ?estudo=1 tira o tempo do aproveitamento)
    const par = parametros();
    const v = document.getElementById('versao-jogo');
    if (v) v.textContent = 'v' + VERSAO + (par.estudo ? ' · ' + t('studyMode') : '');
    if (par.missao) ui.startMission(MISSIONS[par.missao - 1]);
    else if (par.investigacao) ui.abrirInvestigacao(par.investigacao === 'hospital' ? 'hospital-imagem' : par.investigacao, new URLSearchParams(location.search).get('leitura')==='1');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();

// Salva ao sair da página (a conclusão de missão e as configurações já gravam na hora)
window.addEventListener('beforeunload', () => { salvar(); });

// ============================================
// GLOBAIS PARA TESTES E DEPURAÇÃO
// ============================================
// Os módulos não criam globais. Estes nomes eram globais no game.js antigo e a
// suíte de testes (tests/) os lê pelo console da página; `currentLang` é um
// getter para refletir o valor atual.
Object.assign(globalThis, { i18n, CONFIG, ISOTOPES, SHIELDS, MISSIONS, GameState, hasLineOfSight, Geiger, GameScene, UIManager, ui });
Object.defineProperty(globalThis, 'currentLang', { get: () => currentLang, configurable: true });
