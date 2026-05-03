import type {
  ICercle,
  IDroite,
  IPointAbstrait,
  IPolygone,
  ISegment,
} from './Interfaces'

/**
 * Teste l'appartenance d'un point dans un triangle
 * @param {IPointAbstrait} M Point à tester
 * @param {IPointAbstrait} A Premier sommet du triangle
 * @param {IPointAbstrait} B Deuxième sommet du triangle
 * @param {IPointAbstrait} C Troisième sommet du triangle
 * @example estDansTriangle(M, V, S, T) // Renvoie true si M appartient au triangle VST, false sinon
 * @author Eric Elter
 * @return {boolean}
 */
export function estDansTriangle(
  M: IPointAbstrait,
  A: IPointAbstrait,
  B: IPointAbstrait,
  C: IPointAbstrait,
): boolean {
  const vMA = { x: A.x - M.x, y: A.y - M.y }
  const vMB = { x: B.x - M.x, y: B.y - M.y }
  const vMC = { x: C.x - M.x, y: C.y - M.y }
  const x1 = vMB.x * vMC.y - vMB.y * vMC.x
  const x2 = vMC.x * vMA.y - vMC.y * vMA.x
  const x3 = vMA.x * vMB.y - vMA.y * vMB.x
  return (x1 >= 0 && x2 >= 0 && x3 >= 0) || (x1 <= 0 && x2 <= 0 && x3 <= 0)
}

/**
 * Teste l'appartenance d'un point dans un quadrilatère
 * @param {IPointAbstrait} M Point à tester
 * @param {IPointAbstrait} A Premier sommet du quadrilatère
 * @param {IPointAbstrait} B Deuxième sommet du quadrilatère
 * @param {IPointAbstrait} C Troisième sommet du quadrilatère
 * @param {IPointAbstrait} D Quatrième sommet du quadrilatère
 * @example estDansQuadrilatere(M, F, G, H, I) // Renvoie true si M appartient au quadrilatère FGHI, false sinon
 * @author Eric Elter
 * @return {boolean}
 */
export function estDansQuadrilatere(
  M: IPointAbstrait,
  A: IPointAbstrait,
  B: IPointAbstrait,
  C: IPointAbstrait,
  D: IPointAbstrait,
): boolean {
  return estDansTriangle(M, A, B, C) || estDansTriangle(M, A, C, D)
}

/**
 * Teste l'appartenance d'un point à un polygone convexe
 * @param {IPointAbstrait} M Point à tester
 * @param {Polygone} p Polygone dont on veut tester l'appartenance avec le point
 * @example estDansPolygoneConvexe(M, p1) // Renvoie true si M appartient au polygone convexe p1, false sinon
 * @author Jean-Claude Lhote
 * @return {boolean}
 */
export function estDansPolygoneConvexe(
  M: IPointAbstrait,
  p: IPolygone,
): boolean {
  const l = p.listePoints.length
  if (l === 3) {
    return estDansTriangle(
      M,
      p.listePoints[0],
      p.listePoints[1],
      p.listePoints[2],
    )
  } else {
    const A = p.listePoints[0]
    const B = p.listePoints[1]
    const C = p.listePoints[l - 1]
    // Import dynamique pour éviter la circularité
    const { polygone } = require('./polygones')
    const p2 = polygone(...p.listePoints.slice(1))
    if (estDansTriangle(M, A, B, C)) return true
    else return estDansPolygoneConvexe(M, p2)
  }
}

/**
 * Teste l'appartenance d'un point à tout type de polygone (non convexe ou convexe)
 * Pour info, la fonction utilise une triangulation du polygone réalisée par la librairie earcut
 * @param {IPointAbstrait} M Point à tester
 * @param {Polygone} p Polygone dont on veut tester l'appartenance avec le point
 * @example estDansPolygone(M, p1) // Renvoie true si M appartient au polygone p1, false sinon
 * @author Jean-Claude Lhote
 * @return {boolean}
 */
export function estDansPolygone(M: IPointAbstrait, p: IPolygone): boolean {
  for (const triangle of p.triangulation) {
    if (estDansTriangle(M, triangle[0], triangle[1], triangle[2])) return true
  }
  return false
}

/**
 * Teste si un point M est sur un objet géométrique (droite, segment, demi-droite, cercle)
 */
export function pointEstSur(
  M: IPointAbstrait,
  objet:
    | IDroite
    | ISegment
    | { extremite1: IPointAbstrait; extremite2: IPointAbstrait }
    | ICercle,
): boolean {
  // Droite (ax + by + c = 0)
  if ('pente' in objet) {
    return Math.abs(objet.a * M.x + objet.b * M.y + objet.c) <= 0.01
  }

  // Segment (borné) — détection via propriété longueur (ISegment)
  if ('extremite1' in objet && 'extremite2' in objet && 'longueur' in objet) {
    const prodvect =
      (objet.extremite2.x - objet.extremite1.x) * (M.y - objet.extremite1.y) -
      (M.x - objet.extremite1.x) * (objet.extremite2.y - objet.extremite1.y)
    const prodscal =
      (M.x - objet.extremite1.x) * (objet.extremite2.x - objet.extremite1.x) +
      (M.y - objet.extremite1.y) * (objet.extremite2.y - objet.extremite1.y)
    const prodscalABAB =
      (objet.extremite2.x - objet.extremite1.x) ** 2 +
      (objet.extremite2.y - objet.extremite1.y) ** 2
    return (
      Math.abs(prodvect) <= 0.01 && prodscal >= 0 && prodscal <= prodscalABAB
    )
  }

  // Demi-droite (non bornée dans un sens) — détection générique par extremite1/extremite2
  if ('extremite1' in objet && 'extremite2' in objet) {
    const OM = { x: M.x - objet.extremite1.x, y: M.y - objet.extremite1.y }
    const vd = {
      x: objet.extremite2.x - objet.extremite1.x,
      y: objet.extremite2.y - objet.extremite1.y,
    }
    const prodscal = OM.x * vd.x + OM.y * vd.y
    const prodvect = OM.x * vd.y - OM.y * vd.x
    return Math.abs(prodvect) <= 0.01 && Math.abs(prodscal) >= 0.01
  }

  // Cercle (distance au centre = rayon)
  if ('rayon' in objet && 'centre' in objet) {
    return Math.abs(longueur(M, objet.centre) - Number(objet.rayon)) <= 0.01
  }

  return false
}

export const longueur = (
  A: IPointAbstrait,
  B: IPointAbstrait,
  precision = 2,
): number => {
  const dx = B.x - A.x
  const dy = B.y - A.y
  return Number(Math.sqrt(dx * dx + dy * dy).toFixed(precision))
}
/**
 * Convertit un nombre de degrés quelconque en une mesure comprise entre -180 et 180
 * @param {number} a Valeur en degrés dont on cherche la valeur entre -180 et 180
 * @example x = angleModulo(170)
 * // x contient 170
 * @example x = angleModulo(190)
 * // x contient -170
 * @example x = angleModulo(3690)
 * // x contient 90
 * @example x = angleModulo(180)
 * // x contient 180
 * @example x = angleModulo(-180)
 * // x contient 180
 * @return {number}
 */
// JSDOC Validee par EE Juin 2022

export function angleModulo(a: number) {
  while (a <= -180) a = a + 360
  while (a > 180) a = a - 360
  return a
} /**
 * Retourne la valeur signée de la mesure d'un angle en degré
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {number} [precision = 2] Nombre maximal de décimales de la valeur arrondie de la mesure de l'angle orienté
 * @example x = angleOriente(H,E,T)
 * // x contient la valeur de la mesure de l'angle orienté HET, arrondie au centième
 * @example x = angleOriente(H,E,T,0)
 * // x contient la valeur de la mesure de l'angle orienté HET, arrondie à l'unité
 * @return {number}
 * @author Jean-Claude Lhote
 */
export function angleOriente(
  A: IPointAbstrait,
  O: IPointAbstrait,
  B: IPointAbstrait,
  precision = 2,
) {
  const OA = longueur(O, A, precision)
  const OB = longueur(O, B, precision)
  if (OA < 1e-12 || OB < 1e-12) {
    // On considère qu'un côté de l'angle a une longueur nulle, et ce n'est pas normal !
    return 0
  }

  // Vecteurs OA et OB
  const vOA = { x: A.x - O.x, y: A.y - O.y }
  const vOB = { x: B.x - O.x, y: B.y - O.y }

  // Produit vectoriel (déterminant 2D) : OA × OB
  const produitVectoriel = vOA.x * vOB.y - vOA.y * vOB.x

  // Signe de l'angle orienté
  const signe = produitVectoriel >= 0 ? 1 : -1

  return Number((signe * angle(A, O, B, 10)).toFixed(precision))
} /**
 * Retourne la valeur la mesure d'un angle en radian
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {number} [precision = 2] Nombre maximal de décimales de la valeur arrondie de la mesure de l'angle orienté
 * @example x = angleradian(H,E,T)
 * // x contient la valeur de la mesure de l'angle HET en radians, arrondie au centième
 * @example x = angleradian(H,E,T,0)
 * // x contient la valeur de la mesure de l'angle HET en radians, arrondie à l'unité
 * @return {number}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022

export function angleradian(
  A: IPointAbstrait,
  O: IPointAbstrait,
  B: IPointAbstrait,
  precision = 2,
) {
  const OA = longueur(O, A, precision)
  const OB = longueur(O, B, precision)
  const AB = longueur(A, B, precision)
  return Number(
    Math.acos((AB ** 2 - OA ** 2 - OB ** 2) / (-2 * OA * OB)).toFixed(
      precision,
    ),
  )
} /**
 * Renvoie la mesure d'angle en degré
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {number} [precision = 2] Nombre maximal de décimales de la valeur arrondie de la mesure de l'angle
 * @example x = angle(H,E,T)
 * // x contient la mesure en degré de l'angle HET, arrondi au centième
 * @example x = angle(H,E,T,0)
 * // x contient la mesure en degré de l'angle HET, arrondi à l'unité
 * @return {number}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022

export function angle(
  A: IPointAbstrait,
  O: IPointAbstrait,
  B: IPointAbstrait,
  precision = 2,
) {
  const OA = longueur(O, A, precision)
  const OB = longueur(O, B, precision)
  const AB = longueur(A, B, precision)
  if (OA > 0 && OB > 0) {
    const v = { x: A.x - O.x, y: A.y - O.y }
    const w = { x: B.x - O.x, y: B.y - O.y }
    if (Math.abs(v.x * w.y - v.y * w.x) <= 0.000000000001) {
      // vecteurs colinéaires à epsilon près pour éviter les effets de bords dus aux flottants.
      if (v.x * w.x > 0) return 0
      else if (v.x * w.x < 0) return 180
      else if (v.y * w.y > 0) return 0
      else return 180
    } else {
      let cos = (AB ** 2 - OA ** 2 - OB ** 2) / (-2 * OA * OB)
      if (cos < -1) cos = -1
      if (cos > 1) cos = 1
      const alpha = Math.acos(cos)
      return Number(((alpha * 180) / Math.PI).toFixed(precision))
    }
  } else {
    // Ce n'est pas normal de demander la mesure d'un angle dont un côté a une longueur nulle.
    return 0
  }
}
/**
 * norme(V) renvoie la norme du vecteur
 *
 * @author Rémi Angot
 */

export function norme(v: { x: number; y: number }): number {
  return Math.sqrt(v.x ** 2 + v.y ** 2)
}

/**
 * Teste si un segment coupe un cercle, une droite, une demi-droite ou un autre segment
 * Déleste la classe Segment pour éviter les dépendances circulaires.
 */
export function estSecant(
  s:
    | ISegment
    | {
        extremite1: IPointAbstrait
        extremite2: IPointAbstrait
      },
  objet:
    | IDroite
    | ISegment
    | {
        extremite1: IPointAbstrait
        extremite2: IPointAbstrait
      }
    | ICercle,
): boolean {
  const A = s.extremite1
  const B = s.extremite2
  const eps = 0.01

  // Segment dégénéré: on teste si l’unique point est sur l’objet
  if (Math.abs(A.x - B.x) < eps && Math.abs(A.y - B.y) < eps) {
    return pointEstSur(A, objet as any)
  }

  // Aides internes
  const lineFrom2Pts = (P: IPointAbstrait, Q: IPointAbstrait) => {
    // ax + by + c = 0
    const a = P.y - Q.y
    const b = Q.x - P.x
    const c = P.x * Q.y - Q.x * P.y
    return { a, b, c }
  }
  const intersectLines = (
    L1: { a: number; b: number; c: number },
    L2: { a: number; b: number; c: number },
  ): IPointAbstrait | null => {
    const det = L1.a * L2.b - L2.a * L1.b
    if (Math.abs(det) < 1e-12) return null
    const x = (L1.b * L2.c - L2.b * L1.c) / det
    const y = (L1.c * L2.a - L2.c * L1.a) / det
    return { x, y, nom: '' } as IPointAbstrait
  }
  const onSegment = (M: IPointAbstrait, P: IPointAbstrait, Q: IPointAbstrait) =>
    Math.min(P.x, Q.x) - eps <= M.x &&
    M.x <= Math.max(P.x, Q.x) + eps &&
    Math.min(P.y, Q.y) - eps <= M.y &&
    M.y <= Math.max(P.y, Q.y) + eps &&
    Math.abs((Q.x - P.x) * (M.y - P.y) - (Q.y - P.y) * (M.x - P.x)) <= eps

  const dist2PointSegment = (
    M: IPointAbstrait,
    P: IPointAbstrait,
    Q: IPointAbstrait,
  ) => {
    const vx = Q.x - P.x
    const vy = Q.y - P.y
    const wx = M.x - P.x
    const wy = M.y - P.y
    const vv = vx * vx + vy * vy
    if (vv === 0) return (M.x - P.x) ** 2 + (M.y - P.y) ** 2
    let t = (wx * vx + wy * vy) / vv
    t = Math.max(0, Math.min(1, t))
    const px = P.x + t * vx
    const py = P.y + t * vy
    return (M.x - px) ** 2 + (M.y - py) ** 2
  }

  // Cercle
  if ('rayon' in (objet as any) && 'centre' in (objet as any)) {
    const R = Number((objet as ICercle).rayon)
    const C = (objet as ICercle).centre
    const d2 = dist2PointSegment(C, A, B)
    if (d2 <= (R + eps) ** 2) return true
    // sinon, pas d’intersection
    return false
  }

  // Droite (via équation ax+by+c=0 si dispo)
  if ('a' in (objet as any) && 'b' in (objet as any) && 'c' in (objet as any)) {
    const Ls = lineFrom2Pts(A, B)
    const Ld = {
      a: (objet as any).a as number,
      b: (objet as any).b as number,
      c: (objet as any).c as number,
    }
    const I = intersectLines(Ls, Ld)
    return I != null && onSegment(I, A, B)
  }

  // Segment ou demi-droite générique (extrémités)
  if ('extremite1' in (objet as any) && 'extremite2' in (objet as any)) {
    const C = (objet as any).extremite1 as IPointAbstrait
    const D = (objet as any).extremite2 as IPointAbstrait
    const L1 = lineFrom2Pts(A, B)
    const L2 = lineFrom2Pts(C, D)
    const I = intersectLines(L1, L2)

    if (I == null) {
      // Parallèles ou confondues -> tester recouvrement (points sur l’autre)
      return (
        onSegment(A, C, D) ||
        onSegment(B, C, D) ||
        onSegment(C, A, B) ||
        onSegment(D, A, B)
      )
    }

    // Si l’objet dispose d’une longueur => segment borné, sinon demi-droite
    const isOtherSegment = 'longueur' in (objet as any)

    const IOnS = onSegment(I, A, B)
    if (!IOnS) return false
    if (isOtherSegment) return onSegment(I, C, D)

    // Demi-droite: vérifier la direction (produit scalaire >= 0 par rapport à C->D)
    const dirx = D.x - C.x
    const diry = D.y - C.y
    const vix = I.x - C.x
    const viy = I.y - C.y
    return vix * dirx + viy * diry >= -eps
  }

  // Par défaut
  return false
}
/**
 * Normalise un angle pour l'orientation d'un div
 * Les divs HTML ne supportent bien la rotation que dans l'intervalle [-180, 180]
 * Cette fonction convertit n'importe quel angle en son équivalent dans cet intervalle
 * @param orientation Angle en degrés (peut être négatif ou > 360)
 * @returns Angle normalisé entre -180 et 180 degrés
 * @example normaliseOrientation(326) // retourne -34
 * @example normaliseOrientation(190) // retourne -170
 * @example normaliseOrientation(-200) // retourne 160
 */
export function normaliseOrientation(orientation: number): number {
  // Ramène d'abord l'angle dans [0, 360[
  let angle = orientation % 360

  // Gère les angles négatifs
  if (angle < 0) {
    angle += 360
  }

  // Convertit en [-180, 180]
  if (angle > 180) {
    angle -= 360
  }

  return angle
}
