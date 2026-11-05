// ============================================
// Tela de investigação (DOM). Não conhece o jogo Phaser: recebe a investigação, devolve via aoSair().
// Cada cena: texto, esquema (quando houver), pergunta com retorno por alternativa, observação para os revisores.
// ============================================
import { htmlFimJornal } from '../jornal/jornal.js';
import { reportagemInvestigacao } from '../jornal/reportagens.js';
import { criarAtividade } from './atividades.js';
import { retratoSvg, NOMES } from './retratos.js';
import { LICOES_EXTRA } from '../academia/licoes-extra.js';
import { GameState } from '../estado.js';
import { criarSessao, registrarObservacao, observacoesCompletas, avaliarOpcao, avaliarCartoes, registrarHipotese, montarFicha, resolver, embaralhar, limparRotulos } from './motor.js';

const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };

const CHAVE_NOTAS = 'radiationHuntersRevisao';
function lerNotas(id, cenas) {
    try {
        const o = JSON.parse(localStorage.getItem(CHAVE_NOTAS) || '{}'), n = o && o[id];
        const ids = new Set(cenas.map((c) => c.id));
        return n && typeof n === 'object' && !Array.isArray(n)
            ? Object.fromEntries(Object.entries(n).filter(([k, v]) => ids.has(k) && typeof v === 'string')) : {};
    } catch (e) { return {}; }
}
function gravarNotas(id, notas) {
    try { const salvo = JSON.parse(localStorage.getItem(CHAVE_NOTAS) || '{}'); const o = salvo && typeof salvo === 'object' && !Array.isArray(salvo) ? salvo : {}; o[id] = notas; localStorage.setItem(CHAVE_NOTAS, JSON.stringify(o)); } catch (e) { /* armazenamento bloqueado: segue só em memória */ }
}

export const TX = {
    pt: {
        cena: 'Cena {i} de {n}', continuar: 'Continuar →', voltar: '← Voltar', sair: 'Sair', observacao: 'Observação para os revisores (opcional)',
        obsDica: 'Algo errado, confuso ou faltando nesta cena? Escreva aqui; vai no registro exportado.', verificar: 'Verificar', ligar: 'Iniciar emissão (modelo)', desligar: 'Interromper emissão (modelo)',
        faltou: 'Faltou marcar esta, que está correta:', ficha: 'Ficha da investigação', hipotese: 'Hipótese inicial', evidencias: 'Evidências escolhidas', decisao: 'Decisão (mensagem do cartaz)',
        revisao: 'Revisão', limite: 'Limite: o que ficou com a equipe', baixar: 'Baixar registro (.json)', copiar: 'Copiar resumo', copiado: 'Resumo copiado.', menu: 'Voltar ao menu', base: 'Voltar à Base', cadernoCompleto: 'Ver o caderno completo', paraProfessores: 'Para professores e revisores',
        rev: { 'em-andamento': 'Investigação em andamento: este caderno ainda não tem conclusão.', 'confirmada': 'Sua hipótese inicial é compatível com a resposta final registrada.', 'revisada': 'A resposta final registrada difere da hipótese inicial. O histórico mostra as tentativas e os retornos recebidos.', 'partiu-do-nao-sei': 'Você partiu de "ainda não sei" e chegou a uma explicação com evidências.', 'sem-hipotese': 'Sem hipótese inicial registrada.' },
        hipoteseGuardada: 'Esta é a hipótese registrada antes da investigação. Ela foi preservada para a comparação final.', fontes: 'Fontes e rótulos', fontesSo: 'Fontes', ligado: 'LIGADO', desligado: 'DESLIGADO', tubo: 'Tubo de raios X', paciente: 'Paciente', detector: 'Detector', frasco: 'Frasco com material radioativo (outro contexto)', semBotao: 'sem botão de ligar/desligar',
        equip: 'Equipamento de raios X', feixe: 'feixe de raios X', semFeixe: 'sem feixe', recepcao: 'Recepção do hospital (fictício)', sempre: 'emite o tempo todo',
        passos: 'Passos', verPonto: '✓', verErro: '✗', evidencia: 'Evidência', marque: 'Marque as frases corretas',
        testeBanner: 'VERSÃO DE TESTE', modoRevisao: 'MODO DE REVISÃO', baixarObs: 'Baixar observações', diretorio: 'Investigação',
    },
    en: {
        cena: 'Scene {i} of {n}', continuar: 'Continue →', voltar: '← Back', sair: 'Exit', observacao: 'Note for reviewers (optional)',
        obsDica: 'Anything wrong, confusing or missing in this scene? Write it here; it goes into the exported record.', verificar: 'Check', ligar: 'Start emission (model)', desligar: 'Stop emission (model)',
        faltou: 'You missed this one, which is correct:', ficha: 'Investigation record', hipotese: 'First hypothesis', evidencias: 'Evidence chosen', decisao: 'Decision (poster message)',
        revisao: 'Review', limite: 'Limit: what stays with the team', baixar: 'Download record (.json)', copiar: 'Copy summary', copiado: 'Summary copied.', menu: 'Back to menu', base: 'Back to Base', cadernoCompleto: 'See the full notebook', paraProfessores: 'For teachers and reviewers',
        rev: { 'em-andamento': 'Investigation in progress: this notebook has no final conclusion yet.', 'confirmada': 'Your first hypothesis is consistent with the final recorded answer.', 'revisada': 'The final recorded answer differs from your first hypothesis. The history shows the attempts and feedback received.', 'partiu-do-nao-sei': 'You started from "I do not know yet" and reached an explanation backed by evidence.', 'sem-hipotese': 'No first hypothesis recorded.' },
        hipoteseGuardada: 'This is the hypothesis recorded before investigating. It has been preserved for the final comparison.', fontes: 'Sources and labels', fontesSo: 'Sources', ligado: 'ON', desligado: 'OFF', tubo: 'X-ray tube', paciente: 'Patient', detector: 'Detector', frasco: 'Vial with radioactive material (another context)', semBotao: 'no on/off switch',
        equip: 'X-ray equipment', feixe: 'X-ray beam', semFeixe: 'no beam', recepcao: 'Hospital reception (fictional)', sempre: 'emits all the time',
        passos: 'Steps', verPonto: '✓', verErro: '✗', evidencia: 'Evidence', marque: 'Tick the correct sentences',
        testeBanner: 'TEST VERSION', modoRevisao: 'REVIEW MODE', baixarObs: 'Download notes', diretorio: 'Investigation',
    },
};

/** Esquema do equipamento: feixe só quando `ligado`. */
function esquemaEquipamento(tx, ligado, rotulos = true) {
    const feixe = ligado ? '<polygon points="150,52 190,52 230,140 110,140" fill="#ffd400" opacity="0.35"/><line x1="170" y1="52" x2="170" y2="190" stroke="#ffd400" stroke-width="3" stroke-dasharray="6 4"/>' : '';
    return `<svg viewBox="0 0 340 230" role="img" aria-label="${tx.equip}: ${ligado ? tx.ligado + ". " + tx.tubo + " → " + tx.paciente + " → " + tx.detector : tx.desligado + ". " + tx.semFeixe}" class="inv-svg">
        <rect x="120" y="14" width="100" height="38" rx="6" fill="#33405c" stroke="#7aa2ff"/>
        ${rotulos ? `<text x="170" y="38" text-anchor="middle" font-size="12" fill="#e8ecff">${tx.tubo}</text>` : ''}
        ${feixe}
        <ellipse cx="170" cy="140" rx="48" ry="26" fill="#6b4f45" stroke="#d9a58f"/>
        ${rotulos ? `<text x="170" y="144" text-anchor="middle" font-size="12" fill="#fff">${tx.paciente}</text>` : ''}
        <rect x="110" y="188" width="120" height="22" rx="4" fill="#33405c" stroke="#7aa2ff"/>
        ${rotulos ? `<text x="170" y="203" text-anchor="middle" font-size="12" fill="#e8ecff">${tx.detector}</text>` : ''}
        <text x="300" y="30" text-anchor="end" font-size="12" fill="${ligado ? '#ffd400' : '#9aa3b2'}">${ligado ? tx.ligado : tx.desligado}</text>
    </svg>`;
}

/** Com uma tela de leitura por cima do mapa, o Phaser não pode capturar teclas (W, A, S, D e espaço faziam o navegador
 *  descartar essas letras ao digitar em campos de texto, como as observações do modo revisão). */
export function travarTeclasDoJogo(travar){
    const kb=window.gameScene?.input?.keyboard;if(!kb)return;
    kb.resetKeys();kb.enabled=!travar;
    if(travar)kb.disableGlobalCapture();else kb.enableGlobalCapture();
}

export class InvestigacaoUI {
    /** `tela` é o elemento .screen já existente no HTML. */
    constructor(tela) {
        this.tela=tela;this.corpo=el('div','inv-corpo');tela.replaceChildren(this.corpo);
        tela.addEventListener('keydown',(e)=>{
            if(!this.emCampo||!tela.classList.contains('active'))return;
            if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.fecharCampo();return;}
            if(e.key!=='Tab')return;
            const bs=[...tela.querySelectorAll('button:not(:disabled),textarea,summary,a[href]')].filter(b=>b.getClientRects().length),a=bs[0],z=bs[bs.length-1];
            if(e.shiftKey&&(document.activeElement===a||!bs.includes(document.activeElement))){e.preventDefault();z?.focus();}
            else if(!e.shiftKey&&(document.activeElement===z||!bs.includes(document.activeElement))){e.preventDefault();a?.focus();}
        });
    }

    /** opcoes.revisao: modo de revisão (Configurações). Desligado: sem observações, sem rótulos de fonte e sem avisos de versão. */
    abrir(investigacao, lang, aoSair, opcoes = {}) {
        this.emCampo=opcoes.emCampo===true;
        this.tela.classList.toggle('inv-em-campo',this.emCampo);
        if(!this.emCampo){this.tela.removeAttribute('role');this.tela.removeAttribute('aria-modal');}
        this.lang = lang === 'pt' ? 'pt' : 'en';
        this.tx = TX[this.lang];
        this.revisao = opcoes.revisao === true;
        this.base = opcoes.base === true; this.corpo.classList.remove('inv-fim-jornal');
        const resolvida = resolver(investigacao, this.lang);
        this.inv = this.revisao ? resolvida : limparRotulos(resolvida);
        this.invOriginal = investigacao;
        this.sessao = criarSessao(investigacao);
        this.ficha = null;
        if (this.revisao) this.sessao.notas = lerNotas(investigacao.id, investigacao.cenas);
        this.aoSair = aoSair;
        this.ligado = false;
        this.cena();
    }

    proximaCenaCampo(){const i=this.cenas.findIndex(c=>!this.sessao.concluidas[c.id]);return i<0?this.cenas.length:i;}
    abrirCampo(){
        this.emCampo=true;this.tela.classList.add('inv-em-campo','active');this.tela.setAttribute('role','dialog');this.tela.setAttribute('aria-modal','true');
        GameState.modalAberto=true;GameState.virtual={};GameState.virtualVec=null;
        document.getElementById('game-screen').inert=true;
        travarTeclasDoJogo(true);
    }
    fecharCampo(){
        this.tela.classList.remove('active');GameState.modalAberto=false;
        document.getElementById('game-screen').inert=false;
        travarTeclasDoJogo(false);
        window.gameScene?.atualizarObjetivo();
        document.getElementById('btn-identify')?.focus();
    }
    voltarAoCampo(){
        this.emCampo=true;this.tela.classList.add('inv-em-campo');
        document.getElementById('game-screen').classList.add('active');this.fecharCampo();
    }
    botaoCampo(topo){
        if(!window.gameScene?.missionData.investigacao)return;
        const b=el('button','inv-botao',this.invOriginal.id==='hospital-imagem'?(this.lang==='pt'?'Voltar ao hospital':'Back to the hospital'):(this.lang==='pt'?'Voltar ao cenário':'Back to the scene'));b.type='button';b.id='inv-voltar-mapa';b.addEventListener('click',()=>this.voltarAoCampo());topo.appendChild(b);
    }

    get cenas() { return this.inv.cenas; }

    cena() {
        const s = this.sessao, tx = this.tx, c = this.cenas[s.i];
        this.corpo.replaceChildren(); this.corpo.classList.remove('inv-fim-jornal');
        this.tela.classList.toggle('inv-em-campo',this.emCampo);
        if(!this.emCampo){this.tela.removeAttribute('role');this.tela.removeAttribute('aria-modal');}
        if (!c) return this.fichaFinal();
        const topo = el('div', 'inv-topo');
        const sair = el('button', 'inv-sair', tx.sair); sair.type = 'button'; sair.addEventListener('click', () => this.aoSair && this.aoSair());
        topo.append(sair, el('span', 'inv-progresso', tx.cena.replace('{i}', s.i + 1).replace('{n}', this.cenas.length)));
        if (this.revisao) {
            const bo = el('button', 'inv-sair', tx.baixarObs); bo.type = 'button'; bo.id = 'inv-baixar-obs'; bo.addEventListener('click', () => this.baixarObservacoes());
            topo.append(el('span', 'inv-selo', tx.modoRevisao), bo);
        }
        this.botaoCampo(topo);
        this.corpo.appendChild(topo);
        if (s.i === 0) this.corpo.appendChild(el('p', 'inv-aviso', this.revisao ? this.inv[this.lang].aviso : this.inv[this.lang].nota));
        const npcFala = this.invOriginal.campo?.locais?.find((l) => l.id === c.id)?.npc;
        if (npcFala && retratoSvg(npcFala)) {
            const fala = el('div', 'inv-fala'); const ret = el('span', 'inv-retrato'); ret.innerHTML = retratoSvg(npcFala);
            fala.append(ret, el('span', 'inv-fala-nome', NOMES[npcFala] || npcFala)); this.corpo.appendChild(fala);
        }
        this.corpo.appendChild(el('h2', 'inv-titulo', c.titulo));
        this.focarTitulo();
        this.corpo.appendChild(el('p', 'inv-texto', c.texto));
        for(const reacao of c.reacoes||[]){
            if(reacao.aposCena&&!s.concluidas[reacao.aposCena])continue;
            const errou=s.historico.some(h=>h.cena===(reacao.erroNaCena||reacao.semErroNaCena)&&h.correta===false);
            if(reacao.erroNaCena&&!errou || reacao.semErroNaCena&&errou)continue;
            const hipotese=reacao.incluirHipotese?s.registro[this.invOriginal.cenaHipotese]?.texto:null;
            this.corpo.appendChild(el('p','inv-texto',reacao.texto+(hipotese?' '+(this.lang==='pt'?'Hipótese inicial: ':'Initial hypothesis: ')+hipotese:'')));
        }
        this.visual(c);
        if (c.leituraExtra && LICOES_EXTRA[c.leituraExtra]) this.corpo.appendChild(this.botaoLeitura(c.leituraExtra));
        if(c.muralDaCena)this.mostrarMural(c.muralDaCena);
        this.etapa = { feito: false, evidenciaFeita: !c.evidencia, marcados: new Set() };
        this.perguntas = el('div', 'inv-perguntas'); this.corpo.appendChild(this.perguntas);
        this.retorno = el('div', 'inv-retorno'); this.retorno.setAttribute('aria-live', 'polite'); this.corpo.appendChild(this.retorno);
        this.rodape(c);
        const r = s.registro[c.id];
        const respondida = c.tipo === 'escolha' ? r && (!c.evidencia || s.registro[c.id + ':evidencia']) : (c.tipo === 'cartoes' ? r : false);
        if (c.tipo === 'registro' && s.concluidas[c.id]) { this.perguntaRegistro(c); this.retorno.textContent = tx.hipoteseGuardada; }
        else if (c.tipo === 'registro') this.perguntaRegistro(c);
        else if (respondida) this.jaRespondida(c);
        else if (c.tipo === 'escolha' && (c.atividade||(this.invOriginal.observacoesObrigatorias||[]).includes(c.id)) && !this.observacaoCompleta(c.id)) this.aguardarObservacao(c);
        else if (c.tipo === 'escolha') this.perguntaEscolha(c, r && c.evidencia ? 'evidencia' : 'principal');
        else if (c.tipo === 'cartoes') this.perguntaCartoes(c);
    }

    /** Botão de leitura opcional (lição extra da Academia, só teoria): abre o painel de lições em modo de revisão, sem nota. */
    botaoLeitura(id) {
        const pt = this.lang === 'pt';
        const b = el('button', 'inv-botao inv-leitura-extra', pt ? '📖 Leitura opcional · Academia: a equação do radônio' : '📖 Optional reading · Academy: the radon equation');
        b.type = 'button'; b.id = 'inv-leitura-extra';
        b.addEventListener('click', () => { if (this.licaoUI) this.licaoUI.abrir(-1, this.lang, null, () => b.focus(), { revisao: true, licao: LICOES_EXTRA[id] }); });
        return b;
    }

    visual(c) {
        const tx = this.tx;
        if(c.atividade){
            this.corpo.appendChild(criarAtividade(c,this.lang,this.sessao,(id,o)=>registrarObservacao(this.sessao,c,o),()=>{
                if(this.observacaoCompleta(c.id)&&!this.sessao.registro[c.id]&&!this.perguntas.querySelector('.inv-opcao')){this.perguntas.replaceChildren();this.perguntaEscolha(c,'principal');}
            }));return;
        }
        if (!c.visual) return;
        const caixa = el('div', 'inv-visual');
        if (c.visual === 'recepcao') {
            caixa.innerHTML = `<div class="inv-icone" aria-label="${tx.recepcao}">🏥 🧍‍♀️ 🧑‍⚕️</div><div class="inv-legenda">${tx.recepcao}</div>`;
        } else if (c.visual === 'equipamento') {
            const svg = el('div'); svg.innerHTML = esquemaEquipamento(tx, this.ligado);
            const b = el('button', 'inv-botao', this.ligado ? tx.desligar : tx.ligar); b.type = 'button'; b.id = 'inv-liga';
            b.addEventListener('click', () => { this.ligado = !this.ligado; svg.innerHTML = esquemaEquipamento(tx, this.ligado); b.textContent = this.ligado ? tx.desligar : tx.ligar; svg.setAttribute('aria-live', 'polite'); });
            caixa.append(svg, b); this.controlesObservacao(c, caixa);
        } else if (c.visual === 'caminho') {
            const svg = el('div'); svg.innerHTML = esquemaEquipamento(tx, true); caixa.appendChild(svg);
            caixa.appendChild(el('div', 'inv-legenda', tx.feixe));
        } else if (c.visual === 'comparacao') {
            const dois = el('div', 'inv-dois');
            const a = el('div', 'inv-painel'); const svg = el('div'); svg.innerHTML = esquemaEquipamento(tx, this.ligado, false);
            const b = el('button', 'inv-botao', this.ligado ? tx.desligar : tx.ligar); b.type = 'button'; b.id = 'inv-liga';
            b.addEventListener('click', () => { this.ligado = !this.ligado; svg.innerHTML = esquemaEquipamento(tx, this.ligado, false); b.textContent = this.ligado ? tx.desligar : tx.ligar; svg.setAttribute('aria-live', 'polite'); });
            a.append(el('div', 'inv-legenda', tx.equip), svg, b);
            const f = el('div', 'inv-painel');
            f.innerHTML = `<div class="inv-legenda">${tx.frasco}</div><div class="inv-frasco" aria-hidden="true">☢</div><div class="inv-legenda">${tx.sempre} · ${tx.semBotao}</div>`;
            dois.append(a, f); caixa.appendChild(dois); this.controlesObservacao(c, caixa);
        }
        this.corpo.appendChild(caixa);
    }

    observacaoCompleta(id) {
        return observacoesCompletas(this.sessao,this.cenas.find(c=>c.id===id));
    }

    aguardarObservacao(c) {
        if(c.atividade){this.perguntas.replaceChildren(el('p','inv-pergunta',this.lang==='pt'?'Explore e registre todos os estados indicados antes de explicar.':'Explore and record all indicated states before explaining.'));return;}
        this.perguntas.replaceChildren(el('p','inv-pergunta',this.lang==='pt'
            ? 'Antes de explicar, registre uma observação com emissão e outra sem emissão. Use o modelo e o botão “Registrar observação”.'
            : 'Before explaining, record one observation with emission and one without emission. Use the model and the “Record observation” button.'));
    }

    controlesObservacao(c, caixa) {
        const registrar=el('button','inv-botao',this.lang==='pt'?'Registrar observação':'Record observation');
        registrar.type='button';registrar.id='inv-registrar-observacao';
        const lista=el('ul','inv-resumo');lista.id='inv-observacoes';lista.setAttribute('aria-live','polite');
        const atualizar=()=>{lista.replaceChildren();for(const o of this.sessao.observacoesCampo.filter(o=>o.cena===c.id))lista.appendChild(el('li','',o.texto[this.lang]));};
        registrar.addEventListener('click',()=>{
            if(!this.sessao.observacoesCampo.some(o=>o.cena===c.id&&o.emissao===this.ligado)){
                const pt=this.ligado?'Emissão iniciada: feixe do tubo até o detector, atravessando o corpo.':'Emissão interrompida: o feixe desaparece; a paciente permanece no esquema.';
                const en=this.ligado?'Emission started: beam from the tube through the body to the detector.':'Emission stopped: the beam disappears; the patient remains in the diagram.';
                const complemento=c.visual==='comparacao'?{pt:' O modelo de material radioativo continua indicando emissão, sem interruptor.',en:' The radioactive-material model still indicates emission, without a switch.'}:{pt:'',en:''};
                const observacao={cena:c.id,emissao:this.ligado,texto:{pt:pt+complemento.pt,en:en+complemento.en},origem:'modelo-didatico'};
                this.sessao.observacoesCampo.push(observacao);
                this.sessao.historico.push({cena:c.id,etapa:'observacao',...observacao});
            }
            atualizar();
            if(this.observacaoCompleta(c.id)&&!this.sessao.registro[c.id]&&!this.perguntas.querySelector('.inv-opcao')){this.perguntas.replaceChildren();this.perguntaEscolha(c,'principal');}
        });
        caixa.append(registrar,lista);atualizar();
    }

    mostrarMural(cenaCartoes) {
        const cartoes=this.sessao.mural?.cartoes||this.sessao.registro[cenaCartoes]?.cartoes||[];
        const painel=el('section','inv-mural');painel.appendChild(el('h3','',this.lang==='pt'?'Seu mural: mensagem selecionada':'Your board: selected message'));
        for(const c of cartoes)painel.appendChild(el('p','',typeof c.texto==='string'?c.texto:c.texto[this.lang]));
        this.corpo.appendChild(painel);
    }

    rodape(c) {
        const tx = this.tx;
        if (this.revisao) this.campoObservacao(c);
        const nav = el('div', 'inv-nav');
        const vol = el('button', 'inv-botao inv-voltar', tx.voltar); vol.type = 'button'; vol.hidden = this.sessao.i === 0;
        vol.addEventListener('click', () => { this.sessao.i = Math.max(0, this.sessao.i - 1); this.cena(); });
        this.btnContinuar = el('button', 'inv-botao primario', tx.continuar); this.btnContinuar.type = 'button'; this.btnContinuar.id = 'inv-continuar'; this.btnContinuar.disabled = true;
        this.btnContinuar.addEventListener('click', () => { this.sessao.concluidas[c.id] = true; this.sessao.i++; if(this.emCampo){this.fecharCampo();if(this.proximaCenaCampo()===this.cenas.length)window.gameScene?.avisarJato?.();}else this.cena(); });
        nav.append(vol, this.btnContinuar); this.corpo.appendChild(nav);
    }

    /** Só no modo de revisão: observação por cena, guardada no navegador (não se perde ao sair) e exportável. */
    campoObservacao(c) {
        const tx = this.tx;
        const det = el('details', 'inv-obs'); det.appendChild(el('summary', '', tx.observacao));
        if (this.sessao.notas[c.id]) det.open = true;
        const ta = el('textarea', 'inv-nota'); ta.rows = 3; ta.placeholder = tx.obsDica; ta.value = this.sessao.notas[c.id] || '';
        ta.addEventListener('input', () => { this.sessao.notas[c.id] = ta.value; gravarNotas(this.invOriginal.id, this.sessao.notas); });
        det.appendChild(ta); this.corpo.appendChild(det);
    }

    baixarObservacoes() {
        const dados = { investigacao: this.invOriginal.id, versao: this.invOriginal.versao, idioma: this.lang, observacoes: Object.fromEntries(Object.entries(this.sessao.notas).filter(([, v]) => v && v.trim())) };
        this.baixarJson(dados, `radiation-hunters-${this.invOriginal.id}-observacoes.json`);
    }

    baixarJson(dados, nome) {
        try {
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
            document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        } catch (e) { /* sem download: o resumo pode ser copiado */ }
    }

    focarTitulo() {
        const titulo = this.corpo.querySelector('.inv-titulo');
        if (titulo) { titulo.tabIndex = -1; titulo.focus({ preventScroll: true }); }
        this.tela.scrollTop = 0;
    }

    liberar() { this.btnContinuar.disabled = false; }

    mostrarRetorno(ok, texto) {
        this.retorno.className = 'inv-retorno ' + (ok ? 'ok' : 'erro');
        this.retorno.textContent = texto ? (ok ? '✓ ' : '✗ ') + texto : '';
    }

    /** Voltar a uma cena já respondida: mostra a resposta registrada e deixa seguir. */
    jaRespondida(c) {
        const s = this.sessao, r = s.registro[c.id];
        this.perguntas.replaceChildren(el('p', 'inv-pergunta', c.pergunta));
        const linhas = r.cartoes ? r.cartoes.map((k) => k.texto) : [r.texto, ...(s.registro[c.id + ':evidencia'] ? [this.tx.evidencia + ': ' + s.registro[c.id + ':evidencia'].texto] : [])];
        const ul = el('ul', 'inv-resumo'); linhas.forEach((x) => ul.appendChild(el('li', '', x)));
        this.perguntas.appendChild(ul);
        if (c.explica) this.retorno.textContent = c.explica;
        this.liberar();
    }

    perguntaRegistro(c) {
        this.perguntas.replaceChildren(el('p', 'inv-pergunta', c.pergunta));
        const jaFeito = this.sessao.registro[c.id];
        for (const o of c.opcoes) {
            const b = el('button', 'inv-opcao', o.txt); b.type = 'button'; b.dataset.id = o.id;
            if (jaFeito && jaFeito.opcao === o.id) b.classList.add('escolhida');
            b.disabled = this.sessao.concluidas[c.id] === true;
            b.addEventListener('click', () => {
                registrarHipotese(this.sessao, this.cenas[this.sessao.i], o.id);
                this.perguntas.querySelectorAll('.inv-opcao').forEach((x) => x.classList.toggle('escolhida', x === b));
                this.mostrarRetorno(true, c.retornoRegistro); this.liberar();
            });
            this.perguntas.appendChild(b);
        }
        if (jaFeito) this.liberar();
    }

    perguntaEscolha(c, etapa) {
        const alvo = etapa === 'evidencia' ? c.evidencia : c;
        const orig = this.cenas[this.sessao.i];
        const caixa = el('div', 'inv-bloco');
        caixa.appendChild(el('p', 'inv-pergunta', alvo.pergunta));
        for (const o of embaralhar(alvo.opcoes)) {   // a certa não fica sempre na mesma posição
            const b = el('button', 'inv-opcao', o.txt); b.type = 'button'; b.dataset.id = o.id;
            b.addEventListener('click', () => {
                if (b.disabled) return;
                const r = avaliarOpcao(this.sessao, orig, etapa === 'evidencia' ? 'evidencia' : 'principal', o.id);
                this.mostrarRetorno(r.ok, r.retorno);
                if (r.ok) {
                    caixa.querySelectorAll('.inv-opcao').forEach((x) => { x.disabled = true; x.classList.toggle('certa', x === b); });
                    if (etapa !== 'evidencia' && c.evidencia) this.perguntaEscolha(c, 'evidencia');
                    else { if (c.explica) this.retorno.textContent += '\n' + c.explica; this.liberar(); }
                } else { b.classList.add('errada'); b.disabled = true; }
            });
            caixa.appendChild(b);
        }
        this.perguntas.appendChild(caixa);
    }

    perguntaCartoes(c) {
        const orig = this.cenas[this.sessao.i];
        this.perguntas.replaceChildren(el('p', 'inv-pergunta', c.pergunta));
        const lista = el('div', 'inv-cartoes');
        const botoes = new Map();
        for (const k of embaralhar(c.cartoes)) {
            const b = el('button', 'inv-cartao', k.txt); b.type = 'button'; b.dataset.id = k.id; b.setAttribute('aria-pressed', 'false');
            b.addEventListener('click', () => {
                if (this.etapa.feito) return;
                const on = !this.etapa.marcados.has(k.id);
                if (on) this.etapa.marcados.add(k.id); else this.etapa.marcados.delete(k.id);
                b.setAttribute('aria-pressed', String(on)); b.classList.toggle('marcado', on);
                b.querySelector('.inv-cartao-nota')?.remove(); b.classList.remove('certo', 'errado', 'faltou');
            });
            botoes.set(k.id, b); lista.appendChild(b);
        }
        const ver = el('button', 'inv-botao primario', this.tx.verificar); ver.type = 'button'; ver.id = 'inv-verificar';
        ver.addEventListener('click', () => {
            const r = avaliarCartoes(this.sessao, orig, [...this.etapa.marcados]);
            for (const k of c.cartoes) {
                const b = botoes.get(k.id), x = r.porCartao[k.id];
                b.querySelector('.inv-cartao-nota')?.remove(); b.classList.remove('certo', 'errado', 'faltou');
                if (!x) continue;
                b.classList.add(x.certo ? 'certo' : (x.faltou ? 'faltou' : 'errado'));
                const nota = el('span', 'inv-cartao-nota', x.faltou ? this.tx.faltou : (x.certo ? this.tx.verPonto + ' ' : this.tx.verErro + ' ') + x.retorno);
                b.appendChild(nota);
            }
            if (r.ok) { this.etapa.feito = true; lista.querySelectorAll('.inv-cartao').forEach((b) => { b.disabled = true; }); ver.disabled = true; this.mostrarRetorno(true, ''); this.liberar(); }
            else this.mostrarRetorno(false, '');
        });
        this.perguntas.append(lista, ver);
    }

    fichaFinal() {
        const tx = this.tx, f = montarFicha(this.sessao, this.invOriginal, this.lang);
        this.ficha = f;
        this.corpo.replaceChildren();
        // v3.24: o final é uma edição extra do jornal; só um botão de saída ("Voltar à Base"); o caderno completo fica recolhido
        this.corpo.classList.add('inv-fim-jornal');
        if (!f.concluida || this.revisao) {   // em andamento (ou revisão): mantém "Sair" e "Voltar ao cenário"
            const topo = el('div', 'inv-topo');
            const sair = el('button', 'inv-sair', tx.sair); sair.type = 'button'; sair.addEventListener('click', () => this.aoSair && this.aoSair());
            topo.append(sair); if (this.revisao) topo.append(el('span', 'inv-selo', tx.modoRevisao)); this.botaoCampo(topo); this.corpo.appendChild(topo);
        }
        const jn = el('div', 'inv-jornal-fim'); jn.innerHTML = htmlFimJornal(reportagemInvestigacao(f, this.lang), this.lang);
        jn.querySelector('.jornal-manchete').classList.add('inv-titulo'); this.corpo.appendChild(jn);
        if(!f.concluida)this.corpo.appendChild(el('p','inv-aviso',tx.rev['em-andamento']));
        this.focarTitulo();
        const caderno = el('details', 'inv-caderno-completo'); caderno.id = 'inv-caderno-completo'; caderno.open = !!this.inv.etapasProblema;
        caderno.append(el('summary', '', tx.cadernoCompleto)); caderno.appendChild(el('h2', 'inv-titulo-ficha', tx.ficha + ': ' + this.inv[this.lang].titulo));
        const raiz = this.corpo; this.corpo = caderno;   // os blocos abaixo entram no caderno recolhido
        const bloco = (titulo, corpo) => { const d = el('div', 'inv-ficha-bloco'); d.appendChild(el('h3', '', titulo)); if (Array.isArray(corpo)) { const ul = el('ul'); corpo.forEach((x) => ul.appendChild(el('li', '', x))); d.appendChild(ul); } else d.appendChild(el('p', '', corpo || '—')); this.corpo.appendChild(d); };
        if(this.inv.etapasProblema){
            const pt=this.lang==='pt',d=el('div','inv-ficha-bloco');
            d.appendChild(el('h3','',pt?'Problema':'Problem'));d.appendChild(el('p','',this.inv[this.lang].problema));
            d.appendChild(el('h3','',pt?'Etapas (Caderno)':'Steps (Notebook)'));
            const ul=el('ul','inv-etapas');ul.id='inv-etapas';
            this.cenas.forEach(c=>{const feita=!!this.sessao.concluidas[c.id],li=el('li',feita?'feita':'',(feita?'✓ ':'○ ')+c.titulo);li.dataset.cena=c.id;li.dataset.feita=String(feita);ul.appendChild(li);});
            d.appendChild(ul);d.appendChild(el('p','inv-legenda',(pt?'Sorteio nº ':'Draw no. ')+this.invOriginal.semente));this.corpo.appendChild(d);
        }
        bloco(tx.hipotese, f.hipoteseInicial);
        bloco(this.inv.rotulosFicha?.observacoes||(this.lang==='pt'?'Observações do modelo (caderno)':'Model observations (notebook)'),f.observacoesCampo.map(o=>o.texto[this.lang]));
        if(f.transferencia)bloco(this.lang==='pt'?'Sua explicação antes do retorno':'Your explanation before feedback',f.transferencia.texto);
        bloco(tx.evidencias, f.evidencias.map((e) => e.texto));
        bloco(this.inv.rotulosFicha?.decisao||tx.decisao, f.decisao);
        bloco(tx.revisao, tx.rev[f.revisao]);
        bloco(this.inv.rotulosFicha?.limite||tx.limite, f.limite);
        bloco(this.revisao ? tx.fontes : tx.fontesSo, this.revisao ? this.inv.fontes : this.inv.fontesPublicas);
        for(const recurso of this.inv.recursos||[]){
            if(!/^https:\/\//.test(recurso.url))continue;
            const d=el('div','inv-ficha-bloco'),link=el('a','inv-botao',recurso.titulo);link.href=recurso.url;link.target='_blank';link.rel='noopener noreferrer';d.append(link,el('p','',recurso.descricao));this.corpo.append(d);
        }
        this.resumo = this.textoResumo(f);
        this.corpo = raiz; raiz.appendChild(caderno);
        // exportar registro (.json) e copiar resumo: só para professores e revisores, recolhidos; o jogador vê um único botão de saída
        const prof = el('details', 'inv-prof'); prof.id = 'inv-prof'; prof.append(el('summary', '', tx.paraProfessores));
        const b1 = el('button', 'inv-botao', tx.baixar); b1.type = 'button'; b1.id = 'inv-baixar'; b1.addEventListener('click', () => this.baixar());
        const b2 = el('button', 'inv-botao', tx.copiar); b2.type = 'button'; b2.id = 'inv-copiar'; b2.addEventListener('click', () => this.copiar(b2));
        prof.append(b1, b2); raiz.appendChild(prof);
        const nav = el('div', 'inv-nav');
        const b3 = el('button', 'inv-botao primario', this.base ? tx.base : tx.menu); b3.type = 'button'; b3.id = 'inv-menu'; b3.addEventListener('click', () => this.aoSair && this.aoSair());
        nav.append(b3); raiz.appendChild(nav);
    }

    textoResumo(f) {
        const tx = this.tx;
        return [`${tx.ficha}: ${f.titulo} (${f.versao})`, `${tx.hipotese}: ${f.hipoteseInicial || '—'}`,
            ...f.observacoesCampo.map(o => ' - '+o.texto[this.lang]), ...(f.transferencia ? [f.transferencia.texto] : []), `${tx.evidencias}:`, ...f.evidencias.map((e) => ' - ' + e.texto), `${this.inv.rotulosFicha?.decisao||tx.decisao}: ${f.decisao || '—'}`, `${tx.revisao}: ${tx.rev[f.revisao]}`, `${this.inv.rotulosFicha?.limite||tx.limite}: ${f.limite || '—'}`,
            ...Object.entries(f.observacoes).map(([c, t]) => `[${c}] ${t}`)].join('\n');
    }

    baixar() { this.baixarJson(this.ficha, `radiation-hunters-${this.ficha.investigacao}.json`); }

    async copiar(botao) {
        try { await navigator.clipboard.writeText(this.resumo); botao.textContent = this.tx.copiado; } catch (e) { botao.textContent = '✗'; }
    }
}
