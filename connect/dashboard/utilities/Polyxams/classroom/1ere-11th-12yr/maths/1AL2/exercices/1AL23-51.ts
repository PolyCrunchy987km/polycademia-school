import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { numAlpha } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

export const titre = 'Effectuer une étude complète de paraboles'
export const interactifReady = false

export const dateDePublication = '27/10/2022'
export const dateDeModifImportante = '5/11/2023'

/**
 * Sommet, forme canonique et points d'intersection avec l'axe des abscisses
 * @author Rémi Angot
 */
export const uuid = 'e6718'

export const refs = {
  'fr-fr': ['1AL23-51'],
  'fr-ch': ['1mF3-8'],
}
export default class EtudeParabole extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const a = randint(-4, 4, [-1, 0, 1])
    // x1 + x2 doit être pair pour n'avoir que des nombres entiers dans les différentes formes
    const x1 = randint(-5, 5, 0)
    const x2 = x1 + 2 * randint(1, 4, -x1) // Pas de racines symétriques pour avoir un alpha non nul
    const p = new Trinome(0, 0, 0)
    p.defFormeFactorisee(a, x1, x2)
    let question1 = `Dans le plan rapporté à un repère, on considère la parabole $(P)$ d'équation $y=${p.tex}$.`
    question1 += `<br><br>${numAlpha(0)} Déterminer la forme canonique de $f(x) = ${p.tex}$.`
    question1 += `<br><br>${numAlpha(1)} En déduire les coordonnées du sommet de la parabole et les variations de la fonction $f$ associée au polynôme $(P)$.`
    let correction1 = `${numAlpha(0)} On cherche la forme canonique de $${p.tex}$ avec $a=${p.a.simplifie().texFraction}$, $b=${p.b.simplifie().texFraction}$ et $c=${p.c.simplifie().texFraction}$.`
    correction1 +=
      '<br><br> On sait que $f(x)=a(x-\\alpha)^2+\\beta$ avec $\\alpha = \\dfrac{-b}{2a}$ et $\\beta=f(\\alpha)$.'
    correction1 += `<br><br> $\\alpha = \\dfrac{-b}{2a}=\\dfrac{${p.b.simplifie().oppose().texFraction}}{${p.a.multiplieEntier(2).simplifie().texFraction}}=${p.alpha.simplifie().texFraction}$`
    correction1 += `<br><br> $\\beta = f(\\alpha) = f\\left(${p.alpha.simplifie().texFraction} \\right)=${p.texCalculImage(p.alpha.simplifie())}$`
    correction1 += `<br><br> On a donc $f(x) = ${p.texFormeCanonique}$.`
    correction1 += `<br><br>${numAlpha(1)} Le sommet de cette parabole a donc pour coordonnées $\\left(${p.alpha.simplifie().texFraction} \\,;\\, ${p.beta.simplifie().texFraction}\\right)$.`

    correction1 += `<br><br>$f(x) = ${p.texFormeCanonique}$ avec $a ${p.a.s === 1 ? '>' : '<'} 0$ d'où le tableau de variations : `

    let variations
    if (a > 0) {
      variations = [
        'Var',
        5,
        '+/',
        35,
        `-/$${p.beta.simplifie().texFraction}$`,
        5,
        '+/',
      ]
    } else {
      variations = [
        'Var',
        5,
        '-/',
        30,
        `+/$${p.beta.simplifie().texFraction}$`,
        5,
        '-/',
      ]
    }
    correction1 +=
      '<br><br>' +
      tableauDeVariation({
        tabInit: [
          [
            // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
            ['$x$', 2, 30],
            [`$${p.tex}$`, 4, 50],
          ],
          // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
          [
            '$-\\infty$',
            30,
            `${p.alpha.texFractionSimplifiee}`,
            30,
            '$+\\infty$',
            30,
          ],
        ],
        // tabLines ci-dessous contient les autres lignes du tableau.
        tabLines: [variations],
        espcl: 7, // taille en cm entre deux antécédents
        deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
        lgt: 8, // taille de la première colonne en cm
        hauteurLignes: [12, 25],
      })

    p.defFormeFactorisee2(
      randint(-2, 2, [-1, 0, 1]),
      randint(-5, 5, 0),
      randint(-5, 5, 0),
      randint(-5, 5, 0),
      randint(-5, 5, 0),
    )
    const question2 = `La parabole d'équation $y = ${p.tex}$ coupe-t-elle l'axe des abscisses ? Si oui, déterminer les coordonnées de ce(s) point(s).`
    let correction2 = `La parabole coupe l'axe des abscisses en un point $M(x\\;;\\;y)$ si et seulement si $y=${p.tex}=0$.`
    correction2 += `<br><br>On résout l'équation $${p.tex}=0$ en calculant le discriminant :`
    correction2 += `<br><br>$\\Delta = ${p.texCalculDiscriminantSansResultat}$`
    correction2 += `<br><br>$\\Delta = ${p.discriminant.simplifie().texFraction}.$`
    if (p.discriminant.valeurDecimale === 0) {
      correction2 += `<br><br>L'équation admet donc une unique solution $x_0 = ${p.texCalculRacineDouble}$.`
      if (p.x1 === false) {
        throw new Error('Erreur dans le calcul de la racine double')
      }
      const px1 =
        typeof p.x1 === 'number' ? String(p.x1) : p.x1.simplifie().texFraction
      correction2 += `<br><br>Conclusion : <br>La parabole coupe l'axe des abscisses en un unique point $M\\left(${px1} \\,;\\, 0 \\right)$.`
    } else {
      correction2 +=
        '<br><br>$\\Delta$ est strictement positif donc cette équation admet deux solutions.'
      correction2 += `<br><br>$${p.texCalculRacine1(true)}$`
      correction2 += `<br><br>$${p.texCalculRacine2(true)}$`
      if (p.x1 === false || p.x2 === false) {
        throw new Error('Erreur dans le calcul des racines')
      }
      const px1 =
        typeof p.x1 === 'number' ? String(p.x1) : p.x1.simplifie().texFraction
      const px2 =
        typeof p.x2 === 'number' ? String(p.x2) : p.x2.simplifie().texFraction
      correction2 += `<br><br>Conclusion :<br>La parabole coupe donc l'axe des abscisses en deux points de coordonnées $\\left(${px1} \\,;\\, 0 \\right)$ et  $\\left(${px2} \\,;\\, 0 \\right)$.`
    }

    this.listeQuestions = [question1, question2]
    this.listeCorrections = [correction1, correction2]
    listeQuestionsToContenu(this)
  }
}
