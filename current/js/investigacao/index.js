import {HOSPITAL} from './hospital.js';
import {MEDICINA_NUCLEAR} from './medicina-nuclear.js';
import {ZARAGOZA} from './zaragoza.js';
import {ARQUIVO_TEMPO} from './arquivo-tempo.js';
import {RADONIO_ESCOLA} from './radonio-escola.js';
import {problemaAtivo} from './problemas-pesquisa.js';
import {falsoAlarmePorId} from './falso-alarme.js';
/** Coleção de episódios no mesmo motor. Aliases preservam links da oficina. */
export const INVESTIGACOES=[HOSPITAL,MEDICINA_NUCLEAR,ZARAGOZA,ARQUIVO_TEMPO,RADONIO_ESCOLA];
/** Os problemas do Laboratório de pesquisa não aparecem como cartões próprios: são sorteados (problemas-pesquisa.js). */
export const investigacaoPorId=(id)=>INVESTIGACOES.find(x=>x.id===id||x.atalho===id)||problemaAtivo(id)||falsoAlarmePorId(id);
export {PROBLEMAS,prepararProblema,sortearProblema} from './problemas-pesquisa.js';
