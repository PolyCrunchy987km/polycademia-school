import Decimal from 'decimal.js'
import { context } from '../../modules/context'
import type { IFractionEtendue } from '../../modules/FractionEtendue.type'
import { Complexe } from '../mathFonctions/Complexe'
import { extraireRacineCarree } from './calculs'
import { miseEnEvidence } from './embellissements'
import { nombreDeChiffresDansLaPartieDecimale, round } from './nombres'

// Garde structurel pour détecter une FractionEtendue
const isFractionEtendue = (x: unknown): x is IFractionEtendue =>
  typeof x === 'object' &&
  x !== null &&
  typeof (x as any).sommeFraction === 'function'

/**
 *
 * @param {number} n
 * retourne le code Latex de la racine carrée de n réduite
 * @author Jean-claude Lhote
 */
export function texRacineCarree(n: number) {
  const result = extraireRacineCarree(n)
  if (result[1] === 1) return `${result[0]}`
  else if (result[0] === 1) return `\\sqrt{${result[1]}}`
  else return `${result[0]}\\sqrt{${result[1]}}`
}

/**
 * renvoie le résultat de l'expression en couleur (vert=positif, rouge=négatif, noir=nul)
 * @param {number|Decimal} nombre l'expression à calculer
 * @param {string} positif couleur si positif
 * @param {string} negatif couleur si negatif
 * @param {string} nul couleur si 0
 * @param {number} precision
 */
export function texNombreCoul(
  nombre: number | Decimal,
  positif = 'green',
  negatif = 'red',
  nul = 'black',
  precision: number,
) {
  if (typeof nombre === 'string') {
    window.notify(
      "texNombreCouleur appelé avec un string à la place d'un nombre",
      { nombre },
    )
  }
  if (nombre instanceof Decimal) {
    if (nombre.isZero()) return miseEnEvidence(texNombre(0, precision), nul)
    else if (nombre.isNeg())
      return miseEnEvidence(texNombre(nombre, precision), negatif)
    else return miseEnEvidence(texNombre(nombre, precision), positif)
  } else {
    if (nombre > 0) return miseEnEvidence(texNombre(nombre, precision), positif)
    else if (nombre < 0)
      return miseEnEvidence(texNombre(nombre, precision), negatif)
    else return miseEnEvidence(texNombre(0, precision), nul)
  }
}

/**
 * @author Frédéric Piou
 * @param {number} nb
 * @returns retourne un nombre au format français
 */
export function numberFormat(nb: number) {
  return Intl.NumberFormat('fr-FR', { maximumFractionDigits: 20 })
    .format(nb)
    .toString()
    .replace(/\s+/g, '\\thickspace ')
}

/**
 * La chaîne de caractères en sortie doit être interprétée par KateX et doit donc être placée entre des $ $
 * Renvoie "Trop de chiffres" s'il y a plus de 15 chiffres significatifs (et donc un risque d'erreur d'approximation)
 * S'utilise indifféremment avec des nombres (nb) au format natif (entier, flottant) ou au format Decimal (nécessite la librairie decimal.js)
 * Avec comme avantage immédiat pour le format Decimal : precision est illimité.
 * Sinon, renvoie un nombre dans le format français (avec une virgule et des espaces pour séparer les classes dans la partie entière et la partie décimale)
 * @author Guillaume Valmont
 * @param {number|Decimal|FractionEtendue} nb nombre qu'on veut afficher
 * @param {number} precision nombre de décimales demandé
 * @param {boolean} completerZeros si true, le nombre de décimale en precision est imposé (ajout de zéros inutiles éventuels)
 * @param {boolean} aussiCompleterEntiers si true ajoute des zéros inutiles aux entiers si compléterZeros est true aussi
 * @returns string avec le nombre dans le format français à mettre entre des $ $
 */
export function texNombre(
  nb: number | Decimal | IFractionEtendue | Complexe,
  precision = 8,
  completerZeros = false,
  aussiCompleterEntiers = false,
) {
  // if (precision == null) window.notifyLocal('Il faut 2 arguments à texNombre ! La précision attendue est obligatoire !', { nombre: nb, precision })
  if (typeof nb === 'string') {
    window.notify("texNombre appelé avec un string à la place d'un nombre", {
      nombre: nb,
    })
    nb = Number(nb)
  }
  const result = afficherNombre(
    nb,
    precision,
    'texNombre',
    completerZeros,
    aussiCompleterEntiers,
  )
  return (result ?? '').replace(',', '{,}').replace(/\s+/g, '\\,')
}

/**
 * Renvoie un nombre dans le format français (séparateur de classes) pour la partie entière comme pour la partie décimale
 * @author Rémi Angot
 */
export function texNombre2(nb: number) {
  if (typeof nb === 'string') {
    window.notify("texNombre2 appelé avec un string à la place d'un nombre", {
      nombre: nb,
    })
  }
  let nombre = stringNombre(nb)
  const rangVirgule = nombre.indexOf(',')
  let partieEntiere
  if (rangVirgule !== -1) {
    partieEntiere = nombre.substring(0, rangVirgule)
  } else {
    partieEntiere = nombre
  }
  let partieDecimale = ''
  if (rangVirgule !== -1) {
    partieDecimale = nombre.substring(rangVirgule + 1)
  }

  for (let i = partieEntiere.length - 3; i > 0; i -= 3) {
    partieEntiere =
      partieEntiere.substring(0, i) + '\\,' + partieEntiere.substring(i)
  }
  for (let i = 3; i < partieDecimale.length; i += 5) {
    partieDecimale =
      partieDecimale.substring(0, i) + '\\,' + partieDecimale.substring(i)
    i += 12
  }
  if (partieDecimale === '') {
    nombre = partieEntiere
  } else {
    nombre = partieEntiere + '{,}' + partieDecimale
  }
  return nombre
}

/**
 * Renvoie un nombre dans le format français (séparateur de classes)
 * Fonctionne sans le mode maths contrairement à texNombre()
 * insereEspaceDansNombre fonctionne peut-être mieux
 * @author Rémi Angot
 */
export function nombreAvecEspace(nb: number) {
  if (isNaN(nb)) {
    window.notify('nombreAvecEspace : argument NaN ou undefined', { nb })
    return 'NaN'
  }
  // Ecrit \nombre{nb} pour tous les nombres supérieurs à 1 000 (pour la gestion des espaces)
  if (context.isHtml) {
    return Intl.NumberFormat('fr-FR', { maximumFractionDigits: 20 })
      .format(nb)
      .toString()
      .replace(/\s+/g, ' ')
  } else {
    let result
    if (nb > 999 || nombreDeChiffresDansLaPartieDecimale(nb) > 3) {
      result = '\\numprint{' + nb.toString().replace('.', ',') + '}'
    } else {
      result = Number(nb).toString().replace('.', '{,}')
    }
    return result
  }
}

/**
 *
 * @param {number} mantisse
 * @param {number} exp
 * @returns {string} Écriture décimale avec espaces
 */
export function scientifiqueToDecimal(mantisse: number, exp: number) {
  if (exp < -6) Decimal.set({ toExpNeg: exp - 1 })
  else if (exp > 20) Decimal.set({ toExpPos: exp + 1 })
  return texNombre(new Decimal(mantisse).mul(Decimal.pow(10, exp)), 10)
}

/**
 * Destinée à être utilisée hors des $ $
 * Signale une erreur en console s'il y a plus de 15 chiffres significatifs (et donc qu'il y a un risque d'erreur d'approximation)
 * Sinon, renvoie le nombre à afficher dans le format français (avec virgule et des espaces pour séparer les classes dans la partie entière et la partie décimale)
 * @author Jean-claude Lhote
 * @author Guillaume Valmont
 * @param {number|Decimal} nb nombre qu'on veut afficher
 * @param {number} precision nombre de décimales demandé
 * @param {boolean?} completerZeros=false si true, le nombre de décimale en precision est imposé (ajout de zéros inutiles éventuels)
 * @param {boolean?} aussiCompleterEntiers=false si true ajoute des zéros inutiles aux entiers si compléterZeros est true aussi
 * @returns string avec le nombre dans le format français à placer hors des $ $
 */
export function stringNombre(
  nb: number | Decimal | Complexe | IFractionEtendue,
  precision?: number,
  completerZeros?: boolean,
  aussiCompleterEntiers?: boolean,
): string {
  if (completerZeros === undefined) completerZeros = false
  if (aussiCompleterEntiers === undefined) aussiCompleterEntiers = false
  if (precision === undefined) precision = 8
  if (typeof nb === 'string') {
    window.notify("stringNombre appelé avec un string à la place d'un nombre", {
      nombre: nb,
    })
  }
  if (nb instanceof Complexe) {
    const nombre = nb as Complexe
    return `${stringNombre(nombre.re, precision, completerZeros, aussiCompleterEntiers)} ${Number(nombre.im) >= 0 ? '+' : '-'} ${stringNombre(
      Math.abs(Number(nombre.im)),
      precision,
      completerZeros,
      aussiCompleterEntiers,
    )}i`
  }
  if (isFractionEtendue(nb)) {
    return stringNombre(
      nb.valeurDecimale,
      precision,
      completerZeros,
      aussiCompleterEntiers,
    )
  }
  return afficherNombre(
    nb,
    precision,
    'stringNombre',
    completerZeros,
    aussiCompleterEntiers,
  )
}

/**
 * Fonction auxiliaire aux fonctions stringNombre et texNombre
 * Vérifie le nombre de chiffres significatifs en fonction du nombre de chiffres de la partie entière de nb et du nombre de décimales demandées par le paramètre precision
 * S'il y a plus de 15 chiffres significatifs, envoie un message à bugsnag et renvoie un nombre avec 15 chiffres significatifs
 * Sinon, renvoie un nombre avec le nombre de décimales demandé
 * @author Guillaume Valmont
 * @param {number|string|FractionEtendue|Decimal} nb nombre qu'on veut afficher
 * @param {number} precision nombre de décimales demandé
 * @param {'stringNombre'|'texNombre'} fonction nom de la fonction qui appelle afficherNombre (texNombre ou stringNombre) -> sert pour le message envoyé à bugsnag
 * @param {boolean} completerZeros si true, le nombre de décimale en precision est imposé (ajout de zéros inutiles éventuels)
 * @param {boolean} aussiCompleterEntiers true si on veut ajouter des zéros inutiles aux entiers
 */
function afficherNombre(
  nb: number | Decimal | IFractionEtendue | string | Complexe,
  precision: number,
  fonction: 'texNombre' | 'stringNombre',
  completerZeros = false,
  aussiCompleterEntiers: boolean,
) {
  /**
   * Fonction auxiliaire de stringNombre pour une meilleure lisibilité
   * Elle renvoie un nombre dans le format français (avec virgule et des espaces pour séparer les classes dans la partie entière et la partie décimale)
   * @author Rémi Angot
   * @author Guillaume Valmont
   * @param {number|string|FractionEtendue|Decimal|Complexe} nb nombre à afficher
   * @param {number} nbChiffresPartieEntiere nombre de chiffres de la partie entière
   * @param {number} precision nombre de décimales demandé
   * @param {'stringNombre'|'texNombre'} fonction la fonction appelante
   * @returns string avec le nombre dans le format français
   */

  function insereEspacesNombre(
    nb: number | Decimal | IFractionEtendue,
    nbChiffresPartieEntiere: number,
    precision: number,
    fonction: 'stringNombre' | 'texNombre',
  ) {
    let signe
    let nombre
    const maximumSignificantDigits = nbChiffresPartieEntiere + precision
    if (isFractionEtendue(nb)) {
      return insereEspacesNombre(
        nb.valeurDecimale,
        nb.valeurDecimale.toFixed(0).length,
        precision,
        fonction,
      )
    }

    if (nb instanceof Decimal) {
      Decimal.set({ toExpNeg: -precision - 1 })
      signe = nb.isNeg()
      if (nb.abs().gte(1)) {
        if (completerZeros) {
          nombre = nb.toFixed(precision).replace('.', ',')
        } else {
          nombre = nb.toDP(precision).toString().replace('.', ',')
        }
      } else {
        if (completerZeros) {
          nombre = nb.toFixed(precision).replace('.', ',')
        } else {
          nombre = nb.toDP(precision).toString().replace('.', ',')
        }
      }
    } else {
      // nb est un number
      signe = nb < 0
      // let nombre = math.format(nb, { notation: 'fixed', lowerExp: -precision, upperExp: precision, precision: precision }).replace('.', ',')
      if (Math.abs(nb) < 1) {
        // si il est < 1, on n'a pas à se préoccuper de savoir si il est entier pour aussiCompleterEntiers
        if (completerZeros) {
          nombre = Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: precision,
            minimumFractionDigits: precision,
          }).format(nb)
        } else {
          nombre = Intl.NumberFormat('fr-FR', {
            maximumFractionDigits: precision,
          })
            .format(nb)
            .replaceAll(/\s+/g, ' ')
        }
      } else {
        if (
          completerZeros &&
          ((aussiCompleterEntiers && Number.isInteger(nb)) ||
            !Number.isInteger(nb))
        ) {
          nombre = Intl.NumberFormat('fr-FR', {
            maximumSignificantDigits,
            minimumSignificantDigits: Math.min(maximumSignificantDigits, 15),
          })
            .format(nb)
            .replaceAll(/\s+/g, ' ')
        } else {
          nombre = Intl.NumberFormat('fr-FR', {
            maximumSignificantDigits: Math.min(maximumSignificantDigits, 15),
          })
            .format(nb)
            .replaceAll(/\s+/g, ' ')
        }
      }
    }
    const rangVirgule = nombre.indexOf(',')
    let partieEntiere
    if (rangVirgule !== -1) {
      partieEntiere = nombre.substring(0, rangVirgule)
    } else {
      partieEntiere = nombre
    }
    let partieDecimale = ''
    if (rangVirgule !== -1) {
      partieDecimale = nombre.substring(rangVirgule + 1)
    }
    // La partie entière est déjà formatée par le Intl.NumberFormat('fr-FR', { maximumSignificantDigits }).format(nb)
    // Dans le cas d'un Number, mais pas d'un Decimal
    if (nb instanceof Decimal) {
      if (signe) partieEntiere = partieEntiere.substring(1)
      for (let i = partieEntiere.length - 3; i > 0; i -= 3) {
        partieEntiere =
          partieEntiere.substring(0, i) + ' ' + partieEntiere.substring(i)
      }
      if (signe) partieEntiere = '-' + partieEntiere
    }
    for (
      let i = 3;
      i < partieDecimale.length;
      i += fonction === 'texNombre' ? 5 : 4
    ) {
      // des paquets de 3 nombres + 1 espace
      partieDecimale =
        partieDecimale.substring(0, i) +
        (fonction === 'texNombre' ? '\\,' : ' ') +
        partieDecimale.substring(i)
    }
    if (partieDecimale === '') {
      nombre = partieEntiere
    } else {
      nombre = partieEntiere + ',' + partieDecimale
    }
    return nombre
  } // fin insereEspacesNombre()
  /**
   * retourne la précision souhaitée pour le number x, c'est à dire le nombre de chiffres significatifs après la virgule
   * @param {number} x
   * @return {number}
   */
  const trouveLaPrecision = function (x: number) {
    if (Math.abs(x) > 1e-10 && Math.abs(x) < 1e11) {
      let fix = x.toFixed(18)
      if (fix.includes('.')) {
        fix = fix.split('.')[1]
      }
      const xx = Number('.' + fix)
      let precision = 1
      for (let i = 1; i < fix.length; i++) {
        const x = round(Number('.' + fix.substring(0, i + 1)), i)
        const diff = Math.abs(x - xx)
        if (diff > 1e-10) {
          precision++
        } else {
          return precision
        }
      }
      return precision
    } else {
      // On a à faire à un number trop petit ou trop grand pour que l'algorithme classique fonctionne.
      // x.toFixed(18) ne contiendrait pas assez de chiffres significatifs
      // afficherNombre n'est pas prévu pour des nombres pareils sauf éventuellement au format Decimal
      window.notify(
        `trouveLaPrecision de ${x} n'est pas possible : il ne peut pas être transformé en écriture décimale. Il faut adapter le code de l'exercice ou verifier que ce nombre n'est pas un bug`,
        { x },
      )
      return 10
    }
  }
  // fin trouveLaPrecision()
  // eh oui, il y a eu des appels à texNombre() avec des FractionEtendue... alors que c'est pas fait pour ça.
  if (!(nb instanceof Decimal) && typeof nb !== 'number') {
    if (isFractionEtendue(nb)) {
      nb = nb.toNumber()
    } else if (typeof nb === 'string') {
      const nbFormatAnglais = nb.replaceAll(',', '.') ?? ''
      if (nb !== '') {
        nb = new Decimal(nbFormatAnglais)
      } else {
        window.notify(`TrouveLaPrecision : problème avec ce nombre : ${nb}`, {
          nb,
        })
      }
    } else if (nb instanceof Complexe) {
      return `${insereEspacesNombre(
        Number(nb.re),
        Number(nb.re).toFixed(0).length,
        precision,
        fonction,
      )} ${Number(nb.im) >= 0 ? '+' : '-'} ${insereEspacesNombre(
        Math.abs(Number(nb.im)),
        Math.abs(Number(nb.im)).toFixed(0).length,
        precision,
        fonction,
      )}i`
    } else if (typeof nb !== 'number') {
      window.notify(
        `afficherNombre a reçu un argument de type inconnu come nombre : ${nb}`,
        { nombreEntrant: nb },
      )
      nb = Number(nb)
      if (isNaN(nb)) {
        window.notify(
          "Et ce paramètre n'est pas convertible en nombre ! il faut donc vérifier l'exercice qui comporte un bug !",
          { nb },
        )
        nb = 0
      }
    }
  }

  if (precision === undefined) {
    // la précision n'a pas été fournie à texNombre ou à stringNombre, alors on va essayer de la deviner.
    if (nb instanceof Decimal) {
      precision = nb.e < 0 ? nb.precision() + -nb.e : nb.precision(true)
    } else {
      if (Number.isInteger(nb)) {
        precision = 0
      } else {
        const ordreGrandeur = Math.round(Math.log10(Number(nb)))
        if (ordreGrandeur < -10) {
          // ça veut dire que le nombre est trop insignifiant pour donner un résultat affiché convenable
          precision = 0 // on retourne 0 pour avoir un arrondi à zéro !
        } else {
          precision = trouveLaPrecision(Number(nb))
        }
      }
    }
  }
  // si nb n'est pas un nombre, on le retourne tel quel, on ne fait rien.
  if (Number.isNaN(nb) && !(nb instanceof Decimal)) {
    window.notify("AfficherNombre : Le nombre n'en est pas un", {
      nb,
      precision,
      fonction,
    })
    return ''
  }
  if (nb instanceof Decimal) {
    if (nb.isZero()) return '0'
  } else if (Number(nb) === 0) return '0'
  let nbChiffresPartieEntiere
  if (nb instanceof Decimal) {
    if (nb.abs().lt(1)) {
      nbChiffresPartieEntiere = 0
    } else {
      nbChiffresPartieEntiere = nb.abs().floor().toFixed(0).length
    }
    if (nb.isInteger() && !aussiCompleterEntiers) precision = 0
    else if (typeof precision !== 'number') {
      // Si precision n'est pas un nombre, on le remplace par la valeur max acceptable
      precision = 15 - nbChiffresPartieEntiere
    } else if (precision < 0) {
      precision = 0
    }
  } else {
    // nb est un number
    if (Math.abs(Number(nb)) < 1) {
      nbChiffresPartieEntiere = 0
    } else {
      // attention 9.7 donner 10 avec Math.abs(9.7).toFixed(0)
      nbChiffresPartieEntiere = Math.floor(Math.abs(Number(nb))).toFixed(
        0,
      ).length
    }
    if (Number.isInteger(nb) && !completerZeros) {
      precision = 0
    } else {
      if (typeof precision !== 'number') {
        // Si precision n'est pas un nombre, on le remplace par la valeur max acceptable
        precision = 15 - nbChiffresPartieEntiere
      } else if (precision < 0) {
        precision = 0
      }
    }
  }

  const maximumSignificantDigits = nbChiffresPartieEntiere + precision

  if (maximumSignificantDigits > 15 && !(nb instanceof Decimal)) {
    // au delà de 15 chiffres significatifs, on risque des erreurs d'arrondi
    window.notify(
      fonction +
        ` : Trop de chiffres le nombre passé à la fonction a trop de chiffres significatifs, soit c'est un bug à corriger, soit il faut utiliser un Decimal !`,
      { nb, precision },
    )
  }
  return insereEspacesNombre(
    Number(nb),
    nbChiffresPartieEntiere,
    precision,
    fonction,
  )
}

/**
 * Pour bien afficher les centimes avec 2 chiffres après la virgule
 * @author Rémi Angot
 */
export function texPrix(nb: number | Decimal) {
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
 * Fonction qui renvoie un tableau contenant la mantisse et l'exposant de l'écriture scientique d'un nombre donné en paramètres sous sa forme décimale.
 * @param nbDecimal
 *
 * @example
 * // Renvoie [4.1276,1]
 * range(decimalToScientifique,[41.276])
 * // Renvoie [3.48,-2]
 * range(decimalToScientifique,[0.0348])
 * // Renvoie [-2.315,3]
 * range(decimalToScientifique,[-2315])
 *
 * @author Éric Elter
 */
export function decimalToScientifique(nbDecimal: number) {
  let exposant = 0
  let mantisseNb = new Decimal(nbDecimal)
  if (mantisseNb.abs().gte(10)) {
    while (exposant < 50 && mantisseNb.abs().gt(10)) {
      mantisseNb = mantisseNb.div(10)
      exposant++
    }
    return [mantisseNb.toNumber(), exposant]
  } else if (mantisseNb.abs().lt(1)) {
    while (exposant < 50 && mantisseNb.abs().lt(1)) {
      mantisseNb = mantisseNb.mul(10)
      exposant++
    }
    return [mantisseNb.toNumber(), -1 * exposant]
  } else return [nbDecimal, 0]
}

/**
 * Fonction qui renvoie une chaine avec un O pour chiffre des dizaines si celui-ci n'en contient pas.
 * @param nbDecimal
 *
 * @example

 * @author Rémi Angot
 */
export function formatMinute(minute: number): string {
  return minute < 10 ? `0${minute}` : minute.toString()
}
