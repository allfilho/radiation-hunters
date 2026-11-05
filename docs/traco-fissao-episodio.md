# Episódio "Do cristal à idade: datação por traço de fissão" (v2.8, versão de teste 0.2)

## O que é
Reescrita do episódio "Arquivo do tempo" (Investigações → laboratório de cronologia): 15 cenas que ensinam o método do detector externo (EDM) em apatita, do cristal ao laudo. Conteúdo científico consolidado a partir da descrição do Arnaldo (apatita + mica muscovita + nêutrons térmicos em reator de pesquisa + ataque com HF) e da skill de termocronologia por traços de fissão.

## Roteiro (cena → sala)
1 pergunta (Lara, recepção) · 2 montar e polir apatitas (Lab 1) · 3 atacar a apatita (Lab 3) · 4 contar ρs (Lab 5 microscopia) · 5 conjunto de irradiação: apatita + mica + vidro dosímetro (Lab 1) · 6 reator de pesquisa / amostras irradiadas (Lab 4) · 7 atacar a mica com HF (Lab 3) · 8 tabela grão a grão (Lab 5) · 9 calibração ζ (Lab 5) · 10 idade, χ², pooled × central (Lab 5) · 11 conjunto de annealing 1 h/10 h/100 h/1000 h (Lab 2; não exige os outros labs) · 12 comprimentos de traço confinado (Lab 5) · 13 laudo (cartões) · 14 evento (Caio) · 15 limite (Lara).

## Equações e constantes (fonte)
- Idade: t = (1/λD)·ln[1 + λD·g·ζ·ρd·(ρs/ρi)], g = 0,5 (EDM). Skill, ref. 03; Hurford & Green 1983.
- λD = 1,55125×10⁻¹⁰ ano⁻¹ (Jaffey et al. 1971). ²³⁵U/²³⁸U = 1/137,88.
- ζ do padrão: ζ = [exp(λD·t) − 1]/(λD·g·ρd·ρs/ρi).
- Erro: Poisson √N; σ[t]/t ≈ √[(σζ/ζ)² + 1/Ns + 1/Ni + 1/Nd].
- χ²: P > 5% → pooled; P < 5% → idade central e dispersão (Galbraith & Laslett 1993; Galbraith 2005).
- Comprimentos: média e DP; interpretação qualitativa (longa e estreita ≈ resfriamento rápido; curta e larga ≈ residência prolongada ou reaquecimento). Só a modelagem tempo–temperatura testa histórias.

## Dados: TODOS fictícios e declarados na tela
- `dados-fissao.js`: 12 grãos do exemplo da skill (idade pooled 59,1 ± 5,7 Ma; central 60,3 ± 4,6; P(χ²) > 99,9%); 8 grãos sobredispersos fictícios (central 114,6 ± 26,5; dispersão ≈ 97%); padrão fictício construído para ζ ≈ 350; comprimentos longos (exemplo da skill) e curtos (fictício).
- Annealing: ilustração esquemática, sem números de modelo.

## Como conferir
`traco-fissao.js` é um porte em JS de ft_lib.py (skill). Teste `33-traco-fissao.test.mjs` compara com os valores calculados pelos scripts Python (pooled, χ², central, ζ, comprimentos).

## Limites / pendências
- O papel exato do Lab 4 e a origem do vidro dosímetro não foram detalhados pelo especialista; o jogo não afirma além do dito.
- Texto de segurança (HF, annealing longo, amostras do reator) é genérico, sem números; precisa de revisão do responsável de segurança.
- Revisão científica por especialista e teste em celular reais pendentes.
