// ============================================
// REPORTAGENS DE JORNAL GERADAS PELO JOGO (v3.23). Módulo PURO (devolve objetos/texto; o DOM só insere).
//  - jornalRapida(missao, lang): abertura do chamado rápido como PLANTÃO (TV, rádio ou jornal) com manchete e a fala de quem está com receio;
//  - reportagemFim(dados, lang): "EDIÇÃO EXTRA" ao concluir uma missão, só com números do desempenho do jogador (fontes, tempo, precisão, aproveitamento).
// Tudo é texto de jogo, fictício [H]: não descreve evento real nem cita fonte histórica nova.
// ============================================
import { JORNAIS } from './textos.js';
import { alertaRapida } from '../agencia/rapidas.js';

const CENA_DO_BIOMA = { urbano: 'mercado', industrial: 'fabrica', rural: 'ferrovelho', floresta: 'montanha', costa: 'costa', clinica: 'hospital' };
const fmtTempo = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;

/** Objeto no formato de JORNAIS[x] para um chamado rápido (missão de `missaoRapida`). */
export function jornalRapida(m) {
    const a = alertaRapida(m.semente), n = a.noticia, v = n.veiculo.id;
    const kick = { tv: ['PLANTÃO · TELEJORNAL', 'BREAKING · TV NEWS'], radio: ['PLANTÃO · RÁDIO', 'BREAKING · RADIO'], jornal: ['PLANTÃO · JORNAL', 'BREAKING · NEWSPAPER'] }[v];
    const L = (k, i) => ({
        nome: n.veiculo.nome[k], data: a.local[k], kicker: kick[i], manchete: n.manchete[k], sub: n.fala[k], paragrafos: [a.relato[k]],
        legenda: k === 'pt' ? 'Desenho do jogo: o local do chamado.' : 'Game drawing: the call site.',
        jogo: a.falso ? (k === 'pt' ? 'Sua missão: ir ao local, medir com o Geiger, conversar e dizer o que os dados sustentam.' : 'Your mission: go to the site, measure with the Geiger, talk and say what the data support.')
            : (k === 'pt' ? `Sua missão: achar ${a.n === 1 ? 'a fonte' : 'as ' + a.n + ' fontes'} e ${a.n === 1 ? 'identificá-la' : 'identificá-las'}.` : `Your mission: find ${a.n === 1 ? 'the source' : 'the ' + a.n + ' sources'} and identify ${a.n === 1 ? 'it' : 'them'}.`),
        rodape: k === 'pt' ? 'Reportagem fictícia de treino; nenhum evento real é descrito.' : 'Fictional training report; no real event is described.',
    });
    return { cena: CENA_DO_BIOMA[a.bioma] || 'mercado', edicao: 'plantao', pt: L('pt', 0), en: L('en', 1) };
}

/**
 * Edição extra ao fim da missão.
 * @param d { jornalId, titulo, stars, fontes: {n,total}|null, tempo (s), precisao (%), aproveitamento (%)|null, mensagem }
 */
export function reportagemFim(d, lang = 'pt') {
    const pt = lang !== 'en', J = JORNAIS[d.jornalId], nome = J ? (J[lang] || J.en).nome : (pt ? 'Gazeta dos Caçadores' : 'The Hunters’ Gazette');
    const st = Math.max(1, Math.min(3, d.stars | 0 || 1)), t = fmtTempo(d.tempo || 0), tit = d.titulo || '';
    const manchete = pt
        ? [`${tit}: equipe termina, mas há o que melhorar`, `Missão concluída: ${tit}`, `Missão cumprida: ${tit}`][st - 1]
        : [`${tit}: team finishes, with room to improve`, `Mission complete: ${tit}`, `Mission accomplished: ${tit}`][st - 1];
    const f = d.fontes && d.fontes.total > 0 ? d.fontes : null;
    const sub = f
        ? (pt ? `${f.n} de ${f.total} ${f.total === 1 ? 'fonte localizada' : 'fontes localizadas'} em ${t}` : `${f.n} of ${f.total} ${f.total === 1 ? 'source located' : 'sources located'} in ${t}`)
        : (pt ? `Missão encerrada em ${t}` : `Mission closed in ${t}`);
    const p1 = f
        ? (pt ? `A equipe da Agência Chronos localizou e identificou ${f.n} de ${f.total} fontes radioativas em ${t}, com precisão de ${d.precisao}%.` : `The Chronos Agency team located and identified ${f.n} of ${f.total} radioactive sources in ${t}, with ${d.precisao}% accuracy.`)
        : (pt ? `A equipe da Agência Chronos encerrou a missão em ${t}, com precisão de ${d.precisao}%.` : `The Chronos Agency team closed the mission in ${t}, with ${d.precisao}% accuracy.`);
    const nota = pt ? ['Missão cumprida, com margem para melhorar.', 'Bom desempenho da equipe.', 'Desempenho de destaque.'][st - 1] : ['Job done, with room to improve.', 'Good performance by the team.', 'Outstanding performance.'][st - 1];
    const p2 = (d.aproveitamento != null ? (pt ? `O aproveitamento geral ficou em ${d.aproveitamento}%. ` : `Overall score came to ${d.aproveitamento}%. `) : '') + nota;
    const linhas = String(d.mensagem || '').split('\n').map((x) => x.trim()).filter(Boolean);
    return {
        nome, kicker: pt ? 'EDIÇÃO EXTRA' : 'EXTRA EDITION', manchete, sub, paragrafos: [p1, p2, ...linhas],
        rodape: pt ? 'Edição extra fictícia do jogo; os números são o desempenho desta missão.' : 'Fictional extra edition from the game; the numbers are this mission’s performance.',
    };
}

// ---------- investigações (v3.24): abertura e final em jornal, TV ou rádio ----------
const VEIC = {
    pt: [['Jornal da Cidade', 'EDIÇÃO EXTRA', 'jornal'], ['Telejornal Regional', 'PLANTÃO · TELEJORNAL', 'tv'], ['Rádio Notícias', 'PLANTÃO · RÁDIO', 'radio']],
    en: [['The City Courier', 'EXTRA EDITION', 'jornal'], ['Regional TV News', 'BREAKING · TV NEWS', 'tv'], ['News Radio', 'BREAKING · RADIO', 'radio']],
};
const hashId = (id) => { let h = 7; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const veiculoDe = (id, lang) => VEIC[lang === 'en' ? 'en' : 'pt'][hashId(id) % 3];
const CENA_INV = (id) => /^falso-/.test(id) ? 'mercado' : /hospital|medicina|zaragoza/.test(id) ? 'hospital' : /arquivo|tempo|pesquisa/.test(id) ? 'montanha' : /radonio|escola/.test(id) ? 'fabrica' : 'mercado';

/** Abertura de uma investigação como reportagem (objeto no formato de JORNAIS[x]). `inv` é a investigação já resolvida ou bruta. */
export function jornalInvestigacao(inv) {
    const L = (k) => {
        const v = veiculoDe(inv.id, k), I = inv[k] || inv.en, c0 = inv.cenas && inv.cenas[0] && inv.cenas[0].texto;
        const texto = c0 ? (typeof c0 === 'string' ? c0 : (c0[k] || c0.pt)) : I.descricao;
        return {
            nome: v[0], data: '', kicker: v[1], manchete: I.titulo, sub: I.descricao, paragrafos: [texto],
            legenda: k === 'pt' ? 'Desenho do jogo: o local do caso.' : 'Game drawing: the case site.',
            jogo: k === 'pt' ? 'Sua missão: seguir as pistas no local e dizer o que os dados sustentam.' : 'Your mission: follow the clues on site and say what the data support.',
            rodape: k === 'pt' ? 'Reportagem fictícia de treino; nenhum evento real é descrito.' : 'Fictional training report; no real event is described.',
        };
    };
    return { cena: CENA_INV(inv.id), edicao: 'plantao', pt: L('pt'), en: L('en') };
}

/** Final de uma investigação: "edição extra" com a decisão da equipe e o que ficou em aberto. `f` = ficha (montarFicha). */
export function reportagemInvestigacao(f, lang = 'pt') {
    const pt = lang !== 'en', v = veiculoDe(f.investigacao, lang), tit = f.titulo || '';
    const ev = (f.evidencias || []).map((e) => e.texto).filter(Boolean);
    const par = [];
    if (ev.length) par.push((pt ? 'A equipe registrou estas evidências: ' : 'The team recorded this evidence: ') + ev.join(' · '));
    if (f.limite) par.push((pt ? 'O que ficou com a equipe: ' : 'What stays with the team: ') + f.limite);
    if (!par.length) par.push(pt ? 'A equipe ainda não registrou conclusões.' : 'The team has not recorded conclusions yet.');
    return {
        nome: v[0], kicker: v[1].startsWith('PLANT') || v[1].startsWith('BREAK') ? v[1] : (pt ? 'EDIÇÃO EXTRA' : 'EXTRA EDITION'),
        manchete: f.concluida ? (pt ? `Caso encerrado: ${tit}` : `Case closed: ${tit}`) : (pt ? `Caso em aberto: ${tit}` : `Case still open: ${tit}`),
        sub: f.decisao ? (pt ? `Mensagem da equipe: ${f.decisao}` : `Team message: ${f.decisao}`) : (pt ? 'Investigação em andamento' : 'Investigation in progress'),
        paragrafos: par,
        rodape: pt ? 'Edição fictícia do jogo; o texto vem do caderno da equipe.' : 'Fictional edition from the game; the text comes from the team’s notebook.',
    };
}
