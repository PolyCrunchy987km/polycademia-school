import Decimal from 'decimal.js'

/**
 * Retourne la somme des chiffres (ou d'un tableau de chiffres) d'un nombre en valeur et sous forme de String [valeur, String]
 * @Example
 * sommeDesChiffres(123)
 * // [ 6, '1+2+3']
 * @author Rémi Angot (Rajout Tableau par EE)
 */ export function sommeDesChiffres(n: number) {
  let nString: string
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
 * Retourne l'égalité des produits en croix à partir d'un tableau contenant les deux fractions [[a,b],[c,d]] pour a/b=c/d retourne ad=bc
 * Le résultat est un string en mode maths inline
 * @author Jean-Claude Lhote
 */

export function produitsEnCroix([[a, b], [c, d]]: [
  [number | string, number | string],
  [number | string, number | string],
]): string {
  // écrit une chaine pour a*d=b*c
  let result = ''
  result += `$${a}\\times${d}=${b}\\times${c}$`
  return result
}

/**
 * Retourne la quatrième proportionnelle de 3 nombres en fonction d'une précision demandée
 * Le résultat est un string qui doit être entouré de $ pour le mode mathématique
 * @author Jean-Claude Lhote
 */
const texNombre = (n: number | Decimal, precision: number) => {
  if (precision === 0) return n.toString()
  else {
    const dn = new Decimal(n)
    return dn.toDP(precision).toString().replace('.', '{,}')
  }
}

export function quatriemeProportionnelle(
  a: number | string,
  b: number | string,
  c: number | string,
  precision = 0,
): string {
  // calcul de b*c/a
  let result = ''
  if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number') {
    if (a === 0) {
      result = '=erreur : division par zéro'
      return result
    }
    const p4 = new Decimal(b).mul(c).div(a)
    result += `\\dfrac{${texNombre(b, precision)}\\times${texNombre(c, precision)}}{${texNombre(a, precision)}}`
    if (p4.eq(p4.toDP(precision))) result += '='
    else result += '\\approx'
    result += `${texNombre(p4, precision)}`
    return result
  } else {
    return `\\dfrac{${b} \\times${c}}{${a}}`
  }
}

/**
 * Extrait le plus grand facteur entier a dont le carré divise n
 * @param {number} n - Le nombre entier dont on veut extraire la racine carrée
 * @returns {[number, number]} - [a, n/a²] où a² est le plus grand carré parfait divisant n
 * @author Jean-Claude Lhote (réimplémentation sans dépendance circulaire)
 */
export function extraireRacineCarree(n: number): [number, number] {
  if (n <= 0) return [0, n]
  if (n === 1) return [1, 1]

  let a = 1
  let reste = n

  // On teste tous les nombres de 2 à sqrt(n)
  for (let i = 2; i * i <= reste; i++) {
    // Tant que i² divise reste, on l'extrait
    while (reste % (i * i) === 0) {
      a *= i
      reste = Math.floor(reste / (i * i))
    }
  }

  return [a, reste]
}

/**
 * Renvoie un tableau (somme des termes positifs, somme des termes négatifs)
 * @author Rémi Angot
 */
export function sommeDesTermesParSigne(liste: number[]) {
  let sommeDesPositifs = 0
  let sommeDesNegatifs = 0
  for (let i = 0; i < liste.length; i++) {
    if (liste[i] > 0) {
      sommeDesPositifs += liste[i]
    } else {
      sommeDesNegatifs += liste[i]
    }
  }
  return [sommeDesPositifs, sommeDesNegatifs]
}
