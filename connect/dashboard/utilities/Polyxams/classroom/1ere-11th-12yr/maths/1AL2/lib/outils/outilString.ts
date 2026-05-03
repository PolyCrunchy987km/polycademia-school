import { context } from '../../modules/context'
import { quotientier, randint } from '../../modules/outils'

/**
 * Créé un string de nbsommets caractères dans l'ordre alphabétique et en majuscule qui ne soit pas dans la liste donnée en 2e argument
 * @param {number} nbsommets
 * @param {string|string[]} listeAEviter
 * @author Rémi Angot
 * Ajout des while pour s'assurer de bien avoir des lettres majuscules le 08/05/2022 par Guillaume Valmont
 **/
export function creerNomDePolygone(
  nbsommets: number,
  listeAEviter: string | string[] = [],
) {
  let premiersommet = randint(65, 90 - nbsommets)
  let polygone = ''
  if (typeof listeAEviter === 'string') listeAEviter = Array.from(listeAEviter)
  for (let i = 0; i < nbsommets; i++) {
    let augmentation = i
    while (premiersommet + augmentation > 90) augmentation -= 26
    while (premiersommet + augmentation < 65) augmentation += 26
    polygone += String.fromCharCode(premiersommet + augmentation)
  }

  if (listeAEviter.length <= 26 - nbsommets) {
    // On évite la liste à éviter si elle n'est pas trop grosse sinon on n'en tient pas compte
    let cpt = 0
    while (possedeUnCaractereInterdit(polygone, listeAEviter) && cpt < 20) {
      polygone = ''
      premiersommet = randint(65, 90 - nbsommets)
      for (let i = 0; i < nbsommets; i++) {
        polygone += String.fromCharCode(premiersommet + i)
      }
      cpt++ // Au bout de 20 essais, on laisse tomber la liste à éviter
    }
  } else {
    console.info(
      'Trop de questions donc plusieurs polygones peuvent avoir le même nom',
    )
  }
  return polygone
}

/**
 * Vérifie dans un texte si un de ses caractères appartient à une liste à éviter
 * @author Rémi Angot
 */
export function possedeUnCaractereInterdit(
  texte: string,
  listeAEviter: string[],
) {
  let result = false
  for (const motAeviter of listeAEviter) {
    for (let i = 0; i < motAeviter.length; i++) {
      if (texte.indexOf(motAeviter[i]) > -1) {
        result = true
      }
    }
  }
  return result
}

/**
 * Renvoie une lettre majuscule depuis un nombre compris entre 1 et 702
 * Le 2e paramètre est un booléen qui permet d'éviter la lettre D (et donc décale tout d'une lettre après le C) en vue du bug de MathLive
 * @author Rémi Angot
 *@Example
 * // 0 -> @ 1->A ; 2->B...
 * // 27->AA ; 28 ->AB ...
 */
export function lettreDepuisChiffre(i: number, saufD = false) {
  let result = ''
  if (i <= 26) {
    result = String.fromCharCode(64 + i)
    if (saufD && i >= 4) result = String.fromCharCode(64 + i + 1)
  } else {
    if (i % 26 === 0) {
      result = String.fromCharCode(64 + Math.floor(i / 26) - 1)
      result += String.fromCharCode(64 + 26)
    } else {
      result = String.fromCharCode(64 + Math.floor(i / 26))
      result += String.fromCharCode(64 + (i % 26))
    }
  }
  return result
}

/**
 * Renvoie une lettre minuscule depuis un nombre compris entre 1 et 702
 * @author Rémi Angot
 *@Example
 * // 0 -> @ 1->a ; 2->b...
 * // 27->aa ; 28 ->ab ...
 */
export function lettreMinusculeDepuisChiffre(i: number) {
  return lettreDepuisChiffre(i).toLowerCase()
}

/**
 * Renvoie une lettre majuscule (éventuellement indicée) depuis un nombre compris entre 1 et... sans limite.
 * @author Eric Elter
 *@Example
 * // 0 -> @ 1->A ; 2->B...
 * // 27->A_1 ; 28 ->A_2 ...
 */
export function lettreIndiceeDepuisChiffre(i: number) {
  const indiceLettre =
    quotientier(i - 1, 26) === 0 ? '' : quotientier(i - 1, 26)
  return (
    String.fromCharCode(64 + ((i - 1) % 26) + 1) +
    (i > 26 ? `_{${indiceLettre}}` : '')
  )
}

/**
 * Renvoie une lettre minuscule (éventuellement indicée) depuis un nombre compris entre 1 et... sans limite.
 * @author EricElter
 *@Example
 * // 0 -> @ 1->a ; 2->b...
 * // 27->a_1 ; 28 ->a_2 ...
 */
export function lettreIndiceeMinusculeDepuisChiffre(i: number) {
  return lettreIndiceeDepuisChiffre(i).toLowerCase()
}

/**
 * Renvoie un espace insécable pour le mode texte suivant la sortie html ou Latex.
 * @author Jean-Claude Lhote
 */
export function sp(nb = 1) {
  let s = ''
  for (let i = 0; i < nb; i++) {
    if (context.isHtml) s += '&nbsp;'
    else s += '\\,'
  }
  return s
}

export function insertCharInString(str: string, index: number, char: string) {
  return str.substring(0, index) + char + str.substring(index, str.length)
}

/**
 * Convertit en majuscule la première lettre
 * @author Rémi Angot
 */
export function premiereLettreEnMajuscule(text: string) {
  if (typeof text === 'string' && text.length > 0)
    return (text + '').charAt(0).toUpperCase() + text.substring(1)
  else return ''
}

/**
 * Crée une liste de questions alphabétique
 * @param {number} k valeur numérique
 * @author Sébastien Lozano (Rajout par EE, l'opportunité d'enlever l'espace final qui est par défaut)
 */
export function numAlpha(k: number, nospace = false) {
  if (context.isHtml)
    return (
      '<span style="color:#f15929; font-weight:bold">' +
      String.fromCharCode(97 + k) +
      ')' +
      (nospace ? '' : '&nbsp;') +
      '</span>'
    )
  else
    return (
      '\\textbf {' + String.fromCharCode(97 + k) + '.}' + (nospace ? '' : ' ')
    )
}

/**
 * Crée une liste de questions numérique
 * @param {number} k valeur numérique
 * @author Eric Elter
 */
export function numAlphaNum(k: number, nospace = false) {
  k = k + 1
  if (context.isHtml)
    return (
      '<span style="color:#f15929; font-weight:bold">' +
      k +
      ')' +
      (nospace ? '' : '&nbsp;') +
      '</span>'
    )
  else return '\\textbf {' + k + '.}' + (nospace ? '' : ' ')
}

export function reverseString(s: string) {
  let str = ''
  for (let i = 0; i < s.length; i++) {
    str += s[s.length - 1 - i]
  }
  return str
}
