import earcut from 'earcut'
import { context } from '../../modules/context'
import { arrondi } from '../outils/nombres'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { IPointAbstrait, IPolygone } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pattern } from './pattern'
import {
  isPointsAbstraits,
  pointAbstrait,
  PointAbstrait,
} from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'
import { longueur } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

type BinomeXY = { x: number; y: number }
export type BinomesXY = BinomeXY[]

// Fonction locale pour calculer l'aire d'un triangle (remplace l'import)
function aireTriangle(p: {
  listePoints: { x: number; y: number }[]
}): number | false {
  if (!p?.listePoints || p.listePoints.length !== 3) return false
  const [A, B, C] = p.listePoints
  return 0.5 * Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y))
}

/**
 * Crée le barycentre d'un polygone
 * @param {Polygone} p Polygone dont on veut créer le barycentre
 * @param {string} [nom = ''] Nom du barycentre
 * @param {string} [positionLabel = 'above'] Position du nom par rapport au point
 * @example G = barycentre(pol) // Crée G, le barycentre du polygone pol, sans lui donner de nom
 * @example G = barycentre(pol,'G','below') // Crée G, le barycentre du polygone pol, en notant G sous le point, s'il est tracé et labellisé.
 * @author Jean-Claude Lhote
 * @return {Point}
 */
// JSDOC Validee par EE Juin 2022
export function barycentre(p: IPolygone, nom = '', positionLabel = 'above') {
  let sommex = 0
  let sommey = 0
  let nbsommets = 0
  for (const point of p.listePoints) {
    sommex += point.x
    sommey += point.y
    nbsommets++
  }
  const x = sommex / nbsommets
  const y = sommey / nbsommets
  return pointAbstrait(x, y, nom, positionLabel)
}

/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%% LES POLYGONES %%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/
/**
 * polygone(A,B,C,D,E) //Trace ABCDE
 * polygone([A,B,C,D],"blue") // Trace ABCD en bleu
 * polygone([A,B,C,D],"blue","red","green") // Trace ABCD en bleu, rempli en rouge et hachuré en vert.
 * @property {Point[]} listePoints
 * @property {string[]} color
 * @property {string[]} couleurDeRemplissage
 * @property {string[]} couleurDesHachures
 * @property {number} epaisseurDesHachures
 * @property {number} distanceDesHachures
 * @property {number} opaciteDeRemplissage
 * @property {boolean|string} hachures
 * @property {number[]} bordures
 * @property {string} nom
 * @property {string} id
 * @property {string} style
 * @property {number} opacite
 * @property {number} epaisseur
 * @property {number} pointilles
 *
 * @author Rémi Angot*
 * @class
 */
export class Polygone extends ObjetMathalea2D {
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  couleurDesHachures: string[]
  distanceDesHachures: number
  epaisseurDesHachures: number
  hachures: boolean | string
  listePoints: PointAbstrait[]
  nom: string
  pointilles: number
  _triangulation: [PointAbstrait, PointAbstrait, PointAbstrait][]
  _flat: number[]
  _aire: number
  stringColor: string
  readonly perimetre: number
  constructor(
    ...points:
      | (PointAbstrait | IPointAbstrait)[]
      | [(PointAbstrait | IPointAbstrait)[], string?]
  ) {
    super()
    this.epaisseurDesHachures = 1
    this.distanceDesHachures = 10
    this.couleurDeRemplissage = colorToLatexOrHTML('none')
    this.opaciteDeRemplissage = 0.5
    this.epaisseur = 1
    this.opacite = 1
    this.pointilles = 0
    this._triangulation = []
    this._flat = []
    this._aire = 0
    this.stringColor = 'black'
    if (Array.isArray(points[0])) {
      // Si le premier argument est un tableau
      this.listePoints = points[0].map((el) =>
        pointAbstrait(el.x, el.y, el.nom, el.positionLabel),
      )
      if (points[1]) {
        this.color = colorToLatexOrHTML(String(points[1]))
        this.stringColor = String(points[1])
      }
      if (points[2]) {
        this.couleurDeRemplissage = colorToLatexOrHTML(String(points[2]))
      } else {
        this.couleurDeRemplissage = colorToLatexOrHTML('none')
      }
      if (points[3]) {
        this.couleurDesHachures = colorToLatexOrHTML(String(points[3]))
        this.hachures = true
      } else {
        this.couleurDesHachures = colorToLatexOrHTML('black')
        this.hachures = false
      }
      this.nom = this.listePoints.map((el) => el.nom).join('')
    } else {
      if (typeof points[points.length - 1] === 'string') {
        this.color = colorToLatexOrHTML(String(points[points.length - 1]))
        this.stringColor = String(points[points.length - 1])
        points.splice(points.length - 1, 1)
      }
      this.listePoints = points.filter((el) => el instanceof PointAbstrait)
      this.nom = this.listePoints.map((el) => el.nom).join('')
      this.couleurDeRemplissage = colorToLatexOrHTML('none')
      this.couleurDesHachures = colorToLatexOrHTML('none') // Rajout EE du 22/02/2024 pour 6N22 cas 3
      this.hachures = false
    }
    let xmin = 1000
    let xmax = -1000
    let ymin = 1000
    let ymax = -1000
    for (const unPoint of this.listePoints) {
      if (unPoint.typeObjet !== 'point')
        window.notify('Polygone : argument invalide', { ...points })
      xmin = Math.min(xmin, unPoint.x)
      xmax = Math.max(xmax, unPoint.x)
      ymin = Math.min(ymin, unPoint.y)
      ymax = Math.max(ymax, unPoint.y)
    }
    this.bordures = [xmin, ymin, xmax, ymax]
    let p = 0
    for (let i = 0; i < this.listePoints.length; i++) {
      p += longueur(
        this.listePoints[i],
        this.listePoints[(i + 1) % this.listePoints.length],
      )
    }
    this.perimetre = p
  }

  binomesXY(coeff: number) {
    let liste = ''
    for (const point of this.listePoints) {
      liste += `${point.xSVG(coeff)},${point.ySVG(coeff)} `
    }
    return liste
  }

  get flat() {
    if (this._flat.length === 0) {
      this._flat = polygoneToFlatArray(this)
    }
    return this._flat
  }

  get triangulation() {
    if (this._triangulation.length === 0) {
      const trianglesIndices = earcut(this.flat)
      this._triangulation = []
      for (let i = 0; i < trianglesIndices.length; i += 3) {
        this._triangulation.push([
          pointAbstrait(
            this.flat[trianglesIndices[i] * 2],
            this.flat[trianglesIndices[i] * 2 + 1],
          ),
          pointAbstrait(
            this.flat[trianglesIndices[i + 1] * 2],
            this.flat[trianglesIndices[i + 1] * 2 + 1],
          ),
          pointAbstrait(
            this.flat[trianglesIndices[i + 2] * 2],
            this.flat[trianglesIndices[i + 2] * 2 + 1],
          ),
        ])
      }
    }
    return this._triangulation
  }

  get aire() {
    if (this._aire === 0) {
      const triangles = this.triangulation
      this._aire = 0
      for (let i = 0; i < triangles.length; i++) {
        this._aire += Number(aireTriangle(polygone(triangles[i])))
      }
    }
    return this._aire
  }

  svg(coeff: number) {
    if (this.epaisseur !== 1) {
      this.style += ` stroke-width="${this.epaisseur}" `
    }
    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }
    switch (this.pointilles) {
      case 1:
        this.style += ' stroke-dasharray="6 10" '
        break
      case 2:
        this.style += ' stroke-dasharray="6 3" '
        break
      case 3:
        this.style += ' stroke-dasharray="3 2 6 2 " '
        break
      case 4:
        this.style += ' stroke-dasharray="1 2" '
        break
      case 5:
        this.style += ' stroke-dasharray="5 5" '
        break
    }

    if (this.hachures) {
      if (this.couleurDeRemplissage.length < 1) {
        this.couleurDeRemplissage = colorToLatexOrHTML('none')
      }
      return (
        pattern({
          motif: String(this.hachures),
          id: String(this.id),
          distanceDesHachures: this.distanceDesHachures,
          epaisseurDesHachures: this.epaisseurDesHachures,
          couleurDesHachures: this.couleurDesHachures[0] || 'black',
          couleurDeRemplissage: this.couleurDeRemplissage[0],
          opaciteDeRemplissage: this.opaciteDeRemplissage,
        }) +
        `<polygon points="${this.binomesXY(coeff)}" stroke="${this.color[0]}" ${this.style} id="${this.id}" fill="url(#pattern${this.id})" />`
      )
    } else {
      if (
        this.couleurDeRemplissage[0] === '' ||
        this.couleurDeRemplissage[0] === undefined
      ) {
        this.style += ' fill="none" '
      } else {
        this.style += ` fill="${this.couleurDeRemplissage[0]}" `
        this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
      }
      if (this.opacite !== 1) {
        this.style += ` stroke-opacity="${this.opacite}" `
      }
      return `<polygon points="${this.binomesXY(coeff)}" stroke="${this.color[0]}" ${this.style} id="${this.id}" />`
    }
  }

  tikz() {
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    switch (this.pointilles) {
      case 1:
        tableauOptions.push(' dash dot ')
        break
      case 2:
        tableauOptions.push(' densely dash dot dot ')
        break
      case 3:
        tableauOptions.push(' dash dot dot ')
        break
      case 4:
        tableauOptions.push(' dotted ')
        break
      case 5:
        tableauOptions.push(' dashed ')
        break
    }
    if (this.opacite !== 1) {
      tableauOptions.push(`opacity=${this.opacite}`)
    }

    if (
      this.couleurDeRemplissage[1] !== '' &&
      this.couleurDeRemplissage[1] !== 'none'
    ) {
      tableauOptions.push(
        `preaction={fill,color = ${this.couleurDeRemplissage[1]}${this.opaciteDeRemplissage !== 1 ? ', opacity = ' + this.opaciteDeRemplissage : ''}}`,
      )
    }

    if (this.hachures) this.hachures = 'dotted'
    if (this.hachures != null && typeof this.hachures === 'string') {
      tableauOptions.push(
        pattern({
          motif: this.hachures,
          id: String(this.id),
          distanceDesHachures: this.distanceDesHachures,
          couleurDesHachures: this.couleurDesHachures[1],
          couleurDeRemplissage: this.couleurDeRemplissage[1],
          opaciteDeRemplissage: this.opaciteDeRemplissage,
        }),
      )
    }
    let optionsDraw = ''
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }

    let binomeXY = ''

    for (const point of this.listePoints) {
      binomeXY += `(${arrondi(point.x)},${arrondi(point.y)})--`
    }
    const lines = `\\draw${optionsDraw} ${binomeXY}cycle;`

    return lines
  }

  svgml(coeff: number, amp: number) {
    let code = ''
    let segmentCourant
    let A, B
    for (let k = 1; k <= this.listePoints.length; k++) {
      B = this.listePoints[k % this.listePoints.length]
      A = this.listePoints[k - 1]
      segmentCourant = segment(A, B, this.stringColor)
      segmentCourant.epaisseur = this.epaisseur
      segmentCourant.opacite = this.opacite
      code += segmentCourant.svgml(coeff, amp)
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    let segmentCourant
    let A, B
    for (let k = 1; k <= this.listePoints.length; k++) {
      B = this.listePoints[k % this.listePoints.length]
      A = this.listePoints[k - 1]
      segmentCourant = segment(A, B, this.stringColor)
      segmentCourant.epaisseur = this.epaisseur
      segmentCourant.opacite = this.opacite
      code += '\t' + segmentCourant.tikzml(amp) + '\n'
    }
    return code
  }
}

/**
 * Propriétés possibles : .color, .opacite, .epaisseur, .couleurDeRemplissage, .opaciteDeRemplissage, .hachures (un string correspondant à l'un des motifs de pattern), .distanceDesHachures, .epaisseurDesHachures,.couleurDesHachures
 * @return {Polygone} objet Polygone
 * @example polygone(A,B,C,D,E) //Trace ABCDE
 * @example polygone([A,B,C,D],"blue") // Trace ABCD en bleu
 * @example polygone([A,B,C,D],"#f15929") // Trace ABCD en orange (code couleur HTML : #f15929)
 * @property {PointAbstrait[]} listePoints
 * @property {string[]} color
 * @property {string[]} couleurDeRemplissage
 * @property {string[]} couleurDesHachures
 * @property {number} epaisseurDesHachures
 * @property {number} distanceDesHachures
 * @property {number} opaciteDeRemplissage
 * @property {boolean|string} hachures
 * @property {number[]} bordures
 * @property {string} nom
 * @property {string} id
 * @property {string} style
 * @property {number} opacite
 * @property {number} epaisseur
 * @property {number} pointilles
 *
 * @author Rémi Angot
 */
export function polygone(
  ...args:
    | (PointAbstrait | IPointAbstrait)[]
    | [(PointAbstrait | IPointAbstrait)[], string?]
) {
  return new Polygone(...args)
}

/**
 * Crée un groupe d'objets contenant le polygone et ses sommets
 * @param  {...any} args
 * @return {array} [polygone,sommets]
 * Si le dernier argument est un nombre, celui-ci sera utilisé pour fixer la distance entre le sommet et le label (par défaut 0.5)
 * @exemple [poly, sommets] = polygoneAvecNom(A, B, C, D) // où A, B, C, D sont des objets Point
 */
export function polygoneAvecNom(
  ...args: (PointAbstrait | number)[]
): [Polygone, NommePolygone] {
  let k = 0.5
  if (typeof args[args.length - 1] === 'number') {
    k = Number(args[args.length - 1])
    args.splice(args.length - 1, 1)
  }
  if (!isPointsAbstraits(args)) {
    window.notify(
      'polygoneAvecNom : les arguments doivent être des objets PointAbstrait',
      { args },
    )
    return [polygone(), nommePolygone(polygone())]
  }
  const p = polygone(...args)
  let nom = ''
  args.forEach((el: PointAbstrait) => {
    nom += el.nom + ','
  })
  nom = nom.substring(0, nom.length - 1)
  const sommets = nommePolygone(p, nom, k)
  sommets.bordures = [0, 0, 0, 0]
  sommets.bordures[0] = p.bordures[0] - 1 - k
  sommets.bordures[1] = p.bordures[1] - 1 - k
  sommets.bordures[2] = p.bordures[2] + 1 + k
  sommets.bordures[3] = p.bordures[3] + 1 + k
  return [p, sommets]
}

/**
 * @description en une fois tous les sommets d'un polygone avec le tableau de string fourni
 * attention si on passe un string comme 'ABCD' ça fonctionne aussi...
 * Si on veut des noms de points à plus de 1 caractère, il faut soit les passer en tableau soit les séparer par des virgules au sein du string
 * @example renommePolygone(p, "A',B',C',D'") ou renommePolygone(p, ["A'","B'","C'","D'"])
 */
export function renommePolygone(p: Polygone, noms: string | string[]) {
  noms =
    typeof noms === 'string'
      ? noms.includes(',')
        ? noms.split(',')
        : noms
      : noms
  for (let i = 0; i < p.listePoints.length; i++) {
    if (noms[i] !== undefined) {
      p.listePoints[i].nom = noms[i]
    }
  }
}

/**
 * @param {Polygone} p
 * @return {number[]} retourne la liste des coordonnées des sommets de p dans un seul tableau.
 * @author Jean-Claude Lhote
 */
export function polygoneToFlatArray(p: Polygone) {
  const flatArray = []
  for (let i = 0; i < p.listePoints.length; i++) {
    flatArray.push(p.listePoints[i].x, p.listePoints[i].y)
  }
  return flatArray
}

/**
 *
 * @param {number[]} [data = []] tableau à une seule dimension (flat array) contenant les coordonnées des sommets (extérieurs et intérieurs) du polygone
 * @param {number[]} [holes = []] tableau à une seule dimension contenant les indices des points qui démarrent un 'trou' dans le tableau data (exemple : holes = [4, 8] indique que les points 4 à 7 définissent un trou ainsi que 8 et suivants, donc les coordonnées 8 à 15 et 16 à ...(ne pas oublier que 1 point = 2 coordonnées))
 * @param {string} [noms = ''] chaine donnant les noms des sommets
 * @param {string} [color = 'black'] couleur du polygone
 * @param {string} [couleurDeRemplissage = ' blue'] la couleur de remplissage
 * @param {string} [couleurDeFond = 'white'] la couleur des trous
 * @class
 */
export class PolygoneATrous extends ObjetMathalea2D {
  _aire: number
  _triangulation: Polygone[]
  contour: Polygone
  trous: Polygone[]
  colorString: string
  triangles: number[]
  data: number[]
  holes: number[]
  stringColor: string
  stringCouleurDeFond: string
  stringCouleurDeRemplissage: string
  constructor({
    data = [],
    holes = [],
    noms = '',
    color = 'black',
    couleurDeRemplissage = 'blue',
    couleurDeFond = 'white',
  }) {
    super()
    this.colorString = color
    this.data = data
    this.holes = holes
    this.triangles = earcut(data, holes) // on crée le pavage de triangles grâce à Mapbox/earcut

    this._triangulation = []
    this._aire = 0
    this.stringColor = color

    const sommetsContour = [] // on crée le polygone extérieur
    for (let i = 0; i < 2 * holes[0]; i += 2) {
      sommetsContour.push(pointAbstrait(data[i], data[i + 1]))
      if (noms.length >= data.length << 1) {
        sommetsContour[i >> 1].nom = noms[i << 1]
      }
    }
    // On cherche les bordures
    for (
      let i = 0, xmin = 1000, xmax = -1000, ymin = 1000, ymax = -1000;
      i < data.length;
      i += 2
    ) {
      xmin = Math.min(xmin, data[i])
      xmax = Math.max(xmax, data[i])
      ymin = Math.min(ymin, data[i + 1])
      ymax = Math.max(ymax, data[i + 1])
      this.bordures = [xmin, ymin, xmax, ymax]
    }
    this.contour = polygone(...sommetsContour)
    this.trous = []
    this.stringCouleurDeRemplissage = couleurDeRemplissage
    this.contour.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.contour.color = colorToLatexOrHTML(this.stringColor)
    this.stringCouleurDeFond = couleurDeFond
    const trous: PointAbstrait[][] = []
    let trou: PointAbstrait
    let trouPol: Polygone
    for (let i = 0; i < holes.length; i++) {
      trous[i] = []
      for (
        let j = holes[i] * 2;
        j < (i !== holes.length - 1 ? holes[i + 1] * 2 : data.length);
        j += 2
      ) {
        trou = pointAbstrait(data[j], data[j + 1])
        if (noms.length >= data.length >> 1) {
          trou.nom = noms[j >> 1]
        }
        trous[i].push(trou)
      }
      trouPol = polygone(...trous[i])
      trouPol.color = colorToLatexOrHTML(this.stringColor)
      trouPol.couleurDeRemplissage = colorToLatexOrHTML(
        this.stringCouleurDeFond,
      )
      this.trous.push(trouPol)
    }
  }

  get triangulation(): Polygone[] {
    if (this._triangulation === null) {
      this._triangulation = []
      for (let i = 0, triangle; i < this.triangles.length; i += 3) {
        triangle = polygone([
          pointAbstrait(
            this.data[this.triangles[i] * 2],
            this.data[this.triangles[i] * 2 + 1],
          ),
          pointAbstrait(
            this.data[this.triangles[i + 1] * 2],
            this.data[this.triangles[i + 1] * 2 + 1],
          ),
          pointAbstrait(
            this.data[this.triangles[i + 2] * 2],
            this.data[this.triangles[i + 2] * 2 + 1],
          ),
        ])
        triangle.color = colorToLatexOrHTML(this.stringColor)
        triangle.couleurDeRemplissage = colorToLatexOrHTML('none')
        this._triangulation.push(triangle)
      }
    }
    return this._triangulation
  }

  get aire(): number {
    if (this._aire === null) {
      this._aire = this.contour.aire
      for (let i = 0; i < this.trous.length; i++) {
        this._aire -= this.trous[i].aire
      }
    }
    return this._aire
  }

  svg(coeff: number) {
    let code = this.contour.svg(coeff)
    for (let i = 0; i < this.trous.length; i++) {
      code += this.trous[i].svg(coeff)
    }
    return code
  }

  tikz() {
    let code = this.contour.tikz()
    for (let i = 0; i < this.trous.length; i++) {
      code += '\n\t' + this.trous[i].tikz()
    }
    return code
  }
}

/**
 * Cet objet permet de créer un polygone avec une surface contenant des 'trous' eux-mêmes polygonaux
 * cerise sur le gâteau, la propriété this.triangulation fournit une liste de triangles pavant le polygone
 * @param {number[]} [data = []] contient la liste des coordonnées des sommets (contour puis trous) 2 coordonnées par point dans l'ordre abscisse, ordonnée
 * @param {number[]}  [holes = []] tableau à une seule dimension contenant les indices des points qui démarrent un 'trou' dans le tableau data (exemple : holes = [4, 8] indique que les points 4 à 7 définissent un trou ainsi que 8 et suivants, donc les coordonnées 8 à 15 et 16 à ...(ne pas oublier que 1 point = 2 coordonnées))
 * @param {string} [noms = ''] contient les noms des sommets
 * @param {string} [color = 'black'] est la couleur des bords
 * @param {string} [couleurDeRemplissage = 'blue'] est la couleur de la surface
 * @param {string} [couleurDeFond = 'white'] est la couleur de remplissage des trous
 * @return {PolygoneaTrou} un polygone à trous (ou pas : il peut ne pas y avoir de trou !)
 */
export function polygoneATrous({
  data = [],
  holes = [],
  noms = '',
  color = 'black',
  couleurDeRemplissage = 'blue',
  couleurDeFond = 'white',
}) {
  return new PolygoneATrous({
    data,
    holes,
    noms,
    color,
    couleurDeRemplissage,
    couleurDeFond,
  })
}

/**
 * @description Place les labels passés dans le deuxième paramètre aux sommets du polygone en les plaçant alignés avec le barycentre du polygone à une distance fixée du point
 * @description Si les noms peuvent avoir plusieurs caractères, il faudra ajouter des virgules entre chaque nom dans le string passé en argument.
 * @example nommePolygone (p, "A',B',C',D',E'", 0.5, 'red')
 * @example nommePolygone (p,'ABCDE',0.5,'red') nomme les sommets du polygone A, B, C, D et E. Les labels sont placés à une distance de 0,5 cm des sommets
 * @author Jean-Claude Lhote
 */
export class NommePolygone extends ObjetMathalea2D {
  poly: Polygone
  dist: number
  constructor(p: Polygone, nom = '', k = 0.5, color = 'black', size = 1) {
    super()
    this.poly = p
    this.dist = k
    this.objets = []
    const noms = nom.includes(',') ? nom.split(',') : nom
    for (let i = 0; i < p.listePoints.length; i++) {
      if (noms.length > 0) p.listePoints[i].nom = noms[i]
    }
    p.nom = p.listePoints.map((el) => el.nom).join('')
    const G = barycentre(p)
    let xMin = 1000
    let xMax = -1000
    let yMin = 1000
    let yMax = -1000
    for (const pt of p.listePoints) {
      const P = pointSurSegment(
        G,
        pt,
        longueur(G, pt) +
          (context.isHtml ? (k * 20) / context.pixelsParCm : k / context.scale),
      )
      P.positionLabel = 'center'
      this.objets.push(texteParPoint(pt.nom, P, 0, color, size, 'milieu', true))
      xMin = Math.min(xMin, P.x - 0.5)
      xMax = Math.max(xMax, P.x + 0.5)
      yMin = Math.min(yMin, P.y - 0.5)
      yMax = Math.max(yMax, P.y + 0.5)
    }
    this.bordures = [xMin, yMin, xMax, yMax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.tikz()
    }
    return code
  }
}

export function nommePolygone(
  p: Polygone,
  nom = '',
  k = 0.5,
  color = 'black',
  size = 1,
) {
  return new NommePolygone(p, nom, k, color, size)
}
