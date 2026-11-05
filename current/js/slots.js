// ============================================
// VAGAS DE SAVE (v3.11): 3 vagas independentes. Lógica PURA (sem DOM nem Phaser), com armazenamento injetável (testável em Node).
//
// Como funciona: o jogo continua lendo e gravando as MESMAS duas chaves de sempre ("chaves vivas"):
//   radiationHunters         progresso (missões liberadas, estrelas, aprendizado) + configurações
//   radiationHuntersAgencia  estado da Agência (dia, créditos, equipe, naves, base, alertas)
// As chaves vivas são sempre os dados da VAGA ATIVA. Ao trocar de vaga, o conteúdo vivo é guardado na vaga que sai
// (radiationHuntersSlot<N>) e o da vaga que entra é copiado para as chaves vivas. Assim nenhum outro módulo precisou mudar
// e não existe cópia "velha" da vaga ativa.
// Globais (não pertencem a uma vaga): configurações (som, música, dicas, encontros) e idioma.
// Save antigo (sem índice de vagas): vira a vaga 1.
// ============================================
export const N_SLOTS = 3;
export const CHAVE_PROGRESSO = 'radiationHunters';
export const CHAVE_AGENCIA = 'radiationHuntersAgencia';
export const CHAVE_INDICE = 'radiationHuntersSlots';
export const PREFIXO_VAGA = 'radiationHuntersSlot';
const DIAS_POR_MES = 30;

/** Armazenamento padrão: localStorage, sem lançar erro quando bloqueado. */
export function armazenamentoPadrao() {
    return {
        ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
        gravar(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
        remover(k) { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } },
    };
}

const analisar = (txt) => { if (!txt) return null; try { const d = JSON.parse(txt); return d && typeof d === 'object' ? d : null; } catch (e) { return null; } };
const inteiro = (v, lo, hi, padrao) => { const n = typeof v === 'number' ? v : Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : padrao; };
const vagaValida = (n) => Number.isInteger(n) && n >= 1 && n <= N_SLOTS;

/** Resumo mostrado no cartão da vaga, calculado de dados de progresso e da Agência (já em objeto). */
export function resumirDados(prog, ag) {
    const p = prog && typeof prog === 'object' ? prog : {}, a = ag && typeof ag === 'object' ? ag : {};
    const estrelas = p.bestStars && typeof p.bestStars === 'object' ? Object.values(p.bestStars).filter((v) => Number(v) > 0).length : 0;
    const dia = a.iniciado ? inteiro(a.dia, 0, 100000, 0) : 0;
    return {
        iniciada: a.iniciado === true,
        dia, mes: a.iniciado ? Math.floor(Math.max(0, dia - 1) / DIAS_POR_MES) + 1 : 0, diaDoMes: a.iniciado ? ((Math.max(1, dia) - 1) % DIAS_POR_MES) + 1 : 0,
        creditos: a.iniciado ? inteiro(a.creditos, 0, 1e9, 0) : 0,
        equipe: Array.isArray(a.equipe) ? a.equipe.length : 0,
        missoes: estrelas,
        liberadas: Array.isArray(p.unlockedMissions) ? p.unlockedMissions.length : 1,
        rapidas: inteiro(a.rapidasFeitas, 0, 1e6, 0),
    };
}

export function criarSlots(arm = armazenamentoPadrao(), agora = () => Date.now()) {
    const chaveVaga = (n) => PREFIXO_VAGA + n;

    function lerIndice() {
        const d = analisar(arm.ler(CHAVE_INDICE));
        const idx = { v: 1, ativo: 1, vagas: {} };
        if (d && d.v === 1) {
            idx.ativo = vagaValida(d.ativo) ? d.ativo : 1;
            for (let n = 1; n <= N_SLOTS; n++) { const v = d.vagas && d.vagas[n]; if (v && v.criada === true) idx.vagas[n] = { criada: true, t: inteiro(v.t, 0, 1e15, 0) }; }
            // progresso feito sem passar por "Novo jogo" (ex.: modo professor) pertence à vaga ativa
            if (!idx.vagas[idx.ativo] && temDadosVivos()) { idx.vagas[idx.ativo] = { criada: true, t: agora() }; gravarIndice(idx); }
            return idx;
        }
        // migração: havia save antigo nas chaves vivas -> vaga 1
        if (temDadosVivos()) idx.vagas[1] = { criada: true, t: agora() };
        gravarIndice(idx);
        return idx;
    }
    function temDadosVivos() {
        const p = analisar(arm.ler(CHAVE_PROGRESSO)), a = analisar(arm.ler(CHAVE_AGENCIA));
        const estrelas = p && p.bestStars && typeof p.bestStars === 'object' && Object.values(p.bestStars).some((v) => Number(v) > 0);
        return !!(estrelas || (p && Array.isArray(p.unlockedMissions) && p.unlockedMissions.length > 1) || (a && a.iniciado === true));
    }
    function gravarIndice(idx) { arm.gravar(CHAVE_INDICE, JSON.stringify(idx)); }

    /** Parte do progresso que pertence à vaga (tudo menos as configurações). */
    function progressoDaVaga(brutoVivo) { const d = analisar(brutoVivo) || {}; return { unlockedMissions: d.unlockedMissions, bestStars: d.bestStars, aprendizado: d.aprendizado }; }

    /** Guarda o conteúdo vivo na vaga ativa. */
    function guardarAtiva(idx) {
        const n = idx.ativo; if (!idx.vagas[n]) return;
        arm.gravar(chaveVaga(n), JSON.stringify({ p: progressoDaVaga(arm.ler(CHAVE_PROGRESSO)), a: analisar(arm.ler(CHAVE_AGENCIA)), t: agora() }));
        idx.vagas[n].t = agora();
    }

    /** Copia uma vaga (ou um jogo novo) para as chaves vivas, mantendo as configurações atuais. */
    function carregarNasVivas(dados) {
        const atual = analisar(arm.ler(CHAVE_PROGRESSO)) || {};
        const novo = { unlockedMissions: dados && dados.p ? dados.p.unlockedMissions : [1], bestStars: dados && dados.p ? dados.p.bestStars : {}, aprendizado: dados && dados.p ? dados.p.aprendizado : undefined, settings: atual.settings };
        arm.gravar(CHAVE_PROGRESSO, JSON.stringify(novo));
        if (dados && dados.a) arm.gravar(CHAVE_AGENCIA, JSON.stringify(dados.a)); else arm.remover(CHAVE_AGENCIA);
    }

    return {
        /** [{ n, criada, ativa, resumo, t }] das 3 vagas. A vaga ativa é lida das chaves vivas (sempre atual). */
        listar() {
            const idx = lerIndice(), r = [];
            for (let n = 1; n <= N_SLOTS; n++) {
                const v = idx.vagas[n]; let resumo = null;
                if (v) {
                    if (n === idx.ativo) resumo = resumirDados(analisar(arm.ler(CHAVE_PROGRESSO)), analisar(arm.ler(CHAVE_AGENCIA)));
                    else { const d = analisar(arm.ler(chaveVaga(n))); resumo = resumirDados(d && d.p, d && d.a); }
                }
                r.push({ n, criada: !!v, ativa: n === idx.ativo, resumo, t: v ? v.t : 0 });
            }
            return r;
        },
        ativa() { return lerIndice().ativo; },
        algumaCriada() { const idx = lerIndice(); return Object.keys(idx.vagas).length > 0; },
        /** Quantas vagas têm jogo. */
        contar() { return Object.keys(lerIndice().vagas).length; },
        /**
         * Torna a vaga `n` a ativa. `novo` = começa um jogo do zero nela (apaga o que houver).
         * Sem `novo`, a vaga precisa existir; devolve false se não existir.
         */
        ativar(n, { novo = false } = {}) {
            if (!vagaValida(n)) return false;
            const idx = lerIndice();
            if (!novo && !idx.vagas[n]) return false;
            if (n !== idx.ativo) guardarAtiva(idx);
            if (novo) { carregarNasVivas(null); arm.remover(chaveVaga(n)); idx.vagas[n] = { criada: true, t: agora() }; }
            else if (n !== idx.ativo) { carregarNasVivas(analisar(arm.ler(chaveVaga(n)))); idx.vagas[n].t = agora(); }
            idx.ativo = n; gravarIndice(idx);
            return true;
        },
        /** Apaga a vaga `n`. Se era a ativa, as chaves vivas voltam ao jogo novo (a vaga fica vazia). */
        apagar(n) {
            if (!vagaValida(n)) return false;
            const idx = lerIndice(); if (!idx.vagas[n]) return false;
            delete idx.vagas[n]; arm.remover(chaveVaga(n));
            if (n === idx.ativo) carregarNasVivas(null);
            gravarIndice(idx);
            return true;
        },
        /** Guarda agora o conteúdo vivo na vaga ativa (útil antes de fechar a página). */
        sincronizar() { const idx = lerIndice(); guardarAtiva(idx); gravarIndice(idx); },
    };
}
