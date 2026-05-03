import codeListForLevels from '../../json/codeToLevelList.json'
import codeListForThemes from '../../json/codeToThemeList.json'
import referentielsActivation from '../../json/referentielsActivation.json'
import { isLessThan1Month } from '../types/dates'
import {
    type JSONReferentielEnding,
    type JSONReferentielObject,
    type ResourceAndItsPath,
    isExerciceItemInReferentiel,
    isJSONReferentielEnding,
} from '../types/referentiels'
import { toMap } from './toMap'

/**
 * Récupérer la liste des exercices récents !
 * @param {JSONReferentielObject} refObj le référentiel à inspecter
 * @returns {ResourceAndItsPath[]} un tableau de tous les exercices ayant une date de modification/publication inférieure à un mois
 * @author sylvain
 */
export function getRecentExercices(
  refObj: JSONReferentielObject,
): ResourceAndItsPath[] {
  return findResourcesAndPaths(refObj, (e: JSONReferentielEnding) => {
    if (isExerciceItemInReferentiel(e)) {
      if (
        (e.datePublication && isLessThan1Month(e.datePublication)) ||
        (e.dateModification && isLessThan1Month(e.dateModification))
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  })
}

/**
 * Récupérer la liste de TOUS exercices.
 * @param {JSONReferentielObject} refObj le référentiel à récupérer
 * @returns {ResourceAndItsPath[]} un tableau de tous les exercices (terminaisons) avec leur chemin
 * @author sylvain
 */
export function getAllEndings(
  refObj: JSONReferentielObject,
): ResourceAndItsPath[] {
  return findResourcesAndPaths(refObj, () => true)
}

/**
 * Retrouve le titre d'un niveau basé sur son code
 *
 * #### Exemple de code
 * `levelCode` : "6e" --> Traduction: "Sixième"
 * @param {string} levelCode code du niveau
 * @author sylvain
 */
export function codeToLevelTitle(levelCode: string): string {
  const listeNiveaux: { [key: string]: string } = codeListForLevels
  const listeThemes: { [key: string]: string } = codeListForThemes
  if (listeNiveaux[levelCode]) {
    // une traduction du code est trouvée dans la liste des niveaux
    return listeNiveaux[levelCode]
  } else if (listeThemes[levelCode]) {
    // une traduction du code est trouvée dans la liste des niveaux
    return listeThemes[levelCode]
  } else {
    // pas d'entrée trouvée : on retourne le code
    return levelCode
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
export function fetchThrough(
  referentiel: JSONReferentielObject,
  harvest: JSONReferentielEnding[],
  goalReachedWith: (e: JSONReferentielEnding) => boolean,
): void {
  Object.values(referentiel).forEach((value) => {
    if (isJSONReferentielEnding(value)) {
      if (goalReachedWith(value)) {
        harvest.push(value)
      }
    } else {
      fetchThrough(value as JSONReferentielObject, harvest, goalReachedWith)
    }
  })
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
export function findResourcesAndPaths(
  referentiel: JSONReferentielObject,
  goalReachedWith: (e: JSONReferentielEnding) => boolean,
): ResourceAndItsPath[] {
  const harvest: ResourceAndItsPath[] = []
  const path: string[] = []
  function find(ref: JSONReferentielObject) {
    Object.entries(ref).forEach(([key, value]) => {
      if (isJSONReferentielEnding(value)) {
        if (goalReachedWith(value)) {
          path.push(key)
          harvest.push({ resource: value, pathToResource: [...path] })
          path.pop()
        }
      } else {
        path.push(key)
        find(value as JSONReferentielObject)
        path.pop()
      }
    })
  }
  find(referentiel)
  return harvest
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
export function retrieveResourceFromUuid(
  referentiel: JSONReferentielObject,
  targetUuid: string,
): JSONReferentielEnding | null {
  const harvest: JSONReferentielEnding[] = []
  fetchThrough(
    referentiel,
    harvest,
    (resource: JSONReferentielEnding) => resource.uuid === targetUuid,
  )
  switch (harvest.length) {
    case 0:
      return null
    case 1:
      return harvest[0]
    default:
      return harvest[0]
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
function pathToObject(item: ResourceAndItsPath): JSONReferentielObject {
  return item.pathToResource.reduceRight(
    (value, key) => ({ [key]: value }),
    (<unknown>item.resource) as JSONReferentielObject,
  )
}

/**
 * Construit à partir d'une liste d'objet de type `ResourceAndItsPath`
 * la liste des objets imbriqués (branche+terminaison) correspondants
 * @param {ResourceAndItsPath[]} items la liste des objets à transformer
 * @returns {JSONReferentielObject[]} la liste des objets transformés
 * @author sylvain
 */
function pathsToObjectsArray(
  items: ResourceAndItsPath[],
): JSONReferentielObject[] {
  const result: JSONReferentielObject[] = []
  for (const item of items) {
    result.push(pathToObject(item))
  }
  return result
}

/**
 * Fabrique de zéro un référentiels sur la base d'entrées constituées d'un chemin d'accès
 * et d'une terminaison `{resource: JSONReferentielEnding,  pathToResource: string[]}`
 * @param {ResourceAndItsPath[]} refList la liste des entrées pour constituer le référentiel
 * @returns {JSONReferentielObject} un référentiel sous forme d'objet
 * @author sylvain
 */
export function buildReferentiel(
  refList: ResourceAndItsPath[],
): JSONReferentielObject {
  return pathsToObjectsArray(refList).reduce((prev, current) => {
    return mergeReferentielObjects(prev, current)
  }, {})
}

/**
 * Fusionne des objets référentiels sans écraser les entrées précédentes
 * @param {JSONReferentielObject[]} objects les objets à fusionner
 * @returns {JSONReferentielObject} un référentiel
 * @see https://tutorial.eyehunts.com/js/javascript-merge-objects-without-overwriting-example-code/
 * @author sylvain
 */
export function mergeReferentielObjects(
  ...objects: JSONReferentielObject[]
): JSONReferentielObject {
  const isJSONReferentielObject = (
    obj: unknown,
  ): obj is JSONReferentielObject =>
    obj !== null && typeof obj === 'object' && !Array.isArray(obj)
  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key]
      const oVal = obj[key]
      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal)
      } else if (isJSONReferentielObject(pVal) && isJSONReferentielObject(oVal)) {
        prev[key] = mergeReferentielObjects(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

/**
 * Consulte le fichier `src/json/referentielsActivation.json`
 * et retourne la valeur d'activation `true`/`false` indiqué pour un nom de référentiel donné.
 * @param refName nom du référentiel (conformément au type `ReferentielNames` dans `src/lib/types.ts`)
 * @returns la valeur mentionnée dans `src/json/referentielsActivation.json` <br/> `false` si le nom du référentiel n'exoiste pas.
 * @author sylvain
 */
export function isReferentielActivated(refName: string): boolean {
  const referentielList = toMap({ ...referentielsActivation })
  if (referentielList.has(refName)) {
    return referentielList.get(refName) === 'true'
  } else {
    console.warn(refName + ' is not a valid referentiel name !')
    return false
  }
}
