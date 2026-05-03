import type { IPointAbstrait, IVecteur } from './Interfaces'
import type { PointAbstrait } from './PointAbstrait'

export class Vecteur {
  nom: string
  x: number
  y: number

  // Surcharges
  constructor(x: number, y: number, nom?: string)
  constructor(
    A: PointAbstrait | IPointAbstrait,
    B: PointAbstrait | IPointAbstrait,
    nom?: string,
  )
  constructor(
    a: number | PointAbstrait | IPointAbstrait,
    b: number | PointAbstrait | IPointAbstrait,
    nom: string = '',
  ) {
    this.nom = nom ?? ''

    const isPointLike = (v: unknown): v is { x: number; y: number } =>
      typeof v === 'object' &&
      v != null &&
      'x' in (v as any) &&
      'y' in (v as any)

    if (typeof a === 'number' && typeof b === 'number') {
      // Construction par composantes
      this.x = a
      this.y = b
      return
    }

    if (isPointLike(a) && isPointLike(b)) {
      // Construction par deux points A -> B
      this.x = b.x - a.x
      this.y = b.y - a.y
      return
    }

    // Cas invalide
    window.notify(
      'Vecteur : utilisez (x: number, y: number) ou (A, B) pour construire un vecteur.',
      { a, b, nom },
    )
    this.x = 0
    this.y = 0
  }

  norme() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  oppose() {
    this.x = -this.x
    this.y = -this.y
  }

  xSVG(coeff: number) {
    return this.x * coeff
  }

  ySVG(coeff: number) {
    return -this.y * coeff
  }
}

/**
 * @example v = vecteur('V') // son nom
 * @example v = vecteur(x,y) // ses composantes
 * @example v = vecteur(A,B) // son origine et son extrémité (deux Points)
 * @example v = vecteur(x,y,'v') // son nom et ses composantes.
 * @author Jean-claude Lhote et Rémi Angot
 */
// Surcharges pour la fabrique

export function vecteur(x: number, y: number, nom?: string): IVecteur
export function vecteur(
  A: PointAbstrait | IPointAbstrait,
  B: PointAbstrait | IPointAbstrait,
  nom?: string,
): IVecteur
export function vecteur(
  a: number | PointAbstrait | IPointAbstrait,
  b: number | PointAbstrait | IPointAbstrait,
  nom: string = '',
): IVecteur {
  return new Vecteur(a as any, b as any, nom)
}

export function cross(a: number[], b: number[]): number[] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function dot(a: number[], b: number[]): number {
  if (a.length !== b.length)
    throw new Error('Les vecteurs doivent avoir la même taille')
  let res = 0
  for (let i = 0; i < a.length; i++) {
    res += a[i] * b[i]
  }
  return res
}

// effectue le produit d'une matrice nx3 par un vecteur de taille 3
export function matriceMultiply(A: number[][], V: number[]): number[] {
  if (A[0].length !== V.length)
    throw new Error(
      'Le nombre de colonnes de la matrice doit être égal à la taille du vecteur',
    )
  const res: number[] = []
  for (let i = 0; i < A.length; i++) {
    let sum = 0
    for (let j = 0; j < A[0].length; j++) {
      sum += A[i][j] * V[j]
    }
    res.push(sum)
  }
  return res
}

export function norme(v: number[]): number {
  return Math.sqrt(v.reduce((acc, val) => acc + val * val, 0))
}

export function scale(v: number[], scalar: number): number[] {
  return v.map((component) => component * scalar)
}

export function normalize(v: number[]): number[] {
  const vNorm = norme(v)
  if (vNorm === 0) throw new Error('Le vecteur ne peut pas être normalisé')
  return scale(v, 1 / vNorm)
}
