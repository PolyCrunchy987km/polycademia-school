window.logDebug = window.logDebug || 0;
const url = new URL(window.location.href);
const debug = url.searchParams.get('log') === '3' || window.logDebug !== 0 ? 1 : 0;
export function log(message, ...optionalParams) {
    if (debug) {
        console.info(message, ...optionalParams);
    }
}
export function logDebug(message, ...optionalParams) {
    if (debug > 1 || window.logDebug > 1)
        log('DEBUG:', message, ...optionalParams);
}
export function statsTracker(exercise, recorder, vue, isreview) {
    logDebug('Tracking stats...');
    if (window._paq && isreview === '') {
        window._paq.push([
            'trackEvent',
            'CheckExo',
            vue + '-' + exercise.uuid + (recorder ? '-' + recorder : ''),
        ]);
    }
    log('CheckExo', vue +
        '-' +
        exercise.uuid +
        (recorder ? '-' + recorder : '') +
        (isreview ? '-review' : ''));
}
let oldUrl = '';
export function statsPageTracker() {
    logDebug('Tracking pages...');
    // Informer Matomo
    if (window.location.href !== oldUrl) {
        if (window._paq)
            window._paq.push([
                'trackEvent',
                'PageTracking',
                'VisitedURL',
                window.location.href,
            ]);
        oldUrl = window.location.href;
        log('statsPageTracker called with URL:', window.location.href);
    }
}
/*
// Exemple
const list1 = ['A', 'B', 'B', 'C', 'C', 'D']
const list2 = ['A', 'A', 'D', 'C', 'D', 'D', 'B']

console.log(getIntrus(list1, list2))
🔎 Résultat :
js
Copier
Modifier
[
  { value: 'A', difference: -1 }, // 1 de trop dans list2
  { value: 'B', difference: 0 },  // OK
  { value: 'C', difference: 1 },  // 1 de trop dans list1
  { value: 'D', difference: -2 }  // 2 de trop dans list2
]
  */
export function getIntrus(list1, list2) {
    const count = (arr) => arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    const count1 = count(list1);
    const count2 = count(list2);
    const allKeys = new Set([...Object.keys(count1), ...Object.keys(count2)]);
    const intrus = [];
    for (const key of allKeys) {
        const diff = (count1[key] || 0) - (count2[key] || 0);
        if (diff !== 0) {
            intrus.push({ value: key, difference: diff });
        }
    }
    return intrus;
}
