import { context } from '../../modules/context'
import { rangeMinMax } from '../outils/nombres'
import { stringNombre } from '../outils/texNombre'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { Plot, plot } from './Plot'
import { point } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { latex2d, texteParPosition } from './textes'

/**
 * @param {number?} xmin=-10
 * @param {number?} ymin=10
 * @param {number?} xmax=-10
 * @param {number?} ymax=10
 * @param {number?} xstep=1
 * @param {number?} ystep=1
 * @param {'quad'|'hexa'|'equi'?} type='quad'
 * @param {string?} pointColor='black'
 * @param {number?} pointRayon=0.05
 * @param {number?} opacite=1
 * @param {number?} opaciteDeRemplissage=1
 * @constructor
 * @author Jean-Claude Lhote
 */
export class PapierPointe extends ObjetMathalea2D {
  plots: Plot[]
  listeCoords: [number, number][]
  constructor({
    xmin = -10,
    xmax = 10,
    ymin = -10,
    ymax = 10,
    xstep = 1,
    ystep = 1,
    type = 'quad',
    pointColor = 'black',
    pointRayon = 0.05,
    opacite = 1,
    opaciteDeRemplissage = 1,
  }) {
    super()
    this.listeCoords = []
    this.plots = []
    let xstep1, xstep2, ystep1, stepper
    switch (type) {
      case 'quad':
        for (let x = xmin; x <= xmax; x += xstep) {
          for (let y = ymin; y <= ymax; y += ystep) {
            this.plots.push(
              plot(x, y, {
                rayon: pointRayon,
                couleur: pointColor,
                opacite,
                couleurDeRemplissage: 'black',
                opaciteDeRemplissage,
              }),
            )
            this.listeCoords.push([x, y])
          }
        }
        break
      case 'hexa':
        stepper = false
        ystep1 = Math.min(xstep, ystep)
        xstep1 = 0.866 * ystep1
        xstep2 = 1.732 * ystep1
        for (let x = xmin; x <= xmax; x += xstep2) {
          for (let y = ymin; y <= ymax; y += 1.5 * ystep1) {
            stepper = !stepper
            if (stepper) {
              this.plots.push(
                plot(x, y, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x + xstep1, y + ystep1 / 2, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x + xstep1, y + ystep1 * 1.5, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.listeCoords.push(
                [x, y],
                [x + xstep1, y + ystep1 / 2],
                [x + xstep1, y + ystep1 * 1.5],
              )
            } else {
              this.plots.push(
                plot(x, y + ystep1 / 2, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.listeCoords.push([x, y + ystep1 / 2])
            }
          }
          stepper = !stepper
        }
        break
      case 'equi':
        stepper = false
        ystep1 = Math.min(xstep, ystep)
        xstep1 = 0.866 * ystep1
        xstep2 = 1.732 * ystep1
        for (let x = xmin; x <= xmax; x = x + xstep2) {
          for (let y = ymin; y <= ymax; y = y + 1.5 * ystep1) {
            stepper = !stepper
            if (stepper) {
              this.plots.push(
                plot(x, y, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x, y + ystep1, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x + xstep1, y + ystep1 / 2, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x + xstep1, y + ystep1 * 1.5, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.listeCoords.push(
                [x, y],
                [x, y + ystep1],
                [x + xstep1, y + ystep1 / 2],
                [x + xstep1, y + ystep1 * 1.5],
              )
            } else {
              this.plots.push(
                plot(x + xstep1, y + ystep1, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.plots.push(
                plot(x, y + ystep1 / 2, {
                  rayon: pointRayon,
                  couleur: pointColor,
                  opacite,
                  couleurDeRemplissage: context.isHtml ? 'none' : '',
                  opaciteDeRemplissage,
                }),
              )
              this.listeCoords.push(
                [x + xstep1, y + ystep1],
                [x, y + ystep1 / 2],
              )
            }
          }
          stepper = !stepper
        }
        break
    }
  }

  svg(coeff: number) {
    let code = ''
    for (const objet of this.plots) {
      code += objet.svg(coeff)
    }
    return code
  }

  tikz = () => {
    let code = ''
    for (const objet of this.plots) {
      code += objet.tikz()
    }
    return code
  }
}

export function papierPointe({
  xmin = -10,
  xmax = 10,
  ymin = -10,
  ymax = 10,
  xstep = 1,
  ystep = 1,
  type = 'quad',
  pointColor = 'black',
  pointRayon = 0.05,
  opacite = 0.4,
  opaciteDeRemplissage = 0.4,
}) {
  return new PapierPointe({
    xmin,
    xmax,
    ymin,
    ymax,
    xstep,
    ystep,
    type,
    pointColor,
    pointRayon,
    opacite,
    opaciteDeRemplissage,
  })
}

/**
 * repere({xUnite, yUnite, xMin, xMax, yMin, yMax, axeX, axeY, axesEpaisseur, axesCouleur, axeXStyle, axeYStyle, thickEpaisseur,
 * thickHauteur, thickCouleur, xThickDistance, xThickListe, xThickMin, xThickMax, yThickDistance, yThickListe,
 * yThickMin, yThickMax, xLabelDistance, xLabelListe, xLabelMin, xLabelMax, yLabelDistance, yLabelListe,
 * yLabelMin, yLabelMax, xLegende,xLegendePosition, yLegende, yLegendePosition, grille, grilleDistance,
 * grilleCouleur,grilleOpacite, grilleEpaisseur, grilleSecondaire, grilleSecondaireDistance, grilleSecondaireCouleur,
 * grilleSecondaireOpacite, grilleSecondaireEpaisseur, grilleX, grilleXListe, grilleXDistance, grilleXMin, grilleXMax,
 * grilleXCouleur, grilleXOpacite, grilleY, grilleYListe, grilleYDistance, grilleYMin, grilleYMax, grilleYCouleur,
 * grilleYOpacite, grilleSecondaireX, grilleSecondaireXListe, grilleSecondaireXDistance, grilleSecondaireXMin, grilleSecondaireXMax,
 * grilleSecondaireXCouleur, grilleSecondaireXOpacite, grilleSecondaireY, grilleSecondaireYListe, grilleSecondaireYDistance,
 * grilleSecondaireYMin, grilleSecondaireYMax, grilleSecondaireYCouleur, grilleSecondaireYOpacite})
 *
 * repere() trace un repère classique. De nombreux paramètres permettent d'en modifier l'aspect
 *
 * @author Rémi Angot
 * @param {object} options
 * @param {number}  options.xUnite = 1,
 * @param {number}  options.yUnite = 1,
 * @param {number}  options.xMin = -10,
 * @param {number}  options.xMax = 10,
 * @param {number}  options.yMin = -10,
 * @param {number}  options.yMax = 10,
 * @param {boolean?}  options.axeXisVisible = true,
 * @param {boolean?}  options.axeYisVisible = true,
 * @param {number}  options.axesEpaisseur = 2,
 * @param {string}  options.axesCouleur = 'black',
 * @param {string}  options.axeXStyle = '->',
 * @param {string}  options.axeYStyle = '->',
 * @param {number}  options.thickEpaisseur = 2,
 * @param {number}  options.thickHauteur = 0.2,
 * @param {string}  options.thickCouleur = axesCouleur,
 * @param {number}  options.xThickDistance = 1,
 * @param {number[]}  options.xThickListe = false,
 * @param {number}  options.xThickMin = xMin + xThickDistance,
 * @param {number}  options.xThickMax = xMax - xThickDistance,
 * @param {number}  options.yThickDistance = 1,
 * @param {number[]}  options.yThickListe = false,
 * @param {number}  options.yThickMin = yMin + yThickDistance,
 * @param {number}  options.yThickMax = yMax - yThickDistance,
 * @param {boolean}  options.labelsXareVisible = true,
 * @param {boolean}  options.labelsYareVisible = true,
 * @param {number}  options.xLabelDistance = xThickDistance,
 * @param {number[]}  options.xLabelListe = false,
 * @param {number}  options.xLabelMin = xThickMin,
 * @param {number}  options.xLabelMax = xThickMax,
 * @param {number}  options.yLabelDistance = yThickDistance,
 * @param {number[]}  options.yLabelListe = false,
 * @param {number}  options.yLabelMin = yThickMin,
 * @param {number}  options.yLabelMax = yThickMax,
 * @param {number}  options.precisionLabelX = 1,
 * @param {number}  options.precisionLabelY = 1,
 * @param {number}  options.xLabelEcart = 0.5,
 * @param {number}  options.yLabelEcart = 0.5,
 * @param {string}  options.xLegende = '',
 * @param {number}  options.xLegendePosition = [],
 * @param {string}  options.yLegende = '',
 * @param {number}  options.yLegendePosition = [],
 * @param {boolean?}  options.grille = true,
 * @param {number}  options.grilleDistance = false,
 * @param {string}  options.grilleCouleur = 'black',
 * @param {number}  options.grilleOpacite = 0.5,
 * @param {number}  options.grilleEpaisseur = 1,
 * @param {boolean?}  options.grilleSecondaire = false,
 * @param {number}  options.grilleSecondaireDistance = false,
 * @param {string}  options.grilleSecondaireCouleur = 'gray',
 * @param {number}  options.grilleSecondaireOpacite = 0.3,
 * @param {number}  options.grilleSecondaireEpaisseur = 1,
 * @param {boolean?}  options.grilleX = grille,
 * @param {number[]}  options.grilleXListe = false,
 * @param {number}  options.grilleXDistance = grilleDistance,
 * @param {number}  options.grilleXMin = false,
 * @param {number}  options.grilleXMax = false,
 * @param {string}  options.grilleXCouleur = grilleCouleur,
 * @param {number}  options.grilleXOpacite = grilleOpacite,
 * @param {boolean?}  options.grilleY = grille,
 * @param {number[]}  options.grilleYListe = false,
 * @param {number}  options.grilleYDistance = grilleDistance,
 * @param {number}  options.grilleYMin = false,
 * @param {number}  options.grilleYMax = false,
 * @param {string}  options.grilleYCouleur = grilleCouleur,
 * @param {number}  options.grilleYOpacite = grilleOpacite,
 * @param {boolean?}  options.grilleSecondaireX = grilleSecondaire,
 * @param {number[]}  options.grilleSecondaireXListe = false,
 * @param {number}  options.grilleSecondaireXDistance = grilleSecondaireDistance,
 * @param {number}  options.grilleSecondaireXMin = false,
 * @param {number}  options.grilleSecondaireXMax = false,
 * @param {string}  options.grilleSecondaireXCouleur = grilleSecondaireCouleur,
 * @param {number}  options.grilleSecondaireXOpacite = grilleSecondaireOpacite,
 * @param {boolean?}  options.grilleSecondaireY = grilleSecondaire,
 * @param {number[]}  options.grilleSecondaireYListe = false,
 * @param {number}  options.grilleSecondaireYDistance = grilleSecondaireDistance,
 * @param {number}  options.grilleSecondaireYMin = false,
 * @param {number}  options.grilleSecondaireYMax = false,
 * @param {string}  options.grilleSecondaireYCouleur = grilleSecondaireCouleur,
 * @param {number}  options.grilleSecondaireYOpacite = grilleSecondaireOpacite
 */
export class Repere extends ObjetMathalea2D {
  readonly isRepere = true as const
  xUnite: number
  yUnite: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  grilleXMin: number
  grilleXMax: number
  grilleYMin: number
  grilleYMax: number
  labelsXareVisible: boolean = true
  labelsYareVisible: boolean = true
  objets: ObjetMathalea2D[]

  constructor({
    xUnite = 1,
    yUnite = 1,
    xMin = -10,
    xMax = 10,
    yMin = -10,
    yMax = 10,
    axeXisVisible = true,
    axeYisVisible = true,
    axesEpaisseur = 1.2,
    axesCouleur = 'black',
    axeXStyle = '->',
    axeYStyle = '->',
    thickEpaisseur = 1.2,
    thickHauteur = 0.13,
    thickCouleur = axesCouleur,
    xThickDistance = 1,
    xThickListe = [],
    xThickMin = xMin + xThickDistance,
    xThickMax = xMax - xThickDistance,
    yThickDistance = 1,
    yThickListe = [],
    yThickMin = yMin + yThickDistance,
    yThickMax = yMax - yThickDistance,
    labelsXareVisible = true,
    labelsYareVisible = true,
    xLabelDistance = xThickDistance,
    xLabelListe = [],
    xLabelMin = xThickMin,
    xLabelMax = xThickMax,
    yLabelDistance = yThickDistance,
    yLabelListe = [],
    yLabelMin = yThickMin,
    yLabelMax = yThickMax,
    precisionLabelX = 1,
    precisionLabelY = 1,
    xLabelEcart = 0.5,
    yLabelEcart = 0.5,
    xLegende = '',
    xLegendePosition = [],
    yLegende = '',
    yLegendePosition = [],
    grille = true,
    grilleDistance = 1,
    grilleCouleur = 'black',
    grilleOpacite = 0.4,
    grilleEpaisseur = 1,
    grilleSecondaire = false,
    grilleSecondaireDistance = 1,
    grilleSecondaireCouleur = 'gray',
    grilleSecondaireOpacite = 0.3,
    grilleSecondaireEpaisseur = 1,
    grilleX = grille,
    grilleXListe = [],
    grilleXDistance = grilleDistance,
    grilleXMin = xMin,
    grilleXMax = xMax,
    grilleXCouleur = grilleCouleur,
    grilleXOpacite = grilleOpacite,
    grilleY = grille,
    grilleYListe = [],
    grilleYDistance = grilleDistance,
    grilleYMin = yMin,
    grilleYMax = yMax,
    grilleYCouleur = grilleCouleur,
    grilleYOpacite = grilleOpacite,
    grilleSecondaireX = grilleSecondaire,
    grilleSecondaireXListe = [],
    grilleSecondaireXDistance = grilleSecondaireDistance,
    grilleSecondaireXMin = xMin,
    grilleSecondaireXMax = xMax,
    grilleSecondaireXCouleur = grilleSecondaireCouleur,
    grilleSecondaireXOpacite = grilleSecondaireOpacite,
    grilleSecondaireY = grilleSecondaire,
    grilleSecondaireYListe = [],
    grilleSecondaireYDistance = grilleSecondaireDistance,
    grilleSecondaireYMin = yMin,
    grilleSecondaireYMax = yMax,
    grilleSecondaireYCouleur = grilleSecondaireCouleur,
    grilleSecondaireYOpacite = grilleSecondaireOpacite,
  }: {
    xUnite?: number
    yUnite?: number
    xMin?: number
    xMax?: number
    yMin?: number
    yMax?: number
    axeXisVisible?: boolean
    axeYisVisible?: boolean
    axesEpaisseur?: number
    axesCouleur?: string
    axeXStyle?: string
    axeYStyle?: string
    thickEpaisseur?: number
    thickHauteur?: number
    thickCouleur?: string
    xThickDistance?: number
    xThickListe?: number[] | boolean
    xThickMin?: number
    xThickMax?: number
    yThickDistance?: number
    yThickListe?: number[] | boolean
    yThickMin?: number
    yThickMax?: number
    labelsXareVisible?: boolean
    labelsYareVisible?: boolean
    xLabelDistance?: number
    xLabelListe?: boolean | (number | { valeur: number; texte: string })[]
    xLabelMin?: number
    xLabelMax?: number
    yLabelDistance?: number
    yLabelListe?: boolean | (number | { valeur: number; texte: string })[]
    yLabelMin?: number
    yLabelMax?: number
    precisionLabelX?: number
    precisionLabelY?: number
    xLabelEcart?: number
    yLabelEcart?: number
    xLegende?: string
    xLegendePosition?: number[]
    yLegende?: string
    yLegendePosition?: number[]
    grille?: boolean | 'pointilles'
    grilleDistance?: number
    grilleCouleur?: string
    grilleOpacite?: number
    grilleEpaisseur?: number
    grilleSecondaire?: boolean
    grilleSecondaireDistance?: number
    grilleSecondaireCouleur?: string
    grilleSecondaireOpacite?: number
    grilleSecondaireEpaisseur?: number
    grilleX?: boolean | 'pointilles'
    grilleXListe?: number[]
    grilleXDistance?: number
    grilleXMin?: number
    grilleXMax?: number
    grilleXCouleur?: string
    grilleXOpacite?: number
    grilleY?: boolean | 'pointilles'
    grilleYListe?: number[]
    grilleYDistance?: number
    grilleYMin?: number
    grilleYMax?: number
    grilleYCouleur?: string
    grilleYOpacite?: number
    grilleSecondaireX?: boolean | 'pointilles'
    grilleSecondaireXListe?: number[]
    grilleSecondaireXDistance?: number
    grilleSecondaireXMin?: number
    grilleSecondaireXMax?: number
    grilleSecondaireXCouleur?: string
    grilleSecondaireXOpacite?: number
    grilleSecondaireY?: boolean | 'pointilles'
    grilleSecondaireYListe?: number[]
    grilleSecondaireYDistance?: number
    grilleSecondaireYMin?: number
    grilleSecondaireYMax?: number
    grilleSecondaireYCouleur?: string
    grilleSecondaireYOpacite?: number
  }) {
    super()

    // Les propriétés exportables
    this.xUnite = xUnite
    this.yUnite = yUnite
    this.xMin = xMin
    this.xMax = xMax
    this.yMin = yMin
    this.yMax = yMax
    this.grilleXMin = grilleXMin ?? xMin
    this.grilleXMax = grilleXMax ?? xMax
    this.grilleYMin = grilleYMin ?? yMin
    this.grilleYMax = grilleYMax ?? yMax

    if (thickHauteur === 0) {
      xThickListe = false
      yThickListe = false
    }
    this.objets = []
    // LES AXES
    const ordonneeAxe = Math.max(0, yMin)
    if (xLegendePosition.length === 0) {
      xLegendePosition = [xMax * xUnite + 0.5, 0.5 + ordonneeAxe]
    }
    const axeX = segment(
      xMin * xUnite,
      ordonneeAxe * yUnite,
      xMax * xUnite,
      ordonneeAxe * yUnite,
      axesCouleur,
    )
    axeX.epaisseur = axesEpaisseur
    axeX.styleExtremites = axeXStyle
    const abscisseAxe = Math.max(0, xMin)
    if (yLegendePosition.length === 0) {
      yLegendePosition = [0.5 + abscisseAxe, yMax * yUnite + 0.5]
    }
    const axeY = segment(
      abscisseAxe * xUnite,
      yMin * yUnite,
      abscisseAxe * xUnite,
      yMax * yUnite,
      axesCouleur,
    )
    axeY.epaisseur = axesEpaisseur
    axeY.styleExtremites = axeYStyle
    if (axeXisVisible) this.objets.push(axeX)
    if (axeYisVisible) this.objets.push(axeY)
    // Cache les objets intermédiaires pour ne pas les afficher en double dans mathalea2d.html
    // axeX.isVisible = false
    // axeY.isVisible = false
    // GRILLE PRINCIPALE

    // Les traits horizontaux
    if (grilleY) {
      if (grilleYListe.length === 0) {
        // Ceux qui ne sont pas définis reprennent les valeurs de thick
        if (typeof grilleYMin !== 'number') {
          grilleYMin = yThickMin
        }
        if (typeof grilleYMax !== 'number') {
          grilleYMax = yThickMax
        }
        if (!grilleYDistance) {
          grilleYDistance = yThickDistance
        }
        // On créé la liste avec ces valeurs
        grilleYListe = []
        if (grilleYMin < 0 && grilleYMax > 0) {
          grilleYListe.push(0)
          for (
            let y = grilleYDistance / yUnite;
            y <= Math.max(-grilleYMin, grilleYMax);
            y += grilleYDistance / yUnite
          ) {
            if (y <= grilleYMax) grilleYListe.push(y)
            if (y <= -grilleYMin) grilleYListe.push(-y)
          }
        } else if (grilleYMin >= 0 && grilleYMax > 0) {
          for (
            let y = grilleYMin;
            y <= grilleYMax;
            y += grilleYDistance / yUnite
          ) {
            grilleYListe.push(y)
          }
        } else if (grilleYMin < 0 && grilleYMax <= 0) {
          for (
            let y = grilleYMax;
            y >= grilleYMin;
            y -= grilleYDistance / yUnite
          ) {
            grilleYListe.push(y)
          }
        }
      }
      for (const y of grilleYListe) {
        if (y !== 0 || !axeXisVisible) {
          const traitH = segment(
            xMin * xUnite,
            y * yUnite,
            xMax * xUnite,
            y * yUnite,
            grilleYCouleur,
          )
          //  traitH.isVisible = false // Pourquoi demander la création de ces traits si c'est pour les rendre invisibles ?
          traitH.opacite = grilleYOpacite
          traitH.epaisseur = grilleEpaisseur
          if (grilleY === 'pointilles') {
            traitH.pointilles = 5
          }
          this.objets.push(traitH)
        }
      }
    }
    // Les traits verticaux
    if (grilleX) {
      if (grilleXListe.length === 0) {
        // Ceux qui ne sont pas définis reprennent les valeurs de thick
        if (typeof grilleXMin !== 'number') {
          grilleXMin = xThickMin
        }
        if (typeof grilleXMax !== 'number') {
          grilleXMax = xThickMax
        }
        if (typeof grilleXDistance !== 'number') {
          grilleXDistance = xThickDistance
        }
        // On créé la liste avec ces valeurs
        grilleXListe = []
        if (grilleXMin < 0 && grilleXMax > 0) {
          grilleXListe.push(0)
          for (
            let x = grilleXDistance / xUnite;
            x <= Math.max(-grilleXMin, grilleXMax);
            x += grilleXDistance / xUnite
          ) {
            if (x <= grilleXMax) grilleXListe.push(x)
            if (x <= -grilleXMin) grilleXListe.push(-x)
          }
        } else if (grilleXMin >= 0 && grilleXMax > 0) {
          for (
            let x = grilleXMin;
            x <= grilleXMax;
            x += grilleXDistance / xUnite
          ) {
            grilleXListe.push(x)
          }
        } else if (grilleXMin < 0 && grilleXMax <= 0) {
          for (
            let x = grilleXMax;
            x >= grilleXMin;
            x -= grilleXDistance / xUnite
          ) {
            grilleXListe.push(x)
          }
        }
      }
      for (const x of grilleXListe) {
        if (x !== 0 || !axeYisVisible) {
          const traitV = segment(
            x * xUnite,
            (this.grilleYMin ? this.grilleYMin : yMin) * yUnite,
            x * xUnite,
            (this.grilleYMax ? this.grilleYMax : yMax) * yUnite,
            grilleXCouleur,
          )
          //  traitV.isVisible = false
          traitV.opacite = grilleXOpacite
          traitV.epaisseur = grilleEpaisseur
          if (grilleX === 'pointilles') {
            traitV.pointilles = 5
          }
          this.objets.push(traitV)
        }
      }
    }

    // GRILLE SECONDAIRE

    // Les traits horizontaux
    if (grilleSecondaireY) {
      if (grilleSecondaireYListe.length === 0) {
        // Ceux qui ne sont pas définis reprennent les valeurs de thick
        if (typeof grilleSecondaireYMin !== 'number') {
          grilleSecondaireYMin = yThickMin
        }
        if (typeof grilleSecondaireYMax !== 'number') {
          grilleSecondaireYMax = yThickMax
        }
        if (typeof grilleSecondaireYDistance !== 'number') {
          grilleSecondaireYDistance = yThickDistance / 2
        }
        // On créé la liste avec ces valeurs
        grilleSecondaireYListe = []
        if (grilleSecondaireYMin < 0 && grilleSecondaireYMax > 0) {
          grilleSecondaireYListe.push(0)
          for (
            let y = grilleSecondaireYDistance / yUnite;
            y < Math.max(-grilleSecondaireYMin, grilleSecondaireYMax);
            y += grilleSecondaireYDistance / yUnite
          ) {
            if (y <= grilleSecondaireYMax) grilleSecondaireYListe.push(y)
            if (y <= -grilleSecondaireYMin) grilleSecondaireYListe.push(-y)
          }
        } else if (grilleSecondaireYMin >= 0 && grilleSecondaireYMax > 0) {
          for (
            let y = grilleSecondaireYMin;
            y <= grilleSecondaireYMax;
            y += grilleSecondaireYDistance / yUnite
          ) {
            grilleSecondaireYListe.push(y)
          }
        } else if (grilleSecondaireYMin < 0 && grilleSecondaireYMax <= 0) {
          for (
            let y = grilleSecondaireYMax;
            y >= grilleSecondaireYMin;
            y -= grilleSecondaireYDistance / yUnite
          ) {
            grilleSecondaireYListe.push(y)
          }
        }
      }
      for (const y of grilleSecondaireYListe) {
        const traitH = segment(
          (grilleSecondaireXMin || xMin) * xUnite,
          y * yUnite,
          (grilleSecondaireXMax || xMax) * xUnite,
          y * yUnite,
          grilleSecondaireYCouleur,
        )
        // traitH.isVisible = false
        traitH.opacite = grilleSecondaireYOpacite
        traitH.epaisseur = grilleSecondaireEpaisseur
        if (grilleSecondaireY === 'pointilles') {
          traitH.pointilles = 5
        }
        this.objets.push(traitH)
      }
    }
    // Les traits verticaux
    if (grilleSecondaireX) {
      if (grilleSecondaireXListe.length === 0) {
        // Ceux qui ne sont pas définis reprennent les valeurs de thick
        if (typeof grilleSecondaireXMin !== 'number') {
          grilleSecondaireXMin = xThickMin
        }
        if (typeof grilleSecondaireXMax !== 'number') {
          grilleSecondaireXMax = xThickMax
        }
        if (typeof grilleSecondaireXDistance !== 'number') {
          grilleSecondaireXDistance = xThickDistance / 2
        }
        // On créé la liste avec ces valeurs
        grilleSecondaireXListe = []
        if (grilleSecondaireXMin < 0 && grilleSecondaireXMax > 0) {
          grilleSecondaireXListe.push(0)
          for (
            let x = grilleSecondaireXDistance / xUnite;
            x < Math.max(-grilleSecondaireXMin, grilleSecondaireXMax);
            x += grilleSecondaireXDistance / xUnite
          ) {
            if (x <= grilleSecondaireXMax) grilleSecondaireXListe.push(x)
            if (x <= -grilleSecondaireXMin) grilleSecondaireXListe.push(-x)
          }
        } else if (grilleSecondaireXMin >= 0 && grilleSecondaireXMax > 0) {
          for (
            let x = grilleSecondaireXMin;
            x <= grilleSecondaireXMax;
            x += grilleSecondaireXDistance / xUnite
          ) {
            grilleSecondaireXListe.push(x)
          }
        } else if (grilleSecondaireXMin < 0 && grilleSecondaireXMax <= 0) {
          for (
            let x = grilleSecondaireXMax;
            x >= grilleSecondaireXMin;
            x -= grilleSecondaireXDistance / xUnite
          ) {
            grilleSecondaireXListe.push(x)
          }
        }
      }
      for (const x of grilleSecondaireXListe) {
        const traitV = segment(
          x * xUnite,
          (grilleSecondaireYMin || yMin) * yUnite,
          x * xUnite,
          (grilleSecondaireYMax || yMax) * yUnite,
          grilleSecondaireXCouleur,
        )
        //  traitV.isVisible = false
        traitV.opacite = grilleSecondaireXOpacite
        traitV.epaisseur = grilleSecondaireEpaisseur
        if (grilleSecondaireX === 'pointilles') {
          traitV.pointilles = 5
        }
        this.objets.push(traitV)
      }
    }
    // LES THICKS
    if (axeXisVisible) {
      if (
        (typeof xThickListe === 'boolean' && xThickListe) ||
        (Array.isArray(xThickListe) && xThickListe.length === 0)
      ) {
        xThickListe = []
        if (xThickMin < 0 && xThickMax > 0) {
          xThickListe.push(0)
          for (
            let x = xThickDistance;
            x < Math.max(-xThickMin, xThickMax);
            x += xThickDistance
          ) {
            if (x <= xThickMax) xThickListe.push(x)
            if (x <= -xThickMin) xThickListe.push(-x)
          }
        } else if (xThickMin >= 0 && xThickMax > 0) {
          for (let x = xThickMin; x <= xThickMax; x += xThickDistance) {
            xThickListe.push(x)
          }
        } else if (xThickMin < 0 && xThickMax <= 0) {
          for (let x = xThickMax; x >= xThickMin; x -= xThickDistance) {
            xThickListe.push(x)
          }
        }
      } else if (typeof xThickListe === 'boolean') xThickListe = []

      for (const x of xThickListe) {
        const thick = segment(
          x * xUnite,
          ordonneeAxe * yUnite - thickHauteur,
          x * xUnite,
          ordonneeAxe * yUnite + thickHauteur,
          thickCouleur,
        )
        // thick.isVisible = false
        thick.epaisseur = thickEpaisseur
        this.objets.push(thick)
      }
    }
    if (axeYisVisible) {
      if (
        (typeof yThickListe === 'boolean' && yThickListe) ||
        (Array.isArray(yThickListe) && yThickListe.length === 0)
      ) {
        yThickListe = []
        if (yThickMin < 0 && yThickMax > 0) {
          yThickListe.push(0)
          for (
            let y = yThickDistance;
            y < Math.max(-yThickMin, yThickMax);
            y += yThickDistance
          ) {
            if (y <= yThickMax) yThickListe.push(y)
            if (y <= -yThickMin) yThickListe.push(-y)
          }
        } else if (yThickMin >= 0 && yThickMax > 0) {
          for (let y = yThickMin; y <= yThickMax; y += yThickDistance) {
            yThickListe.push(y)
          }
        } else if (yThickMin < 0 && yThickMax <= 0) {
          for (let y = yThickMax; y >= yThickMin; y -= yThickDistance) {
            yThickListe.push(y)
          }
        }
      } else if (typeof yThickListe === 'boolean') yThickListe = []
      for (const y of yThickListe) {
        const thick = segment(
          abscisseAxe * xUnite - thickHauteur,
          y * yUnite,
          abscisseAxe * xUnite + thickHauteur,
          y * yUnite,
          thickCouleur,
        )
        // thick.isVisible = false
        thick.epaisseur = thickEpaisseur
        this.objets.push(thick)
      }
    }
    // LES LABELS
    if (labelsXareVisible) {
      if (
        (typeof xLabelListe === 'boolean' && xLabelListe) ||
        (Array.isArray(xLabelListe) && xLabelListe.length === 0)
      ) {
        xLabelListe = rangeMinMax(0, xLabelMax, [0], xLabelDistance).concat(
          rangeMinMax(0, -xLabelMin, [0], xLabelDistance).map((el) => -el),
        )
      } else if (typeof xLabelListe === 'boolean') xLabelListe = []
      for (const x of xLabelListe) {
        let l
        if (typeof x === 'number') {
          if (x >= xMin && x <= xMax) {
            l = latex2d(
              `${stringNombre(x, precisionLabelX)}`,
              x * xUnite,
              ordonneeAxe * yUnite - xLabelEcart + 0.1,
              // { letterSize: 'scriptsize', opacity: 0.8, color: 'black' }, // EE : Commenté car sinon taille abscisse !== taille ordonnée
              { letterSize: 'scriptsize', opacity: 0.8, color: 'black' },
            )
            //   l.isVisible = false
            this.objets.push(l)
          }
        } else {
          if (x.valeur <= xMax && x.valeur >= xMin) {
            l = latex2d(
              x.texte,
              x.valeur * xUnite,
              ordonneeAxe * yUnite - xLabelEcart + 0.1,
              // { letterSize: 'footnotesize', color: 'black', opacity: 0.8 },  // EE : Commenté car sinon taille abscisse !== taille ordonnée
              { letterSize: 'scriptsize', color: 'black', opacity: 0.8 },
            )
            //  l.isVisible = false
            this.objets.push(l)
          }
        }
      }
    }
    if (labelsYareVisible) {
      if (
        (typeof yLabelListe === 'boolean' && yLabelListe) ||
        (Array.isArray(yLabelListe) && yLabelListe.length === 0)
      ) {
        yLabelListe = rangeMinMax(0, yLabelMax, [0], yLabelDistance).concat(
          rangeMinMax(0, -yLabelMin, [0], yLabelDistance).map((el) => -el),
        )
      } else if (typeof yLabelListe === 'boolean') yLabelListe = []
      for (const y of yLabelListe) {
        let l
        if (typeof y === 'number') {
          if (y >= yMin && y <= yMax) {
            l = latex2d(
              `${stringNombre(y, precisionLabelY)}`,
              abscisseAxe * xUnite - yLabelEcart,
              y * yUnite + 0.1,
              // { letterSize: 'small', opacity: 0.8, color: 'black' },
              { letterSize: 'scriptsize', opacity: 0.8, color: 'black' },
            )
            //  l.isVisible = false
            this.objets.push(l)
          }
        } else {
          if (y.valeur >= yMin && y.valeur <= yMax) {
            l = latex2d(
              y.texte,
              abscisseAxe * xUnite - yLabelEcart,
              y.valeur * yUnite + 0.1,
              /// { letterSize: 'small', opacity: 0.8, color: 'black' },
              { letterSize: 'scriptsize', opacity: 0.8, color: 'black' },
            )
            //     l.isVisible = false
            this.objets.push(l)
          }
        }
      }
    }
    // LES LÉGENDES
    if (xLegende.length > 0) {
      this.objets.push(
        texteParPosition(
          xLegende,
          xLegendePosition[0],
          xLegendePosition[1],
          0,
          'black',
          1,
          'droite',
        ),
      )
    }
    if (yLegende.length > 0) {
      this.objets.push(
        texteParPosition(
          yLegende,
          yLegendePosition[0],
          yLegendePosition[1],
          0,
          'black',
          1,
          'droite',
        ),
      )
    }
    const bords = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bords.xmin, bords.ymin, bords.xmax, bords.ymax]
    // pour pouvoir ajouter des objets à ce Repere après l'avoir créé.
  }

  addObjet(objet: ObjetMathalea2D) {
    if (!(objet instanceof ObjetMathalea2D)) return
    this.objets?.concat(objet)
  }

  // Une méthode pour passer ce qu'il fait à mathalea2d()
  trace() {
    return this.objets
  }

  // LES SORTIES TiKZ et SVG
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
 *
 * @param {object} params
 * @return {Repere}
 * @author Rémi Angot
 */
export function repere({
  xUnite = 1,
  yUnite = 1,
  xMin = -10,
  xMax = 10,
  yMin = -10,
  yMax = 10,
  axeXisVisible = true,
  axeYisVisible = true,
  axesEpaisseur = 1.2,
  axesCouleur = 'black',
  axeXStyle = '->',
  axeYStyle = '->',
  thickEpaisseur = 1.2,
  thickHauteur = 0.13,
  thickCouleur = axesCouleur,
  xThickDistance = 1,
  xThickListe = [],
  xThickMin = xMin + xThickDistance,
  xThickMax = xMax - xThickDistance,
  yThickDistance = 1,
  yThickListe = [],
  yThickMin = yMin + yThickDistance,
  yThickMax = yMax - yThickDistance,
  labelsXareVisible = true,
  labelsYareVisible = true,
  xLabelDistance = xThickDistance,
  xLabelListe = [],
  xLabelMin = xThickMin,
  xLabelMax = xThickMax,
  yLabelDistance = yThickDistance,
  yLabelListe = [],
  yLabelMin = yThickMin,
  yLabelMax = yThickMax,
  precisionLabelX = 1,
  precisionLabelY = 1,
  xLabelEcart = 0.5,
  yLabelEcart = 0.5,
  xLegende = '',
  xLegendePosition = [],
  yLegende = '',
  yLegendePosition = [],
  grille = true,
  grilleDistance = 1,
  grilleCouleur = 'black',
  grilleOpacite = 0.4,
  grilleEpaisseur = 1,
  grilleSecondaire = false,
  grilleSecondaireDistance = 1,
  grilleSecondaireCouleur = 'gray',
  grilleSecondaireOpacite = 0.3,
  grilleSecondaireEpaisseur = 1,
  grilleX = grille,
  grilleXListe = [],
  grilleXDistance = grilleDistance,
  grilleXMin = xMin,
  grilleXMax = xMax,
  grilleXCouleur = grilleCouleur,
  grilleXOpacite = grilleOpacite,
  grilleY = grille,
  grilleYListe = [],
  grilleYDistance = grilleDistance,
  grilleYMin = yMin,
  grilleYMax = yMax,
  grilleYCouleur = grilleCouleur,
  grilleYOpacite = grilleOpacite,
  grilleSecondaireX = grilleSecondaire,
  grilleSecondaireXListe = [],
  grilleSecondaireXDistance = grilleSecondaireDistance,
  grilleSecondaireXMin = xMin,
  grilleSecondaireXMax = xMax,
  grilleSecondaireXCouleur = grilleSecondaireCouleur,
  grilleSecondaireXOpacite = grilleSecondaireOpacite,
  grilleSecondaireY = grilleSecondaire,
  grilleSecondaireYListe = [],
  grilleSecondaireYDistance = grilleSecondaireDistance,
  grilleSecondaireYMin = yMin,
  grilleSecondaireYMax = yMax,
  grilleSecondaireYCouleur = grilleSecondaireCouleur,
  grilleSecondaireYOpacite = grilleSecondaireOpacite,
}: {
  xUnite?: number
  yUnite?: number
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  axeXisVisible?: boolean
  axeYisVisible?: boolean
  axesEpaisseur?: number
  axesCouleur?: string
  axeXStyle?: string
  axeYStyle?: string
  thickEpaisseur?: number
  thickHauteur?: number
  thickCouleur?: string
  xThickDistance?: number
  xThickListe?: number[] | boolean
  xThickMin?: number
  xThickMax?: number
  yThickDistance?: number
  yThickListe?: number[] | boolean
  yThickMin?: number
  yThickMax?: number
  labelsXareVisible?: boolean
  labelsYareVisible?: boolean
  xLabelDistance?: number
  xLabelListe?: boolean | (number | { valeur: number; texte: string })[]
  xLabelMin?: number
  xLabelMax?: number
  yLabelDistance?: number
  yLabelListe?: boolean | (number | { valeur: number; texte: string })[]
  yLabelMin?: number
  yLabelMax?: number
  precisionLabelX?: number
  precisionLabelY?: number
  xLabelEcart?: number
  yLabelEcart?: number
  xLegende?: string
  xLegendePosition?: number[]
  yLegende?: string
  yLegendePosition?: number[]
  grille?: boolean | 'pointilles'
  grilleDistance?: number
  grilleCouleur?: string
  grilleOpacite?: number
  grilleEpaisseur?: number
  grilleSecondaire?: boolean
  grilleSecondaireDistance?: number
  grilleSecondaireCouleur?: string
  grilleSecondaireOpacite?: number
  grilleSecondaireEpaisseur?: number
  grilleX?: boolean | 'pointilles'
  grilleXListe?: number[]
  grilleXDistance?: number
  grilleXMin?: number
  grilleXMax?: number
  grilleXCouleur?: string
  grilleXOpacite?: number
  grilleY?: boolean | 'pointilles'
  grilleYListe?: number[]
  grilleYDistance?: number
  grilleYMin?: number
  grilleYMax?: number
  grilleYCouleur?: string
  grilleYOpacite?: number
  grilleSecondaireX?: boolean | 'pointilles'
  grilleSecondaireXListe?: number[]
  grilleSecondaireXDistance?: number
  grilleSecondaireXMin?: number
  grilleSecondaireXMax?: number
  grilleSecondaireXCouleur?: string
  grilleSecondaireXOpacite?: number
  grilleSecondaireY?: boolean | 'pointilles'
  grilleSecondaireYListe?: number[]
  grilleSecondaireYDistance?: number
  grilleSecondaireYMin?: number
  grilleSecondaireYMax?: number
  grilleSecondaireYCouleur?: string
  grilleSecondaireYOpacite?: number
}) {
  return new Repere({
    xUnite,
    yUnite,
    xMin,
    xMax,
    yMin,
    yMax,
    axeXisVisible,
    axeYisVisible,
    axesEpaisseur,
    axesCouleur,
    axeXStyle,
    axeYStyle,
    thickEpaisseur,
    thickHauteur,
    thickCouleur,
    xThickDistance,
    xThickListe,
    xThickMin,
    xThickMax,
    yThickDistance,
    yThickListe,
    yThickMin,
    yThickMax,
    labelsXareVisible,
    labelsYareVisible,
    xLabelDistance,
    xLabelListe,
    xLabelMin,
    xLabelMax,
    yLabelDistance,
    yLabelListe,
    yLabelMin,
    yLabelMax,
    precisionLabelX,
    precisionLabelY,
    xLabelEcart,
    yLabelEcart,
    xLegende,
    xLegendePosition,
    yLegende,
    yLegendePosition,
    grille,
    grilleDistance,
    grilleCouleur,
    grilleOpacite,
    grilleEpaisseur,
    grilleSecondaire,
    grilleSecondaireDistance,
    grilleSecondaireCouleur,
    grilleSecondaireOpacite,
    grilleSecondaireEpaisseur,
    grilleX,
    grilleXListe,
    grilleXDistance,
    grilleXMin,
    grilleXMax,
    grilleXCouleur,
    grilleXOpacite,
    grilleY,
    grilleYListe,
    grilleYDistance,
    grilleYMin,
    grilleYMax,
    grilleYCouleur,
    grilleYOpacite,
    grilleSecondaireX,
    grilleSecondaireXListe,
    grilleSecondaireXDistance,
    grilleSecondaireXMin,
    grilleSecondaireXMax,
    grilleSecondaireXCouleur,
    grilleSecondaireXOpacite,
    grilleSecondaireY,
    grilleSecondaireYListe,
    grilleSecondaireYDistance,
    grilleSecondaireYMin,
    grilleSecondaireYMax,
    grilleSecondaireYCouleur,
    grilleSecondaireYOpacite,
  })
}

/**
 * Place un point dans un repère (en récupérant xUnite et yUnite d'un objet repère)
 *
 *
 * @param {number} x
 * @param {number} y
 * @param {object} repere
 * @author Rémi Angot
 */
export function pointDansRepere(
  x: number,
  y: number,
  repere = { xUnite: 1, yUnite: 1 },
) {
  return point(x * repere.xUnite, y * repere.yUnite)
}
