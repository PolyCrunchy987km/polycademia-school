import { inferieurouegal } from '../../modules/outils'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { IRepere } from './Interfaces'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { point } from './PointAbstrait'
import { polyline } from './Polyline'

/**
 * Trace la courbe d'une fonction dans un repère
 * @param {function} f fonction à tracer comme par exemple : const f = x => a * x ** 2 + b * x + c
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere  = {}]  Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'blue' ou du type '#f15929'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number} [parametres.yMin]  Ordonnée minimale du tracé de la courbe
 * @param {number} [parametres.yMax]  Ordonnée maximale du tracé de la courbe
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses du tracé de la fonction est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.xUnite = 1]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.yUnite = 1]  Abscisse maximale du tracé de la courbe
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du tracé de la courbe. À associer obligatoirement à colorToLatexOrHTML().
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022

export class Courbe extends ObjetMathalea2D {
  stringColor: string
  f?: (x: number) => number
  usePgfplots: boolean
  xmin: number
  xmax: number
  ymin: number
  ymax: number
  samples: number = 100
  xunite: number
  yunite: number
  epaisseur: number
  fLatex?: string
  constructor(
    f: (x: number) => number,
    {
      repere,
      color = 'black',
      epaisseur = 2,
      step = false,
      xMin,
      xMax,
      yMin,
      yMax,
      xUnite = 1,
      yUnite = 1,
      usePgfplots = false,
      fLatex,
    }: {
      repere?: IRepere
      color?: string
      epaisseur?: number
      step?: boolean | number
      xMin?: number
      xMax?: number
      yMin?: number
      yMax?: number
      xUnite?: number
      yUnite?: number
      usePgfplots?: boolean
      fLatex?: string
    } = {},
  ) {
    super()
    this.objets = []
    this.usePgfplots = usePgfplots
    this.epaisseur = epaisseur
    this.fLatex = fLatex

    if (repere == null) {
      throw Error(
        'Erreur dans Courbe : Il faut préciser le repère dans lequel tracer la courbe',
      )
    }
    const xmin = xMin == null ? (xMin = repere.xMin ?? 0) : xMin
    const xmax = xMax == null ? (xMax = repere.xMax ?? 0) : xMax
    const ymin = yMin == null ? (yMin = repere.yMin ?? 0) : yMin
    const ymax = yMax == null ? (yMax = repere.yMax ?? 0) : yMax

    this.xmin = xmin
    this.xmax = xmax
    this.ymin = ymin
    this.ymax = ymax

    this.bordures = (repere?.bordures ?? [0, 0, 0, 0]) as unknown as [
      number,
      number,
      number,
      number,
    ]

    this.stringColor = color
    let xunite, yunite // Tout en minuscule pour les différencier des paramètres de la fonction
    xunite = repere.xUnite
    yunite = repere.yUnite

    if (isNaN(xunite)) {
      xunite = xUnite
    }

    if (isNaN(yunite)) {
      yunite = yUnite
    }

    this.xunite = xunite
    this.yunite = yunite

    let points = []
    let pas: number
    let p
    if (!step) {
      pas = 0.2 / xUnite
    } else {
      pas = Number(step)
    }
    let lastFiniteX: number | null = null // Dernier x ayant fourni une valeur finie
    let lastOutOfBoundsX: number | null = null // Dernier x hors cadre mais fini

    for (let x = xmin; inferieurouegal(x, xMax ?? 10); x += pas) {
      if (x > xmax) x = xmax // normalement x<xmax... mais inférieurouegal ne compare qu'à 0.0000001 près, on peut donc avoir xmax+epsilon qui sort de l'intervalle de déf
      const y = Number(f(x))
      if (isFinite(y)) {
        if (y < ymax + 10 && y > ymin - 10) {
          points.push(point(x * xunite, y * yunite))
          lastFiniteX = x
          lastOutOfBoundsX = null // Réinitialiser car on est revenu dans les limites
        } else {
          // Valeur finie mais hors des limites affichées
          lastOutOfBoundsX = x
          if (points.length > 1) {
            p = polyline([...points], color)
            p.epaisseur = epaisseur
            this.objets.push(p)
            points = []
          }
        }
      } else {
        // Valeur infinie détectée
        if (lastFiniteX !== null) {
          // Créer des points supplémentaires entre le dernier point valide et l'infini
          const smallStep = pas / 100
          let xSmall: number = lastFiniteX + smallStep

          while (xSmall < x) {
            const ySmall = Number(f(xSmall))
            if (isFinite(ySmall) && ySmall < ymax + 10 && ySmall > ymin - 10) {
              points.push(point(xSmall * xunite, ySmall * yunite))
              lastFiniteX = xSmall
            } else if (isFinite(ySmall)) {
              // Hors cadre mais fini
              lastOutOfBoundsX = xSmall
            } else {
              // Infini rencontré avant x
              break
            }
            xSmall += smallStep
          }

          // Sauvegarder la polyligne actuellement en cours
          if (points.length > 1) {
            p = polyline([...points], color)
            p.epaisseur = epaisseur
            this.objets.push(p)
            points = []
          }
        }

        // Calculer le nouveau point de départ après l'infini
        if (lastOutOfBoundsX !== null && lastFiniteX !== null) {
          // dx entre le x ayant produit l'infini et le dernier x hors cadre mais fini
          const dx = x - lastOutOfBoundsX
          // Redémarrer à partir de x + dx
          x = x + dx
        } else {
          x += pas
        }
      }
    }
    if (points.length > 1) {
      p = polyline([...points], color)
      p.epaisseur = epaisseur
      this.objets.push(p)
    }
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz(
    axisYMin?: number,
    axisYMax?: number,
    _axisXMin?: number,
    _axisXMax?: number,
  ) {
    if (this.usePgfplots && this.fLatex) {
      // Use pgfplots with function expression
      let colorLatex = colorToLatexOrHTML(this.stringColor)[1] || 'black'
      // Remove braces from color if present
      colorLatex = colorLatex.replace(/[{}]/g, '')
      const domainMin = (this.xmin * this.xunite).toFixed(3)
      const domainMax = (this.xmax * this.xunite).toFixed(3)

      // Use axis bounds if provided, otherwise use curve's ymin/ymax
      const yDomainMin = (
        axisYMin !== undefined ? axisYMin * 20 : this.ymin * this.yunite * 20
      ).toFixed(3)
      const yDomainMax = (
        axisYMax !== undefined ? axisYMax * 20 : this.ymax * this.yunite * 20
      ).toFixed(3)

      const code = `\\addplot[color=${colorLatex},line width=${this.epaisseur / 2}pt,domain=${domainMin}:${domainMax},restrict y to domain=${yDomainMin}:${yDomainMax},samples=${this.samples}] {${this.fLatex}};\n`

      return code
    } else {
      // Legacy behavior: use polylines
      let code = ''
      if (this.objets == null) return code
      for (const objet of this.objets) {
        code += '\n\t' + objet.tikz()
      }
      return code
    }
  }

  svgml(coeff: number, amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.svgml === 'undefined') code += '\n\t' + objet.svg(coeff)
      else code += '\n\t' + objet.svgml(coeff, amp)
    }
    return code
  }

  tikzml(amp: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      if (typeof objet.tikzml === 'undefined') code += '\n\t' + objet.tikz()
      else code += '\n\t' + objet.tikzml(amp)
    }
    return code
  }
}
/**
 * Trace la courbe d'une fonction dans un repère
 * @param {function} f Fonction à tracer comme par exemple : const f = x => a * x ** 2 + b * x + c
 * @param {Object} parametres À saisir entre accolades
 * @param {Repere} [parametres.repere = {}] Repère dans lequel le tracé de la fonction se fait
 * @param {string} [parametres.color = 'black']  Couleur du tracé de la courbe : du type 'blue' ou du type '#f15929'
 * @param {number} [parametres.epaisseur = 2]  Epaisseur du tracé de la courbe
 * @param {number} [parametres.xMin = repere.xMin]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.xMax = repere.xMax]  Abscisse maximale du tracé de la courbe
 * @param {number} [parametres.yMin = repere.yMin]  Ordonnée minimale du tracé de la courbe
 * @param {number} [parametres.yMax = repere.yMax]  Ordonnée maximale du tracé de la courbe
 * @param {boolean|number} [parametres.step = false] Si false, le pas entre deux abscisses du tracé de la fonction est 0.2/xUnite. Sinon, ce pas vaut la valeur indiquée.
 * @param {number} [parametres.xUnite = 1]  Abscisse minimale du tracé de la courbe
 * @param {number} [parametres.yUnite = 1]  Abscisse maximale du tracé de la courbe
 * @param {boolean} [parametres.usePgfplots = false] Si true, utilise pgfplots pour la sortie LaTeX au lieu de tracés polylignes
 * @param {string} [parametres.fLatex] Expression LaTeX de la fonction (requis si usePgfplots = true)
 * @example courbe(g, {repere: r})
 * // Trace, en noir avec une épaisseur de 2, la courbe g dans le repère r, tous deux précédemment définis.
 * @example courbe(g, {repere: r, epaisseur: 5, color: 'blue'})
 * // Trace la courbe g dans le repère r, tous deux précédemment définis, en bleu, avec une épaisseur de 5.
 * @example courbe(g, {repere: r, usePgfplots: true, fLatex: 'x^2 - 2*x + 1'})
 * // Trace la courbe g dans le repère r en utilisant pgfplots (sortie LaTeX plus compacte).
 * @author Rémi Angot
 * @return {Courbe}
 */
// JSDOC Validee par EE Aout 2022

export function courbe(
  f: (x: number) => number,
  {
    repere,
    color = 'black',
    epaisseur = 2,
    step = false,
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite = 1,
    yUnite = 1,
    usePgfplots = false,
    fLatex,
  }: {
    repere?: IRepere
    color?: string
    epaisseur?: number
    step?: boolean | number
    xMin?: number
    xMax?: number
    yMin?: number
    yMax?: number
    xUnite?: number
    yUnite?: number
    usePgfplots?: boolean
    fLatex?: string
  } = {},
) {
  return new Courbe(f, {
    repere,
    color,
    epaisseur,
    step,
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite,
    yUnite,
    usePgfplots,
    fLatex,
  })
}
