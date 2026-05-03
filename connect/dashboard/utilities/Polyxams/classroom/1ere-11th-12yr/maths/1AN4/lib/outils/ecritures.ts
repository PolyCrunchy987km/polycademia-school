import { orangeMathalea } from 'apigeom/src/elements/defaultValues'
import Decimal from 'decimal.js'
import type { IFractionEtendue } from '../../modules/FractionEtendue.type'
import { fraction } from '../../modules/fractions'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import { egal } from '../../modules/outils'
import type { AnswerValueType } from '../types'
import { miseEnEvidence } from './embellissements'
import { arrondi, round } from './nombres'
import { lettreDepuisChiffre } from './outilString'
import { stringNombre, texNombre } from './texNombre'

// Garde de type structurel pour détecter une FractionEtendue sans import runtime
const isFractionEtendue = (x: unknown): x is IFractionEtendue =>
  typeof x === 'object' &&
  x !== null &&
  // signature minimale et stable de FractionEtendue
  typeof (x as any).sommeFraction === 'function'

/**
 * écrit le nombre, mais pas un nombre s'il est égal à 1
 * @Example
 * //rienSi1(1)+'x' -> x
 * //rienSi1(-1)+'x' -> -x
 * @author Rémi Angot et Jean-claude Lhote pour le support des fractions
 */
export function rienSi1(a: number | IFractionEtendue | Decimal) {
  if (typeof a === 'number') {
    if (a === 1) return ''
    if (a === -1) return '-'
    return texNombre(a)
  }
  if (a instanceof Decimal) {
    if (a.eq(1)) return ''
    if (a.eq(-1)) return '-'
    return texNombre(a)
  }
  if (
    isFractionEtendue(a) &&
    !(a.isEqual(fraction(1, 1)) || a.isEqual(fraction(-1, 1)))
  ) {
    return a.toLatex()
  }
  if (isFractionEtendue(a) && a.isEqual(fraction(1, 1))) return ''
  if (isFractionEtendue(a) && a.isEqual(fraction(-1, 1))) return '-'
  if (!isFractionEtendue(a)) {
    if (egal(a, 1)) return ''
    if (egal(a, -1)) return '-'
  }
  if (typeof a === 'string') {
    window.notify("rienSi1() n'accepte pas les string.", { argument: a })
    return texNombre(Number(a), 7)
  }
  window.notify('rienSi1 : type de valeur non prise en compte : ', { a })
  return String(a)
}

/**
 * @param a Un nombre, une fraction ou une chaîne de caractères
 * @example
 * // rienSi0(0) -> ''
 * // rienSi0(2) -> '2'
 * @author Guillaume Valmont
 */
export function rienSi0(a: number | IFractionEtendue | Decimal) {
  if (typeof a === 'number') {
    if (a === 0) return ''
    return texNombre(a)
  }
  if (a instanceof Decimal) {
    if (a.isZero()) return ''
    return texNombre(a)
  }
  if (isFractionEtendue(a) && !a.isEqual(fraction(0, 1))) {
    return a.toLatex()
  }
  if (isFractionEtendue(a) && a.isEqual(fraction(0, 1))) return ''
  if (!isFractionEtendue(a)) {
    if (egal(a, 0)) return ''
  }
  if (typeof a === 'string') {
    window.notify("rienSi0() n'accepte pas les string.", { argument: a })
    return texNombre(Number(a), 7)
  }
  window.notify('rienSi0 : type de valeur non prise en compte : ', { a })
  return String(a)
}

/*
 * @deprecated
 * Gère l'écriture de l'exposant en mode text (ne doit pas s'utiliser entre $ $)
 * Pour le mode maths (entre $ $) on utilisera tout simplement ^3 pour mettre au cube ou ^{42} pour la puissance 42.
 * @Example
 * // 'dm'+texteExposant(3) -> Privilégier maintenant '$\\text{dm}^3$'
 * @author Rémi Angot
 */
/* export function texteExposant(texte: string | number) {
  if (typeof texte === 'number') texte = String(texte)
  if (context.isHtml) {
    return `<sup>${texte}</sup>`
  } else {
    return `\\up{${texte}}`
  }
} */

/**
 * Ajoute les parenthèses et le signe
 * @Example
 * //(+3) ou (-3)
 * @author Rémi Angot
 */
export function ecritureNombreRelatif(a: number) {
  if (typeof a === 'string') {
    window.notify("ecritureNombreRelatif() n'accepte pas les string.", {
      argument: a,
    })
    a = Number(a)
  }
  if (a > 0) {
    return '(+' + texNombre(a) + ')'
  } else if (a < 0) {
    return '(' + texNombre(a) + ')'
  }
  // ne pas mettre de parenthèses pour le nombre 0.
  return '0'
}

/**
 * Idem ecritureNombreRelatif avec le code couleur : vert si positif, rouge si négatif, noir si nul
 * @param {number} a
 */
export function ecritureNombreRelatifc(
  a: string | number,
  { color = null }: { color?: string | null } = {},
) {
  if (typeof a === 'string') {
    window.notify("ecritureNombreRelatifc() n'accepte pas les string.", {
      argument: a,
    })
    a = Number(a)
  }
  let result = ''
  if (a > 0) {
    result = miseEnEvidence('(+' + texNombre(a, 7) + ')', color ?? 'blue')
  } else if (a < 0) {
    result = miseEnEvidence('(' + texNombre(a, 7) + ')', color ?? 'green') // EE : Je change cette couleur pour ne pas avoir le orange de la correction.
  } else {
    // ne pas mettre de parenthèses pour le nnombre 0.
    result = miseEnEvidence('0', color ?? 'black')
  }
  return result
}

/**
 * Ajoute le + devant les nombres positifs
 * @Example
 * //+3 ou -3
 * @author Rémi Angot et Jean-claude Lhote pour le support des fractions
 */
export function ecritureAlgebrique(a: number | IFractionEtendue | Decimal) {
  if (typeof a === 'string') {
    window.notify("ecritureAlgebrique() n'accepte pas les string.", {
      argument: a,
    })
    return a
  } else if (isFractionEtendue(a)) {
    return a.texFractionSignee
  } else if (typeof a === 'number') {
    if (a >= 0) {
      return '+' + texNombre(a, 7)
    } else {
      return texNombre(a, 7)
    }
  } else if (a instanceof Decimal) {
    if (a.isPos()) {
      return '+' + texNombre(a, 7)
    } else {
      return texNombre(a, 7)
    }
  } else {
    window.notify('ecritureAlgebrique() : type de valeur non prise en compte', {
      argument: a,
    })
    return ''
  }
}

/**
 * Ajoute le + devant les nombres positifs, n'écrit rien si 1
 * @Example
 * //+3 ou -3
 * @author Rémi Angot et Jean-claude Lhote pour le support des fractions
 */
export function ecritureAlgebriqueSauf1(
  a: IFractionEtendue | number | Decimal,
) {
  if (isFractionEtendue(a)) {
    if (a.num === 1 && a.den === 1) return '+'
    else if (a.num === -1 && a.den === 1) return '-'
    else return a.texFractionSignee
  }
  if (typeof a === 'string') {
    window.notify("ecritureAlgebriqueSauf1() n'accepte pas les string.", {
      argument: a,
    })
    a = Number(a)
  }
  if (Number(a) === 1) return '+'
  else if (Number(a) === -1) return '-'
  else if (typeof a === 'number' || a instanceof Decimal) {
    return ecritureAlgebrique(a)
  } else {
    window.notify(
      'ecritureAlgebriqueSauf1 : type de valeur non prise en compte',
      {},
    )
    return 'erreur type de valeur non prise en compte'
  }
}

/**
 * Ajoute le + devant les nombres positifs, n'écrit rien si 0
 * @Example
 * //+3 ou -3
 * @author Nathan Scheinmann en copiant la fonction ecritureAlgebriqueSauf1
 */
export function ecritureAlgebriqueSauf0(
  a: IFractionEtendue | number | Decimal,
) {
  if (isFractionEtendue(a)) {
    if (a.num === 0) return ''
  }
  if (typeof a === 'string') {
    window.notify("ecritureAlgebriqueSauf0() n'accepte pas les string.", {
      argument: a,
    })
    a = Number(a)
  }
  if (Number(a) === 0) return ''
  else if (typeof a === 'number' || a instanceof Decimal) {
    return ecritureAlgebrique(a)
  } else {
    window.notify(
      'ecritureAlgebriqueSauf0 : type de valeur non prise en compte',
      {},
    )
    return 'erreur type de valeur non prise en compte'
  }
}

/**
 * Idem ecritureAlgebrique mais retourne le nombre en couleur (vert si positif, rouge si négatif et noir si nul).
 * @param {number} a
 */
export function ecritureAlgebriquec(a: number | string, color?: string) {
  if (typeof a === 'string') {
    window.notify("ecritureAlgebriquec() n'accepte pas les string.", {
      argument: a,
    })
    a = Number(a)
  }
  let result = ''
  if (a > 0) {
    result = miseEnEvidence('+' + texNombre(a, 7), color ?? 'blue')
  } else if (a < 0) {
    result = miseEnEvidence(texNombre(a, 7), color ?? orangeMathalea)
  } else result = miseEnEvidence(texNombre(a, 7), color ?? 'black')
  return result
}

/**
 * @param {number} r Un nombre relatif
 * @param {number} precision nombre de chiffres maximum après la virgule pour texNombre.
 * @returns {string} met en évidence le signe - si r < 0
 */

export function signeMoinsEnEvidence(r: number, precision = 0) {
  if (typeof r !== 'number') {
    window.notify(
      "signeMoinsEnEvidence() appelé avec autre chose qu'un nombre.",
      { argument: r },
    )
  } else if (r < 0) {
    return miseEnEvidence('-') + texNombre(Math.abs(r), precision)
  } else return texNombre(Math.abs(r), precision)
}

/**
 * Ajoute des parenthèses aux nombres négatifs
 * @Example
 * // 3 ou (-3)
 * @author Rémi Angot
 * @return {string}
 */
export function ecritureParentheseSiNegatif(
  a: Decimal | number | IFractionEtendue,
): string {
  let result = ''
  if (a instanceof Decimal) {
    if (a.gte(0)) {
      return texNombre(a, 8)
      // On met 8 décimales, mais cette fonctions s'utilise presque exclusivement avec des entiers donc ça ne sert à rien
    } else return `(${texNombre(a, 8)})`
  } else if (typeof a === 'number') {
    if (a >= 0) {
      result = texNombre(a, 8) // j'ai passé le nombre dans texNombre, car la fonction ne prenait pas en compte l'écriture décimale !
    } else {
      result = `(${texNombre(a, 8)})`
    }
    return result
  } else if (isFractionEtendue(a)) {
    return a.ecritureParentheseSiNegatif
  } else {
    window.notify(
      "ecritureParentheseSiNegatif() appelée avec autre chose qu'un nombre",
      { argument: a },
    )
    return 'undefined'
  }
}

/**
 * Ajoute des parenthèses si une expression commence par un moins
 * @Example
 * // (-3x)
 * @author Rémi Angot
 */
export function ecritureParentheseSiMoins(
  expr: string | number | IFractionEtendue,
) {
  let result = ''
  if (typeof expr === 'string' && expr[0] === '-') result = `(${expr})`
  else if (typeof expr === 'string') {
    result = expr
    // Il faut sortir si c'est un string, il n'y a rien à faire de plus !
  } else if (typeof expr === 'number' && expr < 0) {
    result = `(${stringNombre(expr, 7)})`
  } else if (typeof expr === 'number') return stringNombre(expr, 7)
  else if (isFractionEtendue(expr) && expr.s === -1) {
    return `\\left(${expr.texFSD}\\right)`
  } else {
    // avant on passait ici quand c'était un string sans signe - devant... c'était une mauvaise idée !
    window.notify(
      "ecritureParentheseSiMoins() n'accepte pas ce type d'argument.",
      { argument: expr },
    )
    if (
      result.includes('dfrac') &&
      result.startsWith('(') &&
      result.endsWith(')')
    ) {
      return `\\left${result.slice(1, -1)}\\right)`
    } else return result
  }
  return result
}

/**
 *
 * @author Jean-claude Lhote
 * @param {numero} 1=A, 2=B ...
 * @param {etapes} tableau de chaines comportant les expressions à afficher dans le membre de droite.
 */

export function calculAligne(numero: number, etapes: number[]) {
  let script = `$\\begin{aligned}${miseEnEvidence(lettreDepuisChiffre(numero))}&=${etapes[0]}`
  for (let i = 1; i < etapes.length - 1; i++) {
    script += `\\\\&=${etapes[i]}`
  }
  script += `\\\\${miseEnEvidence(lettreDepuisChiffre(numero) + '&=' + etapes[etapes.length - 1])}$`
  return script
}

/**
 * Retourne égal si la valeur est égale à l'arrondi souhaité ou environ égal si ce n'est pas le cas
 * Le nombre a est comparé à son arrondi à précision près. Si la différence est inférieure à epsilon, alors on retourne '=' sinon '\\approx'
 * fonctionne aussi si a est une fraction : permet de finir un calcul par la valeur décimale si on veut.
 * @author Jean-claude Lhote
 */
export function egalOuApprox(
  a: number | IFractionEtendue | Decimal,
  precision: number,
) {
  if (isFractionEtendue(a)) {
    // @ ts-expect-errors
    return egal(a.num / a.den, arrondi(a.num / a.den, precision))
      ? '='
      : '\\approx'
  } else if (a instanceof Decimal) {
    return a.eq(a.toDP(precision)) ? '=' : '\\approx'
  } else if (!isNaN(a) && !isNaN(precision)) {
    return egal(a, round(a, precision), 10 ** (-precision - 2))
      ? '='
      : '\\approx'
  } else {
    window.notify("egalOuApprox : l'argument n'est pas un nombre", {
      a,
      precision,
    })
    return 'Mauvais argument (nombres attendus).'
  }
}

/**
 * renvoie une chaine correspondant à l'écriture réduite d'ax+b selon les valeurs de a et b
 * La lettre par défaut utilisée est 'x' mais peut être tout autre chose.
 * @author Éric Elter
 * @param {number | Decimal | FractionEtendue} a
 * @param {number | Decimal | FractionEtendue} b
 * @param {string} [inconnue = 'x'] 'x' par défaut, mais on peut préciser autre chose.
 */
export function reduireAxPlusB(
  a: number | Decimal | IFractionEtendue,
  b: number | Decimal | IFractionEtendue,
  inconnue: string = 'x',
  options: OptionsReduireAxPlusByPlusC = {},
) {
  return reduireAxPlusByPlusC(a, 0, b, inconnue, undefined, options)
}

/* Ancienne version de Jean-claude Lhote

if (!(a instanceof Decimal)) a = new Decimal(a)
  if (!(b instanceof Decimal)) b = new Decimal(b)
  let result = ''
  if (!a.isZero()) {
    if (a.eq(1)) result = inconnue
    else if (a.eq(-1)) result = '-' + inconnue
    else result = `${texNombre(a, 7)}${inconnue}`
  }
  if (!b.isZero()) {
    if (a.isZero()) result = texNombre(b, 7)
    else result += ecritureAlgebrique(b)
  } else if (a.isZero()) result = '0'
  return result
} */

type OptionsReduireAxPlusByPlusC = {
  ordreInverse?: boolean // Si true, on inverse l'ordre des termes dans la chaîne de caractères retournée
}

/**
 * renvoie une chaine correspondant à l'écriture réduite d'ax+by+c selon les valeurs de a, b et c
 * Les lettres par défaut utilisées sont 'x' et y mais peut être tout autre chose.
 * @author Éric Elter
 * @param {number | Decimal | FractionEtendue} a
 * @param {number | Decimal | FractionEtendue} b
 * @param {number | Decimal | FractionEtendue} c
 * @param {string} [inconnueX = 'x'] 'x' par défaut, mais on peut préciser autre chose.
 * @param {string} [inconnueY = 'y'] 'y' par défaut, mais on peut préciser autre chose.
 * @example reduireAxPlusByPlusC(3,-4,5) // renvoie 3x-4y+5
 * @example reduireAxPlusByPlusC(1,-1,0) // renvoie x-y
 * @example reduireAxPlusByPlusC(0,2,-7) // renvoie 2y-7
 * @example reduireAxPlusByPlusC(3,0,6) // renvoie 3x+6
 * @example reduireAxPlusByPlusC(0,0,0) // renvoie 0
 * @example reduireAxPlusByPlusC(3,-4,5,'a','b') // renvoie 3a-4b+5
 * @return {string}
 */
export function reduireAxPlusByPlusC(
  a: number | Decimal | IFractionEtendue,
  b: number | Decimal | IFractionEtendue,
  c: number | Decimal | IFractionEtendue,
  inconnueX = 'x',
  inconnueY = 'y',
  options: OptionsReduireAxPlusByPlusC = {},
) {
  if (!(a instanceof Decimal) && !isFractionEtendue(a)) {
    a = new Decimal(a)
  }
  if (!(b instanceof Decimal) && !isFractionEtendue(b)) {
    b = new Decimal(b)
  }
  if (!(c instanceof Decimal) && !isFractionEtendue(c)) {
    c = new Decimal(c)
  }
  let valeurDecimaleFraction: number
  let aEgalZero: boolean
  let bEgalZero: boolean
  let cEgalZero: boolean
  let termeA: string
  let termeB: string
  let termeC: string
  if (a instanceof Decimal) {
    aEgalZero = a.isZero()
    termeA = aEgalZero
      ? ''
      : (a.eq(1)
          ? options.ordreInverse
            ? '+'
            : ''
          : a.eq(-1)
            ? '-'
            : options.ordreInverse
              ? ecritureAlgebriqueSauf1(a)
              : texNombre(a)) + inconnueX
  } else {
    valeurDecimaleFraction = a.valeurDecimale
    aEgalZero = valeurDecimaleFraction === 0
    termeA = aEgalZero
      ? ''
      : (valeurDecimaleFraction === 1
          ? options.ordreInverse
            ? '+'
            : ''
          : valeurDecimaleFraction === -1
            ? '-'
            : options.ordreInverse
              ? a.texFractionSignee
              : a.texFSD) + inconnueX
  }
  if (b instanceof Decimal) {
    bEgalZero = b.isZero()
    termeB = bEgalZero
      ? ''
      : (b.eq(-1)
          ? '-'
          : b.eq(1) && aEgalZero
            ? ''
            : b.eq(1) && !aEgalZero
              ? '+'
              : aEgalZero
                ? texNombre(b)
                : ecritureAlgebrique(b)) + inconnueY
  } else {
    valeurDecimaleFraction = b.valeurDecimale
    bEgalZero = valeurDecimaleFraction === 0
    termeB = bEgalZero
      ? ''
      : (valeurDecimaleFraction === -1
          ? '-'
          : valeurDecimaleFraction === 1 && aEgalZero
            ? ''
            : valeurDecimaleFraction === 1 && !aEgalZero
              ? '+'
              : bEgalZero
                ? `${b.texFSD}`
                : `${b.texFractionSignee}`) + inconnueY
  }
  if (c instanceof Decimal) {
    cEgalZero = c.isZero()
    termeC =
      aEgalZero && bEgalZero && cEgalZero
        ? '0'
        : cEgalZero
          ? ''
          : (aEgalZero && bEgalZero) || options.ordreInverse
            ? texNombre(c)
            : ecritureAlgebrique(c)
  } else {
    valeurDecimaleFraction = c.valeurDecimale
    cEgalZero = valeurDecimaleFraction === 0
    termeC =
      aEgalZero && bEgalZero && cEgalZero
        ? '0'
        : cEgalZero
          ? ''
          : (aEgalZero && bEgalZero) || options.ordreInverse
            ? `${c.texFSD}`
            : `${c.texFractionSignee}`
  }
  const result = options.ordreInverse
    ? `${termeC}${termeB}${termeA}`
    : `${termeA}${termeB}${termeC}`
  return result
}

/**
 * renvoie une chaine correspondant à l'écriture réduite d'ax^3+bx^2+cx+d selon les valeurs de a, b, c et d
 * @author Jean-claude Lhote
 */
export function reduirePolynomeDegre3(
  a: number | string,
  b: number | string,
  c: number | string,
  d: number | string,
  x = 'x',
) {
  ;[a, b, c, d].forEach((el) => (typeof el === 'number' ? el : Number(el)))
  let result = ''
  if (a !== 0) {
    switch (a) {
      case 1:
        result += `${x}^3`
        break
      case -1:
        result += `-${x}^3`
        break
      default:
        result += `${a}${x}^3`
        break
    }
    if (b !== 0) {
      switch (b) {
        case 1:
          result += `+${x}^2`
          break
        case -1:
          result += `-${x}^2`
          break
        default:
          result += `${typeof b === 'number' ? ecritureAlgebrique(b) : b}${x}^2`
          break
      }
    }
    if (c !== 0) {
      switch (c) {
        case 1:
          result += `+${x}`
          break
        case -1:
          result += `-${x}`
          break
        default:
          result += `${typeof c === 'number' ? ecritureAlgebrique(c) : c}${x}`
          break
      }
    }
    if (d !== 0) {
      result += `${typeof d === 'number' ? ecritureAlgebrique(d) : d}`
    }
  } else {
    // degré 2 pas de degré 3
    if (b !== 0) {
      switch (b) {
        case 1:
          result += `${x}^2`
          break
        case -1:
          result += `-${x}^2`
          break
        default:
          result += `${b}${x}^2`
          break
      }
      if (c !== 0) {
        switch (c) {
          case 1:
            result += `+${x}`
            break
          case -1:
            result += `-${x}`
            break
          default:
            result += `${typeof c === 'number' ? ecritureAlgebrique(c) : c}${x}`
            break
        }
      }
      if (d !== 0) {
        result += `${typeof d === 'number' ? ecritureAlgebrique(d) : d}`
      }
    } else if (c !== 0) {
      // degré 1 pas de degré 2 ni de degré 3
      switch (c) {
        case 1:
          result += `${x}`
          break
        case -1:
          result += `-${x}`
          break
        default:
          result += `${c}${x}`
          break
      }
      if (d !== 0) {
        result += `${typeof d === 'number' ? ecritureAlgebrique(d) : d}`
      }
    } else {
      // degré 0 a=0, b=0 et c=0
      result += `${d}`
    }
  }
  return result
}

export function ordreAlphabetique(str: string): string {
  const chars = Array.from(str)
  const orderedChars = chars.sort((a, b) => a.charCodeAt(0) - b.charCodeAt(0))
  return orderedChars.join('')
}

/**
 * Liste les différents éléments d'un array séparés par une virgule et un "et" avant le dernier élément
 * @param array
 * @returns une chaîne à afficher
 */
export function lister(array: unknown[]): string {
  let str = ''
  for (let i = 0; i < array.length - 1; i++) {
    if (i !== 0) str += ', '
    str += array[i]
  }
  if (array.length > 1) str += ' et '
  str += array[array.length - 1]
  return str
}

/**
 * Retourne le double développement de (ax+b)(cx+d) sous forme d'un tableau.
 * La premier élément est le développement terme par terme.
 * Le second élément est ce développement réduit terme par terme.
 * Si reduire est vrai, et qu'il y a des parenthèses encadrant les termes négatifs, on renvoie aussi le développement réduit en somme algébrique.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [a=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [b=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [c=1] Un entier actuellement uniquement(par défaut, c'est 1)
 * @param {string} [x='x'] Le nom de la variable (par défaut, c'est 'x')
 * @param {boolean} [reduire=false] Vrai si on veut réduire le développement en somme algébrique
 * @return {string[]}
 * @author Éric Elter
 * @example doubleDeveloppement({ a:5, b:-2, c:-1, d:4})[0] renvoie 5x*(-x)+5x*4+(-2)*(-x)+(-2)*4
 * @example doubleDeveloppement({ a:5, b:-2, c:-1, d:4})[1] renvoie -5x^2+20x+2x+(-8)
 * @example doubleDeveloppement({ a:5, b:-2, c:-1, d:4, variable:'y})[0] renvoie 5y*(-y)+5y*4+(-2)*(-y)+(-2)*4
 * @example doubleDeveloppement({ a:5, b:-2, c:-1, d:4, variable:'y})[1] renvoie -5y^2+20y+2y+(-8)
 */
export function doubleDeveloppement({
  a = 1,
  b = 1,
  c = 1,
  d = 1,
  x = 'x',
  reduire = false,
} = {}) {
  if (a === 0) {
    return [
      ...simpleDeveloppement({ a: c, b: d, c: b, x, sommeAGauche: false }),
    ]
  }
  if (b === 0) {
    return [
      ...simpleDeveloppementAvecDoubleX({
        a: c,
        b: d,
        c: a,
        x,
        sommeAGauche: false,
      }),
    ]
  }
  if (c === 0) return [...simpleDeveloppement({ a, b, c: d, x })]
  if (d === 0) return [...simpleDeveloppementAvecDoubleX({ a, b, c, x })]
  const expression1 = `${rienSi1(a)}${x}\\times ${ecritureParentheseSiMoins(rienSi1(c) + x)} + 
  ${ecritureParentheseSiMoins(rienSi1(a) + x)}\\times ${ecritureParentheseSiNegatif(d)} +
  ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiMoins(rienSi1(c) + x)}  +
  ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(d)}`
  const expression2 = `${rienSi1(a * c)}${x}^2 + 
  ${ecritureParentheseSiMoins(rienSi1(a * d) + x)} +
  ${ecritureParentheseSiMoins(rienSi1(b * c) + x)} +
  ${ecritureParentheseSiNegatif(b * d)}`
  const expression3 = `${rienSi1(a * c)}${x}^2
  ${ecritureAlgebriqueSauf1(a * d)}${x}
  ${ecritureAlgebriqueSauf1(b * c)}${x}
  ${ecritureAlgebrique(b * d)}`
  return reduire && expression2 !== expression3
    ? [expression1, expression2, expression3]
    : [expression1, expression2]
}

/**
 * Retourne le simple développement de (ax+b)c ou c(ax+b) sous forme d'un tableau.
 * La premier élément est le développement terme par terme.
 * Le second élément est ce développement réduit terme par terme.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [a=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [b=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [c=1] Un entier actuellement uniquement(par défaut, c'est 1)
 * @param {string} [x='x'] Le nom de la variable (par défaut, c'est 'x')
 * @param {boolean} [sommeAGauche=true] Vrai si (ax+b)c, Faux si c(ax+b)
 * @return {string[]}
 * @author Éric Elter
 * @example simpleDeveloppement({ a:5, b:-2, c:3})[0] renvoie 5x*3+(-2)*3
 * @example simpleDeveloppement({ a:5, b:-2, c:3})[1] renvoie 15x+(-6)
 * @example simpleDeveloppement({ a:5, b:-2, c:3, variable:'y, sommeAGauche:false})[0] renvoie 3*5y+3*(-2)
 * @example simpleDeveloppement({ a:5, b:-2, c:3, variable:'y, sommeAGauche:false})[1] renvoie 15y+(-6)
 */
export function simpleDeveloppement({
  a = 1,
  b = 1,
  c = 1,
  x = 'x',
  sommeAGauche = true,
} = {}) {
  if (a === 0) {
    return [
      sommeAGauche
        ? `${rienSi1(b)} \\times ${ecritureParentheseSiNegatif(c)}`
        : `${rienSi1(c)} \\times ${ecritureParentheseSiNegatif(b)}`,
      `${rienSi1(b * c)}`,
    ]
  }
  if (b === 0) {
    return [
      sommeAGauche
        ? `${rienSi1(a)}${x}} \\times ${ecritureParentheseSiNegatif(c)}`
        : `${rienSi1(c)} \\times ${ecritureParentheseSiMoins(rienSi1(a) + x)}`,
      `${rienSi1(a * c)}${x}`,
    ]
  }
  if (c === 0) {
    return [0, 0]
  }
  return [
    sommeAGauche
      ? `${rienSi1(a)}${x}\\times ${ecritureParentheseSiNegatif(c)} +
    ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiNegatif(c)}`
      : `${rienSi1(c)} \\times ${ecritureParentheseSiMoins(rienSi1(a) + x)} +
      ${ecritureParentheseSiNegatif(c)} \\times ${ecritureParentheseSiNegatif(b)}`,
    `${rienSi1(a * c)}${x} + 
    ${ecritureParentheseSiMoins(rienSi1(b * c) ?? '')}`,
  ]
}

/**
 * Retourne le simple développement de (ax+b)cx ou cx(ax+b) sous forme d'un tableau.
 * La premier élément est le développement terme par terme.
 * Le second élément est ce développement réduit terme par terme.
 * @param {Object} parametres À saisir entre accolades
 * @param {number} [a=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [b=1] Un entier actuellement uniquement (par défaut, c'est 1)
 * @param {number} [c=1] Un entier actuellement uniquement(par défaut, c'est 1)
 * @param {string} [x='x'] Le nom de la variable (par défaut, c'est 'x')
 * @param {boolean} [sommeAGauche=true] Vrai si (ax+b)c, Faux si c(ax+b) (par défaut, c'est vrai)
 * @return {string[]}
 * @author Éric Elter
 * @example simpleDeveloppementAvecDoubleX({ a:5, b:-2, c:3})[0] renvoie 5x*3x+(-2)*3x
 * @example simpleDeveloppementAvecDoubleX({ a:5, b:-2, c:3})[1] renvoie 15x^2+(-6x)
 * @example simpleDeveloppementAvecDoubleX({ a:5, b:-2, c:3, variable:'y, sommeAGauche:false})[0] renvoie 3y*5y+3y*(-2)
 * @example simpleDeveloppementAvecDoubleX({ a:5, b:-2, c:3, variable:'y, sommeAGauche:false})[1] renvoie 15y^2+(-6y)
 */
export function simpleDeveloppementAvecDoubleX({
  a = 1,
  b = 1,
  c = 1,
  x = 'x',
  sommeAGauche = true,
  doubleX = true,
} = {}) {
  const xCarre = doubleX ? x + '^2' : x
  const xSeul = doubleX ? x : ''
  if (a === 0) {
    return [
      sommeAGauche
        ? `${rienSi1(b)} \\times ${ecritureParentheseSiMoins(rienSi1(c) + x)}`
        : `${rienSi1(c)}${x} \\times ${ecritureParentheseSiNegatif(b)}`,
      `${rienSi1(b * c)}${x}`,
    ]
  }
  if (b === 0) {
    return [
      sommeAGauche
        ? `${rienSi1(a)}${x}} \\times ${ecritureParentheseSiMoins(rienSi1(c) + x)}`
        : `${rienSi1(c)}${x} \\times ${ecritureParentheseSiMoins(rienSi1(a) + x)}`,
      `${rienSi1(a * c)}${x}`,
    ]
  }
  if (c === 0) {
    return [0, 0]
  }
  return [
    sommeAGauche
      ? `${rienSi1(a)}${x}\\times ${ecritureParentheseSiMoins(rienSi1(c) + xSeul)} +
    ${ecritureParentheseSiNegatif(b)} \\times ${ecritureParentheseSiMoins(rienSi1(c) + xSeul)}`
      : `${rienSi1(c)}${xSeul} \\times ${ecritureParentheseSiMoins(rienSi1(a) + x)} +
      ${ecritureParentheseSiMoins(rienSi1(c) + xSeul)} \\times ${ecritureParentheseSiNegatif(b)}`,
    `${rienSi1(a * c)}${xCarre} + 
      ${ecritureParentheseSiMoins(rienSi1(b * c) + xSeul)}`,
  ]
}

/**
 * Formate une réponse pour son affichage, par exemple pour formater les différents distracteurs de la version qcm d'un exercice de type simple.
 * Si la réponse est un tableau, elle formate le premier élément.
 * @param a La valeur à formater
 * @returns {string} La valeur formatée pour l'affichage
 */
export function formaterReponse(a: AnswerValueType): string {
  if (Array.isArray(a)) {
    return formaterReponse(a[0])
  }
  if (typeof a === 'number' || a instanceof Decimal) {
    return `$${texNombre(a, 7)}$`
  }
  if (isFractionEtendue(a)) {
    return `$${a.texFraction}$`
  }
  if (typeof a === 'string') {
    return a
  }
  if (a instanceof Grandeur) {
    return `$${a.toTex()}$`
  }
  if (a instanceof Hms) {
    return a.toString()
  }
  window.notify('formaterReponse : type de valeur non prise en compte : ', {
    a,
  })
  return String(a)
}

export function enumeration(
  items: string[],
  separator = ', ',
  lastSeparator = ' et ',
): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return items[0] + lastSeparator + items[1]
  return (
    items.slice(0, -1).join(separator) + lastSeparator + items[items.length - 1]
  )
}
