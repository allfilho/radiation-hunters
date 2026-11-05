# Revisão do cofre — plano por etapas (Opus, 27/10/2026)

Primeira rodada, **só leitura**: nada em `current/`, `tests/` ou `archive/` foi alterado. Nenhum deploy.
Marcação: **[V]** verificado (em fonte já registrada em `docs/` ou por execução real); **[V+C]** cálculo meu sobre valor verificado ou com as funções do próprio jogo; **[H]** hipótese ou decisão de projeto; **[P]** pendente de fonte.

Material desta pasta (`docs/revisao-cofre-2026-10-27/`):
- `capturas/` — 20 capturas reais (Chromium headless, jogo real, missões 4 e 5, PT; uma da missão 5 em EN) em 960×640 e 390×844, mais `metricas.json` (alturas de rolagem, alvos de toque < 44 px, fontes usadas).
- `captura-cofre.mjs` e `sonda-identificar.mjs` — os scripts que geraram as capturas. Foram escritos para rodar de dentro de `tests/ferramentas/` (importam `../helpers/`). **Não os coloquei em `tests/`** (rodada só de leitura); para reutilizar, copie-os para lá.

---

## 1. Plano por etapas

Cada etapa começa arquivando `current/` em `archive/<data>_pre-<tag>.tar.gz` (apagando a entrada mais antiga para ficar com 5), registra no README e termina com a suíte completa (hoje 311/311) passando. Nada é publicado; no fim, só informo o comando de deploy.

| Etapa | Conteúdo | Arquivos principais | Testes afetados | Modelo / esforço |
|---|---|---|---|---|
| 0 | Arquivar `current/`, abrir a entrada do README "revisão do cofre (27/10)" | `archive/`, `README.md` | nenhum | Haiku, baixo |
| 1 | **I-131 com `type: "gama"`** (seção 3) | `js/data/isotopes.js` (1 linha) | 7 testes em 01, 04, 05, 12 (ajustes de premissa, não de física) | Sonnet, médio |
| 2 | **Correções visuais/UX P1** do cofre (seção 2, itens 1 a 5) | `cofre-ui.js`, `styles.css` (`.cf-*`), `cofre-textos.js` | 14 (4 linhas de `aria-checked`) + testes novos de celular e de 960×640 | Sonnet, médio |
| 3 | **Textos das decisões 1, 4 e 6** e uso de `FATOS_PRATELEIRA` (seções 4 e 5) | `cofre.js` (`TEXTO_BLINDAGEM`, `explicarBlindagem`), `cofre-ui.js`, `i18n/pt.js` e `en.js` (`betaGammaHint`) | 11 e 13 continuam valendo; 2 a 4 testes novos de texto | Sonnet, médio |
| 4 | **Identificação com candidatos fixos** (decisão 3), sem botões repetidos, rótulo do tipo traduzido | `GameScene.js` (montagem da lista), `ui.js` (rótulo), `data/missoes/02, 03, 07` (campo novo opcional) | 02, 21, 24 e o robô selecionam por nome (devem passar); teste novo de "sem repetição" e de distinção dos distratores | Sonnet, médio-alto |
| 5 | **Caderno e contraste** (seção 2, itens 6 a 9) | `index.html` (botão fechar do caderno), `caderno.js`, `styles.css` (`.cad-*`, `.cf-em.*`) | 16 (acessibilidade) deve passar; teste novo de alvo ≥ 44 px | Haiku, baixo |
| 6 | **Leitor de tela** (pendência c): roteiro de 15 min para VoiceOver no seu Mac; eu escrevo o roteiro, você executa | `docs/` (roteiro) | nenhum | Haiku, baixo + você |
| 7 | **Revisão crítica final**: suíte completa, capturas novas com o mesmo script, comparação antes/depois, comando de deploy (não executado) | `docs/`, `README.md` | todos | Opus, alto |

Por que nesta ordem: a etapa 1 é pequena, isolada e mexe nos dados que as etapas 3 e 4 usam (rótulos e ordem "γ+β"); as etapas 2 e 5 são só interface; a 4 é a mais arriscada para os testes e fica depois de a interface estar estável. Etapas 2, 3 e 5 podem ser feitas numa só sessão do Sonnet se você preferir menos rodadas.

---

## 2. Item 1 — Revisão visual e de experiência (cofre x caderno)

**Como verifiquei:** capturas reais com o jogo de `current/` (cópia idêntica, staged do seu disco para a nuvem, porque o Chromium não baixa no seu Mac: a rede do ambiente bloqueou o download do Playwright). Fluxo: missão 5 → abrir o cofre pelo `gerenciador.cofre()` → selecionar → errar → acertar → blindagens (uma certa, uma 0,4) → lacrar → caderno; missão 4 → ficha do I-131 guardado. O teste `14-cofre-ui` rodou na mesma cópia: **12/12** [V].

**Limite das capturas:** o ambiente de teste responde vazio às fontes do Google (como `helpers/navegador.mjs` faz), então Orbitron e Inter aparecem com fonte substituta; Georgia e Courier podem ter sido substituídas pelas equivalentes do Linux. Formas, cores, tamanhos e rolagens valem; o "desenho das letras" não.

### Veredito geral
A **ficha** do cofre está no mesmo nível do caderno: mesmo papel (#fffaf0, borda #cdbf94, margem vermelha), mesma dupla Georgia + Courier, mesma sombra de cartão (capturas `*-02-*`, `*-06-*`, `*-07-*`). O **corpo metálico** é deliberadamente diferente (equipamento) e está bem acabado em 960×640 no estado inicial. Os problemas estão em **estados intermediários** (depois de escolher, errar, no celular) e na **altura** da tela de 960×640 quando a ficha e as blindagens aparecem. Abaixo, em ordem de prioridade.

### P1 — corrigir na etapa 2

1. **Celular: a ficha (painel inferior, 72vh) esconde o retorno e a bandeja** [V, capturas `390x844-03-erro-1a-tentativa.png` x `390x844-03b-erro-ficha-fechada.png`].
   Depois de tocar numa fonte a ficha sobe e **continua aberta** após guardar ou errar (`tentarGuardar` chama `desenharFicha` e não fecha). Resultado: a dica do erro ("O Am-241 emite gama, mas só em 35,9…") fica **atrás** do painel, o tremor da prateleira também, e para tocar na próxima fonte é preciso fechar o painel pela alça. Meu próprio script travou aqui: o clique na fonte seguinte era interceptado pela ficha.
   **Proposta:** em telas ≤ 860 px, `tentarGuardar` fecha o painel (`fichaAberta = false`, remove `.aberta`) em acerto **e** em erro, para o aluno ver o retorno e as prateleiras; a explicação continua acessível tocando de novo no cartão. Alternativa mais barata, se preferir manter o painel: repetir o texto do retorno no topo da ficha (`.cf-ficha` recebe um `<p class="cf-f-retorno">`). Recomendo a primeira (menos texto duplicado).
   Arquivos: `cofre-ui.js` (`tentarGuardar`, `selecionar`), `styles.css` (`@media (max-width: 860px) .cf-ficha-wrap`). Teste novo em 14: no celular, depois de um erro, `.cf-retorno` visível e não coberto (`elementFromPoint`).

2. **Alça de fechar a ficha no celular: 64×20 px** [V, `metricas.json`]. Abaixo dos 44 px que o próprio projeto exige. **Proposta:** `.cf-ficha-fechar { height: 44px; }` com um "✕ Fechar ficha" visível (texto já existe em `cofre-textos.js`: `fichaFechar`).

3. **Blindagem escolhida: as outras quatro continuam com cara de clicáveis, e o crédito some** [V, `960x640-04-blindagens-escolhidas.png`, `390x844-04-…`].
   Os botões não escolhidos recebem `aria-disabled="true"`, mas o CSS só estiliza `:disabled` (`.cf-mat:disabled { opacity: .6 }`), então nada muda na tela. O texto que explica o 0,4 (beta + chumbo) aparece no retorno e é **substituído** pela próxima ação; na prateleira não fica marca nenhuma.
   **Proposta:** `.cf-mat[aria-disabled=true]:not([aria-checked=true]) { opacity: .45; cursor: default; }` e, ao lado da escolhida, o mesmo selo dos cartões (✓ / ! / ×) com uma linha curta persistente embaixo (`.cf-blind-nota`, o texto de `explicarBlindagem`, já pronto). Arquivos: `styles.css`, `cofre-ui.js` (`blindagemDe`).

4. **960×640: o cofre deixa de caber assim que a ficha abre** [V, `metricas.json`]: altura do conteúdo 618/618 px no início, **761/625** com a ficha aberta, **1029/625** com as blindagens. Como há um único contêiner rolando (`.cofre-content`), rolar para ver o fim da ficha (fonte, botões "Guardar α/β/γ") leva junto as prateleiras; o teste 14 só confere a rolagem **horizontal**.
   **Proposta (duas mudanças pequenas):** (a) a coluna da ficha com rolagem própria no desktop: `.cf-ficha-wrap { position: sticky; top: 0; max-height: calc(98vh - 120px); overflow: auto; }`; (b) blindagens numa linha só: rótulo "Blindagem" acima e os 5 materiais em `grid-template-columns: repeat(5, 1fr)` com `min-height: 44px` e fonte 12 px (hoje quebram em 3 linhas por prateleira). Teste novo em 14: em 960×640, depois de guardar tudo, `.cf-lacrar` visível sem rolar.

5. **Atalhos de teclado mostrados no celular** [V, `390x844-01-cofre-inicio.png`]: "← → fonte · 1 2 3 prateleira · Esc fecha a ficha" e as teclas 1/2/3 nas prateleiras aparecem num aparelho sem teclado. **Proposta:** `@media (hover: none) and (pointer: coarse) { .cf-tecla, .cf-atalhos { display: none; } }` e mostrar lá a frase `arrastar` (já existe em `cofre-textos.js` e não é usada).

### P2 — etapa 2 (se couber) ou 5

6. **Selo "!" sem significado** [V, `390x844-04`]: o cartão guardado na 2ª tentativa mostra "!", que tem `aria-hidden` e não entra no `aria-label`. Quem não viu a explicação não sabe o que é. **Proposta:** `aria-label` com o resultado ("acerto na 1ª tentativa" / "na 2ª tentativa" / "guardada pelo cofre") e `title` com o mesmo texto; trocar "!" por "2ª".
7. **Contraste na ficha (papel)** [V+C, razão de contraste WCAG calculada]: símbolo α `#c98a00` sobre `#fffaf0` = **2,84:1**; β `#2f7fd6` = **3,94:1** (texto de 16 px em negrito precisa de 4,5:1); barra alfa contra o trilho `#eadfba` = 2,21:1 (elemento gráfico precisa de 3:1). **Proposta:** `.cf-em.alfa { --cor: #8a5d00 }` (5,54:1 no papel; 4,32:1 no trilho) e `.cf-em.beta { --cor: #1f63b0 }` (5,82:1; 4,54:1). O gama `#a12fd6` já passa (5,18:1).
8. **Retorno que cresce e empurra o rodapé** [V, `960x640-02` x `-03`]: de 1 para 2 linhas o botão "Lacrar" desce. `.cf-retorno { min-height: 64px; }` resolve.
9. **Baia "vazia" parece campo de texto** [V, `960x640-01`]: fundo escuro com sombra interna igual a um `<input>`. Borda tracejada e "vazia" em itálico deixam claro que é um espaço.

### Caderno (comparação e o que corrigir — etapa 5)
O caderno está bem acabado e coerente; os pontos fracos são de acessibilidade, não de visual:
- **Botão fechar** 19×37 px [V, `metricas.json`] e `aria-label="Close"` fixo em inglês também no PT (`index.html`, linha 380). Proposta: 44×44 px e `data-i18n-aria` (ou o mesmo `t('close')` que os outros modais usam, se houver).
- **Abas** com `role="tab"` sem `aria-controls`/`tabpanel` e sem setas; no celular (`.cad-aba-nome { display: none }`) o nome acessível vira só "🌍 0/3" [V, `390x844-06`]. Proposta: `aria-label` com o nome do tema em cada aba e `role="tabpanel"` + `aria-labelledby` na folha. As setas entre abas são opcionais (abas não valem nota, então aqui o padrão ARIA completo é seguro).
- Contraste do caderno passa: `#6b5d3a` sobre `#fffaf0` 6,21:1, sobre `#eadfba` 4,85:1 [V+C].

### Fora do cofre, mas visto nas capturas (registro)
- No modal de identificação, o botão "Ainda não dá para concluir" aparece **sem estilo** (aparência padrão do navegador) em 960×640 [V, `960x640-09-identificar-m2-pt.png`]. Ele tem a classe `modal-btn`; não investiguei a causa.
- O rótulo "γ+β gama e beta" usa `--accent` `#7b2cbf` sobre `#151520`: **2,55:1** [V+C]. Abaixo de 4,5:1.

---

## 3. Item 2 — I-131: mudança mínima no `type`

### O que o `type` faz hoje (lido no código)
`type` só é usado em 6 lugares: componente **primária** do Geiger (`fisica/componentes.js`, `fisica/geiger.js`), classe de cor do botão de identificação (`ui.js`: `isotope-type beta`), dica de erro quando a fonte tem uma componente só (`GameScene.js` 1625–1626; o I-131 tem duas e já usa `betaGammaHint`), valor reserva de `prateleiraDe` (nunca usado, porque o I-131 está em `emissoes.js`) e testes. O `symbol` "β" só aparece num texto reserva que o I-131 não usa (`getIsotopeEducationalInfo` tem texto próprio).

### Opções
| Opção | O que muda | Efeito | Veredito |
|---|---|---|---|
| A. `type: "gama"`, `symbol: "γ"`, `energyMeV: 0.3645` | 1 linha em `isotopes.js` | Física praticamente igual (abaixo); rótulo vira "γ+β gama e beta", igual ao Cs-137 e ao Co-60; cor do rótulo vira a da gama | **Recomendada** |
| B. `type: "beta+gama"` | 1 linha | `fatorForca["beta+gama"]` = `undefined` → taxa `NaN` no Geiger | Rejeitar |
| C. Campo novo (ex.: `assinatura: ['beta','gama']`) | dados + código que o leia | Duplica o que `componentesDe` já calcula a partir de `emissoes.js` | Rejeitar (custo sem ganho) |
| D. Não mudar e só documentar que `type` = "componente primária do Geiger" | comentário | Zero custo, mas o I-131 continua com "β+γ" e cor de beta enquanto o cofre o põe na gama | Aceitável só se você não quiser mexer nos testes agora |

### Por que A não muda a física [V+C, executado]
Com `type: "gama"`, a componente gama vira a primária (peso 1, força base × 0,3) e a beta vira secundária com peso 98,73/98,86 = 0,9987 (força base × 1,0 × 0,9987). Hoje é o inverso, com pesos 1 e 1,0013. O alcance beta secundário sai de Katz-Penfold na Emax de 606,3 keV: **213,6 mg/cm²**, contra os 214 de hoje. Rodei `taxaFonte` nas duas versões (base mínima 220, 1 tile = 0,5 m, ar livre):

| d | sem placa | Al 3 mm | acrílico 5 mm | Pb 10 mm |
|---|---|---|---|---|
| 0,5 m, hoje | 420,8 | 243,1 | 246,6 | 10,4 |
| 0,5 m, com A | 420,2 | 242,8 | 246,3 | 10,4 |
| 2 m, hoje / com A | 16,1 / 16,1 | 14,9 / 14,9 | 15,1 / 15,1 | 0,6 / 0,6 |

Diferença máxima de 0,2 % (medido depois: 0,195 %; o 0,15 % deste plano estava subestimado) — nenhuma calibração muda.

### Arquivos afetados por A
- `current/js/data/isotopes.js`: a linha do I-131 (`type`, `symbol`, `energyMeV: 0.3645`; `betaRangeMgCm2: 214` pode ficar, não atrapalha). `energyMeV` vem da linha principal de 364,489 keV do LNHB já em `emissoes.js` [V]; 0,3645 é o valor que `energiaGamaEfetiva('I-131')` já devolve.
- Docs: `docs/geiger-projeto-3a.md` e `docs/cofre-5e-plano.md` (tabela da seção 3 diz "I-131 | β só") e o comentário de `fisica/componentes.js` ("A componente PRIMÁRIA é a do `type`… e fica exatamente como antes"): registrar a exceção.

### Testes afetados por A [V, executado]
Rodei numa cópia, com e sem a mudança, 17 arquivos de teste (01–06, 08–14, 16, 17, 24 e 29; 197 testes). Sem a mudança: 195/197 (as 2 falhas são testes que leem `docs/`, ausente na cópia). **Com a mudança: 188/197 — 7 falhas novas**, todas por premissa do teste, nenhuma por física:
- `01-dados` (1): a "caracterização" fixa `['I-131', 'beta', 220, 420]`.
- `04-geiger` (1): "o chumbo zera o beta e atenua o gama" escolhe a fonte `type === 'gama'` da missão 4, que passa a poder ser o I-131; a comparação supõe gama pura (obtido 0,034, esperado 0,040). Ajuste: escolher pelo nome (Cs-137) ou comparar só a componente gama.
- `05-geiger-modelo` (2): `fonte('beta', {nome: 'I-131'})` procura um isótopo beta chamado I-131. Ajuste: construir a fonte beta do I-131 explicitamente (os valores de alcance testados continuam certos).
- `12-geiger-componentes` (3): ordem "beta+gama" → "gama+beta", peso da secundária (agora a beta), e a frase da ficha `β (…) + γ (…)` → `γ (…) + β (…)`.
Não rodei os arquivos 07, 15, 18–23, 25–28 e 30–35; nenhum deles cita o I-131 (busquei por "I-131" e por `.type` nos testes).

**Antes de aplicar, uma decisão sua:** o README de 14/10 (etapa 5e-F) registra "componente primária = `type` de isotopes.js (inalterada)". A opção A muda isso só para o I-131. Recomendo aprovar.

---

## 4. Item 3 — As 6 decisões pendentes (recomendação, custo, risco)

| # | Decisão | Recomendação | Custo | Risco para os testes |
|---|---|---|---|---|
| 1 | Am-241/Ra-226 com "papel" ignorando a gama de 59,5 keV / 609 keV dos filhos | **Manter o crédito 1 do papel e acrescentar uma frase** à explicação da blindagem alfa quando a prateleira tem Am-241 ou Ra-226 | ~20 linhas (`cofre.js`: `explicarBlindagem` recebe os itens da prateleira; `cofre-ui.js` passa os itens) | Baixo: 11 só confere comprimento > 10; 2 testes novos |
| 2 | Regra conta só o próprio nuclídeo (Y-90, Bi-214 fora) | **Manter e fechar.** Já é a D2 que você decidiu em 14/10; a ficha já mostra Y-90 e Bi-214 como "só informativo" | 0 (só registrar no README) | Nenhum |
| 3 | Identificação mostra só fontes não achadas (missões 2, 3, 7 com uma resposta) | **Lista fixa de candidatos por missão, sem repetição**: os isótopos da missão + 2 ou 3 distratores distinguíveis com as placas | ~30 linhas (`GameScene.js`, `ui.js`, 3 arquivos de missão) | Médio-baixo: 02, 21, 24 e o robô escolhem por nome; 2 testes novos |
| 4 | Beta + chumbo = 0,4 vs. contêiner de chumbo de Lia | **Manter 0,4 e reescrever o texto** de `beta.chumbo` ligando ao caso de Lia | 2 frases (PT/EN) em `cofre.js` | Baixo: 13 confere outros materiais; 11 só comprimento |
| 5 | Geiger ignora a gama do Am-241 | **Manter e fechar.** Você já decidiu em 14/10 (README, "Pesquisa histórica ampla", item a) | 0 | Nenhum |
| 6 | Dica beta + gama generaliza para Sr-90/P-32 | **Reescrever `betaGammaHint`** acrescentando o teste do chumbo | 2 textos (`i18n/pt.js`, `en.js`), mesma chave | Baixo: 01 conta chaves (não muda) |

### Detalhes e textos propostos

**1. Papel para Am-241/Ra-226.** A regra de prateleira está certa (alfa domina), e na prateleira alfa o papel é a resposta que a NRC sustenta (C3.1 [V]). O que falta é não deixar o aluno achar que "papel resolve tudo" para essas fontes. Texto proposto, só com valores já registrados:
- Am-241: "Certo: papel ou a embalagem fechada barram a alfa. O Am-241 também emite uma gama fraca de 59,5 keV (35,9 em cada 100 decaimentos) que o papel não barra; uma camada de chumbo de cerca de 0,12 mm já reduz essa gama à metade." [V: LNHB em `emissoes.js`; V+C: camada semirredutora de `espessuraChumbo('Am-241')`, NIST XCOM, feixe estreito.]
- Ra-226: "Certo para o próprio Ra-226. Numa fonte antiga e selada, os filhos do radônio se acumulam e o Bi-214 emite gama de 609,3 keV (45,49 em 100); aí seria preciso chumbo também." [V: nota já existente em `emissoes.js`, mesma ficha LNHB.]
Não recomendo baixar o crédito do papel: a pergunta do cofre é "a blindagem certa para a prateleira", e mudar o crédito mudaria a regra que você aprovou.

**2. Só o próprio nuclídeo.** Mudar agora reabriria a D2 (Ra-226 iria para gama, a M3 perderia a prateleira alfa) e o teste que fixa o limiar entre 36 e 85. A nota da ficha já ensina a nuance. Fechar.

**3. Candidatos na identificação.** Hoje a lista tem **um botão por fonte não achada, inclusive repetidos**: na missão 2 aparecem **cinco botões "Cs-137"** [V, `960x640-09-identificar-m2-pt.png`; `sonda-identificar.mjs`]. Em inglês, o rótulo das fontes de uma componente sai em português: "α **alfa**", "β beta" (`ui.js`, linha 765, usa o `type` cru) [V, mesma sonda, missão 5 EN].
Proposta:
- lista = nomes **distintos** das fontes da missão (achadas ou não, porque pode haver outra fonte igual) ∪ `candidatosExtras` (campo novo, opcional, no arquivo da missão);
- distratores escolhidos para serem **distinguíveis com as placas do jogo** [V+C, `taxaFonte` a 0,5 m, base mínima, fração que passa em Al / acrílico / Pb]: Sr-90 0,22 / 0,42 / **0**; Cs-137 0,58 / 0,58 / **0,17**; Co-60 0,85 / 0,86 / **0,46**; Am-241 só por contato.
  - M2 (Cs-137): + Co-60, Sr-90, Am-241.
  - M7 (Co-60): + Cs-137, Sr-90, Am-241.
  - M3 (Ra-226): + Sr-90, Cs-137. **Sem Am-241**: Am-241 e Ra-226 são, no Geiger do jogo, alfa só por contato e não se distinguem por medida; pôr os dois juntos tornaria a identificação um chute.
- rótulo do tipo pelo idioma (`NOME_TIPO` de `cofre.js` já tem alfa/alpha, gama/gamma).
Teste novo: nenhuma missão mostra nome repetido; cada par (fonte real, distrator) da mesma missão difere em pelo menos uma blindagem por margem estatística (mesmo critério do teste de distinção da etapa 5e-F, em `12`).

**4. Beta + chumbo e Lia.** A história de Lia está certa e é [V]: recuperação com contêiner blindado de chumbo de ~25 cm (AIEA, 2014, já em `story5`), e o jogo já ensina que o Sr-90 gera raios X de freamento no metal (`fact5_2`). Não há contradição de física: a 0,4 penaliza **chumbo sozinho como primeira escolha** para beta, que é o que C3.5 sustenta (NRC: "low Z material such as plastic") [V]. O problema é só de texto. Proposta para `TEXTO_BLINDAGEM.beta.chumbo`:
"Barra a beta, mas o chumbo sozinho gera raios X de freamento, mais penetrantes; por isso, para a beta, prefere-se material leve. Em fontes beta muito intensas, como os RTG de Lia (cerca de 1.300 TBq de Sr-90), esses raios X também precisam de blindagem: o contêiner de recuperação era de chumbo."
**[P]**: não escrevi "material leve por dentro e chumbo por fora" porque não li essa frase numa fonte registrada; se quiser incluí-la, o candidato é a página da HPS já citada em C3.5 (conferir antes).

**5. Am-241 no Geiger.** Já decidido por você em 14/10. Só registrar como fechado. A ficha é coerente com isso: a tabela do Geiger mostra "α só por contato" e as barras mostram a gama de 59,5 keV como emissão abaixo de 50.

**6. Dica beta + gama.** A dica só aparece para fontes de duas componentes (I-131, Cs-137, Co-60), mas o **procedimento** que ela ensina vale para qualquer fonte, e com o Sr-90 ele engana: no modelo do jogo, a 0,5 m, o Sr-90 mantém **22 %** do sinal com alumínio e **42 %** com acrílico (beta do Y-90) [V+C]. Quem seguir "o que sobra é a gama" pode achar que o Sr-90 tem gama. O que separa de verdade é o chumbo (Sr-90 → 0; I-131 → 2 %; Cs-137 → 17 %; Co-60 → 46 %).
Texto proposto (`betaGammaHint`, PT): "Esta fonte emite {0}. Meça sem placa e depois com alumínio ou acrílico: a beta cai bastante. Depois meça com chumbo: o que ainda sobra é a gama. Se o chumbo zera o sinal, não há gama — era só beta (a beta muito energética, como a do Y-90 do Sr-90, atravessa parte das placas finas)." EN equivalente.

---

## 5. Item 4 — Pendências de `docs/cofre-5e-revisao.md`

**a. `FATOS_PRATELEIRA` não usado.** Recomendo **usar**, não apagar: o jogo cita fonte em todo lugar (caderno, ficha) e as dicas das prateleiras são as únicas sem "Fonte:". Proposta: na ficha, depois de guardar, uma linha "Regra de blindagem: US NRC, Radiation Basics; Reactor Concepts Manual (p. 5-7 a 5-9); NRC, Shielding Radiation (slides 16–17)" montada a partir de `FATOS_PRATELEIRA[prat]` e de um mapa ID → citação curta em `cofre-textos.js` (as citações são as de C3.1–C3.5 em `docs/referencias-5c/busca/agente-A-conceitos.md` [V]). Para a alfa, **não** usar C6.3 na citação visível: o próprio registro diz que o PDF da OMS está sem título nem data. Custo baixo; o teste 11 continua conferindo os IDs, e um teste novo confere que a citação aparece.

**b. `role=radio` sem setas.** Recomendo **trocar o papel**, não implementar as setas. No padrão ARIA de radiogroup, as setas movem o foco **e marcam** a opção; aqui marcar é uma resposta avaliada e irreversível, então as setas fariam o aluno "responder" sem querer. O comportamento real é de botões de escolha única: `role="group"` no contêiner e `aria-pressed` em cada botão (no lugar de `role="radio"` + `aria-checked`), mantendo `aria-disabled` depois da escolha. Custo: 3 linhas em `cofre-ui.js`, 1 seletor em `styles.css` (`[aria-checked=true]` → `[aria-pressed=true]`) e 4 linhas do teste 14 (120–124).

**c. Leitor de tela não testado.** Continua não testado (eu também não testei). Recomendo um roteiro curto que você roda no seu Mac com VoiceOver (Safari) em ~15 min, cobrindo: anúncio do diálogo ao abrir; nome de cada fonte e da prateleira; anúncio do retorno depois de guardar (região `role=status` persistente); leitura do resultado da blindagem; leitura da tabela do Geiger (cabeçalhos); Esc e confirmação de saída; resumo final. Se possível, repetir em NVDA + Firefox num computador de sala de aula. Teste automático com axe-core pegaria só parte disso e exige instalar dependência nova; não recomendo agora.

---

## 6. O que verifiquei e o que não verifiquei

**Verifiquei (por leitura):** `docs/prompt-cofre-opus.md`; README das entradas de 14/10 a 27/10 (as de 15/10 a 26/10 só onde citam cofre, caderno, I-131 ou identificação); `docs/cofre-5e-plano.md`; `docs/cofre-5e-revisao.md`; `cofre.js`, `cofre-ficha.js`, `cofre-textos.js`, `cofre-ui.js`, `caderno.js`; `data/emissoes.js`, `isotopes.js`, `shields.js`; `fisica/componentes.js` e o trecho de `taxaFonte` em `geiger.js`; os trechos de `GameScene.js` que montam a identificação e as dicas; `ui.js` (`showIdentifyModal`); o bloco `.cf-*` e `.cad-*` de `styles.css`; os modais do cofre e do caderno em `index.html`; `story5`, `fact5_*`, `betaHint`, `betaGammaHint` em `i18n/pt.js`; C3.1–C3.5 e C6.3 em `docs/referencias-5c/busca/agente-A-conceitos.md`; os testes 10, 11, 12, 13, 14 e os trechos de 01, 02, 04, 05, 09 que dependem do `type`.

**Verifiquei (por execução, numa cópia na nuvem do seu `current/` e `tests/`):** teste 14 (12/12); testes 05, 10, 11, 12, 13 (68/70; as 2 falhas leem `docs/`, ausente na cópia — no seu disco devem passar, mas não rodei lá); 17 arquivos de teste com e sem a mudança do I-131 (195/197 → 188/197); as taxas do Geiger com e sem a mudança; as capturas e as métricas desta pasta; os botões repetidos na identificação da missão 2 e o rótulo "α alfa" em inglês; as razões de contraste (fórmula WCAG 2.x sobre as cores do CSS).

**Não verifiquei:**
- A **suíte completa** (311) — rodei 197 testes de 17 arquivos; os outros 18 arquivos não citam o I-131 nem abrem o cofre (só o 21 e o robô passam por ele indiretamente), mas não os executei.
- **Nada no seu Mac**: o download do Chromium pelo Playwright falhou na rede do seu ambiente, então tudo rodou numa cópia na nuvem (Chromium 1243 com playwright-core 1.56.1). No fim da sessão a ponte com o seu Mac caiu por alguns minutos; se este arquivo chegou ao disco, ela voltou.
- **Fontes reais** (Orbitron, Inter) nas capturas; **aparelho de toque real**; **leitor de tela**; Safari/Firefox.
- **Fontes primárias** (LNHB, NIST, NRC, AIEA): usei os valores e trechos já registrados em `docs/` e em `emissoes.js`; não reabri os PDFs.
- O motivo do botão "Ainda não dá para concluir" sem estilo.
- O texto "material leve por dentro e chumbo por fora" (decisão 4) ficou **[P]** de propósito.

**Erros meus nesta rodada:** a primeira versão do script de captura travou no celular porque supunha que a ficha não cobria a bandeja — foi assim que achei o item P1-1. As métricas "fontes" do `metricas.json` listam a família declarada no CSS, não a efetivamente desenhada.
