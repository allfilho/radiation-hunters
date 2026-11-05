// Encerra a investigação no campo: o jogador vai ao jato (ou à saída) e interage, como no jogo.
export async function encerrarNoJato(pg) {
  await pg.waitForFunction(() => window.gameScene?.jato && window.gameScene.player);
  await pg.evaluate(() => { const s = window.gameScene, T = 32; s.player.setPosition(s.jato.x * T, s.jato.y * T + 24); });
  await pg.evaluate(() => window.gameScene.interagirJato());
}
