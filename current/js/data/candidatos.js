// ============================================
// CANDIDATOS DA IDENTIFICAÇÃO (revisão do cofre, etapa 4, 27/10/2026). Puro, roda em Node.
//
// O modal "Identificar" mostra uma lista FIXA por missão, sem nomes repetidos: os isótopos distintos das fontes da missão
// (achadas ou não, porque pode haver outra fonte igual) mais os `candidatosExtras` do arquivo da missão (distratores).
// Antes, a lista tinha um botão por fonte ainda não achada: na missão 2 eram cinco botões "Cs-137" e a resposta era óbvia.
// Os distratores devem ser distinguíveis do isótopo real com as placas do jogo (teste 36), exceto onde o Geiger não separa
// (Am-241 e Ra-226 são alfa só por contato: nunca aparecem juntos).
// A ordem é alfabética, para não entregar a resposta pela posição.
// ============================================
import { ISOTOPES } from './isotopes.js';
import { componentesDe, nomesDasComponentes } from '../fisica/componentes.js';

/** @param fontes fontes da missão ({name,...}); @param extras nomes de isótopos distratores; @returns [{name,type,symbol,...}] sem repetição */
export function candidatosDaMissao(fontes, extras = [], tabela = ISOTOPES) {
    const mapa = new Map();
    for (const s of fontes || []) if (s && s.name && !mapa.has(s.name)) mapa.set(s.name, s);
    for (const n of extras || []) {
        if (mapa.has(n)) continue;
        const i = tabela.find((x) => x.name === n);
        if (i) mapa.set(n, i);
    }
    return [...mapa.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const SIMBOLO = { alfa: 'α', beta: 'β', gama: 'γ' };

/**
 * Rótulo do botão de um candidato: símbolos e nomes das componentes no idioma do jogo, e, se houver gama, a energia dela.
 * Ex.: "γ+β gama e beta · γ ≈ 0,36 MeV". A energia é o que separa candidatos do mesmo tipo (I-131, Cs-137 e Co-60 são todos γ+β):
 * com chumbo, quanto mais energética a gama, menos o sinal cai (I-131 2,5%, Cs-137 17%, Co-60 46% passam a 0,5 m; modelo do jogo).
 */
export function rotuloDoCandidato(iso, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt', comps = componentesDe(iso);
    let s = `${comps.map((c) => SIMBOLO[c.tipo]).join('+')} ${nomesDasComponentes(iso, L)}`;
    const g = comps.find((c) => c.tipo === 'gama' && c.energyMeV);
    if (g) { const e = g.energyMeV.toFixed(2); s += ` · γ ≈ ${L === 'pt' ? e.replace('.', ',') : e} MeV`; }
    return s;
}
