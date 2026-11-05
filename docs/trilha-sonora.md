# Trilha sonora: 12 faixas originais geradas por código

**O que é:** uma trilha por missão (1 a 8: caça de fontes; 9 a 12: investigações), sintetizada em tempo real pelo Web Audio, sem arquivos de áudio de terceiros. Cada faixa tem 16 compassos (duas seções, A e B) e repete em ciclo. Código: `current/js/musica/` (`partitura.js` = notação e compilação, `trilhas.js` = as 12 composições, `sequenciador.js` = som). Integração: `audio.js` (`startMusic(idDaMissão)`) chamada por `GameScene.create()`.

**Como ouvir cada faixa:** abra `current/trilhas.html` por um servidor local (módulos ES não funcionam por `file://`). Em `apps/radhunter/current`: `python3 -m http.server 8000` e acesse `http://localhost:8000/trilhas.html`. Também é possível ouvir no jogo, missão por missão. O volume da música fica em Configurações (0 = silêncio).

**Autoria e originalidade:** melodias, harmonias e ritmos foram escritos para este projeto; nada foi copiado de outra obra. A composição foi feita com assistência de IA (Claude), a decidir pelo autor como constar no registro (ver `docs/inventario-autoria-registro.md`).

| Missão | Faixa | Tom, andamento | Ideia |
|---|---|---|---|
| 1 | Treinamento | C maior, 118 bpm | clara e didática; segunda parte com batida |
| 2 | Goiânia | A menor, 72 | sóbria e contida; pulso só na segunda parte |
| 3 | Radium Girls | F maior, 126, swing | ragtime de época (anos 1920) |
| 4 | Chernobyl | D menor, 60 | lenta e sombria, notas longas e graves |
| 5 | Lia, Geórgia | E menor, 84 | fria e aberta, floresta no inverno |
| 6 | Zaragoza | G maior, 104, 3/4 | clínica e delicada, valsa lenta |
| 7 | Mayapuri | A menor, 136 | movimentada, cidade e ferro-velho |
| 8 | Fukushima | B menor, 66 | contida, ondas lentas |
| 9 | Hospital | F maior, 76 | calma e atenta, sem percussão |
| 10 | Medicina nuclear | A maior, 100 | tecnológica e serena, pulso leve |
| 11 | Laboratório de cronologia | G menor, 92 | cadenciada como um relógio |
| 12 | Escola | G maior, 112 | leve, quase cantiga de recreio |

**Decisão de tom:** nas missões baseadas em acidentes reais (2, 4, 5, 8) a música é sóbria, sem melodia "heroica", por respeito às vítimas.

**Como as faixas foram verificadas (e o que não foi):** testes automáticos (`tests/35-trilhas.test.mjs`) conferem que toda nota pertence à escala da faixa, que os acordes estão na escala, a tessitura, os 16 compassos, que as faixas são distintas, e, por renderização offline no Chromium, que nenhuma estoura, fica muda ou produz valores inválidos, e que o volume é equalizado entre elas (RMS ≈ 0,10 a 100% de volume). **Não foi verificado se a música soa boa:** isso depende do ouvido do autor. Ajustes de melodia, andamento ou instrumentos se fazem editando `trilhas.js` (cada compasso é uma linha de texto).

**Como editar uma melodia:** cada compasso tem 8 símbolos (6 em 3/4), um por colcheia: nota (`C5`, `F#4`, `Bb3`), `-` continua a nota, `.` é pausa. Os acordes de cada compasso geram baixo, harmonia e percussão pelos estilos escolhidos. O teste 35 aponta qualquer nota fora da escala.
