# Revisão crítica final do Radiation Hunters (etapa 7): v3.3.0

**Data:** 27/10/2026 (pasta datada de 28/10, como pedia o prompt). **Revisor:** Claude (Opus, esforço alto), em chat novo no Projeto LabCronoVirtualRPG.
**Escopo:** só leitura. Nada foi alterado em `current/`, `tests/` nem `archive/`, e nenhum deploy foi feito.
**Marcação:** **[V]** verificado, por fonte aberta nesta rodada ou por execução real · **[V+C]** cálculo meu sobre valor verificado ou com as funções do próprio jogo · **[H]** hipótese ou decisão de projeto · **[P]** pendente de fonte.

---

## Resumo (10 linhas)

1. **Decisão recomendada: corrigir antes de publicar.** São 3 correções pequenas (cerca de 30 min no Haiku/Sonnet). Depois disso, publicar como v3.3.1 sem uma nova revisão do Opus: basta a suíte completa.
2. **Fator decisivo:** a 3.3.0 introduziu um **✓ na blindagem escolhida, mesmo quando ela está errada** (beta + chumbo vale 0,4; papel na gama vale menos). O ✓ fica na tela, enquanto a explicação do erro some na ação seguinte. Num jogo didático, isso ensina o contrário da nota dada [V, captura `pt-960x640-04`; CSS `styles.css:1427`]. Na 3.2.0 esse ✓ não existia [V, `archive/2026-10-27_pre-cofre-opus`].
3. **Suíte: 329 de 329** na cópia idêntica do seu disco [V]. Na primeira passada foram 327/329; as 2 falhas eram de arquivos de `docs/` que eu não tinha copiado, e passaram depois de copiá-los. A contagem por arquivo está em A1.
4. **Não houve erro de console** no menu, nas 8 missões nem nas 4 investigações (suíte e sondas) [V]. As capturas novas (PT e EN, 960×640 e 390×844 com toque) mostram que o P1 do celular foi resolvido [V].
5. **I-131 como gama:** a física quase não muda. Porém a diferença máxima é **0,195 %** (a 1 m, sem placa), e não "≤ 0,15 %" como dizia o plano [V+C]. O erro está na frase do plano, não no jogo.
6. **Dados reabertos na fonte primária** (LNHB/DDEP, LNHB/IAEA para o Ra-226, NIST e o relatório da AIEA sobre Lia): Am-241, Ra-226, I-131, Cs-137 e Co-60 conferem com `emissoes.js`, e os números dos textos novos do cofre também [V].
7. **As outras 2 correções antes de publicar:** o botão "Ainda não dá para concluir" continua sem estilo, com 19 px de altura e fonte Arial [V]. O rótulo "γ" da identificação tem contraste de **2,31:1** [V+C]. Com o I-131 agora gama, esse rótulo passou a aparecer em mais fontes.
8. **Achado pedagógico (P2, não bloqueia):** nas missões 4, 6 e 8 há pares "γ+β" (I-131 × Cs-137, Co-60 × Cs-137) com o **mesmo rótulo**. O método ensinado na Academia não diz como separá-los: a resposta depende de saber que a gama mais energética passa mais pelo chumbo.
9. **Acessibilidade:** a região `role="status"` do retorno é **retirada e reinserida no DOM a cada desenho** [V, MutationObserver]. Isso pode impedir que o VoiceOver a anuncie [H]. **Não consigo ouvir leitor de tela.** O passo 5 do seu roteiro é o teste que decide.
10. **Documentação:** o README tem uma entrada duplicada de 27/10 e há comentários desatualizados. O teste do Am-241 continua frágil, e um título de teste promete mais do que confere. Nada disso bloqueia a publicação.

---

## A. Verificação independente (por execução)

### A1. Suíte completa [V]
- **Cópia testada:** `current/` (91 arquivos) e `tests/` (sem `node_modules`). Empacotei tudo no Mac (`docs/revisao-final-2026-10-28/_transferencia/radhunter-current-tests.tar.gz`, sha256 `348a3623…9a90`) e desempacotei na nuvem. O hash do conjunto de arquivos de `current/` foi o mesmo dos dois lados: `b28e4844…ce31d`. **Versão testada: `VERSAO = '3.3.0 · 2026-10-27'`** (`js/modo.js:9`). Ambiente: Chromium 153 (Chrome for Testing), playwright-core 1.56.1 e Phaser 3.60.0 do `npm install` em `tests/`, Node 22.
- **1ª passada** (`npm test`, 897 s): **327/329**. As 2 falhas estão em `10-emissoes` ("cada isótopo de emissoes.js aparece no registro de fontes") e `11-cofre` ("fatos das explicações existem no banco de referências"), com `ENOENT …/docs/referencias-5c/busca`. Esses testes leem `docs/referencias-5c/`, que eu não tinha copiado.
- Copiei `docs/referencias-5c/` (sha256 `d5a1b323…29be`) e reexecutei 10 e 11: **31/31**.
- **2ª passada, arquivo por arquivo** (TAP), já com `docs/`: **329 aprovados, 0 falhas**.

| Arquivo | Passou | Arquivo | Passou | Arquivo | Passou |
|---|---|---|---|---|---|
| 01-dados | 16 | 13-cofre-ficha | 11 | 25-investigacao | 11 |
| 02-fluxo | 20 | 14-cofre-ui | 19 | 26-revisao-relatorio | 6 |
| 03-robustez | 6 | 15-camera | 8 | 27-hospital-campo | 3 |
| 04-geiger | 11 | 16-acessibilidade | 7 | 28-hospital-evidencias | 3 |
| 05-geiger-modelo | 17 | 17-assistencia | 5 | 29-dica-fontes | 6 |
| 06-jogabilidade | 11 | 18-academia | 8 | 30-episodios-investigacao | 10 |
| 07-graficos | 3 | 19-licoes | 7 | 31-plantas-investigacao | 8 |
| 08-encontros | 18 | 20-objetivo | 5 | 32-treinamento-seguranca | 4 |
| 09-encontros-jogo | 12 | 21-academia-completa | 3 | 33-traco-fissao | 3 |
| 10-emissoes | 7 | 22-paginacao | 5 | 34-laboratorio-pesquisa | 11 |
| 11-cofre | 24 | 23-modo-professor | 4 | 35-trilhas | 12 |
| 12-geiger-componentes | 14 | 24-dados-insuficientes | 4 | 36-identificacao | 7 |

Total de 329, igual ao número que o Sonnet relatou. Logs em `logs/suite.log`, `logs/suite-10-11.log` e `logs/suite-por-arquivo.log`.

### A2. Consistência de `current/` [V]
- Nenhum import quebrado e nenhum `console.error` ou `pageerror`. Isso vale para o menu (teste 02), as **8 missões de ponta a ponta** (06, de "missão 1" a "missão 8: concluível"), o cofre (14), o caderno (09), as 4 investigações (25, 30: radônio, hospital, medicina nuclear; 34: laboratório de cronologia) e as sondas desta rodada (`sondas/sonda-final.json`, `capturas/metricas.json`: `erros: []` em todas as páginas).
- `archive/` tem exatamente 5 backups, e não há versões soltas em `current/` [V].

### A3. Capturas do cofre, antes e depois [V]
Material novo: `capturas/` (32 PNG e `metricas.json`), gerado por `scripts/captura-cofre-final.mjs`. É o script de 27/10 com três acréscimos: EN, celular com `hasTouch`/`isMobile` e toques nos botões "Guardar" da ficha (sem teclado), e métricas de cobertura do retorno e de visibilidade do "Lacrar". Comparei com `docs/revisao-cofre-2026-10-27/capturas/`.

| Ponto (P1 a P2 do plano) | Antes (27/10) | Agora (3.3.0) | Veredito |
|---|---|---|---|
| Celular: a ficha cobre o retorno depois do erro | coberto (`390x844-03`) | ficha fecha, retorno visível e descoberto (`pt-390x844-03`, `descoberto: true`) | **Melhorou** |
| Alça da ficha no celular | 64×20 px | 96×44 px (não aparece entre os alvos < 44 px) | **Melhorou** |
| Blindagem: as outras opções continuam com cara de clicáveis | sem diferença visual | apagadas e tracejadas, com nota fixa | **Melhorou** |
| Blindagem: marca da escolhida | só borda | borda e **✓, também numa escolha errada** | **Piorou** (ver E1) |
| 960×640: altura com tudo guardado e blindagens escolhidas | 1029/625 px | 868/625 px; ficha `sticky` à vista; 5 materiais numa linha | Melhorou, mas o **"Lacrar" continua fora da tela** (`lacrar.naTela: false`) |
| Atalhos de teclado no celular | visíveis | escondidos; "arrastar" no lugar (`atalhosTecladoVisiveis: false`) | **Melhorou** |
| Selo "!" | "!" sem significado | "2ª", com `title` e nome acessível | **Melhorou** |
| Contraste α/β na ficha | 2,84 e 3,94:1 | 5,54 e 5,82:1 | **Melhorou** |
| Celular, último item guardado | não medido | retorno abaixo da dobra (y = 1179 px numa tela de 844) | **Continua ruim** (P3, ver E4) |
| Botões das prateleiras (`.cf-prat-btn`) | 28 px de altura | 28 px | **Continua** (P3: no toque a prateleira inteira é o alvo, então o impacto é baixo) |
| Botão "Ainda não dá para concluir" | sem estilo | sem estilo, Arial, 19 px (`sondas/identificar-m4-pt-960x640.png`) | **Continua ruim** (P1) |
| I-131 na ficha | β+γ, prateleira gama | γ com "decide a prateleira", 98,9 por 100; ordem fixa α/β/γ na ficha (`en-960x640-08`) | Coerente |

Limite das capturas: as fontes do Google respondem vazio no ambiente de teste (`helpers/navegador.mjs`), então Orbitron e Inter aparecem substituídas. Formas, cores, tamanhos e rolagens valem; o desenho das letras não.

---

## B. Física e dados

### B1. I-131 como gama primária [V+C]
Rodei `taxaFonte` do próprio jogo (`scripts/calc-i131.mjs`) com base mínima 220, 1 tile = 0,5 m e ar livre. "Antes" é `type: beta`, `betaRangeMgCm2: 214`; "depois" é o `current/`.

| d | sem placa | Al 3 mm | acrílico 5 mm | Pb 10 mm |
|---|---|---|---|---|
| 0,5 m | 420,84 → 420,17 (0,158 %) | 243,09 → 242,77 (0,131 %) | 246,62 → 246,30 (0,131 %) | 10,42 → 10,41 (0,114 %) |
| 1 m | 89,34 → 89,16 (**0,195 %**) | 60,41 → 60,33 | 61,29 → 61,21 | 2,59 → 2,59 |
| 2 m | 16,13 → 16,11 | 14,92 → 14,90 | 15,14 → 15,12 | 0,64 → 0,64 |

- Componentes depois da mudança: gama com peso 1 e 0,3645 MeV; beta com peso **0,99869** e alcance **213,6 mg/cm²** (Katz-Penfold na Emax de 606,3 keV). Isso confere com o comentário de `isotopes.js:8` [V+C].
- **Correção ao plano (erro meu, do Opus de 27/10):** a diferença máxima é **0,195 %**, não "≤ 0,15 %". Na tabela do plano faltou a distância de 1 m, onde o alcance beta no ar pesa mais. Para o jogo é irrelevante, porque o ruído de Poisson numa janela de 3 s é de alguns %. Corrigir só o texto onde ele aparece (README e plano).
- **Coerência** [V, leitura e captura]: a dica de erro usa `betaGammaHint` (2 componentes) e o rótulo da identificação sai "γ+β gama e beta" (`GameScene.js:1517-1518`). O cofre põe o I-131 na prateleira gama, e a ficha mostra γ "decide a prateleira". A classe de cor do rótulo virou `gama`, que tem contraste insuficiente (E2).
- Comentários desatualizados: `fisica/geiger.js:12` ainda diz "I-131 = beta + gama" (P3); `isotopes.js:9` diz que o Emax do Y-90 é "valor a conferir", mas `emissoes.js` já tem 2278,7 keV do LNHB e o alcance de 1095 mg/cm² confere por Katz-Penfold [V+C].

### B2. Fontes primárias reabertas nesta rodada [V]
| Nuclídeo | O que abri | Resultado |
|---|---|---|
| Am-241 | LNHB, `Am-241_tables.pdf` | T½ 432,6(6) a; alfas 5485,56 / 5442,86 / 5388,25 keV com 84,45 / 13,23 / 1,66 %; γ 59,5409 keV com 35,92 %. **Confere.** (A seção 2.1 da ficha traz as energias de transição, 5578 keV etc.; o jogo usa corretamente as energias de partícula da seção 4.) |
| Ra-226 | LNHB (Chisté e Bé, 2007), via IAEA `Ra-226_com.pdf` | T½ 1600(7) a; α 4784,34 keV com 94,038 % e 4601 keV com 5,950 %; γ 186,2 keV com 3,555 %; **Bi-214 609,3 keV com 45,49(19) %**. **Confere.** |
| I-131 | LNHB, `I-131_tables.pdf` | T½ 8,0233(19) d; β 606,3 / 333,8 / 247,9 keV com 89,4 / 7,20 / 2,13 %; γ 364,49 (81,2), 636,99 (7,12), 284,31 (6,14), 80,19 (2,607), 722,91 (1,786). **Confere.** |
| Cs-137 | LNHB, `Cs-137_tables.pdf` | T½ 30,018 a; β 513,97 keV com 94,57 % e 1175,63 keV com 5,43 %; γ 661,657 keV com 85,01 %. **Confere.** |
| Co-60 | LNHB, `Co-60_tables.pdf` | T½ 5,2711(8) a; β 317,32 keV com 99,88 % e 1490,56 keV com 0,12 %; γ 1173,2 (99,85) e 1332,5 (99,9826, seção de emissões). **Confere.** A seção de níveis traz 99,9988 para a transição total (gama + conversão), sem conflito. |

Não reabri U-238, Po-210, Sr-90/Y-90, P-32, Tc-99m nem Ir-192. Conferi só a coerência interna desses valores com `parametros-fisicos.json` e com os testes 10 e 12.

### B3. Números dos textos novos do cofre
- **Am-241, "59,5 keV, 35,9 em 100"** [V, LNHB]. **"Camada de chumbo de cerca de 0,12 mm reduz à metade"**: o jogo calcula 0,1192 mm (`espessuraChumbo`). Pelo NIST, μ/ρ(Pb) = 5,021 cm²/g a 60 keV, o que dá cerca de 5,12 a 59,5 keV por interpolação log-log, e HVL = ln2/(5,12 × 11,35) = **0,119 mm** [V: tabela NIST z82; V+C: cálculo]. Confere.
- **Ra-226/Bi-214, "609,3 keV, 45,49 em 100"** [V, mesma avaliação LNHB].
- **"~1.300 TBq de Sr-90 por RTG de Lia"** [V]. A AIEA, *The Radiological Accident in Lia, Georgia* (2014), dá "1295 TBq" (Prefácio e seção 1.1) e "1480 TBq" de projeto (seção 2.2). Ressalva que vale registrar: a seção 4.3 diz que a atividade **medida** era cerca de 40 % menor que a do certificado, por decaimento. "Cerca de 1.300 TBq" é, portanto, o valor do certificado (P3: acrescentar "segundo o certificado" em `fact5_1`, se quiser precisão total). O mesmo relatório dá **25 cm** (seção 4.2.3) e **27 cm** (seção 3.2.2.2) para o contêiner de chumbo; `story5` já mostra os dois [V].
- **"Material leve por dentro e chumbo por fora"** continua **fora** do jogo [V, grep em `current/js`].
- O texto da gama em Al/acrílico ("92 % a 96 %", "94 % a 96 %") é conferido pelo teste 11 [V, execução].

---

## C. Conteúdo educacional e histórico

### C1. Histórias e notas de campo (por amostragem) [V para o que conferi; o resto por leitura do registro]
- Conferi contra fonte aberta nesta rodada: Lia (atividade, 1 Sv/h a 1 m como bremsstrahlung, contêiner de 25/27 cm) [V, AIEA 2014]; meias-vidas citadas nas histórias (I-131, Cs-137, Co-60, Ra-226) [V, LNHB].
- Cálculos dos textos [V+C]:
  - `fact2_3`: 50,9 TBq × 2^(−39/30,018) = 20,7 TBq, "cerca de 21". Confere.
  - `fact7_2`: 2^(−41/5,2711) = 0,46 %, "cerca de 0,5 %". Confere.
  - Mayapuri: 147,186 TBq em 1969 dá cerca de 0,72 TBq em abril de 2010, coerente com "cerca de 688 GBq" (a diferença vem das datas exatas).
- Goiânia, Radium Girls, Chernobyl, Zaragoza, Mayapuri e Fukushima: **não reabri as fontes**. Li os textos contra `docs/fatos-historicos-3e.md`, e o teste 13 confere que cada número das histórias do cofre está nesse registro [V, execução]. Não achei exagero nem afirmação sem fonte nos textos de `story1` a `story8` e de `fact*`. A proibição do *brush-tipping* em 1929 já está marcada no registro como "só via síntese do USTUR" (fonte secundária) e merece a mesma ressalva no texto, se você quiser rigor máximo (P3).

### C2. Identificação: os distratores se distinguem? [V+C, `scripts/assinaturas.mjs`]
Calculei a fração de sinal que passa por cada placa a 0,5 m (base mínima) e o z-score da diferença numa janela de 3 s com fundo de 5 cps:
- **Missões 2, 3 e 7 (com `candidatosExtras`):** todos os pares se separam com folga (z ≥ 5,6; o par mais apertado é Ra-226 × Sr-90, separado pelo alcance). Não há atalho pela posição, porque a lista é alfabética [V, `candidatos.js`].
- **Missões 4 e 8 (I-131 × Cs-137)** e **missão 6 (Co-60 × Cs-137): achado P2.** Os dois candidatos têm o **mesmo rótulo** "γ+β gama e beta" e o mesmo padrão com Al e acrílico (cerca de 0,58). Só o chumbo os separa: **I-131 2,5 %**, **Cs-137 17 %**, **Co-60 46 %** (z de 12,6 a 13,6, então a medida resolve). Falta a regra que diz qual é qual. A lição 6 (`licoes.js:207`) ensina "cai um pouco com Al e sobra um patamar que só o chumbo reduz = β+γ (caso do Cs-137)", e nada sobre a energia da gama. Sem essa regra, o aluno chuta entre os dois, a não ser que já tenha achado o outro antes. O teste 36 só confere as missões que têm `candidatosExtras`, por isso não pegou o caso.
  - **Correção proposta:** mostrar a energia da gama principal no botão do candidato (por exemplo "γ+β · γ 364 keV" e "γ+β · γ 662 keV") e acrescentar uma frase à lição 6 e ao `betaGammaHint`: "Entre duas fontes γ+β, a de gama mais energética perde menos no chumbo (Co-60 > Cs-137 > I-131)". Teste novo em 36: todo par de candidatos da mesma missão (não só os extras) se separa e tem rótulo distinto.
- **Missão 6 com 2 candidatos:** aceitável **depois** da correção acima. Sem ela, é 50 % de chance.
- `betaGammaHint` (`i18n/pt.js:73`) diz "Se o chumbo zera o sinal… era só beta". No jogo o fundo é de 5 cps, então o chumbo nunca zera a leitura, e a dica só aparece para fontes de 2 componentes, para as quais essa frase nunca é a resposta. Proposta: "Se, com chumbo, a leitura cai até o fundo (cerca de 5 cps)…" (P3).

### C3. Coerência entre Academia, cofre e caderno [V, leitura]
A terminologia é a mesma (alfa/beta/gama; papel, acrílico, alumínio, chumbo; "componente"). Não achei contradição. O único ponto sensível é o C2: a Academia ensina a separar tipos, e as missões 4, 6 e 8 pedem para separar isótopos do mesmo tipo.

---

## D. Código e arquitetura

| # | Sev. | Achado | Evidência | Correção |
|---|---|---|---|---|
| D1 | P2 | `.cofre-content button { font: inherit; color: inherit }` (especificidade 0,1,1) vence toda classe única de botão. Já obrigou o remendo `.cofre-content .cf-mat`, e qualquer botão novo do cofre vai cair na mesma armadilha | [V] `styles.css:1377`, `:1424` | `:where(.cofre-content) button { font: inherit; color: inherit; }` (especificidade 0,0,1) e remover o remendo da linha 1424 |
| D2 | P3 | O breakpoint de 860 px está duplicado entre JS (`cofre-ui.js:25`, `matchMedia`) e CSS (`styles.css:1494`). Se um mudar sem o outro, a ficha deixa de fechar no celular ou fecha no desktop | [V] | Em `fecharFichaNoCelular`, testar `getComputedStyle(this.fichaWrap).position === 'fixed'` (lê o próprio CSS); ou exportar a constante e comentar o vínculo nos dois lados |
| D3 | P3 | `sticky` (desktop) e `fixed` (celular) na mesma `.cf-ficha-wrap`. Funciona [V, capturas], mas o `fixed` depende de nenhum ancestral ter `transform`. A animação `cf-abre` usa `transform` e só não atrapalha porque termina em `none` | [V] `styles.css:1374, 1447, 1502` | Comentário de alerta no CSS; ou animar só `opacity` no celular |
| D4 | P3 | `candidatosDaMissao` procura os extras em `ISOTOPES` (`candidatos.js:14`), mas o teste 36 aceita extras de `ISOTOPES + addIsotope`. Um extra como "Ra-226" passaria no teste e sumiria em silêncio no jogo | [V] leitura | Passar `[...ISOTOPES, ...MISSIONS.map(m => m.addIsotope).filter(Boolean)]` como `tabela` em `GameScene.js:1517`, ou fazer o teste usar só `ISOTOPES` |
| D5 | P3 | `GameScene.handleIdentify` monta o rótulo inline com `componentesDe` e `nomesDasComponentes` (`GameScene.js:1518`); a formatação de interface está dentro da cena | [V] | Mover para `candidatos.js` (`rotuloDoCandidato(iso, lang)`), testável em Node; é também o lugar da energia proposta em C2 |
| D6 | P2 | **Teste que pode passar por acaso:** `14-cofre-ui.test.mjs:390` retorna cedo se não houver prateleira alfa. O comentário ("a missão 5 só tem Cs-137, Sr-90 e Co-60") **é falso** nesta semente: a M5 tem Am-241 [V, `metricas.json`, `itens-m5`]. Hoje o teste roda de verdade; se a semente ou o gerador mudarem, ele passa sem conferir nada | [V] | Trocar o `return` por `assert.ok(alfa.length, 'semente sem Am-241: escolha outra')`, ou forçar as fontes pelo `antes` |
| D7 | P3 | O título do teste `14:349` promete "o botão de lacrar é alcançável", mas não há `assert` sobre ele. Nas capturas o "Lacrar" fica fora da tela em 960×640 | [V] | Acrescentar o assert (alcançável rolando) ou corrigir o título |
| D8 | P3 | `13-cofre-ficha.test.mjs:113` e os testes 10 e 11 dependem de `docs/`. Numa cópia sem `docs/`, o 13 passa em silêncio e o 10 e o 11 falham | [V] | Uniformizar: pular com `t.skip('sem docs/')` (aparece no relatório), em vez de `return` |
| D9 | P3 | **Cobertura que falta:** o nó do retorno estável no DOM (E3); distinção de todos os pares de candidatos (C2); "Lacrar" visível ou alcançável em 960×640 | — | Três testes curtos |
| D10 | P3 | Dívida técnica: `render/moveis.js` (1985 linhas), `scenes/GameScene.js` (1816), `styles.css` (1761), `ui.js` (895). `getIsotopeEducationalInfo` repete em texto fixo meias-vidas que já existem em `isotopes.js` | [V] `wc -l` | Não mexer antes de publicar. Numa etapa própria: separar `styles.css` por tela e gerar as meias-vidas do texto a partir dos dados |

---

## E. Interface, visual e acessibilidade

| # | Sev. | Achado | Evidência | Correção |
|---|---|---|---|---|
| E1 | **P1** | **✓ em qualquer blindagem escolhida**, inclusive errada (beta + chumbo = 0,4; papel na gama). O ✓ fica; o retorno vermelho some na ação seguinte. O aluno que revisa a tela vê "certo" | [V] `styles.css:1427`; capturas `pt-960x640-04`, `pt-390x844-04`; ausente na 3.2.0 | Remover o `::after`, ou usar o selo pelo crédito: `✓` se `credBlind ≥ 1`, `2ª`/`≈` se 0 < c < 1, `×` se 0 (classe `ok`/`parcial`/`errada` em `blindagemDe`). Teste: beta + chumbo não mostra "✓" |
| E2 | **P1** | Rótulo "γ" na identificação: `--accent #7b2cbf` sobre o botão `#1e1e2e` dá **2,31:1** (sobre `--surface`, 2,55:1), em 0,7 rem. O mínimo é 4,5:1. Agora inclui o I-131 | [V+C] `styles.css:878`; `scripts/contraste.mjs` | `.isotope-type.gama { color: #c58cff; }` (6,69:1) ou `#ca4ff9` (4,68:1, a cor gama do cofre) |
| E3 | P2 | A região `role="status"` do retorno (`cofre-ui.js:198`, `:253`) é **removida e reinserida no DOM** em cada `desenhar()`, e o texto muda enquanto o nó está fora do documento. O comentário "nó persistente" vale para o objeto JS, não para o DOM. Muitos leitores de tela não anunciam uma região viva recém-inserida [H]. Já era assim na 3.2.0 | [V] MutationObserver: removido, inserido, removido, inserido (`sondas/sonda-final.json`) | Pôr `retornoEl` fora de `areaEl` (por exemplo, como irmão no `cf-corpo`), anexado uma vez em `montar()`, e em `desenhar()` só trocar o texto. Teste: o nó não sai do DOM |
| E4 | P2 | 960×640: com tudo guardado, o "Lacrar" fica fora da tela (868/625 px; antes 1029). O plano pedia "visível sem rolar" | [V] `metricas.json` | Rodapé `position: sticky; bottom: 0` dentro de `.cofre-content` (com fundo opaco) em telas ≥ 861 px |
| E5 | **P1** | "Ainda não dá para concluir" sem estilo: fundo cinza do navegador, Arial, **19 px de altura** (alvo de toque) | [V] `sondas/identificar-m4-pt-960x640.png`; `.modal-btn` só tem regra dentro de `.licao-content` (`styles.css:1639`) | `#identify-modal .modal-btn { … }` com o mesmo visual do "Cancelar" e `min-height: 44px` |
| E6 | P3 | Celular: depois de guardar a última fonte, o retorno fica abaixo da dobra (y = 1179 px numa tela de 844) | [V] `pt-390x844-03c` | Em `tentarGuardar`, no celular, `retornoEl.scrollIntoView({ block: 'nearest' })`, respeitando `prefers-reduced-motion` |
| E7 | P3 | `.cf-prat-btn` com 28 px de altura (alvo do teclado e do leitor de tela). No toque a prateleira inteira recebe o toque | [V] | `min-height: 44px` no celular |
| E8 | P3 | Resumo do cofre: `role="status"` é aplicado **depois** de o conteúdo entrar, e o foco vai para "Voltar ao campo". O VoiceOver provavelmente lê o botão, não o resumo [H] | [V] `cofre-ui.js:510` | `aria-describedby` do botão apontando para a lista, ou foco no título `h3` com `tabindex=-1` |

**Acessibilidade sem leitor de tela** [V, por execução e leitura]:
- Tab preso no cofre (teste 14, 40 voltas).
- Foco devolvido depois de cada ação (14).
- Esc fecha a ficha e depois pede confirmação (14).
- `prefers-reduced-motion` desliga as animações do cofre (`styles.css:1510-1512`).
- Rótulos acessíveis nos cartões, nas prateleiras e na blindagem (`aria-pressed`, `aria-disabled`).
- Caderno com `tablist`/`tab`/`tabpanel` e `aria-label` traduzido no "fechar" (`i18n/index.js:23`).

**Eu não consigo ouvir leitor de tela.** Nada do que está acima garante o que o VoiceOver fala.

**O roteiro `docs/roteiro-voiceover-cofre.md` confere com o código?**
- Passos 1, 2, 3, 4, 7, 9, 10, 12, 13 e 14: o comportamento esperado corresponde ao código [V, leitura].
- **Passos 5, 6 e 8** ("lido sozinho"): **risco real de falhar**, por causa de E3. Se falharem, a causa provável é essa.
- **Passo 11:** a expectativa "o resumo é lido sozinho" provavelmente não se cumpre, porque o foco vai para o botão (E8). Ajustar a coluna 3 para "o VoiceOver lê 'Voltar ao campo'; com VO + A o resumo é lido" ou aplicar a correção E8.
- **Passo 4:** a primeira célula de cada linha é `td` com `aria-label`, não `th scope="row"`. O VoiceOver pode não anunciá-la como cabeçalho de linha. Correção: `th scope="row"` em `cofre-ui.js` (P3).
- **Faltam:** (a) um passo de **iOS VoiceOver no celular** (painel inferior da ficha, alça de 44 px). O público escolar usa mais o telefone que o Mac. (b) Um passo de **escolher uma blindagem errada** e conferir o que é lido no botão escolhido (com E1 corrigido). (c) No passo 4 do preparo: no Safari, o menu Desenvolver precisa ser ligado em Ajustes > Avançado antes de Cmd + Option + C funcionar.

**Textos PT e EN** [V, leitura e teste 01]: 202 chaves por idioma, com paridade. Não achei erro de português nos textos novos. "Aluminium" (cofre, `NOME_MATERIAL`) e "aluminum" (dicas) misturam a grafia britânica e a americana no EN (P3: padronizar para "aluminum").

---

## F. Documentação e processo

| # | Sev. | Achado | Correção |
|---|---|---|---|
| F1 | P2 | O README repete a entrada "2026-10-27 — Celular, fundo do Geiger e ferramentas de revisão" (linhas 887 e 912). A segunda cópia está entre as etapas 0-1 e 2-3-5 e quebra a ordem | Apagar a cópia da linha 912 |
| F2 | P3 | Os títulos das entradas de 27/10 alternam `##` e `###` | Uniformizar em `###` dentro de "Changelog corrido" |
| F3 | P3 | A regra "componente primária = `type` (inalterada)" (README, 14/10, linha 477) não remete à exceção de 27/10 | Acrescentar, nessa linha, "(exceção: I-131 desde 27/10/2026, ver etapa 1)". Não reescrever o histórico |
| F4 | P3 | O README de 27/10 e o plano dizem "física muda no máximo 0,15 %"; o valor medido é 0,195 % (B1) | Corrigir o número |
| F5 | P3 | O cabeçalho de autoria em `js/main.js:3` diz "Version 2.0"; a versão é a 3.3.0 | **Não alterei** (regra do projeto). Decida se o cabeçalho deve citar a versão ou ficar sem número |
| F6 | P3 | `archive/` tem 5 backups e `current/` não tem versões soltas [V] | Nada a fazer |

**Pendências que o prompt pediu para avaliar (minha recomendação):**
- **Fundo do Geiger em 5 cps:** **manter.** Está documentado, 8 testes dependem do valor e não muda o ensino. Só faz sentido mexer num pacote próprio, se um professor pedir realismo de sonda específica.
- **Aviso "versão de teste":** **manter** como está. Ele aparece só no modo de revisão e é verdadeiro (decisão de 27/10).
- **Trilha sonora feita com IA, para o registro (Unicamp/Inova):** **declarar o uso de IA no formulário** e manter a posição de 23/10 (autor humano, IA como ferramenta sob direção) em `inventario-autoria-registro.md`. Não é aconselhamento jurídico: a autoria de conteúdo gerado com IA ainda não está pacificada na lei brasileira (Lei 9.609/1998 para software; Lei 9.610/1998 para obras). A **Inova Unicamp** deve dar a palavra final antes do pedido. Guardar o histórico das conversas como evidência da direção [H].
- **Licenças:** Phaser 3.60.0 com `vendor/PHASER-LICENSE.md` (MIT) [V]. As fontes do Google são carregadas por link (`index.html:7`). Para escola, recomendo **hospedar as 3 fontes em `vendor/`** (a licença OFL permite), o que evita enviar o IP do aluno ao Google e faz o jogo funcionar sem internet (P3).

---

## O que verifiquei e o que não verifiquei

| Por execução | Por leitura | Não verifiquei |
|---|---|---|
| Suíte completa: 329/329 (duas passadas; a primeira com 2 falhas por `docs/` ausente) | `cofre-ui.js` inteiro; `cofre.js` (textos, citações, chumbo); `candidatos.js`; `componentes.js`; `geiger.js`; `isotopes.js`; `emissoes.js`; trechos de `GameScene.js` (identificação, dicas, info educativa); bloco `.cf-*` e `.isotope-*` de `styles.css` | **Leitor de tela** (VoiceOver, NVDA): não consigo ouvir |
| Hash da cópia: `current/` idêntico ao do Mac | Testes 13, 14 e 36 (trechos citados) | **Aparelho de toque real**, Safari e Firefox (só Chromium headless com toque emulado) |
| Capturas PT/EN em 960×640 e 390×844 com toque, mais métricas (32 PNG) | `story1` a `story8` e `fact*` em PT; lição 6 da Academia; `betaGammaHint` | Fontes reais (Orbitron, Inter) nas capturas |
| Sondas: modal de identificação nas M2, M4, M6 e M8; região viva do cofre (MutationObserver) | README (entradas de 14/10 e de 27/10), `roteiro-voiceover-cofre.md`, `inventario-autoria-registro.md`, `trilha-sonora.md` (trechos) | Fontes primárias dos acidentes de Goiânia, Radium Girls, Chernobyl, Zaragoza, Mayapuri e Fukushima (usei o registro `fatos-historicos-3e.md` e o teste 13) |
| `taxaFonte` antes e depois do I-131; assinaturas por placa e z-scores de todos os pares de candidatos | Comparação com `archive/2026-10-27_pre-cofre-opus` (✓ ausente; região viva já desanexada) | U-238, Po-210, Sr-90/Y-90, P-32, Tc-99m, Ir-192 na fonte primária |
| Contraste WCAG das cores citadas | — | O texto das outras 8 missões em EN, linha a linha (só a paridade de chaves, pelo teste 01) |
| Fontes reabertas: LNHB (Am-241, I-131, Cs-137, Co-60), LNHB/IAEA (Ra-226), NIST μ/ρ do chumbo, AIEA Lia (2014) | — | A suíte no seu Mac (o Chromium não baixa lá) |

**Erros meus:** (1) o "≤ 0,15 %" do plano de 27/10 era meu e estava subestimado (B1). (2) Nesta rodada, a primeira passada da suíte teve 2 falhas porque eu não tinha copiado `docs/referencias-5c/`. Não eram falhas do jogo, e as corrigi copiando a pasta e reexecutando.

---

## Lista de correções, por prioridade, com modelo e esforço

### Antes de publicar (v3.3.1): **Haiku, esforço baixo** (mecânico, cerca de 30 min, uma sessão)
1. **E1:** tirar o ✓ fixo da blindagem; selo pelo crédito (✓ / 2ª / ×) e teste "beta + chumbo não mostra ✓". *(Se quiser o selo pelo crédito, use o Sonnet, médio: mexe em `blindagemDe`.)*
2. **E5:** estilo de `#identify-modal .modal-btn` (44 px, mesmo visual do "Cancelar").
3. **E2:** `.isotope-type.gama { color: #c58cff; }`.
4. **F1, F4:** apagar a entrada duplicada do README e corrigir "0,15 %" para "0,2 %".
5. Arquivar `current/` antes (`archive/<data>_pre-3.3.1.tar.gz`, apagando o mais antigo), `VERSAO = '3.3.1 · <data>'`, suíte completa e o comando de deploy abaixo.

**Troque para o Sonnet, esforço médio, antes da próxima mensagem**, para o bloco seguinte.

### Próxima versão (v3.4): **Sonnet, esforço médio**
6. **C2:** energia da gama no rótulo do candidato, frase na lição 6 e no `betaGammaHint`, e teste de distinção de **todos** os pares, com rótulos distintos. Dá para combinar com D5 (`rotuloDoCandidato` em `candidatos.js`).
7. **E3:** retorno fora de `areaEl`, anexado uma vez, e teste de nó estável. **Faça depois** de você rodar o roteiro de VoiceOver, para ter o "antes" e o "depois".
8. **E4:** rodapé `sticky` no desktop e assert em `14:349` (D7).
9. **D1:** `:where(.cofre-content) button` e remoção do remendo da linha 1424.
10. **D6, D8:** o teste do Am-241 sem `return` silencioso; `t.skip` quando faltar `docs/`.
11. **E8, E6, E7** e `th scope="row"` na tabela do Geiger.
12. Atualizar o roteiro de VoiceOver: passo 11, passo de iOS, passo de blindagem errada, menu Desenvolver.

### Quando houver tempo: **Haiku, esforço baixo**
13. Comentários de B1 (`geiger.js:12`, `isotopes.js:9`), F2, F3, `betaGammaHint` "cai até o fundo", "aluminum" no EN, D2, D3, D4, e "segundo o certificado" em `fact5_1`.
14. Fontes do Google em `vendor/` (F, licenças).

### Só se decidir: **Opus, esforço alto**
15. Uma revisão do Opus só se a v3.4 mudar a lógica de identificação de forma mais ampla do que o item 6. Para a v3.3.1, a suíte basta.

**Comando de deploy (NÃO executado):**
`netlify deploy --dir=/Volumes/EXBOM/LabVirtualGC/apps/radhunter/current --site=d8c7ba5a-9508-421d-b97e-50ed205c0c1f --prod`

---

## Material desta pasta
- `capturas/`: 32 PNG (PT/EN × 960×640/390×844 × missões 4 e 5, mais o caderno) e `metricas.json`.
- `sondas/`: 4 capturas do modal de identificação (M2, M4, M6, M8) e `sonda-final.json` (identificação e região viva).
- `scripts/`:
  - `captura-cofre-final.mjs` e `sonda-final.mjs` rodam de dentro de uma subpasta de `tests/` (importam `../helpers/`);
  - `calc-i131.mjs`, `assinaturas.mjs` e `contraste.mjs` são puros e recebem o caminho de `current/js`.
  
  **Não copiei nada para `tests/ferramentas/`** (rodada só de leitura); copie só se quiser.
- `logs/`: saídas da suíte.
- `_transferencia/`: os dois `.tar.gz` usados para levar a cópia à nuvem. Podem ser apagados; eu não consigo apagar arquivos na sua pasta sem permissão.

### Fontes abertas nesta rodada
- LNE-LNHB/CEA, *Table de Radionucléides*: [Am-241](http://www.lnhb.fr/nuclides/Am-241_tables.pdf), [I-131](http://www.lnhb.fr/nuclides/I-131_tables.pdf), [Cs-137](http://www.lnhb.fr/nuclides/Cs-137_tables.pdf), [Co-60](http://www.lnhb.fr/nuclides/Co-60_tables.pdf).
- V. Chisté e M. M. Bé (LNHB), avaliação do Ra-226 (2006, revisão de 2007): https://www-nds.iaea.org/act_ddl/data/Ra-226_com.pdf
- J. H. Hubbell e S. M. Seltzer, NIST, *X-Ray Mass Attenuation Coefficients*, chumbo (Z = 82): https://physics.nist.gov/PhysRefData/XrayMassCoef/ElemTab/z82.html
- AIEA, *The Radiological Accident in Lia, Georgia* (Viena, 2014): https://www-pub.iaea.org/MTCD/publications/PDF/Pub1660web-81061875.pdf
