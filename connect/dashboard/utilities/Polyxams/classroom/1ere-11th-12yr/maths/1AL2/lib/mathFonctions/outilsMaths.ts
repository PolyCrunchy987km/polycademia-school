import {
  isFunction,
  isSymbol,
  type Expression,
} from '@cortex-js/compute-engine'
import { randint } from '../../modules/outils'
import { generateCleaner } from '../interactif/cleaners'
import ce from '../interactif/comparisonFunctions'
import { ecritureAlgebrique } from '../outils/ecritures'
import { miseEnEvidence } from '../outils/embellissements'
import { Matrice, matrice } from './Matrice'
import { Polynome } from './Polynome'

/**
 * delta(true) retourne dans un tableau des valeurs de a, b, c telles que b*b-4*a*c >0
 * delta(false) retourne dans un tableau des valeurs de a, b, c telles que b*b-4*a*c <0
 * @author Jean-Claude Lhote
 */
export function choisiDelta(positif: boolean) {
  let d, a, b, c
  do {
    a = randint(-5, 5, 0)
    b = randint(-5, 5, 0)
    c = randint(-5, 5, 0)
    d = b * b - 4 * a * c
  } while (positif ? d <= 0 : d >= 0)
  return [a, b, c]
}

/**
 * fonction qui retourne un polynome du second degré correctement écrit.
 * @author Jean-Claude Lhote
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {string}
 */
export function expTrinome(a: number, b: number, c: number): string {
  let expr = ''
  if (typeof a === 'number') {
    switch (a) {
      case 0:
        break
      case -1:
        expr += '-x^2'
        break
      case 1:
        expr += 'x^2'
        break
      default:
        expr += `${a}x^2`
        break
    }
  } else {
    expr += `${a}x^2`
  }
  if (typeof b === 'number') {
    switch (b) {
      case 0:
        break
      case -1:
        expr += '-x'
        break
      case 1:
        expr += '+x'
        break
      default:
        if (a === 0) {
          expr += `${b}`
        } else expr += `${ecritureAlgebrique(b)}x`
        break
    }
  } else {
    if (a === 0) {
      expr += `${b}x`
    } else {
      expr += `+${b}x`
    }
  }
  if (typeof c === 'number') {
    if (a === 0 && b === 0) {
      expr += `${c}`
    } else {
      if (c !== 0) {
        expr += `${ecritureAlgebrique(c)}`
      }
    }
  } else {
    expr += `+${c}`
  }
  return expr
}

/**
 * Une fonction qui retourrne le polynome de Lagrange passant par une liste de points
 * @author Jean-Claude Lhote
 * @param {{x:number,y:number}[]} listePoints
 * @return {Polynome}
 */
export function interpolationDeLagrange(
  listePoints: { x: number; y: number }[],
): Polynome {
  // tout d'abord vérifier qu'il n'y a pas de doublons en x !
  const listeOrdonnee = listePoints.sort((el1, el2) => el1.x - el2.x)
  const setPoints = []
  for (let i = 1; i < listeOrdonnee.length; i++) {
    // si deux points qui se suivent dans la liste ordonnée ont des abscisses différentes, alors on peut stocker le plus petit
    if (listeOrdonnee[i - 1].x !== listeOrdonnee[i].x)
      setPoints.push(listeOrdonnee[i - 1])
  }
  // comme on n'a pas stocké le dernier, on le fait
  setPoints.push(listeOrdonnee[listeOrdonnee.length - 1])
  if (setPoints.length < 2)
    throw Error(
      "Pour une interpolation de Lagrange, il faut au moins deux points d'abscisses différentes",
    )
  const n = setPoints.length - 1
  // On initialise à zéro
  let result: Polynome = new Polynome({ coeffs: [0] })
  for (let j = 0; j <= n; j++) {
    // pour un produit on initialise à 1
    let prod: number | Polynome = new Polynome({ coeffs: [1] })
    for (let i = 0; i <= n; i++) {
      if (j !== i) {
        const den = setPoints[j].x - setPoints[i].x
        prod = new Polynome({
          coeffs: [-setPoints[i].x / den, 1 / den],
        }).multiply(prod)
      }
    }
    prod = (prod as Polynome).multiply(setPoints[j].y)
    result = prod.add(result)
  }
  return result
}

/**
 * Fonction qui retourne les coefficients a et b de f(x)=ax²+bx+c à partir des données de x1,x2,f(x1),f(x2) et c.
 *@param {number} x1
 *@param {number} x2
 * @param {number} y1
 * @param {number} y1
 * @param {number} c
 * @return {[[number,number],[number,number]]}
 * @author Jean-Claude Lhote
 */
export function resolutionSystemeLineaire2x2(
  x1: number,
  x2: number,
  fx1: number,
  fx2: number,
  c: number,
): [number, number] {
  const maMatrice = matrice([
    [x1 ** 2, x1],
    [x2 ** 2, x2],
  ])
  if (maMatrice.determinant() === 0) return [0, 0]
  const resultat = maMatrice.inverse().multiply([fx1 - c, fx2 - c])
  let arr: number[]
  if (resultat instanceof Matrice) {
    arr = resultat.toArray() as number[]
  } else if (Array.isArray(resultat)) {
    arr = resultat as number[]
  } else {
    return [0, 0]
  }
  const [a, b] = arr
  return [a, b]
}

/**
 * Fonction qui retourne les coefficients a, b et c de f(x)=ax^3 + bx² + cx + d à partir des données de x1,x2,x3,f(x1),f(x2),f(x3) et d (entiers !)
 * sous forme de fraction irréductible. Si pas de solution (déterminant nul) alors retourne [[0,0],[0,0],[0,0]]
 * @author Jean-Claude Lhote
 */
export function resolutionSystemeLineaire3x3(
  x1: number,
  x2: number,
  x3: number,
  fx1: number,
  fx2: number,
  fx3: number,
  d: number,
): [Number, Number, number] {
  const maMatrice = matrice([
    [x1 ** 3, x1 ** 2, x1],
    [x2 ** 3, x2 ** 2, x2],
    [x3 ** 3, x3 ** 2, x3],
  ])
  const y1 = fx1 - d
  const y2 = fx2 - d
  const y3 = fx3 - d
  if (maMatrice && maMatrice.determinant() === 0) {
    return [0, 0, 0]
  }
  const resultat = maMatrice.inverse().multiply([y1, y2, y3])
  let arr: number[]
  if (resultat instanceof Matrice) {
    arr = resultat.toArray() as number[]
  } else if (Array.isArray(resultat)) {
    arr = resultat as number[]
  } else {
    return [0, 0, 0]
  }
  const [a, b, c] = arr
  return [a, b, c]
}

/**
 * Une fonction utilisée dans les 3 fonctions qui suivent (suppressionParentheses, regroupeTermesMemeDegre et developpe afin de colorier ou pas les termes
 * @author Jean-Claude Lhote
 * @param str
 * @param color
 * @param isColored
 * @return {string|*}
 */
const miseEnForme = (str: string, color: string, isColored: boolean) =>
  isColored ? miseEnEvidence(str, color) : str
function neg(expr: Expression): Expression {
  if (expr.operator !== 'Add')
    return ce.function('Multiply', [expr, ce.parse('-1')])
  const ops = isFunction(expr) ? expr.ops : []
  if (ops.length === 0) return ce.function('Multiply', [expr, ce.parse('-1')])
  else return ce.function('Add', ops.map(neg), { form: 'raw' })
}

/**
 * Une fonction pour supprimer les parenthèses et aplatir l'expression (un Add avec une série de termes)
 * @author Jean-Claude Lhote
 * @param expr
 * @return {*|Expression}
 */
function flattenAdd(expr: Expression): Expression {
  if (!isFunction(expr)) return expr

  if (expr.operator === 'Negate') {
    const oppose = neg(expr.op1)
    const newExpr = ce.function('Add', [oppose], { form: 'raw' })
    return newExpr
  }
  if (expr.operator === 'Subtract') {
    const oppose = neg(expr.op2)
    const newExpr = ce.function('Add', [expr.op1, oppose], { form: 'raw' })
    return flattenAdd(newExpr)
  }

  if (expr.operator !== 'Add') return expr

  const ops = []
  for (let op of expr.ops ?? []) {
    op = flattenAdd(op)
    if (op.operator === 'Add' || op.operator === 'Delimiter')
      ops.push(...(isFunction(op) ? op.ops : []).map(flattenAdd))
    else ops.push(op)
  }
  return ce.function('Add', ops, { form: 'raw' })
}

/**
 * Supprime les parenthèses dans une somme du type (5x+3)-(2x^2-3x+4)+(4x+7-3x^3)
 * @author Jean-Claude Lhote
 * @param {string} exp
 * @param {{color: boolean}} options
 */
export function suppressionParentheses(
  exp: string,
  options: { couleurs?: string[]; isColored?: boolean },
) {
  const couleurs = options.couleurs ?? [
    'red',
    'blue',
    'green',
    'black',
    'red',
    'blue',
    'green',
    'black',
  ]
  const isColored = options?.isColored
  const clean = generateCleaner([
    'parentheses',
    'espaces',
    'virgules',
    'fractions',
  ])
  exp = clean(exp)
  const arbre = ce.parse(exp, { form: 'raw' })
  const sp = flattenAdd(flattenAdd(arbre))
  const parts = isFunction(sp) ? sp.ops : []
  let expressionFinale = ''
  for (let index = 0; index < parts.length; index++) {
    const latex = parts[index].latex.startsWith('-')
      ? parts[index].latex
      : index === 0
        ? parts[index].latex
        : `+${parts[index].latex}`
    const hereIsPower = parts[index].getSubexpressions('Power')[0]
    let deg = 0
    if (isFunction(hereIsPower)) {
      deg = Number(hereIsPower.op2.value)
    } else {
      if (parts[index].operator === 'Square') {
        deg = 2
      } else if (parts[index].operator === 'Negate') {
        const partsIndex = parts[index]
        if (isFunction(partsIndex))
          if (partsIndex.op1.isConstant) {
            deg = 0
          } else {
            deg = 1
          }
      } else if (parts[index].isConstant) {
        deg = 0
      } else {
        deg = 1
      }
    }

    expressionFinale += miseEnForme(
      latex,
      couleurs[Math.max(0, 2 - deg)],
      isColored ?? false,
    )
  }
  return expressionFinale
}

/**
 * une fonction pour trier les termes d'une somme algébrique selon l'exposant de la puissance
 * @author Jean-Claude Lhote
 * @param {string} exp
 */
export function regroupeTermesMemeDegre(
  exp: string,
  options: { couleurs?: string[]; isColored?: boolean },
) {
  const couleurs = options.couleurs ?? [
    'red',
    'blue',
    'green',
    'black',
    'red',
    'blue',
    'green',
    'black',
  ]
  const isColored = options?.isColored
  const clean = generateCleaner([
    'parentheses',
    'espaces',
    'virgules',
    'fractions',
  ])
  exp = clean(exp)
  if (exp.length === 0) return ''
  const arbre = ce.parse(exp, { form: 'raw' })
  const flattenAddArbre = flattenAdd(arbre)
  const parts = isFunction(flattenAddArbre) ? flattenAddArbre.ops : []
  const allTheTerms: string[][] = []
  for (let index = 0; index < parts.length; index++) {
    let deg = 0
    const terme = parts[index]
    const subExpression = terme.getSubexpressions('Power')[0]
    if (isFunction(subExpression)) {
      deg = subExpression.op2.re
    } else if (terme.operator === 'Square') {
      deg = 2
    } else if (terme.operator === 'Negate') {
      if (isFunction(terme) && terme.op1.isConstant) {
        deg = 0
      } else {
        deg = 1
      }
    } else if (terme.isConstant) {
      deg = 0
    } else {
      deg = 1
    }

    const latex = parts[index].latex.startsWith('-')
      ? parts[index].latex
      : index === 0
        ? parts[index].latex
        : `+${parts[index].latex}`
    if (allTheTerms[deg] == null) allTheTerms[deg] = []
    allTheTerms[deg].push(latex)
  }
  const expressionFinale = []
  for (let i = allTheTerms.length; i > 0; i--) {
    const listOfTerm = allTheTerms[i - 1]
    if (listOfTerm != null && listOfTerm.length > 0) {
      let parcel = ''
      for (let term of listOfTerm) {
        if (term.startsWith('+') && parcel === '') term = term.substring(1)
        parcel += term
      }
      expressionFinale.push(
        `(${miseEnForme(parcel, couleurs[Math.max(0, 2 - (i - 1))], isColored ?? false)})`,
      )
    }
  }
  return expressionFinale.join('+')
}

// const isNumeric = (node: Expression) => node.isNumberLiteral
const isNumeric = (node: Expression) => node.isNumber
// const isNumeric = (node: Expression) =>
//  node.isNumber && isFunction(node) && node.ops.length === 0
const isSingleSymbol = (node: Expression) =>
  isSymbol(node) &&
  node.symbol &&
  node.symbol.length === 1 &&
  node.latex.length === 1

/**
 * @author Jean-Claude Lhote
 * @param expr
 * @param {{isColored: boolean, colorOffset: number, level: 0|1}} options
 * @return {string}
 */
export function developpe(
  expr: string,
  options: {
    couleurs?: string[]
    isColored: boolean
    colorOffset?: number
    level?: 0 | 1 | 2
  },
): string {
  const isColored = options?.isColored
  const colorOffset = options.colorOffset ?? 0
  const level = options?.level ?? 0
  const clean = generateCleaner(['parentheses', 'fractions'])
  const couleurs = options.couleurs ?? [
    'red',
    'blue',
    'green',
    'black',
    'red',
    'blue',
    'green',
    'black',
  ]
  expr = clean(expr)
  const arbre = ce.parse(expr)
  if (!['Square', 'Multiply', 'Power'].includes(arbre.operator)) {
    // On ne développe que les produits où les carrés ici
    return expr.replaceAll('\\frac', '\\dfrac')
  }
  if (
    isFunction(arbre) &&
    (arbre.operator === 'Square' || arbre.operator === 'Power')
  ) {
    if (arbre.operator === 'Square' && arbre.op2?.re !== 2) {
      return expr.replaceAll('\\frac', '\\dfrac')
    }
    // on est sans doute en présence d'une égalité remarquable ?
    const interior = arbre.op1
    const somme = interior.operator === 'Add'
    const terme1 = isFunction(interior) ? interior.op1 : ce.parse('')
    const terme2 = isFunction(interior) ? interior.op2 : ce.parse('')
    const carre1 = isNumeric(terme1)
      ? terme1.latex.startsWith('-')
        ? `\\left( ${terme1.latex}\\right) ^2`
        : `${terme1.latex}^2`
      : isSingleSymbol(terme1)
        ? `${terme1.latex}^2`
        : `\\left( ${terme1.latex}\\right) ^2`
    const carre2 = isNumeric(terme2)
      ? terme2.latex.startsWith('-')
        ? `\\left( ${terme2.latex}\\right) ^2`
        : `${terme2.latex}^2`
      : isSingleSymbol(terme2)
        ? `${terme2.latex}^2`
        : `\\left( ${terme2.latex}\\right) ^2`
    const dbleProd = `2\\times ${
      isNumeric(terme1)
        ? terme1.latex.startsWith('-')
          ? `\\left( ${terme1.latex}\\right) `
          : `${terme1.latex}`
        : isSingleSymbol(terme1)
          ? `${terme1.latex}`
          : `\\left( ${terme1.latex}\\right) `
    }\\times ${
      isNumeric(terme2)
        ? terme2.latex.startsWith('-')
          ? `\\left( ${terme2.latex}\\right) `
          : `${terme2.latex}`
        : isSingleSymbol(terme2)
          ? `${terme2.latex}`
          : `\\left( ${terme2.latex}\\right) `
    }`
    if (level === 2) {
      return `${miseEnForme(carre1, couleurs[colorOffset], isColored)}${somme ? '+' : '-'}${miseEnForme(dbleProd, couleurs[colorOffset + 1], isColored)}+${miseEnForme(carre2, couleurs[colorOffset + 2], isColored)}`.replaceAll(
        '\\frac',
        '\\dfrac',
      )
    } else {
      const dp = ce.parse(dbleProd).simplify().latex
      const c1 = ce.expr(['Multiply', terme1, terme1]).evaluate().latex
      const c2 = ce.expr(['Multiply', terme2, terme2]).evaluate().latex
      return `${miseEnForme(c1, couleurs[colorOffset], isColored)}${somme ? '+' : '-'}${miseEnForme(dp, couleurs[colorOffset + 1], isColored)}+${miseEnForme(c2, couleurs[colorOffset + 2], isColored)}`.replaceAll(
        '\\frac',
        '\\dfrac',
      )
    }
  } else {
    if (isFunction(arbre)) {
      const [facteur1, facteur2] = arbre.ops

      if (isFunction(facteur1) && isFunction(facteur2)) {
        const [terme1, terme2] = facteur1.ops
        const [terme3, terme4] = facteur2.ops

        // Ici c'est un produit classique.
        // const facteur1 = arbre.op1
        // const facteur2 = arbre.op2
        // const terme1 = facteur1.op1
        // const terme2 = facteur1.op2
        const somme1 = facteur1.operator === 'Add'
        // const terme3 = facteur2.op1
        // const terme4 = facteur2.op2
        const somme2 = facteur2.operator === 'Add'
        const t1 = terme1.latex.startsWith('-')
          ? `\\left( ${terme1.latex}\\right) `
          : terme1.latex
        const t2 = terme2.latex.startsWith('-')
          ? `\\left( ${terme2.latex}\\right) `
          : terme2.latex

        const t3 = terme3.latex.startsWith('-')
          ? `\\left( ${terme3.latex}\\right) `
          : terme3.latex
        const t4 = terme4.latex.startsWith('-')
          ? `\\left( ${terme4.latex}\\right) `
          : terme4.latex
        if (level === 2) {
          return `${miseEnForme(t1, couleurs[colorOffset], isColored)}\\times ${miseEnForme(t3, couleurs[colorOffset], isColored)}
    ${somme2 ? '+' : '-'}${miseEnForme(t1, couleurs[colorOffset + 1], isColored)}\\times ${miseEnForme(t4, couleurs[colorOffset + 1], isColored)}
    ${somme1 ? '+' : '-'}${miseEnForme(t2, couleurs[colorOffset + 1], isColored)}\\times ${miseEnForme(t3, couleurs[colorOffset + 1], isColored)}
    ${somme1 === somme2 ? '+' : '-'}${miseEnForme(t2, couleurs[colorOffset + 2], isColored)}\\times ${miseEnForme(t4, couleurs[colorOffset + 2], isColored)}`.replaceAll(
            '\\frac',
            '\\dfrac',
          )
        } else {
          const prod1 = ce
            .expr(['Multiply', terme1, terme3])
            .evaluate()
            .simplify().latex
          const prod2 = ce
            .expr(['Multiply', terme1, terme4])
            .evaluate()
            .simplify().latex
          const prod3 = ce
            .expr(['Multiply', terme2, terme3])
            .evaluate()
            .simplify().latex
          const prod4 = ce
            .expr(['Multiply', terme2, terme4])
            .evaluate()
            .simplify().latex
          if (level === 1) {
            const p2 = prod2.startsWith('-')
              ? `\\left( ${prod2}\\right)`
              : prod2
            const p3 = prod3.startsWith('-')
              ? `\\left( ${prod3}\\right)`
              : prod3
            const p4 = prod4.startsWith('-')
              ? `\\left( ${prod4}\\right)`
              : prod4
            return `${miseEnForme(prod1, couleurs[colorOffset], isColored)}
        ${somme2 ? '+' : '-'}${miseEnForme(p2, couleurs[colorOffset + 1], isColored)}
        ${somme1 ? '+' : '-'}${miseEnForme(p3, couleurs[colorOffset + 1], isColored)}
        ${somme1 === somme2 ? '+' : '-'}${miseEnForme(p4, couleurs[colorOffset + 1], isColored)}`.replaceAll(
              '\\frac',
              '\\dfrac',
            )
          } else {
            const p2 = prod2.startsWith('-')
              ? somme2
                ? prod2
                : `+${prod2.substring(1)}`
              : somme2
                ? `+${prod2}`
                : `-${prod2}`
            const p3 = prod3.startsWith('-')
              ? somme1
                ? prod3
                : `+${prod3.substring(1)}`
              : somme1
                ? `+${prod3}`
                : `-${prod3}`
            const p4 = prod4.startsWith('-')
              ? somme1 === somme2
                ? prod4
                : `+${prod4.substring(1)}`
              : somme1 === somme2
                ? `+${prod4}`
                : `-${prod4}`

            return `${miseEnForme(prod1, couleurs[colorOffset], isColored)}
        ${miseEnForme(p2, couleurs[colorOffset + 1], isColored)}
        ${miseEnForme(p3, couleurs[colorOffset + 2], isColored)}
        ${miseEnForme(p4, couleurs[colorOffset + 3], isColored)}`.replaceAll(
              '\\frac',
              '\\dfrac',
            )
          }
        }
      }
      return '' // retour impossible. C'est juste pour le ESLint
    }
    return '' // retour impossible. C'est juste pour le ESLint
  }
}
