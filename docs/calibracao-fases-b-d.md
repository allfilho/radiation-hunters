# Radiation Hunters: roteiro de calibração em sala (v3.33.0, Fases B a D)

Todos os valores abaixo são **hipóteses de jogo [H]**: nenhum vem de medida de instrumento real nem de norma. O objetivo da sala é ver se o ritmo e a dificuldade fazem sentido para estudantes e anotar o que mudar. Para cada item, jogue, anote a coluna "Observado" e marque "Ajustar?".

## 1. Economia da pesquisa e da Oficina
Valor de partida: verba inicial 1500 créditos; contratar engenheiro 500; contratar cientista 250.

| Item | Custo | Dias | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|---|
| Pesquisa espectrometria gama | 2000 | 12 | Dá para pagar antes da 3ª missão? O prazo parece longo? | | |
| Pesquisa sonda alfa | 1200 | 8 | | | |
| Pesquisa câmara de ionização | 1600 | 10 | | | |
| Fabricar espectrômetro | 900 | 6 | O jogador compra mais de um? Vale o preço? | | |
| Fabricar sonda alfa | 600 | 4 | | | |
| Fabricar câmara de ionização | 800 | 5 | | | |

Sinais de desequilíbrio: jogador chega a 3 pesquisas concluídas sem nunca faltar dinheiro (barato demais); ou passa mais de 10 dias de jogo sem poder comprar nada (caro demais). Os prêmios das missões foram dobrados na v3.24; confira junto.

## 2. Erro de identificação (v3.29)
Valor: 0,3 mSv extra e −1 estrela (20 % do limite diário de 1,5 mSv). Observe: errar uma vez incomoda ou é ignorado? Com 2 erros o cientista já fica no amarelo? O espectrômetro reduz os erros entre Cs-137 e Co-60 de forma perceptível?

## 3. Instrumentos em campo
- **Câmara de ionização:** mostra mSv/h pelo modelo de dose do jogo (não é leitura de instrumento real). Pergunta: os alunos usam a leitura para decidir o tempo de permanência perto da fonte?
- **Sonda alfa (×3 na parte alfa, alcance de contato igual):** a fonte alfa fica fácil demais ou continua exigindo busca? O alcance de contato frustra?
- **Espectrômetro:** os alunos entendem as linhas em keV (Cs-137 661,7; Co-60 1173,2 e 1332,5) como "impressão digital"? Vale uma pergunta de fechamento na Academia.

## 4. Inventário individual (v3.33)
Cada cientista leva 1 item; vale o de quem está com o controle (teclas 7, 8, 9, 0). Observe: o jogador percebe que precisa trocar de cientista para usar outro instrumento? A tela do Alojamento é clara? Alguém esquece de entregar o item antes da missão?

## 5. Especialidades (v3.32)
Campo: dose de coleta ×0,5. Física: dose do erro de identificação ×0,5. Medicina: limite de retorno do tratamento +0,05 (0,75 → 0,80). Observe: a turma escolhe equipe pela especialidade ou ignora? Algum bônus é pequeno demais para notar? O de Medicina só aparece em tratamento: considere dar um efeito mais visível se ninguém o percebe.

## 6. Médico (v3.27)
Alta com dose relativa < 85 % em vez de 75 % com o Departamento médico. A diferença parece justa pelo custo (1100 créditos, 4 dias de obra)?

## 7. Nêutrons (v3.35, Fase E parte 1)
Valores de partida, todos **hipóteses de jogo [H]** (as fontes e os limites de cada afirmação estão em claude/radhunter-fase-e-neutrons.md):
| Item | Valor | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|
| Pesquisa do detector de nêutrons | 2400 créditos, 14 dias | Só aparece depois do espectrômetro e de coletar Am-241/Be (as missões chegam na v3.36). Parece caro frente ao espectrômetro (2000, 12 dias)? | | |
| Fabricar o detector | 1000 créditos, 7 dias | | | |
| Placa de polietileno (tecla 5) | 5 cm; Σ de remoção 0,20 por cm (corta cerca de 63 %) | A turma percebe que o chumbo (tecla 4) não resolve e o polietileno sim? | | |
| Chumbo, alumínio e acrílico para nêutrons | Σ de 0,005, 0,01 e 0,10 por cm | O acrílico (um pouco de hidrogênio) atenua um pouco e o alumínio quase nada: a ordem faz sentido para os alunos? | | |
| Fonte Am-241/Be | força 120 a 260 (cps de nêutron a 1 m); gama de 4,44 MeV com peso 0,75 | O Geiger mostra só o gama e engana: o aluno desconfia que falta algo? | | |
| Detector aparece só com o Geiger ligado (tecla G) | | Os alunos esquecem de ligar? | | |

**Chamados de poço (v3.36):** depois de concluir a pesquisa do espectrômetro, 30 % dos chamados rápidos novos [H] passam a ser de poço de petróleo, com 1 ou 2 fontes Am-241/Be e distratores Tc-99m, Sr-90 e Am-241. Observe: o primeiro chamado de poço é resolvível só com Geiger e placas (gama de energia muito alta, que o chumbo quase não atenua)? A frequência de 30 % cansa ou some?

Pendente de confirmação em fonte ou físico: o Geiger comum ser pouco sensível a nêutrons e o chumbo atenuar mal nêutrons rápidos. Não há dose de nêutrons no modelo (só o gama de 4,44 MeV entra na dose de campo).

## 8. Perícia de Laboratório (v3.37)
Todos os valores são **hipóteses de jogo [H]**. Economia de referência no jogo: verba mensal 1500 créditos; prêmios 180 (chamado), 400 a 1400 (missões), 600 (investigação).
| Item | Valor | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|
| Pesquisa de geocronologia | 1800 créditos, 10 dias; exige espectrômetro concluído | Parece um preço justo para "só conhecimento", sem equipamento novo? | | |
| Ato 1 (chamado com Na-24) | prêmio 500 créditos; 2 fontes; prazo de 10 dias (se vencer, volta a ser oferecido) | Os alunos separam Na-24 (gama de 1,37 e 2,75 MeV) de Co-60 (1,17 e 1,33 MeV) só com Geiger e placas, ou precisam do espectrômetro? | | |
| Ato 2 (datação, bônus) | prêmio 2500 créditos (até 3250 com 3 estrelas); prazo de 30 dias que se renova sem punição; só uma vez | O valor faz o aluno querer fazer a investigação inteira? Alto demais a ponto de distorcer a economia? | | |
| Lição N16 "O decaimento como relógio" | 4 perguntas | A lição ajuda a ligar meia-vida (campo) e idade (laboratório)? | | |
| Na-24 (isótopo de ativação) | meia-vida de 0,62329 d (IAEA-NDS, tabela D-1 [V]); gama efetivo 2,061 MeV [C]; força 260 a 520 | A atividade parece cair rápido demais ou devagar demais? (no jogo a fonte é constante durante a missão) | | |

Confirmado em 10/11/2026 [V]: as linhas gama do Na-24 (1368,626 e 2754,007 keV, emissão de 99,99 % e 99,87 % por decaimento) na tabela 3 de padrões da IAEA-NDS. Pendente de confirmação: a prática real de espera de amostras irradiadas nos laboratórios de traço de fissão não foi confirmada em fonte lida (o Arnaldo, que conhece o laboratório, pode ajustar os isótopos e o enredo).

## 9. Plano de dose (v3.38, Fase F)
Base real [V]: OECD/NEA, *Work Management* (NEA 6399, 2009): objetivo de dose fixado na preparação, comparado com a dose real depois; revisão pós-trabalho na Coreia quando a real passa a esperada em 25 %. Os números abaixo são **hipóteses de jogo [H]**. Referência: o robô de calibração recebe 0,5 a 2,4 mSv por saída como líder (`js/fisica/dose.js`).
| Item | Valor | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|
| Objetivos | 0,25 / 0,5 / 0,75 / 1,0 mSv por cientista, ou sem objetivo | Os alunos escolhem o objetivo olhando a margem de cada um? Alguém entende "margem"? | | |
| Bônus | +20 / +15 / +10 / +5 % do prêmio se todos ficarem dentro e a missão for concluída | O bônus faz o aluno revezar quem vai à frente, ou ele só escolhe 1,0 mSv para garantir? | | |
| Sugestão automática | o maior objetivo que cabe na menor margem | A sugestão tira a decisão do aluno? Melhor começar sem sugestão? | | |
| Alarme do dosímetro | toca uma vez por cientista ao atingir o objetivo; não obriga a sair | Os alunos trocam de cientista (teclas 7 a 0) depois do alarme? | | |
| Tempo até o objetivo | só com a câmara de ionização (usa a taxa medida: tempo = dose ÷ taxa) | O número ajuda a planejar ou distrai? | | |
| Revisão pós-trabalho | dose real > 1,25 × objetivo: equipe fica 1 dia a mais ocupada, sem bônus | A punição é perceptível? Leve demais, pesada demais? | | |
| Lição N17 "Planejar a dose" | 4 perguntas (fatos N17-F1, N17-F2, N17-C1, C2.3) | A conta "tempo = dose ÷ taxa" fica clara? | | |

## 10. Carreira, Mural e briefing (v3.39)
Inspiração: seguidores com níveis e pensamentos (Cult of the Lamb) e postos com memorial (X-COM); ver claude/radhunter-ideias-cult-of-the-lamb.md. Todos os valores são **hipóteses de jogo [H]**.
| Item | Valor | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|
| Postos | Iniciante 0, Especialista 3, Sênior 8, Referência 15 missões | Os alunos chegam à primeira promoção numa aula? Rápido ou lento demais? | | |
| Bônus de promoção | Agilidade +8 % de velocidade; Manuseio −30 % de dose na coleta; Precisão −50 % na dose do erro de identificação; Recuperação +5 pontos no limite de alta | A escolha parece importante? Algum bônus é óbvio demais? | | |
| Pensamentos | frase pelo estado (tratamento, caneta, dias seguidos de campo, novato, veterano) | Os alunos leem? Ajudam a decidir quem vai à frente? | | |
| Aposentadoria | Referência com 20 missões; vai ao Mural, libera cama, +1 de nota | Alguém se aposenta numa turma? Faz sentido o prêmio? | | |
| Briefing do dia | 1 pergunta por dia de jogo (nível 1 ou 2), +30 créditos no acerto | Os alunos respondem ou pulam? O valor muda o comportamento? | | |

## 11. Políticas, cartas de campo e propostas do cliente (v3.40)
Inspiração: doutrinas e cartas de tarô (Cult of the Lamb), escolha de equipamento antes da missão (X-COM). Todos os valores são **hipóteses de jogo [H]**.
| Item | Valor | Pergunta para a turma | Observado | Ajustar? |
|---|---|---|---|---|
| Marcos das políticas | 3, 8 e 15 alertas concluídos | A primeira política aparece na primeira aula? | | |
| Dose da equipe | Revezamento (bônus do plano ×1,5) × Produção (prêmio de campo ×1,1, sem bônus do plano) | Qual a turma escolhe? Ela entende que é uma escolha ALARA × dinheiro? | | |
| Informação | Mapa prévio (fontes gama marcadas, prêmio ×0,85) × Resposta rápida (+4 dias de prazo) | O mapa prévio deixa o jogo fácil demais? | | |
| Pessoal | Folga (alta 5 pontos antes, −1 chamado) × Plantão (+1 chamado, alta 5 pontos depois) | O efeito é perceptível? | | |
| Cartas de campo | 3 de 5 por alerta e dia: levantamento, pressa (+25 % de prêmio, meta −25 %), fôlego (metade do gasto), segunda chance (1º erro sem dose), patrocínio (+100) | Os alunos escolhem carta ou ignoram? Alguma é sempre a melhor? | | |
| Propostas do cliente | ~30 % dos alertas de campo; "só um cientista" +40 % ou "sem objetivo de dose" +30 %; −1 de nota se a caneta passar de 75 % (sozinho) ou alguém passar de 1 mSv (sem plano) | A turma aceita? A perda de nota pesa? Vira discussão sobre ética de proteção? | | |

## Como registrar
Para cada linha, anote o valor observado e, se for mudar, o valor proposto. Me envie a folha preenchida (foto ou texto): eu ajusto as constantes (`js/agencia/ciencia.js`, `js/agencia/equipe.js`, `js/fisica/dose.js`, `js/fisica/geiger.js`), rodo a suíte e entrego a versão. Enquanto isso, o rótulo [H] permanece no código e nos textos.

## Cuidados
- Não apresente estes valores aos alunos como dados reais; o jogo é de ensino e o aviso de "versão de teste" continua até revisão por especialista.
- A revisão de física (câmara, espectrômetro, falso alarme, hospital, Zaragoza) ainda é pendência separada.
