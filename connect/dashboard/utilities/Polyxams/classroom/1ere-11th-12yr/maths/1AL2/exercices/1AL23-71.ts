import { shuffle2tableaux } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import Exercice from '../Exercice'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
export const titre =
  "Utiliser les différentes formes d'un polynôme du second degré"
export const interactifReady = false

export const dateDePublication = '27/10/2022'
export const dateDeModifImportante = '5/11/2023'

/**
 * Forme développée, factorisée ou canonique pour résoudre équations et inéquations
 * @author Rémi Angot
 */
export const uuid = '8fde1'

export const refs = {
  'fr-fr': ['1AL23-71'],
  'fr-ch': ['1mF3-7'],
}
export default class EtudeTrinome extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const a = randint(-4, 4, [-1, 0, 1])
    // x1 + x2 doit êter pair pour n'avoir que des nombres entiers dans les différentes formes
    const x1 = randint(-5, 5, 0)
    const x2 = x1 + 2 * randint(1, 4)
    const p = new Trinome(0, 0, 0)
    p.defFormeFactorisee(a, x1, x2)
    this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${p.texFormeCanonique}$.`
    const question1 = 'Développer $f(x)$.'
    const etapesDeveloppement = p.arrayTexDevelopperFormeCanonique
    let correction1 = `$f(x)=${p.texFormeCanonique}$`
    correction1 += `<br><br>$f(x)=${etapesDeveloppement[0]}$`
    correction1 += `<br><br>$f(x)=${etapesDeveloppement[1]}$`
    correction1 += `<br><br>$f(x)=${etapesDeveloppement[2]}$`

    const question2 = `Montrer que $f(x)$ se factorise sous la forme $f(x)=${p.texFormeFactorisee}$.`
    let correction2 = "On développe l'expression : "
    const etapesDeveloppement2 = p.arrayTexDevelopperFormeFactorisee
    correction2 += `<br><br> $${p.texFormeFactorisee} = ${etapesDeveloppement2[0]}$`
    correction2 += `<br><br> $\\phantom{${p.texFormeFactorisee}} = ${etapesDeveloppement2[1]}$`
    correction2 += `<br><br> $\\phantom{${p.texFormeFactorisee}} = ${etapesDeveloppement2[2]}$`
    correction2 += `<br><br> On retrouve la même forme développée que celle de la question précédente donc on a bien $f(x)=${p.texFormeFactorisee}$.`

    let question3 =
      "Répondre aux questions suivantes en utilisant l'écriture de $f(x)$ la mieux adaptée :"
    let correction3 = ''

    const q3a = "Résoudre l'équation $f(x) = 0$."

    let corr3a =
      'Ici, on va utiliser la forme factorisée pour se ramener à une équation produit nul. Il est aussi possible de calculer le discriminant mais cela serait plus long.'
    corr3a += `<br><br>$f(x)=0 \\iff ${p.texFormeFactorisee} = 0$`
    corr3a += `<br><br>$\\phantom{f(x)=0} \\iff x${ecritureAlgebrique(-x1)} = 0 \\text{\\quad ou \\quad} x${ecritureAlgebrique(-x2)} = 0$`
    corr3a += `<br><br>$\\phantom{f(x)=0} \\iff x=${x1} \\text{\\quad ou \\quad} x=${x2}$`
    corr3a += `<br><br>$S=\\{${x1}\\, ;\\, ${x2}\\}$`

    const q3b = `Résoudre l'équation $f(x) = ${p.c.simplifie().texFraction}$.`
    let corr3b = 'Ici, on va utiliser la forme développée.'
    corr3b += `<br><br> $f(x) = ${p.c.simplifie().texFraction} \\iff ${p.tex} = ${p.c.simplifie().texFraction}$`
    corr3b += `<br><br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}x^2 ${p.b.simplifie().texFractionSaufUnSignee}x = 0 $`
    corr3b += `<br><br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x \\left(${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee}\\right) = 0 $`
    corr3b += `<br><br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} ${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee} = 0 $`
    corr3b += `<br><br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} x = ${p.b.oppose().diviseFraction(p.a).simplifie().texFraction} $`
    corr3b += `<br><br>$S=\\{0\\, ;\\, ${p.b.oppose().diviseFraction(p.a).simplifie().texFraction}\\}$`

    const q3c = `Résoudre l'inéquation $f(x) < ${p.beta.simplifie().texFraction}$.`
    let corr3c = 'Ici, on va utiliser la forme canonique.'
    corr3c += `<br><br>$f(x) < ${p.beta.simplifie().texFraction} \\iff ${p.texFormeCanonique}  < ${p.beta.simplifie().texFraction}$`
    corr3c += `<br><br>$\\phantom{f(x) < ${p.beta.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2  < 0$`
    if (p.a.s === 1) {
      corr3c += ` donc $${p.a.simplifie().texFractionSaufUn}\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2 >0$.`
      corr3c += '<br><br>$S=\\emptyset$'
    } else {
      const nonSolution = p.alpha.simplifie().texFractionSignee
      corr3c += ` or $${p.a.simplifie().texFractionSaufUn}\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2$ est toujours négatif et ne s'annule que pour $x=${nonSolution}$.`
      corr3c += `<br><br>$S=\\R \\smallsetminus \\{${nonSolution}\\}$`
    }
    const [sousQuestions, sousCorrections] = [
      [q3a, q3b, q3c],
      [corr3a, corr3b, corr3c],
    ]
    shuffle2tableaux(sousQuestions, sousCorrections)
    for (let i = 0; i < 3; i++) {
      question3 += `<br><br>${numAlpha(i)} ${sousQuestions[i]}`
      correction3 += `<br><br>${numAlpha(i)} ${sousCorrections[i]}`
    }
    this.listeQuestions = [question1, question2, question3]
    this.listeCorrections = [correction1, correction2, correction3]
    listeQuestionsToContenu(this)
  }
}
