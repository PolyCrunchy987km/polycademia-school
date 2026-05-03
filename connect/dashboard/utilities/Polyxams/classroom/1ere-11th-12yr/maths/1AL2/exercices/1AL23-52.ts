import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { tableauSignesFonction } from '../../lib/mathFonctions/etudeFonction'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import EquationSecondDegre from '../../modules/EquationSecondDegre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer une étude complète de paraboles avec les zéros de la fonction'
export const interactifReady = false

export const dateDePublication = '25/11/2024'

/**
 * Sommet, forme canonique, points d'intersection avec l'axe des abscisses, points d'intersection avec l'axe des ordonnées et zéros de la fonction associée à une parabole
 * @author Nathan Scheinmann, à partir de 1AL23-51 de Rémi Angot
 */
export const uuid = '5ea23'
export const refs = {
  'fr-fr': ['1AL23-52'],
  'fr-ch': ['1mF3-3'],
}
export default class EtudeParabole extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const a = new FractionEtendue(randint(-4, 4, [-1, 0, 1]), 1)
    // x1 + x2 doit être pair pour n'avoir que des nombres entiers dans les différentes formes
    let s1 = new FractionEtendue(0, 1)
    let s2 = new FractionEtendue(0, 1)
    do {
      s1 = new FractionEtendue(randint(-5, 5, 0), randint(-5, 5, [0, 3, -3]))
      s2 = new FractionEtendue(randint(-5, 5), randint(-5, 5, [0, 3, -3]))
    } while (s1.texFractionSimplifiee === s2.texFractionSimplifiee)
    const p = EquationSecondDegre.aPartirDesSolutions(s1, s2, a, {
      variable: 'x',
      format: 'reduit',
    })
    const pPoly = p.polynomeFormeReduite()
    const pAlpha = p.coefficients[1]
      .oppose()
      .diviseFraction(p.coefficients[0].multiplieEntier(2).simplifie())
    const o = texteParPosition(
      'O',
      -0.3,
      -0.3,
      undefined,
      'black',
      undefined,
      'milieu',
      undefined,
      1,
    )
    this.consigne = `On considère la fonction $f(x)=${p.printToLatexMDG()}$.`
    let question1 = 'Déterminer la forme canonique de $f$.'
    question1 += ' En déduire, les coordonnées du sommet du graphe de $f$.'
    let correction1 = `On cherche la forme canonique de $f(x)=${p.printToLatexMDG()}$ avec $a=${p.coefficients[0].texFractionSimplifiee}$, $b=${p.coefficients[1].texFractionSimplifiee}$ et $c=${p.coefficients[2].texFractionSimplifiee}$.`
    correction1 +=
      '<br><br> On sait que $f(x)=a(x-\\alpha)^2+\\beta$ avec $\\alpha = \\dfrac{-b}{2a}$ et $\\beta=f(\\alpha)$.'
    correction1 += `<br><br> $\\alpha = \\dfrac{-b}{2a}=\\dfrac{${p.coefficients[1].oppose().texFractionSimplifiee}}{${p.coefficients[0].multiplieEntier(2).simplifie().texFractionSimplifiee}}=${pAlpha.texFractionSimplifiee}$`
    correction1 += `<br><br> $\\beta = f(\\alpha) = f\\left(${pAlpha.texFractionSimplifiee} \\right)=${pPoly.evaluer({ x: pAlpha }).texFractionSimplifiee}$`
    correction1 += `<br><br> Ainsi, la forme canonique vaut $f(x) = ${miseEnEvidence(p.formeCanonique())}$.`
    correction1 += `<br><br> Le sommet du graphe de $f$ a donc pour coordonnées $${miseEnEvidence(`\\left(${pAlpha.simplifie().texFractionSimplifiee} \\,;\\, ${pPoly.evaluer({ x: pAlpha }).texFractionSimplifiee}\\right)`)}$.`

    let question2 = 'Déterminer les zéros de la fonction.'
    question2 += `<br><br>${numAlpha(0)} Le graphe de $f$ intersecte-t-il l'axe des abscisses ? Si oui, déterminer les coordonnées de ce(s) point(s) d'intersection.`
    question2 += `<br><br>${numAlpha(1)} En déduire le tableau des signes de la fonction $f$.`

    let correction2 = `On résout l'équation $f(x)=0$, c'est-à-dire $${p.printToLatex()}$ en calculant le discriminant.`
    correction2 += `<br> On a $\\Delta=${p.delta.texFractionSimplifiee}${p.delta.signe === 1 ? '>0' : p.delta.signe === 0 ? '=0' : '<0'}$, donc l'équation admet deux solutions réelles qui correspondent aux zéros de la fonction. Ils valent $z_1=${p.solutionsListeTex[0]}$ et $z_2=${p.solutionsListeTex[1]}$.`
    correction2 += `<br><br> ${numAlpha(0)} Le graphe de $f$ intersecte l'axe des abscisses en deux points de coordonnées $${miseEnEvidence(`\\left(${p.solutionsListeTex[0]}\\,;\\,0\\right)`)}$ et $${miseEnEvidence(`\\left(${p.solutionsListeTex[1]}\\,;\\,0\\right)`)}$.`
    correction2 += `<br><br> ${numAlpha(1)} On en déduit le tableau des signes de $f$ :<br><br> ${tableauSignesFonction(
      p.fonctionEvaluer,
      -100,
      100,
      {
        step: 0.01,
        tolerance: 0.001,
        fractionTex: true,
        substituts: [
          { antVal: -100, antTex: '$-\\infty$', imgTex: ' ', imgVal: 1 },
          { antVal: 100, antTex: '$+\\infty$', imgTex: ' ', imgVal: 1 },
        ],
      },
    )}`
    const question3 =
      "Déterminer les coordonnées du point d'intersection de $f$ avec l'axe des ordonnées."
    let correction3 =
      "On cherche les coordonnées du point d'intersection de $f$ avec l'axe des ordonnées, c'est-à-dire $f(0)$."
    correction3 += `<br> On a $f(0)=${pPoly.evaluer({ x: new FractionEtendue(0, 1) }).texFractionSimplifiee}$. Le point d'intersection de $f$ avec l'axe des ordonnées a donc pour coordonnées $${miseEnEvidence(`\\left(0\\,;\\,${pPoly.evaluer({ x: new FractionEtendue(0, 1) }).texFractionSimplifiee}\\right)`)}$.`
    const question4 =
      'Avec les résultats précédents, esquisser le graphe de $f$.'
    let correction4 = `On a le sommet de la parabole en $S\\left(${pAlpha.simplifie().texFractionSimplifiee} \\,;\\, ${pPoly.evaluer({ x: pAlpha }).texFractionSimplifiee}\\right)$, l'intersection avec l'axe des abscisses en $\\left(${p.solutionsListeTex[0]}\\,;\\,0\\right)$ et $\\left(${p.solutionsListeTex[1]}\\,;\\,0\\right)$ et le point d'intersection avec l'axe des ordonnées en $\\left(0\\,;\\,${pPoly.evaluer({ x: new FractionEtendue(0, 1) }).texFractionSimplifiee}\\right)$. On peut donc esquisser le graphe de $f$ en traçant une parabole passant par ces points.`
    let yminVal = Math.round(
      pPoly.evaluer({ x: pAlpha }).num / pPoly.evaluer({ x: pAlpha }).den - 1,
    )
    let ymaxVal = 5
    if (p.coefficients[0].signe === -1) {
      yminVal = -5
      ymaxVal = Math.round(
        pPoly.evaluer({ x: pAlpha }).num / pPoly.evaluer({ x: pAlpha }).den + 1,
      )
    }
    const r = repere({
      xMin: -10,
      yMin: -10,
      yMax: 10,
      xMax: 10,
      thickHauteur: 0.1,
      xLabelMin: -4,
      xLabelMax: 4,
      yLabelMax: ymaxVal,
      axeXStyle: '->',
      axeYStyle: '->',
    })
    correction4 +=
      '<br><br>' +
      mathalea2d(
        {
          xmin: -5,
          xmax: 5,
          ymin: yminVal,
          ymax: ymaxVal,
          pixelsParCm: 25,
          scale: 0.65,
          style: 'margin: auto',
        },
        r,
        o,
        courbe(p.fonctionEvaluer, { repere: r, color: 'blue', epaisseur: 2 }),
      )
    this.listeQuestions = [question1, question2, question3, question4]
    this.listeCorrections = [correction1, correction2, correction3, correction4]
    listeQuestionsToContenu(this)
  }
}
