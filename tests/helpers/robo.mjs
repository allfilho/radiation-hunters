// Robô de jogabilidade: roda dentro da página, acha, mede e identifica todas as fontes (ver 06-jogabilidade).
/** Executa dentro da página: acha, mede e identifica uma fonte; devolve um relatório. */
export const ROBO = () => {
  const s = window.gameScene, T = CONFIG.TILE_SIZE, PASSO = 4;
  // 1. região alcançável a partir da posição inicial (inundação sobre isBlocked)
  const W = (s.mapCols || CONFIG.MAP_COLS) * T, H = (s.mapRows || CONFIG.MAP_ROWS) * T;
  const chave = (x, y) => x + ',' + y;
  const x0 = Math.round(s.player.x / PASSO) * PASSO, y0 = Math.round(s.player.y / PASSO) * PASSO;
  const alc = new Set([chave(x0, y0)]), fila = [[x0, y0]];
  while (fila.length) {
    const [x, y] = fila.pop();
    for (const [dx, dy] of [[PASSO, 0], [-PASSO, 0], [0, PASSO], [0, -PASSO]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx > W || ny > H || alc.has(chave(nx, ny)) || s.isBlocked(nx, ny)) continue;
      alc.add(chave(nx, ny)); fila.push([nx, ny]);
    }
  }
  const rel = [];
  s.toggleGeiger();
  let guarda = 0;
  while (s.sources.some((q) => !q.found) && guarda++ < 20) {
    // escolhe a fonte restante com candidato de leitura; tenta posições por distância crescente
    let feito = false;
    for (const src of s.sources.filter((q) => !q.found)) {
      const r = s.rectDoMovel(src.furniture);
      const cands = [];
      for (const k of alc) {
        const [x, y] = k.split(',').map(Number);
        const px = x / T, py = y / T;
        const d = Geiger.distanciaAoRetangulo(r, px, py);
        if (d <= CONFIG.IDENTIFY_DISTANCE * 0.9) cands.push({ x, y, d });
      }
      cands.sort((a, b) => a.d - b.d);
      // amostra espalhada (não só as mais próximas, que podem estar de costas por colisão)
      const amostra = cands.filter((_, i) => i % 3 === 0).slice(0, 80);
      for (const c of amostra) {
        s.player.x = c.x; s.player.y = c.y;
        const p = Geiger.pontoMaisProximo(r, c.x / T, c.y / T);
        s.playerDirection = Math.atan2(p.y - c.y / T, p.x - c.x / T);
        s.janelaGeiger.reset();
        for (let i = 0; i < 15; i++) s.measureRadiation();
        if (s.currentReading <= CONFIG.BG_RADIATION * 2) continue;
        s.handleIdentify();
        if (!document.getElementById('identify-modal').classList.contains('active')) continue;
        const alvo = s.selectedFurniture.source;
        const btn = [...document.querySelectorAll('#isotope-buttons .isotope-btn')].find((b) => b.dataset.name === alvo.name);
        if (!btn) return { erro: 'botão do isótopo certo ausente: ' + alvo.name, rel };
        rel.push({ nome: alvo.name, tipo: alvo.type, leitura: s.currentReading, d: +c.d.toFixed(2) });
        btn.click();
        feito = true;
        break;
      }
      if (feito) break;
    }
    if (!feito) return { erro: 'nenhuma fonte restante pôde ser detectada e identificada', restantes: s.sources.filter((q) => !q.found).map((q) => q.name + '/' + q.type), rel };
    // fecha o modal como o jogo faria (o jogo usa um temporizador de 3 s, lento em Chromium sem GPU)
    if (s.sources.some((q) => !q.found)) ui.hideModal('identify');
  }
  return { ok: true, rel };
};

