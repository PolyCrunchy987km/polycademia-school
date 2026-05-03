import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre =
  'Factoriser un polynôme du second degré avec racine évidente'
export const interactifReady = true
export const interactifType = 'mathlive'
export const dateDePublication = '13/01/2026'

/**
 *
 * @author Jean-claude Lhote
 */
export const uuid = 'a8e1c'

export const refs = {
  'fr-fr': ['1AL21-42'],
  'fr-ch': [],
}
export default class ResoudreEquationDegre2Bis extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 3
    this.comment =
      "Une fois sur 2, il y a deux racines entières, une fois sur 4 il y a une identité remarquable et une fois sur 4, 0 est l'une des racines."
  }

  nouvelleVersion() {
    this.consigne =
      'Factoriser, si cela est possible, ' +
      (this.nbQuestions !== 1 ? 'chaque' : 'le') +
      ' polynôme $P$ suivant défini pour tout $x$ de $\\mathbb R$ par : '
    const listeTypeDeQuestions = combinaisonListes(
      [
        'solutionsEntieres',
        'solutionsEntieres',
        'identiteRemarquable',
        'facteurCommun',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number
      let c: number
      let x1: number
      let x2: number
      let k: number
      let trinome: Trinome
      if (listeTypeDeQuestions[i] === 'solutionsEntieres') {
        // k(x-x1)(x-x2)
        x1 = randint(-5, 5, [0])
        x2 = randint(-5, 5, [0, -x1, x1])
        ;[x1, x2] = [x1, x2].sort((a, b) => Math.abs(a) - Math.abs(b))
        k = randint(-3, 3, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2

        trinome = new Trinome(a, b, c)

        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$.<br>`
        texteCorr += `On reconnaît un polynôme du second degré avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
          On cherche une racine évidente :<br>
          $x_1=${x1}$ car $P(${x1})=${
            Math.abs(a) === 1 ? `${a === 1 ? '' : '-'}` : `${a}\\times`
          }${ecritureParentheseSiNegatif(x1)}^2${
            Math.abs(b) === 1
              ? `${b === 1 ? '' : '-'}`
              : `${ecritureAlgebrique(b)}\\times`
          } ${ecritureParentheseSiNegatif(x1)}${ecritureAlgebrique(c)}=0$.<br>
          On utilise la propriété du produit des racines pour trouver l'autre racine :<br>
          on sait que $x_1\\times x_2=\\dfrac{c}{a}$ donc $x_2=\\dfrac{${c}}{${a}\\times ${ecritureParentheseSiNegatif(x1)}}=${x2}$.<br>
          On peut donc factoriser le polynôme sous la forme : $P(x)=a(x-x_1)(x-x_2)$.`
        texteCorr += `<br>$P(x)=${miseEnEvidence(trinome.texFormeFactorisee)}$`
        handleAnswers(this, i, {
          reponse: {
            value: trinome.texFormeFactorisee,
            options: { factorisation: true },
          },
        })
      } else if (listeTypeDeQuestions[i] === 'facteurCommun') {
        // kx(x-x2)
        x2 = randint(-5, 5, [0])
        k = randint(-3, 3, [0])
        a = k
        b = -k * x2
        c = 0

        trinome = new Trinome(a, b, c)

        texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x$.<br>`
        texteCorr += `On reconnaît un polynôme du second degré avec $a=${a}$, $b=${b}$ et $c=0$.<br>
          On peut voir que $P$ admet $x$ comme facteur commun car chaque terme de $P(x)$ contient un facteur $x$.<br>`
        texteCorr += `On peut donc factoriser le polynôme sous la forme : $P(x)=ax(x + \\dfrac{b}{a})$.<br>`
        texteCorr += `$P(x)=${miseEnEvidence(trinome.texFormeFactorisee)}$`
        handleAnswers(this, i, {
          reponse: {
            value: trinome.texFormeFactorisee,
            options: { factorisation: true },
          },
        })
      } else {
        // k(x-x1)(x-x1)
        x1 = randint(-5, 5, [0])
        x2 = choice([x1, -x1])
        k = randint(-3, 3, [0])
        a = k
        b = -k * x1 - k * x2
        c = k * x1 * x2

        trinome = new Trinome(a, b, c)

        texte = `$P(x)=${rienSi1(a)}x^2${
          b === 0 ? '' : `${ecritureAlgebriqueSauf1(b)}x`
        }
        ${ecritureAlgebrique(c)}$`

        texteCorr = `On a $P$ le polynôme défini pour tout $x$ de $\\mathbb R$ par $P(x)=${rienSi1(a)}x^2${b === 0 ? '' : `${ecritureAlgebriqueSauf1(b)}x`}${ecritureAlgebrique(c)}$.<br>`
        texteCorr += `On peut commencer par factoriser $${k}$.<br>
        $P(x)=${k}(x^2${x1 === x2 ? `${ecritureAlgebriqueSauf1(-x1 - x2)}x` : ''}${ecritureAlgebrique(x1 * x2)})$.<br>
        On reconnaît une identité remarquable : ${
          x1 === x2
            ? `$x^2${ecritureAlgebriqueSauf1(-2 * x1)}x${ecritureAlgebrique(x1 * x1)}=(x ${ecritureAlgebrique(-x1)})^2$.<br>`
            : `$x^2-${Math.abs(x1)}^2=(x${ecritureAlgebrique(x1)})(x${ecritureAlgebrique(-x1)})$.<br>`
        }
        Donc $P(x)=${
          x1 === x2
            ? miseEnEvidence(`${k}(x ${ecritureAlgebrique(-x1)})^2`)
            : miseEnEvidence(
                `${k}(x ${ecritureAlgebrique(-x1)})(x ${ecritureAlgebrique(-x2)})`,
              )
        }$.`
      }
      texte +=
        '<br>' +
        ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecX, {
          texteAvant: '$P(x)=$',
        })
      handleAnswers(this, i, {
        reponse: {
          value: trinome.texFormeFactorisee,
          options: { factorisation: true },
        },
      })
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
    document.addEventListener('exercicesAffiches', () => {
      for (let i = 0; i < this.nbQuestions; i++) {
        const question = document.getElementById(
          `exercice${this.numeroExercice}Q${i}`,
        )
        if (question?.querySelector('button')) continue
        const feedback = document.getElementById(
          `resultatCheckEx${this.numeroExercice}Q${i}`,
        )
        if (feedback && question) {
          const button = document.createElement('button')
          button.classList.add(
            'flex-inline',
            'px-6',
            'py-2.5',
            'ml-6',
            'bg-coopmaths-action',
            'dark:bg-coopmathsdark-action',
            'text-coopmaths-canvas',
            'dark:text-coopmathsdark-canvas',
            'font-medium',
            'text-xs',
            'leading-tight',
            'uppercase',
            'rounded',
            'shadow-md',
            'transform',
            'hover:bg-coopmaths-action-lightest',
            'dark:hover:bg-coopmathsdark-action-lightest',
            'hover:shadow-lg',
            'focus:bg-coopmaths-action-lightest',
            'dark:focus:bg-coopmathsdark-action-lightest',
            'focus:shadow-lg',
            'focus:outline-none',
            'focus:ring-0',
            'active:bg-coopmaths-action-lightest',
            'dark:active:bg-coopmathsdark-action-lightest',
            'active:shadow-lg',
            'transition',
            'duration-150',
            'ease-in-out',
          )
          button.textContent = 'Pas factorisable'
          question.insertBefore(button, feedback.nextSibling)
          button.addEventListener('click', () => {
            const mathfield = document.getElementById(
              `champTexteEx${this.numeroExercice}Q${i}`,
            ) as MathfieldElement
            if (mathfield) {
              mathfield.setValue('\\text{Pas factorisable}')
            }
          })
        }
      }
    })
  }
}
