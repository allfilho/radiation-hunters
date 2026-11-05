// ============================================
// EMISSÕES POR ISÓTOPO (etapa 5e-B). Fonte única para o cofre (prateleiras e fichas) e, na etapa F, para o Geiger.
//
// Valores por 100 decaimentos do próprio nuclídeo, lidos nas fichas do LNHB/DDEP (Laboratoire National Henri Becquerel),
// http://www.lnhb.fr/nuclides/<Nuclídeo>_tables.pdf (registro em docs/referencias-5c/busca/agente-D-5d3.md, V5D3.8 e V5E.1).
// Beta: keV = energia MÁXIMA do ramo. Alfa: keV = energia da partícula. Gama: energia do fóton.
// Só as linhas do próprio nuclídeo entram na regra da prateleira; o filho com ficha própria vai em `filho`, informativo
// (exceção: o Ba-137m já está na ficha do Cs-137 no LNHB). Linhas abaixo de ~1 por 100 foram omitidas quando irrelevantes.
// status: V = lido na fonte (por extração do PDF; ver ressalvas em V5D3.8).
// ============================================

const LNHB = (n) => `LNHB/DDEP, ${n}_tables.pdf, http://www.lnhb.fr/nuclides/${n}_tables.pdf`;
const a = (keV, y) => ({ tipo: 'alfa', keV, y });
const b = (keV, y) => ({ tipo: 'beta', keV, y });
const g = (keV, y) => ({ tipo: 'gama', keV, y });

export const EMISSOES = {
    'U-238':  { linhas: [a(4198, 77.54), a(4151, 22.33), a(4038, 0.13)], fonte: LNHB('U-238'), status: 'V',
                nota: 'Sem gama do próprio U-238 (as gamas de 49,55 e 113,5 keV são do filho Th-234).' },
    'Am-241': { linhas: [a(5485.56, 84.45), a(5442.86, 13.23), a(5388.25, 1.66), g(59.5409, 35.92)], fonte: LNHB('Am-241'), status: 'V' },
    'Po-210': { linhas: [a(5304.33, 99.99876), g(803.052, 0.00124)], fonte: LNHB('Po-210'), status: 'V' },
    'Ra-226': { linhas: [a(4784.34, 94.038), a(4601, 5.950), a(4340, 0.0066), g(186.211, 3.555), g(262.27, 0.0055)],
                fonte: 'LNHB/DDEP, Ra-226 (V. Chisté e M. M. Bé, 2007), https://www-nds.iaea.org/act_ddl/data/Ra-226_com.pdf', status: 'V',
                nota: 'Numa fonte selada e antiga, os filhos do radônio (Pb-214, Bi-214) acumulam; o Bi-214 emite gama de 609,3 keV em 45,49 por 100 (mesma ficha). Fora da regra: só o próprio nuclídeo conta.' },
    'Sr-90':  { linhas: [b(545.9, 100)], fonte: LNHB('Sr-90'), status: 'V',
                filho: { nome: 'Y-90', meiaVidaDias: 2.6684, linhas: [b(2278.7, 99.983), g(1760.7, 0.017)], fonte: LNHB('Y-90') } },
    'P-32':   { linhas: [b(1710.661, 100)], fonte: LNHB('P-32'), status: 'V' },
    'I-131':  { linhas: [b(606.3, 89.4), b(333.8, 7.20), b(247.9, 2.13), g(364.489, 81.2), g(636.989, 7.12), g(284.305, 6.14), g(80.185, 2.61), g(722.911, 1.79)],
                fonte: LNHB('I-131'), status: 'V' },
    'Tc-99m': { linhas: [g(140.511, 88.5)], fonte: LNHB('Tc-99m'), status: 'V', nota: 'Transição isomérica; ramos beta desprezíveis (< 0,003 por 100).' },
    'Cs-137': { linhas: [b(513.97, 94.57), b(1175.63, 5.43), g(661.655, 85.01)], fonte: LNHB('Cs-137'), status: 'V', nota: 'A gama de 661,7 keV vem do Ba-137m e está na ficha do Cs-137.' },
    'Ir-192': { linhas: [b(675.1, 47.9), b(538.8, 41.4), b(258.7, 5.59), g(316.506, 82.75), g(468.069, 47.81), g(308.455, 29.68), g(295.957, 28.72), g(604.411, 8.20), g(612.462, 5.34)],
                fonte: LNHB('Ir-192'), status: 'V', nota: 'Também decai por captura eletrônica (4,87 por 100).' },
    'Co-60':  { linhas: [b(317.32, 99.88), b(1490.56, 0.12), g(1173.228, 99.85), g(1332.492, 99.9826)], fonte: LNHB('Co-60'), status: 'V' },
};

export const TIPOS = ['alfa', 'beta', 'gama'];
/** Ordem de penetração para a regra da prateleira. */
export const PENETRACAO = { alfa: 1, beta: 2, gama: 3 };

/** Soma dos rendimentos por tipo (por 100 decaimentos), só linhas do próprio nuclídeo. */
export function rendimentoPorTipo(nome) {
    const e = EMISSOES[nome];
    if (!e) return null;
    const r = { alfa: 0, beta: 0, gama: 0 };
    for (const l of e.linhas) r[l.tipo] += l.y;
    return r;
}

/** Linha de maior rendimento de um tipo (a "energia principal" da ficha). */
export function linhaPrincipal(nome, tipo) {
    const e = EMISSOES[nome];
    if (!e) return null;
    return e.linhas.filter((l) => l.tipo === tipo).sort((x, y) => y.y - x.y)[0] || null;
}

/** Energia efetiva da gama (MeV): média ponderada pelo rendimento das linhas gama com rendimento >= 10 por 100; null se não houver. */
export function energiaGamaEfetiva(nome) {
    const e = EMISSOES[nome];
    const ls = e ? e.linhas.filter((l) => l.tipo === 'gama' && l.y >= 10) : [];
    if (!ls.length) return null;
    return ls.reduce((s, l) => s + l.keV * l.y, 0) / ls.reduce((s, l) => s + l.y, 0) / 1000;
}

/** Alcance máximo do elétron em mg/cm², relação de Katz e Penfold (1952), válida de 0,01 a 2,5 MeV (E = energia máxima, MeV). */
export const alcanceBetaKP = (MeV) => 412 * MeV ** (1.265 - 0.0954 * Math.log(MeV));

/** Energia máxima (MeV) do ramo beta mais intenso; null se o nuclídeo não emite beta. */
export function emaxBetaPrincipal(nome) {
    const l = linhaPrincipal(nome, 'beta');
    return l ? l.keV / 1000 : null;
}
