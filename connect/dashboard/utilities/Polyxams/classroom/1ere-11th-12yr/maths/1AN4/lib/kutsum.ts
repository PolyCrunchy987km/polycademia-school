import seedrandom from 'seedrandom'
import { getExercisesFromExercicesParams, mathaleaHandleExerciceSimple } from './mathalea'
import type { IExercice } from './types'

const KUTSUM_API_URL = 'https://app.kutsum.org/api/v1/external-drafts'
const KUTSUM_IMPORT_URL = 'https://app.kutsum.org/import'

type KutsumSingleChoiceQuestion = {
  questionType: 'singleChoice'
  text: string
  answerOptions: string[]
  correctAnswers: boolean[]
}

type KutsumMultipleChoiceQuestion = {
  questionType: 'multipleChoice'
  text: string
  answerOptions: string[]
  correctAnswers: boolean[]
}

type KutsumNumericQuestion = {
  questionType: 'numeric'
  text: string
  correctAnswer: number
  tolerance: number
  unit: string | null
}

type KutsumMathQuestion = {
  questionType: 'math'
  text: string
  targetLatex: string
  validationConfig: {
    kind: string
    responseFormat: string
    valueCheck: { method: string }
    constraints: unknown[]
  }
}

type KutsumQuestion =
  | KutsumSingleChoiceQuestion
  | KutsumMultipleChoiceQuestion
  | KutsumNumericQuestion
  | KutsumMathQuestion

type KutsumExercise = {
  id: string
  title: string
  questions: KutsumQuestion[]
}

type KutsumPayload = {
  source: string
  title: string
  gradeLevel: string
  discipline: string
  themes: string[]
  exercises: KutsumExercise[]
}

function buildKutsumQuestionsFromAutoCorrection(exercise: IExercice): KutsumQuestion[] {
  const questions: KutsumQuestion[] = []

  for (const ac of exercise.autoCorrection) {
    const formatInteractif = ac.reponse?.param?.formatInteractif ?? exercise.formatInteractif

    if (formatInteractif === 'qcm' && ac.propositions && ac.propositions.length >= 2) {
      const choices = ac.propositions
        .filter((p): p is { texte: string; statut?: boolean | string | number } => p.texte != null)
        .map((p) => ({
          text: p.texte ?? '',
          isCorrect: p.statut === true || p.statut === 1,
        }))
      if (choices.length < 2) continue
      const nbCorrect = choices.filter((c) => c.isCorrect).length
      const isRadio = ac.options?.radio === true || nbCorrect <= 1
      questions.push({
        questionType: isRadio ? 'singleChoice' : 'multipleChoice',
        text: ac.enonce ?? '',
        answerOptions: choices.map((c) => c.text),
        correctAnswers: choices.map((c) => c.isCorrect),
      })
    } else if (formatInteractif === 'mathlive' || formatInteractif === 'calcul') {
      const valeur = ac.reponse?.valeur
      let targetLatex = ''
      if (valeur && typeof valeur === 'object' && 'reponse' in valeur && valeur.reponse) {
        const rep = valeur.reponse.value
        targetLatex = Array.isArray(rep) ? rep[0] : String(rep)
      } else if (typeof valeur === 'number') {
        targetLatex = String(valeur)
      } else if (typeof valeur === 'string') {
        targetLatex = valeur
      }
      if (!targetLatex) continue
      const numericValue = Number(targetLatex)
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        questions.push({
          questionType: 'numeric',
          text: ac.enonce ?? '',
          correctAnswer: numericValue,
          tolerance:
            ac.reponse?.param?.approx != null && typeof ac.reponse.param.approx === 'number'
              ? ac.reponse.param.approx
              : 0,
          unit: null,
        })
      } else {
        questions.push({
          questionType: 'math',
          text: ac.enonce ?? '',
          targetLatex,
          validationConfig: {
            kind: 'EXPRESSION',
            responseFormat: 'SINGLE',
            valueCheck: { method: 'EXACT' },
            constraints: [],
          },
        })
      }
    }
  }

  return questions
}

export function buildKutsumPayload(exercises: IExercice[]): KutsumPayload {
  const kutsumExercises: KutsumExercise[] = []

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i]
    // Reproduire exactement la même graine que lors de l'affichage dans la vue élève,
    seedrandom(exercise.seed, { global: true })
    if (exercise.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercise, false, i)
    } else if (typeof (exercise as IExercice & { nouvelleVersionWrapper?: (i: number) => void }).nouvelleVersionWrapper === 'function') {
      ;(exercise as IExercice & { nouvelleVersionWrapper: (i: number) => void }).nouvelleVersionWrapper(i)
    }
    const questions = buildKutsumQuestionsFromAutoCorrection(exercise)
    if (questions.length > 0) {
      kutsumExercises.push({
        id: exercise.uuid,
        title: exercise.titre,
        questions,
      })
    }
  }

  return {
    source: 'mathalea',
    title: 'Export MathALÉA',
    gradeLevel: 'Autre',
    discipline: 'Mathematiques',
    themes: [],
    exercises: kutsumExercises,
  }
}

export async function sendToKutsum(payload: KutsumPayload): Promise<string> {
  console.log('[Kutsum] Payload envoyé :', JSON.stringify(payload, null, 2))

  const response = await fetch(KUTSUM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const message = errorData?.message ?? `Erreur HTTP ${response.status}`
    throw new Error(message)
  }

  const data = await response.json()
  if (!data.draftId) throw new Error('Réponse inattendue de Kutsum (pas de draftId)')
  return data.draftId
}

export async function exportKutsum(): Promise<void> {
  // Ouvrir l'onglet de façon synchrone, avant tout await, pour ne pas être
  // bloqué par le filtre anti-popup de Safari (qui rejette window.open après
  // un appel asynchrone car il n'est plus dans le contexte du geste utilisateur).
  const tab = window.open('', '_blank')

  try {
    const exercises = await getExercisesFromExercicesParams()
    if (exercises.length === 0) {
      tab?.close()
      alert("Aucun exercice sélectionné pour l'export vers Kutsum")
      return
    }

    const payload = buildKutsumPayload(exercises)

    if (payload.exercises.length === 0) {
      tab?.close()
      alert(
        "Aucun exercice compatible avec Kutsum parmi les exercices sélectionnés (seuls les QCM et les exercices interactifs sont supportés)",
      )
      return
    }

    const draftId = await sendToKutsum(payload)

    if (tab) {
      tab.location.href = `${KUTSUM_IMPORT_URL}?draftId=${draftId}`
    }
  } catch (e) {
    tab?.close()
    alert(`Impossible de contacter Kutsum : ${e instanceof Error ? e.message : String(e)}`)
  }
}
