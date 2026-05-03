import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import MainLevee from './MainLevee'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pattern } from './pattern'
import { PointAbstrait } from './PointAbstrait'
import { longueur } from './utilitairesGeometriques'

/**
 * Construit le cercle (ou le disque) de centre O, de rayon r
 * @param {PointAbstrait} O Centre du cercle
 * @param {number} r Rayon du cercle
 * @param {string} [color = 'black'] Couleur du cercle ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDeRemplissage = 'none'] Couleur de remplissage ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none' ou '', pas de hachures.
 * @param {number} [epaisseur = 1] Epaisseur du cercle
 * @param {number} [pointilles = 0] Style des pointillés du cercle (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @param {number} [opacite = 1] Opacité du cercle
 * @param {number} [opaciteDeRemplissage = 1.1] Opacité du disque si couleur de remplissage choisie.
 * @param {number} [epaisseurDesHachures = 1] Epaisseur des hachures si couleur de hachures choisie.
 * @param {number} [distanceDesHachures = 10] Distance des hachures si couleur de remplissage choisie.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {Point} centre Centre du cercle
 * @property {number} rayon Rayon du cercle
 * @property {string} color Couleur du cercle ou 'none'. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} couleurDeRemplissage Couleur de remplissage ou 'none'. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} epaisseur Epaisseur du cercle
 * @property {number} pointilles Style des pointillés du cercle (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @property {number} opacite Opacité du cercle
 * @property {number} opaciteDeRemplissage Opacité du disque si couleur de remplissage choisie.
 * @property {string} hachures Hachures ou pas ?
 * @property {string} couleurDesHachures Couleur des hachures ou 'none'. À associer obligatoirement à colorToLatexOrHTML(). Si 'none' ou '', pas de hachures.
 * @property {number} epaisseurDesHachures Epaisseur des hachures si couleur de hachures choisie.
 * @property {number} distanceDesHachures Distance des hachures si couleur de remplissage choisie.
 * @property {number[]} bordures Coordonnées de la fenêtre d'affichage du genre [-2,-2,5,5]
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022
export class Cercle extends ObjetMathalea2D {
  centre: PointAbstrait
  rayon: number
  couleurDeRemplissage: string[]
  opaciteDeRemplissage: number
  hachures?: string
  couleurDesHachures: string[]
  epaisseurDesHachures: number
  distanceDesHachures: number

  constructor(
    O: PointAbstrait,
    r: number,
    color = 'black',
    couleurDeRemplissage = 'none',
    couleurDesHachures = 'none',
    epaisseur = 1,
    pointilles = 0,
    opacite = 1,
    opaciteDeRemplissage = 1,
    epaisseurDesHachures = 1,
    distanceDesHachures = 10,
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.centre = O
    this.rayon = r
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.opaciteDeRemplissage = opaciteDeRemplissage
    this.couleurDesHachures = colorToLatexOrHTML(couleurDesHachures)
    this.epaisseurDesHachures = epaisseurDesHachures
    this.distanceDesHachures = distanceDesHachures
    this.bordures = [O.x - r, O.y - r, O.x + r, O.y + r]
    this.epaisseur = epaisseur
    this.pointilles = pointilles
    this.opacite = opacite
  }

  svg(coeff: number) {
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

    if (this.hachures) {
      if (this.couleurDeRemplissage.length < 1) {
        this.couleurDeRemplissage = colorToLatexOrHTML('none')
      }
      return (
        pattern({
          motif: this.hachures,
          id: String(this.id),
          distanceDesHachures: this.distanceDesHachures,
          epaisseurDesHachures: this.epaisseurDesHachures,
          couleurDesHachures: this.couleurDesHachures[0],
          couleurDeRemplissage: this.couleurDeRemplissage[0],
          opaciteDeRemplissage: this.opaciteDeRemplissage,
        }) +
        `<circle cx="${this.centre.xSVG(coeff)}" cy="${this.centre.ySVG(coeff)}" r="${this.rayon * coeff}" stroke="${this.color[0]}" ${this.style} id="${this.id}" fill="url(#pattern${this.id})" />`
      )
    } else {
      if (this.opacite !== 1) {
        this.style += ` stroke-opacity="${this.opacite}" `
      }
      if (this.couleurDeRemplissage[0] === '') {
        this.style += ' fill="none" '
      } else {
        this.style += ` fill="${this.couleurDeRemplissage[0]}" `
        this.style += ` fill-opacity="${this.opaciteDeRemplissage}" `
      }

      return `<circle cx="${this.centre.xSVG(coeff)}" cy="${this.centre.ySVG(coeff)}" r="${
        this.rayon * coeff
      }" stroke="${this.color[0]}" ${this.style} id="${this.id}" />`
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
    if (this.opaciteDeRemplissage !== 1) {
      tableauOptions.push(`fill opacity = ${this.opaciteDeRemplissage}`)
    }
    if (
      this.couleurDeRemplissage[1] !== '' &&
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    ) {
      tableauOptions.push(
        `preaction={fill,color = ${this.couleurDeRemplissage[1]},opacity = ${this.opaciteDeRemplissage}}`,
      )
    }

    if (this.hachures) {
      tableauOptions.push(
        pattern({
          motif: this.hachures,
          id: String(this.id),
          distanceDesHachures: this.distanceDesHachures,
          epaisseurDesHachures: this.epaisseurDesHachures,
          couleurDesHachures: this.couleurDesHachures[1],
          couleurDeRemplissage: this.couleurDeRemplissage[1],
          opaciteDeRemplissage: this.opaciteDeRemplissage,
        }),
      )
    }

    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    return `\\draw${optionsDraw} (${this.centre.x},${this.centre.y}) circle (${this.rayon});`
  }

  svgml(coeff: number) {
    const mainLevee = MainLevee.create()
    if (mainLevee != null) {
      const code = mainLevee.circle(
        this.centre.x,
        this.centre.y,
        this.rayon * coeff,
      )
      mainLevee.destroy()
      return code
    } else return ''
  }

  tikzml(amp: number) {
    let optionsDraw = ''
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

    const code = `\\draw${optionsDraw} (${this.centre.x},${this.centre.y}) circle (${this.rayon});`
    return code
  }
}

/**
 * Construit le cercle (ou le disque) de centre O, de rayon r
 * @param {PointAbstrait} O Centre du cercle
 * @param {number} r Rayon du cercle
 * @param {string} [color = 'black'] Couleur du cercle ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDeRemplissage = 'none'] Couleur de remplissage ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none' ou '', pas de hachures.
 * @param {number} [epaisseur = 1] Epaisseur du cercle
 * @param {number} [pointilles = 0] Style des pointillés du cercle (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @param {number} [opacite = 1] Opacité du cercle
 * @param {number} [opaciteDeRemplissage = 1.1] Opacité du disque si couleur de remplissage choisie.
 * @param {number} [epaisseurDesHachures = 1] Epaisseur des hachures si couleur de hachures choisie.
 * @param {number} [distanceDesHachures = 10] Distance des hachures si couleur de remplissage choisie.
 * @example cercle (A,5)
 * // Construit un cercle c1 noir de centre A et de rayon 5
 * @example cercle (A,5,'red','blue','#f15929',3,2,0.3,0.8)
 * // Construit un disque de centre A et de rayon 5, de bord rouge à 30 % d'opacité et en pointillés, rempli en bleu à 80 % d'opacité, et avec des hachures orange de 1 d'épaisseur et avec 10 d'écart entre deux hachures
 * @example cercle (A,5,'red','blue','#f15929',3,2,0.3,0.8,2,12)
 * // Construit un disque de centre A et de rayon 5, de bord rouge à 30 % d'opacité et en pointillés, rempli en bleu à 80 % d'opacité, et avec des hachures orange de 2 d'épaisseur et avec 12 d'écart entre deux hachures
 * @return {Cercle}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022
export function cercle(
  O: PointAbstrait,
  r: number,
  color = 'black',
  couleurDeRemplissage = 'none',
  couleurDesHachures = 'none',
  epaisseur = 1,
  pointilles = 0,
  opacite = 1,
  opaciteDeRemplissage = 1.1,
  epaisseurDesHachures = 1,
  distanceDesHachures = 10,
) {
  return new Cercle(
    O,
    r,
    color,
    couleurDeRemplissage,
    couleurDesHachures,
    epaisseur,
    pointilles,
    opacite,
    opaciteDeRemplissage,
    epaisseurDesHachures,
    distanceDesHachures,
  )
}

/**
 * Construit le cercle (ou le disque) de centre O, passant par M
 * @param {PointAbstrait} O Centre du cercle
 * @param {PointAbstrait} M Point du cercle
 * @param {string} [color = 'black'] Couleur du cercle ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDeRemplissage = 'none'] Couleur de remplissage ou 'none' : du type 'blue' ou du type '#f15929'
 * @param {string} [couleurDesHachures = 'none'] Couleur des hachures ou 'none' : du type 'blue' ou du type '#f15929' Si 'none' ou '', pas de hachures.
 * @param {number} [epaisseur = 1] Epaisseur du cercle
 * @param {number} [pointilles = 0] Style des pointillés du cercle (entier entre 1 et 5). Si autre chose, pas de pointillés.
 * @param {number} [opacite = 1] Opacité du cercle
 * @param {number} [opaciteDeRemplissage = 1.1] Opacité du disque si couleur de remplissage choisie.
 * @param {number} [epaisseurDesHachures = 1] Epaisseur des hachures si couleur de hachures choisie.
 * @param {number} [distanceDesHachures = 10] Distance des hachures si couleur de remplissage choisie.
 * @example cercleCentrePoint (A,B)
 * // Construit un cercle c1 noir de centre A, passant par B
 * @example cercleCentrePoint (A,B,'red','blue','#f15929',3,2,0.3,0.8)
 * // Construit un disque de centre A, passant par B, de bord rouge à 30 % d'opacité et en pointillés, rempli en bleu à 80 % d'opacité, et avec des hachures orange de 1 d'épaisseur et avec 10 d'écart entre deux hachures
 * @example cercleCentrePoint (A,B,'red','blue','#f15929',3,2,0.3,0.8,2,12)
 * // Construit un disque de centre A, passant par B, de bord rouge à 30 % d'opacité et en pointillés, rempli en bleu à 80 % d'opacité, et avec des hachures orange de 2 d'épaisseur et avec 12 d'écart entre deux hachures
 * @return {Cercle}
 * @author Rémi Angot
 */
// JSDOC Validee par EE Juin 2022
export function cercleCentrePoint(
  O: PointAbstrait,
  M: PointAbstrait,
  color = 'black',
  couleurDeRemplissage = 'none',
  couleurDesHachures = 'none',
  epaisseur = 1,
  pointilles = 0,
  opacite = 1,
  opaciteDeRemplissage = 1.1,
  epaisseurDesHachures = 1,
  distanceDesHachures = 10,
) {
  return new Cercle(
    O,
    longueur(O, M, 2),
    color,
    couleurDeRemplissage,
    couleurDesHachures,
    epaisseur,
    pointilles,
    opacite,
    opaciteDeRemplissage,
    epaisseurDesHachures,
    distanceDesHachures,
  )
}
