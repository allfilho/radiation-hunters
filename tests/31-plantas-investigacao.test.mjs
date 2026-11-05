// Cada episódio de investigação tem a sua própria planta (paredes, portas, ambientes), e todos os pontos são alcançáveis.
import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { INVESTIGACOES } from '../current/js/investigacao/index.js';
import { MapGenerator } from '../current/js/mapa/gerador.js';

function gerar(inv) {
    const c0 = inv.campo, m = { id: c0.numero, mapTheme: c0.tema, mapCols: c0.planta?.cols, mapRows: c0.planta?.rows, hospitalAtivo: !!c0.hospitalAtivo, investigacaoCampo: c0 };
    const g = new MapGenerator(m.mapCols || 24, m.mapRows || 16, m.mapTheme, m);
    return { m, d: g.generate(), c: inv.campo };
}
const alcancaveis = (map, ini) => {
    const rows = map.length, cols = map[0].length, vis = new Set([ini.x + ',' + ini.y]), fila = [[ini.x, ini.y]];
    while (fila.length) {
        const [x, y] = fila.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || vis.has(k) || map[ny][nx] === 1 || map[ny][nx] === 2) continue;
            vis.add(k); fila.push([nx, ny]);
        }
    }
    return vis;
};

test('as investigações têm plantas diferentes entre si (Zaragoza reaproveita a planta do hospital)', () => {
    const hash = INVESTIGACOES.map((inv) => { const { d } = gerar(inv); return crypto.createHash('md5').update(d.map.map((l) => l.map((t) => (t === 1 ? 1 : 0)).join('')).join('|')).digest('hex'); });
    assert.equal(new Set(hash).size, INVESTIGACOES.length - 1);   // hospital e Zaragoza (v3.21) compartilham a planta
    assert.equal(hash[0], hash[INVESTIGACOES.findIndex((i) => i.id === 'zaragoza-acelerador')]);
    for (const inv of INVESTIGACOES) assert.ok(inv.campo.planta, inv.id + ' sem planta própria');
});

test('cada planta: todos os móveis colocados, início e todos os pontos de interação alcançáveis, sem desperdício de áreas', () => {
    for (const inv of INVESTIGACOES) {
        const { d, c } = gerar(inv), p = c.planta;
        assert.equal(d.map.length, p.rows); assert.equal(d.map[0].length, p.cols);
        assert.equal(d.furniture.length, p.moveis.length, inv.id + ': móveis perdidos');
        const alc = alcancaveis(d.map, d.playerStart);
        for (const l of c.locais.filter((q) => !q.piso || q.piso === "terreo")) {   // pontos de outros pisos: ver 38-pisos
            const perto = [...alc].some((k) => { const [x, y] = k.split(',').map(Number); return Math.hypot(x + 0.5 - l.x, y + 0.5 - l.y) < 1.6; });
            assert.ok(perto, `${inv.id}: ponto ${l.id} inalcançável`);
        }
        // toda área aberta da planta é conectada ao início (nenhuma sala fechada)
        for (const a of p.areas) assert.ok(alc.has((a.x + Math.floor(a.w / 2)) + ',' + (a.y + Math.floor(a.h / 2))) || [...alc].some((k) => { const [x, y] = k.split(',').map(Number); return x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h; }), inv.id + ': ambiente isolado');
    }
});

test('escola: ventilação visual (Salas A e B com janelas fechadas; B é ventilada por sistema mecânico) e rótulos dos ambientes em PT/EN', async () => {
    const { PLANTA_ESCOLA: p } = await import('../current/js/mapa/plantas-investigacao.js');
    const j = (x0, x1) => p.decor.filter((d) => d.tipo === 'janela' && d.x >= x0 && d.x <= x1 && d.y === 2).map((d) => d.estado);
    assert.ok(j(12, 20).length >= 2 && j(12, 20).every((e) => e === 'fechada'));
    assert.ok(j(22, 30).length >= 2 && j(22, 30).every((e) => e === 'fechada'));
    assert.ok(p.decor.some((d) => d.tipo === 'janela' && d.estado === 'aberta'));
    const radonio = INVESTIGACOES.find((i) => i.id === 'radonio-escola');
    for (const l of ['pt', 'en']) { const t = radonio.campo.salas.map((s) => s[l]).join('|'); assert.match(t, l === 'pt' ? /janelas conforme a estação/ : /windows by season/); assert.match(t, l === 'pt' ? /ventilação mecânica programada/ : /scheduled mechanical ventilation/); }
    assert.ok(p.zonas.some((z) => z.vent === 0) && p.zonas.some((z) => z.vent === 2));
});

test('laboratório de cronologia: cinco laboratórios com os equipamentos de cada um', async () => {
    const { PLANTA_CRONOLOGIA: p } = await import('../current/js/mapa/plantas-investigacao.js');
    const tempo = INVESTIGACOES.find((i) => i.id === 'arquivo-tempo' || i.atalho === 'tempo');
    const dentro = (a) => p.moveis.filter(([, x, y]) => x >= a.x && x < a.x + a.w && y >= a.y && y < a.y + a.h).map(([id]) => id);
    const labs = [p.areas[0], p.areas[1], p.areas[2], p.areas[4], p.areas[8], p.areas[9], p.areas[10], p.areas[5]];
    const exige = [['saw', 'polisher', 'sample_tray', 'ultrasonic', 'loupe'], ['furnace', 'tube_furnace', 'vacuum_pump'], ['fume_hood', 'etch_bath', 'balance'], ['safe', 'source_cabinet', 'dosimeter_rack'],
        ['image_station', 'microscope'], ['elec_bench', 'oscilloscope', 'soldering_station', 'power_supply', 'microcontroller_kit', 'robot_arm_bath'], ['printer3d', 'filament_shelf'], ['locker', 'eyewash', 'safety_shower', 'extinguisher', 'first_aid']];
    labs.forEach((a, i) => { const ids = dentro(a); for (const id of exige[i]) assert.ok(ids.includes(id), `sala ${i + 1} sem ${id}`); });
    for (const l of ['pt', 'en']) for (let n = 1; n <= 5; n++) assert.ok(tempo.campo.salas.some((s) => s[l].startsWith('Lab ' + n)), `rótulo do Lab ${n} (${l})`);
});

test('treinamento de segurança: um instrutor por laboratório, textos PT/EN completos, sem números, e alcançáveis', async () => {
    const { TREINOS, treinoDaArea, AVISO_TREINO } = await import('../current/js/investigacao/treinamento-seguranca.js');
    const { PLANTA_CRONOLOGIA: p } = await import('../current/js/mapa/plantas-investigacao.js');
    const tempo = INVESTIGACOES.find((i) => i.id === 'arquivo-tempo');
    assert.equal(TREINOS.length, 7); assert.deepEqual(tempo.campo.instrutores, TREINOS);
    assert.equal(new Set(TREINOS.map((t) => t.area)).size, 7); assert.equal(new Set(TREINOS.map((t) => t.npc)).size, 7);
    for (const t of TREINOS) {
        for (const l of ['pt', 'en']) {
            assert.ok(t.lab[l] && t.pergunta[l], t.id); assert.ok(t.passos.length >= 4 && t.passos.length <= 5, t.id);
            for (const x of [...t.passos.map((q) => q[l]), ...t.opcoes.flatMap((o) => [o.txt[l], o.porque[l]])]) { assert.ok(x && x.length > 10, t.id + ' ' + l); assert.doesNotMatch(x, /\d/, t.id + ': texto de segurança sem números'); }
        }
        assert.equal(t.opcoes.filter((o) => o.correta).length, 1, t.id);
        assert.equal(treinoDaArea(p, t.x, t.y)?.id, t.id, t.id + ' fora da própria área');
    }
    assert.ok(AVISO_TREINO.pt && AVISO_TREINO.en);
    const { d } = gerar(tempo), alc = alcancaveis(d.map, d.playerStart);
    for (const t of TREINOS) assert.ok([...alc].some((k) => { const [x, y] = k.split(',').map(Number); return Math.hypot(x + 0.5 - t.x, y + 0.5 - t.y) < 1.2; }), t.id + ' inalcançável');
});

test('escola em campus: edifícios separados, áreas externas (pátio, estacionamento, horta, quadra) e todos os pontos alcançáveis', async () => {
    const { MapGenerator } = await import('../current/js/mapa/gerador.js');
    const { CAMPO_RADON: c } = await import('../current/js/investigacao/configuracoes-campo.js');
    const p = c.planta;
    assert.equal(p.externo, true); assert.ok(p.blocos.length >= 4, 'ao menos quatro edifícios separados');
    for (const piso of ['quadra', 'terra', 'asfalto', 'calcada']) assert.ok(p.zonas.some((z) => z.piso === piso), 'zona ' + piso);
    for (const id of ['tree', 'yard_bench', 'parked_car', 'garden_bed', 'goal', 'flagpole', 'bike_rack', 'sign']) assert.ok(p.moveis.some(([m]) => m === id), 'móvel externo ' + id);
    const g = new MapGenerator(p.cols, p.rows, 'lab', { id: 12, mapTheme: 'lab', geigerComoItem: true, investigacaoCampo: c });
    const r = g.generate(), map = r.map;
    const sx = Math.floor(r.playerStart.x), sy = Math.floor(r.playerStart.y), vistos = new Set([sx + ',' + sy]), fila = [[sx, sy]];
    while (fila.length) { const [x, y] = fila.shift(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!vistos.has(k) && map[y + dy]?.[x + dx] === 0) { vistos.add(k); fila.push([x + dx, y + dy]); } } }
    let livres = 0; for (let y = 0; y < map.length; y++) for (let x = 0; x < map[0].length; x++) if (map[y][x] === 0) { livres++; assert.ok(vistos.has(x + ',' + y), `tile isolado ${x},${y}`); }
    assert.ok(livres > 1200, 'terreno amplo: ' + livres);
    for (const l of c.locais.filter((q) => !q.piso || q.piso === "terreo")) assert.ok([...vistos].some((k) => { const [x, y] = k.split(',').map(Number); return Math.hypot(x + .5 - l.x, y + .5 - l.y) < 1.5; }), 'ponto ' + l.id);
});

test('hospital e medicina nuclear em complexo: áreas externas próprias, móveis externos e paletas distintas da escola', async () => {
    const { PLANTA_HOSPITAL: h, PLANTA_NUCLEAR: n, PLANTA_ESCOLA: e } = await import('../current/js/mapa/plantas-investigacao.js');
    for (const [nome, p] of [['hospital', h], ['nuclear', n]]) {
        assert.equal(p.externo, true, nome); assert.ok(p.blocos.length >= 2, nome + ': blocos separados');
        assert.ok(p.zonas.some((z) => z.piso === 'asfalto'), nome + ': asfalto'); assert.ok(p.cercas.length > 4, nome + ': pátio cercado');
        assert.ok(p.moveis.some(([m]) => m === 'ambulance'), nome + ': ambulância'); assert.ok(p.moveis.some(([m]) => m === 'tree'), nome + ': árvores');
    }
    assert.ok(h.moveis.some(([m]) => m === 'waste_container') && h.moveis.some(([m]) => m === 'generator_unit'), 'hospital: resíduos e gerador');
    assert.ok(n.moveis.some(([m]) => m === 'lead_container'), 'nuclear: contêineres blindados');
    assert.equal(new Set([e.paleta.piso, h.paleta.piso, n.paleta.piso]).size, 3, 'paletas distintas');
    assert.equal(new Set([e, h, n].map((p) => p.cols + 'x' + p.rows + ':' + p.blocos.map((b) => b.x + ',' + b.y).join(';'))).size, 3);
});

test('móveis novos de investigação não repetem o id de móveis de outras missões (evita redesenhar o ferro-velho, a fábrica etc.)', async () => {
    const { MOVEIS_INVESTIGACAO } = await import('../current/js/render/mobiliario-investigacao.js');
    const { FURNITURE_TYPES } = await import('../current/js/data/moveis.js');
    const antigos = new Set(Object.values(FURNITURE_TYPES).flat().map((m) => m.id));
    const repetidos = MOVEIS_INVESTIGACAO.map((m) => m.id).filter((id) => antigos.has(id));
    assert.deepEqual(repetidos, [], 'ids repetidos: ' + repetidos);
});
