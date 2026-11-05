# Conferência da implementação de Radiation Hunters

Data: 16/10/2026. Versão revista: **2.2**, investigação hospitalar **0.3-teste**. A consolidação anterior (2.1.1) foi preservada antes da integração hospitalar.

## Parecer

A implementação incorpora boa parte da consolidação recomendada e já tem um episódio hospitalar funcional, com exploração na cena original do jogo, comparação de mecanismos, escolhas de evidência e retomada em medicina nuclear. Há também a alternativa de leitura. **Não implementa todo o relatório**: a campanha no mapa ainda mantém identificação por candidatos, pontuação agregada e conclusão guiada da Academia; as outras expansões continuam propostas. Concluir a investigação não comprova aprendizagem independente.

Referência de comparação: `/Volumes/EXBOM/Aulas/Oficina de Fisica 2026/Apresentacao_Arnaldo/current/analise_radiation_hunters.md`, especialmente seções 5–7, 9 e 17–22. As propostas de futuras missões não foram tratadas como autorização para desenvolver toda a carteira nesta revisão.

## Matriz de atendimento

| Item do relatório | Situação após esta revisão | Evidência e limite |
|---|---|---|
| P0.1 Bq, Gy e Sv | Corrigido nos trechos prioritários | N05 distingue grandezas; N11 e questões N11-1/3/4 usam dose absorvida e condições de exposição. Eliminadas conversão automática Gy/Sv e dedução clínica a partir de mSv isolados. Não é auditoria clínica de toda a campanha. |
| P0.2 Exposição e contaminação | Implementado, com ajuste nesta revisão | N06 inclui exposição externa/interna, presença indesejada e diferença da administração controlada de radiofármacos; hospital contrasta radiografia/medicina nuclear. |
| P0.3 Limite público e pacientes | Implementado e referência atualizada | N12 e perguntas N12-3/4: ANSN 3.01, Resolução CNEN 344/25, condições de exposição planejada e exclusão de exposição médica de pacientes. Fontes conferidas nos arts. 51–54. |
| P0.4 Brilho verde | Implementado anteriormente | `radiumHint` não identifica Ra-226 pela cor; mantém referência ao fósforo da tinta sem usar verde como pista de identificação. Conferência textual local, sem nova revisão de todas as fontes históricas. |
| P0.5 Dados insuficientes | **Parcial** | Botão sem custo no mapa e aviso sobre identificação por candidatos; questão N10-7 exige reconhecer insuficiência para identificar radionuclídeo. A identificação definitiva no mapa continua aceita sem comparação; não há caso de mapa cuja única conclusão válida seja insuficiência. |
| Descrição da Academia | Implementado anteriormente | Menu/história: oito salas, cinco fontes nas salas 4–8; corresponde aos dados. |
| Explicação e evidência | Implementado no hospital; parcial na campanha | Três cenas hospitalares pedem justificativa por evidência; cartões têm retorno próprio. No mapa, presença de leituras é marcada por booleanos globais, sem registro numérico vinculado à mesma posição/fonte. |
| Preservação de resposta inicial/revisões | Corrigido para o hospital | Ao continuar na recepção, hipótese fica preservada. JSON inclui tentativas certas/erradas, textos, retornos e cartões selecionados, com ordem de resposta. Não registra tempo de leitura nem demonstra consulta efetiva ao material. |
| Confiança separada de compreensão | **Parcial** | Motor conserva confiança e pesos como regras; caderno passa a chamar índice de “Progresso nos encontros”. Pesos não foram recalibrados nem validados. Ainda não há painel pedagógico que reúna dimensões separadas para toda a campanha. |
| Modo sem peso de tempo | Implementado anteriormente | `?estudo=1`; tempo não entra no aproveitamento. A partida ainda tem tempo exibido e regras de pontuação; não é um instrumento de avaliação escolar. |
| Transferência após missão | Implementado no hospital; pendente nas oito missões de mapa | Retomada sobre cintilografia exige reconhecer outro mecanismo e consultar equipe; é escolha guiada, com feedback e novas tentativas. Falta resposta independente/atividade posterior para avaliar transferência. |
| Professor: acesso direto | **Parcial** | `?missao=N`, estudo e `?investigacao=hospital`; não há seleção direta de qualquer cena hospitalar nem painel completo com objetivos e limitações por cena. |
| Alternativa à navegação | Implementado no hospital | Alternativa de leitura no mesmo episódio, sem exigir navegação. O modo padrão agora usa o mapa, personagem e controles do jogo, com conversas DOM contextuais; não substitui todas as decisões da campanha. |
| Acessibilidade | Melhorias locais; validação geral pendente | Cartão hospitalar acionável por teclado, foco no título de nova cena, descrição do estado/caminho no SVG. Testes em viewport pequeno; sem teste com leitor de tela humano, celular físico ou conformidade integral. |
| Exportação local | Implementada no hospital e ampliada nesta revisão | JSON com versão do jogo/conteúdo, idioma, hipótese, evidências, decisões, limite, fontes e histórico; sem conta ou envio. Observações de revisão opt-in, saneadas. Campanha tradicional ainda sem exportação equivalente. |
| Continuidade técnica | **Parcial** | Phaser local e versão visível. Fontes tipográficas ainda externas, com substitutas CSS. Não há pacote instalável com service worker/cache nem restauração da investigação ao recarregar: a sessão recomeça e isso deve ser informado ao professor. |
| Hospital de radiografia | Protótipo implementado | Sete interações ligadas a NPCs/objetos nas salas existentes, com esquema e ficha; alternativa de leitura preservada. Revisão profissional e piloto continuam necessários; estimativa 10–15 minutos não foi medida com turma. |
| Demais expansões | Propostas futuras | Plantão de Física Médica, missão específica de medicina nuclear, braquiterapia, datação, radônio, alimentos e energia não são novas missões disponíveis. A cena final de cintilografia não equivale a implementar a missão de medicina nuclear. |
| Material de professor e avaliação | Pendente | Não localizado material de uma página completo, avaliação com professores ou evidência de eficácia. A presença de testes de software não resolve esses itens. |

Os rótulos técnicos [V]/[N]/[H] continuam visíveis nas fontes das lições da Academia, como registrado no README anterior; o modo de revisão opt-in controla a investigação hospitalar. A separação desses rótulos em toda a Academia ainda não foi implementada.

## Problemas corrigidos

1. **Alto — hipótese inicial sobrescrita ao voltar.** `investigacao/ui-investigacao.js` e `motor.js`: depois de sair da recepção, ela é preservada e pode ser consultada sem alteração. Antes de continuar pela primeira vez, a pessoa ainda pode trocar sua seleção.
2. **Alto — exportação apagava conteúdo das tentativas.** O motor guardava apenas a resposta correta e contagem de tentativas. Agora exporta cada resposta avaliada, seu retorno e seleções dos cartões, além de versão e fontes. O registro continua sem identificação pessoal obrigatória.
3. **Alto — generalização Gy/Sv e dedução clínica.** N11 e questões ligadas foram reescritas. A ficha não fornece limiar clínico universal. Fontes e locais estão em `referencias-5c/busca/revisao-2026-10-16.md`.
4. **Médio — referência regulatória desatualizada.** Conferida a edição vinculada no índice oficial; atualizadas referências e condições de aplicação de N12 e questões. A norma não foi apresentada como regulação de instalações de radiodiagnóstico médico, excluídas de seu controle pelo art. 5.
5. **Médio — “nem todo exame usa radiação”.** Corrigido para “radiação ionizante”, preservando a explicação de ressonância magnética. Substituído “nada fica na paciente” por “não a torna radioativa”. Acrescentada distinção entre aparelho energizado e emissão no esquema.
6. **Médio — ficha afirmava revisão antes de concluir.** Sessões incompletas agora recebem `em-andamento`; ficha inclui `concluida`. A redação compara respostas registradas sem afirmar aprendizagem demonstrada.
7. **Médio — notas de revisão corrompidas.** Leitura aceita apenas textos de cenas existentes; um número ou objeto não chega ao campo nem ao `.trim()` da ficha.
8. **Médio — acesso ao novo episódio dependia do mouse.** Cartão hospitalar ganhou papel de botão e ativação por Enter/Espaço. Novas cenas recebem foco no título; SVG inclui estado e caminho da emissão em texto acessível.
9. **Baixo — parâmetro parcial aceito como missão.** `?missao=3abc`/`3.5` não abre mais a missão 3. Apenas inteiro completo no intervalo permitido.
10. **Verificação — comando documentado falhava sem RH_ROOT.** Testes 07 e 08 agora usam o diretório padrão quando a variável não está definida. As asserções científicas e de comportamento foram preservadas; atualizadas apenas expectativas que descreviam comportamento corrigido.

## Verificação e reprodução

Consolidação 2.1.1: **249/249 testes passaram**, sem falhas, cancelamentos ou testes ignorados; duração de 442,2 s. Log em `conferencia-2026-10-16/testes-consolidacao-2.1.1.log`. A adição posterior do mapa hospitalar tem verificação própria, descrita ao final. A execução inicial não é uma linha de base imutável: ocorreu durante a revisão. Ela revelou falhas de configuração de RH_ROOT nos testes 07/08; seus resultados não são usados como prova da versão entregue.

Comandos (macOS; Node e Chromium instalados):

```sh
cd /Volumes/EXBOM/LabVirtualGC/apps/radhunter
npm --prefix tests ci --ignore-scripts
CHROMIUM_PATH='/Users/allfilho/Library/Caches/ms-playwright/chromium-1228/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' npm --prefix tests test
```

O caminho do Chromium é específico desta máquina; `tests/README.md` descreve a alternativa de instalação. `RH_ROOT` é opcional para o comando acima. Runtime usado: Node 25.9.0; playwright-core 1.56.1; Phaser 3.60.0. Não foi realizada atualização desses componentes.

Teste manual na interface local: recepção → escolha inicial → equipamento → voltar; hipótese preservada e seleção desabilitada. Capturas reais em `conferencia-2026-10-16/hipotese-preservada.png` (EN) e `hipotese-preservada-pt.png` (PT). Os testes automatizados percorrem as sete cenas em PT e EN, erros e revisões, exportação JSON efetiva e viewport de 360×640. Navegação física completa sem atalhos nas oito missões não foi repetida manualmente: a suíte usa robôs e posicionamentos programáticos, como documentado em seus auxiliares.

Uma sessão antiga do navegador interno não reinicializou corretamente ao recarregar durante as alterações. A mesma versão abriu em uma origem local nova; a suíte usa contextos novos. Não se atribui causa definitiva a esse episódio, nem se afirma validação de atualização de cache em produção.

## Preservação e limites

A pasta não é repositório Git. Cópia anterior às alterações: `archive/2026-10-16_pre-conferencia-codex-134533.tar.gz`, com current, testes, README e o roteiro hospitalar anterior, sem node_modules. Nenhum arquivo anterior do arquivo morto foi apagado; isso excede a meta de cinco arquivos, preservando os registros existentes. Não houve publicação nem mudança nos slides.

Prioridade seguinte: revisar o episódio hospitalar com João Vitor; testar leitura e explicações com professores; decidir se a próxima alteração será evidência comparável por fonte no mapa ou tarefa independente ao final. A carteira inteira de novas missões não precisa estar pronta para demonstrar o episódio na oficina.

## Integração hospitalar na estrutura existente (2.2)

Requisito incorporado: novos mobiliários, texturas e NPCs devem pertencer à mesma estrutura do jogo. A alternativa com mapa/controle próprios foi retirada do código ativo e preservada apenas em `archive/2026-10-16_mapa-paralelo-descartado.tar.gz`.

Implementação corrente:

- `HospitalScene` em `js/investigacao/hospital-campo.js` especializa `GameScene`. Herda diretamente `drawMap`, `createPlayer`, `handleMovement`, `isBlocked`, `ajustarCamera` e `setupInput`. Não há outro motor de navegação, planta ou câmera.
- `MapGenerator` usa a planta hospitalar existente de 24×16 tiles e a API `tryPlace` de mobiliário. Para a missão em funcionamento, retira zonas de acidente e organiza os objetos nas mesmas salas. A pintura usa a rotina existente com acabamento conservado; as missões antigas conservam seus parâmetros.
- NPCs Rita/Helena têm texturas próprias em `render/npcs-hospital.js`, nas proporções e no sistema de texturas existente. O avatar do jogador permanece o original. Helena aparece na recepção e depois na área de medicina nuclear.
- O jogador se aproxima e usa E/Q, o botão de interação ou toca/clica no ponto próximo. A conversa pausa movimento e teclado do campo; ao concluir, volta ao mesmo mapa com o próximo objetivo. Minimapa e indicador de caminho usam a infraestrutura existente.
- As sete tarefas preservam o motor, feedback, hipótese inicial e histórico. O hospital não é tarefa de coleta de fontes nem atribui pontuação clínica. O HUD mantém sua estrutura e apresenta observações concluídas, ocultando mostradores sem função no episódio.
- Alternativa de leitura: botão “Leitura” no campo ou `?investigacao=hospital&leitura=1`. Não é a experiência padrão. O botão “Voltar ao hospital” conserva o percurso e a posição enquanto a sessão está aberta.

A interação continua sendo uma representação didática. O esquema de emissão não opera um exame. O episódio e sua duração precisam de revisão profissional e teste com professores, sem inferir eficácia a partir de testes de software.

Verificação específica: `tests/27-hospital-campo.test.mjs` compara os métodos herdados, verifica movimento por teclado, pontos alcançáveis, percurso das sete tarefas, histórico/ficha, saída para missão comum, foco/modal em viewport de celular. O robô do percurso posiciona o jogador junto aos pontos reais; o movimento e a colisão são cobertos separadamente, e a inspeção manual percorreu a aproximação de Helena sem teleporte.

Captura manual corrente: `conferencia-2026-10-16/hospital-mesma-estrutura-pt.png`. As capturas anteriores de hipótese preservada documentam a etapa de consolidação, não o aspecto atual do campo.

Resultado da suíte completa da versão 2.2: **252/252 testes passaram**, 0 falhas, 0 cancelados, 0 ignorados; duração de **447,4 s**. Log em `conferencia-2026-10-16/testes-2.2.log`. Inclui os testes 01–27. A contagem é de verificações de software, não de validação científica ou com professores. Sem publicação.


## Atualização posterior: hospital 2.3

O hospital recebeu registro obrigatório de observações do modelo, caderno durante o percurso, explicação escrita antes dos retornos, reações ao histórico e mobiliário próprio por sala. Escopo, arquivos e limites estão em [hospital-2.3.md](hospital-2.3.md). O caso de identificação com dados insuficientes na campanha original continua pendente; esta atualização se concentra na investigação hospitalar.
