import seedrandom from 'seedrandom';
import { getExercisesFromExercicesParams, mathaleaHandleExerciceSimple } from './mathalea';
const KUTSUM_API_URL = 'https://app.kutsum.org/api/v1/external-drafts';
const KUTSUM_IMPORT_URL = 'https://app.kutsum.org/import';
function buildKutsumQuestionsFromAutoCorrection(exercise) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const questions = [];
    for (const ac of exercise.autoCorrection) {
        const formatInteractif = (_c = (_b = (_a = ac.reponse) === null || _a === void 0 ? void 0 : _a.param) === null || _b === void 0 ? void 0 : _b.formatInteractif) !== null && _c !== void 0 ? _c : exercise.formatInteractif;
        if (formatInteractif === 'qcm' && ac.propositions && ac.propositions.length >= 2) {
            const choices = ac.propositions
                .filter((p) => p.texte != null)
                .map((p) => {
                var _a;
                return ({
                    text: (_a = p.texte) !== null && _a !== void 0 ? _a : '',
                    isCorrect: p.statut === true || p.statut === 1,
                });
            });
            if (choices.length < 2)
                continue;
            const nbCorrect = choices.filter((c) => c.isCorrect).length;
            const isRadio = ((_d = ac.options) === null || _d === void 0 ? void 0 : _d.radio) === true || nbCorrect <= 1;
            questions.push({
                questionType: isRadio ? 'singleChoice' : 'multipleChoice',
                text: (_e = ac.enonce) !== null && _e !== void 0 ? _e : '',
                answerOptions: choices.map((c) => c.text),
                correctAnswers: choices.map((c) => c.isCorrect),
            });
        }
        else if (formatInteractif === 'mathlive' || formatInteractif === 'calcul') {
            const valeur = (_f = ac.reponse) === null || _f === void 0 ? void 0 : _f.valeur;
            let targetLatex = '';
            if (valeur && typeof valeur === 'object' && 'reponse' in valeur && valeur.reponse) {
                const rep = valeur.reponse.value;
                targetLatex = Array.isArray(rep) ? rep[0] : String(rep);
            }
            else if (typeof valeur === 'number') {
                targetLatex = String(valeur);
            }
            else if (typeof valeur === 'string') {
                targetLatex = valeur;
            }
            if (!targetLatex)
                continue;
            const numericValue = Number(targetLatex);
            if (!isNaN(numericValue) && isFinite(numericValue)) {
                questions.push({
                    questionType: 'numeric',
                    text: (_g = ac.enonce) !== null && _g !== void 0 ? _g : '',
                    correctAnswer: numericValue,
                    tolerance: ((_j = (_h = ac.reponse) === null || _h === void 0 ? void 0 : _h.param) === null || _j === void 0 ? void 0 : _j.approx) != null && typeof ac.reponse.param.approx === 'number'
                        ? ac.reponse.param.approx
                        : 0,
                    unit: null,
                });
            }
            else {
                questions.push({
                    questionType: 'math',
                    text: (_k = ac.enonce) !== null && _k !== void 0 ? _k : '',
                    targetLatex,
                    validationConfig: {
                        kind: 'EXPRESSION',
                        responseFormat: 'SINGLE',
                        valueCheck: { method: 'EXACT' },
                        constraints: [],
                    },
                });
            }
        }
    }
    return questions;
}
export function buildKutsumPayload(exercises) {
    const kutsumExercises = [];
    for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];
        // Reproduire exactement la même graine que lors de l'affichage dans la vue élève,
        seedrandom(exercise.seed, { global: true });
        if (exercise.typeExercice === 'simple') {
            mathaleaHandleExerciceSimple(exercise, false, i);
        }
        else if (typeof exercise.nouvelleVersionWrapper === 'function') {
            ;
            exercise.nouvelleVersionWrapper(i);
        }
        const questions = buildKutsumQuestionsFromAutoCorrection(exercise);
        if (questions.length > 0) {
            kutsumExercises.push({
                id: exercise.uuid,
                title: exercise.titre,
                questions,
            });
        }
    }
    return {
        source: 'mathalea',
        title: 'Export MathALÉA',
        gradeLevel: 'Autre',
        discipline: 'Mathematiques',
        themes: [],
        exercises: kutsumExercises,
    };
}
export async function sendToKutsum(payload) {
    var _a;
    console.log('[Kutsum] Payload envoyé :', JSON.stringify(payload, null, 2));
    const response = await fetch(KUTSUM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = (_a = errorData === null || errorData === void 0 ? void 0 : errorData.message) !== null && _a !== void 0 ? _a : `Erreur HTTP ${response.status}`;
        throw new Error(message);
    }
    const data = await response.json();
    if (!data.draftId)
        throw new Error('Réponse inattendue de Kutsum (pas de draftId)');
    return data.draftId;
}
export async function exportKutsum() {
    // Ouvrir l'onglet de façon synchrone, avant tout await, pour ne pas être
    // bloqué par le filtre anti-popup de Safari (qui rejette window.open après
    // un appel asynchrone car il n'est plus dans le contexte du geste utilisateur).
    const tab = window.open('', '_blank');
    try {
        const exercises = await getExercisesFromExercicesParams();
        if (exercises.length === 0) {
            tab === null || tab === void 0 ? void 0 : tab.close();
            alert("Aucun exercice sélectionné pour l'export vers Kutsum");
            return;
        }
        const payload = buildKutsumPayload(exercises);
        if (payload.exercises.length === 0) {
            tab === null || tab === void 0 ? void 0 : tab.close();
            alert("Aucun exercice compatible avec Kutsum parmi les exercices sélectionnés (seuls les QCM et les exercices interactifs sont supportés)");
            return;
        }
        const draftId = await sendToKutsum(payload);
        if (tab) {
            tab.location.href = `${KUTSUM_IMPORT_URL}?draftId=${draftId}`;
        }
    }
    catch (e) {
        tab === null || tab === void 0 ? void 0 : tab.close();
        alert(`Impossible de contacter Kutsum : ${e instanceof Error ? e.message : String(e)}`);
    }
}
