// ============================================
// AGÊNCIA (v3.40): telas das Políticas da Agência, das cartas de campo e das propostas do cliente. Métodos da AgenciaUI.
// Lógica em decisoes.js; aqui só HTML e cliques.
// ============================================
import { POLITICAS, politicasPendentes, escolherPolitica, concluidosTotal, CARTAS, sortearCartas, cartaValida, PROPOSTAS, propostaDe, cumpreProposta } from './decisoes.js';

const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
/** v3.42: arcanos das cartas de campo (numeral e símbolo). */
const NUMERAL = { levantamento: 'I', pressa: 'II', folego: 'III', segundaChance: 'IV', patrocinio: 'V' };
const ICONE_CARTA = { levantamento: '🛰️', pressa: '⏱️', folego: '💨', segundaChance: '🔁', patrocinio: '🏛️' };

export const metodosDecisoes = {
    /** Centro de comando: políticas escolhidas, a escolher e as próximas. */
    htmlPoliticas() {
        const L = this.L, e = this.est, n = concluidosTotal(e);
        const linhas = POLITICAS.map((p) => {
            const esc = (e.politicas || {})[p.id];
            if (esc) return `<li data-politica="${p.id}"><strong>${L.politicaTit[p.id]}:</strong> ${L.politicaOp[esc].nome}. <span class="ag-nota">${L.politicaOp[esc].desc}</span></li>`;
            if (n < p.marco) return `<li data-politica="${p.id}" class="ag-nota">${preencher(L.politicaFutura, { tit: L.politicaTit[p.id], n: p.marco - n })}</li>`;
            return `<li data-politica="${p.id}"><strong>${L.politicaTit[p.id]}:</strong> ${L.politicaEscolha}<div class="ag-acoes ag-politica-op">`
                + p.opcoes.map((o) => `<button type="button" class="menu-btn secondary ag-mini" data-ag="politica" data-p="${p.id}" data-o="${o}"><strong>${L.politicaOp[o].nome}</strong><br><span class="ag-nota">${L.politicaOp[o].desc}</span></button>`).join('') + `</div></li>`;
        }).join('');
        return `<div class="ag-cartao papel" id="ag-politicas"><header class="papel-cab"><span class="papel-nome">${L.diarioOficial}</span><span class="papel-linha">${L.politicasTit}</span></header><p class="ag-nota">${L.politicasExpl}</p><ul class="ag-lista-simples">${linhas}</ul></div>`;
    },
    /** Aviso no painel do mapa quando há política para escolher. */
    htmlAvisoPolitica() {
        return politicasPendentes(this.est).length ? `<p class="ag-aviso" id="ag-aviso-politica">${this.L.politicaAviso}</p>` : '';
    },
    /** Proposta do cliente para o alvo do preparo (null se não há). */
    propostaDoPreparo() {
        const p = this.preparo; if (!this.temPlano()) return null;
        const at = this.est.ativos.find((x) => x.id === p.alvo.id);
        return at ? propostaDe(p.alvo, at.desde) : null;
    },
    /** Cartas de campo e proposta do cliente, no preparo do voo (missão de campo ou chamado rápido). */
    htmlDecisoesPreparo() {
        if (!this.temPlano()) return '';
        const L = this.L, e = this.est, p = this.preparo;
        const cartas = sortearCartas(p.alvo.id, e.dia);
        const html = `<div class="ag-cartas" id="ag-cartas" role="group" aria-label="${L.cartasTit}"><h4 class="ag-sub">${L.cartasTit}</h4><p class="ag-nota">${L.cartasExpl}</p><div class="ag-cartas-op">`
            + cartas.map((c) => `<button type="button" class="ag-carta${p.carta === c ? ' sel' : ''}" data-ag="carta" data-c="${c}" aria-pressed="${p.carta === c}"><span class="ag-carta-num" aria-hidden="true">${NUMERAL[c]}</span><span class="ag-carta-icone" aria-hidden="true">${ICONE_CARTA[c]}</span><span class="ag-carta-nome">${L.carta[c].nome}</span><span class="ag-carta-desc">${L.carta[c].desc}</span></button>`).join('')
            + `</div></div>`;
        const prop = this.propostaDoPreparo();
        if (!prop) return html;
        const ok = cumpreProposta(prop, this.idsDoPreparo(), this.objetivoDoPreparo());
        return html + `<div class="ag-proposta telegrama" id="ag-proposta"><p class="telegrama-cab">${L.telegramaCab}</p><p><strong>${L.propostaTit}</strong> ${preencher(L.proposta[prop], { p: Math.round(PROPOSTAS[prop].premio * 100) })}</p><p class="ag-nota">${L.propostaRisco[prop]}</p>`
            + `<div class="ag-acoes"><button type="button" class="menu-btn secondary ag-mini${p.aceitaProposta ? ' sel' : ''}" data-ag="proposta" aria-pressed="${!!p.aceitaProposta}">${p.aceitaProposta ? L.propostaAceita : L.propostaAceitar}</button></div>`
            + (p.aceitaProposta ? `<p class="ag-nota" role="status">${ok ? L.propostaCondOk : L.propostaCondNao}</p>` : '') + `</div>`;
    },
    acaoDecisoes(k, b) {
        const e = this.est, p = this.preparo;
        if (k === 'politica') { if (escolherPolitica(e, b.dataset.p, b.dataset.o)) this.gravar(); this.desenhar(false); return true; }
        if (k === 'carta') { if (p) { const c = cartaValida(b.dataset.c); p.carta = p.carta === c ? null : c; } this.desenhar(false); return true; }
        if (k === 'proposta') { if (p) p.aceitaProposta = !p.aceitaProposta; this.desenhar(false); return true; }
        return false;
    },
};
export { CARTAS };
