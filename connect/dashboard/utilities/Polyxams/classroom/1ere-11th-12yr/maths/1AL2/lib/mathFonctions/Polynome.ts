import Decimal from 'decimal.js'
import { abs, acos, equal, largerEq, max, polynomialRoot, round } from 'mathjs'
import FractionEtendue, { rationnalise } from '../../modules/FractionEtendue'
import { egal, randint } from '../../modules/outils'
import { generateCleaner } from '../interactif/cleaners'
import { choice } from '../outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../outils/ecritures'
import { texNombre } from '../outils/texNombre'

type NombreType = number | Decimal | FractionEtendue
type ComplexLike = {
  re: number
  toPolar: () => { r: number; phi: number }
}

function isNombreType(value: unknown): value is NombreType {
  return (
    typeof value === 'number' ||
    value instanceof Decimal ||
    value instanceof FractionEtendue
  )
}

function isFractionPair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

function isComplexLike(value: unknown): value is ComplexLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    're' in value &&
    typeof value.re === 'number' &&
    'toPolar' in value &&
    typeof value.toPolar === 'function'
  )
}

/**
 *
 * @param {Polynome} poly degré maximum = 3
 * @param {number} xG xG<xD
 * @param {number} xD
 * @return {{minLocal: number, maxLocal:number}}
 */
export function chercheMinMaxLocal({
  poly,
  xG,
  xD,
}: {
  poly: Polynome
  xG: number
  xD: number
}) {
  const derivee = poly.derivee()
  const yG = poly.fonction(xG)
  const yD = poly.fonction(xD)
  let minLocal, maxLocal
  if (derivee.deg === 2) {
    const a = Number(derivee.monomes[2])
    const b = Number(derivee.monomes[1])
    const c = Number(derivee.monomes[0])
    const delta = b ** 2 - 4 * a * c
    if (delta < 0) {
      // la dérivée ne s'annule pas donc la fonction est monotone du signe de a
      if (a > 0) {
        // la fonction est croissante don le max est atteint en x[i+1]
        maxLocal = yD
        minLocal = yG
      } else {
        maxLocal = yG
        minLocal = yD
      }
    } else if (delta === 0) {
      // la dérivée s'annule une seule fois mais il faut vérifier que c'est sur l'intervalle x[i] x[i+1]
      const racine = -b / 2 / a
      if (racine > xG && racine < xG) {
        // ça peut encore être un max ou un min !
        if (a > 0) {
          // c'est un minimum
          maxLocal = Math.max(yG, yD)
          minLocal = poly.fonction(racine)
        } else {
          // c'est un maximum
          maxLocal = poly.fonction(racine)
          minLocal = Math.min(yG, Number(yD))
        }
      } else {
        // la racine n'est pas dans cet intervalle, donc la dérivée est monotone ici
        maxLocal = Math.max(yG, Number(yD))
        minLocal = Math.min(yG, Number(yD))
      }
    } else {
      // delta >0 deux racines !
      const ptiDelta = Math.sqrt(delta)
      const r1 = a > 0 ? (-b - ptiDelta) / 2 / a : (-b + ptiDelta) / 2 / a
      const r2 = a > 0 ? (-b + ptiDelta) / 2 / a : (-b - ptiDelta) / 2 / a
      if (xG < r1 && r1 < xD) {
        // r1 est dans l'intervalle
        if (xG < r2 && r2 < xD) {
          // r2 aussi !
          if (a > 0) {
            // croissant puis decroissant puis croissant : le max est soit en r1 soit en x[i+1]
            maxLocal = Math.max(poly.fonction(r1), yD)
            minLocal = Math.min(yG, poly.fonction(r2))
          } else {
            // a<0 décroissant puis croissant puis décroissant
            minLocal = Math.min(poly.fonction(r1), yD)
            maxLocal = Math.max(yG, poly.fonction(r2))
          }
        } else {
          // r1 est dedans mais pas r2
          if (a > 0) {
            // on a un max en r1 et le min est soit en x[i] soit en x[i+1]
            maxLocal = poly.fonction(r1)
            minLocal = Math.min(yG, yD)
          } else {
            // minimum en r1, max en x[i] ou x[i+1]
            minLocal = poly.fonction(r1)
            maxLocal = Math.max(Number(yG), Number(yD))
          }
        }
      } else {
        // r1 n'est pas dans l'intervalle mais peut-être r2 y est
        if (xG < r2 && r2 < xD) {
          if (a > 0) {
            // on a le min en r2 et le max en x[i] ou en x[i+1]
            minLocal = poly.fonction(r2)
            maxLocal = Math.max(xG, yD)
          } else {
            // on a le max en r2 et le min en x[i] ou en x[i+1]
            maxLocal = poly.fonction(r2)
            minLocal = Math.min(xG, yD)
          }
        } else {
          // ni r1, ni r2 ne sont dans l'intervalle. La fonction est monotone
          if (a > 0) {
            if (r2 < xG || r1 > xD) {
              // strictement croissante
              maxLocal = yD
              minLocal = yG
            } else {
              // normalemennt r1<x[i] et r2>x[i+1] strictement décroissante
              maxLocal = yG
              minLocal = yD
            }
          } else {
            if (r2 < xG || r1 > xD) {
              // strictement décroissante
              maxLocal = yG
              minLocal = yD
            } else {
              // normalemennt r1<x[i] et r2>x[i+1] strictement croissante
              maxLocal = yD
              minLocal = yG
            }
          }
        }
      }
    }
  } else if (derivee.deg === 1) {
    // derivée affine, monotone croissante ou décroissante selon le signe de derivee[i].monomes[1]
    // Il y a un max ou un min si la dérivée s'annule dans l'intervalle
    const a = Number(derivee.monomes[1])
    if (a > 0) {
      if (Number(derivee.monomes[0]) + a * xG > 0) {
        // la dérivée s'annule à gauche de x[i], la fonction est croissante sur l'intervalle
        maxLocal = yD
        minLocal = yG
      } else if (Number(derivee.monomes[0]) + a * xD < 0) {
        // la dérivée s'annule à droite de x[i+1], la fonction est décroissante sur l'intervalle
        maxLocal = yG
        minLocal = yD
      } else {
        // la dérivée s'annule dans l'intervalle, il y a un extremum local
        // On est dans le cas d'une dérivée négative en xG et positive en xD, donc un minimum local
        maxLocal = Math.max(yG, yD)
        minLocal = poly.image(-Number(derivee.monomes[0]) / a)
      }
    } else {
      // a<0
      if (Number(derivee.monomes[0]) + a * xG < 0) {
        // la dérivée s'annule à gauche de x[i], la fonction est décroissante sur l'intervalle
        maxLocal = yG
        minLocal = yD
      } else if (Number(derivee.monomes[0]) + a * xD > 0) {
        // la dérivée s'annule à droite de x[i+1], la fonction est croissante sur l'intervalle
        maxLocal = yD
        minLocal = yG
      } else {
        // la dérivée s'annule dans l'intervalle, il y a un extremum local
        // On est dans le cas d'une dérivée positive en xG et négative en xD, donc un maximum local
        maxLocal = poly.image(-Number(derivee.monomes[0]) / a)
        minLocal = Math.min(yG, yD)
      }
    }
  } else {
    // constante !
    minLocal = yG
    maxLocal = yG
  }
  return { minLocal, maxLocal }
}

// un cleaner pour la méthode toMathExpr
const clean = generateCleaner(['virgules', 'fractions', 'espaces'])
// une fonction pour ajouter deux nombres dont on ne connait pas le type
const somme = function (a: unknown, b: unknown) {
  if (a instanceof Decimal) {
    if (b instanceof Decimal) return a.add(b)
    else if (b instanceof FractionEtendue) {
      return a.add(new Decimal(b.valeurDecimale))
    } else return a.add(new Decimal(String(b)))
  }
  if (a instanceof FractionEtendue) {
    if (b instanceof FractionEtendue) return a.sommeFraction(b).simplifie()
    else return a.sommeFraction(rationnalise(Number(b))).simplifie()
  }
  return Number(a) + Number(b)
}
// une fonction pour multiplier deux nombres dont on ne connait pas le type
const produit = function (a: unknown, b: unknown) {
  if (typeof a === 'number' && typeof b === 'number') return a * b
  if (a instanceof Decimal) {
    if (b instanceof Decimal) return a.mul(b)
    else if (b instanceof FractionEtendue) {
      return a.mul(new Decimal(b.valeurDecimale))
    } else return a.mul(new Decimal(String(b)))
  }
  if (a instanceof FractionEtendue) {
    if (b instanceof FractionEtendue) return a.produitFraction(b).simplifie()
    else return a.produitFraction(rationnalise(Number(b))).simplifie()
  }
  return Number(a) * Number(b)
}

const quotient = function (a: unknown, b: unknown) {
  if (egal(Number(b), 0)) {
    window.notify('quotient de Polynome.js a reçu un diviseur nul', {
      dividende: a,
      diviseur: b,
    })
  }
  if (typeof a === 'number' && typeof b === 'number') return a / b
  if (a instanceof Decimal) {
    if (b instanceof Decimal) return a.div(b)
    else if (b instanceof FractionEtendue) {
      return a.div(new Decimal(b.valeurDecimale))
    } else return a.div(new Decimal(String(b)))
  }
  if (a instanceof FractionEtendue) {
    if (b instanceof FractionEtendue) return a.diviseFraction(b).simplifie()
    else return a.diviseFraction(rationnalise(Number(b))).simplifie()
  }
}

export type CoeffType = NombreType | [number, boolean]
/**
 * Avertissement ! pour l'instant la classe ne gère pas les coefficients fractionnaires !
 * @param {boolean} useFraction laissé à false pour l'instant (les coefficients fractionnaires ne sont pas encore utilisé et
 * @param {boolean} useDecimal useFraction a prévalence sur useDecimal pour avoir des décimaux, il faut que useFraction soit false (valeur par défaut donc c'est bon)
 * le code n'est pas dépourvu de problème si on utilise des coefficients fractionnaires !
 * rendant l'expression mathématique inutilisable avec Algebrite et aussi dans la définition de la fonction x=>f(x)
 * @param {boolean} rand Donner true si on veut un polynôme aléatoire
 * @param {number} deg à fournir >=0 en plus de rand === true pour fixer le degré
 * @param coeffs liste de coefficients par ordre de degré croissant OU liste de couples [valeurMax, relatif?]
 * @author Jean-Léon Henry, Jean-Claude Lhote
 * @example Polynome({ coeffs:[0, 2, 3] }) donne 3x²+2x
 * @example Polynome({ rand:true, deg:3 }) donne un ax³+bx²+cx+d à coefficients entiers dans [-10;10]\{0}
 * @example Polynome({ rand:true, coeffs:[[10, true], 0, [5, false]] }) donne un ax²+b avec a∈[1;5] et b∈[-10;10]\{0}
 */
export class Polynome {
  monomes: (number | FractionEtendue | Decimal)[]
  fonction: (x: number) => number
  deg: number
  useFraction: boolean
  useDecimal: boolean
  letter: string

  constructor({
    rand = false,
    deg = -1,
    coeffs,
    useFraction = false,
    useDecimal = false,
    letter = 'x',
  }: {
    rand?: boolean
    deg?: number
    coeffs?: CoeffType[]
    useFraction?: boolean
    useDecimal?: boolean
    letter?: string
  }) {
    this.letter = letter
    if (rand) {
      if (largerEq(deg, 0)) {
        // on construit coeffs indépendamment de la valeur fournie
        coeffs = new Array(deg + 1)
        coeffs.fill([10, true])
      }
      // Création de this.monomes
      this.monomes = coeffs!.map(function (el: unknown) {
        if (typeof el === 'number') {
          return el
        } else if (Array.isArray(el)) {
          if (el[0] === 0) return 0
          if (useFraction) {
            const den = choice([2, 4, 5])
            const rawFraction = new Decimal(randint(1, den * Number(el[0])))
              .div(den)
              .toFraction(100)
              .map(Number)
            if (!isFractionPair(rawFraction)) {
              throw new Error(
                'Decimal.toFraction() did not return a [num, den] pair',
              )
            }
            const [num, denom] = rawFraction
            const aFrac = new FractionEtendue(num, denom)
            return el[1] ? aFrac.multiplieEntier(choice([-1, 1])) : aFrac
          } else if (useDecimal) {
            const dec = new Decimal(randint(1, 10 * Number(el[0]))).div(10)
            return el[1] ? dec.mul(choice([-1, 1])) : dec
          } else {
            return el[1]
              ? choice([-1, 1]) * randint(1, Number(el[0]))
              : randint(1, Number(el[0]))
          }
        } else if (el instanceof FractionEtendue) {
          return el
        } else if (el instanceof Decimal) {
          return el
        } else {
          window.notify(
            "Dans Polynome, l'un des coefficient n'est pas d'un type attendu.",
            { coeff: el },
          )
          return NaN
        }
      })
    } else {
      // les coeffs sont fourni
      this.monomes = coeffs!.map(function (el) {
        if (el instanceof FractionEtendue) {
          if (useFraction) {
            return el
          } else {
            return new Decimal(`${el.num}/${el.den}`)
          }
        } else if (el instanceof Decimal) {
          if (useDecimal) {
            return el
          } else {
            return el.round()
          }
        }
        return Number(el)
      })
    }
    this.useFraction =
      useFraction ??
      this.monomes.filter((el) => el instanceof FractionEtendue).length > 0
    this.useDecimal =
      useDecimal ??
      (this.monomes.filter((el) => el instanceof Decimal).length > 0 &&
        this.monomes.filter((el) => el instanceof FractionEtendue).length === 0)

    this.deg = this.monomes.length - 1
    /**
     * la fonction à utiliser pour tracer la courbe par exemple ou calculer des valeurs comme dans pol.image()
     * const f = pol.fonction est une fonction utilisable dans courbe()
     * @returns {function(number): number}
     */
    const monomes = this.monomes
    this.fonction = function (x: number) {
      let val = 0
      for (let i = 0; i < monomes.length; i++) {
        const m = monomes[i]
        if (m instanceof FractionEtendue) {
          val = val + m.valeurDecimale * x ** i
        } else if (m instanceof Decimal) {
          val = val + m.toNumber() * x ** i
        } else {
          val = val + Number(m) * x ** i
        }
      }
      return val
    }
  }

  isMon() {
    return this.monomes.filter((el) => el !== 0).length === 1
  }

  isEqual(p: number | Polynome) {
    if (typeof p === 'number') {
      if (this.monomes[0] !== p) return false
      for (let i = 1; i <= this.deg; i++) {
        if (this.monomes[i] !== 0) {
          return false
        }
      }
      return true
    }
    if (p instanceof Polynome) {
      const degP = p.deg
      if (degP === this.deg) {
        return this.monomes.filter((el, i) => el !== p.monomes[i]).length === 0
      }
      const degMin = Math.min(this.deg, p.deg)
      for (let i = 0; i <= degMin; i++) {
        if (!egal(Number(p.monomes[i]), Number(this.monomes[i]), 1e-15)) {
          return false
        }
      }
      for (let i = degMin + 1; i <= Math.max(p.deg, this.deg); i++) {
        if (i <= this.deg) {
          if (this.monomes[i] !== 0) return false
        }
        if (i <= p.deg) {
          if (p.monomes[i] !== 0) return false
        }
      }
      return true
    }
    window.notify(
      `Polynome.isEqual a reçu comme argument autre chose qu'un number ou un polynôme : ${p}`,
      { p },
    )
    return false
  }

  /**
   * @param {boolean} alg si true alors le coefficient dominant est doté de son signe +/-
   * @returns {string} expression mathématique compatible avec Algebrite
   */
  toMathExpr(alg = false) {
    let res = ''
    let maj = ''
    for (const [i, c] of this.monomes.entries()) {
      switch (i) {
        case this.deg: {
          let coeffD
          if (c instanceof FractionEtendue) {
            coeffD = alg
              ? `${c.valeurDecimale < 0 ? (c.valeurAbsolue().valeurDecimale === 1 ? '-' : '-{' + String(c.n) + '/' + String(c.d) + '}') : c.valeurDecimale === 1 ? '+' : '+{' + String(c.n) + '/' + String(c.d)}+'}'`
              : this.deg === 0
                ? c.ecritureAlgebrique
                : rienSi1(c)
          } else {
            coeffD = alg
              ? ecritureAlgebriqueSauf1(c)
              : this.deg === 0
                ? ecritureAlgebrique(c)
                : rienSi1(c)
          }
          switch (this.deg) {
            case 1:
              maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}${this.letter}`
              break
            case 0:
              maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}`
              break
            default:
              maj = egal(Number(c), 0, 1e-15)
                ? ''
                : `${coeffD}${this.letter}^${i}`
          }
          break
        }
        case 0:
          maj = egal(Number(c), 0, 1e-15)
            ? ''
            : `${c instanceof FractionEtendue ? (c.valeurDecimale < 0 ? '-' : '+') + String(c.n) + '/' + String(c.d) : ecritureAlgebrique(c)}`
          break
        case 1:
          maj = egal(Number(c), 0, 1e-15)
            ? ''
            : c instanceof FractionEtendue
              ? `${
                  c.valeurDecimale < 0
                    ? c.valeurAbsolue().valeurDecimale === 1
                      ? '-'
                      : '-{' + String(c.n) + '/' + String(c.d)
                    : c.valeurDecimale === 1
                      ? '+'
                      : '+{' + String(c.n) + '/' + String(c.d)
                }` + `}${this.letter}`
              : `${ecritureAlgebriqueSauf1(c)}${this.letter}`
          break
        default:
          maj = egal(Number(c), 0, 1e-15)
            ? ''
            : c instanceof FractionEtendue
              ? `${
                  c.valeurDecimale < 0
                    ? c.valeurAbsolue().valeurDecimale === 1
                      ? '-'
                      : '-{' + String(c.n) + '/' + String(c.d)
                    : c.valeurDecimale === 1
                      ? '+'
                      : '+{' + String(c.n) + '/' + String(c.d)
                }` + `}${this.letter}^${i}`
              : `${ecritureAlgebriqueSauf1(c)}${this.letter}^${i}`
          break
      }
      maj = clean(maj)
      res = maj + res
    }
    return res
  }

  /**
   * @param {boolean} alg si true alors le coefficient dominant est doté de son signe +/-
   * @returns {string} expression mathématique
   */
  toLatex(alg = false) {
    let res = ''
    let maj = ''
    for (const [i, c] of this.monomes.entries()) {
      if (c instanceof FractionEtendue) {
        if (c.valeurDecimale === 0) continue
        switch (i) {
          case this.deg: {
            const coeffD = alg
              ? `${c.valeurDecimale < 0 ? (c.valeurAbsolue().valeurDecimale === 1 ? '-' : c.texFSD) : c.valeurDecimale === 1 ? '+' : c.ecritureAlgebrique}`
              : this.deg === 0
                ? c.texFSD
                : rienSi1(c)
            if (this.deg === 0) return c.texFSD
            switch (this.deg) {
              case 1:
                maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}${this.letter}`
                break
              case 0:
                maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}`
                break
              default:
                maj = egal(Number(c), 0, 1e-15)
                  ? ''
                  : `${coeffD}${this.letter}^{${i}}`
            }
            break
          }
          case 0:
            maj = egal(Number(c), 0, 1e-15) ? '' : c.ecritureAlgebrique
            break
          case 1:
            maj = egal(Number(c), 0, 1e-15)
              ? ''
              : `${
                  c.valeurDecimale < 0
                    ? c.valeurAbsolue().valeurDecimale === 1
                      ? '-'
                      : c.texFSD
                    : c.valeurDecimale === 1
                      ? '+'
                      : c.ecritureAlgebrique
                }${this.letter}`
            break
          default:
            maj = egal(Number(c), 0, 1e-15)
              ? ''
              : `${
                  c.valeurDecimale < 0
                    ? c.valeurAbsolue().valeurDecimale === 1
                      ? '-'
                      : c.texFSD
                    : c.valeurDecimale === 1
                      ? '+'
                      : c.ecritureAlgebrique
                }${this.letter}^{${i}}`
            break
        }
        res = maj + res
      } else {
        switch (i) {
          case this.deg: {
            const coeffD = alg
              ? ecritureAlgebriqueSauf1(c)
              : this.deg === 0
                ? c
                : rienSi1(Number(c))
            if (this.deg === 0) return texNombre(c, 2)
            switch (this.deg) {
              case 1:
                maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}${this.letter}`
                break
              case 0:
                maj = egal(Number(c), 0, 1e-15) ? '' : `${coeffD}`
                break
              default:
                maj = egal(Number(c), 0, 1e-15)
                  ? ''
                  : `${coeffD}${this.letter}^{${i}}`
            }
            break
          }
          case 0:
            maj = egal(Number(c), 0, 1e-15) ? '' : ecritureAlgebrique(c)
            break
          case 1:
            maj = egal(Number(c), 0, 1e-15)
              ? ''
              : `${ecritureAlgebriqueSauf1(c)}${this.letter}`
            break
          default:
            maj = egal(Number(c), 0, 1e-15)
              ? ''
              : `${ecritureAlgebriqueSauf1(c)}${this.letter}^{${i}}`
            break
        }
        res = maj + res
      }
    }
    return res
  }

  /**
   * Polynome type conversion to String
   * @returns le résultat de toMathExpr()
   */
  toString() {
    return this.toLatex()
  }

  /**
   * Ajoute un Polynome ou une constante
   * @param {Polynome|number|Fraction} p
   * @example p.add(3) pour ajouter la constante 3 à p
   * @returns {Polynome} this+p
   */
  add(p: NombreType | Polynome) {
    if (typeof p === 'number') {
      const useFrac =
        this.monomes.filter((el) => el instanceof FractionEtendue).length > 0
      const coeffs = [...this.monomes]
      coeffs[0] = somme(this.monomes[0], p)
      return new Polynome({ coeffs, useFraction: useFrac })
    } else if (p instanceof FractionEtendue) {
      const coeffs = [...this.monomes]
      coeffs[0] = somme(this.monomes[0], p)
      return new Polynome({ coeffs, useFraction: true })
    } else if (p instanceof Decimal) {
      const useFrac =
        this.monomes.filter((el) => el instanceof FractionEtendue).length > 0
      const coeffs = [...this.monomes]
      coeffs[0] = somme(p, this.monomes[0])
      return new Polynome({ coeffs, useFraction: useFrac })
    } else if (p instanceof Polynome) {
      const useFrac =
        p.monomes.filter((el) => el instanceof FractionEtendue).length > 0 ||
        this.monomes.filter((el) => el instanceof FractionEtendue).length > 0
      const degSomme = max(this.deg, p.deg)
      const pInf = equal(p.deg, degSomme) ? this : p
      const pSup = equal(p.deg, degSomme) ? p : this
      const coeffSomme = pSup.monomes.map(function (el, index) {
        return index <= pInf.deg ? somme(el, pInf.monomes[index]) : el
      })
      return new Polynome({ coeffs: coeffSomme, useFraction: useFrac })
    } else {
      window.notify(
        "Polynome.add(arg) : l'argument n'est ni un nombre, ni un polynome",
        { p },
      )
      return this
    }
  }

  /**
   *
   * @param {Polynome|number|Fraction} q Polynome, nombre ou fraction
   * @example poly = poly.multiply(fraction(1,3)) divise tous les coefficients de poly par 3.
   * @returns q fois this
   */
  multiply(q: NombreType | Polynome): Polynome {
    let coeffs: NombreType[]
    const useFrac =
      q instanceof Polynome
        ? q.monomes.filter((el) => el instanceof FractionEtendue).length > 0 ||
          this.monomes.filter((el) => el instanceof FractionEtendue).length > 0
        : q instanceof FractionEtendue

    if (typeof q === 'number' || q instanceof FractionEtendue) {
      coeffs = this.monomes
        .map(function (el) {
          return produit(el, q)
        })
        .map((el) => el ?? 0)
    } else if (q instanceof Polynome) {
      coeffs = new Array(this.deg + q.deg + 1)
      coeffs.fill(0)
      for (let i = 0; i <= this.deg; i++) {
        for (let j = 0; j <= q.deg; j++) {
          coeffs[i + j] = somme(
            coeffs[i + j],
            produit(this.monomes[i], q.monomes[j]),
          )
        }
      }
    } else {
      window.notify(
        "Polynome.multiply(arg) : l'argument n'est ni un nombre, ni un polynome",
        { q },
      )
      return this
    }
    return new Polynome({ coeffs, useFraction: useFrac })
  }

  /**
   * Retourne la dérivée
   * @returns {Polynome} dérivée de this
   */
  derivee() {
    const coeffDerivee = this.monomes
      .map(function (el, i) {
        return produit(el, i)
      })
      .map((el) => el ?? 0)
    coeffDerivee.shift()
    for (let i = coeffDerivee.length - 1; i > 0; i--) {
      if (coeffDerivee[i] === 0) {
        coeffDerivee.pop()
        continue
      }
      break
    }
    if (coeffDerivee.length === 0) return new Polynome({ deg: 0, coeffs: [0] })
    return new Polynome({
      coeffs: coeffDerivee,
      useFraction: this.useFraction,
      useDecimal: this.useDecimal,
      letter: this.letter,
    })
  }

  detailleCalculDerivee() {
    let formeDerivee = ''
    for (let index = this.monomes.length - 1; index > 0; index--) {
      const el = this.monomes[index]
      if (!egal(Number(el), 0)) {
        formeDerivee +=
          formeDerivee === ''
            ? `${String(index)}\\times ${el instanceof FractionEtendue ? el.texParentheses : ecritureParentheseSiNegatif(el)}${index > 2 ? `${this.letter}^{${index - 1}}` : index === 2 ? this.letter : ''}`
            : `+${String(index)}\\times ${el instanceof FractionEtendue ? el.texParentheses : ecritureParentheseSiNegatif(el)}${index > 2 ? `${this.letter}^{${index - 1}}` : index === 2 ? this.letter : ''}`
      }
    }
    return formeDerivee
  }

  /**
   * Retourne la primitive de constante 0 de this
   * @returns {Polynome}
   */
  primitive0() {
    let coeffPrimitive = this.monomes.map((el, i) => {
      const value = quotient(el, i + 1)
      if (!isNombreType(value)) {
        throw new Error('Unexpected coefficient type while building primitive')
      }
      return value
    })
    coeffPrimitive = [0, ...coeffPrimitive]
    const useFrac =
      coeffPrimitive.filter((el) => el instanceof FractionEtendue).length > 0
    const useDecim =
      coeffPrimitive.filter((el) => el instanceof Decimal).length > 0 &&
      !useFrac
    return new Polynome({
      coeffs: coeffPrimitive,
      useFraction: useFrac,
      useDecimal: useDecim,
    })
  }

  racines() {
    const antecedents: number[] = []
    if (this.monomes.slice(1).filter((el) => el !== 0).length === 0) {
      return null
    }
    const coeffs = this.monomes.map((el) => Number(el)) as [
      number,
      number,
      number,
      number,
    ]
    const liste = polynomialRoot(...coeffs)
    if (!Array.isArray(liste)) {
      throw new Error('polynomialRoot() did not return an array')
    }
    for (const valeur of liste) {
      let arr
      if (typeof valeur === 'number') {
        arr = round(valeur, 3)
      } else if (isComplexLike(valeur)) {
        // complexe !
        const module = valeur.toPolar().r
        if (module < 1e-5) {
          // module trop petit pour être complexe, c'est 0 !
          arr = 0
        } else {
          const argument = valeur.toPolar().phi
          if (
            abs(argument) < 0.01 ||
            abs(abs(argument) - Number(acos(-1))) < 0.001
          ) {
            // si l'argument est proche de 0 ou de Pi ou de -Pi
            arr = round(valeur.re, 3) // on prend la partie réelle
          } else {
            arr = null // c'est une vraie racine complexe, du coup, on prend null
          }
        }
      } else {
        throw new Error('polynomialRoot() returned an unexpected root value')
      }
      if (arr !== null) {
        if (!antecedents.includes(arr)) {
          antecedents.push(arr)
        }
      }
    }
    return antecedents
  }

  /**
   * Appelle toMathExpr
   * @param {Array} coeffs coefficients du polynôme par ordre de degré croissant
   * @param {boolean} alg si true alors le coefficient dominant est doté de son signe +/-
   * @returns {string} expression du polynome
   */
  static print(coeffs: number[], alg = false) {
    const p = new Polynome({ coeffs })
    return p.toLatex(alg)
  }

  /**
   * Pour calculer l'image d'un nombre
   * @param x
   * @returns {math.Fraction | number | int} // à mon avis ça ne retourne que des number...
   */
  image(x: number) {
    // const fonction = x => this.monomes.reduce((val, current, currentIndex) => val + current * x ** currentIndex, 0)
    return this.fonction(x)
  }

  /**
   * Construit un polynôme à partir de ses racines
   * @param roots Liste des racines du polynôme
   * @param useFraction Utiliser des fractions pour les coefficients
   * @param useDecimal Utiliser des décimaux pour les coefficients
   * @returns {Polynome} Polynôme dont les racines sont celles données en paramètre
   * @example Polynome.fromRoots([1, 2, 3]) donne (x-1)(x-2)(x-3) = x³-6x²+11x-6
   */
  static fromRoots(
    roots: NombreType[],
    useFraction = false,
    useDecimal = false,
  ): Polynome {
    if (roots.length === 0) {
      return new Polynome({ coeffs: [1] })
    }

    // Commencer avec le polynôme constant 1
    let result = new Polynome({ coeffs: [1], useFraction, useDecimal })

    // Multiplier par chaque facteur (x - racine)
    for (const root of roots) {
      // Créer le polynôme (x - root) = [-root, 1]
      const factor = new Polynome({
        coeffs: [typeof root === 'number' ? -root : produit(root, -1), 1],
        useFraction,
        useDecimal,
      })
      result = result.multiply(factor)
    }

    return result
  }
}
