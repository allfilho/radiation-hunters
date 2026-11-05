// ============================================
// VAGAS DE SAVE: janela com 3 cartões (DOM puro). A lógica está em slots.js; aqui só HTML, cliques e foco.
// Apagar e recomeçar pedem confirmação no próprio cartão (sem diálogo do navegador).
// ============================================
import { currentLang } from './i18n/index.js';

const TXT = {
    pt: {
        titulo: 'Vagas de save', novoDica: 'Escolha a vaga do novo jogo. Uma vaga vazia começa do zero; numa vaga com jogo, você pode continuar ou recomeçar.',
        contDica: 'Escolha a vaga que vai continuar.', fechar: 'Fechar', vaga: 'Vaga {n}', emUso: 'em uso', vazia: 'Vaga vazia',
        resumo: 'Mês {m} · dia {d} · {c} créditos · {e} cientistas · {q} missões com estrelas',
        resumoIni: 'Treinamento ainda não concluído · {q} missões com estrelas',
        ultima: 'Última vez: {t}', continuar: 'Continuar', novoAqui: 'Novo jogo aqui', recomecar: 'Recomeçar', apagar: 'Apagar',
        confApagar: 'Apagar a vaga {n}? O progresso, a Base e a equipe dela serão perdidos e isso não pode ser desfeito.',
        confRecomecar: 'Recomeçar a vaga {n} do zero? O progresso, a Base e a equipe dela serão perdidos e isso não pode ser desfeito.',
        sim: 'Sim, confirmar', cancelar: 'Cancelar',
        nota: 'Idioma, som e demais configurações valem para todas as vagas.',
    },
    en: {
        titulo: 'Save slots', novoDica: 'Pick the slot for the new game. An empty slot starts from scratch; a slot with a game can be continued or restarted.',
        contDica: 'Pick the slot to continue.', fechar: 'Close', vaga: 'Slot {n}', emUso: 'in use', vazia: 'Empty slot',
        resumo: 'Month {m} · day {d} · {c} credits · {e} scientists · {q} missions with stars',
        resumoIni: 'Training not finished yet · {q} missions with stars',
        ultima: 'Last played: {t}', continuar: 'Continue', novoAqui: 'New game here', recomecar: 'Restart', apagar: 'Delete',
        confApagar: 'Delete slot {n}? Its progress, Base and team will be lost and this cannot be undone.',
        confRecomecar: 'Restart slot {n} from scratch? Its progress, Base and team will be lost and this cannot be undone.',
        sim: 'Yes, confirm', cancelar: 'Cancel',
        nota: 'Language, sound and other settings apply to all slots.',
    },
};
const preencher = (s, d) => s.replace(/\{(\w+)\}/g, (_, k) => (d[k] ?? ''));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export class SlotsUI {
    /** @param {HTMLElement} el janela (#slots-modal); @param {object} slots objeto de slots.js; @param {function} escolher (n, {novo}) chamado ao escolher */
    constructor(el, slots, escolher) {
        this.el = el; this.slots = slots; this.escolher = escolher; this.modo = 'novo'; this.conf = null; this.volta = null;
        el.addEventListener('click', (e) => { const b = e.target.closest('[data-slot]'); if (b) this.acao(b); if (e.target === el) this.fechar(); });
    }
    get L() { return TXT[currentLang] || TXT.en; }
    get aberta() { return this.el.classList.contains('active'); }

    abrir(modo = 'novo') {
        this.modo = modo; this.conf = null; this.volta = document.activeElement;
        this.desenhar(); this.el.classList.add('active');
        const b = this.el.querySelector('.slot-card .menu-btn.primary') || this.el.querySelector('button'); if (b) b.focus();
    }
    fechar() { this.el.classList.remove('active'); this.conf = null; if (this.volta && this.volta.focus) { try { this.volta.focus(); } catch (e) { /* sem foco */ } } }
    atualizar() { if (this.aberta) this.desenhar(); }

    quando(t) { if (!t) return ''; try { return new Date(t).toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return ''; } }

    desenhar() {
        const L = this.L, vagas = this.slots.listar();
        const cartoes = vagas.map((v) => {
            const r = v.resumo, conf = this.conf && this.conf.n === v.n ? this.conf.acao : null;
            const corpo = !v.criada ? `<p class="slot-resumo slot-vazia">${L.vazia}</p>`
                : `<p class="slot-resumo">${r.iniciada ? preencher(L.resumo, { m: r.mes, d: r.diaDoMes, c: r.creditos, e: r.equipe, q: r.missoes }) : preencher(L.resumoIni, { q: r.missoes })}</p>`
                + (v.ativa ? '' : `<p class="slot-quando">${preencher(L.ultima, { t: esc(this.quando(v.t)) })}</p>`);
            let acoes;
            if (conf) {
                acoes = `<p class="slot-aviso" role="alert">${preencher(conf === 'apagar' ? L.confApagar : L.confRecomecar, { n: v.n })}</p>`
                    + `<div class="slot-acoes"><button type="button" class="menu-btn danger" data-slot="${conf === 'apagar' ? 'apagar-sim' : 'recomecar-sim'}" data-n="${v.n}">${L.sim}</button><button type="button" class="menu-btn" data-slot="cancelar" data-n="${v.n}">${L.cancelar}</button></div>`;
            } else if (!v.criada) {
                acoes = `<div class="slot-acoes"><button type="button" class="menu-btn${this.modo === 'novo' ? ' primary' : ''}" data-slot="novo" data-n="${v.n}">${L.novoAqui}</button></div>`;
            } else {
                acoes = `<div class="slot-acoes"><button type="button" class="menu-btn${this.modo === 'continuar' || v.ativa ? ' primary' : ''}" data-slot="continuar" data-n="${v.n}">${L.continuar}</button>`
                    + `<button type="button" class="menu-btn" data-slot="recomecar" data-n="${v.n}">${L.recomecar}</button><button type="button" class="menu-btn" data-slot="apagar" data-n="${v.n}">${L.apagar}</button></div>`;
            }
            return `<li class="slot-card${v.ativa ? ' ativa' : ''}${v.criada ? '' : ' vazia'}" data-vaga="${v.n}"><h3>${preencher(L.vaga, { n: v.n })}${v.ativa && v.criada ? ` <span class="slot-selo">${L.emUso}</span>` : ''}</h3>${corpo}${acoes}</li>`;
        }).join('');
        this.el.innerHTML = `<div class="modal-content slots-content" role="dialog" aria-modal="true" aria-labelledby="slots-titulo">`
            + `<button type="button" class="close-btn" data-slot="fechar" aria-label="${L.fechar}">×</button><h2 id="slots-titulo">${L.titulo}</h2>`
            + `<p class="slot-dica">${this.modo === 'novo' ? L.novoDica : L.contDica}</p><ul class="slot-lista">${cartoes}</ul><p class="slot-nota">${L.nota}</p></div>`;
    }

    acao(b) {
        const k = b.dataset.slot, n = Number(b.dataset.n);
        if (k === 'fechar') return this.fechar();
        if (k === 'cancelar') { this.conf = null; this.desenhar(); const f = this.el.querySelector(`[data-vaga="${n}"] button`); if (f) f.focus(); return; }
        if (k === 'apagar' || k === 'recomecar') { this.conf = { n, acao: k }; this.desenhar(); const f = this.el.querySelector('[data-slot$="-sim"]'); if (f) f.focus(); return; }
        if (k === 'apagar-sim') { this.slots.apagar(n); this.conf = null; this.desenhar(); this.escolher(null, { mudou: true }); const f = this.el.querySelector('button'); if (f) f.focus(); return; }
        if (k === 'recomecar-sim') { this.conf = null; this.fechar(); this.escolher(n, { novo: true }); return; }
        if (k === 'novo') { this.fechar(); this.escolher(n, { novo: true }); return; }
        if (k === 'continuar') { this.fechar(); this.escolher(n, { novo: false }); }
    }
}
