// ============================================
// AGÊNCIA: dados dos alertas (camada de ligação entre as missões e as investigações existentes)
// Projeto: docs/agencia-design-minimo.md. Rótulos: [V] verificado no código/texto do jogo, [C] calculado, [H] escolha de design.
// Nada aqui altera as missões ou as investigações: cada alerta só aponta para uma delas.
// ============================================

/** Raio médio da Terra (km) [V: valor-padrão, 6371 km]; só serve para a distância ilustrativa do voo. */
export const RAIO_TERRA_KM = 6371;
/** Velocidade de cruzeiro do jato fictício (km/h) [H: valor de enredo, não é de um modelo real]. */
export const VELOCIDADE_JATO_KMH = 900;

/** Base da Agência: ilha FICTÍCIA no Atlântico equatorial [H]; não representa país nem instituição real. */
export const BASE = { lat: 4, lon: -28 };

/** Distância ao longo do círculo máximo (fórmula de haversine) [C]. */
export function distanciaKm(a, b) {
    const rad = Math.PI / 180;
    const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * RAIO_TERRA_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}
export const horasDeVoo = (km) => km / VELOCIDADE_JATO_KMH;

const T = (pt, en) => ({ pt, en });

/**
 * Alertas. `missaoId` aponta para data/missoes; `invId` para investigacao/index.js.
 * Local e data: dos textos de história do jogo [V: i18n/pt.js story2..8]. Coordenadas aproximadas, só para posicionar o pino [C].
 * Causas sem local preciso no jogo (Radium Girls; Lia) ficam como pino regional (`regional: true`).
 * Investigações: locais FICTÍCIOS [H], exceto o Laboratório de Cronologia (grupo do autor).
 * `liberaMes`: primeiro mês de jogo (0 = o primeiro) em que o alerta pode ser sorteado; `nivel`: dificuldade da missão ou 'investigacao' [H].
 */
export const ALERTAS = [
    { id: 'm2', liberaMes: 0, nivel: 'easy', tipo: 'missao', missaoId: 2, lat: -16.7, lon: -49.3, local: T('Goiânia, Brasil', 'Goiânia, Brazil'), quando: T('setembro de 1987', 'September 1987') },
    { id: 'm3', liberaMes: 0, nivel: 'normal', tipo: 'missao', missaoId: 3, lat: 40.5, lon: -80, regional: true, local: T('Estados Unidos', 'United States'), quando: T('décadas de 1910 e 1920', '1910s and 1920s') },
    { id: 'm4', liberaMes: 2, nivel: 'hard', tipo: 'missao', missaoId: 4, lat: 51.4, lon: 30.1, local: T('Chernobyl, URSS', 'Chernobyl, USSR'), quando: T('26 de abril de 1986', '26 April 1986') },
    { id: 'm5', liberaMes: 2, nivel: 'hard', tipo: 'missao', missaoId: 5, lat: 42.3, lon: 42.2, regional: true, local: T('Lia, Geórgia', 'Lia, Georgia'), quando: T('dezembro de 2001', 'December 2001') },
    { id: 'm6', liberaMes: 0, nivel: 'normal', tipo: 'missao', missaoId: 6, lat: 41.65, lon: -0.9, local: T('Zaragoza, Espanha', 'Zaragoza, Spain'), quando: T('dezembro de 1990', 'December 1990') },
    { id: 'i-zaragoza', depois: 'm6', liberaMes: 0, nivel: 'investigacao', tipo: 'investigacao', invId: 'zaragoza-acelerador', lat: 41.65, lon: -0.9, ficticio: true, local: T('Hospital em Zaragoza (reconstituição fictícia)', 'Hospital in Zaragoza (fictional reconstruction)'), quando: T('dezembro de 1990', 'December 1990') },
    { id: 'm7', liberaMes: 2, nivel: 'hard', tipo: 'missao', missaoId: 7, lat: 28.6, lon: 77.1, local: T('Mayapuri, Nova Délhi, Índia', 'Mayapuri, New Delhi, India'), quando: T('abril de 2010', 'April 2010') },
    { id: 'm8', liberaMes: 4, nivel: 'insane', tipo: 'missao', missaoId: 8, lat: 37.4, lon: 141, local: T('Fukushima Daiichi, Japão', 'Fukushima Daiichi, Japan'), quando: T('11 de março de 2011', '11 March 2011') },
    { id: 'i-hospital', liberaMes: 0, nivel: 'investigacao', tipo: 'investigacao', invId: 'hospital-imagem', lat: 47, lon: 12, ficticio: true, local: T('Hospital (local fictício)', 'Hospital (fictional location)'), quando: null },
    { id: 'i-nuclear', liberaMes: 1, nivel: 'investigacao', tipo: 'investigacao', invId: 'medicina-nuclear', lat: 38, lon: -95, ficticio: true, local: T('Serviço de medicina nuclear (local fictício)', 'Nuclear medicine service (fictional location)'), quando: null },
    { id: 'i-tempo', liberaMes: 1, nivel: 'investigacao', tipo: 'investigacao', invId: 'arquivo-tempo', lat: -22.9, lon: -47.1, local: T('Laboratório de Cronologia (parceiro)', 'Chronology Laboratory (partner)'), quando: null },
    { id: 'i-radonio', liberaMes: 2, nivel: 'investigacao', tipo: 'investigacao', invId: 'radonio-escola', lat: -26, lon: 28, ficticio: true, local: T('Escola (local fictício)', 'School (fictional location)'), quando: null },
];

/** O treinamento (missão 1) é na própria Base; os alertas abrem depois dele (regra decidida pelo Arnaldo). */
export const treinamentoConcluido = (desbloqueadas) => Array.isArray(desbloqueadas) && desbloqueadas.includes(2);

/** Projeção equirretangular do mapa: longitude -180..180 e latitude 84..-58 viram 0..100 % [C]. */
export const LAT_MAX = 84, LAT_MIN = -58;
export const paraPercentual = ({ lat, lon }) => ({ x: (lon + 180) / 360 * 100, y: (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * 100 });
