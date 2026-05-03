/**
 * Transforme un objet en arbre basé sur un type Map.
 * Chaque propriété devient une clé et la valeur correspondante devient :
 * - soit une valeur si la valeur de la propriété est un tableau
 * - soit une autre map dans le cas contraire
 * @param {any} obj
 * @return {Map} l'arbre correspondant à l'objet
 * @author sylvain Chambon
 */
export function toMap(obj) {
  const dico = new Map()
  for (const cle of Object.keys(obj)) {
    if (obj[cle] instanceof Object) {
      if (obj[cle] instanceof Array) {
        dico.set(cle, obj[cle])
      } else {
        dico.set(cle, toMap(obj[cle]))
      }
    } else {
      dico.set(cle, obj[cle])
    }
  }
  return dico
}
