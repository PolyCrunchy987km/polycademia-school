import { get } from 'svelte/store';
import { MultiMathfieldElement } from './interactif/MultiMathfield/MultiMathfield';
import { previousView } from './stores/generalStore';
import { globalOptions } from './stores/globalOptions';
export function mathaleaGoToView(destinationView) {
    var _a;
    const originView = (_a = get(globalOptions).v) !== null && _a !== void 0 ? _a : '';
    const prevView = get(previousView);
    // Si on retourne à l'accueil et qu'on venait d'une vue spécifique, on y retourne
    if (destinationView === '' && prevView) {
        destinationView = prevView;
        previousView.set(undefined);
    }
    else {
        previousView.set(originView);
    }
    if (destinationView !== get(globalOptions).v) {
        // on met à jour que si nécessaire
        globalOptions.update((l) => {
            l.v = destinationView;
            return l;
        });
    }
}
function log(message) {
    // console.log(message)
}
/**
 * Attend qu'un élément du DOM remplisse une condition, ou time out
 * @param {() => boolean} conditionFn - fonction qui retourne true quand l'élément est prêt
 * @param {number} timeout - durée max en ms
 * @param {number} interval - fréquence de vérification en ms
 */
export function waitFor(conditionFn, timeout = 2000, interval = 50, trace = '') {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function check() {
            if (conditionFn()) {
                resolve(true);
            }
            else if (Date.now() - start > timeout) {
                reject(new Error('Timeout waiting for condition:' + trace));
            }
            else {
                setTimeout(check, interval);
            }
        }
        check();
    });
}
/**
 * On attend un élément ou des éléments du DOM en fonction d'un selecteur
 * @param elementId selecteur
 * @param timeWait temps en secondes
 * @returns une promise sur l'élément ou les éléments en question
 */
const waitForElement = async (elementId, timeWait = 4) => {
    return new Promise((resolve, reject) => {
        const ele = document.querySelectorAll(elementId);
        if (ele.length) {
            // pas besoin d'attendre
            resolve(ele);
            return;
        }
        let tempTime = 0;
        const timeWait1000 = timeWait * 10;
        const checkExist = setInterval(function () {
            const ele = document.querySelectorAll(elementId);
            if (ele.length) {
                // console.log(`Exists ${elementId}`)
                clearInterval(checkExist);
                resolve(ele);
            }
            else if (ele.length === 0 && tempTime > timeWait1000) {
                // console.log('Doesn\'t exist...')
                clearInterval(checkExist);
                const domSnapshot = document.body.outerHTML;
                window.notify(`Timeout waiting for element ${elementId}`, {
                    timeWait,
                    domSnapshot,
                });
                reject(new Error(`Element not found ${elementId}`));
            }
            else {
                tempTime++;
                // console.log(`Waiting for ${elementId}`, tempTime)
            }
        }, 100); // check every 100ms
    });
};
export function mathaleaWriteStudentPreviousAnswers(answers) {
    const promiseAnswers = [];
    const starttime = window.performance.now();
    for (const answer in answers) {
        if (answer.includes('svgSelection')) {
            const p = new Promise((resolve) => {
                waitForElement(`[id$='${answer}']`)
                    .then((eles) => {
                    eles.forEach((ele) => {
                        if (ele.tagName === 'SVG-SELECTION') {
                            // La réponse correspond à un svgSelection
                            ;
                            ele.value = Number(answers[answer]);
                            const time = window.performance.now();
                            log(`duration ${answer}: ${time - starttime}`);
                            resolve(true);
                        }
                    });
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('MetaInteractif2d')) {
            const p = new Promise((resolve) => {
                const saisies = JSON.parse(answers[answer]);
                const selectors = Object.keys(saisies).map((field) => `#${field}`);
                Promise.all(selectors.map((selector) => waitForElement(selector)))
                    .then(() => {
                    for (const field in saisies) {
                        const mf = document.getElementById(field);
                        if (mf &&
                            'setPromptValue' in mf &&
                            typeof mf.setPromptValue === 'function') {
                            mf.setPromptValue('champ1', saisies[field], { mode: 'auto' });
                        }
                    }
                    const time = window.performance.now();
                    log(`duration ${answer}: ${time - starttime}`);
                    resolve(true);
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('sheet')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    // La réponse correspond à une feuille de calcul jspreadsheet
                    const sheetElement = document.getElementById(answer);
                    if (sheetElement != null) {
                        sheetElement.setData(JSON.parse(answers[answer]));
                    }
                    const time = window.performance.now();
                    log(`duration ${answer}: ${time - starttime}`);
                    resolve(true);
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('apigeom') ||
            answers[answer].includes('apiGeomVersion')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    // La réponse correspond à une figure apigeom
                    const event = new CustomEvent(answer, { detail: answers[answer] });
                    document.dispatchEvent(event);
                    const time = window.performance.now();
                    log(`duration ${answer}: ${time - starttime}`);
                    // ne pas resolve ici si tu veux attendre waitFor
                    return waitFor(() => {
                        const el = document.querySelector('#' + answer);
                        if (!el)
                            return false; // l'élément n'existe pas encore
                        return (el === null || el === void 0 ? void 0 : el.children.length) >= 1;
                    }, 5000, 100, '#' + answer);
                })
                    .then(() => resolve(true))
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('cliquefigure')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    // La réponse correspond à une figure cliquefigures
                    const ele = document.querySelector(`#${answer}`);
                    if (ele) {
                        ele.etat = true;
                        ele.style.border = '3px solid #f15929';
                        const time = window.performance.now();
                        log(`duration ${answer}: ${time - starttime}`);
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('cliquePoint')) {
            // "answers": {"cliquePointfigEx7Q0P60" : "svg[id$='Ex7Q0'] g:nth-of-type(61)"}
            // On active le point 60 (61ème enfant) par exemple ici...
            const p = new Promise((resolve) => {
                waitForElement(answers[answer])
                    .then(() => {
                    // La réponse correspond à un cliquePoint
                    const ele = document.querySelector(answers[answer]);
                    if (ele) {
                        const evt = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        ele.dispatchEvent(evt);
                        const time = window.performance.now();
                        log(`duration ${answer}: ${time - starttime}`);
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('texteDND')) {
            // on ignore ce champ, il est juste pour le debug et il ne sert pas!
            const p = new Promise((resolve) => {
                resolve(true);
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('rectangleDND')) {
            const p = new Promise((resolve) => {
                waitForElement(`div#${answer.replace('DND', '')}`)
                    .then(() => {
                    const rectangle = document.querySelector(`div#${answer.replace('DND', '')}`);
                    if (rectangle !== null) {
                        const listeOfIds = answers[answer].split(';');
                        for (const id of listeOfIds) {
                            // attention ! on a peut-être à faire à des clones ! qu'il faut recréer !
                            if (!id.includes('-clone-')) {
                                // Non, c'est un original
                                const etiquette = document.querySelector(`div#${id}`);
                                if (etiquette !== null) {
                                    // Remet l'étiquette à la bonne réponse
                                    rectangle.appendChild(etiquette);
                                }
                            }
                            else {
                                // Là, on doit recloner l'original !
                                const idOriginalAndDate = id.split('-clone-');
                                const etiquetteOriginale = document.querySelector(`div#${idOriginalAndDate[0]}`);
                                if (etiquetteOriginale != null) {
                                    const clonedEtiquette = etiquetteOriginale.cloneNode(true);
                                    clonedEtiquette.id = `${idOriginalAndDate[0]}-clone-${idOriginalAndDate[1]}`;
                                    rectangle.appendChild(clonedEtiquette);
                                }
                            }
                        }
                        const time = window.performance.now();
                        log(`duration ${answer}: ${time - starttime}`);
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('clockEx')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    // La réponse correspond à une horloge
                    const clock = document.querySelector(`#${answer}`);
                    if (clock !== null) {
                        const [hour, minute] = answers[answer].split('h');
                        clock.setAttribute('hour', hour);
                        clock.setAttribute('minute', minute);
                        if ('updateHandHour' in clock &&
                            typeof clock.updateHandHour === 'function') {
                            clock.updateHandHour();
                        }
                        if ('updateHandMinute' in clock &&
                            typeof clock.updateHandMinute === 'function') {
                            clock.updateHandMinute();
                        }
                        const time = window.performance.now();
                        log(`duration ${answer}: ${time - starttime}`);
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.includes('sheet-')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    // La réponse correspond à une feuille de calcul univer
                    const ele = document.querySelector(`#${answer}`);
                    if (ele) {
                        const actions = answers[answer].split('&');
                        for (const action of actions) {
                            const [cell, formula] = action.split('->');
                            console.info(cell, formula);
                        }
                        ele.style.pointerEvents = 'none'; // Plus possible de modifier la feuille
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.startsWith('labyrintheEx')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    const labyrinthe = document.querySelector(`#${answer}`);
                    if (labyrinthe !== null) {
                        labyrinthe.state = answers[answer];
                        const time = window.performance.now();
                        log(`duration ${answer}: ${time - starttime}`);
                        resolve(true);
                    }
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else if (answer.startsWith('multiMathfieldEx')) {
            const p = new Promise((resolve) => {
                waitForElement('#' + answer)
                    .then(() => {
                    const multiMathfield = document.querySelector(`#${answer}`);
                    const answersMulti = MultiMathfieldElement.answersFromFilledTemplate(answers[answer]);
                    if (multiMathfield !== null) {
                        multiMathfield.setAnswers(answersMulti);
                    }
                    resolve(true);
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
        else {
            const p = new Promise((resolve) => {
                waitForElement(`[id$='${answer}']`)
                    .then((eles) => {
                    eles.forEach((ele) => {
                        if (ele.tagName === 'LISTE-DEROULANTE') {
                            // La réponse correspond à un select
                            ;
                            ele.value = answers[answer];
                            const time = window.performance.now();
                            log(`duration ${answer}: ${time - starttime}`);
                            resolve(true);
                        }
                        else if (ele.id.includes('check')) {
                            // La réponse correspond à une case à cocher qui doit être cochée
                            if (answers[answer] === '1') {
                                ;
                                ele.checked = true;
                            }
                            const time = window.performance.now();
                            log(`duration ${answer}: ${time - starttime}`);
                            resolve(true);
                        }
                        else if (ele.tagName === 'MATH-FIELD' &&
                            'setValue' in ele &&
                            typeof ele.setValue === 'function') {
                            // La réponse correspond à un champs texte
                            ;
                            ele.setValue(answers[answer]);
                            const time = window.performance.now();
                            log(`duration ${answer}: ${time - starttime}`);
                            resolve(true);
                        }
                        else if (ele.tagName === 'INPUT') {
                            ;
                            ele.value = answers[answer];
                            const time = window.performance.now();
                            log(`duration ${answer}: ${time - starttime}`);
                            resolve(true);
                        }
                    });
                })
                    .catch((reason) => {
                    console.error(reason);
                    window.notify(`Erreur dans la réponse ${answer} : ${reason}`, {});
                    resolve(true);
                });
            });
            promiseAnswers.push(p);
        }
    }
    return promiseAnswers;
}
