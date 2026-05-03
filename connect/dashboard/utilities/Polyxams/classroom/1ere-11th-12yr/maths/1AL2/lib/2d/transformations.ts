import { egal } from '../../modules/outils'
import { Droite, droite } from './droites'
import type {
  IDroite,
  IPoint,
  IPointAbstrait,
  IPolygone,
  ISegment,
  IVecteur,
} from './Interfaces'
import type { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { Polygone, polygone } from './polygones'
import { Segment, segment } from './segmentsVecteurs'
import { Vecteur, vecteur } from './Vecteur'

/**
 * Convertit un angle en degrés vers des radians
 */
function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * M = translation(O,v) //M est l'image de O dans la translation de vecteur v
 * M = translation(O,v,'M') //M est l'image de O dans la translation de vecteur v et se nomme M
 * M = translation(O,v,'M','below') //M est l'image de O dans la translation de vecteur v, se nomme M et le nom est en dessous du point
 * @param {ObjecMathalea2d} O objet à translater (PointAbstrait, Droite, Segment, Polygone ou Vecteur)
 * @param {Vecteur} v vecteur de translation
 * @param {string} nom nom du translaté pour un PointAbstrait
 * @param {string} positionLabel Position du label pour un PointAbstrait
 * @param {string} [color='black'] Code couleur HTML acceptée
 * @author Rémi Angot
 */

// Surcharges (entrées typées avec les interfaces, retours classes concrètes)
export function translation(
  O: IVecteur,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur
export function translation(
  O: IPolygone,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function translation(
  O: IDroite,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function translation(
  O: ISegment,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function translation(
  O: IPointAbstrait,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function translation(
  O: IPoint,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function translation(
  O: PointAbstrait,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function translation(
  O: ObjetMathalea2D,
  v: IVecteur | Vecteur | PointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): ObjetMathalea2D

// Implémentation (type union d'interfaces, garde par propriétés)
export function translation(
  O:
    | IPointAbstrait
    | IPoint
    | PointAbstrait
    | IDroite
    | ISegment
    | IPolygone
    | IVecteur
    | ObjetMathalea2D,
  vecteurTranslation: IVecteur | Vecteur | PointAbstrait, // ← Renommer le paramètre
  nom = '',
  positionLabel = 'above',
  color = 'black',
):
  | PointAbstrait
  | PointAbstrait
  | Droite
  | Segment
  | Polygone
  | Vecteur
  | ObjetMathalea2D {
  // Points (PointAbstrait ou PointAbstrait)
  if (O instanceof PointAbstrait || O instanceof PointAbstrait) {
    const x = O.x + vecteurTranslation.x
    const y = O.y + vecteurTranslation.y
    if (O instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if ('listePoints' in O) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < O.listePoints.length; i++) {
      const pi = translation(
        O.listePoints[i] as PointAbstrait,
        vecteurTranslation,
      ) as PointAbstrait
      pi.nom = O.listePoints[i].nom + "'"
      p2[i] = pi
    }
    return polygone(p2, color)
  }

  // Droite
  if ('pente' in O) {
    const M = translation(
      pointAbstrait(O.x1, O.y1),
      vecteurTranslation,
    ) as PointAbstrait
    const N = translation(
      pointAbstrait(O.x2, O.y2),
      vecteurTranslation,
    ) as PointAbstrait
    return droite(M, N, color)
  }

  // Segment
  if ('extremite1' in O && 'extremite2' in O) {
    const M = translation(
      O.extremite1 as PointAbstrait,
      vecteurTranslation,
    ) as PointAbstrait
    const N = translation(
      O.extremite2 as PointAbstrait,
      vecteurTranslation,
    ) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (O as any).styleExtremites
    return s
  }

  if ('norme' in O) {
    // Vecteur: invariant par translation -> renvoyer un vecteur identique
    return vecteur(O.x, O.y)
  }
  return O as unknown as ObjetMathalea2D
}

/**
 * M = translation2Points(O,A,B) //M est l'image de O dans la translation qui transforme A en B
 * M = translation2Points(O,A,B,'M') //M est l'image de O dans la translation qui transforme A en B et se nomme M
 * M = translation2Points(O,A,B,'M','below') //M est l'image de O dans la translation qui transforme A en B, se nomme M et le nom est en dessous du point
 *
 * @author Rémi Angot
 */

// Surcharges
export function translation2Points(
  O: IPointAbstrait,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function translation2Points(
  O: IPoint,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function translation2Points(
  O: IDroite,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function translation2Points(
  O: ISegment,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function translation2Points(
  O: IPolygone,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function translation2Points(
  O: IVecteur,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur

// Implémentation
export function translation2Points(
  O: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  A: IPointAbstrait,
  B: IPointAbstrait,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | PointAbstrait | Droite | Segment | Polygone | Vecteur {
  // Points (PointAbstrait ou PointAbstrait)
  if (O instanceof PointAbstrait || O instanceof PointAbstrait) {
    const x = O.x + B.x - A.x
    const y = O.y + B.y - A.y
    if (O instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if ('listePoints' in O) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < O.listePoints.length; i++) {
      const pi = translation2Points(O.listePoints[i], A, B) as PointAbstrait
      pi.nom = O.listePoints[i].nom + "'"
      p2[i] = pi
    }
    return polygone(p2, color)
  }

  // Droite
  if ('pente' in O) {
    const M = translation2Points(
      pointAbstrait(O.x1, O.y1),
      A,
      B,
    ) as PointAbstrait
    const N = translation2Points(
      pointAbstrait(O.x2, O.y2),
      A,
      B,
    ) as PointAbstrait
    return droite(M, N, color)
  }

  // Segment
  if ('extremite1' in O && 'extremite2' in O) {
    const M = translation2Points(O.extremite1, A, B) as PointAbstrait
    const N = translation2Points(O.extremite2, A, B) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (O as any).styleExtremites
    return s
  }

  // Vecteur (ne change pas par translation)
  if ('x' in O && 'y' in O) {
    return vecteur(O.x, O.y)
  }

  // Fallback
  return O as unknown as PointAbstrait
}

/**
 * @param {PointAbstrait|PointAbstrait|Polygone|Droite|Vecteur|Segment} A PointAbstrait, Polygone, Droite, Segment ou Vecteur
 * @param {PointAbstrait} O Centre de rotation
 * @param {number} angle Angle de rotation
 * @param {string} [nom=''] Nom de l'image
 * @param {string} [positionLabel='above']
 * @param {string} [color='black'] Code couleur HTML acceptée
 * @return L'image de A par la rotation de centre O et d'angle angle
 * @author Rémi Angot et Jean-Claude Lhote
 */

export function rotation(
  A: IDroite,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function rotation(
  A: ISegment,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function rotation(
  A: Polygone,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function rotation(
  A: IVecteur,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): IVecteur

export function rotation(
  A: PointAbstrait,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait

// Implémentation (avec classes concrètes pour instanceof)
export function rotation(
  A: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  O: PointAbstrait | IPointAbstrait,
  angle: number,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | Droite | Segment | IPolygone | Vecteur {
  if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
    const x =
      O.x +
      (A.x - O.x) * Math.cos((angle * Math.PI) / 180) -
      (A.y - O.y) * Math.sin((angle * Math.PI) / 180)
    const y =
      O.y +
      (A.x - O.x) * Math.sin((angle * Math.PI) / 180) +
      (A.y - O.y) * Math.cos((angle * Math.PI) / 180)
    if (A instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }
  if (A instanceof Polygone) {
    const p2: IPointAbstrait[] = []
    for (let i = 0; i < A.listePoints.length; i++) {
      p2[i] = rotation(A.listePoints[i], O, angle)
      p2[i].nom = A.listePoints[i].nom + "'"
    }
    return polygone(p2, color)
  }
  if ('pente' in A) {
    const M = rotation(
      pointAbstrait(A.x1, A.y1) as PointAbstrait,
      O,
      angle,
    ) as PointAbstrait
    const N = rotation(
      pointAbstrait(A.x2, A.y2) as PointAbstrait,
      O,
      angle,
    ) as PointAbstrait
    return droite(M, N, '', color)
  }
  if (A instanceof Segment) {
    const M = rotation(A.extremite1 as PointAbstrait, O, angle) as PointAbstrait
    const N = rotation(A.extremite2 as PointAbstrait, O, angle) as PointAbstrait
    const s = segment(M, N, color)
    s.styleExtremites = A.styleExtremites
    return s
  }
  // Vecteur
  let x = 0
  let y = 0

  if ('x' in A && 'y' in A) {
    x =
      A.x * Math.cos((angle * Math.PI) / 180) -
      A.y * Math.sin((angle * Math.PI) / 180)
    y =
      A.x * Math.sin((angle * Math.PI) / 180) +
      A.y * Math.cos((angle * Math.PI) / 180)
  }
  return vecteur(x, y) as Vecteur
}

/** Construit l'image d'un objet par homothétie
 * @param {PointAbstrait|Segment|Droite|Polygone|Vecteur} Objet Objet MathAlea2d choisi parmi un point, un segment, une droite, un polygone ou un vecteur
 * @param {PointAbstrait} O Centre de l'homothétie
 * @param {number} k Rapport de l'homothétie
 * @param {string} [nom = ''] Nom du point-image
 * @param {string} [positionLabel = 'above'] Position du point-image. Les possibilités sont : 'left', 'right', 'below', 'above', 'above right', 'above left', 'below right', 'below left'. Si on se trompe dans l'orthographe, ce sera 'above left' et si on ne précise rien, pour un point ce sera 'above'.
 * @param {string} [color='black']  Couleur de l'image : du type 'blue' ou du type '#f15929' (non valable pour un point et pour un vecteur)
 * @example p2 = homothetie(p1,I,2)
 * // p2 est l'image de p1 par une homothétie de centre I et de rapport 2
 * @example N = homothetie(M, I, 0.5, 'point N', 'right')
 * // N est l'image de M par une homothétie de centre I et de rapport 0.5.  Le point sera affiché comme "point N" et ce nom sera écrit à droite de sa position.
 * @example s = homothetie(segment(A, B), I, -0.5, '', '','blue')
 * // s est l'image du segment [AB] par une homothétie de centre I et de rapport -0.5.  s sera en bleu.
 * @author Rémi Angot
 * @return {PointAbstrait|Segment|Droite|Polygone|Vecteur}
 */

// Surcharges
export function homothetie(
  Objet: IPointAbstrait,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function homothetie(
  Objet: IPoint,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function homothetie(
  Objet: IDroite,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function homothetie(
  Objet: ISegment,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function homothetie(
  Objet: IPolygone,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function homothetie(
  Objet: IVecteur,
  O: IPointAbstrait,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur

// Implémentation
export function homothetie(
  objet: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  O: IPointAbstrait,
  k: number,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | PointAbstrait | Droite | Segment | Polygone | Vecteur {
  // Points (PointAbstrait ou PointAbstrait)
  if (objet instanceof PointAbstrait || objet instanceof PointAbstrait) {
    const x = O.x + k * (objet.x - O.x)
    const y = O.y + k * (objet.y - O.y)
    if (objet instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if ('listePoints' in objet) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < objet.listePoints.length; i++) {
      p2[i] = homothetie(objet.listePoints[i], O, k) as PointAbstrait
      p2[i].nom = objet.listePoints[i].nom + "'"
    }
    return polygone(p2, color)
  }

  // Droite
  if ('pente' in objet) {
    const M = homothetie(
      pointAbstrait(objet.x1, objet.y1),
      O,
      k,
    ) as PointAbstrait
    const N = homothetie(
      pointAbstrait(objet.x2, objet.y2),
      O,
      k,
    ) as PointAbstrait
    return droite(M, N, '', color)
  }

  // Segment
  if ('extremite1' in objet && 'extremite2' in objet) {
    const M = homothetie(objet.extremite1, O, k) as PointAbstrait
    const N = homothetie(objet.extremite2, O, k) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (objet as any).styleExtremites
    return s
  }

  // Vecteur

  return vecteur(objet.x * k, objet.y * k)
}

/**
 * Renvoie le  symétrique de A par la droite d.
 * @return {PointAbstrait|Polygone|Droite|Segment|Vecteur} M image de A par la symétrie axiale d'axe d.
 * @author Jean-Claude Lhote
 */

// Surcharges
export function symetrieAxiale(
  A: IPolygone,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function symetrieAxiale(
  A: IVecteur,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur
export function symetrieAxiale(
  A: IDroite,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function symetrieAxiale(
  A: ISegment,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function symetrieAxiale(
  A: IPointAbstrait,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function symetrieAxiale(
  A: IPoint,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait

// Implémentation
export function symetrieAxiale(
  A: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  d: IDroite,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | PointAbstrait | Droite | Segment | Polygone | Vecteur {
  let x: number, y: number
  const a = d.a
  const b = d.b
  const c = d.c
  const k = 1 / (a * a + b * b)

  // Points (PointAbstrait ou PointAbstrait)
  if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
    if (a === 0) {
      x = A.x
      y = -(A.y + (2 * c) / b)
    } else if (b === 0) {
      y = A.y
      x = -(A.x + (2 * c) / a)
    } else {
      x = k * ((b * b - a * a) * A.x - 2 * a * b * A.y - 2 * a * c)
      y =
        k *
          ((a * a - b * b) * A.y - 2 * a * b * A.x + (a * a * c) / b - b * c) -
        c / b
    }
    if (A instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if ('listePoints' in A) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < A.listePoints.length; i++) {
      p2[i] = symetrieAxiale(A.listePoints[i], d) as unknown as PointAbstrait
      p2[i].nom = A.listePoints[i].nom + "'"
    }
    return polygone(p2, color)
  }

  // Droite
  if (A instanceof Droite || 'pente' in A) {
    const M = symetrieAxiale(pointAbstrait(A.x1, A.y1), d) as PointAbstrait
    const N = symetrieAxiale(pointAbstrait(A.x2, A.y2), d) as PointAbstrait
    return droite(M, N, color)
  }

  // Segment
  if ('extremite1' in A && 'extremite2' in A) {
    const M = symetrieAxiale(A.extremite1, d) as PointAbstrait
    const N = symetrieAxiale(A.extremite2, d) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (A as any).styleExtremites
    return s
  }

  // Vecteur
  let O: PointAbstrait
  if (egal(b, 0)) {
    O = pointAbstrait(-c / a, 0)
  } else {
    O = pointAbstrait(0, -c / b)
  }
  const M = translation(O, A as IVecteur) as PointAbstrait
  const N = symetrieAxiale(M, d) as PointAbstrait
  const v = vecteur(N.x - O.x, N.y - O.y)
  return v
}

/**
 * N = projectionOrtho(M,d,'N','below left')
 * @author Jean-Claude Lhote
 */
// Surcharges
export function projectionOrtho(
  M: IPointAbstrait,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
): PointAbstrait
export function projectionOrtho(
  M: IPoint,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
): PointAbstrait
export function projectionOrtho(
  M: IVecteur,
  d: IDroite,
  nom?: string,
  positionLabel?: string,
): Vecteur

// Implémentation
export function projectionOrtho(
  M: IPointAbstrait | IPoint | IVecteur,
  d: IDroite,
  nom = '',
  positionLabel = 'above',
): PointAbstrait | PointAbstrait | Vecteur {
  const a = d.a
  const b = d.b
  const c = d.c
  const k = 1 / (a * a + b * b)
  let x: number, y: number

  // Points (PointAbstrait ou PointAbstrait)
  if (M instanceof PointAbstrait || M instanceof PointAbstrait) {
    if (a === 0) {
      x = M.x
      y = -c / b
    } else if (b === 0) {
      y = M.y
      x = -c / a
    } else {
      x = k * (b * b * M.x - a * b * M.y - a * c)
      y = k * (-a * b * M.x + a * a * M.y + (a * a * c) / b) - c / b
    }
    if (M instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Vecteur
  let O: PointAbstrait
  if (egal(b, 0)) O = pointAbstrait(-c / a, 0)
  else O = pointAbstrait(0, -c / b)
  const A = translation(O, M as IVecteur) as PointAbstrait
  const N = projectionOrtho(A, d) as PointAbstrait
  const v = vecteur(O, N)
  return v
}

/**
 * Construit l'image d'un objet par affinité orthogonale
 * @param {PointAbstrait|PointAbstrait|Segment|Droite|Polygone|Vecteur} Objet Objet MathAlea2d choisi parmi un point, un segment, une droite, un polygone ou un vecteur
 * @param {Droite} d Direction de l'affinité
 * @param {number} k Rapport de l'affinité
 * @param {string} [nom=''] Nom de l'image (uniquement valable pour un point)
 * @param {string} [positionLabel = 'above'] Position de l'image (uniquement valable pour un point)
 * @param {string} [color='black']  Couleur de la valeur indiquée : du type 'blue' ou du type '#f15929' (non valable pour un point et pour un vecteur)
 * @author Jean-Claude Lhote
 * @example p2 = affiniteOrtho(p1,droite(B, C),k)
 * // p2 est l'image de p1 par une affinité orthogonale dont la direction est la droite (BC) et de rapport k
 * @example N = affiniteOrtho(M,d,0.5,'point N','right')
 * // N est l'image du point M par une affinité orthogonale de direction d et de rapport 0.5. Le point sera affiché comme "point N" et ce nom sera écrit à droite de sa position.
 * @example s = affiniteOrtho(segment(A, B),d,0.1,'','','red')
 * // s est l'image du segment [AB] par une affinité orthogonale de direction d et de rapport 0.1. s sera rouge.
 * @return {PointAbstrait|PointAbstrait|Segment|Droite|Polygone|Vecteur} Retourne un objet du même type que le paramètre objet de la fonction
 */
// JSDOC Validee par EE Juin 2022

// Surcharges

export function affiniteOrtho(
  A: IPoint,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function affiniteOrtho(
  A: IDroite,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function affiniteOrtho(
  A: ISegment,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function affiniteOrtho(
  A: IPolygone,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function affiniteOrtho(
  A: IVecteur,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur
export function affiniteOrtho(
  A: IPointAbstrait,
  d: IDroite,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait

// Implémentation
export function affiniteOrtho(
  A: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  d: IDroite,
  k: number,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | PointAbstrait | Droite | Segment | Polygone | Vecteur {
  const a = d.a
  const b = d.b
  const c = d.c
  const q = 1 / (a * a + b * b)
  let x: number, y: number

  // Points (PointAbstrait ou PointAbstrait)
  if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
    if (a === 0) {
      x = A.x
      y = k * A.y + (c * (k - 1)) / b
    } else if (b === 0) {
      y = A.y
      x = k * A.x + (c * (k - 1)) / a
    } else {
      x = q * (b * b * A.x - a * b * A.y - a * c) * (1 - k) + k * A.x
      y =
        q * (a * a * A.y - a * b * A.x + (a * a * c) / b) * (1 - k) +
        (k * c) / b +
        k * A.y -
        c / b
    }
    if (A instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if (A instanceof Polygone) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < A.listePoints.length; i++) {
      p2[i] = affiniteOrtho(A.listePoints[i], d, k) as PointAbstrait
      p2[i].nom = A.listePoints[i].nom + "'"
    }
    return polygone(p2, color)
  }

  // Droite
  if ('pente' in A) {
    const M = affiniteOrtho(pointAbstrait(A.x1, A.y1), d, k) as PointAbstrait
    const N = affiniteOrtho(pointAbstrait(A.x2, A.y2), d, k) as PointAbstrait
    return droite(M, N, color)
  }

  // Segment
  if (A instanceof Segment) {
    const M = affiniteOrtho(A.extremite1, d, k) as PointAbstrait
    const N = affiniteOrtho(A.extremite2, d, k) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (A as any).styleExtremites
    return s
  }

  // Vecteur
  let O: PointAbstrait
  if (egal(b, 0)) {
    O = pointAbstrait(-c / a, 0)
  } else {
    O = pointAbstrait(0, -c / b)
  }
  const M = translation(O, A as IVecteur)
  const N = affiniteOrtho(M, d, k)
  return new Vecteur(O, N)
}

/**
 *
 * @param {PointAbstrait|PointAbstrait|Polygone|Droite|Vecteur|Segment} A // Le point dont on veut l'image
 * @param {PointAbstrait} O // Le centre de la similitude
 * @param {number} a // L'angle de la rotation
 * @param {number} k // le rapport de l'homothétie
 * @param {string} nom
 * @param {string} positionLabel
 * M = similitude(B,O,30,1.1,'M') // Le point M est l'image de B dans la similitude de centre O d'angle 30° et de rapport 1.1
 * @author Jean-Claude Lhote
 */

// Surcharges
export function similitude(
  A: IPointAbstrait,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function similitude(
  A: IPoint,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): PointAbstrait
export function similitude(
  A: IDroite,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Droite
export function similitude(
  A: ISegment,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Segment
export function similitude(
  A: IPolygone,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Polygone
export function similitude(
  A: IVecteur,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom?: string,
  positionLabel?: string,
  color?: string,
): Vecteur

// Implémentation
export function similitude(
  A: IPointAbstrait | IPoint | IDroite | ISegment | IPolygone | IVecteur,
  O: IPointAbstrait,
  a: number,
  k: number,
  nom = '',
  positionLabel = 'above',
  color = 'black',
): PointAbstrait | PointAbstrait | Droite | Segment | Polygone | Vecteur {
  // Points (PointAbstrait ou PointAbstrait)
  if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
    const ra = degToRad(a)
    const x =
      O.x + k * (Math.cos(ra) * (A.x - O.x) - Math.sin(ra) * (A.y - O.y))
    const y =
      O.y + k * (Math.cos(ra) * (A.y - O.y) + Math.sin(ra) * (A.x - O.x))
    if (A instanceof PointAbstrait) {
      return pointAbstrait(x, y, nom, positionLabel)
    } else {
      return pointAbstrait(x, y, nom, positionLabel)
    }
  }

  // Polygone
  if ('listePoints' in A) {
    const p2: PointAbstrait[] = []
    for (let i = 0; i < A.listePoints.length; i++) {
      p2[i] = similitude(A.listePoints[i], O, a, k) as PointAbstrait
      p2[i].nom = A.listePoints[i].nom + "'"
    }
    return polygone(p2, color)
  }

  // Droite
  if ('pente' in A) {
    const M = similitude(pointAbstrait(A.x1, A.y1), O, a, k) as PointAbstrait
    const N = similitude(pointAbstrait(A.x2, A.y2), O, a, k) as PointAbstrait
    return droite(M, N, color)
  }

  // Segment
  if ('extremite1' in A && 'extremite2' in A) {
    const M = similitude(A.extremite1, O, a, k) as PointAbstrait
    const N = similitude(A.extremite2, O, a, k) as PointAbstrait
    const s = segment(M, N, color)
    ;(s as any).styleExtremites = (A as any).styleExtremites
    return s
  }

  // Vecteur
  let v = A as Vecteur
  const V = rotation(v as any, O as PointAbstrait, a)
  v = homothetie(V, O, k) as unknown as Vecteur
  return v
}
