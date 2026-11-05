// HTML da primeira página do jornal (v3.20). Módulo PURO (devolve texto); o DOM só o insere.
import { JORNAIS, ROTULOS } from './textos.js';
import { fotoSvg } from './foto.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const temJornal = (missaoId) => !!JORNAIS[missaoId];

/** @param textoLongo o texto completo da missão (história longa), mantido em "Saiba mais" */
export function htmlJornal(missaoId, lang = 'pt', textoLongo = '') {
    const J = typeof missaoId === 'object' && missaoId ? missaoId : JORNAIS[missaoId]; if (!J) return '';   // v3.23: aceita o objeto pronto (plantão do chamado rápido)
    const L = J[lang] || J.en, R = ROTULOS[lang] || ROTULOS.en;
    return `<article class="jornal" lang="${lang}" aria-label="${esc(L.nome)}">`
        + `<header class="jornal-topo"><div class="jornal-especial">${esc(L.kicker || (J.edicao === 'boasvindas' ? R.boasvindas : R.especial))}</div><div class="jornal-nome">${esc(L.nome)}</div><div class="jornal-data">${esc(L.data)}</div></header>`
        + `<h2 class="jornal-manchete">${esc(L.manchete)}</h2><p class="jornal-sub">${esc(L.sub)}</p>`
        + `<figure class="jornal-foto">${fotoSvg(J.cena)}<figcaption>${esc(L.legenda)}</figcaption></figure>`
        + `<div class="jornal-texto">${L.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
        + `<p class="jornal-jogo">${esc(L.jogo)}</p>`
        + `<p class="jornal-fonte">${L.rodape ? esc(L.rodape) : esc(R.fonte) + ': ' + esc(L.fonte) + ' ' + esc(J.edicao === 'boasvindas' ? R.ficticioBV : R.ficticio)}</p>`
        + (textoLongo ? `<details class="jornal-mais"><summary>${esc(R.saiba)}</summary><div class="jornal-mais-texto">${esc(textoLongo)}</div></details>` : '')
        + `</article>`;
}

/** v3.22: identidade de jornal das perguntas de cada região: nome do jornal da missão (ou a Gazeta geral) e a seção. Puro. */
export function mastro(missaoId, lang = 'pt', info = {}) {
    const J = JORNAIS[missaoId], R = ROTULOS[lang] || ROTULOS.en, L = J && (J[lang] || J.en);
    const secao = info.reforco ? R.secaoErrata : info.formato === 'mf' ? R.secaoMF : R.secaoMC;
    return { nome: L ? L.nome : R.geral, data: L ? L.data : '', secao, resposta: R.resposta, fechamento: R.fechamento };
}

/** v3.23: caixa "edição extra" ao fim da missão (dados de `reportagemFim`). */
export function htmlFimJornal(r, lang = 'pt') {
    return `<article class="jornal jornal-fim" lang="${lang}" aria-label="${esc(r.nome)}">`
        + `<header class="jornal-topo"><div class="jornal-especial">${esc(r.kicker)}</div><div class="jornal-nome">${esc(r.nome)}</div></header>`
        + `<h2 class="jornal-manchete">${esc(r.manchete)}</h2><p class="jornal-sub">${esc(r.sub)}</p>`
        + `<div class="jornal-texto">${r.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}</div>`
        + `<p class="jornal-fonte">${esc(r.rodape)}</p></article>`;
}
