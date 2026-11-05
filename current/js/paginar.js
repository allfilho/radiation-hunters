// Divide um texto longo em "partes" para leitura em telas pequenas (história da missão e lições).
// Função pura: sem DOM. Agrupa parágrafos (separados por linha em branco) até o limite de caracteres;
// um parágrafo maior que o limite é quebrado por linhas e, se preciso, por frases. Nunca altera o texto.

/** Quantos caracteres cabem numa parte, estimado pela área visível (fonte ~16 px, linha ~24 px, ~8 px por letra).
 *  `reserva` = altura ocupada por título/botões; `larguraMax` = largura útil máxima do bloco de texto. */
export function limitePorTela(largura = 1280, altura = 800, { reserva = 200, larguraMax = 800 } = {}) {
    const linhas = Math.max(4, Math.floor((altura - reserva) / 24));
    const colunas = Math.max(24, Math.floor((Math.min(largura - 32, larguraMax)) / 8.2));
    return Math.max(200, Math.min(900, Math.floor(linhas * colunas * 0.7)));
}

function quebrarBloco(bloco, limite) {
    if (bloco.length <= limite) return [bloco];
    const partes = [];
    let atual = '';
    const empurrar = (s, sep) => {
        if (atual && (atual + sep + s).length > limite) { partes.push(atual); atual = s; }
        else atual = atual ? atual + sep + s : s;
    };
    for (const linha of bloco.split('\n')) {
        if (linha.length <= limite) { empurrar(linha, '\n'); continue; }
        for (const frase of linha.split(/(?<=[.!?;:])\s+/)) empurrar(frase, ' ');
    }
    if (atual) partes.push(atual);
    return partes;
}

/** @returns {string[]} partes (nunca vazio). Juntar com "\n\n" reproduz o conteúdo (exceto espaços nas quebras). */
export function paginarTexto(texto, limite = 330) {
    const blocos = String(texto || '').trim().split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const paginas = [];
    let atual = '';
    for (const b of blocos.flatMap((x) => quebrarBloco(x, limite))) {
        if (atual && (atual + '\n\n' + b).length > limite) { paginas.push(atual); atual = b; }
        else atual = atual ? atual + '\n\n' + b : b;
    }
    if (atual) paginas.push(atual);
    return paginas.length ? paginas : [''];
}

/** Agrupa uma lista de parágrafos (lições) em páginas de até `limite` caracteres. */
export function paginarParagrafos(pars, limite = 330) {
    const paginas = [];
    let atual = [], n = 0;
    for (const p of pars) {
        if (atual.length && n + p.length > limite) { paginas.push(atual); atual = []; n = 0; }
        atual.push(p); n += p.length;
    }
    if (atual.length) paginas.push(atual);
    return paginas.length ? paginas : [[]];
}

export const TXT_PAG = {
    pt: { prox: 'Próximo →', voltar: '← Voltar', de: 'Parte {i} de {n}' },
    en: { prox: 'Next →', voltar: '← Back', de: 'Part {i} of {n}' },
};
export const rotuloParte = (lang, i, n) => (TXT_PAG[lang] || TXT_PAG.en).de.replace('{i}', i).replace('{n}', n);
