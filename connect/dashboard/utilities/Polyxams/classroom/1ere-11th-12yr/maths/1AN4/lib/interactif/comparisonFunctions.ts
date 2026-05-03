import type { Expression, MathJsonExpression } from '@cortex-js/compute-engine'
import {
  compile,
  ComputeEngine,
  expand,
  isFunction,
  isNumber,
  isSymbol,
} from '@cortex-js/compute-engine'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import { pgcd } from '../outils/primalite'
import type { OptionsComparaisonType } from '../types'
import { generateCleaner } from './cleaners'

const ce = new ComputeEngine()
export default ce

// vérifier que toutes les fonctions sont bien là. -> FAIT
// rechercher les this.compare -> FAIT
// chercher les "compare :" -> FAIT.
// Rechercher les BoxedExpression  -> FAIT
// outilsMaths.ts à débugguer -> FAIT
// changer les exos avec developpement egal -> FAIT
// chercher tous les exos avec engine et changer l'import et chercher les autres erreurs -> FAIT
// vérifier wiki forcementreduites et developpment égal.
// uniformiser les feedback
interface ResultType {
  isOk: boolean
  feedback?: string
}

//    ██   ██ ███████ ██      ██████  ███████ ██████
//    ██   ██ ██      ██      ██   ██ ██      ██   ██
//    ███████ █████   ██      ██████  █████   ██████
//    ██   ██ ██      ██      ██      ██      ██   ██
//    ██   ██ ███████ ███████ ██      ███████ ██   ██
//
//

const ok = (feedback = ''): ResultType => ({ isOk: true, feedback })
const fail = (feedback = ''): ResultType => ({ isOk: false, feedback })

/**  Replace French LaTeX conventions so CE can parse */
function preprocessLatex(latex: string): string {
  const cleaner = generateCleaner(['fractions', 'operatorName', 'virgules'])
  return cleaner(latex)

  // return latex
  //   .replace(/\\dfrac/g, '\\frac')
  //   .replace(/\{,\}/g, '.')
  //   .replace(/\\operatorname\{\\mathrm\{([^}]+)\}\}/g, '$1')
  //   .replace(/\*/g, '\\times ')
}

/** Parse LaTeX (with French preprocessing) and return canonical expression */
function parse(latex: string): Expression {
  return ce.parse(preprocessLatex(latex))
  // return ce.parse(latex)
}

/** Parse LaTeX in raw mode (preserves structure like Power, Add) */
function parseRaw(latex: string): Expression {
  return ce.parse(preprocessLatex(latex), { form: 'raw' })
  // return ce.parse(latex, { form: 'raw' })
}

/* Before 0.53
/** Lightweight equality: .is() with expansion fallback for symbolic exprs.
 *  Bidirectional because BoxedNumber.is() delegates to isSame() (no numeric
 *  eval) while BoxedFunction.is() evaluates when there are no free vars. */
/* function isEqual(a: Expression, b: Expression): boolean {
  if (a.is(b) || b.is(a)) return true
  const ea = expand(a) ?? a
  const eb = expand(b) ?? b
  return ea.is(eb) || eb.is(ea)
} */

/** Full mathematical equality: isEqual + .isEqual() algebraic check. */
/* function mathEqual(a: Expression, b: Expression): boolean {
  if (isEqual(a, b)) return true
  return a.isEqual(b) ?? false
} 
End of "Before 0.53" */

/**
 * Full mathematical equality check.
 *
 * Tries `.is()` first (structural match, expansion, numeric evaluation within
 * tolerance for constant expressions). If that fails, falls back to
 * `.isEqual()` which adds:
 * - custom equality handlers on operator definitions (e.g. trig identities)
 * - algebraic difference test: simplifies `a − b` and checks if zero
 * - expand + simplify then structural compare
 * - stochastic evaluation at random sample points (catches equivalence of
 *   expressions with free variables, e.g. `x^2 - 1` vs `(x-1)(x+1)`)
 *
 * Returns `false` when `.isEqual()` returns `undefined` (equality undecidable).
 */
function mathEqual(a: Expression, b: Expression): boolean {
  return a.is(b) || (a.isEqual(b) ?? false)
}

/** GCD of two positive integers */
function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/** Extract numerator/denominator from a LaTeX fraction string */
function parseFractionLatex(latex: string): {
  num: number
  den: number
  negative: boolean
  bothIntegers: boolean
} | null {
  const trimmed = latex.trim()
  // const match = trimmed.match(/^(-?)\s*\\[dtc]?frac\{(-?\d+)\}\{(\d+)\}$/) // ici, dtc signifie que [dtc]? accepte un caractère optionnel qui peut être d, t, ou c — donc la regex matche \frac, \dfrac, \tfrac, et \cfrac
  // const match = trimmed.match(
  //   /^(-?)\s*\\[dtc]?frac\{(-?\d+(?:\.\d+)?)\}\{(\d+(?:\.\d+)?)\}$/, // Prise en compte des nombres décimaux
  // )

  // Autorise un niveau d'accolades imbriquées (ex: 10^{5})
  const match = trimmed.match(
    /^(-?)\s*\\[dtc]?frac\{((?:[^{}]|\{[^{}]*\})+)\}\{((?:[^{}]|\{[^{}]*\})+)\}$/,
  )

  if (!match) return null

  const leadingMinus = match[1] === '-'
  const numRaw = match[2]
  const denRaw = match[3]

  const evaluate = (expr: string): number | null => {
    const cleaned = expr.replace(/\s+/g, '')

    // nombre simple
    if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
      return Number(cleaned)
    }

    // puissance simple a^b ou a^{b}
    const powerMatch = cleaned.match(/^(-?\d+(\.\d+)?)\^\{?(-?\d+)\}?$/)

    if (powerMatch) {
      const base = Number(powerMatch[1])
      const exponent = Number(powerMatch[3])
      return base ** exponent
    }

    return null
  }

  const num = evaluate(numRaw)
  const den = evaluate(denRaw)

  if (num === null || den === null || den === 0) return null

  const bothIntegers = Number.isInteger(num) && Number.isInteger(den)

  const negative = leadingMinus !== num < 0

  return {
    num: Math.abs(num),
    den,
    negative,
    bothIntegers,
  }
}

/** Check if a LaTeX string contains fraction syntax (\frac, \dfrac, or /) */
/*
function hasFractionSyntax(latex: string): boolean {
  return /\\[dtc]?frac\{/.test(latex) || /\//.test(latex)
}
*/

/** Recursively check if expression contains an operator matching a predicate.
 *  For simple operator presence checks without a predicate, use expr.has(op). */
/*
function containsOp(
  expr: Expression,
  op: string,
  pred: (expr: Expression & FunctionInterface) => boolean,
): boolean {
  if (!isFunction(expr)) return false
  if (expr.operator === op && pred(expr)) return true
  return expr.ops.some((child) => containsOp(child, op, pred))
}
*/

/** Check if raw expression has an explicit 1 as a multiplicative factor */
function hasExplicitOneFactor(expr: Expression): boolean {
  if (!isFunction(expr)) return false
  if (
    expr.operator === 'Multiply' &&
    expr.ops.some((op) => isNumber(op) && op.is(1))
  )
    return true
  return expr.ops.some((op) => hasExplicitOneFactor(op))
}

/** Check if raw expression has an explicit -1 as a multiplicative factor */
function hasExplicitMinusOneFactor(expr: Expression): boolean {
  if (!isFunction(expr)) return false
  if (expr.operator === 'Multiply' && expr.ops.some((op) => op.is(-1)))
    return true
  return expr.ops.some((op) => hasExplicitOneFactor(op))
}

/** Get factors from a Multiply expression (canonical) */
function getFactors(expr: Expression): Expression[] {
  if (isFunction(expr, 'Multiply')) return expr.ops.flatMap(getFactors)

  if (isFunction(expr, 'Negate'))
    return [ce.number(-1), ...getFactors(expr.ops[0])]

  if (isFunction(expr, 'Power')) {
    const exp = expr.ops[1]
    if (isNumber(exp)) {
      const expVal = exp.numericValue
      if (
        typeof expVal === 'number' &&
        Number.isInteger(expVal) &&
        expVal > 1
      ) {
        return Array(expVal).fill(expr.ops[0])
      }
    }
  }
  return [expr]
}

/** Extract raw factors from a raw-parsed expression, stripping overall sign.
 *  Handles InvisibleOperator (implicit multiply), Multiply, Negate, Power. */
function getRawFactors(expr: Expression): Expression[] {
  if (isFunction(expr, 'Multiply') || isFunction(expr, 'InvisibleOperator'))
    return expr.ops.flatMap(getRawFactors)
  if (isFunction(expr, 'Negate')) return getRawFactors(expr.ops[0])
  if (isFunction(expr, 'Power')) {
    const exp = expr.ops[1]
    if (isNumber(exp)) {
      const v = exp.numericValue
      if (typeof v === 'number' && Number.isInteger(v) && v > 1)
        return Array(v).fill(expr.ops[0])
    }
  }
  return [expr]
}

/** Count the number of additive terms in a raw expression.
 *  Flattens nested Subtract chains: Subtract(Subtract(a,b),c) → 3 terms.
 *  Unwraps Delimiter (parentheses) and Negate transparently. */
function rawTermCount(expr: Expression): number {
  if (isFunction(expr, 'Delimiter')) return rawTermCount(expr.ops[0])
  if (isFunction(expr, 'Add')) return expr.ops.length
  if (isFunction(expr, 'Subtract')) return rawTermCount(expr.ops[0]) + 1
  if (isFunction(expr, 'Negate')) return rawTermCount(expr.ops[0])
  return 1
}

/** Check if canonical expression is a product form (Multiply, Power, or Negate thereof) */
function isProductForm(expr: Expression): boolean {
  if (isFunction(expr, 'Multiply')) return true
  if (isFunction(expr, 'Power')) {
    const exp = expr.ops[1]
    if (isNumber(exp)) {
      const v = exp.numericValue
      return typeof v === 'number' && Number.isInteger(v) && v > 1
    }
  }
  if (isFunction(expr, 'Negate')) return isProductForm(expr.ops[0])
  return false
}

/** Count non-numeric (literal) factors */
function countLiteralFactors(factors: Expression[]): number {
  return factors.filter((f) => !isNumber(f)).length
}

/** Count all factors except ±1 (includes non-trivial numeric coefficients) */
function countNonTrivialFactors(factors: Expression[]): number {
  return factors.filter((f) => !f.is(1) && !f.is(-1)).length
}

/** Count how many non-numeric factors from a match those in b (up to sign/order).
 *  Filters out numeric factors internally. */
function matchLiteralFactors(
  aFactors: Expression[],
  bFactors: Expression[],
): number {
  const aLit = aFactors.filter((f) => !isNumber(f))
  const bLit = bFactors.filter((f) => !isNumber(f))
  const used = new Set<number>()
  let count = 0

  for (const af of aLit) {
    for (let j = 0; j < bLit.length; j++) {
      if (used.has(j)) continue
      if (
        af.isSame(bLit[j]) ||
        mathEqual(af, bLit[j]) ||
        af.isSame(bLit[j].neg()) ||
        mathEqual(af, bLit[j].neg())
      ) {
        used.add(j)
        count++
        break
      }
    }
  }
  return count
}

//    ██    ██ ███    ██ ██ ████████
//    ██    ██ ████   ██ ██    ██
//    ██    ██ ██ ██  ██ ██    ██
//    ██    ██ ██  ██ ██ ██    ██
//     ██████  ██   ████ ██    ██
//
//
//    ██   ██  █████  ███    ██ ██████  ██      ██ ███    ██  ██████
//    ██   ██ ██   ██ ████   ██ ██   ██ ██      ██ ████   ██ ██
//    ███████ ███████ ██ ██  ██ ██   ██ ██      ██ ██ ██  ██ ██   ███
//    ██   ██ ██   ██ ██  ██ ██ ██   ██ ██      ██ ██  ██ ██ ██    ██
//    ██   ██ ██   ██ ██   ████ ██████  ███████ ██ ██   ████  ██████
//
//

/* From Arnog 0.53 pour sa propre fonction handleUnite
const UNIT_CONVERSIONS: Record<string, Record<string, number>> = {
  length: {
    mm: 0.001,
    cm: 0.01,
    dm: 0.1,
    m: 1,
    dam: 10,
    hm: 100,
    km: 1000,
  },
  mass: { mg: 0.001, g: 1, kg: 1000 },
}
function parseUnit(
  latex: string,
): { value: number; unit: string; category: string } | null {
  const processed = preprocessLatex(latex)
  const match = processed.match(/^(-?[\d.]+)\s*([a-zA-Z]+)$/)
  if (!match) return null
  const value = parseFloat(match[1])
  const unit = match[2]
  if (isNaN(value)) return null

  for (const [category, units] of Object.entries(UNIT_CONVERSIONS)) {
    if (unit in units) {
      return { value, unit, category }
    }
  }
  return null
}

function convertToBase(value: number, unit: string): number | null {
  for (const units of Object.values(UNIT_CONVERSIONS)) {
    if (unit in units) {
      return value * units[unit]
    }
  }
  return null
}
*/
//    ██ ███    ██ ████████ ███████ ██████  ██    ██  █████  ██
//    ██ ████   ██    ██    ██      ██   ██ ██    ██ ██   ██ ██
//    ██ ██ ██  ██    ██    █████   ██████  ██    ██ ███████ ██
//    ██ ██  ██ ██    ██    ██      ██   ██  ██  ██  ██   ██ ██
//    ██ ██   ████    ██    ███████ ██   ██   ████   ██   ██ ███████
//
//
//    ██████   █████  ██████  ███████ ██ ███    ██  ██████
//    ██   ██ ██   ██ ██   ██ ██      ██ ████   ██ ██
//    ██████  ███████ ██████  ███████ ██ ██ ██  ██ ██   ███
//    ██      ██   ██ ██   ██      ██ ██ ██  ██ ██ ██    ██
//    ██      ██   ██ ██   ██ ███████ ██ ██   ████  ██████
//
//

function parseInterval(str: string): {
  leftClosed: boolean
  rightClosed: boolean
  leftVal: string
  rightVal: string
} | null {
  // const match = str.match(/^([\[\]])([^;]+);([^;]+)([\[\]])$/)
  const match = str.match(/^([\\[\]])([^;]+);([^;]+)([\\[\]])$/)
  if (!match) return null
  return {
    leftClosed: match[1] === '[',
    leftVal: match[2].trim(),
    rightVal: match[3].trim(),
    rightClosed: match[4] === ']',
  }
}

//    ██   ██  █████  ███    ██ ██████  ██      ███████
//    ██   ██ ██   ██ ████   ██ ██   ██ ██      ██
//    ███████ ███████ ██ ██  ██ ██   ██ ██      █████
//    ██   ██ ██   ██ ██  ██ ██ ██   ██ ██      ██
//    ██   ██ ██   ██ ██   ████ ██████  ███████ ███████
//
//

// Version ArnoG (non retenue)
/*
function handleHMS(saisie: string, answer: string): ResultType {
  const parseHMS = (s: string) => {
    const m = s.match(/^(\d+)h(?:(\d+)m)?(?:(\d+)s)?$/)
    if (!m) return null
    return {
      h: parseInt(m[1]),
      m: parseInt(m[2] || '0'),
      s: parseInt(m[3] || '0'),
    }
  }
  const s = parseHMS(saisie)
  const a = parseHMS(answer)
  if (!s || !a) return fail()
  if (s.h === a.h && s.m === a.m && s.s === a.s) return ok()
  return fail()
}
*/

/**
 * Comparaison de durées
 * @param {string} saisie
 * @param {string} goodAnswer
 * @return ResultType
 * @author Jean-claude Lhote
 */
// function hmsCompare(saisie: string, goodAnswer: string): ResultType {
function handleHMS(saisie: string, goodAnswer: string): ResultType {
  const clean = generateCleaner(['unites'])
  const cleanInput = clean(saisie)
  const inputHms = Hms.fromString(cleanInput)
  const goodAnswerHms = Hms.fromString(goodAnswer)
  return { isOk: goodAnswerHms.isTheSame(inputHms) }
}

// Pour éviter que G en Latex soit pris pour CatalanConstant
// ce.latexDictionary = [
//   ...ce.latexDictionary,
//   { identifierTrigger: 'G', name: 'G' } as LatexDictionaryEntry,
// ]

/**
 * Compare deux chaînes de coordonnées (2D ou 3D), en normalisant les formats.
 * Gère : parenthèses, séparateur (;), fractions, décimaux, espaces, etc.
 * Exemples acceptés : (3;3), 3;4, (-3;2{,}5), (\frac35;-frac{2}{5}), 1,2,3
 * @author Jean-claude Lhote
 */
export function handleCoordinates(saisie: string, answer: string): ResultType {
  // Nettoyage de base (parenthèses, espaces, fractions, virgules)
  const cleaner = generateCleaner([
    'fractionsMemesNegatives',
    'parentheses',
    'espaces',
    'virgules',
  ])

  // Fonction pour transformer une chaîne en tableau de nombres (ou chaînes mathématiques)
  function parseCoords(str: string): string[] {
    // Nettoyage global
    let s = cleaner(str)
    // Suppression des parenthèses résiduelles
    s = s.replace(/^[([]|[)\]]$/g, '')
    // Découpe
    return s
      .split(';')
      .map((x) => x.trim())
      .filter((x) => x.length > 0)
  }

  const coordsSaisie = parseCoords(saisie)
  const coordsAnswer = parseCoords(answer)

  if (coordsSaisie.length !== coordsAnswer.length) {
    return fail('Nombre de coordonnées différent')
  }

  // Comparaison mathématique coordonnée à coordonnée
  for (let i = 0; i < coordsSaisie.length; i++) {
    const a = parse(coordsSaisie[i])
    const b = parse(coordsAnswer[i])
    if (!mathEqual(a, b)) {
      return fail(`Coordonnée ${i + 1} incorrecte`)
    }
  }
  return ok()
}

function normaliseUnions(expr: string): string {
  if (!expr.includes('\\cup')) return expr

  return expr
    .split('\\cup')
    .map((s) => s.trim())
    .sort()
    .join('\\cup')
}

// Version ArnoG (optimisée par rapport à la notre)
// Initialement crée par Jean-claude Lhote
function handleIntervalle(saisie: string, answer: string): ResultType {
  // Unicode → LaTeX replacements for copy-paste from browsers/Wikipedia
  const UNICODE_TO_LATEX: Array<[string, string]> = [
    ['∅', '\\emptyset'],
    ['∪', '\\cup'],
    ['⋃', '\\cup'],
    ['∩', '\\cap'],
    ['⋂', '\\cap'],
    ['ℕ', '\\mathbb{N}'],
    ['ℤ', '\\mathbb{Z}'],
    ['𝔻', '\\mathbb{D}'],
    ['ℚ', '\\mathbb{Q}'],
    ['ℝ', '\\mathbb{R}'],
    ['ℂ', '\\mathbb{C}'],
  ]

  function normalise(s: string): string {
    const result = UNICODE_TO_LATEX.reduce(
      (acc, [from, to]) => acc.replaceAll(from, to),
      s,
    )
    // Nettoie le code saisi pour uniformiser toute saisie
    const clean = generateCleaner([
      'virgules',
      'parentheses',
      'espaces',
      'accolades',
    ])

    return clean(result)
      .replace(/\\,/g, '')
      .replace(/ /g, '')
      .replaceAll(/\\backslash/g, '\\')
  }

  // const localSaisie = normalise(saisie)
  // const localAnswer = normalise(answer)
  const localSaisie = normaliseUnions(normalise(saisie))
  const localAnswer = normaliseUnions(normalise(answer))

  // ── Empty set ─────────────────────────────────────────────────────────
  if (localAnswer === '\\emptyset') {
    if (localSaisie === '\\emptyset' || localSaisie === '\\{\\}') return ok()
    return fail("La bonne réponse était l'ensemble vide : $\\emptyset$.")
  }

  // ── Number sets (\mathbb{X}) ──────────────────────────────────────────
  const mathbbMatch = localAnswer.match(/^\\mathbb\{([A-Za-z])\}$/)
  if (mathbbMatch) {
    const lettre = mathbbMatch[1]
    if (localSaisie === localAnswer) return ok()
    if (localSaisie === lettre)
      return fail(
        `La bonne réponse était $\\mathbb{${lettre}}$ et non ${lettre}.`,
      )
    return fail(`La bonne réponse était cet ensemble : $\\mathbb{${lettre}}$.`)
  }

  // ── Singleton {a} ──────────────────────────────────────────────────────c─
  const singletonMatch = localAnswer.match(/^\\\{([\s\S]+)\\\}$/)

  if (singletonMatch) {
    const valeur = singletonMatch[1]

    // const saisieMatch = localSaisie.match(/^\\\{([^}]+)\\\}$/)
    const saisieMatch = localSaisie.match(/^\\\{([\s\S]+)\\\}$/)

    if (saisieMatch) {
      const valeurSaisie = saisieMatch[1]

      if (mathEqual(parse(valeurSaisie), parse(valeur))) {
        return ok()
      }

      return fail(`La valeur du singleton est incorrecte : $${valeurSaisie}$.`)
    }

    return fail(`La bonne réponse était le singleton $\\{${valeur}\\}$.`)
  }

  // ── Number set minus singleton ──────────────────────────────────────────
  const minusSingletonMatch = localAnswer.match(
    /^\\mathbb\{([A-Za-z])\}\\\\\{([^}]+)\\\}$/,
  )

  if (minusSingletonMatch) {
    const lettre = minusSingletonMatch[1]
    const valeur = minusSingletonMatch[2]

    if (localSaisie === localAnswer) return ok()

    return fail(`La bonne réponse était $\\mathbb{${lettre}}\\{${valeur}\\}$.`)
  }

  // ── Interval(s) with brackets (including unions / intersections) ──────
  // Split on brackets and semicolons to extract bounds and operators separately.
  const borneAndOpSaisie = localSaisie.match(/[^[\];]+/g)
  const borneAndOpReponse = localAnswer.match(/[^[\];]+/g)
  const crochetsSaisie = localSaisie.match(/[[\]]/g)
  const crochetsReponse = localAnswer.match(/[[\]]/g)

  if (
    borneAndOpSaisie != null &&
    borneAndOpReponse != null &&
    crochetsSaisie != null &&
    crochetsReponse != null
  ) {
    if (borneAndOpSaisie.length !== borneAndOpReponse.length) return fail()

    let isOk1 = true
    let isOk2 = true
    let feedback = ''

    // Compare bounds and operators element-by-element
    for (let i = 0; i < borneAndOpSaisie.length; i++) {
      const sv = borneAndOpSaisie[i]
      const av = borneAndOpReponse[i]
      const isOp =
        sv === '\\cup' || sv === '\\cap' || av === '\\cup' || av === '\\cap'
      const elemOk = isOp ? sv === av : mathEqual(parse(sv), parse(av))
      if (!elemOk) {
        isOk1 = false
        feedback += isOp
          ? `Il y a une erreur avec l'opérateur : $${sv}$.<br>`
          : `Il y a une erreur avec la valeur : $${sv}$.<br>`
      }
    }

    // Compare bracket count first, then individual orientations
    if (crochetsSaisie.length !== crochetsReponse.length) {
      isOk2 = false
      feedback += 'Il y a une erreur avec les crochets.'
    } else {
      for (let i = 0; i < crochetsSaisie.length; i++) {
        if (crochetsSaisie[i] !== crochetsReponse[i]) {
          isOk2 = false
          feedback += `Le crochet placé en position ${i + 1} est mal orienté.<br>`
        }
      }
    }

    return { isOk: isOk1 && isOk2, feedback }
  }

  // Has some brackets but not a complete interval → bracket error
  if (crochetsSaisie != null && crochetsSaisie.length > 0) {
    return fail('Il y a une erreur avec les crochets.')
  }

  return fail("Il faut donner un intervalle ou une réunion d'intervalles.")
}

/* Version avant passage à 0.53 de CE : Elle est parfaitement fonctionnelle mais moins optimisée
 * La fonction de comparaison des intervalles pour l'interactif
 * @param {string} saisie
 * @param {string} answer
 * @author Jean-claude Lhote
 
function handleIntervalle(saisie: string, answer: string) {
  const clean = generateCleaner(['virgules', 'parentheses', 'espaces'])
  const replaceTable = [
    // Indispensable pour gérer les copier-coller
    ['∅', '\\emptyset'],
    ['∪', '\\cup'],
    ['⋃', '\\cup'],
    ['∩', '\\cap'],
    ['⋂', '\\cap'],
    ['ℕ', '\\mathbb{N}'],
    ['ℤ', '\\mathbb{Z}'],
    ['𝔻', '\\mathbb{D}'],
    ['ℚ', '\\mathbb{Q}'],
    ['ℝ', '\\mathbb{R}'],
    ['ℂ', '\\mathbb{C}'],
  ]
  const localsaisie = replaceTable.reduce((currentsaisie, replacement) => {
    return currentsaisie.replaceAll(replacement[0], replacement[1])
  }, clean(saisie))
  const localanswer = clean(answer)
  if (localanswer === '\\emptyset') {
    if (localsaisie === '\\emptyset' || localsaisie === '\\{\\}')
      return { isOk: true, feedback: '' }
    return {
      isOk: false,
      feedback: "La bonne réponse était l'ensemble vide : $\\emptyset$.",
    }
  } else {
    const match = localanswer.match(/\\mathbb\{([A-Za-z])\}/)
    if (match && typeof match[1] === 'string') {
      if (localanswer === localsaisie) return { isOk: true, feedback: '' }
      else {
        const lettre = match[1]
        if (localsaisie === lettre)
          return {
            isOk: false,
            feedback: `La bonne réponse était $\\mathbb{${lettre}}$ et non ${lettre}.`,
          }
        else
          return {
            isOk: false,
            feedback: `La bonne réponse était cet ensemble : $\\mathbb{${lettre}}$.`,
          }
      }
    }
  }
  let isOk1 = true
  let isOk2 = true
  let feedback = ''
  const extractBornesAndOp = /[^[\];]+/g
  const extractCrochets = /[[\]]/g
  const borneAndOpSaisie = localsaisie.match(extractBornesAndOp)
  const borneAndOpReponse = localanswer.match(extractBornesAndOp)
  const crochetsSaisie = localsaisie.match(extractCrochets)
  const crochetsReponse = localanswer.match(extractCrochets)
  if (
    borneAndOpSaisie != null &&
    borneAndOpReponse != null &&
    crochetsSaisie != null &&
    crochetsReponse != null
  ) {
    if (borneAndOpSaisie.length !== borneAndOpReponse.length) {
      return fail()
    }
    // On teste les bornes et les opérateurs
    let i: number
    isOk1 = true
    for (i = 0; i < borneAndOpSaisie.length; i++) {
      isOk1 &&= fonctionComparaison(
        borneAndOpSaisie[i],
        borneAndOpReponse[i],
      ).isOk
      if (!isOk1) {
        feedback += ['\\cup', '\\cap'].includes(borneAndOpSaisie[i])
          ? `Il y a une erreur avec l'opérateur : $${borneAndOpSaisie[i]}$.<br>`
          : `Il y a une erreur avec la valeur : $${borneAndOpSaisie[i]}$.<br>`
      }
    }
    // on teste maintenant les crochets
    isOk2 = crochetsSaisie.length === crochetsReponse.length
    if (!isOk2) {
      feedback += 'Il y a une erreur avec les crochets.'
    }
    if (isOk2) {
      for (i = 0; i < crochetsSaisie.length; i++) {
        isOk2 = crochetsSaisie[i] === crochetsReponse[i] && isOk2
        if (crochetsSaisie[i] !== crochetsReponse[i]) {
          feedback += `Le crochet placé en position ${i + 1} est mal orienté.<br>`
        }
      }
    }
    return { isOk: isOk1 && isOk2, feedback }
  }
  return {
    isOk: false,
    feedback: "Il faut donner un intervalle ou une réunion d'intervalles.",
  }
} */

// Version ArnoG
// Initialement crée par Jean-claude Lhote
function handleEstDansIntervalle(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'parentheses', 'espaces'])
  const interval = parseInterval(clean(answer))
  if (!interval) return fail()

  const val = parse(clean(saisie))
  const left = parse(interval.leftVal)
  const right = parse(interval.rightVal)

  const nv = val.N()
  const nl = left.N()
  const nr = right.N()

  // If value can't be evaluated numerically (e.g. '2x'), we don't accept it
  if (!isNumber(nv)) return fail()

  const v = Number(nv.numericValue)
  const l = isNumber(nl) ? Number(nl.numericValue) : NaN
  const r = isNumber(nr) ? Number(nr.numericValue) : NaN

  if (isNaN(v) || isNaN(l) || isNaN(r)) return ok()

  const inLeft = interval.leftClosed ? v >= l : v > l
  const inRight = interval.rightClosed ? v <= r : v < r

  return inLeft && inRight
    ? ok()
    : fail(`$${saisie}$ est hors de l'intervalle.`)
}

/**
 * Format des nombres avec les espaces adéquats
 * @param {string} nombre // Un nombre sans espace sous forme d'une chaîne de caractères
 * @author Éric Elter (aide par ChatGPT)
 * @example formatNumberWithSpaces('1234567') renvoie '1 234 567'
 * @example formatNumberWithSpaces('1239,4567') renvoie '1 239,456 7'
 * @returns {string}
 */
function formatNumberWithSpaces(nombre: string): string {
  return nombre.replace(/\b\d+(?:[.,]\d+)?\b/g, (match) => {
    // Détection du séparateur utilisé
    const separator = match.includes(',') ? ',' : '.'

    // Séparer la partie entière et la partie décimale
    const [entier, decimal] = match.split(separator)

    // Formater la partie entière : espace tous les 3 chiffres de gauche à droite
    const entierFormate = entier.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')

    if (decimal) {
      // Formater la partie décimale : espace tous les 3 chiffres de droite à gauche
      const decimalFormate = decimal.replace(/(\d{3})(?=\d)/g, '$1 ')
      return `${entierFormate}${separator}${decimalFormate.trim()}`
    }

    return entierFormate // Retourne uniquement la partie entière si pas de décimale
  })
}

function handleNombreAvecEspace(saisie: string, answer: string): ResultType {
  /* Version ArnoG 0.53
  // Parse numeric value from input (remove spaces, convert French decimal)
  const numStr = saisie.replace(/ /g, '').replace(/\{,\}/g, '.')
  const num = parseFloat(numStr)

  // Parse numeric value from answer (remove \,, convert French decimal)
  const ansStr = answer
    .replace(/\\,/g, '')
    .replace(/\{,\}/g, '.')
    .replace(/ /g, '')
  const ans = parseFloat(ansStr)

  if (isNaN(num) || isNaN(ans)) return fail()
  if (Math.abs(num - ans) > 1e-12) return fail()

  // Check formatting: compute expected format and compare
  const expected = frenchFormatWithSpaces(num)
  if (saisie === expected) return ok()
  return fail()
  */
  // Version de Rémi Angot
  let inputCleanFirst = saisie.replaceAll(/(\s{2,})(?=\d{3})/g, ' ').trim() // EE : l'élève peut avoir un saisi un espace avant ou après le nombre et avoir saisi des doubles espaces sans qu'on lui en tienne rigueur tant qu'ils séparent bien les classes, évidemment.
  inputCleanFirst = inputCleanFirst.replaceAll(/\\,/g, ' ') // EE : Permet à input que les espaces ressemblent uniquement à ' ' et non à '\,'.
  const clean = generateCleaner(['espaces'])
  const inputClean = clean(saisie)
  const goodAnswerClean = clean(answer)
  let goodAnswerNew = goodAnswerClean.replace(/\s+/g, '') // EE : On enlève tous les espaces s'il y en a.

  // Gestion pénible de la virgule ci-dessous dans le cas de plus de 3 chiffres dans la partie décimale.
  goodAnswerNew = goodAnswerNew.replace('{,}', ',') // EE : On enlève toutes les virgules sous la forme {,} s'il y en a.
  goodAnswerNew = formatNumberWithSpaces(goodAnswerNew) // EE : On rajoute tous les espaces adéquats.
  goodAnswerNew = goodAnswerNew.replace(',', '{,}') // EE : On rajoute toutes les virgules sous la forme {,} s'il y en a.

  let feedback = ''
  if (inputCleanFirst !== goodAnswerNew && inputClean === goodAnswerClean) {
    feedback = 'Le nombre est mal écrit, il faut faire attention aux espaces.'
  }
  return { isOk: inputCleanFirst === goodAnswerNew, feedback }
}

/**
 * @author Éric Elter
 */
function handlefractionSansRacineCarree(
  saisie: string,
  answer: string,
): ResultType {
  const cleaner = generateCleaner(['fractions'])
  const localInput = cleaner(saisie)
  const localGoodAnswer = cleaner(answer)

  const inputSansMoinsDevant = localInput.replace(/^-+/, '')
  const inputSansMoinsDevantRaw = parseRaw(inputSansMoinsDevant)
  if (!(inputSansMoinsDevantRaw.operator === 'Divide'))
    return fail('Incorrect car la réponse attendue est une fraction.')

  if (
    isFunction(inputSansMoinsDevantRaw) &&
    inputSansMoinsDevantRaw.op2.has('Sqrt')
  )
    return fail(
      'Incorrect car la fraction possède une racine carrée au dénominateur.',
    )

  return mathEqual(parse(localInput), parse(localGoodAnswer)) ? ok() : fail()
}

/**
 * Vérifie si une chaîne est en notation scientifique LaTeX valide.
 * Gère les formes "a\\times10^{b}" et "10^{b}\\timesa".
 * Retourne un objet avec isOk et feedback.
 * @author Éric Elter
 */
/**
 * Vérifie si une chaîne est en notation scientifique LaTeX valide.
 * Gère les formes "a\\times10^b" et "10^b\\timesa" avec ou sans accolades.
 * Retourne un objet avec isOk et feedback.
 * @author Éric Elter
 */
function isScientific(str: string): ResultType {
  // Regex 1 : a\times10^b ou a\times10^{b}
  const regex1 = /^(-?\d+(?:\.\d+)?)\\times10\^{?(-?\d+)}?$/
  // Regex 2 : 10^b\timesa ou 10^{b}\timesa
  const regex2 = /^10\^{?(-?\d+)}?\\times(-?\d+(?:\.\d+)?)$/

  let base: number | null = null
  let exponent: number | null = null

  if (regex1.test(str)) {
    const match = str.match(regex1)!
    base = Number(match[1])
    exponent = Number(match[2])
  } else if (regex2.test(str)) {
    const match = str.match(regex2)!
    exponent = Number(match[1])
    base = Number(match[2])
  } else
    return fail(
      'Format incorrect : utilisez $a\\times10^b$ ou $10^b\\times a$ où $a$ et $b$ sont des décimaux.',
    )

  if (isNaN(base) || isNaN(exponent))
    return fail("La mantisse ou l'exposant n'est pas un nombre valide.")

  if (Math.abs(base) < 1)
    return fail('La mantisse doit être supérieure ou égale à 1.')

  if (Math.abs(base) >= 10)
    return fail('La mantisse doit être inférieure à 10.')

  return ok()
}

function handleEcritureScientifique(
  saisie: string,
  answer: string,
): ResultType {
  /*
  Version ArnoG 0.53 (non complète, pas tous les feedback)
  const ansN = parse(answer).N()
  if (!isNumber(ansN)) return fail()
  const ansVal = Number(ansN.numericValue)
  if (isNaN(ansVal)) return fail()

  const processed = preprocessLatex(saisie)

  // Match: mantissa x 10^{exponent} or mantissa x 10^exponent
  const sciMatch = processed.match(
    /^(-?[\d.]+)\s*\\times\s*10\^?\{?(-?\d+)\}?$/,
  )
  if (sciMatch) {
    const mantissa = parseFloat(sciMatch[1])
    const exponent = parseInt(sciMatch[2])
    const value = mantissa * Math.pow(10, exponent)
    return Math.abs(value - ansVal) < 1e-12 ? ok() : fail()
  }

  // Match: mantissa x 1000 (NOT valid scientific notation)
  if (/\\times\s*\d/.test(processed) && !/\\times\s*10\^/.test(processed))
    return fail()

  // Plain number (no x): equivalent to x 10^0
  const plainVal = parseFloat(processed)
  return !isNaN(plainVal) && Math.abs(plainVal - ansVal) < 1e-12 ? ok() : fail()
*/

  // Version Éric Elter
  const clean = generateCleaner([
    'virgules',
    'espaces',
    'parentheses',
    'puissances',
  ])
  let saisieClean = clean(saisie)
  const reponseClean = clean(answer)
  saisieClean = saisieClean.replace(
    /^(10\^\{?[^}\\]+\}?)\\times(.+)$/,
    '$2\\times$1',
  )

  let saisieCleanFormattee = saisieClean
    .replace(/\s+/g, '') // Supprimer tous les espaces
    .replace(/\\times/g, '\\cdot') // Remplacer \times par \cdot
    .replace(/\^(\d+)/g, '^{$1}') // Ajouter des accolades autour des exposants
    .replace(/\{\+(\d+)\}/g, '{$1}') // Remplacer {+a} par {a}

  // Si la puissance est 0, on accepte mais computeEngine ne met pas en notation scientitique et donc la comparaison entre notation scientifique n'est pas possible.
  // Donc il faut ces trois lignes pour comparer les nombres décimaux, dans ce cas précis.
  const match = saisieCleanFormattee.match(/\^{(-?\d+)}$/) // Recherche des nombres entre accolades
  const puissance = match ? Number(match[match.length - 1]) : null
  if (puissance === 0) {
    saisieCleanFormattee = ce
      .parse(saisieClean)
      .toLatex({ notation: 'scientific', avoidExponentsInRange: [0, 0] })
  }
  const reponseCleanFormattee = ce
    .parse(reponseClean)
    .toLatex({ notation: 'scientific', avoidExponentsInRange: [0, 0] })

  saisieCleanFormattee = saisieCleanFormattee.replace(
    /(\d+\.?\d*?)0*(?=\\cdot)/,
    '$1',
  ) // Pour corriger 9.040\\cdot10^{4} en 9.04\\cdot10^{4}

  if (saisieCleanFormattee === reponseCleanFormattee) return ok()
  if (ce.parse(saisieClean).isEqual(ce.parse(reponseClean)))
    return fail(
      "La réponse fournie est bien égale à celle attendue mais la réponse fournie n'est pas en notation scientifique.",
    )

  if (isScientific(saisieClean).isOk)
    return fail(
      "La réponse fournie est bien en notation scientifique mais la réponse fournie n'est pas égale à celle attendue.",
    )

  return isScientific(saisieClean)
}

/**
 * fonction initialement dans mathlive.js, j'en ai besoin ici, et plus dans mathlive.js
 * @param {string} input la chaine qui contient le nombre avec son unité
 * @return {Grandeur|false} l'objet de type Grandeur qui contient la valeur et l'unité... ou false si c'est pas une grandeur.
 */
function inputToGrandeur(input: string): Grandeur | false {
  if (input.indexOf('°C') > 0) {
    const split = input.split('°C')
    return new Grandeur(Number.parseFloat(split[0].replace(',', '.')), '°C')
  }
  if (input.indexOf('°') > 0) {
    const split = input.split('°')
    return new Grandeur(Number.parseFloat(split[0].replace(',', '.')), '°')
  }
  if (input.split('operatorname').length !== 2) return false
  const split = input.split('\\operatorname{')
  const mesure = Number.parseFloat(split[0].replace(',', '.'))
  if (split[1]) {
    const split2 = split[1].split('}')
    const unite = split2[0] + split2[1]
    return new Grandeur(mesure, unite)
  }
  return false
}

function handleUnite(
  saisie: string,
  answer: string,
  { precision = 1 } = {},
  options: OptionsComparaisonType,
): ResultType {
  /* Version ArnoG 0.53 (incomplet, prise en compte de toutes les unités et tous les feedbacks)
  const sUnit = parseUnit(saisie)
  const aUnit = parseUnit(answer)
  if (!sUnit || !aUnit) return fail()

  if (sUnit.category !== aUnit.category) return fail()

  const sBase = convertToBase(sUnit.value, sUnit.unit)!
  const aBase = convertToBase(aUnit.value, aUnit.unit)!

  if (Math.abs(sBase - aBase) > 1e-12) {
    const p = options.precisionUnite
    if (p !== undefined && p !== 0)
      return fail(`La réponse n'est pas arrondie à $${p * 10}$ près.`)
    return fail()
  }
  return ok()
  */
  // Version Jean-claude Lhote
  const localInput = saisie.replace('^\\circ', '°').replace('\\degree', '°')
  const cleaner = generateCleaner([
    'virgules',
    'espaces',
    'fractions',
    'parentheses',
    'mathrm',
    'operatorName',
  ])
  const inputGrandeur = inputToGrandeur(cleaner(localInput))

  const goodAnswerGrandeur = Grandeur.fromString(
    cleaner(answer).replace('^\\circ', '°').replace('\\degree', '°'),
  )

  if (inputGrandeur) {
    if (inputGrandeur.uniteDeReference !== goodAnswerGrandeur.uniteDeReference)
      return fail(`L'unité choisie n'est, déjà, pas correcte.`)

    if (precision !== undefined) {
      const okPrecision1: boolean = inputGrandeur.estUneApproximation(
        goodAnswerGrandeur,
        precision,
      )
      const okPrecision2: boolean = goodAnswerGrandeur.estUneApproximation(
        inputGrandeur,
        precision,
      )

      if (okPrecision1 && okPrecision2) {
        return ok()
      } else {
        const okPrecision1: boolean = inputGrandeur.estUneApproximation(
          goodAnswerGrandeur,
          1,
        )
        const okPrecision2: boolean = goodAnswerGrandeur.estUneApproximation(
          inputGrandeur,
          1,
        )
        if (okPrecision1 && okPrecision2)
          return fail(
            `Incorrect car la réponse n'est pas arrondie comme il faut.`,
          )
      }
      return fail()
    }
    if (inputGrandeur.estEgal(goodAnswerGrandeur)) {
      return ok()
    }
    return fail()
  }
  // Oubli de l'unité ?
  const inputNumber = Number(ce.parse(cleaner(saisie)))
  const answerNumber = goodAnswerGrandeur.mesure
  const ratio = inputNumber / answerNumber
  const log = Math.log10(ratio)
  const nearestInteger = Math.round(log)
  const epsilon = 1e-10

  if (Math.abs(log - nearestInteger) < epsilon)
    return fail(
      "La réponse pourrait être correcte si l'unité avait été précisée.",
    )

  if (inputNumber !== 0)
    return fail("La réponse est fausse et il faut saisir l'unité.")
  return fail()
}

function handlePuissance(
  saisie: string,
  answer: string,
  options: OptionsComparaisonType,
): ResultType {
  /* Version ArnoG 0.53 (incomplet, manque bcp de feedbacks)
  const sRaw = parseRaw(saisie)
  const s = parse(saisie)
  const a = parse(answer)

  if (options.sansExposantUn) {
    if (containsOp(sRaw, 'Power', (e) => isFunction(e) && e.ops[1].isSame(1)))
      return fail()
    return mathEqual(s, a) ? ok() : fail()
  }

  if (options.seulementCertainesPuissances) {
    // Must have identical raw structure
    return sRaw.isSame(parseRaw(answer)) ? ok() : fail()
  }

  // puissance: true - input must contain a Power expression
  if (!sRaw.has('Power')) return fail()
  return mathEqual(s, a) ? ok() : fail()
  */
  const clean = generateCleaner(['virgules', 'puissances'])
  const nombreSaisi = clean(saisie).split('^')
  const goodAnswerSplit = clean(answer).split('^')

  // saisie n'est pas une puissance (mais cas possiblement correct si exposant de answer est 1 ou 0)
  if (nombreSaisi.length === 1) {
    const exposantGoodAnswer = isNaN(
      Number(goodAnswerSplit[1]?.replace(/[{}]/g, '')), // ? car goodAnswerSplit[1] peut être indéfini si le codeur a omis de mettre une puissance comme réponse
    )
      ? 1
      : goodAnswerSplit[1]?.replace(/[{}]/g, '')
    if (
      (Number(exposantGoodAnswer) === 1 || Number(exposantGoodAnswer) === 0) &&
      ce.parse(clean(saisie)).isEqual(ce.parse(clean(answer)))
    )
      return ok()
    return fail('Une puissance est attendue.')
  }
  // saisie n'est pas une puissance de puissance
  if (options.seulementCertainesPuissances && nombreSaisi.length > 2)
    return fail('Un seul exposant est attendu.')

  let mantisseSaisie = nombreSaisi[0]
  mantisseSaisie = mantisseSaisie.replace(/\\lparen|\\rparen|\(|\)/g, '') // Pour enlever les parenthèses afin que (-4)^2 soit acceptée
  mantisseSaisie = mantisseSaisie.replace(/--/g, '') // Pour accepter les deux - consécutifs.

  // La mantisse saisie est-elle un nombre ? Ou est-elle une lettre ?
  if (isNaN(Number(mantisseSaisie)) && mantisseSaisie.length > 1)
    return fail("Avant l'exposant, on n'attend qu'un nombre et rien d'autre.") // Pour éviter 1\times4^2

  let exposantSaisi = nombreSaisi[1]
  exposantSaisi = exposantSaisi.replace(/\\lparen|\\rparen|\(|\)/g, '') // Pour enlever les parenthèses
  exposantSaisi = exposantSaisi.replace(/--/g, '') // Pour accepter les deux - consécutifs.
  exposantSaisi = exposantSaisi.replace(/[{}]/g, '') // Pour enlever les accolades (possible si exposant décimal ou négatif)
  const exposantSaisiNumber = Number(exposantSaisi)
  // L'exposant saisi est-il un nombre ?
  if (isNaN(Number(exposantSaisiNumber)))
    return fail('On attend un nombre unique comme exposant.')

  // answer n'est pas une puissance donc toute puissance égale à answer est correcte (modulo sansExposantUn)
  if (goodAnswerSplit.length === 1) {
    if (options.sansExposantUn && exposantSaisiNumber === 1)
      return fail('On attend un exposant différent de 1.')
    const isOk = ce.parse(clean(saisie)).isEqual(ce.parse(clean(answer)))
    return {
      isOk: !!isOk,
      feedback: isOk ? '' : "La puissance n'est pas égale au résultat attendu.",
    }
  }

  // answer et saisie sont des puissances alors deux cas se présentent.
  if (options.sansExposantUn) {
    // On accepte un saisie avec un exposant de 1 que si answer en a un aussi.
    let exposantGoodAnswer = goodAnswerSplit[1]
    exposantGoodAnswer = exposantGoodAnswer.replace(
      /\\lparen|\\rparen|\(|\)/g,
      '',
    ) // Pour enlever les parenthèses
    exposantGoodAnswer = exposantGoodAnswer.replace(/--/g, '') // Pour accepter les deux - consécutifs.
    const exposantGoodAnswerNumber = Number(exposantGoodAnswer)
    if (exposantSaisiNumber === 1) {
      if (exposantGoodAnswerNumber !== 1)
        return fail('On attend un exposant différent de 1.')
    } // Très important car parfois, par le calcul, on attend 4^1
  }
  // Ou bien on n'accepte que si answer et saisie sont parfaitement identiques : seulementCertainesPuissances = true
  // Ou bien on n'accepte toute égalité entre answer et saisie : seulementCertainesPuissances = false
  const isOk = !options.seulementCertainesPuissances
    ? ce.parse(clean(saisie)).isEqual(ce.parse(clean(answer)))
    : ce
        .parse(clean(saisie), { form: 'raw' })
        .isSame(ce.parse(clean(answer), { form: 'raw' }))
  if (!isOk) {
    if (ce.parse(clean(saisie)).isEqual(ce.parse(clean(answer))))
      return fail(
        "La puissance est égale au résultat attendu mais ne correspond pas à l'énoncé.",
      )

    return fail("La puissance n'est pas égale au résultat attendu.")
  }
  return ok()
}

function handleFraction(
  saisie: string,
  answer: string,
  options: OptionsComparaisonType,
): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))

  if (
    options.nombreDecimalSeulement &&
    handleNombreDecimalSeulement(saisie, answer).isOk
  )
    return ok()

  if (
    Number.isInteger(ce.parse(clean(saisie)).re) &&
    mathEqual(parse(saisie), parse(answer))
  )
    return ok()

  if (!sFrac) return fail('Résultat incorrect car une fraction est attendue.')

  if (!sFrac.bothIntegers)
    return fail(
      'Résultat incorrect car dénominateur et numérateur doivent être entiers.',
    )

  if (options.fractionIrreductible) {
    const saisieNativeParsed = ce.parse(clean(saisie), { form: 'raw' })
    const cleanGoodAnswer = clean(answer)
    if (
      isFunction(saisieNativeParsed) &&
      (saisieNativeParsed.operator === 'Divide' ||
        saisieNativeParsed.operator === 'Rational') &&
      gcd(sFrac.num, sFrac.den) !== 1
    ) {
      return fail(
        'Résultat incorrect car une fraction irréductible est attendue.',
      )
    }

    return mathEqual(parse(saisie), parse(cleanGoodAnswer))
      ? ok()
      : fail(
          `C'est bien une fraction irréductible mais pas égale à celle attendue.`,
        )
  }

  if (!mathEqual(parse(saisie), parse(answer)))
    return fail(`Cette fraction n'est pas égale à celle attendue.`)

  if (options.fractionDecimale) {
    // Check denominator is a power of 10
    let d = sFrac.den
    while (d > 1 && d % 10 === 0) d /= 10
    if (d !== 1) {
      return fail('Résultat incorrect car une fraction décimale est attendue.')
    }

    // return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
    return ok()
  }

  const aFrac = parseFractionLatex(clean(answer))
  if (!aFrac) return fail('Erreur inattendue.')

  if (options.fractionSimplifiee) {
    const ratio = aFrac.den / sFrac.den

    return !(
      !Number.isInteger(ratio) ||
      ratio < 1 ||
      Math.abs(aFrac.num / sFrac.num - ratio) > 1e-12
    )
      ? ok()
      : fail(
          `Cette fraction est bien égale à celle attendue mais n'est pas simplifiée.`,
        )
  }

  if (options.fractionReduite)
    return !(sFrac.num >= aFrac.num || sFrac.den >= aFrac.den)
      ? ok()
      : fail(
          `Cette fraction est bien égale à celle attendue mais n'est pas réduite.`,
        )

  if (options.fractionIdentique) {
    return sFrac.num === aFrac.num && sFrac.den === aFrac.den
      ? ok()
      : fail(
          `Résultat incorrect car la fraction n'est pas identique à celle attendue.`,
        )
  }

  // options.fractionEgale
  return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
}

/*
function handleFractionIrreductible(
  saisie: string,
  answer: string,
): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))
  const saisieNativeParsed = ce.parse(clean(saisie), { form: 'raw' })
  const cleanGoodAnswer = clean(answer)
  if (!sFrac) return fail('Résultat incorrect car une fraction est attendue.')

  if (
    isFunction(saisieNativeParsed) &&
    (saisieNativeParsed.operator === 'Divide' ||
      saisieNativeParsed.operator === 'Rational') &&
    gcd(sFrac.num, sFrac.den) !== 1
  ) {
    return fail(
      'Résultat incorrect car une fraction irréductible est attendue.',
    )
  }

  if (!mathEqual(parse(saisie), parse(cleanGoodAnswer)))
    return fail(
      `C'est bien une fraction irréductible mais pas égale à celle attendue.`,
    )

  return ok()
}

function handleFractionSimplifiee(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))
  const aFrac = parseFractionLatex(clean(answer))

  if (!sFrac || !aFrac)
    return fail('Résultat incorrect car une fraction est attendue.')

  if (!sFrac.bothIntegers)
    return fail(
      'Résultat incorrect car dénominateur et numérateur doivent être entiers.',
    )

  if (!mathEqual(parse(saisie), parse(answer)))
    return fail(`Cette fraction n'est pas égale à celle attendue.`)

  const ratio = aFrac.den / sFrac.den
  if (
    !Number.isInteger(ratio) ||
    ratio < 1 ||
    Math.abs(aFrac.num / sFrac.num - ratio) > 1e-12
  )
    return fail(
      `Cette fraction est bien égale à celle attendue mais n'est pas simplifiée.`,
    )

  return ok()
}


function handleFractionReduite(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))
  const aFrac = parseFractionLatex(clean(answer))

  if (!sFrac || !aFrac) return fail()

  const s = parse(saisie)
  const a = parse(answer)
  if (!mathEqual(s, a)) return fail()

  if (sFrac.num > aFrac.num || sFrac.den > aFrac.den)
    return fail(
      `Cette fraction est bien égale à celle attendue mais n'est pas réduite.`,
    )

  return ok()
}

function handleFractionIdentique(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))
  const aFrac = parseFractionLatex(clean(answer))

  if (!sFrac || !aFrac) return fail()

  const s = parse(saisie)
  const a = parse(answer)
  if (!mathEqual(s, a)) return fail()

  if (!(sFrac.num === aFrac.num && sFrac.den === aFrac.den))
    return fail(
      `Résultat incorrect car la fraction n'est pas identique à celle attendue.`,
    )

  return ok()
}

function handleFractionDecimale(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))

  if (!sFrac) return fail('Résultat incorrect car une fraction est attendue.')

  // Check denominator is a power of 10
  let d = sFrac.den
  while (d > 1 && d % 10 === 0) d /= 10
  if (d !== 1) {
    return fail('Résultat incorrect car une fraction décimale est attendue.')
  }

  return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
}

function handleFractionEgale(saisie: string, answer: string): ResultType {
  const clean = generateCleaner(['virgules', 'fractionsMemesNegatives'])
  const sFrac = parseFractionLatex(clean(saisie))
  if (!sFrac) return fail('Résultat incorrect car une fraction est attendue.')

  return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
}
*/

function handleNombreDecimalSeulement(
  saisie: string,
  answer: string,
): ResultType {
  /*
  if (hasFractionSyntax(saisie)) {
    return fail(
      'Résultat incorrect car une valeur décimale (ou entière) est attendue.',
    )
  }

  return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
  
  */
  const cleaner = generateCleaner(['virgules'])
  let saisieInput = cleaner(saisie)

  saisieInput = saisieInput
    .replace('(', '')
    .replace(')', '')
    .replace('\\lparen', '')
    .replace('\\rparen', '') // Utile pour 5R20
  const saisieParsed = ce.parse(saisieInput, { form: 'raw' })
  if (
    isFunction(saisieParsed) &&
    !(
      saisieParsed.operator === 'Number' ||
      (saisieParsed.operator === 'Negate' &&
        saisieParsed.ops !== null &&
        saisieParsed.ops.length === 1)
    )
  )
    return fail(
      'Résultat incorrect car une valeur décimale (ou entière) est attendue.',
    )

  return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
}

function handleExpressionNumerique(
  saisie: string,
  answer: string,
  options: OptionsComparaisonType,
): ResultType {
  /* Version initiale
    const cleaner = generateCleaner(['fractions'])
    const localGoodAnswer = cleaner(goodAnswer)
  
    const goodAnswerParsed = ce.parse(localGoodAnswer, {
      form: ['Flatten', 'Order'],
    })
    const inputParsed = ce.parse(input, { form: ['Flatten', 'Order'] }) // Pour se désengager de l'ordre et des parenthèses.
    if (goodAnswerParsed.isSame(inputParsed)) return ok()
  
    // goodAnswerParsed = ce.parse(localGoodAnswer) // C'est la même chose que goodAnswerParsed.canonical
    // inputParsed = ce.parse(input)
  
    if (goodAnswerParsed.canonical.isEqual(inputParsed.canonical)) {
      // Les valeurs numériques sont égales
      if (!Number.isNaN(Number(input))) {
        // Ici, input est un entier.
        return {
          isOk: false,
          feedback:
            'Ce résultat pourrait être correct mais un calcul est attendu.',
        }
      } // Ici, input est un calcul.
      else
        return {
          isOk: false,
          feedback:
            "Ce résultat pourrait être correct mais ce n'est pas ce calcul qui est attendu.",
        }
    }
    return {
      // Ici, input n'a pas la même valeur numérique de goodAnswer
      isOk: false,
      feedback: 'Ce résultat est incorrect.',
    }
  */

  // Version ArnoG 0.53
  const cleaner = generateCleaner(['fractions'])

  answer = cleaner(answer)

  if (!mathEqual(parse(saisie), parse(answer))) return fail()

  if (
    options.nombreDecimalSeulement &&
    handleNombreDecimalSeulement(saisie, answer).isOk
  )
    return ok()

  // Use raw parsing to check if input is just a plain number
  const sRaw = parseRaw(saisie)
  if (!isFunction(sRaw)) {
    return fail('Ce résultat pourrait être correct mais un calcul est attendu.')
  }

  // Compare structure: extract all numeric leaves and compare as sorted arrays
  const sLeaves = extractNumericLeaves(saisie).sort((a, b) => a - b)
  const aLeaves = extractNumericLeaves(answer).sort((a, b) => a - b)

  if (
    sLeaves.length !== aLeaves.length ||
    sLeaves.some((v, i) => Math.abs(v - aLeaves[i]) > 1e-12)
  ) {
    return fail(
      "Ce résultat pourrait être correct mais ce n'est pas ce calcul qui est attendu.",
    )
  }

  return ok()
}

/** Extract all numeric literals from a LaTeX string */
function extractNumericLeaves(latex: string): number[] {
  return (preprocessLatex(latex).match(/\d+(\.\d+)?/g) ?? []).map(Number)
}

function handleEgaliteExpression(saisie: string, answer: string): ResultType {
  const sParts = saisie.split('=')
  const aParts = answer.split('=')
  if (sParts.length !== 2 || aParts.length !== 2)
    return fail('Incorrect car une égalité est attendue.')

  const sL = parse(sParts[0])
  const sR = parse(sParts[1])
  const aL = parse(aParts[0])
  const aR = parse(aParts[1])

  if (
    (mathEqual(sL, aL) && mathEqual(sR, aR)) ||
    (mathEqual(sL, aR) && mathEqual(sR, aL))
  ) {
    return ok()
  }
  return fail()
}

function handleFactorisation(
  saisie: string,
  answer: string,
  options: OptionsComparaisonType,
): ResultType {
  const clean = generateCleaner([
    'puissances',
    'virgules',
    'fractions',
    'parentheses',
  ])
  // console.log(saisie, clean(saisie))
  // console.log(JSON.stringify(parse('c(5c+6)').toJSON()))
  const s = parse(clean(saisie))
  // const s = ce.parse(clean(saisie))
  const a = parse(answer)
  // console.log(clean(saisie), answer)
  // console.log('JSON de la saisie : ', JSON.stringify(a.toJSON()))
  // console.log('JSON de la réponse attendue : ', JSON.stringify(s.toJSON()))

  const sFactors = getFactors(s)
  const aFactors = getFactors(a)

  const valuesEqual = mathEqual(s, a)
  const isOpposite = !valuesEqual && mathEqual(s, a.neg())

  // Not equal — check if opposite and give appropriate feedback
  if (isOpposite)
    return fail("L'expression saisie est l'opposé de l'expression attendue.")

  if (options.nbFacteursIdentiquesFactorisation) {
    if (!valuesEqual && !isOpposite) return fail()
    const sCount = countNonTrivialFactors(sFactors)
    const aCount = countNonTrivialFactors(aFactors)
    if (sCount < aCount)
      return fail("L'expression saisie peut être davantage factorisée.")
    if (sCount > aCount) return fail("L'expression saisie a trop de facteurs.")
    return ok()
  }

  if (options.unSeulFacteurLitteral) {
    if (!valuesEqual && !isOpposite) return fail()
    const sLitCount = countLiteralFactors(sFactors)
    const aLitCount = countLiteralFactors(aFactors)
    if (sLitCount < aLitCount)
      return fail("On n'attend pas une factorisation par un entier.")
    return ok()
  }

  // Reject explicit ×1 factor (e.g., 1×(2a-5)(-2+2a))
  if (valuesEqual) {
    const sRaw = parseRaw(clean(saisie))
    if (hasExplicitOneFactor(sRaw))
      return fail("Une factorisation par 1 a peu d'intérêt.")

    if (hasExplicitMinusOneFactor(sRaw))
      return fail("Une factorisation par -1 a peu d'intérêt.")

    if (isFunction(s, 'Add') || isFunction(s, 'Subtract'))
      return fail(
        "L'expression saisie n'est pas factorisée bien qu'elle soit égale à l'expression attendue.",
      )
    if (!options.factorisation) {
      const sCount = countNonTrivialFactors(sFactors)
      const aCount = countNonTrivialFactors(aFactors)
      if (sCount < aCount)
        return fail("L'expression saisie peut être davantage factorisée.")
      if (sCount > aCount)
        return fail("L'expression saisie a trop de facteurs.")
    }
    if (!options.exclusifFactorisation) return ok()

    // exclusifFactorisation: strict structural factor matching
    // Compare raw factors using canonical matching + raw term count check.
    // Canonical isSame handles term reordering (e.g. -2+2a ↔ 2a-2).
    // rawTermCount rejects over-simplified factors (e.g. 2a-4-1 ↔ 2a-5).
    const aRaw = parseRaw(answer)
    const sRawFactors = getRawFactors(sRaw)
    const aRawFactors = getRawFactors(aRaw)

    const aRemaining = [...aRawFactors]
    let unmatchedCount = 0

    for (const sf of sRawFactors) {
      const sfCan = ce.expr(sf.json)
      let found = false
      for (let j = 0; j < aRemaining.length; j++) {
        const afCan = ce.expr(aRemaining[j].json)
        // Canonical match (or match up to sign — valid since valuesEqual)
        if (sfCan.isSame(afCan) || sfCan.isSame(afCan.neg())) {
          // Verify raw structural similarity (same number of additive terms)
          if (rawTermCount(sf) === rawTermCount(aRemaining[j])) {
            aRemaining.splice(j, 1)
            found = true
            break
          }
        }
      }
      if (!found) unmatchedCount++
    }

    if (unmatchedCount === 0) return ok()
    return fail(
      `${unmatchedCount} facteur${unmatchedCount > 1 ? 's ne sont pas' : " n'est pas"} sous la forme attendue.`,
    )
  }

  // Not equal — check if expression is in factored form
  if (!isProductForm(s))
    return fail("L'expression saisie n'est pas factorisée.")

  // Check for partial factor matches using canonical factors
  const matchCount = matchLiteralFactors(sFactors, aFactors)
  const totalLit = aFactors.filter((f) => !isNumber(f)).length
  if (matchCount > 0 && matchCount < totalLit) {
    return fail(
      `Seulement ${matchCount} facteur${matchCount > 1 ? 's sont corrects' : ' est correct'}.`,
    )
  }

  if (matchCount === 0) {
    return fail("Aucun facteur n'est correct.")
  }

  return fail()
}
// compare deux expressions CE, termes par termes
function compareExpression(
  saisie: ReadonlyArray<Expression>,
  answer: ReadonlyArray<Expression>,
): boolean {
  if (saisie.length !== answer.length) return false

  return saisie.every((element, index) => element.isEqual(answer[index]))
}

// compare the raw (structural) form of the input and the answer: they must match (except for "2x", "2\times x" and "2\cdot x" that we want to consider equivalent):
// This is assuming that you expect the answer to match the order of the reference. If you want to allow the order to be different, use:
function normalizeRaw(json: MathJsonExpression): MathJsonExpression {
  // 🔹 Cas 1 : si ce n’est PAS un tableau
  // Donc un nombre ("3"), un symbole ("x"), etc.
  // → Rien à normaliser
  if (!Array.isArray(json)) {
    return json
  }

  // 🔹 Décomposition du nœud
  // Exemple : ["Add", 2, "x"]
  // op = "Add"
  // args = [2, "x"]
  let [op, ...args] = json

  // 🔥 Supprimer Delimiter inutile
  if (op === 'Delimiter') {
    return normalizeRaw(args[0])
  }
  // 🔹 1️⃣ Uniformiser les multiplications implicites
  // "InvisibleOperator" → "Multiply"
  // Exemple :
  // ["InvisibleOperator", 2, "x"]
  // devient :
  // ["Multiply", 2, "x"]
  if (op === 'InvisibleOperator') {
    op = 'Multiply'
  }

  // 🔹 2️⃣ Transformer Subtract en Add + Negate
  // Objectif : supprimer complètement "Subtract"
  //
  // Exemple :
  // ["Subtract", 3, ["Multiply", 12, "x"]]
  //
  // devient :
  // ["Add", 3, ["Negate", ["Multiply", 12, "x"]]]
  //
  // Cela permet d’avoir UNE SEULE forme pour les sommes.
  if (op === 'Subtract') {
    const [a, b] = args
    return normalizeRaw(['Add', a, ['Negate', b]])
  }

  // 🔹 3️⃣ Normalisation récursive des arguments
  // On descend dans l’arbre pour normaliser les sous-expressions.
  //
  // Exemple :
  // ["Add", ["Subtract",3,4], "x"]
  //
  // Le Subtract interne sera lui aussi transformé.
  const normalizedArgs = args.map(normalizeRaw)

  // 🔹 4️⃣ Canonicaliser Negate(Multiply(...))
  //
  // Objectif : toujours mettre le signe négatif
  // dans le coefficient plutôt que devant tout le produit.
  //
  // Exemple :
  // ["Negate", ["Multiply", 12, "y"]]
  //
  // devient :
  // ["Multiply", ["Negate", 12], "y"]
  //
  // Pourquoi ?
  // Pour éviter d’avoir deux représentations différentes
  // de -12y.
  // if (
  //   op === 'Negate' &&
  //   Array.isArray(normalizedArgs[0]) &&
  //   normalizedArgs[0][0] === 'Multiply'
  // ) {
  //   const [, ...multArgs] = normalizedArgs[0]
  //   const [first, ...rest] = multArgs

  //   return normalizeRaw(['Multiply', ['Negate', first], ...rest])
  // }

  if (op === 'Negate') {
    const arg = normalizedArgs[0]

    // 🔹 Cas 1 : Negate(Multiply(...)) → mettre le signe sur le premier facteur
    if (Array.isArray(arg) && arg[0] === 'Multiply') {
      const [, ...multArgs] = arg
      const [first, ...rest] = multArgs
      return normalizeRaw(['Multiply', ['Negate', first], ...rest])
    }

    // 🔹 Cas 2 : Negate(Divide(...)) → mettre le signe dans le numérateur
    if (Array.isArray(arg) && arg[0] === 'Divide') {
      const numerator = arg[1]
      const denominator = arg[2]
      const newNumerator =
        Array.isArray(numerator) && numerator[0] === 'Negate'
          ? numerator[1] // déjà négatif → double négatif → positif
          : ['Negate', numerator]

      return normalizeRaw(['Divide', newNumerator, denominator])
    }

    // 🔹 Cas général : nombre, symbole, etc.
    return ['Negate', arg]
  }
  // 🔹 5️⃣ Simplifier Multiply(Negate(nombre), ...)
  //
  // Exemple :
  // ["Multiply", ["Negate", 12], "x"]
  //
  // devient :
  // ["Multiply", -12, "x"]
  //
  // Cela donne une forme encore plus canonique.
  if (op === 'Multiply') {
    // 🔹 1️⃣ Copie des facteurs déjà normalisés
    let factors = [...normalizedArgs]

    // 🔹 2️⃣ Aplatir les Multiply imbriqués (associativité)
    const flat: MathJsonExpression[] = []
    for (const f of factors) {
      if (Array.isArray(f) && f[0] === 'Multiply') {
        flat.push(...f.slice(1))
      } else {
        flat.push(f)
      }
    }
    factors = flat

    // 🔹 3️⃣ Supprimer les Delimiter inutiles
    factors = factors.map((f) =>
      Array.isArray(f) && f[0] === 'Delimiter' ? f[1] : f,
    )

    // 🔹 4️⃣ Extraire le signe global (Negate ou -1)
    let sign = 1
    const cleaned: MathJsonExpression[] = []

    for (const f of factors) {
      if (Array.isArray(f) && f[0] === 'Negate') {
        sign *= -1
        cleaned.push(f[1])
      } else if (typeof f === 'number' && f === -1) {
        sign *= -1
      } else {
        cleaned.push(f)
      }
    }

    factors = cleaned

    // 🔹 5️⃣ Extraire le coefficient numérique
    let numericCoef = 1
    const nonNumeric: MathJsonExpression[] = []

    for (const f of factors) {
      if (typeof f === 'number') {
        numericCoef *= f
      } else {
        nonNumeric.push(f)
      }
    }

    numericCoef *= sign
    factors = nonNumeric

    // 🔹 6️⃣ Extraire toutes les fractions
    let numeratorParts: MathJsonExpression[] = []
    const denominatorParts: MathJsonExpression[] = []

    for (const f of factors) {
      if (Array.isArray(f) && f[0] === 'Divide') {
        numeratorParts.push(f[1])
        denominatorParts.push(f[2])
      } else {
        numeratorParts.push(f)
      }
    }

    // 🔹 7️⃣ Injecter le coefficient numérique dans le numérateur
    if (numericCoef !== 1) {
      numeratorParts.unshift(numericCoef)
    }

    // 🔥 8️⃣ Si fraction détectée → créer UNE fraction globale
    if (denominatorParts.length > 0) {
      const numerator: MathJsonExpression =
        numeratorParts.length === 1
          ? numeratorParts[0]
          : ['Multiply', ...numeratorParts]

      const denominator: MathJsonExpression =
        denominatorParts.length === 1
          ? denominatorParts[0]
          : ['Multiply', ...denominatorParts]

      return normalizeRaw(['Divide', numerator, denominator])
    }

    // 🔹 9️⃣ Sinon Multiply classique canonique

    // Supprimer les 1 restants éventuels
    numeratorParts = numeratorParts.filter(
      (f) => !(typeof f === 'number' && f === 1),
    )

    if (numeratorParts.length === 0) return 1
    if (numeratorParts.length === 1) return numeratorParts[0]

    numeratorParts.sort((a, b) =>
      JSON.stringify(a).localeCompare(JSON.stringify(b)),
    )

    return ['Multiply', ...numeratorParts]
  }
  // 🔹 6️⃣ Aplatir les Add (associativité)
  //
  // (a + b) + c  →  a + b + c
  //
  // Exemple :
  // ["Add", ["Add", A, B], C]
  //
  // devient :
  // ["Add", A, B, C]
  //
  // Sans cela, deux expressions équivalentes
  // auraient des arbres différents.
  if (op === 'Add') {
    const flatArgs: MathJsonExpression[] = []

    for (const arg of normalizedArgs) {
      if (Array.isArray(arg) && arg[0] === 'Add') {
        flatArgs.push(...arg.slice(1))
      } else {
        flatArgs.push(arg)
      }
    }

    // 🔹 7️⃣ Trier les termes (commutativité)
    //
    // a + b  =  b + a
    //
    // Exemple :
    // ["Add", "x", 2]
    // et
    // ["Add", 2, "x"]
    //
    // Après tri → même ordre.
    flatArgs.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

    return ['Add', ...flatArgs]
  }

  if (op === 'Divide') {
    let [num, den] = normalizedArgs

    // 🔹 Cas : (Multiply(nombre, ...)) / nombre
    if (
      typeof den === 'number' &&
      Array.isArray(num) &&
      num[0] === 'Multiply' &&
      typeof num[1] === 'number'
    ) {
      const coef = num[1]

      if (coef % den === 0) {
        const newCoef = coef / den
        const rest = num.slice(2)

        if (rest.length === 0) return newCoef
        if (rest.length === 1) return ['Multiply', newCoef, rest[0]]

        return ['Multiply', newCoef, ...rest]
      }
    }

    // 🔹 Cas : nombre / nombre → réduction par PGCD
    if (typeof num === 'number' && typeof den === 'number') {
      const g = pgcd(num, den)

      num /= g
      den /= g

      if (den === 1) return num
      if (den === -1) return -num

      if (den < 0) {
        num = -num
        den = -den
      }

      return ['Divide', num, den]
    }
    return ['Divide', num, den]
  }
  // 🔹 Cas général : on reconstruit le nœud
  return [op, ...normalizedArgs]
}

function handleExpressionsForcementReduites(
  saisie: string,
  answer: string,
): ResultType {
  const clean = generateCleaner([
    // 'puissances',
    'virgules',
    // 'fractionsMemesNegatives',
    'parentheses',
    // 'foisUn',
    // 'imaginaires',
  ])

  const s = parse(clean(saisie))
  const a = expand(clean(answer))

  /* Ne pas supprimer : utile pour débuggage
  console.log('---- DEBUG PARSE ----')
  console.log('saisie cleaned:', clean(saisie))
  console.log('answer cleaned:', clean(answer))
  console.log('s JSON:', JSON.stringify(s.json, null, 2))
  console.log('a JSON:', JSON.stringify(a.json, null, 2))
  console.log('a latex:', a.latex)
  */

  if (!mathEqual(s, a))
    return fail(
      "Incorrect car cette expression n'est pas assez égale à celle attendue.",
    )

  if (saisie.includes('\\times'))
    return fail(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite (présence d'un signe $\\times$).",
    )

  const answerCoef = a.polynomialCoefficients()
  const saisieCoef = s.polynomialCoefficients()

  const saisieRaw = parseRaw(saisie)
  const answerRaw = parseRaw(expand(clean(answer)).simplify().latex)

  /* Ne pas supprimer : utile pour débuggage
  console.log(
    compareExpression(answerCoef ?? [], saisieCoef ?? []),
    'isSymbol',
    isSymbol(saisieRaw),
    isSymbol(a),
    'isFunction',
    isFunction(saisieRaw),
    isFunction(a),
    'isNumber',
    isNumber(saisieRaw),
    isNumber(a),
    // saisieRaw.latex,
    answer,
    clean(answer),
    a.json,
    a.toJSON(),
    a.latex,
  )
*/

  const coefsMatch = compareExpression(answerCoef ?? [], saisieCoef ?? [])

  const typeMatch =
    (isFunction(saisieRaw) && isFunction(a)) ||
    (isSymbol(saisieRaw) && isSymbol(a)) || // Nécessaire pour comparer juste "x"
    (isNumber(saisieRaw) && isNumber(a)) || // Nécessaire pour comparer un entier positif
    (isFunction(saisieRaw) && isNumber(a)) // Nécessaire pour comparer un entier négatif

  if (!(coefsMatch && typeMatch))
    return fail(
      "Cette expression est bien égale à celle attendue mais n'est pas assez réduite.",
    )

  /* Ne pas supprimer : utile pour débuggage
  console.log(
    JSON.stringify(normalizeRaw(saisieRaw.json)),
    JSON.stringify(normalizeRaw(answerRaw.json)),
  )
  */

  // normalizeRaw fonctionne bien pour ne pas accepter '-2\\times x-2\\times (-4)'
  const normalizedSaisie = normalizeRaw(saisieRaw.json)
  const normalizedAnswer = normalizeRaw(answerRaw.json)

  /* Ne pas supprimer : utile pour débuggage
  console.log('---- DEBUG NORMALIZE ----')
  console.log('saisie latex:', saisie)
  console.log('answer latex:', answer)

  console.log('saisieRaw.json:', JSON.stringify(saisieRaw.json, null, 2))
  console.log('answerRaw.json:', JSON.stringify(answerRaw.json, null, 2))

  console.log('normalizedSaisie:', JSON.stringify(normalizedSaisie, null, 2))
  console.log('normalizedAnswer:', JSON.stringify(normalizedAnswer, null, 2))

  console.log(
    'EQUAL ?',
    JSON.stringify(normalizedSaisie) === JSON.stringify(normalizedAnswer),
  )
  */

  return JSON.stringify(normalizedSaisie) === JSON.stringify(normalizedAnswer)
    ? ok()
    : fail(
        "Cette expression est bien égale à celle attendue mais n'est pas assez réduite.",
      )
}

function handleSommeOuDifference(
  saisie: string,
  answer: string,
  expectSum: boolean,
): ResultType {
  const clean = generateCleaner([
    'puissances',
    'virgules',
    'fractionsMemesNegatives',
    'parentheses',
    'foisUn',
    'imaginaires',
  ])
  saisie = clean(saisie)
  answer = clean(answer)

  if (!mathEqual(parse(saisie), parse(answer))) return fail()

  const sRaw = parseRaw(saisie)
  const opName = expectSum ? 'somme' : 'différence'

  // Check if input is just a plain number (no operation)
  if (!isFunction(sRaw))
    return fail('Résultat incorrect car un calcul est attendu.')

  // Check operator type
  const expectedOp = expectSum ? 'Add' : 'Subtract'
  if (sRaw.operator !== expectedOp)
    return fail(`Résultat incorrect car c'est une ${opName} qui est attendue.`)

  // Check for adding/subtracting 0
  if (sRaw.ops.some((o) => o.is(0)))
    return fail(`Résultat incorrect car la ${opName} par 0 est inutile.`)

  return ok()
}

function handleProduitouQuotient(
  saisie: string,
  answer: string,
  expectProduct: boolean,
): ResultType {
  const clean = generateCleaner([
    'puissances',
    'virgules',
    'fractionsMemesNegatives',
    'parentheses',
    'foisUn',
    'imaginaires',
  ])
  saisie = clean(saisie)
  answer = clean(answer)

  if (!mathEqual(parse(saisie), parse(answer))) return fail()

  const sRaw = parseRaw(saisie)
  const opName = expectProduct ? 'multiplication' : 'division'

  // Check if input is just a plain number (no operation)
  if (!isFunction(sRaw))
    return fail('Résultat incorrect car un calcul est attendu.')

  // Check operator type
  const expectedOp = expectProduct
    ? ['Multiply', 'Power']
    : ['Rational', 'Divide', 'Power']
  if (!expectedOp.includes(sRaw.operator))
    return fail(`Résultat incorrect car c'est une ${opName} qui est attendue.`)

  // Check for adding/subtracting 0
  if (sRaw.ops.some((o) => o.is(1)))
    return fail(`Résultat incorrect car la ${opName} par 1 est inutile.`)

  return ok()
}

function handletexteAvecCasse(
  saisie: string,
  answer: string,
  firstTime: boolean,
): ResultType {
  const cleaner = generateCleaner([
    'parentheses',
    'mathrm',
    'fractions',
    'virgules',
  ])
  // Ligne ci-dessous utile si la réponse est (B,F) comme dans 2S30-5
  saisie = saisie.replace(
    /\\lparen\s*([^{}]+)\s*\{,\}\s*([^{}]+)\s*\\rparen/g,
    '($1,$2)',
  )

  // Ligne ci-dessous utile si la réponse est P(A\cap B) comme dans 1P10-1
  saisie = saisie.replace(/\\lparen\s*/g, '(').replace(/\\rparen/g, ')')

  answer = answer.replace(/\\lparen\s*/g, '(').replace(/\\rparen/g, ')')

  let localsaisie = cleaner(saisie)
  const localanswer = cleaner(answer)
  const clean = generateCleaner(['espaceNormal', 'doubleEspaces'])
  localsaisie = clean(localsaisie)
  // Cette commande ci-dessous est mauvaise.
  // Je la laisse pour expliquer pourquoi elle est mauvaise.
  // Autant, elle serait utile pour comparer 'aucun' et 'Aucun'
  // mais elle ne le serait plus pour comparer [AB] et [ab] ce qui serait dommage.
  // return { isOk: saisie.toLowerCase() === answer.toLowerCase() }
  if (localanswer === localsaisie) return ok()
  if (firstTime)
    if (handletexteAvecCasse(saisie.toLowerCase(), answer.toLowerCase(), false))
      return fail(
        'Résultat incorrect car majuscules ou minuscules non respectées.',
      )
  return fail()
}

function handleExpressionExpanded(saisie: string, answer: string): ResultType {
  const clean = generateCleaner([
    'virgules',
    'parentheses',
    'fractions',
    'divisions',
  ])
  const cleanInput = clean(saisie)

  if (handleCalculFormel(saisie, answer).isOk) {
    if (
      JSON.stringify(ce.parse(cleanInput, { form: 'raw' }).json).includes(
        'InvisibleOperator',
      ) ||
      JSON.stringify(ce.parse(cleanInput, { form: 'raw' }).json).includes(
        'Power',
      )
    )
      return fail(
        'La réponse fournie est bien égale à celle attendue mais il manque au moins un signe $\\times$.',
      )
    return ok()
  }
  return fail()
}

function handleFonction(
  saisie: string,
  answer: string,
  { variable = 'x', domaine = [-100, 100], entier = false } = {},
): ResultType {
  const clean = generateCleaner([
    'virgules',
    'parentheses',
    'fractions',
    'divisions',
  ])
  const cleanInput = clean(saisie)
  // const inputParsed = ce.parse(cleanInput)
  // const inputFn = compile(inputParsed)
  const cleanAnswer = clean(answer)
  // const goodAnswerFn = compile(ce.parse(cleanAnswer))
  const inputFn = compile(cleanInput)
  const goodAnswerFn = compile(cleanAnswer)
  const [min, max] = domaine
  const range = max - min
  const valAlea = () => {
    const v = min + range * Math.random()
    return entier ? Math.round(v) : v
  }

  if (!inputFn.run || !goodAnswerFn.run)
    throw Error(
      `functionCompare : La saisie ou la bonne réponse ne sont pas des fonctions (saisie : ${saisie} et réponse attendue : ${answer})`,
    )

  const varName = variable ?? 'x'
  /* Methode de JCL jusqu'à la migration de compute-engine en 0.51.1 le 18/02/2026
    let sortieA1000 = true
    let [a, b, c] = [0, 0, 0]
    for (let cpt = 0; cpt < 1000; cpt++) {
      ;[a, b, c] = [valAlea(), valAlea(), valAlea()]
      if (
        [{ [varName]: a }, { [varName]: b }, { [varName]: c }].every(
          (v) => !Number.isNaN(goodAnswerFn.run!(v)),
        )
      ) {
        sortieA1000 = false
        break
      }
    }
    if (sortieA1000) {
      window.notify(
        "functionCompare n'a pas réussi à trouver 3 valeurs dans le domaine qui donnent une image par la fonction goodAnswer !",
        { fonction: goodAnswer, domaine },
      )
      return { isOk: false, feedback: 'erreur dans le programme' }
    }
    let isOk = true
    for (const x of [a, b, c]) {
      const vars = Object.fromEntries([[variable ?? 'x', x]])
      const y1 = Number(inputFn.run(vars))
      const y2 = Number(goodAnswerFn.run(vars))
      isOk = isOk && Math.abs(y1 - y2) < 1e-10
    }
      */

  // Proposition faite par ArnoG le 18/02/2026 suite à migration de compute-engine en 0.51.1
  let isEqual = false
  for (let cpt = 0; cpt < 100; cpt++) {
    const points = [valAlea(), valAlea(), valAlea()].map((v) => ({
      [varName]: v,
    }))
    // Skip test points where the expected answer produces NaN
    if (points.some((p) => Number.isNaN(goodAnswerFn.run!(p)))) continue
    if (
      !points.every(
        (p) =>
          Math.abs(
            (inputFn.run!(p) as number) - (goodAnswerFn.run!(p) as number),
          ) < 1e-10,
      )
    ) {
      isEqual = false
      break
    }
    isEqual = true
  }
  return { isOk: isEqual }
}

function handleCalculFormel(saisie: string, answer: string): ResultType {
  const clean = generateCleaner([
    'puissances',
    'virgules',
    'fractionsMemesNegatives',
    'parentheses',
    'foisUn',
    'imaginaires',
  ])
  const localInput = clean(saisie)
  const localGoodAnswer = clean(answer)
  // A se demander si en canonical, ce ne serait pas même encore mieux.
  // Et à se demander si 'is' ne serait pas mieux que 'isEqual'.
  // A voir à l'usage.
  return ce
    .parse(localInput, { form: 'raw' })
    .isEqual(ce.parse(localGoodAnswer, { form: 'raw' }))
    ? ok()
    : fail()
}

/**
 * Check if an expression is "expanded" (développée), meaning it contains
 * no unexpanded powers of sums like (a+b)^n with n >= 2, and no
 * products of sums like (a+b)(c+d).
 *
 * Powers/products of single terms (monomials) are fine:
 *   (5x)^2 is expanded, but (5x-4)^2 is not.
 *
 * "Not reduced" is acceptable: 5x*5x is expanded (even though it
 * could be simplified to 25x^2).
 */
function isExpandedExpression(expr: Expression): boolean {
  // Power(Add(...), n) with n >= 2 → not expanded
  if (isFunction(expr, 'Power')) {
    const exp = expr.op2
    if (isFunction(expr.op1, 'Add') && isNumber(exp)) {
      const v = exp.numericValue
      if (typeof v === 'number' && v >= 2) return false
    }
  }

  // Multiply containing an Add operand → not expanded (undistributed product)
  if (isFunction(expr, 'Multiply'))
    for (const child of expr.ops) if (child.operator === 'Add') return false

  // Recursively check all sub-expressions
  if (isFunction(expr))
    for (const child of expr.ops) if (!isExpandedExpression(child)) return false

  return true
}

function handleDeveloppementEgal(saisie: string, answer: string): ResultType {
  const clean = generateCleaner([
    'puissances',
    'virgules',
    'fractionsMemesNegatives',
    'parentheses',
    'foisUn',
    'imaginaires',
  ])
  const localInput = clean(saisie)
  const localGoodAnswer = clean(answer)

  const parsedSaisie = ce.parse(localInput)
  const parsedAnswer = ce.parse(localGoodAnswer)

  if (!mathEqual(parsedSaisie, parsedAnswer))
    return fail(
      "Incorrect car cette expression n'est pas assez égale à celle attendue.",
    )

  return isExpandedExpression(parsedSaisie)
    ? ok()
    : fail("Incorrect car cette expression n'est pas développée.")
}

function handleEnsembleNombres(
  saisie: string,
  answer: string,
  { kUplet = false, avecAccolades = true } = {},
): ResultType {
  const clean = generateCleaner([
    'virgules',
    'fractions',
    'parentheses',
    'espaces',
    'espaceNormal',
    'doubleEspaces',
  ])
  const cleanInput = clean(saisie)
    .replaceAll('∅', '\\emptyset')
    .replaceAll('\\lbrace', '\\{')
    .replaceAll('\\rbrace', '\\}')
    .replaceAll('\\placeholder', '')
  let goodAnswer = clean(answer)
  if (goodAnswer === '\\emptyset' && cleanInput === goodAnswer) return ok()
  if (goodAnswer === '\\emptyset' && cleanInput.includes('\\emptyset'))
    return fail('Résultat incorrect car $$\\emptyset$ doit être écrit seul.')

  let InputReplace = cleanInput.trim() // supprime les espaces autour

  if (avecAccolades) {
    if (!(InputReplace.startsWith('\\{') || InputReplace.startsWith('{')))
      return fail(
        "Résultat incorrect car cet ensemble doit commencer par une accolade ou bien être l'ensemble vide.",
      )

    if (!(InputReplace.endsWith('\\}') || InputReplace.endsWith('}')))
      return fail(
        "Résultat incorrect car cet ensemble doit se terminer par une accolade ou bien être l'ensemble vide.",
      )

    if (InputReplace.startsWith('{') && InputReplace.endsWith('}'))
      InputReplace = InputReplace.slice(1, -1).trim()
    else InputReplace = InputReplace.slice(2, -2).trim()

    if (goodAnswer.startsWith('{') && goodAnswer.endsWith('}'))
      goodAnswer = goodAnswer.slice(1, -1).trim()
    else goodAnswer = goodAnswer.slice(2, -2).trim()
  }

  const number = '-?\\d+(?:\\.\\d+)?'
  const power = `${number}\\^(?:-?\\d+|\\{.+\\})`
  const sqrt = '-?\\\\sqrt(?:\\[\\d+\\])?(?:\\{.+\\}|\\d+)'
  const frac = '-?\\\\d?frac(?:\\{.+\\}|\\d+)(?:\\{.+\\}|\\d+)'

  const singleExpression = new RegExp(
    `^(?:${number}|${power}|${sqrt}|${frac})$`,
  )

  /**
   * Vérifie que les accolades { } sont correctement équilibrées.
   *
   * @param {string} str - Chaîne à analyser.
   * @returns {boolean} true si les accolades sont équilibrées, sinon false.
   */
  function bracesAreBalanced(str: string) {
    let depth = 0

    // Parcours caractère par caractère
    for (const char of str) {
      // On augmente la profondeur à chaque {
      if (char === '{') depth++

      // On diminue à chaque }
      if (char === '}') {
        depth--

        // Si on descend sous 0, il y a une }
        // sans { correspondante
        if (depth < 0) return false
      }
    }

    // À la fin, la profondeur doit être 0
    return depth === 0
  }

  /**
   * Valide une chaîne contenant plusieurs expressions
   * séparées STRICTEMENT par des points-virgules.
   *
   * Règles :
   * - Pas de ; au début
   * - Pas de ; à la fin
   * - Pas de ;; consécutifs
   * - Chaque élément doit être une expression valide
   * - Les accolades doivent être équilibrées
   *
   * @param {string} input - Chaîne à valider.
   * @returns {{ valid: boolean, warning: string|null }}
   *   valid   → true si tout est correct
   *   warning → message explicite si erreur détectée
   */
  function validateInput(input: string) {
    // Vérifie si la chaîne est vide ou uniquement composée d'espaces
    if (!input || input.trim() === '') {
      return { valid: false, warning: 'Expression vide.' }
    }

    // Supprime les espaces inutiles en début et fin
    input = input.trim()

    // Interdit un point-virgule au début
    if (input.startsWith(';')) {
      return { valid: false, warning: 'Point-virgule interdit au début.' }
    }

    // Interdit un point-virgule à la fin
    if (input.endsWith(';')) {
      return { valid: false, warning: 'Point-virgule interdit à la fin.' }
    }

    // Interdit deux points-virgules consécutifs
    if (input.includes(';;')) {
      return {
        valid: false,
        warning: 'Deux points-virgules consécutifs interdits.',
      }
    }

    // Sépare les différentes expressions
    const parts = input.split(';').map((p) => p.trim())

    // Vérifie chaque expression individuellement
    for (const part of parts) {
      // Vérifie l’équilibrage des accolades
      if (!bracesAreBalanced(part)) {
        return {
          valid: false,
          warning: `Accolades mal équilibrées : ${part}`,
        }
      }
      /* Ne pas supprimer : utile pour débuggage
      console.log({
        part,
        number: new RegExp(`^${number}$`).test(part),
        power: new RegExp(`^${power}$`).test(part),
        sqrt: new RegExp(`^${sqrt}$`).test(part),
        frac: new RegExp(`^${frac}$`).test(part),
        UnNombreOuSéparéParDesPointsVirgules: singleExpression.test(part),
      })
      */

      // Vérifie que l’expression correspond à un format autorisé
      if (!singleExpression.test(part)) {
        return {
          valid: false,
          warning: `Expression invalide : ${part}`,
        }
      }
    }

    // Si toutes les vérifications passent
    return { valid: true, warning: null }
  }

  const resultValidateInput = validateInput(InputReplace.trim())
  const neContientQueDesPointsVirgulesOuEstUnNombre = resultValidateInput.valid

  /* Ne pas supprimer : utile pour débuggage
  console.log('resultValidateInput.warning', resultValidateInput.warning)
  console.log('resultValidateInput.valid', resultValidateInput.valid)
  console.log('neContientQueDesPointsVirgulesOuEstUnNombre', neContientQueDesPointsVirgulesOuEstUnNombre)
  console.log('comparaison', InputReplace !== '' && !neContientQueDesPointsVirgulesOuEstUnNombre)
  */

  if (resultValidateInput.warning?.includes('fin'))
    return fail(
      'Une suite de nombres ne doit pas se terminer par un point-virgule.',
    )

  if (resultValidateInput.warning?.includes('début'))
    return fail(
      'Une suite de nombres ne doit pas commencer par un point-virgule.',
    )

  if (resultValidateInput.warning?.includes('consécutif'))
    return fail('Il ne peut pas y avoir deux points-virgules consécutifs.')

  // Pour vérifier que le séparateur est bien un point-virgule.
  if (InputReplace !== '' && !neContientQueDesPointsVirgulesOuEstUnNombre)
    return fail('Les nombres doivent tous être séparés par un point-virgule.')

  const splitInput: string[] = InputReplace.split(';')
  const splitGoodAnswer: string[] = clean(goodAnswer).split(';')

  // Pour vérifier la présence de doublons
  if (new Set(splitInput).size !== splitInput.length)
    return fail(
      'Résultat incorrect car cet ensemble contient des valeurs qui se répètent.',
    )

  const goodAnswerSorted = [...splitGoodAnswer].sort(
    (a, b) => Number(a) - Number(b),
  )

  if (splitInput.length === 1 && splitInput[0] === '') {
    return fail("L'ensemble est vide.")
  }

  const inputSorted = [...splitInput].sort((a, b) => Number(a) - Number(b))

  function analyzeAnswer(
    inputSorted: string[],
    goodAnswerSorted: string[],
  ): ResultType {
    const cleanedInput = inputSorted
      .map((v) => v.trim())
      .filter((v) => v !== '')

    const cleanedAnswer = goodAnswerSorted
      .map((v) => v.trim())
      .filter((v) => v !== '')

    // i les deux tableaux sont vides → ne rien dire
    if (cleanedInput.length === 0 && cleanedAnswer.length === 0) {
      return ok() // ou on peut renvoyer null si tu veux vraiment "ne rien faire"
    }

    const parsedGood = cleanedAnswer.map((v) => ce.parse(v))

    let correctCount = 0
    let incorrectCount = 0

    for (const value of cleanedInput) {
      const parsedValue = ce.parse(value)
      const isCorrect = parsedGood.some((g) => parsedValue.isEqual(g))

      if (isCorrect) correctCount++
      else incorrectCount++
    }

    const missingCount = cleanedAnswer.length - correctCount

    const plural = (n: number, word: string) =>
      n > 1 ? `${n} ${word}s` : `${n} ${word}`

    // Tout est correct mais il en manque
    if (incorrectCount === 0 && missingCount > 0) {
      if (correctCount === 1) {
        return fail(`La valeur est correcte mais il en manque ${missingCount}.`)
      }
      return fail(
        `Toutes les valeurs sont correctes mais il en manque ${missingCount}.`,
      )
    }

    // Toutes les bonnes sont présentes + extras
    if (missingCount === 0 && incorrectCount > 0) {
      if (correctCount === 1) {
        return fail(
          `La bonne valeur est présente mais il y a ${plural(incorrectCount, 'valeur')} en trop.`,
        )
      }
      return fail(
        `Toutes les bonnes valeurs sont présentes mais il y a ${plural(incorrectCount, 'valeur')} en trop.`,
      )
    }

    // Mélange
    if (correctCount > 0 && incorrectCount > 0) {
      return fail(
        `Il y a ${plural(correctCount, 'valeur')} correcte${correctCount > 1 ? 's' : ''} et ${plural(incorrectCount, 'valeur')} incorrecte${incorrectCount > 1 ? 's' : ''}.`,
      )
    }

    // Tout est parfait
    if (missingCount === 0 && incorrectCount === 0) {
      return ok()
    }

    // Tout est faux
    return fail(
      `Aucune valeur correcte. ${plural(incorrectCount, 'valeur')} incorrecte${incorrectCount > 1 ? 's' : ''}.`,
    )
  }

  if (!analyzeAnswer(inputSorted, goodAnswerSorted).isOk)
    return analyzeAnswer(inputSorted, goodAnswerSorted)

  if (kUplet) {
    if (splitInput.length === splitGoodAnswer.length)
      return splitInput.every((value, index) =>
        ce.parse(value).isSame(ce.parse(splitGoodAnswer[index])),
      )
        ? ok()
        : fail(
            'Résultat incorrect car les nombres ne sont pas rangés dans le bon ordre.',
          )
  }
  return ok()
}

/**
 * @author Jean-claude Lhote
 */

export function handleLeCompteEstBon( // Ne fonctionne que si numbers est un tableau de nombres POSITIFS.
  saisie: string,
  numbers: number[],
  target: number,
  quatreOperationsObligatoires: boolean,
): ResultType {
  const clean = generateCleaner([
    'virgules',
    'parentheses',
    'fractions',
    'divisions',
  ])
  const inputClean = clean(saisie)

  // At first, check that the value of the expression is correct
  const answer = ce.parse(inputClean, {
    form: 'raw',
  }) as Expression
  const value = answer.value
  if (value === undefined || Number(value) !== target) {
    return {
      isOk: false,
      feedback: `L'expression vaut ${value} et non ${target}.`,
    }
  }

  // Count each operator
  let addCount = 0
  let multiplyCount = 0
  let divideCount = 0
  let subtractCount = 0

  let tropDeNombres = false
  let nombresEnDoublon = false
  let mauvaisNombre = false
  let symboleNonAutorise = false
  let operationNonAutorisee = false

  const listeNombresEnonce = [...numbers]
  const visit: (node: Expression) => void = (node) => {
    if (node.re !== null) {
      if (listeNombresEnonce.length === 0) {
        if (numbers.includes(Math.abs(Number(node.value)))) {
          // abs obligatoire car sinon, pour 5-3, il tente de chercher -3.
          nombresEnDoublon = true
          return 'Au moins un nombre en doublon'
        }
        tropDeNombres = true
        return 'Au moins un nombre en trop'
      }
      if (listeNombresEnonce.includes(Math.abs(Number(node.value)))) {
        // J'enlève cet élément de la liste
        listeNombresEnonce.splice(
          listeNombresEnonce.indexOf(Math.abs(Number(node.value))),
          1,
        )
      } else {
        mauvaisNombre = true
        return 'Au moins un mauvais nombre parmi ceux proposés'
      }
    }

    if (isSymbol(node) && node.symbol) {
      symboleNonAutorise = true
      return "L'expression contient un symbole non autorisé."
    }
    if (node.operator) {
      if (node.operator !== 'Number' && node.operator !== 'Delimiter') {
        switch (node.operator) {
          case 'Add':
            addCount++
            break
          case 'Multiply':
            multiplyCount++
            break
          case 'Divide':
            divideCount++
            break
          case 'Subtract':
          case 'Negate':
            subtractCount++
            break
          default:
            operationNonAutorisee = true
        }
      }
      if (isFunction(node)) {
        for (const op of node.ops) {
          visit(op)
        }
      } else return 'OK'
    }
  }

  visit(answer)
  if (tropDeNombres)
    return {
      isOk: false,
      feedback: "L'expression utilise plus de nombres que demandés.",
    }
  if (nombresEnDoublon)
    return {
      isOk: false,
      feedback:
        "L'expression utilise plusieurs fois un même nombre parmi ceux proposés.",
    }
  if (mauvaisNombre)
    return {
      isOk: false,
      feedback: "L'expression utilise au moins un nombre non autorisé.",
    }
  if (symboleNonAutorise)
    return {
      isOk: false,
      feedback: "L'expression contient un symbole non autorisé.",
    }
  if (operationNonAutorisee)
    return {
      isOk: false,
      feedback:
        "L'expression doit contenir que des additions, des soustractions, des multiplications, des divisions ou des parenthèses.",
    }
  if (
    quatreOperationsObligatoires &&
    !(
      addCount === 1 &&
      divideCount === 1 &&
      subtractCount === 1 &&
      multiplyCount === 1
    )
  )
    return {
      isOk: false,
      feedback:
        "L'expression doit contenir une addition, une soustraction, une multiplication et une division.",
    }

  return { isOk: true, feedback: '' } // L'expression est correcte.
}
/**
 * comparaison de nombres entiers consécutifs
 * Cette fonction sert essentiellement pour le feedback dans des exercices de comparaison car elle prend pour l'instant un encadrement sous la forme a<b<c ou a>b>c
 * Exercices d'exemple : 6N20-1 et 6N20-3
 * Peut-être en faire une variation pour vérifier des inégalités ?
 * @param {string} input
 * @param {string} goodAnswer
 * @author Jean-claude Lhote
 * @return ResultType
 */

export function handleEntiersConsecutifs(
  input: string,
  goodAnswer: string,
): ResultType {
  let feedback = ''
  const [entierInf, valeurInter, entierSup] = input.includes('<')
    ? input.split('<').map((el) => Number(ce.parse(el).re)) // re prend la place de numericValue
    : input
        .split('>')
        .map((el) => Number(ce.parse(el).re))
        .sort((a: number, b: number) => a - b)
  if (
    !(
      Number.isInteger(Number(entierSup)) && Number.isInteger(Number(entierInf))
    )
  ) {
    feedback = 'On attend comme réponse deux nombres entiers.'
    return { isOk: false, feedback }
  }
  const [goodAnswerEntierInf, , goodAnswerEntierSup] = goodAnswer.includes('<')
    ? goodAnswer.split('<').map((el) => Number(ce.parse(el).re))
    : goodAnswer
        .split('>')
        .map((el) => Number(ce.parse(el).re))
        .sort((a: number, b: number) => a - b)
  const diff = Number(
    ce.expr(['Subtract', String(entierSup), String(entierInf)]).N().re,
  )
  if (diff === -1) {
    feedback =
      "Les nombres sont bien deux entiers consécutifs, mais ils sont donnés dans l'ordre inverse."
    return { isOk: false, feedback }
  }
  if (diff !== 1) {
    return {
      isOk: false,
      feedback: 'Les deux nombres entiers donnés ne sont pas consécutifs.',
    }
  }
  if (valeurInter != null) {
    const diff1 = Number(
      ce.expr(['Subtract', String(entierSup), String(valeurInter)]).N().re,
    )
    const diff2 = Number(
      ce.expr(['Subtract', String(valeurInter), String(entierInf)]).N().re,
    )
    if (
      !(
        diff1 != null &&
        diff2 != null &&
        diff1 < 1 &&
        diff1 >= 0 &&
        diff2 < 1 &&
        diff2 >= 0
      )
    ) {
      return {
        isOk: false,
        feedback: `Les deux nombres entiers sont biens consécutifs mais n'encadrent pas la valeur ${valeurInter}`,
      }
    }
  }
  const isOk1 = true
  const isOk2 =
    fonctionComparaison(String(entierInf), String(goodAnswerEntierInf)).isOk &&
    fonctionComparaison(String(entierSup), String(goodAnswerEntierSup)).isOk
  return { isOk: isOk1 && isOk2, feedback: '' }
}

//    ███████  ██████  ███    ██  ██████ ████████ ██  ██████  ███    ██
//    ██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██
//    █████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██
//    ██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██
//    ██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████
//
//
//    ██████  ██████  ██ ███    ██  ██████ ██ ██████   █████  ██      ███████
//    ██   ██ ██   ██ ██ ████   ██ ██      ██ ██   ██ ██   ██ ██      ██
//    ██████  ██████  ██ ██ ██  ██ ██      ██ ██████  ███████ ██      █████
//    ██      ██   ██ ██ ██  ██ ██ ██      ██ ██      ██   ██ ██      ██
//    ██      ██   ██ ██ ██   ████  ██████ ██ ██      ██   ██ ███████ ███████
//
//
// from https://patorjk.com/software/taag/ // Style : ANSI Regular // C++ style Comment

export function fonctionComparaison(
  saisie: string,
  answer: string,
  options: OptionsComparaisonType = {},
): ResultType {
  // Si la saisie est vide, deux cas se présentent.
  // Soit nonReponseAcceptee = true et answer est vide aussi, alors cela permet d'avoir des champs vides (on pense aux fillInTheBlank qui peuvent être facultatifs, comme par exemple un facteur 1)
  // Soit nonReponseAcceptee = false (valeur par défaut ou si non précisée) alors une réponse vide entraîne isOk = false et un feedback pour notifier l'absence de réponse

  if (saisie === '')
    return options.nonReponseAcceptee && answer === ''
      ? ok()
      : fail('Une réponse doit être saisie.')

  // Indispensable pour ceux qui font du copier-coller
  saisie = saisie.replaceAll('×', '\\times')

  if (
    options.sansTrigo &&
    (saisie.includes('cos') || saisie.includes('sin') || saisie.includes('tan'))
  )
    return {
      isOk: false,
      feedback: "Aucune fonction trigonométrique n'est autorisée.",
    }

  // Ces 2 lignes sont à améliorer... EE : Faut que je teste un truc... et rajouter les racines carrées aussi
  /*
  if (!options.avecSigneMultiplier && saisie.includes('times'))
    return { isOk: false, feedback: "Aucun signe $\\times$ n'est autorisé." }
  if (!options.avecFractions && saisie.includes('frac'))
    return { isOk: false, feedback: "Aucune fraction n'est autorisée." }
*/
  // Text comparisons
  if (options.texteAvecCasse) return handletexteAvecCasse(saisie, answer, true)
  if (options.texteSansCasse)
    return handletexteAvecCasse(
      saisie.toLowerCase(),
      answer.toLowerCase(),
      false,
    )

  // coordonnées de points
  if (options.coordonnees) return handleCoordinates(saisie, answer)

  // Fonctions Numériques
  if (options.fonction)
    return handleFonction(saisie, answer, {
      variable: options.variable ?? 'x',
      domaine: options.domaine ?? [-100, 100],
      entier: options.entier ?? false,
    })

  // HMS
  if (options.HMS) return handleHMS(saisie, answer)

  // ensemble de nombres distincts
  // ensembleDeNombres est non trié alors que kUplet nécessite le tri
  if (options.ensembleDeNombres || options.kUplet)
    return handleEnsembleNombres(saisie, answer, { kUplet: options.kUplet })

  // suite de nombres distincts
  // suiteDeNombres est non trié alors que suiteRangeeDeNombres nécessite le tri
  if (options.suiteDeNombres || options.suiteRangeeDeNombres)
    return handleEnsembleNombres(saisie, answer, {
      kUplet: options.suiteRangeeDeNombres,
      avecAccolades: false,
    })

  // Intervals
  if (options.intervalle) return handleIntervalle(saisie, answer)
  if (options.estDansIntervalle) return handleEstDansIntervalle(saisie, answer)

  // Number formatting
  if (options.nombreAvecEspace) return handleNombreAvecEspace(saisie, answer)

  // Scientific notation
  if (options.ecritureScientifique)
    return handleEcritureScientifique(saisie, answer)

  // Units
  if (options.unite)
    return handleUnite(
      saisie,
      answer,
      { precision: options.precisionUnite },
      options,
    )

  // Powers
  if (
    options.puissance ||
    options.sansExposantUn ||
    options.seulementCertainesPuissances
  )
    return handlePuissance(saisie, answer, options)

  // Decimal only mais sans option sur les fractions (traité à part avec les fractions)
  if (
    options.nombreDecimalSeulement &&
    !(
      options.fractionDecimale ||
      options.fractionIrreductible ||
      options.fractionSimplifiee ||
      options.fractionReduite ||
      options.fractionEgale ||
      options.fractionIdentique ||
      options.expressionNumerique
    )
  )
    return handleNombreDecimalSeulement(saisie, answer)

  // Fractions
  if (
    options.fractionDecimale ||
    options.fractionIrreductible ||
    options.fractionSimplifiee ||
    options.fractionReduite ||
    options.fractionEgale ||
    options.fractionIdentique
  )
    return handleFraction(saisie, answer, options)

  if (options.fractionSansRacineCarree) {
    return handlefractionSansRacineCarree(saisie, answer)
  }

  /*
  if (options.avecFractions)
    return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()
  */

  // Numeric expression
  if (options.expressionNumerique)
    return handleExpressionNumerique(saisie, answer, options)

  // Equation expression
  if (options.egaliteExpression) return handleEgaliteExpression(saisie, answer)

  // Factorisation options
  if (
    options.factorisation ||
    options.exclusifFactorisation ||
    options.nbFacteursIdentiquesFactorisation ||
    options.unSeulFacteurLitteral
  )
    return handleFactorisation(saisie, answer, options)

  // Development
  if (options.developpementEgal) return handleDeveloppementEgal(saisie, answer)
  // return mathEqual(parse(saisie), parse(answer)) ? ok() : fail()

  // Sum/difference only
  if (
    options.additionSeulementEtNonResultat ||
    options.soustractionSeulementEtNonResultat
  )
    return handleSommeOuDifference(
      saisie,
      answer,
      !!options.additionSeulementEtNonResultat,
    )

  // Produit/Quotient seulement
  if (
    options.multiplicationSeulementEtNonResultat ||
    options.divisionSeulementEtNonResultat
  )
    return handleProduitouQuotient(
      saisie,
      answer,
      !!options.multiplicationSeulementEtNonResultat,
    )

  // Reduced expressions
  if (options.expressionsForcementReduites)
    return handleExpressionsForcementReduites(saisie, answer)

  // Calcul formel (accepte tout normalement)
  if (options.calculFormel) return handleCalculFormel(saisie, answer)

  // Expressions expanded
  if (options.expanded) return handleExpressionExpanded(saisie, answer)

  // Deux entiers consécutifs
  if (options.entiersConsecutifs)
    return handleEntiersConsecutifs(saisie, answer)

  // Use lightweight check (no isEqual/evaluate fallback) to avoid
  // false positives like 0.33333333333333 ≈ 1/3
  // return (parse(saisie), parse(answer)) ? ok() : fail()

  // Default: use .is() with zero tolerance to avoid false positives from
  // decimal approximations of fractions (e.g. 0.33333333333333 ≈ 1/3).
  // Expansion and structural matching still work; only the numeric evaluation
  // fallback requires an exact floating-point match.
  return parse(saisie).is(parse(answer), 0) || // C'est le ,O qui change tout.
    (!parse(saisie).isNumber && parse(saisie).isEqual(parse(answer)))
    ? ok()
    : fail()
}
