import { context } from '../../modules/context'
import { arrondi } from '../outils/nombres'
import { arc } from './Arc'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { droite } from './droites'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait } from './PointAbstrait'
import { latex2d, tailleDeNbVersLatex, texteParPoint } from './textes'
import { rotation } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Code un angle
 * @param {Point} debut Point sur un côté de l'angle
 * @param {Point} centre Sommet de l'angle
 * @param {number|Point} angle Mesure de l'angle ou nom d'un point sur l'autre côté de l'angle
 * @param {number} [taille=0.8] Taille de l'angle
 * @param {string} [mark=''] Marque sur l'angle
 * @param {string} [color='black'] Couleur de l'angle : du type 'blue' ou du type '#f15929'
 * @param {number} [epaisseur=1] Epaisseur du tracé de l'angle
 * @param {number} [opacite=1] Opacité de la couleur du tracé de l'angle
 * @param {string} [couleurDeRemplissage='none'] 'none' si on ne veut pas de remplissage, sinon une couleur du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage=0.2] Opacité de la couleur de remplissage de l'angle
 * @param {boolean} [mesureOn=false] Affichage de la mesure de l'angle
 * @param {boolean} [noAngleDroit=false] Pour choisir si on veut que l'angle droit soit marqué par un carré ou pas
 * @param {string} [texteACote=''] Pour mettre un texte à côté de l'angle à la place de la mesure de l'angle
 * @param {number} [tailleTexte=1] Pour choisir la taille du texte à côté de l'angle
 * @param {number} [echelleMark=1] Pour choisir la taille relative de la marque
 * @property {Point} debut Point sur un côté de l'angle
 * @property {Point} centre Sommet de l'angle
 * @property {number|Point} angle Mesure de l'angle ou nom d'un point sur l'autre côté de l'angle
 * @property {number} taille Taille de l'angle
 * @property {string} mark Marque sur l'angle
 * @property {string} color Couleur de l'angle. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} epaisseur Epaisseur du tracé de l'angle
 * @property {number} opacite Opacité de la couleur du tracé de l'angle
 * @property {string} couleurDeRemplissage À associer obligatoirement à colorToLatexOrHTML(). 'none' si on ne veut pas de remplissage.
 * @property {number} opaciteDeRemplissage Opacité de la couleur de remplissage de l'angle
 * @property {number} tailleTexte Pour choisir la taille du texte à côté de l'angle
 * @property {number} echelleMark Pour choisir la taille relative de la marque
 * @author Jean-claude Lhote
 * @return {array} Liste d'objets MathAlea2D
 */
// JSDOC Validee par EE Juin 2022

export class CodageAngle extends ObjetMathalea2D {
  debut: PointAbstrait
  centre: PointAbstrait
  angle: number
  taille: number
  mark: string
  echelleMark: number
  tailleTexte: number
  angleArrondi: number
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number

  constructor(
    debut: PointAbstrait,
    centre: PointAbstrait,
    angle: PointAbstrait | number,
    taille = 0.8,
    mark = '',
    color = 'black',
    epaisseur = 1,
    opacite = 1,
    couleurDeRemplissage = 'none',
    opaciteDeRemplissage = 0.2,
    mesureOn = false,
    texteACote = '',
    tailleTexte = 1,
    { echelleMark = 1, angleArrondi = 0 } = {},
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.debut = debut
    this.centre = centre
    this.taille = taille
    this.mark = mark
    this.echelleMark = echelleMark
    this.epaisseur = epaisseur
    this.opacite = opacite
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.angle =
      angle instanceof PointAbstrait
        ? angleOriente(debut, centre, angle)
        : angle
    this.tailleTexte = tailleTexte
    this.angleArrondi = angleArrondi
    this.objets = []
    const depart = pointSurSegment(
      this.centre,
      this.debut,
      (this.taille * 20) / context.pixelsParCm,
    )
    const P = rotation(depart, this.centre, this.angle / 2)
    const M = pointSurSegment(
      this.centre,
      P,
      this.taille + (0.6 * 20) / context.pixelsParCm,
    )
    const d = droite(this.centre, P)
    const mesure = arrondi(Math.abs(this.angle), this.angleArrondi) + '^\\circ'
    const arcangle = arc(
      depart,
      this.centre,
      this.angle,
      couleurDeRemplissage !== 'none',
      couleurDeRemplissage,
      color,
    )
    arcangle.opacite = this.opacite
    arcangle.epaisseur = this.epaisseur
    arcangle.opaciteDeRemplissage = this.opaciteDeRemplissage
    this.objets.push(arcangle)
    if (this.mark !== '') {
      const t = texteParPoint(
        mark,
        P,
        90 - d.angleAvecHorizontale,
        color,
        this.echelleMark,
      )
      this.objets.push(t)
    }
    if (mesureOn && texteACote === '') {
      const t = latex2d(mesure, M.x + 0.2, M.y, {
        color,
        letterSize: tailleDeNbVersLatex(this.taille),
      })
      this.objets.push(t)
    } else if (texteACote !== '') {
      if (texteACote.includes('$')) {
        M.positionLabel = 'center'
        const label = latex2d(
          texteACote.substring(1, texteACote.length - 1),
          M.x,
          M.y,
          { color, backgroundColor: 'none' },
        )
        this.objets.push(label)
      } else
        this.objets.push(
          texteParPoint(texteACote, M, 0, color, this.tailleTexte),
        )
    }
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }
}
