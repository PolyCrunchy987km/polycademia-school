import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../lib/outils/outilString'
import {
  premierMultipleInferieur,
  premierMultipleSuperieur,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer une équation de parabole'

/**
 * @author Jean-Claude Lhote (modifié par EE pour corriger exo et remplacer Repere et Courbe par Repere2 et Courbe2 (juillet 2022))
 * Trois types de questions proposées :
 * 1) passant par trois dont deux d'abscisses opposées et le troisième d'abscisse 0 (pour simplifier la résolution du système)
 * 2) passant par un point et dont on connaît le sommet
 * 3) connaissant les deux racines et un autre point de passage à coordonnées entières
 */
export const uuid = '392b3'

export const refs = {
  'fr-fr': ['1AL23-7'],
  'fr-ch': ['1mF3-6'],
}
export default class TrouverEquationParabole extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      'Type de questions ',
      4,
      '1 : Passant par trois points à coordonnées entières 1\n2 : Connaissant le sommet et un point de passage\n3 : Connaissant les deux racines et un point de passage\n4 : Mélange des trois type de questions',
    ]

    this.nbQuestions = 5

    this.spacingCorr = 3
    this.sup = 4
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.consigne = "Trouver l'expression de "
    this.consigne +=
      this.nbQuestions > 1
        ? 'chacune des fonctions suivantes.'
        : 'la fonction suivante.'
    const pixelsParCm = 20
    let typesDeQuestionsDisponibles
    if (this.sup < 4) typesDeQuestionsDisponibles = [parseInt(this.sup)]
    else typesDeQuestionsDisponibles = [1, 2, 2, 3, 3]
    const fName = []
    let Ymin
    let Yscale
    let Ymax
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let a: number, b: number, c: number
      let x1: number, x2: number, x3: number
      let f: (x: number) => number
      fName.push(lettreMinusculeDepuisChiffre(i + 6))
      texte = `Quelle est l'expression de la fonction polynomiale $${fName[i]}$ du second degré `
      texteCorr = ''
      switch (listeTypeDeQuestions[i]) {
        case 1: // passe par 3 points à coordonnées entières dont -x1, 0 et x1.
          a = randint(-4, 4, 0)
          b = randint(-6, 6, 0)
          c = randint(-10, 10, 0)
          x1 = randint(1, 5)
          x2 = randint(-5, 5, x1)
          x3 = randint(-5, 5, [x1, x2])
          f = function (x) {
            return a * x ** 2 + b * x + c
          }
          texte += `qui passe par les points de coordonnées $(${-x1};${f(-x1)})$, $(0;${f(0)})$ et $(${x1};${f(x1)})$ ?<br>`
          texteCorr = `Soit $${fName[i]}(x)=ax^2+bx+c$, l'expression de la fonction cherchée, comme $${fName[i]}(0)=${f(0)}$ nous en déduisons que $c=${miseEnEvidence(f(0), 'red')}$.<br>`
          texteCorr += `Donc $${fName[i]}(x)=ax^2+bx${miseEnEvidence(ecritureAlgebrique(f(0)), 'red')}$.<br>`
          texteCorr +=
            "En substituant dans cette expression les valeurs de l'énoncé, nous obtenons :<br>"
          texteCorr += `$\\begin{cases}
${f(x1)}=a\\times${x1}^2+b\\times${x1}${ecritureAlgebrique(f(0))}=${rienSi1(x1 ** 2)}a ${ecritureAlgebriqueSauf1(x1)}b ${ecritureAlgebrique(f(0))} \\\\
${f(-x1)}=a\\times(${-x1})^2+b\\times(${-x1})${ecritureAlgebrique(f(0))}=${rienSi1(x1 ** 2)}a ${ecritureAlgebriqueSauf1(-x1)}b ${ecritureAlgebrique(f(0))}
 \\end{cases}$<br>`
          if (this.correctionDetaillee) {
            texteCorr += `Ce qui équivaut à <br>$\\begin{cases}
 ${f(x1)}${ecritureAlgebrique(-f(0))}=${f(x1) - f(0)}=${rienSi1(x1 ** 2)}a ${ecritureAlgebriqueSauf1(x1)}b \\\\
 ${f(-x1)}${ecritureAlgebrique(-f(0))}=${f(-x1) - f(0)}=${rienSi1(x1 ** 2)}a ${ecritureAlgebriqueSauf1(-x1)}b
   \\end{cases}$<br>`
            texteCorr += `En ajoutant et en soustrayant les équations membre à membre, on obtient :<br>
$\\begin{cases}
${f(x1) + f(-x1) - 2 * f(0)}=${2 * x1 ** 2}a \\\\
${f(x1) - f(-x1)}=${2 * x1}b
 \\end{cases}$<br>`
          }
          texteCorr += `La résolution de ce système donne $a=${miseEnEvidence(texNombre(a), 'blue')}$ et $b=${miseEnEvidence(texNombre(b), 'green')}$.<br>`
          texteCorr += `D'où $${fName[i]}(x)=${a !== 1 ? miseEnEvidence(String(rienSi1(a)), 'blue') : ''}x^2 ${miseEnEvidence(ecritureAlgebriqueSauf1(b), 'green')}x  ${miseEnEvidence(ecritureAlgebrique(c), 'red')}$<br>`

          break
        case 2: // Passant par le sommet (x1,y1) et par le point (x2,y2)
          a = randint(-3, 3, 0)
          b = randint(-3, 3, 0) * 2 * a
          c = randint(-10, 10)
          x1 = -b / (2 * a)
          x2 = randint(-5, 5, x1)
          x3 = randint(-5, 5, [x1, x2])

          f = function (x) {
            return a * x ** 2 + b * x + c
          }
          texte += `dont la parabole a pour sommet le point de coordonnées $(${x1};${f(x1)})$ et passe par le point de coordonnées $(${x2};${f(x2)})$ ?<br>`
          texteCorr = `D'après les coordonnées $(${x1};${f(x1)})$ du sommet, $${fName[i]}$ a pour forme canonique : $${fName[i]}(x)=a(x${ecritureAlgebrique(-x1)})^2${ecritureAlgebrique(f(x1))}$.<br>`
          texteCorr += `De plus $${fName[i]}(${x2})=${f(x2)}$`
          if (this.correctionDetaillee) {
            texteCorr += ` donc $a(${x2}${ecritureAlgebrique(-x1)})^2${ecritureAlgebrique(f(x1))}=${f(x2)}$ `
            texteCorr += `soit $${x2 ** 2}a ${ecritureAlgebrique(-2 * x1 * x2)}a ${ecritureAlgebrique(x1 ** 2)}a ${ecritureAlgebrique(f(x1))}=${f(x2)}$.<br>`
            if (x2 ** 2 - 2 * x1 * x2 + x1 ** 2 !== 1) {
              texteCorr += `On en déduit que $a=\\dfrac{${f(x2)}${ecritureAlgebrique(-f(x1))}}{${x2 ** 2 - 2 * x1 * x2 + x1 ** 2}}=${a}$.<br>`
            } else {
              texteCorr += `On en déduit que $a=${f(x2)}${ecritureAlgebrique(-f(x1))}=${a}$.<br>`
            }
          } else texteCorr += ` donc $a=${a}$.<br>`
          if (this.correctionDetaillee) {
            texteCorr += `Développons la forme canonique : $${fName[i]}(x)=
  a(x${ecritureAlgebrique(-x1)})^2${ecritureAlgebrique(f(x1))}=
  a(x^2${miseEnEvidence(ecritureAlgebrique(-2 * x1), 'green')}x+${miseEnEvidence(texNombre(x1 ** 2), 'red')})${miseEnEvidence(ecritureAlgebrique(f(x1)), 'red')}
  =${miseEnEvidence('a', 'blue')}x^2${miseEnEvidence(ecritureAlgebrique(-2 * x1) + 'a', 'green')}x${miseEnEvidence(ecritureAlgebriqueSauf1(x1 ** 2) + 'a' + ecritureAlgebrique(f(x1)), 'red')}$.<br>`
          }
          texteCorr += `En remplaçant $a$ par sa valeur $${a}$ dans l'expression canonique développée $${miseEnEvidence('a', 'blue')}x^2${miseEnEvidence(ecritureAlgebrique(-2 * x1) + 'a', 'green')}x${miseEnEvidence(ecritureAlgebriqueSauf1(x1 ** 2) + 'a' + ecritureAlgebrique(f(x1)), 'red')}$ on obtient :<br>`
          texteCorr += `$${fName[i]}(x)=${a !== 1 ? miseEnEvidence(String(rienSi1(a)), 'blue') : ''}x^2${miseEnEvidence(ecritureAlgebriqueSauf1(b), 'green')}x${miseEnEvidence(ecritureAlgebrique(c), 'red')}$`
          break
        case 3: // on a deux racines x1 et x2 et un troisième point (x3;f(x3))
        default:
          x1 = randint(-6, -1)
          x2 = randint(1, 6, -x1)
          x3 = randint(-5, 5, [x1, x2])
          a = randint(-4, 4, 0)
          b = -a * (x1 + x2)
          c = a * x1 * x2
          f = function (x) {
            return a * x ** 2 + b * x + c
          }
          texte += `qui s'annule en $x=${x1}$ et en $x=${x2}$ et dont la parabole passe par le point de coordonnées $(${x3};${f(x3)})$ ?<br>`
          texteCorr += `Comme $${x1}$ et $${x2}$ sont les deux solutions de l'équation $${fName[i]}(x)=0$, on peut factoriser $${fName[i]}(x)$ :<br>`
          texteCorr += `$${fName[i]}(x)=a(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(-x2)})$.<br>`
          texteCorr += `Comme $${fName[i]}(${x3})=${f(x3)}$, on en déduit que `
          if (this.correctionDetaillee) {
            texteCorr += `$${f(x3)}=a(${x3}${ecritureAlgebrique(-x1)})(${x3}${ecritureAlgebrique(-x2)})$ `
            texteCorr += `d'où $a=${f(x3)}\\div ${ecritureParentheseSiNegatif((x3 - x1) * (x3 - x2))}=${a}$.<br>`
          } else texteCorr += `$a=${a}$.<br>`
          texteCorr += `On obtient ainsi $${fName[i]}(x)=${rienSi1(a)}(x${ecritureAlgebrique(-x1)})(x${ecritureAlgebrique(-x2)})$ ou en développant $${fName[i]}(x)=${rienSi1(a)}x^2 ${ecritureAlgebriqueSauf1(b)}x  ${ecritureAlgebrique(c)}$`
          break
      }
      if (a < 0) {
        Ymax = Math.ceil(f(-b / (2 * a)) + 2)
        Ymin = Math.min(f(x1), f(x2), f(x3), f(-x1), f(0), f(-6), f(6))
      } else {
        Ymin = Math.floor(f(-b / (2 * a)) - 2)
        Ymax = Math.max(f(x1), f(x2), f(x3), f(-x1), f(0), f(-6), f(6))
      }

      if (Ymax - Ymin < 10) Yscale = 2
      else
        Yscale =
          Math.max(1, Math.round(Math.ceil((Ymax - Ymin) / 10) / 5) * 5) * 2
      const r = repere({
        xMin: -10,
        yMin: premierMultipleInferieur(Yscale, Ymin) - Yscale,
        yMax: premierMultipleSuperieur(Yscale, Ymax) + Yscale,
        xMax: 10,
        yUnite: 1 / Yscale,
        yThickDistance: Yscale,
        grilleYDistance: Yscale,
        yLabelEcart: 0.8,
      })

      const svgYmin = Math.min(Ymin / Yscale, -1)
      const svgYmax = Math.max(Ymax / Yscale, 1)
      const F = (x: number) => a * x ** 2 + b * x + c
      texte += mathalea2d(
        {
          xmin: -10,
          xmax: 11,
          ymin: svgYmin,
          ymax: svgYmax + 2,
          pixelsParCm,
          scale: 0.6,
        },
        courbe(F, {
          repere: r,
          xMin: -10,
          xMax: 10,
          color: 'blue',
          epaisseur: 1.5,
        }),
        r,
      )
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
