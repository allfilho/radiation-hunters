// Compatibilidade com a investigação original; a implementação é compartilhada por todos os episódios.
import {InvestigacaoScene,missaoInvestigacao} from './campo.js';
export {InvestigacaoScene as HospitalScene};
export const missaoHospital=(lang)=>missaoInvestigacao('hospital-imagem',lang);
