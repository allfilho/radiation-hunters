// ============================================
// AGÊNCIA: a Geoscape do jogo. Mapa-múndi sempre à vista, relógio com pausa automática, alertas que surgem
// e vencem com o tempo (simulacao.js), voo do jato no próprio mapa e a Base em corte (base-svg.js).
// Camada por cima do jogo atual: as missões e as investigações não mudam; esta tela só as abre e recebe o retorno.
// Sem dependência de Phaser; tudo em DOM/SVG, com lista textual equivalente ao mapa e ao corte da Base.
// ============================================
import { audioManager } from '../audio.js';
import { MISSIONS, TUTORIAL } from '../data/missoes/index.js';
import { investigacaoPorId } from '../investigacao/index.js';
import { retratoSvg } from '../investigacao/retratos.js';
import { t, currentLang } from '../i18n/index.js';
import { lerArmazenado, gravarArmazenado } from '../progresso.js';
import { BASE, distanciaKm, horasDeVoo, paraPercentual, treinamentoConcluido } from './dados.js';
import { alertaPorId, alertaRapida, ehRapida, missaoRapida, semDe } from './rapidas.js';
import { interiorSvg, cenaEmbarqueSvg, VB_EMBARQUE } from '../arte/transporte.js';
import { prepararFalso } from '../investigacao/falso-alarme.js';
import { mapaMundiSvg, posicaoSvg } from './mapa-mundi.js';
import { TXT, NOME_AGENCIA } from './textos.js';
import { metodosBase } from './ui-base.js';
import { distribuirDoseMissao, NORMAS, razao, corCaneta } from './equipe.js';
import { avaliarPlano, bonusPlano, bonusDoObjetivo, PLANO } from './plano-dose.js';
import { CUSTOS, registrarColeta, foiLevantado, pesquisaPronta, diasDeVolta, registrarRetorno } from './frota.js';
import { novoEstado, sanear, iniciar, avancarDia, concluir, mesDe, diaDoMes, diasRestantes, PARAMETROS } from './simulacao.js';

export const CHAVE_AGENCIA = 'radiationHuntersAgencia';
const VEL_MS = { 1: 1600, 2: 450 };   // ms por dia de jogo [H]
const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
const reduzMovimento = () => { try { return globalThis.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
const estrelasTxt = (n) => { const k = Math.max(0, Math.min(3, n | 0)); return '★'.repeat(k) + '☆'.repeat(3 - k); };
const emCampo = (a) => !!a && (a.tipo === 'missao' || a.tipo === 'rapida');   // missões de caça: dose, estrelas e prêmio

export class AgenciaUI {
    /**
     * @param {HTMLElement} el  contêiner da tela
     * @param {object} cb { sair(), iniciarMissao(missao), abrirInvestigacao(id), desbloqueadas(), estrelas(id), pularTreinamento(), abrirCaderno() }
     */
    constructor(el, cb) {
        this.el = el; this.cb = cb;
        this.vista = 'mapa'; this.sel = null; this.sala = null; this.voo = null; this.alvo = null; this.relatorio = null;
        this.vel = 0; this._timer = 0; this._raf = 0;
        this.mod = null; this.vazio = null; this.preparo = null; this.equipeSaida = null;
        this.est = this.carregar();
        // v3.17.1: barra de espaço pausa e retoma o relógio (não age sobre botões e campos, que já usam o espaço)
        document.addEventListener('keydown', (ev) => {
            if (ev.code !== 'Space' || !this.aberta || !this.est.iniciado || this.voo) return;
            const alvo = ev.target, tag = alvo && alvo.tagName;
            if (tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'A') return;
            if (document.querySelector('.modal.active')) return;
            ev.preventDefault();
            this.definirVel(this.vel > 0 ? 0 : 1);
        });
    }
    get L() { return TXT[currentLang] || TXT.en; }
    get aberta() { return this.el.classList.contains('active'); }

    // ---------- estado e salvamento ----------
    carregar() {
        let d = null;
        try { const b = lerArmazenado(CHAVE_AGENCIA); if (b) d = JSON.parse(b); } catch (e) { d = null; }
        return d ? sanear(d) : novoEstado();
    }
    gravar() { gravarArmazenado(CHAVE_AGENCIA, JSON.stringify(this.est)); }

    // ---------- entrada e saída ----------
    abrir() {
        this._parar();
        if (!this.est.iniciado && treinamentoConcluido(this.cb.desbloqueadas())) { iniciar(this.est, CUSTOS.creditosIniciais); this.gravar(); }
        this.vista = 'mapa'; this.sel = null; this.sala = null; this.mod = null; this.vazio = null; this.preparo = null; this.voo = null; this.vel = 0;
        this.desenhar(true);
    }
    /** Chamado quando o idioma muda. */
    atualizar() { if (this.aberta) this.desenhar(false); }

    /** Fim ou saída de uma missão/investigação aberta pela Agência. r = { concluida, estrelas }. */
    retornar(r = {}) {
        const L = this.L, a = this.alvo; this.relatorio = null;
        let ganhoCampo = 0, concluiuCampo = false, res = null;   // v3.38: para o plano de dose
        if (a) {
            const d = this.dadosAlerta(a);
            const ativo = this.est.ativos.some((x) => x.id === a.id);
            if (r.concluida && ativo) {
                const pts = emCampo(a) ? Math.max(1, Math.min(3, r.estrelas | 0)) : PARAMETROS.pontosInvestigacao;
                const ganho = concluir(this.est, a.id, pts);
                if (emCampo(a)) { ganhoCampo = ganho; concluiuCampo = true; }
                this.relatorio = emCampo(a) ? preencher(L.relatorioMissao, { titulo: d.titulo, estrelas: estrelasTxt(pts), valor: ganho }) : preencher(L.relatorioInv, { titulo: d.titulo, valor: ganho });
                if (((a.tipo === 'missao' && a.missaoId > 1) || a.tipo === 'rapida') && r.fontes > 0 && registrarColeta(this.est, a.id, r.fontes, r.isotopos)) this.relatorio += ' ' + L.aguardandoColeta;
            } else if (ativo) this.relatorio = preencher(L.relatorioAbandono, { titulo: d.titulo });
            else if (a.missaoId === 1 && r.concluida) this.relatorio = null;
        }
        const q = this.equipeSaida;
        if (q && emCampo(a) && r.dose > 0) {
            const soma = Object.values(q.acum || {}).reduce((x, y) => x + y, 0);
            const exato = !!q.exato && Math.abs(r.dose - soma) < 1e-6;   // v3.17: cada um recebeu a dose do lugar onde esteve
            if (!exato && r.dose > soma) this.registrarDoseCampo(r.dose - soma);   // dose que não passou pelo registro de campo vai a quem estava à frente
            res = distribuirDoseMissao(this.est.equipe, q.ids, q.lider, r.dose, this.est.dia, q.acum, exato);
            const nomes = res.filter((x) => x.tratamento).map((x) => (this.est.equipe.find((m) => m.id === x.id) || {}).nome).filter(Boolean);
            const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US');
            this.relatorio = (this.relatorio ? this.relatorio + ' ' : '') + preencher(L.relatorioDose, { l: fmt((res.find((x) => x.id === q.lider) || { msv: 0 }).msv), a: fmt(res.filter((x) => x.id !== q.lider).reduce((s, x, _, v) => s + x.msv / v.length, 0)) }) + (nomes.length ? ' ' + preencher(L.relatorioTratamento, { quem: nomes.join(', ') }) : '');
        }
        // v3.38 (Fase F): plano de dose. Bônus se a missão foi concluída e todos ficaram dentro do objetivo; revisão se alguém passou 25 %.
        let revisao = null;
        if (q && emCampo(a) && q.objetivo != null) {
            const doses = res || q.ids.map((id) => ({ id, msv: 0 }));
            const av = avaliarPlano(q.objetivo, doses), v = (Math.round(av.objetivo * 100) / 100).toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US');
            const nomesDe = (ids) => ids.map((id) => (this.est.equipe.find((m) => m.id === id) || {}).nome).filter(Boolean).join(', ');
            const partes = [];
            if (!concluiuCampo) partes.push(L.relPlanoSemConclusao);
            else if (av.cumprido) { const b = bonusPlano(av.objetivo, ganhoCampo, true, true); this.est.creditos += b; partes.push(preencher(L.relPlanoOk, { v, b })); }
            if (av.acima.length && (concluiuCampo || av.revisao)) partes.push(preencher(L.relPlanoFora, { v, quem: nomesDe(av.acima) }));
            if (av.revisao) { revisao = av.revisados; partes.push(preencher(L.relPlanoRevisao, { quem: nomesDe(av.revisados), d: PLANO.revisaoDias })); }
            if (partes.length) this.relatorio = (this.relatorio ? this.relatorio + ' ' : '') + partes.join(' ');
            this.ultimoPlano = { ...av, bonus: concluiuCampo && av.cumprido ? Math.round(ganhoCampo * bonusDoObjetivo(av.objetivo)) : 0 };
        }
        if (!this.est.iniciado && treinamentoConcluido(this.cb.desbloqueadas())) iniciar(this.est, CUSTOS.creditosIniciais);
        // v3.17: a equipe volta no mesmo jato; a nave e os cientistas ficam ocupados durante o voo de volta
        let volta = null;
        if (q && a && a.tipo !== 'treino' && a.lat != null && this.est.iniciado) {
            const horas = horasDeVoo(Math.round(distanciaKm(BASE, a) / 10) * 10), dias = diasDeVolta(horas);
            if (registrarRetorno(this.est, q.naveId, q.ids, dias, a.id)) volta = { alvo: a, retorno: true, dias, ids: [...q.ids] };
        }
        if (revisao && q) for (const id of q.ids) { const m = this.est.equipe.find((x) => x.id === id); if (m) m.ocupadoAte = Math.max(m.ocupadoAte || 0, this.est.dia) + PLANO.revisaoDias; }   // a equipe toda revê o plano
        this.gravar();
        this._parar(); this.vista = 'mapa'; this.sel = null; this.sala = null; this.mod = null; this.vazio = null; this.preparo = null; this.equipeSaida = null; this.voo = volta; this.vel = 0;
        this.desenhar(true);
    }

    /** Estado da caneta do líder durante a missão: dose acumulada na saída somada às doses das janelas. null fora do modo Agência. */
    penDoLider(doseMsv) {
        const q = this.equipeSaida, a = this.alvo; if (!q || !emCampo(a)) return null;
        const m = this.est.equipe.find((x) => x.id === (q.ativo || q.lider)); if (!m) return null;
        const r = razao({ ...m, doses: [...m.doses, { dia: this.est.dia, msv: doseMsv }] }, this.est.dia);
        return { msv: doseMsv, r, cor: corCaneta(r) };
    }
    /** Quem está em campo agora (v3.16: troca com as teclas 7, 8, 9, 0; o líder é o primeiro assento). */
    cientistaAtivo() { const q = this.equipeSaida; return q ? (q.ativo || q.lider) : null; }
    /** Soma a dose recebida no campo ao cientista ativo (o resto da equipe recebe a fração de apoio no fim). */
    registrarDoseCampo(msv, id = this.cientistaAtivo()) { const q = this.equipeSaida; if (!q) return 0; q.acum = q.acum || {}; q.acum[id] = (q.acum[id] || 0) + msv; return q.acum[id]; }
    doseDoAtivo() { const q = this.equipeSaida; return q && q.acum ? q.acum[this.cientistaAtivo()] || 0 : 0; }
    /** Dados para o painel de equipe do HUD: [{ id, tecla, nome, retrato, cor, ativo }]. */
    equipeDoHud() {
        const q = this.equipeSaida; if (!q || !emCampo(this.alvo)) return [];
        const teclas = ['7', '8', '9', '0'];
        return q.ids.slice(0, 4).map((id, k) => { const m = this.est.equipe.find((x) => x.id === id); return m ? { id, tecla: teclas[k], nome: m.nome, retrato: m.retrato, cor: corCaneta(razao(m, this.est.dia)), ativo: id === this.cientistaAtivo() } : null; }).filter(Boolean);
    }
    /** Seleciona o cientista pelo índice (0 a 3 = teclas 7, 8, 9, 0). Devolve o membro ou null se não existe ou já é o ativo. */
    trocarCientista(i) {
        const q = this.equipeSaida; if (!q || !emCampo(this.alvo)) return null;
        const id = q.ids[i]; if (!id || id === this.cientistaAtivo()) return null;
        q.ativo = id;
        return this.est.equipe.find((x) => x.id === id) || null;
    }
    _parar() { if (this._rafC) { cancelAnimationFrame(this._rafC); this._rafC = 0; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = 0; } if (this._timer) { clearTimeout(this._timer); this._timer = 0; } }
    /** Para o relógio e o voo quando a tela sai de vista (missão, menu). */
    pararTudo() { this._parar(); this.vel = 0; }

    rotuloTipo(a) { const L = this.L; if (a.pericia || a.nivel === 'pericia') return L.tipoPericia; return a.tipo === 'rapida' ? L.tipoRapida : a.tipo === 'missao' ? L.tipoMissao : L.tipoInvestigacao; }

    // ---------- dados de um alerta ----------
    dadosAlerta(a) {
        const lang = currentLang;
        if (a.tipo === 'missao') {
            const m = MISSIONS.find((x) => x.id === a.missaoId);
            return { titulo: t(m.titleKey), desc: t(m.descKey), dificuldade: m.difficulty, missao: m };
        }
        if (a.tipo === 'rapida') return { titulo: a.titulo[lang], desc: a.relato[lang], dificuldade: null, rapida: true };
        if (a.tipo === 'treino') { const m = a.completa ? MISSIONS[0] : TUTORIAL; return { titulo: t(m.titleKey), desc: t(m.descKey), dificuldade: m.difficulty, missao: m }; }
        const inv = investigacaoPorId(a.invId), d = inv && (inv[lang] || inv.pt);
        return { titulo: d ? d.titulo : a.invId, desc: d ? d.descricao : '', dificuldade: null, inv };
    }

    // ---------- relógio ----------
    definirVel(v) {
        if (!this.est.iniciado || this.voo) v = 0;
        this.vel = v; this._parar();
        this.atualizarHud();
        if (v > 0) this.agendar();
    }
    agendar() { this._timer = setTimeout(() => this.passoDeTempo(), VEL_MS[this.vel] || VEL_MS[1]); }
    /** Avança um dia; se algo aconteceu, o relógio PARA (como na Geoscape) e a tela é redesenhada. */
    passoDeTempo(manual = false) {
        this._timer = 0;
        if (!this.est.iniciado || this.voo) { this.vel = 0; return; }
        const eventos = avancarDia(this.est);
        this.gravar();
        if (eventos.length) {
            // v3.16: o relógio só para por eventos importantes; chamados rápidos (chegada e vencimento) e a volta de cientistas apenas avisam e o relógio segue
            const branda = (e) => ((e.tipo === 'novo' || e.tipo === 'expirou') && ehRapida(e.id)) || e.tipo === 'retorno';   // só informam: chamado rápido que chega ou vence, cientista que volta do tratamento
            const para = manual || eventos.some((e) => !branda(e));
            if (para) this.vel = 0;
            const texto = eventos.map((e) => this.textoEvento(e)).join(' ');
            this.desenhar(false, (para ? preencher(this.L.anuncioPausa, {}) : '') + texto);
            if (!para && this.vel > 0) this.agendar();
        } else {
            this.atualizarHud();
            if (!manual && this.vel > 0) this.agendar();
        }
    }
    textoEvento(e) {
        const L = this.L, lang = currentLang;
        if (e.tipo === 'mes') return preencher(L.evMes, { dia: e.dia, humor: L.humor[e.humor] || '', valor: e.valor });
        if (e.tipo === 'retorno') return preencher(L.evRetorno, { dia: e.dia, quem: e.quem });
        if (e.tipo === 'obra') return preencher(L.evObra, { dia: e.dia, modulo: L.sala[e.modulo] || e.modulo });
        if (e.tipo === 'pesquisa') return preencher(L.evPesquisa, { dia: e.dia });
        if (e.tipo === 'ciencia') return L.nos[e.id] ? preencher(L.evCiencia, { dia: e.dia, nome: L.nos[e.id].nome }) : '';
        if (e.tipo === 'fabricado') return L.equip[e.id] ? preencher(L.evFabricado, { dia: e.dia, nome: L.equip[e.id].nome }) : '';
        if (e.tipo === 'pouso') return preencher(L.evPouso, { dia: e.dia });
        if (e.tipo === 'entrega') return preencher(L.evEntrega, { dia: e.dia, n: e.fontes, valor: e.valor }) + (e.tratamento ? preencher(L.evTratamento, { n: e.tratamento }) : '');
        const a = alertaPorId(e.id); if (!a) return '';
        if (e.tipo === 'levantamento') return preencher(L.evLevantamento, { dia: e.dia, titulo: this.dadosAlerta(a).titulo });
        if (e.tipo === 'coleta-perdida') return preencher(L.evColetaPerdida, { dia: e.dia, titulo: this.dadosAlerta(a).titulo });
        const d = this.dadosAlerta(a), base = { dia: e.dia, titulo: d.titulo, local: a.local[lang], valor: e.valor };
        return preencher(e.tipo === 'novo' ? L.evNovo : e.tipo === 'expirou' ? L.evExpirou : L.evConcluido, base);
    }
    textoHistorico(h) { return this.textoEvento(h); }

    atualizarHud() {
        const L = this.L, e = this.est;
        const set = (sel, txt) => { const n = this.el.querySelector(sel); if (n) n.textContent = txt; };
        set('#ag-data', e.iniciado ? preencher(L.data, { m: mesDe(e.dia) + 1, d: diaDoMes(e.dia) }) : '—');
        set('#ag-creditos', `${L.creditos}: ${e.creditos}`);
        set('#ag-verba', `${L.verba}: ${e.fator}%`);
        this.el.querySelectorAll('[data-vel]').forEach((b) => { const on = Number(b.dataset.vel) === this.vel; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
        this.el.querySelectorAll('.ag-prazo').forEach((n) => { const a = e.ativos.find((x) => x.id === n.dataset.id); if (a) n.textContent = this.textoPrazo(a); });
    }
    textoPrazo(a) { const d = diasRestantes(this.est, a), L = this.L; return d <= 0 ? L.prazoHoje : d === 1 ? L.prazoUm : preencher(L.prazo, { d }); }

    // ---------- desenho ----------
    guardarFoco() {
        const a = document.activeElement; if (!a || !this.el.contains(a)) return null;
        for (const k of ['ag', 'alerta', 'sala', 'vel', 'eq', 'lider', 'vazio', 'assento', 'cartao']) if (a.dataset && a.dataset[k] !== undefined) return `[data-${k}="${a.dataset[k]}"]`;
        return null;
    }
    desenhar(focoTitulo, anuncio) {
        const foco = focoTitulo ? null : this.guardarFoco();
        const L = this.L;
        const palco = this.vista === 'mapa' ? this.htmlMapa() : this.htmlBase();
        const painel = this.vista === 'mapa' ? this.htmlPainelMapa() : this.htmlPainelBase();
        const titulo = `${NOME_AGENCIA[currentLang]} · ${this.vista === 'mapa' ? L.mapa : L.baseTitulo}`;
        const e = this.est, trocarRot = this.vista === 'mapa' ? L.irBase : L.irMapa;
        const ctl = (v, rot, ico) => `<button type="button" class="ag-btn-rel${this.vel === v ? ' on' : ''}" data-vel="${v}" aria-pressed="${this.vel === v}" aria-label="${rot}"${!e.iniciado || this.voo ? ' disabled' : ''}>${ico}</button>`;
        this.el.innerHTML = `<div class="ag-geo ag-v-${this.vista}${this.vista === 'base' && (this.sala || this.preparo || this.relatorio || this.normas) ? ' ag-com-janela' : ''}">
<header class="ag-barra"><h2 id="ag-titulo" tabindex="-1">${titulo}</h2>
<div class="ag-relogio" role="group" aria-label="${L.relogio}">${ctl(0, L.pausar, '⏸')}${ctl(1, L.vel1, '▶')}${ctl(2, L.vel2, '▶▶')}<button type="button" class="ag-btn-rel" data-ag="passo" aria-label="${L.passo}"${!e.iniciado || this.voo ? ' disabled' : ''}>${L.passoRot}</button></div>
<span class="ag-stat" id="ag-data"></span><span class="ag-stat" id="ag-creditos"></span><span class="ag-stat" id="ag-verba"></span>
<span class="ag-barra-fim"><button type="button" class="ag-btn-nav" data-ag="trocar">${trocarRot}</button><button type="button" class="ag-btn-nav" data-ag="voltar">${L.menu}</button></span></header>
<div class="ag-corpo"><div class="ag-palco">${palco}</div>${this.vista === 'mapa' ? `<aside class="ag-painel${this.preparo ? ' ag-sobreposto' : ''}" ${this.preparo ? 'role="dialog" ' : ''}aria-label="${L.registro}">${painel}</aside>` : this.htmlJanelaBase(painel)}</div>
<p class="ag-anuncio sr-only" id="ag-anuncio" role="status"></p></div>`;
        this.el.setAttribute('aria-label', NOME_AGENCIA[currentLang]);
        this.ligar(); this.atualizarHud();
        if (this.voo) this.iniciarVoo();
        if (anuncio) { const n = this.el.querySelector('#ag-anuncio'); if (n) n.textContent = anuncio; }
        if (focoTitulo) this.focar(); else if (foco) { const n = this.el.querySelector(foco) || this.el.querySelector('#ag-titulo'); if (n && !n.disabled) n.focus({ preventScroll: true }); }
    }
    /** Leva o foco ao título da vista; a tela precisa estar visível. */
    focar() { const h = this.el.querySelector('#ag-titulo'); if (h) h.focus({ preventScroll: true }); const c = this.el.querySelector('.ag-geo'); if (c) c.scrollTop = 0; }

    fala(npc, rotulo, texto) {
        return `<div class="ag-fala"><div class="inv-retrato" aria-hidden="true">${retratoSvg(npc)}</div><div><p class="ag-fala-nome">${rotulo}</p><p class="ag-fala-texto">${texto}</p></div></div>`;
    }

    // ---------- vista: mapa-múndi ----------
    htmlMapa() {
        const L = this.L, lang = currentLang, e = this.est;
        const b = paraPercentual(BASE);
        const pinos = e.ativos.map((x) => {
            const a = alertaPorId(x.id), { x: px, y: py } = paraPercentual(a), d = this.dadosAlerta(a);
            return `<button type="button" class="ag-pino ${a.tipo}${this.sel === a.id ? ' sel' : ''}" style="left:${px.toFixed(2)}%;top:${py.toFixed(2)}%" data-alerta="${a.id}" data-rot="${d.titulo}" aria-label="${d.titulo} · ${a.local[lang]}"><span aria-hidden="true"></span></button>`;
        }).join('');
        let rota = '';
        if (this.voo) {
            const [bx, by] = posicaoSvg(BASE), [dx0, dy0] = posicaoSvg(this.voo.alvo), dx = dx0 + 12, dy = dy0 - 10;  // pousa ao lado do pino, que continua visível
            const mx = (bx + dx) / 2, my = Math.min(by, dy) - Math.min(70, Math.abs(dx - bx) * 0.25 + 12);
            this._arco = `M${bx.toFixed(1)} ${by.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}`;
            rota = `<path d="${this._arco}" class="ag-rota" id="ag-rota"/><circle class="ag-pista" id="ag-pista" cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="10"/><g id="ag-aviao" class="ag-aviao" transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})"><g class="ag-jato"><path class="ag-asa" d="M1 -1.3 L-3 -8.5 L-5.2 -8.5 L-3.6 -1.3 Z M1 1.3 L-3 8.5 L-5.2 8.5 L-3.6 1.3 Z"/><path class="ag-cauda" d="M-5.8 -1 L-8.8 -4.2 L-9.8 -4.2 L-8.2 -0.8 Z M-5.8 1 L-8.8 4.2 L-9.8 4.2 L-8.2 0.8 Z"/><path class="ag-fuselagem" d="M9 0 L3 -1.7 L-7 -1.4 L-9 0 L-7 1.4 L3 1.7 Z"/></g></g>`;
        } else {
            const [bx, by] = posicaoSvg(BASE);
            rota = `<g class="ag-aviao ag-estacionado" transform="translate(${(bx + 13).toFixed(1)} ${(by - 9).toFixed(1)}) scale(1.3) rotate(-20)" aria-hidden="true"><g class="ag-jato"><path class="ag-asa" d="M1 -1.3 L-3 -8.5 L-5.2 -8.5 L-3.6 -1.3 Z M1 1.3 L-3 8.5 L-5.2 8.5 L-3.6 1.3 Z"/><path class="ag-cauda" d="M-5.8 -1 L-8.8 -4.2 L-9.8 -4.2 L-8.2 -0.8 Z M-5.8 1 L-8.8 4.2 L-9.8 4.2 L-8.2 0.8 Z"/><path class="ag-fuselagem" d="M9 0 L3 -1.7 L-7 -1.4 L-9 0 L-7 1.4 L3 1.7 Z"/></g></g>`;
        }
        // naves de resgate e de levantamento em viagem: pontos sobre o arco Base→local, conforme os dias já corridos
        let naves = '';
        if (!this.voo) {
            const [bx, by] = posicaoSvg(BASE);
            for (const n of e.naves) {
                const m = n.missao; if (!m) continue;
                const a = alertaPorId(m.alertaId); if (!a) continue;
                const [dx, dy] = posicaoSvg(a), mx = (bx + dx) / 2, my = Math.min(by, dy) - Math.min(70, Math.abs(dx - bx) * 0.25 + 12);
                const pr = Math.max(0.08, Math.min(0.95, (e.dia - m.saiuEm) / Math.max(1, m.chegaEm - m.saiuEm))), p = m.tipo === 'retorno' ? 1 - pr : pr, q = 1 - p;
                const x = q * q * bx + 2 * q * p * mx + p * p * dx, y = q * q * by + 2 * q * p * my + p * p * dy;
                const ang = Math.atan2(2 * q * (my - by) + 2 * p * (dy - my), 2 * q * (mx - bx) + 2 * p * (dx - mx)) * 180 / Math.PI + (m.tipo === 'retorno' ? 180 : 0);
                const cor = m.tipo === 'levantamento' ? '#ff9628' : '#00ff88';
                naves += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}" fill="none" stroke="${cor}" stroke-width="1" stroke-dasharray="3 4" opacity=".6"/><g class="ag-nave-viagem" data-nave="${n.id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(1.2)"><path d="M9 0 L3 -1.7 L-7 -1.4 L-9 0 L-7 1.4 L3 1.7 Z M1 -1.3 L-3 -7 L-5 -7 L-3.6 -1.3 Z M1 1.3 L-3 7 L-5 7 L-3.6 1.3 Z" fill="${cor}" stroke="#06281a" stroke-width=".5"/></g>`;
            }
        }
        const svg = mapaMundiSvg().replace('</svg>', `${rota}${naves}</svg>`);
        return `<div class="ag-mapa${e.iniciado ? '' : ' ag-parado'}">${svg}<span class="ag-varredura" style="left:${b.x.toFixed(2)}%;top:${b.y.toFixed(2)}%" aria-hidden="true"></span>`
            + `<button type="button" class="ag-base-btn" style="left:${b.x.toFixed(2)}%;top:${b.y.toFixed(2)}%" data-ag="trocar" aria-label="${L.baseMarcador}. ${L.irBase}"><span aria-hidden="true"></span></button>${pinos}</div>`;
    }

    htmlPainelMapa() {
        const L = this.L, e = this.est, lang = currentLang;
        const rel = this.relatorio ? `<p class="ag-relatorio" role="status">${this.relatorio}</p>` : '';
        let corpo = '';
        if (!e.iniciado) {
            corpo = this.fala('marta', L.marta, L.martaTreino) + `<div class="ag-aviso"><p>${L.esperaTreino}</p><button type="button" class="menu-btn" data-ag="sala-academia">${L.irBase}: ${L.sala.academia}</button></div>`;
        } else if (this.voo) {
            corpo = this.htmlVoo();
        } else if (this.preparo && this.preparo.tipo === 'voo') {
            corpo = this.htmlPreparo();
        } else {
            const itens = e.ativos.map((x) => {
                const a = alertaPorId(x.id), d = this.dadosAlerta(a);
                return `<li><button type="button" class="ag-item ${a.tipo}${this.sel === a.id ? ' sel' : ''}" data-alerta="${a.id}" aria-pressed="${this.sel === a.id}"><span class="ag-item-tipo">${this.rotuloTipo(a)}</span><span class="ag-item-titulo">${d.titulo}</span><span class="ag-item-local">${a.local[lang]} · <span class="ag-prazo" data-id="${a.id}">${this.textoPrazo(x)}</span></span></button></li>`;
            }).join('');
            const lista = e.ativos.length ? `<h3 class="ag-lista-titulo">${preencher(L.ativosTitulo, { n: e.ativos.length, max: PARAMETROS.maxAtivos + PARAMETROS.rapidas.max })}</h3><ul class="ag-lista">${itens}</ul>` : `<p class="ag-dica">${L.semAlertas}</p>`;
            corpo = this.fala('marta', L.marta, L.martaMapa) + lista + `<div class="ag-detalhe" id="ag-detalhe" aria-live="polite">${this.sel ? this.htmlDetalhe() : (e.ativos.length ? `<p class="ag-dica">${L.selecione}</p>` : '')}</div>`;
        }
        const hist = e.historico.slice(-6).reverse().map((h) => `<li>${this.textoHistorico(h)}</li>`).join('');
        const emViagem = e.naves.filter((n) => n.missao).map((n) => { const a = alertaPorId(n.missao.alertaId); return `<li>${L.tipoNave[n.tipo]}: ${a ? this.dadosAlerta(a).titulo : ''} · ${preencher(L.viagemNave, { d: n.missao.chegaEm })}</li>`; }).join('');
        const viagens = emViagem ? `<h3 class="ag-lista-titulo">${L.naviosViagem}</h3><ul class="ag-registro">${emViagem}</ul>` : '';
        return rel + corpo + viagens + `<h3 class="ag-lista-titulo">${L.registro}</h3><ul class="ag-registro">${hist || `<li>${L.semRegistro}</li>`}</ul>`;
    }

    htmlDetalhe() {
        const L = this.L, lang = currentLang, a = alertaPorId(this.sel);
        if (!a || !this.est.ativos.some((x) => x.id === a.id)) return '';
        const d = this.dadosAlerta(a), at = this.est.ativos.find((x) => x.id === a.id);
        const km = Math.round(distanciaKm(BASE, a) / 10) * 10, h = Math.max(1, Math.round(horasDeVoo(km)));
        const dif = d.dificuldade ? `<span class="mission-difficulty ${d.dificuldade}">${L.dificuldade}: ${d.dificuldade.toUpperCase()}</span>` : '';
        return `<span class="ag-item-tipo">${this.rotuloTipo(a)}</span><h3>${d.titulo}</h3>`
            + `<p class="ag-item-local">${a.local[lang]}${a.quando ? ' · ' + a.quando[lang] : ''} · ${this.textoPrazo(at)}</p>${dif}`
            + this.htmlBoletim(a, lang)
            + `<p>${d.desc}</p>`
            + this.notaPericia(a)
            + `<p class="ag-nota">${preencher(L.distancia, { km: km.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US'), h })}</p>`
            + `<p class="ag-nota">${a.tipo === 'rapida' ? L.ficticioRapida : a.ficticio ? L.ficticio : (a.tipo === 'missao' ? L.recriacao : '')}</p>`
            + (a.tipo === 'missao' && foiLevantado(this.est, a.id) ? `<p class="ag-nota">✓ ${L.levTit}: ${L.jaLevantado}</p>` : '')
            + `<button type="button" class="menu-btn primary" data-ag="enviar">${L.enviar}</button>`;
    }

    /** v3.37.1: a Perícia explica o bônus da datação (Ato 2) e o prêmio, para o jogador saber por que vale a pena. */
    notaPericia(a) {
        const L = this.L, P = PARAMETROS.premioMissao;
        if (a.pericia) return `<p class="ag-nota">${preencher(L.notaAto1, { v: P.pericia })}</p>`;
        if (a.nivel === 'pericia') return `<p class="ag-nota">${preencher(L.notaAto2, { v: P.pericia, m: Math.round(P.pericia * PARAMETROS.fatorEstrelas[3]) })}</p>`;
        return '';
    }

    /** v3.21: chamado rápido chega como notícia (TV, rádio ou jornal): veículo, manchete e a fala de quem está com receio. */
    htmlBoletim(a, lang) {
        const n = a.noticia; if (a.tipo !== 'rapida' || !n) return '';
        return `<blockquote class="ag-boletim ag-boletim-${n.veiculo.id}"><span class="ag-boletim-veic">${n.veiculo.nome[lang]}</span><strong>${n.manchete[lang]}</strong><q>${n.fala[lang]}</q></blockquote>`;
    }

    htmlVoo() {
        const L = this.L, lang = currentLang, a = this.voo.alvo, d = this.dadosAlerta(a);
        const km = Math.round(distanciaKm(BASE, a) / 10) * 10, h = Math.max(1, Math.round(horasDeVoo(km)));
        if (this.voo.retorno) {
            const n = this.voo.dias;
            return this.htmlCabine() + this.fala('otavio', L.otavio, L.otavioVolta)
                + `<p class="ag-voo-estado" id="ag-voo-estado" role="status">${preencher(L.vooVolta, { origem: a.local[lang] })}</p>`
                + `<div class="ag-barra-voo" role="progressbar" aria-label="${L.barra}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="ag-barra"><span id="ag-barra-cheia"></span></div>`
                + `<div class="ag-cartao"><h3>${L.vooTituloVolta}</h3><p class="ag-nota">${preencher(L.distancia, { km: km.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US'), h })}</p><p class="ag-nota">${preencher(n === 1 ? L.naveVoltaUm : L.naveVolta, { d: n })}</p></div>`
                + `<div class="ag-acoes"><button type="button" class="menu-btn primary" id="ag-chegar" data-ag="chegar">${L.pularViagem}</button></div>`;
        }
        return this.htmlCabine() + this.fala('otavio', L.otavio, L.martaVoo)
            + `<p class="ag-voo-estado" id="ag-voo-estado" role="status">${preencher(L.vooSaindo, { destino: a.local[lang] })}</p>`
            + `<div class="ag-barra-voo" role="progressbar" aria-label="${L.barra}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="ag-barra"><span id="ag-barra-cheia"></span></div>`
            + `<div class="ag-cartao"><h3>${L.briefing}: ${d.titulo}</h3><p>${d.desc}</p><p class="ag-nota">${preencher(L.distancia, { km: km.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US'), h })}</p></div>`
            + `<div class="ag-acoes"><button type="button" class="menu-btn primary" id="ag-chegar" data-ag="chegar">${L.pularViagem}</button><button type="button" class="menu-btn secondary" data-ag="cancelar-voo">${L.cancelarVoo}</button></div>`;
    }

    iniciarVoo() {
        const rota = this.el.querySelector('#ag-rota'), av = this.el.querySelector('#ag-aviao'), barra = this.el.querySelector('#ag-barra'), cheia = this.el.querySelector('#ag-barra-cheia');
        if (!rota) return;
        const total = rota.getTotalLength(), L = this.L, a = this.voo.alvo, lang = currentLang;
        this.voo.chegou = false;
        const volta = !!this.voo.retorno;   // v3.17: voo de volta = mesma rota percorrida ao contrário
        const pos = (prog) => {
            const p = volta ? 1 - prog : prog;
            const pt = rota.getPointAtLength(total * p), q = rota.getPointAtLength(Math.min(total, total * p + 2)), r0 = rota.getPointAtLength(Math.max(0, total * p - 2));
            const ang = Math.atan2(q.y - r0.y, q.x - r0.x) * 180 / Math.PI + (volta ? 180 : 0);
            // decolagem e pouso: o jato "cresce" ao subir e "encolhe" ao descer
            const esc = prog < 0.1 ? 0.7 + 3 * prog : (prog > 0.88 ? 1 - (prog - 0.88) * 1.25 : 1);
            av.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(1.7 * esc).toFixed(2)})`); cheia.style.width = (prog * 100).toFixed(0) + '%'; barra.setAttribute('aria-valuenow', String(Math.round(prog * 100))); };
        rota.style.strokeDasharray = String(total);
        const fim = () => {
            this.voo.chegou = true; pos(1); rota.style.strokeDashoffset = volta ? String(total) : '0'; av.classList.add('pousado'); const pista = this.el.querySelector('#ag-pista'); if (pista && !volta) pista.classList.add('on');
            const est = this.el.querySelector('#ag-voo-estado'); if (est) est.textContent = volta ? L.vooPousouBase : preencher(L.vooChegou, { destino: a.local[lang] });
            const b = this.el.querySelector('#ag-chegar'); if (b) b.textContent = volta ? L.pousarBase : L.chegar;
        };
        if (reduzMovimento()) { this.cabine(null); fim(); return; }
        const comecar = () => {
        const dur = 5200, t0 = performance.now();
        rota.style.strokeDashoffset = String(total);
        const passo = (agora) => {
            const p = Math.min(1, (agora - t0) / dur);
            pos(p); rota.style.strokeDashoffset = String(volta ? total * p : total * (1 - p));
            if (p < 1) this._raf = requestAnimationFrame(passo); else { this._raf = 0; fim(); }
        };
        this._raf = requestAnimationFrame(passo);
        };
        this.cabine(comecar);   // v3.25: primeiro a equipe embarca (só na ida); depois o voo
    }

    // ---------- cabine do transporte (v3.25): embarque, assentos e desembarque ----------
    equipeDoVoo() {
        const ids = (this.equipeSaida && this.equipeSaida.ids) || (this.voo && this.voo.ids) || [];
        return ids.map((id) => this.est.equipe.find((m) => m.id === id)).filter(Boolean).map((m) => ({ id: m.id, nome: m.nome }));
    }
    htmlCabine() { return this.equipeDoVoo().length ? `<div class="ag-cabine" id="ag-cabine" role="img" aria-label="${this.L.cabine}"></div>` : ''; }
    _pintarCabine(svg, vb) { const c = this.el.querySelector('#ag-cabine'); if (c) c.innerHTML = `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${svg}</svg>`; return !!c; }
    /** Ida: a fila sobe a rampa (2,6 s + 0,25 s por pessoa), a rampa fecha e a cabine mostra todos sentados; depois chama `depois`. */
    cabine(depois) {
        const crew = this.equipeDoVoo(), sentados = () => this._pintarCabine(interiorSvg({ equipe: crew, rampa: 0 }), '0 0 260 96');
        if (!crew.length) { if (depois) depois(); return; }
        if (reduzMovimento() || (this.voo && this.voo.retorno)) { sentados(); if (depois) depois(); return; }
        const est = this.el.querySelector('#ag-voo-estado'); if (est) est.textContent = this.L.embarcando;
        const t0 = performance.now(), dur = 2600 + crew.length * 250;
        const passo = (agora) => {
            const t = Math.min(1, (agora - t0) / dur);
            this._pintarCabine(cenaEmbarqueSvg(crew, t, { rampa: t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15 }), VB_EMBARQUE);
            if (t < 1) this._rafC = requestAnimationFrame(passo); else { this._rafC = 0; sentados(); const e2 = this.el.querySelector('#ag-voo-estado'); if (e2 && this.voo && this.voo.alvo) e2.textContent = preencher(this.L.vooSaindo, { destino: this.voo.alvo.local[currentLang] }); if (depois) depois(); }
        };
        this._rafC = requestAnimationFrame(passo);
    }
    /** Chegada: a rampa baixa e a equipe desce, depois chama `depois`. Sem animação se o voo foi pulado ou há movimento reduzido. */
    desembarcar(depois) {
        const crew = this.equipeDoVoo(), v = this.voo;
        if (!v || !v.chegou || v.retorno || !crew.length || reduzMovimento() || !this.el.querySelector('#ag-cabine')) { depois(); return; }
        const est = this.el.querySelector('#ag-voo-estado'); if (est) est.textContent = this.L.desembarcando;
        const t0 = performance.now(), dur = 1400 + crew.length * 250;
        const passo = (agora) => {
            const t = Math.min(1, (agora - t0) / dur);
            this._pintarCabine(cenaEmbarqueSvg(crew, t, { desembarque: true, rampa: 1 }), VB_EMBARQUE);
            if (t < 1) this._rafC = requestAnimationFrame(passo); else { this._rafC = 0; depois(); }
        };
        this._rafC = requestAnimationFrame(passo);
    }

    // ---------- eventos ----------
    ligar() {
        this.el.querySelectorAll('[data-ag]').forEach((b) => b.addEventListener('click', () => this.acao(b)));
        this.el.querySelectorAll('[data-alerta]').forEach((b) => b.addEventListener('click', () => this.selecionar(b.dataset.alerta)));
        this.el.querySelectorAll('[data-vel]').forEach((b) => b.addEventListener('click', () => this.definirVel(Number(b.dataset.vel))));
        this.el.querySelectorAll('[data-sala]').forEach((b) => b.addEventListener('click', () => this.abrirSala(b.dataset.sala, b.dataset.mod)));
        // sons curtos de clique (v3.15): célula da Base = dois tons; demais botões = bip
        this.el.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => audioManager.playClique(b.classList.contains('ag-cel') ? 'sala' : 'menu')));
        this.ligarBase();
    }
    selecionar(id) {
        this.sel = id; this.relatorio = null;
        this.desenhar(false);
        const det = this.el.querySelector('#ag-detalhe');
        if (det && window.innerWidth < 900) det.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' });
    }
    abrirSala(id, mod) { this.normas = false; this.sala = id; this.mod = mod || null; this.vazio = null; this.relatorio = null; this.desenhar(false); }

    acao(b) {
        const k = b.dataset.ag;
        if (k === 'voltar') { this._parar(); this.vel = 0; this.cb.sair(); }
        else if (k === 'trocar') { this.normas = false; this._parar(); this.vel = 0; this.voo = null; this.preparo = null; this.mod = null; this.vazio = null; this.vista = this.vista === 'mapa' ? 'base' : 'mapa'; this.sala = null; this.desenhar(true); }
        else if (k === 'sala-academia') { this.vista = 'base'; this.sala = 'academia'; this.desenhar(true); }
        else if (k === 'passo') this.passoDeTempo(true);
        else if (k === 'enviar') { const a = alertaPorId(this.sel); if (a) { this._parar(); this.vel = 0; this.iniciarPreparo('voo', { alvo: a }); this.desenhar(false); const c = this.el.querySelector('#ag-preparo'); if (c) c.scrollIntoView({ block: 'nearest' }); } }
        else if (k === 'cancelar-voo') { this._parar(); this.voo = null; this.equipeSaida = null; this.desenhar(false); }
        else if (k === 'chegar') { this._parar(); this.desembarcar(() => this.chegar()); }
        else if (k === 'treino' || k === 'academia-completa') { const completa = k === 'academia-completa'; this.alvo = { tipo: 'treino', missaoId: 1, completa }; this.equipeSaida = null; this._parar(); this.vel = 0; this.cb.iniciarMissao(completa ? MISSIONS[0] : TUTORIAL); }
        else if (k === 'pular') { this.cb.pularTreinamento(); if (treinamentoConcluido(this.cb.desbloqueadas()) && !this.est.iniciado) { iniciar(this.est, CUSTOS.creditosIniciais); this.gravar(); } this.desenhar(false); }
        else if (k === 'caderno') this.cb.abrirCaderno();
        else this.acaoBase(k, b);
    }

    chegar() {
        const a = this.voo && this.voo.alvo; if (!a) return;
        if (this.voo.retorno) { this.voo = null; this._parar(); this.gravar(); this.desenhar(true); return; }   // pousou na Base: fica o relatório da missão
        this.alvo = a; this.voo = null;
        if (a.tipo === 'rapida' && a.falso) { prepararFalso(semDe(a.id), alertaRapida(semDe(a.id)).bioma); this.cb.abrirInvestigacao('falso-' + a.falso); }   // v3.21: falso alarme = investigação curta, sem caça a fonte
        else if (a.tipo === 'rapida') this.cb.iniciarMissao(missaoRapida(semDe(a.id), currentLang));
        else if (a.tipo === 'missao') this.cb.iniciarMissao(MISSIONS.find((m) => m.id === a.missaoId));
        else this.cb.abrirInvestigacao(a.invId);
    }
}

Object.assign(AgenciaUI.prototype, metodosBase);
