import { get } from 'svelte/store';
import { getFlowmathAttemptIdFromUrl, sendFlowmathAttemptFinished, sendFlowmathAttemptStarted, sendFlowmathError, sendFlowmathReady, sendFlowmathReplayCompleted, } from './flowmathRpc';
import { globalOptions } from './stores/globalOptions';
/**
 * Handler pour la communication RPC avec FlowMath
 * Ne s'active que si globalOptions.recorder === 'flowmath'
 */
export function handleFlowmath(exercicesParams, resultsByExercice) {
    if (typeof window === 'undefined')
        return;
    // Listen for messages from parent window
    const onMessage = async (event) => {
        if (!event.data || typeof event.data !== 'object')
            return;
        // Handle SET_ACTIVITY_PARAMS - load exercises from FlowMath
        if (event.data.type === 'SET_ACTIVITY_PARAMS') {
            console.info('[MathALEA-FlowMath] Received SET_ACTIVITY_PARAMS:', event.data.payload);
            const payload = event.data.payload;
            if (!(payload === null || payload === void 0 ? void 0 : payload.exercicesParams) ||
                !Array.isArray(payload.exercicesParams)) {
                console.error('[MathALEA-FlowMath] Invalid exercicesParams in SET_ACTIVITY_PARAMS');
                sendFlowmathError('Invalid exercicesParams received');
                return;
            }
            // Update exercicesParams store with the received exercises
            exercicesParams.set(payload.exercicesParams);
            console.info('[MathALEA-FlowMath] Loaded exercises:', payload.exercicesParams.length, 'with alea values:', payload.exercicesParams
                .map((e, i) => { var _a; return `[${i}]=${(_a = e === null || e === void 0 ? void 0 : e.alea) !== null && _a !== void 0 ? _a : 'none'}`; })
                .join(', '));
            // Update global options if provided
            if (payload.globalOptions) {
                globalOptions.update((opts) => {
                    const newOpts = Object.assign(Object.assign({}, opts), payload.globalOptions);
                    // Ensure we stay in eleve view
                    if (!newOpts.v)
                        newOpts.v = 'eleve';
                    newOpts.presMode = newOpts.presMode || 'un_exo_par_page';
                    newOpts.isInteractiveFree = false;
                    return newOpts;
                });
            }
            // NOTE: We do NOT set done='1' in review mode anymore
            // The validation buttons need to exist for programmatic validation
            // After REPLAY_ATTEMPT fills answers and FINISH_ATTEMPT validates,
            // the correction will be shown properly
            // Signal that exercises are loaded and ready
            window.parent.postMessage({ type: 'ACTIVITY_PARAMS_LOADED' }, '*');
            return;
        }
        if (event.data.type === 'FINISH_ATTEMPT') {
            // Get exercices params to know how many exercises we have
            const params = get(exercicesParams);
            // Click validation button for each exercise
            for (let i = 0; i < params.length; i++) {
                const buttonScore = document.querySelector(`#buttonScoreEx${i}`);
                if (buttonScore !== null) {
                    buttonScore.click();
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
                else {
                    console.warn('[MathALEA-FlowMath] Validation button #buttonScoreEx' +
                        i +
                        ' not found');
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Collect complete results
            const results = get(resultsByExercice);
            let totalQuestions = 0;
            let correctAnswers = 0;
            for (const result of results) {
                if ((result === null || result === void 0 ? void 0 : result.resultsByQuestion) &&
                    Array.isArray(result.resultsByQuestion)) {
                    totalQuestions += result.resultsByQuestion.length;
                    correctAnswers += result.resultsByQuestion.filter((r) => r === true).length;
                }
                else if (result === null || result === void 0 ? void 0 : result.numberOfQuestions) {
                    totalQuestions += result.numberOfQuestions;
                    if ((result === null || result === void 0 ? void 0 : result.numberOfPoints) !== undefined) {
                        correctAnswers += result.numberOfPoints;
                    }
                }
            }
            const score = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
            // Send complete results back to parent
            sendFlowmathAttemptFinished({
                score,
                exercicesData: results,
                totalQuestions,
                correctAnswers,
            });
        }
        if (event.data.type === 'REPLAY_ATTEMPT') {
            const exercicesData = event.data.payload.exercicesData;
            if (!exercicesData || !Array.isArray(exercicesData)) {
                console.error('[MathALEA-FlowMath] Invalid exercicesData');
                sendFlowmathError('[MathALEA] Invalid exercicesData received');
                return;
            }
            // Get expected exercise count
            const params = get(exercicesParams);
            const expectedButtonCount = params.length;
            // Helper to wait for validation buttons to exist
            const waitForValidationButtons = () => {
                return new Promise((resolve) => {
                    let attempts = 0;
                    const maxAttempts = 50; // 5 seconds max (50 * 100ms)
                    const checkButtons = () => {
                        let foundCount = 0;
                        for (let i = 0; i < expectedButtonCount; i++) {
                            if (document.querySelector(`#buttonScoreEx${i}`)) {
                                foundCount++;
                            }
                        }
                        if (foundCount === expectedButtonCount) {
                            console.info(`[MathALEA-FlowMath] All ${expectedButtonCount} validation buttons found`);
                            resolve();
                        }
                        else if (attempts >= maxAttempts) {
                            console.warn(`[MathALEA-FlowMath] Timeout waiting for validation buttons (found ${foundCount}/${expectedButtonCount})`);
                            resolve(); // Resolve anyway to not block forever
                        }
                        else {
                            attempts++;
                            setTimeout(checkButtons, 100);
                        }
                    };
                    checkButtons();
                });
            };
            // Wait for initial render
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Import the necessary functions
            const { mathaleaWriteStudentPreviousAnswers } = await import('./mathaleaUtils');
            // Reinject answers for each exercise
            for (const exercice of exercicesData) {
                if (exercice == null || !exercice.answers)
                    continue;
                await Promise.all(mathaleaWriteStudentPreviousAnswers(exercice.answers));
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            // Wait for validation buttons to be rendered before signaling completion
            await waitForValidationButtons();
            // Signal that replay is complete - parent can now send FINISH_ATTEMPT
            console.info('[MathALEA-FlowMath] Replay complete, sending REPLAY_COMPLETED');
            sendFlowmathReplayCompleted();
        }
    };
    window.addEventListener('message', onMessage);
    const onWindowError = (event) => {
        if (!(event === null || event === void 0 ? void 0 : event.message))
            return;
        sendFlowmathError(event.message);
    };
    const onUnhandledRejection = (event) => {
        if ((event === null || event === void 0 ? void 0 : event.reason) == null)
            return;
        if (typeof event.reason === 'string') {
            sendFlowmathError(event.reason);
        }
        else if (event.reason instanceof Error) {
            sendFlowmathError(event.reason.message);
        }
        else {
            sendFlowmathError(String(event.reason));
        }
    };
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);
    sendFlowmathReady();
    sendFlowmathAttemptStarted(getFlowmathAttemptIdFromUrl());
    return () => {
        window.removeEventListener('message', onMessage);
        window.removeEventListener('error', onWindowError);
        window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
}
