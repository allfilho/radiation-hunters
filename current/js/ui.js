import { audioManager } from './audio.js';
import { MISSIONS } from './data/missoes/index.js';
import { htmlJornal, htmlFimJornal, temJornal } from './jornal/jornal.js';
import { jornalRapida, reportagemFim } from './jornal/reportagens.js';
import { GameState } from './estado.js';
import { currentLang, setLang, t, updateTexts } from './i18n/index.js';
import { formatTime } from './util.js';
import { aprendizadoVazio } from './encontros/motor.js';
import { EncontroUI } from './encontros/ui-encontro.js';
import { CofreUI } from './encontros/cofre-ui.js';
import { AgenciaUI } from './agencia/ui-agencia.js';
import { retratoSvg } from './investigacao/retratos.js';
import { LicaoUI } from './academia/ui-licao.js';
import { txt as txtAcad } from './academia/licoes.js';
import { limitePorTela, paginarTexto, rotuloParte, TXT_PAG } from './paginar.js';
import { INVESTIGACOES, investigacaoPorId, PROBLEMAS, prepararProblema, sortearProblema } from './investigacao/index.js';
import { InvestigacaoUI, TX as TX_INV } from './investigacao/ui-investigacao.js';
import { desenharCaderno } from './encontros/caderno.js';
import { carregar, gravarIdioma, pularAcademia, salvar, temProgresso, ultimaDesbloqueada } from './progresso.js';
import { criarSlots } from './slots.js';
import { SlotsUI } from './ui-slots.js';

// ============================================
// UI MANAGER
// ============================================
export class UIManager {
    constructor() {
        this.screens = {};
        this.modals = {};
        this.init();
    }
    
    init() {
        // Cache screen elements
        this.screens = {
            mainMenu: document.getElementById('main-menu'),
            missionSelect: document.getElementById('mission-select'),
            storyIntro: document.getElementById('story-intro'),
            gameScreen: document.getElementById('game-screen'),
            investigacao: document.getElementById('investigacao-screen'),
            agencia: document.getElementById('agencia-screen'),
        };
        
        // Cache modal elements
        this.modals = {
            identify: document.getElementById('identify-modal'),
            pause: document.getElementById('pause-modal'),
            complete: document.getElementById('complete-modal'),
            howto: document.getElementById('howto-modal'),
            settings: document.getElementById('settings-modal'),
            encontro: document.getElementById('encontro-modal'),
            cofre: document.getElementById('cofre-modal'),
            caderno: document.getElementById('caderno-modal'),
            slots: document.getElementById('slots-modal'),
        };
        this.encontro = new EncontroUI();
        this.cofre = new CofreUI();
        this.licao = new LicaoUI();
        this.investigacao = new InvestigacaoUI(this.screens.investigacao);
        this.origem = null;   // 'agencia' quando a missão ou a investigação foi aberta pela Base
        this.agencia = new AgenciaUI(this.screens.agencia, {
            sair: () => { this.origem = null; this.showScreen('mainMenu'); },
            iniciarMissao: (m) => { this.origem = 'agencia'; GameState.ultimaConclusao = null; GameState.doseMissao = 0; GameState.fontesColeta = 0; this.atualizarCaneta(null); this.startMission(m); this.atualizarEquipeHud(); },
            abrirInvestigacao: (id) => { this.origem = 'agencia'; this.abrirInvestigacao(id); },
            desbloqueadas: () => GameState.unlockedMissions,
            estrelas: (id) => this.getMissionStars(id),
            pularTreinamento: () => { pularAcademia(); },
            abrirCaderno: () => { desenharCaderno(); this.showModal('caderno'); },
        });
        this.investigacao.licaoUI = this.licao;   // lições extras (leitura opcional) abertas a partir das investigações
        
        this.slots = criarSlots();   // 3 vagas de save (slots.js); as chaves vivas são sempre as da vaga ativa
        this.slotsUI = new SlotsUI(this.modals.slots, this.slots, (n, op) => this.escolherVaga(n, op || {}));
        
        this.setupEventListeners();
    }
    
    /** Depois de trocar, criar ou apagar uma vaga: recarrega progresso e Agência da vaga ativa; se `n` veio, entra na Agência. */
    escolherVaga(n, { novo = false, mudou = false } = {}) {
        if (n != null && !this.slots.ativar(n, { novo })) return;
        carregar();
        this.agencia.est = this.agencia.carregar();
        GameState.ultimaConclusao = null; GameState.doseMissao = 0; GameState.fontesColeta = 0;
        this.updateMissionsDisplay(); this.atualizarContinuar();
        if (n != null) { this.origem = 'agencia'; this.agencia.abrir(); this.showScreen('agencia'); this.agencia.focar(); }
    }
    
    setupEventListeners() {
        // Language buttons
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setLang(btn.dataset.lang);
                updateTexts();
                this.updateMissionsDisplay();
                this.agencia.atualizar();
                this.slotsUI.atualizar();
                // Save language preference
                gravarIdioma(currentLang);
            });
        });
        
        // Continuar: retoma na última missão desbloqueada
        // Continuar: com uma só vaga ocupada, entra direto; com várias, pergunta qual (e a ativa vem marcada)
        document.getElementById('btn-continue').addEventListener('click', () => {
            if (this.slots.contar() > 1) { this.slotsUI.abrir('continuar'); return; }
            const v = this.slots.listar().find((x) => x.criada);
            this.escolherVaga(v ? v.n : this.slots.ativa(), { novo: !v });
        });
        
        // Esc: fecha o modal aberto, retoma a pausa ou pausa o jogo
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.aoPressionarEsc();
        });
        
        this.configurarToque();
        
        // Main menu buttons
        // Novo jogo e Continuar entram na Agência (o mapa-múndi); o progresso e o relógio ficam lá.
        // v3.11: Novo jogo abre as 3 vagas (vaga vazia = começa do zero; ocupada = continuar ou recomeçar com confirmação)
        document.getElementById('btn-new-game').addEventListener('click', () => this.slotsUI.abrir('novo'));

        document.getElementById('btn-missions').addEventListener('click', () => {
            this.origem = null;
            this.mostrarAba('missoes');   // do menu principal, as missões vêm primeiro
            this.showScreen('missionSelect');
            this.updateMissionsDisplay();
        });
        
        document.getElementById('btn-how-to-play').addEventListener('click', () => {
            this.showModal('howto');
        });
        
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.showModal('settings');
        });
        
        // Caderno de campo (menu e pausa)
        const abrirCaderno = () => { desenharCaderno(); this.showModal('caderno'); };
        document.getElementById('btn-caderno').addEventListener('click', abrirCaderno);
        document.getElementById('btn-caderno-pausa').addEventListener('click', abrirCaderno);
        document.getElementById('btn-settings-pausa')?.addEventListener('click', () => this.showModal('settings'));   // configurações dentro da missão (a janela abre sobre a pausa)
        document.getElementById('close-caderno').addEventListener('click', () => this.hideModal('caderno'));
        
        // Back button for missions
        document.querySelectorAll('.mission-tab').forEach((b) => b.addEventListener('click', () => this.mostrarAba(b.dataset.aba)));
        document.getElementById('btn-back-missions').addEventListener('click', () => {
            this.showScreen('mainMenu');
        });
        
        // Close modal buttons
        document.getElementById('close-howto').addEventListener('click', () => {
            this.hideModal('howto');
        });
        
        document.getElementById('close-settings').addEventListener('click', () => {
            this.hideModal('settings');
        });
        
        // Pause modal buttons
        document.getElementById('btn-resume').addEventListener('click', () => {
            this.hideModal('pause');
            if (window.gameScene) {
                window.gameScene.resumeGame();
            }
        });
        
        document.getElementById('btn-restart').addEventListener('click', () => {
            this.hideModal('pause');
            if (window.gameScene) {
                window.gameScene.restartMission();
            }
        });
        
        document.getElementById('btn-quit').addEventListener('click', () => {
            this.hideModal('pause');
            if (window.gameScene) {
                window.gameScene.quitToMenu();
            }
        });
        
        // Complete modal buttons
        document.getElementById('btn-next-mission').addEventListener('click', () => {
            this.hideModal('complete');
            this.startNextMission();
        });
        
        document.getElementById('btn-replay').addEventListener('click', () => {
            this.hideModal('complete');
            if (window.gameScene) {
                window.gameScene.restartMission();
            }
        });
        
        document.getElementById('btn-to-menu').addEventListener('click', () => {
            this.hideModal('complete');
            this.encerrarJogo();
            this.voltarDaMissao(true);
        });
        
        // Identify modal
        document.getElementById('btn-cancel-identify').addEventListener('click', () => {
            this.hideModal('identify');   // depois de acertar, o botão vira "OK" e chama fecharIdentificacao() via cancelIdentify()
            if (window.gameScene) {
                window.gameScene.cancelIdentify();
            }
        });
        
        // Story continue button is handled separately after game initialization
        // (See bottom of file)
        
        // Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            if (window.gameScene) {
                window.gameScene.pauseGame();
            }
        });
        
        // Geiger button
        document.getElementById('btn-geiger').addEventListener('click', () => {
            if (window.gameScene) {
                window.gameScene.toggleGeiger();
            }
        });
        
        // Dica de localização das fontes
        document.getElementById('btn-dica').addEventListener('click', () => { if (window.gameScene) window.gameScene.pedirDica(); });
        
        // Identify button
        document.getElementById('btn-identify').addEventListener('click', () => {
            if (window.gameScene) {
                window.gameScene.handleIdentify();
            }
        });
        
        // Shield buttons
        document.querySelectorAll('.shield-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const shieldId = parseInt(btn.dataset.shield);
                this.setActiveShield(shieldId);
                if (window.gameScene) {
                    window.gameScene.setShield(shieldId);
                }
            });
        });
        
        // Settings inputs
        document.getElementById('sound-volume').addEventListener('input', (e) => {
            GameState.settings.soundVolume = parseInt(e.target.value);
            audioManager.setVolume(GameState.settings.soundVolume);
            salvar();
        });
        document.getElementById('music-volume').addEventListener('input', (e) => {
            GameState.settings.musicVolume = parseInt(e.target.value);
            audioManager.setMusicVolume(GameState.settings.musicVolume);
            salvar();
        });
        document.getElementById('music-on')?.addEventListener('change', (e) => {
            GameState.settings.musicOn = e.target.checked;
            audioManager.setMusicaLigada(e.target.checked);
            salvar();
        });
        document.getElementById('sound-on')?.addEventListener('change', (e) => {
            GameState.settings.soundOn = e.target.checked;
            audioManager.setEfeitosLigados(e.target.checked);
            salvar();
            if (e.target.checked) audioManager.playSuccess();   // confirma que o som voltou
        });
        document.getElementById('show-hints').addEventListener('change', (e) => {
            GameState.settings.showHints = e.target.checked;
            salvar();
        });
        // Apagar o caderno (computadores de sala de aula): dois cliques, o segundo confirma
        const btnApagar = document.getElementById('btn-apagar-caderno');
        const avisoApagar = document.getElementById('apagar-caderno-aviso');
        let armado = null;
        const desarmar = () => { armado = null; btnApagar.textContent = t('notebookReset'); };
        btnApagar.addEventListener('click', () => {
            if (!armado) {
                btnApagar.textContent = t('notebookResetConfirm');
                avisoApagar.textContent = '';
                armado = setTimeout(desarmar, 5000);
                return;
            }
            clearTimeout(armado); desarmar();
            GameState.aprendizado = aprendizadoVazio();
            salvar();
            avisoApagar.textContent = t('notebookResetDone');
        });
        document.getElementById('encontros-toggle').addEventListener('change', (e) => {
            GameState.settings.encontros = e.target.checked;
            salvar();
        });
        document.getElementById('revisao-toggle').addEventListener('change', (e) => {
            GameState.settings.revisao = e.target.checked;
            salvar();
            this.desenharInvestigacoes();
        });
        document.getElementById('screen-shake').addEventListener('change', (e) => {
            GameState.settings.screenShake = e.target.checked;
            salvar();
        });
    }
    
    atualizarContinuar() {
        const b = document.getElementById('btn-continue');
        if (b) b.hidden = !(this.slots ? this.slots.algumaCriada() : temProgresso());
    }
    
    /** Destrói o jogo Phaser (via evento, para ui.js não importar main.js) */
    encerrarJogo() {
        this.screens.gameScreen.inert=false;
        this.screens.investigacao.classList.remove('active');
        document.dispatchEvent(new CustomEvent('rh:encerrar'));
        this.atualizarCaneta(null); this.atualizarEquipeHud(true);
        GameState.modalAberto = false;
        GameState.paused = false;
        GameState.virtual = {}; GameState.virtualVec = null;
        audioManager.stopMusic();
    }
    
    /** Esc conforme o contexto */
    aoPressionarEsc() {
        if(this.investigacao.emCampo&&this.screens.investigacao.classList.contains('active')){this.investigacao.fecharCampo();return;}
        // Painéis informativos fecham primeiro
        if (this.modals.encontro.classList.contains('active') || this.modals.cofre.classList.contains('active') || this.licao.ativo) return;   // encontro e cofre tratam o próprio Esc
        if (this.slotsUI.aberta) { this.slotsUI.fechar(); return; }
        for (const id of ['caderno', 'howto', 'settings']) {
            if (this.modals[id].classList.contains('active')) { this.hideModal(id); return; }
        }
        if (!this.screens.gameScreen.classList.contains('active') || !window.gameScene) return;
        const cena = window.gameScene;
        if (cena.fim || this.modals.complete.classList.contains('active')) return;
        if (this.modals.identify.classList.contains('active')) {
            if (cena.concluindo) return;          // aguardando o fim da missão
            this.hideModal('identify');
            cena.cancelIdentify();
            return;
        }
        if (this.modals.pause.classList.contains('active')) {
            this.hideModal('pause');
            cena.resumeGame();
            return;
        }
        cena.pauseGame();
    }
    
    /**
     * Controles de toque: joystick analógico flutuante (GameState.virtualVec = {x, y}, módulo 0 a 1)
     * e botão de correr (GameState.virtual.run). handleMovement lê os dois.
     */
    configurarToque() {
        GameState.virtual = {};
        GameState.virtualVec = null;
        const base = document.getElementById('joy-base'), knob = document.getElementById('joy-knob');
        const zona = document.getElementById('joy-zone');
        const RAIO = 52, MORTA = 0.18;
        let idToque = null, ox = 0, oy = 0;
        const soltarJoy = () => {
            idToque = null; GameState.virtualVec = null;
            if (base) base.hidden = true;
        };
        const soltarTudo = () => {
            GameState.virtual = {};
            soltarJoy();
            document.querySelectorAll('.touch-controls button.pressed').forEach(b => b.classList.remove('pressed'));
        };
        if (zona && base && knob) {
            const mover = (e) => {
                let dx = e.clientX - ox, dy = e.clientY - oy;
                const len = Math.hypot(dx, dy);
                if (len > RAIO) { dx = dx / len * RAIO; dy = dy / len * RAIO; }
                knob.style.transform = `translate(${dx}px, ${dy}px)`;
                const m = Math.min(len, RAIO) / RAIO;
                if (m < MORTA) { GameState.virtualVec = null; return; }
                // 40% a 100% da velocidade conforme a distância ao centro
                const f = 0.4 + 0.6 * (m - MORTA) / (1 - MORTA);
                GameState.virtualVec = { x: dx / Math.min(len, RAIO) * f, y: dy / Math.min(len, RAIO) * f };
            };
            zona.addEventListener('pointerdown', (e) => {
                if (idToque !== null) return;
                e.preventDefault();
                idToque = e.pointerId; ox = e.clientX; oy = e.clientY;
                try { zona.setPointerCapture(e.pointerId); } catch (_) {}
                const r = zona.getBoundingClientRect();
                base.style.left = (ox - r.left) + 'px'; base.style.top = (oy - r.top) + 'px';
                knob.style.transform = 'translate(0px, 0px)';
                base.hidden = false;
            });
            zona.addEventListener('pointermove', (e) => { if (e.pointerId === idToque) { e.preventDefault(); mover(e); } });
            ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev =>
                zona.addEventListener(ev, (e) => { if (e.pointerId === idToque) soltarJoy(); }));
            zona.addEventListener('contextmenu', (e) => e.preventDefault());
        }
        document.querySelectorAll('.touch-controls [data-key]').forEach(btn => {
            const k = btn.dataset.key;
            const apertar = (e) => { e.preventDefault(); GameState.virtual[k] = true; btn.classList.add('pressed'); };
            const soltar = () => { GameState.virtual[k] = false; btn.classList.remove('pressed'); };
            btn.addEventListener('pointerdown', apertar);
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => btn.addEventListener(ev, soltar));
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });
        window.addEventListener('blur', soltarTudo);
    }
    
    updateTimer(segundos, metaS) {
        const el = document.getElementById('hud-timer');
        if (!el) return;
        el.textContent = formatTime(segundos) + ' / ' + formatTime(metaS);
        el.classList.toggle('over', segundos > metaS);
    }
    
    /** Marca no modal de identificação o isótopo já tentado e errado */
    marcarTentativa(nome) {
        document.querySelectorAll('#isotope-buttons .isotope-btn').forEach(b => {
            if (b.dataset.name === nome) { b.classList.add('tentado'); b.disabled = true; }
        });
    }
    
    /** Devolve os botões de escolha depois de um erro (a fonte continua selecionada) */
    liberarEscolhas() {
        if (!this.modals.identify.classList.contains('active')) return;
        const c = document.getElementById('isotope-buttons');
        if (c) { c.style.opacity = '1'; c.style.pointerEvents = 'auto'; }
        const f = document.getElementById('identify-feedback');
        if (f) { f.style.display = 'none'; f.className = 'identify-feedback'; }
    }
    
    showScreen(screenId) {
        if (screenId !== 'agencia' && this.agencia) this.agencia.pararTudo();
        if (screenId === 'mainMenu') this.atualizarContinuar();
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenId]) {
            this.screens[screenId].classList.add('active');
        }
    }
    
    hideScreen(screenId) {
        if (this.screens[screenId]) {
            this.screens[screenId].classList.remove('active');
        }
    }
    
    showModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.add('active');
            if (modalId === 'identify') GameState.modalAberto = true;
        }
    }
    
    hideModal(modalId) {
        if (this.modals[modalId]) {
            this.modals[modalId].classList.remove('active');
            
            // Reset identify modal state when closing
            if (modalId === 'identify') {
                GameState.modalAberto = false;
                const buttonsContainer = document.getElementById('isotope-buttons');
                if (buttonsContainer) {
                    buttonsContainer.style.opacity = '1';
                    buttonsContainer.style.pointerEvents = 'auto';
                }
            }
        }
    }
    
    hideAllModals() {
        if (this.encontro) this.encontro.cancelar();
        if (this.cofre) this.cofre.cancelar();
        Object.values(this.modals).forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    /** Inventário: `itens` = [{ id, cor }]; `capacidade` slots (vazios aparecem tracejados). Oculto quando capacidade = 0. */
    /** Academia: os botões do Geiger e de identificação só aparecem depois que o jogador pega o Geiger */
    mostrarBotoesGeiger(sim) {
        for (const id of ['btn-geiger', 'btn-identify', 'btn-dica']) { const b = document.getElementById(id); if (b) b.hidden = !sim; }
    }

    atualizarInventario(itens = [], capacidade = 0) {
        const el = document.getElementById('inventory');
        if (!el) return;
        el.hidden = capacidade <= 0;
        el.innerHTML = '';
        const cores = { azul: '#4aa3ff', vermelha: '#ff5a5a' };
        const chave = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 14a5 5 0 1 1 4.6-3H21v3h-2v2h-3v-2h-4.4A5 5 0 0 1 7 14Zm0-7.5A2.5 2.5 0 1 0 7 11.5 2.5 2.5 0 0 0 7 6.5Z"/></svg>';
        for (let i = 0; i < capacidade; i++) {
            const it = itens[i];
            const slot = document.createElement('div');
            slot.className = 'inventory-slot' + (it ? ' cheio' : '');
            slot.setAttribute('role', 'listitem');
            if (it && it.id === 'geiger') {
                slot.style.color = '#ffd400';
                slot.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1 3v5h8V6H8Zm4 8a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"/></svg>';
                slot.title = txtAcad(currentLang, 'itemGeiger');
            } else if (it) {
                slot.style.color = cores[it.cor] || '#ffd54f';
                slot.innerHTML = chave;
                slot.title = t('chavePegou').replace('{cor}', t(it.cor === 'azul' ? 'corAzul' : 'corVermelha'));
            }
            el.appendChild(slot);
        }
    }

    updateMissionsDisplay() {
        const container = document.getElementById('missions-container');
        container.innerHTML = '';
        
        MISSIONS.forEach(mission => {
            const isUnlocked = GameState.unlockedMissions.includes(mission.id);
            const bestStars = this.getMissionStars(mission.id);
            
            const card = document.createElement('div');
            card.className = `mission-card ${isUnlocked ? '' : 'locked'}`;
            card.innerHTML = `
                <div class="mission-number">${t('mission')} ${mission.id}</div>
                <div class="mission-title">${t(mission.titleKey)}</div>
                <div class="mission-desc">${t(mission.descKey)}</div>
                <div class="mission-meta">
                    <span class="mission-difficulty ${mission.difficulty}">${mission.difficulty.toUpperCase()}</span>
                    <span class="mission-stars">${isUnlocked ? this.getStarsDisplay(bestStars) : ''}</span>
                </div>
                ${!isUnlocked ? '<div class="mission-lock">🔒</div>' : ''}
            `;
            
            if (isUnlocked) {
                card.addEventListener('click', () => {
                    this.startMission(mission);
                });
            }
            // A Academia (missão 1) pode ser pulada: libera a missão 2 sem jogar
            if (mission.id === 1 && !GameState.unlockedMissions.includes(2)) {
                const pular = document.createElement('button');
                pular.type = 'button';
                pular.className = 'skip-academy';
                pular.id = 'btn-skip-academy';
                pular.textContent = t('pularAcademia');
                pular.addEventListener('click', (e) => { e.stopPropagation(); pularAcademia(); this.updateMissionsDisplay(); });
                card.appendChild(pular);
            }
            
            container.appendChild(card);
        });
        this.desenharInvestigacoes();
    }

    /** Seleciona a aba da tela de seleção: 'missoes' (padrão) ou 'investigacoes'. Só alterna a exibição. */
    mostrarAba(aba) {
        const inv = aba === 'investigacoes';
        const tela = document.getElementById('mission-select');
        tela.classList.toggle('aba-investigacoes', inv);
        tela.classList.toggle('aba-missoes', !inv);
        document.querySelectorAll('.mission-tab').forEach((b) => {
            const ativa = b.dataset.aba === (inv ? 'investigacoes' : 'missoes');
            b.classList.toggle('active', ativa);
            b.setAttribute('aria-selected', String(ativa));
        });
    }

    /** Cartões das investigações (protótipos): sempre liberados, em área própria abaixo das missões. */
    desenharInvestigacoes() {
        const cont = document.getElementById('investigacoes-container');
        if (!cont) return;
        cont.replaceChildren();
        const lang = currentLang === 'pt' ? 'pt' : 'en';
        INVESTIGACOES.forEach((inv, k) => {
            const L = inv[lang];
            const card = document.createElement('div');
            card.className = 'mission-card investigacao-card';
            card.dataset.investigacao = inv.id;
            card.setAttribute('role', 'button');
            card.tabIndex = 0;
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
            });
            card.innerHTML = `
                <div class="mission-number">${TX_INV[lang].diretorio} ${k + 1}${GameState.settings.revisao ? ' · ' + TX_INV[lang].modoRevisao : ''}</div>
                <div class="mission-title"></div>
                <div class="mission-desc"></div>`;
            card.querySelector('.mission-title').textContent = L.titulo;
            card.querySelector('.mission-desc').textContent = L.descricao;
            card.addEventListener('click', () => this.abrirInvestigacao(inv.id, false, true));
            cont.appendChild(card);
        });
        this.desenharPesquisa(cont, lang);
    }

    /** Laboratório de pesquisa: sorteia um problema (ou deixa escolher) e abre-o no mapa do laboratório de cronologia. */
    desenharPesquisa(cont, lang) {
        const T = lang === 'pt'
            ? { num: 'Laboratório de pesquisa', titulo: 'Problemas sorteados', desc: 'Cada problema usa só as salas de que precisa e o Caderno lista as etapas. Os dados são fictícios e mudam a cada sorteio; a equação, as constantes e os testes são os reais.', sortear: 'Sortear um problema', ou: 'ou escolha:' }
            : { num: 'Research laboratory', titulo: 'Drawn problems', desc: 'Each problem uses only the rooms it needs and the Notebook lists the steps. Data are fictional and change with every draw; the equation, constants and tests are the real ones.', sortear: 'Draw a problem', ou: 'or choose:' };
        const card = document.createElement('div');
        card.className = 'mission-card pesquisa-card';
        card.innerHTML = `<div class="mission-number"></div><div class="mission-title"></div><div class="mission-desc"></div><div class="pesquisa-botoes"></div>`;
        card.querySelector('.mission-number').textContent = T.num;
        card.querySelector('.mission-title').textContent = T.titulo;
        card.querySelector('.mission-desc').textContent = T.desc;
        const caixa = card.querySelector('.pesquisa-botoes');
        const botao = (texto, id, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'inv-botao ' + cls; b.id = id; b.textContent = texto; b.addEventListener('click', fn); return b; };
        caixa.append(botao(T.sortear, 'pesquisa-sortear', 'primario', () => { const inv = sortearProblema(); this.abrirInvestigacao(inv.id, false, true); }));
        const ou = document.createElement('p'); ou.className = 'mission-desc'; ou.textContent = T.ou; caixa.append(ou);
        for (const p of PROBLEMAS) {
            const rotulo = p[lang].titulo.replace(/^Problema: |^Problem: /, ''), b = botao(rotulo.charAt(0).toUpperCase() + rotulo.slice(1), 'pesquisa-' + p.id.replace('pesquisa-', ''), '', () => { prepararProblema(p.id); this.abrirInvestigacao(p.id, false, true); });
            b.className += ' pesquisa-problema'; b.dataset.problema = p.id; b.title = p[lang].descricao; caixa.append(b);
        }
        cont.appendChild(card);
    }

    abrirInvestigacao(id, leitura = false, relato = false) {
        const inv = investigacaoPorId(id);
        if (!inv) return;
        this.encerrarJogo();
        this.investigacao.abrir(inv, currentLang, () => { this.screens.investigacao.classList.remove('active','inv-em-campo'); this.encerrarJogo(); if (this.origem === 'agencia') { this.voltarAgencia(true); return; } this.updateMissionsDisplay(); this.mostrarAba('investigacoes'); this.showScreen('missionSelect'); }, { revisao: GameState.settings.revisao === true, emCampo: !leitura, base: this.origem === 'agencia' });
        if(leitura)this.showScreen('investigacao');else document.dispatchEvent(new CustomEvent('rh:investigacao',{detail:{id:inv.id,relato}}));
    }
    
    getMissionStars(missionId) {
        return (GameState.bestStars && GameState.bestStars[missionId]) || 0;
    }
    
    getStarsDisplay(count) {
        count = Math.max(0, Math.min(3, count | 0));
        return '⭐'.repeat(count) + '☆'.repeat(3 - count);
    }
    
    startMission(mission) {
        GameState.currentMission = mission;
        
        this.mostrarHistoria(mission.storyText || t(mission.storyKey), mission.rapida ? jornalRapida(mission) : mission.tutorial ? 'tutorial' : (temJornal(mission.id) ? mission.id : null));
        this.showScreen('storyIntro');
    }

    /** História da missão em partes (telas pequenas): Voltar / Próximo; na última parte o botão vira "Continuar". */
    mostrarHistoria(texto, jornalId = null) {
        // v3.20: missões 2 a 8 abrem com a primeira página de um jornal (uma página só); o texto longo fica em "Saiba mais"
        this.historia = jornalId ? { paginas: [texto], i: 0, jornalId } : { paginas: paginarTexto(texto, limitePorTela(window.innerWidth, window.innerHeight)), i: 0 };
        this.renderHistoria();
    }

    renderHistoria() {
        const h = this.historia;
        const n = h.paginas.length;
        const ultima = h.i >= n - 1;
        const L = TXT_PAG[currentLang] || TXT_PAG.en;
        const box = document.getElementById('story-text');
        box.scrollTop = 0;
        clearInterval(this._tTexto); box.onclick = null;
        if (h.jornalId) { box.innerHTML = htmlJornal(h.jornalId, currentLang, typeof h.jornalId === 'object' ? '' : h.paginas[0]); box.classList.add('com-jornal'); }
        else { box.classList.remove('com-jornal'); this.typeText(box, h.paginas[h.i]); }
        document.getElementById('story-continue').textContent = ultima ? t('continueStory') : L.prox;
        const voltar = document.getElementById('story-voltar');
        voltar.textContent = L.voltar;
        voltar.hidden = h.i === 0;
        document.getElementById('story-pagina').textContent = n > 1 ? rotuloParte(currentLang, h.i + 1, n) : '';
    }

    /** @returns {boolean} true se mostrou outra parte (ainda não é hora de começar a missão) */
    avancarHistoria(delta = 1) {
        const h = this.historia;
        if (!h) return false;
        const j = h.i + delta;
        if (j < 0) return true;
        if (j >= h.paginas.length) return false;
        h.i = j;
        this.renderHistoria();
        return true;
    }
    
    /** Fim ou saída de uma missão: volta à Base se veio dela; senão, ao menu principal (como antes). */
    voltarDaMissao(concluida = false) {
        if (this.origem === 'agencia') this.voltarAgencia(concluida); else this.showScreen('mainMenu');
    }

    /** Volta ao mapa-múndi e informa o resultado: missão concluída (estrelas da última conclusão) ou investigação com ficha concluída. */
    voltarAgencia(concluida = false) {
        this.encerrarJogo();
        const a = this.agencia.alvo; let r = { concluida: false, estrelas: 0 };
        if (a && a.tipo === 'rapida' && a.falso) r = { concluida: !!(this.investigacao.ficha && this.investigacao.ficha.concluida), estrelas: 2 };   // v3.21: falso alarme é investigação curta; 2 estrelas pelo balanço
        else if (a && (a.tipo === 'missao' || a.tipo === 'treino' || a.tipo === 'rapida')) { const u = GameState.ultimaConclusao; r = { concluida: concluida && !!u && u.id === a.missaoId, estrelas: u ? u.estrelas : 0 }; }
        else if (a && a.tipo === 'investigacao') r = { concluida: !!(this.investigacao.ficha && this.investigacao.ficha.concluida), estrelas: 0 };
        r.dose = GameState.doseMissao || 0; r.fontes = GameState.fontesColeta || 0;
        GameState.doseMissao = 0; GameState.fontesColeta = 0; this.atualizarCaneta(null);
        this.agencia.retornar(r);
        this.showScreen('agencia');
        this.agencia.focar();
    }

    startNextMission() {
        this.encerrarJogo();
        if (this.origem === 'agencia') { this.voltarAgencia(true); return; }
        const currentId = GameState.currentMission.id;
        const nextMission = MISSIONS.find(m => m.id === currentId + 1);
        
        if (nextMission && GameState.unlockedMissions.includes(nextMission.id)) {
            this.startMission(nextMission);
        } else {
            this.showScreen('missionSelect');
            this.updateMissionsDisplay();
        }
    }
    
    /** Texto digitado; clicar no texto (ou em Continuar) mostra tudo na hora */
    typeText(element, text, speed = 12) {
        clearInterval(this._tTexto);
        let index = 0;
        element.innerHTML = '<span class="typing"></span>';
        const typing = element.querySelector('.typing');
        const terminar = () => {
            clearInterval(this._tTexto);
            typing.textContent = text;
            typing.classList.remove('typing');
            element.onclick = null;
        };
        element.onclick = terminar;
        this._tTexto = setInterval(() => {
            if (index < text.length) {
                // alguns caracteres por passo mantêm o ritmo em textos longos
                const n = Math.min(3, text.length - index);
                typing.textContent += text.slice(index, index + n);
                index += n;
            } else {
                terminar();
            }
        }, speed);
    }
    
    setActiveShield(shieldId) {
        document.querySelectorAll('.shield-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.shield) === shieldId) {
                btn.classList.add('active');
            }
        });
        GameState.currentShield = shieldId;
    }
    
    /** Painel de equipe do HUD (v3.16): um botão por cientista da saída, com a tecla 7, 8, 9 ou 0. `esconder` limpa. */
    atualizarEquipeHud(esconder = false) {
        const el = document.getElementById('hud-equipe'); if (!el) return;
        const lista = esconder || this.origem !== 'agencia' ? [] : this.agencia.equipeDoHud();
        if (lista.length < 2) { el.hidden = true; el.innerHTML = ''; return; }   // com um só cientista não há o que escolher
        el.hidden = false;
        el.innerHTML = lista.map((c, k) => `<button type="button" class="hud-cient ag-borda-${c.cor}${c.ativo ? ' ativo' : ''}" data-i="${k}" aria-pressed="${c.ativo}" aria-label="${c.nome} (${c.tecla})" title="${c.nome}"><span class="hud-cient-tecla">${c.tecla}</span><span class="inv-retrato" aria-hidden="true">${retratoSvg(c.retrato, c.ativo ? 'neutro' : 'sorriso')}</span></button>`).join('');
        el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { if (window.gameScene) window.gameScene.trocarCientista(Number(b.dataset.i)); b.blur(); }));
    }

    /** Caneta dosimétrica do líder: info = { msv, r, cor } ou null (esconde). */
    atualizarCaneta(info) {
        const el = document.getElementById('pen-dose'); if (!el) return;
        if (!info) { el.hidden = true; return; }
        el.hidden = false; el.classList.remove('verde', 'amarelo', 'vermelho'); el.classList.add(info.cor);
        const pt = currentLang === 'pt', nome = { verde: pt ? 'verde' : 'green', amarelo: pt ? 'amarela' : 'yellow', vermelho: pt ? 'vermelha' : 'red' }[info.cor];
        const n = (x) => (Math.round(x * 100) / 100).toLocaleString(pt ? 'pt-BR' : 'en-US');
        document.getElementById('pen-rot').textContent = `${pt ? 'Caneta' : 'Pen'}: ${n(info.msv)} mSv · ${Math.round(info.r * 100)} % ${pt ? 'do limite' : 'of limit'} (${nome})`;
        document.getElementById('pen-cheia').style.width = Math.min(100, Math.round(info.r * 100)) + '%';
    }

    updateGeigerDisplay(reading, isActive, uncertainty = 0) {
        const display = document.getElementById('geiger-display');
        const value = document.getElementById('geiger-reading');
        const bar = document.getElementById('geiger-bar-fill');
        const unc = document.getElementById('geiger-uncertainty');
        
        if (!isActive) {
            value.textContent = '---';
            bar.style.width = '0%';
            if (unc) unc.textContent = '';
            display.classList.remove('active', 'danger');
            return;
        }
        
        value.textContent = reading;
        if (unc) unc.textContent = uncertainty > 0 ? '± ' + (uncertainty < 10 ? uncertainty.toFixed(1) : Math.round(uncertainty)) : '';
        
        // Escala logarítmica: as taxas vão de ~5 cps (fundo) a milhares perto de uma fonte forte
        const percentage = Math.min(100, (Math.log10(1 + Math.max(0, reading)) / Math.log10(1 + 3000)) * 100);
        bar.style.width = `${percentage}%`;
        
        display.classList.add('active');
        
        if (reading > 300) {
            display.classList.add('danger');
            value.style.color = 'var(--geiger-red)';
        } else if (reading > 100) {
            display.classList.remove('danger');
            value.style.color = 'var(--geiger-yellow)';
        } else {
            display.classList.remove('danger');
            value.style.color = 'var(--geiger-green)';
        }
    }
    
    updateScore(score) {
        document.getElementById('score-value').textContent = score;
    }
    
    updateCombo(combo) {
        const display = document.getElementById('combo-display');
        const value = document.getElementById('combo-value');
        
        if (combo > 1) {
            display.classList.add('active');
            value.textContent = `x${combo}`;
        } else {
            display.classList.remove('active');
        }
    }
    
    updateStamina(stamina) {
        const fill = document.getElementById('stamina-fill');
        fill.style.width = `${stamina}%`;
    }
    
    updateSourcesTracker(sources, found) {
        const tracker = document.getElementById('sources-tracker');
        tracker.innerHTML = '';
        
        sources.forEach((source, index) => {
            const isFound = found.includes(source);
            const slot = document.createElement('div');
            slot.className = `source-slot ${isFound ? 'found' : ''}`;
            slot.innerHTML = `
                <span class="source-icon">${isFound ? '☢' : '?'}</span>
                <span class="source-name">${isFound ? source.name : '???'}</span>
            `;
            tracker.appendChild(slot);
        });
    }
    
    showIdentifyModal(possibleIsotopes, callback, evidencia = null) {
        const container = document.getElementById('isotope-buttons');
        container.innerHTML = '';
        container.style.opacity = '1';
        container.style.pointerEvents = 'auto';
        
        possibleIsotopes.forEach(iso => {
            const btn = document.createElement('button');
            btn.className = 'isotope-btn';
            btn.innerHTML = `
                <span class="isotope-name">${iso.name}</span>
                <span class="isotope-type ${iso.type}">${iso.rotulo || (iso.symbol + " " + iso.type)}</span>
            `;
            btn.dataset.name = iso.name;
            btn.addEventListener('click', () => callback(iso));
            container.appendChild(btn);
        });
        
        // Evidência reunida (leitura sem placa e com placa) e saída honesta "ainda não dá para concluir"
        const ev = document.getElementById('identify-evidencia');
        const mais = document.getElementById('btn-mais-dados');
        if (ev) {
            ev.hidden = !evidencia;
            if (evidencia) {
                const marca = (ok) => (ok ? '✓' : '○');
                ev.textContent = `${marca(evidencia.semPlaca)} ${t('evidNoShield')}   ${marca(evidencia.placas > 0)} ${t('evidWithShield')}`;
            }
        }
        if (mais) {
            mais.hidden = !(evidencia && evidencia.aoPedirDados);
            mais.onclick = evidencia && evidencia.aoPedirDados ? () => evidencia.aoPedirDados() : null;
        }
        
        // Reset feedback state
        const bc = document.getElementById('btn-cancel-identify');
        if (bc) { bc.textContent = t('cancel'); bc.classList.remove('ok-btn'); }
        const feedback = document.getElementById('identify-feedback');
        feedback.textContent = '';
        feedback.className = 'identify-feedback';
        feedback.style.display = 'none';
        
        this.showModal('identify');
    }
    
    showIdentifyFeedback(success, message) {
        const feedback = document.getElementById('identify-feedback');
        if (!feedback) {
            console.error('Feedback element not found!');
            return;
        }
        
        // Depois de acertar, "Cancelar" não faz mais sentido: o botão vira "OK"
        const bc = document.getElementById('btn-cancel-identify');
        if (bc && success) { bc.textContent = t('ok'); bc.classList.add('ok-btn'); }
        
        // Hide isotope buttons when showing result
        const buttonsContainer = document.getElementById('isotope-buttons');
        if (buttonsContainer) {
            buttonsContainer.style.opacity = '0.5';
            buttonsContainer.style.pointerEvents = 'none';
        }
        
        // Show feedback with animation
        feedback.innerHTML = message.replace(/\n/g, '<br>');
        feedback.className = `identify-feedback ${success ? 'success' : 'error'} visible`;
        feedback.style.display = 'block';
        feedback.style.opacity = '1';
        feedback.style.visibility = 'visible';
    }
    
    showCompleteModal(stats) {
        document.getElementById('complete-time').textContent = formatTime(stats.time);
        document.getElementById('complete-accuracy').textContent = `${stats.accuracy}%`;
        document.getElementById('complete-score').textContent = stats.score;
        document.getElementById('complete-stars').textContent = this.getStarsDisplay(stats.stars);
        document.getElementById('complete-message').textContent = stats.message;
        // balanço final (v3.17): fontes coletadas; pela Agência só existe "Voltar à Base" (a nave faz o voo de volta)
        const fr = document.getElementById('complete-fontes-row');
        if (stats.fontes && stats.fontes.total > 0) { fr.hidden = false; document.getElementById('complete-fontes').textContent = `${stats.fontes.n}/${stats.fontes.total}`; } else fr.hidden = true;
        const naAgencia = this.origem === 'agencia', prox = document.getElementById('btn-next-mission');
        document.getElementById('btn-replay').hidden = naAgencia; document.getElementById('btn-to-menu').hidden = naAgencia;
        prox.textContent = naAgencia ? t('backToBase') : t('nextMission');
        const a = stats.aproveitamento;
        if (a) {
            document.getElementById('complete-aproveitamento').textContent = `${Math.round(a.total)}%`;
            const f = (x) => Math.round(x * 10) / 10;
            document.getElementById('complete-aprov-detalhe').textContent =
                t('usageDetail').replace('{0}', f(a.fontes)).replace('{1}', f(a.tempo)).replace('{2}', f(a.encontros)).replace('{3}', f(a.cofre)) +
                (a.semTempo ? ' · ' + t('usageStudy') : '') +
                (a.descontoDicas ? ' · ' + t('usageDica').replace('{0}', a.dicas).replace('{1}', a.descontoDicas) : '') +
                (a.maximo < 100 ? ' · ' + t('usageMax').replace('{0}', a.maximo) : '');
        }
        
        // v3.23: "edição extra" do jornal relatando a missão (mantém todos os ids; o placar vira o quadro de números da edição)
        const cc = document.querySelector('#complete-modal .complete-content'), antes = document.getElementById('complete-jornal');
        if (antes) antes.remove();
        if (cc && stats.jornal) {
            const r = reportagemFim({ jornalId: stats.jornal.id, titulo: stats.jornal.titulo, stars: stats.stars, fontes: stats.fontes, tempo: stats.time, precisao: stats.accuracy, aproveitamento: stats.aproveitamento ? Math.round(stats.aproveitamento.total) : null, mensagem: stats.message }, currentLang);
            const d = document.createElement('div'); d.id = 'complete-jornal'; d.innerHTML = htmlFimJornal(r, currentLang);
            cc.insertBefore(d, cc.firstChild); cc.classList.add('com-jornal');
        } else if (cc) cc.classList.remove('com-jornal');
        this.showModal('complete');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('.notification-icon');
        const text = notification.querySelector('.notification-text');
        
        icon.textContent = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
        text.textContent = message;
        notification.className = `notification ${type} show`;
        
        clearTimeout(this._tNotif);
        this._tNotif = setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showAchievement(name) {
        const popup = document.getElementById('achievement-popup');
        document.getElementById('achievement-name').textContent = name;
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 4000);
    }
    
    updateMissionHUD(mission) {
        document.getElementById('hud-mission-name').textContent = mission.titulo || t(mission.titleKey);
        const botao=document.getElementById('btn-identify');
        if(!mission.investigacao){this.screens.gameScreen.classList.remove('hospital-investigacao','investigacao-campo');botao.querySelector('.action-label').textContent=t('identify');botao.title=t('identify')+' (Q)';}
        const objective = t('findSources').replace('{0}', mission.numSources);
        document.getElementById('hud-objective').textContent = objective;
        const nx = document.getElementById('hud-next'); if (nx) { nx.textContent = ''; nx.hidden = true; }
    }
    
    /** Academia: progresso e próximo objetivo (linha extra do HUD, visível só quando há texto) */
    setProximo(progresso, proximo) {
        const obj = document.getElementById('hud-objective'), nx = document.getElementById('hud-next');
        if (obj && progresso) obj.textContent = progresso;
        if (nx) { nx.textContent = proximo || ''; nx.hidden = !proximo; }
    }

    setGeigerButtonActive(active) {
        const btn = document.getElementById('btn-geiger');
        if (active) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    }
}

export const ui = new UIManager();
