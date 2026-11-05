// ============================================
// AGÊNCIA: a Base em GRADE (estilo gerenciamento de base), a equipe com canetas dosimétricas, o hangar, o laboratório
// e a montagem da equipe antes do voo. Métodos acrescentados à classe AgenciaUI (ui-agencia.js).
// Lógica no módulo puro (equipe.js, frota.js); aqui só HTML e cliques.
// ============================================
import { MISSIONS, TUTORIAL } from '../data/missoes/index.js';
import { retratoSvg } from '../investigacao/retratos.js';
import { t, currentLang } from '../i18n/index.js';
import { treinamentoConcluido } from './dados.js';
import { alertaPorId } from './rapidas.js';
import { mesDe, diaDoMes } from './simulacao.js';
import { NOME_AGENCIA } from './textos.js';
import { moduloSvg, rochaSvg, pessoaSvg } from './base-svg.js';
import { planta as plantaSvg } from '../arte/planta.js';
import { NORMAS, razao, janelaMaisRestritiva, corCaneta, doseNaJanela, diasParaVoltar, motivoIndisponivel, disponivel } from './equipe.js';
import {
    CUSTOS, NAVES, TIPOS_NAVE, CONSTRUIVEIS, UNICOS, GRADE_MAX, baiasTotal, camasTotal, modulosProntos, temLaboratorio, temMedico, limiteRetorno, pesquisaPronta, naveLivre,
    primeiraNaveLivre, comprarNave, construirModulo, expandirBase, iniciarPesquisa, contratar, enviarResgate, enviarLevantamento, foiLevantado,
} from './frota.js';

const preencher = (s, dados) => s.replace(/\{(\w+)\}/g, (_, k) => (dados[k] ?? ''));
const estrelasTxt = (n) => { const k = Math.max(0, Math.min(3, n | 0)); return '★'.repeat(k) + '☆'.repeat(3 - k); };
const fmt = (n) => (Math.round(n * 100) / 100).toLocaleString(currentLang === 'pt' ? 'pt-BR' : 'en-US', { maximumFractionDigits: 2 });
/** Expressão do retrato conforme o estado: dose (caneta) e disponibilidade. */
const expressaoDe = (cor, mot) => (mot === 'tratamento' || cor === 'vermelho' ? 'preocupado' : cor === 'amarelo' || mot === 'viagem' ? 'neutro' : 'sorriso');
const MOTIVOS = { creditos: 'semCreditos', baias: 'semBaias', pesquisa: 'exigePesquisa', unico: 'moduloUnico', laboratorio: 'semLaboratorio', camas: 'semCamas', nave: 'semResgate', equipe: 'semEquipe', maximo: 'baseMaxima' };

export const metodosBase = {
    txtMotivo(m) { const L = this.L; return L[MOTIVOS[m]] || m; },

    // ---------- membro da equipe ----------
    htmlMembro(m, extra = '') {
        const L = this.L, e = this.est, dia = e.dia, r = razao(m, dia), pct = Math.round(r * 100), cor = corCaneta(r), jan = janelaMaisRestritiva(m, dia);
        const corTxt = { verde: L.canetaVerde, amarelo: L.canetaAmarela, vermelho: L.canetaVermelha }[cor];
        const mot = motivoIndisponivel(m, dia);
        let estado = L.disponivel;
        if (mot === 'tratamento') { const d = diasParaVoltar(m, dia, limiteRetorno(e)); estado = d <= 1 ? L.emTratamentoHoje : preencher(L.emTratamento, { d }); }
        else if (mot === 'viagem') estado = preencher(L.emViagem, { d: m.ocupadoAte });
        const [j1, j7, j30] = NORMAS.janelas;
        const doses = preencher(L.doseJanelas, { d: fmt(doseNaJanela(m, dia, 1)), s: fmt(doseNaJanela(m, dia, 7)), m: fmt(doseNaJanela(m, dia, 30)), ld: j1.limite, ls: j7.limite, lm: j30.limite });
        return `<div class="ag-membro ag-dossie ag-estado-${mot || 'ok'}" data-membro="${m.id}"><div class="ag-foto ag-borda-${cor}" aria-hidden="true"><span class="ag-foto-cab">${L.ficha} ${String(m.id).replace(/\D/g, '').padStart(2, '0')}</span><div class="inv-retrato">${retratoSvg(m.retrato, expressaoDe(cor, mot))}</div></div><div class="ag-membro-info">`
            + `<p class="ag-fala-nome">${m.nome}${extra}</p>`
            + `<div class="ag-vida" role="img" aria-label="${preencher(L.doseRel, { p: pct })}"><span class="ag-vida-cheia ag-c-${cor}" style="width:${Math.min(100, pct)}%"></span></div>`
            + `<p class="ag-nota"><strong>${preencher(L.doseRel, { p: pct })}</strong>${pct > 0 && jan ? ' (' + L.janela[jan.id] + ')' : ''} · ${L.caneta}: <span class="ag-caneta ag-c-${cor}">${corTxt}</span></p>`
            + `<p class="ag-nota">${doses}</p><p class="ag-nota"><strong>${estado}</strong></p></div></div>`;
    },

    // ---------- Base em grade (cena em corte, v3.7) ----------
    /** Em que sala cada cientista aparece hoje: tratamento no alojamento; os demais circulam pelas salas prontas. */
    pessoasPorSala() {
        const e = this.est, mapa = {};
        const salas = e.modulos.filter((m) => m.pronto <= e.dia && ['alojamento', 'medico', 'comando', 'laboratorio', 'biblioteca', 'academia'].includes(m.tipo));
        salas.forEach((m) => { mapa[m.id] = []; });
        e.equipe.forEach((m, i) => {
            const mot = motivoIndisponivel(m, e.dia); if (mot === 'viagem' || !salas.length) return;
            const alvo = mot === 'tratamento' ? (salas.find((q) => q.tipo === 'medico') || salas.find((q) => q.tipo === 'alojamento') || salas[0]) : salas[(i + e.dia) % salas.length];
            mapa[alvo.id].push(m);
        });
        return mapa;
    },
    htmlBase() {
        const L = this.L, e = this.est, g = e.grade, MX = GRADE_MAX.cols, MY = GRADE_MAX.rows;
        const pessoas = this.pessoasPorSala();
        const col = g.cols < MX, lin = g.rows < MY;
                const modEm = (x, y) => (x >= 0 && y >= 0 && x < g.cols && y < g.rows) ? e.modulos.find((q) => q.x === x && q.y === y) : null;
        const hangares = e.modulos.filter((m) => m.tipo === 'hangar').sort((p, q) => p.y - q.y || p.x - q.x).map((m) => m.id);
        const VX = g.cols + (col ? 1 : 0), VY = g.rows + (lin ? 1 : 0); // só se mostra a terra que dá para escavar em seguida
        let cel = '';
        for (let y = 0; y < VY; y++) for (let x = 0; x < VX; x++) {
            const pos = `style="grid-column:${x + 1};grid-row:${y + 1}"`;
            if (x < g.cols && y < g.rows) {
                const m = modEm(x, y);
                if (m) {
                    const obra = m.pronto > e.dia, nome = L.sala[m.tipo] || m.tipo, sel = this.mod === m.id;
                    const viz = { n: !!modEm(x, y - 1), s: !!modEm(x, y + 1), o: !!modEm(x - 1, y), l: !!modEm(x + 1, y) };
                    const k = hangares.indexOf(m.id), naves = m.tipo === 'hangar' ? e.naves.slice(k * 2, k * 2 + 2).map((n) => (n && !n.missao ? n.tipo : null)) : [];
                    const gente = (pessoas[m.id] || []).map((q) => ({ cor: corCaneta(razao(q, e.dia)), i: q.id }));
                    cel += `<button type="button" class="ag-cel${sel ? ' sel' : ''}${obra ? ' obra' : ''}" ${pos} data-sala="${m.tipo}" data-mod="${m.id}" aria-pressed="${sel}" aria-label="${nome}. ${obra ? preencher(L.obraPronta, { d: m.pronto - e.dia }) : L.salaDesc[m.tipo] || ''}${m.tipo === 'oficina' ? ' (' + L.emBreve + ')' : ''}">${plantaSvg(m.tipo, { obra, viz, naves, pessoas: gente })}<span class="ag-sala-rot">${nome}${obra ? ' · ' + (m.pronto - e.dia) + 'd' : ''}</span></button>`;
                } else {
                    const sel = this.vazio && this.vazio.x === x && this.vazio.y === y;
                    const viz = { n: !!modEm(x, y - 1), s: !!modEm(x, y + 1), o: !!modEm(x - 1, y), l: !!modEm(x + 1, y) };
                    cel += `<button type="button" class="ag-cel vazio${sel ? ' sel' : ''}" ${pos} data-vazio="${x},${y}" aria-pressed="${!!sel}" aria-label="${L.vazio} (${x + 1}, ${y + 1}). ${L.construirAqui}">${plantaSvg('vazio', { viz })}<span class="ag-mais" aria-hidden="true">+</span><span class="ag-sala-rot">${L.vazio}</span></button>`;
                }
            } else {
                const marca = (col && x === g.cols && y === 0) || (lin && y === g.rows && x === 0);
                cel += `<div class="ag-rocha" ${pos} aria-hidden="true">${marca ? '<span class="ag-escavar-marca">⛏</span>' : ''}</div>`;
            }
        }
        const resumo = preencher(L.baseResumo, { c: g.cols, r: g.rows, n: e.naves.length, b: baiasTotal(e), e: e.equipe.length, k: camasTotal(e) });
        const fim = !col && !lin ? `<p class="ag-nota ag-base-max">${L.baseMaxima}</p>` : '';
        return `<div class="ag-cena"><div class="ag-campo-w"><div class="ag-campo">${rochaSvg()}<div class="ag-planta" style="--cols:${VX};--rows:${VY}">${cel}</div></div>${fim}</div>${this.htmlConsole()}<p class="ag-nota sr-only" id="ag-base-resumo">${resumo}</p></div>`;
    },

    /** Coluna de menu à direita (estilo console): cabeçalho da base e atalhos para cada instalação. */
    htmlConsole() {
        const L = this.L, e = this.est, M = L.menuBase;
        const dia = e.iniciado ? preencher(L.data, { m: mesDe(e.dia) + 1, d: diaDoMes(e.dia) }) : '—';
        const ent = (tipo, rot) => {
            const m = e.modulos.find((q) => q.tipo === tipo);
            if (!m) return `<button type="button" class="ag-menu-bt" disabled><span>${rot}</span><em>${L.menuNaoConstruido}</em></button>`;
            const obra = m.pronto > e.dia, sel = this.sala === tipo;
            if (obra) return `<button type="button" class="ag-menu-bt" disabled><span>${rot}</span><em>${m.pronto - e.dia}d</em></button>`;
            return `<button type="button" class="ag-menu-bt${sel ? ' sel' : ''}" data-sala="${tipo}" data-mod="${m.id}" aria-pressed="${sel}"><span>${rot}</span>${tipo === 'oficina' ? `<em>${L.emBreve}</em>` : ''}</button>`;
        };
        let livre = null;
        for (let y = 0; y < e.grade.rows && !livre; y++) for (let x = 0; x < e.grade.cols && !livre; x++) if (!e.modulos.some((q) => q.x === x && q.y === y)) livre = `${x},${y}`;
        const g = e.grade, escCol = g.cols < GRADE_MAX.cols, escLin = g.rows < GRADE_MAX.rows;
        const esc = (acao, rot, custo) => `<button type="button" class="ag-menu-bt ag-escavar" data-ag="${acao}" ${e.creditos >= custo ? '' : 'disabled'}><span><span aria-hidden="true">⛏</span> ${rot}</span><em>${custo}</em></button>`;
        const escavar = (escCol ? esc('escavar-coluna', L.escavarColuna, CUSTOS.expandirColuna) : '') + (escLin ? esc('escavar-linha', L.escavarLinha, CUSTOS.expandirLinha) : '');
        const construir = livre ? `<button type="button" class="ag-menu-bt destaque" data-vazio="${livre}"><span>${M.construir}</span></button>` : `<button type="button" class="ag-menu-bt" disabled><span>${M.construir}</span><em>${L.menuSemEspaco}</em></button>`;
        return `<nav class="ag-console" aria-label="${M.titulo}"><div class="ag-console-cab"><p class="ag-console-nome">${NOME_AGENCIA[currentLang]}</p><p class="ag-console-linha">${dia}</p><p class="ag-console-linha">${L.creditos}: <strong>${e.creditos}</strong></p></div>`
            + `<div class="ag-menu">${ent('alojamento', M.pessoal)}${ent('medico', M.medico)}${ent('hangar', M.hangar)}${ent('laboratorio', M.pesquisa)}${ent('comando', M.comando)}${ent('academia', M.treino)}${ent('cofre', M.arquivo)}${ent('biblioteca', M.biblioteca)}${ent('oficina', M.oficina)}${construir}${escavar}`
            + `<button type="button" class="ag-menu-bt" data-ag="normas"><span>${L.normasTit}</span></button><button type="button" class="ag-menu-bt destaque" data-ag="trocar"><span>${L.irMapa}</span></button></div></nav>`;
    },

    /** Painel da Base como janela flutuante sobre a cena; sem sala aberta, só a barra com a Marta. */
    htmlJanelaBase(painel) {
        const L = this.L, e = this.est;
        const aberta = !!(this.sala || this.preparo || this.relatorio || this.normas);
        const janela = aberta ? `<aside class="ag-painel ag-janela${this.preparo ? ' ag-larga' : ''}" role="dialog" aria-label="${L.registro}"><button type="button" class="ag-fechar" data-ag="fechar-janela" aria-label="${L.fechar}">✕</button>${this.htmlInterior()}${painel}</aside>` : '';
        const a = e.ativos.length;
        const barra = `<div class="ag-marta-barra"><div class="inv-retrato" aria-hidden="true">${retratoSvg('marta', a > 0 ? 'preocupado' : 'sorriso')}</div><div class="ag-balao"><p class="ag-fala-nome">${L.marta}</p><p class="ag-fala-texto">${L.martaBase}</p></div>`
            + `<div class="ag-barra-info"><span class="ag-nota">${preencher(L.baseResumoCurto, { a, n: e.naves.length, b: baiasTotal(e), e: e.equipe.length, k: camasTotal(e) })}</span><button type="button" class="menu-btn secondary ag-mini" data-ag="normas">${L.normasTit}</button></div></div>`;
        return janela + barra;
    },

    /** Ilustração do interior da sala (corte lateral) no alto da janela. */
    htmlInterior() {
        const s = this.sala, e = this.est;
        if (!s || this.preparo || s === 'vazio') return '';
        const m = e.modulos.find((q) => q.id === this.mod) || e.modulos.find((q) => q.tipo === s);
        if (!m || m.pronto > e.dia) return '';
        const gente = (this.pessoasPorSala()[m.id] || []).slice(0, 4).map((q) => `<span class="ag-pessoa-w" title="${q.nome}">${pessoaSvg(corCaneta(razao(q, e.dia)), null, q.id)}</span>`).join('');
        return `<figure class="ag-interior" aria-hidden="true">${moduloSvg(s)}${gente ? `<span class="ag-pessoas">${gente}</span>` : ''}</figure>`;
    },

    botaoCusto(acao, rot, custo, motivo, dados = '') {
        const L = this.L;
        return `<div class="ag-linha-acao"><button type="button" class="menu-btn primary ag-mini" data-ag="${acao}" ${dados} ${motivo ? 'disabled' : ''}>${rot} (${custo})</button>${motivo ? `<span class="ag-nota">${this.txtMotivo(motivo)}</span>` : ''}</div>`;
    },

    // ---------- painel da Base ----------
    htmlPainelBase() {
        const L = this.L, e = this.est, s = this.sala;
        const rel = this.relatorio ? `<p class="ag-relatorio" role="status">${this.relatorio}</p>` : '';
        if (this.preparo && this.preparo.tipo === 'resgate') return rel + this.htmlPreparo();
        if (!s) return rel + this.fala('marta', L.marta, L.martaBase) + `<div class="ag-cartao"><h3>${L.normasTit}</h3><p>${L.normasTxt}</p></div>`;
        if (s === 'vazio') {
            const botoes = CONSTRUIVEIS.map((tipo) => {
                let mot = null;
                if (UNICOS.includes(tipo) && e.modulos.some((m) => m.tipo === tipo)) mot = 'unico';
                else if (e.creditos < CUSTOS.modulo[tipo]) mot = 'creditos';
                return `<h4 class="ag-sub">${L.tipoModulo[tipo]}</h4>` + this.botaoCusto('construir', L.construirAqui, CUSTOS.modulo[tipo], mot, `data-tipo="${tipo}"`);
            }).join('');
            return rel + `<div class="ag-cartao"><h3>${L.vazio}</h3><p class="ag-nota">${preencher(L.obraPronta, { d: '3–5' })}</p>${botoes}</div>`;
        }
        const mod = e.modulos.find((m) => m.id === this.mod) || e.modulos.find((m) => m.tipo === s);
        if (mod && mod.pronto > e.dia) return rel + `<div class="ag-cartao"><h3>${L.sala[mod.tipo]}</h3><p>${preencher(L.obraPronta, { d: mod.pronto - e.dia })}</p></div>`;
        if (s === 'hangar') return rel + this.htmlHangar();
        if (s === 'laboratorio') return rel + this.htmlLaboratorio();
        if (s === 'alojamento') return rel + this.htmlAlojamento();
        if (s === 'medico') return rel + this.htmlMedico();
        if (s === 'comando') return rel + this.fala('marta', L.marta, L.martaMapa) + `<div class="ag-cartao"><p>${preencher(L.comandoResumo, { a: e.ativos.length, c: Object.values(e.concluidos).filter((n) => n > 0).length, x: e.expirados })}</p><div class="ag-acoes"><button type="button" class="menu-btn primary" data-ag="trocar">${L.irMapa}</button></div></div>`;
        if (s === 'academia') {
            const m1 = TUTORIAL, feito = treinamentoConcluido(this.cb.desbloqueadas()), est = this.cb.estrelas(1);
            return rel + this.fala('teo', L.teo, feito ? L.teoFalaFeito : L.teoFala)
                + `<div class="ag-cartao"><h3>${t(m1.titleKey)}</h3><p>${t(m1.descKey)}</p>${est ? `<p class="ag-nota">${L.melhor}: <span aria-label="${est}/3">${estrelasTxt(est)}</span></p>` : ''}`
                + `<div class="ag-acoes"><button type="button" class="menu-btn primary" data-ag="treino">${feito ? L.refazerTreino : L.iniciarTreino}</button>`
                + `<button type="button" class="menu-btn secondary" data-ag="academia-completa">${L.academiaCompleta}</button>`
                + (feito ? '' : `<button type="button" class="menu-btn secondary" data-ag="pular">${L.pularTreino}</button>`) + `</div></div>`;
        }
        if (s === 'cofre') {
            const feitas = MISSIONS.filter((m) => this.cb.estrelas(m.id) > 0);
            const iso = [...new Set(feitas.flatMap((m) => m.allowedIsotopes || []))].sort();
            const corpo = feitas.length
                ? `<p>${preencher(L.cofreConcluidas, { n: feitas.length, total: MISSIONS.length })}</p><p>${preencher(L.cofreIsotopos, { lista: iso.join(', ') })}</p>`
                  + `<ul class="ag-lista-simples">${feitas.map((m) => `<li>${t(m.titleKey)} <span aria-label="${this.cb.estrelas(m.id)}/3">${estrelasTxt(this.cb.estrelas(m.id))}</span></li>`).join('')}</ul>`
                : `<p>${L.cofreVazio}</p>`;
            return rel + this.fala('yara', L.yara, L.yaraFala) + `<div class="ag-cartao">${corpo}</div>`;
        }
        if (s === 'oficina') return rel + `<div class="ag-cartao"><h3>${L.sala.oficina} <em>(${L.emBreve})</em></h3><p>${L.oficinaTexto}</p></div>`;
        if (s === 'biblioteca') return rel + `<div class="ag-cartao"><h3>${L.sala.biblioteca}</h3><p>${L.bibliotecaTexto}</p><div class="ag-acoes"><button type="button" class="menu-btn primary" data-ag="caderno">${L.abrirCaderno}</button></div></div>`;
        return rel;
    },

    /** v3.27: Departamento médico: quem está em tratamento fica aqui; com o módulo a alta sai com dose relativa < 85 % em vez de 75 % [H]. */
    htmlMedico() {
        const L = this.L, e = this.est, lim = limiteRetorno(e);
        const doentes = e.equipe.filter((m) => motivoIndisponivel(m, e.dia) === 'tratamento');
        const lista = doentes.length ? doentes.map((m) => this.htmlMembro(m)).join('') : `<p class="ag-nota">${L.medicoVazio}</p>`;
        return this.fala('cecilia', L.cecilia, L.ceciliaFala)
            + `<div class="ag-cartao"><h3>${L.sala.medico} · ${preencher(L.medicoOcupados, { n: doentes.length })}</h3>${lista}</div>`
            + `<div class="ag-cartao"><p class="ag-nota">${preencher(L.medicoRegra, { p: Math.round(lim * 100), q: Math.round(NORMAS.retorno * 100) })}</p></div>`;
    },

    htmlAlojamento() {
        const L = this.L, e = this.est;
        const eq = e.equipe.map((m) => this.htmlMembro(m)).join('');
        const cands = e.candidatos.map((c) => {
            const mot = e.equipe.length >= camasTotal(e) ? 'camas' : (e.creditos < CUSTOS.contratar ? 'creditos' : null);
            return `<div class="ag-membro"><div class="inv-retrato" aria-hidden="true">${retratoSvg(c.retrato, 'sorriso')}</div><div class="ag-membro-info"><p class="ag-fala-nome">${c.nome}</p>${this.botaoCusto('contratar', L.contratar.replace(' ({v})', ''), CUSTOS.contratar, mot, `data-id="${c.id}"`)}</div></div>`;
        }).join('');
        return `<div class="ag-cartao"><h3>${L.sala.alojamento} · ${preencher(L.camas, { n: e.equipe.length, k: camasTotal(e) })}</h3>${eq}</div>`
            + (temMedico(e) ? '' : `<div class="ag-cartao"><p class="ag-nota">${L.semMedicoDica}</p></div>`) + `<div class="ag-cartao"><h3>${L.contratarTit}</h3>${cands || `<p class="ag-nota">${L.semCandidatos}</p>`}</div>`
            + `<div class="ag-cartao"><h3>${L.normasTit}</h3><p class="ag-nota">${L.normasTxt}</p></div>`;
    },

    htmlLaboratorio() {
        const L = this.L, e = this.est, p = e.pesquisa.detectorAereo;
        let acao;
        if (p && p.pronto <= e.dia) acao = `<p><strong>${L.pesquisaOk}</strong></p>`;
        else if (p) acao = `<p>${preencher(L.pesquisando, { d: p.pronto })}</p>`;
        else acao = this.botaoCusto('pesquisar', L.pesquisar.replace(/ \(.*\)$/, ''), CUSTOS.pesquisa.detectorAereo.custo, e.creditos < CUSTOS.pesquisa.detectorAereo.custo ? 'creditos' : null, 'data-id="detectorAereo"');
        return `<div class="ag-cartao"><h3>${L.labTit}</h3><h4 class="ag-sub">${L.pesqDetector}</h4><p>${L.pesqDetectorDesc}</p><p class="ag-nota">${preencher(L.pesquisar.match(/\(.*\)/)[0].replace('{v}', CUSTOS.pesquisa.detectorAereo.custo).replace('{d}', CUSTOS.pesquisa.detectorAereo.dias), {})}</p>${acao}</div>`;
    },

    htmlHangar() {
        const L = this.L, e = this.est, lang = currentLang;
        const naves = e.naves.map((n) => {
            const st = n.missao ? preencher(L.viagemNave, { d: n.missao.chegaEm }) : L.livre;
            return `<li><strong>${L.tipoNave[n.tipo]}</strong> · ${st}</li>`;
        }).join('');
        const compras = TIPOS_NAVE.map((tipo) => {
            let mot = null;
            if (e.naves.length >= baiasTotal(e)) mot = 'baias';
            else if (tipo === 'levantamento' && !pesquisaPronta(e, 'detectorAereo')) mot = 'pesquisa';
            else if (e.creditos < CUSTOS.nave[tipo]) mot = 'creditos';
            return `<h4 class="ag-sub">${L.tipoNave[tipo]}</h4><p class="ag-nota">${L.descNave[tipo]}</p>` + this.botaoCusto('comprar-nave', L.comprarNave.replace(' ({v})', ''), CUSTOS.nave[tipo], mot, `data-tipo="${tipo}"`);
        }).join('');
        const coletas = e.coleta.map((c) => {
            const a = alertaPorId(c.alertaId), d = this.dadosAlerta(a), mot = !primeiraNaveLivre(e, 'resgate') ? 'nave' : null;
            return `<li>${preencher(L.coletaItem, { titulo: d.titulo, n: c.fontes, d: c.expira })}${this.botaoCusto('resgate', L.enviarResgate, 0, mot, `data-id="${c.id}"`).replace(' (0)', '')}</li>`;
        }).join('');
        const lev = e.ativos.filter((x) => alertaPorId(x.id).tipo === 'missao').map((x) => {
            const a = alertaPorId(x.id), d = this.dadosAlerta(a);
            const feito = foiLevantado(e, a.id), emViagem = e.naves.some((n) => n.missao && n.missao.tipo === 'levantamento' && n.missao.alertaId === a.id);
            const mot = feito || emViagem ? 'ja' : (!primeiraNaveLivre(e, 'levantamento') ? 'nave' : null);
            return `<li>${d.titulo} ${feito ? '✓ ' + L.jaLevantado : this.botaoCusto('levantar', preencher(L.levItem, { titulo: d.titulo }), 0, mot && mot !== 'ja' ? mot : (mot ? 'ja' : null), `data-id="${a.id}"`).replace(' (0)', '')}</li>`;
        }).join('');
        const temLev = e.naves.some((n) => n.tipo === 'levantamento');
        return this.fala('otavio', L.otavio, L.otavioFala)
            + `<div class="ag-cartao"><h3>${L.hangarTit} · ${preencher(L.baias, { n: e.naves.length, b: baiasTotal(e) })}</h3><ul class="ag-lista-simples">${naves}</ul>${compras}</div>`
            + `<div class="ag-cartao"><h3>${L.coletaTit}</h3>${coletas ? `<ul class="ag-lista-simples">${coletas}</ul>` : `<p class="ag-nota">${L.semColeta}</p>`}</div>`
            + (temLev ? `<div class="ag-cartao"><h3>${L.levTit}</h3>${lev ? `<ul class="ag-lista-simples">${lev}</ul>` : `<p class="ag-nota">${L.semAlertasLev}</p>`}</div>` : '');
    },

    // ---------- montagem da equipe (voo ou resgate): interior da nave com assentos, como no X-COM ----------
    iniciarPreparo(tipo, extra = {}) {
        const e = this.est, disp = e.equipe.filter((m) => disponivel(m, e.dia)).sort((a, b) => razao(a, e.dia) - razao(b, e.dia));
        const max = tipo === 'voo' ? NAVES.tripulacao.capacidade : NAVES.resgate.capacidade;
        const seats = Array.from({ length: max }, (_, k) => (k < Math.min(2, max) && disp[k] ? disp[k].id : null));
        this.preparo = { tipo, max, seats, selSeat: null, aviso: '', ...extra };
    },
    idsDoPreparo() { return this.preparo ? this.preparo.seats.filter(Boolean) : []; },
    htmlPreparo() {
        const L = this.L, e = this.est, p = this.preparo, a = p.alvo;
        const semNave = p.tipo === 'voo' && !primeiraNaveLivre(e, 'tripulacao');
        const infoDose = (m) => { const r = razao(m, e.dia), pct = Math.round(r * 100), cor = corCaneta(r); return { pct, cor, txt: { verde: L.canetaVerde, amarelo: L.canetaAmarela, vermelho: L.canetaVermelha }[cor] }; };
        const assentos = p.seats.map((id, k) => {
            const m = id && e.equipe.find((x) => x.id === id), papel = k === 0 ? L.assentoLider : L.assentoApoio, sel = p.selSeat === k;
            if (!m) return `<button type="button" class="ag-assento vazio${sel ? ' sel' : ''}" data-assento="${k}" aria-pressed="${sel}" aria-label="${preencher(L.assentoN, { n: k + 1 })}: ${L.assentoLivre}. ${papel}"><span class="ag-assento-papel">${papel}</span><span class="ag-assento-vazio" aria-hidden="true">+</span><span class="ag-nota">${L.assentoLivre}</span></button>`;
            const d = infoDose(m);
            return `<button type="button" class="ag-assento ocupado${sel ? ' sel' : ''} ag-borda-${d.cor}" data-assento="${k}" aria-pressed="${sel}" aria-label="${preencher(L.assentoN, { n: k + 1 })}: ${m.nome}, ${preencher(L.doseRel, { p: d.pct })}, ${d.txt}. ${papel}"><span class="ag-assento-papel">${papel}</span><span class="inv-retrato" aria-hidden="true">${retratoSvg(m.retrato, expressaoDe(d.cor, motivoIndisponivel(m, this.est.dia)))}</span><span class="ag-assento-nome">${m.nome}</span><span class="ag-assento-dose ag-c-${d.cor}">${d.pct} %</span></button>`;
        }).join('');
        const cartoes = e.equipe.map((m) => {
            const ok = disponivel(m, e.dia), nave = p.seats.includes(m.id), d = infoDose(m), mot = motivoIndisponivel(m, e.dia);
            const estado = nave ? L.naNave : (mot === 'tratamento' ? (diasParaVoltar(m, e.dia, limiteRetorno(e)) <= 1 ? L.emTratamentoHoje : preencher(L.emTratamento, { d: diasParaVoltar(m, e.dia) })) : mot === 'viagem' ? preencher(L.emViagem, { d: m.ocupadoAte }) : L.disponivel);
            return `<button type="button" class="ag-cartao-cient ag-borda-${d.cor}${nave ? ' naNave' : ''}${ok ? '' : ' indisp'}" data-cartao="${m.id}" ${ok && !nave ? '' : 'disabled'} aria-label="${m.nome}. ${preencher(L.doseRel, { p: d.pct })}, ${d.txt}. ${estado}"><span class="inv-retrato" aria-hidden="true">${retratoSvg(m.retrato, expressaoDe(d.cor, mot))}</span><span class="ag-cc-info"><strong>${m.nome}</strong><span class="ag-nota">${preencher(L.doseRel, { p: d.pct })} · <span class="ag-caneta ag-c-${d.cor}">${d.txt}</span></span><span class="ag-nota">${estado}</span></span></button>`;
        }).join('');
        const ids = this.idsDoPreparo(), pode = ids.length >= 1 && !semNave;
        const nenhum = !e.equipe.some((m) => disponivel(m, e.dia));
        const selOcupado = p.selSeat !== null && p.seats[p.selSeat];
        const acoesAssento = selOcupado ? `<div class="ag-acoes"><button type="button" class="menu-btn secondary ag-mini" data-ag="tirar-assento">${L.tirarDaNave}</button>${p.selSeat > 0 ? `<button type="button" class="menu-btn secondary ag-mini" data-ag="passar-frente">${L.passarFrente}</button>` : ''}</div>` : '';
        const titulo = p.tipo === 'voo' && a ? this.dadosAlerta(a).titulo : L.enviarResgate;
        const casco = '';
        return `<div class="ag-cartao" id="ag-preparo"><h3>${L.preparoTit}: ${titulo}</h3><p class="ag-nota">${preencher(L.preparoSelec, { n: p.max })}</p>`
            + (semNave ? `<p class="ag-aviso">${L.semNave}</p>` : '') + (nenhum ? `<p class="ag-aviso">${L.semEquipe}</p>` : '')
            + `<div class="ag-nave-int" role="group" aria-label="${L.naveInterior}"><span class="ag-frente" aria-hidden="true">${L.frente} ▶</span>${casco}<div class="ag-assentos" style="--n:${p.max}">${assentos}</div></div>${acoesAssento}`
            + (p.aviso ? `<p class="ag-aviso" role="status">${p.aviso}</p>` : '')
            + `<h4 class="ag-sub">${L.elencoTit}</h4><div class="ag-elenco">${cartoes}</div>`
            + `<div class="ag-acoes"><button type="button" class="menu-btn primary" data-ag="decolar" ${pode ? '' : 'disabled'}>${p.tipo === 'voo' ? L.decolar : L.enviarResgate}</button><button type="button" class="menu-btn secondary" data-ag="sugerir">${L.sugerir}</button><button type="button" class="menu-btn secondary" data-ag="cancelar-preparo">${L.cancelarPreparo}</button></div></div>`;
    },
    /** Põe `id` num assento: no selecionado, senão no primeiro livre. Devolve false se a nave está cheia. */
    embarcar(id) {
        const p = this.preparo; if (!p || p.seats.includes(id)) return false;
        let k = p.selSeat !== null ? p.selSeat : p.seats.indexOf(null);
        if (k < 0) { p.aviso = this.L.naveCheia; return false; }
        p.seats[k] = id; p.selSeat = null; p.aviso = ''; return true;
    },

    // ---------- eventos da Base ----------
    ligarBase() {
        this.el.querySelectorAll('[data-vazio]').forEach((b) => b.addEventListener('click', () => { const [x, y] = b.dataset.vazio.split(',').map(Number); this.sala = 'vazio'; this.mod = null; this.vazio = { x, y }; this.relatorio = null; this.desenhar(false); }));
        this.el.querySelectorAll('[data-assento]').forEach((c) => c.addEventListener('click', () => { const p = this.preparo; if (!p) return; const k = Number(c.dataset.assento); p.selSeat = p.selSeat === k ? null : k; p.aviso = ''; this.desenhar(false); }));
        this.el.querySelectorAll('[data-cartao]').forEach((c) => c.addEventListener('click', () => { this.embarcar(c.dataset.cartao); this.desenhar(false); }));
    },

    /** Ações de Base/equipe/naves. Devolve true se tratou. */
    acaoBase(k, b) {
        const e = this.est, L = this.L;
        const feito = (r, msg) => { this.gravar(); this.relatorio = r && r.ok === false ? this.txtMotivo(r.motivo) : (msg || null); this.desenhar(false); return true; };
        if (k === 'construir') { const v = this.vazio; if (!v) return true; const r = construirModulo(e, b.dataset.tipo, v.x, v.y); if (r.ok) { this.sala = null; this.vazio = null; } return feito(r); }
        if (k === 'escavar-coluna') return feito(expandirBase(e, 'coluna'));
        if (k === 'escavar-linha') return feito(expandirBase(e, 'linha'));
        if (k === 'fechar-janela') { this.sala = null; this.mod = null; this.vazio = null; this.relatorio = null; this.preparo = null; this.normas = false; this.desenhar(false); return true; }
        if (k === 'normas') { this.sala = null; this.mod = null; this.vazio = null; this.normas = true; this.desenhar(false); return true; }
        if (k === 'comprar-nave') return feito(comprarNave(e, b.dataset.tipo));
        if (k === 'pesquisar') return feito(iniciarPesquisa(e, b.dataset.id));
        if (k === 'contratar') return feito(contratar(e, b.dataset.id));
        if (k === 'levantar') return feito(enviarLevantamento(e, b.dataset.id));
        if (k === 'resgate') { this.iniciarPreparo('resgate', { coletaId: b.dataset.id }); this.desenhar(false); return true; }
        if (k === 'tirar-assento') { const p = this.preparo; if (p && p.selSeat !== null) { p.seats[p.selSeat] = null; p.selSeat = null; } this.desenhar(false); return true; }
        if (k === 'passar-frente') { const p = this.preparo; if (p && p.selSeat > 0) { [p.seats[0], p.seats[p.selSeat]] = [p.seats[p.selSeat], p.seats[0]]; p.selSeat = null; } this.desenhar(false); return true; }
        if (k === 'sugerir') { const p = this.preparo; if (p) { const disp = e.equipe.filter((m) => disponivel(m, e.dia)).sort((x, y) => razao(x, e.dia) - razao(y, e.dia)); p.seats = Array.from({ length: p.max }, (_, i) => (i < Math.min(2, p.max) && disp[i] ? disp[i].id : null)); p.selSeat = null; p.aviso = ''; } this.desenhar(false); return true; }
        if (k === 'cancelar-preparo') { this.preparo = null; this.desenhar(false); return true; }
        if (k === 'decolar') {
            const p = this.preparo, ids = this.idsDoPreparo(); if (!p || !ids.length) return true;
            if (p.tipo === 'resgate') { const r = enviarResgate(e, p.coletaId, ids); this.preparo = null; return feito(r); }
            if (!primeiraNaveLivre(e, 'tripulacao')) return true;
            this.equipeSaida = { ids: [...ids], lider: ids[0], ativo: ids[0], acum: {}, naveId: (primeiraNaveLivre(e, 'tripulacao') || {}).id };   // o primeiro assento é o líder, que vai à frente
            this.voo = { alvo: p.alvo }; this.preparo = null; this._parar(); this.vel = 0; this.desenhar(false);
            const c = this.el.querySelector('#ag-chegar'); if (c) c.focus();
            return true;
        }
        return false;
    },
};
