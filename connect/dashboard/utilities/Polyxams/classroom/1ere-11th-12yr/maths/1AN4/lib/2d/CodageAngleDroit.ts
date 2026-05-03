import { context } from '../../modules/context'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import type { IPointAbstrait } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { IToPointAbstrait, type PointAbstrait } from './PointAbstrait'
import { polygone } from './polygones'
import { polyline } from './Polyline'
import { rotation } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Code un angle droit
 * @param {PointAbstrait} A Point sur un côté de l'angle droit
 * @param {PointAbstrait} O Sommet de l'angle droit
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle droit
 * @param {string} [color='black'] Couleur du codage : du type 'blue' ou du type '#f15929'
 * @param {number} [d=0.4] Taille du codage de l'angle droit
 * @param {number} [epaisseur=0.5] Epaisseur du trait
 * @param {number} [opacite=1] Opacité du trait
 * @param {string} [couleurDeRemplissage='none'] 'none' si on ne veut pas de remplissage, sinon une couleur du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage=1] Taux d'opacité du remplissage entre 0 et 1
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {PointAbstrait} depart Point sur un côté de l'angle droit
 * @property {PointAbstrait} sommet Sommet de l'angle droit
 * @property {PointAbstrait} arrivee Point sur l'autre côté de l'angle droit
 * @property {string} color Couleur du codage. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} taille Taille du codage de l'angle droit
 * @property {string} couleurDeRemplissage 'none' si on ne veut pas de remplissage. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opaciteDeRemplissage Taux d'opacité du remplissage entre 0 et 1
 * @class
 */
// JSDOC Validee par EE Juin 2022

const longueur = (A: IPointAbstrait, B: IPointAbstrait) =>
  Math.sqrt((B.x - A.x) ** 2 + (B.y - A.y) ** 2)

export class CodageAngleDroit extends ObjetMathalea2D {
  sommet: PointAbstrait
  depart: PointAbstrait
  arrivee: PointAbstrait
  taille: number
  color: [string, string]
  couleurDeRemplissage: [string, string]
  opaciteDeRemplissage: number

  constructor(
    A: IPointAbstrait,
    O: IPointAbstrait,
    B: IPointAbstrait,
    color = 'black',
    d = 0.4,
    epaisseur = 0.5,
    opacite = 1,
    couleurDeRemplissage = 'none',
    opaciteDeRemplissage = 1,
  ) {
    super()
    this.sommet = IToPointAbstrait(O)
    this.depart = IToPointAbstrait(A)
    this.arrivee = IToPointAbstrait(B)
    this.taille = d
    this.color = colorToLatexOrHTML(color)
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.opaciteDeRemplissage = opaciteDeRemplissage
    let bordures: { xmin: number; xmax: number; ymin: number; ymax: number }
    if (longueur(O, A) < 1e-8 || longueur(O, B) < 1e-8) {
      window.notify(
        "Création d'un codage d'angle droit avec un côté de longueur nulle, le codage peut être erroné",
        { A, O, B },
      )
      this.sommet = IToPointAbstrait(O)
      this.depart = IToPointAbstrait(O)
      this.arrivee = IToPointAbstrait(O)
      bordures = { xmin: O.x, xmax: O.x, ymin: O.y, ymax: O.y }
    } else {
      const a = pointSurSegment(
        this.sommet,
        this.depart,
        (this.taille * 20) / context.pixelsParCm,
      )
      const b = pointSurSegment(
        this.sommet,
        this.arrivee,
        (this.taille * 20) / context.pixelsParCm,
      )
      let o
      if (angleOriente(this.depart, this.sommet, this.arrivee) > 0) {
        o = rotation(this.sommet, a, -90)
      } else {
        o = rotation(this.sommet, a, 90)
      }
      bordures = fixeBordures([a, b, o], {
        rxmin: 0,
        rxmax: 0,
        rymin: 0,
        rymax: 0,
      })
    }

    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
    this.epaisseur = epaisseur
    this.opacite = opacite
  }

  svg(coeff: number) {
    if (
      longueur(this.sommet, this.depart) < 1e-8 ||
      longueur(this.sommet, this.arrivee) < 1e-8
    ) {
      return ''
    }
    const a = pointSurSegment(
      this.sommet,
      this.depart,
      (this.taille * 20) / coeff,
    )
    const b = pointSurSegment(
      this.sommet,
      this.arrivee,
      (this.taille * 20) / coeff,
    )
    let o: PointAbstrait
    if (angleOriente(this.depart, this.sommet, this.arrivee) > 0) {
      o = rotation(this.sommet, a, -90)
    } else {
      o = rotation(this.sommet, a, 90)
    }
    const result = polygone([this.sommet, a, o, b], this.color[0])
    if (this.couleurDeRemplissage[0] !== 'none') {
      result.couleurDeRemplissage = [
        this.couleurDeRemplissage[0],
        this.couleurDeRemplissage[1],
      ]
      result.opaciteDeRemplissage = this.opaciteDeRemplissage
    }
    result.epaisseur = this.epaisseur
    result.opacite = this.opacite
    this.id = result.id
    return result.svg(coeff)
  }

  tikz() {
    if (
      longueur(this.sommet, this.depart) < 1e-8 ||
      longueur(this.sommet, this.arrivee) < 1e-8
    ) {
      return ''
    }
    const a = pointSurSegment(
      this.sommet,
      this.depart,
      this.taille / context.scale,
    )
    const b = pointSurSegment(
      this.sommet,
      this.arrivee,
      this.taille / context.scale,
    )
    let o: PointAbstrait
    if (angleOriente(this.depart, this.sommet, this.arrivee) > 0) {
      o = rotation(this.sommet, a, -90)
    } else {
      o = rotation(this.sommet, a, 90)
    }
    const result = polygone([this.sommet, a, o, b], this.color[1])
    if (this.couleurDeRemplissage[1] === '') {
      result.couleurDeRemplissage = [
        this.couleurDeRemplissage[0],
        this.couleurDeRemplissage[1],
      ]
      result.opaciteDeRemplissage = this.opaciteDeRemplissage
      result.epaisseur = this.epaisseur
      result.opacite = this.opacite
    }
    return result.tikz()
  }

  svgml(coeff: number, amp: number) {
    const a = pointSurSegment(
      this.sommet,
      this.depart,
      (this.taille * 20) / coeff,
    )
    const b = pointSurSegment(
      this.sommet,
      this.arrivee,
      (this.taille * 20) / coeff,
    )
    let o: PointAbstrait
    if (angleOriente(this.depart, this.sommet, this.arrivee) > 0) {
      o = rotation(this.sommet, a, -90)
    } else {
      o = rotation(this.sommet, a, 90)
    }
    return polyline([a, o, b], this.color[0]).svgml(coeff, amp)
  }

  tikzml(amp: number) {
    const a = pointSurSegment(
      this.sommet,
      this.depart,
      this.taille / context.scale,
    )
    const b = pointSurSegment(
      this.sommet,
      this.arrivee,
      this.taille / context.scale,
    )
    let o: PointAbstrait
    if (angleOriente(this.depart, this.sommet, this.arrivee) > 0) {
      o = rotation(this.sommet, a, -90)
    } else {
      o = rotation(this.sommet, a, 90)
    }
    return polyline([a, o, b], this.color[1]).tikzml(amp)
  }
}
/**
 * Code un angle droit
 * @param {PointAbstrait} A Point sur un côté de l'angle droit
 * @param {PointAbstrait} O Sommet de l'angle droit
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle droit
 * @param {string} [color='black'] Couleur du codage : du type 'blue' ou du type '#f15929'
 * @param {number} [d=0.4] Taille du codage de l'angle droit
 * @param {number} [epaisseur=0.5] Epaisseur du trait
 * @param {number} [opacite=1] Opacité du trait
 * @param {string} [couleurDeRemplissage='none'] 'none' si on ne veut pas de remplissage, sinon une couleur du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage=1] Taux d'opacité du remplissage
 * @example codageAngleDroit(A,J,T)
 * // Trace un codage d'angle droit pour l'angle direct AJT, de couleur noire, de taille 0,4, d'épaisseur 0,5 avec une opacité de 100 %, sans remplissage
 * @example codageAngleDroit(A,J,T,'pink',1,0.2,0.6,'blue',0.2)
 * // Trace un codage d'angle droit pour l'angle direct AJT, de couleur rose, de taille 1, d'épaisseur 0,2 avec une opacité de 60 %, rempli en bleu avec une opacité de 20%.
 * @return {CodageAngleDroit}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022

export function codageAngleDroit(
  A: IPointAbstrait,
  O: IPointAbstrait,
  B: IPointAbstrait,
  color = 'black',
  d = 0.4,
  epaisseur = 0.5,
  opacite = 1,
  couleurDeRemplissage = 'none',
  opaciteDeRemplissage = 1,
) {
  return new CodageAngleDroit(
    A,
    O,
    B,
    color,
    d,
    epaisseur,
    opacite,
    couleurDeRemplissage,
    opaciteDeRemplissage,
  )
}
