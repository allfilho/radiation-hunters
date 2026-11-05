// ============================================
// KIT DE ARTE · TRANSPORTE DE EQUIPE (v3.25). Nave de transporte em corte e por fora, com rampa traseira, cabine e bancos laterais.
// Inspirada na IDEIA de jogos de estratégia de esquadrão (o transporte onde a equipe embarca e viaja sentada); desenho ORIGINAL deste projeto:
// silhueta, proporções, cores e detalhes próprios, sem copiar nave, personagem ou arte de nenhum jogo. Módulo PURO (devolve texto SVG).
// Convenções do kit: coordenadas inteiras, luz de cima à esquerda, cores da paleta (tom()).
// ============================================
import { P, tom } from './paleta.js';
import { r, poli, lin, grupo, bisel, led } from './primitivas.js';

const COR = { casco: '#dfe8ee', sombra: '#a9bac7', faixa: '#3f86c5', vidro: '#9fd8ff' };
const hash = (s) => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

/** Figura de cientista (pixel art vetorial): `sentado` ou de pé/andando (`passo` alterna as pernas). Altura de pé ≈ 26. Origem = pé. */
export function figuraSvg(m = {}, { sentado = false, passo = 0, olhaDireita = true } = {}) {
    const h = hash(m.id || m.nome || 'x'), pele = m.pele || P.peles[h % P.peles.length], cabelo = m.cabelo || P.cabelos[(h >> 3) % P.cabelos.length];
    const jaleco = m.jaleco || P.jalecos[(h >> 5) % P.jalecos.length], colete = '#ff6b35';
    const esc = olhaDireita ? '' : 'scale(-1 1)';
    const cabeca = r(-4, -26, 8, 8, pele) + r(-4, -27, 8, 3, cabelo) + r(-5, -25, 1, 4, cabelo) + (olhaDireita ? r(1, -22, 2, 1, '#111') : r(-3, -22, 2, 1, '#111'));
    const capacete = r(-5, -29, 10, 3, '#f1c232') + r(-5, -27, 10, 1, tom('#f1c232', -.3));
    if (sentado) {   // de perfil, sentado no banco; pés para a frente
        return `<g transform="${esc}">` + r(-5, -19, 9, 11, jaleco) + r(-5, -19, 9, 2, tom(jaleco, -.15)) + r(-1, -17, 5, 8, colete, 'opacity=".9"')
            + r(-5, -8, 12, 4, tom(jaleco, -.3)) + r(5, -5, 3, 5, tom(jaleco, -.4)) + r(4, -1, 5, 2, '#222') + cabeca.replace(/-2[0-9]/g, (v) => String(Number(v) + 7)) + capacete.replace(/-2[0-9]/g, (v) => String(Number(v) + 7)) + `</g>`;
    }
    const pernaA = passo % 2 ? r(-3, -9, 3, 9, tom(jaleco, -.35)) + r(-3, -1, 4, 2, '#222') : r(-1, -9, 3, 9, tom(jaleco, -.35)) + r(-1, -1, 4, 2, '#222');
    const pernaB = passo % 2 ? r(1, -9, 3, 9, tom(jaleco, -.5)) + r(1, -1, 4, 2, '#222') : r(-4, -9, 3, 9, tom(jaleco, -.5)) + r(-4, -1, 4, 2, '#222');
    return `<g transform="${esc}">` + pernaB + pernaA + r(-5, -19, 10, 11, jaleco) + r(-5, -19, 10, 2, tom(jaleco, -.15)) + r(-2, -17, 5, 8, colete, 'opacity=".9"') + r(-6, -17, 2, 8, tom(jaleco, -.25)) + cabeca + capacete + `</g>`;
}

/**
 * Transporte por fora (lado direito = nariz). Origem = centro; o trem de pouso toca o chão em y = 27; largura ≈ 190.
 * `rampa` de 0 (fechada) a 1 (aberta, tocando o chão atrás da nave). `fogo`: chama dos motores (só em voo).
 */
export function transporteSvg({ rampa = 0, fogo = false, giro = true } = {}) {
    const [c1, c2, fx] = [COR.casco, COR.sombra, COR.faixa], escuro = tom(c2, -.4), claro = tom(c1, .35);
    // rampa traseira: fechada = porta vertical na popa; aberta = rampa que desce até o chão, atrás da nave (ponta interpola entre os dois)
    const lerp = (u, v) => u + (v - u) * rampa, tx = lerp(-92, -130), ty = lerp(-10, 26.5);
    const rampaSvg = poli([[-88, 18], [-88, 9], [tx, ty - 7], [tx, ty + 1]], tom(c2, -.25))
        + poli([[-88, 9], [tx, ty - 7], [tx, ty - 5], [-88, 11]], tom(c2, .2))
        + Array.from({ length: 5 }, (_, i) => { const u = (i + 1) / 6; return lin(-88 + (tx + 88) * u, 11 + (ty - 18) * u, -88 + (tx + 88) * u, 17 + (ty - 17) * u, P.ambar, 1, 'opacity=".75"'); }).join('');
    const asaLonge = poli([[-6, -10], [-34, -34], [-14, -34], [24, -10]], escuro);
    const nacelaLonge = r(-34, -40, 24, 10, escuro);
    const fus = `<path d="M-90 -14 L-84 -22 L36 -26 Q76 -24 92 -2 L96 8 Q84 18 40 18 L-84 18 L-90 14Z" fill="${c1}"/>`
        + `<path d="M-90 -14 L-84 -22 L36 -26 Q76 -24 92 -2 L80 -4 Q60 -16 30 -16 L-84 -14Z" fill="${claro}"/>`
        + `<path d="M-84 18 L40 18 Q84 18 96 8 L88 12 Q60 14 40 14 L-84 14Z" fill="${c2}"/>`
        + r(-84, 0, 150, 3, fx) + r(-84, 3, 150, 1, tom(fx, -.45))
        + r(-60, -16, 4, 28, escuro, 'opacity=".35"') + r(8, -18, 3, 30, escuro, 'opacity=".35"');
    const janelas = [-40, -22, -4, 14, 32].map((x) => r(x, -12, 11, 7, P.aco1) + r(x + 1, -11, 9, 5, COR.vidro, 'opacity=".75"') + r(x + 1, -11, 9, 1, '#fff', 'opacity=".5"')).join('');
    const cabine = `<path d="M58 -22 Q82 -22 92 -4 L68 -4 Q64 -12 58 -22Z" fill="${COR.vidro}" opacity=".92"/><path d="M62 -22 Q78 -21 86 -9 L68 -8Z" fill="#fff" opacity=".4"/>`;
    const nacela = (cx) => r(cx - 14, -44, 28, 14, c2) + r(cx - 14, -44, 28, 2, claro) + r(cx - 12, -32, 24, 2, escuro)
        + `<g ${giro ? 'class="ag-gira" style="transform-box:fill-box;transform-origin:center"' : ''}>${lin(cx - 24, -47, cx + 24, -47, '#2a3139', 2)}${lin(cx - 24, -47, cx + 24, -47, '#6f8696', 1, 'opacity=".4"')}</g>`
        + r(cx - 2, -47, 4, 4, '#14191e');
    const asaPerto = poli([[-10, -14], [-40, -30], [-18, -30], [28, -14]], c2) + poli([[-10, -14], [-28, -24], [-18, -24], [6, -15]], tom(c2, .25));
    const motor = r(-96, -4, 8, 14, escuro) + (fogo ? `<path class="ag-pulsa" d="M-96 0 L-118 6 L-96 12Z" fill="${P.laranja}" opacity=".9"/>` : '');
    const trem = lin(-40, 18, -40, 27, '#2a3139', 3) + lin(50, 16, 50, 27, '#2a3139', 3) + r(-46, 26, 12, 3, '#14191e') + r(44, 26, 12, 3, '#14191e');
    const luz = r(92, 4, 3, 3, P.vermelho, 'opacity=".9"') + r(-88, -10, 3, 3, P.ambar, 'opacity=".9"');
    return nacelaLonge + asaLonge + trem + rampaSvg + fus + janelas + cabine + asaPerto + nacela(-10) + nacela(40) + motor + luz;
}

/**
 * Interior em corte (viewBox 0 0 260 96): rampa traseira à esquerda, cabine com bancos ao longo da parede de fundo, cabine de comando à direita.
 * `equipe` = [{id, nome, ...}] (até 6 lugares); `sentados`: quantos já estão no banco (os demais bancos ficam vagos). `rampa` 0..1.
 */
export function interiorSvg({ equipe = [], sentados = null, rampa = 0, piloto = { id: 'otavio' } } = {}) {
    const n = sentados == null ? equipe.length : Math.min(sentados, equipe.length), PISO = 74, casco = P.aco2;
    const parede = r(0, 0, 260, 96, '#050b11') + poli([[6, 74], [10, 18], [212, 14], [246, 34], [254, 74]], P.aco1) + poli([[6, 74], [10, 18], [212, 14], [246, 34], [254, 74]], '#000', 'opacity=".25"');
    const forro = r(10, 14, 202, 5, P.aco4) + r(10, 14, 202, 1, P.aco5) + lin(14, 24, 206, 24, P.ambar, 1, 'opacity=".55"');
    const piso = r(6, PISO, 248, 6, P.aco3) + r(6, PISO, 248, 1, P.aco5) + Array.from({ length: 12 }, (_, i) => r(14 + i * 20, PISO + 2, 10, 2, P.ambar, i % 2 ? 'opacity=".25"' : 'opacity=".7"')).join('');
    const parede2 = r(24, 28, 186, 44, P.aco2) + Array.from({ length: 9 }, (_, i) => r(24 + i * 22, 28, 1, 44, P.aco1)).join('');
    const janelas = [52, 96, 140, 184].map((x) => r(x - 8, 34, 16, 11, P.aco0) + r(x - 7, 35, 14, 9, '#1d5f8a') + r(x - 7, 35, 14, 2, '#9fd8ff', 'opacity=".5"')).join('');
    // bancos: 4 (equipe da nave de tripulação) mais 2 vagos; encosto na parede, assento e apoio
    const lugares = [44, 78, 112, 146, 180];
    const bancos = lugares.map((x) => r(x - 12, 52, 3, 20, P.aco4) + r(x - 12, 52, 3, 1, P.aco5) + bisel(x - 12, 64, 22, 5, P.aco3) + r(x - 8, 69, 3, 5, P.aco1) + r(x + 4, 69, 3, 5, P.aco1)).join('');
    const pessoas = equipe.slice(0, lugares.length).map((m, i) => i < n ? grupo(lugares[i] - 2, 69, figuraSvg(m, { sentado: true, olhaDireita: true }), 1) : '').join('');
    const cintos = equipe.slice(0, n).map((m, i) => lin(lugares[i] - 7, 52, lugares[i] + 4, 66, P.laranja, 1, 'opacity=".8"')).join('');
    const corrimao = lin(30, 48, 206, 48, P.aco5, 2) + lin(30, 48, 30, 54, P.aco5, 2) + lin(206, 48, 206, 54, P.aco5, 2);
    const luzes = [60, 120, 180].map((x) => r(x - 8, 20, 16, 2, P.luzFria) + `<polygon points="${x - 8},22 ${x + 8},22 ${x + 20},60 ${x - 20},60" fill="${P.luzFria}" opacity=".05"/>`).join('');
    // rampa traseira (esquerda): fechada = parede; aberta = abre uma fresta de luz do hangar/lado de fora
    const abertura = rampa > 0 ? poli([[6, 74], [10, 18], [10 + 16 * rampa, 18], [6 + 16 * rampa, 74]], '#cfe3ee', `opacity="${(.25 + .5 * rampa).toFixed(2)}"`) : '';
    const rampaCor = poli([[6, 74], [6 - 6 * rampa, 74 + 8 * rampa], [-4, 74 + 8 * rampa]], tom(P.aco4, 0)) ;
    const rotRampa = lin(6, 20, 6, 74, P.aco5, 2) + (rampa > 0.9 ? r(6, 72, 14, 3, P.ambar, 'opacity=".8"') : '');
    // cabine de comando (direita): console, dois assentos, vidro
    const vidro = poli([[212, 14], [246, 34], [248, 58], [214, 52]], '#1d5f8a', 'opacity=".85"') + poli([[214, 16], [236, 30], [216, 36]], '#9fd8ff', 'opacity=".45"');
    const console_ = bisel(214, 56, 36, 18, P.aco3) + led(220, 60, P.verde, 1) + led(226, 60, P.ambar, 2) + led(232, 60, P.vermelho, 3) + r(218, 66, 26, 2, P.aco1) + r(236, 60, 10, 5, '#031012') + r(237, 61, 8, 3, P.verde, 'opacity=".55"');
    const assentoP = r(222, 52, 3, 20, P.aco4) + bisel(222, 66, 14, 4, P.aco3);
    const pil = grupo(228, 66, figuraSvg(piloto, { sentado: true, olhaDireita: true }), 1);
    const sep = r(208, 20, 4, 54, P.aco3) + r(208, 20, 1, 54, P.aco5);
    return parede + piso + forro + parede2 + janelas + corrimao + bancos + cintos + pessoas + luzes + sep + vidro + assentoP + pil + console_ + abertura + rampaCor + rotRampa
        + r(10, 8, 4, 4, P.verde, 'opacity=".0"');
}

/**
 * Embarque/desembarque no hangar: posições (x) de cada cientista ao longo do tempo t (0..1). Puro e testável.
 * A fila anda da esquerda (x = x0) até o pé da rampa (xr); cada um entra um pouco depois do anterior (`espera`) e some ao chegar (`dentro`).
 * `desembarque`: o caminho inverso (sai da rampa e se afasta).
 */
export function posicoesEmbarque(n, t, { x0 = 10, xr = 120, espera = 0.12, desembarque = false } = {}) {
    const dur = Math.max(0.2, 1 - espera * (n - 1)), clamp = (v) => Math.max(0, Math.min(1, v));
    return Array.from({ length: n }, (_, i) => {
        const p = clamp((t - i * espera) / dur), q = desembarque ? 1 - p : p;
        const x = x0 + (xr - x0) * q;
        return { i, x: Math.round(x * 10) / 10, dentro: desembarque ? p < 0.02 : p >= 0.98, passo: Math.floor(p * 14) % 2, andando: p > 0 && p < 1 };
    });
}

export const VB_EMBARQUE = '0 0 300 100';
/** Cena do hangar no embarque/desembarque (viewBox VB_EMBARQUE): piso, transporte com a rampa descida e a fila de cientistas. */
export function cenaEmbarqueSvg(equipe, t, opcoes = {}) {
    const des = !!opcoes.desembarque, PISO = 82, W = 300, ES = 0.72;
    const pos = posicoesEmbarque(equipe.length, t, { x0: 14, xr: 124, desembarque: des, ...opcoes });
    const fundo = r(0, 0, W, 100, '#0a121b') + r(0, 14, W, 58, P.aco1) + Array.from({ length: 16 }, (_, i) => r(i * 19, 14, 1, 58, P.aco0)).join('')
        + r(0, PISO, W, 18, P.concreto) + r(0, PISO, W, 2, P.concretoClaro) + Array.from({ length: 12 }, (_, i) => r(10 + i * 26, PISO + 8, 14, 2, P.ambar, i % 2 ? 'opacity=".3"' : 'opacity=".8"')).join('')
        + lin(0, 12, W, 12, P.aco4, 2) + [40, 150, 260].map((x) => r(x - 10, 13, 20, 2, P.luzFria) + `<polygon points="${x - 10},15 ${x + 10},15 ${x + 28},64 ${x - 28},64" fill="${P.luzFria}" opacity=".05"/>`).join('')
        + r(4, 30, 20, 40, P.aco2) + r(6, 34, 16, 3, P.ambar, 'opacity=".5"') + r(6, 40, 16, 3, P.ambar, 'opacity=".5"');
    const nave = grupo(214, PISO - 26.5 * ES, transporteSvg({ rampa: opcoes.rampa == null ? 1 : opcoes.rampa, giro: false }), ES);
    const fila = pos.filter((p) => !p.dentro).map((p) => grupo(p.x, PISO + 2, figuraSvg(equipe[p.i], { passo: p.passo, olhaDireita: !des }), ES * 1.05)).join('');
    return fundo + nave + fila;
}
