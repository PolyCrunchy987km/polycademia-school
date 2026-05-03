import { ecritureParentheseSiNegatif } from '../lib/outils/ecritures'
import { ppcm } from '../lib/outils/primalite'
import FractionEtendue, { rationnalise } from './FractionEtendue'
import ListeFraction from './ListeFraction'
import { nombreEnLettres } from './nombreEnLettres'

/**
 * Des fonctions pour manipuler des objets Fraction ou ListeFraction
 * @module
 */

/**
 * Retourne une liste de fractions irréducibles
 * @return {FractionEtendue[]}
 */
export function obtenirListeFractionsIrreductibles() {
  // sous forme de fractions
  return [
    new FractionEtendue(1, 2),
    new FractionEtendue(1, 3),
    new FractionEtendue(2, 3),
    new FractionEtendue(1, 4),
    new FractionEtendue(3, 4),
    new FractionEtendue(1, 5),
    new FractionEtendue(2, 5),
    new FractionEtendue(3, 5),
    new FractionEtendue(4, 5),
    new FractionEtendue(1, 6),
    new FractionEtendue(5, 6),
    new FractionEtendue(1, 7),
    new FractionEtendue(2, 7),
    new FractionEtendue(3, 7),
    new FractionEtendue(4, 7),
    new FractionEtendue(5, 7),
    new FractionEtendue(6, 7),
    new FractionEtendue(1, 8),
    new FractionEtendue(3, 8),
    new FractionEtendue(5, 8),
    new FractionEtendue(7, 8),
    new FractionEtendue(1, 9),
    new FractionEtendue(2, 9),
    new FractionEtendue(4, 9),
    new FractionEtendue(5, 9),
    new FractionEtendue(7, 9),
    new FractionEtendue(8, 9),
    new FractionEtendue(1, 10),
    new FractionEtendue(3, 10),
    new FractionEtendue(7, 10),
    new FractionEtendue(9, 10),
  ]
}

/**
 * Retourne une liste de fractions irréducibles simples (1/2, 1/3, 2/3, 1/5 … 4/5, 1/7 … 6/7)
 * @return {FractionEtendue[]}
 */
export function obtenirListeFractionsIrreductiblesFaciles() {
  // sous forme de fractions
  return [
    new FractionEtendue(1, 2),
    new FractionEtendue(1, 3),
    new FractionEtendue(2, 3),
    new FractionEtendue(1, 5),
    new FractionEtendue(2, 5),
    new FractionEtendue(3, 5),
    new FractionEtendue(4, 5),
    new FractionEtendue(1, 7),
    new FractionEtendue(2, 7),
    new FractionEtendue(3, 7),
    new FractionEtendue(4, 7),
    new FractionEtendue(5, 7),
    new FractionEtendue(6, 7),
  ]
}

export function listeFractions(...fractions: FractionEtendue[]): ListeFraction {
  return new ListeFraction(...fractions)
}

/**
 * Construit et Retourne un objet FractionEtendue(a, b)
 * @param {number} a
 * @param {number|undefined} b
 * @return {FractionEtendue}
 */
export function fraction(a: number, b?: number | undefined): FractionEtendue {
  if (b === undefined) {
    // pas d'argument b
    if (a === undefined) {
      window.notify("fraction de fractions : aucun argument n'est défini ", {
        a,
        b,
      })
      throw new Error("fraction de fractions : aucun argument n'est défini ")
    } else {
      if (typeof a === 'number') {
        const frac = rationnalise(a)
        return frac
      } else if (!isNaN(a)) {
        const frac = rationnalise(Number(a))
        return frac
      }
      window.notify(
        "fraction de fractions : l'argument est de type inconvenant ",
        { a },
      )
      throw new Error(
        "fraction de fractions : l'argument est de type inconvenant ",
      )
    }
  } else {
    // on a un argument b
    if (a === undefined) {
      window.notify(
        "fraction de fractions : le premier argument n'est pas défini ",
        { a, b },
      )
      throw new Error(
        "fraction de fractions : le premier argument n'est pas défini ",
      )
    } else {
      if (typeof a === 'number' && typeof b === 'number') {
        return new FractionEtendue(a, b)
      } else if (!isNaN(b) && !isNaN(a)) {
        return new FractionEtendue(Number(a), Number(b))
      }
      window.notify(
        'fraction de fractions : les arguments sont de type inconvenant ',
        { a, b },
      )
      throw new Error(
        'fraction de fractions : les arguments sont de type inconvenant ',
      )
    }
  }
}

export function denominateurEnLettre(den: number, pluriel: boolean): string {
  let denEnLettre
  switch (den) {
    case 2:
      return pluriel ? 'demis' : 'demi'
    case 3:
      return 'tiers'
    case 4:
      return pluriel ? 'quarts' : 'quart'
    case 9:
      return pluriel ? 'neuvièmes' : 'neuvième'
    default:
      denEnLettre = nombreEnLettres(den)
      if (den === 5) return pluriel ? 'cinquièmes' : 'cinquième'
      if (!denEnLettre.endsWith('e')) {
        return `${denEnLettre}ième${pluriel ? 's' : ''}`
      }
      return `${denEnLettre.substring(0, denEnLettre.length - 1)}ième${pluriel ? 's' : ''}`
  }
}

export function sommeDeDeuxFractions(
  f1: FractionEtendue,
  f2: FractionEtendue,
  simplifier: boolean,
): string[] {
  const etapes: string[] = []
  const somme = f1.sommeFraction(f2)
  etapes.push(`${f1.texFraction}+${f2.texFraction}`)
  if (f1.den === f2.den) {
    etapes.push(`\\dfrac{${f1.num}+${f2.num}}{${f1.den}}`)
    etapes.push(
      somme.estEntiere ? `${somme.texFractionSimplifiee}` : somme.texFraction,
    )
    if (somme.estEntiere) {
      etapes.push(`${somme.texFractionSimplifiee}`)
      return etapes
    }
    if (simplifier && !somme.estIrreductible) {
      etapes.push(`${somme.texFractionSimplifiee}`)
      return etapes
    } else {
      return etapes
    }
  } else {
    const denominateurCommun = ppcm(f1.den, f2.den)
    const facteur1 = denominateurCommun / f1.den
    const facteur2 = denominateurCommun / f2.den
    const numerateurF1 = f1.num * facteur1
    const numerateurF2 = f2.num * facteur2
    etapes.push(
      `${facteur1 !== 1 ? `\\dfrac{${f1.num}\\times ${facteur1}}{${f1.den}\\times ${facteur1}}` : `\\dfrac{${f1.num}}{${f1.den}}`}+${facteur2 !== 1 ? `\\dfrac{${f2.num}\\times ${facteur2}}{${f2.den}\\times ${facteur2}}` : `\\dfrac{${f2.num}}{${f2.den}}`}`,
    )
    etapes.push(
      `\\dfrac{${numerateurF1}}{${denominateurCommun}}+\\dfrac{${numerateurF2}}{${denominateurCommun}}`,
    )
    etapes.push(
      `\\dfrac{${numerateurF1}+${numerateurF2}}{${denominateurCommun}}`,
    )
    etapes.push(
      `\\dfrac{${numerateurF1 + numerateurF2}}{${denominateurCommun}}`,
    )
    if (simplifier && !somme.estIrreductible) {
      etapes.push(`${somme.texFractionSimplifiee}`)
      return etapes
    } else {
      return etapes
    }
  }
}
export function differenceDeDeuxFractions(
  f1: FractionEtendue,
  f2: FractionEtendue,
  simplifier: boolean,
): string[] {
  const etapes: string[] = []
  const difference = f1.differenceFraction(f2)
  etapes.push(`${f1.texFraction}-${f2.texFraction}`)
  if (f1.den === f2.den) {
    etapes.push(`\\dfrac{${f1.num}-${f2.num}}{${f1.den}}`)
    etapes.push(
      difference.estEntiere
        ? `${difference.texFractionSimplifiee}`
        : difference.texFraction,
    )
    if (simplifier && !difference.estIrreductible) {
      etapes.push(`${difference.texFractionSimplifiee}`)
      return etapes
    } else {
      return etapes
    }
  } else {
    const denominateurCommun = ppcm(f1.den, f2.den)
    const facteur1 = denominateurCommun / f1.den
    const facteur2 = denominateurCommun / f2.den
    const numerateurF1 = f1.num * facteur1
    const numerateurF2 = f2.num * facteur2
    etapes.push(
      `${facteur1 !== 1 ? `\\dfrac{${f1.num}\\times ${facteur1}}{${f1.den}\\times ${facteur1}}` : `\\dfrac{${f1.num}}{${f1.den}}`}-${facteur2 !== 1 ? `\\dfrac{${f2.num}\\times ${facteur2}}{${f2.den}\\times ${facteur2}}` : `\\dfrac{${f2.num}}{${f2.den}}`}`,
    )
    etapes.push(
      `\\dfrac{${numerateurF1}}{${denominateurCommun}}-\\dfrac{${numerateurF2}}{${denominateurCommun}}`,
    )
    etapes.push(
      `\\dfrac{${numerateurF1}-${numerateurF2}}{${denominateurCommun}}`,
    )
    difference.estEntiere
      ? etapes.push(`${difference.texFractionSimplifiee}`)
      : etapes.push(difference.texFraction)
    if (simplifier && !difference.estIrreductible && difference) {
      etapes.push(`${difference.texFractionSimplifiee}`)
      return etapes
    } else {
      return etapes
    }
  }
}
export function produitDeDeuxFractions(
  f1: FractionEtendue,
  f2: FractionEtendue,
  simplifier: boolean,
): string[] {
  const etapes: string[] = []
  const produit = f1.produitFraction(f2)

  etapes.push(`${f1.texFraction}\\times ${f2.texFraction}`)
  if (f1.num === 0 || f2.num === 0) {
    etapes.push(`0`)
    return etapes
  }
  if (f1.num === f1.den) {
    etapes.push(`${f2.texFraction}`)
  } else if (f2.num === f2.den) {
    etapes.push(`${f1.texFraction}`)
  } else {
    if (f1.estEntiere || f2.estEntiere) {
      etapes.push(`\\dfrac{${f1.num}\\times ${f2.num}}{${f1.den * f2.den}}`)
    } else {
      etapes.push(
        `\\dfrac{${f1.num}\\times ${ecritureParentheseSiNegatif(f2.num)}}{${f1.den}\\times ${ecritureParentheseSiNegatif(f2.den)}}`,
      )
    }
    etapes.push(produit.texFraction)
  }
  if (simplifier && !produit.estIrreductible) {
    etapes.push(`${produit.simplifie().texFraction}`)
    return etapes
  } else {
    return etapes
  }
}
export function quotientDeDeuxFractions(
  f1: FractionEtendue,
  f2: FractionEtendue,
  simplifier: boolean,
): string[] {
  const etapes: string[] = []
  if (f2.isEqual(1)) {
    etapes.push(`${f1.texFraction}\\div 1`)
    etapes.push(`${f1.texFraction}`)
    return etapes
  }
  if (f2.isEqual(-1)) {
    etapes.push(`${f1.texFraction}\\div (-1)`)
    etapes.push(`${f1.produitFraction(-1).texFraction}`)
    return etapes
  }
  const quotient = f1.diviseFraction(f2)
  etapes.push(`${f1.texFraction}\\div ${f2.texFraction}`)

  etapes.push(`${f1.texFraction}\\times ${f2.inverse().texFraction}`)
  if (!f2.inverse().estEntiere) {
    etapes.push(
      `\\dfrac{${f1.num}\\times ${ecritureParentheseSiNegatif(f2.den)}}{${f1.den}\\times ${ecritureParentheseSiNegatif(f2.num)}}`,
    )
  }

  etapes.push(quotient.texFraction)
  if (simplifier && !quotient.estIrreductible) {
    etapes.push(`${quotient.simplifie().texFraction}`)
    return etapes
  } else {
    return etapes
  }
}
