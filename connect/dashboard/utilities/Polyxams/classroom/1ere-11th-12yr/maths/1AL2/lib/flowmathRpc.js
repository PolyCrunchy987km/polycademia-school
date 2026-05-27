let readySent = false;
let attemptStartedSentFor;
function postFlowmathRpc(message) {
    if (typeof window === 'undefined')
        return;
    if (window.parent == null || window.parent === window)
        return;
    window.parent.postMessage(message, '*');
}
export function sendFlowmathReady() {
    if (readySent)
        return;
    readySent = true;
    postFlowmathRpc({ type: 'READY' });
}
export function sendFlowmathResize(height) {
    if (height == null || Number.isNaN(height))
        return;
    postFlowmathRpc({
        type: 'RESIZE',
        payload: { height },
    });
}
export function sendFlowmathAttemptStarted(attemptId) {
    const normalized = attemptId !== null && attemptId !== void 0 ? attemptId : null;
    if (attemptStartedSentFor === normalized)
        return;
    attemptStartedSentFor = normalized;
    postFlowmathRpc({
        type: 'ATTEMPT_STARTED',
        payload: { attemptId: normalized },
    });
}
export function sendFlowmathAttemptFinished(payload) {
    postFlowmathRpc({
        type: 'ATTEMPT_FINISHED',
        payload,
    });
}
export function sendFlowmathReplayCompleted() {
    postFlowmathRpc({ type: 'REPLAY_COMPLETED' });
}
export function sendFlowmathError(message) {
    const text = message === null || message === void 0 ? void 0 : message.toString().trim();
    if (!text)
        return;
    postFlowmathRpc({
        type: 'ERROR',
        payload: { message: text },
    });
}
export function getFlowmathAttemptIdFromUrl() {
    if (typeof window === 'undefined')
        return null;
    try {
        const params = new URLSearchParams(window.location.search);
        return (params.get('attemptId') ||
            params.get('flowmathAttemptId') ||
            params.get('attemptID'));
    }
    catch (_a) {
        return null;
    }
}
