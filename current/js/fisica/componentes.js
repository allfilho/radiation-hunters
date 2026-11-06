// ============================================
// COMPONENTES DE EMISSÃO DE UMA FONTE (etapa 5e-F). Puro, roda em Node.
//
// O Geiger do jogo trata cada fonte como uma soma de componentes (alfa, beta, gama). Entram as emissões do próprio
// nuclídeo com rendimento >= LIMIAR_COMPONENTE por 100 decaimentos (a mesma regra do cofre; docs/cofre-5e-plano.md);
// uma emissão dominante deixa as outras de fora (Am-241 e Ra-226: só alfa; Sr-90: só beta).
//
// A componente PRIMÁRIA é a do `type` do isótopo em isotopes.js (mesma força, energia e alcance). Desde 27/10/2026 o I-131 é gama primário (beta secundária).
// Cada componente secundária tem peso = rendimento do seu tipo / rendimento do tipo primário (emissoes.js, LNHB/DDEP [V]);
// a força dela é base × fatorForca[tipo] × peso [H: fatorForca é escolha de jogo]. Energia da gama secundária: média das
// linhas gama >= 10 por 100; alcance da beta secundária: Katz-Penfold na Emax do ramo principal.
// ============================================
import { EMISSOES, TIPOS, rendimentoPorTipo, energiaGamaEfetiva, emaxBetaPrincipal, alcanceBetaKP } from '../data/emissoes.js';

export const LIMIAR_COMPONENTE = 50;

/** @param iso {name, type, energyMeV?, betaRangeMgCm2?}  @returns [{tipo, peso, energyMeV?, betaRangeMgCm2?}] (primária primeiro) */
export function componentesDe(iso, limiar = LIMIAR_COMPONENTE) {
    const prim = { tipo: iso.type, peso: 1, energyMeV: iso.energyMeV, betaRangeMgCm2: iso.betaRangeMgCm2 };
    const r = rendimentoPorTipo(iso.name);
    if (!r || !(r[iso.type] > 0)) return [prim];
    const out = [prim];
    for (const t of TIPOS) {
        if (t === iso.type || r[t] < limiar) continue;
        const c = { tipo: t, peso: r[t] / r[iso.type] };
        if (t === 'gama') c.energyMeV = energiaGamaEfetiva(iso.name);
        if (t === 'beta') c.betaRangeMgCm2 = alcanceBetaKP(emaxBetaPrincipal(iso.name));
        out.push(c);
    }
    return out;
}

const SIMBOLO = { alfa: 'α', beta: 'β', gama: 'γ' };
const NOME = { alfa: { pt: 'alfa', en: 'alpha' }, beta: { pt: 'beta', en: 'beta' }, gama: { pt: 'gama', en: 'gamma' } };
const num = (x, L) => { const s = String(Math.round(x * 10) / 10); return L === 'pt' ? s.replace('.', ',') : s; };

/** Tipos das componentes em texto: "beta e gama" / "beta and gamma". */
export function nomesDasComponentes(iso, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt', ns = componentesDe(iso).map((c) => NOME[c.tipo][L]);
    return ns.join(L === 'pt' ? ' e ' : ' and ');
}

/**
 * Linha de emissões para a ficha de identificação: só as componentes do Geiger, com energia (LNHB) e rendimento por 100 decaimentos.
 * Ex.: "β (até 514 keV; 100 em 100) + γ (661,7 keV; 85,0 em 100)".
 */
export function descreverEmissoes(iso, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt', e = EMISSOES[iso.name], r = rendimentoPorTipo(iso.name);
    if (!e || !r) return '';
    const em100 = L === 'pt' ? 'em 100' : 'per 100';
    return componentesDe(iso).map((c) => {
        const ls = e.linhas.filter((l) => l.tipo === c.tipo && l.y >= 10).sort((a, b) => a.keV - b.keV);
        const energia = c.tipo === 'beta'
            ? (L === 'pt' ? 'até ' : 'up to ') + num(ls[ls.length ? ls.length - 1 : 0]?.keV ?? 0, L) + ' keV'
            : ls.map((l) => num(l.keV, L)).join(L === 'pt' ? ' e ' : ' and ') + ' keV';
        return `${SIMBOLO[c.tipo]} (${energia}; ${num(r[c.tipo], L)} ${em100})`;
    }).join(' + ');
}

/**
 * Espectrômetro gama (v3.29): linhas gama do nuclídeo, dos dados LNHB de `emissoes.js` (rendimento >= 10 por 100).
 * Devolve "661,7 keV" / "1173,2 e 1332,5 keV"; '' se o nuclídeo não emite gama; null se não há dados de emissão.
 */
export function linhasGamaTexto(iso, lang = 'pt') {
    const L = lang === 'en' ? 'en' : 'pt', e = EMISSOES[iso.name];
    if (!e) return null;
    const ls = e.linhas.filter((l) => l.tipo === 'gama' && l.y >= 10).sort((a, b) => a.keV - b.keV);
    if (!ls.length) return '';
    return ls.map((l) => num(l.keV, L)).join(L === 'pt' ? ' e ' : ' and ') + ' keV';
}
