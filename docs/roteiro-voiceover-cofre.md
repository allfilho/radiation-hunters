# Roteiro de teste com leitor de tela (VoiceOver, Safari): cofre e caderno

**Quem executa:** Arnaldo, no Mac. **Duração:** cerca de 15 minutos. **Origem:** pendência (c) de `docs/cofre-5e-revisao.md`, confirmada no plano do Opus de 27/10/2026. Nenhum teste automático substitui este: até agora o cofre e o caderno **não foram ouvidos num leitor de tela** [verificado: só testes de DOM e de foco].

## Antes de começar
1. Abra o jogo no **Safari** (o site publicado ou o `current/index.html` por um servidor local). O VoiceOver funciona melhor com o Safari.
2. Ligue o VoiceOver com **Cmd + F5** (de novo para desligar). O "VO" abaixo é a tecla **Ctrl + Option**.
3. Comandos que você vai usar: **VO + seta direita/esquerda** (próximo/anterior item), **VO + Espaço** (acionar), **VO + Shift + seta para baixo** (entrar num grupo), **VO + Shift + seta para cima** (sair), **VO + U** (rotor: lista de títulos, botões, tabelas).
4. Para chegar ao cofre sem jogar a missão inteira: abra a missão 5, abra o console do Safari. Se o menu **Desenvolver** não aparecer, ative-o em Safari > Ajustes > Avançado > "Mostrar recursos para desenvolvedores web". Depois use Cmd + Option + C e rode `window.gameScene.encontros.cofre()`. É o mesmo gatilho do fim da missão.
5. Anote, para cada passo, **o que o VoiceOver falou** (copie o texto ou descreva) e marque **OK** ou **PROBLEMA**.

## Roteiro
| # | Ação | O que deveria acontecer | Resultado |
|---|---|---|---|
| 1 | Abrir o cofre (passo 4 acima) | O VoiceOver anuncia uma caixa de diálogo chamada "Cofre de transporte"; o foco cai na primeira fonte da bandeja | |
| 2 | VO + seta direita pelas fontes da bandeja | Cada fonte é lida com o nome do isótopo, a quantidade ("N fonte(s) nesta missão") e se está pressionada ou não | |
| 3 | Selecionar uma fonte (VO + Espaço) | A ficha abre ao lado (ou embaixo, no celular). Entre nela com VO + Shift + seta para baixo: título, meia-vida, barras de emissão (cada barra é lida como "tipo: valor / 100") | |
| 4 | Na ficha, VO + U e escolher "Tabelas" | A tabela do Geiger tem cabeçalhos de coluna (sem blindagem, Al 3 mm, acrílico 5 mm, Pb 10 mm) e a primeira célula de cada linha é um cabeçalho de linha (`th scope=row`) e o VoiceOver diz o tipo (alfa, beta, gama) ao percorrer as células da linha | |
| 5 | Guardar a fonte na prateleira certa (botão da ficha ou VO + Espaço numa prateleira) | O retorno ("X na prateleira Y" mais a explicação) é **lido sozinho**, sem você procurar (o retorno agora é uma região persistente: deve ser anunciado a cada guarda, inclusive repetida) | |
| 6 | Errar de propósito com outra fonte | O retorno de erro é lido sozinho e **não revela** a prateleira certa na 1ª tentativa | |
| 7 | Entrar no grupo "Blindagem da prateleira ..." e passar pelos 5 materiais | Cada botão é lido com o material e "pressionado" ou "não pressionado"; depois de escolher, os outros continuam focáveis e são lidos como "esmaecidos" ou "desabilitados" | |
| 8 | Escolher uma blindagem | O texto da explicação (com a frase do Am-241 ou do Ra-226, se houver) é lido sozinho; a nota "Escolha feita: não dá para trocar" fica no grupo | |
| 8b | Escolher de propósito uma blindagem **errada** ou **parcial** | O botão ganha um selo (× errada, ≈ parcial, ✓ certa) e a descrição acessível diz o resultado ("blindagem errada/parcial/correta"); o selo não depende só da cor | |
| 9 | Conferir o selo de uma fonte guardada na 2ª tentativa | O cartão é lido com "Acerto na 2ª tentativa" (e não só "!") | |
| 10 | Esc com a ficha aberta, depois Esc de novo | O 1º Esc fecha a ficha; o 2º abre a confirmação "Sair do cofre agora?..." (caixa de alerta), com foco em "Continuar no cofre" | |
| 11 | Lacrar o cofre (depois de guardar tudo e escolher as blindagens) | O resumo é lido sozinho (título, itens, pontos). O foco vai para "Voltar ao campo", que é lido junto com a descrição (título, lista e total do resumo) | |
| 12 | Abrir o caderno de campo (botão no menu ou na pausa) | Diálogo anunciado como "Caderno de campo"; o botão de fechar é lido como "Fechar o caderno" (português) | |
| 13 | No caderno, VO + seta direita pelas abas | Cada aba é lida com o nome do tema e o contador ("0/3"), mesmo no celular onde o nome não aparece na tela | |
| 14 | Selecionar uma aba | A folha de fichas é anunciada como painel da aba selecionada | |
| 15 | **iPhone/iPad (VoiceOver do iOS, Safari):** repetir 1, 3, 5, 8 e 11 deslizando com um dedo à direita/esquerda; duplo toque para acionar | Mesmos resultados; a ficha vem embaixo e o retorno aparece sem precisar rolar (a página rola até ele) | |

## O que fazer com o resultado
- Marque **PROBLEMA** em qualquer passo em que o texto lido não bateu com a coluna 3, ou em que você precisou procurar uma informação que devia ser lida sozinha.
- Cole a tabela preenchida de volta num chat do projeto; eu corrijo item por item e registro no README.
- Se puder, repita os passos 1, 5, 8 e 11 no **NVDA + Firefox** (Windows) numa máquina de sala de aula: os leitores de tela diferem em como tratam regiões `role="status"` e grupos de botões, e o público da escola provavelmente não usa Mac.

## Limites deste roteiro
- O texto exato que o VoiceOver fala varia com a versão do macOS e com as configurações de verbosidade; a coluna 3 descreve o **conteúdo** esperado, não a frase literal.
- Este roteiro só cobre o cofre e o caderno. O restante do jogo (mapa, Geiger, minimapa) é visual e não foi adaptado para leitor de tela.
