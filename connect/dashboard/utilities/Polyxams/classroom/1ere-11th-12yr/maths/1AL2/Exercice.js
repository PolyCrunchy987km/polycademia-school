import { KeyboardType, } from '../lib/interactif/claviers/keyboard';
import { exportedApplyNewSeed, exportedNouvelleVersionWrapper, exportedQuestionJamaisPosee, exportedReinit, } from './exerciseMethods';
/**
 *
 *  Classe parente de tous les exercices.
 *
 * @author Rémi Angot
 */
export default class Exercice {
    constructor() {
        this.listeQuestions = [];
        this.listeCorrections = [];
        this.listeCanReponsesACompleter = [];
        this.listeCanEnonces = [];
        this.listeCanLiees = [];
        this.listeCanNumerosLies = [];
        this.canOfficielle = false;
        // On peut être amené à utiliser un Exercice non simple à une seule question dans une can, parce qu'il a 3 champs et une correction custom.
        // Et vouloir un this.canEnonce sur cet exercice, pour le document CAN !
        this.canReponseACompleter = ''; // Seulement pour les exercices de type simple
        this.canNumeroLie = 0; //  Pour la sortie LaTeX des CAN dont les énoncés sont liées, cette variable contient le numéro de la question actuelle.
        this.canLiee = []; //  Pour la sortie LaTeX des CAN dont les énoncés sont liées, cette variable contient, dans un tableau, les numéros des CAN liées à l'actuelle.
        this.formatChampTexte = KeyboardType.clavierDeBase; // Seulement pour les exercices de type simple
        this._html = document.createElement('div');
        this.nouvelleVersionWrapper = exportedNouvelleVersionWrapper.bind(this);
        this.reinit = exportedReinit.bind(this);
        this.applyNewSeed = exportedApplyNewSeed.bind(this);
        this.questionJamaisPosee = (i, ...args) => {
            return (exportedQuestionJamaisPosee.bind(this)(i, ...args) || false);
        };
        // ////////////////////////////////////////////////
        // Autour de l'exercice
        // ////////////////////////////////////////////////
        this.titre = ''; // Chaîne de caractère sans point à la fin. C'est le titre de l'exercice qui sera affiché avec la référence dans le générateur d'exercices.
        // ///////////////////////////////////////////////
        // Construction de l'exercice
        // ///////////////////////////////////////////////
        this.consigne = ''; // Chaîne de caractère qui apparaît en gras au-dessus des questions de préférence à l'infinitif et AVEC point à la fin.
        this.consigneCorrection = ''; // Chaîne de caractère en général vide qui apparaît au-dessus des corrections.
        this.introduction = ''; // Texte qui n'est pas forcément en gras et qui apparaît entre la consigne et les questions.
        this.listeQuestions = [];
        this.listeCorrections = []; // Idem avec la correction.
        this.contenu = ''; // Chaîne de caractères avec tout l'énoncé de l'exercice construit à partir de `this.listeQuestions` suivant le `context`
        this.contenuCorrection = ''; // Idem avec la correction
        this.autoCorrection = []; // Liste des objets par question pour correction interactive || export AMC.
        this.tableauSolutionsDuQcm = []; // Pour sauvegarder les solutions des QCM.
        // ///////////////////////////////////////////////
        // Mise en forme de l'exercice
        // ///////////////////////////////////////////////
        this.spacing = 1; // Interligne des questions
        this.spacingCorr = 1; // Interligne des réponses
        // ////////////////////////////////////////////
        // Gestion de la sortie LateX
        // ////////////////////////////////////////////
        this.pasDeVersionLatex = false; // booléen qui indique qu'une sortie LateX est impossible.
        this.consigneModifiable = true; // booléen pour déterminer si la consigne est modifiable en ligne dans la sortie LaTeX.
        this.nbQuestionsModifiable = true; // booléen pour déterminer si le nombre de questions est modifiable en ligne.
        this.nbCols = 1; // Nombre de colonnes pour la sortie LaTeX des questions (environnement multicols).
        this.nbColsCorr = 1; // Nombre de colonnes pour la sortie LaTeX des réponses (environnement multicols).
        this.nbColsModifiable = true; // booléen pour déterminer si le nombre de colonnes est modifiable en ligne dans la sortie LaTeX.
        this.nbColsCorrModifiable = true; // booléen pour déterminer si le nombre de colonnes de la correction est modifiable en ligne dans la sortie LaTeX.
        this.spacingModifiable = true; // booléen pour déterminer si l'espacement est modifiable en ligne dans la sortie LaTeX.
        this.spacingCorrModifiable = true; // booléen pour déterminer si l'espacement est modifiable en ligne dans la sortie LaTeX.
        // ////////////////////////////////////////////
        // Gestion de la sortie autre que LateX
        // ////////////////////////////////////////////
        this.beamer = false; // booléen pour savoir si la sortie devra être un diaporama beamer
        // ////////////////////////////////////////////
        // Paramètres
        // ////////////////////////////////////////////
        this.nbQuestions = 10; // Nombre de questions par défaut (récupéré dans l'url avec le paramètre `,n=`)
        this.pointsParQuestions = 1; // Pour définir la note par défaut d'un exercice dans sa sortie Moodle
        this.correctionDetailleeDisponible = false; // booléen qui indique si une correction détaillée est disponible.
        this.correctionDetaillee = true; // booléen indiquant si la correction détaillée doit être affiché par défaut (récupéré dans l'url avec le paramètre `,cd=`).
        this.correctionIsCachee = false; // pour cacher une correction
        this.video = ''; // Chaine de caractère pour un complément numérique (id Youtube, url, code iframe...).
        // Interactivité
        this.interactif = false; // Exercice sans saisie utilisateur par défaut.
        this.interactifReady = false; // Exercice sans saisie utilisateur par défaut.
        this.interactifObligatoire = false; // Certains exercices sont uniquement des QCM et n'ont pas de version non interactive.
        // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup ou dans le paramètre d'url ',s='
        this.besoinFormulaireNumerique = false; // Sinon this.besoinFormulaireNumerique = [texte, max, tooltip facultatif]
        this.besoinFormulaireTexte = false; // Sinon this.besoinFormulaireTexte = [texte, tooltip]
        this.besoinFormulaireCaseACocher = false; // Sinon this.besoinFormulaireCaseACocher = [texte]
        // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup2 ou dans le paramètre d'url ',s2='
        this.besoinFormulaire2Numerique = false; // Sinon this.besoinFormulaire2Numerique = [texte, max, tooltip facultatif]
        this.besoinFormulaire2Texte = false; // Sinon this.besoinFormulaire2Texte = [texte, tooltip]
        this.besoinFormulaire2CaseACocher = false; // Sinon this.besoinFormulaire2CaseACocher = [texte]
        // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup3 ou dans le paramètre d'url ',s3='
        this.besoinFormulaire3Numerique = false; // Sinon this.besoinFormulaire3Numerique = [texte, max, tooltip facultatif]
        this.besoinFormulaire3Texte = false; // Sinon this.besoinFormulaire3Texte = [texte, tooltip]
        this.besoinFormulaire3CaseACocher = false; // Sinon this.besoinFormulaire3CaseACocher = [texte]
        // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup4 ou dans le paramètre d'url ',s4='
        this.besoinFormulaire4Numerique = false; // Sinon this.besoinFormulaire4Numerique = [texte, max, tooltip facultatif]
        this.besoinFormulaire4Texte = false; // Sinon this.besoinFormulaire4Texte = [texte, tooltip]
        this.besoinFormulaire4CaseACocher = false; // Sinon this.besoinFormulaire4CaseACocher = [texte]
        // Ajoute un formulaire de paramétrage par l'utilisateur récupéré via this.sup4 ou dans le paramètre d'url ',s5='
        this.besoinFormulaire5Numerique = false; // Sinon this.besoinFormulaire5Numerique = [texte, max, tooltip facultatif]
        this.besoinFormulaire5Texte = false; // Sinon this.besoinFormulaire5Texte = [texte, tooltip]
        this.besoinFormulaire5CaseACocher = false; // Sinon this.besoinFormulaire5CaseACocher = [texte]
        // ///////////////////////////////////////////////
        // Exercice avec des dépendances particulières
        // ///////////////////////////////////////////////
        // this.typeExercice = 'Scratch' // Pour charger Scratchblocks.
        // this.typeExercice = 'dnb' // Ce n'est pas un exercice aléatoire il est traité différemment. Les exercices DNB sont des images pour la sortie Html et du code LaTeX statique pour la sortie latex.
        // this.typeExercice = 'simple' // Pour les exercices plus simples destinés aux courses aux nombres
        this.listeArguments = []; // Variable servant à comparer les exercices pour ne pas avoir deux exercices identiques
        this.lastCallback = '';
        this.answers = {};
        this.listeAvecNumerotation = true;
    }
    get html() {
        return this._html;
    }
    set html(value) {
        this._html = value;
    }
    get key() {
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
        ].join('_');
    }
    destroy() {
        // Nécessaire pour éviter les fuites de mémoire des exercices HTML
    }
    nouvelleVersion(numeroExercice, numeroQuestion) {
        console.info(numeroExercice);
    }
}
