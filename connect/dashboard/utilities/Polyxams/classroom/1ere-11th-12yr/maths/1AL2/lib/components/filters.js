// inspiration : https://blog.susomejias.dev/blog/design-pattern-criteria
import { MONTHS, YEARS } from '../types/dates';
import { isExerciceItemInReferentiel, resourceHasPlace, isLevelType, isTool, isStaticType, EXAMS, isExamItemInReferentiel, resourceHasMonth, } from '../types/referentiels';
import { stringWithNoAccent } from './textUtils';
/**
 * Définition un critère multiple basé sur l'intersection de plusieurs critères
 *
 * ### Intention
 *
 * Tous les critères (stockés dans une variable privée)
 * doivent être vérifiés en même temps.
 *
 * @function addCriterion ajouter un critère (ou un tableau de critères) à la liste
 */
export class MultiCriteria {
    constructor() {
        this.criteriaList = [];
    }
    addCriterion(criterion) {
        if (Array.isArray(criterion)) {
            for (const item of criterion) {
                this.criteriaList.push(item);
            }
        }
        else {
            this.criteriaList.push(criterion);
        }
        return this;
    }
    meetCriterion(items) {
        let result = items;
        for (const criterion of this.criteriaList) {
            result = criterion.meetCriterion(result);
        }
        return result;
    }
}
/**
 * Définition d'un critère basé sur l'union de deux autres
 *
 * ### Intention
 *
 * Le critère contrôle si l'un ou l'autre des deux critères passés en paramètres
 * est vérifié.
 */
export class OrCriteria {
    constructor(firstCriterion, secondCriterion) {
        this.firstCriterion = firstCriterion;
        this.secondCriterion = secondCriterion;
    }
    meetCriterion(items) {
        const firstResult = this.firstCriterion.meetCriterion(items);
        const secondResult = this.secondCriterion.meetCriterion(items);
        return Array.from(new Set([...firstResult, ...secondResult]));
    }
}
/**
 * Définition d'un critère multiple basé sur l'union de tous les critères
 *
 * ### Intention
 *
 * Ce critère sera vérifié si l'un au moins des critères
 * (stockés dans une variable privée) est vérifié.
 *
 * @function addCriterion ajouter un critère (ou un tableau de critères) à la liste
 */
export class AtLeastOneOfCriteria {
    // au moins deux critères sont demandés par le constructeur
    constructor(criteriaList) {
        this.criteriaList = [...criteriaList];
    }
    addCriterion(criterion) {
        if (Array.isArray(criterion)) {
            for (const item of criterion) {
                this.criteriaList.push(item);
            }
        }
        else {
            this.criteriaList.push(criterion);
        }
        return this;
    }
    meetCriterion(items) {
        const [firstCriterion, secondCriterion, ...list] = [...this.criteriaList];
        let resultCriterion = new OrCriteria(firstCriterion, secondCriterion);
        for (const criterion of list) {
            resultCriterion = new OrCriteria(resultCriterion, criterion);
        }
        return resultCriterion.meetCriterion(items);
    }
}
/**
 * Établie un critère de filtration sur la base d'une liste de spécifications
 * passée en paramètres
 * @remark Au 2023-10-01, seulement `amc` et `interactif` comme spécification autorisée
 * @param {[('interactif' | 'amc')]}specs liste des spécifications à rechercher (sur la base du ET)
 * @returns {Criterion<ResourceAndItsPath>} un critère pour filtration
 * @example
 * ```ts
 * const all = getAllEndings(baseReferentiel)                // création de l'objet de recherche
  const amcSpec = featuresCriteria(['amc'])                   // création du filtre
  const filteredList = amcSpec.meetCriterion(all)             // utilisation du filtre
  const filteredReferentiel = buildReferentiel(filteredList)  // reconstitution du référentiel
  ```
 */
export function featuresCriteria(specs) {
    // construction du critère pour la spécification `amc`
    const amcCriterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                if (isExerciceItemInReferentiel(item.resource)) {
                    if (item.resource.features.amc &&
                        item.resource.features.amc.isActive) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        },
    };
    // construction du critère pour la spécification `qcm`
    const qcmCriterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                if (isExerciceItemInReferentiel(item.resource)) {
                    if (item.resource.features.qcm &&
                        item.resource.features.qcm.isActive) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        },
    };
    // construction du critère pour la spécification `qcmcam`
    const qcmcamCriterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                if (isExerciceItemInReferentiel(item.resource)) {
                    if (item.resource.features.qcmcam &&
                        item.resource.features.qcmcam.isActive) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        },
    };
    // construction du critère pour la spécification `interactif`
    const interactifCriterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                if (isExerciceItemInReferentiel(item.resource)) {
                    if (item.resource.features.interactif &&
                        item.resource.features.interactif.isActive) {
                        // console.log('found interactive :')
                        // console.log(item.resource)
                        return true;
                    }
                    else {
                        // console.log('found non interactive :')
                        // console.log(item.resource)
                        return false;
                    }
                }
                else {
                    return false;
                }
            });
        },
    };
    // on trie en fonction de ce que contient la liste des spécifications
    if (specs.length < 2) {
        if (specs.length === 0) {
            // la liste ne peut pas être vide
            throw new Error('La liste des spécifications passée en paramètre est vide !');
        }
        // une seule spécification est présente : on renvoie le critère correspondant
        switch (specs[0]) {
            case 'amc':
                return amcCriterion;
            case 'interactif':
                return interactifCriterion;
            case 'qcm':
                return qcmCriterion;
            case 'qcmcam':
                return qcmcamCriterion;
        }
    }
    else {
        //  on renvoie l'intersection des critères
        const criterion = new MultiCriteria();
        for (const spec of specs) {
            switch (spec) {
                case 'amc':
                    criterion.addCriterion(amcCriterion);
                    break;
                case 'interactif':
                    criterion.addCriterion(interactifCriterion);
                    break;
                case 'qcm':
                    criterion.addCriterion(qcmCriterion);
                    break;
                case 'qcmcam':
                    criterion.addCriterion(qcmcamCriterion);
                    break;
            }
        }
        return criterion;
    }
}
/**
 * Construit un critère pour filtrer une liste d'objets `ResourceAndItsPath`
 * contre un niveau de classe
 * @param {Level} level le niveau de classe retenu
 * @param {boolean} [considerCAN=false] doit-on inclure les exos CAN ou pas ?
 * @returns { Criterion<ResourceAndItsPath>} un critère pour filtration
 */
export function levelCriterion(level, considerCAN = true) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                // static est considéré comme un niveau particulier
                if (level === 'alea') {
                    return !isStaticType(item.resource);
                }
                if (level === 'static') {
                    return isStaticType(item.resource);
                }
                // CAN est considéré comme un niveau donc on court-circuite les tests
                if (level === 'CAN') {
                    return item.pathToResource[0] === level;
                }
                if (considerCAN && item.pathToResource[0] === 'CAN') {
                    // cas où on veut des exercices CAN, on regarde le 2e élément du chemin
                    return item.pathToResource[1] === level;
                }
                else if (['1e', 'Terminale'].includes(item.pathToResource[0])) {
                    return item.pathToResource[1] === level;
                }
                else {
                    // dans l'autre cas, le niveau est dans le 1er élément du chemin
                    return item.pathToResource[0] === level;
                }
            });
        },
    };
    return criterion;
}
/**
 * Construit un critère pour filtrer une liste d'objets `ResourceAndItsPath`
 * contre un sujet à rechercher dans la liste des tags
 * @param {string} selectedTag le sujet recherché dans les tags
 * @returns { Criterion<ResourceAndItsPath>} un critère pour filtration
 */
export function tagCriterion(selectedTag) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => item.resource.tags &&
                item.resource.tags
                    .map((t) => stringWithNoAccent(t.toLowerCase()))
                    .find((t) => t.includes(stringWithNoAccent(selectedTag.toLowerCase()))));
        },
    };
    return criterion;
}
export function monthCriterion(monthToMatch) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => MONTHS.find((t) => t.includes(monthToMatch.toLowerCase())) &&
                resourceHasMonth(item.resource) &&
                item.resource.mois &&
                item.resource.mois.toLowerCase().includes(monthToMatch.toLowerCase()));
        },
    };
    return criterion;
}
export function idCriterion(idToMatch) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                if (isExerciceItemInReferentiel(item.resource) ||
                    isTool(item.resource)) {
                    return item.resource.id
                        .toLowerCase()
                        .includes(idToMatch.toLowerCase());
                }
                else {
                    return false;
                }
            });
        },
    };
    return criterion;
}
export function examCriterion(examToMatch) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                // console.log('examToMatch.toLowerCase()')
                // console.log(examToMatch.toLowerCase())
                return (EXAMS.includes(examToMatch.toLowerCase()) &&
                    item.resource.uuid.startsWith(examToMatch.toLowerCase()));
            });
        },
    };
    return criterion;
}
export function yearCriterion(yearToMatch) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                return (YEARS.includes(yearToMatch) &&
                    isExamItemInReferentiel(item.resource) &&
                    item.resource.annee === yearToMatch);
            });
        },
    };
    return criterion;
}
/**
 * Construit un critère de filtration sur un sujet (chaîne de caractères).
 * La recherche s'effectue sur le titre (s'il y en a) ou sur le lieu (s'il y en a)
 * @param {String} subject le sujet à rechercher
 * @param {boolean} [isCanIncluded=false] doit-on inclure les exercices CAN dans le critère de la recherche
 * @returns { Criterion<ResourceAndItsPath>} un critère pour filtration
 */
export function subjectCriterion(subject, isCanIncluded = true) {
    const criterion = {
        meetCriterion(items) {
            return items.filter((item) => {
                const subjectToLowerCaseWithoutAccent = stringWithNoAccent(subject.toLowerCase());
                if (item.pathToResource.includes('CAN') && !isCanIncluded) {
                    return false;
                }
                // on recherche un lieu
                let placeMatch = false;
                if (resourceHasPlace(item.resource)) {
                    // si le sujet est un lieu et que la ressource a `lieu` dans ses propriété, on compare
                    placeMatch = stringWithNoAccent(item.resource.lieu.toLowerCase()).includes(subjectToLowerCaseWithoutAccent);
                }
                // on rechercher dans le titre
                if (isExerciceItemInReferentiel(item.resource)) {
                    // la ressource est un exercice : elle a donc un titre
                    if (stringWithNoAccent(item.resource.titre.toLowerCase()).includes(subjectToLowerCaseWithoutAccent)) {
                        return true;
                    }
                    else {
                        return false || placeMatch;
                    }
                }
                else {
                    return false || placeMatch;
                }
            });
        },
    };
    return criterion;
}
/**
 * Construit une liste de critères en les taguant ET ou OU
 * @param input chaîne de caractères pour l'inout
 * @param isCanIncluded flag pour l'inclusion des CAN
 * @returns liste d'objets du type {connector: 'ET'|'OU', filter: Criterion<ResourceAndItsPath>}
 */
export function buildCriteriaFromString(input, isCanIncluded = true) {
    const criteria = [];
    // on construit le tableau des mots recherchés en retirant les espaces superflus
    // mais en préservant les chaînes entre guillemets ou apostrophes
    // pour l'idée, voir : https://stackoverflow.com/a/16261693/6625987
    const re = /(?:[^\s"']+|['"][^'"]*["'])+/g;
    // on enlève les espace aux bornes et on partage la chaîne sur un ou plusieurs espace entre les mots (ainsi pas de chaine vide dans le tableau)
    const regExpResult = input.trim().match(re);
    const wordsTemp = regExpResult === null ? [] : [...regExpResult];
    const words = [];
    // on traite les OU en détectant les caractères | dans les chaînes
    for (const w of wordsTemp) {
        if (w.includes('+')) {
            // do somthing
            const list = w.split('+');
            const premier = list.shift();
            if (premier) {
                words.push(premier);
            }
            for (const w of list) {
                words.push('+' + w);
            }
        }
        else {
            words.push(w);
        }
    }
    // console.log('words')
    // console.log(words)
    if (words.length === 0 || (words.length === 1 && words[0].length === 0)) {
        // la chaîne explorée ne doit pas être vide
        throw new Error('Search input should not be empty when building Criteria');
    }
    else {
        // on regarde si `CAN` est un mot pour inclure les exos CAN dans le critère de recherche
        if (words.map((word) => word.toUpperCase()).includes('CAN')) {
            isCanIncluded = true;
        }
        // on nettoie les guillemets ou apostrophes si présentes dans une chaîne
        // (une chaîne peut être : "labyrinthe de multiples", "l'heure", 'informations inutiles')
        words.forEach((word, index, theArray) => {
            let w = word;
            if (/^['"]/.test(word)) {
                // la chaîne contient un guillemet ou apostrophe au début
                w = w.slice(1); // on retire le premier caractère
            }
            if (/['"]$/.test(word)) {
                // la chaîne contient un guillemet ou apostrophe à la fin
                w = w.slice(0, -1); // on retire le dernier caractère
            }
            theArray[index] = w;
        });
        // console.log('words (avant boucle)')
        // console.log(words)
        for (const word of words) {
            const connector = word.startsWith('+') ? 'OU' : 'ET';
            const realWord = word.replace('+', '');
            // console.log('realWord: ' + realWord)
            if (isLevelType(realWord)) {
                // console.log('found level')
                criteria.push({
                    connector,
                    filter: levelCriterion(realWord, isCanIncluded),
                });
                continue;
            }
            if (EXAMS.includes(realWord.toLowerCase())) {
                // console.log('found exam')
                criteria.push({ connector, filter: examCriterion(realWord) });
                continue;
            }
            if (YEARS.includes(realWord)) {
                // console.log('found year')
                criteria.push({ connector, filter: yearCriterion(realWord) });
                continue;
            }
            // le mot n'est ni un niveau, ni un examen
            // console.log('found subject')
            criteria.push({
                connector,
                filter: new AtLeastOneOfCriteria([
                    subjectCriterion(realWord, isCanIncluded),
                    tagCriterion(realWord),
                    idCriterion(realWord),
                    monthCriterion(realWord),
                ]),
            });
        }
    }
    return criteria;
}
/**
 * Construit un critère unique basé sur la chaîne passée en paramètres.
 * Les mots précédés d'un signe `+` sont traités comme des critères ET
 * et les autres comme des critères OU.
 * @param input Chaîne de caractères utilisée pour la fabrication des critères
 * @param isCanIncluded flag pour inclure les CAN
 * @returns un critère unique
 */
export function stringToCriterion(input, isCanIncluded = true) {
    if (input.length === 0) {
        // la chaîne explorée ne doit pas être vide
        throw new Error('Search input should not be empty when building Criteria');
    }
    else {
        const criteria = buildCriteriaFromString(input, isCanIncluded);
        if (criteria.length === 1) {
            // on a un seul critère : peut importe ET/OU
            return criteria[0].filter;
        }
        else {
            // on a au moins deux critères : on va inspecter la liste des critères :
            // on va isoler les critères avec un connecteur ET
            // et on va regrouper les critères avec un connecteur OU
            // en un seul critère en en faisant l'union. Ainsi,
            // on aura une seule liste de critères dont il faudra faire l'intersection
            const justAndCriteria = [];
            const orAssociations = [];
            let orListTransit = [];
            // dans un premier temps, on regroupe les OU dans des listes
            // et on isole les ET
            criteria.forEach((item, i) => {
                if (i === 0) {
                    // c'est le premier terme, on l'ajoute d'office
                    orListTransit.push(item.filter);
                }
                else {
                    if (item.connector === 'OU') {
                        // l'élément courant a un connecteur OU
                        // on remplit la liste des OU
                        orListTransit.push(item.filter);
                    }
                    else {
                        // l'élément courant a un connecteur ET
                        // on remplit la liste des associations
                        orAssociations.push(orListTransit);
                        // on purge la liste des OU
                        orListTransit = [];
                        // on y met l'élément courant
                        orListTransit.push(item.filter);
                    }
                }
            });
            // on ajoute la dernière liste de transit
            orAssociations.push(orListTransit);
            // on traite les listes : s'il y a un seul élément,
            // on l'ajoute directement sinon on en fait l'union
            orAssociations.forEach((list) => {
                if (list.length === 1) {
                    // il y a un seul éléments: il a forcément un critère ET on l'ajoute directement
                    justAndCriteria.push(list[0]);
                }
                else {
                    // il y a plusieurs références, on doit en faire l'union
                    const [first, second, ...others] = [...list];
                    const orCriteriaUnion = new AtLeastOneOfCriteria([
                        first,
                        second,
                        ...others,
                    ]);
                    justAndCriteria.push(orCriteriaUnion);
                }
            });
            // à ce stade, il n'y a plus de connecteurs OU
            // on fait l'intersection de tous les critères
            const c = new MultiCriteria();
            justAndCriteria.forEach((item) => c.addCriterion(item));
            return c;
        }
    }
