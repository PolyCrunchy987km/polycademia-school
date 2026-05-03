import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import FractionEtendue from '../../modules/FractionEtendue'
import EquationSecondDegre from '../../modules/EquationSecondDegre'

export const titre = 'Résoudre une équation du second degré (cas général)'
export const dateDePublication = '14/05/2024'
export const interactifReady = false
export const uuid = '1be55'
export const refs = {
  'fr-fr': ['1AL23-22'],
  'fr-ch': ['11FA10-15'],
}

// export const dateDeModifImportante = '24/10/2021'

/**
 * Résolution d'équation du degré 2 (cas général)
 *  TODO : trouver comment
 * supprimer les équations du type ax^2 + bx + c = 0
 * (déjà présentes dans les autres exercices)
 * @author Nathan Scheinmann
 */

export default class ExerciceEquationSecondDegre extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre de solutions',
      '1 : Une solution\n2 : Deux solutions\n3 : Pas de solution réelle\n4 : Mélange',
    ]
    this.besoinFormulaire2Texte = [
      'Type de solutions',
      '1 : Entier\n2 : Fraction (au moins une)\n3 : Irrationnel\n4 : Mélange',
    ]
    this.besoinFormulaire3Texte = [
      "Format de l'équation",
      '1 : Réduite ordonnée\n2 : Réduite mélangée\n3 : Mélangée simple\n4 : Mélangée compliquée\n5 : Mélange',
    ]
    this.sup = 4
    this.sup2 = 4
    this.sup3 = 5
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.comment =
      "L'option 'une unique solution avec type de solution irrationnelle' donne par défaut une solution fractionnaire.<br> Le format de l'équation est: 1. ax^2+bx+c=0 <br>2. bx+ax^2+c=0<br>3. ax^2+bx+c=dx^2+ex+f<br>4. bx+c+ax^2=f+dx^2+ex."
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['uneSol', 'deuxSol', 'pasSol'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const sousChoixSol = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['entier', 'fraction', 'irrationnel'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    const sousChoixForme = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: [
        'reduit',
        'melangeReduit',
        'melangeSimple',
        'melangeComplique',
      ],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })
    if (this.nbQuestions === 1) {
      this.consigne =
        "Résoudre l'équation suivante en utilisant la formule du deuxième degré."
    } else {
      this.consigne =
        'Résoudre les équations suivantes en utilisant la formule du deuxième degré.'
    }
    if (this.interactif) {
      this.consigne +=
        " Entrer les solutions sous forme d'un ensemble en séparant les éléments séparé par des point-virgules. Si une équation n'a pas de solution entrer l'ensemble vide."
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let equation = new EquationSecondDegre(
        new FractionEtendue(1, 1),
        new FractionEtendue(1, 1),
        new FractionEtendue(1, 1),
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        new FractionEtendue(0, 1),
        { variable: 'x', format: 'melangeComplique' },
      )
      let a: FractionEtendue
      let b: FractionEtendue
      let c: FractionEtendue
      let s1: FractionEtendue
      let s2: FractionEtendue
      if (listeTypeDeQuestions[i] === 'pasSol') {
        do {
          a = new FractionEtendue(randint(-10, 10, [0]), 1)
          b = new FractionEtendue(randint(-10, 10), 1)
          c = new FractionEtendue(randint(-10, 10), 1)
          equation = EquationSecondDegre.aPartirDesCoefficients(
            a,
            b,
            c,
            new FractionEtendue(0, 1),
            new FractionEtendue(0, 1),
            new FractionEtendue(0, 1),
            { variable: 'x', format: sousChoixForme[i] as string },
          )
        } while (!(equation.delta.signe === -1))
      } else if (listeTypeDeQuestions[i] === 'uneSol') {
        if (sousChoixSol[i] === 'entier') {
          s1 = new FractionEtendue(randint(-10, 10), 1)
          const coeffLead = new FractionEtendue(randint(-3, 3, [0]), 1)
          equation = EquationSecondDegre.aPartirDesSolutions(
            s1,
            s1,
            coeffLead,
            { variable: 'x', format: sousChoixForme[i] as string },
          )
        }
        if (
          sousChoixSol[i] === 'fraction' ||
          sousChoixSol[i] === 'irrationnel'
        ) {
          do {
            s1 = new FractionEtendue(randint(-10, 10), randint(1, 10, [0]))
            const coeffLead = new FractionEtendue(randint(-3, 3, [0]), 1)
            equation = EquationSecondDegre.aPartirDesSolutions(
              s1,
              s1,
              coeffLead,
              { variable: 'x', format: sousChoixForme[i] as string },
            )
          } while (s1.denIrred === 1)
        }
      } else if (listeTypeDeQuestions[i] === 'deuxSol') {
        if (sousChoixSol[i] === 'entier') {
          do {
            s1 = new FractionEtendue(randint(-10, 10), 1)
            s2 = new FractionEtendue(randint(-10, 10), 1)
            const coeffLead = new FractionEtendue(1, 1)
            equation = EquationSecondDegre.aPartirDesSolutions(
              s1,
              s2,
              coeffLead,
              { variable: 'x', format: sousChoixForme[i] as string },
            )
          } while (s1.num === s2.num && s1.den === s2.den)
        } else if (sousChoixSol[i] === 'fraction') {
          do {
            s1 = new FractionEtendue(randint(-10, 10), randint(1, 10, [0]))
            s2 = new FractionEtendue(randint(-10, 10), randint(1, 10, [0]))
            const coeffLead = new FractionEtendue(
              randint(-3, 3, [0]),
              randint(1, 3, [0]),
            )
            equation = EquationSecondDegre.aPartirDesSolutions(
              s1,
              s2,
              coeffLead,
              { variable: 'x', format: sousChoixForme[i] as string },
            )
          } while (
            (s1.denIrred === 1 && s2.denIrred === 1) ||
            (s1.den === s2.den && s1.num === s2.num)
          )
          // TODO multiplier par le dénominateur commun pour avoir des coefficients entiers ou pas dépendant du cas.
        } else if (sousChoixSol[i] === 'irrationnel') {
          // Tant que b^2-4ac n'est pas un carré parfait
          do {
            a = new FractionEtendue(randint(-10, 10, [0]), 1)
            b = new FractionEtendue(randint(-10, 10), 1)
            c = new FractionEtendue(randint(-10, 10), 1)
            equation = EquationSecondDegre.aPartirDesCoefficients(
              a,
              b,
              c,
              new FractionEtendue(0, 1),
              new FractionEtendue(0, 1),
              new FractionEtendue(0, 1),
              { variable: 'x', format: sousChoixForme[i] as string },
            )
          } while (
            equation.delta.estParfaite === true ||
            equation.delta.num === 0 ||
            equation.delta.signe === -1
          )
        }
      }
      texte += `$${equation.equationTex}$`
      if (this.correctionDetaillee) {
        texteCorr += `${equation.correctionDetailleeTex}`
      } else texteCorr += `$${equation.ensembleDeSolutionsTex}$`
      if (
        this.questionJamaisPosee(
          i,
          equation.ensembleDeSolutionsTex,
          equation.equationTex,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
