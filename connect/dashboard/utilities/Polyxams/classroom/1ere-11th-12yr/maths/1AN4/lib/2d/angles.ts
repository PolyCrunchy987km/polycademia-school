import { mathalea2d } from '../../modules/mathalea2d'
import type { Angle } from '../mathFonctions/Angle'
import { cercle, cercleCentrePoint } from './cercle'
import { CodageAngle } from './CodageAngle'
import { CodageAngleDroit } from './CodageAngleDroit'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { latexParPoint, texteParPosition } from './textes'
import { rotation } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurCercle } from './utilitairesPoint'
import { vide2d } from './Vide2d'

/**
 * Code un angle
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {number|PointAbstrait} angle Mesure de l'angle ou nom d'un point sur l'autre côté de l'angle
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
 * @param {object} [options={}]
 * @param {number} [options.echelleMark=1] Taille relative de la marque de l'angle
 * @param {number} [options.angleArrondi=0] Arrondi de l'angle
 * @example codageAngle(H,K,30)
 * // Code l'angle de centre K, avec H sur un côté de l'angle et avec 30° comme mesure d'angle orienté,
 * // en noir, avec une épaisseur de 1, une opacité de 100 %, un rayon d'arc de 0,8, sans autre option.
 * @example codageAngle(H,K,G)
 * // Code l'angle HKG, en noir, avec une épaisseur de 1, une opacité de 100 %, un rayon d'arc de 0,8, sans autre option.
 * @example codageAngle(H,K,G,2,'x','red',0.5,0.2,'blue',0.8,true,true)
 * // Code l'angle HKG, en rouge, avec une épaisseur de 0.5 et une opacité de 20 %, rempli en bleu avec une opacité de 80 %
 * // avec un arc de cercle de rayon 2, avec une marque 'x' sur l'angle, en affichant la mesure de l'angle et sans faire apparaître d'angle droit le cas échéant.
 * @example codageAngle(H,K,G,2,'x','red',0.5,0.2,'blue',0.8,true,true,'?',2)
 * // Code l'angle HKG, en rouge, avec une épaisseur de 0.5 et une opacité de 20 %, rempli en bleu avec une opacité de 80 %
 * // avec un arc de cercle de rayon 2, avec une marque 'x' sur l'angle, en affichant le texte '?' d'une taille de 2 et sans faire apparaître d'angle droit le cas échéant.
 * @author Jean-claude Lhote
 * @return {CodageAngle|CodageAngleDroit}
 */
// JSDOC Validee par EE Juin 2022
export function codageAngle(
  A: PointAbstrait,
  O: PointAbstrait,
  angle: PointAbstrait | number,
  taille = 0.8,
  mark = '',
  color = 'black',
  epaisseur = 1,
  opacite = 1,
  couleurDeRemplissage = 'none',
  opaciteDeRemplissage = 0.2,
  mesureOn = false,
  noAngleDroit = false,
  texteACote = '',
  tailleTexte = 1,
  { echelleMark = 1, angleArrondi = 0 } = {},
) {
  let angleNumerique: number
  if (typeof angle !== 'number') {
    angleNumerique = angleOriente(A, O, angle)
  } else {
    angleNumerique = angle
  }
  if (
    (Math.abs(angleNumerique - 90) < 0.1 ||
      Math.abs(angleNumerique + 90) < 0.1) &&
    !noAngleDroit
  ) {
    return new CodageAngleDroit(
      A,
      O,
      rotation(A, O, angleNumerique),
      color,
      taille,
      epaisseur,
      opacite,
      couleurDeRemplissage,
      opaciteDeRemplissage,
    )
  } else
    return new CodageAngle(
      A,
      O,
      angleNumerique,
      taille,
      mark,
      color,
      epaisseur,
      opacite,
      couleurDeRemplissage,
      opaciteDeRemplissage,
      mesureOn,
      texteACote,
      tailleTexte,
      { echelleMark, angleArrondi },
    )
}

export class NomAngleParPosition extends ObjetMathalea2D {
  constructor(nom: string, x: number, y: number, color: string, s: number) {
    super()
    this.objets = []
    this.objets.push(texteParPosition(nom, x, y, 0, color, 1, 'milieu', true))
    const s1 = segment(
      x - 0.6,
      y + 0.4 - s / 10,
      x + 0.1,
      y + 0.4 + s / 10,
      color,
    )
    const s2 = segment(
      x + 0.1,
      y + 0.4 + s / 10,
      x + 0.8,
      y + 0.4 - s / 10,
      color,
    )
    this.objets.push(s1, s2)
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets != null) {
      for (const objet of this.objets) {
        code += '\n\t' + (objet as ObjetMathalea2D).svg(coeff)
      }
      return code
    } else return ''
  }

  tikz() {
    let code = ''
    if (this.objets != null) {
      for (const objet of this.objets) {
        code += '\n\t' + objet.tikz()
      }
      return code
    } else return ''
  }
}

export function nomAngleSaillantParPosition(
  nom: string,
  x: number,
  y: number,
  color: string,
) {
  return new NomAngleParPosition(nom, x, y, color, 1)
}

export function nomAngleRentrantParPosition(
  nom: string,
  x: number,
  y: number,
  color: string,
) {
  return new NomAngleParPosition(nom, x, y, color, -1)
}

/**
 *
 * @param {Angle} angle
 * @param {string} cosOrSin
 * @returns string
 */
export function cercleTrigo(angle: Angle, cosOrSin = 'cos') {
  const monAngle = parseInt(angle.degres ?? '0')
  const r = 5
  const tAngle = angle.radians
  const tCos = Array.isArray(angle.cos) ? angle.cos[0] : angle.cos
  const tSin = Array.isArray(angle.sin) ? angle.sin[0] : angle.sin
  const O = pointAbstrait(0, 0)
  const I = pointAbstrait(r, 0)
  const J = pointAbstrait(0, r)
  const I2 = pointAbstrait(-r, 0)
  const J2 = pointAbstrait(0, -r)
  const s1 = segment(I, I2)
  const s2 = segment(J, J2)
  const c = cercleCentrePoint(O, I)
  const c2 = cercle(O, 5.7)
  const M = pointSurCercle(c, monAngle, '')
  const M2 = pointSurCercle(c2, monAngle, '')
  const sOM = segment(O, M, 'blue')
  const sOI = segment(O, I, 'blue')
  sOM.epaisseur = 3
  sOI.epaisseur = 3
  const x = pointAbstrait(M.x, 0)
  const y = pointAbstrait(0, M.y)
  const sMx = !(Math.abs(M.y) < 0.000001) ? segment(M, x) : vide2d()
  sMx.pointilles = 5
  const sMy = !(Math.abs(M.x) < 0.0000001) ? segment(M, y) : vide2d()
  sMy.pointilles = 5
  const texteAngle = latexParPoint(tAngle ?? '0', M2)
  const Rx = pointAbstrait(M.x, M.y < 0 ? 1.5 : -1.5)
  const Ry = pointAbstrait(M.x < 0 ? 0.65 : -1.5, M.y)
  const texteCosinus = latexParPoint(tCos ?? '0', Rx)
  const texteSinus = latexParPoint(tSin ?? '0', Ry)
  const sCos =
    Math.abs(M.x) < 0.000001 ? vide2d() : segment(O, pointAbstrait(M.x, 0))
  const sSin =
    Math.abs(M.y) < 0.000001 ? vide2d() : segment(O, pointAbstrait(0, M.y))
  sCos.epaisseur = 3
  sSin.epaisseur = 3
  const marqueAngle = codageAngle(I, O, M)
  marqueAngle.color = colorToLatexOrHTML('blue')
  marqueAngle.epaisseur = 3
  const objetsTrigo = []
  if (cosOrSin === 'cos') {
    objetsTrigo.push(texteCosinus, sCos, sMx)
  } else {
    objetsTrigo.push(texteSinus, sSin, sMy)
  }
  return mathalea2d(
    {
      xmin: -r - 3,
      xmax: r + 3,
      ymin: -r - 1.8,
      ymax: r + 1.8,
      scale: 0.5,
    },
    c,
    texteAngle,
    marqueAngle,
    s1,
    s2,
    ...objetsTrigo,
    sOM,
    sOI,
  )
}
