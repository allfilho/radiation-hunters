# Laboratório de pesquisa: banco de problemas sorteados (v2.9, versão de teste 0.1)

## Ideia (pedido do Arnaldo)
Uma lista de problemas aleatórios a resolver com o laboratório de pesquisa; cada problema usa só um conjunto de salas, e o Caderno lista as etapas necessárias. O Lab 2 (conjuntos de annealing) pode ser usado sem passar pelos outros laboratórios.

## Como funciona
- Menu → Investigações → cartão "Laboratório de pesquisa": botão "Sortear um problema" ou escolha de um dos quatro.
- Os problemas reaproveitam as cenas do "Arquivo do tempo" (`arquivo-tempo.js`); cada um é um subconjunto, mais cenas próprias (`problemas-pesquisa.js`).
- Os números vêm de uma semente (`sorteio-fissao.js`): mesma semente, mesmo problema. A semente aparece no Caderno e na ficha (`sorteio`). Endereço de teste: `?investigacao=pesquisa-datar&semente=3`.
- Caderno (botão no mapa): problema, etapas com ○/✓, hipótese, observações, conclusão.

## Os quatro problemas
| Problema | Salas | Cenas |
|---|---|---|
| Datar uma apatita | Lab 1, 3, 4, 5 | pergunta, montagem, ataque, contagem, conjunto, reator, ataque da mica (HF), tabela, ζ, idade (χ²), limite |
| Montar um conjunto de annealing | Lab 2, 3, 5 | pergunta, aquecimentos 1/10/100/1000 h, ataque, comprimentos reduzidos r = l/l0, limite |
| Calibrar o ζ com um padrão | Lab 1, 4, 5 | pergunta, conjunto, reator, ζ do padrão, verificação com segundo padrão, limite |
| Datar e interpretar a história térmica | Lab 1, 3, 4, 5 | cadeia da idade + comprimentos de traço + limite |

Nota: no annealing incluí o Lab 3 porque o ataque químico é o que revela os traços antes da medida (o Lab 2 só aquece).

## O que é sorteado e como a coerência é garantida (todos os valores FICTÍCIOS)
- ρd (0,9–1,5×10⁶), padrão de idade 28,2 Ma (didático) e **ζ calculado do padrão** (ζ = [exp(λD·t) − 1]/(λD·g·ρd·ρs/ρi)), como numa calibração real.
- Idade verdadeira fictícia (30–150 Ma); por grão, Ni sorteado e Ns ~ Poisson(Ni·R). Amostra homogênea (P(χ²) > 20%) ou sobredispersa (grãos com R·exp(0,7·z), P(χ²) < 0,1%).
- História térmica fictícia: resfriamento rápido (N(14,5; 0,7) µm), residência prolongada (N(12,3; 1,3)) ou reaquecimento (duas populações). Só a separação "longa/estreita × curta/larga/bimodal" é usada como resposta, conforme a skill; distinguir prolongada de reaquecimento fica para a modelagem tempo–temperatura.
- Conjunto de annealing: r decresce com o tempo numa temperatura fixa fictícia; sem valores de modelo calibrados.
- Segundo padrão para verificar ζ: critério didático de cerca de 2σ (marcado como didático no texto).

## Respostas certas calculadas
Idade a reportar (pooled se P(χ²) > 5%, central caso contrário), interpretação dos comprimentos e compatibilidade do segundo padrão são calculadas dos dados; o retorno cita os números da amostra. Testado em 60 sementes (teste 34).

## Pendências
- Revisão científica dos textos novos (perguntas e limites de annealing e ζ) pelo Grupo de Cronologia.
- Decisão do autor sobre mais problemas (por exemplo, radônio com CR-39) e sobre a passagem de "dados fictícios" para dados reais quando houver.
