/**
 * Compte le nombre d'apparitions de chaque UUIDs dans un tableau d'exercices (`InterfaceParams`)
 * @param {InterfaceParams[]} exosParams Un tableau des exercices
 * @returns Objet contenant toutes les UUIDs avec le nombres d'apparition
 */
export function uuidCount(exosParams) {
    const counts = {};
    for (const ex of exosParams) {
        counts[ex.uuid] = counts[ex.uuid] ? counts[ex.uuid] + 1 : 1;
    }
    return counts;
}
export function exercisesUuidRanking(exosParams) {
    const codesList = exosParams.map((p) => p.uuid);
    const ranks = [];
    for (const [i, ex] of exosParams.entries()) {
        const rank = codesList.slice(0, i + 1).filter((c) => {
            return c === ex.uuid;
        }).length;
        ranks.push(rank);
    }
    return ranks;
}
