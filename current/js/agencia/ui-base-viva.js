// ============================================
// AGÊNCIA (v3.41): telas da confiança pública, do mini-jogo dos dados do decaimento e dos ícones de recompensa dos alertas.
// Métodos da AgenciaUI. Lógica em base-viva.js; aqui só HTML e cliques.
// ============================================
import { REGIOES, regiaoDe, saneaConfianca, fatorVerba, DADOS, MEIA_VIDA_RODADAS, dadosPendente, jogarDados, moralDe, faixaMoral } from './base-viva.js';
import { PARAMETROS } from './simulacao.js';
import { propostaDe } from './decisoes.js';
import { currentLang } from '../i18n/index.js';

const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
/** v3.42: dados desenhados (até 30), um quadradinho com pontos por dado restante; `grande` = cinco dados em destaque. */
function dadosSvg(n, grande = false) {
    const k = Math.min(n, 30), lado = grande ? 26 : 9, gap = grande ? 6 : 2, porLinha = grande ? 5 : 10;
    const faces = [[], [[.5, .5]], [[.25, .25], [.75, .75]], [[.25, .25], [.5, .5], [.75, .75]], [[.25, .25], [.75, .25], [.25, .75], [.75, .75]], [[.25, .25], [.75, .25], [.5, .5], [.25, .75], [.75, .75]]];
    let s = '';
    for (let i = 0; i < k; i++) {
        const x = (i % porLinha) * (lado + gap), y = Math.floor(i / porLinha) * (lado + gap), f = faces[(i * 7 + 3) % 5 + 1];
        s += `<rect x="${x}" y="${y}" width="${lado}" height="${lado}" rx="${lado / 5}" fill="#f8f4ea" stroke="#3a2c1d" stroke-width="${grande ? 1.5 : .8}"/>` + f.map(([u, v]) => `<circle cx="${x + u * lado}" cy="${y + v * lado}" r="${lado / 11}" fill="#1f170e"/>`).join('');
    }
    const w = Math.max(1, Math.min(k, porLinha)) * (lado + gap), h = Math.max(1, Math.ceil(k / porLinha)) * (lado + gap);
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${s}</svg>`;
}
const num = (x, casas = 1) => x.toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: casas });

export const metodosBaseViva = {
    /** Linha de moral no dossiê. */
    htmlMoral(m) { const L = this.L, v = moralDe(m), f = faixaMoral(m); return `<span class="ag-moral ag-moral-${f}">${preencher(L.moralLinha, { v, faixa: L.moralFaixa[f] })}</span>`; },
    /** Centro de comando: confiança pública por região e o efeito na verba. */
    htmlConfianca() {
        const L = this.L, c = saneaConfianca(this.est.confianca);
        const linhas = REGIOES.map((k) => `<li class="ag-conf" data-regiao="${k}"><span>${L.regiao[k]}</span><span class="ag-conf-barra" role="img" aria-label="${L.regiao[k]}: ${c[k]}"><span style="width:${c[k]}%" class="${c[k] < 40 ? 'baixa' : c[k] >= 75 ? 'alta' : ''}"></span></span><span>${c[k]}</span></li>`).join('');
        return `<div class="ag-cartao papel" id="ag-confianca"><span class="papel-secao">${L.confiancaSecao}</span><h3>${L.confiancaTit}</h3><p class="ag-nota">${preencher(L.confiancaExpl, { f: num(fatorVerba(this.est) * 100, 0) })}</p><ul class="ag-lista-simples ag-confs">${linhas}</ul></div>`;
    },
    /** Alojamento: o jogo dos dados do decaimento (uma partida por dia). */
    htmlDados() {
        const L = this.L, e = this.est, r = this.dadosResp;
        let corpo;
        if (r && r.dia === e.dia) {
            const tab = r.restam.slice(0, Math.max(r.meta + 2, 6)).map((n, i) => `<li class="${i === r.meta ? 'metade' : ''}"><span>${preencher(L.dadosRodada, { i })}</span><span class="ag-dados-mesa" aria-hidden="true">${dadosSvg(n)}</span><strong>${n}</strong></li>`).join('');
            corpo = `<ol class="ag-dados-tab" start="0">${tab}</ol><p class="ag-nota" role="status"><strong>${r.certo ? preencher(L.dadosCerto, { v: r.premio }) : r.quase ? L.dadosErrado : L.dadosLonge}</strong> ${preencher(L.dadosResultado, { m: r.meta, p: r.palpite, t: num(MEIA_VIDA_RODADAS) })}</p>`;
        } else if (dadosPendente(e)) {
            corpo = `<p>${preencher(L.dadosPergunta, { n: DADOS.n, h: DADOS.n / 2 })}</p><div class="ag-acoes">`
                + DADOS.opcoes.map((v) => `<button type="button" class="menu-btn secondary ag-mini" data-ag="dados" data-v="${v}">${preencher(L.dadosOpcao, { v })}</button>`).join('') + `</div>`;
        } else corpo = `<p class="ag-nota">${L.dadosAmanha}</p>`;
        return `<div class="ag-cartao ag-dados" id="ag-dados"><div class="ag-dados-topo" aria-hidden="true">${dadosSvg(5, true)}</div><h3>${L.dadosTit}</h3><p class="ag-nota">${preencher(L.dadosExpl, { v: DADOS.premio })}</p>${corpo}</div>`;
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
        if (k === 'ir-dados') { this._parar(); this.vel = 0; this.voo = null; this.preparo = null; this.vista = 'base'; this.abrirSala('alojamento'); const d = this.el.querySelector('#ag-dados'); if (d) d.scrollIntoView({ block: 'center' }); return true; }
        if (k === 'dados') { const r = jogarDados(this.est, Number(b.dataset.v)); if (r) { this.dadosResp = { ...r, dia: this.est.dia }; this.gravar(); } this.desenhar(false); return true; }
        return false;
    },
};
