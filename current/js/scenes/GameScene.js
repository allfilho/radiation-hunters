import { audioManager } from '../audio.js';
import { CONFIG } from '../data/config.js';
import { ISOTOPES } from '../data/isotopes.js';
import { MISSIONS } from '../data/missoes/index.js';
import { SHIELDS } from '../data/shields.js';
import { GameState } from '../estado.js';
import { componentesDe, descreverEmissoes, linhasGamaTexto, nomesDasComponentes } from '../fisica/componentes.js';
import { candidatosDaMissao, rotuloDoCandidato } from '../data/candidatos.js';
import { JanelaDeContagem, contar, distanciaAoRetangulo, pontoMaisProximo, taxaEsperada } from '../fisica/geiger.js';
import { DOSE, doseDe, taxaGamaCps } from '../fisica/dose.js';
import { foiLevantado } from '../agencia/frota.js';
import { currentLang, t } from '../i18n/index.js';
import { MapGenerator } from '../mapa/gerador.js';
import { FurnitureRenderer } from '../render/moveis.js';
import { LIMIARES_ACESSO, melhorTaxaLiquida, posicoesAlcancaveis } from '../fisica/acessibilidade.js';
import { pintarTerreno } from '../render/terreno.js';
import { ehMovelExterno } from '../render/mobiliario-externo.js';
import { ESCALA_SPRITE, chaveQuadro, direcaoDoAngulo, registrarTexturasDoPersonagem } from '../render/personagem.js';
import { registrarConclusao } from '../progresso.js';
import { ui } from '../ui.js';
import { Encontros } from '../encontros/gerenciador.js';
import { LICOES, txt as txtAcad } from '../academia/licoes.js';
import { BLOCOS as BLOCOS_TUTORIAL, objetivoTutorial } from '../tutorial/tutorial.js';
import { LicaoUI } from '../academia/ui-licao.js';
import { OBJ_TXT, mapaDeDistancias, pontoAdiante, proximoObjetivo } from '../academia/objetivo.js';
import { aproveitamento } from '../encontros/aproveitamento.js';
import { modoEstudo } from '../modo.js';
import { DICA_PEDIDA_S, nivelDicaAuto } from '../encontros/dica.js';
import { distance, randomRange, shuffleArray } from '../util.js';

// ============================================
// PHASER GAME SCENE
// ============================================
export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        window.gameScene = this;
        // missionData may be set by subclass before init
    }
    
    init(data) {
        // Use mission data from constructor if available, otherwise from init data
        if (data && data.mission) {
            this.missionData = data.mission;
        }
        // Ensure we have mission data
        if (!this.missionData) {
            console.error('No mission data provided!');
            return;
        }
        
        this.mapData = null;
        this.player = null;
        this.furniture = [];
        this.blockedTiles = [];
        this.geigerActive = false;
        this.currentReading = 0;
        this.evidencia = { semPlaca: false, placas: new Set() };   // leituras com sinal da investigação em curso (zera a cada fonte achada)
        this.pedidosDeDados = 0;                                   // vezes em que o jogador disse "ainda não dá para concluir"
        this.lastRate = 0;
        this.lastCount = 0;
        this.currentUncertainty = 0;
        this.janelaGeiger = new JanelaDeContagem(CONFIG.GEIGER_JANELA_S);
        this.lastMeasure = 0;
        this.running = false;
        this.playerDirection = 0;
        this.sources = [];
        this.foundSources = [];
        this.selectedFurniture = null;
        this.gameStarted = false;
        this.minimapCtx = null;
        // Estado de fluxo: pausa é só um sinalizador (scene.pause/resume são assíncronos)
        this.assistenciaAlfa = false;
        // Dica de localização das fontes (js/encontros/dica.js): sinal de progresso, nível mostrado, usos cobrados
        this.dica = { sinal: null, desdeMs: 0, nivel: 0, cobrado: false, pedidaAteMs: 0, usos: 0, avisouMini: false, avisouMapa: false, aviso: null };
        this.elapsedMs = 0;          // tempo de jogo; não conta pausa nem tela de conclusão
        this.concluindo = false;     // última fonte identificada, aguardando o modal final
        this.fim = false;            // missão concluída: congela tudo
        this.emEncontro = false;     // encontro de aprendizado aberto: relógio parado
        this.licoesFeitas = [];      // Academia: índices das lições concluídas
        this.objT = -1e9; this.objChave = null; this.objAtual = null; this.mdObj = null;
        this.temGeiger = !(this.missionData && this.missionData.geigerComoItem);   // Academia: o Geiger é um item
        GameState.temGeiger = this.temGeiger;
        this.uiEncontro = ui.encontro;
        this.licaoUI = ui.licao;
        this.uiCofre = ui.cofre;
        this.encontros = new Encontros(this);
        this.ultimoSegundoHud = -1;
        GameState.paused = false;
        GameState.modalAberto = false;
    }
    
    preload() {
        // Create simple graphics for sprites
        this.createTextures();
    }
    
    createTextures() {
        // Player texture - character with geiger counter
        const playerGfx = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Body
        playerGfx.fillStyle(0x3498db);
        playerGfx.fillRect(8, 8, 16, 20);
        
        // Head
        playerGfx.fillStyle(0xffd93d);
        playerGfx.fillCircle(16, 6, 6);
        
        // Geiger counter in hand
        playerGfx.fillStyle(0x2c3e50);
        playerGfx.fillRect(24, 14, 6, 10);
        playerGfx.fillStyle(0x00ff00);
        playerGfx.fillRect(25, 15, 4, 3);
        
        playerGfx.generateTexture('player', 32, 32);
        
        // Radiation source glow
        const glowGfx = this.make.graphics({ x: 0, y: 0, add: false });
        glowGfx.fillStyle(0x00ff88, 0.3);
        glowGfx.fillCircle(32, 32, 32);
        glowGfx.fillStyle(0x00ff88, 0.5);
        glowGfx.fillCircle(32, 32, 20);
        glowGfx.fillStyle(0x00ff88, 0.8);
        glowGfx.fillCircle(32, 32, 10);
        glowGfx.generateTexture('glow', 64, 64);
    }
    
    create() {
        // Generate map with mission data
        // Tamanho do mapa em tiles: padrão do CONFIG; a missão pode pedir um mapa maior que a tela (a câmera segue o jogador)
        this.mapCols = this.missionData.mapCols || CONFIG.MAP_COLS;
        this.mapRows = this.missionData.mapRows || CONFIG.MAP_ROWS;
        const generator = new MapGenerator(
            this.mapCols, 
            this.mapRows, 
            this.missionData.mapTheme,
            this.missionData
        );
        this.mapData = generator.generate();
        this.ehParede = (x, y) => { const v = this.mapData.map[y]?.[x]; return v === 1 || v === 3; };   // 3 = porta trancada
        
        // Draw map
        this.drawMap();
        
        // Place sources in furniture
        this.placeSources();
        
        // Portas trancadas e chaves (Academia)
        this.criarPortasEChaves();
        this.criarLicoesEGeiger();
        
        // Create player
        this.createPlayer();
        
        // Setup input
        this.setupInput();
        
        // Setup minimap
        this.setupMinimap();
        
        // Initialize UI
        ui.updateMissionHUD(this.missionData);
        ui.updateSourcesTracker(this.sources, this.foundSources);
        ui.updateScore(0);
        ui.updateStamina(100);
        
        // Vision cone graphics
        this.visionGraphics = this.add.graphics().setDepth(5);

        // Furniture info HUD
        this.furnitureInfoText = this.add.text(
            20,
            82,
            '',
            { fontSize: '14px', color: '#c9f9d4', fontFamily: 'Orbitron' }
        );
        this.furnitureInfoText.setDepth(20);
        this.furnitureInfoText.setScrollFactor(0);
        // Câmera: segue o jogador, limitada às bordas do mapa; o zoom se adapta à tela (ajustarCamera)
        const cam = this.cameras.main;
        cam.setBounds(0, 0, this.mapCols * CONFIG.TILE_SIZE, this.mapRows * CONFIG.TILE_SIZE);
        cam.startFollow(this.player, true, 0.12, 0.12);
        this.ajustarCamera();
        cam.centerOn(this.player.x, this.player.y);
        this.scale.on('resize', this.ajustarCamera, this);
        this.events.once('shutdown', () => this.scale.off('resize', this.ajustarCamera, this));
        
        // Particle emitter for found sources
        this.setupParticles();
        
        // Audio
        audioManager.init();
        
        // Reset game state
        GameState.score = 0;
        GameState.combo = 1;
        GameState.attempts = 0;
        GameState.correct = 0;
        GameState.stamina = CONFIG.STAMINA_MAX;
        GameState.geigerActive = false;
        GameState.currentShield = 0;
        this.evidencia = { semPlaca: false, placas: new Set() };
        this.pedidosDeDados = 0;
        GameState.paused = false;
        GameState.modalAberto = false;
        GameState.virtual = {}; GameState.virtualVec = null;
        ui.setActiveShield(0);
        ui.setGeigerButtonActive(false);
        ui.updateGeigerDisplay(0, false);
        ui.updateCombo(1);
        ui.updateTimer(0, this.metaTempoS);
        audioManager.startMusic(this.missionData.trilha ?? this.missionData.id);   // trilha da missão (js/musica/); id 9–12 = investigações
        
        // Start game immediately
        this.gameStarted = true;
        GameState.startTime = this.time.now;
        this.encontros.iniciar();
    }
    
    /**
     * Zoom da câmera para a tela atual. Se o mapa inteiro cabe com tiles de pelo menos 32 px (zoom >= 1),
     * ele aparece inteiro e centralizado (zoom máximo 1,6). Senão vale o zoom "de conforto" (1,0 a 1,4:
     * cerca de 11 tiles no lado menor da tela) e a câmera segue o jogador.
     */
    ajustarCamera() {
        const cam = this.cameras.main;
        const T = CONFIG.TILE_SIZE, W = this.mapCols * T, H = this.mapRows * T;
        const dpr = this.registry.get('dpr') || 1;
        // Tamanho da tela em px CSS; o canvas tem dpr vezes mais pixels para ficar nítido em telas densas
        const vw = this.scale.width / dpr, vh = this.scale.height / dpr;
        if (!vw || !vh) return;
        const inteiro = Math.min(vw / W, vh / H);
        const conforto = Phaser.Math.Clamp(Math.min(vw, vh) / (11 * T), 1, 1.4);
        const Z = inteiro >= 1 ? Math.min(inteiro, 1.6) : conforto;
        cam.setSize(this.scale.width, this.scale.height);
        cam.setZoom(Z * dpr);
        this.zoomAtual = Z * dpr;
        // Mapa menor que a tela em algum eixo: folga simétrica nos limites, para a câmera centralizá-lo
        const folgaX = Math.max(0, (vw / Z - W) / 2), folgaY = Math.max(0, (vh / Z - H) / 2);
        cam.setBounds(-folgaX, -folgaY, W + 2 * folgaX, H + 2 * folgaY);
        this.posicionarInfoMovel();
    }
    
    /** O texto do móvel observado fica a (20, 82) px CSS da tela, no tamanho normal, apesar do zoom da câmera. */
    posicionarInfoMovel() {
        if (!this.furnitureInfoText) return;
        const Z = this.zoomAtual || 1, dpr = this.registry.get('dpr') || 1;
        const vw = this.scale.width, vh = this.scale.height;
        this.furnitureInfoText.setScale(dpr / Z);
        this.furnitureInfoText.setPosition((20 * dpr - vw / 2) / Z + vw / 2, (82 * dpr - vh / 2) / Z + vh / 2);
    }
    
    drawMap() {
        const { map, theme, furniture, themeName, specialZones, reactorPosition } = this.mapData;
        const tileSize = CONFIG.TILE_SIZE;
        
        // Background
        const larguraMapa = this.mapCols * tileSize, alturaMapa = this.mapRows * tileSize;
        this.add.rectangle(larguraMapa / 2, alturaMapa / 2, larguraMapa + 4000, alturaMapa + 4000, 0x0a0a0f).setDepth(-1);
        
        // Draw special zones first (contaminated areas, reactor zone, etc.)
        if (specialZones) {
            specialZones.forEach(zone => {
                const zx = zone.x * tileSize + (zone.width * tileSize) / 2;
                const zy = zone.y * tileSize + (zone.height * tileSize) / 2;
                
                let zoneColor = 0x333333;
                let alpha = 0.3;
                
                if (zone.type === 'reactor') {
                    zoneColor = 0xff3300;
                    alpha = 0.4;
                } else if (zone.type === 'danger' || zone.type === 'contaminated') {
                    zoneColor = 0xffff00;
                    alpha = 0.2;
                } else if (zone.type === 'camp') {
                    zoneColor = 0x8b4513;
                    alpha = 0.3;
                } else if (zone.type === 'rtg_site') {
                    zoneColor = 0xff00ff;
                    alpha = 0.25;
                } else if (zone.type === 'workstation') {
                    zoneColor = 0x4a4a2a;
                    alpha = 0.2;
                }
                
                const zoneRect = this.add.rectangle(
                    zx, zy,
                    zone.width * tileSize,
                    zone.height * tileSize,
                    zoneColor, alpha
                );
                zoneRect.setDepth(0);
            });
        }
        
        // Piso, paredes e acessórios: um único canvas pintado com semente fixa por missão
        // (mesma missão = mesmo aspecto; antes eram centenas de objetos com Math.random).
        const S = 2;
        const canvas = pintarTerreno({
            map, themeName, theme, specialZones, furniture, missao: this.missionData.id | 0, planta: this.missionData.investigacaoCampo?.planta || this.missionData.planta || null,
            semente: this.missionData.semente ?? (this.missionData.id | 0) * 7919 + 17
        }, tileSize, S);
        if (this.textures.exists('terreno')) this.textures.remove('terreno');
        this.textures.addCanvas('terreno', canvas);
        this.add.image(0, 0, 'terreno').setOrigin(0, 0).setScale(1 / S).setDepth(0);

        // Colisão: paredes (tile 1) bloqueiam
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                if (map[y][x] === 1 || map[y][x] === 3) this.blockedTiles.push({ x, y });
            }
        }

        // Draw reactor core for nuclear map (Chernobyl)
        if (reactorPosition && themeName === 'nuclear') {
            const rx = reactorPosition.x * tileSize + (reactorPosition.width * tileSize) / 2;
            const ry = reactorPosition.y * tileSize + (reactorPosition.height * tileSize) / 2;
            
            // Damaged reactor core
            const core = this.add.rectangle(
                rx, ry,
                reactorPosition.width * tileSize - 8,
                reactorPosition.height * tileSize - 8,
                0x1a1a1a
            );
            core.setStrokeStyle(4, 0xff3300, 0.8);
            core.setDepth(2);
            
            // Radiation warning symbol
            const warning = this.add.graphics();
            warning.fillStyle(0xffcc00);
            warning.fillCircle(rx, ry, 12);
            warning.fillStyle(0x000000);
            // Trefoil
            for (let i = 0; i < 3; i++) {
                const angle = (i * 120 - 90) * Math.PI / 180;
                warning.fillTriangle(
                    rx, ry,
                    rx + Math.cos(angle - 0.3) * 10, ry + Math.sin(angle - 0.3) * 10,
                    rx + Math.cos(angle + 0.3) * 10, ry + Math.sin(angle + 0.3) * 10
                );
            }
            warning.fillCircle(rx, ry, 4);
            warning.setDepth(3);
            
            // Glow effect
            const glow = this.add.circle(rx, ry, 40, 0xff3300, 0.1);
            glow.setDepth(1);
            
            // Animated pulse
            this.tweens.add({
                targets: glow,
                alpha: { from: 0.1, to: 0.3 },
                scale: { from: 1, to: 1.2 },
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Draw furniture with pixel art renderer
        const furnitureRenderer = new FurnitureRenderer(this);
        
        furniture.forEach(f => {
            const tileSize = CONFIG.TILE_SIZE;
            const px = (f.x + f.type.width / 2) * tileSize;
            const py = (f.y + f.type.height / 2) * tileSize;
            
            // Use pixel art renderer
            const result = furnitureRenderer.render(f, themeName);
            
            // Add special effects for glowing/radioactive items
            if (f.type.isCapsule) {
                // Cs-137 blue glow animation
                const capsuleGlow = this.add.circle(px, py, 15, 0x00ccff, 0.3);
                capsuleGlow.setDepth(1);
                this.tweens.add({
                    targets: capsuleGlow,
                    alpha: { from: 0.3, to: 0.1 },
                    scale: { from: 1, to: 1.3 },
                    duration: 1500,
                    yoyo: true,
                    repeat: -1
                });
            } else if (f.type.isRTG) {
                // RTG purple glow
                const rtgGlow = this.add.circle(px, py, 20, 0xff00ff, 0.2);
                rtgGlow.setDepth(1);
                this.tweens.add({
                    targets: rtgGlow,
                    alpha: { from: 0.2, to: 0.05 },
                    scale: { from: 1, to: 1.2 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
            } else if (f.type.isReactor) {
                // Reactor orange glow
                const reactorGlow = this.add.circle(px, py, 30, 0xff3300, 0.3);
                reactorGlow.setDepth(1);
                this.tweens.add({
                    targets: reactorGlow,
                    alpha: { from: 0.3, to: 0.1 },
                    scale: { from: 1, to: 1.15 },
                    duration: 1000,
                    yoyo: true,
                    repeat: -1
                });
            } else if (f.type.hasRadium) {
                // Ra-226 green glow
                const radiumGlow = this.add.circle(px, py, 12, 0x88ff88, 0.4);
                radiumGlow.setDepth(1);
                this.tweens.add({
                    targets: radiumGlow,
                    alpha: { from: 0.4, to: 0.15 },
                    scale: { from: 1, to: 1.2 },
                    duration: 2000,
                    yoyo: true,
                    repeat: -1
                });
            } else if (f.type.hasBrushes && themeName === 'factory') {
                // Subtle glow from contaminated brushes
                const brushGlow = this.add.ellipse(px, py - 5, f.type.width * tileSize * 0.5, 6, 0x88ff88, 0.12);
                brushGlow.setDepth(1);
            }
            
            // Store reference
            f.sprite = result.graphics;
            f.centerX = result.centerX;
            f.centerY = result.centerY;
            
            this.furniture.push(f);
            
            // Add to blocked tiles
            for (let dy = 0; dy < f.type.height; dy++) {
                for (let dx = 0; dx < f.type.width; dx++) {
                    this.blockedTiles.push({ x: f.x + dx, y: f.y + dy });
                }
            }
        });
    }
    
    /** Posições (tiles) que o jogador alcança andando a partir do início, com a colisão real. */
    posicoesDoJogador() {
        const T = CONFIG.TILE_SIZE;
        // portas trancadas contam como abertas aqui: as chaves são colocadas de modo a sempre poder abri-las
        const blocked = new Set(this.blockedTiles.filter(t => this.mapData.map[t.y][t.x] !== 3).map(t => t.x + ',' + t.y));
        return posicoesAlcancaveis({ cols: this.mapCols, rows: this.mapRows, blocked, inicio: { x: this.mapData.playerStart.x * T + T / 2, y: this.mapData.playerStart.y * T + T / 2 }, tile: T });
    }

    /** Melhor taxa líquida (cps) que se mede de uma fonte hipotética de `isotope` e atividade `base` em `furn`. */
    taxaMelhorPosicao(furn, isotope, base, posicoes) {
        const T = CONFIG.TILE_SIZE;
        const fonte = {
            type: isotope.type, base, x: furn.centerX / T, y: furn.centerY / T, rect: this.rectDoMovel(furn),
            energyMeV: isotope.energyMeV, betaRangeMgCm2: isotope.betaRangeMgCm2, componentes: componentesDe(isotope),
        };
        const ctx = { tileM: this.missionData.tileM ?? CONFIG.TILE_M, paredeCm: CONFIG.PAREDE_CM, ehParede: this.ehParede, blindagem: null };
        return melhorTaxaLiquida(fonte, posicoes, ctx);
    }

    placeSources() {
        const numSources = this.missionData.numSources;
        const tileSize = CONFIG.TILE_SIZE;
        
        // Get mission-specific isotopes or use all
        let missionIsotopes = [...ISOTOPES];
        if (this.missionData.allowedIsotopes) {
            missionIsotopes = ISOTOPES.filter(iso => 
                this.missionData.allowedIsotopes.includes(iso.name)
            );
            
            // Add special isotope if defined (like Ra-226 for Radium Girls)
            if (this.missionData.addIsotope) {
                missionIsotopes.push(this.missionData.addIsotope);
            }
        }
        
        // For Chernobyl (nuclear map), sources should be near the reactor
        let availableFurniture = this.furniture.filter((f) => !ehMovelExterno(f.type.id));   // árvores, postes e carros da rua não guardam fonte
        
        if (this.missionData.concentratedSources && this.mapData.reactorPosition) {
            // Sort furniture by distance to reactor - closest first
            const reactor = this.mapData.reactorPosition;
            const reactorCenterX = (reactor.x + reactor.width / 2) * tileSize;
            const reactorCenterY = (reactor.y + reactor.height / 2) * tileSize;
            
            availableFurniture.sort((a, b) => {
                const distA = distance(a.centerX || (a.x * tileSize), a.centerY || (a.y * tileSize), reactorCenterX, reactorCenterY);
                const distB = distance(b.centerX || (b.x * tileSize), b.centerY || (b.y * tileSize), reactorCenterX, reactorCenterY);
                return distA - distB;
            });
            
            // Only use furniture near the reactor for sources
            const maxDist = (this.missionData.raioConcentracao || 8) * tileSize; // tiles from reactor (mapas grandes pedem raio maior)
            availableFurniture = availableFurniture.filter(f => {
                const fx = f.centerX || (f.x * tileSize);
                const fy = f.centerY || (f.y * tileSize);
                return distance(fx, fy, reactorCenterX, reactorCenterY) < maxDist;
            });
        } else {
            // Shuffle for random placement
            availableFurniture = shuffleArray(availableFurniture);
        }
        
        const shuffledIsotopes = shuffleArray([...missionIsotopes]);
        
        // Acessibilidade: a fonte só pode cair num móvel de onde o Geiger a detecte bem, a partir de
        // posições que o jogador de fato alcança andando (fisica/acessibilidade.js). Se não houver móvel
        // suficiente no limiar confortável, relaxa o limiar; o último recurso aceita qualquer móvel.
        const posicoes = this.posicoesDoJogador();
        const restantes = [...availableFurniture];
        // Academia: uma fonte por sala (as salas vêm do mapa); sala sem móvel acessível é ignorada
        const salas = this.missionData.umaFontePorSala ? this.mapData.salas : null;
        const salaDe = (f) => salas ? salas.findIndex(r => f.x >= r.x && f.x < r.x + r.w && f.y >= r.y && f.y < r.y + r.h) : -1;
        const salasUsadas = new Set();
        if (this.missionData.salasComFonte) {
            // Academia: um isótopo definido por sala (isotopoPorSala; '*' = sorteado entre os permitidos)
            for (const si of this.missionData.salasComFonte) {
                const nome = this.missionData.isotopoPorSala?.[si];
                const isotope = (nome && nome !== '*' && missionIsotopes.find(x => x.name === nome)) || shuffledIsotopes[0];
                const base = randomRange(isotope.minBase, isotope.maxBase);
                const daSala = restantes.filter(f => salaDe(f) === si);
                let escolhido = null;
                for (const limiar of LIMIARES_ACESSO) {
                    escolhido = daSala.find(f => this.taxaMelhorPosicao(f, isotope, base, posicoes) >= limiar);
                    if (escolhido) break;
                }
                if (!escolhido) continue;
                restantes.splice(restantes.indexOf(escolhido), 1);
                const source = { ...isotope, base, furniture: escolhido, found: false, sala: si };
                escolhido.hasSource = true;
                escolhido.source = source;
                this.sources.push(source);
            }
        }
        for (let i = 0; i < numSources && restantes.length && !this.missionData.salasComFonte; i++) {
            const isotope = shuffledIsotopes[i % shuffledIsotopes.length];
            const base = randomRange(isotope.minBase, isotope.maxBase);
            let idx = -1;
            const livreDaSala = (f) => !salas || !salasUsadas.has(salaDe(f));
            for (const limiar of LIMIARES_ACESSO) {
                idx = restantes.findIndex(f => livreDaSala(f) && this.taxaMelhorPosicao(f, isotope, base, posicoes) >= limiar);
                if (idx >= 0) break;
            }
            if (salas && idx < 0) break;   // todas as salas já têm fonte
            const furn = restantes.splice(idx >= 0 ? idx : 0, 1)[0];
            if (salas) salasUsadas.add(salaDe(furn));
            
            const source = {
                ...isotope,
                base,
                furniture: furn,
                found: false,
            };
            
            furn.hasSource = true;
            furn.source = source;
            
            this.sources.push(source);
        }
        
        // Show educational tip about the mission's isotopes
        if (this.missionData.id === 2) {
            // Goiânia - Cs-137
            this.time.delayedCall(3000, () => ui.showNotification(t('gammaHint'), 'info'));
        } else if (this.missionData.id === 3) {
            // Radium Girls - Ra-226 specific hint
            this.time.delayedCall(3000, () => ui.showNotification(t('radiumHint'), 'info'));
        }
    }
    
    createPlayer() {
        const { playerStart } = this.mapData;
        const tileSize = CONFIG.TILE_SIZE;
        
        const px = playerStart.x * tileSize + tileSize / 2;
        const py = playerStart.y * tileSize + tileSize / 2;
        
        // Create player container
        this.player = this.add.container(px, py);
        
        // === RADIATION HUNTER: cientista de campo (render/personagem.js) ===
        registrarTexturasDoPersonagem(this);
        this.dirSprite = 'down';
        this.fasePasso = 0;
        this.sprite = this.add.image(0, 0, chaveQuadro('down', 0)).setScale(ESCALA_SPRITE).setOrigin(0.5, 0.64);

        // === DETECTOR GEIGER nas mãos: gira em torno do personagem, apontando para a frente ===
        this.geigerDevice = this.add.container(0, 0);
        const geigerBody = this.add.rectangle(0, 0, 8, 12, 0x2c3e50);
        geigerBody.setStrokeStyle(1, 0x111a24);
        const geigerScreen = this.add.rectangle(0, -2, 5, 4, 0x0a1118);
        this.geigerIndicator = this.add.circle(0, -2, 1.8, 0x333333);
        const geigerProbe = this.add.rectangle(6, 0, 8, 3, 0x6b7785);
        this.geigerTip = this.add.circle(10.5, 0, 3, 0x333333);
        this.geigerTip.setStrokeStyle(1, 0x111a24);
        this.geigerDevice.add([geigerBody, geigerScreen, this.geigerIndicator, geigerProbe, this.geigerTip]);
        this.geigerDevice.setPosition(11, 4);
        this.geigerDevice.setVisible(this.temGeiger);

        // Marcador de direção sutil
        this.playerArrow = this.add.triangle(21, 4, 0, -3, 6, 0, 0, 3, 0x00ff88, 0.55);

        this.player.add([this.sprite, this.geigerDevice, this.playerArrow]);
        
        this.player.setDepth(10);
        
        // Animation tweens
        this.walkTween = null;
        this.criarEquipeCampo(px, py);
    }

    /**
     * v3.17: todos os cientistas da saída aparecem no mapa. Quem não está selecionado fica parado onde estava (com o número da tecla);
     * 7, 8, 9 e 0 passam o controle e a câmera para o escolhido. A dose de cada um é a do lugar onde ele está.
     */
    criarEquipeCampo(px, py) {
        this.colegas = null; this.rotuloAtivo = null;
        if (ui.origem !== 'agencia') return;
        const lista = ui.agencia.equipeDoHud(); if (lista.length < 2) return;
        const tints = [0xffffff, 0xcfe8ff, 0xffe0c0, 0xe0ffd0], desl = [[0, 0], [-22, 16], [22, 16], [0, -22]];
        this.colegas = {};
        lista.forEach((c, k) => {
            const cont = this.add.container(px + desl[k][0], py + desl[k][1]).setDepth(9);
            const img = this.add.image(0, 0, chaveQuadro('down', 0)).setScale(ESCALA_SPRITE).setOrigin(0.5, 0.64).setTint(tints[k % 4]);
            const rot = this.add.text(0, -30, c.tecla, { fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5);
            cont.add([img, rot]); cont.setVisible(!c.ativo);
            this.colegas[c.id] = cont;
            if (c.ativo) { this.player.setPosition(px + desl[k][0], py + desl[k][1]); this.rotuloAtivo = this.add.text(0, -30, c.tecla, { fontFamily: 'Orbitron, monospace', fontSize: '14px', color: '#00ff88', stroke: '#000000', strokeThickness: 4 }).setOrigin(0.5); this.player.add(this.rotuloAtivo); }
        });
    }
    
    updateGeigerVisual(reading, isActive) {
        if (!this.geigerIndicator) return;
        
        if (!isActive) {
            this.geigerIndicator.setFillStyle(0x333333);
            this.geigerTip.setFillStyle(0x333333);
            return;
        }
        
        // Color based on reading intensity
        let color;
        if (reading > 300) {
            color = 0xff0000; // Danger red
        } else if (reading > 100) {
            color = 0xffff00; // Warning yellow
        } else if (reading > 20) {
            color = 0x00ff00; // Detecting green
        } else {
            color = 0x00aa00; // Low activity
        }
        
        this.geigerIndicator.setFillStyle(color);
        this.geigerTip.setFillStyle(color);
        
        // Pulse effect for high readings
        if (reading > 200 && !this.geigerPulsing) {
            this.geigerPulsing = true;
            this.tweens.add({
                targets: this.geigerDevice,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                yoyo: true,
                repeat: 2,
                onComplete: () => { this.geigerPulsing = false; }
            });
        }
    }
    
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        
        // Action keys
        this.input.keyboard.on('keydown-G', () => this.toggleGeiger());
        this.input.keyboard.on('keydown-Q', () => this.handleIdentify());
        this.input.keyboard.on('keydown-E', () => this.revisarLicao());
        this.input.keyboard.on('keydown-H', () => this.pedirDica());
        // Esc é tratado no DOM (ui.aoPressionarEsc): fecha modal, retoma ou pausa conforme o contexto
        
        // Blindagens: 1 = sem blindagem, 2 = alumínio, 3 = acrílico, 4 = chumbo (v3.16; ids internos continuam 0 a 3)
        ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((nome, id) => {
            this.input.keyboard.on('keydown-' + nome, () => this.setShield(id));
            this.input.keyboard.on('keydown-NUMPAD_' + nome, () => this.setShield(id));
        });
        // Cientistas da saída: 7, 8, 9, 0 = 1º ao 4º assento (só em missão aberta pela Agência)
        ['SEVEN', 'EIGHT', 'NINE', 'ZERO'].forEach((nome, i) => {
            this.input.keyboard.on('keydown-' + nome, () => this.trocarCientista(i));
            this.input.keyboard.on('keydown-NUMPAD_' + nome, () => this.trocarCientista(i));
        });
    }

    /** Troca o cientista em campo (modo Agência). A caneta e o painel de equipe passam a mostrar o novo. */
    trocarCientista(i) {
        if (this.bloqueado() || ui.origem !== 'agencia') return;
        const velho = ui.agencia.cientistaAtivo();
        const m = ui.agencia.trocarCientista(i);
        if (!m) return;
        const C = this.colegas;
        if (C && C[velho] && C[m.id]) {
            C[velho].setPosition(this.player.x, this.player.y).setVisible(true);   // quem estava em campo fica parado onde estava
            this.player.setPosition(C[m.id].x, C[m.id].y); C[m.id].setVisible(false);
            if (this.rotuloAtivo) this.rotuloAtivo.setText(['7', '8', '9', '0'][i]);
            this.janelaGeiger.reset();
            if (this.geigerActive) this.measureRadiation();
        }
        ui.atualizarCaneta(ui.agencia.penDoLider(ui.agencia.doseDoAtivo()));
        ui.atualizarEquipeHud();
        ui.showNotification((currentLang === 'pt' ? 'Em campo: ' : 'In the field: ') + m.nome, 'info');
    }
    
    setupMinimap() {
        const canvas = document.getElementById('minimap-canvas');
        this.minimapCtx = canvas.getContext('2d');
        // A escala do minimapa acompanha o tamanho do mapa: cabe sempre numa caixa de 180 x 120 px
        this.mmEscala = Math.min(180 / this.mapCols, 120 / this.mapRows);
        canvas.width = Math.round(this.mapCols * this.mmEscala);
        canvas.height = Math.round(this.mapRows * this.mmEscala);
        this.drawMinimap();
    }
    
    drawMinimap() {
        if (!this.minimapCtx) return;
        
        const ctx = this.minimapCtx;
        const { map, theme } = this.mapData;
        const scale = this.mmEscala || 7;
        
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // Draw map
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const tile = map[y][x];
                
                if (tile === 3) {
                    ctx.fillStyle = '#ffd54f';
                } else if (tile === 1) {
                    ctx.fillStyle = '#444';
                } else if (tile === 2) {
                    ctx.fillStyle = '#666';
                } else {
                    ctx.fillStyle = '#222';
                }
                
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
        
        // Draw sources (found ones)
        this.sources.forEach(source => {
            if (source.found) {
                const fx = Math.floor(source.furniture.centerX / CONFIG.TILE_SIZE);
                const fy = Math.floor(source.furniture.centerY / CONFIG.TILE_SIZE);
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(fx * scale, fy * scale, scale, scale);
            }
        });
        
        // Dica de localização (nível 1 ou 2): fontes ainda não identificadas pulsam em vermelho
        if (this.dica && this.dica.nivel >= 1) {
            const pulso = 0.5 + 0.5 * Math.sin(this.time.now / 220);
            this.sources.forEach(source => {
                if (source.found) return;
                const fx = Math.floor(source.furniture.centerX / CONFIG.TILE_SIZE);
                const fy = Math.floor(source.furniture.centerY / CONFIG.TILE_SIZE);
                ctx.fillStyle = `rgba(255,59,59,${0.55 + 0.45 * pulso})`;
                ctx.beginPath(); ctx.arc((fx + 0.5) * scale, (fy + 0.5) * scale, scale * (1.1 + 0.8 * pulso), 0, Math.PI * 2); ctx.fill();
            });
        }

        // Levantamento aéreo (modo Agência): só as fontes que emitem GAMA aparecem marcadas (laranja); alfa e beta não são detectadas do ar
        if (this.levantado) {
            const pulso = 0.5 + 0.5 * Math.sin(this.time.now / 260);
            this.sources.forEach(source => {
                if (source.found || !componentesDe(source).some(c => c.tipo === 'gama')) return;
                const fx = Math.floor(source.furniture.centerX / CONFIG.TILE_SIZE), fy = Math.floor(source.furniture.centerY / CONFIG.TILE_SIZE);
                ctx.strokeStyle = `rgba(255,150,40,${0.6 + 0.4 * pulso})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc((fx + 0.5) * scale, (fy + 0.5) * scale, scale * (1.2 + 0.7 * pulso), 0, Math.PI * 2); ctx.stroke();
            });
        }
        // Ponto de coleta (heliponto): onde as fontes organizadas são entregues à nave de resgate
        if (this.faseColeta && this.pontoColeta) {
            ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(this.pontoColeta.x * scale, this.pontoColeta.y * scale, scale * (1.6 + 0.5 * Math.sin(this.time.now / 200)), 0, Math.PI * 2); ctx.stroke();
        }

        // Academia: painéis (ciano = pendente, verde = feito), chaves, Geiger e o alvo do objetivo
        if (this.paineis && this.paineis.length) {
            const ponto = (tx, ty, cor, r) => { ctx.fillStyle = cor; ctx.beginPath(); ctx.arc((tx + 0.5) * scale, (ty + 0.5) * scale, Math.max(r, 1.6), 0, Math.PI * 2); ctx.fill(); };
            for (const p of this.paineis) ponto(p.tx, p.ty, this.licoesFeitas.includes(p.i) ? '#00ff88' : '#2fc8e6', scale * 0.7);
            for (const k of (this.chavesItens || [])) ponto(k.tx, k.ty, k.cor === 'azul' ? '#4aa3ff' : '#ff5a5a', scale * 0.8);
            if (this.geigerItem) ponto(this.geigerItem.tx, this.geigerItem.ty, '#ffd400', scale * 0.9);
            const a = this.objAtual && this.objAtual.alvo;
            if (a && GameState.settings.showHints) {
                ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(a.x * scale, a.y * scale, scale * (1.6 + 0.4 * Math.sin(this.time.now / 200)), 0, Math.PI * 2); ctx.stroke();
            }
        }
        
        // Draw player
        if (this.player) {
            const px = Math.floor(this.player.x / CONFIG.TILE_SIZE);
            const py = Math.floor(this.player.y / CONFIG.TILE_SIZE);
            ctx.fillStyle = '#3498db';
            ctx.beginPath();
            ctx.arc(px * scale + scale/2, py * scale + scale/2, Math.max(scale / 2, 2), 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Retângulo da área visível (útil quando o mapa é maior que a tela)
        const vista = this.cameras.main.worldView, k = scale / CONFIG.TILE_SIZE;
        if (vista && vista.width < this.mapCols * CONFIG.TILE_SIZE - 1 || vista && vista.height < this.mapRows * CONFIG.TILE_SIZE - 1) {
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
            ctx.lineWidth = 1;
            ctx.strokeRect(vista.x * k + 0.5, vista.y * k + 0.5, vista.width * k - 1, vista.height * k - 1);
        }
    }
    
    setupParticles() {
        // Simple particle effect using graphics
        this.particles = [];
    }
    
    createParticleEffect(x, y, color = 0x00ff88) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const particle = this.add.circle(x, y, 4, color);
            particle.setDepth(20);
            
            const distance = 50 + Math.random() * 30;
            const tx = x + Math.cos(angle) * distance;
            const ty = y + Math.sin(angle) * distance;
            
            this.tweens.add({
                targets: particle,
                x: tx,
                y: ty,
                alpha: 0,
                scale: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }
    
    startGame() {
        // Game starts automatically now
        this.gameStarted = true;
        GameState.startTime = this.time.now;
        GameState.paused = false;
    }
    
    /** Meta de tempo da missão (s): timeLimit da missão; 240 s quando a missão não define. [H] */
    get metaTempoS() { return this.missionData.timeLimit > 0 ? this.missionData.timeLimit : 240; }
    
    /** Entrada do jogador bloqueada (pausa, modal de identificação, missão encerrada) */
    bloqueado() { return GameState.paused || GameState.modalAberto || this.concluindo || this.fim || !this.gameStarted; }
    
    /**
     * Assistência do alfa (dificuldade adaptativa) [H]: o alfa só é medido muito perto do móvel, então, se o jogador
     * demorou, o alcance sobe de 1,0 para ASSIST_ALFA_TILES. Dispara aos 75% da meta de tempo, ou aos 50% se ainda
     * faltam mais da metade das fontes. O tempo já exclui pausa e encontros. O bônus de tempo da pontuação não muda.
     */
    verificarAssistencia() {
        if (this.assistenciaAlfa || !this.sources.length) return;
        const faltam = this.sources.filter(s => !s.found);
        if (!faltam.some(s => componentesDe(s).some(c => c.tipo === 'alfa'))) return;
        const frac = (this.tempoFinalMs ?? this.elapsedMs) / 1000 / this.metaTempoS;
        const muitasFaltando = faltam.length / this.sources.length > CONFIG.ASSIST_FALTAM_MAIS_QUE;
        if (frac >= CONFIG.ASSIST_TEMPO_FRAC || (frac >= CONFIG.ASSIST_TEMPO_FRAC_FALTAM && muitasFaltando)) {
            this.assistenciaAlfa = true;
            ui.showNotification(t('assistAlfa'), 'info');
        }
    }

    /** Há fonte ainda por achar e o jogador já pode procurá-las (Academia: depois de pegar o Geiger)? */
    dicaDisponivel() {
        return !!(this.sources && this.sources.length && this.temGeiger && this.sources.some(s => !s.found));
    }

    /** Botão/tecla H: mostra no mapa, por DICA_PEDIDA_S s, onde estão as fontes que faltam. */
    pedirDica() {
        if (!this.gameStarted || GameState.paused || GameState.modalAberto || this.concluindo || this.fim || !this.dicaDisponivel()) return;
        this.dica.pedidaAteMs = this.elapsedMs + DICA_PEDIDA_S * 1000;
        this.atualizarDica(this.time.now);
    }

    /** Calcula o nível da dica (0 = nenhuma, 1 = minimapa, 2 = minimapa + mapa) e cobra o uso do nível 2. */
    atualizarDica() {
        const d = this.dica;
        // O aviso espera outra notificação (ex.: assistência do alfa) terminar, para não a apagar
        if (d.aviso && !document.getElementById('notification').classList.contains('show')) { ui.showNotification(d.aviso, 'info'); d.aviso = null; }
        if (!this.dicaDisponivel()) { this.definirNivelDica(0); return; }
        // Progresso: fonte identificada, lição concluída, chave ou Geiger pegos. Zera a contagem e o custo do intervalo.
        const sinal = this.foundSources.length * 1000 + this.licoesFeitas.length * 10 + (this.chavesItens ? this.chavesItens.length * 100 : 0) + (this.temGeiger ? 1 : 0);
        if (sinal !== d.sinal) { d.sinal = sinal; d.desdeMs = this.elapsedMs; d.cobrado = false; d.avisouMini = false; d.avisouMapa = false; }
        const auto = GameState.settings.showHints === false ? 0 : nivelDicaAuto((this.elapsedMs - d.desdeMs) / 1000);
        const pedida = this.elapsedMs < d.pedidaAteMs ? 2 : 0;
        this.definirNivelDica(Math.max(auto, pedida));
    }

    definirNivelDica(n) {
        const d = this.dica;
        if (n === d.nivel) return;
        d.nivel = n;
        if (n === 1 && !d.avisouMini) { d.avisouMini = true; d.aviso = t('dicaMiniAviso'); }
        if (n === 2) {
            if (!d.cobrado) { d.cobrado = true; d.usos++; }
            if (!d.avisouMapa) { d.avisouMapa = true; d.aviso = t('dicaAviso'); }
        }
        if (n < 2 && this.dicaGfx) this.dicaGfx.clear();
    }

    /** Pulso vermelho em volta dos móveis com fonte ainda não identificada (só no nível 2). */
    desenharDicaNoMapa(time) {
        if (this.dica.nivel < 2) return;
        if (!this.dicaGfx) this.dicaGfx = this.add.graphics().setDepth(7);
        const g = this.dicaGfx, pulso = 0.5 + 0.5 * Math.sin(time / 220);
        g.clear();
        for (const s of this.sources) {
            if (s.found) continue;
            const f = s.furniture, w = (f.type?.width || 1) * CONFIG.TILE_SIZE, h = (f.type?.height || 1) * CONFIG.TILE_SIZE;
            const r = Math.max(w, h) * 0.5 + 8 + pulso * 6;
            g.lineStyle(3, 0xff3b3b, 0.35 + 0.55 * pulso);
            g.strokeCircle(f.centerX, f.centerY, r);
            g.fillStyle(0xff3b3b, 0.10 + 0.15 * pulso);
            g.fillCircle(f.centerX, f.centerY, r);
        }
    }

    update(time, delta) {
        if (!this.gameStarted || GameState.paused || this.fim) return;
        
        if (!this.concluindo && !this.emEncontro) this.elapsedMs += Math.min(delta || 0, 100);
        const seg = Math.floor(this.elapsedMs / 1000);
        if (seg !== this.ultimoSegundoHud) { this.ultimoSegundoHud = seg; ui.updateTimer(seg, this.metaTempoS); }
        
        if (!this.concluindo) this.verificarAssistencia();
        if (!this.concluindo && !this.emEncontro) this.atualizarDica(time);
        if (!this.concluindo && !GameState.modalAberto) { this.verificarPortasEChaves(time); this.verificarLicoes(time); }
        if (!GameState.modalAberto && !this.concluindo) this.handleMovement(delta);
        if (!GameState.modalAberto && !this.concluindo && !this.emEncontro) this.encontros.checar(delta);
        this.atualizarObjetivo(time);
        this.atualizarObjetivoTutorial(time);
        this.desenharSeta(time);
        this.desenharDicaNoMapa(time);
        this.updateVisionCone();
        this.updateGeiger(time);
        this.atualizarDose(delta);
        this.verificarColeta();
        this.updateFurnitureInfo();
        this.drawMinimap();
    }

    /** Dose do líder da saída (modo Agência): soma a cada 250 ms; a caneta do HUD mostra mSv e % do limite (fisica/dose.js). */
    atualizarDose(delta) {
        if (ui.origem !== 'agencia') return;
        const pen = ui.agencia.equipeSaida && ui.agencia.alvo && (ui.agencia.alvo.tipo === 'missao' || ui.agencia.alvo.tipo === 'rapida');
        if (!pen) return;
        if (GameState.modalAberto || this.emEncontro) return;
        this._doseAcc = (this._doseAcc || 0) + Math.min(delta || 0, 100) / 1000;
        if (this._doseAcc < DOSE.passoS) return;
        const dt = this._doseAcc; this._doseAcc = 0;
        const T = CONFIG.TILE_SIZE;
        const ctx = { tileM: this.missionData.tileM ?? CONFIG.TILE_M, paredeCm: CONFIG.PAREDE_CM, ehParede: this.ehParede };
        const fontes = this.sources.map((s) => this.fonteFisica(s)), q = ui.agencia.equipeSaida, ativo = ui.agencia.cientistaAtivo();
        let dd = 0;
        for (const id of q.ids) {   // cada cientista recebe a dose do ponto onde está (v3.17)
            const pos = id === ativo || !this.colegas || !this.colegas[id] ? this.player : this.colegas[id];
            const d1 = doseDe(taxaGamaCps(fontes, { x: pos.x / T, y: pos.y / T }, ctx), dt);
            ui.agencia.registrarDoseCampo(d1, id); dd += d1;
        }
        q.exato = true;
        GameState.doseMissao = (GameState.doseMissao || 0) + dd;
        ui.atualizarCaneta(ui.agencia.penDoLider(ui.agencia.doseDoAtivo()));
    }

    updateFurnitureInfo() {
        const T = CONFIG.TILE_SIZE;
        const px = this.player.x / T;
        const py = this.player.y / T;

        let nearest = null;
        let nearestDist = Infinity;

        this.furniture.forEach(f => {
            const rect = this.rectDoMovel(f);
            const dist = distanciaAoRetangulo(rect, px, py);
            if (dist > CONFIG.OBSERVE_DISTANCE || dist >= nearestDist) return;

            const p = pontoMaisProximo(rect, px, py);
            const angle = Math.atan2(p.y - py, p.x - px);
            const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - this.playerDirection));
            if (dist < 0.05 || angleDiff <= CONFIG.VISION_ANGLE / 2) {
                nearestDist = dist;
                nearest = f;
            }
        });

        if (!nearest) {
            this.furnitureInfoText.setText('');
            return;
        }

        const label = nearest.type?.name || 'Objeto';
        this.furnitureInfoText.setText(label);
    }

    /** Retângulo do móvel em tiles. */
    rectDoMovel(f) {
        return { x: f.x, y: f.y, w: f.type?.width || 1, h: f.type?.height || 1 };
    }

    /** Fonte no formato do modelo físico (fisica/geiger.js). */
    fonteFisica(source) {
        if (!source.fis) {
            const f = source.furniture, T = CONFIG.TILE_SIZE;
            source.fis = {
                type: source.type, base: source.base, x: f.centerX / T, y: f.centerY / T,
                rect: this.rectDoMovel(f), energyMeV: source.energyMeV, betaRangeMgCm2: source.betaRangeMgCm2,
                componentes: componentesDe(source),
            };
        }
        source.fis.found = source.found;
        return source.fis;
    }
    
    handleMovement(delta) {
        let dx = 0, dy = 0, analogico = false;
        // Velocidade independente da taxa de quadros: os valores de CONFIG são px por quadro a 60 Hz
        const k = Math.min(delta || 16.667, 50) / (1000 / 60);
        
        const v = GameState.virtual || {};
        // Joystick analógico (celular): vetor contínuo, sem o fator diagonal
        const vec = GameState.virtualVec;
        if (vec && (vec.x || vec.y)) {
            dx = vec.x; dy = vec.y;
            this.playerDirection = Math.atan2(dy, dx);
            analogico = true;
        }
        // Check input
        if (!analogico) {
        if (this.cursors.left.isDown || this.wasd.A.isDown || v.left) {
            dx = -1;
            this.playerDirection = Math.PI;
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown || v.right) {
            dx = 1;
            this.playerDirection = 0;
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown || v.up) {
            dy = -1;
            this.playerDirection = -Math.PI / 2;
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown || v.down) {
            dy = 1;
            this.playerDirection = Math.PI / 2;
        }
        
        // Handle diagonal direction
        if (dx !== 0 && dy !== 0) {
            this.playerDirection = Math.atan2(dy, dx);
        }
        }
        
        // Running
        const isRunning = (this.shiftKey.isDown || v.run) && GameState.stamina > 0 && (dx !== 0 || dy !== 0);
        const speed = isRunning ? CONFIG.PLAYER_RUN_SPEED : CONFIG.PLAYER_SPEED;
        
        // Update stamina
        if (isRunning && (dx !== 0 || dy !== 0)) {
            GameState.stamina = Math.max(0, GameState.stamina - CONFIG.STAMINA_DRAIN * k);
        } else {
            GameState.stamina = Math.min(CONFIG.STAMINA_MAX, GameState.stamina + CONFIG.STAMINA_REGEN * k);
        }
        ui.updateStamina(GameState.stamina);
        
        // Normalize diagonal movement
        if (!analogico && dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Apply movement with collision
        const newX = this.player.x + dx * speed * k;
        const newY = this.player.y + dy * speed * k;
        
        if (!this.isBlocked(newX, this.player.y)) {
            this.player.x = newX;
        }
        if (!this.isBlocked(this.player.x, newY)) {
            this.player.y = newY;
        }
        
        this.animarPersonagem(dx !== 0 || dy !== 0, isRunning, delta);
    }
    
    // Sprite do cientista: direção, ciclo de passos (mais rápido ao correr) e detector apontando à frente
    animarPersonagem(movendo, correndo, delta) {
        const dir = direcaoDoAngulo(this.playerDirection);
        if (dir) this.dirSprite = dir;
        let quadro = 0;
        if (movendo) {
            this.fasePasso += (delta || 16.667) * (correndo ? 0.012 : 0.0075);
            quadro = (Math.floor(this.fasePasso) % 2) + 1;
        } else {
            this.fasePasso = 0;
        }
        this.sprite.setTexture(chaveQuadro(this.dirSprite, quadro));
        const a = this.playerDirection, c = Math.cos(a), sn = Math.sin(a);
        this.geigerDevice.setPosition(c * 12, sn * 10 + 4);
        this.geigerDevice.setRotation(a);
        this.playerArrow.setPosition(c * 22, sn * 20 + 4);
        this.playerArrow.setRotation(a);
        // indo para cima (de costas) o detector fica atrás do corpo; nas demais direções, na frente
        if (sn < -0.5) this.player.sendToBack(this.geigerDevice); else this.player.bringToTop(this.geigerDevice);
    }

    isBlocked(x, y) {
        const tileSize = CONFIG.TILE_SIZE;
        const radius = 10;
        
        // Check corners of player collision box
        const corners = [
            { x: x - radius, y: y - radius },
            { x: x + radius, y: y - radius },
            { x: x - radius, y: y + radius },
            { x: x + radius, y: y + radius },
        ];
        
        for (const corner of corners) {
            const tileX = Math.floor(corner.x / tileSize);
            const tileY = Math.floor(corner.y / tileSize);
            
            if (this.blockedTiles.some(t => t.x === tileX && t.y === tileY)) {
                return true;
            }
        }
        
        return false;
    }
    
    updateVisionCone() {
        this.visionGraphics.clear();
        if (!this.temGeiger) return;   // Academia: sem o Geiger não há cone de varredura
        
        const px = this.player.x;
        const py = this.player.y;
        const dist = CONFIG.VISION_DISTANCE * CONFIG.TILE_SIZE;
        const angle = CONFIG.VISION_ANGLE;
        
        // Draw vision cone layers
        for (let i = 5; i >= 1; i--) {
            const alpha = 0.06 * i;
            const layerDist = dist * (i / 5);
            
            this.visionGraphics.fillStyle(0x00ff88, alpha);
            this.visionGraphics.beginPath();
            this.visionGraphics.moveTo(px, py);
            this.visionGraphics.arc(
                px, py, layerDist,
                this.playerDirection - angle / 2,
                this.playerDirection + angle / 2
            );
            this.visionGraphics.closePath();
            this.visionGraphics.fillPath();
        }
    }
    
    toggleGeiger() {
        if (this.bloqueado()) return;
        if (!this.temGeiger) { ui.showNotification(txtAcad(currentLang, 'semGeiger'), 'info'); return; }
        this.geigerActive = !this.geigerActive;
        GameState.geigerActive = this.geigerActive;
        
        ui.setGeigerButtonActive(this.geigerActive);
        this.janelaGeiger.reset();
        
        if (this.geigerActive) {
            this.updateGeigerVisual(this.currentReading, true);
            this.measureRadiation();
        } else {
            this.currentReading = 0;
            this.currentUncertainty = 0;
            this.updateGeigerVisual(0, false);
            ui.updateGeigerDisplay(0, false);
        }
    }
    
    updateGeiger(time) {
        if (!this.geigerActive) return;
        
        // Uma amostra a cada GEIGER_PASSO_MS; os cliques seguem a contagem de verdade
        // (processo de Poisson): n cliques em instantes aleatórios dentro do passo.
        if (!this.lastMeasure || time - this.lastMeasure >= CONFIG.GEIGER_PASSO_MS) {
            this.measureRadiation();
            this.lastMeasure = time;
            const n = Math.min(this.lastCount, 25);
            for (let i = 0; i < n; i++) {
                this.time.delayedCall(Math.random() * CONFIG.GEIGER_PASSO_MS, () => audioManager.playGeigerClick());
            }
        }
    }
    
    /**
     * Uma amostra do contador (GEIGER_PASSO_MS): taxa esperada pelo modelo físico (fisica/geiger.js),
     * contagem Poisson e média móvel de GEIGER_JANELA_S segundos, que é o que o painel mostra.
     */
    measureRadiation() {
        const T = CONFIG.TILE_SIZE;
        const sonda = { x: this.player.x / T, y: this.player.y / T, dir: this.playerDirection };
        const escudo = SHIELDS[GameState.currentShield];
        const ctx = {
            tileM: this.missionData.tileM ?? CONFIG.TILE_M,
            paredeCm: CONFIG.PAREDE_CM,
            ehParede: this.ehParede,
            blindagem: escudo && escudo.material ? escudo : null,
            alfaAlcanceTiles: this.assistenciaAlfa ? CONFIG.ASSIST_ALFA_TILES : undefined,
        };
        const taxa = taxaEsperada(this.sources.map(s => this.fonteFisica(s)), sonda, ctx);
        const dt = CONFIG.GEIGER_PASSO_MS / 1000;
        const n = contar(taxa, dt);
        this.janelaGeiger.adicionar(n, dt);
        
        this.lastRate = taxa;
        this.lastCount = n;
        this.currentReading = Math.round(this.janelaGeiger.cps);
        if (this.currentReading > CONFIG.BG_RADIATION * 2) {
            if (GameState.currentShield === 0) this.evidencia.semPlaca = true;
            else this.evidencia.placas.add(GameState.currentShield);
        }
        this.currentUncertainty = this.janelaGeiger.incerteza;
        ui.updateGeigerDisplay(this.currentReading, true, this.currentUncertainty);
        this.updateGeigerVisual(this.currentReading, true);
    }
    
    setShield(shieldId) {
        if (this.bloqueado()) return;
        GameState.currentShield = shieldId;
        ui.setActiveShield(shieldId);
        
        // A leitura precisa refletir a nova blindagem: recomeça a janela de contagem
        this.janelaGeiger.reset();
        if (this.geigerActive) {
            this.measureRadiation();
        }
    }
    
    // ------------------------------------------------------------------
    // PORTAS TRANCADAS E CHAVES (Academia). Tile 3 = porta fechada (bloqueia e conta como parede).
    // As chaves são sorteadas em pisos alcançáveis ANTES da porta que abrem (resolve a cadeia: a vermelha
    // fica atrás da porta da chave azul), então nunca há jogo travado.
    // ------------------------------------------------------------------
    criarPortasEChaves() {
        const T = CONFIG.TILE_SIZE;
        const portas = this.mapData.portas || [], spec = this.mapData.chavesSpec || [];
        GameState.inventario = [];
        this.portasEstado = []; this.chavesItens = [];
        ui.atualizarInventario([], spec.length);
        if (!portas.length && !spec.length) return;

        const COR = { azul: 0x4aa3ff, vermelha: 0xff5a5a };
        for (const p of portas) {
            const r = p.rect;
            const g = this.add.container((r.x + r.w / 2) * T, (r.y + r.h / 2) * T).setDepth(6);
            const fundo = this.add.rectangle(0, 0, r.w * T - 4, r.h * T - 4, COR[p.cor], 0.55).setStrokeStyle(2, 0xffffff, 0.9);
            const trava = this.add.circle(0, 0, 6, 0x111111, 0.9).setStrokeStyle(2, COR[p.cor]);
            const buraco = this.add.rectangle(0, 3, 3, 7, 0x111111);
            g.add([fundo, trava, buraco]);
            this.portasEstado.push({ ...p, aberta: false, obj: g, ultimoAviso: -1e9 });
        }

        // posições alcançáveis passo a passo, abrindo as portas à medida que as chaves são colocadas
        const base = new Set(this.blockedTiles.filter(t => this.mapData.map[t.y][t.x] !== 3).map(t => t.x + ',' + t.y));
        const inicio = { x: this.mapData.playerStart.x * T + T / 2, y: this.mapData.playerStart.y * T + T / 2 };
        const abertas = new Set();
        for (const ch of spec) {
            const blocked = new Set(base);
            for (const p of portas) if (!abertas.has(p.cor)) for (let dy = 0; dy < p.rect.h; dy++) for (let dx = 0; dx < p.rect.w; dx++) blocked.add((p.rect.x + dx) + ',' + (p.rect.y + dy));
            const pos = posicoesAlcancaveis({ cols: this.mapCols, rows: this.mapRows, blocked, inicio, tile: T });
            const alc = new Set(pos.map(q => Math.round(q.x * T) + ',' + Math.round(q.y * T)));
            const s = this.mapData.salas[ch.sala], livres = [];
            for (let y = s.y + 1; y < s.y + s.h - 1; y++) for (let x = s.x + 1; x < s.x + s.w - 1; x++) {
                if (this.mapData.map[y][x] !== 0) continue;
                const vizinhosLivres = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => this.mapData.map[y + dy]?.[x + dx] === 0);
                const naPortaDeCima = this.mapData.portas.some(p => Math.abs(p.rect.x - x) < 2 && Math.abs(p.rect.y - y) < 2);
                if (vizinhosLivres && !naPortaDeCima && alc.has(Math.round((x + 0.5) * T) + ',' + Math.round((y + 0.5) * T))) livres.push({ x, y });
            }
            const pt = livres.length ? livres[Math.floor(Math.random() * livres.length)] : null;
            if (pt) this.criarChave(ch.cor, pt.x, pt.y);
            abertas.add(ch.abre);
        }
        ui.atualizarInventario([], spec.length);
    }

    criarChave(cor, tx, ty) {
        const T = CONFIG.TILE_SIZE, c = cor === 'azul' ? 0x4aa3ff : 0xff5a5a;
        const g = this.add.container((tx + 0.5) * T, (ty + 0.5) * T).setDepth(4);
        const halo = this.add.circle(0, 0, 13, c, 0.28);
        const anel = this.add.circle(-5, 0, 4.5, c).setStrokeStyle(1.5, 0xffffff);
        const haste = this.add.rectangle(3, 0, 12, 3, c).setStrokeStyle(1, 0xffffff);
        const dente1 = this.add.rectangle(6, 3, 2.5, 4, c), dente2 = this.add.rectangle(10, 3, 2.5, 3, c);
        g.add([halo, anel, haste, dente1, dente2]);
        this.tweens.add({ targets: halo, scale: { from: 0.8, to: 1.35 }, alpha: { from: 0.35, to: 0.1 }, duration: 900, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: g, y: g.y - 2, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.chavesItens.push({ cor, tx, ty, obj: g });
    }

    verificarPortasEChaves(time) {
        if (!this.chavesItens) return;
        const T = CONFIG.TILE_SIZE, px = this.player.x / T, py = this.player.y / T;
        // pegar chaves: basta passar perto (sem botão, bom para o toque)
        for (let i = this.chavesItens.length - 1; i >= 0; i--) {
            const k = this.chavesItens[i];
            if (Math.hypot(k.tx + 0.5 - px, k.ty + 0.5 - py) > 0.8) continue;
            this.chavesItens.splice(i, 1);
            k.obj.destroy();
            GameState.inventario.push({ id: 'chave-' + k.cor, cor: k.cor });
            ui.atualizarInventario(GameState.inventario, this.capacidadeInventario());
            ui.showNotification(t('chavePegou').replace('{cor}', t(k.cor === 'azul' ? 'corAzul' : 'corVermelha')), 'success');
            audioManager.playSuccess();
        }
        // portas: abrem sozinhas para quem tem a chave da cor; sem a chave, aviso (no máximo a cada 4 s)
        for (const p of this.portasEstado) {
            if (p.aberta) continue;
            const r = distanciaAoRetangulo(p.rect, px, py);
            if (r > 1.0) continue;
            const temChave = GameState.inventario.some(it => it.cor === p.cor);
            const nome = t(p.cor === 'azul' ? 'corAzul' : 'corVermelha');
            // Academia: a porta também exige as lições anteriores (azul: salas 1-3; vermelha: salas 4-7)
            const exigidas = this.missionData.licoes ? (p.cor === 'azul' ? [0, 1, 2] : [3, 4, 5, 6]) : [];
            const faltaLicao = temChave && exigidas.some(i => !this.licoesFeitas.includes(i));
            if (faltaLicao) {
                if (time - p.ultimoAviso > 4000) { p.ultimoAviso = time; ui.showNotification(txtAcad(currentLang, p.cor === 'azul' ? 'portaLicoes' : 'portaLicoes2'), 'info'); }
            } else if (temChave) {
                this.abrirPorta(p);
                ui.showNotification(t('portaAberta').replace('{cor}', nome), 'success');
                audioManager.playSuccess();
            } else if (time - p.ultimoAviso > 4000) {
                p.ultimoAviso = time;
                ui.showNotification(t('portaTrancada').replace('{cor}', nome), 'info');
            }
        }
    }

    abrirPorta(p) {
        p.aberta = true;
        for (let dy = 0; dy < p.rect.h; dy++) for (let dx = 0; dx < p.rect.w; dx++) {
            const x = p.rect.x + dx, y = p.rect.y + dy;
            this.mapData.map[y][x] = 0;
            this.blockedTiles = this.blockedTiles.filter(t => !(t.x === x && t.y === y));
        }
        this.tweens.add({ targets: p.obj, alpha: 0, duration: 450, onComplete: () => p.obj.destroy() });
        this.drawMinimap();
    }

    // ------------------------------------------------------------------
    // ACADEMIA: lições (painéis) em cada sala e o Geiger como item na sala 4. Trava linear: a lição i só abre depois
    // da i-1; a lição da sala 4 exige o Geiger; as portas azul e vermelha exigem também as lições anteriores.
    // ------------------------------------------------------------------
    capacidadeInventario() { return (this.mapData.chavesSpec || []).length + (this.missionData.geigerComoItem ? 1 : 0); }

    tilesLivresDaSala(si, evitar = [], distMin = 2) {
        const s = this.mapData.salas[si], out = [];
        for (let y = s.y + 1; y < s.y + s.h - 1; y++) for (let x = s.x + 1; x < s.x + s.w - 1; x++) {
            if (this.mapData.map[y][x] !== 0) continue;
            if (!([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(([dx, dy]) => this.mapData.map[y + dy]?.[x + dx] === 0))) continue;
            if ((this.mapData.portas || []).some(p => Math.abs(p.rect.x - x) < 2 && Math.abs(p.rect.y - y) < 2)) continue;
            if (evitar.some(e => Math.hypot(e.x - x, e.y - y) < distMin)) continue;
            out.push({ x, y });
        }
        return out;
    }

    criarLicoesEGeiger() {
        this.paineis = []; this.geigerItem = null;
        if (!this.missionData.licoes) { ui.mostrarBotoesGeiger(true); return; }
        const T = CONFIG.TILE_SIZE;
        const ocupados = (this.chavesItens || []).map(k => ({ x: k.tx, y: k.ty }));
        // Geiger: sala 4 (índice 3), longe da chave vermelha
        const livres4 = this.tilesLivresDaSala(3, ocupados, 3);
        const g = livres4.length ? livres4[Math.floor(Math.random() * livres4.length)] : null;
        if (g) { this.criarGeigerItem(g.x, g.y); ocupados.push(g); }
        // Painéis de lição: tile livre mais próximo do alvo, longe das chaves e do Geiger
        for (let i = 0; i < this.mapData.salas.length; i++) {
            // painel junto à parede do fundo (oposta à porta do corredor), no meio da sala: longe do ponto de partida
            const s = this.mapData.salas[i], cx = s.x + s.w / 2, cy = (s.y < this.mapRows / 2) ? s.y + 2.5 : s.y + s.h - 2.5;
            const livres = this.tilesLivresDaSala(i, ocupados, 2).sort((a, b) => Math.hypot(a.x + 0.5 - cx, a.y + 0.5 - cy) - Math.hypot(b.x + 0.5 - cx, b.y + 0.5 - cy));
            const p = livres[0] || { x: Math.floor(cx), y: Math.floor(cy) };
            const c = this.add.container((p.x + 0.5) * T, (p.y + 0.5) * T).setDepth(4);
            const base = this.add.rectangle(0, 2, 22, 16, 0x1a2a3a).setStrokeStyle(2, 0x2fc8e6);
            const tela = this.add.rectangle(0, 0, 18, 10, 0x0b1b28).setStrokeStyle(1, 0x2fc8e6, 0.6);
            const num = this.add.text(0, 0, String(i + 1), { fontSize: '9px', color: '#2fc8e6', fontFamily: 'Orbitron' }).setOrigin(0.5);
            const halo = this.add.circle(0, 0, 17, 0x2fc8e6, 0.18);
            c.add([halo, base, tela, num]);
            c.setSize(40, 36).setInteractive({ useHandCursor: true });
            c.on('pointerdown', () => this.revisarLicao(i));
            this.tweens.add({ targets: halo, scale: { from: 0.85, to: 1.3 }, alpha: { from: 0.28, to: 0.05 }, duration: 1000, yoyo: true, repeat: -1 });
            this.paineis.push({ i, tx: p.x, ty: p.y, obj: c, halo, num, armado: true, ultimoAviso: -1e9 });
            ocupados.push(p);
        }
        ui.mostrarBotoesGeiger(this.temGeiger);
        ui.atualizarInventario(GameState.inventario, this.capacidadeInventario());
    }

    criarGeigerItem(tx, ty) {
        const T = CONFIG.TILE_SIZE;
        const c = this.add.container((tx + 0.5) * T, (ty + 0.5) * T).setDepth(4);
        const halo = this.add.circle(0, 0, 14, 0xffd400, 0.28);
        const corpo = this.add.rectangle(0, 0, 10, 15, 0x2c3e50).setStrokeStyle(1.5, 0xffd400);
        const tela = this.add.rectangle(0, -2, 6, 5, 0x0a1118);
        const luz = this.add.circle(0, -2, 1.8, 0x7CFC00);
        const sonda = this.add.rectangle(7, 2, 8, 3, 0x6b7785);
        c.add([halo, corpo, tela, luz, sonda]);
        this.tweens.add({ targets: halo, scale: { from: 0.8, to: 1.35 }, alpha: { from: 0.35, to: 0.1 }, duration: 900, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: c, y: c.y - 2, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
        this.geigerItem = { tx, ty, obj: c };
    }

    pegarGeiger() {
        if (this.temGeiger) return;
        this.temGeiger = true; GameState.temGeiger = true;
        if (this.geigerItem) { this.geigerItem.obj.destroy(); this.geigerItem = null; }
        GameState.inventario.push({ id: 'geiger', tipo: 'geiger' });
        ui.atualizarInventario(GameState.inventario, this.capacidadeInventario());
        ui.mostrarBotoesGeiger(true);
        if (this.geigerDevice) this.geigerDevice.setVisible(true);
        ui.showNotification(txtAcad(currentLang, 'geigerPegou'), 'success');
        audioManager.playSuccess();
    }

    /** A lição i está liberada? Devolve null (sim) ou a chave do aviso. */
    licaoBloqueadaPor(i) {
        if (i > 0 && !this.licoesFeitas.includes(i - 1)) return 'bloqueadaAnterior';
        if (i === 3 && !this.temGeiger) return 'bloqueadaGeiger';
        return null;
    }

    licoesCompletas() { return !this.missionData.licoes || this.licoesFeitas.length >= LICOES.length; }

    verificarLicoes(time) {
        if (!this.paineis || !this.paineis.length) return;
        const T = CONFIG.TILE_SIZE, px = this.player.x / T, py = this.player.y / T;
        if (this.geigerItem && Math.hypot(this.geigerItem.tx + 0.5 - px, this.geigerItem.ty + 0.5 - py) <= 0.8) this.pegarGeiger();
        for (const p of this.paineis) {
            const d = Math.hypot(p.tx + 0.5 - px, p.ty + 0.5 - py);
            if (d > 2.6) p.armado = true;
            if (d > 1.3 || this.licoesFeitas.includes(p.i)) continue;
            const bloq = this.licaoBloqueadaPor(p.i);
            if (bloq) {
                if (time - p.ultimoAviso > 4000) { p.ultimoAviso = time; ui.showNotification(txtAcad(currentLang, bloq), 'info'); }
                continue;
            }
            if (!p.armado || this.emEncontro) continue;
            p.armado = false;
            this.abrirLicao(p.i);
            return;
        }
    }

    abrirLicao(i) {
        this.emEncontro = true; GameState.modalAberto = true;
        this.licaoAtual = i;
        const sair = () => { this.emEncontro = false; GameState.modalAberto = false; this.licaoAtual = null; };
        this.licaoUI.abrir(i, currentLang, () => {
            sair();
            if (!this.licoesFeitas.includes(i)) this.licoesFeitas.push(i);
            const p = this.paineis.find(q => q.i === i);
            if (p) { p.halo.setFillStyle(0x00ff88, 0.25); p.num.setColor('#00ff88'); }
            ui.showNotification(txtAcad(currentLang, 'concluida') + ' (' + this.licoesFeitas.length + '/' + LICOES.length + ')', 'success');
            audioManager.playSuccess();
            this.tentarConcluirAcademia();
        }, sair);
    }

    /** Fim da Academia: todas as fontes achadas E todas as lições feitas (a ordem entre os dois é livre). */
    tentarConcluirAcademia() {
        if (this.concluindo || this.fim) return;
        if (!this.sources.length || this.foundSources.length !== this.sources.length || !this.licoesCompletas()) return;
        this.concluindo = true;
        this.tempoFinalMs = this.elapsedMs;
        this.time.delayedCall(1500, () => this.concluirComEncontros());
    }

    /** Revisar uma lição já concluída (tecla E perto do painel, ou toque/clique no painel): só o texto, sem quiz. */
    revisarLicao(indice) {
        if (!this.paineis || !this.paineis.length || this.bloqueado()) return;
        const T = CONFIG.TILE_SIZE, px = this.player.x / T, py = this.player.y / T;
        let alvo = null, melhor = 1e9;
        for (const p of this.paineis) {
            if (!this.licoesFeitas.includes(p.i) || (indice !== undefined && p.i !== indice)) continue;
            const d = Math.hypot(p.tx + 0.5 - px, p.ty + 0.5 - py);
            if (d <= 2.2 && d < melhor) { melhor = d; alvo = p; }
        }
        if (!alvo) return;
        this.emEncontro = true; GameState.modalAberto = true;
        const sair = () => { this.emEncontro = false; GameState.modalAberto = false; };
        this.licaoUI.abrir(alvo.i, currentLang, sair, sair, { revisao: true });
    }

    /** Tutorial "Primeiros passos": objetivo no HUD (sem seta). */
    atualizarObjetivoTutorial(time) {
        if (!this.missionData.tutorial || time - this.objT < 300) return;
        this.objT = time;
        const o = objetivoTutorial({ geigerLigado: !!this.geigerActive, achadas: this.foundSources.length, total: this.sources.length }, currentLang);
        ui.setProximo(o.progresso, o.proximo);
    }

    /** Tutorial: lição de um parágrafo e uma pergunta ao identificar a n-ésima fonte; `depois()` roda ao fechar. */
    tutorialBloco(n, depois) {
        const licao = BLOCOS_TUTORIAL[n - 1];
        if (!licao) { depois(); return; }
        this.emEncontro = true; GameState.modalAberto = true;
        const sair = () => { this.emEncontro = false; GameState.modalAberto = false; depois(); };
        this.licaoUI.abrir(n - 1, currentLang, sair, sair, { licao });
    }

    /** Próximo objetivo da Academia: texto no HUD e mapa de distâncias para a seta de caminho. */
    atualizarObjetivo(time) {
        if (!this.missionData.licoes || !this.paineis || time - this.objT < 300) return;
        this.objT = time;
        const T = CONFIG.TILE_SIZE, salas = this.mapData.salas;
        const centro = (r) => ({ x: Math.floor(r.x + r.w / 2) + 0.5, y: Math.floor(r.y + r.h / 2) + 0.5 });
        const tem = (cor) => GameState.inventario.some(it => it.cor === cor);
        const porta = (cor) => this.portasEstado.find(p => p.cor === cor);
        const chavePos = {};
        for (const cor of ['azul', 'vermelha']) { const k = this.chavesItens.find(c => c.cor === cor); chavePos[cor] = k ? { x: k.tx + 0.5, y: k.ty + 0.5 } : null; }
        const portaPos = {};
        for (const cor of ['azul', 'vermelha']) { const p = porta(cor); if (p) portaPos[cor] = { x: p.rect.x + p.rect.w / 2, y: p.rect.y + p.rect.h / 2 }; }
        const restantes = this.sources.filter(s => !s.found).map(s => s.sala).filter(v => v !== undefined).sort((a, b) => a - b);
        const obj = proximoObjetivo({
            licoes: this.licoesFeitas, temGeiger: this.temGeiger,
            tenho: { azul: tem('azul'), vermelha: tem('vermelha') },
            portaAberta: { azul: !!porta('azul')?.aberta, vermelha: !!porta('vermelha')?.aberta },
            chavePos, portaPos, geigerPos: this.geigerItem ? { x: this.geigerItem.tx + 0.5, y: this.geigerItem.ty + 0.5 } : null,
            painel: this.paineis.map(p => ({ x: p.tx + 0.5, y: p.ty + 0.5 })), salaCentro: salas.map(centro),
            salasComFonteRestante: restantes, achadas: this.foundSources.length, total: this.sources.length,
        });
        const L = OBJ_TXT[currentLang] || OBJ_TXT.en;
        const nomeCor = obj.cor ? t(obj.cor === 'azul' ? 'corAzul' : 'corVermelha') : '';
        ui.setProximo(L.progresso(this.licoesFeitas.length, this.foundSources.length, this.sources.length), `${L.rotulo}: ${L[obj.id](obj, nomeCor)}`);
        this.objAtual = obj;
        const chave = obj.alvo ? `${obj.id}|${obj.alvo.x}|${obj.alvo.y}` : null;
        if (chave !== this.objChave) {
            this.objChave = chave;
            this.mdObj = obj.alvo ? mapaDeDistancias(this.mapData.map, new Set(this.blockedTiles.filter(b => this.mapData.map[b.y][b.x] !== 3).map(b => b.x + ',' + b.y)), obj.alvo) : null;
        }
    }

    /** Seta ao redor do jogador apontando o próximo passo do caminho até o objetivo (só com as dicas ligadas). */
    desenharSeta(time) {
        if (!this.missionData.licoes) return;
        if (!this.seta) this.seta = this.add.graphics().setDepth(18);
        const g = this.seta;
        g.clear();
        const obj = this.objAtual;
        if (!obj || !obj.alvo || !this.mdObj || !GameState.settings.showHints || this.concluindo || GameState.modalAberto) return;
        const T = CONFIG.TILE_SIZE, px = this.player.x / T, py = this.player.y / T;
        const dEuclid = Math.hypot(obj.alvo.x - px, obj.alvo.y - py);
        if (dEuclid < 3) return;
        const ponto = pontoAdiante(this.mdObj, px, py, 4) || obj.alvo;
        const ang = Math.atan2(ponto.y - py, ponto.x - px);
        const r = 30 + 3 * Math.sin(time / 180);
        const cx = this.player.x + Math.cos(ang) * r, cy = this.player.y + Math.sin(ang) * r;
        g.fillStyle(0xffd400, 0.9).lineStyle(2, 0x16202e, 0.9);
        g.beginPath();
        g.moveTo(cx + Math.cos(ang) * 9, cy + Math.sin(ang) * 9);
        g.lineTo(cx + Math.cos(ang + 2.5) * 8, cy + Math.sin(ang + 2.5) * 8);
        g.lineTo(cx + Math.cos(ang - 2.5) * 8, cy + Math.sin(ang - 2.5) * 8);
        g.closePath(); g.fillPath(); g.strokePath();
    }

    handleIdentify() {
        if (this.bloqueado()) return;
        // Com o Geiger desligado ou sem sinal na janela de contagem, não há o que identificar
        const threshold = CONFIG.BG_RADIATION * 2;
        if (this.currentReading <= threshold) {
            ui.showNotification(t('lowSignal'), 'error');
            return;
        }
        
        // Fonte mais próxima ao alcance: distância até a SUPERFÍCIE do móvel (móveis grandes
        // como o núcleo 3x3 de Chernobyl e Fukushima não podem exigir proximidade do centro)
        const T = CONFIG.TILE_SIZE;
        const px = this.player.x / T;
        const py = this.player.y / T;
        
        let nearestSource = null;
        let nearestDist = Infinity;
        
        this.sources.forEach(source => {
            if (source.found) return;
            
            const rect = this.rectDoMovel(source.furniture);
            const dist = distanciaAoRetangulo(rect, px, py);
            
            if (dist <= CONFIG.IDENTIFY_DISTANCE && dist < nearestDist) {
                // O móvel precisa estar à frente (cone de aceitação do detector)
                const p = pontoMaisProximo(rect, px, py);
                const angle = Math.atan2(p.y - py, p.x - px);
                const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - this.playerDirection));
                if (dist < 0.05 || angleDiff <= CONFIG.VISION_ANGLE / 2) {
                    nearestDist = dist;
                    nearestSource = source;
                }
            }
        });
        
        if (!nearestSource) {
            ui.showNotification(t('tooFar'), 'error');
            return;
        }
        
        this.selectedFurniture = nearestSource.furniture;
        
        // Lista fixa de candidatos da missão, sem nomes repetidos (js/data/candidatos.js); o rótulo do tipo sai no idioma do jogo
        const possibleIsotopes = candidatosDaMissao(this.sources, this.missionData.candidatosExtras, [...ISOTOPES, ...(this.missionData.addIsotope ? [this.missionData.addIsotope] : [])])
            .map(s => ({ name: s.name, type: s.type, symbol: s.symbol, rotulo: rotuloDoCandidato(s, currentLang) }));
        
        const ev = this.evidencia;
        ui.showIdentifyModal(possibleIsotopes, (selected) => {
            this.tryIdentify(selected);
        }, {
            semPlaca: ev.semPlaca, placas: ev.placas.size,
            aoPedirDados: () => this.pedirMaisDados(),
            espectro: this.temEspectrometro() ? () => this.usarEspectrometro() : null,
        });
    }
    
    tryIdentify(selected) {
        if (this.concluindo || this.fim) return;
        if (!this.selectedFurniture || !this.selectedFurniture.source) return;
        
        const source = this.selectedFurniture.source;
        GameState.attempts++;
        
        if (selected.name === source.name) {
            // Correct!
            GameState.correct++;
            GameState.combo++;
            if (GameState.combo > GameState.maxCombo) {
                GameState.maxCombo = GameState.combo;
            }
            
            const points = 100 * GameState.combo;
            GameState.score += points;
            
            source.found = true;
            this.foundSources.push(source);
            const ultima = this.foundSources.length === this.sources.length && this.licoesCompletas();
            if (ultima) this.concluindo = true;   // congela o relógio e o movimento
            
            // Show educational info about the isotope found FIRST
            const eduInfo = this.getIsotopeEducationalInfo(source);
            // Nota de campo sobre o caso real (etapa 4): 1ª a 4ª fonte achada, depois recomeça
            const idxNota = ((this.foundSources.length - 1) % 4) + 1;
            const chaveNota = `fact${this.missionData.id}_${idxNota}`;
            const nota = t(chaveNota) !== chaveNota ? '\n\n📰 ' + t('fieldNote') + ': ' + t(chaveNota) : '';
            const emissoes = descreverEmissoes(source, currentLang);
            const linhaEmissoes = emissoes ? '\n\n☢️ ' + t('emissionsLabel') + ': ' + emissoes : '';
            const semComparacao = !(this.evidencia.semPlaca && this.evidencia.placas.size > 0);
            const notaMetodo = semComparacao ? '\n\n🔬 ' + t('methodNote') : '';
            this.evidencia = { semPlaca: false, placas: new Set() };   // próxima fonte, nova investigação
            ui.showIdentifyFeedback(true, '✅ ' + t('correctIsotope') + '\n\n📚 ' + eduInfo + linhaEmissoes + nota + notaMetodo);
            ui.showNotification(t('correctIsotope'), 'success');
            
            // Visual feedback (wrapped in try-catch in case sprite doesn't exist)
            try {
                this.createParticleEffect(
                    this.selectedFurniture.centerX,
                    this.selectedFurniture.centerY,
                    parseInt(source.color.replace('#', '0x'))
                );
                
                // Update furniture appearance
                if (this.selectedFurniture.sprite && this.selectedFurniture.sprite.setFillStyle) {
                    this.selectedFurniture.sprite.setFillStyle(0x00ff88, 0.3);
                    this.selectedFurniture.sprite.setStrokeStyle(2, 0x00ff88);
                }
                
                // Add source label
                const label = this.add.text(
                    this.selectedFurniture.centerX,
                    this.selectedFurniture.centerY - 20,
                    source.name,
                    { fontSize: '12px', color: '#00ff88', fontFamily: 'Orbitron' }
                );
                label.setOrigin(0.5);
                label.setDepth(15);
            } catch (e) {
                console.warn('Visual feedback error:', e);
            }
            
            audioManager.playSuccess();
            
            ui.updateCombo(GameState.combo);
            ui.updateScore(GameState.score);
            ui.updateSourcesTracker(this.sources, this.foundSources);
            this.selectedFurniture = null;
            
            // Fecha a identificação uma única vez: pelo botão "OK" ou, se o jogador não clicar, pelo temporizador
            // (os temporizadores pertencem à cena: somem junto com ela se o jogador sair antes)
            let fechada = false;
            const fechar = () => {
                if (fechada) return;
                fechada = true;
                this.fecharIdentificacao = null;
                ui.hideModal('identify');
                if (this.missionData.tutorial) this.tutorialBloco(this.foundSources.length, () => { if (ultima) this.concluirComEncontros(); });
                else if (ultima) this.concluirComEncontros();
                else if (this.foundSources.length === this.sources.length) {
                    ui.showNotification(txtAcad(currentLang, 'faltamLicoes'), 'info');
                    this.tentarConcluirAcademia();
                }
            };
            this.fecharIdentificacao = fechar;
            if (ultima) this.tempoFinalMs = this.elapsedMs;
            this.time.delayedCall(ultima ? 9000 : 8000, fechar);
        } else {
            // Wrong: perde o combo, mantém a fonte selecionada e devolve os botões depois de ler a dica
            GameState.combo = 1;
            
            // Dica pelo TIPO real da fonte (só quando o jogador ligou as dicas)
            let hint = '';
            if (GameState.settings.showHints) {
                if (componentesDe(source).length > 1) hint = t('betaGammaHint').replace('{0}', nomesDasComponentes(source, currentLang));
                else if (source.type === 'alfa') hint = t('alphaHint');
                else if (source.type === 'beta') hint = t('betaHint');
                else hint = t('gammaHint');
            }
            
            audioManager.playError();
            if (GameState.settings.screenShake) this.cameras.main.shake(200, 0.004);
            ui.marcarTentativa(selected.name);
            const doseErro = this.doseDoErroDeIdentificacao();
            const txtDose = doseErro > 0 ? '\n☢ ' + t('wrongIdDose').replace('{0}', String(doseErro).replace('.', currentLang === 'pt' ? ',' : '.')) : '';
            ui.showIdentifyFeedback(false, t('wrongIsotope') + txtDose + (hint ? '\n💡 ' + hint : ''));
            ui.showNotification(t('wrongIsotope'), 'error');
            ui.updateCombo(1);
            this.time.delayedCall(hint ? 3500 : 1800, () => ui.liberarEscolhas());
        }
    }
    
    /** Missão de campo (ou chamado rápido) aberta pela Agência com equipe a bordo. */
    emCampoAgencia() {
        const a = ui.origem === 'agencia' && ui.agencia && ui.agencia.equipeSaida && ui.agencia.alvo;
        return !!a && ((a.tipo === 'missao' && a.missaoId > 1) || a.tipo === 'rapida');
    }
    /** v3.29: modo Agência com o espectrômetro gama fabricado na Oficina (inventário `est.equipamentos`). */
    temEspectrometro() {
        const a = ui.origem === 'agencia' && ui.agencia && ui.agencia.est;
        return !!a && (a.equipamentos.espectrometro || 0) > 0 && this.emCampoAgencia();
    }
    /** Lê as linhas gama da fonte à frente (dados LNHB); conta como leitura com sinal, como uma placa. */
    usarEspectrometro() {
        const f = this.selectedFurniture, s = f && f.source; if (!s) return '';
        this.evidencia.espectro = true;
        const lin = linhasGamaTexto(s, currentLang);
        return lin === null ? t('spectroNoData') : (lin === '' ? t('spectroNoGamma') : t('spectroGamma').replace('{0}', lin));
    }
    /** v3.29: identificar errado custa dose ao cientista que está à frente (só em missão de campo da Agência). */
    doseDoErroDeIdentificacao() {
        if (!this.emCampoAgencia()) return 0;
        const d = DOSE.erroIdMsv;
        ui.agencia.registrarDoseCampo(d); GameState.doseMissao = (GameState.doseMissao || 0) + d;
        ui.atualizarCaneta(ui.agencia.penDoLider(ui.agencia.doseDoAtivo()));
        return d;
    }

    /** "Ainda não dá para concluir": não conta como tentativa nem tira pontos; orienta conforme a evidência já reunida. */
    pedirMaisDados() {
        const ev = this.evidencia;
        const temComparacao = ev.semPlaca && ev.placas.size > 0;
        this.pedidosDeDados++;
        ui.hideModal('identify');
        this.cancelIdentify();
        ui.showNotification(t(temComparacao ? 'moreDataEnough' : 'moreDataMissing'), 'info');
    }

    cancelIdentify() {
        this.selectedFurniture = null;
        if (this.fecharIdentificacao) this.fecharIdentificacao();
    }
    
    getIsotopeEducationalInfo(source) {
        const eduData = {
            'U-238': {
                en: 'Uranium-238: Most common uranium isotope (99.3%). Half-life: 4.5 billion years. Used in nuclear fuel and dating very old rocks.',
                pt: 'Urânio-238: Isótopo de urânio mais comum (99,3%). Meia-vida: 4,5 bilhões de anos. Usado em combustível nuclear e datação de rochas antigas.'
            },
            'Am-241': {
                en: 'Americium-241: Found in smoke detectors! Half-life: 432 years. Alpha emitter - safe inside detector housing.',
                pt: 'Amerício-241: Encontrado em detectores de fumaça! Meia-vida: 432 anos. Emissor alfa - seguro dentro do detector.'
            },
            'Po-210': {
                en: 'Polonium-210: element discovered by Marie and Pierre Curie (1898). Half-life: 138 days. Extremely toxic if ingested. Used in anti-static devices.',
                pt: 'Polônio-210: elemento descoberto por Marie e Pierre Curie (1898). Meia-vida: 138 dias. Extremamente tóxico se ingerido. Usado em dispositivos antiestáticos.'
            },
            'Ra-226': {
                en: 'Radium-226: The "Radium Girls" painted watch dials with radium paint. Half-life: 1,600 years. Deposits in bones like calcium.',
                pt: 'Rádio-226: As "Radium Girls" pintavam mostradores com tinta de rádio. Meia-vida: 1.600 anos. Deposita-se nos ossos como cálcio.'
            },
            'Sr-90': {
                en: 'Strontium-90: Fission product from reactors. Half-life: 29 years. "Bone seeker" - mimics calcium. Used in RTGs for heat.',
                pt: 'Estrôncio-90: Produto de fissão de reatores. Meia-vida: 29 anos. "Buscador de ossos" - imita cálcio. Usado em RTGs para calor.'
            },
            'P-32': {
                en: 'Phosphorus-32: Used in molecular biology. Half-life: 14 days. Beta emitter for labeling DNA/RNA.',
                pt: 'Fósforo-32: Usado em biologia molecular. Meia-vida: 14 dias. Emissor beta para marcação de DNA/RNA.'
            },
            'I-131': {
                en: 'Iodine-131: Major concern after nuclear accidents (Chernobyl). Half-life: 8 days. Concentrates in thyroid gland.',
                pt: 'Iodo-131: Grande preocupação após acidentes nucleares (Chernobyl). Meia-vida: 8 dias. Concentra-se na tireoide.'
            },
            'Tc-99m': {
                en: 'Technetium-99m: Most used medical isotope! Half-life: 6 hours. One of the most used isotopes in diagnostic nuclear medicine.',
                pt: 'Tecnécio-99m: Isótopo médico mais usado! Meia-vida: 6 horas. Um dos mais usados em medicina nuclear diagnóstica.'
            },
            'Cs-137': {
                en: 'Cesium-137: at the centre of the Goiânia accident (1987). Half-life: 30 years. Decays by beta emission; the gamma ray comes from its daughter Ba-137m.',
                pt: 'Césio-137: esteve no centro do acidente de Goiânia (1987). Meia-vida: 30 anos. Decai por emissão beta; o raio gama vem do filho Ba-137m.'
            },
            'Ir-192': {
                en: 'Iridium-192: Used in industrial radiography. Half-life: 74 days. Very high activity - requires heavy shielding.',
                pt: 'Irídio-192: Usado em radiografia industrial. Meia-vida: 74 dias. Atividade muito alta - requer blindagem pesada.'
            },
            'Co-60': {
                en: 'Cobalt-60: Used for sterilization and cancer therapy. Half-life: 5.3 years. Two gamma rays at 1.17 and 1.33 MeV.',
                pt: 'Cobalto-60: Usado para esterilização e terapia de câncer. Meia-vida: 5,3 anos. Dois raios gama em 1,17 e 1,33 MeV.'
            }
        };
        
        const data = eduData[source.name];
        if (data) {
            return data[currentLang] || data['en'];
        }
        return `${source.name}: ${source.symbol} emitter`;
    }
    
    completeMission() {
        if (this.fim) return;
        this.fim = true;
        const elapsed = (this.tempoFinalMs ?? this.elapsedMs) / 1000;
        const meta = this.metaTempoS;   // timeLimit da missão é meta de tempo (não derrota)
        const accuracy = GameState.attempts > 0 
            ? Math.round((GameState.correct / GameState.attempts) * 100) 
            : 100;
        const dentroDaMeta = elapsed <= meta;
        
        // Estrelas: 3 = precisão >= 80% dentro da meta de tempo; 2 = precisão >= 60%; 1 = concluiu
        let stars = 1;
        if (accuracy >= 80 && dentroDaMeta) stars = 3;
        else if (accuracy >= 60) stars = 2;
        
        // Bônus de tempo: 2 pontos por segundo abaixo da meta
        const timeBonus = Math.max(0, meta - elapsed) * 2;
        const finalScore = GameState.score + Math.round(timeBonus);
        
        // Aproveitamento (0-100%): fontes 55% + tempo 20% + encontros 15% + cofre 10%; sem encontros nem cofre o teto é 75%
        const aprov = aproveitamento({
            precisao: GameState.attempts > 0 ? GameState.correct / GameState.attempts : 1,
            tempo: elapsed, meta, creditos: this.encontros.creditos, cofre: this.encontros.cofreCreditos, encontrosAtivos: this.encontros.ativo, semTempo: modoEstudo(), dicas: this.dica.usos,
        });
        
        // Desbloqueia a próxima missão, guarda as estrelas e grava no armazenamento
        registrarConclusao(this.missionData.id, stars);
        
        ui.showCompleteModal({
            time: elapsed,
            accuracy: accuracy,
            score: finalScore,
            stars: stars,
            jornal: { id: this.missionData.tutorial ? 'tutorial' : (this.missionData.rapida ? null : this.missionData.id), titulo: this.missionData.titulo || t(this.missionData.titleKey) },
            fontes: { n: GameState.fontesColeta || this.foundSources.length, total: this.sources.length },
            aproveitamento: aprov,
            message: this.getCompletionMessage(accuracy, elapsed) + '\n' +
                `${t('timeGoal')}: ${Math.floor(meta / 60)}:${String(meta % 60).padStart(2, '0')} · ` +
                (dentroDaMeta ? t('timeGoalMet') : t('timeGoalMissed')) +
                (this.assistenciaAlfa ? ' · ' + t('assistAlfaFim') : ''),
        });
        
        // Achievement check
        if (accuracy === 100 && GameState.attempts === this.sources.length) {
            ui.showAchievement(t('perfectHunter'));
        }
    }
    
    getCompletionMessage(accuracy, time) {
        if (accuracy >= 95 && time < 60) return t('completeExceptional');
        if (accuracy >= 80) return t('completeGreat');
        if (accuracy >= 60) return t('completeGood');
        return t('completeBase');
    }
    
    /** Balão "?" sobre o jogador por meio segundo (aviso de encontro, ao estilo Zelda) */
    mostrarBalao() {
        try {
            const b = this.add.text(this.player.x, this.player.y - 34, '?', { fontSize: '28px', color: '#ffffff', fontFamily: 'Orbitron', stroke: '#00ff88', strokeThickness: 4 });
            b.setOrigin(0.5).setDepth(40);
            const reduz = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduz) setTimeout(() => b.destroy(), 450);
            else this.tweens.add({ targets: b, y: b.y - 10, duration: 450, onComplete: () => b.destroy() });
            audioManager.playSuccess();
        } catch (e) { /* sem balão: segue */ }
        return new Promise((ok) => setTimeout(ok, 480));
    }
    
    /** Última fonte achada: apresenta os encontros que faltam e só então abre a tela de conclusão */
    async concluirComEncontros() {
        if (!this.missionData.tutorial) {   // o tutorial curto não tem encontros nem cofre: vai direto ao balanço
            await this.encontros.concluirRestantes();
            if (this.encontros.cancelado || this.fim) return;
            await this.encontros.cofre();
            if (this.encontros.cancelado || this.fim) return;
        }
        if (this.precisaColeta()) { this.iniciarColeta(); return; }
        this.completeMission();
    }

    get levantado() { const a = ui.origem === 'agencia' && ui.agencia.alvo; return !!a && a.tipo === 'missao' && foiLevantado(ui.agencia.est, a.id); }

    /** Modo Agência, missões de campo (não o treinamento): depois de achar e organizar as fontes, é preciso levá-las ao ponto de coleta. */
    precisaColeta() {
        const a = ui.origem === 'agencia' && ui.agencia.equipeSaida && ui.agencia.alvo;
        return !!a && ((a.tipo === 'missao' && a.missaoId > 1) || a.tipo === 'rapida') && this.foundSources.length > 0;
    }
    iniciarColeta() {
        const T = CONFIG.TILE_SIZE, p = this.mapData.playerStart, pt = currentLang === 'pt';
        this.faseColeta = true; this.concluindo = false;
        this.pontoColeta = { x: p.x + 0.5, y: p.y + 0.5 };
        const g = this.add.graphics().setDepth(7); this.marcaColeta = g;
        g.lineStyle(3, 0x00ff88, 0.9); g.strokeCircle(this.pontoColeta.x * T, this.pontoColeta.y * T, T * 0.9);
        g.fillStyle(0x00ff88, 0.18); g.fillCircle(this.pontoColeta.x * T, this.pontoColeta.y * T, T * 0.9);
        this.add.text(this.pontoColeta.x * T, this.pontoColeta.y * T, 'H', { fontFamily: 'monospace', fontSize: Math.round(T * 0.9) + 'px', color: '#00ff88' }).setOrigin(0.5).setDepth(8);
        ui.setProximo(pt ? 'Fontes organizadas' : 'Sources organized', pt ? 'Próximo: leve as fontes ao ponto de coleta (H), onde a nave de resgate vai buscá-las' : 'Next: take the sources to the pickup point (H), where the rescue ship will collect them');
        ui.showNotification(pt ? 'Fontes organizadas. Leve-as ao ponto de coleta (H).' : 'Sources organized. Take them to the pickup point (H).', 'success');
    }
    verificarColeta() {
        if (!this.faseColeta || this.fim || GameState.modalAberto) return;
        const T = CONFIG.TILE_SIZE;
        if (Math.hypot(this.pontoColeta.x - this.player.x / T, this.pontoColeta.y - this.player.y / T) > 1.4) return;
        this.faseColeta = false;
        GameState.fontesColeta = this.foundSources.length;
        GameState.isotoposColeta = this.foundSources.map((s) => s.name);
        this.completeMission();
    }
    
    /** Pausa só por sinalizador: scene.pause()/resume() são assíncronos e deixavam o estado inconsistente */
    pauseGame() {
        if (GameState.paused || this.fim || this.emEncontro) return;
        GameState.paused = true;
        ui.showModal('pause');
    }
    
    resumeGame() {
        GameState.paused = false;
    }
    
    restartMission() {
        this.encontros.cancelar();
        if (this.licaoUI) this.licaoUI.fechar();
        GameState.modalAberto = false;
        GameState.paused = false;
        GameState.modalAberto = false;
        ui.hideAllModals();
        this.scene.restart({ mission: this.missionData });
    }
    
    quitToMenu() {
        this.encontros.cancelar();
        if (this.licaoUI) this.licaoUI.fechar();
        GameState.paused = false;
        GameState.modalAberto = false;
        this.fim = true;
        ui.hideAllModals();
        ui.encerrarJogo();
        ui.voltarDaMissao();
    }
}
