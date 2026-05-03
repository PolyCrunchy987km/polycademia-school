import { context } from '../../modules/context'
import type { NestedObjetMathalea2dArray, ObjetDivLatex } from '../../types/2d'
import { arrondi } from '../outils/nombres'
import { stringNombre } from '../outils/texNombre'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { IPoint3d, IPointAbstrait, IPolygone } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, PointAbstrait } from './PointAbstrait'
import type { Vide2d } from './Vide2d'

export type AncrageDeRotationType = 'gauche' | 'milieu' | 'droite'
export const tikzAncrages = {
  gauche: 'west',
  milieu: 'center',
  droite: 'east',
}
export const svgAncrages = {
  gauche: 'start',
  milieu: 'middle',
  droite: 'end',
}
/**
 * Associe à tous les points passés en paramètre, son label, défini préalablement en Latex. Par exemple, si besoin de nommer le point A_1.
 * @param {number} [distance=1.5] Taille de l'angle
 * @param {string} [label=''] Si vide, alors affiche la mesure de l'angle sinon affiche ce label.
 * @param {Object} parametres À saisir entre accolades
 * @param {PointAbstrait|PointAbstrait[]} [parametres.points = []] PointAbstrait ou tableau de points
 * @param {string} [parametres.color = 'black'] Couleur du label : du type 'blue' ou du type '#f15929'
 * @param {number} [parametres.taille = 8] Taille du label
 * @param {number} [parametres.largeur = 10] Largeur en pixels du label à des fins de centrage
 * @param {number} [parametres.hauteur = 10] Hauteur en pixels du label à des fins de centrage
 * @param {string} [parametres.couleurDeRemplissage=''] Couleur de fond de ce label : du type 'blue' ou du type '#f15929'
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du label. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} taille Taille du label
 * @property {number} largeur Largeur en pixels du label à des fins de centrage
 * @property {number} hauteur Hauteur en pixels du label à des fins de centrage
 * @property {string} couleurDeRemplissage Couleur de fond de ce label. À associer obligatoirement à colorToLatexOrHTML().
 * @author Rémi Angot et Jean-Claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022
export function labelLatexPoint(
  {
    points,
    color,
    taille,
    largeur,
    hauteur,
    couleurDeRemplissage,
  }: {
    points: PointAbstrait[]
    color?: string
    taille: number
    largeur?: number
    hauteur?: number
    couleurDeRemplissage: string
  } = {
    points: [],
    color: 'black',
    taille: 8,
    largeur: 10,
    hauteur: 10,
    couleurDeRemplissage: '',
  },
): NestedObjetMathalea2dArray {
  // Jean-Claude Lhote 15/08/2023
  const offset = 0.25 * Math.log10(taille) // context.pixelsParCm ne correspond pas forcément à la valeur utilisée par mathalea2d... cela peut entrainer un trés léger écart
  let x
  let y
  const objets = []
  let listePoints: Array<PointAbstrait>
  if (Array.isArray(points[0])) {
    // Si le premier argument est un tableau
    listePoints = points[0]
  } else {
    listePoints = points
  }
  listePoints = listePoints.map((pt: PointAbstrait | IPoint3d) =>
    'c2d' in pt ? pt.c2d : pt,
  )
  for (const unPoint of listePoints) {
    x = arrondi(unPoint.x)
    y = arrondi(unPoint.y)
    switch (unPoint.positionLabel) {
      case 'left':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x - offset,
            y,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'right':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x + offset,
            y,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'below':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x,
            y - offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'above':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x,
            y + offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'above right':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x + offset,
            y + offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'below left':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x - offset,
            y - offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      case 'below right':
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x + offset,
            y - offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
      default:
        objets.push(
          latexParCoordonnees(
            unPoint.nom,
            x - offset,
            y + offset,
            color,
            largeur,
            hauteur,
            couleurDeRemplissage,
            taille,
          ),
        )
        break
    }
  }
  return objets
}

/**  Nomme les points passés en argument, le nombre d'arguments n'est pas limité.
 * @param  {(PointAbstrait|string)[]} args Points mis à la suite si une couleur doit être passée, c'est le dernier argument
 * @property {string} color Couleur des points. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} taille Taille de la boite contenant le nom des points
 * @property {number} largeur Largeur de la boite contenant le nom des points
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @author Rémi Angot
 * @return object[]
 */
// JSDOC Validee par EE Septembre 2022
export function labelPoint(
  ...args: (IPointAbstrait | PointAbstrait | PointAbstrait | string)[]
) {
  const taille = 1
  const points = [...args]
  let color
  if (typeof points[points.length - 1] === 'string') {
    color = colorToLatexOrHTML(String(points[points.length - 1]))
    points.length--
  } else {
    color = colorToLatexOrHTML('black')
  }
  const objets = []
  for (const unPoint of points) {
    let x, y
    if (unPoint instanceof PointAbstrait || unPoint instanceof PointAbstrait) {
      x = unPoint.x
      y = unPoint.y
      // if (this.positionLabel === '' && unPoint.typeObjet === 'point3d') A.positionLabel = this.positionLabel
      switch (unPoint.positionLabel) {
        case 'left':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x - 10 / context.pixelsParCm,
              y,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'right':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x + 10 / context.pixelsParCm,
              y,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'below':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x,
              y - 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'above':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x,
              y + 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'above left':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x - 10 / context.pixelsParCm,
              y + 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'above right':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x + 10 / context.pixelsParCm,
              y + 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'below left':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x - 10 / context.pixelsParCm,
              y - 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        case 'below right':
          objets.push(
            texteParPosition(
              unPoint.nom,
              x + 10 / context.pixelsParCm,
              y - 10 / context.pixelsParCm,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
        default:
          objets.push(
            texteParPosition(
              unPoint.nom,
              x,
              y,
              0,
              color[0],
              taille,
              'milieu',
              true,
              1,
            ),
          )
          break
      }
    }
  }
  return objets
}

/**  Déplace les labels des sommets d'un polygone s'ils sont mal placés nativement
 * @param {Polygone} p Polygone sur lequel les labels de ses sommets sont mal placés
 * @param {string} nom Points mal placés sous la forme, par exemple, 'AB'. Chaque point doit être représenté par un SEUL caractère.
 * @param {string} positionLabel Les possibilités sont : 'left', 'right', 'below', 'above', 'above right', 'above left', 'below right', 'below left'. Si on se trompe dans l'orthographe, ce sera 'above left' et si on ne précise rien, pour un point ce sera 'above'.
 * @example deplaceLabel(p1,'MNP','below') // S'il y a des points nommés 'M', 'N' ou 'P' dans le polygone p1, leur nom sera mis en dessous du point.
 * // Ne fonctionne pas avec les points du type A1 ou A_1.
 * @author Rémi Angot
 */
// JSDOC Validee par EE Aout 2022
export function deplaceLabel(p: IPolygone, nom: string, positionLabel: string) {
  for (let i = 0; i < p.listePoints.length; i++) {
    for (const lettre of nom) {
      if (p.listePoints[i].nom === lettre) {
        p.listePoints[i].positionLabel = positionLabel
        labelPoint(p.listePoints[i])
      }
    }
  }
}

/**
 * texteParPoint('mon texte',A) // Écrit 'mon texte' avec A au centre du texte
 * texteParPoint('mon texte',A,45) // Écrit 'mon texte' centré sur A avec une rotation de 45°
 * texteParPoint('mon texte',A, 0, 'black', 1, 'gauche',true, 0.5) // écrit le texte à droite du point A car le point d'ancrage est à gauche
 *  // couleur du texte en noir, avec une taille normale et une police mathématique et une opacité de 50%
 * oriention est un nombre, c'est l'angle de rotation (0 par défaut), et il faut positionner le centre de rotation avec ancrageDeRotation (milieu par défaut)
 * ancrageDeRotation est à prendre parmi ['milieu', 'gauche', 'droite']
 * Si mathOn est true, la chaine est traitée par texteParPoint mais avec une police se rapprochant de la police Katex (quelques soucis d'alignement des caractères sur certains navigateurs)
 * Si le texte commence et finit par des $ la chaine est traitée par latexParPoint
 * @author Rémi Angot rectifié par Jean-Claude Lhote
 */
export class TexteParPoint extends ObjetMathalea2D {
  texte: string
  point: PointAbstrait | Vide2d
  orientation: number
  color: [string, string]
  scale: number
  ancrageDeRotation: AncrageDeRotationType
  mathOn: boolean
  opacite: number
  gras: boolean
  opaciteDeRemplissage!: number
  bordures: [number, number, number, number]
  couleurDeRemplissage: [string, string]
  contour: boolean
  taille: number

  constructor(
    texte: string,
    A: PointAbstrait | Vide2d,
    orientation: number = 0,
    color: string = 'black',
    scale: number = 1,
    ancrageDeRotation: AncrageDeRotationType = 'milieu',
    mathOn: boolean = false,
    opacite: number = 1,
  ) {
    super()
    if (typeof orientation !== 'number') {
      if (orientation === 'milieu' || typeof orientation === 'string') {
        ancrageDeRotation = orientation
        orientation = 0
      }
    }
    if (!['milieu', 'gauche', 'droite'].includes(ancrageDeRotation))
      ancrageDeRotation = 'milieu'

    this.ancrageDeRotation = ancrageDeRotation
    this.orientation = orientation
    this.color = colorToLatexOrHTML(color)
    this.scale = scale
    this.taille = Math.round(14 * scale)
    this.opacite = opacite
    this.couleurDeRemplissage = colorToLatexOrHTML(color)
    this.mathOn = mathOn
    this.point = A
    this.gras = false
    this.contour = false
    this.opaciteDeRemplissage = opacite

    if (typeof texte !== 'string') {
      if (!Number.isNaN(texte)) texte = stringNombre(texte, 3)
    }
    const angle = (Math.PI * orientation) / 180
    // constantes utilisée pour le calcul des bordures
    const cx = Math.cos(angle)
    const sx = Math.sin(angle)
    const ratioLettreCm = 0.25
    const epaisseurTexte = 0.3 * scale
    const longueurTexte = texte.length * ratioLettreCm * scale
    // définition des bordures suivant le point d'ancrage
    if (ancrageDeRotation === 'milieu') {
      this.bordures = [
        A.x - longueurTexte * cx,
        A.y - longueurTexte * sx - epaisseurTexte,
        A.x + longueurTexte * cx,
        A.y + longueurTexte * sx + epaisseurTexte,
      ]
    } else if (ancrageDeRotation === 'gauche') {
      this.bordures = [
        A.x,
        A.y - 2 * (longueurTexte * sx) - epaisseurTexte,
        A.x + 2 * (longueurTexte * cx),
        A.y + epaisseurTexte,
      ]
    } else {
      this.bordures = [
        A.x - 2 * longueurTexte * cx,
        A.y - epaisseurTexte,
        A.x,
        A.y + 2 * (longueurTexte * sx) + epaisseurTexte,
      ]
    }

    if (typeof texte !== 'string') {
      texte = String(texte)
    }
    texte = texte.replaceAll('$$', '$') // ça arrive que des fonctions ajoutent des $ alors qu'il y en a déjà...
    this.texte = texte
  }

  svg(coeff: number) {
    if (this.texte.charAt(0) === '$') {
      if (!this.point.positionLabel) {
        this.point.positionLabel = 'above'
      }
      return latex2d(
        this.texte.substring(1, this.texte.length - 1),
        this.point.x,
        this.point.y,
        {
          color: this.color[0],
          orientation: this.orientation,
          letterSize: 'normalsize',
        },
      ).svg()
    } else {
      let code = ''
      let style = ''
      if (this.mathOn)
        style = ' font-family= "Book Antiqua"; font-style= "italic" '
      if (this.contour)
        style += ` style="font-size: ${this.taille}px;fill: ${this.couleurDeRemplissage[0]};fill-opacity: ${this.opaciteDeRemplissage};stroke: ${this.color[0]};stroke-width: 0.5px;stroke-linecap: butt;stroke-linejoin:miter;stroke-opacity: ${this.opacite}" `
      else
        style += ` style="font-size:${this.taille}px;fill:${this.color[0]};fill-opacity:${this.opacite};${this.gras ? 'font-weight:bolder' : ''}" `
      const anchor = svgAncrages[this.ancrageDeRotation]
      code = `<text ${style} x="${this.point.xSVG(coeff)}" y="${this.point.ySVG(
        coeff,
      )}" text-anchor = "${anchor}" dominant-baseline = "central" fill="${
        this.couleurDeRemplissage[0]
      }" transform="rotate(${String(this.orientation)} ${this.point.xSVG(coeff)} ${this.point.ySVG(
        coeff,
      )})" id="${this.id}" >${this.texte}</text>\n `
      return code
    }
  }

  tikz() {
    if (this.texte.charAt(0) === '$') {
      if (!this.point.positionLabel) {
        this.point.positionLabel = 'above'
      }
      let code = ''
      const anchor = tikzAncrages[this.ancrageDeRotation]
      code = `\\draw [color=${this.color[1]}] (${String(arrondi(this.point.x))},${String(
        arrondi(this.point.y),
      )}) node[anchor = ${anchor},scale=${String(this.scale)}, rotate = ${String(-this.orientation)}] {${this.texte}};`
      return code
    } else {
      let code = ''
      const anchor = tikzAncrages[this.ancrageDeRotation]
      if (this.contour) {
        // Utilisation du package contour pour le détourage
        // Le contour est dans this.color
        const colorContour = this.color[1].replace(/[{}]/g, '') // Retirer les accolades si présentes
        const colorFill = this.couleurDeRemplissage[1].replace(/[{}]/g, '')
        if (colorFill === '') {
          // Si couleurDeRemplissage est vide : le texte intérieur doit être transparent
          // On dessine d'abord le contour avec le texte blanc visible
          code = `\\draw (${arrondi(this.point.x)},${arrondi(
            this.point.y,
          )}) node[anchor = ${anchor},scale=${String(this.scale)}, rotate = ${String(-this.orientation)}, text opacity=${this.opaciteDeRemplissage}] {\\textcolor{white}{\\contour{${colorContour}}{${this.texte}}}};`
        } else {
          // Sinon : le texte intérieur a la couleur spécifiée
          code = `\\draw (${arrondi(this.point.x)},${arrondi(
            this.point.y,
          )}) node[anchor = ${anchor},scale=${String(this.scale)}, rotate = ${String(-this.orientation)}, text opacity=${this.opaciteDeRemplissage}] {\\textcolor{${colorFill}}{\\contour{${colorContour}}{${this.texte}}}};`
        }
      } else {
        code = `\\draw [${this.color[1] !== '' ? `color=${this.color[1]}` : ''}] (${arrondi(this.point.x)},${arrondi(
          this.point.y,
        )}) node[anchor = ${anchor},scale=${String(this.scale)}, rotate = ${String(-this.orientation)}] {${this.texte}};`
      }
      return code
    }
  }
}
/**
 * texteParPoint('mon texte',A) // Écrit 'mon texte' avec A au centre du texte
 * texteParPoint('mon texte',A,45) // Écrit 'mon texte' centré sur A avec une rotation de 45°
 * texteParPoint('mon texte',A, 0, 'black', 1, 'gauche',true, 0.5) // écrit le texte à droite du point A car le point d'ancrage est à gauche
 *  // couleur du texte en noir, avec une taille normale et une police mathématique et une opacité de 50%
 * oriention est un nombre, c'est l'angle de rotation (0 par défaut), et il faut positionner le centre de rotation avec ancrageDeRotation (milieu par défaut)
 * ancrageDeRotation est à prendre parmi ['milieu', 'gauche', 'droite']
 * Si mathOn est true, la chaine est traitée par texteParPoint mais avec une police se rapprochant de la police Katex (quelques soucis d'alignement des caractères sur certains navigateurs)
 * Si le texte commence et finit par des $ la chaine est traitée par latexParPoint
 * @author Rémi Angot rectifié par Jean-Claude Lhote
 */
export function texteParPoint(
  texte: string,
  A: PointAbstrait | Vide2d,
  orientation: number = 0,
  color: string = 'black',
  scale: number = 1,
  ancrageDeRotation: 'milieu' | 'droite' | 'gauche' = 'milieu',
  mathOn: boolean = false,
  opacite: number = 1,
) {
  return new TexteParPoint(
    texte,
    A,
    orientation,
    color,
    scale,
    ancrageDeRotation,
    mathOn,
    opacite,
  )
}

export class TexteParPointEchelle extends ObjetMathalea2D {
  gras: boolean
  texte: string
  point: PointAbstrait
  orientation: number
  color: [string, string]
  scale: number
  ancrageDeRotation: AncrageDeRotationType
  mathOn: boolean
  scaleFigure: number
  contour: boolean
  couleurDeRemplissage!: [string, string]
  opaciteDeRemplissage!: number
  bordures: [number, number, number, number]
  taille: number
  constructor(
    texte: string,
    A: PointAbstrait,
    orientation: number = 0,
    color: string = 'black',
    scale: number = 1,
    ancrageDeRotation: AncrageDeRotationType = 'milieu',
    mathOn: boolean = false,
    scaleFigure: number,
  ) {
    super()
    if (typeof orientation !== 'number') {
      if (orientation === 'milieu' || typeof orientation === 'string') {
        ancrageDeRotation = orientation
        orientation = 0
      }
    }
    if (!['milieu', 'gauche', 'droite'].includes(ancrageDeRotation))
      ancrageDeRotation = 'milieu'
    this.color = colorToLatexOrHTML(color)
    this.contour = false
    this.mathOn = mathOn
    this.gras = false
    this.point = A
    this.scale = scale
    this.scaleFigure = scaleFigure
    this.taille = 10 * scale
    this.opacite = 1
    this.couleurDeRemplissage = colorToLatexOrHTML(color)
    this.opaciteDeRemplissage = this.opacite
    this.bordures = [
      A.x - texte.length * 0.2,
      A.y - 0.4,
      A.x + texte.length * 0.2,
      A.y + 0.4,
    ]
    this.texte = texte
    this.orientation = orientation
    this.ancrageDeRotation = ancrageDeRotation
  }

  svg(coeff: number) {
    if (this.texte.charAt(0) === '$') {
      return latexParPoint(
        this.texte.substring(1, this.texte.length - 2),
        this.point,
        this.color[0],
        this.texte.length * 8,
        10,
        '',
        this.taille * 0.8,
      ).svg(coeff)
    } else {
      let style = ''
      if (this.mathOn)
        style = ' font-family= "Book Antiqua"; font-style= "italic" '
      if (this.contour)
        style += ` style="font-size: ${this.taille}px;fill: ${this.couleurDeRemplissage[0]};fill-opacity: ${this.opaciteDeRemplissage};stroke: ${this.color[0]};stroke-width: 0.5px;stroke-linecap: butt;stroke-linejoin:miter;stroke-opacity: ${this.opacite}" `
      else
        style += ` style="font-size:${this.taille}px;fill:${this.color[0]};fill-opacity:${this.opacite};${this.gras ? 'font-weight:bolder' : ''}" `
      return `<text ${style} x="${this.point.xSVG(coeff)}" y="${this.point.ySVG(
        coeff,
      )}" text-anchor = "${svgAncrages[this.ancrageDeRotation]}" dominant-baseline = "central" fill="${
        this.color[0]
      }" transform="rotate(${String(this.orientation)} ${this.point.xSVG(coeff)} ${this.point.ySVG(
        coeff,
      )})" id="${this.id}" >${this.texte}</text>\n `
    }
  }

  tikz() {
    let copyThistexte = this.texte
    if (this.mathOn && copyThistexte[0] !== '$')
      copyThistexte = '$' + this.texte + '$'
    return `\\draw ${this.color[0] === 'black' ? '' : `[color=${this.color[1]}]`} (${String(arrondi(this.point.x))},${String(
      arrondi(this.point.y),
    )}) node[anchor = ${tikzAncrages[this.ancrageDeRotation]}, rotate = ${String(-this.orientation)}, scale=${(this.scale * this.scaleFigure * 1.25).toFixed(2)}] {${copyThistexte}};`
  }
}
export function texteParPointEchelle(
  texte: string,
  A: PointAbstrait,
  orientation: number = 0,
  color: string = 'black',
  scale: number = 1,
  ancrageDeRotation: 'milieu' | 'droite' | 'gauche' = 'milieu',
  mathOn: boolean = false,
  scaleFigure: number = 1,
): TexteParPointEchelle {
  return new TexteParPointEchelle(
    texte,
    A,
    orientation,
    color,
    scale,
    ancrageDeRotation,
    mathOn,
    scaleFigure,
  )
}

export function texteParPositionEchelle(
  texte: string,
  x: number,
  y: number,
  orientation: number = 0,
  color: string = 'black',
  scale: number = 1,
  ancrageDeRotation: 'milieu' | 'droite' | 'gauche' = 'milieu',
  mathOn: boolean = false,
  scaleFigure: number = 1,
) {
  return texteParPointEchelle(
    texte,
    pointAbstrait(arrondi(x, 2), arrondi(y, 2), '', 'center'),
    orientation,
    color,
    scale,
    ancrageDeRotation,
    mathOn,
    scaleFigure,
  )
}

/**
 * texteParPosition('mon texte',x,y) // Écrit 'mon texte' avec (x,y) au centre du texte
 * texteParPoint('mon texte',x,y,45) // Écrit 'mon texte' centré sur A avec une rotation de 45°
 * orientation est l'angle de rotation du texte
 * ancrageDeRotation est à prendre parmi ['milieu', 'gauche', 'droite']
 * Si mathOn est true, la chaine est traitée par texteParPoint mais avec une police se rapprochant de la police Katex (quelques soucis d'alignement des caractères sur certains navigateurs)
 * Si le texte commence et finit par des $ la chaine est traitée par latex2d en retirant les $ en 1ère et dernière position
 * @author Rémi Angot
 * @param {string} texte // Le texte qu'on veut afficher
 * @param {number} x // L'abscisse de la position initiale du texte
 * @param {number} y // L'ordonnée de la position initiale du texte
 * @param {number} [orientation=0]
 * @param {string} [color='black'] // Couleur du texte
 * @param {number} [scale=1] // Echelle du texte.
 * @param {AncrageDeRotationType} [ancrageDeRotation='milieu']
 * @param {string} [mathOn=false] // Ecriture dans le style de Latex.
 *
 * @author Rémi Angot
 */
export function texteParPosition(
  texte: string | number,
  x: number,
  y: number,
  orientation: number = 0,
  color: string = 'black',
  scale: number = 1,
  ancrageDeRotation: 'milieu' | 'gauche' | 'droite' = 'milieu',
  mathOn: boolean = false,
  opacite?: number,
) {
  if (typeof texte === 'number') texte = String(texte)
  if (typeof orientation !== 'number') {
    ancrageDeRotation = orientation
    orientation = 0
  }
  // @ts-expect-error TS2367 // normalement ts devrait veiller au grain, sauf que plein d'exo tournant en js ont mal utilisé ces paramètres, donc on blinde.
  if (ancrageDeRotation === 'middle') ancrageDeRotation = 'milieu'
  if (!['milieu', 'droite', 'gauche'].includes(ancrageDeRotation))
    ancrageDeRotation = 'milieu'
  if (texte[0] === '$') {
    return latex2d(texte.substring(1, texte.length - 1), x, y, {
      color,
      backgroundColor: 'white',
      letterSize: 'normalsize',
    })
  } else {
    return new TexteParPoint(
      texte,
      pointAbstrait(x, y, ''),
      orientation,
      color,
      scale,
      ancrageDeRotation,
      mathOn,
      opacite,
    )
  }
}

/**
 * latexParPoint('\\dfrac{3}{5}',A,'black',12,20,"white") Ecrit la fraction 3/5 à l'emplacement du label du point A en noir, avec un fond blanc.
 * 12 est la largeur en pixels 20 la hauteur en pixels (utilisé à des fins de centrage). Pour un bon centrage sur A, il faut que A.positionLabel='center'.
 * si colorBackground="", le fond est transparent.
 * tailleCaracteres est à 8 par défaut et correspond à \footnotesize. tailleCaracteres va de 5 = \small à 20 = \huge
 * @author Rémi Angot
 */
export function latexParPoint(
  texte: string,
  A: PointAbstrait | Vide2d,
  color: string = 'black',
  largeur: number = 20,
  hauteur: number = 12,
  colorBackground: string = 'white',
  tailleCaracteres: number = 8,
): LatexParCoordonnees | Vide2d {
  let x
  let y
  const coeff = context.pixelsParCm
  const offset = 10 * Math.log10(tailleCaracteres)
  switch (A.positionLabel) {
    case 'above':
      x = A.x
      y = A.y + offset / coeff
      break
    case 'below':
      x = A.x
      y = A.y - offset / coeff
      break
    case 'left':
      x = A.x - offset / coeff
      y = A.y
      break
    case 'right':
      x = A.x + offset / coeff
      y = A.y
      break
    case 'above right':
      x = A.x + offset / coeff
      y = A.y + offset / coeff
      break
    case 'above left':
      x = A.x - offset / coeff
      y = A.y + offset / coeff
      break
    case 'below right':
      x = A.x + offset / coeff
      y = A.y - offset / coeff
      break
    case 'below left':
      x = A.x - offset / coeff
      y = A.y - offset / coeff
      break
    case 'center':
      x = A.x
      y = A.y
      break
    default:
      x = A.x
      y = A.y
      break
  }
  return latexParCoordonnees(
    texte,
    x,
    y,
    color,
    largeur,
    hauteur,
    colorBackground,
    tailleCaracteres,
  )
}

/**
 * @param {string} texte Le code latex qui sera mis en mode math en ligne. Ex : '\\dfrac{4}{5}\\text{cm}'
 * @param {number} x abscisse du point de centrage
 * @param {number} y ordonnée du point de centrage
 * @param {string} [color] couleur
 * @param {number} [largeur] Dimensions de la 'box' rectangulaire conteneur de la formule en pixels en considérant la taille de caractère 8='\footnotesize'
 * @param {number} [hauteur] Idem pour la hauteur de la box. Prévoir 20 par exemple pour une fraction. Permet le centrage correct.
 * @param {string} [colorBackground] Couleur du fond de la box. Chaine vide pour un fond transparent.
 * @param {number} [tailleCaracteres] Taille de la police utilisée de 5 = \small à 20=\huge... agit sur la box en en modifiant les paramètres hauteur et largeur
 * @return LatexParCoordonnees
 * @deprecated Utiliser la fonction latex2d() beaucoup plus évoluée.
 * @class
 */
export class LatexParCoordonnees extends ObjetMathalea2D {
  x: number
  y: number
  largeur: number
  hauteur: number
  colorBackground: string
  texte: string
  bordures: [number, number, number, number]
  taille: string
  orientation: number
  constructor(
    texte: string,
    x: number,
    y: number,
    color: string,
    largeur: number,
    hauteur: number,
    colorBackground: string = '',
    tailleCaracteres: number = 8,
  ) {
    super()
    this.x = x
    this.y = y
    this.largeur = largeur * Math.log10(2 * tailleCaracteres)
    this.hauteur = hauteur * Math.log10(tailleCaracteres)
    this.colorBackground = colorBackground
    this.color = colorToLatexOrHTML(color)
    this.texte = texte
    this.orientation = 0 // dans latexParCoordonnees le latex ne peux pas tourner (on n'a pas d'argument pour ça et c'est pour cela qu'il y a latex2d() !)
    this.bordures = [
      this.x - (this.texte.length ?? 0) * 0.15,
      this.y - 0.02 * this.hauteur,
      this.x + (this.texte.length ?? 0) * 0.15,
      this.y + 0.02 * this.hauteur,
    ]
    if (tailleCaracteres > 19) this.taille = '\\huge'
    else if (tailleCaracteres > 16) this.taille = '\\LARGE'
    else if (tailleCaracteres > 13) this.taille = '\\Large'
    else if (tailleCaracteres > 11) this.taille = '\\large'
    else if (tailleCaracteres < 6) this.taille = '\\tiny'
    else if (tailleCaracteres < 8) this.taille = '\\scriptsize'
    else if (tailleCaracteres < 9) this.taille = '\\footnotesize'
    else if (tailleCaracteres < 10) this.taille = '\\small'
    else this.taille = '\\normalsize'
    if (typeof this.texte !== 'string')
      throw Error(
        `Vous n'avez pas passer un string à latexParCoordonnees() : ${this.texte}`,
      )
    // texte doit être de type texte maintenant, sinon, tu revois ton code !
    //  if (texte === '') return vide2d(x, y) // ton texte est vide ? ben y a rien à afficher !
    if (this.texte[0] === '$' && this.texte[this.texte.length - 1] === '$') {
      // tu as mis des $ $ pour délimiter ton texte.
      // Or c'est prévu d'en ajouter parce que c'est l'idée qu'on se fait de latexParCoordonnees()
      // Si c'est pas pour du latex en mode math, on aurait utilisé texteParPosition-) !
      this.texte = this.texte.substring(1, this.texte.length - 2) // donc on les enlève, pour ne pas avoir des $$ !
    }
  }

  // Eh oui ! le svg() de latexParCoordonnees est un objet. En fait, cela va produire un div mais plus tard : dans la fonction mathalea2d().
  svg() {
    return {
      latex: this.texte,
      x: this.x,
      y: this.y,
      opacity: this.opacite,
      orientation: this.orientation,
      letterSize: this.taille.substring(1),
      color: this.color[0],
      backgroundColor: this.colorBackground,
    }
  }

  tikz() {
    let code
    if (this.colorBackground !== '' && this.colorBackground !== 'none') {
      code = `\\draw (${this.x},${this.y}) node[anchor = center] {\\colorbox ${colorToLatexOrHTML(this.colorBackground)[1]}{${this.taille}  \\color${this.color[1]}{$${this.texte}$}}};`
    } else {
      code = `\\draw (${this.x},${this.y}) node[anchor = center] {${this.taille} \\color${this.color[1]}{$${this.texte}$}};`
    }
    return code
  }
}

/**
 * @deprecated utiliser latex2d() à la place (plus récent et plus facile d'usage)
 * @param texte
 * @param x
 * @param y
 * @param color
 * @param largeur // paramètre inutile
 * @param hauteurLigne // paramètre inutile
 * @param colorBackground
 * @param tailleCaracteres
 */
export function latexParCoordonnees(
  texte: string,
  x: number,
  y: number,
  color: string = 'black',
  largeur: number = 50,
  hauteurLigne: number = 20,
  colorBackground: string = '',
  tailleCaracteres: number = 8,
) {
  if (texte === '') texte = '\\phantom{ }'
  return new LatexParCoordonnees(
    texte,
    x,
    y,
    color,
    largeur,
    hauteurLigne,
    colorBackground,
    tailleCaracteres,
  )
}

/**
 * @param {String} texte Le code latex qui sera mis en mode math en ligne. Ex : '\\dfrac{4}{5}\\text{cm}'
 * @param {Number} x abscisse du point de centrage
 * @param {Number} y ordonnée du point de centrage
 * @param {String} [color] couleur
 * @param {Number} [largeur] Dimensions de la 'box' rectangulaire conteneur de la formule en pixels en considérant la taille de caractère 8='\footnotesize'
 * @param {Number} [hauteur] Idem pour la hauteur de la box. Prévoir 20 par exemple pour une fraction. Permet le centrage correct.
 * @param {String} [colorBackground] Couleur du fond de la box. Chaine vide pour un fond transparent.
 * @param {Number} [tailleCaracteres] Taille de la police utilisée de 5 = \small à 20=\huge... agit sur la box en en modifiant les paramètres hauteur et largeur
 * @Param {Struct} {options} options.anchor pour forcer la boite
 */
export class LatexParCoordonneesBox extends ObjetMathalea2D {
  texte: string
  x: number
  y: number
  color: [string, string]
  largeur: number
  hauteur: number
  colorBackground: [string, string]
  taille: string = 'footnotesize'
  options?: { anchor: string; dx?: string; dy?: string }
  bordures: [number, number, number, number]
  style: string
  constructor(
    texte: string,
    x: number,
    y: number,
    color: string,
    largeur: number,
    hauteur: number,
    colorBackground: string,
    tailleCaracteres: number = 8,
    options: { anchor: string; dx?: string; dy?: string },
  ) {
    super()
    this.x = x
    this.y = y
    this.largeur = largeur // * Math.log10(2 * tailleCaracteres)
    this.hauteur = hauteur // * Math.log10(tailleCaracteres)
    this.colorBackground = colorToLatexOrHTML(colorBackground)
    this.color = colorToLatexOrHTML(color)
    this.texte = texte
    this.style = ''
    this.bordures = [
      x - this.texte.length * 0.2,
      y - 0.02 * this.hauteur,
      x + this.texte.length * 0.2,
      y + 0.02 * this.hauteur,
    ]
    if (tailleCaracteres > 19) this.taille = '\\huge'
    else if (tailleCaracteres > 16) this.taille = '\\LARGE'
    else if (tailleCaracteres > 13) this.taille = '\\Large'
    else if (tailleCaracteres > 11) this.taille = '\\large'
    else if (tailleCaracteres < 6) this.taille = '\\tiny'
    else if (tailleCaracteres < 8) this.taille = '\\scriptsize'
    else if (tailleCaracteres < 9) this.taille = '\\footnotesize'
    else if (tailleCaracteres < 10) this.taille = '\\small'
    else this.taille = '\\normalsize'

    if (options.anchor !== undefined && options.anchor !== '') {
      switch (options.anchor) {
        case 'center': {
          let dy = 0
          if (
            options.dy === undefined ||
            options.dy === '' ||
            options.dy.indexOf('%') < 0
          ) {
            dy = 0
          } else {
            dy = parseInt(options.dy.substr(0, options.dy.indexOf('%')))
          }
          let dx = 0
          if (
            options.dx === undefined ||
            options.dx === '' ||
            options.dx.indexOf('%') < 0
          ) {
            dx = 0
          } else {
            dx = parseInt(options.dx.substr(0, options.dx.indexOf('%')))
          }
          this.style = `position:fixed;top: 50%;left: 50%;transform: translate(${-50 + dx}%, ${-50 + dy}%);`
          break
        }
        case 'above':
          this.style = 'position:fixed;bottom:0;'
          break
        case 'left':
          this.style = 'position:fixed;right:0;'
          break
        case 'right':
          this.style = 'position:fixed;left:0;'
          break
        case 'below':
          this.style = 'position:fixed;top:0;'
          break
      }
    }
    if (colorBackground !== '') {
      this.style += `background-color: ${this.colorBackground[0]};`
    }
  }

  svg(coeff: number) {
    const demiLargeur = this.largeur / 2
    const centrage = 0 // 0.4 * context.pixelsParCm * Math.log10(tailleCaracteres)
    return `<foreignObject style=" overflow: visible; line-height: 0;" x="${this.x * coeff - demiLargeur}" y="${-this.y * coeff - centrage - this.hauteur / 2}"  width="${this.largeur}" height="${this.hauteur}" id="${this.id}" ><div style="width:${this.largeur}px;height:${this.hauteur}px;position:fixed!important; text-align:center">
      <div style='${this.style}'>
      $${this.taille} \\color{${this.color[0]}}{${this.texte}}$
      </div></div></foreignObject>`
    // <circle cx="${this.x * coeff - demiLargeur}" cy="${-this.y * coeff - centrage - this.hauteur / 2}" r="1" fill="red" stroke="blue" stroke-width="2"  />
    // <circle cx="${this.x * coeff}" cy="${-this.y * coeff}" r="1" fill="red" stroke="blue" stroke-width="2"  />`
  }

  tikz() {
    let code
    if (this.colorBackground[1] !== '') {
      code = `\\draw (${this.x},${this.y}) node[anchor = center] {\\colorbox ${this.colorBackground[1]}{${this.taille}  \\color${this.color[1]}{$${this.texte}$}}};`
    } else {
      code = `\\draw (${this.x},${this.y}) node[anchor = center] {${this.taille} \\color${this.color[1]}{$${this.texte}$}};`
    }
    return code
  }
}

export function latexParCoordonneesBox(
  texte: string,
  x: number,
  y: number,
  color: string = 'black',
  largeur: number = 50,
  hauteurLigne: number = 20,
  colorBackground: string = 'white',
  tailleCaracteres: number = 8,
  options: { anchor: string; dx?: string; dy?: string },
) {
  if (texte === '') texte = '\\phantom{ }' // pour éviter les latex vides
  return new LatexParCoordonneesBox(
    texte,
    x,
    y,
    color,
    largeur,
    hauteurLigne,
    colorBackground,
    tailleCaracteres,
    options,
  )
}

export type LetterSizeType =
  | 'tiny'
  | 'small'
  | 'scriptsize'
  | 'footnotesize'
  | 'large'
  | 'Large'
  | 'LARGE'
  | 'huge'
  | 'normalsize'

/**
 * crée un obiet mathalea2D qui affiche du latex et qui peut tourner contrairement à latexParCoordonnees qui est horizontal
 */
export class Latex2d extends ObjetMathalea2D {
  letterSize: LetterSizeType
  latex: string
  x: number
  y: number
  opacity: number
  orientation: number
  bordures: [number, number, number, number]
  col: string
  backgroundCol: string
  gras: boolean

  /**
   * Les paramètres obligatoires (ne pas mettre de $ $ dans le latex !
   * @param latex
   * @param x
   * @param y
   * @param options
   * @param options.color la couleur du texte
   * @param options.backgroundColor la couleur de fond
   * @param options.letterSize la taille des caractères en texte latex sans l'antislash
   * @param options.orientation l'angle de rotation en degrés
   * @param options.opacity l'opacité du texte // @fixme non encore implémenté
   *
   */
  constructor(
    latex: string,
    x: number,
    y: number,
    {
      color = 'black',
      backgroundColor = '',
      letterSize = 'normalsize',
      orientation = 0,
      opacity = 1,
      gras = false,
    }: {
      color: string
      backgroundColor: string
      letterSize: LetterSizeType
      orientation: number
      opacity: number
      gras: boolean
    },
  ) {
    super()
    this.col = color
    this.backgroundCol = backgroundColor
    this.letterSize = letterSize
    this.orientation = orientation
    this.opacity = opacity
    this.latex = latex
    this.x = x
    this.y = y
    const marge = 0.25
    this.bordures = [x - marge, y - marge, x + marge, y + marge]
    this.gras = gras
  }

  svg(): ObjetDivLatex {
    // On prend la couleur Latex, parce que c'est pour Katex !
    return {
      latex: this.latex,
      x: this.x,
      y: this.y,
      opacity: this.opacity,
      orientation: this.orientation,
      letterSize: this.letterSize,
      color: this.col.replace('#', ''),
      backgroundColor: this.backgroundCol.replace('#', ''),
      bordures: this.bordures,
      gras: this.gras,
    }
  }

  // @todo ajouter opacity, orientation au tikz.
  tikz() {
    if (this.backgroundCol.startsWith('#')) {
      this.backgroundCol = `[HTML]{${this.backgroundCol.substring(1)}}`
    } else {
      this.backgroundCol = `${this.backgroundCol}`
    }
    if (this.col.startsWith('#')) {
      this.col = `[HTML]{${this.col.substring(1)}}`
    } else {
      this.col =
        this.col.startsWith('{') && this.col.endsWith('}')
          ? this.col
          : `{${this.col}}`
    }
    return this.backgroundCol !== '' && this.backgroundCol !== 'none'
      ? `\\draw[opacity=${this.opacity}] (${this.x},${this.y}) node[anchor = center, rotate=${this.orientation}] {\\colorbox{${this.backgroundCol}} {\\${this.letterSize}  \\color${this.col}$${this.gras ? '\\boldsymbol{' : ''}${this.latex}${this.gras ? '}' : ''}$}};`
      : `\\draw[opacity=${this.opacity}] (${this.x},${this.y}) node[anchor = center, rotate=${this.orientation}] {\\${this.letterSize} \\color${this.col}$${this.gras ? '\\boldsymbol{' : ''}${this.latex}${this.gras ? '}' : ''}$};`
  }
}

/**
 * crée un obiet mathalea2D qui affiche du latex et qui peut tourner contrairement à latexParCoordonnees qui est horizontal
 * Les paramètres obligatoires (ne pas mettre de $ $ dans le latex !
 * @param latex
 * @param x
 * @param y
 * @param options
 * @param options.color la couleur du texte
 * @param options.backgroundColor la couleur de fond
 * @param options.letterSize la taille des caractères en texte latex sans l'antislash
 * @param options.orientation l'angle de rotation en degrés
 * @param options.opacity l'opacité du texte // @fixme non encore implémenté
 *
 */
export function latex2d(
  latex: string,
  x: number,
  y: number,
  {
    color,
    backgroundColor,
    letterSize,
    orientation,
    opacity,
    gras,
  }: {
    color?: string
    backgroundColor?: string
    letterSize?: LetterSizeType
    orientation?: number
    opacity?: number
    gras?: boolean
  },
) {
  color = color ?? 'black'
  backgroundColor =
    backgroundColor == null ||
    backgroundColor === '' ||
    backgroundColor === 'none'
      ? ''
      : backgroundColor
  letterSize = letterSize ?? 'normalsize'
  orientation = orientation ?? 0
  gras = gras ?? false

  opacity = opacity ?? 1
  return new Latex2d(latex, x, y, {
    color,
    backgroundColor,
    letterSize,
    orientation,
    opacity,
    gras,
  })
}

export function tailleDeNbVersLatex(taille: number): LetterSizeType {
  if (taille > 1.9) {
    return 'huge'
  } else if (taille > 1.6) {
    return 'LARGE'
  } else if (taille > 1.3) {
    return 'Large'
  } else if (taille > 1.1) {
    return 'large'
  } else if (taille < 0.6) {
    return 'tiny'
  } else if (taille < 0.8) {
    return 'scriptsize'
  } else if (taille < 0.9) {
    return 'footnotesize'
  } else if (taille < 1) {
    return 'small'
  } else {
    return 'normalsize'
  }
}
