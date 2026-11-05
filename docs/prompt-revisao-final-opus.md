# Prompt para o chat novo: revisão crítica final do Radiation Hunters (etapa 7)

**Modelo e esforço:** Opus, esforço alto. **Cole tudo abaixo da linha no chat novo**, dentro do Projeto LabCronoVirtualRPG, com a pasta `/Volumes/EXBOM/LabVirtualGC` conectada.

---

Você é revisor crítico independente do jogo educacional "Radiation Hunters – The Isotope Chronicles" (Phaser 3.60, HTML/CSS/JS estático, site radiationhunters.netlify.app). Pasta: `LabVirtualGC/apps/radhunter` (`current/` = versão atual, `archive/` = até 5 backups, `tests/`, `docs/`, `README.md` = changelog corrido). Responda em português, com recomendações diretas. Não invente fatos, dados, citações nem referências: marque cada afirmação como **[V]** verificada (fonte ou execução real), **[V+C]** cálculo meu sobre valor verificado, **[H]** hipótese ou decisão de projeto, **[P]** pendente de fonte. Cite fonte com autor, ano, título e URL ou DOI quando existir; se não houver fonte confiável, diga.

## Regras do projeto (valem para você)
- **Esta rodada é só de revisão: não altere `current/`, `tests/` nem `archive/`.** Escreva o que produzir em `docs/revisao-final-2026-10-28/` (relatório, capturas, scripts) e acrescente uma entrada ao README.
- Não faça deploy nem execute o comando de deploy; no fim, apenas informe-o.
- Não altere o cabeçalho de autoria (topo de `js/main.js`, rodapé do menu).
- Só a versão atual em `current/`; backups em `archive/` (máximo 5).
- Para executar o jogo e a suíte, copie `current/` e `tests/` do disco para a nuvem (o Chromium não baixa no Mac), confira por soma de verificação que a cópia é idêntica e diga qual versão testou.

## Contexto: o que foi feito (v3.3.0, ainda não publicada; última publicada: v3.2.0)
Plano do Opus de 27/10/2026 (`claude/radhunter-plano-cofre-opus-2026-10-27.md` no Projeto) executado em 27/10/2026 pelo Sonnet. Detalhes no README, entradas "Revisão do cofre, etapas 0 e 1", "etapas 2, 3 e 5" e "etapas 4 e 6":
1. I-131 passou a `type: "gama"` (componente primária); a beta virou secundária. Física muda no máximo 0,2% (medido 0,195%).
2. Cofre: ficha fecha no celular depois de guardar ou errar; alça de 44 px; blindagem com `role="group"` + `aria-pressed`; opções não escolhidas apagadas e nota fixa; ficha `sticky` em 960×640 e 5 materiais numa linha; atalhos só no teclado.
3. Textos: frase do Am-241 e do Ra-226 (gama que o papel não barra), texto do chumbo na beta ligado ao contêiner de Lia, `betaGammaHint` com o teste do chumbo, citações NRC/NIST ("Regra de blindagem", `CITACOES_REGRA` em `cofre.js`).
4. Identificação: lista fixa de candidatos sem repetição (`js/data/candidatos.js`, campo `candidatosExtras` nas missões 2, 3 e 7), rótulo do tipo no idioma do jogo.
5. Caderno: botão fechar 44×44 com `closeNotebook`, abas com `aria-controls`/`tabpanel`; cores alfa/beta da ficha; selo "2ª"; `.cf-retorno` com 64 px.
6. `docs/roteiro-voiceover-cofre.md` (14 passos para Arnaldo rodar; **não executado**).
Suíte na cópia de trabalho do Sonnet: 329/329 (npm test em `tests/`). Isso é alegação dele, não verificação sua.

## O que revisar ("revisão" = revisão completa)
Organize por categoria, com correção concreta para cada achado, em ordem de prioridade (P1, P2, P3).

**A. Verificação independente (execute, não confie no que está escrito)**
- Rode a suíte completa (`cd tests && npm install && npm test`, cerca de 14 minutos; use `nohup` em segundo plano) e reporte passou/falhou por arquivo. Se o número diferir de 329, explique.
- Confira que `current/` é consistente: nenhum import quebrado, nenhum erro no console ao abrir o menu, cada missão (1 a 8), o cofre, o caderno e as investigações (radônio, hospital, medicina nuclear, cronologia). Use o robô de `tests/helpers/robo.mjs` e capturas reais.
- Refaça as capturas do cofre (missões 4 e 5, PT e EN, 960×640 e 390×844 com toque) e compare com as de `docs/revisao-cofre-2026-10-27/capturas/` (antes). Diga o que melhorou, o que piorou e o que continua ruim.

**B. Física e dados**
- I-131 como gama: recalcule `taxaFonte` antes e depois (a tabela do plano do Opus) e confirme a diferença ≤ 0,15%. Confira que o Geiger, as dicas de erro, o cofre (prateleira gama) e a ficha de emissões ficaram coerentes, inclusive a ordem "γ+β" e a cor do rótulo.
- Dados de isótopos (meia-vida, energias, rendimentos): confira por amostragem contra a fonte primária citada em `js/data/emissoes.js` (LNHB/DDEP) e `docs/parametros-fisicos.json`. Reabra pelo menos Am-241, Ra-226, I-131, Cs-137 e Co-60. Diga o que conseguiu abrir e o que não.
- Textos novos do cofre: confirme cada número (59,5 keV e 35,9 em 100 para o Am-241; HVL ≈ 0,12 mm do chumbo; 609,3 keV e 45,49 em 100 do Bi-214; ~1.300 TBq de Sr-90 por RTG de Lia). Sinalize toda frase sem fonte (a "material leve por dentro e chumbo por fora" deve continuar fora).

**C. Conteúdo educacional e histórico**
- Histórias, notas de campo e fatos das 8 missões contra fonte primária (AIEA, NNDC, UNSCEAR e as já registradas em `docs/fatos-historicos-3e.md`); aponte erros, exageros e fatos sem fonte.
- Identificação: os distratores das missões 2, 3 e 7 são distinguíveis com as placas? O aluno consegue deduzir a resposta pelo método (com e sem placa) ou há atalho? A missão 6 tem só 2 candidatos: é aceitável?
- Coerência pedagógica entre as lições da Academia, o cofre e o caderno (mesma terminologia, sem contradição).

**D. Código e arquitetura**
- Pontos frágeis: o CSS do cofre (`.cofre-content button { font: inherit }` vence classes simples), o `sticky` e o `position: fixed` da ficha no celular, o uso de `matchMedia` em `cofre-ui.js`, o acoplamento de `GameScene.handleIdentify` com `candidatosDaMissao`.
- Testes: há testes que passam por acaso (por exemplo, o de Am-241 no cofre da missão 5 retorna cedo se não houver prateleira alfa)? Há cobertura que falta?
- Dívida técnica e riscos para a manutenção (arquivos grandes, duplicações).

**E. Interface, visual e acessibilidade**
- Capturas e métricas: alvos de toque ≥ 44 px, contraste WCAG (calcule), rolagens, sobreposições (minimapa, HUD, ficha), paisagem e retrato.
- Acessibilidade sem leitor de tela: ordem de foco, rótulos, `aria-live`, Esc, `prefers-reduced-motion`. **Você não consegue ouvir leitor de tela: diga isso e não afirme o contrário.** Revise o roteiro `docs/roteiro-voiceover-cofre.md`: os passos correspondem ao comportamento real do código? Falta algo?
- Textos da interface: PT e EN, paridade, tom, erros de português.

**F. Documentação e processo**
- README e `docs/` consistentes com o código; entradas de 27/10/2026 verdadeiras; nada contraditório (por exemplo, a regra "componente primária = type" com a exceção do I-131).
- `archive/` com no máximo 5 backups; sem versões soltas em `current/`.
- Pendências conhecidas que você deve avaliar e recomendar sobre: fundo do Geiger em 5 cps (mudar exige pacote próprio); aviso "versão de teste"; autoria da trilha sonora gerada por IA para o registro de software (Unicamp/Inova); licenças (Phaser MIT incluída em `current/vendor/`).

## Formato da entrega
1. `docs/revisao-final-2026-10-28/relatorio.md`: resumo de 10 linhas com a **decisão recomendada: publicar a v3.3.0 ou corrigir antes** (posição clara e o fator decisivo), depois os achados por categoria (A a F), cada um com severidade, evidência [V/V+C/H/P], arquivo e linha, e a correção proposta.
2. Tabela final "o que verifiquei por execução / por leitura / não verifiquei", como no plano anterior.
3. Lista de correções ordenada por prioridade, cada uma com modelo e esforço recomendados (Haiku para mecânico, Sonnet para trabalho padrão, Opus só para raciocínio complexo), agrupadas por esforço, dizendo quando trocar a configuração.
4. Capturas e scripts usados na mesma pasta; scripts reutilizáveis para `tests/ferramentas/` (copie você mesmo só se eu pedir).
5. Entrada no README (o que foi pedido, o que foi feito, o que ficou pendente) e o comando de deploy, não executado: `netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod`.
6. Resposta final no chat: 1 a 2 parágrafos com a decisão e os 3 achados mais importantes.

Erros seus devem ser declarados como erros seus. Em caso de divergência entre fontes, mostre a divergência em vez de escolher em silêncio.
