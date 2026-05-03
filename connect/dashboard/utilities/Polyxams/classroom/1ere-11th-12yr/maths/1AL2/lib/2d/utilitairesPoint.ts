import type { ICercle, IDroite, IPointAbstrait } from './Interfaces'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'

/**
 * Retourne un entier aléatoire entre min et max (inclus)
 * @param min Borne inférieure (incluse)
 * @param max Borne supérieure (incluse)
 * @returns Entier aléatoire entre min et max
 */
const randint = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

/**
 * Calcule la distance entre deux points
 * @param A Premier point
 * @param B Deuxième point
 * @returns Distance euclidienne entre A et B
 */
const longueur = (A: IPointAbstrait, B: IPointAbstrait): number =>
  Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)

/**
 * M = milieu(A,B) //M est le milieu de [AB]
 * M = milieu(A,B,'M') //M est le milieu [AB] et se nomme M
 * M = milieu(A,B,'M','below') //M est le milieu [AB], se nomme M et le nom est en dessous du point
 * @returns {PointAbstrait} Milieu du segment [AB]
 * @author Rémi Angot
 */
export function milieu(
  A: PointAbstrait,
  B: PointAbstrait,
  nom = '',
  positionLabel = 'above',
): PointAbstrait {
  if (isNaN(longueur(A, B)))
    window.notify('milieu : Quelque chose ne va pas avec les points', { A, B })
  const x = (A.x + B.x) / 2
  const y = (A.y + B.y) / 2
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 * M = pointSurSegment(A,B,l) //M est le point de [AB] à l cm de A
 * M = pointSurSegment(A,B,l,'M') //M est le point de [AB] à l cm de A et se nomme M
 * M = pointSurSegment(A,B,l,'M','below') //M est le point de [AB] à l cm de A, se nomme M et le nom est en dessous du point
 *
 * M = pointSurSegment(A,B,'h','M') // M est un point au hasard sur [AB] (on peut écrire n'importe quel texte à la place de 'h')
 * M = pointSurSegment(A,B) // M est un point au hasard sur [AB]
 * Sécurité ajoutée par Jean-Claude Lhote : si AB=0, alors on retourne A
 * @author Rémi Angot
 */
export function pointSurSegment(
  A: IPointAbstrait,
  B: IPointAbstrait,
  l?: number,
  nom = '',
  positionLabel = 'above',
): PointAbstrait {
  if (isNaN(longueur(A, B))) {
    window.notify('pointSurSegment : Quelque chose ne va pas avec les points', {
      A,
      B,
    })
    return pointAbstrait(A.x, A.y, A.nom, A.positionLabel)
  }
  if (l === undefined || typeof l === 'string') {
    l = (longueur(A, B) * randint(15, 85)) / 100
  }

  // Calcul direct de l'homothétie de B par rapport à A avec rapport k = l / longueur(A, B)
  if (longueur(A, B) === 0) {
    return pointAbstrait(A.x, A.y, A.nom, A.positionLabel)
  }
  const k = l / longueur(A, B)
  const x = A.x + k * (B.x - A.x)
  const y = A.y + k * (B.y - A.y)
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 *
 * @param {Cercle} c
 * @param {number} angle
 * @param {string} nom
 * @param {string} positionLabel
 * M = pointSurCercle(c,'','M') // M est un point choisi au hasard sur le cercle c et se nomme M.
 * N = pointSurCercle(c,90) // N est le point du cercle c situé à 90° par rapport à l'horizontale, donc au dessus du centre de c
 * P = pointSurCercle(c,-90) // P est le point du cercle c situé à l'opposé du point N précédent.
 * @author Jean-Claude Lhote
 */
export function pointSurCercle(
  c: ICercle,
  angle: number,
  nom: string,
  positionLabel = 'above',
): PointAbstrait {
  if (typeof angle !== 'number') angle = randint(-180, 180)
  const angleRad = (angle * Math.PI) / 180
  const x = c.centre.x + c.rayon * Math.cos(angleRad)
  const y = c.centre.y + c.rayon * Math.sin(angleRad)
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 * Retourne un point sur la droite d dont l'abscisse est x. Si c'est impossible (droite verticale) alors ce sera le point dont l'ordonnée vaut x.
 * @param {Droite} d
 * @param {number} x Abscisse du point
 * @param {string} [nom] Nom du point
 * @param {string} [positionLabel='above'] Facultatif, 'above' par défaut.
 * @return {PointAbstrait} PointAbstrait de la droite d dont l'abscisse est x
 * @author Jean-Claude Lhote
 */
export function pointSurDroite(
  d: IDroite,
  x: number,
  nom = '',
  positionLabel = 'above',
): PointAbstrait {
  // si d est parallèle à l'axe des ordonnées, le paramètre x servira pour y.
  if (d.b === 0) return pointAbstrait(-d.c / d.a, x, nom, positionLabel)
  else if (d.a === 0) return pointAbstrait(x, -d.c / d.b, nom, positionLabel)
  else return pointAbstrait(x, (-d.c - d.a * x) / d.b, nom, positionLabel)
}

/**
 * Renvoie 'M' le point d'intersection des droites d1 et d2
 * @param {IDroite} d
 * @param {IDroite} f
 * @param {string} nom  le nom du point d'intersection. Facultatif, vide par défaut.
 * @param {string} [positionLabel='above'] Facultatif, 'above' par défaut.
 * @return {PointAbstrait} PointAbstrait 'M' d'intersection de d1 et de d2
 * @author Jean-Claude Lhote
 */
export function pointIntersectionDD(
  d: IDroite,
  f: IDroite,
  nom = '',
  positionLabel = 'above',
): PointAbstrait {
  let x, y
  if (Math.abs(f.a * d.b - f.b * d.a) < 0.000001) {
    // Les droites sont parallèles ou confondues, pas de point d'intersection ou une infinité
    return pointIntersectionNonTrouveEntre(d, f, pointAbstrait(50, 50))
  } else {
    y = (f.c * d.a - d.c * f.a) / (f.a * d.b - f.b * d.a)
  }
  if (Math.abs(d.a) < 0.000001) {
    // si d est horizontale alors f ne l'est pas donc f.a<>0
    x = (-f.c - f.b * y) / f.a
  } else {
    // d n'est pas horizontale donc ...
    x = (-d.c - d.b * y) / d.a
  }
  return pointAbstrait(x, y, nom, positionLabel)
}

/**
 * @example pointAdistance(A,d,angle,nom="",positionLabel="above") // Seuls le point A et la distance d sont obligatoires, angle peut être choisi : il s'agit de l'angle signé avec l'axe [OI) sinon, il est choisi aléatoirement.
 * @example p=pointAdistance(A,5,'M') // Place un point aléatoirement à 5 unités de A et lui donne le nom de 'M'.
 * @author Jean-Claude Lhote
 */
export function pointAdistance(
  A: IPointAbstrait,
  d: number = 1,
  angle: string | number = 0,
  nom = '',
  positionLabel = 'above',
): PointAbstrait {
  let leNom = ''
  let lAngle = 0
  let lePositionLabel = 'above'
  if (typeof angle === 'string') {
    lAngle = randint(0, 360)
    leNom = angle
    if (nom != null) lePositionLabel = nom
  } else {
    lAngle = angle ?? randint(0, 360)
    if (nom != null) leNom = nom
    if (positionLabel != null) lePositionLabel = positionLabel
  }

  // Calcul direct de la similitude de centre A, angle lAngle (en degrés), rapport d
  // appliquée au point B = (A.x + 1, A.y)
  // Formule : M = A + d * R(lAngle) * (B - A)
  // où R est la rotation d'angle lAngle
  const angleRad = (lAngle * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  // Vecteur AB (ici B = (A.x + 1, A.y) donc AB = (1, 0))
  const dx = 1
  const dy = 0

  // Application de la rotation puis homothétie de rapport d
  const x = A.x + d * (cos * dx - sin * dy)
  const y = A.y + d * (sin * dx + cos * dy)

  return pointAbstrait(x, y, leNom, lePositionLabel)
}

/**
 * @param {Droite} d la droite qui intecepte (ou pas le cercle)
 * @param {Cercle} C le cercle
 * @param {string} nom le nom du point d'intersection
 * @param {entier} n 1 pour le premier point, 2 sinon. Si il n'y a qu'un seul point d'intesection, l'un ou l'autre renvoie ce point.
 * @example I = pointItersectionLC(d,c,'I',1) // I est le premier point d'intersection si il existe de la droite (d) et du cercle (c). On renvoie le centre du cercle sinon.
 * @author Jean-Claude Lhote
 */
export function pointIntersectionLC(
  d: IDroite,
  C: ICercle,
  nom = '',
  n = 1,
): PointAbstrait {
  const O = C.centre
  const r = C.rayon
  const a = d.a
  const b = d.b
  const c = d.c
  const xO = O.x
  const yO = O.y
  let Delta, delta, xi, yi, xiPrime, yiPrime
  if (Math.abs(b) < 0.000001) {
    // la droite est verticale
    xi = -c / a
    xiPrime = xi
    Delta = 4 * (-xO * xO - (c * c) / (a * a) - (2 * xO * c) / a + r * r)
    if (Delta < 0)
      return pointIntersectionNonTrouveEntre(d, C, pointAbstrait(50, 50))
    else if (Math.abs(Delta) < 1e-10) {
      // un seul point d'intersection
      yi = yO + Math.sqrt(Delta) / 2
      yiPrime = yi
    } else {
      // deux points d'intersection
      yi = yO - Math.sqrt(Delta) / 2
      yiPrime = yO + Math.sqrt(Delta) / 2
    }
  } else if (Math.abs(a) < 0.0000001) {
    // la droite est horizontale
    yi = -c / b
    yiPrime = yi
    Delta = 4 * (-yO * yO - (c * c) / (b * b) - (2 * yO * c) / b + r * r)
    if (Delta < 0)
      return pointIntersectionNonTrouveEntre(d, C, pointAbstrait(50, 50))
    else if (Math.abs(Delta) < 1e-10) {
      // un seul point d'intersection
      xi = xO + Math.sqrt(Delta) / 2
      xiPrime = xi
    } else {
      // deux points d'intersection
      xi = xO - Math.sqrt(Delta) / 2
      xiPrime = xO + Math.sqrt(Delta) / 2
    }
  } else {
    // cas général
    Delta =
      (2 * ((a * c) / (b * b) + (yO * a) / b - xO)) ** 2 -
      4 *
        (1 + (a / b) ** 2) *
        (xO * xO + yO * yO + (c / b) ** 2 + (2 * yO * c) / b - r * r)
    if (Delta < 0)
      return pointIntersectionNonTrouveEntre(d, C, pointAbstrait(50, 50))
    else if (Math.abs(Delta) < 1e-10) {
      // un seul point d'intersection
      delta = Math.sqrt(Delta)
      xi =
        (-2 * ((a * c) / (b * b) + (yO * a) / b - xO) - delta) /
        (2 * (1 + (a / b) ** 2))
      xiPrime = xi
      yi = (-a * xi - c) / b
      yiPrime = yi
    } else {
      // deux points d'intersection
      delta = Math.sqrt(Delta)
      xi =
        (-2 * ((a * c) / (b * b) + (yO * a) / b - xO) - delta) /
        (2 * (1 + (a / b) ** 2))
      xiPrime =
        (-2 * ((a * c) / (b * b) + (yO * a) / b - xO) + delta) /
        (2 * (1 + (a / b) ** 2))
      yi = (-a * xi - c) / b
      yiPrime = (-a * xiPrime - c) / b
    }
  }
  if (n === 1) {
    if (yiPrime > yi) {
      return pointAbstrait(xiPrime, yiPrime, nom)
    } else {
      return pointAbstrait(xi, yi, nom)
    }
  } else {
    if (yiPrime > yi) {
      return pointAbstrait(xi, yi, nom)
    } else {
      return pointAbstrait(xiPrime, yiPrime, nom)
    }
  }
}

/**
 * M = pointIntersectionCC(c1,c2,'M') // M est le point d'intersection le plus haut des cercles c1 et c2
 * M = pointIntersectionCC(c1,c2,'M',2) // M est le point d'intersection le plus bas des cercles c1 et c2
 * La fonction ne renvoie rien si les cercles n'ont pas de points d'intersection
 * @author Rémi Angot
 * @see https://stackoverflow.com/questions/12219802/a-javascript-function-that-returns-the-x-y-points-of-intersection-between-two-ci
 */
export function pointIntersectionCC(
  c1: ICercle,
  c2: ICercle,
  nom = '',
  n = 1,
): PointAbstrait {
  const O1 = c1.centre
  const O2 = c2.centre
  const r0 = c1.rayon
  const r1 = c2.rayon
  const x0 = O1.x
  const x1 = O2.x
  const y0 = O1.y
  const y1 = O2.y
  const dx = x1 - x0
  const dy = y1 - y0
  const d = Math.sqrt(dy * dy + dx * dx)
  if (d > r0 + r1) {
    return pointIntersectionNonTrouveEntre(c1, c2, pointAbstrait(50, 50))
  }
  if (d < Math.abs(r0 - r1)) {
    return pointIntersectionNonTrouveEntre(c1, c2, pointAbstrait(50, 50))
  }
  const a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d)
  const x2 = x0 + (dx * a) / d
  const y2 = y0 + (dy * a) / d
  const h = Math.sqrt(r0 * r0 - a * a)
  const rx = -dy * (h / d)
  const ry = dx * (h / d)
  const xi = x2 + rx
  const xiPrime = x2 - rx
  const yi = y2 + ry
  const yiPrime = y2 - ry
  if (n === 1) {
    if (yiPrime > yi) {
      return pointAbstrait(xiPrime, yiPrime, nom)
    } else {
      return pointAbstrait(xi, yi, nom)
    }
  } else {
    if (yiPrime > yi) {
      return pointAbstrait(xi, yi, nom)
    } else {
      return pointAbstrait(xiPrime, yiPrime, nom)
    }
  }
}

function pointIntersectionNonTrouveEntre(
  objet1: ICercle | IDroite,
  objet2: ICercle | IDroite,
  valeurParDefaut: PointAbstrait,
): PointAbstrait {
  window.notify(
    `${JSON.stringify(objet1)} et ${JSON.stringify(objet2)} ne se coupent pas. Impossible de trouver leur intersection.`,
    { objet1, objet2 },
  )
  return pointAbstrait(valeurParDefaut.x, valeurParDefaut.y)
}

/**
 * Vérifie si x est un point
 * @param x
 * @returns true si x est un point, false sinon
 * @author Jean-Claude Lhote
 */
export function isPoint(x: unknown): x is PointAbstrait {
  return (
    typeof x === 'object' &&
    x !== null &&
    (x as any).typeObjet === 'point' &&
    typeof (x as any).x === 'number' &&
    typeof (x as any).y === 'number'
  )
}
