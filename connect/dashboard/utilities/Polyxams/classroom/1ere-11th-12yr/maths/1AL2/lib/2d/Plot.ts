import { arrondi } from '../outils/nombres'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'

/**
 * @author Jean-Claude Lhote
 * @param {number} x abscisse
 * @param {number} y ordonnée
 * @param {object} param2 permet de définir le rayon du 'plot', sa couleur, sa couleur de remplissage
 */

export class Plot extends ObjetMathalea2D {
  couleurDeRemplissage: string[]
  rayon: number
  x: number
  y: number
  opaciteDeRemplissage: number
  constructor(
    x: number,
    y: number,
    {
      rayon = 0.05,
      couleur = 'black',
      couleurDeRemplissage = 'black',
      opacite = 1,
      opaciteDeRemplissage = 1,
    } = {},
  ) {
    super()
    if (isNaN(x) || isNaN(y))
      window.notify('Plot : les coordonnées ne sont pas valides', { x, y })
    this.color = colorToLatexOrHTML(couleur) // EE : 08/05/2022
    this.couleurDeRemplissage = colorToLatexOrHTML(couleurDeRemplissage)
    this.rayon = rayon
    this.x = x
    this.y = y
    this.bordures = [x - rayon, y - rayon, x + rayon, y + rayon]
    this.opacite = opacite
    this.opaciteDeRemplissage = opaciteDeRemplissage
  }

  svg(coeff: number) {
    if (this.couleurDeRemplissage[0] === '') {
      return `\n\t <circle cx="${this.x * coeff}" cy="${-this.y * coeff}" r="${this.rayon * coeff}" stroke="${this.color[0]}" stroke-opacity="${this.opacite || 1}"/>`
    } else {
      return `\n\t <circle cx="${this.x * coeff}" cy="${-this.y * coeff}" r="${this.rayon * coeff}" stroke="${this.color[0]}" fill="${this.couleurDeRemplissage[0]}" stroke-opacity="${this.opacite || 1}" fill-opacity="${this.opaciteDeRemplissage || 1}"/>`
    }
  }

  tikz() {
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color=${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line-width=${this.epaisseur}`)
    }
    if (this.opacite !== 1) {
      tableauOptions.push(`opacity=${this.opacite}`)
    }
    if (this.opaciteDeRemplissage !== 1) {
      tableauOptions.push(`fill opacity=${this.opaciteDeRemplissage}`)
    }
    if (
      this.couleurDeRemplissage[1] !== '' &&
      this.couleurDeRemplissage[1] !== 'none' &&
      this.couleurDeRemplissage[1] !== ''
    ) {
      tableauOptions.push(`fill=${this.couleurDeRemplissage[1]}`)
    }
    let optionsDraw = ''
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    return `\n\t \\filldraw${optionsDraw} (${this.x},${this.y}) circle (${this.rayon});`
  }
}

export function plot(
  x: number,
  y: number,
  {
    rayon = 0.05,
    couleur = 'black',
    couleurDeRemplissage = 'black',
    opacite = 1,
    opaciteDeRemplissage = 1,
  } = {},
) {
  return new Plot(arrondi(x), arrondi(y), {
    rayon,
    couleur,
    couleurDeRemplissage,
    opacite,
    opaciteDeRemplissage,
  })
}
