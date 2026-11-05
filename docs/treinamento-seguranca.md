# Treinamento de segurança nos laboratórios (Arquivo do tempo)

Estado dos textos: **[H] rascunho educativo geral, aguardando revisão de quem conhece as normas do laboratório.** Nenhum texto aqui foi tirado de norma, procedimento ou ficha de segurança específicos; são boas práticas gerais de laboratório. No jogo o treino é apresentado como real, como um guia: em toda tela aparece "Guia de segurança do laboratório. É uma orientação geral e não substitui as normas e fichas de segurança do seu laboratório." (decisão do autor: sem rótulo de rascunho; o estado [H] vale só para a revisão interna)

## Como funciona
- Sete instrutores fictícios, um por ambiente: Bia (Lab 1), Otto (Lab 2), Nina (Lab 3), Davi (Lab 4), Léa (Lab 5 microscopia), Teo (Lab 5 eletrônica), Íris (Lab 5 impressão 3D).
- Conversar (E, Q ou toque): quatro passos e uma pergunta de verificação com três alternativas. Erro mostra o porquê e permite tentar de novo; acerto registra o selo do ambiente.
- Equipamento de um ambiente sem treino concluído mostra "⚠ treino de segurança pendente (Nome)" ao chegar perto. É só aviso: o jogo nunca bloqueia o uso.
- Selo guardado no navegador (chave `rh_treinos_seguranca_v1`); o HUD mostra "treinos n/7".
- Não interfere na sequência das sete etapas da investigação.

## Para o revisor (o que validar)
Cada treino está em `js/investigacao/treinamento-seguranca.js`, com passos, pergunta e justificativas em PT e EN. Os textos não trazem números, limites, normas nem marcas. Pontos que dependem do seu laboratório: EPI exigido em cada sala, ordem de operação de fornos e bomba de vácuo, descarte de resíduos, regras de uso de fontes e dosímetro, e quem é o responsável.
