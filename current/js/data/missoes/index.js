import { missao as tutorial } from './00-primeiros-passos.js';
import { missao as missao01 } from './01-treinamento.js';
import { missao as missao02 } from './02-goiania.js';
import { missao as missao03 } from './03-radium-girls.js';
import { missao as missao04 } from './04-chernobyl.js';
import { missao as missao05 } from './05-lia-georgia.js';
import { missao as missao06 } from './06-zaragoza.js';
import { missao as missao07 } from './07-mayapuri.js';
import { missao as missao08 } from './08-fukushima.js';

// Mission definitions - based on REAL accidents
export const MISSIONS = [
    missao01,
    missao02,
    missao03,
    missao04,
    missao05,
    missao06,
    missao07,
    missao08,
];

/** Tutorial "Primeiros passos" (id 1, como a Academia): usado no treinamento da Agência. A Academia completa fica em MISSIONS[0]. */
export const TUTORIAL = tutorial;
