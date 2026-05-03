import { miseEnEvidence } from './embellissements'
import { ecritureParentheseSiNegatif } from './ecritures'
import { pgcd } from './primalite'
import { texNombre } from './texNombre'
import { bleuMathalea } from '../colors'

/**
 * Fonction de comparaison à utiliser avec tableau.sort(compareFractions)
 *
 * Le tableau doit être du type `[[num,den],[num2,den2]]`
 *
 * @author Rémi Angot
 */
export function compareFractions(a: [number, number], b: [number, number]) {
  if (a[0] / a[1] > b[0] / b[1]) {
    return 1
  }
  if (a[0] / a[1] < b[0] / b[1]) {
    return -1
  }
  // Sinon il y a égalité
  return 0
}

/**
 * Retourne le numérateur et le dénominateur de la fraction passée en argument sous la forme (numérateur, dénominateur) réduite au maximum dans un tableau [numérateur,dénominateur]
 * @deprecated : utiliser la class FractionEtendue à la place
 * @author Rémi Angot
 */
export function fractionSimplifiee(n: number, d: number): [number, number] {
  const p = pgcd(n, d)
  let ns = n / p
  let ds = d / p
  if (ns < 0 && ds < 0) {
    ;[ns, ds] = [-ns, -ds]
  }
  if (ns > 0 && ds < 0) {
    ;[ns, ds] = [-ns, -ds]
  }
  return [ns, ds]
}

/**
 * Retourne le code LaTeX d'une fraction simplifiée ou d'un nombre entier
 * @deprecated : utiliser la class FractionEtendue à la place. Exemple : new FractionEtendue(a, b).texFractionSimplifiee
 * @author Rémi Angot
 */
export function texFractionReduite(n: number, d: number): string {
  if (Math.abs(n) % Math.abs(d) === 0) {
    return texNombre(n / d, 0)
  } else {
    return texFractionSigne(
      fractionSimplifiee(n, d)[0],
      fractionSimplifiee(n, d)[1],
    )
  }
}

/**
 * @deprecated : utiliser la class FractionEtendue à la place
 * produitDeDeuxFractions(num1,den1,num2,den2) retourne deux chaines :
 * la première est la fraction résultat, la deuxième est le calcul mis en forme Latex avec simplification éventuelle
 * Applique une simplification si le numérateur de l'une est égal au dénominateur de l'autre.
 */
export function produitDeDeuxFractions(
  num1: number,
  den1: number,
  num2: number,
  den2: number,
): [string, string, [number, number, number, number]] {
  let num, den, texProduit
  if (num1 === den2) {
    texProduit = `\\dfrac{\\cancel{${num1}}\\times ${ecritureParentheseSiNegatif(num2)}}{${den1}\\times\\cancel{${ecritureParentheseSiNegatif(den2)}}}`
    num = num2
    num1 = 1
    den2 = 1
    den = den1
  } else if (num2 === den1) {
    texProduit = `\\dfrac{${num1}\\times \\cancel{${ecritureParentheseSiNegatif(num2)}}}{\\cancel{${den1}}\\times${ecritureParentheseSiNegatif(den2)}}`
    num = num1
    num2 = 1
    den1 = 1
    den = den2
  } else {
    num = num1 * num2
    den = den1 * den2
    texProduit = `\\dfrac{${num1}\\times ${ecritureParentheseSiNegatif(num2)}}{${den1}\\times${ecritureParentheseSiNegatif(den2)}}`
  }
  return [texFractionFromString(num, den), texProduit, [num1, den1, num2, den2]]
}

/**
 * @deprecated utiliser la class FractionEtendue à la place
 * Simplifie une fraction en montrant les étapes
 * Le résultat est un string qui doit être entouré de $ pour le mode mathématique
 * @author Rémi Angot
 */
export function simplificationDeFractionAvecEtapes(
  num: number,
  den: number,
  {
    couleur1 = bleuMathalea,
    couleur2 = 'black',
    colorisationResultat = true,
  } = {},
): string {
  let result = '='
  if (num === 0) {
    return '=0'
  }
  const signe = num * den < 0 ? '-' : ''
  const numAbs = Math.abs(num)
  const denAbs = Math.abs(den)
  // Est-ce que le résultat est simplifiable ?
  const s = pgcd(numAbs, denAbs)
  if (s !== 1) {
    if (numAbs % denAbs === 0) {
      // si le résultat est entier
      result += colorisationResultat
        ? `${miseEnEvidence(num / den, couleur2)}`
        : `${num / den}`
    } else {
      result += colorisationResultat
        ? `${signe}${texFractionFromString(numAbs / s + miseEnEvidence('\\times' + s, couleur1), denAbs / s + miseEnEvidence('\\times' + s, couleur1))}=${miseEnEvidence(texFractionSigne(num / s, den / s), couleur2)}`
        : `${signe}${texFractionFromString(numAbs / s + '\\times' + s, denAbs / s + '\\times' + s)}=${texFractionSigne(num / s, den / s)}`
    }
  } else if (num < 0 || den < 0) {
    result += colorisationResultat
      ? `${miseEnEvidence(texFractionSigne(num, den), couleur2)}`
      : `${texFractionSigne(num, den)}`
  } else return ''
  return result
}

/**
 * @deprecated Utiliser la classe FractionEtendue et ses différentes méthodes
 * Retourne la string LaTeX de la fraction
 * @param num
 * @param den
 * @return {string}
 * @author Jean-Claude Lhote
 */
export function texFractionSigne(num: number, den: number): string {
  if (den === 1) return String(num)
  if (num * den > 0) {
    return `\\dfrac{${texNombre(Math.abs(num))}}{${texNombre(Math.abs(den))}}`
  }
  if (num * den < 0) {
    return `-\\dfrac{${texNombre(Math.abs(num))}}{${texNombre(Math.abs(den))}}`
  }
  return '0'
}

/**
 * Retourne une liste de fractions irréductibles
 * @author Jean-Claude Lhote
 */
export function obtenirListeFractionsIrreductibles(): [number, number][] {
  // sous forme de tableaux [numérateur,dénominateur]
  return [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [1, 6],
    [5, 6],
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
    [1, 8],
    [3, 8],
    [5, 8],
    [7, 8],
    [1, 9],
    [2, 9],
    [4, 9],
    [5, 9],
    [7, 9],
    [8, 9],
    [1, 10],
    [3, 10],
    [7, 10],
    [9, 10],
  ]
}

/**
 * Retourne une liste de fractions irréductibles de dénominateur égal à 2 3 5 7
 * @author Mireille Gain
 */
export function obtenirListeFractionsIrreductiblesFaciles(): [
  number,
  number,
][] {
  // sous forme de tableaux [numérateur,dénominateur]
  return [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
  ]
}

/**
 * Utiliser plutôt la classe FractionEtendue et sa méthode texFSD (ou une autre)
 * EE : En fait, texFractionFromString est deprecated quand numérateur et dénominateur sont des nombres au profit souvent de new FractionEtendue(a,b).texFSD.
 * EE : Quand le numérateur et/ou le dénominateur contien(nen)t du LaTeX, alors texFractionFromString() est celle qui affiche le mieux la fraction que l'on veut.
 * Retourne le code LaTeX d'une fraction a/b (deprecated si a et b sont des nombres)
 * @param {string||number} a
 * @param {string||number} b
 * @author Rémi Angot
 * @returns {string}
 */
export function texFractionFromString(
  a: number | string,
  b: number | string,
): string {
  if (b !== 1 && b !== '1') {
    return `\\dfrac{${typeof a === 'number' ? texNombre(a) : a}}{${typeof b === 'number' ? texNombre(b) : b}}`
  } else {
    return `${typeof a === 'number' ? texNombre(a) : a}`
  }
}
