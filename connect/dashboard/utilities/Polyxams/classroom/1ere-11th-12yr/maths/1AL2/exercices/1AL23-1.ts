import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { setReponse } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const interactifType = 'mathLive'
export const titre =
  "Déterminer la forme canonique d'un polynôme du second degré"

/**
 * Déterminer la forme canonique d'un polynôme du second degré
 * @author Stéphane Guyon
 */
export const uuid = '60504'

export const refs = {
  'fr-fr': ['1AL23-1'],
  'fr-ch': ['1mF3-2'],
}
export default class Formacanonique extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 3
    this.besoinFormulaireCaseACocher = ['Le coefficient de $x^2$ est 1', false]
  }

  nouvelleVersion() {
    this.consigne =
      'Déterminer la forme canonique ' +
      (this.nbQuestions === 1 ? 'du polynôme' : 'de chacun des polynômes') +
      ' $P$, défini pour tout $x \\in \\mathbb{R}$ par : '
    if (this.interactif) {
      // this.consigne += '<br> '
    }

    for (
      let i = 0, texte, texteCorr, a, b, c, alpha, beta, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // k(x-x1)(x-x2)
      alpha = randint(-5, 5, [0])
      beta = randint(-5, 5, [0])
      a = this.sup ? 1 : randint(-4, 4, [0])
      b = -2 * a * alpha
      c = a * alpha * alpha + beta
      while (c === 0) {
        alpha = randint(-5, 5, [0])
        beta = randint(-5, 5, [0])
        a = this.sup ? 1 : randint(-4, 4, [0])
        b = -2 * a * alpha
        c = a * alpha * alpha + beta
      }

      texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`
      texteCorr =
        "On sait que si le polynôme, sous forme développée, s'écrit $P(x)=ax^2+bx+c$, "
      texteCorr +=
        'alors sa forme canonique est de la forme $P(x)=a(x-\\alpha)^2+\\beta$,'

      texteCorr += '<br>avec $\\alpha=\\dfrac{-b}{2a}$ et $\\beta=P(\\alpha).$'
      texteCorr += `<br>Avec l'énoncé : $a=${a}$ et $b=${b}$, on en déduit que $\\alpha=${alpha}$.`
      texteCorr += `<br>On calcule alors $\\beta=P(${alpha})$, et on obtient au final que $\\beta=${beta}$.`
      texteCorr += `<br>d'où, $P(x)=${a}\\big(x-${ecritureParentheseSiNegatif(alpha)}\\big)^2+${ecritureParentheseSiNegatif(beta)}$`
      texteCorr += '<br>Au final, $P(x)='
      let texteCorrSolution = ''
      if (a === 1 || a === -1) {
        if (a === -1) {
          texteCorrSolution += '-'
        }
      } else {
        texteCorrSolution += `${a}`
      }
      texteCorrSolution += `(x ${ecritureAlgebrique(-alpha)})^2`
      if (beta !== 0) {
        texteCorrSolution += `${ecritureAlgebrique(beta)}`
      }
      texteCorr += `${miseEnEvidence(texteCorrSolution)}$`
      if (beta > 0) {
        if (alpha > 0) {
          setReponse(this, i, [`${a}(x-${alpha})^2+${beta}`])
        } else {
          setReponse(this, i, [`${a}(x+${-alpha})^2+${beta}`])
        }
      }
      if (beta < 0) {
        if (alpha > 0) {
          setReponse(this, i, [`${a}(x-${alpha})^2${beta}`])
        } else {
          setReponse(this, i, [`${a}(x+${-alpha})^2${beta}`])
        }
      }
      if (beta === 0) {
        if (alpha > 0) {
          setReponse(this, i, [`${a}(x-${alpha})^2`])
        } else {
          setReponse(this, i, [`${a}(x+${-alpha})^2}`])
        }
      }

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
        texteAvant: `$${sp()}=${sp()}$`,
      })
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
