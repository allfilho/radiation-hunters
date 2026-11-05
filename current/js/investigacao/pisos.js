// ============================================
// PISOS DE UMA INVESTIGAÇÃO (escada entre andares). Puro, roda em Node.
//
// Cada piso é um MAPA próprio (planta, salas, escadas); a troca de piso reinicia a cena com o piso de destino, como a
// troca de tela de um jogo de aventura. A sessão da investigação (progresso, respostas) fica fora da cena e se mantém.
// Motivo: um mapa empilhado num só canvas passaria de 4096 px de altura (o campus já usa 3456 x 2816 px) e estouraria o
// limite de textura de vários celulares.
//
// Formato em `campo`:
//   pisos: { terreo: { nome, escadas: [...] }, andar1: { nome, planta, salas, escadas: [...] }, ... }
//   o piso 'terreo' usa campo.planta e campo.salas; os outros trazem os seus.
//   escada: { id, x, y, para: 'andar1', chegada: { x, y } }   (x, y = tile da escada; chegada = posição no piso de destino)
//   locais: cada ponto pode ter `piso` (padrão 'terreo').
// ============================================
export const PISO_PADRAO = 'terreo';
export const RAIO_ESCADA = 0.8;          // em tiles, do centro da escada
export const RAIO_LIBERA = 1.3;          // para sair do "travado" depois de chegar, é preciso se afastar disto

export const pisoDoLocal = (l) => l.piso || PISO_PADRAO;
export const temPisos = (campo) => !!(campo && campo.pisos && Object.keys(campo.pisos).length > 1);

/** Visão do campo para um piso: planta, salas, escadas e painel do piso. Sem `pisos`, devolve o próprio campo. */
export function campoDoPiso(campo, piso = PISO_PADRAO) {
  if (!temPisos(campo)) return campo;
  const def = campo.pisos[piso];
  if (!def) throw new Error('Piso inexistente: ' + piso);
  if (piso === PISO_PADRAO) return { ...campo, piso, escadas: def.escadas || [] };
  return { ...campo, piso, planta: def.planta, salas: def.salas || [], escadas: def.escadas || [], painel: null, instrutores: [] };
}

/** Missão (objeto passado à cena) com o mapa do piso. */
export function missaoDoPiso(missao, piso = PISO_PADRAO) {
  const campo = missao.investigacaoCampo;
  if (!temPisos(campo)) return missao;
  const v = campoDoPiso(campo, piso);
  return { ...missao, mapCols: v.planta?.cols, mapRows: v.planta?.rows, investigacaoCampo: v };
}

export function nomeDoPiso(campo, piso, lang) {
  const n = campo?.pisos?.[piso]?.nome;
  return (n && n[lang]) || (piso === PISO_PADRAO ? (lang === 'pt' ? 'Térreo' : 'Ground floor') : piso);
}

/** Primeira escada a tomar em `de` para chegar a `para` (busca em largura nos pisos). null se já está lá ou não há caminho. */
export function proximaEscada(campo, de, para) {
  if (!temPisos(campo) || de === para) return null;
  const fila = [{ piso: de, primeira: null }], visto = new Set([de]);
  while (fila.length) {
    const { piso, primeira } = fila.shift();
    for (const e of campo.pisos[piso]?.escadas || []) {
      if (visto.has(e.para)) continue;
      visto.add(e.para);
      const p = primeira || e;
      if (e.para === para) return p;
      fila.push({ piso: e.para, primeira: p });
    }
  }
  return null;
}

/** Escada em que o jogador (em tiles) está pisando; null se nenhuma. */
export function escadaSobre(escadas, px, py, raio = RAIO_ESCADA) {
  return (escadas || []).find((e) => Math.hypot(px - (e.x + 0.5), py - (e.y + 0.5)) <= raio) || null;
}

/** Consistência da configuração: toda escada tem volta e a chegada fica fora do raio da escada de volta. Devolve a lista de problemas. */
export function validarPisos(campo) {
  const erros = [];
  if (!temPisos(campo)) return erros;
  for (const [id, def] of Object.entries(campo.pisos)) {
    if (id !== PISO_PADRAO && !def.planta) erros.push(id + ': sem planta');
    for (const e of def.escadas || []) {
      const dest = campo.pisos[e.para];
      if (!dest) { erros.push(`${id}/${e.id}: destino ${e.para} não existe`); continue; }
      const volta = (dest.escadas || []).find((v) => v.para === id);
      if (!volta) { erros.push(`${id}/${e.id}: ${e.para} não tem escada de volta`); continue; }
      if (!e.chegada) { erros.push(`${id}/${e.id}: sem chegada`); continue; }
      if (Math.hypot(e.chegada.x - (volta.x + 0.5), e.chegada.y - (volta.y + 0.5)) <= RAIO_LIBERA) erros.push(`${id}/${e.id}: a chegada cai sobre a escada de volta`);
    }
  }
  for (const l of campo.locais || []) if (!campo.pisos[pisoDoLocal(l)]) erros.push(`ponto ${l.id}: piso ${l.piso} não existe`);
  return erros;
}
