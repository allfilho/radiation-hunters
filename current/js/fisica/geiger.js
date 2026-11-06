// ============================================
// GEIGER: modelo físico simplificado (projeto 3a, docs/geiger-projeto-3a.md)
// Função pura: não depende de Phaser nem do DOM, roda em Node.
//
// Taxa esperada (contagens por segundo) na sonda:
//   R = fundo + soma_i  S_i · G_i(d) · T_ar · T_blindagem · T_parede · f(θ)
//
//  gama: G = (1 m / d)², atenuação exponencial exp(-μ·x) no ar, na blindagem e nas paredes;
//        aceitação angular com piso (atravessa a carcaça da sonda).
//  beta: G = (0,5 m / d)², corte por alcance: T = max(0, 1 - x/R), x em mg/cm² (ar + blindagem);
//        parede bloqueia; cone estreito (janela fina).
//  Cada fonte soma componentes (fisica/componentes.js): ex. Cs-137 = gama + beta; I-131 = gama + beta (primária gama desde 27/10/2026); Am-241 = só alfa.
//  alfa: só por contato (didático, projeto D1): conta se a superfície do móvel está a até
//        ALFA_ALCANCE_TILES da sonda; qualquer anteparo ou parede zera; cone estreito.
//
// Rótulos: [V] valor verificado em fonte (docs/parametros-fisicos.json); [H] escolha de jogo.
// ============================================

// Coeficientes de atenuação mássicos μ/ρ (cm²/g), NIST XCOM (consulta de 13/10/2026) [V].
export const ENERGIAS_MEV = [0.1, 0.2, 0.3, 0.5, 0.6, 0.8, 1.0, 1.25, 1.5];
export const MU_RHO = {
    chumbo:   [5.549, 0.9985, 0.4031, 0.1614, 0.1248, 0.0887, 0.07102, 0.05876, 0.05222],
    aluminio: [0.1704, 0.1223, 0.1042, 0.08445, 0.07802, 0.06841, 0.06146, 0.05496, 0.05006],
    concreto: [0.1738, 0.1282, 0.1097, 0.08915, 0.08236, 0.07227, 0.06495, 0.05807, 0.05288],
    acrilico: [0.1641, 0.1328, 0.1152, 0.0941, 0.08701, 0.07641, 0.0687, 0.06143, 0.05591],
    ar:       [0.1541, 0.1233, 0.1067, 0.08712, 0.08055, 0.07074, 0.06358, 0.05687, 0.05175],
};
// Densidades (g/cm³), NIST Tabelas 1 e 2 [V]
export const DENSIDADE = { chumbo: 11.35, aluminio: 2.699, concreto: 2.30, acrilico: 1.19, ar: 1.205e-3 };

export const PARAMETROS = {
    fundoCps: 5,                                    // [H]
    fatorForca: { gama: 0.3, beta: 1.0, alfa: 1.0 },// [H] S = base × fator (projeto 3a, seção 6 / 12)
    refGamaM: 1.0, refBetaM: 0.5,                   // distâncias de referência de S [H]
    distMinM: 0.25,                                 // fonte dentro de um móvel de >= 1 tile [H]
    semiAnguloRad: Math.PI / 4,                     // cone de aceitação (90°) [H]
    gamaForaDoCone: 0.3,                            // piso da aceitação gama [H]
    alfaAlcanceTiles: 1.0,                          // alcance didático do alfa, medido da superfície [H]
};

/** v3.31: a sonda de cintilação para alfa (Oficina) multiplica a força do alfa na leitura: mais sensibilidade, mesmo alcance de contato [H]. */
export const SONDA_ALFA_FATOR = 3;

/** μ/ρ por interpolação log-log; fora de 0,1-1,5 MeV usa o ponto mais próximo (aproximação) */
export function muRho(material, energiaMeV) {
    const v = MU_RHO[material];
    if (!v) throw new Error('material desconhecido: ' + material);
    const E = ENERGIAS_MEV;
    if (energiaMeV <= E[0]) return v[0];
    if (energiaMeV >= E[E.length - 1]) return v[v.length - 1];
    for (let i = 0; i < E.length - 1; i++) {
        if (energiaMeV >= E[i] && energiaMeV <= E[i + 1]) {
            const a = (Math.log(energiaMeV) - Math.log(E[i])) / (Math.log(E[i + 1]) - Math.log(E[i]));
            return Math.exp(Math.log(v[i]) + a * (Math.log(v[i + 1]) - Math.log(v[i])));
        }
    }
}
/** μ linear (1/cm) */
export const muLinear = (material, energiaMeV) => muRho(material, energiaMeV) * DENSIDADE[material];

/** Transmissão de feixe estreito: exp(-Σ μ_i · x_i). camadas = [{material, cm}] */
export function transmissaoGama(camadas, energiaMeV) {
    let soma = 0;
    for (const c of camadas) if (c && c.material && c.cm > 0) soma += muLinear(c.material, energiaMeV) * c.cm;
    return Math.exp(-soma);
}

/** Transmissão beta: 1 - x/R (x e R em mg/cm²), truncada em [0,1] [H: forma linear; R: Katz-Penfold, V] */
export function transmissaoBeta(camadas, alcanceMgCm2) {
    let x = 0;
    for (const c of camadas) if (c && c.material && c.cm > 0) x += DENSIDADE[c.material] * 1000 * c.cm;
    return Math.max(0, 1 - x / alcanceMgCm2);
}

/** Nº de tiles de parede que o raio (em coordenadas de tile) atravessa. */
export function paredesNoRaio(ehParede, x0, y0, x1, y1) {
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 0.05));
    const vistos = new Set();
    for (let i = 0; i <= n; i++) {
        const x = Math.floor(x0 + (x1 - x0) * i / n), y = Math.floor(y0 + (y1 - y0) * i / n);
        if (ehParede(x, y)) vistos.add(x + ',' + y);
    }
    return vistos.size;
}

/** Ponto do retângulo {x,y,w,h} (tiles) mais próximo de (px,py). */
export function pontoMaisProximo(r, px, py) {
    return { x: Math.min(Math.max(px, r.x), r.x + r.w), y: Math.min(Math.max(py, r.y), r.y + r.h) };
}
export function distanciaAoRetangulo(r, px, py) {
    const p = pontoMaisProximo(r, px, py);
    return Math.hypot(p.x - px, p.y - py);
}
function difAngulo(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d);
}

/**
 * Taxa esperada de UMA fonte (cps), sem o fundo: soma das componentes.
 * fonte: { type:'alfa'|'beta'|'gama', base, x, y (centro, tiles), rect:{x,y,w,h} (tiles),
 *          energyMeV?, betaRangeMgCm2?,
 *          componentes?: [{tipo, peso, energyMeV?, betaRangeMgCm2?}] }   (sem `componentes`: uma só, do `type`)
 * sonda: { x, y (tiles), dir (rad) }
 * ctx:   { tileM, ehParede(x,y), paredeCm, blindagem:{material,cm}|null, params?, alfaAlcanceTiles? }
 */
export function taxaFonte(fonte, sonda, ctx) {
    const P = ctx.params || PARAMETROS;
    const tileM = ctx.tileM;
    const paredeCamada = (n) => ({ material: 'concreto', cm: n * ctx.paredeCm });
    const nParedes = paredesNoRaio(ctx.ehParede, sonda.x, sonda.y, fonte.x, fonte.y);
    const dTiles = Math.hypot(fonte.x - sonda.x, fonte.y - sonda.y);
    const dM = Math.max(dTiles * tileM, P.distMinM);
    const theta = difAngulo(Math.atan2(fonte.y - sonda.y, fonte.x - sonda.x), sonda.dir);
    const bl = ctx.blindagem && ctx.blindagem.material ? ctx.blindagem : null;
    const comps = fonte.componentes && fonte.componentes.length
        ? fonte.componentes
        : [{ tipo: fonte.type, peso: 1, energyMeV: fonte.energyMeV, betaRangeMgCm2: fonte.betaRangeMgCm2 }];

    let soma = 0;
    for (const c of comps) {
        const S = fonte.base * P.fatorForca[c.tipo] * (c.peso ?? 1);
        if (c.tipo === 'gama') {
            const E = c.energyMeV ?? 0.66;
            const camadas = [{ material: 'ar', cm: dM * 100 }, paredeCamada(nParedes)];
            if (bl) camadas.push(bl);
            const f = theta <= P.semiAnguloRad ? 1 : P.gamaForaDoCone;
            soma += S * (P.refGamaM / dM) ** 2 * transmissaoGama(camadas, E) * f;
        } else if (c.tipo === 'beta') {
            if (nParedes > 0 || theta > P.semiAnguloRad) continue;
            const camadas = [{ material: 'ar', cm: dM * 100 }];
            if (bl) camadas.push(bl);
            const T = transmissaoBeta(camadas, c.betaRangeMgCm2 ?? 500);
            soma += S * (P.refBetaM / dM) ** 2 * T * Math.cos(theta) ** 2;
        } else {
            // alfa: contato com a superfície do móvel
            if (nParedes > 0 || bl || theta > P.semiAnguloRad) continue;
            const ds = distanciaAoRetangulo(fonte.rect, sonda.x, sonda.y);
            const alcance = ctx.alfaAlcanceTiles ?? P.alfaAlcanceTiles;   // assistência por tempo pode ampliar
            if (ds > alcance) continue;
            soma += S * (1 - ds / alcance) * Math.cos(theta) ** 2;
        }
    }
    return soma;
}

/** Taxa esperada total (cps) = fundo + soma das fontes ainda não achadas. */
export function taxaEsperada(fontes, sonda, ctx) {
    const P = ctx.params || PARAMETROS;
    let r = P.fundoCps;
    for (const f of fontes) if (!f.found) r += taxaFonte(f, sonda, ctx);
    return r;
}

/** Poisson exato (Knuth) para λ pequeno; aproximação normal acima de 40 (erro desprezível aqui). */
export function poisson(lambda, rand = Math.random) {
    if (!(lambda > 0)) return 0;
    if (lambda > 40) {
        const u1 = Math.max(rand(), 1e-12), u2 = rand();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * z));
    }
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rand(); } while (p > L);
    return k - 1;
}

/** Contagens numa janela de dt segundos. */
export const contar = (taxa, dt, rand = Math.random) => poisson(taxa * dt, rand);

/** Perda relativa de atividade em t segundos: 1 - 2^(-t/T½). */
export const perdaDeAtividade = (tSeg, meiaVidaSeg) => 1 - Math.pow(2, -tSeg / meiaVidaSeg);

/**
 * Média móvel das últimas contagens: guarda pares {n, dt}; devolve cps e incerteza (√N/T).
 * É o que o painel mostra (janela de 3 s, projeto D6).
 */
export class JanelaDeContagem {
    constructor(janelaS = 3) { this.janela = janelaS; this.itens = []; }
    reset() { this.itens = []; }
    adicionar(n, dt) {
        this.itens.push({ n, dt });
        let soma = this.itens.reduce((a, b) => a + b.dt, 0);
        while (this.itens.length > 1 && soma - this.itens[0].dt >= this.janela) { soma -= this.itens[0].dt; this.itens.shift(); }
    }
    get tempo() { return this.itens.reduce((a, b) => a + b.dt, 0); }
    get contagens() { return this.itens.reduce((a, b) => a + b.n, 0); }
    get cps() { const t = this.tempo; return t > 0 ? this.contagens / t : 0; }
    get incerteza() { const t = this.tempo; return t > 0 ? Math.sqrt(this.contagens) / t : 0; }
}
