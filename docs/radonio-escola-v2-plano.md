# Episódio do radônio na escola, v2: plano (28/10/2026)

**Pedido de Arnaldo:** as salas com muita ou pouca ventilação não parecem reais; o episódio das escolas precisa melhorar muito.
**Decisões dele:** simulação física; o aluno controla a sala; nível Ensino Médio; manter as lições (protocolo, limites, comunicado) e refazer a base de dados.

## Diagnóstico do episódio atual (lido em `js/investigacao/radonio-escola.js`)
O episódio ensina leitura de dados (média de 30 dias, janela de observação, protocolo, limites). Não há ventilação, fonte, entrada nem diluição do gás: os números (A = 60 e B = 140; campanha A = 140 e B ≈ 111,7 Bq/m³) são fixos e escritos à mão.

## Modelo proposto (balanço de massa de uma caixa)
dC/dt = S/V − (λv + λ)·C + λv·C0, com C em Bq/m³; S = taxa de entrada do radônio do solo e dos materiais (Bq/h); V = volume da sala (m³); λv = taxa de troca de ar (1/h); λ = constante de decaimento do Rn-222; C0 = concentração externa.
Solução exata por passo (exponencial), sem integração numérica instável. Regime permanente: C∞ = (S/V + λv·C0)/(λv + λ).
Consequência qualitativa: com λv ≫ λ, o decaimento quase não importa e a ventilação domina; sala fechada acumula, janela aberta dilui.

## Verificado nesta rodada (fontes consultadas em 28/10/2026)
- Meia-vida do Rn-222: 3,8232 (8) dias, IAEA/LNHB, https://www-nds.iaea.org/act_ddl/data/Rn-222_com.pdf [V]. Logo λ = ln 2 / 3,8232 d ≈ 0,00756 1/h [cálculo meu].
- Escolas com ventilação mecânica programada: o radônio médio nas horas de ocupação é cerca de um terço do período todo (fator 0,33 ± 0,23 no conjunto 1; 0,35 ± 0,30 no conjunto 2; 45 % dos casos abaixo de 0,2). Exemplo: um jardim de infância com média do período acima de 20 pCi/L e média nas horas ocupadas de 1,0 pCi/L. Nos fins de semana o radônio costuma ser maior que nas noites de semana, porque a ventilação ficou desligada por mais tempo. Fonte: T. Rönnqvist (Radonova), AARST, Indoor Environments 2023 (apresentação), https://aarst.org/wp-content/uploads/2024/03/09_05_SR_TUE_Ronnqvist_RADON-LEVELS-DURING-WORKING-HOURS.pdf [V para os números citados; é uma apresentação, não artigo revisado por pares].
- Troca de ar de projeto em salas de aula ocupadas: 4,6 a 6,5 trocas/h nos cenários calculados (não medidos) e janelas manuais não garantiram a qualidade mínima do ar. Fonte: Calama-González, León-Rodríguez & Suárez (2019), Energies 12(24), 4607, https://doi.org/10.3390/en12244607 [V; valores de cálculo, não de medição].
- Concentração externa de 9 Bq/m³ e troca de ar de ~0,55 1/h na estação de aquecimento como exemplos de residência (Fisk & Mowris, LBL-23136, 1987) [V para o que o artigo diz; são casas, não escolas, e dos EUA].

## Ainda sem fonte (não inventar; buscar na etapa 1 ou marcar [H] no jogo)
- Taxa de entrada S típica de salas de aula do térreo e do andar superior (Bq/h ou Bq/m²h).
- Troca de ar com janelas e portas fechadas em escolas brasileiras (infiltração); com janelas abertas.
- Concentração externa típica no Brasil.
- Variação diária e sazonal do próprio S (pressão, temperatura, chuva).

## Etapas e modelo recomendado
| # | Etapa | Modelo / esforço |
|---|---|---|
| 0 | Backup do `current/` e entrada no README | Haiku, baixo |
| 1 | Tabela de parâmetros com fontes e rótulos [V]/[H] (`docs/radonio-parametros.md`) | Sonnet, médio (busca) |
| 2 | Módulo puro `js/fisica/radonio.js` + testes de unidade (regime permanente, constante de tempo, limites, conservação) | Sonnet, alto |
| 3 | Atividade interativa `sala-radon`: sala com janela, porta e ventilação mecânica, relógio e gráfico ao vivo, comparação de duas salas | Sonnet, alto |
| 4 | Cenas novas (de onde vem, ventilação, fim de semana, o que fazer) e base das cenas antigas gerada pelo modelo; PT/EN; revisão dos textos | Sonnet, médio |
| 5 | Lição na Academia com a equação como leitura opcional | Sonnet, médio |
| 6 | Testes (estruturais, de modelo, de interface, celular) e suíte completa | Sonnet, médio |
| 7 | Revisão crítica da física e dos textos | Opus, alto |
| 8 | Correções, pacote, md5 e README | Haiku/Sonnet, baixo |

Troque o esforço para **alto** antes das etapas 2 e 3, para **médio** nas etapas 1, 4, 5 e 6, e para **baixo** nas 0 e 8.

## Critérios de aceite (o que significa "mais real")
1. Sala fechada com entrada constante sobe e tende a C∞; abrir a janela faz cair com constante de tempo 1/(λv + λ).
2. Ventilação desligada à noite e no fim de semana faz a concentração subir; ligada na aula, cai. O fim de semana fica acima da noite de semana.
3. Média nas horas ocupadas bem abaixo da média do período todo em salas com ventilação programada, na faixa descrita por Rönnqvist (fator em torno de 0,3, com grande dispersão).
4. Nenhum valor numérico novo sem fonte ou sem o rótulo [H] (hipótese de ensino).
5. Todos os dados continuam declarados como sintéticos; nenhuma escola real é diagnosticada.

## Atualização (28/10/2026) — decisões de Arnaldo depois do plano
1. **A entrada de radônio (S) depende da construção e do tipo de ambiente**, não só de a sala estar aberta ou fechada. O modelo passa a ter **dois botões separados**: S (contato com o solo, laje, fundações, materiais, diferença de pressão) e λv (troca de ar: janela, porta, ventilação mecânica). Sala fechada acumula porque λv é baixo; sala em contato com o solo acumula porque S é alto.
2. **Parâmetros por tipo de ambiente** (sala de aula, secretaria, biblioteca, depósito, porão, sótão, corredor), cada um com S e λv em faixas e com fonte ou rótulo [H].
3. **A escola terá pisos** (porão, térreo, 1º andar, sótão), com um mapa por piso e escadas que trocam de mapa, ao estilo de jogos de aventura. Fica como etapa própria, com estudo de viabilidade antes de construir (ver abaixo).

### Verificado nesta rodada (fontes consultadas em 28/10/2026)
- Em três escolas finlandesas eficientes em energia (15 salas), o radônio **diminuiu com o andar**, mais nos prédios de base mais alta; as concentrações mais altas ocorreram com a ventilação desligada ou em potência parcial; **desligar a ventilação fora do horário de aula produziu o maior acúmulo**; o pico foi por volta de 6 h; salas sem janela ou sem ligação direta com o exterior acumularam mais; prédios com muito concreto acumularam mais. Máximos medidos: 38, 162 e 25 Bq/m³. Fonte: A. Shirazi (2025), *Variability of radon levels in Finnish energy-efficient schools*, dissertação de mestrado, Aalto University, https://aaltodoc.aalto.fi/items/656ea8cd-09b0-4247-a956-b70b5850bcc4 [V para o que a dissertação relata; **dissertação, não artigo revisado por pares**; clima e construção finlandeses, não brasileiros].
- Radônio em edifícios é discutido como suprimento de gás do solo, fluxo por diferença de pressão (efeito chaminé, vento, desbalanço de ventilação), difusão e aberturas da fundação (trincas, ralos, passagens de tubulação); a concentração é a entrada dividida por volume e troca de ar. [conhecimento geral meu; **a fonte não abriu** (a página do artigo PMC11636676 bloqueou a leitura), então ainda **não** há citação verificada para isso].

### Hipóteses a verificar antes de entrar no jogo (não afirmar ainda)
- **Sótão (corrigido por Arnaldo em 27/10):** longe do solo, mas as paredes, a laje e o telhado exalam radônio (Ra-226 dos materiais). S_mat vale em qualquer andar; o sótão fechado acumula pelos materiais. Ver `radonio-parametros.md` §3.
- **Porão:** esperamos o maior S da escola (contato com o solo). **Falta fonte numérica por tipo de ambiente.**
- **Depósito fechado no térreo:** S de térreo com λv muito baixo, logo acumula; num andar superior o acúmulo seria menor. **Falta fonte.**

### Etapa nova: planta com vários pisos
- Hoje cada investigação tem **uma** `planta` (`PLANTA_ESCOLA`, 36 × 22) em `js/mapa/plantas-investigacao.js`, desenhada por `desenharPlanta`, e a GameScene não troca de mapa dentro de uma investigação [lido no código; **não verifiquei** o custo de trocar de mapa: colisão, câmera, minimapa, NPCs e pontos de interação por piso].
- **Etapa 3b (estudo de viabilidade, Sonnet alto):** protótipo de duas plantas ligadas por escada, medindo o que precisa mudar na GameScene, na câmera e no minimapa, antes de desenhar os quatro pisos.
- Roteiro com pisos: o aluno leva um medidor ativo e um detector passivo, escolhe onde medir, vê o efeito do andar e do tipo de ambiente, e depois propõe a ação (ventilar, selar fissuras, despressurizar o solo, mudar o uso da sala).

## Status (28/10/2026)
- Feitas: etapas 0 a 4 e a **etapa 5 (lição extra da Academia)**; pisos (térreo, 1º andar, porão, sótão); campanha A × B gerada pelo modelo; 7 personagens (v3.3.8).
- **Roteiro do episódio (v3.3.8, 9 cenas, ordenado por andares):** 1 pergunta (térreo, Dora) → 2 ventilar a sala (térreo, Inês, `sala-radon` + leitura opcional) → 3 porão/depósito/sala (porão, Nelson, `ambiente-radon`) → 4 sótão (sótão, Léo, `ambiente-radon`) → 5 campanha de 12 períodos (1º andar, Vera) → 6 protocolo (térreo, Paulo) → 7 comunicação (térreo, Tânia) → 8 conclusão (térreo, Inês) → 9 transferência (térreo, Dora). Trocas de andar: 6 no total (antes, 8), nunca mais de 3 escadas seguidas; o teste 41 fixa isso.
- Lição extra: `js/academia/licoes-extra.js` (`radonio-equacao`), leitura opcional, sem quiz, fora das 8 lições lineares da Academia; aberta pelo botão "Leitura opcional" da cena 2 do episódio, em modo de revisão. Os números do texto (110 Bq/m³ fechada, 13 com ventilação, τ ≈ 6,3 h e 19 min) vêm do mesmo módulo da atividade. NÃO há painel dessa lição no mapa da Academia (decisão pendente do Arnaldo).
- Campanha da cena 5: sala A (térreo; janelas e porta na aula e uma janela aberta o tempo todo na época quente; fechada nos períodos 4 a 8) × sala B (térreo; ventilação mecânica programada o ano todo). No frio o modelo multiplica a entrada do solo por 2 (`FATOR_SOLO_FRIO`, valor de jogo [H]) nas duas salas. A inversão depende desse fator.
- Pendente: revisão crítica do Opus da física e dos textos (etapa 7); busca de fontes (S_solo por tipo de sala, infiltração em escolas, exalação de materiais brasileiros, C0 no Brasil, efeito do frio); teste em celular real.
