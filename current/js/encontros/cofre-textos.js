// ============================================
// TEXTOS DA INTERFACE DO COFRE (PT/EN). Ficam aqui, e não em i18n/pt.js e en.js, para a lógica do cofre (cofre.js,
// cofre-ficha.js, cofre-textos.js) rodar em Node sem DOM e para o teste de paridade PT/EN (tests/13) conferir as chaves.
// {0}, {1}... são substituídos por tx().
// ============================================
export const TEXTOS = {
    pt: {
        titulo: 'Cofre de transporte', sub: '{0}', relogioParado: 'tempo da missão parado',
        progresso: '{0}/{1} guardadas', sair: 'Sair do cofre',
        regra: 'Guarde cada fonte pela radiação mais penetrante que ela emite na maioria dos decaimentos (pelo menos 50 em 100). Toque numa fonte para ver a ficha e depois numa prateleira.',
        bandeja: 'Fontes identificadas na missão', bandejaVazia: 'Todas as fontes guardadas.',
        prateleira: 'Prateleira {0}', guardarEm: 'Guardar {0} na prateleira {1}',
        dica_alfa: 'Barrada por papel ou pela embalagem fechada. O cuidado é não deixar o material sair.',
        dica_beta: 'Barrada por plástico ou alumínio. Chumbo sozinho gera raios X de freamento.',
        dica_gama: 'Só é atenuada: material denso e espesso, como chumbo ou concreto.',
        blindagem: 'Blindagem', blindagemDa: 'Blindagem da prateleira {0}', baiaVazia: 'vazia',
        inicio: 'Escolha uma fonte.', selecionada: '{0} selecionada. Escolha a prateleira (1, 2 ou 3).',
        atalhos: '← → fonte · 1 2 3 prateleira · Esc fecha a ficha', lacrar: 'Lacrar o cofre',
        fichaVazia: 'Selecione uma fonte para abrir a ficha: história, meia-vida, emissões e o que o seu Geiger mostra com cada blindagem.',
        fichaFechar: 'Fechar a ficha', fichaDe: 'Ficha da fonte', nFontes: '{0} fonte(s) nesta missão',
        tagFato: 'fato', tagJogo: 'no jogo', meiaVida: 'meia-vida', sinal: 'sinal', sinalValor: 'escala didática do jogo (sem Bq)',
        emissoes: 'Emissões por 100 decaimentos', decide: 'decide a prateleira',
        pergunta: 'Qual dessas radiações é a mais penetrante e sai na maioria dos decaimentos?',
        geiger: 'O que o seu Geiger mostra com cada blindagem (fração do sinal que passa, modelo do jogo). São as placas finas do Geiger; no cofre, supõe-se a espessura necessária.',
        semBlind: 'sem', contato: 'só por contato (alcance de poucos centímetros)',
        chumbo: 'Chumbo: camada semirredutora ≈ {0} cm; ≈ {1} cm para reduzir a 1/1000 (feixe estreito, sem buildup; NIST XCOM).',
        fonteLabel: 'Fonte', regraBlind: 'Regra de blindagem', guardar: 'Guardar',
        guardada: '{0} na prateleira {1}.', vaiPara: 'O {0} vai para a prateleira {1}.', ainda: 'Ainda não.', tente: 'Tente de novo.',
        blindOk: 'Blindagem certa.', blindParcial: 'Funciona, mas não é a melhor escolha.', blindErrada: 'Esta blindagem não protege.',
        seloOk: 'Acerto na 1ª tentativa.', selo2: 'Acerto na 2ª tentativa.', seloCofre: 'Guardada pelo cofre depois de dois erros.', selo2sigla: '2ª',
        blindEscolhida: 'Prateleira {0}:', blindTravada: 'Escolha feita: não dá para trocar.',
        sairPergunta: 'Sair do cofre agora? O que não foi guardado vale 0.', sairSim: 'Sair', sairNao: 'Continuar no cofre',
        resumoTitulo: 'Cofre lacrado', resumoSaiu: 'Você saiu do cofre', itemNaPrat: '{0} na prateleira {1}', itemBlind: 'Blindagem {0} ({1})', itemNaoGuardado: '{0} (não guardado)',
        pontos: 'Cofre: {0} de 10 pontos do aproveitamento.', caderno: 'Os conceitos de alfa, beta, gama e de blindagem são registrados no caderno de campo.',
        voltar: 'Voltar ao campo', arrastar: 'Toque na fonte e depois num botão de guardar da ficha (ou na prateleira).',
    },
    en: {
        titulo: 'Transport vault', sub: '{0}', relogioParado: 'mission clock stopped',
        progresso: '{0}/{1} stored', sair: 'Leave the vault',
        regra: 'Store each source by the most penetrating radiation it emits in most decays (at least 50 per 100). Tap a source to see its card, then tap a shelf.',
        bandeja: 'Sources identified in the mission', bandejaVazia: 'All sources stored.',
        prateleira: '{0} shelf', guardarEm: 'Store {0} on the {1} shelf',
        dica_alfa: 'Stopped by paper or a closed package. The care is to keep the material from escaping.',
        dica_beta: 'Stopped by plastic or aluminum. Lead alone produces bremsstrahlung X-rays.',
        dica_gama: 'Only attenuated: dense, thick material such as lead or concrete.',
        blindagem: 'Shielding', blindagemDa: 'Shielding of the {0} shelf', baiaVazia: 'empty',
        inicio: 'Choose a source.', selecionada: '{0} selected. Choose the shelf (1, 2 or 3).',
        atalhos: '← → source · 1 2 3 shelf · Esc closes the card', lacrar: 'Seal the vault',
        fichaVazia: 'Select a source to open its card: history, half-life, emissions and what your Geiger shows with each shield.',
        fichaFechar: 'Close the card', fichaDe: 'Source card', nFontes: '{0} source(s) in this mission',
        tagFato: 'fact', tagJogo: 'in the game', meiaVida: 'half-life', sinal: 'signal', sinalValor: 'teaching scale of the game (no Bq)',
        emissoes: 'Emissions per 100 decays', decide: 'decides the shelf',
        pergunta: 'Which of these radiations is the most penetrating and is emitted in most decays?',
        geiger: 'What your Geiger shows with each shield (fraction of the signal that gets through, game model). These are the thin Geiger plates; in the vault, the needed thickness is assumed.',
        semBlind: 'none', contato: 'by contact only (range of a few centimeters)',
        chumbo: 'Lead: half-value layer ≈ {0} cm; ≈ {1} cm to cut it to 1/1000 (narrow beam, no buildup; NIST XCOM).',
        fonteLabel: 'Source', regraBlind: 'Shielding rule', guardar: 'Store',
        guardada: '{0} on the {1} shelf.', vaiPara: '{0} goes to the {1} shelf.', ainda: 'Not yet.', tente: 'Try again.',
        blindOk: 'Right shielding.', blindParcial: 'It works, but it is not the best choice.', blindErrada: 'This shielding does not protect.',
        seloOk: 'Right on the 1st try.', selo2: 'Right on the 2nd try.', seloCofre: 'Stored by the vault after two mistakes.', selo2sigla: '2nd',
        blindEscolhida: '{0} shelf:', blindTravada: 'Choice made: it cannot be changed.',
        sairPergunta: 'Leave the vault now? Whatever is not stored counts 0.', sairSim: 'Leave', sairNao: 'Stay in the vault',
        resumoTitulo: 'Vault sealed', resumoSaiu: 'You left the vault', itemNaPrat: '{0} on the {1} shelf', itemBlind: 'Shielding {0} ({1})', itemNaoGuardado: '{0} (not stored)',
        pontos: 'Vault: {0} of 10 points of the usage score.', caderno: 'The alpha, beta, gamma and shielding concepts are recorded in the field notebook.',
        voltar: 'Back to the field', arrastar: 'Tap a source, then a store button on the card (or the shelf).',
    },
};

/** Texto da interface no idioma `lang` com {0}, {1}... substituídos. */
export function tx(chave, lang = 'pt', ...args) {
    const L = lang === 'en' ? 'en' : 'pt';
    let s = TEXTOS[L][chave] ?? TEXTOS.pt[chave] ?? chave;
    args.forEach((a, i) => { s = s.split('{' + i + '}').join(String(a)); });
    return s;
}
