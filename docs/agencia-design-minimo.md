# Radiation Hunters — A Agência (cola do jogo): design mínimo

Versão do documento: 0.4 · 28/10/2026 (v3.4.0 implementada; o ciclo de tempo e alertas do §14 SUBSTITUI as regras de aparição do §4 e a fase 2 do §7) · **PROPOSTA, exceto o que o §13 marca como implementado.** (v0.2 incorpora as respostas do Arnaldo de 28/10: Agência como grande construção com a Academia dentro, ordem livre após o treinamento, NPCs de treinamento na Base e NPCs públicos nos locais, mapa-múndi estilizado, equipamentos baseados em instrumentos reais.)
Legenda: [V] verificado no código ou em fonte citada · [C] calculado · [H] hipótese/proposta de design, sem base externa.
Inspiração declarada: ideias gerais de estrutura de jogos de base e alertas globais (OpenXcom é GPL-3.0 e depende de dados do X-COM original). Não se copia código, nome, arte, dado, texto nem interface.

## 1. Premissa

- A **Agência** é uma organização científica **fictícia**, financiada por um **consórcio coletivo e fictício de nações** [H]. Nome definitivo da Agência e do consórcio: em aberto (não usar nomes de órgãos reais; nenhuma sigla existente).
- A Agência é a organização **e** uma grande construção (a Base), como em jogos de base: a **Academia do Caçador** (missão 1, já existente [V]) é uma ala dessa construção, junto do **cofre** [V: `encontros/cofre-ui.js`], do hangar do jato, do centro de alertas, da oficina de equipamentos e da equipe. [decidido pelo Arnaldo]
- Nome da Agência e do consórcio: **em aberto** (ver §12 para candidatos).
- Fio da história: surgem no mundo novos pontos de radioatividade/radiação ionizante. A equipe viaja de **jato privado fictício** (sem marca nem modelo real), faz a investigação ou a descontaminação, volta e **entrega as fontes ao cofre**.
- Tom: educativo e sem violência. Nada de combate. Falhar nunca encerra o jogo (ver §6).

## 2. O que NÃO muda [V pelo código atual]

- As 8 missões (`data/missoes/01..08`) e as 4 investigações (`investigacao/index.js`) permanecem como estão; a Agência só **abre** cada uma e **recebe** o resultado.
- O cofre já é executado ao final de cada missão (`GameScene` chama `encontros.cofre()` [V]). A Agência dá a ele o enquadramento ("transporte seguro até a base"), sem reescrever a física.
- O menu atual continua como **Modo Atalho** (para professores irem direto a uma atividade). A Agência é o modo padrão para quem joga do zero [H].
- Física (Geiger, decaimento, blindagem, radônio) não é alterada pela Agência.

## 3. Estrutura de telas (todas em DOM/SVG, como o cofre, por acessibilidade e consistência) [H]

> Atualização v0.4: o hub deixou de ser uma grade de cartões. A tela central é o **mapa-múndi sempre à vista** (estilo Geoscape) e a **Base** é uma vista em corte; ver §14 e §15. O texto abaixo é o desenho inicial.

1. **Base (hub):** painel com as salas como cartões: Mapa-múndi (alertas), Treinamento (Academia + lições), Cofre (inventário de fontes guardadas), Equipamento (loja), Equipe (NPCs), Arquivo (investigações).
2. **Mapa-múndi de alertas:** mapa estilizado com pinos; cada pino tem tipo (missão grande / investigação), local, resumo e botão "Enviar equipe".
3. **Preparar a bolsa (novo):** antes de decolar, o jogador escolhe os instrumentos que leva (ver §6). Isso ensina a escolher o detector certo para cada tipo de radiação.
4. **Voo:** cena curta em SVG: linha do trajeto sobre o mapa, briefing em texto durante o voo, chegada. Botão **Pular viagem** sempre visível; respeita `prefers-reduced-motion` (já tratado nos gráficos do radônio [V]).
5. **Retorno:** relatório (resultado, créditos, fontes entregues) e volta ao hub.

Mapa-múndi [decidido]: desenho simplificado, estilo mapa tático, com contornos dos continentes e alguns países maiores, **desenhado à mão em SVG** (sem dados externos, sem dúvida de licença). Os pinos usam coordenadas aproximadas só para posicionar (ver §4); países pequenos (Geórgia, Espanha) ficam só como pino.

## 4. Alertas fixos: mapeamento nas missões e investigações existentes

Locais e datas vêm dos textos de história do jogo [V: `i18n/pt.js`, story1..8]. Coordenadas abaixo são **aproximadas, só para plotar o pino** [C, conferir]; Lia e Radium Girls têm local impreciso no jogo e ficam como pino regional.

| Alerta | Conteúdo existente | Local (texto do jogo) | Pino aproximado |
|---|---|---|---|
| Treinamento | Missão 1 · Academia do Caçador | Campus da base | base |
| A1 | Missão 2 · Ferro Velho de Goiânia | Goiânia, Brasil, set/1987 | −16,7; −49,3 |
| A2 | Missão 3 · Radium Girls | EUA, décadas 1910–1920 | regional (EUA) |
| A3 | Missão 4 · Exclusão de Chernobyl | Chernobyl, URSS, 26/04/1986 | 51,4; 30,1 |
| A4 | Missão 5 · Caso Lia | Lia, Geórgia, dez/2001 | regional (Cáucaso) |
| A5 | Missão 6 · Clínica Zaragoza | Zaragoza, Espanha, dez/1990 | 41,7; −0,9 |
| A6 | Missão 7 · Ferro Velho Mayapuri | Mayapuri, Nova Délhi, abr/2010 | 28,6; 77,1 |
| A7 | Missão 8 · Zona Fukushima | Fukushima Daiichi, Japão, 11/03/2011 | 37,4; 141,0 |
| I1 | Investigação · Hospital: de onde vem a imagem? | fictício | pino no país da base |
| I2 | Investigação · Medicina nuclear | fictício | idem |
| I3 | Investigação · Datação por traço de fissão (Laboratório de Cronologia) | laboratório parceiro | idem |
| I4 | Investigação · O ar da escola (radônio) | fictício | idem |

Nota de cuidado: as missões são baseadas em acidentes reais. O enquadramento "alerta novo" deve deixar claro que é **recriação educativa inspirada** no evento, sem sugerir que o evento acontece agora [H].

Regra de aparição: **substituída pelo §14** (os alertas não ficam todos disponíveis: surgem com o tempo, por sorteio, e vencem).

## 5. Equipe [decidido pelo Arnaldo; detalhes H]

- **Na Base:** NPCs de **treinamento** e de funcionamento da Base (instrutor, responsável pelo cofre, oficina de equipamentos, logística/piloto, direção). Proposta: **criar 4 a 5 retratos SVG originais novos** em `investigacao/retratos.js`, no mesmo estilo dos atuais [V: o arquivo já suporta novos nomes por paleta]. Nomes e papéis a combinar.
- **Nos locais:** os NPCs de cada missão ou investigação são **pessoas públicas do local** (por exemplo, Helena no hospital, Dora e equipe na escola) [V: já existem no código]. Eles recebem a equipe na chegada e fazem o briefing de campo.

## 6. Progressão e economia (fase 1, simples) [H]

- **Uma única moeda: créditos de pesquisa.** Ganhos ao concluir um alerta: 100/200/300 créditos para 1/2/3 estrelas na primeira vez; repetição rende 25 % [H, valores a calibrar].
- **Sem penalidade na fase 1.** O financiamento do consórcio é só exibido; não cai. Ninguém perde equipamento nem progresso. Nunca há "game over".
- **Pagar não pode ser requisito.** Toda missão deve continuar concluível com o kit básico (teste automático obrigatório). Os upgrades dão conforto e novas ferramentas de leitura, não são portão.
- **Equipamentos: escada baseada em instrumentos reais, simplificada.** O kit inicial é o Geiger do treinamento. O Geiger do jogo (sonda de janela fina: gama, beta e alfa só por contato [V: `fisica/geiger.js`]) corresponde ao tipo real "pancake GM probe", que detecta alfa, beta e gama, é o instrumento mais popular para contaminação e tem baixa eficiência para gama [V: Colorado CSP, guia de seleção de equipamento]. Cada item da loja resolve uma limitação real do anterior e tem uma limitação própria, para o jogador **escolher o instrumento para o problema**:

| Nível | Instrumento real | O que o jogo ganha | Limitação real que se mantém | Base |
|---|---|---|---|---|
| 0 (treino) | GM de janela fina ("pancake") | já existe | pouca eficiência gama; só alfa por contato | [V] Colorado CSP; `geiger.js` |
| 1 | Sonda de cintilação ZnS(Ag) para alfa | alfa com fundo muito baixo (mais sensível) | continua de contato; poeira e água dão leitura falsa; janela frágil | [V] Colorado CSP |
| 2 | Cintilador de NaI | mais eficiência para gama que o GM | depende muito da energia; menos exato | [V] Colorado CSP |
| 3 | Analisador multicanal portátil com NaI (identificador de gama por energia) | leitura da energia do gama, que ajuda na identificação do cofre | só gama; não identifica nêutron | [V] HPS (ATE FAQ) |
| 4 | Câmara de ionização | taxa de dose gama exata e alta, boa em campos intensos | menos sensível e mais lenta que o GM; cara | [V] Colorado CSP |
| 5 (futuro) | Medidor de nêutrons com contador proporcional BF3/He-3 e moderador | detectar nêutrons, rejeitando o gama | exige moderador volumoso; **o jogo ainda não tem fonte de nêutrons** | [V] HPS; a fonte nova é [H] |
| opcional | Dosímetro eletrônico pessoal com alarme de dose/taxa | mostra dose acumulada | mais frágil, usa bateria | [V] Colorado CSP; só se houver conceito de exposição |

- **Correção da minha sugestão anterior:** eu havia proposto uma sonda que "amplia a distância de detecção de alfa". Isso **não é fiel**: a fonte consultada diz que a sonda ZnS precisa ficar muito perto da superfície. O ganho correto é de **sensibilidade (fundo baixo)**, não de alcance.
- **Recomendação para a etapa 3 (começar com 3 itens):** ZnS (nível 1), NaI (nível 2) e câmara de ionização (nível 4). Cada um tem uso claro e limitação clara dentro da física que já existe. O analisador (nível 3) entra logo depois porque se liga à identificação do cofre. Nêutrons ficam para quando houver uma missão com fonte de nêutrons; isso é conteúdo novo e exige revisão física própria.
- **Fidelidade:** os números de jogo (fator de eficiência, fundo) continuam [H]; antes de implementar cada item, consultar a ficha técnica de um instrumento real (ex.: Ludlum, citado nas buscas, ainda **não lido**) e registrar o valor e a fonte em `docs/parametros-fisicos.json`, como no Geiger.
- Treinamento destrava alertas mais difíceis e dá um pequeno bônus de créditos na primeira conclusão de cada lição [H].

## 7. Alertas aleatórios

**Substituído pelo §14** (agora fazem parte da primeira versão, com as missões e investigações atuais como conteúdo). Alertas curtos gerados continuam como fase seguinte e precisam de revisão física.

## 8. Dados salvos [H]

> Implementado em forma menor na v3.4.0: ver §14 (campos reais: `iniciado, dia, fator, creditos, nota, proximoAlerta, ativos, usados, concluidos, expirados, historico`).

- Chave **nova** no localStorage (`radiationHuntersAgencia`), separada de `radiationHunters`, com campo `v:1` e uma função `sanear()` no mesmo estilo de `progresso.js` [V: padrão atual]. Saves antigos continuam válidos.
- Campos: `creditos`, `equipamentos[]`, `alertas{id:estado}`, `cofre[]` (fontes entregues: missão, isótopo, data de Agência), `diaAgencia`, `investigacoes[]`, `modo` (agência/atalho).
- Se o armazenamento estiver bloqueado, o jogo segue só em memória (padrão atual). Opcional: exportar/importar código de progresso.
- Testes obrigatórios: saneamento de lixo, migração de quem já tem progresso (missões desbloqueadas viram alertas disponíveis), bloqueio de armazenamento.

## 9. Acessibilidade e idiomas

PT/EN em todos os textos (`i18n`), foco por teclado em hub/mapa/voo, alvos de 44 px, regiões `role=status` para o retorno, sem informação só por cor, o mapa com **lista textual equivalente** dos alertas. Teste 360×640 e janelas baixas (como o teste 40).

## 10. Etapas, modelo e esforço recomendados

| Etapa | Entrega | Modelo / esforço |
|---|---|---|
| 1 | Este documento corrigido pelo Arnaldo | Opus · alto (decisões de arquitetura) |
| 2 | Hub, mapa de alertas e voo; sem economia; menu antigo como Modo Atalho; testes | Sonnet · médio |
| 3 | Créditos, loja (3 itens), save, treinamento destravando alertas; testes | Sonnet · alto |
| 4 | Textos de briefing PT/EN, nome definitivo, revisão crítica | Haiku (tradução mecânica) + Opus · alto (revisão) |
| 5 | Alertas aleatórios e financiamento variável | Opus · alto (design) e Sonnet (código) |

## 11. Riscos

- Escopo: é a maior mudança estrutural do projeto. Mitigação: camada por cima, nada existente é reescrito, Modo Atalho preservado.
- Regressão: o fluxo de desbloqueio e o final das missões é crítico; cobrir com testes antes de mudar.
- Narrativa: eventos reais recriados pedem cuidado de tom e rótulo "educativo/inspirado".
- Inspiração em jogos de terceiros: só ideias gerais; nada de nome, arte ou dado.
- Testes de leitor de tela e aparelho real continuam pendentes para todo o jogo.

## 12. Perguntas abertas para o Arnaldo

1. **Nome.** Candidatos [H, nenhum pesquisado em registro de marcas]: **Agência Limiar** (*Threshold Agency*; liga-se a limiares de dose), **Agência Isótopo** (genérico, provável conflito). Evitar "Half-Life": é título de jogo conhecido. Consórcio: "Consórcio das Nações para a Segurança Radiológica" (descritivo, fictício). Antes de adotar, busca no INPI, como já feito com o nome do jogo.
2. Confirma que após o treinamento **todos os alertas ficam abertos em ordem livre** (§4)?
3. Nomes e papéis dos 4 a 5 NPCs novos da Base (§5).
4. Aprova a escada de equipamentos (§6) e os 3 primeiros itens (ZnS, NaI, câmara de ionização)?
5. Quer dosímetro pessoal (exige criar um conceito de exposição acumulada)?
6. Mapa-múndi: **desenho original simplificado** com contornos de continentes e alguns países maiores [decidido]. Eu desenharia os contornos à mão em SVG (baixa resolução, estilo base tática), sem usar dados externos, o que evita dúvida de licença.

## 13. Pesquisa do microcontrole do X-COM (28/10/2026)

O Arnaldo apontou que a primeira versão (todos os alertas abertos) não se parecia com o jogo. Fontes consultadas (UFOpaedia, wiki da comunidade; consulta em 28/10/2026):
- **Tempo** [V, UFOpaedia "Geoscape (EU)"]: o relógio pode ser acelerado e o intervalo mínimo é de 5 segundos; eventos-chave (contato novo, pesquisa pronta, instalação pronta) **param o tempo**, e o jogador pode voltar à velocidade mínima. Gerenciar bases e dar ordens a aeronaves pausa o jogo.
- **Missões** [V, UFOpaedia "Alien Missions in Enemy Unknown (OpenXcom)"]: há um **calendário mensal** (nos primeiros meses uma missão aleatória + uma de terror por mês; depois duas aleatórias), as missões aleatórias saem de um **conjunto por região, sem repetir até o conjunto esvaziar**, cada missão é uma onda de naves com temporizadores (50 % a 150 % do valor da lista) e cada nave tem um tempo em solo antes de partir (de 1.000 a 9.000 minutos nas trajetórias descritas).
- **Verba e nota** [V, UFOpaedia "Country Funding"]: o conselho avalia **todo mês**; países felizes aumentam a verba de 5 % a 20 %, satisfeitos não mudam, infeliz diminui de 5 % a 20 %; a mudança aparece no início do mês e só afeta o pagamento seguinte; missões concluídas pesam muito mais que naves apenas voando; pacto com os alienígenas zera a verba do país (isso NÃO foi adotado aqui).
- **Não verificado:** a duração exata de locais de terror e a lista de velocidades do relógio (a página consultada não as traz); por isso os valores de jogo abaixo são escolhas próprias [H].

## 14. Ciclo de tempo, alertas e verba (decidido pelo Arnaldo em 28/10/2026 e implementado na v3.4.0)

Respostas do Arnaldo: relógio **pausado com botões de velocidade**; alerta vencido derruba a nota e a verba **até um piso**; alertas = **missões e investigações atuais sorteadas, com dificuldade crescente**.

Regras implementadas (`js/agencia/simulacao.js`; todos os valores [H], em `PARAMETROS`):
- **Relógio:** começa pausado; ⏸, ▶ (1 dia a cada 1,6 s), ▶▶ (1 dia a cada 0,45 s) e "+1 dia". **Para sozinho** quando surge um alerta, um alerta vence ou o mês fecha [V como mecânica]. Parado também durante o voo e dentro das missões. Só começa depois do treinamento.
- **Alertas:** primeiro alerta 2 dias depois do treinamento; depois um a cada 3 a 6 dias; **no máximo 3 ativos**. Sorteio **sem repetir até esgotar a lista elegível**, depois a lista é reposta [V como ideia]. Elegibilidade por mês de jogo: mês 1 (índice 0): missões 2, 3, 6 e a investigação do hospital; mês 2: + medicina nuclear e traço de fissão; mês 3: + missões 4, 5, 7 e radônio; mês 5: + missão 8.
- **Prazos:** fácil e normal 14 dias, difícil 12, extrema 10, investigação 21. Ao vencer, o alerta some ("caso contido localmente, mas a demora foi registrada") e a nota do mês cai 2.
- **Conclusão:** nota + estrelas (investigação conta 2); créditos de pesquisa = 50 por ponto. Sair de uma missão sem concluir mantém o alerta com o mesmo prazo.
- **Fim do mês (30 dias):** paga 1.000 créditos × verba (começa em 100 %); depois avalia a nota: ≥ 5 feliz (+5 a +20 pontos de verba), ≤ 0 infeliz (−5 a −20), senão sem mudança; piso 50 %, teto 150 %. **Sem game over.**
- **Salvamento:** chave própria `radiationHuntersAgencia` (v:1) com `sanear()`; sobrevive ao recarregar; não altera o save antigo.

## 15. Estado da implementação (v3.4.0, 28/10/2026)

Feito [V: testes 42 (12), 43 (10); suíte completa registrada no README]:
- **Novo jogo e Continuar entram na Agência**; "Missões avulsas (professor)" é o antigo menu, mantido só como atalho.
- **Geoscape:** mapa-múndi sempre à vista (estilo tático: grade, varredura de radar na Base, pinos que pulsam), relógio no topo, painel com Marta, alertas ativos com prazo, detalhe e registro. O voo do jato acontece **no próprio mapa**.
- **Base em corte** (como nos jogos de base): Hangar, Centro de comando, Academia, Cofre, Alojamento, Oficina (em obras), Biblioteca (abre o caderno de campo); corredor com elevador; antena e hangar na superfície. Cada sala tem seu painel e personagem.
- Cofre e treinamento ligados ao progresso já existente.

Pendente / a confirmar: nomes (o nome Agência Chronos / Chronos Agency foi escolhido pelo Arnaldo em 28/10/2026, sem busca de marca; Marta, Téo, Yara, Otávio são provisórios); calibragem dos números (frequência, prazos, notas) com testes de sala de aula; Base numa ilha fictícia; etapa de equipamentos (loja com créditos e preparar a bolsa); alertas curtos gerados.
