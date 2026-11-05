// ============================================
// INTERNATIONALIZATION
// ============================================
import { en } from './en.js';
import { pt } from './pt.js';

export const i18n = { en, pt };

export let currentLang = 'en';

// Um módulo importador não pode reatribuir `currentLang`; quem troca o idioma chama setLang().
export function setLang(lang) {
    currentLang = lang;
}

export function t(key) {
    return i18n[currentLang][key] || i18n['en'][key] || key;
}

export function updateTexts() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const txt = i18n[currentLang][el.getAttribute('data-i18n-title')];
        if (txt) { el.title = txt; el.setAttribute('aria-label', txt); }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const txt = i18n[currentLang][el.getAttribute('data-i18n-aria')];
        if (txt) el.setAttribute('aria-label', txt);
    });
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[currentLang][key]) {
            el.textContent = i18n[currentLang][key];
        }
    });
}
