// ============================================
// CADERNO DE CAMPO (permanente, vale para todas as missões)
// Fichas dos conceitos já vistos, selos de domínio (0-4) e as lacunas por descobrir. Só leitura.
// ============================================
import { CONCEITOS, TEMAS } from '../data/encontros/conceitos.js';
import { PERGUNTAS } from '../data/encontros/perguntas.js';
import { MISSIONS } from '../data/missoes/index.js';
import { GameState } from '../estado.js';
import { currentLang, t } from '../i18n/index.js';

const el = (tag, cls, texto) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (texto !== undefined) e.textContent = texto;
    return e;
};

const NOME_TEMA_ICONE = { natureza: '🌍', decaimento: '⏳', protecao: '🛡️', dose: '☢️', fontes: '📦', historias: '📰' };
let abaAtual = TEMAS[0];

/** Um nó conta como descoberto quando o jogador já o viu em algum encontro. */
export const descoberto = (id) => {
    const a = GameState.aprendizado || {};
    return !!((a.nos && a.nos[id] && a.nos[id].v > 0) || (a.fichas && a.fichas[id]));
};

function carta(c) {
    const l = c[currentLang] || c.pt;
    const a = (GameState.aprendizado.nos || {})[c.id] || { m: 0, v: 0, a: 0, e: 0 };
    const abre = descoberto(c.id);
    const d = el('article', 'cad-carta' + (abre ? '' : ' fechada'));
    if (!abre) {
        d.append(el('h4', 'cad-carta-titulo', '🔒 ' + t('notebookLocked')));
        const ms = c.missoes.map((id) => MISSIONS.find((m) => m.id === id)).filter(Boolean).map((m) => t(m.titleKey));
        d.append(el('p', 'cad-dica', t('notebookWhere').replace('{0}', ms.join(' · '))));
        return d;
    }
    d.append(el('h4', 'cad-carta-titulo', l.titulo));
    d.append(el('p', 'cad-ficha', l.ficha));
    d.append(el('p', 'cad-fonte', t('encSource') + ': ' + l.fonte));
    const sel = el('div', 'cad-selos');
    sel.setAttribute('role', 'img');
    const nivel = Math.floor(a.m);
    sel.setAttribute('aria-label', t('notebookMastery') + ': ' + nivel + '/4');
    for (let i = 1; i <= 4; i++) sel.append(el('span', 'cad-selo' + (i <= nivel ? ' cheio' : ''), i <= nivel ? '★' : '☆'));
    const respondidas = a.a + a.e;
    const meta = el('div', 'cad-meta');
    meta.append(el('span', 'cad-dominio', t('notebookMastery')), sel, el('span', 'cad-contagem', t('notebookAnswered').replace('{0}', a.a).replace('{1}', respondidas)));
    d.append(meta);
    return d;
}

export function desenharCaderno() {
    const abas = document.getElementById('caderno-abas');
    const folha = document.getElementById('caderno-folha');
    const resumo = document.getElementById('caderno-resumo');
    if (!abas || !folha) return;
    const nDesc = CONCEITOS.filter((c) => descoberto(c.id)).length;
    resumo.textContent = t('notebookCount').replace('{0}', nDesc).replace('{1}', CONCEITOS.length);
    abas.replaceChildren();
    TEMAS.forEach((tema) => {
        const nos = CONCEITOS.filter((c) => c.tema === tema);
        const n = nos.filter((c) => descoberto(c.id)).length;
        const b = el('button', 'cad-aba' + (tema === abaAtual ? ' ativa' : ''));
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', tema === abaAtual ? 'true' : 'false');
        b.id = 'cad-aba-' + tema;
        b.setAttribute('aria-controls', 'caderno-folha');
        b.setAttribute('aria-label', `${t('encTheme_' + tema)}: ${n}/${nos.length}`);   // no celular o nome some da tela: o nome acessível não pode sumir junto
        b.append(el('span', 'cad-aba-icone', NOME_TEMA_ICONE[tema]), el('span', 'cad-aba-nome', t('encTheme_' + tema)), el('span', 'cad-aba-n', `${n}/${nos.length}`));
        b.addEventListener('click', () => { abaAtual = tema; desenharCaderno(); });
        abas.append(b);
    });
    folha.replaceChildren();
    folha.setAttribute('role', 'tabpanel');
    folha.setAttribute('aria-labelledby', 'cad-aba-' + abaAtual);
    const nos = CONCEITOS.filter((c) => c.tema === abaAtual);
    nos.forEach((c) => folha.append(carta(c)));
    if (!nos.length) folha.append(el('p', 'cad-dica', t('notebookEmpty')));
}

export const totalPerguntas = PERGUNTAS.length;
