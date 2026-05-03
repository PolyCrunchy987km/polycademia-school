import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Déterminer un sinus ou un cosinus associé à un réel $x$'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '16/04/2025'
/**
 *
 * @author Stéphane Guyon (refactorisé par Éric Elter)

 *
*/
export const uuid = 'd5acf'

export const refs = {
  'fr-fr': ['1AN43'],
  'fr-ch': ['1mT-13'],
}
export default class IntegraleAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = randint(-9, 9, 0)
    const solution = (100 - a * a) / 100
    const choix = choice([1, 2]) // Choix entre cos (1) et sin (2)
    const ICos = choice(['\\left[-\\pi;0\\right[', '\\left[0;\\pi\\right[']) // Intervalle pour le sinus
    const ISin = choice([
      '\\left[-\\dfrac{\\pi}{2};\\dfrac{\\pi}{2}\\right[',
      '\\left[\\dfrac{\\pi}{2};\\dfrac{3\\pi}{2}\\right[',
    ]) // Intervalle pour le cosinus

    const signeCos: 1 | -1 =
      ISin === '\\left[-\\dfrac{\\pi}{2};\\dfrac{\\pi}{2}\\right[' ? 1 : -1
    const signeSin: 1 | -1 = ICos === '\\left[-\\pi;0\\right[' ? -1 : 1

    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.question =
      choix === 1
        ? `Soit $x\\in ${ISin}$. <br>On donne $\\sin(x)=${texNombre(a / 10)}$.<br> Déterminer la valeur exacte de $\\cos(x)$.`
        : `Soit $x\\in ${ICos}$. <br>On donne $\\cos(x)=${texNombre(a / 10)}$.<br> Déterminer la valeur exacte de $\\sin(x)$.`

    if (this.interactif)
      this.question += choix === 1 ? '<br>$\\cos(x)=$ ' : '<br>$\\sin(x)=$ '
    this.correction =
      'On sait que pour tout $x\\in \\mathbb{R}$, $\\sin^2(x)+\\cos^2(x)=1$.<br>'
    if (choix === 1) {
      // On cherche le cos
      this.correction +=
        ' Donc $\\cos^2(x)=1-\\sin^2(x)$.<br> Ce qui donne deux solutions :<br> $\\cos(x)=\\sqrt{1-\\sin^2(x)}$ ou $\\cos(x)=-\\sqrt{1-\\sin^2(x)}$.<br>'
      this.correction += ` Comme $x\\in ${ISin}$, on a $\\cos(x) ${signeCos === 1 ? '\\geqslant' : '\\leqslant'} 0$.<br>`
      this.correction += `On en déduit que : <br>$\\begin{aligned}
        \\cos(x)&=-\\sqrt{1-\\sin^2(x)}\\\\`

      if (signeCos === 1) {
        this.correction += `&=\\sqrt{1-${texNombre(a / 10)}^2}\\\\
        &=\\sqrt{${texNombre(solution)}}.\\end{aligned}$
        <br>On peut conclure que   $\\cos(x)=${miseEnEvidence(`\\sqrt{${texNombre(solution)}}`)}$.`
        this.reponse = `\\sqrt{${solution}}`
      } else {
        this.correction += `&=-\\sqrt{1-${ecritureParentheseSiNegatif(a / 10)}^2}\\\\
        &=-\\sqrt{${texNombre(solution)}}.\\end{aligned}$
        <br>On peut conclure que   $\\cos(x)=${miseEnEvidence(`-\\sqrt{${texNombre(solution)}}`)}$.`
        this.reponse = `-\\sqrt{${solution}}`
      }
    } else {
      // On cherche le sin
      this.correction +=
        ' Donc $\\sin(x)=\\sqrt{1-\\cos^2(x)}$ ou $\\sin(x)=-\\sqrt{1-\\cos^2(x)}$.<br>'
      this.correction += ` Comme $x\\in ${ICos}$, on a $\\sin(x) ${signeSin === 1 ? '\\geqslant' : '\\leqslant'} 0$.<br>`
      this.correction += `On en déduit que : <br>$\\begin{aligned}
            \\sin(x)&=\\sqrt{1-\\cos^2(x)}\\\\
            &=\\sqrt{1-${ecritureParentheseSiNegatif(a / 10)}^2}\\\\
            &=\\sqrt{${texNombre(solution)}}.\\end{aligned}$`

      if (signeSin === -1) {
        this.correction += `<br>On peut conclure que   $\\sin(x)=${miseEnEvidence(`-\\sqrt{${texNombre(solution)}}`)}$.`
        this.reponse = `-\\sqrt{${solution}}`
      } else {
        this.correction += `<br>On peut conclure que   $\\sin(x)=${miseEnEvidence(`\\sqrt{${texNombre(solution)}}`)}$.`
        this.reponse = `\\sqrt{${solution}}`
      }
    }
  }
}
