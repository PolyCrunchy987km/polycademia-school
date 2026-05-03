import type Figure from 'apigeom/src/Figure'
import type { PartialKbType } from '../lib/interactif/claviers/keyboard'
import type { CanOptions, CanSolutionsMode } from './types/can'
import type { Language } from './types/languages'

// Types pour gestionInteractif
import type { IFractionEtendue } from '../modules/FractionEtendue.type'
// import Grandeur from '../modules/Grandeur'
import type Decimal from 'decimal.js'
import type FractionEtendue from '../modules/FractionEtendue'
import Hms from '../modules/Hms'
import type { VueType } from './VueType'
import { Complexe } from './mathFonctions/Complexe'

/**
 * setInteractive à 0 on enlève tout, à 1 on les met tous en interactif, à 2 on ne change rien
 * iframe est un identifiant de l'iframe utilisé par des recorders comme Moodle
 */
export interface InterfaceGlobalOptions {
  v?: VueType
  z?: string
  durationGlobal?: number
  ds?: string
  nbVues?: 1 | 2 | 3 | 4
  flow?: 0 | 1 | 2 // 0: Q->Q, 1: Q->R->Q, 2: Q->(Q+R)->Q
  screenBetweenSlides?: boolean
  pauseAfterEachQuestion?: boolean
  sound?: 0 | 1 | 2 | 3 | 4
  isImagesOnSides?: boolean
  shuffle?: boolean
  select?: number[]
  order?: number[]
  manualMode?: boolean
  es?: string
  title?: string
  presMode?:
    | 'liste_exos'
    | 'un_exo_par_page'
    | 'une_question_par_page'
    | 'recto'
    | 'verso'
  // | 'cartes'
  setInteractive?: string
  isSolutionAccessible?: boolean
  isTitleDisplayed?: boolean
  isReferenceDisplayed?: boolean
  isInteractiveFree?: boolean
  oneShot?: boolean
  recorder?: 'capytale' | 'labomep' | 'moodle' | 'anki' | 'flowmath'
  done?: '1' | '0' // pourquoi n'y a-t-il qu'une valeur possible ? à vérifier JC
  answers?: string
  iframe?: string
  twoColumns?: boolean
  beta?: boolean
  isDataRandom?: boolean
  canD?: string
  canTi?: string
  canT?: string
  canSA?: boolean
  canSM?: CanSolutionsMode
  canI?: boolean
  lang?: Language
}

export interface InterfaceParams extends Partial<
  Record<string, string | number>
> {
  uuid: string
  id?: string
  alea?: string
  interactif?: '0' | '1'
  cd?: '0' | '1'
  sup?: string
  sup2?: string
  sup3?: string
  sup4?: string
  sup5?: string
  versionQcm?: '0' | '1' // pour la version QCM des exercices de type simple
  nbQuestions?: number
  duration?: number
  cols?: number
  type?: 'mathalea' | 'static' | 'app'
  bestScore?: number
}

export interface InterfaceReferentiel {
  uuid: string
  id: string
  url: string
  titre: string
  tags: { interactif: boolean; interactifType: string; amc: boolean }
  datePublication?: string
  dateModification?: string
  annee?: string
}

export interface InterfaceResultExercice {
  numberOfPoints: number
  numberOfQuestions: number
  uuid?: string
  title?: string
  alea?: string
  answers?: { [key: string]: string }
  indice?: number
  state?: 'done'
  type?: 'mathalea' | 'static' | 'app'
  bestScore?: number
  duration?: number
  checkSum?: string
  resultsByQuestion?: boolean[]
}

// Pour Capytale
export interface Activity {
  globalOptions: InterfaceGlobalOptions
  exercicesParams: InterfaceParams[]
  canOptions: CanOptions
}

export interface StudentAssignment {
  resultsByExercice: InterfaceResultExercice[]
}

// Pour les listes d'entrées de référentiel dans le side menu
// * `title` : titre affiché dans le menu
// * `content` : le référentiel lui-même
// * `type` : type du référentiel pour gérer l'affichage (exploration récursive ou pas par exemple)
// * `activated`: flag pour afficher ou pas le référentiel
export type ReferentielTypes =
  | 'outils'
  | 'exercices'
  | 'ressources'
  | 'bibliotheque'
  | 'apps'
  | 'examens'
export type ReferentielNames =
  | 'outils'
  | 'aleatoires'
  | 'statiques'
  | 'ressources'
  | 'bibliotheque'
  | 'apps'
  | 'examens'
  | 'geometrieDynamique'
export type ReferentielForList = {
  name: ReferentielNames
  title: string
  content: InterfaceReferentiel[]
  type: ReferentielTypes
  activated: boolean
}

// Pour les exercices statiques de la bibliotheque
export interface bibliothequeExercise {
  uuid: string
  url: string
  png: string
  pngCor: string
}

// Pour les couleurs utilisées dans le site
// chaînes de caractères possible à ajouter après <text|fill|bg|border|...>-coopmaths- ou <text|fill|bg|border|...>-coopmathsdark-
export type CoopmathsColor =
  | 'canvas'
  | 'canvas-light'
  | 'canvas`lightest'
  | 'canvas-dark'
  | 'canvas-darkest'
  | 'warn'
  | 'warn-light'
  | 'warn-lightest'
  | 'warn-dark'
  | 'warn-darkest'
  | 'corpus'
  | 'corpus-light'
  | 'corpus-lightest'
  | 'corpus-dark'
  | 'corpus-darkest'
  | 'struct'
  | 'struct-ligh'
  | 'struct-lightest'
  | 'struct-dark'
  | 'struct-darkest'

// type pour une fonction qui n'admet pas d'argument et de retourne rien
export type Action = () => void

// type pour un intervalle de nombres
// usage : const myNumber: NumericRange<0, 100> = 3 (par de valeur possible inférieure à 0 et supérieure à 100)
// source: https://github.com/microsoft/TypeScript/issues/43505#issuecomment-1686128430
export type NumericRange<
  start extends number,
  end extends number,
  arr extends unknown[] = [],
  acc extends number = never,
> = arr['length'] extends end
  ? acc | start | end
  : NumericRange<
      start,
      end,
      [...arr, 1],
      arr[start] extends undefined ? acc : acc | arr['length']
    >
// autre type pour intervalle de nombre
// source : https://github.com/type-challenges/type-challenges/issues/9230
export type NumberRange<
  L extends number,
  H extends number,
  Out extends number[] = [],
  Flag extends boolean = false,
> = Out['length'] extends L
  ? NumberRange<L, H, [...Out, L], true>
  : Flag extends true
    ? Out['length'] extends H
      ? [...Out, Out['length']][number]
      : NumberRange<L, H, [...Out, Out['length']], Flag>
    : NumberRange<L, H, [...Out, never], Flag>
// type pour les chips des exercices
export type ChipContentType = { ref: string; title: string; key: string }

// type pour les filtres affichés
export type DisplayedFilterContent<T> = {
  title: string
  values: T[]
  isSelected: boolean
  clicked: number
}
export type DisplayedFilter<T> = Record<string, DisplayedFilterContent<T>>
export type FilterType = 'levels' | 'specs' | 'types'
export type FilterObject<T> = {
  type: FilterType
  key: string
  content: DisplayedFilterContent<T>
}

export type FilterSectionNameType = { [key in FilterType]: string }
export const FILTER_SECTIONS_TITLES: FilterSectionNameType = {
  levels: 'Niveaux',
  specs: 'Fonctionnalités',
  types: 'Types',
}

export type ResultType = { isOk: boolean; feedback?: string }
export type OptionsComparaisonType = {
  noFeedback?: boolean
  texteAvecCasse?: boolean
  texteSansCasse?: boolean
  additionSeulementEtNonResultat?: boolean
  soustractionSeulementEtNonResultat?: boolean
  multiplicationSeulementEtNonResultat?: boolean
  divisionSeulementEtNonResultat?: boolean
  avecFractions?: boolean // Encore utile ?
  fractionIrreductible?: boolean
  fractionSimplifiee?: boolean
  fractionReduite?: boolean
  fractionDecimale?: boolean
  fractionEgale?: boolean
  fractionIdentique?: boolean
  nombreDecimalSeulement?: boolean
  expressionNumerique?: boolean
  HMS?: boolean
  intervalle?: boolean
  estDansIntervalle?: boolean
  ecritureScientifique?: boolean
  unite?: boolean
  precisionUnite?: number
  puissance?: boolean
  sansExposantUn?: boolean
  seulementCertainesPuissances?: boolean
  nombreAvecEspace?: boolean
  egaliteExpression?: boolean
  factorisation?: boolean
  exclusifFactorisation?: boolean
  nbFacteursIdentiquesFactorisation?: boolean
  unSeulFacteurLitteral?: boolean
  nonReponseAcceptee?: boolean
  developpementEgal?: boolean
  fonction?: boolean
  variable?: string
  entier?: boolean
  domaine?: number[]
  ensembleDeNombres?: boolean
  kUplet?: boolean
  suiteDeNombres?: boolean
  suiteRangeeDeNombres?: boolean
  calculFormel?: boolean
  expanded?: boolean
  fractionSansRacineCarree?: boolean
  // Non fait : Pas de tests unitaires
  sansTrigo?: boolean
  variablefractionIdentique?: boolean
  avecSigneMultiplier?: boolean
  entiersConsecutifs?: boolean // Pas de wiki
  expressionsForcementReduites?: boolean // Pas de wiki
  coordonnees?: boolean
  ordered?: boolean // Options pour drag and drop
  multi?: boolean // Options pour drag and drop
}
export type CompareFunction = (
  input: string,
  goodAnswer: string,
  options?: OptionsComparaisonType,
) => ResultType

export type CleaningOperation =
  | 'fractions'
  | 'fractionsMemesNegatives'
  | 'virgules'
  | 'espaces'
  | 'parentheses'
  | 'puissances'
  | 'divisions'
  | 'latex'
  | 'foisUn'
  | 'unites'
  | 'doubleEspaces'
  | 'espaceNormal'
  | 'mathrm'
  | 'operatorName'
  | 'imaginaires'
  | 'accolades'

export type InteractivityType =
  | 'qcm'
  | 'mathlive'
  | 'fillInTheBlank'
  | 'tableauMathlive'
  | 'texte'
  | 'cliqueFigure'
  | 'dnd'
  | 'listeDeroulante'
  | 'custom'
  | 'tableur'
  | 'MetaInteractif2d'
  | 'svgSelection'
  | 'multiMathfield'
export function isInteractivityType(
  value: unknown,
): value is InteractivityType {
  return (
    value === 'qcm' ||
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
    value === 'multiMathfield'
  )
}

export type TableauMathliveType = 'doubleEntree' | 'proportionnalite'

/**
 * Type pour les figures cliquables
 */
export type ClickFigures = Array<{ id: string; solution: boolean }>

/**
 * Type pour les données de test et de correction des exercices tableur
 */
export type CellDatas = {
  ref: string
  formula?: string
  value?: string | number
}
export type TestCellDatas = {
  ref: string // Cellule à modifier aléatoirement
  rangeValues: [number, number] // Plage de valeurs possibles
}
export type GoodAnswersFormulas = CellDatas[]
export type SheetTestDatas = TestCellDatas[]

export type AnswerType = {
  value: AnswerValueType
  compare?: CompareFunction
  options?: OptionsComparaisonType
}

export function isAnswerType(obj: unknown): obj is AnswerType {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'value' in obj &&
    isAnswerValueType(obj.value)
  )
}

export type SheetAnswerType = {
  goodAnswerFormulas: GoodAnswersFormulas
  sheetTestDatas: SheetTestDatas
}

export type AnswerNormalizedType = {
  value: string | string[]
  compare?: CompareFunction
  options?: OptionsComparaisonType
}

export type ValeurNames =
  | 'reponse'
  | 'champ1'
  | 'champ2'
  | 'champ3'
  | 'champ4'
  | 'champ5'
  | 'champ6'
  | 'rectangle1'
  | 'rectangle2'
  | 'rectangle3'
  | 'rectangle4'
  | 'rectangle5'
  | 'rectangle6'
  | 'rectangle7'
  | 'rectangle8'
  | 'field0'
  | 'field1'
  | 'field2'
  | 'field3'
  | 'field4'
  | 'field5'
  | 'field6'
  | 'field7'
  | 'field8'
  | 'L1C1'
  | 'L1C2'
  | 'L1C3'
  | 'L1C4'
  | 'L1C5'
  | 'L2C1'
  | 'L2C2'
  | 'L2C3'
  | 'L2C4'
  | 'L2C5'
  | 'L3C1'
  | 'L3C2'
  | 'L3C3'
  | 'L3C4'
  | 'L3C5'

/**
 * Type pour une valeur de réponse avec ses options
 */
export interface Valeur {
  bareme?: (listePoints: number[]) => [number, number]
  feedback?: (saisies: Record<string, string>) => string
  reponse?: AnswerType
  champ1?: AnswerType
  champ2?: AnswerType
  champ3?: AnswerType
  champ4?: AnswerType
  champ5?: AnswerType
  champ6?: AnswerType
  rectangle1?: AnswerType
  rectangle2?: AnswerType
  rectangle3?: AnswerType
  rectangle4?: AnswerType
  rectangle5?: AnswerType
  rectangle6?: AnswerType
  rectangle7?: AnswerType
  rectangle8?: AnswerType
  field0?: AnswerType
  field1?: AnswerType
  field2?: AnswerType
  field3?: AnswerType
  field4?: AnswerType
  field5?: AnswerType
  field6?: AnswerType
  field7?: AnswerType
  field8?: AnswerType

  // on va aller jusque 8 pour l'instant, si besoin on en ajoutera
  L1C1?: AnswerType
  L1C2?: AnswerType
  L1C3?: AnswerType
  L1C4?: AnswerType
  L1C5?: AnswerType
  L2C1?: AnswerType
  L2C2?: AnswerType
  L2C3?: AnswerType
  L2C4?: AnswerType
  L2C5?: AnswerType
  L3C1?: AnswerType
  L3C2?: AnswerType
  L3C3?: AnswerType
  L3C4?: AnswerType
  L3C5?: AnswerType
  sheetAnswer?: SheetAnswerType

  // idem on en ajoutera si besoin
  callback?: (
    exercice: IExercice,
    question: number,
    variables: [string, AnswerType][],
    bareme: (listePoints: number[]) => [number, number],
  ) => {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  }
}

export interface ValeurNormalized {
  bareme?: (listePoints: number[]) => [number, number]
  feedback?: (saisies: Record<string, string>) => string
  reponse?: AnswerNormalizedType
  champ1?: AnswerNormalizedType
  champ2?: AnswerNormalizedType
  champ3?: AnswerNormalizedType
  champ4?: AnswerNormalizedType
  champ5?: AnswerNormalizedType
  champ6?: AnswerNormalizedType
  rectangle1?: AnswerNormalizedType
  rectangle2?: AnswerNormalizedType
  rectangle3?: AnswerNormalizedType
  rectangle4?: AnswerNormalizedType
  rectangle5?: AnswerNormalizedType
  rectangle6?: AnswerNormalizedType
  rectangle7?: AnswerNormalizedType
  rectangle8?: AnswerNormalizedType
  field0?: AnswerNormalizedType
  field1?: AnswerNormalizedType
  field2?: AnswerNormalizedType
  field3?: AnswerNormalizedType
  field4?: AnswerNormalizedType
  field5?: AnswerNormalizedType
  field6?: AnswerNormalizedType
  field7?: AnswerNormalizedType
  field8?: AnswerNormalizedType

  L1C1?: AnswerNormalizedType
  L1C2?: AnswerNormalizedType
  L1C3?: AnswerNormalizedType
  L1C4?: AnswerNormalizedType
  L1C5?: AnswerNormalizedType
  L2C1?: AnswerNormalizedType
  L2C2?: AnswerNormalizedType
  L2C3?: AnswerNormalizedType
  L2C4?: AnswerNormalizedType
  L2C5?: AnswerNormalizedType
  L3C1?: AnswerNormalizedType
  L3C2?: AnswerNormalizedType
  L3C3?: AnswerNormalizedType
  L3C4?: AnswerNormalizedType
  L3C5?: AnswerNormalizedType
  sheetAnswer?: SheetAnswerType
  callback?: (
    exercice: IExercice,
    question: number,
    variables: [string, AnswerNormalizedType][],
    bareme: (listePoints: number[]) => [number, number],
  ) => {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  }
}

/**
 * Type pour une valeur normalisée (après traitement)
 */

/**
 * Type guard pour vérifier si une valeur est de type Valeur
 */
export function isValeur(value: unknown): value is Valeur {
  return typeof value === 'object' && value !== null
}

/**
 * Détecte structurellement une FractionEtendue sans dépendance runtime.
 * On considère qu'un objet avec une méthode sommeFraction est une FractionEtendue.
 */
export function isFractionEtendue(x: unknown): x is IFractionEtendue {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as any).sommeFraction === 'function'
  )
}

/**
 * Détecte structurellement une Grandeur sans dépendance runtime.
 * On considère qu'un objet avec une propriété uniteDeReference est une Grandeur.
 */
export function isGrandeur(x: unknown): x is IGrandeur {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as any).uniteDeReference === 'string'
  )
}

/**
 * Détecte structurellement un Decimal sans utiliser instanceof.
 * On vérifie la présence de quelques méthodes caractéristiques des instances Decimal.
 */
export function isDecimal(x: unknown): x is Decimal {
  return (
    typeof x === 'object' &&
    x !== null &&
    typeof (x as any).toDP === 'function' &&
    typeof (x as any).toFixed === 'function' &&
    typeof (x as any).plus === 'function'
  )
}

export interface IGrandeur {
  readonly mesure: number
  readonly mesureDecimal: Decimal
  readonly unite: string
  readonly puissanceUnite: number
  readonly uniteDeReference: string
  readonly prefixe: string
  readonly puissancePrefixe: number
  readonly latexUnit: string

  convertirEn(uniteConversion: string): IGrandeur
  estEgal(unite2: IGrandeur): boolean
  estUneApproximation(unite2: IGrandeur, precision: number): boolean
  toString(precision?: number): string
  toTex(precision?: number): string
  toHHMMSS(): string
}

export interface ReponseParams {
  digits?: number
  decimals?: number
  signe?: boolean
  exposantNbChiffres?: number
  exposantSigne?: boolean
  approx?: number | 'intervalleStrict'
  aussiCorrect?: number | IFractionEtendue
  digitsNum?: number
  digitsDen?: number
  basePuissance?: number
  exposantPuissance?: number
  baseNbChiffres?: number
  milieuIntervalle?: number
  formatInteractif?: InteractivityType | OldFormatInteractifType
  precision?: number
  scoreapprox?: number
  vertical?: boolean
  strict?: boolean
  vhead?: boolean
  tpoint?: string
}

export type AnswerValueType =
  | string
  | string[]
  | number
  | number[]
  | IFractionEtendue
  | Decimal
  | IGrandeur
  | Hms
  | IGrandeur[]
  | Hms[]
  | Decimal[]
  | IFractionEtendue[]
  | Complexe
  | Complexe[]

export function isAnswerValueType(value: unknown): value is AnswerValueType {
  return (
    typeof value === 'string' ||
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
    (Array.isArray(value) && value.every((value) => value instanceof Complexe))
  )
}

export type ReponseComplexe = AnswerValueType | Valeur

export function isReponseComplexe(value: unknown): value is ReponseComplexe {
  return isAnswerValueType(value) || isValeur(value)
}

// Ajout d'un type dédié pour les choix de QCM
export type ChoixQcm = {
  texte: string // obligatoire pour les QCM interactif mais facultatif pour les QCM AMC (le forcer à vide si besoin)
  statut?: boolean | string | number // boolean pour les QCM interacif et string | number pour les QCM AMC
  // Ci-dessous, utile que pour AMC
  sanscadre?: boolean
  enonce?: string
  feedback?: string
  multicolsBegin?: boolean
  multicolsEnd?: boolean
  numQuestionVisible?: boolean
  pointilles?: boolean
  reponse?: {
    texte?: string
    valeur?: number | number[] | FractionEtendue
    alignement?: string
    param?: {
      digits?: number
      decimals?: number
      signe?: boolean
      digitsNum?: number
      digitsDen?: number
      approx?: number
      aussiCorrect?: number
      exposantNbChiffres?: number
      exposantSigne?: boolean
    }
  }
}

export type UneProposition = {
  texte?: string
  statut?: number | boolean | string
  sanscadre?: boolean | number
  multicolsBegin?: boolean
  multicolsEnd?: boolean
  numQuestionVisible?: boolean
  type?: string
  feedback?: string
  pointilles?: boolean | number
  enonce?: string
  propositions?: ChoixQcm[]
  options?: {
    ordered?: boolean
    vertical?: boolean
    lastChoice?: number
    barreseparation?: boolean
    multicols?: boolean
    nbCols?: number
    digits?: number
    decimals?: number
    signe?: boolean
    exposantNbChiffres?: number
    exposantSigne?: boolean
    approx?: number
    multicolsAll?: boolean
    numerotationEnonce?: boolean
    avecSymboleMult?: boolean
  }
  reponse?: {
    valeur?:
      | ValeurNormalized
      | ValeurNormalized[]
      | number
      | number[]
      | IFractionEtendue
      | Decimal
      | IFractionEtendue[]
      | Decimal[]
      | string
      | string[]
    param?: ReponseParams
    textePosition?: string
    texte?: string
    alignement?: string
  }
}

export type LegacyReponse =
  | string
  | IFractionEtendue
  | Decimal
  | number
  | IGrandeur
export type LegacyReponses = LegacyReponse[] | LegacyReponse

export interface AutoCorrection {
  enonce?: string
  enonceAvant?: boolean
  melange?: boolean
  enonceAGauche?: boolean | [number, number]
  enonceAvantUneFois?: boolean
  enonceCentre?: boolean
  enonceApresNumQuestion?: boolean
  propositions?: UneProposition[]
  reponse?: {
    valeur?: ValeurNormalized
    param?: ReponseParams
    textePosition?: string
    texte?: string
  }
  options?: {
    radio?: boolean
    ordered?: boolean
    vertical?: boolean
    lastChoice?: number
    barreseparation?: boolean
    multicols?: boolean
    nbCols?: number
    digits?: number
    decimals?: number
    signe?: boolean
    exposantNbChiffres?: number
    exposantSigne?: boolean
    approx?: number
    multicolsAll?: boolean
    numerotationEnonce?: boolean
    avecSymboleMult?: boolean
  }
}

export interface MathaleaSVG extends SVGSVGElement {
  etat: boolean
  hasMathaleaListener: boolean
}

export type ResultOfExerciceInteractif = {
  numberOfPoints: number
  numberOfQuestions: number
}

// Pour retro compatibilité avec setReponse
export type OldFormatInteractifType =
  | 'calcul'
  | 'texte'
  | 'tableauMathlive'
  | 'Num'
  | 'Den'
  | 'fractionEgale'
  | 'unites'
  | 'intervalleStrict'
  | 'intervalle'
  | 'puissance'
  | 'canonicalAdd'
  | 'ignorerCasse'
export function isOldFormatInteractifType(
  value: unknown,
): value is OldFormatInteractifType {
  return (
    value === 'calcul' ||
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
    value === 'ignorerCasse'
  )
}

export interface IExercice {
  titre: string
  id?: string
  uuid: string
  sup: any
  sup2: any
  sup3: any
  sup4: any
  sup5: any
  exoCustomResultat?: boolean
  duree?: number
  seed?: string
  numeroExercice?: number
  typeExercice?: string
  duration?: number
  consigne: string
  consigneCorrection: string
  introduction: string
  listeQuestions: string[]
  listeCorrections: string[]
  listeCanReponsesACompleter: string[]
  listeCanEnonces: string[]
  listeCanLiees: number[][]
  listeCanNumerosLies: number[]
  question?: string
  reponse?: AnswerValueType | Valeur
  correction?: string
  canOfficielle?: boolean
  canEnonce?: string
  canReponseACompleter: string
  canNumeroLie: number
  canLiee: number[]
  formatChampTexte: string | PartialKbType | undefined
  optionsChampTexte?: object
  compare?:
    | ((
        input: string,
        goodAnswer: string,
      ) => { isOk: boolean; feedback?: string })
    | ((
        input: string,
        goodAnswer: IGrandeur,
      ) => { isOk: boolean; feedback?: string })
  optionsDeComparaison?: Partial<OptionsComparaisonType>
  formatInteractif?: InteractivityType | OldFormatInteractifType
  contenu?: string
  contenuCorrection?: string
  autoCorrection: AutoCorrection[]
  figures?: Figure[] | ClickFigures[]
  amcReady?: boolean
  amcType?: string
  tableauSolutionsDuQcm?: object[]
  spacing: number
  spacingCorr: number
  pasDeVersionLatex: boolean
  listePackages?: string[]
  consigneModifiable: boolean
  nbQuestionsModifiable: boolean
  nbCols: number
  nbColsCorr: number
  nbColsModifiable: boolean
  nbColsCorrModifiable: boolean
  spacingModifiable: boolean
  spacingCorrModifiable: boolean
  listeAvecNumerotation?: boolean
  beamer: boolean
  nbQuestions: number
  pointsParQuestions: number
  correctionDetailleeDisponible: boolean
  correctionDetaillee: boolean
  correctionIsCachee: boolean
  video: string
  interactif: boolean
  interactifObligatoire: boolean
  interactifReady: boolean
  interactifType?: string
  besoinFormulaireNumerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]
  besoinFormulaireTexte: boolean | [string, string]
  besoinFormulaireCaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire2Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]
  besoinFormulaire2Texte: boolean | [string, string]
  besoinFormulaire2CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire3Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]
  besoinFormulaire3Texte: boolean | [string, string]
  besoinFormulaire3CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire4Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]
  besoinFormulaire4Texte: boolean | [string, string]
  besoinFormulaire4CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire5Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]
  besoinFormulaire5Texte: boolean | [string, string]
  besoinFormulaire5CaseACocher: boolean | [string] | [string, boolean]
  listeArguments: string[]
  lastCallback: string
  checkSum?: string
  examen?: string
  mois?: string
  annee?: string
  lieu?: string
  content?: string
  contentCorr?: string
  comment?: string
  answers?: { [key: string]: string }
  dragAndDrops?: IDragAndDrop[]
  isDone?: boolean
  html: HTMLElement
  key: string
  score?: number
  vspace?: number

  destroy(): void
  nouvelleVersionWrapper: (...args: any[]) => void
  correctionInteractive?(i: number): string | string[]
  nouvelleVersion(numeroExercice?: number, numeroQuestion?: number): void
  reinit: (...args: any[]) => void
  applyNewSeed: (...args: any[]) => void
  questionJamaisPosee: (...args: any[]) => boolean
}

export interface IExerciceSimple extends IExercice {
  typeExercice: 'simple'
  distracteurs: (string | number)[]
  versionQcmDisponible?: boolean
  versionQcm?: boolean
}

export interface IExerciceStatique {
  typeExercice: 'statique'
  uuid: string
  content: string
  contentCorr: string
  annee: any
  lieu: any
  mois: any
  numeroInitial: any
  examen: string
}

export interface IEtiquette {
  id: string
  contenu: string
  duplicable?: boolean
  callback?: (e: Event) => void
}

export type DragHandler = (event: DragEvent) => void
export type TouchHandler = (event: TouchEvent) => void

export interface IDragAndDrop {
  exercice: IExercice
  question: number
  consigne: string
  etiquettes: IEtiquette[][]
  enonceATrous: string
  listeners: [Element, string, DragHandler | TouchHandler][]

  ajouteDragAndDrop(options: { melange: boolean; duplicable: boolean }): string
}

export interface IExerciceBrevet extends IExercice {
  enonce: string
  checksum: string
  versionAleatoire?: (i: number) => void
  versionOriginale: () => void
}

export interface IExerciceBrevetA extends IExerciceBrevet {
  versionAleatoire: (i: number) => void
}

export interface IExerciceCan extends IExerciceSimple {
  canOfficielle?: boolean
}

export interface IExerciceQcmOptions {
  radio?: boolean
  ordered?: boolean
  vertical?: boolean
  lastChoice?: number
  dontKnow?: boolean
}

export interface IExerciceQcm extends IExercice {
  versionQcm?: boolean
  versionQcmDisponible: boolean
  enonce: string
  reponses: string[]
  bonnesReponses?: boolean[]
  corrections?: string[]
  options: IExerciceQcmOptions
  ajouteQcmCorr: boolean
  versionAleatoire?: () => void
  versionOriginale?: () => void
  qcmCamExport(): { question: string; reponse: string }[]
}

export interface IExerciceQcmA extends IExerciceQcm {
  versionAleatoire: () => void
  aleatoire: () => void
}

export function isIExercice(
  ex: IExercice | IExerciceStatique,
): ex is IExercice {
  return ex.typeExercice !== 'statique'
}
