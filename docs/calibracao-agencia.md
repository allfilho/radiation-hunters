# Agência · calibração da dose e da economia (28/10/2026)

Marcas: [C] calculado/medido por simulação; [H] valor de jogo escolhido; [V] verificado em fonte. Nada aqui vem de dados reais de jogadores: é calibração por simulação, a confirmar em sala de aula.

## 1. Dose em campo (K)
**Medição [C]:** um robô percorre a missão pelo caminho mais curto (BFS no mapa gerado), passa 10 s junto de cada fonte (identificação) e soma cps gama × tempo (modelo de `fisica/dose.js`, sem alfa/beta, omnidirecional). 3 sorteios por missão (sementes 100, 107, 114), roteiro em `tests/ferramentas/medir-dose-robo.mjs`.

| Missão | cps·s por saída (média de 3) |
|---|---|
| 2 Goiânia | ~14 300 |
| 3 Radium Girls | 0 (sem gama) |
| 4 Chernobyl | ~11 100 |
| 5 Lia | ~9 450 |
| 6 Zaragoza | ~12 150 |
| 7 Mayapuri | ~19 300 |
| 8 Fukushima | ~14 300 |

O robô leva ~1 min por missão; um jogador humano leva mais (fator de tempo FT, [H]: 1 = robô, 1,5 = médio, 2,5 = lento).
**Escolha [H]: K = 5e-5 mSv por (cps·s).** Dose do líder por saída = cps·s × K × FT: rápido 0,5–1 mSv; médio 0,7–1,4; lento 1,1–2,4 (limite diário 1,5). Com K = 1e-4 quase toda saída estourava o limite diário (34 cientistas em tratamento por ano no simulador); com 5e-5 ficam 0, ~6 e ~49 por ano em dois anos simulados, para FT 1, 1,5 e 2,5 (o jogador simulado sempre escolhe quem tem menor dose relativa).

## 2. Economia
Fontes de receita por alerta/mês: verba mensal 1 000 × fator (50 % a 150 %, sobe com nota boa); 50 créditos por estrela (1 a 3 por missão; 2 por investigação); entrega de coleta 15 por fonte.
Custos [H] (frota.js): nave tripulação 1 000, resgate 750, levantamento 1 500; hangar 1 900, alojamento 1 000, laboratório 1 250; escavar coluna 750, linha 1 000; contratar 500; pesquisa detector aéreo 1 500 (10 dias).

**Simulador:** `tests/ferramentas/calibrar-economia.mjs` (uso: `cd tests && RH_ROOT=../current node ferramentas/calibrar-economia.mjs 5e-5 1.5`; aceita JSON de sobreposição de custos como 4º argumento). Jogador simulado: atende cada alerta com 85 % de chance, manda os 2 cientistas de menor dose relativa, compra em ordem fixa (nave de resgate, laboratório, pesquisa, contratações, nave de levantamento, módulos, escavações).
**Resultado (200 simulações de 720 dias, mediana):** laboratório no dia 30; pesquisa iniciada no dia 60; 2º hangar no dia 120; nave de levantamento no dia 150; Base 6×3 completa no dia 528 (~mês 17). Receita em 720 dias: verba ~34 700, alertas ~16 000, coletas ~7 500; gasto ~46 000. A verba é ~60 % da receita; jogadores que deixam alertas vencer ganham menos (fator até 50 %).
**Antes da calibração** (custos 2,5× menores, coleta 40 por fonte): laboratório no dia 4, tudo comprado até o dia ~120, receita ~8 000 por ano só dos alertas e coleta pagando mais que a missão: generoso demais.

## 3. Limites
Os fatores de tempo e a taxa de atendimento (85 %) são suposições; não há dados de jogadores. A missão 3 não gera dose (só alfa e beta), o que é coerente com a simplificação mas pode surpreender. Recalibrar depois de testes em sala de aula.

## Atualização v3.6.3 (29/10/2026): verba por missão concluída
Prêmio base [H] por nível, pago ao concluir com 2 estrelas: fácil 100, normal 150, difícil 250, extremo 400, investigação 150; multiplicador 0,7 / 1 / 1,3 para 1 / 2 / 3 estrelas. Simulação (200 jogos, 720 dias, K 5e-5, FT 1,5): Base completa na mediana do dia 434; ~101 missões e 5,8 tratamentos por jogo (o jogador simulado é muito ativo). Sem dados de jogadores reais.
