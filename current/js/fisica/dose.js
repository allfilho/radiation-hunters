// ============================================
// DOSE DO CIENTISTA EM CAMPO (escala de jogo, SIMPLIFICAÇÃO). Lógica PURA.
//
// Só a radiação gama conta (alfa e beta são desprezadas: o alfa não atravessa a pele e o beta é curto; isso é uma simplificação do jogo).
// A taxa de dose é proporcional à taxa de contagem gama que um Geiger "sem direção" mediria no lugar do cientista, ignorando a
// blindagem do detector (o corpo não tem placa), mas contando as paredes. O fator K é uma ESCOLHA DE JOGO [H]:
// calibrado com um robô que anda pelas missões 2 a 8 e fica 10 s junto de cada fonte (3 sorteios por missão): cerca de 9 000 a
// 21 000 cps·s por saída (missão 3 não tem gama). Com K = 5e-5, um jogador rápido recebe 0,5–1 mSv, um médio (1,5× o tempo do robô)
// 0,7–1,4 mSv e um lento (2,5×) 1,1–2,4 mSv: perto do limite diário (1,5 mSv), de modo que revezar a equipe compensa. No simulador de
// um ano (tests/ferramentas/calibrar-economia.mjs): 0, ~3 e ~24 cientistas por ano em tratamento nesses três ritmos. Não é uma dose real.
// ============================================
import { taxaFonte } from './geiger.js';

export const DOSE = {
    kMsvPorCpsS: 5e-5,   // mSv por (cps·s) de jogo [H]; calibrado em 28/10/2026 (ver abaixo)
    passoS: 0.25,        // a dose é somada a cada 250 ms de jogo
    erroIdMsv: 0.3,      // dose extra ao cientista que identifica errado (demora junto à fonte) [H], v3.29: 20 % do limite diário de 1,5 mSv
};

/** cps gama (fundo excluído) no ponto `sonda`, de todas as fontes ainda NÃO achadas; sem blindagem e sem direção. */
export function taxaGamaCps(fontes, sonda, ctx) {
    let soma = 0;
    for (const f of fontes) {
        if (f.found) continue;
        const comps = (f.componentes && f.componentes.length ? f.componentes : [{ tipo: f.type, peso: 1, energyMeV: f.energyMeV }]).filter((c) => c.tipo === 'gama');
        if (!comps.length) continue;
        const dir = Math.atan2(f.y - sonda.y, f.x - sonda.x);
        soma += taxaFonte({ ...f, componentes: comps }, { x: sonda.x, y: sonda.y, dir }, { ...ctx, blindagem: null });
    }
    return soma;
}

/** Dose (mSv) recebida em `dtS` segundos a `cps` contagens por segundo. */
export const doseDe = (cps, dtS) => Math.max(0, cps) * Math.max(0, dtS) * DOSE.kMsvPorCpsS;
