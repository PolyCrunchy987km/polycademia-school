const epsilon = 0.000001
declare global {
  interface Window {
    notify: (message: string, object: unknown) => void
    notifyLocal: (message: string, object: unknown) => void
  }
}
/**
 *
 * @param {any[]} array1
 * @param {any[]} array2
 * @return boolean
 */
export function compareArrays(array1: unknown[], array2: unknown[]): boolean {
  if (!Array.isArray(array1)) array1 = [array1]
  if (!Array.isArray(array2)) array2 = [array2]
  if (array1.length !== array2.length) return false
  for (let i = 0; i < array1.length; i++) {
    // le test suivant ne fonctionne pas avec des array contenant des objets, car objet1 === objet2 est toujours false.
    // il fonctionne avec des arrays d'array ou de primitives.
    const test = Array.isArray(array1[i])
      ? compareArrays(array1[i] as unknown[], array2[i] as unknown[])
      : array1[i] === array2[i]
    if (!test) return false
  }
  return true
}

/**
 * Retourne true si o1 et o2 ont les mêmes propriétés avec les mêmes valeurs
 * @param o1
 * @param o2
 */
export function areSameObject(o1: unknown, o2: unknown): boolean {
  if (typeof o1 !== 'object' || typeof o2 !== 'object') return false
  // les deux sont object
  if (o1 === null) return o2 === null
  // o1 objet non null
  if (o2 === null) return false
  if (Object.keys(o1).length !== Object.keys(o2).length) return false
  // return Object.entries(o1).every(([key, value]) => areSameValues((o2)[key], value))
  // EE 24/10/2024 : Tentative de typage de la dernière ligne en remmplacement de la précédente maintenant commentée
  return Object.entries(o1).every(([key, value]) =>
    areSameValues((o2 as Record<string, unknown>)[key], value),
  )
}
/**
 * Retourne true si ar1 et ar2 sont deux tableaux de même longueur, avec les même valeurs dans le même ordre
 */
export function areSameArray(ar1: unknown[], ar2: unknown[]): boolean {
  if (!Array.isArray(ar1) || !Array.isArray(ar2) || ar1.length !== ar2.length) {
    return false
  }
  return ar1.every((elt, i) => areSameValues(elt, ar2[i]))
}
/**
 * Retourne true si v1 et v2 ont la même valeur (égaux pour string|boolean|number, même contenu pour Object|Array)
 * Ne fonctionne pas pour les Object qui ne sont pas des "plain object" comme Regexp, Date, etc.
 */
export function areSameValues(v1: unknown, v2: unknown): boolean {
  // une valeur qui n'est pas égale à elle même en js
  if (typeof v1 === 'undefined') return typeof v2 === 'undefined'
  if (v1 === null) return v2 === null
  if (Number.isNaN(v1)) return Number.isNaN(v2)
  if (Array.isArray(v1)) return Array.isArray(v2) ? areSameArray(v1, v2) : false
  if (typeof v1 === 'object') {
    if (v1 instanceof Date) {
      if (!(v2 instanceof Date)) return false
      return v1.valueOf() === v2.valueOf()
    }
    if (v1 instanceof RegExp) {
      if (!(v2 instanceof RegExp)) return false
      return v1.source === v2.source && v1.flags === v2.flags
    }
    return areSameObject(v1, v2)
  }
  return v1 === v2
}

/**
 * Créé tous les couples possibles avec un élément de E1 et un élément de E2.
 * L'ordre est pris en compte, donc on pourra avoir (3,4) et (4,3).
 * Si le nombre de couples possibles est inférieur à nombreDeCouplesMin alors
 * on concatène 2 fois la même liste, mais avec des ordres différents.
 * @param {int} nombreDeCouplesMin=10 - Nombre de couples souhaités
 * @author Rémi Angot
 */
export function creerCouples<T1, T2>(
  E1: T1[],
  E2: T2[],
  nombreDeCouplesMin = 10,
  forcerElementsDifferents = false,
) {
  let result = []
  let temp = []
  for (const i of E1) {
    for (const j of E2) {
      if (!forcerElementsDifferents) {
        result.push([i, j])
      } else {
        if (typeof i !== typeof j || String(i) !== String(j)) {
          result.push([i, j])
        }
      }
    }
  }

  temp = shuffle(result).slice(0) // créer un clone du tableau result mélangé
  result = temp.slice(0)
  while (result.length < nombreDeCouplesMin) {
    result = result.concat(shuffle(temp))
  }
  return result
}

/**
 * Enlève toutes les occurences d'un élément d'un tableau donné
 * Ajouté par Jean-claude Lhote : la gestion des listes contenant des listes. (par exemple, dans 6N20-2).
 * @param liste
 * @param element
 *
 * @author Rémi Angot
 */
export function enleveElement<T>(array: Array<T>, item: T) {
  //
  for (let i = array.length - 1; i >= 0; i--) {
    if (typeof item === 'number') {
      if (Math.abs((array[i] as number) - item) < epsilon) {
        array.splice(i, 1)
      }
    } else if (Array.isArray(array[i]) && Array.isArray(item)) {
      if (compareArrays(array[i] as unknown[], item)) {
        array.splice(i, 1)
      }
    } else {
      if (array[i] === item) {
        array.splice(i, 1)
      }
    }
  }
}

/**
 * Enlève toutes les occurences d'un élément d'un tableau donné (array1) et enlève les éléments associés dans un autre tableau (array2)
 * @param array array1
 * @param array array2
 * @param element item
 *
 * @author Rémi Angot
 */
export function enleveElementDouble<T>(array1: T[], array2: T[], item: T) {
  //
  for (let i = array1.length - 1; i >= 0; i--) {
    if (typeof item === 'number') {
      if (Math.abs((array1[i] as number) - item) < epsilon) {
        array1.splice(i, 1)
        array2.splice(i, 1)
      }
    } else {
      if (array1[i] === item) {
        array1.splice(i, 1)
        array2.splice(i, 1)
      }
    }
  }
}

/**
 *
 * Compter les occurences d'un item dans un tableau
 * @param {array} array
 * @param item
 * @Author Rémi Angot
 */
export function compteOccurences<T>(array: T[], value: T): number {
  let cpt = 0
  array.forEach((v) => v === value && cpt++)
  return cpt
}

/**
 * Enlève toutes les occurences d'un élément d'un tableau donné, mais sans modifier le tableau en paramètre et renvoie le tableau modifié
 * @author Rémi Angot & Jean-claude Lhote
 */

export function enleveElementBis<T>(array: T[], item?: T) {
  const tableaucopie = []
  for (let i = 0; i < array.length; i++) {
    tableaucopie.push(array[i])
  }
  for (let i = tableaucopie.length - 1; i >= 0; i--) {
    if (tableaucopie[i] === item) {
      tableaucopie.splice(i, 1)
    }
  }
  return tableaucopie
}

/**
 * Enlève l'élément index d'un tableau attention ! modifie le tableau passé en argument ne retourne rien
 * @param {Array<any>} le tableau à modifier
 * @param {number} index de l'élément à retirer
 * @author Jean-claude Lhote
 */
export function enleveElementNo<T>(array: T[], index: number) {
  if (index >= 0 && index < array.length) array.splice(index, 1)
}

/**
 * Enlève l'élément index d'un tableau sans modifier le tableau et retourne le résultat
 * @param {Array<any>} le tableau à modifier
 * @param {number} index de l'élément à retirer
 * @return {Array<any>} une copie du tableau modifié
 * @author Jean-claude Lhote
 */
export function nouveauTableauPriveDunElement<T>(array: T[], index: number) {
  const tableaucopie = array.slice()
  return tableaucopie.splice(index, 1)
}

/**
 * Remplace toutes les occurrences d'une valeur dans un tableau par une autre.
 *
 * @template T - Type des éléments du tableau (string ou number).
 * @param {T[]} arr - Le tableau original dans lequel effectuer le remplacement.
 * @param {T} search - La valeur à rechercher dans le tableau.
 * @param {T} replace - La valeur de remplacement à insérer à la place de `search`.
 * @returns {T[]} Un nouveau tableau avec les valeurs remplacées.
 * @author Éric Elter
 * @example
 * remplaceDansTableau(['a', 'b', 'a'], 'a', 'z'); // ['z', 'b', 'z']
 *
 * @example
 * remplaceDansTableau([1, 2, 3, 2], 2, 99); // [1, 99, 3, 99]
 */
export function remplaceDansTableau<T extends string | number>(
  arr: T[],
  search: T,
  replace: T,
): T[] {
  return arr.map((item) => (item === search ? replace : item))
}

/**
 * Complète un tableau de nombres uniques dans une plage donnée jusqu'à atteindre nbQuestions,
 * en ajoutant des nombres aléatoires qui ne sont pas déjà présents dans le tableau.
 *
 * @param {number[]} tableau - Le tableau actuel de nombres uniques.
 * @param {number} nbQuestions - Le nombre total de valeurs souhaitées.
 * @param {number} valeurMax - La valeur maximale autorisée (minimum = 1).
 * @returns {number[]} Un nouveau tableau complété, sans doublons, avec des valeurs entre 1 et valeurMax.
 * @author Éric Elter
 *
 * @throws {Error} Si nbQuestions est supérieur à valeurMax.
 *
 * @example
 * completerNombresUniques([1, 3, 5], 5, 10); // [1, 3, 5, 8, 2] (par exemple)
 */
export function completerNombresUniques(
  tableau: number[],
  nbQuestions: number,
  valeurMax: number,
): number[] {
  if (nbQuestions > valeurMax) {
    throw new Error(
      `Impossible de générer ${nbQuestions} valeurs uniques entre 1 et ${valeurMax}.`,
    )
  }

  if (tableau.length >= nbQuestions) {
    return tableau.slice(0, nbQuestions)
  }

  const existants = new Set(tableau)

  // Générer les valeurs manquantes
  let valeursManquantes: number[] = []
  for (let i = 1; i <= valeurMax; i++) {
    if (!existants.has(i)) {
      valeursManquantes.push(i)
    }
  }

  valeursManquantes = shuffle(valeursManquantes)

  const nombreAAjouter = nbQuestions - tableau.length
  const ajouts = valeursManquantes.slice(0, nombreAAjouter)

  return [...tableau, ...ajouts]
}

/**
 * Retourne un élément au hasard de la liste sans appartenir à une liste donnée
 * @param {liste}
 * @param {listeAEviter}
 *
 * @example
 * // Renvoie 1, 2 ou 3
 * choice([1,2,3])
 * @example
 * // Renvoie Rémi ou Léa
 * choice(['Rémi','Léa'])
 *
 * @author Rémi Angot
 */
export function choice<T>(liste: T[], listeAEviter: T[] | T = []): T {
  if (!Array.isArray(listeAEviter)) {
    listeAEviter = [listeAEviter]
  }
  const listebis = liste.slice()
  // Supprime les éléments de liste à éviter
  for (let i = 0; i < listeAEviter.length; i++) {
    enleveElement(listebis, listeAEviter[i])
  }
  const index = Math.floor(Math.random() * listebis.length)
  if (listebis[index] != null) return listebis[index]
  else {
    window.notify(
      'choice a éliminé toutes les possibilités, il ne reste rien à choisir ! ',
      { liste, listeAEviter },
    )
    return listebis[index] // C'est null...
  }
}

/**
 * retourne un tableau dans lequel les doublons ont été supprimés s'il y en a MAIS SANS TRI
 * @param {array} arr Tableau duquel on veut supprimer les doublons numériques
 * @param {number} tolerance La différence minimale entre deux valeurs pour les considérer comme égales
 * @author Jean-claude Lhote
 **/
export function enleveDoublonNum(arr: number[], tolerance = epsilon) {
  let k = 0
  while (k < arr.length - 1) {
    let kk = k + 1
    while (kk <= arr.length - 1) {
      if (Math.abs(arr[k] - arr[kk]) < tolerance) {
        arr[k] = (arr[k] + arr[kk]) / 2 // On remplace la valeur dont on a trouvé un double par la moyenne des deux valeurs
        arr.splice(kk, 1) // on supprime le doublon.
      } else {
        kk++
      }
    }
    k++
  }
  return arr
}

/**
 * Mélange les items d'un tableau, sans modifier le tableau passé en argument
 *
 * @Example
 * tableau_melange = shuffle (tableau_origine)
 * @see https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length
  let temporaryValue
  let randomIndex

  // While there remain elements to shuffle...
  const arrayBis = [...array]
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = arrayBis[currentIndex]
    arrayBis[currentIndex] = arrayBis[randomIndex]
    arrayBis[randomIndex] = temporaryValue
  }

  return arrayBis
}

export function shuffleJusqua<T>(array: T[], indice: number): T[] {
  if (indice > array.length || indice < 0 || indice === undefined) {
    return shuffle(array)
  } else {
    const tableau1 = array.slice(0, indice)
    const tableau2 = array.slice(indice)
    return [...shuffle(tableau1), ...tableau2]
  }
}

/**
 * Mélange les lettres d'un string
 *
 * @Example
 * motMelange = shuffleLettres (mot)
 * @see https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
export function shuffleLettres(txt: string) {
  const array = txt.split('')
  return shuffle(array).join('')
}

/**
 * Mélange les items de deux tableaux de la même manière
 *
 *
 * @see https://stackoverflow.com/questions/18194745/shuffle-multiple-javascript-arrays-in-the-same-way
 */
export function shuffle2tableaux<T, U>(obj1: T[], obj2: U[]): void {
  let index = obj1.length
  let rnd, tmp1, tmp2

  while (index) {
    rnd = Math.floor(Math.random() * index)
    index -= 1
    tmp1 = obj1[index]
    tmp2 = obj2[index]
    obj1[index] = obj1[rnd]
    obj2[index] = obj2[rnd]
    obj1[rnd] = tmp1
    obj2[rnd] = tmp2
  }
}

/**
 * Mélange les items de deux tableaux de la même manière
 *
 *
 * @see https://stackoverflow.com/questions/18194745/shuffle-multiple-javascript-arrays-in-the-same-way
 */
export function shuffle2tableauxSansModif<T, U>(
  obj1: T[],
  obj2: U[],
): [T[], U[]] {
  let index = obj1.length
  let rnd, tmp1, tmp2
  const obj1bis = obj1.slice()
  const obj2bis = obj2.slice()
  while (index) {
    rnd = Math.floor(Math.random() * index)
    index -= 1
    tmp1 = obj1bis[index]
    tmp2 = obj2bis[index]
    obj1bis[index] = obj1bis[rnd]
    obj2bis[index] = obj2bis[rnd]
    obj1bis[rnd] = tmp1
    obj2bis[rnd] = tmp2
  }
  return [obj1bis, obj2bis]
}

/**
 * Mélange les items de trois tableaux de la même manière
 *
 *
 */
export function shuffle3tableaux<T, U, V>(
  obj1: T[],
  obj2: U[],
  obj3: V[],
): void {
  let index = obj1.length
  let rnd, tmp1, tmp2, tmp3

  while (index) {
    rnd = Math.floor(Math.random() * index)
    index -= 1
    tmp1 = obj1[index]
    tmp2 = obj2[index]
    tmp3 = obj3[index]
    obj1[index] = obj1[rnd]
    obj2[index] = obj2[rnd]
    obj3[index] = obj3[rnd]
    obj1[rnd] = tmp1
    obj2[rnd] = tmp2
    obj3[rnd] = tmp3
  }
}

/**
 * Mélange les items de trois tableaux de la même manière
 *
 *
 */
export function shuffle4tableaux<T, U, V, W>(
  obj1: T[],
  obj2: U[],
  obj3: V[],
  obj4: W[],
): void {
  let index = obj1.length
  let rnd, tmp1, tmp2, tmp3, tmp4

  while (index) {
    rnd = Math.floor(Math.random() * index)
    index -= 1
    tmp1 = obj1[index]
    tmp2 = obj2[index]
    tmp3 = obj3[index]
    tmp4 = obj4[index]
    obj1[index] = obj1[rnd]
    obj2[index] = obj2[rnd]
    obj3[index] = obj3[rnd]
    obj4[index] = obj4[rnd]
    obj1[rnd] = tmp1
    obj2[rnd] = tmp2
    obj3[rnd] = tmp3
    obj4[rnd] = tmp4
  }
}

/**
 * Concatène liste à elle-même en changeant l'ordre à chaque cycle
 * @param {Array | ReadonlyArray} liste - Un tableau
 * @param {number} tailleMinimale - La taille minimale du tableau de sortie
 * @returns {Array} Un tableau du même type que liste
 *
 * @Example
 * combinaisonListes([A,B,C],7)
 * // [B,C,A,C,B,A,A,B,C]
 *
 * @author Rémi Angot
 */
export function combinaisonListes<T>(liste: T[], tailleMinimale?: number) {
  if (tailleMinimale === undefined) tailleMinimale = liste.length
  if (liste.length === 0) {
    window.notify(
      'erreur dans CombinaisonListes : la liste à combiner est vide',
      { liste },
    )
  }
  let l = shuffle(liste) // on ne modifie pas la liste passée en argument !
  while (l.length < tailleMinimale) {
    l = l.concat(shuffle(liste))
  }
  return l
}

/**
 * Concatène liste à elle-même en imposant à la nouvelle liste de contenir au moins tous les élements
 * de la liste initiale, mais sans gestion de nombre de doublons.
 * @Example
 * combinaisonListes2([A,B,C],7)
 * // [B,C,B,B,C,A,B]
 * combinaisonListes2([A,B,C,D],6)
 * // [B,C,D,B,C,A,B]
 * @author Éric Elter
 */
export function combinaisonListes2<T>(liste: T[], tailleMinimale: number) {
  if (liste.length === 0) {
    window.notify(
      'erreur dans CombinaisonListes : la liste à combiner est vide',
      { liste },
    )
  }
  let l = [...liste] // on ne modifie pas la liste passée en argument !
  while (l.length < tailleMinimale) {
    l = l.concat(choice(liste) as T[])
  }
  return shuffle(l)
}

export function combinaisonListesSansChangerOrdre<T>(
  liste: T[],
  tailleMinimale: number,
) {
  // Concatène liste à elle-même sans changer l'ordre
  if (liste.length === 0) {
    window.notify(
      'erreur dans CombinaisonListes : la liste à combiner est vide',
      { liste },
    )
  }
  let l = [...liste] // on ne modifie pas la liste passée en argument !
  while (l.length < tailleMinimale) {
    l = l.concat(liste)
  }
  return l
}

export function getRandomSubarray<T>(arr: T[], size: number): T[] {
  // Copy the array to avoid mutating the original
  const shuffled = [...arr]
  let i = arr.length
  const min = i - size
  while (i > min) {
    // Generate a random index from 0 to i (exclusive)
    const index = Math.floor(Math.random() * i)
    i--
    // Swap elements
    ;[shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]]
  }
  // Return the last 'size' elements after shuffling
  return shuffled.slice(min)
}

/**
 * Construit une liste d'index aléatoires basée sur la taille
 * du tableau originel et le nombre d'index à prélever dans
 * ce tableau.
 * @param {number} originalArraySize taille du tableau d'origine
 * @param {number} nbOfIndexes nombre d'index à choisir
 * @returns {number[]} tableau d'index
 * @author sylvain
 */
export function listOfRandomIndexes(
  originalArraySize: number,
  nbOfIndexes: number,
) {
  const indexes = shuffle([...Array(originalArraySize).keys()])
  return indexes.slice(0, nbOfIndexes)
}

export // Fonction utilitaire pour cloner récursivement un objet simple
function arrayCloneObject(obj: any): any {
  const clonedObj: any = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      if (Array.isArray(value)) {
        clonedObj[key] = arrayClone(value)
      } else if (value && typeof value === 'object') {
        clonedObj[key] = arrayCloneObject(value)
      } else {
        clonedObj[key] = value
      }
    }
  }
  return clonedObj
}

export function arrayClone(originalArray: any[]): any[] {
  return originalArray.map((item) => {
    if (Array.isArray(item)) {
      return arrayClone(item)
    } else if (item && typeof item === 'object') {
      // Clone récursif pour les objets simples
      const clonedObj: any = {}
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key)) {
          const value = item[key]
          if (Array.isArray(value)) {
            clonedObj[key] = arrayClone(value)
          } else if (value && typeof value === 'object') {
            clonedObj[key] = arrayCloneObject(value)
          } else {
            clonedObj[key] = value
          }
        }
      }
      return clonedObj
    } else {
      // Primitives (number, string, boolean, null, undefined)
      return item
    }
  })
}

type OptionsBinomes = {
  premierNombre?: number
  dernierNombre?: number
  ordreCroissant?: boolean
  ordreDecroissant?: boolean
}

/**
 * Génère tous les binômes possibles à partir d’un tableau de nombres,
 * en respectant éventuellement certaines options de filtrage.
 *
 * @param {number[]} tab - Tableau de nombres à combiner.
 * @param {Object} [options={}] - Options permettant de restreindre ou filtrer les binômes.
 * @param {number} [options.premierNombre] - Si défini, ne garde que les binômes dont le premier élément est ce nombre.
 * @param {number} [options.dernierNombre] - Si défini, ne garde que les binômes dont le second élément est ce nombre.
 * @param {boolean} [options.ordreCroissant=false] - Si true, ne conserve que les binômes [a, b] où a < b.
 * @param {boolean} [options.ordreDecroissant=false] - Si true, ne conserve que les binômes [a, b] où a > b.
 * @returns {[number, number][]} Liste de binômes valides.
 * @author Éric Elter
 *
 * @example
 * genererBinomesAleatoires([0,1,2,3])
 * // =>
 * // [
 * //   [0,1],[0,2],[0,3],
 * //   [1,0],[1,2],[1,3],
 * //   [2,0],[2,1],[2,3],
 * //   [3,0],[3,1],[3,2]
 * // ]
 *
 * @example
 * genererBinomesAleatoires([0,1,2,3], { ordreCroissant: true })
 * // => [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]
 *
 * @example
 * genererBinomesAleatoires([0,1,2,3], { premierNombre: 2 })
 * // => [[2,0],[2,1],[2,3]]
 *
 * @example
 * genererBinomesAleatoires([0,1,2,3], { dernierNombre: 2 })
 * // => [[0,2],[1,2],[3,2]]
 *
 * @example
 * genererBinomesAleatoires([0,1,2,3], { premierNombre: 1, dernierNombre: 3 })
 * // => [[1,3]]
 */
export function genererBinomesAleatoires(
  tab: number[],
  options: OptionsBinomes = {},
): [number, number][] {
  const {
    premierNombre = undefined,
    dernierNombre = undefined,
    ordreCroissant = false,
    ordreDecroissant = false,
  } = options

  const binomes: [number, number][] = []

  for (let i = 0; i < tab.length; i++) {
    for (let j = 0; j < tab.length; j++) {
      if (i === j) continue

      const a = tab[i]
      const b = tab[j]

      // Appliquer les options
      if (premierNombre !== undefined && a !== premierNombre) continue
      if (dernierNombre !== undefined && b !== dernierNombre) continue
      if (ordreCroissant && a >= b) continue
      if (ordreDecroissant && a <= b) continue

      binomes.push([a, b])
    }
  }

  // Mélange aléatoire (Fisher-Yates)
  for (let i = binomes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[binomes[i], binomes[j]] = [binomes[j], binomes[i]]
  }
  return binomes
}
