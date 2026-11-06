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

## Como registrar
Para cada linha, anote o valor observado e, se for mudar, o valor proposto. Me envie a folha preenchida (foto ou texto): eu ajusto as constantes (`js/agencia/ciencia.js`, `js/agencia/equipe.js`, `js/fisica/dose.js`, `js/fisica/geiger.js`), rodo a suíte e entrego a versão. Enquanto isso, o rótulo [H] permanece no código e nos textos.

## Cuidados
- Não apresente estes valores aos alunos como dados reais; o jogo é de ensino e o aviso de "versão de teste" continua até revisão por especialista.
- A revisão de física (câmara, espectrômetro, falso alarme, hospital, Zaragoza) ainda é pendência separada.
