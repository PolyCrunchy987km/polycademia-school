import codeListForLevels from '../../json/codeToLevelList.json';
import codeListForThemes from '../../json/codeToThemeList.json';
import referentielsActivation from '../../json/referentielsActivation.json';
import { isLessThan1Month } from '../types/dates';
import { isExerciceItemInReferentiel, isJSONReferentielEnding, } from '../types/referentiels';
/**
 * Récupérer la liste des exercices récents !
 * @param {JSONReferentielObject} refObj le référentiel à inspecter
 * @returns {ResourceAndItsPath[]} un tableau de tous les exercices ayant une date de modification/publication inférieure à un mois
 * @author sylvain
 */
export function getRecentExercices(refObj) {
    return findResourcesAndPaths(refObj, (e) => {
        if (isExerciceItemInReferentiel(e)) {
            if ((e.datePublication && isLessThan1Month(e.datePublication)) ||
                (e.dateModification && isLessThan1Month(e.dateModification))) {
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
}
/**
 * Récupérer la liste de TOUS exercices.
 * @param {JSONReferentielObject} refObj le référentiel à récupérer
 * @returns {ResourceAndItsPath[]} un tableau de tous les exercices (terminaisons) avec leur chemin
 * @author sylvain
 */
export function getAllEndings(refObj) {
    return findResourcesAndPaths(refObj, () => true);
}
/**
 * Retrouve le titre d'un niveau basé sur son code
 *
 * #### Exemple de code
 * `levelCode` : "6e" --> Traduction: "Sixième"
 * @param {string} levelCode code du niveau
 * @author sylvain
 */
export function codeToLevelTitle(levelCode) {
    const listeNiveaux = codeListForLevels;
    const listeThemes = codeListForThemes;
    if (listeNiveaux[levelCode]) {
        // une traduction du code est trouvée dans la liste des niveaux
        return listeNiveaux[levelCode];
    }
    else if (listeThemes[levelCode]) {
        // une traduction du code est trouvée dans la liste des niveaux
        return listeThemes[levelCode];
    }
    else {
        // pas d'entrée trouvée : on retourne le code
        return levelCode;
    }
}
/**
 * Parcourt toutes les branches d'un référentiel passé en paramètre
 * et remplit une liste (passée en paramètre) avec les extrémités
 * qui passent le test d'une fonction passée en paramètre
 * @param {JSONReferentielObject} referentiel le référentiel à parcourir
 * @param {JSONReferentielEnding[]} harvest la liste stockant la récolte
 * @param {function(e: JSONReferentielEnding):boolean} goalReachedWith fonction de triage
 * @author sylvain
 * @example
 * ```ts
 * fetchThrough(ref, results, (e: JSONReferentielEnding) => {
    if (isExerciceItemInReferentiel(e)) {
      return true
    } else {
      return false
    }
 * ```
 */
export function fetchThrough(referentiel, harvest, goalReachedWith) {
    Object.values(referentiel).forEach((value) => {
        if (isJSONReferentielEnding(value)) {
            if (goalReachedWith(value)) {
                harvest.push(value);
            }
        }
        else {
            fetchThrough(value, harvest, goalReachedWith);
        }
    });
}
/**
 * Parcourt un référentiel jusqu'à ses extrémités et en garde la trace
 * avec son chemin lorsque cette extrémité remplie les conditions fixées
 * par la fonction passée en paramètre
 * @param {JSONReferentielObject} referentiel Le référentiel à chercher
 * @param {(e: JSONReferentielEnding) => boolean} goalReachedWith la fonction de filtrage
 * @returns {ResourceAndItsPath[]} Une liste d'objets du type
 * `{resource: JSONReferentielEnding,  pathToResource: string[]}`
 * @author sylvain
 */
export function findResourcesAndPaths(referentiel, goalReachedWith) {
    const harvest = [];
    const path = [];
    function find(ref) {
        Object.entries(ref).forEach(([key, value]) => {
            if (isJSONReferentielEnding(value)) {
                if (goalReachedWith(value)) {
                    path.push(key);
                    harvest.push({ resource: value, pathToResource: [...path] });
                    path.pop();
                }
            }
            else {
                path.push(key);
                find(value);
                path.pop();
            }
        });
    }
    find(referentiel);
    return harvest;
}
/**
 * Recherche une ressource dans un référentiel donné correspondant à une uuid
 * passée en paramètre
 * @param referentiel le référentiel dans lequel on cherche l'uuid
 * @param targetUuid l'uuid à rechercher
 * @returns la terminaison si une seule uuid matche, `null` si pas de match
 * @throws erreur si l'uuid est retrouvée plus d'une fois
 * @author sylvain
 */
export function retrieveResourceFromUuid(referentiel, targetUuid) {
    const harvest = [];
    fetchThrough(referentiel, harvest, (resource) => resource.uuid === targetUuid);
    switch (harvest.length) {
        case 0:
            return null;
        case 1:
            return harvest[0];
        default:
            return harvest[0];
        // throw new Error(
        //   `${targetUuid} est présente ${harvest.length} fois dans le référentiel !!!`
        // )
    }
}
/**
 * À partir d'un objet de type `ResourceAndItsPath`, construit l'objet imbriqué correspondant
 * @param item Un objet constitué de la liste des nœuds et de la terminaison
 * @returns un objet aux entrées imbriquées correspondant à une branche + une terminaison
 * @author sylvain
 */
function pathToObject(item) {
    return item.pathToResource.reduceRight((value, key) => ({ [key]: value }), (React.createElement("unknown", null,
        "item.resource) as JSONReferentielObject, ) } /** * Construit \u00E0 partir d'une liste d'objet de type `ResourceAndItsPath` * la liste des objets imbriqu\u00E9s (branche+terminaison) correspondants * @param ",
        ResourceAndItsPath[],
        " items la liste des objets \u00E0 transformer * @returns ",
        JSONReferentielObject[],
        " la liste des objets transform\u00E9s * @author sylvain */ function pathsToObjectsArray( items: ResourceAndItsPath[], ): JSONReferentielObject[] ",
    ,
        "const result: JSONReferentielObject[] = [] for (const item of items) ",
        result.push(pathToObject(item)),
        "return result } /** * Fabrique de z\u00E9ro un r\u00E9f\u00E9rentiels sur la base d'entr\u00E9es constitu\u00E9es d'un chemin d'acc\u00E8s * et d'une terminaison `",
        resource,
        ": JSONReferentielEnding,  pathToResource: string[]}` * @param ",
        ResourceAndItsPath[],
        " refList la liste des entr\u00E9es pour constituer le r\u00E9f\u00E9rentiel * @returns ",
        JSONReferentielObject,
        " un r\u00E9f\u00E9rentiel sous forme d'objet * @author sylvain */ export function buildReferentiel( refList: ResourceAndItsPath[], ): JSONReferentielObject ",
    ,
        "return pathsToObjectsArray(refList).reduce((prev, current) => ",
    ,
        "return mergeReferentielObjects(prev, current) }, ",
        ") } /** * Fusionne des objets r\u00E9f\u00E9rentiels sans \u00E9craser les entr\u00E9es pr\u00E9c\u00E9dentes * @param ",
        JSONReferentielObject[],
        " objects les objets \u00E0 fusionner * @returns ",
        JSONReferentielObject,
        " un r\u00E9f\u00E9rentiel * @see https://tutorial.eyehunts.com/js/javascript-merge-objects-without-overwriting-example-code/ * @author sylvain */ export function mergeReferentielObjects( ...objects: JSONReferentielObject[] ): JSONReferentielObject ",
    ,
        "const isJSONReferentielObject = ( obj: unknown, ): obj is JSONReferentielObject => obj !== null && typeof obj === 'object' && !Array.isArray(obj) return objects.reduce((prev, obj) => ",
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];
            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            }
            else if (isJSONReferentielObject(pVal) && isJSONReferentielObject(oVal)) {
                prev[key] = mergeReferentielObjects(pVal, oVal);
            }
            else {
                prev[key] = oVal;
            }
        }),
        "return prev }, ",
        ") } /** * Consulte le fichier `src/json/referentielsActivation.json` * et retourne la valeur d'activation `true`/`false` indiqu\u00E9 pour un nom de r\u00E9f\u00E9rentiel donn\u00E9. * @param refName nom du r\u00E9f\u00E9rentiel (conform\u00E9ment au type `ReferentielNames` dans `src/lib/types.ts`) * @returns la valeur mentionn\u00E9e dans `src/json/referentielsActivation.json` ",
        React.createElement("br", null),
        " `false` si le nom du r\u00E9f\u00E9rentiel n'exoiste pas. * @author sylvain */ export function isReferentielActivated(refName: string): boolean ",
    ,
        "const referentielList = toMap(",
        ...referentielsActivation,
        ") if (referentielList.has(refName)) ",
    ,
        "return referentielList.get(refName) === 'true' } else ",
        console.warn(refName + ' is not a valid referentiel name !'),
        "return false } }")));
}
