import type { FrenchDateString } from './dates'
import codeList from '../../json/codeToLevelList.json'
import referentielsActivationList from '../../json/referentielsActivation.json'
// ===========================================================================
//
//    Types des bouts de chaînes des référentiels (les données des exercices)
//
// ===========================================================================
export const EXAMS = ['dnb', 'dnbpro', 'bac', 'crpe', 'e3c', 'evacom']
export type Level = keyof typeof codeList | 'alea'
export type ActivationName = keyof typeof referentielsActivationList
/**
 * Paramètres d'une fonctionnalité
 * @interface FeatureParams
 * @property {string} type : mot clé décrivant le type de l'interactivité
 * @property {boolean} isActive : flag pour savoir si la fonctionnalité est activée ou pas
 */
export interface FeatureParams {
  type: string
  isActive: boolean
}

/**
 * Fonctionnalités supplémentaires d'un exercice.
 * @remark **Au 2024-11-03, ces fonctionnalités sont au nombre de trois seulement**
 * @interface Features
 * @property {FeatureParams} interactif : interactivité dans l'exercice
 * @property {FeatureParams} amc : possibilité d'exportation pour utilisation dans AMC
 * @property {FeatureParams} qcm : possibilité d'exportation pour utilisation dans AMC
 */
export interface Features {
  interactif?: FeatureParams
  amc?: FeatureParams
  qcm?: FeatureParams
  qcmcam?: FeatureParams
}

/**
 * Description d'une application tierce
 * @interface AppTierce
 * @property {string} uuid : identifiant unique généré définitivement par le moteur à la création de l'exercice
 * @property {tring} title : titre de l'application
 * @property {string} presentation : texte bref expliquant les intentions de l'application
 * @property {string} imgPath : chemin vers le fichier image dans l'arborescence
 */
export interface AppTierce {
  uuid: string
  title: string
  presentation: string
  imgPath: string
}

/**
 * Groupe d'applications tierces liées par une provenance
 * @interface AppTierceGroup
 * @property {string} rubrique : titre de la rubrique sous laquelle sont regroupées les applications
 * @property {AppTierce[]} liste : liste des applications dans le groupe
 */
export interface AppTierceGroup {
  rubrique: string
  liste: AppTierce[]
}

/**
 * Tous les type de ressources disponibles dans un référentiel
 */
export type ExerciseType =
  | 'alea'
  | 'dnb'
  | 'dnbpro'
  | 'crpe'
  | 'bac'
  | 'simple'
  | 'html'
  | 'svelte'
  | 'e3c'
  | 'evacom'
  | 'outil'
  | 'tierce'
  | 'static'

/**
 * Description d'un objet de base dans un reerentiel de ressources
 * @interface BaseItemInReferentiel
 * @property {string} uuid : identifiant unique généré définitivement par le moteur à la création de l'exercice
 * @property {string[]} tags : listes de toutes les étiquettes marquant les sujets couverts par la ressource
 * @property {ExerciseType} typeExercice : catégorie de la ressource
 */
export interface BaseItemInReferentiel {
  uuid: string
  tags: string[]
  typeExercice: ExerciseType
}

/**
 * Description d'une ressource d'un exercice CRPE dans un référentiel
 * @interface crpeItemInreferentiel
 * @extends BaseItemInReferentiel
 * @property {string[]} png : liste des chemins vers les images des contenus de la ressource
 * @property {string[]} pngCor : liste des chemins vers les images des correction des contenus de la ressource
 * @property {string} tex: chemin vers le source LaTeX du contenu
 * @property {string} texCor: chemin vers le source LaTeX de la correction du contenu
 */
export interface crpeItemInreferentiel extends BaseItemInReferentiel {
  png: string[]
  pngCor: string[]
  tex?: string
  texCor?: string
  annee: string
  lieu: string
  numeroInitial: string
  typeExercice: 'crpe'
}

/**
 * Description d'une ressource statique dans un référentiel
 * @interface StaticItemInreferentiel
 * @extends BaseItemInReferentiel
 * @property {string[]} png : liste des chemins vers les images des contenus de la ressource
 * @property {string[]} pngCor : liste des chemins vers les images des correction des contenus de la ressource
 * @property {string} tex: chemin vers le source LaTeX du contenu
 * @property {string} texCor: chemin vers le source LaTeX de la correction du contenu
 */
export interface StaticItemInreferentiel extends BaseItemInReferentiel {
  png: string
  pngCor: string
  tex: string
  texCor: string
  typeExercice: 'static' | 'dnb' | 'dnbpro' | 'bac' | 'e3c' | 'evacom'
}

/**
 * Description d'une ressource venant un examen dans un référentiel
 * @interface ExamItemInReferentiel
 * @extends StaticItemInreferentiel
 * @property {string|undefined} mois : mois de la publication de l'examen (optionnel)
 * @property {string} annee : année de la publication de l'examen
 * @property {string} lieu : endroit où a été diffusé l'examen
 * @property {string} numeroInitial : numérode positionnement de l'exercice dans le sujet initial de l'examen
 */
export interface ExamItemInReferentiel extends StaticItemInreferentiel {
  mois?: string
  annee: string
  lieu: string
  numeroInitial: string
  jour?: 'J1' | 'J2'
  typeExercice: 'dnb' | 'dnbpro' | 'bac'
}

/**
 * Description dans un référentiel d'un exercice MathALÉA typique
 * @interface ExerciceItemInReferentiel
 * @extends BaseItemInReferentiel
 * @property {string} url : chemin vers les sources javascript de l'exercice
 * @property {string} id : identifiant provenant du référentiel de classification des compétences (différent de `uuid`)
 * @property {Feature[]} features : liste des fonctionnalités supplémentaires de l'exercice (`interactif` et/ou `amc`)
 * @property {string} datePublication : date de la publication de l'exercice (optionnel)
 * @property {string} dateModification : date de la *dernière* modification de l'exercice (optionnel)
 */
export interface ExerciceItemInReferentiel extends BaseItemInReferentiel {
  url: string
  id: string
  titre: string
  features: Features
  datePublication?: FrenchDateString
  dateModification?: FrenchDateString
  typeExercice: 'alea'
}

export interface ToolItemInReferentiel extends BaseItemInReferentiel {
  url: string
  id: string
  titre: string
  typeExercice: 'outil' | 'html'
}
// ===========================================================================
//
//    Type pour les référentiels eux-mêmes
//
// ===========================================================================

/**
 * Type récursif pour les référentiels eux-mêmes : en récupérant les JSON en import
 * on fabrique un objet dont le type est défini ci-dessous. Les extrémités des imbrications
 * sont correspondent aux différents types de ressources décrites ci-dessus.
 */
// Type pour un objet situé en fin de référentiel
export type JSONReferentielEnding =
  // | BaseItemInReferentiel  <-- pas de terminaison aussi basique
  | StaticItemInreferentiel
  | ExamItemInReferentiel
  | ExerciceItemInReferentiel
  | ToolItemInReferentiel
// Type pour un référentiel complet
export interface JSONReferentielObject
  extends Record<
    string,
    JSONReferentielEnding | JSONReferentielObject | string | string[] | Features
  > {}
// Type correspondant à une branche déstructurée : chemin + terminaison (données de la ressource)
export type ResourceAndItsPath = {
  resource: JSONReferentielEnding
  pathToResource: string[]
}
// Type pour passer un référentiel au menu
export type ReferentielInMenu = {
  title: string
  name: ActivationName
  searchable: boolean
  referentiel: JSONReferentielObject
}

// ===========================================================================
//
//     Fonctions pour vérifier les types
//
// ===========================================================================
export const isExerciceItemInReferentiel = (
  obj: any,
): obj is ExerciceItemInReferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('uuid') &&
  obj.uuid !== undefined &&
  Object.keys(obj).includes('features') &&
  obj.features !== undefined

export const isExamItemInReferentiel = (
  obj: any,
): obj is ExamItemInReferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('uuid') &&
  obj.uuid !== undefined &&
  Object.keys(obj).includes('annee') &&
  obj.annee !== undefined

export const isJSONReferentielEnding = (
  obj: any,
): obj is JSONReferentielEnding =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('uuid') &&
  obj.uuid !== undefined

export const isTool = (obj: any): obj is ToolItemInReferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('typeExercice') &&
  (obj.typeExercice === 'outil' || obj.typeExercice === 'html')

export const resourceHasPlace = (
  obj: any,
): obj is ExamItemInReferentiel | crpeItemInreferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('lieu') &&
  obj.lieu !== undefined

export const resourceHasMonth = (obj: any): obj is ExamItemInReferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('mois') &&
  obj.mois !== undefined

export const isLevelType = (obj: any): obj is Level =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(codeList).includes(obj)

export const isFeatures = (obj: any): obj is Features => {
  if (obj !== null && typeof obj !== 'undefined') {
    return false
  } else {
    const keys = Object.keys(obj)
    return keys.includes('interactif') || keys.includes('amc')
  }
}

/**
 * Inspecte le type d'un objet et détermine s'il c'est un tableau de chaînes non vide ou pas
 * @see https://stackoverflow.com/a/50523378/6625987
 * @param value objet à examiner
 * @returns {boolean}
 */
export function isNonEmptyArrayOfStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string')
  )
}

export const isRealJSONReferentielObject = (obj: any): boolean => {
  if (
    typeof obj === 'string' ||
    isNonEmptyArrayOfStrings(obj) ||
    isFeatures(obj)
  ) {
    return false
  } else {
    return true
  }
}

export const isStaticType = (obj: any): obj is StaticItemInreferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('png') &&
  obj.png !== undefined &&
  !isNonEmptyArrayOfStrings(obj.png)

export const isCrpeType = (obj: any): obj is crpeItemInreferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  Object.keys(obj).includes('typeExercice') &&
  obj.typeExercice !== undefined &&
  obj.typeExercice === 'crpe'

export const isStaticWithoutPngUrl = (obj: any): obj is ExamItemInReferentiel =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  !Object.keys(obj).includes('png') &&
  Object.keys(obj).includes('annee') &&
  Object.keys(obj).includes('lieu') &&
  Object.keys(obj).includes('typeExercice') &&
  obj.annee !== undefined &&
  obj.lieu !== undefined &&
  (obj.typeExercice === 'sti2d' ||
    obj.typeExercice === 'dnb' ||
    obj.typeExercice === 'stl' ||
    obj.typeExercice === 'dnbpro' ||
    obj.typeExercice === 'eam' ||
    obj.typeExercice === 'bac')

/**
 * Détecte si la terminaison d'un référentiel est un exercice de géométrie dynamique ou pas.
 * On teste la présence de la chaine `geodyn` en début d'url (si elle existe)
 * @param obj {JSONReferentielEnding} terminaison à tester
 * @returns `true` si la terminaison référence un exercice de géométrie dynamique
 */
export const isGeoDynamic = (obj: JSONReferentielEnding): boolean => {
  const geoDynRegExp = /^geodyn/
  if (
    obj !== null &&
    typeof obj !== 'undefined' &&
    Object.keys(obj).includes('url') &&
    // À ce stade, on est sûr que l'objet ne peu tpas être de type StaticItemInreferentiel car il a la propriété `url`
    (obj as Exclude<JSONReferentielEnding, StaticItemInreferentiel>).url !==
      undefined &&
    typeof (obj as Exclude<JSONReferentielEnding, StaticItemInreferentiel>)
      .url === 'string' &&
    (obj as Exclude<JSONReferentielEnding, StaticItemInreferentiel>).url.match(
      geoDynRegExp,
    ) !== null
  ) {
    return true
  } else {
    return false
  }
}
