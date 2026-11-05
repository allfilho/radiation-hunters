// ============================================
// INTERFACE DO COFRE DE TRANSPORTE (DOM, etapa 5e-D). Não conhece o jogo: o gerenciador chama abrir() e espera a Promise.
// A lógica (prateleiras, créditos, blindagem) é toda de cofre.js (funções puras); aqui só se desenha e se lê a entrada.
// Entrada: clique/toque (seleciona a fonte e depois a prateleira), arrastar (Pointer Events) e teclado
// (← → escolhem a fonte, 1 2 3 a prateleira, Esc fecha a ficha; Esc de novo pede confirmação para sair; Tab fica dentro do cofre).
// ============================================
import { audioManager } from '../audio.js';
import {
    TIPOS_COFRE, MATERIAIS, NOME_TIPO, NOME_MATERIAL, guardar, escolherBlindagem, completo, nota,
    prateleirasUsadas, explicarPrateleira, dicaDoErro, explicarBlindagem, citacaoDaRegra,
} from './cofre.js';
import { fichaDe } from './cofre-ficha.js';
import { tx } from './cofre-textos.js';

const el = (tag, cls, texto) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const SIGLA = { alfa: 'α', beta: 'β', gama: 'γ' };
const COR_MATERIAL = { papel: '#e8dcc0', acrilico: '#9fd8ff', aluminio: '#c9ced6', chumbo: '#6b7180', concreto: '#a59f94' };
const pct = (x) => `${Math.round(x * 100)}%`;
const FOCAVEIS = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export class CofreUI {
    constructor() {
        this.modal = document.getElementById('cofre-modal');
        this.raiz = document.getElementById('cofre-corpo');
        this.aberto = false;
        this._tecla = (e) => this.aoTecla(e);
        this._fim = null;
    }

    get ativo() { return !!this.modal && this.modal.classList.contains('active'); }

    /** Fecha sem resolver (usado ao reiniciar ou sair da missão). */
    fechar() {
        if (this.modal) this.modal.classList.remove('active');
        document.removeEventListener('keydown', this._tecla, true);
        document.querySelectorAll('.cf-fantasma').forEach((g) => g.remove());
        this.aberto = false;
    }
    cancelar() {
        const f = this._fim;
        this._fim = null;
        this.fechar();
        if (f) f({ cancelado: true });
    }

    /**
     * @param {object} ctx {estado, fontes, missaoId, titulo, lang}
     * @returns {Promise<{estado, lacrado:boolean}|{cancelado:true}>}
     */
    abrir(ctx) {
        this.ctx = ctx;
        this.lang = ctx.lang === 'en' ? 'en' : 'pt';
        this.estado = ctx.estado;
        this.sel = null;
        this.confirmando = false;
        this.resumo = false;
        this.fichaAberta = false;
        this.retornoMsg = { titulo: '', texto: tx('inicio', this.lang), tipo: '' };
        this.fonteDe = new Map();
        for (const f of ctx.fontes || []) if (f && f.name && !this.fonteDe.has(f.name)) this.fonteDe.set(f.name, f);
        this.aberto = true;
        this.modal.classList.add('active');
        document.addEventListener('keydown', this._tecla, true);
        this.montar();
        this.desenhar();
        const primeira = this.raiz.querySelector('.cf-fonte');
        if (primeira) primeira.focus({ preventScroll: true });
        return new Promise((ok) => { this._fim = ok; });
    }

    _resolver(v) {
        const f = this._fim;
        this._fim = null;
        this.fechar();
        if (f) f(v);
    }

    t(chave, ...a) { return tx(chave, this.lang, ...a); }
    nomeTipo(k) { return NOME_TIPO[k][this.lang]; }
    toca(ok) { try { ok ? audioManager.playSuccess() : audioManager.playError(); } catch (e) { /* sem áudio */ } }
    num(x, casas) {
        const s = String(Number(x.toPrecision(casas)));
        return this.lang === 'en' ? s : s.replace('.', ',');
    }

    // ---------- esqueleto ----------
    montar() {
        const r = this.raiz;
        r.replaceChildren();
        this.modal.setAttribute('aria-labelledby', 'cf-titulo');
        this.modal.setAttribute('aria-modal', 'true');
        this.modal.setAttribute('role', 'dialog');
        this.modal.lang = this.lang === 'en' ? 'en' : 'pt-BR';

        const topo = el('header', 'cf-topo');
        const sigla = el('div', 'cf-trifolio', '☢');
        sigla.setAttribute('aria-hidden', 'true');
        const tit = el('div', 'cf-tit');
        const h1 = el('h2', 'cf-h1', this.t('titulo'));
        h1.id = 'cf-titulo';
        tit.append(h1, el('p', 'cf-sub', `${this.ctx.titulo || ''} · ${this.t('relogioParado')}`));
        this.progEl = el('span', 'cf-prog');
        this.barraEl = el('i');
        const barra = el('span', 'cf-barra');
        barra.setAttribute('aria-hidden', 'true');
        barra.append(this.barraEl);
        this.btnSair = el('button', 'cf-fechar', '×');
        this.btnSair.type = 'button';
        this.btnSair.setAttribute('aria-label', this.t('sair'));
        this.btnSair.addEventListener('click', () => this.pedirSaida());
        const dir = el('div', 'cf-direita');
        dir.append(this.progEl, barra, this.btnSair);
        topo.append(sigla, tit, dir);

        this.regraEl = el('p', 'cf-regra', this.t('regra'));
        this.corpoEl = el('div', 'cf-corpo');
        this.areaEl = el('div', 'cf-area');
        this.topoEl = el('div', 'cf-area-topo');   // bandeja e prateleiras: redesenhados
        this.baseEl = el('div', 'cf-area-base');   // rodapé e confirmação: redesenhados
        this.fichaWrap = el('aside', 'cf-ficha-wrap');
        this.fichaWrap.setAttribute('aria-label', this.t('fichaDe'));
        const alca = el('button', 'cf-ficha-fechar');
        alca.type = 'button';
        alca.setAttribute('aria-label', this.t('fichaFechar'));
        alca.addEventListener('click', () => {
            this.fichaAberta = false; this.fichaWrap.classList.remove('aberta');
            const b = this.raiz.querySelector('.cf-fonte'); if (b) b.focus({ preventScroll: true });
        });
        this.fichaEl = el('div', 'cf-ficha vazia', this.t('fichaVazia'));
        this.fichaWrap.append(alca, this.fichaEl);
        this.corpoEl.append(this.areaEl, this.fichaWrap);

        this.retornoEl = el('div', 'cf-retorno');   // anexado UMA vez: a região viva não sai do DOM (leitores de tela anunciam a troca de texto)
        this.retornoEl.setAttribute('role', 'status');
        this.retornoEl.setAttribute('aria-live', 'polite');
        this.areaEl.append(this.topoEl, this.retornoEl, this.baseEl);
        this.resumoEl = el('div', 'cf-resumo');
        this.resumoEl.setAttribute('role', 'status');
        this.resumoEl.tabIndex = -1;
        r.append(topo, this.regraEl, this.corpoEl, this.resumoEl);
    }

    // ---------- desenho ----------
    cartao(it, guardada) {
        const fonte = this.fonteDe.get(it.nome) || {};
        const b = el('button', 'cf-fonte' + (guardada ? ' guardada' : ''));
        b.type = 'button';
        b.style.setProperty('--c', fonte.color || '#cccccc');
        b.dataset.nome = it.nome;
        b.setAttribute('aria-pressed', this.sel === it.nome ? 'true' : 'false');
        const simb = el('span', 'cf-simb', it.nome.split('-')[0]);
        simb.setAttribute('aria-hidden', 'true');
        b.append(simb, el('span', 'cf-nome', it.nome));
        if (it.n > 1) b.append(el('span', 'cf-n', `×${it.n}`));
        if (guardada) {
            const sig = it.cred === 1 ? 'seloOk' : it.cred > 0 ? 'selo2' : 'seloCofre';
            const selo = el('span', 'cf-selo', it.cred === 1 ? '✓' : it.cred > 0 ? this.t('selo2sigla') : '×');
            selo.setAttribute('aria-hidden', 'true');
            b.title = this.t(sig);
            b.append(selo);
        }
        const rot = `${it.nome}, ${this.t('nFontes', it.n)}` + (guardada ? `, ${this.t('guardada', it.nome, this.nomeTipo(it.guardada))} ${this.t(it.cred === 1 ? 'seloOk' : it.cred > 0 ? 'selo2' : 'seloCofre')}` : '');
        b.setAttribute('aria-label', rot);
        b.addEventListener('click', () => { if (!this._arrastou) this.selecionar(it.nome); });
        if (!guardada) this.arrastavel(b, it);
        return b;
    }

    itemDe(nome) { return this.estado.itens.find((i) => i.nome === nome); }

    /** Identifica o elemento focado para reencontrá-lo depois de redesenhar (desenhar() recria os botões). */
    chaveDoFoco() {
        const f = document.activeElement;
        if (!f || !this.modal.contains(f)) return null;
        if (f.classList.contains('cf-fonte')) return `.cf-fonte[data-nome="${f.dataset.nome}"]`;
        const prat = f.closest && f.closest('.cf-prat');
        if (f.classList.contains('cf-mat') && prat) return `.cf-prat.${prat.dataset.prat} .cf-mat[data-material="${f.dataset.material}"]`;
        if (f.classList.contains('cf-prat-btn') && prat) return `.cf-prat.${prat.dataset.prat} .cf-prat-btn`;
        if (f.classList.contains('cf-fechar')) return '.cf-fechar';
        if (f.classList.contains('cf-lacrar')) return '.cf-lacrar';
        return null;
    }
    devolverFoco(chave) {
        if (!chave) return;
        let alvo = this.raiz.querySelector(chave);
        if (!alvo || alvo.disabled) alvo = this.raiz.querySelector('.cf-fonte') || this.raiz.querySelector('.cf-lacrar:not([disabled])') || this.btnSair;
        if (alvo) alvo.focus({ preventScroll: true });
    }

    desenhar() {
        const e = this.estado;
        const livres = e.itens.filter((i) => !i.guardada);
        const area = this.topoEl, base = this.baseEl;
        const antesFoco = this.chaveDoFoco();
        area.replaceChildren();
        base.replaceChildren();

        // bandeja
        const bloco = el('div');
        const rot = el('p', 'cf-rotulo', this.t('bandeja'));
        rot.id = 'cf-r-band';
        const band = el('div', 'cf-bandeja');
        band.setAttribute('role', 'group');
        band.setAttribute('aria-labelledby', 'cf-r-band');
        if (livres.length) livres.forEach((i) => band.append(this.cartao(i, false)));
        else band.append(el('span', 'cf-vazio', this.t('bandejaVazia')));
        bloco.append(rot, band);
        area.append(bloco);

        // prateleiras
        const pr = el('div', 'cf-prateleiras');
        const alvo = !!this.sel && !this.itemDe(this.sel).guardada;
        TIPOS_COFRE.forEach((k, idx) => {
            const itens = e.itens.filter((i) => i.guardada === k);
            const d = el('div', `cf-prat ${k}` + (itens.length ? ' tem' : '') + (alvo ? ' alvo' : ''));
            d.dataset.prat = k;
            const cab = el('div', 'cf-prat-cab');
            const letra = el('span', 'cf-letra', SIGLA[k]);
            letra.setAttribute('aria-hidden', 'true');
            const btn = el('button', 'cf-prat-btn');
            btn.type = 'button';
            btn.append(el('span', 'cf-tit-prat', cap(this.nomeTipo(k))), el('span', 'cf-tecla', String(idx + 1)));
            btn.setAttribute('aria-label', alvo ? this.t('guardarEm', this.sel, this.nomeTipo(k)) : this.t('prateleira', cap(this.nomeTipo(k))));
            btn.disabled = !alvo;
            btn.addEventListener('click', (ev) => { ev.stopPropagation(); if (alvo) this.tentarGuardar(this.sel, k); });
            cab.append(letra, btn, el('span', 'cf-dica', this.t('dica_' + k)));
            const dir = el('div', 'cf-prat-dir');
            const baia = el('div', 'cf-baia');
            baia.setAttribute('role', 'group');
            baia.setAttribute('aria-label', this.t('prateleira', cap(this.nomeTipo(k))));
            if (!itens.length) baia.classList.add('vazia');
            if (itens.length) itens.forEach((i) => baia.append(this.cartao(i, true)));
            else baia.append(el('span', 'cf-vazio', this.t('baiaVazia')));
            dir.append(baia);
            d.append(cab, dir);
            if (itens.length) d.append(this.blindagemDe(k));
            d.addEventListener('click', () => { if (this.sel && !this.itemDe(this.sel).guardada) this.tentarGuardar(this.sel, k); });
            pr.append(d);
        });
        area.append(pr);

        // retorno
        const ret = this.retornoEl;
        ret.className = 'cf-retorno ' + (this.retornoMsg.tipo || '');
        const novoTexto = (this.retornoMsg.titulo ? this.retornoMsg.titulo + ' ' : '') + this.retornoMsg.texto;
        if (ret.textContent !== novoTexto) {
            ret.replaceChildren();
            if (this.retornoMsg.titulo) ret.append(el('b', '', this.retornoMsg.titulo + ' '));
            ret.append(document.createTextNode(this.retornoMsg.texto));
        }

        // rodapé
        const rod = el('div', 'cf-rodape');
        rod.append(el('span', 'cf-atalhos cf-atalhos-teclado', this.t('atalhos')), el('span', 'cf-atalhos cf-atalhos-toque', this.t('arrastar')));
        this.btnLacrar = el('button', 'cf-lacrar', this.t('lacrar'));
        this.btnLacrar.type = 'button';
        this.btnLacrar.disabled = !completo(e);
        this.btnLacrar.addEventListener('click', () => this.lacrar());
        rod.append(this.btnLacrar);
        base.append(rod);

        if (this.confirmando) base.append(this.caixaConfirmar());

        this.devolverFoco(antesFoco);

        // progresso
        const n = e.itens.length - livres.length;
        this.progEl.textContent = this.t('progresso', n, e.itens.length);
        this.barraEl.style.width = (e.itens.length ? 100 * n / e.itens.length : 0) + '%';
    }

    blindagemDe(k) {
        const e = this.estado, L = this.lang;
        const bl = el('div', 'cf-blind');
        bl.setAttribute('role', 'group');
        bl.setAttribute('aria-label', this.t('blindagemDa', this.nomeTipo(k)));
        bl.append(el('span', 'cf-rotulo', this.t('blindagem')));
        for (const m of MATERIAIS) {
            const b = el('button', 'cf-mat');
            b.type = 'button';
            b.dataset.material = m;
            b.setAttribute('aria-pressed', e.blind[k] === m ? 'true' : 'false');
            if (e.blind[k] === m) {   // selo pelo crédito: ✓ só se a escolha foi a certa (1), ≈ se funciona mas não é a melhor, × se não protege
                const c = e.credBlind[k] ?? 0, sig = c >= 1 ? 'blindOk' : c > 0 ? 'blindParcial' : 'blindErrada';
                b.classList.add(c >= 1 ? 'ok' : c > 0 ? 'parcial' : 'errada');
                b.title = this.t(sig);
                b.setAttribute('aria-description', this.t(sig));
            }
            const cor = el('i');
            cor.style.background = COR_MATERIAL[m];
            cor.setAttribute('aria-hidden', 'true');
            b.append(cor, document.createTextNode(NOME_MATERIAL[m][L]));
            if (e.blind[k] === m) {
                const c = e.credBlind[k] ?? 0, selo = el('span', 'cf-mat-selo', c >= 1 ? '✓' : c > 0 ? '≈' : '×');
                selo.setAttribute('aria-hidden', 'true');
                b.append(selo);
            }
            if (e.blind[k]) b.setAttribute('aria-disabled', 'true');   // já escolhida: continua focável para o leitor de tela ler a escolha
            b.addEventListener('click', (ev) => { ev.stopPropagation(); this.tentarBlindagem(k, m); });
            bl.append(b);
        }
        if (e.blind[k]) bl.append(el('span', 'cf-blind-nota', this.t('blindTravada')));
        return bl;
    }

    caixaConfirmar() {
        const c = el('div', 'cf-confirmar');
        c.setAttribute('role', 'alertdialog');
        c.setAttribute('aria-label', this.t('sairPergunta'));
        c.append(el('p', '', this.t('sairPergunta')));
        const sim = el('button', 'cf-btn perigo', this.t('sairSim'));
        sim.type = 'button';
        sim.addEventListener('click', () => this.encerrar(false));
        const nao = el('button', 'cf-btn', this.t('sairNao'));
        nao.type = 'button';
        nao.addEventListener('click', () => { this.confirmando = false; this.desenhar(); if (this.btnSair) this.btnSair.focus({ preventScroll: true }); });
        const l = el('div', 'cf-confirmar-bt');
        l.append(nao, sim);
        c.append(l);
        queueMicrotask(() => nao.focus({ preventScroll: true }));
        return c;
    }

    // ---------- ficha ----------
    desenharFicha(nome) {
        const fonte = this.fonteDe.get(nome), it = this.itemDe(nome);
        if (!fonte || !it) return;
        const f = fichaDe(fonte, this.ctx.missaoId, this.lang, it.n), L = this.lang, g = !!it.guardada;
        const w = this.fichaEl;
        w.className = 'cf-ficha';
        w.style.setProperty('--c', f.cor || '#cccccc');
        w.replaceChildren();

        const cab = el('div', 'cf-f-cab');
        const s = el('span', 'cf-f-simb', f.simbolo);
        s.setAttribute('aria-hidden', 'true');
        const h = el('div');
        h.append(el('h3', '', f.nomeCompleto), el('span', 'cf-f-iso', `${f.nome} · ${this.t('nFontes', f.n)}`));
        cab.append(s, h);
        w.append(cab);

        const hist = el('p', 'cf-f-hist');
        f.historia.forEach((x, i) => {
            if (i) hist.append(document.createElement('br'));
            hist.append(el('span', 'cf-tag', x.kind === 'fato' ? this.t('tagFato') : this.t('tagJogo')), document.createTextNode(x.texto));
        });
        w.append(hist);

        const dl = el('dl', 'cf-f-grade');
        dl.append(el('dt', '', this.t('meiaVida')), el('dd', '', f.meiaVida), el('dt', '', this.t('sinal')), el('dd', '', this.t('sinalValor')));
        w.append(dl);

        w.append(el('p', 'cf-f-sec', this.t('emissoes')));
        const em = el('div', 'cf-emis');
        for (const e of f.emissoes) {
            const linha = el('div', 'cf-em ' + e.tipo + (e.decide && g ? ' decide' : ''));
            const t = el('span', 'cf-em-t', e.sigla);
            t.setAttribute('aria-hidden', 'true');
            const barra = el('span', 'cf-em-b');
            const i = el('i');
            i.style.width = e.barra + '%';
            barra.append(i);
            barra.setAttribute('role', 'img');
            barra.setAttribute('aria-label', `${this.nomeTipo(e.tipo)}: ${e.texto} / 100`);
            const v = el('span', 'cf-em-v', e.texto);
            const d = el('span', 'cf-em-e', e.energias + (e.decide && g ? ` · ${this.t('decide')}` : ''));
            linha.append(t, barra, v, d);
            em.append(linha);
        }
        w.append(em);

        const notas = [g ? explicarPrateleira(f.nome, L) : this.t('pergunta')];
        if (f.nota) notas.push(f.nota);
        if (f.chumbo) notas.push(this.t('chumbo', this.num(f.chumbo.hvlCm, 2), this.num(f.chumbo.milCm, 3)));
        notas.forEach((n) => w.append(el('p', 'cf-nota', n)));

        w.append(el('p', 'cf-f-sec', this.t('geiger')));
        const tab = el('table', 'cf-geiger');
        const thead = el('thead'), tr = el('tr');
        tr.append(el('th'));
        const ABREV = { aluminio: 'Al', acrilico: L === 'en' ? 'acrylic' : 'acrílico', chumbo: 'Pb', concreto: L === 'en' ? 'concrete' : 'concreto' };
        f.geiger.colunas.forEach((c) => tr.append(el('th', '', c.material ? `${ABREV[c.material]} ${this.num(c.cm * 10, 2)} mm` : this.t('semBlind'))));
        thead.append(tr);
        const tb = el('tbody');
        for (const l of f.geiger.linhas) {
            const r = el('tr');
            const c0 = el('th', '', l.sigla);
            c0.scope = 'row';
            c0.setAttribute('aria-label', this.nomeTipo(l.tipo));
            r.append(c0);
            if (l.contato) {
                const c = el('td', 'cf-contato', this.t('contato'));
                c.colSpan = 4;
                r.append(c);
            } else l.valores.forEach((v) => r.append(el('td', v < 0.005 ? 'z' : '', pct(v))));
            tb.append(r);
        }
        tab.append(thead, tb);
        w.append(tab);
        w.append(el('p', 'cf-f-fonte', `${this.t('fonteLabel')}: ${f.fonteDados}`));
        if (g && citacaoDaRegra(it.guardada)) w.append(el('p', 'cf-f-fonte cf-f-regra', `${this.t('regraBlind')}: ${citacaoDaRegra(it.guardada)}`));

        if (!g) {
            const ac = el('div', 'cf-f-acoes');
            TIPOS_COFRE.forEach((k) => {
                const b = el('button', '');
                b.type = 'button';
                const sg = el('span', '', SIGLA[k]);
                sg.setAttribute('aria-hidden', 'true');
                b.append(sg, document.createTextNode(`${this.t('guardar')} ${this.nomeTipo(k)}`));
                b.addEventListener('click', () => this.tentarGuardar(nome, k));
                ac.append(b);
            });
            w.append(ac);
        }
    }

    // ---------- ações ----------
    /** No celular a ficha cobre 72% da tela (bandeja, retorno e prateleiras): depois de guardar ou errar, ela fecha para o aluno ver o resultado. */
    fecharFichaNoCelular() {
        // Lê o próprio CSS (a ficha só é um painel inferior fixo quando a tela é estreita): sem número duplicado entre JS e CSS
        if (getComputedStyle(this.fichaWrap).position !== 'fixed') return;
        this.fichaAberta = false;
        this.fichaWrap.classList.remove('aberta');
    }

    selecionar(nome) {
        const it = this.itemDe(nome);
        if (!it) return;
        if (!it.guardada) { this.sel = nome; this.retornoMsg = { titulo: '', texto: this.t('selecionada', nome), tipo: '' }; }
        else this.sel = null;
        this.confirmando = false;
        this.desenhar();
        this.desenharFicha(nome);
        this.fichaAberta = true;
        this.fichaWrap.classList.add('aberta');
        const b = this.raiz.querySelector(`.cf-fonte[data-nome="${nome}"]`);
        if (b) b.focus({ preventScroll: true });
    }

    tentarGuardar(nome, prat) {
        const r = guardar(this.estado, nome, prat);
        if (r.invalido) return;
        this.estado = r.estado;
        const L = this.lang;
        if (r.ok) {
            this.retornoMsg = { titulo: this.t('guardada', nome, cap(this.nomeTipo(prat))), texto: explicarPrateleira(nome, L), tipo: 'ok' };
            this.sel = null;
        } else if (r.revelou) {
            const certa = this.itemDe(nome).guardada;
            this.retornoMsg = { titulo: this.t('vaiPara', nome, cap(this.nomeTipo(certa))), texto: explicarPrateleira(nome, L), tipo: 'erro' };
            this.sel = null;
        } else {
            this.retornoMsg = { titulo: this.t('ainda'), texto: `${dicaDoErro(nome, prat, L)} ${this.t('tente')}`, tipo: 'erro' };
        }
        this.toca(r.ok);
        this.desenhar();
        this.desenharFicha(nome);
        this.fecharFichaNoCelular();
        this.retornoEl.scrollIntoView({ block: 'nearest' });   // celular: depois da última fonte o retorno ficava abaixo da dobra
        if (!r.ok && !r.revelou) {
            const p = this.raiz.querySelector(`.cf-prat.${prat}`);
            if (p) { p.classList.remove('treme'); void p.offsetWidth; p.classList.add('treme'); }
        }
        const prox = this.estado.itens.find((i) => !i.guardada);
        const alvoFoco = (r.ok || r.revelou) && prox
            ? this.raiz.querySelector(`.cf-fonte[data-nome="${prox.nome}"]`)
            : this.raiz.querySelector(`.cf-fonte[data-nome="${nome}"]`);
        if (alvoFoco) alvoFoco.focus({ preventScroll: true });
        else if (this.btnLacrar && !this.btnLacrar.disabled) this.btnLacrar.focus({ preventScroll: true });
    }

    tentarBlindagem(prat, material) {
        const r = escolherBlindagem(this.estado, prat, material);
        if (r.invalido) return;
        this.estado = r.estado;
        this.retornoMsg = { titulo: this.t('blindEscolhida', cap(this.nomeTipo(prat))), texto: explicarBlindagem(prat, material, this.lang, this.estado.itens.filter((i) => i.guardada === prat).map((i) => i.nome)), tipo: r.credito >= 1 ? 'ok' : 'erro' };
        this.toca(r.credito >= 1);
        this.fecharFichaNoCelular();
        this.desenhar();
        if (this.btnLacrar && !this.btnLacrar.disabled) this.btnLacrar.focus({ preventScroll: true });
    }

    pedirSaida() {
        if (this.resumo) return;
        this.confirmando = true;
        this.desenhar();
    }

    lacrar() {
        if (completo(this.estado)) this.encerrar(true);
    }

    /** Mostra o resumo e espera "Voltar ao campo". */
    encerrar(lacrado) {
        this.resumo = true;
        this.confirmando = false;
        const e = this.estado, L = this.lang, r = this.resumoEl;
        r.replaceChildren();
        this.corpoEl.style.display = 'none';
        this.regraEl.style.display = 'none';
        const h = el('h3', 'cf-res-h', lacrado ? this.t('resumoTitulo') : this.t('resumoSaiu'));
        h.id = 'cf-res-h';
        const lista = el('div', 'cf-res-lista');
        lista.id = 'cf-res-lista';
        const linha = (rot, c) => {
            const d = el('div', 'cf-res-item');
            d.append(el('span', '', rot), el('b', '', pct(c)));
            lista.append(d);
        };
        for (const i of e.itens) linha(i.guardada ? this.t('itemNaPrat', i.nome, this.nomeTipo(i.guardada)) : this.t('itemNaoGuardado', i.nome), i.cred ?? 0);
        for (const k of prateleirasUsadas(e.itens)) {
            const m = e.blind[k];
            linha(this.t('itemBlind', this.nomeTipo(k), m ? NOME_MATERIAL[m][L].toLowerCase() : '—'), e.credBlind[k] ?? 0);
        }
        const pts = nota(e) * 10;
        const total = el('p', 'cf-res-total', this.t('pontos', this.num(Math.round(pts * 10) / 10, 3)));
        total.id = 'cf-res-total';
        const cad = el('p', 'cf-atalhos', this.t('caderno'));
        const voltar = el('button', 'cf-lacrar', this.t('voltar'));
        voltar.type = 'button';
        voltar.setAttribute('aria-describedby', 'cf-res-h cf-res-lista cf-res-total');   // o foco vai para o botão: o leitor de tela lê o resumo junto
        voltar.addEventListener('click', () => this._resolver({ estado: this.estado, lacrado }));
        r.append(h, lista, total, cad, voltar);
        r.style.display = 'flex';
        voltar.focus({ preventScroll: true });
    }

    // ---------- arrastar (mouse e toque, Pointer Events) ----------
    arrastavel(b, it) {
        let ini = null, fant = null;
        b.addEventListener('pointerdown', (e) => {
            if (e.button !== undefined && e.button > 0) return;
            if (e.pointerType === 'touch') return;   // no toque o dedo rola a tela; guardar é por toque na fonte e depois na ficha/prateleira
            ini = { x: e.clientX, y: e.clientY };
            this._arrastou = false;
        });
        b.addEventListener('pointermove', (e) => {
            if (!ini) return;
            if (!fant && Math.hypot(e.clientX - ini.x, e.clientY - ini.y) > 10) {
                try { b.setPointerCapture(e.pointerId); } catch (x) { /* sem captura */ }
                fant = b.cloneNode(true);
                fant.classList.add('cf-fantasma');
                fant.removeAttribute('aria-label');
                fant.setAttribute('aria-hidden', 'true');
                document.body.append(fant);
                this._arrastou = true;
                this.sel = it.nome;
                this.raiz.querySelectorAll('.cf-prat').forEach((p) => p.classList.add('alvo'));
            }
            if (fant) {
                fant.style.left = (e.clientX - 30) + 'px';
                fant.style.top = (e.clientY - 26) + 'px';
                this.raiz.querySelectorAll('.cf-prat').forEach((p) => {
                    const r = p.getBoundingClientRect();
                    p.classList.toggle('sobre', e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
                });
            }
        });
        b.addEventListener('pointerup', () => {
            if (fant) {
                const alvo = this.raiz.querySelector('.cf-prat.sobre');
                fant.remove();
                fant = null;
                if (alvo) this.tentarGuardar(it.nome, alvo.dataset.prat);
                else this.selecionar(it.nome);
                setTimeout(() => { this._arrastou = false; }, 0);
            }
            ini = null;
        });
        b.addEventListener('pointercancel', () => {
            if (fant) { fant.remove(); fant = null; }
            ini = null;
            this._arrastou = false;
            this.raiz.querySelectorAll('.cf-prat').forEach((p) => p.classList.remove('sobre'));
        });
    }

    // ---------- teclado ----------
    aoTecla(e) {
        if (!this.aberto) return;
        e.stopPropagation();   // o Phaser e o Esc global não veem nenhuma tecla enquanto o cofre está aberto
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === 'Tab') { this.prenderFoco(e); return; }
        if (this.resumo) { if (e.key === 'Escape') e.preventDefault(); return; }
        if (e.key === 'Escape') {
            e.preventDefault();
            if (this.confirmando) { this.confirmando = false; this.desenhar(); if (this.btnSair) this.btnSair.focus({ preventScroll: true }); }
            else if (this.sel || this.fichaAberta) {
                this.sel = null; this.fichaAberta = false; this.fichaWrap.classList.remove('aberta');
                this.desenhar();
                if (!this.modal.contains(document.activeElement)) { const b = this.raiz.querySelector('.cf-fonte'); if (b) b.focus({ preventScroll: true }); }
            } else this.pedirSaida();
            return;
        }
        if (this.confirmando) return;
        if (['1', '2', '3'].includes(e.key) && this.sel && !this.itemDe(this.sel).guardada) {
            e.preventDefault();
            this.tentarGuardar(this.sel, TIPOS_COFRE[+e.key - 1]);
            return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !(e.target.closest && e.target.closest('.cf-blind'))) {
            const livres = this.estado.itens.filter((i) => !i.guardada);
            if (!livres.length) return;
            e.preventDefault();
            const i = livres.findIndex((x) => x.nome === this.sel);
            const j = i < 0 ? 0 : (i + (e.key === 'ArrowRight' ? 1 : -1) + livres.length) % livres.length;
            this.selecionar(livres[j].nome);
        }
    }

    prenderFoco(e) {
        const lista = [...this.modal.querySelectorAll(FOCAVEIS)].filter((x) => (x.offsetParent !== null && getComputedStyle(x).visibility !== 'hidden') || x === document.activeElement);
        if (!lista.length) { e.preventDefault(); return; }
        const primeiro = lista[0], ultimo = lista[lista.length - 1], ativo = document.activeElement;
        if (!this.modal.contains(ativo)) { e.preventDefault(); primeiro.focus(); }
        else if (e.shiftKey && ativo === primeiro) { e.preventDefault(); ultimo.focus(); }
        else if (!e.shiftKey && ativo === ultimo) { e.preventDefault(); primeiro.focus(); }
    }
}
