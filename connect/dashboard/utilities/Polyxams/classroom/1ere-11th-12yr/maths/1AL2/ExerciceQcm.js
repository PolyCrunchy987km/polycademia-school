import { qcmCamExport } from '../lib/amc/qcmCam';
import { buildQcmForExercise } from '../lib/interactif/qcmBuilder';
import { context } from '../modules/context';
import Exercice from './Exercice';
// export const uuid = 'UUID à modifier'
// export const titre = 'Titre de l'exercice à modifier'
// export const refs = [{'fr-fr',['ref française à renseigner']},{'fr-ch', ['ref suisse à renseigner']}]
export const interactifReady = true;
export const interactifType = 'qcm';
export const amcReady = 'true';
export const amcType = 'qcmMono';
export const nombreElementsDifferents = (liste) => {
    const elements = new Set(liste);
    return elements.size;
};
// class à utiliser pour fabriquer des Qcms sans aléatoirisation (en cas d'aléatoirisation, on utilisera ExerciceQcmA à la place)
export default class ExerciceQcm extends Exercice {
    constructor() {
        super();
        this.versionQcmDisponible = true;
        this.ajouteQcmCorr = false; // Pour savoir si on ajoute le qcm corrigé à la fin de la correction.
        this.versionOriginale = undefined;
        this.besoinFormulaire2CaseACocher = ['Consigne augmentée', false];
        this.sup2 = false;
        // Il n'est pas prévu d'avoir plus d'une question car ceci est prévu pour un seul énoncé statique à la base même si on pourra changer les valeurs et prévoir une aléatoirisation
        this.nbQuestions = 1;
        this.nbQuestionsModifiable = false;
        this.spacingCorr = 2; // idem pour la correction
        // Les options pour le qcm à modifier éventuellement (vertical à true pour les longues réponses par exemple)
        this.options = { vertical: false, ordered: false, lastChoice: 8 };
        this.enonce = '';
        this.reponses = [];
        this.correction = '';
    }
    nouvelleVersion() {
        var _a, _b, _c;
        if (this.sup2) {
            this.consigne =
                this.bonnesReponses == null
                    ? `Parmi les ${this.reponses.length} réponses ci-dessous, une seule est correcte.<br>
${this.interactif || context.isAmc ? 'Cocher la case correspondante' : 'Donner la lettre correspondante'}${this.sup4 ? ', ou choisir « Je ne sais pas ».' : '.'}`
                    : `Parmi les ${this.reponses.length} réponses ci-dessous, il peut y avoir plusieurs bonnes réponses.<br>
${this.interactif || context.isAmc ? 'Cocher la (ou les) case(s) correspondante(s)' : 'Donner la (ou les) lettre(s) correspondante(s)'}${this.sup4 ? ', ou choisir « Je ne sais pas ».' : '.'}`;
        }
        else {
            this.consigne = '';
        }
        const statuts = [];
        if (this.bonnesReponses == null) {
            statuts.fill(false, 0, this.reponses.length - 1);
            statuts[0] = true;
        }
        else {
            for (let k = 0; k < this.reponses.length; k++) {
                statuts[k] = (_a = this.bonnesReponses[k]) !== null && _a !== void 0 ? _a : false;
            }
        }
        if (this.versionAleatoire != null) {
            for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30;) {
                if (this.sup && this.versionOriginale != null)
                    this.versionOriginale();
                else
                    this.versionAleatoire();
                const bonneReponse = this.reponses[0];
                if (this.questionJamaisPosee(i, bonneReponse)) {
                    const qcmData = buildQcmForExercise(this, i, {
                        question: this.enonce,
                        correction: this.correction,
                        propositions: this.reponses.map((reponse, index) => {
                            var _a;
                            return ({
                                texte: reponse,
                                statut: statuts[index],
                                correction: (_a = this.corrections) === null || _a === void 0 ? void 0 : _a[index],
                            });
                        }),
                        options: Object.assign(Object.assign({}, this.options), { dontKnow: (_b = this.options.dontKnow) !== null && _b !== void 0 ? _b : this.sup4 }),
                        ajouteQcmCorr: this.ajouteQcmCorr,
                        messageMode: this.bonnesReponses == null ? 'single' : 'multiple',
                    });
                    this.listeQuestions[i] = qcmData.question;
                    this.listeCorrections[i] = qcmData.correction;
                    i++;
                }
                cpt++;
                if (this.sup)
                    break; // Si on a coché pour la version originale, il n'y aura qu'une seule question
            }
        }
        else {
            if (this.versionOriginale != null)
                this.versionOriginale();
            const qcmData = buildQcmForExercise(this, 0, {
                question: this.enonce,
                correction: this.correction,
                propositions: this.reponses.map((reponse, index) => {
                    var _a;
                    return ({
                        texte: reponse,
                        statut: statuts[index],
                        correction: (_a = this.corrections) === null || _a === void 0 ? void 0 : _a[index],
                    });
                }),
                options: Object.assign(Object.assign({}, this.options), { dontKnow: (_c = this.options.dontKnow) !== null && _c !== void 0 ? _c : this.sup4 }),
                ajouteQcmCorr: this.ajouteQcmCorr,
                messageMode: this.bonnesReponses == null ? 'single' : 'multiple',
            });
            this.listeQuestions[0] = qcmData.question;
            this.listeCorrections[0] = qcmData.correction;
        }
    }
    // Pour permettre d'exporter tous les qcm pour en faire des séries de questions pour QcmCam. Ne pas y toucher
    qcmCamExport() {
        return qcmCamExport(this);
    }
}
