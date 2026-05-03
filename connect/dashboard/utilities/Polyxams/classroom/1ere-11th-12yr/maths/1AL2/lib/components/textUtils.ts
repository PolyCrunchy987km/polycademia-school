/**
 * Débarrasse une chaîne de ses caractères accentués en les remplaçant
 * par des caractères sans accent
 * @see https://www.equinode.com/fonctions-javascript/retirer-les-accents-avec-javascript
 * @example
 * // returns `'Thales eleve ca peche a noel'`
 * texte="Thalès élève ça pêche à noël"
 * stringWithNoAccent(texte) // returns `'Thales eleve ca peche a noel'`
 * @param a chaîne à traiter
 * @returns chaîne débarassée de ses accents
 */
export function stringWithNoAccent(a: string): string {
  return a.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
