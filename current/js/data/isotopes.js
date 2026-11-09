// Isotope definitions with activity ranges.
//
// minBase/maxBase: força de jogo da fonte (cps de referência; ver fisica/geiger.js).
// Campos físicos (fonte: docs/parametros-fisicos.json e docs/geiger-projeto-3a.md):
//   halfLifeS     meia-vida em segundos (LNE-LNHB/CEA, Table de Radionucléides; 1 ano = 365,2422 d)
//   energyMeV     gama: energia efetiva do fóton; alfa: energia da partícula emitida
//   betaRangeMgCm2  alcance máximo do elétron (Katz-Penfold 1952, na energia máxima), em mg/cm²
// I-131: componente primária gama (364,5 keV, 81,2 por 100 na linha principal; 98,9 por 100 no total); a beta (606 keV máx.) entra como secundária, com peso 0,9987.
// Sr-90 usa o alcance do Y-90 (filho em equilíbrio, Emax = 2278,7 keV, LNHB/DDEP [V]; Katz-Penfold dá 1095 mg/cm², o valor usado).
const ANO = 365.2422 * 86400;
const DIA = 86400;
const HORA = 3600;

export const ISOTOPES = [
    { name: "U-238",  type: "alfa", color: "#eebb40", minBase: 40,  maxBase: 90,  symbol: "α", halfLifeS: 4.468e9 * ANO,  energyMeV: 4.198 },
    { name: "Am-241", type: "alfa", color: "#ffb5b5", minBase: 80,  maxBase: 160, symbol: "α", halfLifeS: 432.6 * ANO,    energyMeV: 5.486 },
    { name: "Po-210", type: "alfa", color: "#ffe08f", minBase: 70,  maxBase: 120, symbol: "α", halfLifeS: 138.3763 * DIA, energyMeV: 5.304 },
    { name: "Sr-90",  type: "beta", color: "#72b5ff", minBase: 170, maxBase: 300, symbol: "β", halfLifeS: 28.80 * ANO,    betaRangeMgCm2: 1095 },
    { name: "P-32",   type: "beta", color: "#46ff95", minBase: 220, maxBase: 400, symbol: "β", halfLifeS: 14.273 * DIA,   betaRangeMgCm2: 791 },
    { name: "I-131",  type: "gama", color: "#78deff", minBase: 220, maxBase: 420, symbol: "γ", halfLifeS: 8.0233 * DIA,   energyMeV: 0.3645, betaRangeMgCm2: 214 },
    { name: "Tc-99m", type: "gama", color: "#b07cff", minBase: 300, maxBase: 620, symbol: "γ", halfLifeS: 6.0067 * HORA,  energyMeV: 0.1405 },
    { name: "Cs-137", type: "gama", color: "#ca4ff9", minBase: 360, maxBase: 720, symbol: "γ", halfLifeS: 30.018 * ANO,   energyMeV: 0.6617 },
    { name: "Ir-192", type: "gama", color: "#f28bff", minBase: 380, maxBase: 820, symbol: "γ", halfLifeS: 73.827 * DIA,   energyMeV: 0.372 },
    { name: "Co-60",  type: "gama", color: "#f66bff", minBase: 500, maxBase: 950, symbol: "γ", halfLifeS: 5.2711 * ANO,   energyMeV: 1.25 },
];

// v3.35 (Fase E): fonte de nêutrons por reação (α,n). NÃO entra em ISOTOPES (que alimenta o sorteio de fontes e as listas de candidatos):
// as missões que a usam a declaram em `addIsotope` (como o Ra-226). Meia-vida: a do Am-241 (LNHB, a mesma de acima).
// Emissão (fontes consultadas em 06/11/2026, docs em claude/radhunter-fase-e-neutrons.md): nêutrons com espectro contínuo até ~10 MeV;
// gama de 4,4 MeV do 12C* com taxa de ~0,75 da de nêutrons (HPS q12136; o arXiv 2605.03211 usa 1 e cita ~0,7) [V]; gama de 60 keV do Am-241
// muito atenuado na própria fonte, por isso fora do modelo. `base` é a força de jogo (cps de nêutron a 1 m, [H]); o gama fica com peso 0,75 [V/H].
export const AMBE = {
    name: "Am-241/Be", type: "neutron", color: "#9fe8a8", minBase: 120, maxBase: 260, symbol: "n",
    halfLifeS: 432.6 * ANO,
    componentes: [{ tipo: "neutron", peso: 1 }, { tipo: "gama", peso: 0.75, energyMeV: 4.44 }],
    linhasGama: [{ keV: 60 }, { keV: 4440 }],
};
