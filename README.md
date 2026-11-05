# Radiation Hunters: The Isotope Chronicles

Um jogo educativo sobre radioatividade, feito no Grupo de Cronologia do IFGW/Unicamp. Alguém perdeu fontes radioativas e cabe a você encontrá-las, descobrir o que são e guardá-las em segurança, usando apenas o que um contador Geiger, a distância e as blindagens deixam concluir. Os cenários partem de acidentes reais, como Goiânia em 1987, Chernobyl e Fukushima. A ideia é tirar o mistério do assunto sem fingir que o risco não existe.

Para jogar, basta abrir https://radiationhunters.netlify.app no navegador, no computador ou no celular. O jogo está em português e em inglês.

## O que dá para fazer

As missões levam você a mapas grandes onde o Geiger é a principal ferramenta. O sinal cai com o quadrado da distância, cada material barra a radiação de um jeito, e a alfa mal atravessa o ar. Nenhuma fonte é "desconhecida": você vê os isótopos candidatos e vai eliminando opções pelas leituras. Ao longo do caminho aparecem perguntas de mito ou fato, sempre com fonte, que valem pontos e ajudam a entender o que acabou de acontecer.

Além das missões, há investigações curtas em lugares como um hospital, um serviço de medicina nuclear, o laboratório de datação por traços de fissão e uma escola com problema de radônio. Nelas não se usa texto livre: você segue pistas, mede, conversa com as pessoas e diz o que os dados sustentam.

Tudo isso é costurado pela Agência, uma base onde chegam os alertas, a equipe de cientistas é cuidada (cada um acumula dose e precisa descansar), o transporte é preparado e as fontes recolhidas ficam guardadas. Os casos chegam em forma de reportagem, e alguns chamados de cidadãos são só falso alarme: granito de cozinha, adubo, detector de fumaça antigo.

## Rodar no seu computador

O jogo usa módulos ES, então abrir o `index.html` direto do disco não funciona. Um servidor local resolve:

    cd current
    python3 -m http.server 8000

Depois é só abrir http://localhost:8000.

## Testes

    cd tests
    npm install
    npm test

São mais de setenta arquivos de teste, parte deles em lógica pura (Node) e parte controlando um Chromium sem janela. A suíte completa leva cerca de meia hora. Mais detalhes em `tests/README.md`.

## Como o repositório está organizado

A pasta `current/` é o jogo e é a única que o site publica. Em `tests/` ficam os testes, em `docs/` as notas de projeto, os parâmetros físicos, as referências e as revisões, e em `tools/` alguns utilitários de desenvolvimento. O arquivo `netlify.toml` diz ao Netlify para publicar só `current/`, sem etapa de build.

## Versões e publicação

O trabalho acontece na branch `desenvolvimento`. Quando uma versão é aprovada, ela entra na `main`, e cada alteração na `main` publica o site automaticamente. As versões ficam marcadas com tags no formato `vX.Y.Z`. O que mudou em cada uma está em [CHANGELOG.md](CHANGELOG.md), da mais recente para a mais antiga, e o passo a passo para quem for continuar o trabalho está em `COMO-CRIAR-O-REPOSITORIO.md`.

## Estado do projeto

O jogo ainda é uma versão de teste. O conteúdo científico ainda precisa de revisão por especialistas, e falta testar com professores e alunos. Os valores de física do jogo são simplificações pensadas para jogar, e os que ainda são hipóteses estão marcados como tal nos documentos de `docs/`. O jogo não substitui treinamento em proteção radiológica.

## Créditos e licenças

Autoria: Grupo de Cronologia, IFGW/Unicamp, Arnaldo Filho. Os gráficos são desenhados por código, o som e a música são sintetizados no navegador, e não há imagem ou áudio de terceiros. O jogo usa o Phaser 3 (licença MIT) e as fontes Orbitron, Inter e Press Start 2P (licença OFL); as cópias das licenças estão em `current/vendor/`. O código está sob licença MIT (arquivo `LICENSE`). Os textos, perguntas, notícias, mapas e demais conteúdos educacionais estão sob Creative Commons CC BY-NC-SA 4.0 (arquivo `LICENSE-CONTEUDO.md`): pode usar e adaptar em aula com crédito, sem fins comerciais e compartilhando igual. Os nomes "Radiation Hunters" e "Agência Chronos" não são licenciados.

## In English

Radiation Hunters is a browser-based educational game about radioactivity, built by the Chronology Group at IFGW/Unicamp. You track down lost radioactive sources using a Geiger counter, distance and shielding, in scenarios inspired by real accidents. It runs entirely in the browser, in Portuguese and English, at https://radiationhunters.netlify.app. To run it locally, serve the `current/` folder with any static server (for example `python3 -m http.server`); the test suite lives in `tests/`. This is a test version, still awaiting expert review, and it is not a substitute for radiation-protection training.
