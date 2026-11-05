# Investigação 1 — Hospital: de onde vem a imagem? (protótipo 0.2-teste)

Pergunta central: uma radiografia deixa material radioativo no corpo?
Papel do jogador: visitante educativo acompanhado pela técnica Rita (fictícia), preparando um cartaz para o mural da escola.
Duração estimada: 10 a 15 min [H, a testar]. Hospital e personagens fictícios. Não orienta pacientes.

## Cenas
1. Recepção — registro da hipótese inicial (sem nota; inclui "ainda não sei").
2. Equipamento — esquema liga/desliga: de onde parte a radiação X? + qual observação sustenta.
3. Caminho — o que atravessa o corpo e chega ao detector? + qual parte do esquema mostra.
4. Comparação com um frasco (outro contexto) — por que não funcionam do mesmo jeito? + evidência.
5. Cartaz — marcar as frases corretas e deixar de fora as generalizações (retorno por cartão).
6. Mensagem do cartaz — escolher a frase central (sem generalizar, sem alarmismo, sem "dose zero").
7. Retomada — pergunta sobre cintilografia: o que dá para responder e o que é da equipe.
Ficha final: hipótese inicial, evidências, decisão, revisão, limite, fontes; exporta .json e resumo em texto.

## Fontes
- [V] CDC, What Causes Contamination versus Exposure (cdc.gov/radiation-emergencies/causes/index.html): raios X = exposição sem contaminação; contaminação = material radioativo sobre ou dentro da pessoa.
- [V] RadiologyInfo (ACR/RSNA), Safety in X-ray, interventional radiology and nuclear medicine procedures: CT e fluoroscopia entregam radiação de fora; ultrassom (som) e ressonância (campos magnéticos e pulsos de rádio) sem radiação ionizante; exames feitos quando necessários, ponderando benefício e risco; medicina nuclear usa material radioativo administrado.
- [V] RadiologyInfo, General Nuclear Medicine: radiofármaco administrado, acumula-se na região estudada, gama-câmara detecta a energia emitida; a câmara não emite radiação.
- [V] Equipamento energizado/em espera e geração de raios X são estados distintos (IAEA, Safety Reports Series 13, seção 4.2, p. 28). No esquema, o botão inicia/interrompe emissão; ver a revisão de fontes de 16/10/2026.
- [H] Cenas, personagens, redação das alternativas.

## Para os revisores (João Vitor e outros)
Modo normal: o jogador vê só a investigação, uma nota neutra de conteúdo fictício e as fontes públicas; não há campo de observação, selo nem rótulos [V]/[N]/[H].
Modo de revisão (Configurações > "Modo de revisão", desligado por padrão): aparecem o selo, o aviso de protótipo, os rótulos de verificação e o campo "Observação" em cada cena. As observações ficam salvas no navegador (chave `radiationHuntersRevisao`) e podem ser baixadas em arquivo; o registro exportado da ficha também as inclui.
Pontos em que a revisão especializada é mais necessária: (a) "pequena dose" na frase c4; (b) "não fica radioativa" em c2 (a fonte oficial aberta diz "exposto, mas não contaminado"); (c) terminologia de medicina nuclear na cena 7; (d) se a cena 4 não induz a ideia de que material radioativo é sempre perigoso.
Acesso: menu > Selecionar missão > cartão "Investigação 1", ou `?investigacao=hospital`.

## Revisão 0.2-teste (16/10/2026)
O arquivo de implementação está na versão 0.2-teste. Ao continuar pela primeira vez na recepção, a hipótese fica preservada; voltar permite consultá-la. A ficha exporta tentativas certas/erradas, evidências e cartões, retornos, versão do jogo e fontes. Conclusão guiada não comprova aprendizagem independente. A sessão não é restaurada ao recarregar: exportar antes de sair se for necessário guardar o percurso. Notas de revisão têm armazenamento próprio e persistem.

A pendência [N] sobre emissão do tubo foi refinada: equipamento energizado e emissão são estados distintos (IAEA, Safety Reports Series 13, seção 4.2, p. 28). No esquema, o botão inicia/interrompe a emissão. Ver conferência de fontes em `referencias-5c/busca/revisao-2026-10-16.md`.

## Campo na estrutura original (0.3-teste / jogo 2.2)
A investigação agora começa na GameScene do jogo e no mapa hospitalar existente. As sete cenas são conversas/observações nos ambientes; a leitura contínua permanece como alternativa pelo botão no campo ou `?investigacao=hospital&leitura=1`. A hipótese e o histórico usam o mesmo motor. Personagens e hospital permanecem fictícios, com revisão por Física Médica e teste com professores pendentes.
