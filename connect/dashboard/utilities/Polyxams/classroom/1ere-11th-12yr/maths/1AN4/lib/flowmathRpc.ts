import type { InterfaceResultExercice } from './types'

type FlowmathRpcMessage =
  | { type: 'READY' }
  | { type: 'RESIZE'; payload: { height: number } }
  | { type: 'ATTEMPT_STARTED'; payload: { attemptId: string | null } }
  | { type: 'REPLAY_COMPLETED' }
  | { type: 'ATTEMPT_FINISHED'; payload: FlowmathAttemptFinishedPayload }
  | { type: 'ERROR'; payload: { message: string } }

export interface FlowmathAttemptFinishedPayload {
  score: number
  exercicesData: InterfaceResultExercice[]
  totalQuestions: number
  correctAnswers: number
}

let readySent = false
let attemptStartedSentFor: string | null | undefined

function postFlowmathRpc(message: FlowmathRpcMessage) {
  if (typeof window === 'undefined') return
  if (window.parent == null || window.parent === window) return
  window.parent.postMessage(message, '*')
}

export function sendFlowmathReady() {
  if (readySent) return
  readySent = true
  postFlowmathRpc({ type: 'READY' })
}

export function sendFlowmathResize(height: number | undefined | null) {
  if (height == null || Number.isNaN(height)) return
  postFlowmathRpc({
    type: 'RESIZE',
    payload: { height },
  })
}

export function sendFlowmathAttemptStarted(attemptId?: string | null) {
  const normalized = attemptId ?? null
  if (attemptStartedSentFor === normalized) return
  attemptStartedSentFor = normalized
  postFlowmathRpc({
    type: 'ATTEMPT_STARTED',
    payload: { attemptId: normalized },
  })
}

export function sendFlowmathAttemptFinished(
  payload: FlowmathAttemptFinishedPayload,
) {
  postFlowmathRpc({
    type: 'ATTEMPT_FINISHED',
    payload,
  })
}

export function sendFlowmathReplayCompleted() {
  postFlowmathRpc({ type: 'REPLAY_COMPLETED' })
}

export function sendFlowmathError(message: string) {
  const text = message?.toString().trim()
  if (!text) return
  postFlowmathRpc({
    type: 'ERROR',
    payload: { message: text },
  })
}

export function getFlowmathAttemptIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    return (
      params.get('attemptId') ||
      params.get('flowmathAttemptId') ||
      params.get('attemptID')
    )
  } catch {
    return null
  }
}
