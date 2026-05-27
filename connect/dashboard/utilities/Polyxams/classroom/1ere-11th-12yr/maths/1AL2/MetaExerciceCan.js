import Decimal from 'decimal.js';
import { fonctionComparaison } from '../lib/interactif/comparisonFunctions';
import { handleAnswers } from '../lib/interactif/gestionInteractif';
import { propositionsQcm } from '../lib/interactif/qcm';
import { ajouteChampTexteMathLive, remplisLesBlancs, } from '../lib/interactif/questionMathLive';
import { Complexe } from '../lib/mathFonctions/Complexe';
import { combinaisonListes, shuffle } from '../lib/outils/arrayOutils';
import { range1 } from '../lib/outils/nombres';
import FractionEtendue from '../modules/FractionEtendue';
import Grandeur from '../modules/Grandeur';
import Hms from '../modules/Hms';
import { gestionnaireFormulaireTexte } from '../modules/outils';
import Exercice from './Exercice';
export const interactifType = 'mathLive';
export const interactifReady = true;
export default class MetaExercice extends Exercice {
    constructor(ExercicesCAN) {
        super();
        this.Exercices = ExercicesCAN;
        this.correctionInteractives = [];
        this.besoinFormulaireCaseACocher = ['Sujet officiel'];
        this.nbQuestions = this.Exercices.length;
        this.sup = false;
        this.sup2 = Array.from({ length: this.nbQuestions }, (_, i) => i + 1).join('-'); // Toutes les questions de 1 à 30 (ou 20 pour les CE)
        this.sup3 = false;
    }
    nouvelleVersion() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.correctionInteractives = [];
        this.listeCanEnonces = [];
        this.listeCanReponsesACompleter = [];
        this.listeCanLiees = [];
        this.listeCanNumerosLies = [];
        this.answers = {};
        this.nbQuestionsModifiable = this.sup3;
        this.besoinFormulaire2Texte = false;
        let listeTypeDeQuestions;
        const listeDeQuestions = this.sup2;
        let exercicesRef = this.Exercices;
        const nbTotalQuestions = exercicesRef.length;
        if (this.sup3) {
            this.sup2 = false;
        }
        else {
            exercicesRef = this.Exercices;
            this.nbQuestions = String(this.sup2).includes('-')
                ? this.sup2.split('-').length
                : 1;
        }
        if (this.sup2) {
            listeTypeDeQuestions = gestionnaireFormulaireTexte({
                saisie: listeDeQuestions,
                min: 1,
                max: 30,
                defaut: 1,
                melange: 31,
                shuffle: false,
                nbQuestions: String(this.sup2).includes('-')
                    ? this.sup2.split('-').length
                    : 1,
            });
        }
        else {
            listeTypeDeQuestions = range1(this.nbQuestions);
            exercicesRef = this.Exercices;
            const base = Math.floor(this.nbQuestions / 3);
            const reste = this.nbQuestions % 3;
            let repartition = [base, base, base];
            for (let i = 0; i < reste; i++) {
                repartition[i]++;
            }
            repartition = combinaisonListes(repartition, 3);
            let exercices1 = exercicesRef.slice(0, Math.floor(Math.max(nbTotalQuestions / 3, repartition[0])));
            exercices1 = shuffle(exercices1);
            exercices1 = exercices1.slice(0, repartition[0]);
            let exercices2 = exercicesRef.slice(Math.max(nbTotalQuestions / 3, repartition[0]), Math.max((2 * nbTotalQuestions) / 3, repartition[0] + repartition[1]));
            exercices2 = shuffle(exercices2);
            exercices2 = exercices2.slice(0, repartition[1]);
            let exercices3 = exercicesRef.slice(Math.max((2 * nbTotalQuestions) / 3, repartition[0] + repartition[1]), nbTotalQuestions);
            exercices3 = shuffle(exercices3);
            exercices3 = exercices3.slice(0, repartition[2]);
            exercicesRef = [...exercices1, ...exercices2, ...exercices3];
        }
        let indexQuestion = 0;
        this.reinit(); // On réinitialise les listes de questions parce qu'on a eu des soucis (est-ce que MetaExercice passe par le nouvelleVersionWrapper ?)
        for (const item of listeTypeDeQuestions) {
            // Pour les questions soient dans l'ordre choisi par l'utilisateur
            let numExo = 1;
            for (const UnExercice of exercicesRef) {
                if (item === numExo) {
                    // Permet de ne choisir que certaines questions
                    const Question = new UnExercice();
                    Question.numeroExercice = this.numeroExercice;
                    Question.canOfficielle = !!this.sup;
                    Question.interactif = this.interactif;
                    Question.seed = this.seed;
                    Question.nouvelleVersionWrapper();
                    //* ************ Question Exo simple *************//
                    if (Question.listeQuestions.length === 0) {
                        // On est en présence d'un exo simple
                        const consigne = Question.consigne === '' ? '' : `${Question.consigne}<br>`;
                        this.listeCorrections[indexQuestion] = (_a = Question.correction) !== null && _a !== void 0 ? _a : '';
                        const formatChampTexte = String((_b = Question.formatChampTexte) !== null && _b !== void 0 ? _b : '');
                        const optionsChampTexte = (_c = Question.optionsChampTexte) !== null && _c !== void 0 ? _c : {};
                        if (Question.canEnonce != null)
                            this.listeCanEnonces[indexQuestion] = Question.canEnonce;
                        if (Question.canReponseACompleter != null)
                            this.listeCanReponsesACompleter[indexQuestion] =
                                Question.canReponseACompleter;
                        this.listeCanLiees[indexQuestion] = Question.canLiee;
                        this.listeCanNumerosLies[indexQuestion] = Question.canNumeroLie;
                        if (Question.formatInteractif === 'fillInTheBlank' ||
                            (typeof Question.reponse === 'object' &&
                                'champ1' in Question.reponse)) {
                            this.listeQuestions[indexQuestion] =
                                consigne +
                                    remplisLesBlancs(this, indexQuestion, String(Question.question), formatChampTexte, '\\ldots');
                            if (typeof Question.reponse === 'string') {
                                handleAnswers(this, indexQuestion, {
                                    champ1: {
                                        value: Question.reponse,
                                        compare: (_d = Question.compare) !== null && _d !== void 0 ? _d : fonctionComparaison,
                                        options: (_e = Question.optionsDeComparaison) !== null && _e !== void 0 ? _e : {},
                                    },
                                });
                            }
                            else if (typeof Question.reponse !== 'object') {
                                throw new Error(`Erreur avec cette question de type fillInTheBlank qui contient une reponse au format inconnu: ${JSON.stringify(Question.reponse)}`);
                            }
                            else {
                                handleAnswers(this, indexQuestion, Question.reponse, optionsChampTexte);
                            }
                        }
                        else if (Question.formatInteractif === 'qcm') {
                            (_f = Question === null || Question === void 0 ? void 0 : Question.question) === null || _f === void 0 ? void 0 : _f.replaceAll('labelEx0Q0', `labelEx0Q${indexQuestion}`);
                            (_g = Question === null || Question === void 0 ? void 0 : Question.question) === null || _g === void 0 ? void 0 : _g.replaceAll('resultatCheckEx0', `resultatCheckEx${indexQuestion}`);
                            this.listeQuestions[indexQuestion] = consigne + Question.question;
                            this.autoCorrection[indexQuestion] = Question.autoCorrection[0];
                        }
                        else if (Question.formatInteractif === 'MetaInteractif2d') {
                            const n = Question.numeroExercice;
                            if (Question.question != null) {
                                const inputsIds = Question.question.matchAll(/id="MetaInteractif2dEx\d+Q\d+field(\d+)"/g);
                                for (const match of inputsIds) {
                                    Question.question = Question.question.replace(`id="MetaInteractif2dEx${n}Q0field${match[1]}"`, `id="MetaInteractif2dEx${n}Q${indexQuestion}field${match[1]}"`);
                                }
                                Question.question = Question.question.replace(`id="resultatCheckEx${n}Q0"`, `id="resultatCheckEx${n}Q${indexQuestion}"`);
                                Question.question = Question.question.replace(`id="feedbackEx${n}Q0"`, `id="feedbackEx${n}Q${indexQuestion}"`);
                            }
                            handleAnswers(this, indexQuestion, Question.reponse, {
                                formatInteractif: 'MetaInteractif2d',
                            });
                            this.listeQuestions[indexQuestion] = consigne + Question.question;
                        }
                        else if (Question.formatInteractif === 'svgSelection') {
                            const n = Question.numeroExercice;
                            if (Question.question != null) {
                                const svgSelection = Question.question.match(/id="svgSelectionEx\d+Q\d+"/g);
                                if (svgSelection != null) {
                                    Question.question = Question.question.replace(`svgSelectionEx${n}Q0`, `svgSelectionEx${n}Q${indexQuestion}`);
                                    Question.question = Question.question.replace(`resultatCheckEx${n}Q0`, `resultatCheckEx${n}Q${indexQuestion}`);
                                    const reponse = Question.reponse;
                                    handleAnswers(this, indexQuestion, { reponse: { value: reponse } }, { formatInteractif: 'svgSelection' });
                                    this.listeQuestions[indexQuestion] =
                                        consigne + Question.question;
                                }
                                else {
                                    throw new Error(`Erreur avec cette question de type svgSelection qui ne contient pas d'id de svgSelection: ${Question.question}`);
                                }
                            }
                        }
                        else {
                            if (Question.formatInteractif === 'custom') {
                                this.correctionInteractives[indexQuestion] =
                                    Question.correctionInteractive;
                                this.listeQuestions[indexQuestion] =
                                    consigne + Question.question;
                                this.listeQuestions[indexQuestion] = this.listeQuestions[indexQuestion]
                                    .replaceAll(`feedbackEx${this.numeroExercice}Q0`, `feedbackEx${this.numeroExercice}Q${indexQuestion}`)
                                    .replaceAll(`resultatCheckEx${this.numeroExercice}Q0`, `resultatCheckEx${this.numeroExercice}Q${indexQuestion}`)
                                    .replaceAll(`clockEx${this.numeroExercice}Q0`, `clockEx${this.numeroExercice}Q${indexQuestion}`)
                                    .replaceAll(`apigeomEx${this.numeroExercice}F0`, `apigeomEx${this.numeroExercice}F${indexQuestion}`);
                            }
                            else {
                                // * ***************** Question MathLive *****************//
                                this.listeQuestions[indexQuestion] =
                                    consigne +
                                        Question.question +
                                        ajouteChampTexteMathLive(this, indexQuestion, formatChampTexte, optionsChampTexte);
                            }
                            if (Question.compare == null) {
                                const reponse = Question.reponse;
                                const options = Question.optionsDeComparaison == null
                                    ? {}
                                    : Question.optionsDeComparaison;
                                if (reponse instanceof FractionEtendue) {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: {
                                            value: reponse.texFraction,
                                            options,
                                        },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (reponse instanceof Decimal) {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: { value: reponse.toString(), options },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (reponse instanceof Grandeur ||
                                    reponse instanceof Hms) {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: { value: reponse, options },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (reponse instanceof Complexe) {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: { value: reponse.tex(), options },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (Array.isArray(reponse)) {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: { value: reponse, options },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (isValeur(reponse)) {
                                    handleAnswers(this, indexQuestion, 
                                    // Object.assign(reponse, { options }),
                                    { reponse: { value: reponse.reponse.value, options } });
                                }
                                else {
                                    handleAnswers(this, indexQuestion, {
                                        reponse: { value: String(Question.reponse), options },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                            }
                            else {
                                const compare = Question.compare;
                                const options = Question.optionsDeComparaison == null
                                    ? {}
                                    : Question.optionsDeComparaison;
                                if (typeof Question.reponse === 'string' ||
                                    typeof Question.reponse === 'number') {
                                    const reponse = String(Question.reponse);
                                    handleAnswers(this, indexQuestion, {
                                        reponse: {
                                            value: reponse,
                                            compare,
                                            options,
                                        },
                                    }, { formatInteractif: Question.formatInteractif });
                                }
                                else if (typeof Question.reponse === 'object') {
                                    const reponse = Question.reponse;
                                    if (reponse instanceof FractionEtendue) {
                                        handleAnswers(this, indexQuestion, {
                                            reponse: {
                                                value: reponse.texFraction,
                                                compare,
                                                options,
                                            },
                                        }, { formatInteractif: Question.formatInteractif });
                                    }
                                    else if (reponse instanceof Decimal) {
                                        handleAnswers(this, indexQuestion, {
                                            reponse: {
                                                value: reponse.toString(),
                                                compare,
                                                options,
                                            },
                                        }, { formatInteractif: Question.formatInteractif });
                                    }
                                    else if (reponse instanceof Grandeur) {
                                        handleAnswers(this, indexQuestion, {
                                            reponse: {
                                                value: reponse.toString(),
                                                compare,
                                                options,
                                            },
                                        }, { formatInteractif: Question.formatInteractif });
                                    }
                                    else if (Array.isArray(reponse)) {
                                        handleAnswers(this, indexQuestion, {
                                            reponse: { value: reponse, compare, options },
                                        }, { formatInteractif: Question.formatInteractif });
                                    }
                                    else {
                                        handleAnswers(this, indexQuestion, Object.assign(reponse, { compare, options }), { formatInteractif: Question.formatInteractif });
                                    }
                                }
                                else {
                                    window.notify('Erreur avec cette question qui contient une reponse au format inconnu', { reponse: Question.reponse });
                                }
                            }
                        }
                    }
                    else {
                        //* ***************** Question Exo classique *****************//
                        this.listeQuestions[indexQuestion] = Question.listeQuestions[0];
                        this.listeCorrections[indexQuestion] = Question.listeCorrections[0];
                        this.autoCorrection[indexQuestion] = Question.autoCorrection[0];
                        this.listeQuestions[indexQuestion] = this.listeQuestions[indexQuestion].replaceAll('champTexteEx0Q0', `champTexteEx0Q${indexQuestion}`);
                        this.listeQuestions[indexQuestion] = this.listeQuestions[indexQuestion].replaceAll('resultatCheckEx0Q0', `resultatCheckEx0Q${indexQuestion}`);
                        this.listeQuestions[indexQuestion] = this.listeQuestions[indexQuestion].replaceAll('clockEx0Q0', `clockEx0Q${indexQuestion}`);
                        // fin d'alimentation des listes de question et de correction pour cette question
                        const formatInteractif = (_k = (_j = (_h = Question.autoCorrection[0]) === null || _h === void 0 ? void 0 : _h.reponse) === null || _j === void 0 ? void 0 : _j.param) === null || _k === void 0 ? void 0 : _k.formatInteractif;
                        if (formatInteractif === 'custom') {
                            Question.reinit();
                            Question.nouvelleVersionWrapper(this.numeroExercice, indexQuestion);
                            const that = this;
                            this.correctionInteractives[indexQuestion] = function (i) {
                                const result = Question.correctionInteractive(i);
                                if (Question.answers) {
                                    that.answers = Object.assign(Object.assign({}, that.answers), Question.answers);
                                }
                                return result;
                            };
                            this.autoCorrection[indexQuestion] =
                                Question.autoCorrection[indexQuestion];
                            this.listeQuestions[indexQuestion] =
                                Question.listeQuestions[indexQuestion];
                            this.listeCorrections[indexQuestion] =
                                Question.listeCorrections[indexQuestion];
                        }
                        else if (formatInteractif === 'qcm') {
                            this.autoCorrection[indexQuestion] = Question.autoCorrection[0];
                        }
                        else {
                            const reponse = (_m = (_l = Question.autoCorrection[0]) === null || _l === void 0 ? void 0 : _l.reponse) === null || _m === void 0 ? void 0 : _m.valeur;
                            if (reponse != null)
                                handleAnswers(this, indexQuestion, reponse, {
                                    formatInteractif,
                                });
                        }
                    }
                    if (((_o = Question === null || Question === void 0 ? void 0 : Question.autoCorrection[0]) === null || _o === void 0 ? void 0 : _o.propositions) != null) {
                        // qcm
                        const monQcm = propositionsQcm(this, indexQuestion); // update les références HTML
                        this.listeCanReponsesACompleter[indexQuestion] =
                            Question.canReponseACompleter != null
                                ? Question.canReponseACompleter
                                : monQcm.texte;
                        const consigne = Question.consigne === null || Question.consigne === ''
                            ? ''
                            : `${Question.consigne}<br>`;
                        const objetReponse = this.autoCorrection[indexQuestion];
                        const enonce = 'enonce' in objetReponse ? objetReponse.enonce : '';
                        this.listeQuestions[indexQuestion] =
                            consigne + enonce + monQcm.texte;
                        if (this.listeCorrections[indexQuestion] == null)
                            this.listeCorrections[indexQuestion] = monQcm.texteCorr;
                    }
                    indexQuestion++;
                    break;
                }
                numExo++;
            }
        }
        // Une deuxième sécurité pour virer les questions en trop
        if (indexQuestion > 30) {
            indexQuestion = 30;
            window.notify('malgré des précautions prises, on a fabriqué plus de 30 questions dans MetaExercice', { nbQuestions: indexQuestion });
            this.listeQuestions = this.listeQuestions.slice(0, indexQuestion);
            this.listeCorrections = this.listeCorrections.slice(0, indexQuestion);
            this.autoCorrection = this.autoCorrection.slice(0, indexQuestion);
        }
        this.besoinFormulaire2Texte = this.sup3
            ? false
            : ['Choix des questions', 'Nombres séparés par des tirets :'];
        this.besoinFormulaire3CaseACocher = ['Choix du nombre de questions'];
        this.comment = `Cet exercice fait partie des annales des Courses Aux Nombres (CAN).<br>
  Il est plus souvent composé de 30 questions (parfois 20 pour les CE1/CE2) réparties de la façon suivante. 
  Les 10 premières questions, parfois communes à plusieurs niveaux, font appel à des questions élémentaires et les 20 suivantes (qui ne sont pas rangées dans un ordre de difficulté) sont un peu plus « coûteuses » cognitivement.<br>
  Par défaut, les questions sont rangées dans le même ordre que le sujet officiel avec des données aléatoires. Ainsi, en cliquant sur « Nouvelles données », on obtient une nouvelle Course Aux Nombres avec des données différentes.<br>
  Dans les CAN depuis 2024, le choix des questions permet de choisir certaines questions parmi les 30. <br>
  Dans les CAN d'avant 2024, on pouvait seulement choisir le nombre de questions comme décrit ci-après. <br>
  En choisissant un nombre de questions inférieur à 30, on fabrique une « mini » Course Aux Nombres qui respecte la proportion de nombre de questions élémentaires par rapport aux autres.
  Par exemple, en choisissant 20 questions, la course aux nombres sera composée de 7 ou 8 questions élémentaires choisies aléatoirement dans les 10 premières questions du sujet officiel puis de 12 ou 13 autres questions choisies aléatoirement parmi les 20 autres questions du sujet officiel.`;
    }
}
function isValeur(x) {
    const answerTypes = [
        'reponse',
        'champ1',
        'champ2',
        'champ3',
        'champ4',
        'champ5',
        'champ6',
        'field1',
        'field2',
        'field3',
        'field4',
        'field5',
        'field6',
        'field7',
        'field8',
        'rectangle1',
        'rectangle2',
        'rectangle3',
        'rectangle4',
        'rectangle5',
        'rectangle6',
        'rectangle7',
        'rectangle8',
        'L1C1',
        'L1C2',
        'L1C3',
        'L1C4',
        'L1C5',
        'L2C1',
        'L2C2',
        'L2C3',
        'L2C4',
        'L2C5',
        'L3C1',
        'L3C2',
        'L3C3',
        'L3C4',
        'L3C5',
    ];
    return (typeof x === 'object' && x !== null && answerTypes.some((type) => type in x));
}
