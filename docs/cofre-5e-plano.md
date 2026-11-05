# Cofre interativo (etapa 5e) — plano e respostas às questões de projeto

Escrito em 14/10/2026, depois de ler README.md, docs/encontros-5c.md, agente-D-5d3.md (V5D3.5 a V5D3.8),
js/encontros/{motor,aproveitamento,gerenciador,ui-encontro,caderno,cofre}.js, js/data/{isotopes,shields}.js,
js/fisica/geiger.js, GameScene.concluirComEncontros, styles.css (.cad-*, .enc-*), as 8 missões e os testes 08/09.
**Nada em current/ foi alterado.** Nenhum valor físico novo é afirmado aqui como fato: o que ainda falta ler na
fonte está marcado [P]; escolhas de jogo, [H]; verificado, [V]; cálculo sobre valor verificado, [V+C].

## 1. Achados da leitura que mudam o desenho

1. **Só 6 isótopos são sorteados nas missões** (campo `allowedIsotopes`): Am-241 (M1, M5), Cs-137 (M1, M2, M4, M5, M6, M8),
   Ra-226 (M3), I-131 (M4, M8), Sr-90 (M4, M5, M8), Co-60 (M5, M6, M7). Tc-99m, Ir-192, P-32, Po-210 e U-238 estão em
   isotopes.js mas nunca aparecem no cofre.
2. **Ra-226 (M3) não está em V5D3.8.** Faltam as emissões na ficha LNHB [P].
3. **Com a regra "mais penetrante com rendimento significativo", a prateleira alfa quase nunca é usada:**
   Am-241 vai para gama (59,5 keV, 35,9 por 100). Ra-226 só fica em alfa se contarmos apenas as emissões do próprio
   nuclídeo; uma fonte de rádio selada e antiga está em equilíbrio com os filhos do radônio (Pb-214, Bi-214), que emitem
   gama forte [P: rendimentos e energias a ler no LNHB]. Distribuição com a regra recomendada (seção 2):

   | Missão | Isótopos | Prateleiras usadas |
   |---|---|---|
   | M1 treinamento | Am-241, Cs-137 | só γ |
   | M2 Goiânia | Cs-137 | só γ |
   | M3 Radium Girls | Ra-226 | α (só o nuclídeo) ou γ (com filhos) |
   | M4 Chernobyl / M8 Fukushima | I-131, Cs-137, Sr-90 | β, γ |
   | M5 Lia | Sr-90, Cs-137, Co-60, Am-241 | β, γ |
   | M6 Zaragoza | Co-60, Cs-137 | só γ |
   | M7 Mayapuri | Co-60 | só γ |

4. **M5 (Lia):** o relatório da AIEA trata de fontes de Sr-90; Cs-137, Co-60 e Am-241 nessa missão são ficção do jogo.
   A ficha precisa dizer isso ("no jogo"), para não atribuir ao acidente o que não está na fonte.
5. **Testes do cofre provisório** (3 em 08-encontros, trechos de 09-encontros-jogo) serão **substituídos**, não apagados;
   a contagem final deve ficar ≥ 115.
6. **archive/** já tem 5 itens (4 pastas + o .zip original). Ao arquivar `pre-cofre` sai a pasta mais antiga
   (`2026-10-14_pre-encontros`); o .zip original fica, como nas rodadas anteriores.

## 2. Questão 1 — regra de prateleira

**Regra proposta [H, decisão de projeto]:** a fonte vai para a prateleira do tipo mais penetrante (γ > β > α) entre as
emissões com rendimento ≥ 10 por 100 decaimentos, contando os filhos de vida curta em equilíbrio numa fonte selada
(Ba-137m no Cs-137, Y-90 no Sr-90; Ra-226: ver decisão D2).

- O limiar de 10 é robusto: qualquer valor entre ~0,02 e ~35 por 100 dá as mesmas prateleiras para os isótopos do jogo
  (Po-210 γ 0,0012; Y-90 γ 0,017; Am-241 γ 35,9). Um teste vai travar isso.
- **Am-241 vai para gama**, e a energia aparece como **espessura de chumbo** por fonte (camada semirredutora e espessura
  para reduzir a 1/1000, feixe estreito sem buildup, NIST XCOM [V+C]). O Am-241 precisa de décimos de milímetro de chumbo,
  o Co-60 de centímetros (valor de 60 keV fora da tabela atual de geiger.js: ler no XCOM [P]). Mensagem da ficha:
  "Você achou o Am-241 pela alfa, mas o que escapa do frasco é a gama de 59,5 keV: fraca, e uma lâmina fina de chumbo basta."
- **Recomendação para a prateleira alfa não ficar vazia:** M1 (treinamento, ficção declarada) passa a ter 3 fontes
  Po-210 (α), Sr-90 (β), Cs-137 (γ), cobrindo as três prateleiras uma vez. O Am-241 continua na M5.

### Revisão de 14/10/2026 após observação do Arnaldo (Am-241 é fonte alfa)

- Arnaldo: o Am-241 é prioritariamente alfa; um Geiger mede a alfa antes da gama. Concordo com a conclusão (Am-241 em alfa).
- Mas "o que o Geiger mede primeiro" não serve como regra geral: o GM é muito mais eficiente para beta do que para gama,
  então Cs-137, Co-60 e I-131 iriam para a prateleira beta, e a gama deles é a que exige chumbo.
- **Regra revista [H]:** prateleira = tipo mais penetrante (γ > β > α) entre as emissões com rendimento **≥ 50 por 100
  decaimentos** (era ≥ 10). A faixa que dá o mesmo resultado vai de 36 (acima da γ do Am-241, 35,9) a 85 (a γ do Cs-137 soma 85,0; a soma das gamas do I-131 passa de 99), conferida por varredura em 14/10/2026 e fixada no teste 11; 50 fica no meio. [Correção da revisão E: este texto dizia 81,2 como limite superior.]
  Resultado: Am-241, Po-210, U-238 → α; Sr-90, P-32 → β; Cs-137, Co-60, I-131, Ir-192, Tc-99m → γ; Ra-226 segue em D2.
- Consequências: a M1 (Am-241, Cs-137) passa a usar α e γ e a M5 usa as três prateleiras; **D3 (trocar a M1) deixa de ser
  necessária.** A ficha do Am-241 mostra a barra gama (59,5 keV, 35,9 por 100) como emissão secundária de baixa energia.

### Revisão 2 (14/10/2026): Geiger, filhos do radônio e D2

- Arnaldo: em fonte alfa o GM mede a alfa muito antes de qualquer outra radiação; com fundo de 5 cps, uma gama pouco
  energética a distância se confunde com o fundo. **Aceito:** o Geiger do jogo (Am-241 e Ra-226 só alfa, por contato) é
  coerente com a regra do cofre. Retirados Am-241 e Ra-226 da tabela de incoerências da seção 3.
- Incoerência que permanece: **I-131** (no jogo só beta; gama de 364 keV a 81,2 por 100, energia média). Em grau menor,
  a componente beta do Cs-137 e do Co-60. A etapa F, se feita, fica restrita a isso.
- **Definição da regra:** rendimento por tipo = soma das linhas do próprio nuclídeo na ficha LNHB do pai (o Cs-137 já inclui
  o Ba-137m nessa ficha). Filhos que têm ficha própria não entram. **D2 resolvida: Ra-226 → alfa.**
- Nota de física para a ficha (a conferir no LNHB [P]): na cadeia do Ra-226, Rn-222, Po-218 e Po-214 são emissores alfa;
  Pb-214 e Bi-214 são emissores beta-gama.

### Revisão 3 (14/10/2026): D5 decidida pelo Arnaldo

- **I-131 passa a ter duas componentes no Geiger (beta + gama)**, e o jogo precisa mostrar ao aluno que a fonte tem essas
  duas emissões (ficha, dica de identificação e cofre), para que ele interprete a atenuação: o alumínio corta a beta e
  sobra a gama de 364 keV.
- **Quando uma emissão domina** (alfa no Am-241 e no Ra-226/Rn), fica só ela; o restante é desconsiderado no Geiger.
- **Proposta para fechar a regra (a confirmar):** usar o mesmo limiar do cofre também no Geiger: entram as componentes
  com rendimento ≥ 50 por 100 decaimentos. Resultado: I-131, Cs-137, Co-60 (e Ir-192) com β + γ; Am-241, Ra-226 só α;
  Sr-90 só β; Tc-99m só γ. Pendente: Arnaldo decidir se Cs-137 e Co-60 também ganham a componente beta.
- Implementação (etapa F): taxa da fonte = soma das componentes, cada uma com o seu modelo atual (β: alcance; γ: μ do
  NIST); normalizar para que a taxa sem blindagem continue igual à de hoje (preserva calibração e testes de força).

### Revisão 4 (14/10/2026): decisões fechadas

- **Cs-137 e Co-60 também com beta + gama no Geiger** (Arnaldo: sim). Regra única cofre/Geiger: componentes com rendimento
  ≥ 50 por 100 decaimentos. **D4 aprovada** (selecionar e guardar; 1 / 0,4; blindagem por prateleira).
- **Requisito de jogabilidade (Arnaldo):** nenhuma fonte pode ficar impossível de identificar. Na medida real, com
  blindagens diferentes, percebe-se a radiação mais penetrante só se ela tiver atividade suficiente; fora isso, vê-se a mais
  emitida (ex.: Th-232: alfa de perto, gama depois da blindagem). Testes da etapa F:
  1. o robô conclui as 8 missões;
  2. cada componente incluída fica acima do fundo (5 cps) por margem estatística na janela de 3 s, a uma distância alcançável;
  3. cada par de isótopos da mesma missão é distinguível por pelo menos uma blindagem.
- Conta de apoio [V+C, feixe estreito, só a placa, NIST XCOM e Katz-Penfold]: transmissão gama em Al 3 mm / acrílico 5 mm /
  Pb 1 cm: Cs-137 0,94 / 0,95 / 0,28; Co-60 0,96 / 0,96 / 0,51; I-131 (364 keV) 0,93 / 0,94 / 0,04. Beta do Cs-137, Co-60,
  I-131 e Sr-90: zero com Al 3 mm ou acrílico 5 mm; Y-90 (filho do Sr-90): 0,26 (Al) e 0,46 (acrílico). Logo, com chumbo:
  Sr-90 → 0, I-131 → 4%, Cs-137 → 28%, Co-60 → 51% da gama: os quatro continuam distinguíveis.
- Ordem: A (mockup) → B (dados) → C (lógica) → F (Geiger) → D (interface) → E (revisão).

## 3. Questão 2 — coerência com o Geiger e com `type`

| Isótopo | Geiger hoje (`type`) | Emissões reais (V5D3.8) | Coerente? |
|---|---|---|---|
| Sr-90 | β (alcance do Y-90) | β 100 + Y-90 β | Sim (freamento omitido) |
| Cs-137 | γ só | β 94,6 + γ 85,0 | Prateleira sim; Geiger não: a parte β some com o alumínio num detector real |
| Co-60 | γ só | β 99,9 (317 keV) + 2 γ | Idem, efeito menor |
| I-131 | β só (Al zera) | β 89,4 + γ 364 keV 81,2 | **Não**: na realidade a gama atravessa Al e acrílico |
| Am-241 | α só por contato | α 84,5 + γ 59,5 keV 35,9 | **Não**: há gama fraca detectável à distância |
| Ra-226 | α só por contato | α + (filhos γ) | Depende de D2 |

**Proposta:**
- Agora: `js/data/emissoes.js` passa a ser a fonte única das emissões; `type` continua existindo com o sentido declarado de
  "assinatura no Geiger do jogo" (dicas e identificação). Nenhum teste do Geiger muda.
- A ficha mostra "O que o seu Geiger mostrou" calculado com as próprias funções de geiger.js (transmissão por blindagem),
  então bate com o que o aluno viu; onde o modelo simplifica (I-131, Am-241), uma linha diz isso com clareza.
- **Etapa F recomendada, logo depois:** Geiger multicomponente (taxa = soma das componentes de emissoes.js, com os fatores
  de eficiência por tipo que já existem [H]). Ganho de jogo: o alumínio passa a separar I-131 (sobra gama) de Sr-90 (zera).
  Custo: recalibrar com a simulação e revisar 04/05/06. A ficha atualiza sozinha, porque usa geiger.js.

## 4. Questão 3 — mecânica

- **Selecionar e guardar**, não arrastar como mecanismo principal: tocar/clicar no cartão (abre a ficha) e depois na
  prateleira, ou nos botões "Guardar em α/β/γ" da ficha. Teclado: setas entre cartões, Enter abre a ficha, 1/2/3 guarda,
  Esc fecha a ficha. Arrastar com Pointer Events fica como atalho para mouse e toque (a API nativa de arrastar do HTML não
  funciona por teclado e é irregular no toque).
- **Um cartão por isótopo** ("Cs-137 ×5"): menos cliques, mesmo aprendizado.
- **Retorno imediato** ao guardar: 1ª tentativa certa = 1; 2ª = 0,4; errou duas = o jogo guarda e explica (0).
  Mesmo esquema dos encontros.
- **Blindagem por prateleira**, escolhida depois que ela recebe a 1ª fonte, entre papel/embalagem, acrílico, alumínio,
  chumbo, concreto. Créditos [H]: α papel 1, acrílico/alumínio 0,7 ("funciona, mais do que o necessário"), chumbo/concreto 0,4;
  β acrílico/alumínio 1, chumbo 0,4 (freamento), papel 0; γ chumbo/concreto 1, demais 0. A espessura por fonte aparece na ficha.
- **Nota do cofre** = média dos itens (isótopos + prateleiras usadas), 0 a 1, × 10 %. Ex.: M4 = 3 isótopos + 2 prateleiras.
- **Proporções na ficha:** uma barra por tipo (0 a 100 por 100 decaimentos), com a energia principal; a barra que decide a
  prateleira fica destacada; uma linha explica que a soma passa de 100 porque um decaimento pode emitir beta e gama.

## 5. Questão 4 — dados da ficha

| Campo | Origem | Status |
|---|---|---|
| Nome, elemento, símbolo | isotopes.js | V |
| Meia-vida | isotopes.js (LNHB) | V |
| Emissões e energias | emissoes.js (V5D3.8, LNHB) | V; Ra-226 e filhos [P] |
| Espessura de blindagem | NIST XCOM / Katz-Penfold, calculada | V+C; 60 keV e filhos do Ra [P] |
| O que o seu Geiger mostrou | geiger.js por blindagem | modelo do jogo [H], rotulado |
| Atividade | **Não** mostrar Bq por fonte do jogo (a força é adimensional). Mostrar "sinal no jogo (escala didática)" e, como contexto da missão, só valores com fonte: Goiânia 50,9 TBq (AIEA 1988); Lia ~1300 TBq por fonte (AIEA 2014); Mayapuri 147,186 TBq em 1969 e ~0,688 TBq em 2010 (AERB, V5D3.5) | V |
| História | fatos-historicos-3e.md, 1 a 2 linhas por missão; isótopo fora do acidente real = "no jogo" | V / ficção declarada |
| Usos típicos | textos de `getIsotopeEducationalInfo` ainda não auditados contra fonte | [P]: entram só depois de conferidos |

## 6. Questão 5 — escala

Alvo 60 a 120 s (teto 3 min). No pior caso (M5): 4 cartões + 2 blindagens + "Lacrar o cofre". A ficha abre ao selecionar,
mas não é obrigatório lê-la. Sem cronômetro; tempo da missão congelado. Esc = fechar ficha; Esc de novo pergunta se quer
sair (itens restantes = 0). Transições ≤ 250 ms; nenhuma com `prefers-reduced-motion`. O teste de navegador vai travar o
número máximo de interações por missão.

## 7. Visual (para o mockup da etapa A)

O cofre é **equipamento** (metal escuro, etiquetas de transporte amarelas, trifólio, três baias com cor por tipo, vindas de
isotopes.js); a ficha é **cartão de papel no estilo do caderno** (Georgia + Courier, mesma paleta .cad-*), como se viesse
do caderno de campo. Desktop: baias à esquerda, ficha à direita. Celular: baias empilhadas e ficha em painel inferior.
Contraste AA, alvos ≥ 44 px, foco visível.

## 8. Decisões que preciso do Arnaldo

- D1. Regra da seção 2 com limiar de 10 por 100 e Am-241 em gama, com espessura por fonte.
- D2. Ra-226: contar os filhos (realista, M3 vai para gama) ou só o nuclídeo (M3 em alfa)?
- D3. M1 com Po-210, Sr-90 e Cs-137 (3 fontes), para usar as três prateleiras.
- D4. Mecânica e créditos da seção 4 (inclui os créditos parciais de blindagem [H]).
- D5. Etapa F (Geiger multicomponente) depois do cofre.

## Estado (14/10/2026)

A: mockup aprovado. B: `emissoes.js` (fontes LNHB, Ra-226 em V5E.1). C: `cofre.js` com a lógica pura (README, entrada 5e-C); o [P] do chumbo a 60 keV foi fechado com o NIST XCOM. Próximas: F (Geiger com beta + gama para I-131, Cs-137 e Co-60, com os testes de detectabilidade) e D (interface).

## Estado (14/10/2026, após a etapa D)
A, B, C, F e D concluídas. D: cofre integrado (`cofre-ui.js`, `cofre-ficha.js`, `cofre-textos.js`), 167 testes passando no Chromium. Pendente: E (revisão crítica com Opus/esforço alto, documentação final, comando `netlify deploy` sem executar).

**Atualização 27/10/2026:** o I-131 passou a `type: "gama"` em isotopes.js (ver `docs/geiger-projeto-3a.md`); a incoerência 'no jogo só beta' (linha 68) deixou de existir.
