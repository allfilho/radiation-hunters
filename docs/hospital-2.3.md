# Hospital 2.3 — observações, caderno e mobiliário

Atualização local em 16/10/2026. Fonte funcional: `current/`. Conteúdo hospitalar: `0.4-teste`. Sem publicação.

## Comportamento implementado

A investigação continua como `HospitalScene extends GameScene`, com o mesmo gerador hospitalar 24 × 16, paredes, portas, câmera, personagem, controles, colisões, minimapa e indicador de caminho. Não há outro mapa ou controlador de movimento.

Na sala de radiografia e no painel de comparação, as alternativas só aparecem depois de registrar dois estados do modelo: emissão iniciada e emissão interrompida. Mudar o estado não registra automaticamente uma observação. O botão de registro guarda cada estado uma vez por cena. Os registros são descrições do modelo didático, não medidas experimentais de um aparelho real.

O botão **Caderno** abre os registros durante o percurso e permite retornar ao hospital. Ele diferencia hipótese inicial, observações do modelo, evidências selecionadas, decisões e explicação escrita antes do retorno. A ficha parcial informa que a investigação está em andamento. O JSON inclui `observacoesCampo`, `transferencia` e `mural`, mantendo o histórico de tentativas. O motor não declara conclusão apenas por acertos: requer os pares de observações e a explicação escrita, além dos registros das cenas.

As frases selecionadas para o mural aparecem na revisão da mensagem. O rascunho fica registrado mesmo quando precisa de correção; o mapa indica “Revisão necessária”, “Falta revisar a mensagem” ou “Mensagem revisada”. A fala final de Helena retoma a revisão quando houve tentativa inadequada. Revisitar a recepção depois da atividade do equipamento retoma a hipótese inicial preservada e pergunta como a comparação ajuda a explicá-la.

No caso de medicina nuclear, o jogador escreve sua explicação antes de visualizar as alternativas e seus retornos. A explicação é preservada e exportada sem correção automática. Esse registro permite análise pelo professor; não constitui uma medida validada de compreensão ou de transferência independente.

## Objetos por sala

| Sala | Mobiliário e elementos |
| --- | --- |
| Recepção | Balcão com tela/documentos, conjunto de assentos, cadeira de rodas |
| Radiografia | Conjunto esquemático de tubo e mesa, detector vertical, estação de imagens |
| Sala educativa | Painel de comparação e vitrine com modelo de fonte |
| Apoio | Bancada com pia, armário e leito de apoio |
| Produção do mural | Mural com folhas e mesa com papel e materiais de produção |
| Medicina nuclear | Gama-câmara esquemática e estação de imagens |

Os novos desenhos são gráficos do próprio Phaser e usam a mesma API de mobiliário e colisão. Os tipos antigos continuam disponíveis para as missões anteriores. Detector, vitrine e produção/revisão do cartaz têm marcadores visuais diferentes. Os equipamentos são representações simplificadas para reconhecimento do ambiente, sem comandos clínicos.

## Arquivos e verificação

- `current/js/render/mobiliario-hospital.js`: catálogo e desenho dos objetos novos.
- `current/js/mapa/gerador.js`: disposição dentro das salas existentes.
- `current/js/render/moveis.js`: encaminha apenas os tipos novos ao desenho hospitalar.
- `current/js/investigacao/hospital-campo.js`: marcadores, caderno, reações no mapa e textos de objetos.
- `current/js/investigacao/ui-investigacao.js`: registro de observações, mural, explicação e ficha.
- `current/js/investigacao/motor.js`: dados e requisitos de conclusão.
- `tests/28-hospital-evidencias.test.mjs`: dois estados obrigatórios, deduplicação, caderno parcial, móveis específicos e conclusão sem depender apenas de alternativas corretas.
- `tests/25-investigacao.test.mjs` e `tests/27-hospital-campo.test.mjs`: percursos atualizados em português/inglês, retorno ao mesmo mapa e explicação antes do retorno.

Inspeção manual no navegador: conversa com Helena, hipótese “Ainda não sei”, retorno ao mapa, dois estados registrados na radiografia, alternativas liberadas depois dos registros e retorno ao mesmo hospital. A inspeção do modelo foi feita pela opção Leitura; o teste automatizado do percurso de campo usa E em cada ponto, posicionando o robô perto dos pontos para encurtar o trajeto. Movimento por teclado é testado separadamente.

Capturas: `docs/conferencia-2026-10-16/hospital-mobiliario-2.3.png` e `hospital-observacoes-2.3.png`. Log completo: `docs/conferencia-2026-10-16/testes-2.3.log`.

Backup anterior às alterações: `archive/2026-10-16_pre-hospital-evidencias-mobiliario.tar.gz`. Nenhum arquivo morto anterior foi removido.

## Limites e trabalho posterior

O caderno e as consequências permanecem durante a sessão. A investigação ainda não restaura esse estado após recarregar; o registro pode ser exportado. O nome “observações” refere-se ao modelo simplificado e não a dados coletados em hospital.

As alternativas continuam acompanhadas de retornos e novas tentativas. A explicação escrita é um registro anterior a esses retornos, não uma avaliação automática de domínio. Ainda são necessários revisão de conteúdo por especialista e teste com professores para ajustar clareza, duração e objetivos pedagógicos.

Esta atualização não altera a identificação de radionuclídeos nem a pontuação da campanha original. O caso de identificação em que “dados insuficientes” deve ser a única conclusão correta e alterar a progressão da campanha permanece pendente, como registrado no relatório geral.

## Resultado da suíte completa

**255/255 testes passaram**, sem falhas, cancelamentos ou testes ignorados, em 446,1 s. Inclui PT/EN, celular, oito missões anteriores, Academia, percurso do hospital, pares de observações, explicação registrada antes do retorno, caderno parcial e reinicialização após recarregar. Exit code 0. Os testes automatizados não demonstram eficácia pedagógica.
