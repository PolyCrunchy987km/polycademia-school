import Decimal from 'decimal.js'
import { stringNombre, texNombre } from '../lib/outils/texNombre'
import type { IGrandeur } from '../lib/types'
export const USI = [
  'm',
  'g',
  'L',
  's',
  'm/s',
  'km/h',
  'm^3',
  '°',
  '°C',
  '€',
  "centime d'euro",
  "centimes d'euro",
  'a',
  'ha',
  'kwh',
] // Unités du Système International (pour validation)

/**
 * @class
 * @param {number|Decimal} mesure
 * @param {string} unite (cm, cm^2, m^3, L, kg, m/s, km/h, hhmmss, hdec, mindec, a, ha, ...)
 * Keeps existing behavior and adds vitesse & durée conversions.
 * @author Jean-claude Lhote et Sébastien Lozano, Nathan Scheinmann (ajout des unité de vitesse et de durée)
 */
class Grandeur implements IGrandeur {
  mesureDecimal: Decimal
  unite: string
  puissanceUnite: number
  uniteDeReference: string
  prefixe: string
  puissancePrefixe: number

  constructor(mesure: number | Decimal, unite: string) {
    this.mesureDecimal =
      mesure instanceof Decimal ? mesure : new Decimal(mesure)
    this.unite = unite
    const uniteParsee = parseUnite(unite)
    this.puissanceUnite = uniteParsee.puissanceUnite
    this.uniteDeReference = uniteParsee.uniteDeReference
    this.prefixe = uniteParsee.prefixe
    this.puissancePrefixe = uniteParsee.puissancePrefixe
  }

  get mesure() {
    return this.mesureDecimal.toNumber()
  }

  set mesure(mesure: number) {
    this.mesureDecimal = new Decimal(mesure)
  }

  /**
   * Conversion rules preserved + extended:
   * - Same reference unit with SI prefixes (existing)
   * - m^3 ↔ L (existing)
   * - m^2 ↔ a/ha (existing)
   * - NEW: vitesse (m/s ↔ km/h)
   * - NEW: durée (hhmmss ↔ hdec ↔ mindec) [base = seconds]
   * @param {string} uniteConversion
   * @returns {Grandeur}
   */
  convertirEn(uniteConversion: string) {
    const uniteConversionParsee = parseUnite(uniteConversion)

    // ===== NEW: vitesse (m/s <-> km/h) =====
    if (isVitesseUnit(this.unite) && isVitesseUnit(uniteConversion)) {
      const baseMps = toMps(this.mesureDecimal, this.unite) // → m/s
      const cible = fromMps(baseMps, uniteConversion) // → m/s -> target
      return new Grandeur(cible, uniteConversion)
    }

    // ===== NEW: durée (hhmmss <-> hdec <-> mindec) =====
    if (isDureeUnit(this.unite) && isDureeUnit(uniteConversion)) {
      const baseSeconds = toSecondsDuree(this.mesureDecimal, this.unite) // → s
      const cible = fromSecondsDuree(baseSeconds, uniteConversion) // → s -> target unit
      return new Grandeur(cible, uniteConversion)
    }

    // ===== Existing logic kept below =====
    if (
      uniteConversionParsee.puissanceUnite === this.puissanceUnite &&
      uniteConversionParsee.uniteDeReference === this.uniteDeReference
    ) {
      // Same underlying unit (e.g., m ↔ cm, m^2 ↔ cm^2, g ↔ kg, etc.)
      // factor = 10^((p_src - p_dst)*power)
      const exp = new Decimal(this.puissancePrefixe)
        .minus(uniteConversionParsee.puissancePrefixe)
        .times(this.puissanceUnite)
      const facteur = new Decimal(10).pow(exp)
      return new Grandeur(this.mesureDecimal.times(facteur), uniteConversion)
    } else if (
      uniteConversionParsee.uniteDeReference === 'm^3' &&
      this.uniteDeReference === 'L'
    ) {
      // Tout en litres -> m^3
      // src in L-derivatives to m^3: exp = (p_src - p_dst - 3)*power
      const exp = new Decimal(this.puissancePrefixe)
        .minus(uniteConversionParsee.puissancePrefixe)
        .minus(3)
        .times(this.puissanceUnite)
      const facteur = new Decimal(10).pow(exp)
      return new Grandeur(this.mesureDecimal.times(facteur), 'L') // keep target doc behavior (existing)
    } else if (
      uniteConversionParsee.uniteDeReference === 'L' &&
      this.uniteDeReference === 'm^3'
    ) {
      // Tout en m^3 -> L
      // exp = p_src*power + 3
      const exp = new Decimal(this.puissancePrefixe)
        .times(this.puissanceUnite)
        .plus(3)
      const facteur = new Decimal(10).pow(exp)
      return new Grandeur(this.mesureDecimal.times(facteur), 'm^3') // keep target doc behavior (existing)
    } else if (
      uniteConversionParsee.uniteDeReference === 'm^2' &&
      this.uniteDeReference === 'a'
    ) {
      // a/ha -> m^2
      // a = 100 m^2 ; ha = 10000 m^2
      const exp = new Decimal(this.puissancePrefixe).plus(2)
      const facteur = new Decimal(10).pow(exp)
      return new Grandeur(this.mesureDecimal.times(facteur), 'm^2')
    } else if (
      uniteConversionParsee.uniteDeReference === 'a' &&
      this.uniteDeReference === 'm^2'
    ) {
      // m^2 -> a/ha
      const exp = new Decimal(this.puissancePrefixe)
        .times(this.puissanceUnite)
        .minus(2)
      const facteur = new Decimal(10).pow(exp)
      return new Grandeur(this.mesureDecimal.times(facteur), 'a')
    } else {
      throw new Error(
        `Conversion impossible de ${this.unite} en ${uniteConversion}`,
      )
    }
  }

  estEgal(unite2: Grandeur) {
    if (unite2.uniteDeReference !== this.uniteDeReference) return false
    try {
      const u1 = this.convertirEn(this.uniteDeReference)
      const u2 = unite2.convertirEn(this.uniteDeReference)
      if (u1 && u2) {
        return u1.mesure === u2.mesure
      } else {
        return false
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * La précision est donnée dans l'unité la plus petite des deux grandeurs
   */
  estUneApproximation(unite2: Grandeur, precision: number) {
    if (unite2.uniteDeReference !== this.uniteDeReference) return false
    try {
      let u1: Grandeur
      let u2: Grandeur
      if (this.puissancePrefixe > unite2.puissancePrefixe) {
        u1 = this.convertirEn(unite2.unite)
        u2 = unite2
      } else {
        u1 = this.convertirEn(this.unite)
        u2 = unite2.convertirEn(this.unite)
      }
      if (u1 !== undefined && u2 !== undefined) {
        return Math.abs(u1.mesure - u2.mesure) <= precision
      } else {
        return false
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }

  /**
   * Retourne une chaîne :
   * - valeurs usuelles : '12,345 cm'
   * - NEW durée hhmmss : '3 h 45 min 28 s'
   */
  toString(precision = 12) {
    if (this.unite === 'hhmmss') {
      return formatHHMMSS(this.mesureDecimal)
    }
    const nbChiffrePartieDecimale = String(this.mesure).split('.')[1]?.length
    if (nbChiffrePartieDecimale < precision) precision = nbChiffrePartieDecimale
    return `${stringNombre(this.mesure, precision).replace('.', ',')}\u202f${this.unite}`
  }

  /**
   * Retourne une chaîne LaTeX :
   * - valeurs usuelles : '12,345\\text{ cm}'
   * - NEW durée hhmmss : '3~\\text{h} 45~\\text{min} 28~\\text{s}'
   */
  toTex(precision = 12) {
    if (isDureeUnit(this.unite)) {
      const sec = toSecondsDuree(this.mesureDecimal, this.unite) // Decimal seconds
      return formatDureeTexHMS(sec)
    }
    return `${texNombre(this.mesure, precision).replace('.', ',')}~\\text{${this.unite}}`
  }

  get latexUnit() {
    if (isVitesseUnit(this.unite) || isDureeUnit(this.unite)) {
      // vitesse/durée: render raw unit (already human-friendly)
      return `\\text{${this.unite}}`
    }
    return `\\text{${this.prefixe}${this.uniteDeReference.split('^')[0]}}${this.puissanceUnite === 1 ? '' : `^{${this.puissanceUnite.toString()}}`}`
  }

  /**
   * Crée une grandeur à partir d'un texte '1 cm', '2 m^2', '3~\\text{L}'...
   * (existing behavior kept; not parsing hh:mm:ss literal)
   */
  static fromString(text: string) {
    text = text.replace('\\,', '')
    text = text.replace('~', '')
    text = text.replace(',', '.')
    text = text.replace(' ', '')
    text = text.replace(/\\text{([^}]+)}/g, '$1')
    const mesure = parseFloat(text)
    const unite = text.replace(String(mesure), '')
    const grandeur = new Grandeur(mesure, unite)
    return grandeur
  }

  /**
   * Crée une grandeur de durée à partir d'une chaîne "HH:MM:SS" ou "HHMMSS".
   * La valeur interne est stockée en secondes, unité = "hhmmss".
   */
  static fromHHMMSS(text: string): Grandeur {
    const seconds = hhmmssToSeconds(text) // helper already defined below
    return new Grandeur(seconds, 'hhmmss')
  }

  /**
   * Retourne toujours la valeur convertie en HH:MM:SS (string).
   * Utile même si la grandeur n'est pas déjà en "hhmmss".
   */
  toHHMMSS(): string {
    if (!isDureeUnit(this.unite)) {
      throw new Error(
        `Impossible d'appeler toHHMMSS() sur une grandeur qui n'est pas une durée (unité: ${this.unite})`,
      )
    }
    // convertir vers hhmmss si besoin
    const enSecondes = toSecondsDuree(this.mesureDecimal, this.unite)
    return formatHHMMSS(enSecondes)
  }
}

export default Grandeur

// =======================================================
// ===== Helpers: units, parsing, vitesse & durée logic ===
// =======================================================

function isVitesseUnit(u: string) {
  return u === 'm/s' || u === 'km/h'
}

function isDureeUnit(u: string) {
  return u === 'hhmmss' || u === 'hdec' || u === 'mindec' || u === 'sec'
}

// vitesse base = m/s
function toMps(value: Decimal, unit: string): Decimal {
  if (unit === 'm/s') return value
  if (unit === 'km/h') return value.div(3.6)
  throw new Error(`Unité de vitesse inconnue: ${unit}`)
}
function fromMps(mps: Decimal, unit: string): Decimal {
  if (unit === 'm/s') return mps
  if (unit === 'km/h') return mps.times(3.6)
  throw new Error(`Unité de vitesse inconnue: ${unit}`)
}

// durée base = secondes
function toSecondsDuree(value: Decimal, unit: string): Decimal {
  if (unit === 'hhmmss') return value // convention: value already in seconds
  if (unit === 'hdec') return value.times(3600)
  if (unit === 'mindec') return value.times(60)
  if (unit === 'sec') return value // already in seconds
  throw new Error(`Unité de durée inconnue: ${unit}`)
}
function fromSecondsDuree(seconds: Decimal, unit: string): Decimal {
  if (unit === 'hhmmss') return seconds // stockée en secondes
  if (unit === 'hdec') return seconds.div(3600)
  if (unit === 'mindec') return seconds.div(60)
  if (unit === 'sec') return seconds // already in seconds
  throw new Error(`Unité de durée inconnue: ${unit}`)
}

function hhmmssToSeconds(str: string): Decimal {
  const t = str.trim()
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(t)) {
    const [H, M, S] = t.split(':').map(Number)
    return new Decimal(H).times(3600).plus(new Decimal(M).times(60)).plus(S)
  }
  if (/^\d{6}$/.test(t)) {
    const H = Number(t.slice(0, 2))
    const M = Number(t.slice(2, 4))
    const S = Number(t.slice(4, 6))
    return new Decimal(H).times(3600).plus(new Decimal(M).times(60)).plus(S)
  }
  throw new Error(`Format hhmmss invalide: "${str}"`)
}

function formatDureeTexHMS(seconds: Decimal): string {
  const total = seconds.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}~\\text{h}`)
  if (m > 0) parts.push(`${m}~\\text{min}`)
  if (s > 0) parts.push(`${s}~\\text{s}`)
  return parts.join('~')
}

function formatHHMMSS(seconds: Decimal): string {
  const total = seconds.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} h`)
  if (m > 0) parts.push(`${m} min`)
  if (s > 0) parts.push(`${s} s`)
  return parts.join(' ')
}

/**
 * parseUnite:
 *  - Keeps existing SI/prefix parsing
 *  - Adds vitesse & durée special cases with reasonable bases:
 *      vitesse -> base 'm/s'
 *      durée   -> base 's' (seconds)
 */
function parseUnite(unite: string) {
  // vitesse
  if (isVitesseUnit(unite)) {
    return {
      prefixe: '',
      uniteDeReference: 'm/s',
      puissanceUnite: 1,
      puissancePrefixe: 0,
    }
  }
  // durée
  if (isDureeUnit(unite)) {
    return {
      prefixe: '',
      uniteDeReference: 's',
      puissanceUnite: 1,
      puissancePrefixe: 0,
    }
  }

  let puissanceUnite: number
  let avantPuissanceUnite: string

  if (unite === '°') {
    puissanceUnite = 1
    avantPuissanceUnite = '°'
  }
  if (unite === '°C') {
    puissanceUnite = 1
    avantPuissanceUnite = '°C'
  }

  if (unite.indexOf('^') > 0) {
    // m^2, m^3 et dérivées
    puissanceUnite = Number(unite.split('^')[1])
    avantPuissanceUnite = unite.split('^')[0]
  } else if (unite.indexOf('ha') === 0) {
    // hectares
    puissanceUnite = 1
    avantPuissanceUnite = 'ha'
  } else if (unite.indexOf('a') === 0) {
    // ares
    puissanceUnite = 1
    avantPuissanceUnite = 'a'
  } else if (unite.indexOf('ca') === 0) {
    // centiares
    puissanceUnite = 1
    avantPuissanceUnite = 'ca'
  } else {
    // m, g, L et leurs dérivées
    puissanceUnite = 1
    avantPuissanceUnite = unite
  }

  const prefixe =
    unite === '°C'
      ? ''
      : ['t', 'q'].includes(unite)
        ? unite
        : avantPuissanceUnite.substring(0, avantPuissanceUnite.length - 1) // tonne/quintal handled below

  const puissancePrefixe = prefixeToPuissance(prefixe, unite)
  const uniteDeReference = ['t', 'q'].includes(unite)
    ? 'g'
    : unite.substring(prefixe.length)

  return { prefixe, uniteDeReference, puissanceUnite, puissancePrefixe }
}

function prefixeToPuissance(prefixe: string, unite: string) {
  let puissancePrefixe: number
  switch (prefixe) {
    case 'm':
      puissancePrefixe = -3
      break
    case 'c':
      puissancePrefixe = -2
      break
    case 'd':
      puissancePrefixe = -1
      break
    case '':
      puissancePrefixe = 0
      break
    case 'da':
      puissancePrefixe = 1
      break
    case 'h':
      puissancePrefixe = 2
      break
    case 'k':
      puissancePrefixe = 3
      break
    case 'q':
      puissancePrefixe = unite === 'q' ? 5 : NaN
      break
    case 't':
      puissancePrefixe = unite === 't' ? 6 : NaN
      break
    case 'M':
      puissancePrefixe = 6
      break
    case 'G':
      puissancePrefixe = 9
      break
    case 'T':
      puissancePrefixe = 12
      break
    case '\\mu{}':
      puissancePrefixe = -6
      break
    case 'n':
      puissancePrefixe = -9
      break
    default:
      puissancePrefixe = NaN
  }
  return puissancePrefixe
}
