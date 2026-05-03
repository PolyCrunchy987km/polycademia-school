import { context } from '../../modules/context'
import { createList } from '../format/lists'
import { formaterReponse } from '../outils/ecritures'
import { texteEnCouleurEtGras } from '../outils/embellissements'
import type { AnswerValueType, IExercice, IExerciceQcmOptions } from '../types'
import { propositionsQcm } from './qcm'

type SharedQcmProposition = {
  texte: string
  statut: boolean
  correction?: string
  feedback?: string
}

type QcmAutoCorrectionProposition = {
  texte: string
  statut: boolean
  feedback?: string
}

type MessageMode = 'single' | 'multiple'

type BuildQcmForExerciseParams = {
  question: string
  correction?: string
  propositions: SharedQcmProposition[]
  options?: IExerciceQcmOptions
  ajouteQcmCorr?: boolean
  messageMode?: MessageMode
}

type BuildSimpleVersionQcmParams = {
  question: string
  correction?: string
  reponse: AnswerValueType
  distracteurs: (string | number)[]
  options?: IExerciceQcmOptions
}

const QCM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

function buildCorrectionSeparator(correction = ''): string {
  if (correction.endsWith('\\end{tikzpicture}')) return '\n\n'
  if (correction !== '') return '<br>'
  return ''
}

function buildCorrectAnswersMessage(
  propositions: SharedQcmProposition[],
  mode: MessageMode,
): string {
  const bonnesLettres = propositions
    .map((proposition, index) => ({ proposition, index }))
    .filter(({ proposition }) => proposition.statut)
    .map(({ index }) => QCM_LETTERS[index] ?? String(index + 1))

  if (mode === 'multiple') {
    return `Les bonnes réponses sont les réponses ${texteEnCouleurEtGras(bonnesLettres.join(' ; '))}.`
  }

  return `La bonne réponse est la réponse ${texteEnCouleurEtGras(bonnesLettres[0] ?? '')}.`
}

function buildCorrectionsList(propositions: SharedQcmProposition[]): string {
  const corrections = propositions
    .map((proposition, index) => {
      if (proposition.correction == null || proposition.correction === '')
        return ''
      return `réponse ${QCM_LETTERS[index] ?? String(index + 1)} : ${proposition.correction}${
        context.isHtml
          ? proposition.statut
            ? '\u2705' // ✅
            : '\u274C' // ❌
          : proposition.statut
            ? '$ {\\bf \\color[cmyk]{.63,.23,.93,.06}\\boldsymbol{\\checkmark}} $' // ✅
            : '$ {\\bf \\color[rgb]{1,.1,.1}\\boldsymbol{\\times}} $' // ❌
      }<br>`
    })
    .filter((correction) => correction !== '')

  if (corrections.length === 0) return ''

  return createList({
    items: corrections,
    style: 'fleches',
  })
}

export function buildQcmForExercise(
  exercice: IExercice,
  questionIndex: number,
  {
    question,
    correction = '',
    propositions,
    options,
    ajouteQcmCorr = false,
    messageMode = 'single',
  }: BuildQcmForExerciseParams,
): { question: string; correction: string } {
  const autoCorrectionOptions = { ...(options ?? {}) }
  const qcmPropositions: QcmAutoCorrectionProposition[] = propositions.map(
    (proposition) => ({
      texte: proposition.texte,
      statut: proposition.statut,
      feedback: proposition.feedback,
    }),
  )

  if (autoCorrectionOptions.dontKnow) {
    qcmPropositions.push({
      texte: 'Je ne sais pas',
      statut: false,
    })
    autoCorrectionOptions.lastChoice = qcmPropositions.length - 2
  }

  exercice.autoCorrection[questionIndex] = {
    enonce: question,
    options: autoCorrectionOptions,
    propositions: qcmPropositions,
  }

  const qcm = propositionsQcm(exercice, questionIndex, {
    style: 'margin:0 3px 0 3px;',
    format: exercice.interactif ? 'case' : 'lettre',
  })

  const shuffledPropositions =
    exercice.autoCorrection[questionIndex].propositions?.map(
      (proposition, index) => {
        const initialIndex = qcm.indexes?.[index] ?? index
        return {
          texte: proposition.texte ?? '',
          statut: Boolean(proposition.statut),
          correction: propositions[initialIndex]?.correction,
          feedback: proposition.feedback,
        }
      },
    ) ?? []

  let correctionTexte = buildCorrectionsList(shuffledPropositions)
  if (correctionTexte === '') {
    correctionTexte = correction
    const extrasAreAdded = ajouteQcmCorr || !exercice.interactif
    if (extrasAreAdded) {
      correctionTexte += buildCorrectionSeparator(correction)
    }
  }

  if (ajouteQcmCorr) {
    correctionTexte += `<br>${qcm.texteCorr}`
  }

  if (!exercice.interactif) {
    correctionTexte += buildCorrectAnswersMessage(
      shuffledPropositions.filter(
        (proposition) => proposition.texte !== 'Je ne sais pas',
      ),
      messageMode,
    )
  }

  return {
    question: `${question}<br><br>${qcm.texte}`,
    correction: correctionTexte,
  }
}

export function buildSimpleVersionQcmProps(
  reponse: AnswerValueType,
  distracteurs: (string | number)[],
): SharedQcmProposition[] {
  return [
    {
      texte: formaterReponse(reponse),
      statut: true,
    },
    ...distracteurs.map((distracteur) => ({
      texte: formaterReponse(distracteur),
      statut: false,
    })),
  ]
}

export function buildSimpleVersionQcm(
  exercice: IExercice,
  questionIndex: number,
  {
    question,
    correction,
    reponse,
    distracteurs,
    options,
  }: BuildSimpleVersionQcmParams,
): { question: string; correction: string } {
  return buildQcmForExercise(exercice, questionIndex, {
    question,
    correction,
    propositions: buildSimpleVersionQcmProps(reponse, distracteurs),
    options,
    messageMode: 'single',
  })
}
