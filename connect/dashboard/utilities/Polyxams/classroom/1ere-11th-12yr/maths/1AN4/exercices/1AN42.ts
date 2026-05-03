import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'

export const titre = 'Calculer cos et sin associés à un réel $x$'
export const interactifReady = true
export const interactifType = 'mathLive'

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '20/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 *
 * @author Stéphane Guyon

 */
export const uuid = 'b9e6a'

export const refs = {
  'fr-fr': ['1AN42'],
  'fr-ch': [],
}
export default class MesurePrincipale extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Déterminer une écriture plus simple, en fonction de $\\cos(x)$ ou $\\sin(x)$.'
    this.nbQuestions = 3 // Nombre de questions par défaut
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX

    this.sup = 1
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = [
      {
        texte: '$\\cos\\big(x+\\pi\\big)=$',
        reponse: '-\\cos(x)',
        texteCorr: '$\\cos(x+\\pi)=-\\cos(x)$',
      },

      {
        texte: '$\\cos\\big(x-\\pi\\big)=$',
        reponse: '-\\cos(x)',
        texteCorr: '$\\cos(x-\\pi)=-\\cos(x)$',
      },
      {
        texte: '$\\cos\\left(x+\\dfrac{\\pi}{2}\\right)=$',
        reponse: '-\\sin(x)',
        texteCorr: '$\\cos\\left(x+\\dfrac{\\pi}{2}\\right)=-\\sin(x)$',
      },
      {
        texte: '$\\cos\\left(\\dfrac{\\pi}{2}-x\\right)=$',
        reponse: '\\sin(x)',
        texteCorr: '$\\cos\\left(\\dfrac{\\pi}{2}-x\\right)=\\sin(x)$',
      },
      {
        texte: '$\\sin\\big(x+\\pi\\big)=$',
        reponse: '-\\sin(x)',
        texteCorr: '$\\sin(x+\\pi)=-\\sin(x)$',
      },
      {
        texte: '$\\sin\\big(x-\\pi\\big)=$',
        reponse: '-\\sin(x)',
        texteCorr: '$\\sin(x-\\pi)=-\\sin(x)$',
      },
      {
        texte: '$\\sin\\left(x+\\dfrac{\\pi}{2}\\right)=$',
        reponse: '\\cos(x)',
        texteCorr: '$\\sin\\left(x+\\dfrac{\\pi}{2}\\right)=\\cos(x)$',
      },
      {
        texte: '$\\sin\\left(\\dfrac{\\pi}{2}-x\\right)=$',
        reponse: '\\cos(x)',
        texteCorr: '$\\sin\\left(\\dfrac{\\pi}{2}-x\\right)=\\cos(x)$',
      },
      {
        texte: '$\\cos\\big(-x\\big)=$',
        reponse: '\\cos(x)',
        texteCorr: '$\\cos(-x)=\\cos(x)$',
      },
      {
        texte: '$\\sin\\big(-x\\big)=$',
        reponse: '-\\sin(x)',
        texteCorr: '$\\sin(-x)=-\\sin(x)$',
      },
      {
        texte: '$\\cos\\big(\\pi-x\\big)=$',
        reponse: '-\\cos(x)',
        texteCorr: '$\\cos\\big(\\pi-x\\big)=-\\cos(x)$',
      },
      {
        texte: '$\\sin\\big(\\pi-x\\big)=$',
        reponse: '\\sin(x)',
        texteCorr: '$\\sin\\big(\\pi-x\\big)=\\sin(x)$',
      },
    ]
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    ) // Tous les types de questions sont posés mais l'ordre diffère à chaque "cycle"
    for (let i = 0, texte, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // Boucle principale où i+1 correspond au numéro de la question
      texte = listeTypeQuestions[i].texte
      handleAnswers(this, i, {
        reponse: {
          value: listeTypeQuestions[i].reponse,
          options: { fonction: true, variable: 'x', domaine: [0, 7] },
        },
      })
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.grecTrigo) // n'ajoute rien si on n'est pas en interactif
      if (!this.interactif) texte += '$\\ldots$'

      // Si la question n'a jamais été posée, on l'enregistre
      if (this.questionJamaisPosee(i, listeTypeQuestions[i].texte)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = listeTypeQuestions[i].texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
    if (!context.isHtml) {
      this.canEnonce =
        'Déterminer une écriture plus simple, en fonction de $\\cos(x)$ ou $\\sin(x)$.'
      this.correction = this.listeCorrections[0]
      this.canReponseACompleter = this.listeQuestions[0]
    }
  }
}
