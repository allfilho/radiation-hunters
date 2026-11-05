// ============================================
// INTERFACE DO ENCONTRO (DOM): pergunta, retorno, ficha de reforço e ensino
// Não conhece o jogo; o gerenciador a chama e espera as Promises. Teclas: 1-3 (alternativas) ou 1-5 / M / F (Mito x Fato) para responder,
// Enter/Espaço para continuar, Esc para pular (antes de responder) ou continuar (depois).
// ============================================
import { currentLang, t } from '../i18n/index.js';
import { audioManager } from '../audio.js';
import { rng } from './motor.js';

const el = (tag, cls, texto) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
};

export class EncontroUI {
    constructor() {
        this.modal = document.getElementById('encontro-modal');
        this.corpo = document.getElementById('enc-corpo');
        this.cab = document.getElementById('enc-cabecalho');
        this.aberto = false;
        this._fim = null;       // função que resolve a espera atual
        this._tecla = (e) => this.aoTecla(e);
    }

    get ativo() { return !!this.modal && this.modal.classList.contains('active'); }

    abrir() {
        if (this.aberto) return;
        this.aberto = true;
        this.modal.classList.add('active');
        document.addEventListener('keydown', this._tecla, true);
    }

    /** Fecha e solta qualquer espera pendente (usado ao reiniciar, sair ou terminar). */
    fechar() {
        this.modal.classList.remove('active');
        document.removeEventListener('keydown', this._tecla, true);
        this.aberto = false;
        this._fim = null;
    }
    cancelar() {
        const f = this._fim;
        this.fechar();
        if (f) f({ cancelado: true });
    }

    aoTecla(e) {
        if (!this.aberto || !this._fim || e.ctrlKey || e.metaKey || e.altKey) return;
        if (this._tratar && this._tratar(e.key)) { e.preventDefault(); e.stopPropagation(); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); }
    }

    /** Espera uma ação; `tratar(tecla)` devolve true se consumiu a tecla. */
    _esperar(tratar) {
        return new Promise((ok) => {
            this._fim = (v) => { this._fim = null; this._tratar = null; ok(v); };
            this._tratar = tratar;
        });
    }
    _resolver(v) { const f = this._fim; if (f) f(v); }

    _cabecalho(info) {
        this.cab.replaceChildren();
        this.modal.classList.toggle('enc-jornal', !!info.jornal); this.jornal = null;
        if (info.jornal) {   // v3.22: cada pergunta é uma coluna do jornal da região
            this.jornal = info.jornal;
            const m = el('div', 'enc-mastro');
            m.append(el('span', 'enc-mastro-nome', info.jornal.nome), el('span', 'enc-mastro-data', info.jornal.data), el('span', 'enc-mastro-secao', info.jornal.secao));
            this.cab.append(m);
        }
        const l = el('div', 'enc-linha');
        l.append(el('span', 'enc-selo', info.tema), el('span', 'enc-contador', info.rotulo || t('encCounter').replace('{0}', info.n).replace('{1}', info.total)));
        this.cab.append(l);
        if (info.reforco) this.cab.append(el('div', 'enc-reforco', '🧪 ' + t('encReinforce')));
    }

    /** Mostra uma pergunta; resolve com 'mito'|'fato'|índice original|null (pular) | {cancelado}. */
    perguntar(p, info) {
        this.abrir();
        this._cabecalho(info);
        const txt = p[currentLang] || p.pt;
        this.corpo.replaceChildren();
        const enun = el('p', 'enc-enunciado', txt.enunciado);
        enun.id = 'enc-enunciado';
        this.modal.setAttribute('aria-labelledby', 'enc-enunciado');
        const lista = el('div', 'enc-opcoes');
        let opcoes;
        if (p.formato === 'mf') {
            // escala de confiança (ideia do Arnaldo): certeza / quase certeza / não sei; M e F valem como "certeza"
            opcoes = [
                { rot: t('encSureMyth'), val: 'mito', tecla: '1', alias: 'M', cls: 'mito' },
                { rot: t('encProbMyth'), val: 'mito?', tecla: '2', cls: 'mito leve' },
                { rot: t('encDunno'), val: 'naosei', tecla: '3', cls: 'naosei' },
                { rot: t('encProbFact'), val: 'fato?', tecla: '4', cls: 'fato leve' },
                { rot: t('encSureFact'), val: 'fato', tecla: '5', alias: 'F', cls: 'fato' },
            ];
        } else {
            const ordem = [0, 1, 2];
            const r = rng(info.semente);
            for (let i = ordem.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ordem[i], ordem[j]] = [ordem[j], ordem[i]]; }
            opcoes = ordem.map((o, i) => ({ rot: txt.opcoes[o], val: o, tecla: String(i + 1), cls: 'alt' }));
        }
        const botoes = opcoes.map((o) => {
            const b = el('button', 'enc-opcao ' + o.cls);
            b.type = 'button';
            b.dataset.val = String(o.val);
            b.append(el('span', 'enc-tecla', o.tecla), el('span', 'enc-rotulo', o.rot));
            b.addEventListener('click', () => this._resolver(o.val));
            lista.append(b);
            return b;
        });
        const pular = el('button', 'enc-pular', t('encSkip'));
        pular.type = 'button';
        pular.addEventListener('click', () => this._resolver(null));
        this.corpo.append(enun, lista, pular);
        const espera = this._esperar((k) => {
            const kk = k.length === 1 ? k.toUpperCase() : k;
            if (kk === 'ESCAPE' || k === 'Escape') { this._resolver(null); return true; }
            const o = opcoes.find((x) => x.tecla === kk || x.alias === kk);
            if (o) { this._resolver(o.val); return true; }
            return false;
        });
        botoes[0].focus({ preventScroll: true });
        return espera;
    }

    /** Retorno da resposta; `reforcoFicha` (opcional) = {titulo, ficha, fonte}. Resolve ao continuar. */
    retorno(p, acertou, ficha, rotuloContinuar, naoSei = false) {
        const txt = p[currentLang] || p.pt;
        this.corpo.replaceChildren();
        const faixa = el('div', 'enc-faixa ' + (acertou ? 'certo' : 'errado'), (this.jornal ? this.jornal.resposta + ': ' : '') + (acertou ? '✅ ' + t('encRight') : naoSei ? '🤔 ' + t('encDunnoBack') : '❌ ' + t('encWrong')));
        faixa.setAttribute('role', 'status');
        const correta = el('p', 'enc-correta', this.textoCorreto(p, txt));
        const expl = el('p', 'enc-explicacao', txt.explicacao);
        this.corpo.append(faixa, correta, expl);
        if (ficha) this.corpo.append(this.cartaFicha(ficha));
        return this.botaoContinuar(rotuloContinuar);
    }

    textoCorreto(p, txt) {
        if (p.formato === 'mf') return t('encAnswer') + ': ' + (p.correta === 'mito' ? t('encMyth') : t('encFact'));
        return t('encAnswer') + ': ' + txt.opcoes[p.correta];
    }

    cartaFicha(f) {
        const c = el('div', 'enc-ficha');
        c.append(el('div', 'enc-ficha-titulo', '📓 ' + f.titulo), el('p', 'enc-ficha-texto', f.ficha), el('p', 'enc-ficha-fonte', t('encSource') + ': ' + f.fonte));
        return c;
    }

    botaoContinuar(rotulo) {
        const b = el('button', 'enc-continuar', rotulo || t('encContinue'));
        b.type = 'button';
        b.addEventListener('click', () => this._resolver(true));
        this.corpo.append(b);
        const espera = this._esperar((k) => {
            if (k === 'Enter' || k === ' ' || k === 'Escape') { this._resolver(true); return true; }
            return false;
        });
        b.focus({ preventScroll: true });
        return espera;
    }

    /** Fim do encontro: soluções em ordem (do mais simples ao original), ficha e crédito. */
    encerramento(fim, ficha, itens) {
        this.cab.replaceChildren(el('div', 'enc-linha', ''));
        if (this.jornal) {   // v3.23: o encerramento é o "fechamento" do mesmo jornal (sem fundo escuro)
            const m = el('div', 'enc-mastro');
            m.append(el('span', 'enc-mastro-nome', this.jornal.nome), el('span', 'enc-mastro-data', this.jornal.data), el('span', 'enc-mastro-secao', this.jornal.fechamento));
            this.cab.replaceChildren(m);
        }
        this.corpo.replaceChildren();
        const titulo = fim.pulou ? t('encSkipped') : fim.credito >= 1 ? '🌟 ' + t('encFullCredit') : fim.credito > 0 ? '👍 ' + t('encPartialCredit') : '📘 ' + t('encTeach');
        this.corpo.append(el('div', 'enc-faixa neutro', titulo));
        if (itens.length) {
            this.corpo.append(el('p', 'enc-sub', t('encSolutions')));
            for (const { p } of itens) {
                const txt = p[currentLang] || p.pt;
                const c = el('div', 'enc-solucao');
                c.append(el('p', 'enc-sol-enun', txt.enunciado), el('p', 'enc-sol-resp', this.textoCorreto(p, txt)), el('p', 'enc-explicacao', txt.explicacao));
                this.corpo.append(c);
            }
        }
        if (ficha) this.corpo.append(this.cartaFicha(ficha));
        this.corpo.append(el('p', 'enc-credito', t('encCredit').replace('{0}', Math.round(fim.credito * 100))));
        return this.botaoContinuar(t('encBackToField'));
    }

    tocar(acertou) { try { acertou ? audioManager.playSuccess() : audioManager.playError(); } catch (e) { /* sem áudio */ } }
}
