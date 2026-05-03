/**
 * couleurAleatoire() renvoie le code d'une couleur au hasard
 *
 * @author Rémi Angot
 */
import Decimal from 'decimal.js'
import { context } from '../../modules/context'
import { choice } from '../outils/arrayOutils'
import { texNombre } from '../outils/texNombre'

type Colors =
  | 'white'
  | 'black'
  | 'red'
  | 'green'
  | 'blue'
  | 'cyan'
  | 'magenta'
  | 'yellow'
const colors: Colors[] = [
  'white',
  'black',
  'red',
  'green',
  'blue',
  'cyan',
  'magenta',
  'yellow',
]

export function couleurAleatoire(): Colors {
  return choice(colors) as Colors
}

/**
 * couleurTab() renvoie :
 * soit le code d'une couleur au hasard, ainsi que sa traduction française au masculin et au féminin,
 * soit le code d'une couleur imposée, ainsi que sa traduction française au masculin et au féminin.
 * @example couleurTab() peut renvoyer ['black','noir','noire'].
 * @example couleurTab(0) renverra de façon certaine ['black','noir','noire'].
 * @author Eric Elter
 */
export function couleurTab(choixCouleur = 999) {
  const panelCouleurs = [
    ['black', 'noir', 'noire'],
    ['red', 'rouge', 'rouge'],
    ['green', 'vert', 'verte'],
    ['blue', 'bleu', 'bleue'],
    ['HotPink', 'rose', 'rose'],
    ['Sienna', 'marron', 'marron'],
    ['darkgray', 'gris', 'grise'],
    ['DarkOrange', 'orange', 'orange'],
  ]
  return choixCouleur === 999 ||
    choixCouleur >= panelCouleurs.length ||
    !Number.isInteger(choixCouleur)
    ? choice(panelCouleurs)
    : panelCouleurs[choixCouleur]
}

export function arcenciel(i: number, fondblanc = true) {
  let couleurs
  if (fondblanc)
    couleurs = ['violet', 'purple', 'blue', 'green', 'lime', '#f15929', 'red']
  else
    couleurs = ['violet', 'indigo', 'blue', 'green', 'yellow', '#f15929', 'red']
  return couleurs[i % 7]
}

export function texcolors(i: number, fondblanc = true) {
  const couleurs = [
    'black',
    'blue',
    'GreenYellow',
    'brown',
    'LightSlateBlue',
    'cyan',
    'darkgray',
    'HotPink',
    'LightSteelBlue',
    'Chocolate',
    'gray',
    'green',
    'lightgray',
    'lime',
    'magenta',
    'olive',
    'DarkOrange',
    'pink',
    'purple',
    'red',
    'teal',
    'violet',
    'white',
    'yellow',
  ]
  if (fondblanc && i % couleurs.length >= couleurs.length - 2) i += 2
  return couleurs[i % couleurs.length]
}

/**
 * Met gras un texte
 * @param {string} texte à mettre en gras
 * @author Rémi Angot
 */
export function texteGras(texte: string | number) {
  if (typeof texte === 'number') texte = String(texte)
  if (context.isHtml) {
    return `<b>${texte}</b>`
  } else {
    return `\\textbf{${texte}}`
  }
}

/**
 * Pour bien afficher les centimes avec 2 chiffres après la virgule
 * @author Rémi Angot
 */
export function texPrix(nb: Decimal | number) {
  if (nb instanceof Decimal) {
    if (nb.isInteger()) return texNombre(nb, 0)
    else return texNombre(nb, 2, true)
  }
  const nombre = Number(nb)
  if (nombre.toString() === nombre.toFixed(0)) {
    return texNombre(nb, 0)
  } else {
    return texNombre(nb, 2, true)
  }
}

/**
 * Pour afficher les masses avec 3 chiffres après la virgule
 * @author Mireille Gain
 */
export function texMasse(nb: Decimal | number) {
  if (nb instanceof Decimal) {
    if (nb.isInteger()) return texNombre(nb, 0)
    else return texNombre(nb, 3, true)
  }
  const nombre = Number(nb)
  if (nombre.toString() === nombre.toFixed(0)) {
    return texNombre(nb, 0)
  } else {
    return texNombre(nb, 3, true)
  }
}

/**
 * Retourne le code LateX correspondant à un symbole
 * @param {string} symbole
 * @returns {string} string
 * @author Guillaume Valmont
 * @example texSymbole('≤') retourne '\\leqslant'
 */
export function texSymbole(symbole: '≤' | '≥' | '<' | '>' | '\\') {
  switch (symbole) {
    case '<':
      return '<'
    case '>':
      return '>'
    case '≤':
      return '\\leqslant'
    case '≥':
      return '\\geqslant'
    case '\\':
      return '\\smallsetminus'
    default:
      return symbole
  }
}
