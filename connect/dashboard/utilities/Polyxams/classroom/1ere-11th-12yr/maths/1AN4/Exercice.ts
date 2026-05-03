import type Figure from 'apigeom/src/Figure'
import type Decimal from 'decimal.js'
import {
  KeyboardType,
  type PartialKbType,
} from '../lib/interactif/claviers/keyboard'
import type {
  AnswerValueType,
  AutoCorrection,
  ClickFigures,
  CompareFunction,
  IDragAndDrop,
  IExercice,
  IExerciceSimple,
  InteractivityType,
  OldFormatInteractifType,
  OptionsComparaisonType,
  Valeur,
} from '../lib/types'
import type { IFractionEtendue } from '../modules/FractionEtendue.type'
import {
  exportedApplyNewSeed,
  exportedNouvelleVersionWrapper,
  exportedQuestionJamaisPosee,
  exportedReinit,
} from './exerciseMethods'

/**
 *
 *  Classe parente de tous les exercices.
 *
 * @author Rémi Angot
 */
export default class Exercice implements IExercice {
  titre: string
  id?: string
  uuid!: string
  sup: any
  sup2: any
  sup3: any
  sup4: any
  sup5: any
  exoCustomResultat?: boolean // Lorsqu'il est à true, correctionInteractive renvoie un tableau de string ce qui permet à une question de rapporter plusieurs points
  duree?: number
  seed?: string
  numeroExercice?: number
  typeExercice?: string
  duration?: number
  // boutonAide: boolean | HTMLButtonElement
  consigne: string
  consigneCorrection: string
  introduction: string
  listeQuestions: string[] = []
  listeCorrections: string[] = []
  listeCanReponsesACompleter: string[] = []
  listeCanEnonces: string[] = []
  listeCanLiees: number[][] = []
  listeCanNumerosLies: number[] = []
  question?: string // Seulement pour les exercices de type simple
  reponse?: AnswerValueType | Valeur // Seulement pour les exercices de type simple
  correction?: string // Seulement pour les exercices de type simple
  canOfficielle?: boolean = false
  canEnonce?: string // Seulement pour les exercices de type simple ??? NON ! NOTE de Jena-claude Lhote du 2/02/2025 : et pourquoi ça ???
  // On peut être amené à utiliser un Exercice non simple à une seule question dans une can, parce qu'il a 3 champs et une correction custom.
  // Et vouloir un this.canEnonce sur cet exercice, pour le document CAN !
  canReponseACompleter: string = '' // Seulement pour les exercices de type simple
  canNumeroLie: number = 0 //  Pour la sortie LaTeX des CAN dont les énoncés sont liées, cette variable contient le numéro de la question actuelle.
  canLiee: number[] = [] //  Pour la sortie LaTeX des CAN dont les énoncés sont liées, cette variable contient, dans un tableau, les numéros des CAN liées à l'actuelle.
  formatChampTexte: string | undefined | PartialKbType =
    KeyboardType.clavierDeBase // Seulement pour les exercices de type simple

  optionsChampTexte?: object // Seulement pour les exercices de type simple
  // tailleDiaporama?: number // Pour fixer un zoom de base en mode diaporama
  compare?: CompareFunction // Seulement pour les exercices de type simple

  // optionsDeComparaison?: { [key in keyof OptionsComparaisonType]?: boolean }
  optionsDeComparaison?: Partial<OptionsComparaisonType>
  formatInteractif?: InteractivityType | OldFormatInteractifType // Options par défaut pour les champs Mathlive (très utile dans les exercices simples)
  contenu?: string
  contenuCorrection?: string
  autoCorrection: AutoCorrection[]
  figures?: Figure[] | ClickFigures[]
  amcReady?: boolean
  amcType?: string
  tableauSolutionsDuQcm?: object[]
  spacing: number
  spacingCorr: number
  pasDeVersionLatex: boolean
  listePackages?: string[]
  consigneModifiable: boolean
  nbQuestionsModifiable: boolean
  nbCols: number // Nombre de colonnes pour la sortie LaTeX
  nbColsCorr: number
  nbColsModifiable: boolean
  nbColsCorrModifiable: boolean
  spacingModifiable: boolean
  spacingCorrModifiable: boolean
  listeAvecNumerotation?: boolean
  beamer: boolean
  nbQuestions: number
  pointsParQuestions: number
  correctionDetailleeDisponible: boolean
  correctionDetaillee: boolean
  correctionIsCachee: boolean
  video: string
  interactif: boolean // l'exercice est affiché en mode interactif si `true`
  interactifObligatoire: boolean
  interactifReady: boolean // flag pour indiquer si l'exercice est dispo en interactif ou pas
  interactifType?: string
  besoinFormulaireNumerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]

  besoinFormulaireTexte: boolean | [string, string]
  besoinFormulaireCaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire2Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]

  besoinFormulaire2Texte: boolean | [string, string]
  besoinFormulaire2CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire3Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]

  besoinFormulaire3Texte: boolean | [string, string]
  besoinFormulaire3CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire4Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]

  besoinFormulaire4Texte: boolean | [string, string]
  besoinFormulaire4CaseACocher: boolean | [string] | [string, boolean]
  besoinFormulaire5Numerique:
    | boolean
    | [titre: string, max: number, tooltip: string]
    | [titre: string, max: number]

  besoinFormulaire5Texte: boolean | [string, string]
  besoinFormulaire5CaseACocher: boolean | [string] | [string, boolean]
  listeArguments: string[] // Variable servant à comparer les exercices pour ne pas avoir deux exercices identiques
  lastCallback: string // La dernière signature de listeArguments afin de comparaison : permet d'éviter un nouvelleVersionWrapper inutile
  checkSum?: string // Empreinte CRC32 des questions de l'exercice pour comparaison rapide
  examen?: string // Pour les exercices statiques
  mois?: string // Pour les exercices statiques
  annee?: string // Pour les exercices statiques
  lieu?: string // Pour les exercices statiques
  content?: string // Pour les exercices statiques
  contentCorr?: string // Pour les exercices statiques
  comment?: string // Commentaire facultatif de l'auteur de l'exercice
  answers?: { [key: string]: string } // Réponses de l'élève
  dragAndDrops?: IDragAndDrop[]
  isDone?: boolean
  private _html: HTMLElement = document.createElement('div')
  score?: number
  vspace?: number // Ajoute un \vspace{[number]cm} avant l'énoncé ce qui peut être pratique pour des exercices avec des figures.

  constructor() {
    // ////////////////////////////////////////////////
    // Autour de l'exercice
    // ////////////////////////////////////////////////
    this.titre = '' // Chaîne de caractère sans point à la fin. C'est le titre de l'exercice qui sera affiché avec la référence dans le générateur d'exercices.

    // ///////////////////////////////////////////////
    // Construction de l'exercice
    // ///////////////////////////////////////////////
    this.consigne = '' // Chaîne de caractère qui apparaît en gras au-dessus des questions de préférence à l'infinitif et AVEC point à la fin.
    this.consigneCorrection = '' // Chaîne de caractère en général vide qui apparaît au-dessus des corrections.
    this.introduction = '' // Texte qui n'est pas forcément en gras et qui apparaît entre la consigne et les questions.

    this.listeQuestions = []
    this.listeCorrections = [] // Idem avec la correction.
    this.contenu = '' // Chaîne de caractères avec tout l'énoncé de l'exercice construit à partir de `this.listeQuestions` suivant le `context`
    this.contenuCorrection = '' // Idem avec la correction
    this.autoCorrection = [] // Liste des objets par question pour correction interactive || export AMC.
    this.tableauSolutionsDuQcm = [] // Pour sauvegarder les solutions des QCM.

    // ///////////////////////////////////////////////
    // Mise en forme de l'exercice
    // ///////////////////////////////////////////////
    this.spacing = 1 // Interligne des questions
    this.spacingCorr = 1 // Interligne des réponses

    // ////////////////////////////////////////////
    // Gestion de la sortie LateX
    // ////////////////////////////////////////////
    this.pasDeVersionLatex = false // booléen qui indique qu'une sortie LateX est impossible.
    this.consigneModifiable = true // booléen pour déterminer si la consigne est modifiable en ligne dans la sortie LaTeX.
    this.nbQuestionsModifiable = true // booléen pour déterminer si le nombre de questions est modifiable en ligne.
    this.nbCols = 1 // Nombre de colonnes pour la sortie LaTeX des questions (environnement multicols).
    this.nbColsCorr = 1 // Nombre de colonnes pour la sortie LaTeX des réponses (environnement multicols).
    this.nbColsModifiable = true // booléen pour déterminer si le nombre de colonnes est modifiable en ligne dans la sortie LaTeX.
    this.nbColsCorrModifiable = true // booléen pour déterminer si le nombre de colonnes de la correction est modifiable en ligne dans la sortie LaTeX.
    this.spacingModifiable = true // booléen pour déterminer si l'espacement est modifiable en ligne dans la sortie LaTeX.
    this.spacingCorrModifiable = true // booléen pour déterminer si l'espacement est modifiable en ligne dans la sortie LaTeX.

    // ////////////////////////////////////////////
    // Gestion de la sortie autre que LateX
    // ////////////////////////////////////////////
    this.beamer = false // booléen pour savoir si la sortie devra être un diaporama beamer

    // ////////////////////////////////////////////
    // Paramètres
    // ////////////////////////////////////////////
    this.nbQuestions = 10 // Nombre de questions par défaut (récupéré dans l'url avec le paramètre `,n=`)
    this.pointsParQuestions = 1 // Pour définir la note par défaut d'un exercice dans sa sortie Moodle
    this.correctionDetailleeDisponible = false // booléen qui indique si une correction détaillée est disponible.
    this.correctionDetaillee = true // booléen indiquant si la correction détaillée doit être affiché par défaut (récupéré dans l'url avec le paramètre `,cd=`).
    this.correctionIsCachee = false // pour cacher une correction
    this.video = '' // Chaine de caractère pour un complément numérique (id Youtube, url, code iframe...).
    // Interactivité
    this.interactif = false // Exercice sans saisie utilisateur par défaut.
    this.interactifReady = false // Exercice sans saisie utilisateur par défaut.
    this.interactifObligatoire = false // Certains exercices sont uniquement des QCM et n'ont pas de version non interactive.
    // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup ou dans le paramètre d'url ',s='
    this.besoinFormulaireNumerique = false // Sinon this.besoinFormulaireNumerique = [texte, max, tooltip facultatif]
    this.besoinFormulaireTexte = false // Sinon this.besoinFormulaireTexte = [texte, tooltip]
    this.besoinFormulaireCaseACocher = false // Sinon this.besoinFormulaireCaseACocher = [texte]
    // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup2 ou dans le paramètre d'url ',s2='
    this.besoinFormulaire2Numerique = false // Sinon this.besoinFormulaire2Numerique = [texte, max, tooltip facultatif]
    this.besoinFormulaire2Texte = false // Sinon this.besoinFormulaire2Texte = [texte, tooltip]
    this.besoinFormulaire2CaseACocher = false // Sinon this.besoinFormulaire2CaseACocher = [texte]
    // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup3 ou dans le paramètre d'url ',s3='
    this.besoinFormulaire3Numerique = false // Sinon this.besoinFormulaire3Numerique = [texte, max, tooltip facultatif]
    this.besoinFormulaire3Texte = false // Sinon this.besoinFormulaire3Texte = [texte, tooltip]
    this.besoinFormulaire3CaseACocher = false // Sinon this.besoinFormulaire3CaseACocher = [texte]
    // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup4 ou dans le paramètre d'url ',s4='
    this.besoinFormulaire4Numerique = false // Sinon this.besoinFormulaire4Numerique = [texte, max, tooltip facultatif]
    this.besoinFormulaire4Texte = false // Sinon this.besoinFormulaire4Texte = [texte, tooltip]
    this.besoinFormulaire4CaseACocher = false // Sinon this.besoinFormulaire4CaseACocher = [texte]
    // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup4 ou dans le paramètre d'url ',s5='
    this.besoinFormulaire5Numerique = false // Sinon this.besoinFormulaire5Numerique = [texte, max, tooltip facultatif]
    this.besoinFormulaire5Texte = false // Sinon this.besoinFormulaire5Texte = [texte, tooltip]
    this.besoinFormulaire5CaseACocher = false // Sinon this.besoinFormulaire5CaseACocher = [texte]

    // ///////////////////////////////////////////////
    // Exercice avec des dépendances particulières
    // ///////////////////////////////////////////////
    // this.typeExercice = 'Scratch' // Pour charger Scratchblocks.
    // this.typeExercice = 'dnb' // Ce n'est pas un exercice aléatoire il est traité différemment. Les exercices DNB sont des images pour la sortie Html et du code LaTeX statique pour la sortie latex.
    // this.typeExercice = 'simple' // Pour les exercices plus simples destinés aux courses aux nombres

    this.listeArguments = [] // Variable servant à comparer les exercices pour ne pas avoir deux exercices identiques
    this.lastCallback = ''
    this.answers = {}
    this.listeAvecNumerotation = true
  }

  get html(): HTMLElement {
    return this._html
  }

  set html(value: HTMLElement) {
    this._html = value
  }

  get key(): string {
    return [
      this.nbQuestions,
      this.interactif,
      this.sup,
      this.sup2,
      this.sup3,
      this.sup4,
      this.sup5,
      this.seed,
      this.correctionDetaillee,
    ].join('_')
  }

  destroy(): void {
    // Nécessaire pour éviter les fuites de mémoire des exercices HTML
  }

  nouvelleVersionWrapper = exportedNouvelleVersionWrapper.bind(
    this as IExercice,
  )

  correctionInteractive?(i: number): string | string[]

  nouvelleVersion(numeroExercice?: number, numeroQuestion?: number): void {
    console.info(numeroExercice)
  }

  reinit = exportedReinit.bind(this as unknown as IExerciceSimple)

  applyNewSeed = exportedApplyNewSeed.bind(this as IExercice)

  questionJamaisPosee = (
    i: number,
    ...args: (string | number | IFractionEtendue | Decimal)[]
  ): boolean => {
    return (
      exportedQuestionJamaisPosee.bind(this as IExercice)(i, ...args) || false
    )
  }
}
