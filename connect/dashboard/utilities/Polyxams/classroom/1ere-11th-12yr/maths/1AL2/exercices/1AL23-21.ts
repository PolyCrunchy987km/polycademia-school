import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import Exercice from '../Exercice'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'

export const interactifReady = true
export const interactifType = 'mathLive'
export const titre = 'Résoudre une équation du second degré (égale à 0)'
export const dateDeModifImportante = '17/12/2024'

/**
 * Calcul de discriminant pour identifier la forme graphique associée (0 solution dans IR, 1 ou 2)
 * @author Rémi Angot, Olivier Mimeau (ajout d'un cas)
 *
 */
export const uuid = 'cf78f'

export const refs = {
  'fr-fr': ['1AL23-21'],
  'fr-ch': ['11FA10-10'],
}
export default class ResoudreEquationDegre2Entiers extends Exercice {
  constructor() {
    super()

    this.consigne = 'Résoudre dans $\\mathbb{R}$ les équations suivantes.'
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre dans $\\mathbb{R}$ les équations suivantes.'
        : "Résoudre dans $\\mathbb{R}$ l'équation suivante."
    const listeTypeDeQuestions = combinaisonListes(
      ['solutionsEntieres', 'solutionUnique', 'pasDeSolution'],
      this.nbQuestions,
    )

    for (
      let i = 0, texte, texteCorr, a, b, c, x1, x2, y1, k, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let answer = ''
      if (listeTypeDeQuestions[i] === 'solutionsEntieres') {
        // k(x-x1)(x-x2)
        x1 = randint(-5, 2, [0])
        x2 = randint(x1 + 1, 5, [0, -x1])
        k = randint(-4, 4, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2
        // Calcul des racines selon les formules quadratiques
        // const delta = b * b - 4 * a * c
        // const racine1 = (-b - Math.sqrt(delta)) / (2 * a)
        // const racine2 = (-b + Math.sqrt(delta)) / (2 * a)
        texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=0$`

        texteCorr = `$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
        texteCorr +=
          "<br>$\\Delta>0$ donc l'équation admet deux solutions : $x_1 = \\dfrac{-b-\\sqrt{\\Delta}}{2a}$ et $x_2 = \\dfrac{-b+\\sqrt{\\Delta}}{2a}$"
        const racine1 = a > 0 ? x1 : x2
        const racine2 = a > 0 ? x2 : x1
        texteCorr += `<br>$x_1 =\\dfrac{${-b}-\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine1}$`
        texteCorr += `<br>$x_2 =\\dfrac{${-b}+\\sqrt{${b * b - 4 * a * c}}}{${2 * a}}=${racine2}$`
        texteCorr += `<br>L'ensemble des solutions de cette équation est : $\\mathcal{S}=${miseEnEvidence(`\\left\\{${x1} ; ${x2}\\right\\}`)}$.`
        answer = `\\{${x1};${x2}\\}`
      } else if (listeTypeDeQuestions[i] === 'solutionUnique') {
        // k(x-x1)(x-x1)
        x1 = randint(-5, 5, [0])
        k = randint(-4, 4, [0])
        a = k
        b = -k * 2 * x1
        c = k * x1 * x1
        texte = `$${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}=0$`

        texteCorr = `$\\Delta = ${ecritureParentheseSiNegatif(b)}^2-4\\times${ecritureParentheseSiNegatif(a)}\\times${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}$`
        texteCorr +=
          "<br>$\\Delta=0$ donc l'équation admet une unique solution : $x_1 = \\dfrac{-b}{2a}$"
        texteCorr += `<br>$x_1 =\\dfrac{${-b}}{${2 * a}}=${x1}$`
        texteCorr += `<br>L'ensemble des solutions de cette équation est : $\\mathcal{S}=${miseEnEvidence(`\\left\\{${x1}\\right\\}`)}$.`
        answer = `\\{${x1}\\}`
      } else {
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
        texteCorr += "<br>$\\Delta<0$ donc l'équation n'admet pas de solution."
        texteCorr += `<br>$\\mathcal{S}=${miseEnEvidence('\\emptyset')}$`
        answer = '\\emptyset'
      }

      if (this.interactif) {
        handleAnswers(this, i, {
          reponse: { value: answer, options: { ensembleDeNombres: true } },
        })
        texte += '<br>'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierEnsemble,
          { texteAvant: '$S=$' },
        )
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
