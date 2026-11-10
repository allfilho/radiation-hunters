// ============================================
// AGÊNCIA (v3.39): carreira no dossiê do cientista, Mural da Agência e briefing do dia. Métodos acrescentados à AgenciaUI.
// Lógica em carreira.js; aqui só HTML e cliques.
// ============================================
import { currentLang } from '../i18n/index.js';
import { retratoSvg } from '../investigacao/retratos.js';
import { PERGUNTAS } from '../data/encontros/perguntas.js';
import { razao, doseNaJanela } from './equipe.js';
import { postoDe, faltamParaProximo, promocaoPendente, ofertaDe, escolherBonus, podeAposentar, aposentar, pensamento, perguntaDoBriefing, briefingPendente, responderBriefing, BRIEFING } from './carreira.js';

const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const metodosGente = {
    /** Bloco de carreira no dossiê: posto, missões, pensamento, promoção pendente e aposentadoria. */
    htmlCarreira(m) {
        const L = this.L, e = this.est, posto = postoDe(m), falta = faltamParaProximo(m);
        const seguidas = [1, 2, 3, 4, 5, 6, 7].filter((k) => doseNaJanela(m, e.dia - k + 1, 1) > 0).length;
        const pens = L.pensa[pensamento(m, e.dia, razao(m, e.dia), seguidas)];
        const bonus = Object.values(m.escolhas || {}).map((b) => L.bonusCarreira[b]).join(', ');
        const pend = promocaoPendente(m);
        const escolha = pend ? `<div class="ag-promocao" role="group" aria-label="${preencher(L.promocaoTit, { posto: L.posto[pend] })}"><p class="ag-nota"><strong>${preencher(L.promocaoTit, { posto: L.posto[pend] })}</strong> ${L.promocaoEscolha}</p><div class="ag-acoes">`
            + ofertaDe(m, pend).map((b) => `<button type="button" class="menu-btn secondary ag-mini" data-ag="carreira" data-m="${m.id}" data-b="${b}">${L.bonusCarreira[b]}</button>`).join('') + `</div></div>` : '';
        const apos = podeAposentar(m) ? `<div class="ag-acoes"><button type="button" class="menu-btn secondary ag-mini" data-ag="aposentar" data-m="${m.id}">${L.aposentarBtn}</button></div><p class="ag-nota">${L.aposentarNota}</p>` : '';
        return `<div class="ag-carreira" data-carreira="${m.id}"><p class="ag-nota"><strong>${L.posto[posto]}</strong> · ${preencher(L.missoesN, { n: m.missoes || 0 })}${falta !== null ? ' · ' + preencher(L.proximoPosto, { n: falta }) : ''}${bonus ? ' · ' + bonus : ''}</p>`
            + `<p class="ag-nota">${this.htmlMoral(m)}</p><p class="ag-pensamento">“${pens}”</p>${escolha}${apos}</div>`;
    },
    htmlMural() {
        const L = this.L, mural = this.est.mural || [];
        const itens = mural.map((r) => `<li class="ag-mural-item"><span class="inv-retrato" aria-hidden="true">${retratoSvg(r.retrato, 'sorriso')}</span><span><strong>${esc(r.nome)}</strong><br><span class="ag-nota">${preencher(L.muralItem, { n: r.missoes, d: r.dia, esp: L.especialidade[r.especialidade] || '' })}</span></span></li>`).join('');
        return `<div class="ag-cartao" id="ag-mural"><h3>${L.muralTit}</h3>${itens ? `<ul class="ag-mural">${itens}</ul>` : `<p class="ag-nota">${L.muralVazio}</p>`}</div>`;
    },
    /** Briefing do dia no painel do mapa: uma pergunta dos Encontros por dia de jogo. */
    htmlBriefing() {
        const L = this.L, e = this.est, lang = currentLang, r = this.briefingResp;
        if (r && r.dia === e.dia) {
            const p = PERGUNTAS.find((x) => x.id === r.id); if (!p) return '';
            return `<div class="ag-cartao ag-briefing" id="ag-briefing"><h3>${L.briefingTit}</h3><p>${p[lang].enunciado}</p><p class="ag-nota" role="status"><strong>${r.certo ? preencher(L.briefingCerto, { v: BRIEFING.premio }) : L.briefingErrado}</strong> ${p[lang].explicacao}</p></div>`;
        }
        if (!briefingPendente(e)) return '';
        const p = perguntaDoBriefing(PERGUNTAS, e.dia, (e.briefing || {}).vistas); if (!p) return '';
        const op = p.formato === 'mf'
            ? [['fato', L.briefingFato], ['mito', L.briefingMito]]
            : p[lang].opcoes.map((o, i) => [String(i), o]);
        return `<div class="ag-cartao ag-briefing" id="ag-briefing" data-pergunta="${p.id}"><h3>${L.briefingTit}</h3><p class="ag-nota">${preencher(L.briefingExpl, { v: BRIEFING.premio })}</p><p>${p[lang].enunciado}</p><div class="ag-acoes">`
            + op.map(([v, t]) => `<button type="button" class="menu-btn secondary ag-mini" data-ag="briefing" data-v="${v}">${t}</button>`).join('') + `</div></div>`;
    },
    /** Cliques desta parte. Devolve true se tratou. */
    acaoGente(k, b) {
        const e = this.est;
        if (k === 'carreira') { const m = e.equipe.find((x) => x.id === b.dataset.m); if (m && escolherBonus(m, b.dataset.b)) this.gravar(); this.desenhar(false); return true; }
        if (k === 'aposentar') {
            const reg = aposentar(e, b.dataset.m);
            if (reg) { this.relatorio = preencher(this.L.aposentou, { nome: reg.nome, n: reg.missoes }); this.gravar(); }
            this.desenhar(false); return true;
        }
        if (k === 'briefing') {
            const p = PERGUNTAS.find((x) => x.id === (this.el.querySelector('#ag-briefing') || {}).dataset?.pergunta); if (!p || !briefingPendente(e)) return true;
            const v = b.dataset.v, certo = p.formato === 'mf' ? v === p.correta : Number(v) === p.correta;
            responderBriefing(e, p.id, certo);
            this.briefingResp = { dia: e.dia, id: p.id, certo };
            this.gravar(); this.desenhar(false); return true;
        }
        return false;
    },
};
