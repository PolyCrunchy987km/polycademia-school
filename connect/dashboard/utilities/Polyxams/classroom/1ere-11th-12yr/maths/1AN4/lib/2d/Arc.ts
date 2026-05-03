import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { droite } from './droites'
import type { IPointAbstrait } from './Interfaces'
import MainLevee from './MainLevee'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pattern } from './pattern'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { angleModulo, angleOriente, longueur } from './utilitairesGeometriques'

/**
 * Convertit un angle de degrés en radians
 * @param angle Angle en degrés
 * @returns Angle en radians
 */
const degToRad = (angle: number): number => (angle * Math.PI) / 180

/**
 * Calcule les coordonnées de l'image d'un point par rotation
 * @param point Point à transformer
 * @param centre Centre de rotation
 * @param angle Angle de rotation en degrés
 * @returns Point abstrait résultat
 */
export const rotationPoint = (
  point: IPointAbstrait,
  centre: IPointAbstrait,
  angle: number,
): IPointAbstrait => {
  const angleRad = degToRad(angle)
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  const dx = point.x - centre.x
  const dy = point.y - centre.y
  return pointAbstrait(
    centre.x + dx * cos - dy * sin,
    centre.y + dx * sin + dy * cos,
  )
}

/** Trace un arc de cercle, connaissant une extrémité, son centre et la mesure de l'angle
 * @param {Point} M Extrémité de départ de l'arc
 * @param {Point} Omega Centre de l'arc
 * @param {number|Point} angle Mesure de l'angle compris entre -360 et 360 (valeur négative = sens indirect) ou bien point formant un angle avec M et Omega.
 * @param {boolean} [rayon = false] Si true, les rayons délimitant l'arc sont ajoutés.
 * @param {string} [couleurDeRemplissage = 'none'] Couleur ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [color = 'black'] Couleur de l'arc ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage = 0.2] Opacité de remplissage de 0 à 1.
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none', pas de hachures.
 * @property {string} svg Sortie au format vectoriel (SVG) que l'on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l'on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l'on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l'on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur de l'arc ou 'none'. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurDeRemplissage Couleur ou 'none'. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opaciteDeRemplissage Opacité de remplissage de 0 à 1.
 * @property {string} hachures Hachures ou pas ?
 * @property {string} couleurDesHachures Couleur des hachures ou 'none'. À associer obligatoirement à colorToLatexOrHTML(). Si 'none' ou '', pas de hachures.
 * @property {number} [opacite = 1] Opacité du cercle de 0 à 1.
 * @property {number} [epaisseurDesHachures = 1] Epaisseur des hachures si couleur de hachures choisie.
 * @property {number} [distanceDesHachures = 10] Distance des hachures si couleur de remplissage choisie.
 * @property {number} [pointilles = 0] Type de pointillés choisis (entre 1 et 5). Si autre nombre, pas de pointillés.
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @author Jean-claude Lhote
 * @class
 **/
// JSDOC Validee par EE Juin 2022
export class Arc extends ObjetMathalea2D {
  rayons: boolean
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  hachures?: string
  couleurDesHachures: string[]
  epaisseurDesHachures?: number
  distanceDesHachures?: number
  angle: number
  rayon: number
  angleFin: number
  azimut: number
  pointDepart: IPointAbstrait
  centre: IPointAbstrait
  pointFinal: IPointAbstrait
  constructor(
    M: IPointAbstrait,
    omega: IPointAbstrait,
    angle: IPointAbstrait | number,
    rayons = false,
    couleurDeRemplissage = 'none',
    color = 'black',
    opaciteDeRemplissage = 0.2,
    couleurDesHachures = 'none',
    opacite = 1,
    epaisseurDesHachures = 1,
    distanceDesHachures = 10,
  ) {
    super()
    this.pointDepart = M
    this.centre = omega
    this.rayons = rayons
    this.typeObjet = 'arc'
    this.color = colorToLatexOrHTML(color)
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.opacite = opacite ?? 1
    this.epaisseurDesHachures = epaisseurDesHachures ?? 1
    this.distanceDesHachures = distanceDesHachures ?? 10
    this.pointilles = 0
    this.epaisseur = 1
    this.couleurDesHachures = colorToLatexOrHTML(couleurDesHachures)
    this.angle =
      typeof angle === 'number' ? angle : angleOriente(M, omega, angle)
    const medX: number[] = []
    const medY: number[] = []
    for (let ee = 1; ee < 9; ee++) {
      const p = rotationPoint(M, omega, (ee * this.angle) / 10)
      medX.push(p.x)
      medY.push(p.y)
    }
    this.rayon = longueur(omega, M, 2)
    const A = pointAbstrait(omega.x + 1, omega.y)
    this.azimut = angleOriente(A, omega, M)
    this.angleFin = this.azimut + this.angle
    const angleSVG = angleModulo(this.angle)

    this.pointFinal = rotationPoint(M, omega, angleSVG)
    this.bordures = [
      Math.min(M.x, this.pointFinal.x, ...medX) - 0.1,
      Math.min(M.y, this.pointFinal.y, ...medY) - 0.1,
      Math.max(M.x, this.pointFinal.x, ...medX) + 0.1,
      Math.max(M.y, this.pointFinal.y, ...medY) + 0.1,
    ]
  }

  svg(coeff: number) {
    let sweep: number
    let large: number
    if (this.angle > 180) {
      sweep = 0 // option pour path : permet de savoir quel morceau de cercle tracé parmi les 2 possibles. Voir https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths pour plus de détails
      large = 1 // option pour path : permet de savoir sur un morceau de cercle choisi, quel parcours prendre.
    } else if (this.angle < -180) {
      large = 1
      sweep = 1
    } else {
      large = 0
      sweep = 1 - (this.angle > 0 ? 1 : 0)
    }
    if (this.rayons) {
      this.style = ''
      if (this.opacite !== 1) {
        this.style += ` stroke-opacity="${this.opacite}" `
      }
      if (this.epaisseur !== 1) {
        this.style += ` stroke-width="${this.epaisseur}" `
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
      if (
        this.hachures != null &&
        typeof this.hachures === 'string' &&
        this.hachures !== ''
      ) {
        if (this.couleurDeRemplissage.length < 1) {
          this.couleurDeRemplissage = colorToLatexOrHTML('none')
        }
        return (
          pattern({
            motif: this.hachures,
            id: String(this.id),
            distanceDesHachures: this.distanceDesHachures,
            epaisseurDesHachures: this.epaisseurDesHachures,
            couleurDesHachures: this.couleurDesHachures[0] ?? 'black',
            couleurDeRemplissage: this.couleurDeRemplissage[0],
            opaciteDeRemplissage: this.opaciteDeRemplissage,
          }) +
          `<path d="M${this.pointDepart.x * coeff} ${-this.pointDepart.y * coeff} A ${this.rayon * coeff} ${this.rayon * coeff} 0 ${large} ${sweep} ${this.pointFinal.x * coeff} ${-this.pointFinal.y * coeff} L ${this.centre.x * coeff} ${-this.centre.y * coeff} Z" stroke="${this.color[0]}" ${this.style} id="${this.id}" fill="url(#pattern${this.id})"/>`
        )
      } else {
        if (
          this.couleurDeRemplissage[0] === '' ||
          this.couleurDeRemplissage[0] === undefined ||
          this.couleurDeRemplissage[0] === 'none'
        ) {
          this.style += ' fill="none" '
        } else {
          this.style += ` fill="${this.couleurDeRemplissage[0]}" `
          this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
        }
        return `<path d="M${this.pointDepart.x * coeff} ${-this.pointDepart.y * coeff} A ${this.rayon * coeff} ${this.rayon * coeff} 0 ${large} ${sweep} ${this.pointFinal.x * coeff} ${-this.pointFinal.y * coeff} L ${this.centre.x * coeff} ${-this.centre.y * coeff} Z" stroke="${this.color[0]}" ${this.style}/>`
      }
    } else {
      this.style = ''
      if (this.epaisseur !== 1) {
        this.style += ` stroke-width="${this.epaisseur}" `
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
      if (this.opacite !== 1) {
        this.style += ` stroke-opacity="${this.opacite}" `
      }
      if (
        this.couleurDeRemplissage[0] === '' ||
        this.couleurDeRemplissage[0] === undefined ||
        this.couleurDeRemplissage[0] === 'none'
      ) {
        this.style += ' fill="none" '
      } else {
        this.style += ` fill="${this.couleurDeRemplissage[0]}" `
        this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
      }
      return `<path d="M${this.pointDepart.x * coeff} ${-this.pointDepart.y * coeff} A ${this.rayon * coeff} ${this.rayon * coeff} 0 ${large} ${sweep} ${this.pointFinal.x * coeff} ${-this.pointFinal.y * coeff}" stroke="${this.color[0]}" ${this.style} id="${this.id}" />`
    }
  }

  tikz() {
    let optionsDraw: string = ''
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
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    if (
      // this.rayons && (EE (14/05/2025) : ai commenté cette ligne car je ne comprends pas pourquoi le remplissage dépendrait de this.rayons. Si présent, cela fait dysfonctionner la sortie LaTeX des cas 3-4-5-6 de 6M21.)
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    ) {
      tableauOptions.push(
        `preaction={fill,color = ${this.couleurDeRemplissage[1]},opacity = ${this.opaciteDeRemplissage}}`,
      )
    }

    if (
      this.hachures != null &&
      typeof this.hachures === 'string' &&
      this.hachures !== ''
    ) {
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
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    const lng = longueur(this.centre, this.pointDepart, 2)
    if (this.rayons) {
      return `\\draw  ${optionsDraw} (${this.pointFinal.x},${this.pointFinal.y}) -- (${this.centre.x},${this.centre.y}) -- (${this.pointDepart.x},${this.pointDepart.y}) arc (${this.azimut}:${this.angleFin}:${lng}) ;`
    } else {
      return `\\draw${optionsDraw} (${this.pointDepart.x},${this.pointDepart.y}) arc (${this.azimut}:${this.angleFin}:${lng}) ;`
    }
  }

  svgml(coeff: number) {
    const width = longueur(this.pointDepart, this.centre, 2) * coeff * 2
    const height = width
    const closed = this.rayons
    const A = pointAbstrait(this.centre.x + 1, this.centre.y)
    const end = degToRad(angleOriente(this.pointDepart, this.centre, A))
    const start = end - degToRad(this.angle)
    const mainLevee = MainLevee.create()
    if (mainLevee != null) {
      const code = mainLevee.arc(
        this.centre.x * coeff,
        -this.centre.y * coeff,
        width,
        height,
        start > end ? end : start,
        start > end ? start : end,
        closed,
      )
      mainLevee.destroy()
      return code
    } else return ''
  }

  tikzml(amp: number) {
    let optionsDraw: string = ''
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    tableauOptions.push(
      `decorate,decoration={random steps, amplitude = ${amp}pt}`,
    )

    optionsDraw = '[' + tableauOptions.join(',') + ']'

    return `\\draw${optionsDraw} (${this.pointDepart.x},${this.pointDepart.y}) arc (${this.azimut}:${this.angleFin}:${longueur(this.centre, this.pointDepart, 2).toFixed(2)}) ;`
  }
}

/** Trace un arc de cercle, connaissant une extrémité, son centre et la mesure de l'angle
 * @param {Point} M Extrémité de départ de l'arc
 * @param {Point} Omega Centre de l'arc
 * @param {number} angle Mesure de l'angle compris entre -360 et 360 (valeur négative = sens indirect)
 * @param {boolean} [rayon = false] Booléen. Si true, les rayons délimitant l'arc sont ajoutés.
 * @param {string} [couleurDeRemplissage = 'none'] Couleur ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [color = 'black'] Couleur de l'arc ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage = 0.2] Opacité de remplissage de 0 à 1.
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none', pas de hachures.
 * @example arc(M,O,35)
 // Trace l'arc en noir de centre O, d'extrémité M et d'angle orienté 35° (sans remplissage et sans hachures)
 * @example arc(M,O,true,-40,'red','green',0.8,'white')
 // Trace l'arc en vert de centre O, d'extrémité M et d'angle orienté -40°, rempli en rouge à 80 %, avec des hachures blanches
 * @return {Arc}
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022

export function arc(
  M: IPointAbstrait,
  Omega: IPointAbstrait,
  angle: IPointAbstrait | number,
  rayon = false,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
  couleurDesHachures = 'none',
) {
  return new Arc(
    M,
    Omega,
    angle,
    rayon,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    couleurDesHachures,
  )
}

/** Trace un arc de cercle, connaissant deux extrémités et la mesure de l'angle
 * @param {Point} M Première extrémité de l'arc
 * @param {Point} N Deuxième extrémité de l'arc
 * @param {number} angle Mesure de l'angle compris entre -360 et 360 (valeur négative = sens indirect)
 * @param {boolean} [rayon = false] Booléen. Si true, les rayons délimitant l'arc sont ajoutés.
 * @param {boolean|'none'} [couleurDeRemplissage = 'none'] Couleur ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [color = 'black'] Couleur de l'arc ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {number} [opaciteDeRemplissage = 0.2] Opacité de remplissage de 0 à 1.
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none', pas de hachures.
 * @example arcPointPointAngle(A,B,35)
 // Trace l'arc en noir d'extrémités A et B (dans cet ordre) et d'angle orienté 35° (sans remplissage et sans hachures)
 * @example arcPointPointAngle(A,B,true,-40,'red','green',0.8,'white')
 // Trace l'arc en vert d'extrémités A et B (dans cet ordre) et d'angle orienté -40°, rempli en rouge à 80 %, avec des hachures blanches
 * @return {Arc}
 * @author Jean-claude Lhote
 */
// JSDOC Validee par EE Juin 2022
export function arcPointPointAngle(
  M: PointAbstrait,
  N: PointAbstrait,
  angle: number,
  rayon = false,
  couleurDeRemplissage = 'none',
  color = 'black',
  opaciteDeRemplissage = 0.2,
  couleurDesHachures = 'none',
): Arc {
  let anglerot
  if (angle < 0) anglerot = (angle + 180) / 2
  else anglerot = (angle - 180) / 2
  // Droite perpendiculaire à MN, passant par le milieu I de [MN]
  const I = pointAbstrait((M.x + N.x) / 2, (M.y + N.y) / 2)
  const vx = N.x - M.x
  const vy = N.y - M.y
  // Un point J sur la perpendiculaire en I (vecteur directeur perpendiculaire à MN : (-vy, vx))
  // (pas besoin de normaliser, la construction par deux points suffit)
  const J = pointAbstrait(I.x - vy, I.y + vx)
  const d = droite(I, J)
  // Rotation de la droite (N, M) autour de N avec angle anglerot
  // = rotation des points N et M, puis construction de la droite
  const NRotate = rotationPoint(N, N, anglerot) // N reste fixe (centre de rotation)
  const MRotate = rotationPoint(M, N, anglerot)
  const f = droite(
    pointAbstrait(NRotate.x, NRotate.y),
    pointAbstrait(MRotate.x, MRotate.y),
  )
  const determinant = d.a * f.b - f.a * d.b
  const Omegax = (d.b * f.c - f.b * d.c) / determinant
  const Omegay = (f.a * d.c - d.a * f.c) / determinant
  const Omega = pointAbstrait(Omegax, Omegay)
  return new Arc(
    M,
    Omega,
    angle,
    rayon,
    couleurDeRemplissage,
    color,
    opaciteDeRemplissage,
    couleurDesHachures,
  )
}
