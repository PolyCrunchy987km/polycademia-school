import Decimal from 'decimal.js'
import { extraireRacineCarree } from '../lib/outils/calculs'
import { miseEnEvidence } from '../lib/outils/embellissements'
import {
  decompositionFacteursPremiers,
  obtenirListeFacteursPremiers,
  pgcd,
  ppcm,
} from '../lib/outils/primalite'
import { texNombre } from '../lib/outils/texNombre'

// Versions locales (scope module) pour éviter la dépendance circulaire avec ecritures.ts
function ecritureAlgebrique(n: number): string {
  return n >= 0 ? '+' + texNombre(n, 7) : texNombre(n, 7)
}

function ecritureParentheseSiNegatif(n: number): string {
  return n >= 0 ? texNombre(n, 8) : `(${texNombre(n, 8)})`
}

function signeMoinsEnEvidence(r: number, precision = 0): string {
  if (typeof r !== 'number') {
    window.notify(
      "signeMoinsEnEvidence() appelé avec autre chose qu'un nombre.",
      { argument: r },
    )
  }
  if (r < 0) {
    return miseEnEvidence('-') + texNombre(Math.abs(r), precision)
  }
  return texNombre(Math.abs(r), precision)
}

const arrondi = (x: number, p: number) => {
  return Number(x.toFixed(p))
}

// Fonction écrite par Daniel Caillibaud pour créer ajouter les propriétés à la première utilisation de celles-ci.
const definePropRo = (
  obj: FractionEtendue,
  prop: string,
  get: (args?: unknown) => unknown,
) => {
  Object.defineProperty(obj, prop, {
    enumerable: true,
    get,
    set: () => {
      throw Error(`${prop} est en lecture seule`)
    },
  })
}

/**
 * Une fonction pour transformer en FractionEtendue
 * @param x
 * @return {FractionEtendue}
 */
export function rationnalise(
  x: number | FractionEtendue | Decimal | null,
): FractionEtendue {
  if (x == null) {
    window.notify(
      'rationnalise est appelé avec une valeur undefined ou nulle',
      { x },
    )
    return new FractionEtendue(0, 1)
  }
  if (x instanceof FractionEtendue) return x
  if (x instanceof Decimal) {
    const numDen = x.toFraction(10000) // On limite le dénominateur à 10000
    return new FractionEtendue(numDen[0].toNumber(), numDen[1].toNumber())
  }
  if (typeof x === 'number') {
    // Gestion des fractions simples pour les flottants
    if (Number.isInteger(x)) {
      return new FractionEtendue(x, 1)
    }
    const n = Math.trunc(x)
    const frac = Math.abs(x - n)
    for (let d = 2; d <= 1000; d++) {
      const num = Math.round(frac * d)
      if (num > 0 && num < d && Math.abs(frac - num / d) < 1e-8) {
        const signe = x < 0 ? -1 : 1
        return new FractionEtendue(signe * (Math.abs(n) * d + num), d)
      }
    }
    // Sinon, fallback sur l'ancienne méthode
    const numDen = new Decimal(x.toFixed(5)).toFraction(10000)
    return new FractionEtendue(numDen[0].toNumber(), numDen[1].toNumber())
  }
  // c'est pas un number, c'est pas une FractionEtendue... ça doit être une Fraction de mathjs
  window.notify(
    'rationnalise est appelé avec un nombre dont le format est inconnu :',
    { x },
  )
  return x
}

/**
 * transforme si besoin les numérateurs et dénominateurs en number
 * @param n
 * @param d
 */
function normalizeFraction(n: number | Decimal, d: number): [number, number] {
  let num: number
  let den: number
  if (d === 0) {
    window.notify('normalizeFraction : dénominateur nul !', { n, d })
    return [NaN, NaN]
  }
  if (d == null) {
    if (typeof n === 'number') {
      const frac = rationnalise(n)
      return [frac.num, frac.den]
    }

    // Un seul argument : convertir en fraction
    const decimal = n instanceof Decimal ? n : new Decimal(n)
    const [numDec, denDec] = decimal.toFraction(10000) // Limite le dénominateur
    num = numDec.toNumber()
    den = denDec.toNumber()
  } else {
    // Deux arguments : calculer le quotient puis convertir en fraction
    if (Number.isInteger(n) && Number.isInteger(d)) {
      num = Number(n)
      den = Number(d)
    } else {
      // attention aux flottants en javascript...
      // La fraction retournée sera irreductible
      // il vaut mieux utiliser n et d entiers !
      const nDecimal = n instanceof Decimal ? n : new Decimal(n)
      const dDecimal = new Decimal(d)
      const nNbChiffresDecimaux = nDecimal.decimalPlaces()
      const dNbChiffresDecimaux = dDecimal.decimalPlaces()
      const pow = Math.min(
        5,
        Math.max(nNbChiffresDecimaux, dNbChiffresDecimaux),
      )
      if (pow > 0) {
        const facteur = Math.pow(10, pow)
        n = nDecimal.mul(facteur).round().toNumber()
        d = dDecimal.mul(facteur).round().toNumber()
      }
      num = Number(n)
      den = Number(d)
    }
  }

  if (isNaN(num) || isNaN(den)) {
    window.notify(
      'FractionEtendue : valeurs impossibles à convertir en fraction',
      { n, d },
    )
    return [NaN, NaN]
  }

  return [num, den]
}

/**
 * La classe FractionEtendue est une extension de la classe  FractionMathjs  de mathjs
 * @author Jean-claude Lhote
 * Merci à Daniel Caillibaud pour son aide.
 * Pour créer une instance de la classe FractionEtendue on peut utiliser la fonction fraction() qui se trouve dans le fichier modules/fractions
 * Ou utiliser la syntaxe f = new FractionEtendue () qui crée une  FractionMathjs  nulle.
 * On peut utiliser tous les arguments utilisables par  FractionMathjs  :
 * @example
 * // crée la  FractionMathjs  $\frac{1}{3}$
 * f = new FractionEtendue ('0.(3)')
 * @example
 * // crée la  FractionMathjs  $\frac{12}{15}$ (Remarque : new FractionEtendue(12,15) crée $\frac{4}{5}$)
 * f = fraction(12,15)
 * @example
 * // crée la  FractionMathjs  $\frac{2}{5}$
 * f = fraction(0.4)
 */
class FractionEtendue {
  num: number
  den: number
  /**
   * Numérateur réduit // Le numérateur réduit peut être négatif
   */
  numIrred: number
  /**
   * Dénominateur réduit // le dénominateur réduit est toujours positif.
   */
  denIrred: number
  n: number
  d: number
  s: -1 | 1 | 0
  type: 'FractionEtendue'
  signe!: -1 | 1 | 0
  sign!: -1 | 1 | 0
  signeString!: '+' | '-' | ''
  /**
   * Valeur de la  FractionMathjs  × 100 arrondi au centième
   */
  pourcentage!: number
  /**
   * num/den mais sans traitement des signes des numérateur et dénominateur
   */
  texFraction!: string
  /**
   * le code LaTeX de la  FractionMathjs  simplifiée
   */
  texFractionSimplifiee!: string
  /**
   * num/den mais avec simplification des signes (numérateur et dénominateur positifs, signe - eventuellement devant.)
   * littéralement texFractionSigneDevant (si c'est un moins sinon rien... pour avoir le + devant, utiliser texFractionSignee)
   */
  texFSD!: string
  /**
   * retourne la  Fraction avec signe devant  mis entre parenthèses notamment pour l'exponentiation.
   */
  texParentheses!: string
  /**
   * num/den avec mise en évidence des signes - s'il y en a au numérateur et au dénominateur
   */
  texFractionSR!: string
  /**
   * + n/d si positif, - n/d si négatif
   * propriété qui n'est pas très utile puisque ecritureAlgebrique gère les fractions maintenant (défini pour compatibilité avec les exos qui l'utilisent)
   */
  texFractionSignee!: string
  /**
   * -1 => '-'
   * 1 => ''
   * inchangé sinon
   * permet d'écrire le coefficient devant une lettre ou une parenthèse
   */
  texFractionSaufUn!: string
  /**
   * Valeur décimale de la  FractionMathjs  (arrondie à la sixième décimale)
   */
  valeurDecimale!: number
  /**
   * -1 => '-'
   * 1 => '+'
   * texFractionSignee sinon
   * permet d'écrire le coefficient devant une lettre ou une parenthèse
   */
  texFractionSaufUnSignee!: string
  /**
   * num/den si positif, (- num/den) sinon
   * @property texFSP littéralement texFractionSigneParentheses
   * @type {string}
   */
  texFSP!: string
  /**
   * le code LaTeX de l'écriture algébrique de la fraction
   * Pour compatibilité avec les anciens exos... la fonction de outils ecritureAlgebrique() est compatible avec les fractions
   */
  ecritureAlgebrique!: string
  /**
   * le code LaTeX de l'écriture avec parenthèse si négatif
   */
  ecritureParentheseSiNegatif!: string
  /**
   * true si la  FractionMathjs  est un entier false sinon
   */
  estEntiere!: boolean
  /**
   * true si la FractionEtendue est le carré d'une FractionEtendue
   */
  estParfaite!: boolean
  /**
   * @return true si la FractionEtendue est irréductible
   */
  estIrreductible!: boolean
  /**
   * le code LaTeX de l'écriture avec parenthèse si négatif
   */

  constructor(n: number | Decimal, d: number) {
    const [num, den] = normalizeFraction(n, d)
    if (isNaN(num) || isNaN(den))
      throw Error(
        `Fraction Etendue les données ne permettent pas de définir une fraction : n=${n}, d=${d}`,
      )
    const pgcdNumDen =
      Math.abs(num) === 1 && Math.abs(den) === 1
        ? 1
        : pgcd(Math.abs(num), Math.abs(den))
    const prodNumDen = num * den
    this.s = prodNumDen === 0 ? 0 : prodNumDen < 0 ? -1 : 1
    const numIrred = this.s * Math.abs(num / pgcdNumDen)
    const denIrred = Math.abs(den / pgcdNumDen)
    this.num = num
    this.den = den
    this.n = Math.abs(num / pgcdNumDen)
    this.d = Math.abs(den / pgcdNumDen)
    /**
     * le signe de la  FractionMathjs  : -1 pour négatif, 0 ou 1 pour positif
     * Au cas où quelqu'un oublie le e de this.signe
     * @type {number}
     */
    /**
     * le signe de la fraction : -1 pour négatif, 0 ou 1 pour positif
     * @type {number}
     */
    let sign: 0 | 1 | -1 // Au cas où quelqu'un le demande en anglais
    definePropRo(this, 'sign', () => {
      if (!sign) sign = this.s
      return sign
    })
    let signe: 0 | 1 | -1
    definePropRo(this, 'signe', () => {
      if (!signe) signe = this.s
      return signe
    })
    this.type = 'FractionEtendue'
    this.numIrred = numIrred
    this.denIrred = denIrred

    // this.pourcentage = arrondi(num * 100 / den, 2)
    // pour ne pas faire ces calculs à chaque instanciation de Fraction, on passe par defineProperty
    // (qui permet de ne faire le calcul qu'à la première lecture de la propriété)
    /**
     * Valeur de la fraction × 100
     * @property pourcentage
     * @type {number}
     */
    let pourcentage: number
    definePropRo(this, 'pourcentage', () => {
      if (!pourcentage)
        pourcentage = arrondi((this.s * this.n * 100) / this.d, 2)
      return pourcentage
    })
    // Le signe en string
    let signeString: string
    definePropRo(this, 'signeString', () => {
      if (!signeString) signeString = this.s === -1 ? '-' : '+'
      return signeString
    })

    /**
     * num/den
     * @property texFraction
     * @type {string}
     */
    let texFraction: string // num/den mais sans traitement des signes des numérateur et dénominateur
    definePropRo(this, 'texFraction', () => {
      if (!texFraction)
        texFraction =
          this.s === 0
            ? '0'
            : den === 1
              ? `${texNombre(num, 0)}`
              : `\\dfrac{${texNombre(num, 0)}}{${texNombre(den, 0)}}`
      return texFraction
    })

    /**
     * num/den
     * @property texFractionSR
     * @type {string}
     */
    let texFractionSR: string // num/den mais sans traitement des signes des numérateur et dénominateur
    definePropRo(this, 'texFractionSR', () => {
      if (!texFractionSR)
        texFractionSR = `\\dfrac{${signeMoinsEnEvidence(this.num)}}{${signeMoinsEnEvidence(this.den)}}`
      return texFractionSR
    })

    /**
     * num/den mais avec simplification des signes (numérateur et dénominateur positifs, signe - eventuellement devant.)
     * @property texFSD littéralement texFractionSigneDevant (si c'est un moins sinon rien... pour avoir le + devant, utiliser ecritureAlgebrique)
     * @type {string}
     */
    let texFSD: string
    definePropRo(this, 'texFSD', () => {
      if (!texFSD) {
        texFSD =
          this.s === 0
            ? '0'
            : this.s === -1
              ? Math.abs(den) === 1
                ? '-' + texNombre(Math.abs(num), 0)
                : `-\\dfrac{${texNombre(Math.abs(num), 0)}}{${texNombre(Math.abs(den), 0)}}`
              : Math.abs(den) === 1
                ? texNombre(Math.abs(num), 0)
                : `\\dfrac{${texNombre(Math.abs(num), 0)}}{${texNombre(Math.abs(den), 0)}}`
      }
      return texFSD
    })

    /**
     * + n/d si positif, - n/d si négatif
     * propriété qui n'est pas très utile puisque ecritureAlgebrique gère les fractions maintenant (défini pour compatibilité avec les exos qui l'utilisent)
     * @property texFractionSignee
     * @type {string}
     */
    let texFractionSignee: string
    definePropRo(this, 'texFractionSignee', () => {
      if (!texFractionSignee)
        texFractionSignee = this.s === -1 ? this.texFSD : '+' + this.texFSD
      return texFractionSignee
    })

    /**
     * Valeur décimale de la fraction (arrondie à la sixième décimale)
     * @property valeurDecimale
     * @type {number}
     */
    let valeurDecimale: number
    definePropRo(this, 'valeurDecimale', () => {
      if (!valeurDecimale)
        valeurDecimale = Number((this.num / this.den).toFixed(6))
      return valeurDecimale
    })

    /**
     * -1 => '-'
     * 1 => ''
     * inchangé sinon
     * permet d'écrire le coefficient devant une lettre ou une parenthèse
     * @property texFractionSaufUn
     * @type {string}
     */
    let texFractionSaufUn: string
    definePropRo(this, 'texFractionSaufUn', () => {
      if (!texFractionSaufUn)
        texFractionSaufUn =
          this.valeurDecimale === -1
            ? '-'
            : this.valeurDecimale === 1
              ? ''
              : this.texFSD
      return texFractionSaufUn
    })

    /**
     * -1 => '-'
     * 1 => '+'
     * texFractionSignee sinon
     * permet d'écrire le coefficient devant une lettre ou une parenthèse
     * @property texFractionSaufUnSignee
     * @type {string}
     */
    let texFractionSaufUnSignee: string
    definePropRo(this, 'texFractionSaufUnSignee', () => {
      if (!texFractionSaufUnSignee)
        texFractionSaufUnSignee =
          this.valeurDecimale === -1
            ? '-'
            : this.valeurDecimale === 1
              ? '+'
              : this.texFractionSignee
      return texFractionSaufUnSignee
    })

    /**
     * num/den si positif, (- num/den) sinon
     * @property texFSP littéralement texFractionSigneParentheses
     * @type {string}
     */
    let texFSP: string
    definePropRo(this, 'texFSP', () => {
      if (!texFSP)
        texFSP =
          this.s === 0
            ? '0'
            : this.s > 0
              ? this.texFSD
              : '\\left(' + this.texFSD + '\\right)'
      return texFSP
    })

    /**
     * retourne la fraction mis entre parenthèses notamment pour l'exponentiation.
     */
    let texParentheses: string
    definePropRo(this, 'texParentheses', () => {
      if (!texParentheses)
        texParentheses =
          this.s === 0
            ? '0'
            : den === 1 && this.s === 1
              ? this.texFSD
              : '\\left(' + this.texFSD + '\\right)'
      return texParentheses
    })

    /**
     * le code LaTeX de la fraction simplifiée
     * @property texFractionSimplifiee
     * @type {string}
     */
    let texFractionSimplifiee: string
    definePropRo(this, 'texFractionSimplifiee', () => {
      if (!texFractionSimplifiee) {
        texFractionSimplifiee =
          this.s === 0
            ? '0'
            : this.denIrred === 1
              ? `${this.s === -1 ? '-' : ''}${texNombre(Math.abs(numIrred), 0)}`
              : `${this.s === -1 ? '-' : ''}\\dfrac{${texNombre(Math.abs(numIrred), 0)}}{${texNombre(Math.abs(denIrred), 0)}}`
      }
      return texFractionSimplifiee
    })

    /**
     * le code LaTeX de l'écriture algébrique de la fraction
     * Pour compatibilité avec les anciens exos... la fonction de outils ecritureAlgebrique() est compatible avec les fractions
     * @property ecritureAlgebrique
     * @type {string}
     */
    let ecritureAlgebrique: string
    definePropRo(this, 'ecritureAlgebrique', () => {
      if (!ecritureAlgebrique)
        ecritureAlgebrique =
          this.s === 0 ? '' : this.s === 1 ? '+' + this.texFSD : this.texFSD
      return ecritureAlgebrique
    })

    /**
     * le code LaTeX de l'écriture avec parenthèse si négatif
     * @property ecritureParentheseSiNegatif
     * @type {string}
     */
    let ecritureParentheseSiNegatif: string
    definePropRo(this, 'ecritureParentheseSiNegatif', () => {
      if (!ecritureParentheseSiNegatif)
        ecritureParentheseSiNegatif =
          this.s === 0
            ? '0'
            : this.s === 1
              ? this.texFSD
              : '\\left(' + this.texFSD + '\\right)'
      return ecritureParentheseSiNegatif
    })

    /**
     * true si la fraction est un entier false sinon
     */
    let estEntiere: boolean
    definePropRo(this, 'estEntiere', () => {
      if (!estEntiere) estEntiere = this.d === 1
      return estEntiere
    })

    /**
     * @returns true si la FractionX est le carré d'une fractionX
     */
    let estParfaite: boolean
    definePropRo(this, 'estParfaite', () => {
      if (!estParfaite)
        estParfaite =
          Number.isInteger(Math.sqrt(this.n)) &&
          Number.isInteger(Math.sqrt(this.d))
      return estParfaite
    })

    /**
     * @returns true si la FractionX est irréductible
     */
    let estIrreductible: boolean
    definePropRo(this, 'estIrreductible', () => {
      if (!estIrreductible)
        estIrreductible =
          pgcd(Math.abs(this.num), Math.abs(this.den)) === 1 && this.den !== 1
      return estIrreductible
    })
  }

  /**
   * basé sur la méthode toLatex() de mathjs, on remplace \frac par \dfrac plus joli.
   * @return {string} la chaine Latex pour écrire la  FractionMathjs  (signe devant)
   */
  toLatex(dfrac = 'dfrac'): string {
    const text = this.texFSD
    if (dfrac === 'frac') {
      return text.replace('\\dfrac', '\\frac')
      // ajout, car pour les puissances il faut parfois avoir un exposant fractionnaire plus petit, c.f. https://tex.stackexchange.com/questions/202325/how-to-make-fractions-in-powers-look-good
    } else if (dfrac === 'sfrac') {
      return `${this.num}/${this.den}`
    } else return text.replace('\\frac', '\\dfrac')
  }

  /**
   * retourne un flottant pour compatibilité de FractionEtendue() avec Number().
   * @return {number}
   */
  toNumber(): number {
    return this.num / this.den
  }

  /**
   *
   */
  toString() {
    // Cette fonction n'a pas vocation à être utilisée ! si on veut du latex, il faut utiliser sa propriété texFraction.
    // Cette méthode vient se substituer à la méthode toString() de Object.prototype qui renvoie '[object object]' elle est utilisée si la FractionEtendue a été utilisée par erreur à la place de sa propriété texFraction
    window.notify(
      'Pour obtenir du Latex avec une FractionEtendue, il faut utiliser sa propriété texFraction !',
      { numerateur: this.num, denominateur: this.den },
    )
    return this.texFraction
  }

  /**
   * Pour la conversion automatique en number
   * @returns {number}
   */
  valueOf(): number {
    return this.toNumber()
  }

  /**
   *
   * @param {FractionEtendue[]} fractions
   * @return {FractionEtendue}
   */
  sommeFractions(...fractions: FractionEtendue[]) {
    // retourne un résultat simplifié
    let s = new FractionEtendue(this.num, this.den)
    if (s != null) {
      for (const f of fractions) {
        s = s.sommeFraction(f)
      }
    }
    if (s == null) {
      window.notify(
        'il se passe quelque chose de travers dans sommeFractions() avec les fractions passées',
        { fractions },
      )
      return this
    }
    return s.simplifie()
  }

  /**
   * @return {FractionEtendue} la FractionEtendue irreductible
   */
  simplifie() {
    return new FractionEtendue(
      (Math.abs(this.num) * this.signe) /
        pgcd(Math.abs(this.num), Math.abs(this.den)),
      Math.abs(this.den) / pgcd(Math.abs(this.num), Math.abs(this.den)),
    )
  }

  /**
   * Convertit la FractionEtendue en Fraction
   * @return {FractionEtendue} un objet  FractionMathjs  (mathjs)
   */
  valeurAbsolue(): FractionEtendue {
    return new FractionEtendue(Math.abs(this.num), Math.abs(this.den))
  }

  /**
   * @return {FractionEtendue} opposé de la FractionEtendue
   */
  oppose() {
    return new FractionEtendue(-1 * this.num, this.den)
  }

  /**
   * On pourra utiliser k = 0.5 pour simplifier par 2 la  FractionMathjs  par exemple.
   * @param {number} k
   * @return {FractionEtendue} La FractionEtendue dont le numérateur et le dénominateur ont été multipliés par k.
   */
  reduire(k: number) {
    const num = this.num * k
    const den = this.den * k
    return new FractionEtendue(num, den)
  }

  /**
   * @param {FractionEtendue  | number} f2
   * @return true si la FractionEtendue est égale à la  FractionMathjs  passée en argument.
   */
  isEqual(f2: FractionEtendue | number) {
    if (f2 instanceof FractionEtendue) {
      return f2.differenceFraction(this).simplifie().num === 0
    } else {
      const f2bis = new FractionEtendue(f2, 1)
      return f2bis.differenceFraction(this).simplifie().num === 0
    }
  }

  /**
   * @param {FractionEtendue  | number} f
   * @return {FractionEtendue} la FractionEtendue - f résultat non simplifié
   */
  differenceFraction(f: FractionEtendue | number) {
    if (!(f instanceof FractionEtendue)) {
      f = new FractionEtendue(f, 1)
    }
    return this.sommeFraction(f.oppose())
  }

  /**
   * @param {number} n
   * @return {FractionEtendue}La FractionEtendue multipliée par n (numérateur n fois plus grand)
   */
  multiplieEntier(n: number) {
    if (Number.isInteger(n)) return new FractionEtendue(this.num * n, this.den)
    else {
      window.notify(
        `multiplieEntier() : l'argument n'est pas entier : n=${n}... j'arrondis !`,
        { n: Math.round(n) },
      )
      return new FractionEtendue(this.num * Math.round(n), this.den)
    }
  }

  /**
   * @param {number} n
   * @return {FractionEtendue} La FractionEtendue divisée par n (denominateur n fois plus grand)
   */
  entierDivise(n: number): FractionEtendue {
    if (Number.isInteger(n)) return new FractionEtendue(this.num, n * this.den)
    else {
      window.notify(
        `entierDivise() : l'argument n'est pas entier : n=${n}... j'arrondis !`,
        { n: Math.round(n) },
      )
      return new FractionEtendue(this.num, this.den * Math.round(n))
    }
  }

  /**
   *
   * @param {number} n
   * @return {FractionEtendue} n + la FractionEtendue
   */
  ajouteEntier(n: number) {
    if (Number.isInteger(n))
      return new FractionEtendue(this.num + n * this.den, this.den)
    else {
      window.notify(
        `ajouteEntier() : l'argument n'est pas entier : n=${n}... j'arrondis !`,
        { n: Math.round(n) },
      )
      return new FractionEtendue(this.num + Math.round(n) * this.den, this.den)
    }
  }

  /**
   * @param {number} n
   * @return {FractionEtendue} n - la FractionEtendue
   */
  entierMoinsFraction(n: number): FractionEtendue {
    if (Number.isInteger(n))
      return new FractionEtendue(n * this.den - this.num, this.den)
    else {
      window.notify(
        `entierMoinsFraction() : l'argument n'est pas entier : n=${n}... j'arrondis !`,
        { n: Math.round(n) },
      )
      return new FractionEtendue(Math.round(n) * this.den - this.num, this.den)
    }
  }

  /**
   *
   * @param {FractionEtendue   | nombre} f2
   * @return {boolean} true si FractionEtendue >= f
   */
  superieurLarge(f2: FractionEtendue | number) {
    if (!(f2 instanceof FractionEtendue)) {
      f2 = new FractionEtendue(f2, 1)
    }
    return this.num * f2.den >= f2.num * this.den
  }

  /**
   * fonctions de comparaison avec une autre fraction.
   * @param {FractionEtendue   | nombre} f2
   * @return {boolean} true si
   */
  superieurstrict(f2: FractionEtendue | number): boolean {
    if (!(f2 instanceof FractionEtendue)) {
      f2 = new FractionEtendue(f2, 1)
    }
    return this.num * f2.den > f2.num * this.den
  }

  /**
   * Retourne true si la  FractionMathjs  courante est strictement inférieure à f2
   * @param {FractionEtendue   | nombre} f2
   * @return {boolean}
   */
  inferieurstrict(f2: FractionEtendue | number): boolean {
    if (!(f2 instanceof FractionEtendue)) {
      f2 = new FractionEtendue(f2, 1)
    }
    return this.differenceFraction(f2).valeurDecimale < 0
  }

  /**
   * Retourne true si la  FractionMathjs  courante est inférieure ou égale à f2
   * @param {FractionEtendue   | nombre} f2
   * @return {boolean}
   */
  inferieurlarge(f2: FractionEtendue | number) {
    if (!(f2 instanceof FractionEtendue)) {
      f2 = new FractionEtendue(f2, 1)
    }
    return this.num * f2.den <= f2.num * this.den
  }

  /**
   *
   * @param {FractionEtendue} f2
   * @return {boolean} true si f2 = f et  f2 est plus réduite que f
   */
  estUneSimplification(f2: FractionEtendue): boolean {
    if (f2.num == null || f2.den == null)
      throw Error(
        `estUneSimplification(f2) : f2 n'est pas une FractionEtendue ! f2=${JSON.stringify(f2)}`,
      )
    return this.isEqual(f2) && Math.abs(this.num) < Math.abs(f2.num)
  }

  /**
   *
   * @param {FractionEtendue   | nombre} f2
   * @return {FractionEtendue} f + FractionEtendue
   */
  sommeFraction(f2: FractionEtendue) {
    if (f2 instanceof FractionEtendue) {
      if (this.den === f2.den) {
        // on ajoute 2 fractions de même dénominateur
        return new FractionEtendue(this.num + f2.num, f2.den)
      } else if ([this.den, f2.den].indexOf(ppcm(this.den, f2.den)) !== -1) {
        // un dénominateur est multiple de l'autre
        if (this.den === ppcm(this.den, f2.den)) {
          // c'est this qui a le dénominateur commun.
          return new FractionEtendue(
            this.num + f2.num * Math.round(this.den / f2.den),
            this.den,
          ) // on transforme f2
        } else {
          // c'est f2 qui a le dénominateur commun
          return new FractionEtendue(
            f2.num + this.num * Math.round(f2.den / this.den),
            f2.den,
          ) // on transforme this
        }
      } else {
        // besoin d'établir le dénominateur commun.
        return new FractionEtendue(
          this.num * Math.round(ppcm(this.den, f2.den) / this.den) +
            f2.num * Math.round(ppcm(this.den, f2.den) / f2.den),
          ppcm(this.den, f2.den),
        )
      }
    } else {
      window.notify(
        `FractionEtendue.sommeFraction(fractionAAjouter) a été appelée avec autre chose qu'une  FractionMathjs  étendue, alors que c'est obligatoire !\nVoilci l'argument passé : ${f2}... je retourne la fraction de départ`,
        { argument: f2 },
      )
      return this
    }
  }

  /**
   * Effectue la somme de this et de f2 et retourne la string latex du calcul avec simplification si simplify est true (true par défaut)
   * @param {FractionEtendue} f2Arg
   * @param {boolean} simplify
   * @returns {string}
   */
  texSommeFraction(f2Arg: FractionEtendue, simplify = true): string {
    if (f2Arg instanceof FractionEtendue) {
      // on crée une fraction indépendante pour ne pas modifier f2 (c'est un objet et si on le bricole, il sera modifié pour le code appelant.
      const f2 = new FractionEtendue(f2Arg.num, f2Arg.den)
      if (f2.den < 0) {
        // il arrive qu'un dénominateur soit négatif, alors on change le signe du numérateur et du dénominateur
        f2.den = -f2.den
        f2.num = -f2.num
      }
      // on fait de même avec this
      const f1 = new FractionEtendue(this.num, this.den)
      if (this.den < 0) {
        f1.den = -f1.den
        f1.num = -f1.num
      }
      let calcul = `${f1.texFraction}+${f2.texFraction}=`
      const commonDenominator = ppcm(f1.den, f2.den)
      const coeffMultiplicatorA = commonDenominator / f1.den
      const coeffMultiplicatorB = commonDenominator / f2.den
      if (coeffMultiplicatorA !== 1 || coeffMultiplicatorB !== 1) {
        if (coeffMultiplicatorA !== 1) {
          // on modifie la fraction1
          calcul += `\\dfrac{${f1.num}\\times ${coeffMultiplicatorA}}{${f1.den}\\times ${coeffMultiplicatorA}}+`
          calcul +=
            coeffMultiplicatorB === 1
              ? `${f2.texFraction}=`
              : `\\dfrac{${String(f2.num)}\\times ${String(coeffMultiplicatorB)}}{${String(f2.den)}\\times ${String(coeffMultiplicatorB)}}=`
        } else {
          // si c'est pas la 1 c'est forcément la 2
          calcul += `${f1.texFraction}+\\dfrac{${String(f2.num)}\\times ${String(coeffMultiplicatorB)}}{${String(f2.den)}\\times ${String(coeffMultiplicatorB)}}=`
        }
        // on a écrit les multiplication des numérateur et des dénominateurs par les coeff respectifs
        // on écrit le résultat
        if (coeffMultiplicatorA !== 1) {
          // on modifie la fraction1
          calcul += `\\dfrac{${String(f1.num * coeffMultiplicatorA)}}{${String(f1.den * coeffMultiplicatorA)}}+`
          calcul +=
            coeffMultiplicatorB === 1
              ? `${f2.texFraction}=`
              : `\\dfrac{${String(f2.num * coeffMultiplicatorB)}}{${String(f2.den * coeffMultiplicatorB)}}=`
        } else {
          // sinon, il y a forcément modification de la fraction2
          calcul += `${f1.texFraction}+\\dfrac{${String(f2.num * coeffMultiplicatorB)}}{${String(f2.den * coeffMultiplicatorB)}}=`
        }
      }
      // les fractions ont le même dénominateur, on les ajoute
      calcul += `\\dfrac{${String(f1.num * coeffMultiplicatorA)}${ecritureAlgebrique(f2.num * coeffMultiplicatorB)}}{${String(commonDenominator)}}=`
      calcul += `\\dfrac{${String(f1.num * coeffMultiplicatorA + f2.num * coeffMultiplicatorB)}}{${String(commonDenominator)}}`
      if (!simplify) return calcul
      const fResult = new FractionEtendue(
        f1.num * coeffMultiplicatorA + f2.num * coeffMultiplicatorB,
        commonDenominator,
      )
      if (fResult.estIrreductible) return calcul
      calcul += `=${fResult.texFractionSimplifiee}`
      return calcul
    } else {
      window.notify(
        "texSommeFraction : pour l'instant on n'ajoute que une fractionEtendue et rien d'autre",
        { fraction: JSON.stringify(f2Arg) },
      )
      return ''
    }
  }

  /**
   * @param {FractionEtendue   | number} f2
   * @return {FractionEtendue} f * FractionEtendue  // retourne un non résultat simplifié
   */
  produitFraction(f2: FractionEtendue | number) {
    if (!(f2 instanceof FractionEtendue)) {
      f2 = new FractionEtendue(f2, 1)
    }
    if (this.signe * f2.signe === 1) {
      return new FractionEtendue(
        Math.abs(this.num * f2.num),
        Math.abs(this.den * f2.den),
      )
    } else {
      return new FractionEtendue(
        -Math.abs(this.num * f2.num),
        Math.abs(this.den * f2.den),
      )
    }
  }

  /**
   * @param  {Array<FractionEtendue>} fractions
   * @return {FractionEtendue} produit de FractionEtendue par toutes les fractions passées en argument.
   */
  produitFractions(...fractions: FractionEtendue[]) {
    // retourne un résultat simplifié
    let s = new FractionEtendue(this.num, this.den)
    for (const f of fractions) {
      s = s.produitFraction(f)
    }
    return s.simplifie()
  }

  /**
   * @param {FractionEtendue} f2 la  FractionMathjs  qui multiplie.
   *  @param {'none'|true|false} simplification true si on veut afficher la simplification par décomposition false si on veut celle par le pgcd et 'none' si on ne veut pas simplifier
   * @return {string} Le calcul du produit de deux fractions avec étape intermédiaire
   */
  texProduitFraction(
    f2: FractionEtendue,
    simplification: boolean | 'none' = 'none',
  ): string {
    if (this.estEntiere) {
      return `${this.texFraction}\\times ${f2.texFraction}=\\dfrac{${`${this.simplifie().num}\\times ${ecritureParentheseSiNegatif(f2.num)}`}}{${ecritureParentheseSiNegatif(f2.den)}}${
        simplification === 'none' || this.produitFraction(f2).estIrreductible
          ? '=\\dfrac{' + this.num * f2.num + '}{' + this.den * f2.den + '}'
          : this.produitFraction(f2).texSimplificationAvecEtapes(simplification)
      }`
    } else {
      return `${this.texFraction}\\times ${f2.texFraction}=\\dfrac{${this.num}\\times ${ecritureParentheseSiNegatif(f2.num)}}{${this.den} \\times ${ecritureParentheseSiNegatif(f2.den)}}${
        simplification === 'none' || this.produitFraction(f2).estIrreductible
          ? `=${new FractionEtendue(this.num * f2.num, this.den * f2.den).texFSD}`
          : `${
              this.den !== f2.num && f2.den !== this.num && f2.num === 1
                ? '=\\dfrac{' +
                  decompositionFacteursPremiers(this.num) +
                  '}{' +
                  decompositionFacteursPremiers(this.den) +
                  '\\times ' +
                  decompositionFacteursPremiers(f2.den) +
                  '}' +
                  this.produitFraction(f2).texSimplificationAvecEtapes(
                    simplification,
                  )
                : this.den !== f2.num && f2.den !== this.num
                  ? '=\\dfrac{' +
                    decompositionFacteursPremiers(this.num) +
                    '\\times ' +
                    decompositionFacteursPremiers(f2.num) +
                    '}{' +
                    decompositionFacteursPremiers(this.den) +
                    '\\times ' +
                    decompositionFacteursPremiers(f2.den) +
                    '}' +
                    this.produitFraction(f2).texSimplificationAvecEtapes(
                      simplification,
                    )
                  : `${
                      this.den === f2.num
                        ? '=\\dfrac{' +
                          this.num +
                          '}{' +
                          f2.den +
                          '}' +
                          new FractionEtendue(
                            this.num,
                            f2.den,
                          ).texSimplificationAvecEtapes(simplification)
                        : '=\\dfrac{' +
                          f2.num +
                          '}{' +
                          this.den +
                          '}' +
                          new FractionEtendue(
                            f2.num,
                            this.den,
                          ).texSimplificationAvecEtapes(simplification)
                    }`
            }`
      }`
    }
  }

  /**
   * @param {FractionEtendue} f2 la  FractionMathjs  qui multiplie.
   * @param {string} simplification true si on veut afficher la simplification par décomposition false si on veut celle par le pgcd et 'none' si on ne veut pas simplifier
   *  @param {string} symbole '/' pour la forme fractionnaire de la division, ':' ou autre chose pour l'obèle
   * @return {string} Le calcul du produit de deux fractions avec étape intermédiaire
   */
  texDiviseFraction(
    f2: FractionEtendue,
    simplification: boolean | 'none' = 'none',
    symbole = '/',
  ) {
    const space = '\\phantom{\\dfrac{(_(^(}{(_(^(}}' // Utilisé pour mettre de l'espace dans une  FractionMathjs  de fraction
    const space2 = '\\phantom{(_(^(}' // Utilisé pour mettre de l'espace dans une  FractionMathjs  de  FractionMathjs  lorsque le numérateur ou le dénominateur est entier
    if (this.estEntiere) {
      if (f2.inverse().estEntiere && f2.num === 1) {
        if (symbole === '/') {
          return `\\dfrac{${space2 + this.texFraction + space2}}{${(f2.estEntiere ? space2 : space) + f2.texFraction + (f2.estEntiere ? space2 : space)}}=${this.simplifie().texFSD}\\times ${f2.inverse().simplifie().texFSP}=${this.simplifie().num * f2.inverse().simplifie().num}`
          // pas de simplification : on multiplie deux entiers !
        } else {
          return `${this.simplifie().texFraction}\\div${f2.texFraction}=${this.simplifie().texFSD}\\times ${f2.inverse().simplifie().texFSP}=${this.simplifie().num * f2.inverse().simplifie().num}`
          // pas de simplification : on multiplie deux entiers !
        }
      } else {
        if (symbole === '/') {
          return `\\dfrac{${space2 + this.texFraction + space2}}{${(f2.estEntiere ? space2 : space) + f2.texFraction + (f2.estEntiere ? space2 : space)}}=${this.texFractionSimplifiee}\\times ${f2.inverse().texFraction}=\\dfrac{${this.texFractionSimplifiee} \\times ${ecritureParentheseSiNegatif(f2.den)}}{${ecritureParentheseSiNegatif(f2.num)}}${
            simplification === 'none' || this.diviseFraction(f2).estIrreductible
              ? `=\\dfrac{${this.simplifie().num * f2.den}}{${f2.num}}`
              : `=\\dfrac{${decompositionFacteursPremiers(this.num)}\\times ${decompositionFacteursPremiers(f2.den)}}{${decompositionFacteursPremiers(f2.num)}}${this.diviseFraction(
                  f2,
                ).texSimplificationAvecEtapes(simplification)}`
          }`
        } else {
          return `${this.texFraction}\\div${f2.texFraction}=${this.texFractionSimplifiee}\\times ${f2.inverse().texFraction}=\\dfrac{${this.texFractionSimplifiee + '\\times ' + ecritureParentheseSiNegatif(f2.den)}}{${ecritureParentheseSiNegatif(f2.num)}}${
            simplification === 'none' || this.diviseFraction(f2).estIrreductible
              ? `=\\dfrac{${this.simplifie().num * f2.den}}{${f2.num}}`
              : `=\\dfrac{${decompositionFacteursPremiers(this.num)} \\times ${decompositionFacteursPremiers(f2.den)}}{${decompositionFacteursPremiers(this.den)} \\times ${decompositionFacteursPremiers(f2.num)}}${this.diviseFraction(f2).texSimplificationAvecEtapes(simplification)}`
          }`
        }
      }
    } else {
      if (f2.inverse().estEntiere && f2.num === 1) {
        if (symbole === '/') {
          return `\\dfrac{${space + this.texFraction + space}}{${(f2.estEntiere ? space2 : space) + f2.texFraction + (f2.estEntiere ? space2 : space)}}=${this.texFraction}\\times ${f2.inverse().simplifie().texFSP}=\\dfrac{${this.num + '\\times ' + f2.inverse().simplifie().texFSP}}{${this.den}}
      ${
        simplification === 'none' || this.diviseFraction(f2).estIrreductible
          ? '=\\dfrac{' + this.num * f2.den + '}{' + this.den * f2.num + '}'
          : '=\\dfrac{' +
            decompositionFacteursPremiers(this.num) +
            '\\times ' +
            decompositionFacteursPremiers(f2.den) +
            '}{' +
            decompositionFacteursPremiers(this.den) +
            '}' +
            this.diviseFraction(f2).texSimplificationAvecEtapes(simplification)
      }`
        } else {
          return `${this.texFraction}\\div${f2.texFraction}=${this.texFraction}\\times ${f2.inverse().texFraction}=\\dfrac{${this.num + '\\times ' + f2.inverse().texFraction}}{${this.den}}${
            simplification === 'none' || this.diviseFraction(f2).estIrreductible
              ? `=\\dfrac{${this.num * f2.den}}{${this.den * f2.num}}`
              : `=\\dfrac{${decompositionFacteursPremiers(this.num)}\\times ${decompositionFacteursPremiers(f2.den)}}{${decompositionFacteursPremiers(this.den)}}${this.diviseFraction(f2).texSimplificationAvecEtapes(simplification)}`
          }`
        }
      } else {
        if (symbole === '/') {
          return `\\dfrac{${space + this.texFraction + space}}{${(f2.estEntiere ? space2 : space) + f2.texFraction + (f2.estEntiere ? space2 : space)}}=${this.texFraction}\\times ${f2.inverse().texFraction}=\\dfrac{${this.num + '\\times ' + ecritureParentheseSiNegatif(f2.den)}}{${this.den + '\\times ' + ecritureParentheseSiNegatif(f2.num)}}${
            simplification === 'none' || this.diviseFraction(f2).estIrreductible
              ? `=${new FractionEtendue(this.num * f2.den, this.den * f2.num).texFSD}`
              : `=\\dfrac{${decompositionFacteursPremiers(this.num)}}{${decompositionFacteursPremiers(this.den)}\\times ${decompositionFacteursPremiers(f2.num)}}${this.diviseFraction(f2).texSimplificationAvecEtapes(simplification)}`
          }`
        } else {
          return `${this.texFraction}\\div${f2.texFraction}=${this.texFraction}\\times ${f2.inverse().texFraction}=\\dfrac{${this.num + '\\times ' + f2.den}}{${this.den + '\\times ' + f2.num}}${
            simplification === 'none' || this.diviseFraction(f2).estIrreductible
              ? `=\\dfrac{${this.num * f2.den}}{${this.den * f2.num}}`
              : `=\\dfrac{${decompositionFacteursPremiers(this.num)}\\times ${decompositionFacteursPremiers(f2.den)}}{${decompositionFacteursPremiers(this.den)}\\times ${decompositionFacteursPremiers(f2.num)}}${this.diviseFraction(f2).texSimplificationAvecEtapes(simplification)}`
          }`
        }
      }
    }
  }

  /**
   * @param {number} n l'exposant de la fraction
   * @return {FractionEtendue} La puissance n de la fraction
   */
  puissanceFraction(n: number): FractionEtendue {
    if (Number.isInteger(n))
      return new FractionEtendue(this.num ** n, this.den ** n)
    else {
      window.notify(
        "puissanceFraction() l'argument n'est pas un entier j'arrondis !",
        { argument: n },
      )
      return new FractionEtendue(
        this.num ** Math.round(n),
        this.den ** Math.round(n),
      )
    }
  }

  /**
   * @return {FractionEtendue} inverse de la fraction
   */
  inverse(): FractionEtendue {
    if (this.num === 0)
      throw Error(`Division par 0 dans inverse() : ${JSON.stringify(this)}`)
    return new FractionEtendue(this.den, this.num)
  }

  /**
   *
   * @param {FractionEtendue} f2
   * @return {FractionEtendue} f/f2
   */
  diviseFraction(f2: FractionEtendue | number): FractionEtendue {
    if (!(f2 instanceof FractionEtendue)) {
      window.notify(
        "FractionEtendue.diviseFraction() : l'argument n'est pas une fraction",
        { f2 },
      )
      if (typeof f2 === 'number') return this.multiplieEntier(1 / f2)
      else {
        window.notify(
          "FractionEtendue.diviseFraction() : l'argument n'est pas un nombre, je retourne la fraction de départ.",
          { f2 },
        )
        return this
      }
    } else return this.produitFraction(f2.inverse())
  }

  /**
   * @param {number} n entier divisé par la fraction
   * @return {FractionEtendue} n divisé par fraction
   */
  diviseEntier(n: number): FractionEtendue {
    if (Number.isInteger(n))
      return new FractionEtendue(n * this.den, this.num).simplifie()
    else {
      window.notify(
        "diviseEntier() : l'argument n'est pas un entier, j'arrondis",
        { n },
      )
      return new FractionEtendue(Math.round(n) * this.den, this.num).simplifie()
    }
  }

  /**
   *
   * @param {FractionEtendue} f2
   * @return {string} Calcul f/f2 avec les étapes mais sans simplification
   */
  texQuotientFraction(f2: FractionEtendue): string {
    if (!(f2 instanceof FractionEtendue)) {
      window.notify(
        "texQuotientFraction() : l'argument n'est pas une fraction",
        { f2 },
      )
      if (typeof f2 === 'number') f2 = new FractionEtendue(f2, 1)
      else {
        window.notify(
          "texQuotientFraction() : l'argument n'est pas un nombre, je retourne la fraction de départ.",
          { f2 },
        )
        return this.texFraction
      }
    }
    return `${this.texFraction}\\div ${f2.texFraction}=${this.texFraction}\\times ${f2.inverse().texFraction}=\\dfrac{${this.num + '\\times' + f2.den}}{${this.den + '\\times' + f2.num}}=\\dfrac{${this.num * f2.den}}{${this.den * f2.num}}`
  }

  /**
   * Si la  FractionMathjs  est réductible, retourne une suite d'égalités permettant d'obtenir la  FractionMathjs  irréductible
   * @param {true|false|'none'} factorisation
   * @param {string} couleurFinale
   * @return {string}
   */
  texSimplificationAvecEtapes(
    factorisation: boolean | 'none' = false,
    couleurFinale: string = '',
  ): string {
    if (this.isEqual(0)) return ''
    if (this.estIrreductible && this.num > 0 && this.den > 0)
      return '' // irreductible et positifs
    else if (this.estIrreductible && this.num * this.den < 0) {
      // irréductible mais négatifs
      return couleurFinale === ''
        ? `=${this.texFSD}`
        : `=${miseEnEvidence(this.texFSD, couleurFinale)}`
    } else {
      if (factorisation) {
        const signe = this.sign === -1 ? '-' : ''
        const num = Math.abs(this.num)
        const den = Math.abs(this.den)
        const listenum = obtenirListeFacteursPremiers(num)
        const listeden = obtenirListeFacteursPremiers(den)
        let result = '='
        const listeNumvf = []
        const listeDenvf = []
        listenum.forEach(function aAjouterDansListeAvf(element) {
          listeNumvf.push([element, true])
        })
        listeden.forEach(function aAjouterDansListeBvf(element) {
          listeDenvf.push([element, true])
        })

        for (let index = 0; index < listeden.length; ) {
          for (let j = 0; j <= listenum.length; ) {
            if (listeden[index] === listenum[j]) {
              listeDenvf[index] = [listeden[index], false]
              listeNumvf[j] = [listenum[j], false]
              listenum[j] = 1
              listeden[index] = 1
              break
            }
            j++
          }
          index++
        }

        let a = 1
        let b = 1
        for (const k of listenum) {
          a = a * k
        }
        for (const k of listeden) {
          b = b * k
        }

        let numerateur = ''
        let denominateur = ''

        for (const j in listeNumvf) {
          if (listeNumvf[j][1] === true) {
            numerateur += listeNumvf[j][0] + '\\times'
          } else {
            numerateur += '\\cancel{' + listeNumvf[j][0] + '}\\times'
          }
        }
        numerateur = numerateur.substring(0, numerateur.length - 6)

        for (const j in listeDenvf) {
          if (listeDenvf[j][1] === true) {
            denominateur += listeDenvf[j][0] + '\\times'
          } else {
            denominateur += '\\cancel{' + listeDenvf[j][0] + '}\\times'
          }
        }
        denominateur = denominateur.substring(0, denominateur.length - 6)

        result += `${signe}\\dfrac{${numerateur}}{${denominateur}}`
        result +=
          couleurFinale !== ''
            ? `=${miseEnEvidence(`${signe}${new FractionEtendue(a, b).simplifie().texFraction}`, couleurFinale)}`
            : `=${signe}${new FractionEtendue(a, b).simplifie().texFraction}`
        return result
      } else {
        const signe = this.sign === -1 ? '-' : ''
        const num = Math.abs(this.num)
        const den = Math.abs(this.den)
        const pgcdNumDen = pgcd(num, den)
        if (pgcdNumDen !== 1) {
          const redaction = `=${signe}\\dfrac{${num / pgcdNumDen}${miseEnEvidence('\\times' + ecritureParentheseSiNegatif(pgcdNumDen), '#2563a5')} }{${den / pgcdNumDen}${miseEnEvidence('\\times' + ecritureParentheseSiNegatif(pgcdNumDen), '#2563a5')}}=`
          let redactionFinale
          if (Math.abs(den / pgcdNumDen) !== 1)
            redactionFinale = `${signe}\\dfrac{${Math.abs(num / pgcdNumDen)}}{${Math.abs(den / pgcdNumDen)}}`
          else redactionFinale = `${signe}${Math.abs(num / pgcdNumDen)}`
          if (couleurFinale !== '')
            redactionFinale = miseEnEvidence(redactionFinale, couleurFinale)
          return redaction + redactionFinale
        } else {
          let redactionFinale
          if (Math.abs(den / pgcdNumDen) - 1 !== 0)
            redactionFinale = `=${signe}\\dfrac{${Math.abs(num / pgcdNumDen)}}{${Math.abs(den / pgcdNumDen)}}`
          else redactionFinale = `=${signe}${Math.abs(num / pgcdNumDen)}`
          if (couleurFinale !== '')
            redactionFinale = miseEnEvidence(redactionFinale, couleurFinale)
          return redactionFinale
        }
      }
    }
  }

  /**
   * @return {FractionEtendue|number} NaN si la FractionEtendue n'est pas un nombre décimal sinon retourne une FractionEtendue avec la bonne puissance de 10 au dénominateur
   */
  fractionDecimale(): FractionEtendue {
    const den = Math.abs(this.simplifie().den)
    const num = Math.abs(this.simplifie().num)
    const signe = this.simplifie().signe
    const liste = obtenirListeFacteursPremiers(den)
    let n2 = 0
    let n5 = 0
    for (const n of liste) {
      if (n === 2) {
        n2++
      } else if (n === 5) {
        n5++
      } else {
        window.notify(
          'FractionEtendue.valeurDecimale :  FractionMathjs  non décimale',
          { fraction: this },
        )
        return this
      }
    }
    if (n5 === n2) {
      return new FractionEtendue(num * signe, den)
    } else if (n5 > n2) {
      return new FractionEtendue(
        signe * num * 2 ** (n5 - n2),
        den * 2 ** (n5 - n2),
      )
    } else {
      return new FractionEtendue(
        signe * num * 5 ** (n2 - n5),
        den * 5 ** (n2 - n5),
      )
    }
  }

  /**
   * Retourne la chaine latex contenant la racine carrée de la fraction
   * @param {boolean} detaillee Si detaillee est true, une étape de calcul se place avant le résultat.
   * @return {string}
   */
  texRacineCarree(detaillee: boolean = false): string {
    if (this.num === 0) {
      return '0'
    } else {
      if (this.estParfaite) {
        const rac = this.racineCarree()
        if (rac) return rac.texFraction
        else return `\\sqrt{${this.texFraction}}`
      }
      if (this.signe === -1) return 'Not a real number !'
      let factoDen: [number, number] = extraireRacineCarree(Math.abs(this.den))
      let factoNum
      let etape
      if (!this.estEntiere) {
        etape = detaillee ? `\\sqrt{\\dfrac{${this.num}}{${this.den}}}=` : ''
      } else {
        factoNum = extraireRacineCarree(Math.abs(this.num))
        if (factoNum[0] !== 1) {
          etape = detaillee ? `\\sqrt{${Math.abs(this.num)}}=` : ''
        } else {
          etape = ''
        }
      }
      if (factoDen[1] !== 1) {
        if (!this.estEntiere) {
          etape += detaillee
            ? `\\sqrt{\\dfrac{${Math.abs(this.num)}\\times ${factoDen[1]}}{${Math.abs(this.den)}\\times ${factoDen[1]}}}=`
            : ''
          etape += detaillee
            ? `\\sqrt{\\dfrac{${Math.abs(this.num * factoDen[1])}}{${Math.abs(this.den * factoDen[1])}}}=`
            : ''
        }
        factoNum = extraireRacineCarree(Math.abs(this.num * factoDen[1]))
        factoDen = extraireRacineCarree(Math.abs(this.den * factoDen[1]))
      } else {
        factoNum = extraireRacineCarree(Math.abs(this.num))
      }
      const k = new FractionEtendue(factoNum[0], factoDen[0]).simplifie()
      const r = new FractionEtendue(factoNum[1], factoDen[1]).simplifie()

      if (detaillee) {
        if (k.valeurDecimale !== 1) {
          if (k.denIrred === 1) {
            etape += detaillee
              ? `\\sqrt{${factoNum[0]}^2\\times${factoNum[1]}}=`
              : ''
            etape += detaillee
              ? `${factoNum[0]}${factoNum[1] !== 1 ? '\\sqrt{' + factoNum[1] + '}' : '}'}`
              : ''
          } else {
            if (factoNum[0] !== 1) {
              etape += detaillee
                ? `\\sqrt{\\dfrac{${factoNum[0]}^2${factoNum[1] !== 1 ? '\\times ' + factoNum[1] : ''}}{${factoDen[0]}^2${factoDen[1] !== 1 ? '\\times' + factoDen[1] : ''}}}=`
                : ''
              etape += detaillee
                ? `\\dfrac{${factoNum[0]}${factoNum[1] !== 1 ? '\\times\\sqrt{' + factoNum[1] + '}' : ''}}{${factoDen[0]}${factoDen[1] !== 1 ? '\\times\\sqrt{' + factoDen[1] + '}' : ''}}=`
                : ''
            } else {
              if (factoDen[1] !== 1) {
                etape += detaillee
                  ? `\\sqrt{\\dfrac{${factoNum[1]}}{${factoDen[0]}^2\\times ${factoDen[1]}}}=`
                  : ''
              } else {
                etape += detaillee
                  ? `\\sqrt{\\dfrac{${factoNum[1]}}{${factoDen[0]}^2}}=`
                  : ''
              }
            }
          }
        }
      }

      if (arrondi(factoNum[1] / factoDen[1], 6) === 1) {
        return etape + k.texFraction
      } else {
        if (k.numIrred === 1 && k.denIrred !== 1) {
          if (r.denIrred === 1) {
            return k.valeurDecimale === 1
              ? etape
              : etape + `\\dfrac{\\sqrt{${r.numIrred}}}{${k.denIrred}}`
          } else {
            return (
              (k.valeurDecimale === 1 ? etape : etape + k.texFraction) +
              `\\sqrt{${r.toLatex()}}`
            )
          }
        } else {
          return (
            (k.valeurDecimale === 1 ? etape : etape + k.texFraction) +
            `\\sqrt{${r.toLatex()}}`
          )
        }
      }
    }
  }

  /**
   * Retourne la racine carrée de la  FractionMathjs  si c'est une  FractionMathjs  et false sinon
   * @return {FractionEtendue|boolean}
   */
  racineCarree(): FractionEtendue | false {
    if (this.isEqual(0)) {
      return new FractionEtendue(0, 1)
    } // sqrt(0)=0
    const factoNum = extraireRacineCarree(Math.abs(this.num))
    const factoDen = extraireRacineCarree(Math.abs(this.den))
    const k = new FractionEtendue(factoNum[0], factoDen[0]).simplifie()
    const r = new FractionEtendue(factoNum[1], factoDen[1]).simplifie()
    if (r.valeurDecimale !== 1 || this.signe === -1) {
      return false
    } else {
      return k
    }
  }
}

export default FractionEtendue
