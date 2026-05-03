import type { IPointAbstrait } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'

export class PointAbstrait extends ObjetMathalea2D {
  nom: string
  x: number
  y: number

  constructor(
    arg1: string | number,
    arg2: number,
    arg3?: number | string,
    positionLabel = 'above',
  ) {
    super()
    this.typeObjet = 'point'
    this.x = 0
    this.y = 0
    this.nom = ''
    if (arguments.length === 1) {
      this.nom = String(arg1)
    } else if (arguments.length === 2) {
      if (Number.isNaN(arg1) || Number.isNaN(arg2)) {
        window.notify('Point : les coordonnées ne sont pas valides', {
          arg1,
          arg2,
        })
      } else {
        this.x = Number(arg1)
        this.y = arg2
      }
    } else {
      if (Number.isNaN(arg1) || Number.isNaN(arg2)) {
        window.notify('Point : les coordonnées ne sont pas valides', {
          arg1,
          arg2,
        })
      } else {
        this.x = Number(arg1)
        this.y = arg2
      }
      this.nom = String(arg3)
    }

    this.positionLabel = positionLabel
    this.bordures = [this.x, this.y, this.x, this.y]
  }

  xSVG(coeff: number) {
    return Number((this.x * coeff).toFixed(1))
  }

  ySVG(coeff: number) {
    return Number((-this.y * coeff).toFixed(1))
  }
}

export function pointAbstrait(
  x: number,
  y: number,
  A = '',
  positionLabel = 'above',
) {
  return new PointAbstrait(x, y, A, positionLabel)
}

export function isPointAbstrait(objet: any): objet is PointAbstrait {
  return objet instanceof PointAbstrait
}
export function isPointsAbstraits(objets: any[]): objets is PointAbstrait[] {
  return objets.every(isPointAbstrait)
}
/**
 * A = point('A') //son nom
 * A = point(x,y) //ses coordonnées
 * A = point(x,y,'A') //ses coordonnées et son nom
 * A = point(x,y,'A',below') //ses coordonnées,son nom et la position de son label
 * @deprecated Utiliser PointAbstrait à la place
 * @author Rémi Angot
 * @class
 */
export class Point extends PointAbstrait {}

/**
 * Crée un objet Point ayant les propriétés suivantes :
 * @param {number} x abscisse
 * @param {number} y ordonnée
 * @param {string} nom son nom qui apparaîtra
 * @deprecated Utiliser pointAbstrait à la place
 * @param {string} [positionLabel] Les possibilités sont : 'left', 'right', 'below', 'above', 'above right', 'above left', 'below right', 'below left'. Si on se trompe dans l'orthographe, ce sera 'above left' et si on ne précise rien, pour un point ce sera 'above'.
 * @return {PointAbstrait}
 */
export function point(x: number, y: number, nom = '', positionLabel = 'above') {
  return new PointAbstrait(x, y, nom, positionLabel)
}

export const IToPointAbstrait = (point: IPointAbstrait): PointAbstrait =>
  pointAbstrait(point.x, point.y, point.nom, point.positionLabel)
