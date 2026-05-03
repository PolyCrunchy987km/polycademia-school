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
 * @author Jean-Claude Lhote et Rémi Angot
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
