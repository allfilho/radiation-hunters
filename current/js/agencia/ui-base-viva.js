// ============================================
// AGÊNCIA (v3.41): telas da confiança pública, do mini-jogo dos dados do decaimento e dos ícones de recompensa dos alertas.
// Métodos da AgenciaUI. Lógica em base-viva.js; aqui só HTML e cliques.
// ============================================
import { REGIOES, regiaoDe, saneaConfianca, fatorVerba, DADOS, MEIA_VIDA_RODADAS, dadosPendente, jogarDados, moralDe, faixaMoral } from './base-viva.js';
import { PARAMETROS } from './simulacao.js';
import { propostaDe } from './decisoes.js';
import { currentLang } from '../i18n/index.js';

const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
const num = (x, casas = 1) => x.toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: casas });

export const metodosBaseViva = {
    /** Linha de moral no dossiê. */
    htmlMoral(m) { const L = this.L, v = moralDe(m), f = faixaMoral(m); return `<span class="ag-moral ag-moral-${f}">${preencher(L.moralLinha, { v, faixa: L.moralFaixa[f] })}</span>`; },
    /** Centro de comando: confiança pública por região e o efeito na verba. */
    htmlConfianca() {
        const L = this.L, c = saneaConfianca(this.est.confianca);
        const linhas = REGIOES.map((k) => `<li class="ag-conf" data-regiao="${k}"><span>${L.regiao[k]}</span><span class="ag-conf-barra" role="img" aria-label="${L.regiao[k]}: ${c[k]}"><span style="width:${c[k]}%" class="${c[k] < 40 ? 'baixa' : c[k] >= 75 ? 'alta' : ''}"></span></span><span>${c[k]}</span></li>`).join('');
        return `<div class="ag-cartao" id="ag-confianca"><h3>${L.confiancaTit}</h3><p class="ag-nota">${preencher(L.confiancaExpl, { f: num(fatorVerba(this.est) * 100, 0) })}</p><ul class="ag-lista-simples ag-confs">${linhas}</ul></div>`;
    },
    /** Alojamento: o jogo dos dados do decaimento (uma partida por dia). */
    htmlDados() {
        const L = this.L, e = this.est, r = this.dadosResp;
        let corpo;
        if (r && r.dia === e.dia) {
            const tab = r.restam.slice(0, Math.max(r.meta + 2, 6)).map((n, i) => `<li><span>${preencher(L.dadosRodada, { i })}</span><strong>${n}</strong></li>`).join('');
            corpo = `<ol class="ag-dados-tab" start="0">${tab}</ol><p class="ag-nota" role="status"><strong>${r.certo ? preencher(L.dadosCerto, { v: r.premio }) : r.quase ? L.dadosErrado : L.dadosLonge}</strong> ${preencher(L.dadosResultado, { m: r.meta, p: r.palpite, t: num(MEIA_VIDA_RODADAS) })}</p>`;
        } else if (dadosPendente(e)) {
            corpo = `<p>${preencher(L.dadosPergunta, { n: DADOS.n, h: DADOS.n / 2 })}</p><div class="ag-acoes">`
                + DADOS.opcoes.map((v) => `<button type="button" class="menu-btn secondary ag-mini" data-ag="dados" data-v="${v}">${preencher(L.dadosOpcao, { v })}</button>`).join('') + `</div>`;
        } else corpo = `<p class="ag-nota">${L.dadosAmanha}</p>`;
        return `<div class="ag-cartao ag-dados" id="ag-dados"><h3>${L.dadosTit}</h3><p class="ag-nota">${preencher(L.dadosExpl, { v: DADOS.premio })}</p>${corpo}</div>`;
    },
    /** Ícones do que o alerta rende (lista e detalhe). */
    htmlRende(a, at) {
        const L = this.L, P = PARAMETROS.premioMissao, itens = [];
        const base = a.tipo === 'investigacao' ? (P[a.nivel] || P.investigacao) : (P[a.nivel] || (a.tipo === 'rapida' ? P.rapida : P.normal));
        itens.push(`<span class="ag-rende-i" title="${L.rendePremio}">💰 ${base}</span>`);
        if (a.nivel === 'pericia') itens.push(`<span class="ag-rende-i" title="${L.rendeBonus}">⭐ ${L.rendeBonus}</span>`);
        if (at && propostaDe(a, at.desde)) itens.push(`<span class="ag-rende-i" title="${L.rendeProposta}">🤝 ${L.rendeProposta}</span>`);
        if (at && at.expira - this.est.dia <= 3) itens.push(`<span class="ag-rende-i" title="${L.rendeUrgente}">⏳ ${L.rendeUrgente}</span>`);
        const k = regiaoDe(a.lat, a.lon), c = saneaConfianca(this.est.confianca);
        if (k && c[k] < 40) itens.push(`<span class="ag-rende-i" title="${L.rendeConfianca}">📉 ${L.rendeConfianca}</span>`);
        return `<span class="ag-rende" aria-label="${L.rendeAria}">${itens.join(' ')}</span>`;
    },
    acaoBaseViva(k, b) {
        if (k === 'dados') { const r = jogarDados(this.est, Number(b.dataset.v)); if (r) { this.dadosResp = { ...r, dia: this.est.dia }; this.gravar(); } this.desenhar(false); return true; }
        return false;
    },
};
