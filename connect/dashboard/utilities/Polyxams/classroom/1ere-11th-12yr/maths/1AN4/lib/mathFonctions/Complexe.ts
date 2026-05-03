import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { texNombre } from '../outils/texNombre'

function numerise(c: Complexe): Complexe {
  let re: number | FractionEtendue
  let im: number | FractionEtendue
  if (c.re instanceof FractionEtendue) {
    if (c.re.denIrred === 1) {
      re = c.re.numIrred
    } else {
      re = c.re.simplifie()
    }
  } else {
    re = c.re
  }
  if (c.im instanceof FractionEtendue) {
    if (c.im.denIrred === 1) {
      im = c.im.numIrred
    } else {
      im = c.im.simplifie()
    }
  } else {
    im = c.im
  }
  return new Complexe(re, im)
}

// Classe pour représenter les nombres complexes, avec des méthodes pour les opérations algébriques
/**
 * @author : Jean-claude Lhote
 */
export class Complexe {
  /**
   * Crée un complexe à partir du module (rayon) et de l'argument (angle en radians)
   * @param mod module (nombre ou FractionEtendue)
   * @param arg argument (angle en radians)
   * @returns Complexe
   */
  static fromPolar(mod: number | FractionEtendue, arg: number): Complexe {
    if (mod instanceof FractionEtendue) {
      // Pour les fractions, on calcule re et im en décimal
      const re = mod.toNumber() * Math.cos(arg)
      const im = mod.toNumber() * Math.sin(arg)
      try {
        const reFrac = fraction(re).simplifie()
        const imFrac = fraction(im).simplifie()
        return new Complexe(reFrac, imFrac)
      } catch (e) {
        return new Complexe(re, im)
      }
    } else {
      const re = mod * Math.cos(arg)
      const im = mod * Math.sin(arg)
      return new Complexe(re, im)
    }
  }

  public re: number | FractionEtendue
  public im: number | FractionEtendue
  public arg: number
  public mod: number | FractionEtendue
  public isReal: boolean
  public isImaginary: boolean

  constructor(re: number | FractionEtendue, im: number | FractionEtendue) {
    this.re = re
    this.im = im
    // Pour arg et mod, on convertit en nombre si besoin
    const reNum = re instanceof FractionEtendue ? re.numIrred / re.denIrred : re
    const imNum = im instanceof FractionEtendue ? im.numIrred / im.denIrred : im
    this.arg = Math.atan2(imNum, reNum)
    const carreMod =
      re instanceof FractionEtendue && im instanceof FractionEtendue
        ? re.produitFraction(re).sommeFraction(im.produitFraction(im))
        : re instanceof FractionEtendue
          ? re.produitFraction(re).sommeFraction(fraction(imNum * imNum, 1))
          : im instanceof FractionEtendue
            ? fraction(reNum * reNum, 1).sommeFraction(im.produitFraction(im))
            : reNum * reNum + imNum * imNum
    this.mod =
      carreMod instanceof FractionEtendue
        ? carreMod.estParfaite
          ? (carreMod.racineCarree() as FractionEtendue)
          : Math.sqrt(reNum * reNum + imNum * imNum)
        : Math.sqrt(carreMod)

    this.isReal = imNum < 1e-10 && imNum > -1e-10
    this.isImaginary = reNum < 1e-10 && reNum > -1e-10
    if (this.isReal) {
      this.im = 0
    }
    if (this.isImaginary) {
      this.re = 0
    }
  }

  add(other: Complexe): Complexe {
    const reA =
      this.re instanceof FractionEtendue
        ? this.re
        : fraction(this.re, undefined)
    const reB =
      other.re instanceof FractionEtendue
        ? other.re
        : fraction(other.re, undefined)
    const imA =
      this.im instanceof FractionEtendue
        ? this.im
        : fraction(this.im, undefined)
    const imB =
      other.im instanceof FractionEtendue
        ? other.im
        : fraction(other.im, undefined)
    const re = reA.sommeFraction(reB)
    const im = imA.sommeFraction(imB)
    return numerise(new Complexe(re, im))
  }

  sub(other: Complexe): Complexe {
    const reA =
      this.re instanceof FractionEtendue
        ? this.re
        : fraction(this.re, undefined)
    const reB =
      other.re instanceof FractionEtendue
        ? other.re
        : fraction(other.re, undefined)
    const imA =
      this.im instanceof FractionEtendue
        ? this.im
        : fraction(this.im, undefined)
    const imB =
      other.im instanceof FractionEtendue
        ? other.im
        : fraction(other.im, undefined)
    const re = reA.differenceFraction(reB)
    const im = imA.differenceFraction(imB)
    return numerise(new Complexe(re, im))
  }

  mul(other: Complexe): Complexe {
    const a =
      this.re instanceof FractionEtendue
        ? this.re
        : fraction(this.re, undefined)
    const b =
      this.im instanceof FractionEtendue
        ? this.im
        : fraction(this.im, undefined)
    const c =
      other.re instanceof FractionEtendue
        ? other.re
        : fraction(other.re, undefined)
    const d =
      other.im instanceof FractionEtendue
        ? other.im
        : fraction(other.im, undefined)
    const re = a.produitFraction(c).differenceFraction(b.produitFraction(d))
    const im = a.produitFraction(d).sommeFraction(b.produitFraction(c))
    return numerise(new Complexe(re, im))
  }

  pow(n: number): Complexe {
    if (n === 0) {
      return new Complexe(1, 0)
    }
    if (n === 1) {
      return this
    }
    if (n === 2) {
      return this.mul(this)
    }
    let result: Complexe = new Complexe(this.re, this.im)
    for (let i = 2; i <= n; i++) {
      result = result.mul(this)
    }
    return numerise(result)
  }

  div(other: Complexe): Complexe {
    const a =
      this.re instanceof FractionEtendue
        ? this.re
        : fraction(this.re, undefined)
    const b =
      this.im instanceof FractionEtendue
        ? this.im
        : fraction(this.im, undefined)
    const c =
      other.re instanceof FractionEtendue
        ? other.re
        : fraction(other.re, undefined)
    const d =
      other.im instanceof FractionEtendue
        ? other.im
        : fraction(other.im, undefined)
    const denom = c.produitFraction(c).sommeFraction(d.produitFraction(d))
    const re = a
      .produitFraction(c)
      .sommeFraction(b.produitFraction(d))
      .diviseFraction(denom)
    const im = b
      .produitFraction(c)
      .differenceFraction(a.produitFraction(d))
      .diviseFraction(denom)
    return numerise(new Complexe(re, im))
  }

  inverse(): Complexe {
    const a =
      this.re instanceof FractionEtendue
        ? this.re
        : fraction(this.re, undefined)
    const b =
      this.im instanceof FractionEtendue
        ? this.im
        : fraction(this.im, undefined)

    const denom = a.produitFraction(a).sommeFraction(b.produitFraction(b))
    const re = a.diviseFraction(denom)
    const im = b.oppose().diviseFraction(denom)
    return numerise(new Complexe(re, im))
  }

  conjugue(): Complexe {
    const im = this.im instanceof FractionEtendue ? this.im.oppose() : -this.im
    return numerise(new Complexe(this.re, im))
  }

  negate(): Complexe {
    const re = this.re instanceof FractionEtendue ? this.re.oppose() : -this.re
    const im = this.im instanceof FractionEtendue ? this.im.oppose() : -this.im
    return numerise(new Complexe(re, im))
  }

  isEqual(other: Complexe): boolean {
    let isEqualRe: boolean
    let isEqualIm: boolean
    if (
      this.re instanceof FractionEtendue &&
      other.re instanceof FractionEtendue
    ) {
      isEqualRe =
        this.re.numIrred === other.re.numIrred &&
        this.re.denIrred === other.re.denIrred
    } else {
      isEqualRe = Number(this.re) === Number(other.re)
    }
    if (
      this.im instanceof FractionEtendue &&
      other.im instanceof FractionEtendue
    ) {
      isEqualIm =
        this.im.numIrred === other.im.numIrred &&
        this.im.denIrred === other.im.denIrred
    } else {
      isEqualIm = Number(this.im) === Number(other.im)
    }
    return isEqualRe && isEqualIm
  }

  toString(): string {
    if (this.isReal) {
      return Number(this.re).toString()
    } else if (this.isImaginary) {
      return `${Number(this.im).toString()}i`
    }
    return `${Number(this.re).toString()} ${Number(this.im) >= 0 ? '+' : '-'} ${Math.abs(
      this.im instanceof FractionEtendue
        ? this.im.numIrred / this.im.denIrred
        : this.im,
    )}i`
  }

  tex(): string {
    // Affichage symbolique pour la partie réelle
    let reTex: string
    if (this.re instanceof FractionEtendue) {
      reTex = this.re.texFSD
    } else {
      reTex = texNombreSymbolique(this.re) ?? texNombre(this.re, 8)
    }
    // Affichage symbolique pour la partie imaginaire
    let imTex: string
    if (this.im instanceof FractionEtendue) {
      imTex = this.im.texFSD
    } else {
      imTex = texNombreSymbolique(this.im) ?? texNombre(this.im, 8)
    }
    if (imTex === '1') {
      imTex = ''
    } else if (imTex === '-1') {
      imTex = '-'
    }
    if (this.isReal) {
      return reTex
    } else if (this.isImaginary) {
      return `${imTex}i`
    }
    return `${reTex}${imTex.startsWith('-') ? '-' : '+'}${imTex.slice(imTex.startsWith('-') ? 1 : 0)}i`
  }

  texTrigoForm(): string {
    let rTex: string
    if (this.mod instanceof FractionEtendue) {
      rTex = this.mod.texFSD
    } else {
      rTex = texNombreSymbolique(this.mod)
    }
    let thetaTex: string
    try {
      thetaTex = texAngleSymbolique(this.arg) ?? texNombre(this.arg)
    } catch (e) {
      thetaTex = texNombre(this.arg)
    }
    return `${rTex} \\left( \\cos\\left(${thetaTex}\\right) + i \\sin\\left(${thetaTex}\\right) \\right)`
  }

  texExpoForm(): string {
    let rTex: string
    if (this.mod instanceof FractionEtendue) {
      rTex = this.mod.texFSD
    } else {
      rTex = texNombreSymbolique(this.mod) ?? texNombre(this.mod, 8)
    }
    let thetaTex: string
    try {
      thetaTex = texAngleSymbolique(this.arg) ?? texNombre(this.arg)
    } catch (e) {
      thetaTex = texNombre(this.arg)
    }
    const signe = thetaTex.startsWith('-') ? '-' : ''
    thetaTex = signe === '-' ? thetaTex.slice(1) : thetaTex
    // rienSi1 ne peut pas être utilisé sur une string, donc on le remplace par une gestion manuelle
    const rAff = rTex === '1' ? '' : rTex
    return thetaTex === '0'
      ? `${rAff}`
      : thetaTex === '1'
        ? `${rAff} e^{i}`
        : `${rAff} e^{${signe}i ${thetaTex}}`
  }

  toPolar() {
    return { r: Number(this.mod), phi: Number(this.arg) }
  }
}

// Génère l'écriture symbolique LaTeX pour les angles multiples de Pi/2, Pi/3, Pi/4, Pi/5, Pi/6, etc.
// et leurs opposés, pour une valeur d'angle en radians (nombre JS)

const PI = Math.PI

// Table des dénominateurs à supporter (inclut 1 pour Pi, 2Pi, ...)
const DENOMS = [1, 2, 3, 4, 5, 6, 8, 12]

/**
 * Retourne l'écriture symbolique LaTeX d'un angle en radians si possible, sinon undefined.
 * @author Jean-claude Lhote
 * @param {number} angleRadian - valeur de l'angle en radians
 * @param {number} [epsilon=1e-8] - tolérance pour l'approximation
 * @returns {string|undefined}
 */
export function texAngleSymbolique(
  angleRadian: number,
  epsilon = 1e-8,
): string | undefined {
  // On cherche n et d tels que angleRadian = n*PI/d
  for (const d of DENOMS) {
    const n = Math.round((angleRadian * d) / PI)
    if (Math.abs(angleRadian - (n * PI) / d) < epsilon) {
      // Simplification du signe
      if (n === 0) return '0'
      const absn = Math.abs(n)
      const sign = n < 0 ? '-' : ''
      if (d === 1) {
        if (absn === 1) return sign + '\\pi'
        return sign + absn + '\\pi'
      }
      if (absn === 1) return sign + `\\frac{\\pi}{${d}}`
      return sign + `\\frac{${absn}\\pi}{${d}}`
    }
  }
  return undefined
}

// Fonction utilitaire pour transformer un number en écriture symbolique (fraction ou racine carrée)
// Retourne une string LaTeX

/**
 * Transforme un nombre en écriture symbolique LaTeX (fraction simple ou racine carrée d'entier)
 * @author Jean-claude Lhote
 * @param x nombre à transformer
 * @returns string LaTeX
 */
export function texNombreSymbolique(x: number): string {
  // D'abord, tester si x est un entier
  if (Number.isInteger(x)) return x.toString()

  // Détecter les fractions simples (dénominateur 2 à 1000)
  const n = Math.trunc(x)
  const frac = Math.abs(x - n)
  for (let d = 2; d <= 1000; d++) {
    const num = Math.round(frac * d)
    if (num > 0 && num < d && Math.abs(frac - num / d) < 1e-8) {
      const signe = x < 0 ? '-' : ''
      const numLatex = n !== 0 ? `${Math.abs(n) * d + num}` : `${num}`
      return `${signe}\\dfrac{${numLatex}}{${d}}`
    }
  }

  // Détecter racine carrée d'entier
  const absx = Math.abs(x)
  const nSqrt = Math.round(absx * absx)
  if (Math.abs(absx - Math.sqrt(nSqrt)) < 1e-8 && nSqrt > 1) {
    return (x < 0 ? '-' : '') + `\\sqrt{${nSqrt}}`
  }

  // Détecter racine carrée de fraction : x = sqrt(a)/b ou sqrt(a)/d
  for (let d = 2; d <= 1000; d++) {
    const val = absx * d
    const a = Math.round(val * val)
    if (Math.abs(val - Math.sqrt(a)) < 1e-8 && a > 1) {
      const signe = x < 0 ? '-' : ''
      return `${signe}\\dfrac{\\sqrt{${a}}}{${d}}`
    }
  }

  // Sinon, fallback sur texNombre classique
  try {
    return texNombre(x, 6)
  } catch (e) {
    return x.toString()
  }
}
