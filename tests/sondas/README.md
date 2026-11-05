# Sondas de auditoria — Radiation Hunters (fase 0, jogo ainda não modificado)

Não são ainda a suíte de testes que "trava o comportamento": são sondas
exploratórias que geraram a lista de achados. Viram testes na etapa 1.

## Como rodar
    npm install
    RH_ROOT=/caminho/para/apps/radhunter node 01-fluxo-menus-localstorage.mjs
    RH_ROOT=... node 02-geiger-missoes-celular.mjs
    RH_ROOT=... node 03-identificacao-conclusao.mjs
    RH_ROOT=... node 04-varredura-alcance-por-tipo.mjs   # alcance de detecção por tipo de fonte

Requer um Chromium instalado; ajustar `executablePath` nos scripts (aqui:
/opt/pw-browsers/chromium-1194/chrome-linux/chrome). O Phaser 3.60.0 é servido
do npm por interceptação de rede (a CDN não é acessível de dentro do sandbox);
as fontes do Google são respondidas vazias. O jogo em si não é tocado.

(Sem RH_ROOT, usam ./apps/radhunter/current a partir da pasta onde rodam.)

## Limitações conhecidas das sondas
- Em 04 as fontes vizinhas somam sinal; só as fontes isoladas (missões 1 e 3) dão curvas limpas.
- Posicionam o jogador e chamam métodos da cena diretamente (atalho), em vez de
  andar até as fontes com o teclado.
- Em 02, cliques que ficaram bloqueados por modal aberto pela própria sonda são
  limitações do teste, não bugs do jogo.
