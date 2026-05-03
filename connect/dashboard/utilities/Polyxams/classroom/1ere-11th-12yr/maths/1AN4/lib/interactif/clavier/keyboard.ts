import type { MathfieldElement } from 'mathlive'
import type { BlockForKeyboard } from '../../../components/keyboard/types/keyboardContent'

const KEYBOARD_CATEGORIES = [
  'aire',
  'alphanumericAvecEspace',
  'alphanumeric',
  'angles',
  'clavierHms',
  'clavierDeBase',
  'clavierLimites',
  'clavierCompare',
  'clavierCompareAvecNombres',
  'clavierDeBaseAvecX',
  'clavierDeBaseAvecFraction',
  'clavierDeBaseAvecFractionPuissanceCrochets',
  'clavierDeBaseAvecEgal',
  'clavierDeBaseAvecVariable',
  'clavierEmvx',
  'clavierEnsemble',
  'clavierEnsemblePredefini',
  'equationsTerminale',
  'clavierFullOperations',
  'clavierMajuscules',
  'clavierNumbers',
  'clavierProbabilite',
  'clavierSuite',
  'college6eme',
  'complexes',
  'geolocalisation',
  'grecTrigo',
  'longueur',
  'lycee',
  'lyceeClassique',
  'masse',
  'clavierFonctionsTerminales',
  'nombresEtDegre',
  'nombresEtDegreCelsius',
  'numbersSpace',
  'numeration',
  'vFON',
  'volume',
] as const

export type KeyboardCategory = (typeof KEYBOARD_CATEGORIES)[number] // on crée le type à partir du tableau de strings comme un union type de toutes les strings

/**
 * Convertit une valeur de classe en chaîne de caractères pour l'attribut class
 *
 * Cette fonction gère trois types d'entrées :
 * - `undefined` : retourne une chaîne vide
 * - `string` : retourne la chaîne telle quelle
 * - `PartialKbType` (objet) : extrait toutes les valeurs de l'objet et les joint avec des espaces
 *
 * @param {string | PartialKbType | undefined} classe - La classe à convertir
 * @returns {string} La chaîne de caractères représentant la classe
 *
 * @example
 * convertClasseToString('clavierDeBase') // => 'clavierDeBase'
 * convertClasseToString(undefined) // => ''
 * convertClasseToString({ lycee: 'lycee', complexes: 'complexes' }) // => 'lycee complexes'
 */
export const convertClasseToString = (
  classe: string | PartialKbType | undefined,
): string => {
  if (classe === undefined) return ''
  if (typeof classe === 'string') return classe
  // Si c'est un objet PartialKbType, extraire les valeurs et les joindre
  return Object.values(classe).join(' ')
}

/**
 * Détermine si un type de clavier passé en paramètre est bien connu
 * @param category type de clavier à vérifier
 * @returns `true` si le type de clavier est dans la liste
 */
export const isKeyboardCategory = (
  category: unknown,
): category is KeyboardCategory =>
  category !== null &&
  typeof category === 'string' &&
  KEYBOARD_CATEGORIES.includes(category as KeyboardCategory)

type KbType = Record<KeyboardCategory, string>
export type PartialKbType = Partial<KbType>
export const KeyboardType: PartialKbType = KEYBOARD_CATEGORIES.reduce(
  (obj, key) => {
    return { ...obj, [key]: key }
  },
  {},
)

export const convertToKeyboardCategory = (
  str: string,
): KeyboardCategory | undefined => {
  const type = isKeyboardCategory(str) ? str : undefined
  return type
}

export const convertKeyboardTypeToBlocks = (
  type: KeyboardCategory,
): BlockForKeyboard[] => {
  switch (type) {
    case KeyboardType.clavierDeBase:
      return ['numbersOperations']
    case KeyboardType.college6eme: // A supprimer
      return ['numbersOperations']
    case KeyboardType.clavierLimites:
      return ['limites']
    case KeyboardType.vFON:
      return ['numbersOperations', 'vFON']
    case KeyboardType.clavierDeBaseAvecX:
      return ['numbersOperationsX']
    case KeyboardType.grecTrigo:
      return ['numbers', 'fullOperations', 'greek', 'trigo']
    case KeyboardType.clavierHms:
      return ['numbers', 'hms']
    case KeyboardType.clavierCompare:
      return ['compare']
    case KeyboardType.clavierCompareAvecNombres:
      return ['numbers', 'compare', 'basicOperations']
    case KeyboardType.clavierFonctionsTerminales:
      return ['clavierFonctionsTerminales']
    case KeyboardType.lycee:
      return ['numbers', 'fullOperations', 'variables', 'advanced']
    case KeyboardType.lyceeClassique:
      return ['numbers', 'fullOperations', 'variables']
    case KeyboardType.clavierDeBaseAvecFraction:
      return ['numbers', 'basicOperations']
    case KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets:
      return ['numbers', 'basicOperationsPlus']
    case KeyboardType.clavierDeBaseAvecEgal:
      return ['numbers2', 'basicOperations']
    case KeyboardType.clavierDeBaseAvecVariable:
      return ['numbers', 'basicOperations', 'variables']
    case KeyboardType.clavierEmvx:
      return ['numbers', 'basicOperations', 'emvxBlock']
    case KeyboardType.clavierEnsemble:
      return ['numbersX', 'ensemble', 'ensembleDefini']
    case KeyboardType.clavierEnsemblePredefini:
      return ['ensembleDefini']
    case KeyboardType.equationsTerminale:
      return ['numbersX', 'equationsTerminale']
    case KeyboardType.clavierSuite:
      return ['numbers', 'fullOperations', 'suite']
    case KeyboardType.clavierNumbers:
      return ['numbers']
    case KeyboardType.complexes:
      return ['complexes']
    case KeyboardType.numbersSpace:
      return ['numbersSpace']
    case KeyboardType.clavierFullOperations:
      return ['numbers', 'fullOperations']
    case KeyboardType.clavierMajuscules:
      return ['majuscules']
    case KeyboardType.clavierProbabilite:
      return [
        'numbers',
        'probabilite',
        'uppercaseXToZ',
        'uppercaseQToW',
        'uppercaseIToP',
        'uppercaseAToH',
      ]
    case KeyboardType.alphanumeric:
      return ['alphanumeric']
    case KeyboardType.alphanumericAvecEspace:
      return ['alphanumeric']
    case KeyboardType.longueur:
      return ['numbers', 'lengths']
    case KeyboardType.numeration:
      return ['numbers', 'numeration']
    case KeyboardType.aire:
      return ['numbers', 'areas']
    case KeyboardType.volume:
      return ['numbers', 'volumes', 'capacities']
    case KeyboardType.masse:
      return ['numbers', 'masses']
    case KeyboardType.angles:
      return [
        'angles',
        'uppercaseXToZ',
        'uppercaseQToW',
        'uppercaseIToP',
        'uppercaseAToH',
      ]
    case KeyboardType.nombresEtDegre:
      return ['numbers', 'degre']
    case KeyboardType.geolocalisation:
      return ['numbers', 'estOuestSudNord']
    case KeyboardType.nombresEtDegreCelsius:
      return ['numbers', 'degreCelsius']

    default:
      window.notify(
        "This error shouldn't occur. Clavier type: '" + type + "'",
        {},
      )
      return ['numbersOperations']
  }
}

export const buildDataKeyboardFromStyle = (
  style: string,
): BlockForKeyboard[] => {
  // traitement
  if (style === '') {
    // clavier basique
    return ['numbers', 'fullOperations', 'variables']
  }
  const blocks: BlockForKeyboard[] = []
  const styleValues = style?.split(' ')
  for (const value of styleValues) {
    if (isKeyboardCategory(value)) {
      blocks.push(...convertKeyboardTypeToBlocks(value))
    } else {
      // peut-être des unités... du style unites[longueurs,aires]
      if (value.startsWith('unit') || value.startsWith('Unit')) {
        // extraire les informations entre les [...] pour avoir les unités
        const unitValuesMatches = value.match(/\[(.*?)\]/g)
        const unitValues =
          unitValuesMatches
            ?.map((e) => e.slice(1, -1))
            .join(',')
            .split(',')
            .map((s) => s.toLowerCase().replace(/[s]$/, '')) || [] // tout en minuscule et virer les 's' à la fin
        for (const v of unitValues) {
          if (isKeyboardCategory(v)) {
            blocks.push(...convertKeyboardTypeToBlocks(v))
          }
        }
      }
    }
  }
  if (blocks.length !== 0) {
    const blks = blocks.filter((element, index, array) => {
      return array.indexOf(element) === index
    })
    return blks
  }
  return ['numbers', 'fullOperations', 'variables']
}

type Shortcut = {
  mode: 'math' | 'text'
  value: string
}

type ShortcutsByKeyboards = {
  [keyboard: string]: {
    [key: string]: Shortcut | string
  }
}

export function getKeyboardShortcusts(mf: MathfieldElement): void {
  let keyboardShortcuts = { ...shortcutsByKeyboards.default }
  const keyboards = mf.dataset?.keyboard?.split(' ')
  if (keyboards == null) return
  for (const keyboard of keyboards) {
    if (keyboard in shortcutsByKeyboards) {
      keyboardShortcuts = {
        ...keyboardShortcuts,
        ...shortcutsByKeyboards[keyboard],
      }
    }
    if (
      ['lengths', 'volumes', 'capacities', 'masses', 'areas'].includes(
        keyboard as KeyboardCategory,
      )
    ) {
      keyboardShortcuts = {
        ...keyboardShortcuts,
        ...shortcutsByKeyboards.unit,
      }
    }
  }
  mf.inlineShortcuts = keyboardShortcuts
}

const shortcutsByKeyboards = {
  default: {
    // D: { mode: 'math', value: 'd' }, // On avait un problème avec la notation D et mathLive
    '*': { mode: 'math', value: '\\times' },
    '.': { mode: 'math', value: '{,}' },
    ',': { mode: 'math', value: '{,}' },
    '%': { mode: 'math', value: '\\%' },
    '²': { mode: 'math', value: '^2' },
    '³': { mode: 'math', value: '^3' },
    '**': { mode: 'math', value: '^{#1}' },
    pi: { mode: 'math', value: '\\pi' },
    ang: { mode: 'math', value: '\\widehat{#@}' },
    rac: { mode: 'math', value: '\\sqrt{#@}' },
    frac: { mode: 'math', value: '\\frac{#@}{#1}' },
    '/': { mode: 'math', value: '\\frac{#@}{#1}' },
    '<': '<',
    '>': '>',
    '>=': '\\geq',
    '<=': '\\leq',
    '(': '\\lparen',
    ')': '\\rparen',

    alpha: { mode: 'math', value: '\\alpha' },
    beta: { mode: 'math', value: '\\beta' },
    gamma: { mode: 'math', value: '\\gamma' },
    delta: { mode: 'math', value: '\\delta' },
    epsilon: { mode: 'math', value: '\\epsilon' },
    theta: { mode: 'math', value: '\\theta' },
    omega: { mode: 'math', value: '\\omega' },
    lambda: { mode: 'math', value: '\\lambda' },
    cos: { mode: 'math', value: '\\cos(#0)' },
    sin: { mode: 'math', value: '\\sin(#0)' },
    tan: { mode: 'math', value: '\\tan(#0)' },
    log: { mode: 'math', value: '\\log(#0)' },
    '{': { mode: 'math', value: '\\{#0\\}' },
    '[': { mode: 'math', value: '$[$' },
    singleton: { mode: 'math', value: '\\{#0\\}' },
    inf: { mode: 'math', value: '\\infty' },
    union: { mode: 'math', value: '\\cup' },
    inter: { mode: 'math', value: '\\cap' },
    sauf: { mode: 'math', value: '\\backslash\\{#0\\}' },
    integ: { mode: 'math', value: '\\int_#0^#1' },
    lim: { mode: 'math', value: '\\lim_{#0\\to\\ #1}}' },
    som: { mode: 'math', value: '\\sum_#0^#1' },
    Un: { mode: 'math', value: 'U_n' },
    ln: { mode: 'math', value: '\\ln(#0)' },
    exp: { mode: 'math', value: 'e^#0' }, //
    parmi: { mode: 'math', value: '\\tbinom{#0}{#1}' },
    pasachantb: { mode: 'math', value: 'P_{#0}({#1})' },
    barre: { mode: 'math', value: '\\overline{#@}' },
    vec: { mode: 'math', value: '\\overrightarrow{#@}' },
    pow: { mode: 'math', value: '#@^{#1}' },
    gdC: { mode: 'math', value: '\\mathbb{C}' },
    gdR: { mode: 'math', value: '\\mathbb{R}' },
    gdQ: { mode: 'math', value: '\\mathbb{Q}' },
    gdZ: { mode: 'math', value: '\\mathbb{Z}' },
    gdN: { mode: 'math', value: '\\mathbb{N}' },
  },

  hms: {
    D: { mode: 'math', value: 'd' },
    sem: { mode: 'text', value: '{\\:\\text{semaines}\\:}' },
    j: { mode: 'text', value: '{\\:\\text{j}\\:}' },
    h: { mode: 'text', value: '{\\:\\text{h}\\:}' },
    H: { mode: 'text', value: '{\\:\\text{h}\\:}' },
    min: { mode: 'text', value: '{\\:\\text{min}\\:}' },
    MIN: { mode: 'text', value: '{\\:\\text{min}\\:}' },
    s: { mode: 'text', value: '{\\:\\text{s}\\:}' },
    S: { mode: 'text', value: '{\\:\\text{s}\\:}' },
    '*': { mode: 'math', value: '\\times' },
    '.': { mode: 'math', value: ',' },
  },

  complexes: {
    i: { mode: 'text', value: '{\\mathrm{i}}' },
  },

  unit: {
    mg: { mode: 'math', value: '\\operatorname{mg}' },
    cg: { mode: 'math', value: '\\operatorname{cg}' },
    dg: { mode: 'math', value: '\\operatorname{dg}' },
    g: { mode: 'math', value: '\\operatorname{g}' },
    dag: { mode: 'math', value: '\\operatorname{dag}' },
    hg: { mode: 'math', value: '\\operatorname{hg}' },
    kg: { mode: 'math', value: '\\operatorname{kg}' },
    mL: { mode: 'math', value: '\\operatorname{mL}' },
    cL: { mode: 'math', value: '\\operatorname{cL}' },
    dL: { mode: 'math', value: '\\operatorname{dL}' },
    L: { mode: 'math', value: '\\operatorname{L}' },
    daL: { mode: 'math', value: '\\operatorname{daL}' },
    hL: { mode: 'math', value: '\\operatorname{hL}' },
    mm: { mode: 'math', value: '\\operatorname{mm}' },
    cm: { mode: 'math', value: '\\operatorname{cm}' },
    dm: { mode: 'math', value: '\\operatorname{dm}' },
    m: { mode: 'math', value: '\\operatorname{m}' },
    dam: { mode: 'math', value: '\\operatorname{dam}' },
    hm: { mode: 'math', value: '\\operatorname{hm}' },
    km: { mode: 'math', value: '\\operatorname{km}' },
    mm2: { mode: 'math', value: '\\operatorname{mm}^2' },
    cm2: { mode: 'math', value: '\\operatorname{cm}^2' },
    dm2: { mode: 'math', value: '\\operatorname{dm}^2' },
    m2: { mode: 'math', value: '\\operatorname{m}^2' },
    dam2: { mode: 'math', value: '\\operatorname{dam}^2' },
    hm2: { mode: 'math', value: '\\operatorname{hm}^2' },
    km2: { mode: 'math', value: '\\operatorname{km}^2' },
    mm3: { mode: 'math', value: '\\operatorname{mm}^3' },
    cm3: { mode: 'math', value: '\\operatorname{cm}^3' },
    dm3: { mode: 'math', value: '\\operatorname{dm}^3' },
    m3: { mode: 'math', value: '\\operatorname{m}^3' },
    dam3: { mode: 'math', value: '\\operatorname{dam}^3' },
    hm3: { mode: 'math', value: '\\operatorname{hm}^3' },
    km3: { mode: 'math', value: '\\operatorname{km}^3' },
    a: { mode: 'math', value: '\\operatorname{a}' },
    ha: { mode: 'math', value: '\\operatorname{ha}' },
    '*': { mode: 'math', value: '\\times' },
    '.': { mode: 'math', value: ',' },
  },

  numbersOperations: {
    '/': { mode: 'math', value: '\\div' },
  },

  numbersSpace: {
    ' ': '\\,',
  },
} as ShortcutsByKeyboards
