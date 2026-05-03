import { arrondi } from '../outils/nombres'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { IPoint3d } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'

/**
 * polyline(A,B,C,D,E) //Trace la ligne brisée ABCDE
 *
 * @author Rémi Angot
 */

export class Polyline extends ObjetMathalea2D {
  listePoints: PointAbstrait[]
  listePoints3d: IPoint3d[]
  nom: string
  stringColor: string
  // Surcharges pour faciliter l'inférence de types
  constructor(...points: PointAbstrait[])
  constructor(...points: [...PointAbstrait[], string])
  constructor(...points: IPoint3d[])
  constructor(...points: [...IPoint3d[], string])
  constructor(points: PointAbstrait[], color?: string)
  constructor(points: IPoint3d[], color?: string)
  constructor(...args: any[]) {
    super()
    this.epaisseur = 1
    this.pointilles = 0
    this.opacite = 1

    // Normalisation des arguments
    let pts: any[] = []
    let colorArg: string | undefined

    if (
      (args.length === 1 && Array.isArray(args[0])) ||
      (args.length === 2 && Array.isArray(args[0]))
    ) {
      // new Polyline([A, B, C]) ou new Polyline([A, B, C], 'red')
      pts = args[0]
      if (typeof args[1] === 'string') colorArg = args[1]
    } else {
      // new Polyline(A, B, C) ou new Polyline(A, B, C, 'red')
      if (typeof args[args.length - 1] === 'string') {
        colorArg = args.pop()
      }
      pts = args
    }

    // Séparation des points 2D et 3D
    this.listePoints = (pts as any[]).filter(
      (el) => el instanceof PointAbstrait,
    )
    this.listePoints3d = (pts as any[]).filter(
      (el) => el && typeof el === 'object' && 'c2d' in el,
    ) as IPoint3d[]

    // Couleur
    this.stringColor = colorArg ?? 'black'
    this.color = colorToLatexOrHTML(this.stringColor)

    let xmin = 1000
    let xmax = -1000
    let ymin = 1000
    let ymax = -1000
    for (const unPoint of this.listePoints) {
      if (unPoint.typeObjet !== 'point')
        window.notify('Polyline : argument invalide', { points: pts })
      xmin = Math.min(xmin, unPoint.x)
      xmax = Math.max(xmax, unPoint.x)
      ymin = Math.min(ymin, unPoint.y)
      ymax = Math.max(ymax, unPoint.y)
    }
    this.bordures = [xmin, ymin, xmax, ymax]
    this.nom = ''
    if (this.listePoints.length < 15) {
      // Ne nomme pas les lignes brisées trop grandes (pratique pour les courbes de fonction)
      for (const point of this.listePoints) {
        this.nom += point.nom
      }
      for (const point of this.listePoints3d) {
        this.nom += point.label
      }
    }
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

    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }
    let binomeXY = ''
    for (const point of this.listePoints) {
      const X = point.xSVG(coeff)
      const Y = point.ySVG(coeff)
      binomeXY += `${X},${Y} `
    }
    for (const point of this.listePoints3d) {
      const X = point.c2d.x * coeff
      const Y = -point.c2d.y * coeff
      binomeXY += `${X},${Y} `
    }
    return `<polyline points="${binomeXY}" fill="none" stroke="${this.color[0]}" ${this.style} id="${this.id}" />`
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
      tableauOptions.push(`opacity = ${this.opacite}`)
    }

    let optionsDraw = ''
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    let binomeXY = ''
    for (const point of this.listePoints) {
      binomeXY += `(${arrondi(point.x)},${arrondi(point.y)})--`
    }
    binomeXY = binomeXY.substr(0, binomeXY.length - 2)
    return `\\draw${optionsDraw} ${binomeXY};`
  }

  svgml(coeff: number, amp: number) {
    let code = ''
    let s
    for (let k = 1; k < this.listePoints.length; k++) {
      s = segment(
        this.listePoints[k - 1],
        this.listePoints[k],
        this.stringColor,
      )
      s.epaisseur = this.epaisseur
      s.opacite = this.opacite
      code += s.svgml(coeff, amp)
    }
    return code
  }

  tikzml(amp: number) {
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
      `decorate,decoration={random steps, segment length=3pt, amplitude = ${amp}pt}`,
    )

    let optionsDraw = ''
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    let binomeXY = ''
    for (const point of this.listePoints) {
      binomeXY += `(${arrondi(point.x)},${arrondi(point.y)})--`
    }
    binomeXY = binomeXY.substr(0, binomeXY.length - 2)
    return `\\draw${optionsDraw} ${binomeXY};`
  }
}
// Surcharges de la fabrique pour refléter celles du constructeur

export function polyline(...points: PointAbstrait[]): Polyline
export function polyline(...points: [...PointAbstrait[], string]): Polyline
export function polyline(...points: IPoint3d[]): Polyline
export function polyline(...points: [...IPoint3d[], string]): Polyline
export function polyline(points: PointAbstrait[], color?: string): Polyline
export function polyline(points: IPoint3d[], color?: string): Polyline
export function polyline(...args: any[]): Polyline {
  return new Polyline(...(args as any))
}
