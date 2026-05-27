import Hms from '../modules/Hms';
import { Complexe } from './mathFonctions/Complexe';
export const FILTER_SECTIONS_TITLES = {
    levels: 'Niveaux',
    specs: 'Fonctionnalités',
    types: 'Types',
};
export function isInteractivityType(value) {
    return (value === 'qcm' ||
        value === 'mathlive' ||
        value === 'fillInTheBlank' ||
        value === 'tableauMathlive' ||
        value === 'texte' ||
        value === 'cliqueFigure' ||
        value === 'dnd' ||
        value === 'listeDeroulante' ||
        value === 'custom' ||
        value === 'tableur' ||
        value === 'MetaInteractif2d' ||
        value === 'svgSelection' ||
        value === 'multiMathfield');
}
export function isAnswerType(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        'value' in obj &&
        isAnswerValueType(obj.value));
}
/**
 * Type pour une valeur normalisée (après traitement)
 */
/**
 * Type guard pour vérifier si une valeur est de type Valeur
 */
export function isValeur(value) {
    return typeof value === 'object' && value !== null;
}
/**
 * Détecte structurellement une FractionEtendue sans dépendance runtime.
 * On considère qu'un objet avec une méthode sommeFraction est une FractionEtendue.
 */
export function isFractionEtendue(x) {
    return (typeof x === 'object' &&
        x !== null &&
        typeof x.sommeFraction === 'function');
}
/**
 * Détecte structurellement une Grandeur sans dépendance runtime.
 * On considère qu'un objet avec une propriété uniteDeReference est une Grandeur.
 */
export function isGrandeur(x) {
    return (typeof x === 'object' &&
        x !== null &&
        typeof x.uniteDeReference === 'string');
}
/**
 * Détecte structurellement un Decimal sans utiliser instanceof.
 * On vérifie la présence de quelques méthodes caractéristiques des instances Decimal.
 */
export function isDecimal(x) {
    return (typeof x === 'object' &&
        x !== null &&
        typeof x.toDP === 'function' &&
        typeof x.toFixed === 'function' &&
        typeof x.plus === 'function');
}
export function isAnswerValueType(value) {
    return (typeof value === 'string' ||
        (Array.isArray(value) &&
            value.every((value) => typeof value === 'string')) ||
        typeof value === 'number' ||
        (Array.isArray(value) &&
            value.every((value) => typeof value === 'number')) ||
        isFractionEtendue(value) ||
        (Array.isArray(value) && value.every((v) => isFractionEtendue(v))) ||
        isDecimal(value) ||
        (Array.isArray(value) && value.every((v) => isDecimal(v))) ||
        isGrandeur(value) ||
        (Array.isArray(value) && value.every((v) => isGrandeur(v))) ||
        value instanceof Hms ||
        (Array.isArray(value) && value.every((value) => value instanceof Hms)) ||
        value instanceof Complexe ||
        (Array.isArray(value) && value.every((value) => value instanceof Complexe)));
}
export function isReponseComplexe(value) {
    return isAnswerValueType(value) || isValeur(value);
}
export function isOldFormatInteractifType(value) {
    return (value === 'calcul' ||
        value === 'texte' ||
        value === 'tableauMathlive' ||
        value === 'Num' ||
        value === 'Den' ||
        value === 'fractionEgale' ||
        value === 'unites' ||
        value === 'intervalleStrict' ||
        value === 'intervalle' ||
        value === 'puissance' ||
        value === 'canonicalAdd' ||
        value === 'ignorerCasse');
}
export function isIExercice(ex) {
    return ex.typeExercice !== 'statique';
}
