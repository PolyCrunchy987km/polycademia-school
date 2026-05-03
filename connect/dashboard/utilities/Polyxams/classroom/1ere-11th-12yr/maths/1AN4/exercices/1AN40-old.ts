import { cercleTrigo } from '../../lib/2d/angles'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { setReponse } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Angle, valeursTrigo } from '../../lib/mathFonctions/Angle'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser les valeurs remarquables  du cosinus et sinus'
export const interactifReady = true
export const interactifType = 'mathLive'
// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '16/04/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '12/01/2024'
/**
 * donner les valeurs remarquables du cosinus et du sinus avec trois niveaux :
 * 1 : quart de cercle trigo, 2 : avec les angles associés, 3 : avec les angles modulo 2kpi.
 * @author Stéphane Guyon - Jean-claude Lhote - Loïc Geeraerts
 */

export const uuid = '4e684'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CosEtsin extends Exercice {
  can: boolean
  constructor() {
    super()
    this.can = false
    this.consigne = 'Déterminer la valeur exacte de :'
    this.nbQuestions = 3 // Nombre de questions par défaut
    this.nbCols = 2 // Uniquement pour la sortie LaTeX
    this.nbColsCorr = 2 // Uniquement pour la sortie LaTeX

    this.sup = 1 // difficulté par défaut
    this.sup2 = '-1,1'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Quart de cercle trigo',
        '2 : Avec les angles associés',
        '3 : Avec en plus des angles modulo k × 360',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire2Texte = [
      'Valeurs de k (pour le type de questions 3)',
      'Valeurs entières non nulles séparées par des virgules',
    ]
    // TODO: ajouter tangente avec paramètre caché
    // TODO: ajouter cercle trigonométrique
    // TODO: solutionnaire détaillé
    // TODO: Peut-être mettre en paramètre l'étendue des modulos pour avoir un contrôle sur le niveau de difficulté
  }

  nouvelleVersion() {
    const mesAnglesAleatoiresBis: Angle[][] = [[]]
    let typeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: 1,
    }).map(Number)

    if (typeDeQuestions.includes(1))
      this.nbQuestions = Math.min(this.nbQuestions, 10 * typeDeQuestions.length) // on bride car il n'y a que 10 questions différentes au niveau 1
    else if (typeDeQuestions.includes(2))
      this.nbQuestions = Math.min(this.nbQuestions, 26 * typeDeQuestions.length) // Le bridage est un peu plus large pour le niveau 2
    else
      this.nbQuestions = Math.min(
        this.nbQuestions,
        126 * typeDeQuestions.length,
      ) // là c'est carrément l'opulence avec le niveau 3 !

    let listeK = [-1, 1]

    const mesAngles = valeursTrigo({ modulos: listeK })
    mesAnglesAleatoiresBis.push(shuffle(mesAngles.liste1))
    mesAnglesAleatoiresBis.push(shuffle(mesAngles.liste2))
    const valeursDek = this.sup2.toString(10)

    listeK = valeursDek.includes(',') ? valeursDek.split(',') : [this.sup2]

    for (let k = 0; k < listeK.length; k++) {
      const n = listeK[k]
      if (n !== 0 && listeK.indexOf(n) === -1) {
        listeK[k] = n
      }
    }
    mesAnglesAleatoiresBis.push(shuffle(mesAngles.liste3))
    const typeQuestionsDisponibles: ['cos' | 'sin', Angle][][] = [
      [],
      [],
      [],
      [],
    ]

    for (let i = 0; i < mesAnglesAleatoiresBis[1].length; i++) {
      typeQuestionsDisponibles[1].push(['cos', mesAnglesAleatoiresBis[1][i]])
      typeQuestionsDisponibles[1].push(['sin', mesAnglesAleatoiresBis[1][i]])
    }
    for (let i = 0; i < mesAnglesAleatoiresBis[2].length; i++) {
      typeQuestionsDisponibles[2].push(['cos', mesAnglesAleatoiresBis[2][i]])
      typeQuestionsDisponibles[2].push(['sin', mesAnglesAleatoiresBis[2][i]])
    }
    for (let i = 0; i < mesAnglesAleatoiresBis[3].length; i++) {
      typeQuestionsDisponibles[3].push(['cos', mesAnglesAleatoiresBis[3][i]])
      typeQuestionsDisponibles[3].push(['sin', mesAnglesAleatoiresBis[3][i]])
    }

    typeQuestionsDisponibles[1] = combinaisonListes(
      typeQuestionsDisponibles[1],
      10,
    )
    typeQuestionsDisponibles[2] = combinaisonListes(
      typeQuestionsDisponibles[2],
      26,
    )
    typeQuestionsDisponibles[3] = combinaisonListes(
      typeQuestionsDisponibles[3],
      126,
    )

    typeDeQuestions = combinaisonListes(typeDeQuestions, this.nbQuestions)
    const listeTypeQuestions = []
    const compteur = [0, 0, 0, 0]
    for (let i = 0; i < this.nbQuestions; i++) {
      listeTypeQuestions.push(
        typeQuestionsDisponibles[typeDeQuestions[i]][
          compteur[typeDeQuestions[i]]
        ],
      )
      compteur[typeDeQuestions[i]]++
    }

    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 127;
    ) {
      const monAngle = listeTypeQuestions[i][1]
      texte = `$\\${listeTypeQuestions[i][0]}\\left(${monAngle.radians}\\right)$`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
        texteAvant: ' = ',
      })
      texteCorr = `$\\${listeTypeQuestions[i][0]}\\left(${monAngle.radians}\\right)`
      let valeurFonction = ''
      // listeTypeQuestions[i][0] contient 'cos' ou 'sin', donc ça permet d'atteindre la propriété souhaitée dans l'objet Angle.
      // monAngle[listeTypeQuestions[i][0]] fait référence à monAngle.cos ou à monAngle.sin selon la valeur de listeTypeQuestions[i][0].

      setReponse(this, i, monAngle[listeTypeQuestions[i][0]])
      // dans quelques cas, les valeurs de cos et sin sont multiples et contenues dans une liste avec en premier '1/2', en deuxième la valeur décimale '0.5'
      valeurFonction = Array.isArray(monAngle[listeTypeQuestions[i][0]])
        ? monAngle[listeTypeQuestions[i][0]][0]
        : (monAngle[listeTypeQuestions[i][0]] as string)
      texteCorr += `=${miseEnEvidence(valeurFonction)}$`

      texteCorr += '<br><br>'
      texteCorr += cercleTrigo(monAngle, listeTypeQuestions[i][0])

      // Si la question n'a jamais été posée, on l'enregistre
      if (
        this.questionJamaisPosee(
          i,
          listeTypeQuestions[i][0][0],
          listeTypeQuestions[i][1].radians,
        )
      ) {
        // On regarde l'angle en radian et le type de fonction
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this) // On envoie l'exercice à la fonction de mise en page
    if (!context.isHtml) {
      this.canEnonce =
        'Donner la valeur exacte de ' + this.listeQuestions[0] + '.'
      this.correction = this.listeCorrections[0]

      for (const enonce of this.listeQuestions) {
        this.listeCanEnonces.push('Donner la valeur exacte de ' + enonce + '.')
      }
    }
  }
}
