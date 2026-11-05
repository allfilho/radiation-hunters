// Auxiliares dos testes do cofre no navegador (etapa 5e-D).
// Abrem o cofre pelo gerenciador do jogo real e resolvem-no pela interface (cliques e teclas), como um jogador.

/** Itens do cofre da missão em curso: [{nome, n, prat}] (vindos do próprio jogo). */
export const itensDoJogo = (pg) => pg.evaluate(async () => {
  const K = await import('/js/encontros/cofre.js');
  return K.novoCofre(window.gameScene.sources).itens.map((i) => ({ nome: i.nome, n: i.n, prat: i.prat }));
});

/** Abre o cofre como no fim da missão (gerenciador.cofre()), sem esperar o jogo terminar. */
export async function abrirCofre(pg) {
  await pg.evaluate(() => { window.__cofreFim = window.gameScene.encontros.cofre().then(() => 'fim'); });
  await pg.waitForSelector('#cofre-modal.active');
}

export const teclaDaPrat = { alfa: '1', beta: '2', gama: '3' };
export const MATERIAL_CERTO = { alfa: 'papel', beta: 'acrilico', gama: 'chumbo' };

/** Guarda `nome` na prateleira `prat` pela interface (seleciona a fonte, depois a tecla da prateleira). */
export async function guardarPorTecla(pg, nome, prat) {
  await pg.click(`.cf-fonte[data-nome="${nome}"]`);
  await pg.keyboard.press(teclaDaPrat[prat]);
}

/** Resolve o cofre inteiro certo: guarda tudo, escolhe a blindagem certa, lacra e volta ao campo. */
export async function resolverCofreCerto(pg) {
  const itens = await itensDoJogo(pg);
  for (const it of itens) await guardarPorTecla(pg, it.nome, it.prat);
  for (const prat of [...new Set(itens.map((i) => i.prat))]) {
    await pg.click(`.cf-prat.${prat} .cf-mat[data-material="${MATERIAL_CERTO[prat]}"]`);
  }
  await pg.click('.cf-lacrar:not([disabled])');
  await pg.click('.cf-resumo .cf-lacrar');
  await pg.waitForFunction(() => !document.getElementById('cofre-modal').classList.contains('active'));
  return itens;
}

export const cofreAtivo = (pg) => pg.$eval('#cofre-modal', (e) => e.classList.contains('active'));
