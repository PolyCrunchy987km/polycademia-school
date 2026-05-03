/**
 * Retourne le signe d'un nombre
 * @Example
 * // + ou -
 * @author Rémi Angot
 */
import Decimal from 'decimal.js'
import { enleveElement } from './arrayOutils'

export function signe(a: number) {
  // + ou -
  let result
  if (a > 0) {
    result = '+'
  } else {
    result = '-'
  }
  return result
}

/**
 * Retourne la somme des chiffres (ou d'un tableau de chiffres) d'un nombre en valeur et sous forme de String [valeur, String]
 * @Example
 * sommeDesChiffres(123)
 * // [ 6, '1+2+3']
 * @author Rémi Angot
 * (Rajout Tableau par EE)
 */ export function sommeDesChiffres(n: number | number[]): [number, string] {
  let nString
  if (Array.isArray(n)) nString = n.join('').toString()
  else nString = n.toString()
  let somme = 0
  let sommeString = ''
  for (let i = 0; i < nString.length - 1; i++) {
    if (
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(nString[i]) !==
      -1
    ) {
      sommeString += nString[i] + '+'
      somme += Number(nString[i])
    }
  }
  if (
    ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(
      nString[nString.length - 1],
    ) !== -1
  ) {
    sommeString += nString[nString.length - 1]
    somme += Number(nString[nString.length - 1])
  }
  return [somme, sommeString]
}

/**
 * Retourne l'arrondi (par défaut au millionième près)
 * @author Rémi Angot
 * @param {number} nombre
 * @param {number} precision
 * @return {number}
 */
export function arrondi(nombre: number, precision = 6) {
  if (isNaN(nombre)) {
    window.notify("Le nombre à arrondir n'en est pas un, ça retourne NaN", {
      nombre,
      precision,
    })
    return NaN
  } else {
    return Math.round(nombre * 10 ** precision) / 10 ** precision
  }
}

export function round(valeur: number, precision: number = 0): number {
  const factor = Math.pow(10, precision)
  return Math.round(valeur * factor) / factor
}

/**
 * Retourne la troncature signée de nombre.
 * @author Jean-claude Lhote
 */
export function troncature(nombre: number, precision: number) {
  const tmp = Math.pow(10, precision)
  const absolu = new Decimal(nombre).abs()
  const tronc = absolu.mul(tmp).floor().div(tmp)
  if (nombre < 0) return tronc.mul(-1).toNumber()
  else return tronc.toNumber()
}

/**
 * Renvoie la valeur absolue
 * @author Rémi Angot + ajout du support des décimaux par Jean-claude Lhote
 * @returns {number|Decimal}
 */
export function abs<T extends number | Decimal>(a: T): T {
  if (a instanceof Decimal) return a.abs() as T
  return Math.abs(a) as T
}

/**
 * prend une liste de nombres relatifs et la retourne avec les positifs au début et les négatifs à la fin.
 * @param {array} liste la liste de nombres à trier
 */
export function triePositifsNegatifs(liste: number[]) {
  const positifs = []
  const negatifs = []
  for (let i = 0; i < liste.length; i++) {
    if (liste[i] > 0) positifs.push(liste[i])
    else negatifs.push(liste[i])
  }
  return positifs.concat(negatifs)
}

/**
 * Renvoie le nombre de chiffres de la partie décimale
 * @param {number} nb : nombre décimal
 * @param {number} except : chiffre à ne pas compter (0 par exemple) [Ajout EE]
 * @author Rémi Angot
 */
export function nombreDeChiffresDansLaPartieDecimale(
  nb: number | string | Decimal,
  except?: number,
) {
  let sauf = 0
  if (nb instanceof Decimal || typeof nb === 'number') nb = nb.toString()
  if (nb.indexOf('.') > 0) {
    if (except && !isNaN(except))
      sauf = String(nb).split('.')[1].split(String(except)).length - 1
    return nb.split('.')[1].length - sauf
  } else {
    return 0
  }
}

/**
 * Renvoie le nombre de chiffres dans la partie entière
 * @author ?
 */
export function nombreDeChiffresDansLaPartieEntiere(
  nb: number,
  except?: number,
) {
  let nombre
  let sauf = 0
  if (nb < 0) {
    nombre = -nb
  } else {
    nombre = nb
  }
  if (String(nombre).indexOf('.') > 0) {
    if (except && !isNaN(except))
      sauf = String(nombre).split('.')[0].split(String(except)).length - 1
    return String(nombre).split('.')[0].length - sauf
  } else {
    // if (!isNaN(except)) sauf = (String(nombre).split(String(except)).length - 1) @fixme à quoi sert cette affectation inutile ?
    return String(nombre).length
  }
}

/**
 * Renvoie le nombre de chiffres d'un nombre décimal
 * @param {number} nb : nombre décimal
 * @param {number} except : chiffre à ne pas compter (0 par exemple) [Ajout EE]
 * @author Jean-claude Lhote
 */
export function nombreDeChiffresDe(nb: number | Decimal, except?: number) {
  if (nb instanceof Decimal) nb = nb.toNumber()
  return (
    nombreDeChiffresDansLaPartieDecimale(nb, except) +
    nombreDeChiffresDansLaPartieEntiere(nb, except)
  )
}

/**
 *
 * x le nombre dont on cherche l'ordre de grandeur
 * type = 0 pour la puissance de 10 inférieure, 1 pour la puissance de 10 supérieur et 2 pour la plus proche
 */
export function ordreDeGrandeur(x: number, type: number) {
  let signe
  if (x < 0) signe = -1
  else signe = 1
  x = Math.abs(x)
  const P = 10 ** Math.floor(Math.log10(x))
  if (type === 0) return P * signe
  else if (type === 1) return P * 10 * signe
  else if (x - P < 10 * P - x) return P * signe
  else return P * 10 * signe
}

/**
 * Retourne une liste des entiers de 0 à max sans appartenir à une liste donnée
 * @param {number} max
 * @param {number[]} listeAEviter
 *
 * @example
 * // Renvoie [0,1,4,5,6,7,8,9,10]
 * range(10,[2,3])
 *
 * @author Rémi Angot
 */
export function range(max: number = 10, listeAEviter: number[] = []) {
  // Créer un tableau avec toutes les valeurs de 0 à max sauf celle de la liste à éviter
  const liste = [...Array(max + 1).keys()]
  for (let i = 0; i < listeAEviter.length; i++) {
    enleveElement(liste, listeAEviter[i])
  }
  return liste
}

/**
 * Retourne une liste entre 2 bornes sans appartenir à une liste donnée (par défaut des entiers, mais on peut changer le pas)
 * @param {number} min
 * @param {number} max
 * @param {number[]} listeAEviter
 * @param {number} step
 * @example
 * // Renvoie [6,7,10]
 * rangeMinMax(6,10,[8,9])
 *
 * @author Rémi Angot
 */
export function rangeMinMax(
  min: number,
  max: number,
  listeAEviter: number | number[] = [],
  step = 1,
) {
  // Créer un tableau avec toutes les valeurs de 0 à max sauf celle de la liste à éviter
  const liste = []
  for (let i = min; i <= max; i = i + step) {
    liste.push(i)
  }
  if (typeof listeAEviter === 'number') listeAEviter = [listeAEviter]
  for (let i = 0; i < listeAEviter.length; i++) {
    enleveElement(liste, listeAEviter[i])
  }
  return liste
}

/**
 * Créé un tableau avec toutes les valeurs de 1 à max sauf celle de la liste à éviter
 *
 *
 * @param {number} max
 * @param {number[]} listeAEviter valeurs à éviter
 * @author Rémi Angot
 */
export function range1(max: number = 10, listeAEviter: number[] = []) {
  const liste = []
  for (let i = 1; i <= max; i++) {
    liste.push(i)
  }
  for (let i = 0; i < listeAEviter.length; i++) {
    enleveElement(liste, listeAEviter[i])
  }
  return liste
}

/**
 * Fonction de comparaison à utiliser avec <tableau.sort(compareNombres)>
 *
 *
 * @author Rémi Angot
 */
export function compareNombres(a: number, b: number) {
  return a - b
}

/**
 *
 * Copié sur https://delicious-insights.com/fr/articles/le-piege-de-array-sort/
 */
export function numTrie(arr: number[]) {
  return arr.sort(function (a, b) {
    return a - b
  })
}

/**
 *
 * @param {number} a
 * -1 si a est négatif, 1 sinon.
 * @author Jean-claude Lhote
 */
export function unSiPositifMoinsUnSinon(a: number) {
  if (a < 0) return -1
  else return 1
}

/**
 *
 * @param a retourne vrai si tous les éléments de a sont de même signe
 * @returns boolean
 * @author Jean-claude Lhote
 */
export function tousDeMemeSigne(a: number[]) {
  if (a.length === 0) return true
  return a.every((val) => {
    return signe(val) === signe(a[0])
  })
}
