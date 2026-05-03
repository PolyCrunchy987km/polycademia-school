import { courbe } from '../../lib/2d/Courbe'
import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { ajouterAide } from '../../lib/outils/enrichissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer le discriminant  d'une équation du second degré"

/**
 * Calculer le discriminant d'une équation
 * @author Rémi Angot

*/
export const uuid = 'feb39'

export const refs = {
  'fr-fr': ['1AL20-11'],
  'fr-ch': ['11FA10-7'],
}
export default class CalculDiscriminant extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Pour chaque équation, calculer le discriminant et déterminer le nombre de solutions de cette équation dans $\\mathbb{R}$.'
    this.nbQuestions = 6
    this.nbCols = 2
    this.nbColsCorr = 2
    if (context.isHtml) {
      this.spacingCorr = 2
    }
  }

  nouvelleVersion(numeroExercice: number) {
    const listeTypesEquations = combinaisonListes(
      ['0solution', '1solution', '2solutions'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let aNbPointsIntersection
      let a: number, b: number, c: number, k: number, x1: number, y1: number
      let texte = ''
      let texteCorr = ''
      switch (listeTypesEquations[i]) {
        case '0solution':
          aNbPointsIntersection = "n'a aucun point d'intersection"
          k = randint(1, 5)
          x1 = randint(-3, 3, [0])
          y1 = randint(1, 5)
          if (choice(['+', '-']) === '+') {
            // k(x-x1)^2 + y1 avec k>0 et y1>0
            a = k
            b = -2 * k * x1
            c = k * x1 * x1 + y1
          } else {
            // -k(x-x1)^2 -y1 avec k>0 et y1>0
            a = -k
            b = 2 * k * x1
            c = -k * x1 * x1 - y1
          }
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=0$`
          if (b === 0) {
            texte = `$${rienSi1(a)}x^2${ecritureAlgebrique(c)}=0$`
          }
          texteCorr = `$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr += `<br>$\\Delta<0$ donc l'équation ${texteEnCouleurEtGras("n'admet pas de solution")}.`
          texteCorr += '<br>$\\mathcal{S}=\\emptyset$.'
          break
        case '1solution': // k(x-x1)^2
          aNbPointsIntersection = "n'a qu'un seul point d'intersection"
          k = randint(-5, 5, [0])
          x1 = randint(-5, 5, [0])
          a = k
          b = -2 * k * x1
          c = k * x1 * x1
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=0$`
          if (b === 0) {
            texte = `$${rienSi1(a)}x^2${ecritureAlgebrique(c)}=0$`
          }
          if (c === 0) {
            texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x=0$`
          }
          texteCorr = `$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr += `<br>$\\Delta=0$ donc l'équation admet ${texteEnCouleurEtGras('une unique solution')}.`
          break
        case '2solutions': // k(x-x1)^2
        default:
          aNbPointsIntersection = "a deux points d'intersection"
          k = randint(1, 5)
          x1 = randint(-3, 3)
          y1 = randint(1, 5)
          if (choice(['+', '-']) === '+') {
            // k(x-x1)^2 + y1 avec k>0 et y1<0
            y1 *= -1
            a = k
            b = -2 * k * x1
            c = k * x1 * x1 + y1
          } else {
            // -k(x-x1)^2 -y1 avec k>0 et y1>0
            a = -k
            b = 2 * k * x1
            c = -k * x1 * x1 + y1
          }
          texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=0$`
          if (b === 0) {
            texte = `$${rienSi1(a)}x^2${ecritureAlgebrique(c)}=0$`
          }
          if (c === 0) {
            texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x=0$`
          }
          texteCorr = `$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
          texteCorr += `<br>$\\Delta>0$ donc l'équation admet ${texteEnCouleurEtGras('deux solutions')}.`
          break
      }
      if (context.isHtml) {
        const f = (x: number) => a * x ** 2 + b * x + c
        const s = segment(point(-10, 0), point(10, 0), 'red')
        s.epaisseur = 3
        const r = repere({ xLabelListe: [], yLabelListe: [] })
        const graphique = courbe(f, { repere: r, color: 'blue' })
        let correctionComplementaire = `Notons $f : x \\mapsto ${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.`
        correctionComplementaire += `<br>On observe que la courbe représentative de $f$ ${aNbPointsIntersection} avec l'axe des abscisses.`
        correctionComplementaire += '<br>'
        correctionComplementaire += mathalea2d(
          { xmin: -10.1, ymin: -10.1, xmax: 10.1, ymax: 10.1, pixelsParCm: 15 },
          graphique,
          r,
          s,
        )

        texteCorr += ajouterAide(correctionComplementaire, {
          texteAvant: 'Complément graphique',
          titreAide: 'Complément graphique',
        })
      }
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
