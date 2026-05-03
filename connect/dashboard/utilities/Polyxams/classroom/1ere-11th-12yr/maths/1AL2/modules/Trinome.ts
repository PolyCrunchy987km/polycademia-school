import { extraireRacineCarree } from '../lib/outils/calculs'
import FractionEtendue from './FractionEtendue'

type numberOrFraction = number | FractionEtendue

/**
 * Gère les polynômes du second degré
 *  - Définition depuis la forme développée, canonique ou factorisée
 *  - Calcul du discriminant, des racines, des coordonnées du sommet
 *  - Compatible avec la classe FractionEtendue pour la gestion du calcul exact avec les rationnels
 *  - this.x1 est toujours la plus petite des deux racines et this.x2 la plus grande indépendemment des valeurs x1 et x2 passées à defFormeFactorisee()
 *  - this.texX1, this.texCalculRacine1 sont relatifs à la plus petite des deux racines, this.texX2 et this.texCalculRacine2 à la plus grande.
 * @author Rémi Angot
 */
export default class Trinome {
  a: FractionEtendue
  b: FractionEtendue
  c: FractionEtendue
  _discriminant: FractionEtendue | undefined // J'ai viré false le 06/02/2025 : il n'y a aucun cas où _discriminant serait false (JCL)
  /** Définit un trinôme de la forme ax^2 + bx + c */
  constructor(a: numberOrFraction, b: numberOrFraction, c: numberOrFraction) {
    if (typeof a === 'number') this.a = new FractionEtendue(a, 1)
    else this.a = a
    if (typeof b === 'number') this.b = new FractionEtendue(b, 1)
    else this.b = b
    if (typeof c === 'number') this.c = new FractionEtendue(c, 1)
    else this.c = c
    this._discriminant = undefined
  }

  /** Modifie le polynome pour qu'il soit égal à a(x-x1)(x-x2) */
  defFormeFactorisee(
    a: numberOrFraction,
    x1: numberOrFraction,
    x2: numberOrFraction,
  ) {
    if (a instanceof FractionEtendue === false) a = new FractionEtendue(a, 1)
    if (x1 instanceof FractionEtendue === false) x1 = new FractionEtendue(x1, 1)
    if (x2 instanceof FractionEtendue === false) x2 = new FractionEtendue(x2, 1)
    this.a = a
    this.b = x1.oppose().sommeFraction(x2.oppose()).produitFraction(a)
    this.c = x1.produitFraction(x2).produitFraction(a)
  }

  /** Modifie le polynome pour qu'il soit égal à k(ax+b)(cx+d) */
  defFormeFactorisee2(
    k: numberOrFraction,
    a: numberOrFraction,
    b: numberOrFraction,
    c: numberOrFraction,
    d: numberOrFraction,
  ) {
    if (k instanceof FractionEtendue === false) k = new FractionEtendue(k, 1)
    if (a instanceof FractionEtendue === false) a = new FractionEtendue(a, 1)
    if (b instanceof FractionEtendue === false) b = new FractionEtendue(b, 1)
    if (c instanceof FractionEtendue === false) c = new FractionEtendue(c, 1)
    if (d instanceof FractionEtendue === false) d = new FractionEtendue(d, 1)
    this.a = k.produitFraction(a).produitFraction(c)
    this.b = k
      .produitFraction(a)
      .produitFraction(d)
      .sommeFraction(k.produitFraction(b).produitFraction(c))
    this.c = k.produitFraction(b).produitFraction(d)
  }

  /** Modifie le polynome pour qu'il soit égal à a(x - alpha)^2 + beta */
  defFormeCanonique(
    a: numberOrFraction,
    alpha: numberOrFraction,
    beta: numberOrFraction,
  ) {
    if (a instanceof FractionEtendue === false) a = new FractionEtendue(a, 1)
    if (alpha instanceof FractionEtendue === false)
      alpha = new FractionEtendue(alpha, 1)
    if (beta instanceof FractionEtendue === false)
      beta = new FractionEtendue(beta, 1)
    this.a = a
    this.b = a.produitFraction(alpha).multiplieEntier(-2)
    this.c = a.produitFraction(alpha).produitFraction(alpha).sommeFraction(beta)
  }

  get derivee() {
    return new Trinome(0, this.a.produitFraction(2), this.b)
  }

  /** Renvoie la somme de ce trinome et d'un autre trinome */
  add(trinome: Trinome) {
    return new Trinome(
      this.a.sommeFraction(trinome.a),
      this.b.sommeFraction(trinome.b),
      this.c.sommeFraction(trinome.c),
    )
  }

  /** Renvoie ce trinome moins celui passé en argument */
  sub(trinome: Trinome) {
    return new Trinome(
      this.a.differenceFraction(trinome.a),
      this.b.differenceFraction(trinome.b),
      this.c.differenceFraction(trinome.c),
    )
  }

  /** Renvoie ce trinome multiplié par un scalaire */
  mul(k: number | FractionEtendue) {
    return new Trinome(
      this.a.produitFraction(k),
      this.b.produitFraction(k),
      this.c.produitFraction(k),
    )
  }

  /** Renvoie true si les deux trinomes sont identiques  */
  isEqual(trinome: Trinome) {
    return (
      this.a.isEqual(trinome.a) &&
      this.b.isEqual(trinome.b) &&
      this.c.isEqual(trinome.c)
    )
  }

  /** Nombre de chiffres après la virgule pour les valeurs approchées (dans les calculs des racines) */
  precision = 3

  /** Chaine de caractères de la forme développée ax^2+bx+c */
  get tex() {
    let result = ''
    if (Math.abs(this.a.valeurDecimale) === 1) {
      if (this.a.s === -1) result += '-'
      result += 'x^2'
    } else if (this.a.valeurDecimale === 0) {
      result += ''
    } else {
      result += `${this.a.texFSD}x^2`
    }

    if (Math.abs(this.b.valeurDecimale) === 1) {
      if (result === '') {
        result = this.b.valeurDecimale === 1 ? 'x' : '-x'
      } else {
        result += `${this.b.signeString}x`
      }
    } else if (this.b.valeurDecimale === 0) {
      result += ''
    } else {
      if (result !== '' && this.b.s === 1) result += '+'
      result += `${this.b.texFSD}x`
    }

    if (this.c.valeurDecimale === 0) {
      result += ''
    } else {
      if (result && this.c.s === 1) result += '+'
      result += `${this.c.texFSD}`
    }
    return result
  }

  /** Chaine de caractères de la forme développée ax^2+bx+c ou (ax^2+bx+c) avec le paramètre parentheses */
  toString({ parentheses = false } = {}) {
    if (parentheses) return `(${this.tex})`
    return this.tex
  }

  /** Renvoie true si le trinome est une fonction constante */
  get isConstant() {
    return this.a.valeurDecimale === 0 && this.b.valeurDecimale === 0
  }

  /** Discriminant du trinome */
  get discriminant(): FractionEtendue {
    if (this._discriminant === undefined) {
      const b2 = this.b.produitFraction(this.b)
      let ac = this.a.produitFraction(this.c)
      ac = ac.multiplieEntier(-4)
      this._discriminant = b2.sommeFraction(ac).simplifie()
    }
    return this._discriminant
  }

  /** Renvoie l'image de x par la fonction définie par le trinome */
  image(x: numberOrFraction) {
    if (x instanceof FractionEtendue === false) x = new FractionEtendue(x, 1)
    return this.a
      .produitFraction(x)
      .produitFraction(x)
      .sommeFraction(this.b.produitFraction(x))
      .sommeFraction(this.c)
  }

  /** Calcul détaillé de l'image d'un nombre */
  texCalculImage(x: numberOrFraction) {
    if (x instanceof FractionEtendue === false) x = new FractionEtendue(x, 1)
    let result = ''
    if (this.a.valeurDecimale === -1) result = '-'
    else if (this.a.valeurDecimale !== 1) result = `${this.a.texFSD} \\times `

    if (x.s === -1 || !x.estEntiere) {
      result += `\\left(${x.texFSD} \\right)^2 `
    } else {
      result += `${x.texFSD}^2 `
    }

    if (this.b.valeurDecimale !== 0) {
      if (this.b.valeurDecimale === 1)
        result += `${x.simplifie().texFractionSignee} `
      else if (this.b.valeurDecimale === -1) result += `- ${x.texFSP} `
      else
        result += `${this.b.simplifie().texFractionSignee} \\times ${x.texFSP} `
    }

    if (this.c.valeurDecimale !== 0) result += `${this.c.texFractionSignee}`

    result += ` = ${this.image(x).simplifie().texFractionSimplifiee}`
    return result
  }

  /**
   * Calcul sur une ligne du discriminant du polynome
   * @example
   * const p = new Trinome(2, 3, 1)
   * p.texCalculDiscriminantSansResultat
   * // 3^2-4\\times2\\times1 = 1
   * @type {string}
   * @type {string}
   */
  get texCalculDiscriminant() {
    if (this.b.valeurDecimale === 0)
      return `-4\\times${this.a.texFSP}\\times${this.c.texFSP} = ${this.discriminant.texFractionSimplifiee}`
    else if (this.b.estEntiere && this.b.s === 1)
      return `${this.b.texFSD}^2-4\\times${this.a.texFSP}\\times${this.c.texFSP} = ${this.discriminant.texFractionSimplifiee}`
    return `\\left(${this.b.texFSD}\\right)^2-4\\times${this.a.texFSP}\\times${this.c.texFSP} = ${this.discriminant.texFractionSimplifiee}`
  }

  /**
   * Calcul sous la forme d'une égalité sans le résultat
   * @example
   * const p = new Trinome(2, 3, 1)
   * p.texCalculDiscriminantSansResultat
   * // 3^2-4\\times2\\times1
   * @type {string}
   */
  get texCalculDiscriminantSansResultat() {
    if (this.b.valeurDecimale === 0)
      return `-4\\times${this.a.texFSP}\\times${this.c.texFSP}`
    else if (this.b.estEntiere && this.b.s === 1)
      return `${this.b.texFSD}^2-4\\times${this.a.texFSP}\\times${this.c.texFSP}`
    return `\\left(${this.b.texFSD}\\right)^2-4\\times${this.a.texFSP}\\times${this.c.texFSP}`
  }

  /** Calcul détaillée de la première racine avec résultat exact si l'option est true et valeur approchée sinon */
  texCalculRacine1(exact = false) {
    if (this.discriminant.s === -1) return ''
    if (this.discriminant.valeurDecimale === 0)
      return this.texCalculRacineDouble
    let result = 'x_1 = '
    if (this.a.valeurDecimale > 0) {
      const discriminantRacineCarree =
        this.discriminant.racineCarree() as FractionEtendue
      if (this.b.valeurDecimale === 0) {
        result += `\\dfrac{-b-\\sqrt{\\Delta}}{2a}=\\dfrac{-\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += `=\\dfrac{${this.a.s === -1 ? '' : '-'}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      } else {
        result += `\\dfrac{-b-\\sqrt{\\Delta}}{2a}=\\dfrac{${this.b.oppose().texFractionSimplifiee}-\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += this.discriminant.estParfaite
          ? `=\\dfrac{${this.a.s === -1 ? this.b.sommeFraction(discriminantRacineCarree).texFractionSimplifiee : this.b.oppose().differenceFraction(discriminantRacineCarree).texFractionSimplifiee}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
          : `=\\dfrac{${this.a.s === -1 ? this.b.texFractionSimplifiee : this.b.oppose().texFractionSimplifiee}${this.a.s === -1 ? '+' : '-'}\\sqrt{${this.discriminant.texFractionSimplifiee}}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      }
      if (this.x1 instanceof FractionEtendue)
        result += `=${this.x1.texFractionSimplifiee}`
      else if (!exact) {
        result += `\\approx${this.x1.toString().replace('.', '{,}')}`
      } else {
        if (this.discriminant.estEntiere) {
          const [r0, r1] = extraireRacineCarree(
            this.discriminant.valeurDecimale,
          )
          if (
            r0 !== 1 &&
            Math.abs(this.b.valeurDecimale) % r0 === 0 &&
            Math.abs(2 * this.a.valeurDecimale) % r0 === 0
          ) {
            // On peut simplifier par r0
            if (this.a.valeurDecimale > 0) {
              const num =
                this.b.entierDivise(r0).simplifie().oppose().texFraction +
                `- \\sqrt{${r1}}`
              const den = (2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            } else {
              const num =
                this.b.entierDivise(r0).simplifie().texFraction +
                `- \\sqrt{${r1}}`
              const den = (-2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            }
          }
        }
      }
      return result
    } else {
      const discriminantRacineCarree =
        this.discriminant.racineCarree() as FractionEtendue
      if (this.b.valeurDecimale === 0) {
        result += `\\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += `=\\dfrac{${this.a.s === -1 ? '-' : ''}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      } else {
        result += `\\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{${this.b.oppose().texFractionSimplifiee}+\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += this.discriminant.estParfaite
          ? `=\\dfrac{${this.a.s === -1 ? this.b.differenceFraction(discriminantRacineCarree).texFractionSimplifiee : this.b.oppose().sommeFraction(discriminantRacineCarree).texFractionSimplifiee}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
          : `=\\dfrac{${this.a.s === -1 ? this.b.texFractionSimplifiee : this.b.oppose().texFractionSimplifiee}${this.a.s === -1 ? '-' : '+'}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      }
      if (this.x1 instanceof FractionEtendue)
        result += `=${this.x1.texFraction}`
      else if (!exact) {
        result += `\\approx${this.x1.toString().replace('.', '{,}')}`
      } else {
        if (this.discriminant.estEntiere) {
          const [r0, r1] = extraireRacineCarree(
            this.discriminant.valeurDecimale,
          )
          if (
            r0 !== 1 &&
            Math.abs(this.b.valeurDecimale) % r0 === 0 &&
            Math.abs(2 * this.a.valeurDecimale) % r0 === 0
          ) {
            // On peut simplifier par r0
            if (this.a.valeurDecimale > 0) {
              const num =
                this.b.entierDivise(r0).simplifie().oppose().texFraction +
                `- \\sqrt{${r1}}`
              const den = (2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            } else {
              const num =
                this.b.entierDivise(r0).simplifie().texFraction +
                `- \\sqrt{${r1}}`
              const den = (-2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            }
          }
        }
      }
      return result
    }
  }

  /**
   * Calcul détaillée de la deuxième racine avec résultat exact si l'option est true et valeur approchée sinon
   * @type {string}
   */
  texCalculRacine2(exact = false) {
    if (this.discriminant.s === -1) return ''
    let result = 'x_2 = '
    if (this.a.valeurDecimale > 0) {
      const discriminantRacineCarree =
        this.discriminant.racineCarree() as FractionEtendue
      if (this.b.valeurDecimale === 0) {
        result += `\\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += `=\\dfrac{${this.a.s === -1 ? '-' : ''}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      } else {
        result += `\\dfrac{-b+\\sqrt{\\Delta}}{2a}=\\dfrac{${this.b.oppose().texFractionSimplifiee}+\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += this.discriminant.estParfaite
          ? `=\\dfrac{${this.a.s === -1 ? this.b.differenceFraction(discriminantRacineCarree).texFractionSimplifiee : this.b.oppose().sommeFraction(discriminantRacineCarree).texFractionSimplifiee}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
          : `=\\dfrac{${this.a.s === -1 ? this.b.texFractionSimplifiee : this.b.oppose().texFractionSimplifiee}${this.a.s === -1 ? '-' : '+'}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      }

      if (this.x2 instanceof FractionEtendue)
        result += `=${this.x2.texFractionSimplifiee}`
      else if (!exact) {
        result += `\\approx${this.x2.toString().replace('.', '{,}')}`
      } else {
        if (this.discriminant.estEntiere) {
          const [r0, r1] = extraireRacineCarree(
            this.discriminant.valeurDecimale,
          )
          if (
            r0 !== 1 &&
            Math.abs(this.b.valeurDecimale) % r0 === 0 &&
            Math.abs(2 * this.a.valeurDecimale) % r0 === 0
          ) {
            // On peut simplifier par r0
            if (this.a.valeurDecimale > 0) {
              const num =
                this.b.entierDivise(r0).simplifie().oppose().texFraction +
                `+ \\sqrt{${r1}}`
              const den = (2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            } else {
              const num =
                this.b.entierDivise(r0).simplifie().texFraction +
                `+ \\sqrt{${r1}}`
              const den = (-2 * this.a.valeurDecimale) / r0
              result = den === 1 ? `${num}` : `=\\dfrac{${num}}{${den}}`
            }
          }
        }
      }
      return result
    } else {
      const discriminantRacineCarree =
        this.discriminant.racineCarree() as FractionEtendue
      if (this.b.valeurDecimale === 0) {
        result += `\\dfrac{-b-\\sqrt{\\Delta}}{2a}=\\dfrac{-\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += `=\\dfrac{${this.a.s === -1 ? '' : '-'}${this.discriminant.estParfaite ? discriminantRacineCarree.texFractionSimplifiee : `\\sqrt{${this.discriminant.texFractionSimplifiee}}`}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      } else {
        result += `\\dfrac{-b-\\sqrt{\\Delta}}{2a}=\\dfrac{${this.b.oppose().texFractionSimplifiee}-\\sqrt{${this.discriminant.texFractionSimplifiee}}}{2\\times${this.a.s === -1 ? this.a.texFSP : this.a.texFractionSimplifiee}}`
        result += this.discriminant.estParfaite
          ? `=\\dfrac{${this.a.s === -1 ? this.b.sommeFraction(discriminantRacineCarree).texFractionSimplifiee : this.b.oppose().differenceFraction(discriminantRacineCarree).texFractionSimplifiee}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
          : `=\\dfrac{${this.a.s === -1 ? this.b.texFractionSimplifiee : this.b.oppose().texFractionSimplifiee}${this.a.s === -1 ? '+' : '-'}\\sqrt{${this.discriminant.texFractionSimplifiee}}}{${this.a.s === -1 ? this.a.multiplieEntier(2).oppose().texFractionSimplifiee : this.a.multiplieEntier(2).texFractionSimplifiee}}`
      }

      if (this.x2 instanceof FractionEtendue)
        result += `=${this.x2.texFractionSimplifiee}`
      else if (!exact) {
        result += `\\approx${this.x2.toString().replace('.', '{,}')}`
      } else {
        if (this.discriminant.estEntiere) {
          const [r0, r1] = extraireRacineCarree(
            this.discriminant.valeurDecimale,
          )
          if (
            r0 !== 1 &&
            Math.abs(this.b.valeurDecimale) % r0 === 0 &&
            Math.abs(2 * this.a.valeurDecimale) % r0 === 0
          ) {
            // On peut simplifier par r0
            if (this.a.valeurDecimale > 0) {
              const num =
                this.b.entierDivise(r0).simplifie().oppose().texFraction +
                `+ \\sqrt{${r1}}`
              const den = (2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `=${num}` : `=\\dfrac{${num}}{${den}}`
            } else {
              const num =
                this.b.entierDivise(r0).simplifie().texFraction +
                `+ \\sqrt{${r1}}`
              const den = (-2 * this.a.valeurDecimale) / r0
              result += den === 1 ? `${num}` : `=\\dfrac{${num}}{${den}}`
            }
          }
        }
      }
      return result
    }
  }

  /** Calcul détaillé de la racine unique pour un discriminant nul */
  get texCalculRacineDouble() {
    if (this.discriminant.valeurDecimale !== 0)
      throw Error('Le discriminant doit être nul pour avoir une racine double')
    let result = ''
    result += '\\dfrac{-b}{2a} = '
    if (this.b.valeurDecimale > 0) {
      result += `\\dfrac{${this.b.oppose().texFSD}}{2\\times${this.a.texFSP}}`
    } else {
      result += `\\dfrac{${this.b.oppose().texFSD}}{2\\times\\left(${this.a.texFSP}\\right)}`
    }
    const x1 = this.x1 as FractionEtendue
    result += `=${x1.texFractionSimplifiee}`
    return result
  }

  /**
   * Tableau avec 2 étapes pour le développement puis le résultat
   * @return {string[]} [Étape 1, Étape 2, this.tex]
   */
  get arrayTexDevelopperFormeCanonique() {
    const alpha = this.alpha
    const beta = this.beta
    let result1 = ''
    if (this.a.valeurDecimale === -1) result1 += '-'
    else if (this.a.valeurDecimale !== 1) result1 += this.a.simplifie().texFSD
    result1 += `\\left(x^2 ${alpha.multiplieEntier(-2).simplifie().texFractionSignee} x ${alpha.produitFraction(alpha).simplifie().texFractionSignee} \\right) ${beta.simplifie().texFractionSignee}`
    let result2 = ''
    if (this.a.valeurDecimale === -1) result2 += '-x^2'
    else if (this.a.valeurDecimale !== 1)
      result2 += `${this.a.simplifie().texFSD} x^2`
    if (this.b.valeurDecimale === -1) result2 += '-x'
    else if (this.b.valeurDecimale === 1) result2 += 'x'
    else
      result2 += `${this.b.simplifie().texFractionSignee}x ${this.a.produitFraction(alpha).produitFraction(alpha).simplifie().texFractionSignee} ${beta.simplifie().texFractionSignee}`

    return [result1, result2, this.tex]
  }

  /**
   * Tableau avec 2 étapes pour le développement puis le résultat
   * On considère que a est différent de 1, x1 et x2 sont non nuls
   */
  get arrayTexDevelopperFormeFactorisee() {
    const [untypedA, untypedX1, untypedX2] = [this.a, this.x1, this.x2]
    if (
      typeof untypedX1 === 'boolean' ||
      typeof untypedX2 === 'boolean' ||
      typeof untypedA === 'boolean'
    )
      throw Error
    const x1 =
      typeof untypedX1 === 'number'
        ? new FractionEtendue(untypedX1, 1)
        : untypedX1
    const x2 =
      typeof untypedX2 === 'number'
        ? new FractionEtendue(untypedX2, 1)
        : untypedX2
    const a =
      typeof untypedA === 'number' ? new FractionEtendue(untypedA, 1) : untypedA
    const result1 = `${a.simplifie().texFractionSaufUn}\\left(x^2 ${x2.oppose().simplifie().texFractionSaufUnSignee}x ${x1.oppose().simplifie().texFractionSaufUnSignee}x ${x1.produitFraction(x2).simplifie().texFractionSignee} \\right)`
    const result2 = `${a.simplifie().texFractionSaufUn}x^2 ${a.produitFraction(x2).oppose().simplifie().texFractionSaufUnSignee}x ${a.produitFraction(x1).oppose().simplifie().texFractionSaufUnSignee}x ${a.produitFraction(x1).produitFraction(x2).simplifie().texFractionSignee}`
    return [result1, result2, this.tex]
  }

  /** Première racine du trinome */
  get x1() {
    if (this.discriminant.s === -1) return false
    if (this.discriminant.isEqual(0))
      return this.b
        .oppose()
        .diviseFraction(this.a.multiplieEntier(2))
        .simplifie()
    if (this.discriminant.estParfaite) {
      const racineDeDelta = this.discriminant.racineCarree() as FractionEtendue
      const unSurDeuxA = this.a.multiplieEntier(2).inverse() as FractionEtendue
      if (this.a.valeurDecimale > 0) {
        return this.b
          .oppose()
          .differenceFraction(racineDeDelta)
          .produitFraction(unSurDeuxA)
          .simplifie()
      }
      return this.b
        .oppose()
        .sommeFraction(racineDeDelta)
        .produitFraction(unSurDeuxA)
        .simplifie()
    }
    let result: number
    if (this.a.valeurDecimale > 0) {
      result =
        Math.round(
          ((-this.b.valeurDecimale -
            Math.sqrt(this.discriminant.valeurDecimale)) /
            (2 * this.a.valeurDecimale)) *
            10 ** this.precision,
        ) /
        10 ** this.precision
    } else {
      result =
        Math.round(
          ((-this.b.valeurDecimale +
            Math.sqrt(this.discriminant.valeurDecimale)) /
            (2 * this.a.valeurDecimale)) *
            10 ** this.precision,
        ) /
        10 ** this.precision
    }
    return result
  }

  /** Deuxième racine du trinome */
  get x2() {
    if (this.discriminant.s === -1) return false
    if (this.discriminant.isEqual(0))
      return this.b
        .oppose()
        .diviseFraction(this.a.multiplieEntier(2))
        .simplifie()
    if (this.discriminant.estParfaite) {
      const racineDeDelta = this.discriminant.racineCarree() as FractionEtendue
      const unSurDeuxA = this.a.multiplieEntier(2).inverse()
      if (this.a.valeurDecimale > 0) {
        return this.b
          .oppose()
          .sommeFraction(racineDeDelta)
          .produitFraction(unSurDeuxA)
          .simplifie()
      }
      return this.b
        .oppose()
        .differenceFraction(racineDeDelta)
        .produitFraction(unSurDeuxA)
        .simplifie()
    }
    let result: number
    if (this.a.valeurDecimale > 0) {
      result =
        Math.round(
          ((-this.b.valeurDecimale +
            Math.sqrt(this.discriminant.valeurDecimale)) /
            (2 * this.a.valeurDecimale)) *
            10 ** this.precision,
        ) /
        10 ** this.precision
    } else {
      result =
        Math.round(
          ((-this.b.valeurDecimale -
            Math.sqrt(this.discriminant.valeurDecimale)) /
            (2 * this.a.valeurDecimale)) *
            10 ** this.precision,
        ) /
        10 ** this.precision
    }
    return result
  }

  /**
   * Écriture LaTeX de la valeur exacte première racine
   * @type {string}
   */
  get texX1() {
    if (this.x1 instanceof FractionEtendue)
      return this.x1.simplifie().texFraction
    else {
      if (this.discriminant.s === -1) return ''
      if (
        this.discriminant.estEntiere &&
        this.discriminant.superieurstrict(0)
      ) {
        const [r0, r1] = extraireRacineCarree(this.discriminant.valeurDecimale)
        if (
          r0 !== 1 &&
          Math.abs(this.b.valeurDecimale) % r0 === 0 &&
          Math.abs(2 * this.a.valeurDecimale) % r0 === 0
        ) {
          // On peut simplifier par r0
          if (this.a.valeurDecimale > 0) {
            const num =
              (this.b.valeurDecimale !== 0
                ? this.b.entierDivise(r0).simplifie().oppose().texFraction
                : '') + `-\\sqrt{${r1}}`
            const den = (2 * this.a.valeurDecimale) / r0
            return den === 1 ? num : `\\dfrac{${num}}{${den}}`
          } else {
            const num =
              (this.b.valeurDecimale !== 0
                ? this.b.entierDivise(r0).simplifie().texFraction
                : '') + `-\\sqrt{${r1}}`
            const den = (-2 * this.a.valeurDecimale) / r0
            return den === 1 ? num : `\\dfrac{${num}}{${den}}`
          }
        }
      }
      if (this.a.valeurDecimale > 0) {
        const num =
          (this.b.valeurDecimale !== 0 ? this.b.oppose().texFraction : '') +
          (this.discriminant.valeurDecimale > 0
            ? `-\\sqrt{${this.discriminant.texFraction}}`
            : '')
        const den = 2 * this.a.valeurDecimale
        return `\\dfrac{${num}}{${den}}`
      } else {
        const num =
          (this.b.valeurDecimale !== 0 ? this.b.texFraction : '') +
          (this.discriminant.valeurDecimale > 0
            ? `-\\sqrt{${this.discriminant.texFraction}}`
            : '')
        const den = -2 * this.a.valeurDecimale
        return `\\dfrac{${num}}{${den}}`
      }
    }
  }

  /**
   * Écriture LaTeX de la valeur exacte première racine
   * @type {string}
   */
  get texX2() {
    if (this.x2 instanceof FractionEtendue)
      return this.x2.simplifie().texFraction
    else {
      if (
        this.discriminant.estEntiere &&
        this.discriminant.superieurstrict(0)
      ) {
        const [r0, r1] = extraireRacineCarree(this.discriminant.valeurDecimale)
        if (
          r0 !== 1 &&
          Math.abs(this.b.valeurDecimale) % r0 === 0 &&
          Math.abs(2 * this.a.valeurDecimale) % r0 === 0
        ) {
          // On peut simplifier par r0
          if (this.a.valeurDecimale > 0) {
            const num =
              (this.b.valeurDecimale !== 0
                ? `${this.b.entierDivise(r0).simplifie().oppose().texFraction}+`
                : '') + `\\sqrt{${r1}}`
            const den = (2 * this.a.valeurDecimale) / r0
            return den === 1 ? num : `\\dfrac{${num}}{${den}}`
          } else {
            const num =
              (this.b.valeurDecimale !== 0
                ? `${this.b.entierDivise(r0).simplifie().texFraction}+`
                : '') + `\\sqrt{${r1}}`
            const den = (-2 * this.a.valeurDecimale) / r0
            return den === 1 ? num : `\\dfrac{${num}}{${den}}`
          }
        }
      }
      if (this.a.valeurDecimale > 0) {
        const num =
          (this.b.valeurDecimale !== 0
            ? `${this.b.oppose().texFraction}+`
            : '') +
          (this.discriminant.valeurDecimale > 0
            ? `\\sqrt{${this.discriminant.texFraction}}`
            : '')
        const den = 2 * this.a.valeurDecimale
        return `\\dfrac{${num}}{${den}}`
      } else {
        const num =
          (this.b.valeurDecimale !== 0 ? `${this.b.texFraction}+` : '') +
          (this.discriminant.valeurDecimale > 0
            ? `\\sqrt{${this.discriminant.texFraction}}`
            : '')
        const den = -2 * this.a.valeurDecimale
        return `\\dfrac{${num}}{${den}}`
      }
    }
  }

  /**
   * a(x-x1)(x-x2)
   * @type {string}
   */
  get texFormeFactorisee() {
    if (
      typeof this.x1 === 'boolean' ||
      typeof this.x1 === 'number' ||
      typeof this.x2 === 'number' ||
      typeof this.x2 === 'boolean' ||
      typeof this.a === 'boolean'
    )
      throw Error
    if (this.discriminant.valeurDecimale === 0) {
      if (this.a.valeurDecimale === 1)
        return `(x${this.x1.oppose().simplifie().texFractionSignee})^2`
      else if (this.a.valeurDecimale === -1)
        return `-(x${this.x1.oppose().simplifie().texFractionSignee})^2`
      else if (this.a.den === 1)
        return `${this.a.num}(x${this.x1.oppose().simplifie().texFractionSignee})^2`
      else
        return `${this.a.texFractionSimplifiee}(x${this.x1.oppose().simplifie().texFractionSignee})^2`
    }
    if (this.x1 instanceof FractionEtendue) {
      if (this.x1.valeurDecimale === 0) {
        if (this.a.valeurDecimale === 1)
          return `x(x${this.x2.oppose().simplifie().texFractionSignee})`
        else if (this.a.valeurDecimale === -1)
          return `-x(x${this.x2.oppose().simplifie().texFractionSignee})`
        else if (this.a.den === 1)
          return `${this.a.num}x(x${this.x2.oppose().simplifie().texFractionSignee})`
        else
          return `${this.a.texFractionSimplifiee}x(x${this.x2.oppose().simplifie().texFractionSignee})`
      } else if (this.x2.valeurDecimale === 0) {
        if (this.a.valeurDecimale === 1)
          return `x(x${this.x1.oppose().simplifie().texFractionSignee})`
        else if (this.a.valeurDecimale === -1)
          return `-x(x${this.x1.oppose().simplifie().texFractionSignee})`
        else if (this.a.den === 1)
          return `${this.a.num}x(x${this.x1.oppose().simplifie().texFractionSignee})`
        else
          return `${this.a.texFractionSimplifiee}x(x${this.x1.oppose().simplifie().texFractionSignee})`
      }
      if (this.a.valeurDecimale === 1)
        return `(x${this.x1.oppose().simplifie().texFractionSignee})(x${this.x2.oppose().simplifie().texFractionSignee})`
      else if (this.a.valeurDecimale === -1)
        return `-(x${this.x1.oppose().simplifie().texFractionSignee})(x${this.x2.oppose().simplifie().texFractionSignee})`
      else if (this.a.den === 1)
        return `${this.a.num}(x${this.x1.oppose().simplifie().texFractionSignee})(x${this.x2.oppose().simplifie().texFractionSignee})`
      else
        return `${this.a.texFractionSimplifiee}(x${this.x1.oppose().simplifie().texFractionSignee})(x${this.x2.oppose().simplifie().texFractionSignee})`
    } else {
      throw Error(
        'x1 et x2 doivent être des fractions pour obtenir la forme factorisée',
      )
    }
  }

  /** Renvoie -b/2a */
  get alpha() {
    return this.b.diviseFraction(this.a.multiplieEntier(2)).oppose()
  }

  /** Renvoie f(-b/2a) */
  get beta() {
    return this.image(this.alpha)
  }

  /** Renvoie la forme canonique du trinome */
  get texFormeCanonique() {
    let result = ''
    if (this.a.valeurDecimale === -1) result = '-'
    else if (this.a.valeurDecimale !== 1) {
      if (this.a.den === 1) result = `${this.a.num}`
      else result = this.a.texFractionSimplifiee
    }
    if (this.alpha.valeurDecimale === 0) result += 'x^2'
    else
      result += `\\left(x ${this.alpha.oppose().simplifie().texFractionSignee}\\right)^2`
    if (this.beta.valeurDecimale !== 0) {
      result += ` ${this.beta.simplifie().texFractionSignee}`
    }
    return result
  }
}
