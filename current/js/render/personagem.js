// Personagem do jogador: cientista de campo com traje laranja de alta visibilidade, capuz branco com visor
// e mochila. Desenhado por código (canvas 2D), sem arquivos de imagem: 4 direções x 3 quadros (parado,
// passo esquerdo, passo direito). Os quadros são texturas do Phaser ('cacador_<dir>_<n>').
//
// Visão de cima em 3/4, como em RPGs clássicos. A direção 'right' é o espelho de 'left'.

export const DIRECOES = ['down', 'up', 'left', 'right'];
export const QUADROS = 3;
const LARG = 32, ALT = 40;   // tamanho lógico de um quadro (px do mundo)
const S = 3;                 // ampliação de desenho: nítido com zoom e telas de alta densidade

const COR = {
  contorno: '#16202e', jaqueta: '#ff8f1f', jaquetaSombra: '#d9660a', faixa: '#eef6f9',
  calca: '#2b3a55', bota: '#1b2433', luva: '#3b4a63', capuz: '#f1f5f8', capuzSombra: '#cdd8e0',
  visor: '#2fc8e6', visorBrilho: '#c9f6ff', pele: '#f2c9a0', mochila: '#4a5568', mochilaSombra: '#363f4e',
  radiacao: '#ffd400', sombra: 'rgba(0,0,0,0.30)',
};

function retRed(c, x, y, w, h, r, cor, borda = true) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = cor; c.fill();
  if (borda) { c.lineWidth = 0.7; c.strokeStyle = COR.contorno; c.stroke(); }
}
function elipse(c, x, y, rx, ry, cor, borda = false) {
  c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fillStyle = cor; c.fill();
  if (borda) { c.lineWidth = 0.7; c.strokeStyle = COR.contorno; c.stroke(); }
}
function trifolio(c, x, y, r) {
  c.fillStyle = COR.radiacao;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  c.fillStyle = COR.contorno;
  for (let i = 0; i < 3; i++) {
    const a0 = -Math.PI / 2 + i * (2 * Math.PI / 3) - Math.PI / 6;
    c.beginPath(); c.moveTo(x, y); c.arc(x, y, r * 0.88, a0, a0 + Math.PI / 3); c.closePath(); c.fill();
  }
  c.fillStyle = COR.radiacao; c.beginPath(); c.arc(x, y, r * 0.28, 0, Math.PI * 2); c.fill();
}

// Quadro de frente ou de costas. passo: -1, 0, 1 (perna que avança); balanco: sobe/desce do corpo
function desenharFrenteCostas(c, costas, passo) {
  const bob = passo === 0 ? 0 : -1;
  // pernas e botas
  const yP = 27;
  const avE = passo === -1 ? -2 : 0, avD = passo === 1 ? -2 : 0;
  retRed(c, 10.5, yP + avE, 4.6, 8 - avE * 0.2, 1.6, COR.calca);
  retRed(c, 16.9, yP + avD, 4.6, 8 - avD * 0.2, 1.6, COR.calca);
  retRed(c, 10, yP + 6 + avE, 5.6, 3.6, 1.6, COR.bota);
  retRed(c, 16.4, yP + 6 + avD, 5.6, 3.6, 1.6, COR.bota);
  c.save(); c.translate(0, bob);
  // braços balançando (oposto às pernas)
  const bE = passo === 1 ? -1.5 : passo === -1 ? 1.2 : 0, bD = -bE;
  retRed(c, 5.6, 15.5 + bE, 4.2, 9, 2, COR.jaquetaSombra);
  retRed(c, 22.2, 15.5 + bD, 4.2, 9, 2, COR.jaquetaSombra);
  retRed(c, 5.8, 23 + bE, 3.8, 3.4, 1.6, COR.luva);
  retRed(c, 22.4, 23 + bD, 3.8, 3.4, 1.6, COR.luva);
  if (costas) {
    // mochila grande atrás do tronco
    retRed(c, 9.5, 14.5, 13, 13, 2.6, COR.mochila);
    retRed(c, 10.5, 15.5, 11, 3.2, 1.4, COR.mochilaSombra, false);
    trifolio(c, 16, 22.2, 2.6);
  } else {
    // tronco com jaqueta, faixas refletivas e emblema
    retRed(c, 9.4, 14.5, 13.2, 13.5, 3, COR.jaqueta);
    c.fillStyle = COR.faixa; c.fillRect(9.8, 22.6, 12.4, 1.8); c.fillRect(9.8, 25.2, 12.4, 1.2);
    c.fillRect(11.2, 14.8, 1.6, 7.6); c.fillRect(19.2, 14.8, 1.6, 7.6);
    trifolio(c, 16, 19.2, 1.9);
  }
  // capuz / cabeça
  elipse(c, 16, 10.8, 7.7, 7.4, COR.capuz, true);
  if (!costas) {
    retRed(c, 9.9, 8.4, 12.2, 6.2, 3.1, COR.visor);
    c.fillStyle = COR.visorBrilho; c.globalAlpha = 0.8;
    c.beginPath(); c.roundRect(11.1, 9.2, 4.6, 1.6, 0.8); c.fill(); c.globalAlpha = 1;
    c.fillStyle = COR.pele; c.fillRect(13.6, 14.2, 4.8, 1.2);          // queixo por baixo do visor
  } else {
    elipse(c, 16, 12.6, 5.2, 3.4, COR.capuzSombra);
    retRed(c, 12.6, 9.4, 6.8, 1.4, 0.7, COR.visor, false);               // faixa do visor visível por trás
  }
  c.restore();
}

// Quadro de perfil voltado para a esquerda
function desenharPerfil(c, passo) {
  const bob = passo === 0 ? 0 : -1;
  const yP = 27, f = passo === 1 ? 2.4 : passo === -1 ? -2.4 : 0;
  // perna de trás e da frente
  retRed(c, 14.2 - f, yP, 4.4, 8, 1.6, COR.calca);
  retRed(c, 13.4 - f, yP + 6, 5.6, 3.6, 1.6, COR.bota);
  retRed(c, 14.2 + f, yP, 4.4, 8, 1.6, COR.calca);
  retRed(c, 13.4 + f, yP + 6, 5.6, 3.6, 1.6, COR.bota);
  c.save(); c.translate(0, bob);
  // mochila atrás (lado direito do quadro)
  retRed(c, 18.4, 14.8, 7.6, 12, 2.6, COR.mochila);
  trifolio(c, 22.4, 20.8, 2.2);
  // tronco
  retRed(c, 10.4, 14.5, 10.6, 13.5, 3, COR.jaqueta);
  c.fillStyle = COR.faixa; c.fillRect(10.8, 22.8, 9.8, 1.8);
  // braço da frente balançando
  const b = passo === 1 ? -2 : passo === -1 ? 2 : 0;
  retRed(c, 12.6 + b, 16, 4.4, 9, 2, COR.jaquetaSombra);
  retRed(c, 12.8 + b, 23.4, 4, 3.4, 1.6, COR.luva);
  // capuz de perfil e visor
  elipse(c, 16, 10.8, 7.6, 7.4, COR.capuz, true);
  retRed(c, 8.2, 8.4, 7.4, 6, 3, COR.visor);
  c.fillStyle = COR.visorBrilho; c.globalAlpha = 0.8;
  c.beginPath(); c.roundRect(9.2, 9.2, 3.4, 1.5, 0.75); c.fill(); c.globalAlpha = 1;
  c.restore();
}

function desenharQuadro(dir, n) {
  const cv = document.createElement('canvas');
  cv.width = LARG * S; cv.height = ALT * S;
  const c = cv.getContext('2d');
  c.scale(S, S);
  c.lineJoin = 'round';
  // sombra no chão
  elipse(c, 16, 36, 9.5, 3.2, COR.sombra);
  const passo = n === 0 ? 0 : (n === 1 ? -1 : 1);
  if (dir === 'down') desenharFrenteCostas(c, false, passo);
  else if (dir === 'up') desenharFrenteCostas(c, true, passo);
  else if (dir === 'left') desenharPerfil(c, passo);
  else { c.translate(LARG, 0); c.scale(-1, 1); desenharPerfil(c, passo); }
  return cv;
}

export function chaveQuadro(dir, n) { return `cacador_${dir}_${n}`; }

// Cria as texturas uma única vez por jogo
export function registrarTexturasDoPersonagem(scene) {
  for (const dir of DIRECOES) {
    for (let n = 0; n < QUADROS; n++) {
      const k = chaveQuadro(dir, n);
      if (!scene.textures.exists(k)) scene.textures.addCanvas(k, desenharQuadro(dir, n));
    }
  }
}

// Direção (rad) -> nome da direção do sprite
export function direcaoDoAngulo(rad) {
  const c = Math.cos(rad), s = Math.sin(rad);
  if (Math.abs(c) > Math.abs(s) + 0.15) return c < 0 ? 'left' : 'right';
  if (Math.abs(s) > Math.abs(c) + 0.15) return s < 0 ? 'up' : 'down';
  return null; // diagonal: mantém a direção anterior
}

export const ESCALA_SPRITE = 1 / S;
export const ALTURA_SPRITE = ALT;
