import Exercice from '../Exercice'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import { choice } from '../../lib/outils/arrayOutils'
import Trinome from '../../modules/Trinome'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { createList } from '../../lib/format/lists'
export const titre =
  'Résoudre une équation en choisissant la forme la plus appropriée'

export const dateDePublication = '22/09/2024'
export const uuid = '2a6c7'

/**
* Ce model est prévu pour les exercice où le nombre de questions est fixe
* et où on ne demande pas la même chose à toutes les questions
* @author Samuel Rattoray

*/

export const refs = {
  'fr-fr': ['1AL23-24'],
  'fr-ch': ['1mF3-9'],
}

export default class ResolutionEquationDifferentesFormes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
    this.besoinFormulaireCaseACocher = ['Fonction factorisable', true]
    this.sup = true
  }

  nouvelleVersion() {
    if (this.sup) {
      let a: number
      let b: number
      let c: number
      let alpha: number
      let beta: number
      let delta: number
      let R: number
      let x1: number
      let x2: number

      do {
        a = choice([-1, 1]) * randint(1, 5)
        alpha = choice([-1, 1]) * randint(1, 10)
        b = -alpha * 2 * a
        delta = (2 * a * choice([-1, 1]) * randint(1, 10)) ** 2
        c = (b ** 2 - delta) / (4 * a)
        beta = alpha ** 2 * a + b * alpha + c
        x1 = (-b - Math.sqrt(delta)) / (2 * a)
        x2 = (-b + Math.sqrt(delta)) / (2 * a)
        R = a * randint(1, 10) ** 2 + beta
      } while (c === 0 || R === 0 || R === c || beta === 0)

      const trinome = new Trinome(a, b, c)
      this.introduction = 'Voici trois formes possibles de la fonction $f$ :'
      const items = [
        trinome.tex,
        trinome.texFormeFactorisee,
        trinome.texFormeCanonique,
      ].map((s) => `$f(x)=${s}$`)
      const list = createList({
        items,
        style: 'puces',
        classOptions: 'space-y-2 p-4',
      })

      this.introduction += list
      this.introduction +=
        'En choisissant la forme la plus adaptée, résoudre les équations suivantes :'
      this.introduction += '<br><br>'

      const question1 = `$f(x) = ${beta}$`

      let correction1 = `On choisit la forme canonique : $f(x) = ${trinome.texFormeCanonique}$.`
      correction1 += '<br>'
      correction1 += `$f(x) = ${beta}$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $${trinome.texFormeCanonique} = ${beta}$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 = 0$`
      correction1 += '<br>'
      if (a !== 1) {
        correction1 += `$\\iff$ $(x ${ecritureAlgebrique(-alpha)})^2 = 0$`
        correction1 += '<br>'
      }
      correction1 += `$\\iff$ $x ${ecritureAlgebrique(-alpha)} = 0$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $x = ${alpha}$`
      correction1 += '<br>'
      correction1 += `$S =\\left\\{${alpha}\\right\\}$`

      const question2 = '$f(x) = 0$'

      let correction2 = `On choisit la forme factorisée : $f(x) = ${trinome.texFormeFactorisee}$.`
      correction2 += '<br>'
      correction2 += '$f(x) = 0$'
      correction2 += '<br>'
      correction2 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-x2)})(x ${ecritureAlgebrique(-x1)}) = 0$`
      correction2 += '<br>'
      correction2 += `$\\iff$ $x ${ecritureAlgebrique(-x2)} = 0$ ou $x ${ecritureAlgebrique(-x1)} = 0$`
      correction2 += '<br>'
      correction2 += `$\\iff$ $x = ${x2}$ ou $x = ${x1}$`
      correction2 += '<br>'
      correction2 += `$S =\\left\\{${x2};${x1}\\right\\}$`

      const question3 = `$f(x) = ${c}$`

      let correction3 = `On choisit la forme développée : $f(x) = ${trinome.tex}$.`
      correction3 += '<br>'
      correction3 += `$f(x) = ${c}$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $${trinome.tex} = ${c}$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $${rienSi1(a)}x^2 ${ecritureAlgebrique(b)}x = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x(${rienSi1(a)}x ${ecritureAlgebrique(b)}) = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x = 0$ ou $${rienSi1(a)}x ${ecritureAlgebrique(b)} = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x = 0$ ou $${rienSi1(a)}x = ${-b}$`
      correction3 += '<br>'
      if (a !== 1) {
        correction3 += `$\\iff$ $x = 0$ ou $x = ${texNombre(-b / a, 0)}$`
        correction3 += '<br>'
      }
      correction3 += `$S =\\left\\{0;${texNombre(-b / a)}\\right\\}$`

      const question4 = `$f(x) = ${R}$`

      let correction4 = `On choisit la forme canonique : $f(x) = ${trinome.texFormeCanonique}$.`
      correction4 += '<br>'
      correction4 += `$f(x) = ${R}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 ${ecritureAlgebrique(beta)} = ${R}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 = ${R - beta}$`
      correction4 += '<br>'
      if (a !== 1) {
        correction4 += `$\\iff$ $(x ${ecritureAlgebrique(-alpha)})^2 = ${(R - beta) / a}$`
        correction4 += '<br>'
      }
      correction4 += `$\\iff$ $x ${ecritureAlgebrique(-alpha)} = ${-Math.sqrt((R - beta) / a)}$ ou $x ${ecritureAlgebrique(-alpha)} = ${Math.sqrt((R - beta) / a)}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $x = ${alpha - Math.sqrt((R - beta) / a)}$ ou $x = ${alpha + Math.sqrt((R - beta) / a)}$`
      correction4 += '<br>'
      correction4 += `$S =\\left\\{${alpha - Math.sqrt((R - beta) / a)};${alpha + Math.sqrt((R - beta) / a)}\\right\\}$`

      this.listeQuestions.push(question1, question2, question3, question4)
      this.listeCorrections.push(
        correction1,
        correction2,
        correction3,
        correction4,
      )

      listeQuestionsToContenu(this)
    } else {
      let a: number
      let b: number
      let c: number
      let alpha: number
      let beta: number
      let R: number
      let delta: number

      do {
        a = choice([-1, 1]) * randint(1, 5)
        alpha = choice([-1, 1]) * randint(1, 10)
        b = -alpha * 2 * a
        beta = randint(1, 100)
        c = a * alpha ** 2 + beta
        R = a * randint(1, 10) ** 2 + beta
        delta = b ** 2 - 4 * a * c
      } while (c === 0 || R === 0 || R === c || beta === 0 || delta >= 0)

      const trinome = new Trinome(a, b, c)
      const items = [trinome.tex, trinome.texFormeCanonique].map(
        (s) => `$f(x)=${s}$`,
      )
      const list = createList({
        items,
        style: 'puces',
        classOptions: 'space-y-2 p-4',
      })

      this.introduction = 'Voici deux formes possibles de la fonction $f$ :'
      this.introduction += list
      this.introduction +=
        'En choisissant la forme la plus adaptée, résoudre les équations suivantes :'
      this.introduction += '<br><br>'

      const question1 = `$f(x) = ${beta}$`

      let correction1 = `On choisit la forme canonique : $f(x) = ${trinome.texFormeCanonique}$.`
      correction1 += '<br>'
      correction1 += `$f(x) = ${beta}$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 ${ecritureAlgebrique(beta)} = ${beta}$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 = 0$`
      correction1 += '<br>'
      if (a !== 1) {
        correction1 += `$\\iff$ $(x ${ecritureAlgebrique(-alpha)})^2 = 0$`
        correction1 += '<br>'
      }
      correction1 += `$\\iff$ $x ${ecritureAlgebrique(-alpha)} = 0$`
      correction1 += '<br>'
      correction1 += `$\\iff$ $x = ${alpha}$`
      correction1 += '<br>'
      correction1 += `$S =\\left\\{${alpha}\\right\\}$`

      const question2 = '$f(x) = 0$'

      let correction2 = `On choisit la forme canonique : $f(x) = ${trinome.texFormeCanonique}$.`
      correction2 += '<br>'
      correction2 += '$f(x) = 0$'
      correction2 += '<br>'
      correction2 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 ${ecritureAlgebrique(beta)} = 0$`
      correction2 += '<br>'
      correction2 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 = ${-beta}$`
      correction2 += '<br>'
      if (a !== 1) {
        correction2 += `$\\iff$ $(x ${ecritureAlgebrique(-alpha)})^2 = ${texFractionReduite(-beta, a)}$`
        correction2 += '<br>'
      }
      correction2 += "Il n'y a pas de solution réelles. : $S=\\emptyset$"

      const question3 = `$f(x) = ${c}$`

      let correction3 = `On choisit la forme développée : $f(x) = ${trinome.tex}$.`
      correction3 += '<br>'
      correction3 += `$f(x) = ${c}$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $${trinome.tex} = ${c}$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $${rienSi1(a)}x^2 ${ecritureAlgebrique(b)}x = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x(${rienSi1(a)}x ${ecritureAlgebrique(b)}) = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x = 0$ ou $${rienSi1(a)}x ${ecritureAlgebrique(b)} = 0$`
      correction3 += '<br>'
      correction3 += `$\\iff$ $x = 0$ ou $${rienSi1(a)}x = ${-b}$`
      correction3 += '<br>'
      if (a !== 1) {
        correction3 += `$\\iff$ $x = 0$ ou $x = ${texNombre(-b / a, 0)}$`
        correction3 += '<br>'
      }
      correction3 += `$S =\\left\\{0;${texNombre(-b / a)}\\right\\}$`

      const question4 = `$f(x) = ${R}$`

      let correction4 = `On choisit la forme canonique : $f(x) = ${trinome.texFormeCanonique}$.`
      correction4 += '<br>'
      correction4 += `$f(x) = ${R}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 ${ecritureAlgebrique(beta)} = ${R}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $${rienSi1(a)}(x ${ecritureAlgebrique(-alpha)})^2 = ${R - beta}$`
      correction4 += '<br>'
      if (a !== 1) {
        correction4 += `$\\iff$ $(x ${ecritureAlgebrique(-alpha)})^2 = ${(R - beta) / a}$`
        correction4 += '<br>'
      }
      correction4 += `$\\iff$ $x ${ecritureAlgebrique(-alpha)} = ${-Math.sqrt((R - beta) / a)}$ ou $x ${ecritureAlgebrique(-alpha)} = ${Math.sqrt((R - beta) / a)}$`
      correction4 += '<br>'
      correction4 += `$\\iff$ $x = ${alpha - Math.sqrt((R - beta) / a)}$ ou $x = ${alpha + Math.sqrt((R - beta) / a)}$`
      correction4 += '<br>'
      correction4 += `$S =\\left\\{${alpha - Math.sqrt((R - beta) / a)};${alpha + Math.sqrt((R - beta) / a)}\\right\\}$`

      this.listeQuestions.push(question1, question2, question3, question4)
      this.listeCorrections.push(
        correction1,
        correction2,
        correction3,
        correction4,
      )

      listeQuestionsToContenu(this)
    }
  }
}
