import type { CleaningOperation } from '../types'

//     ██████ ██      ███████  █████  ███    ██ ███████ ██████
//    ██      ██      ██      ██   ██ ████   ██ ██      ██   ██
//    ██      ██      █████   ███████ ██ ██  ██ █████   ██████
//    ██      ██      ██      ██   ██ ██  ██ ██ ██      ██   ██
//     ██████ ███████ ███████ ██   ██ ██   ████ ███████ ██   ██
//
//
/**
 * Nettoie la saisie des \\dfrac en les remplaçant par des \frac comprises par ComputeEngine
 * @param {string} str
 */
function cleanFractions(str: string): string {
  return str.replaceAll(/dfrac/g, 'frac')
}
/**
 * Nettoie la saisie des \\frac pour mieux gérer les fractions négatives et que le moins soit toujours au dénominateur
 * Rajout des regex de MD pour gérer les fractions négatives (30/08/2024 : pas de solution directement par ComputeEngine mais ArnoG est sur le coup)
 * Cette fonction est amené à remplacer cleanFractions mais dans le doute (laissons-lui du temps pour vérifier qu'elle ne buggue pas), et pour vexer personne, je la mets en doublon.
 * @param {string} str
 * @author Éric Elter
 */
function cleanFractionsMemesNegatives(str: string): string {
  // EE :
  let modif: string
  modif = str.replaceAll(/dfrac/g, 'frac')

  // regex made by Mathieu Degrange
  modif = modif.replace(
    /^-\\frac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i,
    (match, p1, p2, p3, p4) =>
      `\\frac{${(p1 || p3) * (p2 || p4) > 0 ? '-' : ''}${Math.abs(p1 || p3)}}{${Math.abs(p2 || p4)}}`,
  ) // Permet de transformer -\frac{13}{15} en \frac{-13}{15} et -\frac{-13}{15} en \frac{13}{15}

  modif = modif.replace(
    /^\\frac(?:(\d)(\d)|{(-?\d+)}{(-?\d+)})$/i,
    (match, p1, p2, p3, p4) =>
      `\\frac{${(p1 || p3) * (p2 || p4) < 0 ? '-' : ''}${Math.abs(p1 || p3)}}{${Math.abs(p2 || p4)}}`,
  ) // Permet de transformer \frac{-13}{-15} en \frac{13}{15}

  return modif
}
/**
 * Nettoie la saisie des \\div en les remplaçant par des / compris par ComputeEngine
 * @param {string} str
 */
function cleanDivisions(str: string): string {
  return str.replaceAll(/\\div/g, '/')
}
/**
 * Remplace les virgules non échappées par des points.
 * @param {string} str
 * @returns {string}
 */
function replaceUnescapedCommas(str: string): string {
  return str.replace(/,/g, (match, offset, string) => {
    // Vérifie si la virgule est précédée d'un antislash
    if (offset > 0 && string[offset - 1] === '\\') {
      return match // Ne remplace pas la virgule échappée
    }
    return '.'
  })
} /**
 * Remplace les espaces fins `\,` par une chaîne vide.
 * @param {string} str
 * @returns {string}
 */
function replaceThinSpaces(str: string): string {
  return str.replaceAll(/\\,/g, '')
}
/**
 *
 * Nettoie la saisie des virgules décimales en les remplaçant par des points.
 * @warning Attention ne fonctionne avec Safari que depuis 2023
 * @param {string} str
 */
function cleanComas(str: string): string {
  return replaceThinSpaces(replaceUnescapedCommas(str.replaceAll(/\{,}/g, '.')))
}
/**
 * Supprime tous les espaces "classiques" et les espaces LaTeX d'une chaîne.
 *
 * Espaces supprimés :
 * - Espaces standards (espace, tab, retour ligne, etc.)
 * - `~` (espace insécable LaTeX)
 * - `\,` (petit espace LaTeX)
 * - `\:` (espace moyen LaTeX)
 * - `\;` (espace large LaTeX)
 * - `\!` (espace négatif LaTeX)
 * - `\quad` (espace quad LaTeX)
 * - `\qquad` (espace double quad LaTeX)
 *
 * @param {string} str - La chaîne à nettoyer.
 * @returns {string} La chaîne sans aucun espace ni commande d'espacement LaTeX.
 *
 * @example
 * removeLatexSpaces("Hello ~ world\\, test \\: math \\quad fini");
 * // → "Helloworldtestmathfini"
 *
 * @author Éric Elter
 */
function cleanSpaces(str: string): string {
  const patterns = [
    /\s/g, // espaces normaux (tab, retour ligne…)
    /~/g, // espace insécable (~)
    /\\,/g, // petit espace \,
    /\\:/g, // espace moyen \:
    /\\;/g, // espace large \;
    /\\!/g, // espace négatif \!
    /\\quad/g, // espace quad
    /\\qquad/g, // espace double quad
  ]

  for (const regex of patterns) {
    str = str.replace(regex, '')
  }
  return str
}
/**
 * Réduit les espaces doubles ou triples à de simples espaces mais ne supprime pas les simples espaces
 * supprime aussi les espaces simples en début et fin de saisie
 */
function cleanDoubleSpaces(str: string): string {
  let s = str
  while (s.includes('  ')) {
    s = s.replace('  ', ' ')
  }
  if (s[0] === ' ') s = s.substring(1, s.length)
  if (s[s.length - 1] === ' ') s = s.substring(0, s.length - 1)
  return s
}
/**
 * Remplace les espaces Latex par des espaces normaux
 * @param {string} str
 */
function cleanEspaceNormal(str: string): string {
  return str.replaceAll(/\\,/g, ' ')
}
/**
 * Nettoie les parenthèses en remplaçant par celles supportées par le ComputeEngine
 * @param {string} str
 */
function cleanParentheses(str: string): string {
  return str
    .replaceAll(/\\lparen(\+?-?\d+,?\.?\d*)\\rparen/g, '($1)')
    .replaceAll(/\\left\((\+?-?\d+)\\right\)/g, '($1)')
    .replaceAll(/\\lparen(\+?-?\d+)\\rparen/g, '($1)')
    .replaceAll(/\\left\\{(.*?)\\right\\}/g, '\\{$1\\}')
    .replaceAll('\\lparen', '(')
    .replaceAll('\\rparen', ')')
    .replaceAll('\\left\\lbrack', '[')
    .replaceAll('\\right\\rbrack', ']')
    .replaceAll('\\right\\lbrack', '[')
    .replaceAll('\\left\\rbrack', ']')
    .replaceAll('\\left[', '[')
    .replaceAll('\\right]', ']')
    .replaceAll('\\right[', '[')
    .replaceAll('\\left]', ']')
    .replace(/\{\}/g, (match, offset, string) => {
      // Vérifie si les accolades sont précédées de ^ ou si elles sont seules dans la chaîne
      if (offset > 0 && string[offset - 1] === '^') {
        return match // Conserve les ^{}
      }
      if (string === '{}') {
        return match // Conserve les chaînes uniquement contenant {}
      }
      return '' // Remplace les autres occurrences de {}
    }) // Cela permet de supprimer les doubles accolades vierges sauf :

  // quand elles sont précédées de ^ (cette gestion est propre aux puissances)
  // et que la chaine ne contient que {} (qui serait le cas d'un ensemble vide)
}
/**
 * Nettoie les accolades en remplaçant par celles supportées par le ComputeEngine
 * @param {string} str
 */
function cleanAccolades(str: string): string {
  return str
    .replaceAll(/\\left\\lbrace/g, '\\{')
    .replaceAll(/\\right\\rbrace/g, '\\}')
  // .replaceAll('\\{', '{')
  // .replaceAll('\\}', '}')
}
function cleanMathRm(str: string): string {
  return str.replace(/\\mathrm\{(\w+)}/g, '$1')
}
function cleanImaginaire(str: string): string {
  return str.replace(/\\mathrm\{i\}|\{i\}/g, 'i')
}
function cleanOperatorName(str: string): string {
  return str
    .replace(/\\operatorname\{\s*\}/g, ' ') // remplace les accolades vides
    .replace(/\\operatorname(?!\s*\{)/g, '') // supprime operatorname sans accolades
}
/**
 * Nettoie le latex \text{} mis pour séparer le nombre de l'unité en mode texte
 * @param {string} str
 */
function cleanUnity(str: string): string {
  return str
    .replaceAll('}}', '')
    .replaceAll('{\\text{', '')
    .replaceAll('{\\:\\text{', '')
    .replaceAll('}\\:}', '')
}
/**
 * Nettoie tout ce qui peut arriver à l'utilisation des puissances
 * @param {string} str
 */
function cleanPower(str: string): string {
  return str
    .replaceAll('²', '^2') // '²' c'est pas correct en latex !
    .replaceAll('³', '^3') // '³' non plus
    .replaceAll('^{}', '') // les exposants vides, il n'aime pas ça non plus
    .replaceAll('^{^', '^{') // EE : Pour supprimer les puissances de puissances malencontreuses
}
/**
 * transforme \text{truc} en truc utiliser cleanUnity si le \text{} est au milieu de la chaine.
 * @param str
 */
function cleanLatex(str: string): string {
  const text = str.match(/(\\text\{)(.*)}/)
  if (text && text?.length > 2) return text[2]
  return str
}
function cleanMultiplyByOne(str: string): string {
  // 🔹 Regex améliorée :
  // (^|[^\d.,\{]) → début de chaîne ou caractère qui n’est pas chiffre, point, virgule ou '{'
  // 1([a-z]) → le '1' suivi d'une lettre (variable)
  const regex = /(^|[^\d.,\\{])1([a-z])/g

  // 🔹 Si rien à remplacer, on retourne directement la chaîne
  if (!str.match(regex)) return str

  // 🔹 Remplace toutes les occurrences : on garde le caractère précédent ($1) et la lettre ($2), on supprime le '1'
  return str.replace(regex, '$1$2')
}

export function generateCleaner(
  operations: CleaningOperation[],
): (str: string) => string {
  const cleaningFunctions = operations.map((operation) => {
    switch (operation) {
      case 'fractions':
        return cleanFractions
      case 'imaginaires':
        return cleanImaginaire
      case 'fractionsMemesNegatives':
        return cleanFractionsMemesNegatives
      case 'virgules':
        return cleanComas
      case 'espaces':
        return cleanSpaces
      case 'parentheses':
        return cleanParentheses
      case 'accolades':
        return cleanAccolades
      case 'puissances':
        return cleanPower
      case 'mathrm':
        return cleanMathRm
      case 'operatorName':
        return cleanOperatorName
      case 'divisions':
        return cleanDivisions
      case 'latex':
        return cleanLatex
      case 'foisUn':
        return cleanMultiplyByOne
      case 'unites':
        return cleanUnity
      case 'doubleEspaces':
        return cleanDoubleSpaces
      case 'espaceNormal':
        return cleanEspaceNormal
      default:
        throw new Error(`Unsupported cleaning operation: ${operation}`)
    }
  })

  return (str: string) => {
    let cleaned = String(str)

    // Supprimer tous les '_{}' et tous les '^{}'
    cleaned = cleaned.replaceAll('_{}', '').replaceAll('^{}', '')

    // Appliquer les fonctions de nettoyage
    return cleaningFunctions.reduce(
      (result, cleaningFn) => cleaningFn(result),
      cleaned,
    )
  }
}
