// =========================================================================
//
//    Déclaration des types pour les dates déclarées en chaîne de caractères
//    source: https://gist.github.com/aperkaz/580e72b98eba5afac30549387562655d
//
// =========================================================================
type oneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type zeroToNine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
/**
 * Years
 */
export const YEARS = [...Array(199).keys()].map((x) => (x + 1900).toString())
export const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]
type YYYY = `19${zeroToNine}${zeroToNine}` | `20${zeroToNine}${zeroToNine}`
export const isYYYYType = (obj: any): obj is YYYY =>
  obj !== null &&
  typeof obj !== 'undefined' &&
  typeof obj === 'string' &&
  YEARS.includes(obj)
/**
 * Months
 */
type MM = `0${oneToNine}` | `1${0 | 1 | 2}`
/**
 * Days
 */
type DD = `${0}${oneToNine}` | `${1 | 2}${zeroToNine}` | `3${0 | 1}`
/**
 * YYYYMMDD ou DD/MM/YYYY
 */
export type RawDateString = `${YYYY}${MM}${DD}`
export type FrenchDateString = `${DD}/${MM}/${YYYY}`
/**
 * Indique s'il s'est écoulé strictement moins d'un mois depuis
 * une date passée en paramètre
 * @param {FrenchDateString} dateString date au format français (par exemple : `23/02/2011`)
 * @remark La date passée entre paramètre doit être comprise entre `01/01/1900` et `31/12/2099`
 * @returns {boolean} `true` si moins d'un mois s'est écoulé depuis la date jusqu'à l'appel de la fonction
 */
export function isLessThan1Month(
  dateString: FrenchDateString | undefined,
): boolean {
  if (dateString === undefined) return false
  const [jour, mois, annee] = dateString.split('/')
  const date = new Date(parseInt(annee), parseInt(mois) - 1, parseInt(jour))
  const elapsedTime = Date.now() - date.getTime()
  const unMois = 3600 * 24 * 30 * 1000
  return elapsedTime < unMois
}
