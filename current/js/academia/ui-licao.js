// ============================================
// Painel de lição da Academia (DOM). Não conhece o jogo: recebe a lição, devolve via callbacks.
// Teclas: 1-3 escolhem alternativa, Enter/Espaço avança, Esc = "depois".
// ============================================
import { LICOES, txt } from './licoes.js';
import { mastro } from '../jornal/jornal.js';
import { limitePorTela, paginarParagrafos, rotuloParte, TXT_PAG } from '../paginar.js';

const el = (tag, cls, texto) => { const e = document.createElement(tag); if (cls) e.className = cls; if (texto !== undefined) e.textContent = texto; return e; };

export class LicaoUI {
    constructor() {
        this.modal = document.createElement('div');
        this.modal.id = 'licao-modal';
        this.modal.className = 'modal';
        this.modal.setAttribute('role', 'dialog');
        this.modal.setAttribute('aria-modal', 'true');
        this.corpo = el('div', 'modal-content encontro-content licao-content');
        this.modal.appendChild(this.corpo);
        document.body.appendChild(this.modal);
        this.aberta = false;
        this._tecla = (e) => this.aoTecla(e);
    }

    get ativo() { return this.modal.classList.contains('active'); }

    /** Abre a lição `indice` no idioma `lang`. aoConcluir() quando percorreu o quiz e seus retornos (não comprova domínio); aoAdiar() para "depois". */
    abrir(indice, lang, aoConcluir, aoAdiar, opcoes = {}) {
        const base = opcoes.licao || LICOES[indice];   // `licao`: lição extra (licoes-extra.js), fora das 8 lineares
        const L = base[lang] || base.en;
        this.estado = { indice, base, lang, L, p: -1, aoConcluir, aoAdiar, respondida: false, revisao: !!opcoes.revisao };
        this.aberta = true;
        this.modal.classList.add('active', 'enc-jornal');
        document.addEventListener('keydown', this._tecla, true);
        this.mostrarTeoria();
    }

    mastro() {
        const m = mastro(null, this.estado.lang, { formato: 'mc' }), d = el('div', 'enc-mastro');
        d.append(el('span', 'enc-mastro-nome', m.nome), el('span', 'enc-mastro-data', ''), el('span', 'enc-mastro-secao', this.estado.lang === 'pt' ? 'Ciência em foco' : 'Science in focus'));
        return d;
    }

    fechar() {
        if (!this.aberta) return;
        this.aberta = false;
        this.modal.classList.remove('active');
        document.removeEventListener('keydown', this._tecla, true);
        this.corpo.innerHTML = '';
    }

    /** Teoria em partes: parágrafos agrupados por tamanho de tela; a demo (se houver) tem parte própria;
     *  a fonte fica na última. Voltar/Próximo; só a última parte oferece "Ir para o quiz" (ou "Fechar" na revisão). */
    mostrarTeoria(parte = 0) {
        const s = this.estado, { L, lang } = s;
        if (!s.partes) {
            const lim = limitePorTela(window.innerWidth, window.innerHeight, { reserva: 300, larguraMax: 600 });
            s.partes = paginarParagrafos(L.paragrafos, lim).map((pars) => ({ pars }));
            if (s.base.demo === 'meiavida') s.partes.push({ demo: true });
        }
        const n = s.partes.length;
        s.parte = Math.max(0, Math.min(n - 1, parte));
        const ultima = s.parte === n - 1;
        const P = s.partes[s.parte];
        this.corpo.innerHTML = '';
        this.corpo.append(this.mastro());   // v3.22: lição e quiz saem na seção de ciência da Gazeta
        this.corpo.setAttribute('aria-label', L.titulo);
        this.corpo.append(el('h2', 'licao-titulo', L.titulo));
        const area = el('div', 'licao-texto');
        for (const par of P.pars || []) area.append(el('p', 'licao-par', par));
        if (P.demo) area.append(this.criarDemoMeiaVida(lang));
        if (ultima) area.append(el('p', 'licao-fonte', txt(lang, 'fonteRotulo') + ': ' + L.fonte));
        this.corpo.append(area);
        if (n > 1) this.corpo.append(el('p', 'licao-parte', rotuloParte(lang, s.parte + 1, n)));
        const bar = el('div', 'licao-botoes');
        const mk = (cls, rotulo, fn, id) => { const b = el('button', cls, rotulo); if (id) b.id = id; b.addEventListener('click', fn); return b; };
        const T = TXT_PAG[lang] || TXT_PAG.en;
        if (s.parte > 0) bar.append(mk('modal-btn cancel-btn', T.voltar, () => this.mostrarTeoria(s.parte - 1), 'licao-voltar'));
        let foco;
        if (!ultima) {
            if (s.parte === 0 && !s.revisao) bar.append(mk('modal-btn cancel-btn', txt(lang, 'depois'), () => this.adiar()));
            foco = mk('modal-btn licao-primario', T.prox, () => this.mostrarTeoria(s.parte + 1), 'licao-proxima');
        } else if (s.revisao) {
            foco = mk('modal-btn licao-primario', txt(lang, 'fechar'), () => this.adiar(), 'licao-fechar');
        } else {
            bar.append(mk('modal-btn cancel-btn', txt(lang, 'depois'), () => this.adiar()));
            foco = mk('modal-btn licao-primario', txt(lang, 'iniciar'), () => this.proximaPergunta(), 'licao-iniciar');
        }
        bar.append(foco);
        this.corpo.append(bar);
        foco.focus();
    }

    /** Modelo de jogo [H]: 64 átomos; a cada passo cada átomo restante decai com 50% de chance. */
    criarDemoMeiaVida(lang) {
        const N = 64;
        const caixa = el('div', 'licao-demo');
        caixa.append(el('p', 'licao-demo-titulo', txt(lang, 'demoTitulo')));
        const grade = el('div', 'licao-grade');
        grade.setAttribute('aria-hidden', 'true');
        const cel = Array.from({ length: N }, () => grade.appendChild(el('span', 'licao-atomo')));
        const info = el('p', 'licao-demo-info'); info.setAttribute('aria-live', 'polite');
        let vivos, passo;
        const fmt = (x) => (Math.round(x * 10) / 10).toString().replace('.', lang === 'pt' ? ',' : '.');
        const mostrar = () => {
            cel.forEach((c, i) => c.classList.toggle('vivo', vivos[i]));
            const r = vivos.filter(Boolean).length;
            info.textContent = txt(lang, 'demoRestam').replace('{n}', passo).replace('{r}', r).replace('{e}', fmt(N / 2 ** passo));
        };
        const reiniciar = () => { vivos = Array(N).fill(true); passo = 0; mostrar(); };
        const bar = el('div', 'licao-botoes licao-demo-botoes');
        const b1 = el('button', 'modal-btn', txt(lang, 'demoPasso')); b1.id = 'licao-demo-passo'; b1.type = 'button';
        b1.addEventListener('click', () => { vivos = vivos.map(v => v && Math.random() >= 0.5); passo++; mostrar(); });
        const b2 = el('button', 'modal-btn cancel-btn', txt(lang, 'demoRecomecar')); b2.id = 'licao-demo-reiniciar'; b2.type = 'button';
        b2.addEventListener('click', reiniciar);
        bar.append(b2, b1);
        caixa.append(grade, info, bar);
        reiniciar();
        return caixa;
    }

    proximaPergunta() {
        const s = this.estado;
        s.p++;
        if (s.p >= s.L.perguntas.length) { this.concluir(); return; }
        s.respondida = false;
        const q = s.L.perguntas[s.p];
        this.corpo.innerHTML = '';
        this.corpo.append(this.mastro());   // v3.22: lição e quiz saem na seção de ciência da Gazeta
        this.corpo.append(el('h2', 'licao-titulo', s.L.titulo));
        this.corpo.append(el('p', 'licao-pergunta', `(${s.p + 1}/${s.L.perguntas.length}) ${q.q}`));
        const lista = el('div', 'licao-opcoes');
        // Ordem das alternativas sorteada a cada vez; a certa não repete a posição da pergunta anterior
        let ordem;
        for (let t = 0; t < 8; t++) {
            ordem = q.opcoes.map((_, k) => k);
            for (let k = ordem.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [ordem[k], ordem[j]] = [ordem[j], ordem[k]]; }
            if (ordem.indexOf(q.certa) !== s.posCerta) break;
        }
        s.ordem = ordem; s.posCerta = ordem.indexOf(q.certa);
        ordem.map((k) => q.opcoes[k]).forEach((o, i) => {
            const b = el('button', 'modal-btn licao-opcao', `${i + 1}. ${o}`);
            b.dataset.i = String(i);
            b.addEventListener('click', () => this.responder(i));
            lista.append(b);
        });
        this.corpo.append(lista);
        this.retorno = el('p', 'licao-retorno'); this.retorno.setAttribute('aria-live', 'polite');
        this.corpo.append(this.retorno);
        this.barra = el('div', 'licao-botoes');
        this.corpo.append(this.barra);
    }

    responder(i) {
        const s = this.estado, q = s.L.perguntas[s.p];
        if (s.respondida) return;
        s.respondida = true;
        const botoes = [...this.corpo.querySelectorAll('.licao-opcao')];
        const certaVis = s.ordem.indexOf(q.certa);
        const acertou = i === certaVis;
        botoes.forEach((b, k) => { b.disabled = true; if (k === certaVis) b.classList.add('certa'); else if (k === i) b.classList.add('errada'); });
        // Errou: mostra a resposta certa e a explicação e segue (sem repetir, sem efeito nas estrelas)
        this.retorno.textContent = (acertou ? txt(s.lang, 'certo') : txt(s.lang, 'errado') + ' ' + txt(s.lang, 'respostaCerta') + ' ' + q.opcoes[q.certa] + '.') + ' ' + q.porque;
        this.barra.innerHTML = '';
        const ult = s.p + 1 >= s.L.perguntas.length;
        const nx = el('button', 'modal-btn licao-primario', txt(s.lang, ult ? 'concluir' : 'proxima'));
        nx.id = 'licao-seguir';
        nx.addEventListener('click', () => this.proximaPergunta());
        this.barra.append(nx); nx.focus();
    }

    concluir() { const cb = this.estado.aoConcluir; this.fechar(); if (cb) cb(); }
    adiar() { const cb = this.estado.aoAdiar; this.fechar(); if (cb) cb(); }

    aoTecla(e) {
        if (!this.aberta) return;
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); this.adiar(); return; }
        const s = this.estado;
        if (/^[1-9]$/.test(e.key) && s.p >= 0 && !s.respondida) {
            const i = Number(e.key) - 1;
            if (i < s.L.perguntas[s.p].opcoes.length) { e.preventDefault(); e.stopPropagation(); this.responder(i); }
        }
    }
}
