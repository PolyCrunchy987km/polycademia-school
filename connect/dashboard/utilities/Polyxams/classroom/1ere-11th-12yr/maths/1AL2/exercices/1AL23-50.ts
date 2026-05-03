import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre, sp } from '../../lib/outils/outilString'
import {
  premierMultipleInferieur,
  premierMultipleSuperieur,
} from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Utiliser la représentation graphique d'un polynôme du second degré"
export const dateDeModifImportante = '13/11/2025'
export const interactifType = ['mathLive', 'qcm']
export const interactifReady = true

/**
 * @author Jean-Léon Henry (modifié par Éric Elter pour corriger exo et remplacer Repere et Courbe par Repere2 et Courbe2 (juillet 2022))
 * Éric Elter le rend interactif le 13/11/2025
 * Faire lire sur un graphique :
 * - le signe du coefficient dominant
 * - les racines
 * - les coordonnées du sommet et/ou la valeur de l'extremum
 * - les 3 trucs précédents

 */
export const uuid = 'a896e'

export const refs = {
  'fr-fr': ['1AL23-50'],
  'fr-ch': ['1mF3-1'],
}
export default class LireElementsCarac extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Type de questions ',
      4,
      '1 : Signe du coefficient dominant\n2 : Racines\n3 : Coordonnées du sommet\n4 : Mélange des trois type de questions',
    ]

    this.nbQuestions = 5 // Nombre de questions par défaut
    this.sup = 4
  }

  nouvelleVersion() {
    this.consigne = 'Répondre à '
    this.consigne += this.nbQuestions > 1 ? 'ces questions' : 'cette question'
    this.consigne += ' par lecture graphique.'
    const pixelsParCm = 20
    let typesDeQuestionsDisponibles
    if (this.sup < 4) typesDeQuestionsDisponibles = [parseInt(this.sup)]
    else typesDeQuestionsDisponibles = [1, 2, 3]
    const fName = []
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    let Ymin
    let Yscale
    let Ymax
    let Xmin
    let Xmax
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      fName.push(lettreMinusculeDepuisChiffre(i + 6))
      let texteCorr = ''
      let texte = ''
      const a = randint(-2, 2, 0) // On prend a au hasard quoi qu'il arrive
      let b: number, c: number
      let x1: number = 0
      let x2: number = 0
      let racines: number[] = []
      let absReponse = 0
      let ordReponse = 0
      // Générons les coefficients du trinôme, la consigne, la correction
      switch (listeTypeDeQuestions[i]) {
        case 1: // Signe du coefficient dominant
          texte = 'Quel est le signe du coefficient dominant'
          // On choisit 2 racines entières distinctes dans [-10;10]
          do {
            x1 = randint(-10, 10)
            x2 = randint(-10, 10, x1)
          } while (x1 * x2 > 0) // Flemme de coder la gestion d'une racine double
          // On fabrique les coeffs à partir des racines
          b = -a * (x1 + x2)
          c = x1 * x2 * a

          texteCorr = `La parabole est orientée vers le ${a < 0 ? 'bas' : 'haut'}, on en déduit que le coefficient dominant de $\\mathscr{${fName[i]}}$ est ${texteEnCouleurEtGras(a < 0 ? 'négatif' : 'positif')}.`
          break
        case 2: // Racines
          texte = 'Quelles sont les racines'
          // On choisit 2 racines entières distinctes dans [-10;10]
          do {
            x1 = randint(-10, 10)
            x2 = randint(-10, 10, x1)
          } while (x1 * x2 > 0) // Flemme de coder la gestion d'une racine double
          // On fabrique les coeffs à partir des racines
          b = -a * (x1 + x2)
          c = x1 * x2 * a
          racines = [x1, x2]
          texteCorr = `La courbe de $\\mathscr{${fName[i]}}$ coupe l'axe horizontal aux points $(${Math.min(x1, x2)};0)$ et $(${Math.max(x1, x2)};0)$. Les deux racines sont donc $${miseEnEvidence(Math.min(x1, x2))}$ et $${miseEnEvidence(Math.max(x1, x2))}$.`
          break
        case 3: // Coordonnées du sommet
        default:
          texte = 'Quelles sont les coordonnées du sommet'
          // On choisit le sommet au hasard
          absReponse = randint(-5, 5)
          ordReponse = randint(-5, 5)
          // On fabrique les coefficients
          b = -2 * a * absReponse
          c = a * absReponse ** 2 + ordReponse

          texteCorr = `Le sommet, c'est-à-dire le point le plus ${a > 0 ? 'bas' : 'haut'} de la parabole, a pour coordonnées $(${miseEnEvidence(absReponse)}~;~${miseEnEvidence(ordReponse)})$.`
          break
      }
      // Les coeffs sont générés, on peut donc créer la fonction
      const f = function (x: number) {
        return a * x ** 2 + b * x + c
      }
      texte += ` de la fonction polynomiale $\\mathscr{${fName[i]}}$ du second degré représentée ci-dessous ?<br>`
      if (this.interactif)
        switch (listeTypeDeQuestions[i]) {
          case 1:
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'positif',
                  statut: a > 0,
                  feedback: '',
                },
                {
                  texte: 'négatif',
                  statut: a < 0,
                  feedback: '',
                },
              ],
            }
            texte += propositionsQcm(this, i).texte
            break
          case 2:
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
              {
                texteAvant: 'Les racines sont : ',
                texteApres:
                  sp(4) + '(Séparer les racines par un point-virgule.)',
              },
            )
            handleAnswers(this, i, {
              reponse: {
                value: racines.join(';'),
                options: { suiteDeNombres: true },
              },
            })
            break
          case 3:
            texte +=
              'Les coordonnées du point recherché sont : ' +
              remplisLesBlancs(
                this,
                i,
                `$(%{champ1}~;~ %{champ2})`,
                KeyboardType.clavierNumbers,
              ) +
              '.'
            handleAnswers(this, i, {
              bareme: (listePoints) => [
                Math.min(listePoints[0], listePoints[1]),
                1,
              ],
              champ1: { value: absReponse },
              champ2: { value: ordReponse },
            })
        }
      /** Génération du graphique
       * a = randint(-2,2,0)
       * Q1,Q2 :
       *    deux racines dans [-9;9]
       * Q3 :
       *    le sommet dans le carré [-9;9]²
       */

      if (listeTypeDeQuestions[i] === 3) {
        Xmin = absReponse - 5
        Xmax = absReponse + 5
        Ymin = ordReponse - 5
        Ymax = ordReponse + 5
      } else {
        Xmin = Math.min(x1, x2) - 2
        Xmax = Math.max(x1, x2) + 2
        if (a < 0) {
          Ymax = Math.ceil(f(-b / (2 * a)) + 2)
          Ymin = f(Xmin)
        } else {
          Ymin = Math.floor(f(-b / (2 * a)) - 2)
          Ymax = f(Xmax)
        }
      }

      if (Ymax - Ymin < 10) Yscale = 2
      else
        Yscale =
          Math.max(1, Math.round(Math.ceil((Ymax - Ymin) / 10) / 5) * 5) * 2
      if (listeTypeDeQuestions[i] === 3) {
        // Nécessaire pour permettre la lecture graphique
        Yscale = 1
      }
      const r = repere({
        xMin: Xmin,
        yMin: premierMultipleInferieur(Yscale, Ymin),
        yMax: premierMultipleSuperieur(Yscale, Ymax),
        xMax: Xmax,
        yUnite: 1 / Yscale,
        yThickDistance: Yscale,
        grilleYDistance: Yscale,
        yLabelEcart: 0.8,
      })

      const svgYmin = Math.min(Ymin / Yscale, -1)
      const svgYmax = Math.max(Ymax / Yscale, 1)

      const F = (x: number) => a * x ** 2 + b * x + c
      const objets = [
        r,
        courbe(F, {
          repere: r,
          xMin: Xmin,
          xMax: Xmax,
          color: 'blue',
          epaisseur: 1.5,
        }),
      ]
      texte += mathalea2d(
        {
          xmin: Xmin - 1,
          xmax: Xmax + 1,
          ymin: svgYmin,
          ymax: svgYmax + 2,
          pixelsParCm,
          scale: 0.6,
        },
        objets,
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
