# Prompt para novo chat (Opus, esforço alto): design do cofre interativo de Radiation Hunters

Cole o bloco abaixo num novo chat do Cowork, na mesma pasta de projeto (LabVirtualGC/apps/radhunter), modelo Opus, esforço alto.

---

Você é meu parceiro de design e programação do jogo educacional **Radiation Hunters – The Isotope Chronicles v2.0** (HTML+CSS+JS estático, Phaser 3.60 por CDN, módulos ES, sem bundler; parte do LabCronoVirtualRPG). Responda em português, com recomendação direta e fontes verificáveis.

## Regras inegociáveis (minhas preferências)
- Nunca invente fatos, valores, citações ou referências. Todo valor físico novo precisa de fonte verificável; marque o que é verificado (V) e o que é hipótese (H).
- Não altere o cabeçalho de autoria (topo de `current/js/main.js` e a linha de créditos do `index.html`) sem minha confirmação.
- Só a versão atual em `current/`; no máximo 5 versões em `archive/` (arquive `current` em `archive/<data>_pre-<tag>` ANTES de alterar; apague a mais antiga). Atualize o `README.md` a cada ação (o que pedi, o que mudou, decisões, estado).
- O site continua estático. **Não faça deploy**; no fim só me dê o comando `netlify deploy --dir=apps/radhunter/current --site=<ID> --prod`.
- Plano passo a passo antes de começar, recomendando modelo e esforço por etapa, e avisando quando eu devo trocar.
- Scripts salvos em pastas organizadas com instruções de execução. Testes: node:test + playwright-core + Chromium (`tests/`, 115 testes passando; rode `RH_ROOT=.../current node --test --test-concurrency=1 --test-reporter=spec 0*.test.mjs`).
- Seja crítico sobre os próprios erros e diga claramente o que verificou e o que não.

## Contexto do que já existe (leia primeiro)
Leia `README.md`, `docs/encontros-5c.md`, `docs/referencias-5c/busca/agente-D-5d3.md` (entradas V5D3.5 a V5D3.8) e os arquivos `current/js/encontros/{motor,aproveitamento,gerenciador,ui-encontro,caderno,cofre}.js`, `current/js/data/isotopes.js`, `current/js/data/shields.js`, `current/js/scenes/GameScene.js` (método `concluirComEncontros`) e `current/styles.css` (seções do caderno de campo `.cad-*` e dos encontros `.enc-*`).
- Há um sistema de **encontros de aprendizado** (21 conceitos, 74 perguntas PT/EN com fonte, cadeia de reforço, caderno de campo permanente, escala de confiança no Mito x Fato).
- **Aproveitamento da missão:** fontes 55 + tempo 20 + encontros 15 + cofre 10; com encontros/cofre desligados o teto é 75%.
- **Cofre provisório (já no código, `encontros/cofre.js`):** ao fim da missão, uma pergunta de blindagem por tipo de radiação (alfa, beta, gama) das fontes encontradas, valendo 10%. **Este cofre deve ser substituído pelo definitivo descrito abaixo**, mantendo: tempo congelado durante o cofre, Esc, pausa bloqueada, i18n PT/EN, acessibilidade (teclado, `prefers-reduced-motion`), registro no caderno (`aplicarResultado`) e crédito entre 0 e 1 por item.

## O que quero: o cofre interativo (minha ideia)
Ao concluir a missão, abre-se um **cofre de transporte** com **3 grandes prateleiras: alfa, beta e gama**. As fontes identificadas na missão aparecem como objetos clicáveis; clicar numa fonte mostra uma **ficha** com: história (da missão), elemento/isótopo, atividade, meia-vida, energia, emissões e o que mais for interessante. O aluno **separa as fontes por prateleira** e aprende que **cada fonte emite um ou mais tipos de partículas**. Cada prateleira exige uma **blindagem característica**: quanto mais penetrante a radiação, maior a blindagem (alfa: papel/embalagem; beta: plástico ou alumínio fino, não chumbo grosso por causa da radiação de freamento; gama: chumbo/concreto espesso). A fonte vai para a prateleira da radiação **emitida em maior quantidade e mais penetrante**, porque é a que exige a maior blindagem. As proporções de emissão devem ser realistas. Como o aluno já usou blindagens no Geiger durante a missão, os dados da fonte já devem estar disponíveis na ficha depois de identificada.

**Visual:** limpo, moderno e bonito, no mesmo nível do **caderno de anotações** (`caderno.js` + CSS `.cad-*`): cartões, tipografia cuidada, transições suaves, contraste bom, funciona em celular e por teclado. Isto é prioridade: faz toda a diferença.

## Dados de emissão já verificados (LNHB/DDEP, em V5D3.8)
Por 100 decaimentos: Cs-137 beta- 94,6% (Emax 514 keV) + gama 661,7 keV 85,0%. Co-60 beta- 99,9% (Emax 317 keV) + gamas 1173 e 1332 keV ~100% cada. I-131 beta- 89,4% (606 keV) + gama 364 keV 81,2%. Sr-90 beta- 100% (546 keV), sem gama; filho Y-90 beta- 2279 keV. P-32 beta- 100% (1711 keV), sem gama. Ir-192 beta- 95% (até 675 keV) + gama 316,5 keV 82,8% (e 468 keV 47,8%). Tc-99m gama 140,5 keV 88,5%. Am-241 alfa 84,5% (~5,486 MeV) + gama 59,5 keV 35,9%. Po-210 alfa 99,9988% + gama 803 keV 0,0012%. U-238 alfa 4198 keV 77,5% / 4151 keV 22,3%, sem gama próprio.

## Questões de projeto que você deve resolver comigo (proponha e recomende)
1. **Regra de prateleira.** "Mais penetrante com rendimento significativo": definir o limiar (ex.: ≥ 10 por 100 decaimentos?) e tratar casos: Cs-137, Co-60, I-131 e Ir-192 caem em **gama** (beta ~95% mas gama 85% e mais penetrante); Sr-90, P-32 em **beta**; Po-210 e U-238 em **alfa**; Tc-99m em **gama**; **Am-241** tem alfa dominante mas gama de 59,5 keV com 36%: pela regra cai em gama, porém exige só blindagem fina (energia baixa). Isso ensina que a energia também importa; decidir como mostrar.
2. **Conflito com o jogo atual:** `isotopes.js` dá a cada isótopo um único `type` (I-131 e Am-241 hoje são "beta" e "alfa"), usado nas dicas de identificação e no modelo do Geiger (docs/geiger-projeto-3a.md). Verificar se o modelo físico do Geiger com blindagem é coerente com a regra do cofre e propor o que mudar (sem quebrar os 115 testes; se mudar valores físicos, citar fonte).
3. **Mecânica:** arrastar e soltar versus clicar na prateleira (teclado e toque), erro permitido? quantas tentativas? como o crédito de 0 a 1 por fonte é calculado, e a **blindagem característica** (escolher o material por prateleira ou por fonte?). Mostrar o aluno a proporção das emissões (ex.: barras por tipo na ficha) sem sobrecarregar.
4. **Dados da ficha:** atividade (a fonte do jogo é adimensional; decidir o que mostrar sem inventar), meia-vida e energias do `isotopes.js` (já verificadas), história da missão (vinda de `docs/fatos-historicos-3e.md`, só fatos com fonte).
5. **Escala:** o cofre não pode tornar a missão longa demais; propor duração alvo (1 a 3 min) e como manter o ritmo.

## Entregáveis em etapas (cada uma pequena, com testes e README)
A. Plano e protótipo de design (mockup HTML do visual, para eu aprovar antes de integrar).
B. Dados (tabela de emissões em `js/data/emissoes.js`, com fonte, e testes de consistência).
C. Lógica pura (`cofre.js`: regra de prateleira, crédito, testes unitários).
D. Interface integrada ao fluxo de `concluirComEncontros` (PT/EN, acessibilidade), testes de navegador.
E. Revisão crítica, documentação, comando de deploy (sem executar).

Comece lendo os arquivos citados e me apresente o plano com modelo/esforço por etapa e as respostas propostas às questões de projeto 1 a 5.

## Decisões já tomadas (atualizado em 2026-10-27)
- **Fundo do Geiger:** continua 5 cps [H] (escolha didática). Não altere; mudar exige exibir cpm ou média móvel, recalibrar S e o limiar de identificação (2 × fundo) e refazer a simulação de cobertura (ver `docs/geiger-projeto-3a.md`, seção de 2026-10-27).
- **I-131:** recomendação a validar por você: prateleira **gama** (regra "mais penetrante com rendimento significativo": gama de 364 keV, 81,2 por 100 decaimentos), com a ficha mostrando também o beta- (606 keV, 89,4 por 100). Isso conflita com o `type` único de `isotopes.js` (hoje "beta"): proponha a mudança mínima e os testes afetados antes de aplicar.
- **Aviso "versão de teste"** das investigações: mantido. Ele aparece só no modo de revisão e é verdadeiro (conteúdo ainda sem revisão de especialista e sem teste com professores).
- **Mapas:** as quatro investigações têm plantas próprias (`docs/mapas-campus.md`). O cofre é uma tela à parte e não depende delas.
