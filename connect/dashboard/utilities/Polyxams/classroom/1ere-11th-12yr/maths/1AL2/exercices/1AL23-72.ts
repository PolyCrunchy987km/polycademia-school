import { createList } from '../../lib/format/lists'
import { texteCentre } from '../../lib/format/miseEnPage'
import {
  tableauSignesFonction,
  tableauVariationsFonction,
} from '../../lib/mathFonctions/etudeFonction'
import { choice, enleveDoublonNum } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

export const titre = 'Étudier une fonction polynôme du second degré'
export const dateDePublication = '05/11/2025'

/**
 *
 * @author Gilles Mora
 */
export const uuid = '57692'

export const refs = {
  'fr-fr': ['1AL23-72'],
  'fr-ch': [''],
}
export default class SecondDegreApplication extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 1.5
    this.spacing = 1.5
    this.nbQuestionsModifiable = false

    // Premier formulaire : choix du type de racines
    this.besoinFormulaire2Texte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Avec des racines entières\n2 : Avec une racine\n3 : Sans racine\n4: Mélange',
    ]

    // Deuxième formulaire : choix des sous-questions pour la question 4
    this.besoinFormulaire3Texte = [
      'Choix des sous-questions de la question 4',
      `Nombres séparés par des tirets :\n1 : Inéquation $f(x)\\geqslant 0$ ou $f(x)\\leqslant 0$\n2 : Extrémum\n3 : Images symétriques\n4 : Inéquation particulière\n5 : Intersection axe des abscisses\n6 : Sommet de la parabole\n7 : Comparaison (sens de variation)\n8 : Axe de symétrie\n9 : Position par rapport à l'axe\n10 : Forme canonique\n11 : Forme factorisée\n12 : Position relative\n13 : Comparaison d'images\n14 : Ensemble de définition\n15 : Toutes les questions`,
    ]

    this.sup2 = '4'
    this.sup3 = '15' // Par défaut mélange
    this.besoinFormulaire4CaseACocher = ['Énoncé différent', false]
  }

  nouvelleVersion() {
    // Gestion du premier formulaire (type de racines)
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    // Gestion du deuxième formulaire (sous-questions) - SIMPLIFIÉ ---> EE : totalement inutile
    // Parse la saisie pour voir combien de questions sont demandées
    /* const saisiesSousQuestions = String(this.sup3 ?? '')
      .split('-')
      .filter((s: string) => s.trim())
    const nbSousQuestions =
      saisiesSousQuestions.length > 0 ? saisiesSousQuestions.length : 13
*/
    let listeSousQuestionsIndex = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      nbQuestions: 50, // EE : Peu importe tant que ce peut englober toutes les questions possibles.
      max: 14,
      defaut: 15,
      melange: 15,
      shuffle: false, // Ne pas mélanger pour garder l'ordre demandé
    }).map((n) => Number(n) - 1) // ----> EE : Ainsi listeSousQuestionsIndex sera, de façon certaine, un tableau de nombres (décrémenté de 1 car cela a été ton choix ensuite.)

    listeSousQuestionsIndex = enleveDoublonNum(listeSousQuestionsIndex) // ---> EE : Ce va compenser nbQUestions à 50 mais tu es sûr d'avoir toutes les demandes de l'utilisateur de façon unique (même si lui met deux fois le même nombre.)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let a: number = 0
      let b: number = 0
      let c: number = 0
      let x1: number = 0
      let x2: number = 0
      let y1: number
      const choix = choice([true, false])
      const xMin = -100
      const xMax = 100
      const tolerance = 0.005

      // Génération des valeurs selon le cas
      switch (listeDeQuestions[i]) {
        case 1: // Avec des racines entières
          x1 = randint(-9, 2, [0])
          x2 = randint(x1 + 1, 5, [0, -x1])
          a = randint(-4, 4, [0])
          b = -a * x1 - a * x2
          c = a * x1 * x2
          break

        case 2: // Avec une racine double
          x1 = randint(-9, 9, [0])
          x2 = x1
          a = randint(-4, 4, [0])
          b = -a * x1 - a * x2
          c = a * x1 * x2
          break

        case 3: // Sans racine
          x1 = randint(-9, 9, [0])
          x2 = x1 // Pas utilisé mais initialisé pour éviter les erreurs
          a = randint(-4, 4, [0])
          y1 = randint(1, 4) * (a > 0 ? 1 : -1)
          b = -2 * a * x1
          c = a * x1 * x1 + y1
          break
      }

      // Calculs communs (après avoir a, b, c)
      const p = new Trinome(a, b, c)
      const fonction = (x: number) => a * x ** 2 + b * x + c
      const derivee = (x: number) => 2 * a * x + b
      const substituts = [
        { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
        {
          antVal: -b / (2 * a),
          antTex: p.alpha.simplifie().texFSD,
          imgVal: p.alpha.simplifie().valeurDecimale,
          imgTex: `$${p.beta.simplifie().texFSD}$`,
        },
        { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
      ]

      // ====== QUESTIONS PRINCIPALES (1, 2, 3) ======
      const question1 = this.sup4
        ? listeDeQuestions[i] === 1
          ? `Les solutions de l'équation $f(x)=0$ sont $${x1}$ et $${x2}$.`
          : listeDeQuestions[i] === 2
            ? `La solution de l'équation $f(x)=0$ est $${x1}$.`
            : "L'équation $f(x)=0$ n'a pas de solution."
        : "Résoudre, dans $\\mathbb{R}$, l'équation $f(x)=0$."

      const question1cPartieCommune = `$f(x)$ est  un polynôme du second degré. <br>
              On calcule son discriminant :<br>
              $\\Delta= ${p.texCalculDiscriminant}$<br>`
      const question1c =
        listeDeQuestions[i] === 1
          ? question1cPartieCommune +
            `
              Comme $\\Delta>0$, l'équation $f(x)=0$ admet deux solutions réelles :<br>
              $${p.texCalculRacine1(true)}$ 
              et 
              $${p.texCalculRacine2(true)}$.<br>
              Ainsi, $S=${miseEnEvidence(`\\{${x1}\\,;\\,${x2}\\}`)}$.`
          : listeDeQuestions[i] === 2
            ? question1cPartieCommune +
              `
             Comme  $\\Delta=0$, l'équation $f(x)=0$ admet une unique solution réelle :<br>
              $x_0=${p.texCalculRacine1()}$<br>
              $S=${miseEnEvidence(`\\left\\{${x1}\\right\\}`)}$`
            : question1cPartieCommune +
              `
              Comme $\\Delta<0$, l'équation $f(x)=0$ n'a pas de solution dans $\\mathbb{R}$.<br>
              Ainsi, $S=${miseEnEvidence(`\\varnothing`)}$.`

      const question2 = this.sup4
        ? listeDeQuestions[i] === 2
          ? 'Le tableau de signes de $f$  sur $\\mathbb{R}$ est : <br>' +
            tableauSignesFonction(fonction, -100, 100, {
              step: 0.01,
              tolerance: 0.001,
              fractionTex: true,
              substituts: [
                { antVal: -100, antTex: '$-\\infty$', imgTex: ' ', imgVal: 1 },
                { antVal: 100, antTex: '$+\\infty$', imgTex: ' ', imgVal: 1 },
              ],
            })
          : 'Le tableau de signes de $f$  sur $\\mathbb{R}$ est : <br>' +
            tableauSignesFonction(fonction, -100, 100, {
              step: 0.01,
              tolerance: 0.001,
              fractionTex: true,
              substituts: [
                { antVal: -100, antTex: '$-\\infty$', imgTex: ' ', imgVal: 1 },
                { antVal: 100, antTex: '$+\\infty$', imgTex: ' ', imgVal: 1 },
              ],
            })
        : 'Étudier le signe de la fonction $f$.'
      const question2cPartieCommune = `
             ${tableauSignesFonction(fonction, -100, 100, {
               step: 0.01,
               tolerance: 0.001,
               fractionTex: true,
               substituts: [
                 { antVal: -100, antTex: '$-\\infty$', imgTex: ' ', imgVal: 1 },
                 { antVal: 100, antTex: '$+\\infty$', imgTex: ' ', imgVal: 1 },
               ],
             })}`
      const question2c =
        listeDeQuestions[i] === 1
          ? `Le trinôme $${p.tex}$ est du signe du coefficient de $x^2$ (c'est-à-dire $${a}$) sauf entre ses racines. Ainsi : <br>` +
            question2cPartieCommune
          : listeDeQuestions[i] === 2
            ? `Le trinôme $${p.tex}$ est du signe du coefficient de $x^2$ (c'est-à-dire $${a}$) et s'annule en sa racine double. Ainsi : <br>` +
              question2cPartieCommune
            : `$\\Delta<0$ donc $f(x)$ n'a pas de racines.<br>
             $f(x)$ est toujours du signe  du coefficient de $x^2$ (c'est-à-dire $${a}$). Ainsi :<br>` +
              question2cPartieCommune

      const question3 = this.sup4
        ? 'Le tableau de variations de $f$  sur $\\mathbb{R}$ est : <br>' +
          tableauVariationsFonction(fonction, derivee, xMin, xMax, {
            ligneDerivee: false,
            substituts,
            step: 0.5,
            tolerance,
          })
        : 'Donner les variations de la fonction $f$.'

      const question3c =
        `Comme le coefficient de $x^2$ est ${a > 0 ? 'positif' : 'négatif'}, $f$ est d'abord ${a > 0 ? 'décroissante' : 'croissante'} puis ${a > 0 ? 'croissante' : 'décroissante'}.<br>
         Le changement de variation s'opère en $\\alpha=-\\dfrac{b}{2a}=-\\dfrac{${ecritureParentheseSiNegatif(b)}}{2\\times ${ecritureParentheseSiNegatif(a)}}
                   =${p.alpha.simplifie().texFSD}$.<br>
                   De plus, $f\\left(${p.alpha.simplifie().texFSD}\\right)=${p.texCalculImage(p.alpha.simplifie())}$.` +
        tableauVariationsFonction(fonction, derivee, xMin, xMax, {
          ligneDerivee: false,
          substituts,
          step: 0.5,
          tolerance,
        })

      // ====== SOUS-QUESTIONS (4a à 4l) - FACTORISÉES ======

      // Question 4a - identique dans tous les cas
      const question4a = `Résoudre dans $\\mathbb{R}$, l'inéquation $f(x) ${choix ? '\\geqslant' : '\\leqslant'} 0$.`
      const question4acPartieCommune = `On utilise le tableau de signes de la fonction $f$.<br>L'ensemble des solutions de l'inéquation $f(x) ${choix ? '\\geqslant' : '\\leqslant'} 0$ est `
      const question4ac =
        listeDeQuestions[i] === 1
          ? question4acPartieCommune +
            ` $S=${choix ? (a > 0 ? `${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right]\\cup\\left[${x2}\\,;\\,+\\infty\\right[`)}` : `${miseEnEvidence(`\\left[${x1}\\,;\\,${x2}\\right]`)}`) : a > 0 ? `${miseEnEvidence(`\\left[${x1}\\,;\\,${x2}\\right]`)}` : `${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right]\\cup\\left[${x2}\\,;\\,+\\infty\\right[`)}`}$.`
          : listeDeQuestions[i] === 2
            ? question4acPartieCommune +
              ` $S=${choix ? (a > 0 ? `${miseEnEvidence(`\\mathbb{R}`)}` : `${miseEnEvidence(`\\left\\{${x1}\\right\\}`)}`) : a > 0 ? `${miseEnEvidence(`\\left\\{${x1}\\right\\}`)}` : `${miseEnEvidence(`\\mathbb{R}`)}`}$.`
            : question4acPartieCommune +
              ` $S=${choix ? (a > 0 ? `${miseEnEvidence(`\\mathbb{R}`)}` : `${miseEnEvidence(`\\varnothing`)}`) : a > 0 ? `${miseEnEvidence(`\\varnothing`)}` : `${miseEnEvidence(`\\mathbb{R}`)}`}$.`
      // Question 4b - identique dans tous les cas
      const question4b = `Donner l'extrémum de $f$, préciser sa nature  et indiquer en quelle valeur il est atteint.`
      const question4bc = `On utilise le tableau de variations de la fonction $f$.<br>
      La fonction $f$ atteint son ${a > 0 ? 'minimum' : 'maximum'} en $x=${miseEnEvidence(p.alpha.simplifie().texFSD)}$.<br>
      Cette valeur ${a > 0 ? 'minimale' : 'maximale'} est $${miseEnEvidence(p.beta.simplifie().texFSD)}$.`

      // Question 4c - identique dans tous les cas
      const k = randint(1, 3)
      const question4c = `Comparer $f\\left(${p.alpha.ajouteEntier(-k).texFractionSimplifiee}\\right)$ et  $f\\left(${p.alpha.ajouteEntier(k).texFractionSimplifiee}\\right)$.`

      const question4cc = `
      La droite d'équation $x=${p.alpha.texFractionSimplifiee}$ est l'axe de symétrie de $\\mathscr{C}_f$.<br>
      Comme $${p.alpha.ajouteEntier(-k).texFractionSimplifiee}$ et $${p.alpha.ajouteEntier(k).texFractionSimplifiee}$ sont symétriques par rapport à $${p.alpha.simplifie().texFSD}$, 
      leurs images par $f$ sont égales.<br>Ainsi, $${miseEnEvidence(`f\\left(${p.alpha.ajouteEntier(-k).texFractionSimplifiee}\\right)=f\\left(${p.alpha.ajouteEntier(k).texFractionSimplifiee}\\right)`)}$.`

      // Question 4d - varie selon les cas
      const question4d = `Donner l'ensemble des solutions de l'inéquation $f(x)\\geqslant ${a < 0 ? `${Math.floor(p.beta.ajouteEntier(2).valeurDecimale)}` : `${Math.floor(p.beta.ajouteEntier(-2).valeurDecimale)}`}$.`
      const question4dc = `D'après le tableau de variations, le ${a > 0 ? 'minimum' : 'maximum'} de $f$ est $${p.beta.simplifie().texFSD}$.<br>Ainsi, pour tout réel $x$, 
          $f(x) ${a > 0 ? `\\geqslant ${p.beta.simplifie().texFSD}` : `\\leqslant ${p.beta.simplifie().texFSD}`}$.<br>
          Comme $${a < 0 ? `${p.beta.simplifie().texFSD}<${Math.floor(p.beta.ajouteEntier(2).valeurDecimale)}` : `${p.beta.simplifie().texFSD}>${Math.floor(p.beta.ajouteEntier(-2).valeurDecimale)}`}$, 
         l'ensemble des solutions de l'inéquation $f(x)\\geqslant ${a < 0 ? `${Math.floor(p.beta.ajouteEntier(2).valeurDecimale)}` : `${Math.floor(p.beta.ajouteEntier(-2).valeurDecimale)}`}$
         est donc $S=${a > 0 ? `${miseEnEvidence(`\\mathbb{R}`)}` : `${miseEnEvidence(`\\varnothing`)}`}$.`

      // Question 4e - varie selon les cas
      const question4e = `La courbe $\\mathscr{C}_f$ coupe-t-elle l'axe des abscisses ? <br>Si oui, donner les coordonnées du ou des points d'intersection entre $\\mathscr{C}_f$ et l'axe des abscisses.`
      const question4ec =
        listeDeQuestions[i] === 1
          ? `L'équation $f(x)=0$ admet deux solutions : $x_1=${x1}$ et $x_2=${x2}$.<br>
        Ainsi, la courbe $\\mathscr{C}_f$ coupe l'axe des abscisses en deux points : $${miseEnEvidence(`A(${x1}\\,;\\,0)`)}$ et $${miseEnEvidence(`B(${x2}\\,;\\,0)`)}$.`
          : listeDeQuestions[i] === 2
            ? `L'équation $f(x)=0$ a une unique solution : $${x1}$.<br>
          Ainsi, la courbe $\\mathscr{C}_f$ coupe  l'axe des abscisses au point d'abscisse $${x1}$.<br>Les coordonnées de ce point sont donc $${miseEnEvidence(`(${x1}\\,;\\,0)`)}$.`
            : `L'équation $f(x)=0$ n'a pas de solution.<br>Ainsi, ${texteEnCouleurEtGras(`la courbe $\\mathscr{C}_f$ ne coupe pas l'axe des abscisses`)}.`

      // Question 4f - identique dans tous les cas
      const question4f = `Donner les coordonnées du sommet de la parabole $\\mathscr{C}_f$.`
      const question4fc = `D'après le tableau de variations, le sommet de la parabole $\\mathscr{C}_f$ a pour abscisse $${p.alpha.simplifie().texFSD}$ et pour ordonnée $${p.beta.simplifie().texFSD}$.<br>
        Ainsi, les coordonnées du sommet de la parabole $\\mathscr{C}_f$ sont $${miseEnEvidence(`\\left(${p.alpha.simplifie().texFSD}\\,;\\,${p.beta.simplifie().texFSD}\\right)`)}$.`

      // Question 4g - identique dans tous les cas
      const question4g = `Comparer, en justifiant, $f\\left(${texNombre(p.alpha.ajouteEntier(1).valeurDecimale)}\\right)$ et $f\\left(${texNombre(p.alpha.ajouteEntier(2).valeurDecimale)}\\right)$.`
      const question4gc = `On utilise le tableau de variations de la fonction $f$.<br>La fonction $f$ est strictement ${a > 0 ? 'croissante' : 'décroissante'} sur $\\left[${p.alpha.simplifie().texFSD}\\,;\\,+\\infty\\right[$ 
      (intervalle dans lequel se situent $${texNombre(p.alpha.ajouteEntier(1).valeurDecimale)}$ et $${texNombre(p.alpha.ajouteEntier(2).valeurDecimale)}$) et donc ${a > 0 ? 'conserve' : 'change'} l'ordre sur cet intervalle.<br>
      Comme $${texNombre(p.alpha.ajouteEntier(1).valeurDecimale)}<${texNombre(p.alpha.ajouteEntier(2).valeurDecimale)}$, 
      on en déduit que $${miseEnEvidence(`f\\left(${texNombre(p.alpha.ajouteEntier(1).valeurDecimale)}\\right) ${a > 0 ? '<' : '>'} f\\left(${texNombre(p.alpha.ajouteEntier(2).valeurDecimale)}\\right)`)}$.`

      // Question 4h - identique dans tous les cas
      const question4h = `La parabole $\\mathscr{C}_f$ a un axe de symétrie. Donner une équation de cet axe.`

      const question4hc = `L'axe de symétrie d'une parabole d'équation $f(x)=ax^2+bx+c$ est la droite d'équation $x=\\alpha$.<br>Ici $\\alpha=${p.alpha.simplifie().texFSD}$, 
      donc une équation de l'axe de symétrie de la parabole $\\mathscr{C}_f$ est $${miseEnEvidence(`x=${p.alpha.simplifie().texFSD}`)}$.`

      // Question 4i - varie selon les cas
      const question4i = `Sur quel(s) intervalle(s), $\\mathscr{C}_f$ est-elle ${choix ? 'strictement au-dessus' : 'strictement au-dessous'} de l'axe des abscisses ?`
      const question4ic =
        listeDeQuestions[i] === 1
          ? `$\\mathscr{C}_f$ est ${choix ? 'strictement au-dessus' : 'strictement au-dessous'} de l'axe des abscisses lorsque $f(x) ${choix ? '>' : '<'} 0$.<br>D'après le tableau de signes de la fonction $f$, ${
              choix
                ? a > 0
                  ? `$f(x)>0$ sur $\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessus de l'axe des abscisses 
                sur $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[`)}$.`
                  : `$f(x)>0$ sur $\\left]${x1}\\,;\\,${x2}\\right[$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessus de l'axe des abscisses 
                sur $${miseEnEvidence(`\\left]${x1}\\,;\\,${x2}\\right[`)}$.`
                : a > 0
                  ? `$f(x)<0$ sur $\\left]${x1}\\,;\\,${x2}\\right[$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessous de l'axe des abscisses sur $${miseEnEvidence(`\\left]${x1}\\,;\\,${x2}\\right[`)}$.`
                  : `$f(x)<0$ sur $\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessous de l'axe des abscisses sur $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[`)}$.`
            }`
          : listeDeQuestions[i] === 2
            ? `$\\mathscr{C}_f$ est ${choix ? 'strictement au-dessus' : 'strictement au-dessous'} de l'axe des abscisses lorsque $f(x) ${choix ? '>' : '<'} 0$.<br>
          D'après le tableau de signes de la fonction $f$, ${
            choix
              ? a > 0
                ? `$f(x)>0$ sur $\\mathbb{R}\\setminus\\left\\{${x1}\\right\\}$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessus de l'axe des abscisses 
                  sur $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[`)}$ et $${miseEnEvidence(`\\left]${x1}\\,;\\,+\\infty\\right[`)}$.`
                : `$f(x)$ ne prend jamais de valeurs strictement positives, donc ${texteEnCouleurEtGras(`la courbe $\\mathscr{C}_f$ n'est jamais strictement au-dessus de l'axe des abscisses`)}.`
              : a > 0
                ? `$f(x)$ ne prend jamais de valeurs strictement négatives, donc ${texteEnCouleurEtGras(`la courbe $\\mathscr{C}_f$ n'est jamais strictement au-dessous de l'axe des abscisses`)}.`
                : `$f(x)<0$ sur $\\mathbb{R}\\setminus\\left\\{${x1}\\right\\}$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessous de l'axe des abscisses sur 
                  $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[`)}$ et $${miseEnEvidence(`\\left]${x1}\\,;\\,+\\infty\\right[`)}$.`
          }`
            : `$\\mathscr{C}_f$ est ${choix ? 'strictement au-dessus' : 'strictement au-dessous'} de l'axe des abscisses lorsque $f(x) ${choix ? '>' : '<'} 0$.<br>
          D'après le tableau de signes de la fonction $f$, ${
            choix
              ? a > 0
                ? `$f(x)>0$ sur $\\mathbb{R}$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessus de l'axe des abscisses sur $${miseEnEvidence(`\\mathbb{R}`)}$.`
                : `$f(x)$ ne prend jamais de valeurs strictement positives, donc ${texteEnCouleurEtGras(`la courbe $\\mathscr{C}_f$ n'est jamais strictement au-dessus de l'axe des abscisses`)}.`
              : a > 0
                ? `$f(x)$ ne prend jamais de valeurs strictement négatives, donc ${texteEnCouleurEtGras(`la courbe $\\mathscr{C}_f$ n'est jamais strictement au-dessous de l'axe des abscisses`)}.`
                : `$f(x)<0$ sur $\\mathbb{R}$, donc la courbe $\\mathscr{C}_f$ est strictement au-dessous de l'axe des abscisses sur $${miseEnEvidence(`\\mathbb{R}`)}$`
          }`

      // Question 4j - identique dans tous les cas
      const question4j = `Donner la forme canonique de la fonction $f$.`
      const question4jc = `La forme canonique d'un polynôme du second degré $f(x)=a\\left(x-\\alpha\\right)^2+\\beta$.<br>
      On a, ici, $\\alpha=${p.alpha.simplifie().texFSD}$ et $\\beta=${p.beta.simplifie().texFSD}$, donc la forme canonique de $f(x)$ est $${miseEnEvidence(p.texFormeCanonique)}$.`

      // Question 4k - varie selon les cas
      const question4k = `Peut-on factoriser $f(x)$ sous la forme $(ax+b)(cx+d)$ ? Si oui, donner cette factorisation, si non, expliquer pourquoi.`

      const question4kc =
        listeDeQuestions[i] === 1 || listeDeQuestions[i] === 2
          ? `La forme factorisée d'un polynôme du second degré $f(x)=ax^2+bx+c$ existe si et seulement si le discriminant $\\Delta$ est positif ou nul.<br>
        La forme factorisée est $a(x-x_1)(x-x_2)$ si $f(x)$ a deux racines et $a(x-x_0)^2$ si $f(x)$ a une seule racine.<br>
        Ici, $\\Delta=${p.discriminant.texFSD}$, 
        donc il existe une forme factorisée pour $f(x)$ : $${p.texFormeFactorisee}$ soit $${miseEnEvidence(`(${rienSi1(a)}x${ecritureAlgebrique(a * -x1)})(x${ecritureAlgebrique(-x2)})`)}$ ou encore $${miseEnEvidence(`(x${ecritureAlgebrique(-x1)})(${rienSi1(a)}x${ecritureAlgebrique(a * -x2)})`)}$. 
    `
          : `La forme factorisée d'un polynôme du second degré $f(x)=ax^2+bx+c$ existe si et seulement si le discriminant $\\Delta$ est positif ou nul.<br>Ici, $\\Delta=${p.discriminant.texFSD}$,
         donc ${texteEnCouleurEtGras(`il n'existe pas de forme factorisée pour $f(x)$ dans $\\mathbb{R}$`)}.`

      // Question 4l - varie  selon les cas
      const question4l = `On considère la droite $D$ d'équation $y=${reduireAxPlusB(-b, -c)}$.<br>Quelle est la position relative de la parabole d'équation $y=${rienSi1(a)}x^2$ et de la droite $D$ ? Justifier.`
      const question4lcPartieCommune = `Pour étudier la position relative de la parabole d'équation $y=${rienSi1(a)}x^2$ et de la droite $D$ d'équation $y=${reduireAxPlusB(-b, -c)}$, 
        on étudie le signe de la différence des deux expressions :<br>$${rienSi1(a)}x^2 - (${reduireAxPlusB(-b, -c)}) = ${p.tex}$.<br>
        D'après le tableau de signes de la fonction $f$, ${texteEnCouleurEtGras('la parabole est ')} `
      const question4lc =
        listeDeQuestions[i] === 1
          ? question4lcPartieCommune +
            `${
              a > 0
                ? `${texteEnCouleurEtGras('au-dessus de la droite sur')} 
        $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[`)}$ et 
        ${texteEnCouleurEtGras('en-dessous sur ')} $${miseEnEvidence(`\\left]${x1}\\,;\\,${x2}\\right[`)}$`
                : `${texteEnCouleurEtGras('en-dessous de la droite sur')} 
        $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right[\\cup\\left]${x2}\\,;\\,+\\infty\\right[`)}$ 
       ${texteEnCouleurEtGras(' et au-dessus sur ')} $${miseEnEvidence(`\\left]${x1}\\,;\\,${x2}\\right[`)}$`
            }. Elle coupe la droite aux points d'abscisses $${x1}$ et $${x2}$.`
          : listeDeQuestions[i] === 2
            ? question4lcPartieCommune +
              ` ${a > 0 ? `${texteEnCouleurEtGras('au-dessus')}` : `${texteEnCouleurEtGras('en-dessous')}`} ${texteEnCouleurEtGras('de la droite $D$ sur')} 
              $${miseEnEvidence(`\\mathbb{R}\\setminus\\left\\{${x1}\\right\\}`)}$ ${texteEnCouleurEtGras(`et coupe $D$ en $x=${x1}$`)}.`
            : question4lcPartieCommune +
              ` ${a > 0 ? `${texteEnCouleurEtGras('toujours au-dessus')}` : `${texteEnCouleurEtGras('toujours en-dessous')}`} ${texteEnCouleurEtGras('de la droite $D$ sur $\\mathbb{R}$')}.`

      // Question 4m
      const k2 = randint(2, 4)
      const question4m = `Comparer $f\\left(${Math.floor(p.alpha.ajouteEntier(-1).valeurDecimale)}\\right)$ et $f\\left(${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}\\right)$.`

      const question4mc = `
La droite d'équation $x=${texNombre(p.alpha.valeurDecimale)}$ est l'axe de symétrie de $\\mathscr{C}_f$.<br>
Comme $${Math.floor(p.alpha.ajouteEntier(-1).valeurDecimale)}$ et $${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)}$ sont symétriques par rapport à $${texNombre(p.alpha.valeurDecimale)}$, 
on a $f\\left(${Math.floor(p.alpha.ajouteEntier(-1).valeurDecimale)}\\right)=f\\left(${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)}\\right)$.<br>
${
  a > 0
    ? `La fonction $f$ est strictement croissante sur $\\left[${texNombre(p.alpha.valeurDecimale)}\\,;\\,+\\infty\\right[$.<br>
Or $${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)} < ${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}$, donc $f\\left(${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)}\\right) < f\\left(${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}\\right)$.<br>
Par conséquent, $${miseEnEvidence(`f\\left(${Math.floor(p.alpha.ajouteEntier(-1).valeurDecimale)}\\right) < f\\left(${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}\\right)`)}$.`
    : `La fonction $f$ est strictement décroissante sur $\\left[${texNombre(p.alpha.valeurDecimale)}\\,;\\,+\\infty\\right[$.<br>
Or $${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)} < ${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}$, donc $f\\left(${Math.ceil(p.alpha.ajouteEntier(1).valeurDecimale)}\\right) > f\\left(${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}\\right)$.<br>
Par conséquent, $${miseEnEvidence(`f\\left(${Math.floor(p.alpha.ajouteEntier(-1).valeurDecimale)}\\right) > f\\left(${Math.ceil(p.alpha.ajouteEntier(k2).valeurDecimale)}\\right)`)}$.`
}`

      // Question 4n - Ensemble de définition (nouvelle question)
      const v1 = randint(1, 9)
      const v2 = randint(-9, 9)
      const question4n = choix
        ? `Déterminer l'ensemble de définition de la fonction $g$ définie par $g(x)=\\dfrac{${reduireAxPlusB(v1, v2)}}{${p}}$.`
        : `Déterminer l'ensemble de définition de la fonction $h$ définie par $h(x)=\\sqrt{${p}}$.`

      const question4ncPartieCommune = choix
        ? `La fonction $g$ est définie par $g(x)=\\dfrac{${reduireAxPlusB(v1, v2)}}{f(x)}$. Elle est définie lorsque $f(x)\\neq 0$`
        : `La fonction $h$ est définie par $h(x)=\\sqrt{f(x)}$. Elle est définie lorsque $f(x)\\geqslant 0$`

      const question4nc = choix
        ? // Cas (ax+b)/f(x)
          listeDeQuestions[i] === 1
          ? question4ncPartieCommune +
            `, c'est-à-dire lorsque $x\\neq ${x1}$ et $x\\neq ${x2}$.<br>
        Donc l'ensemble de définition de $g$ est $${miseEnEvidence(`\\mathbb{R}\\setminus\\left\\{${x1}\\,;\\,${x2}\\right\\}`)}$.`
          : listeDeQuestions[i] === 2
            ? question4ncPartieCommune +
              `, c'est-à-dire lorsque $x\\neq ${x1}$.<br>
        Donc l'ensemble de définition de $g$ est $${miseEnEvidence(`\\mathbb{R}\\setminus\\left\\{${x1}\\right\\}`)}$.`
            : question4ncPartieCommune +
              `.<br>
        D'après la question 1, l'équation $f(x)=0$ n'a pas de solution, donc $f(x)$ ne s'annule jamais.<br>
        Ainsi, l'ensemble de définition de $g$ est $${miseEnEvidence(`\\mathbb{R}`)}$.`
        : // Cas sqrt(f(x))
          listeDeQuestions[i] === 1
          ? question4ncPartieCommune +
            `.<br>
        D'après le tableau de signes de la fonction $f$, on a $f(x)\\geqslant 0$ sur ${
          a > 0
            ? `$\\left]-\\infty\\,;\\,${x1}\\right]\\cup\\left[${x2}\\,;\\,+\\infty\\right[$.<br>
        Donc l'ensemble de définition de $h$ est $${miseEnEvidence(`\\left]-\\infty\\,;\\,${x1}\\right]\\cup\\left[${x2}\\,;\\,+\\infty\\right[`)}`
            : `$\\left[${x1}\\,;\\,${x2}\\right]$.<br>
        Donc l'ensemble de définition de $h$ est $${miseEnEvidence(`\\left[${x1}\\,;\\,${x2}\\right]`)}`
        }$.`
          : listeDeQuestions[i] === 2
            ? question4ncPartieCommune +
              `.<br>
        D'après le tableau de signes de la fonction $f$, ${
          a > 0
            ? `on a $f(x)\\geqslant 0$ sur $\\mathbb{R}$.<br>
        Donc l'ensemble de définition de $h$ est $${miseEnEvidence(`\\mathbb{R}`)}`
            : `on a $f(x)\\leqslant 0$ sur $\\mathbb{R}$ et $f(x)=0$ seulement pour $x=${x1}$.<br>
        Donc l'ensemble de définition de $h$ est $${miseEnEvidence(`\\left\\{${x1}\\right\\}`)}`
        }$.`
            : question4ncPartieCommune +
              `.<br>
        D'après le tableau de signes de la fonction $f$, ${
          a > 0
            ? `on a $f(x)>0$ sur $\\mathbb{R}$.<br>
        Donc l'ensemble de définition de $h$ est $${miseEnEvidence(`\\mathbb{R}`)}`
            : `on a $f(x)<0$ sur $\\mathbb{R}$ (car $f$ n'a pas de racine et $a<0$).<br>
        Donc ${texteEnCouleurEtGras(`l'ensemble de définition de $h$ est  : $\\varnothing$`)}`
        }.`
      // Créer les tableaux de toutes les sous-questions
      const toutesQuestions: string[] = [
        question4a,
        question4b,
        question4c,
        question4d,
        question4e,
        question4f,
        question4g,
        question4h,
        question4i,
        question4j,
        question4k,
        question4l,
        question4m,
        question4n,
      ]

      const toutesCorrections: string[] = [
        question4ac,
        question4bc,
        question4cc,
        question4dc,
        question4ec,
        question4fc,
        question4gc,
        question4hc,
        question4ic,
        question4jc,
        question4kc,
        question4lc,
        question4mc,
        question4nc,
      ]

      // Sélectionner les sous-questions selon le formulaire
      const questionsSelectionnees: string[] = []
      const correctionsSelectionnees: string[] = []

      for (let j = 0; j < listeSousQuestionsIndex.length; j++) {
        const index = listeSousQuestionsIndex[j]
        if (index >= 0 && index < toutesQuestions.length) {
          questionsSelectionnees.push(toutesQuestions[index])
          correctionsSelectionnees.push(toutesCorrections[index])
        }
      }

      texte = this.sup4
        ? `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : <br>
        ${texteCentre(`$f(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`)}
        On note $\\mathscr{C}_f$ sa courbe représentative dans un repère orthonormé. <br>
        Justifier soigneusement chacune des trois affirmations suivantes.<br>`
        : `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : <br>
        ${texteCentre(`$f(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`)}
        On note $\\mathscr{C}_f$ sa courbe représentative dans un repère orthonormé. <br>`

      texte += createList({
        items: [
          question1,
          question2,
          question3,
          listeSousQuestionsIndex.length === 1
            ? `Répondre à la question suivante en utilisant uniquement les questions précédentes et donc sans aucun calcul supplémentaire.<br>` +
              createList({
                items: questionsSelectionnees,
                style: 'none',
              })
            : `Répondre aux questions suivantes en utilisant uniquement les questions précédentes et donc sans aucun calcul supplémentaire.` +
              createList({
                items: questionsSelectionnees,
                style: 'alpha',
              }),
        ],
        style: 'nombres',
      })

      texteCorr = createList({
        items: [
          question1c,
          question2c,
          question3c,
          `Répondre aux questions suivantes en utilisant uniquement les questions précédentes et donc sans aucun calcul supplémentaire.` +
            createList({
              items: correctionsSelectionnees,
              style: 'alpha',
            }),
        ],
        style: 'nombres',
      })

      if (this.questionJamaisPosee(i, listeDeQuestions[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}
