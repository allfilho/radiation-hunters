# Testes do Radiation Hunters

Suíte em Node (`node:test`) + Chromium headless (`playwright-core`). Roda o jogo
de verdade, servido por HTTP local, com o Phaser 3.60.0 vindo do `node_modules`
(sem depender da CDN) e `Math.random` semeado, para o mapa e as leituras serem
reprodutíveis. **Os testes nunca alteram os arquivos do jogo.**

## Como rodar

    cd apps/radhunter/tests
    npm install
    npx playwright-core install chromium        # ou aponte um Chrome/Chromium já instalado:
    export CHROMIUM_PATH=/caminho/do/chromium   # opcional se o passo acima funcionou
    export RH_ROOT=../current                   # opcional; o padrão já é ../current
    npm test

Duração: cerca de 1 minuto. Para uma única suíte:
`node --test --test-reporter=spec 04-geiger.test.mjs`.
Suíte completa sem npm: `RH_ROOT=../current node --test --test-concurrency=1 --test-reporter=spec [0-9]*.test.mjs` (desde a etapa 5e-B o padrão é `[0-9]*`, por causa do arquivo 10).

## Dois tipos de teste

- **Caracterização** (nome sem "TODO"): fixa o que o jogo faz HOJE, inclusive
  limitações que serão mudadas de propósito (por exemplo, queda linear da gama,
  cone de 90 graus, sinal determinístico). Quando uma etapa mudar o comportamento
  de propósito, o teste é reescrito na mesma mudança, com o motivo no changelog.
  Nas etapas de reorganização (módulos) nenhum deles pode mudar.
- **TODO** (`{ todo: ... }`): descreve o comportamento DESEJADO, que ainda falha.
  O `node:test` mostra esses como "todo" e não derruba a execução. Quando o
  problema for corrigido, o teste passa a passar: aí se tira a marca `todo`.

Estado em 14/10/2026 (após as etapas 3b-3d): 80 testes, **todos passam, 0 todo, 0 falhas.** Duração: cerca de 3 minutos
(o jogo roda em software sem GPU; o relógio do Phaser anda mais devagar que o de parede).
Em 13/10/2026 (etapa 1) eram 33 passando e 18 `todo`; os `todo` viraram testes normais quando o bug foi corrigido.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `01-dados.test.mjs` | i18n (chaves iguais entre idiomas, chaves do HTML), isótopos, blindagens, missões, cabeçalho de autoria |
| `02-fluxo.test.mjs` | menus, 8 missões, pausa, reinício, sair, identificação, conclusão, próxima missão, progresso |
| `03-robustez.test.mjs` | localStorage corrompido, ausente, com tipos errados |
| `04-geiger.test.mjs` | Geiger na cena: modelo da cena = modelo puro, Poisson, alfa por contato, blindagem, cone, parede, janela de 3 s |
| `05-geiger-modelo.test.mjs` | `js/fisica/geiger.js` puro em Node: μ/ρ NIST, 1/d², camadas, alcance beta, alfa por contato, Poisson, janela, meias-vidas |
| `06-jogabilidade.test.mjs` | robô conclui as 8 missões no jogo real; movimento por teclado, toque e pausa |
| `helpers/navegador.mjs` | servidor, navegador, página com Phaser offline e semente, utilitários |
| `helpers/geiger.mjs` | medidor isolado (marca as outras fontes como achadas e mede uma só) |
| `ferramentas/comparar-versoes.mjs` | teste diferencial entre duas pastas do jogo (mesma semente: mapa, móveis, fontes, leituras; pixels informativos) |
| `ferramentas/pixels-missao.mjs` | distribuição dos estados de pixel de uma missão em N execuções |
| `simulacao/` | robô-jogador e extração dos mapas reais; compara o Geiger atual e o proposto (ver `simulacao/README.md`) |
| `sondas/` | sondas exploratórias da auditoria inicial (anteriores a esta suíte) |

## Falhas conhecidas (todo)

Nenhuma no momento. (Histórico: ver changelog do README principal.)

## Histórico dos antigos todo (já corrigidos)

Idiomas: títulos das blindagens em pt, `<html lang>`, mensagem de conclusão em pt.
Fluxo: Continue, salvamento ao concluir, Esc com a identificação aberta, identificar fonte em móvel 3x3 (missões 4 e 8), destruir
o canvas ao sair, três configurações sem efeito, `timeLimit`, controles de toque.
Robustez: `unlockedMissions` com tipo errado, `localStorage` bloqueado, configurações
fora de faixa. Física: sinal Poisson, 1/d², gama fora do cone, tabela de meias-vidas.

## Depois da etapa 2 (módulos)

A suíte não foi alterada pela divisão em módulos. `main.js` expõe como globais os nomes que os
testes leem (`GameState`, `ui`, `CONFIG`, `ISOTOPES`, `MISSIONS`, ...). Para comparar duas versões:
`node ferramentas/comparar-versoes.mjs <pastaA> <pastaB>`.

## Limites desta suíte (para quem for continuar)

- A medição do Geiger usa um atalho: o jogador é posicionado por código e a leitura
  vem de `GameScene.measureRadiation()`, a chamada real do jogo. Não anda com o teclado.
- O teste de `timeLimit` é por inspeção do código-fonte (`toString()`), um indício
  fraco; deve ser trocado por um teste de comportamento quando o cronômetro existir.
- `scene.resume()` e `scene.restart()` do Phaser são assíncronos. Um Esc enviado no
  mesmo quadro é descartado. Os testes esperam a cena ficar ativa (`aguardarCenaAtiva`).
  Isso é limitação do teste, não bug do jogo.
- Não use `assert.equal` direto sobre um `ElementHandle` do Playwright: formatar a
  mensagem de erro trava o processo. Compare um booleano.
- Os testes estatísticos usam a semente fixa 12345; as tolerâncias foram escolhidas
  com folga em relação ao desvio esperado.

## Verificação de que os testes pegam mudanças (mutação manual, 13/10/2026)

Em uma cópia do jogo (fora da pasta do projeto), cinco alterações pequenas foram
introduzidas e todas foram detectadas: coeficiente da queda da gama (0,10 -> 0,12),
transmissão do chumbo (0,10 -> 0,15), pontos por acerto (100 -> 90), ângulo do cone
(90 -> 120 graus) e leitura do localStorage.

## Conferência de 16/10/2026

Os testes 07/08 também aceitam RH_ROOT ausente. A consolidação 2.1.1 passou 249 testes; log em `../docs/conferencia-2026-10-16/testes-consolidacao-2.1.1.log`.

- `23-modo-professor`: parâmetros, versão, modo estudo e integridade do Phaser local.
- `24-dados-insuficientes`: registros de comparação e saída sem conclusão no mapa.
- `25-investigacao`: motor/conteúdo PT/EN e percurso da alternativa de leitura, incluindo o conteúdo do JSON baixado.
- `26-revisao-relatorio`: hipótese preservada, histórico, notas corrompidas, parâmetros e distribuição local sem rede externa.
- `27-hospital-campo`: reutilização da GameScene e mapa hospitalar, movimento, NPCs/objetos, percurso até ficha, limpeza ao sair e foco/tela pequena.

No percurso por NPCs, o robô é posicionado junto aos pontos de interação; não se apresenta esse atalho como travessia manual de todas as salas. Há teste separado de movimentação por teclado e verificações dos pontos alcançáveis. Resultados da 2.2 no relatório de conferência.

## Rodar a suíte inteira (v3.29)

`bash rodar-testes.sh` roda tudo em primeiro plano, 2 arquivos por vez, com orçamento de 540 s por chamada. Se faltar teste, rode de novo e ele continua; arquivos que falharam são refeitos. Se qualquer arquivo de `current/` ou `tests/` mudar, os resultados antigos são descartados sozinhos. Opções: nomes ou números de arquivos (`72 73`), `-j N`, `--orcamento 0`, `--reset`. Resultados em `../logs/`. No GitHub, o fluxo `.github/workflows/testes.yml` roda a suíte a cada push em `desenvolvimento`. Tempo medido: cerca de 20 minutos para os 76 arquivos com 2 em paralelo.
