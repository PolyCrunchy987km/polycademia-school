import {
  isExamItemInReferentiel,
  isExerciceItemInReferentiel,
  isStaticType,
  resourceHasMonth,
  type ResourceAndItsPath,
} from '../types/referentiels'
import { monthes } from './handleDate'

/**
 * Un type pour décomposer les chaînes de caractères
 */
type StringDecomposition = {
  index: number
  value: string[]
  o: string
  s: string
}

/**
 * Un type pour faciliter le tri d'un tableau de resource
 */
type ResourceAndItsPathDecomposition = {
  index: number
  value: string[]
  o: ResourceAndItsPath
  s: string
}

/**
 * Détecte si une chaîne est un nombre ou pas
 * @param v chaine à inspecter
 * @returns `true` si la chaîne contient un nombre
 */
function thisStringRepresentsANumber(v: string) {
  return (+v).toString() === v
}

/**
 * Trier deux objets décrit par un tableau de chaînes
 */
const customSorting = {
  asc: function (a: StringDecomposition, b: StringDecomposition): number {
    let i = 0
    const l = Math.min(a.value.length, b.value.length)

    while (i < l && a.value[i] === b.value[i]) {
      i++
    }
    if (i === l) {
      return a.value.length - b.value.length
    }
    if (
      thisStringRepresentsANumber(a.value[i]) &&
      thisStringRepresentsANumber(b.value[i])
    ) {
      return parseInt(a.value[i]) - parseInt(b.value[i])
    }
    return a.value[i].localeCompare(b.value[i])
  },
  desc: function (a: StringDecomposition, b: StringDecomposition): number {
    return customSorting.asc(b, a)
  },
}

/**
 * Trier deux objets décrit par un tableau de chaînes
 */
const customSortingForResources = {
  asc: function (
    a: ResourceAndItsPathDecomposition,
    b: ResourceAndItsPathDecomposition,
  ): number {
    let i = 0
    const l = Math.min(a.value.length, b.value.length)

    while (i < l && a.value[i] === b.value[i]) {
      i++
    }
    if (i === l) {
      return a.value.length - b.value.length
    }
    if (
      thisStringRepresentsANumber(a.value[i]) &&
      thisStringRepresentsANumber(b.value[i])
    ) {
      return parseInt(a.value[i]) - parseInt(b.value[i])
    }
    return a.value[i].localeCompare(b.value[i])
  },
  desc: function (
    a: ResourceAndItsPathDecomposition,
    b: ResourceAndItsPathDecomposition,
  ): number {
    return customSortingForResources.asc(b, a)
  },
}

/**
 * Trier un tableau de chaînes de caractères contenant des tirets
 * comme `4A10`, `4A10-1` `4A10-10`, etc.
 * Source : https://stackoverflow.com/a/47051217
 * @param data tableau à trier
 * @param order `asc` (défaut) ou `desc`
 */
export const sortArrayOfStringsWithHyphens = (
  data: string[],
  order: 'asc' | 'desc' = 'asc',
) => {
  // nettoyer les chaînes en ne gardant que les éléments liés par des tirets
  // (comme `4-A10-1`) puis déstructurer cette chaîne
  const mapped = data.map(function (el, i) {
    const string = el.replace(/\d(?=[a-z])|[a-z](?=\.)/gi, '$&. .')
    const regex = /(\d+)|([^0-9.]+)/g
    let m: RegExpExecArray | null
    const parts = []

    while ((m = regex.exec(string)) !== null) {
      parts.push(m[0])
    }
    return { index: i, value: parts, o: el, s: string }
  })
  mapped.sort(customSorting[order] || customSorting.asc)
  return mapped.map(function (el) {
    return data[el.index]
  })
}

/**
 * Transforme les ID des exercices d'automatisme afin de préserver
 * leur positionnement en fin de liste d'une section lors de l'organisation du référentiel.
 * La chaîne auto6N2A devient 6N2zzzzzA, auto6N2A-1 devient 6N2zzzzzA-1, etc.
 * @param input ID à transformer
 * @returns la chaîne avec le `zzzzz` insérée après les trois premiers caractères
 */
function transformAutomatismId(input: string): string {
  // Expression régulière pour matcher le pattern décrit
  // auto + chiffre + lettre majuscule + chiffre + reste
  const regex = /^auto(\d)([A-Z])(\d)(.*)?/gm
  const match = [...input.matchAll(regex)]

  // Si la chaîne ne correspond pas au pattern, retourner l'input inchangé
  if (match.length === 0) {
    return input
  }

  // Extraction des groupes capturés
  const [, digit1, letter, digit2, optionalSuffix] = [...match[0]]

  // Construction de la nouvelle chaîne
  // Format: chiffre + lettre + chiffre + "zzzzz" + dernière partie + suffixe optionnel
  const result = `${digit1}${letter}${digit2}zzzzz${optionalSuffix || ''}`

  return result
}

/**
 * Trie une liste de ressources sur la base d'une propriété (uuid ou id).
 * L'ordre tient compte des tirets : par exemple, `4-C10`, viendra avant `4-C10-1`
 * qui viendra lui-même avant `4-C10-10`
 * @param data la liste à trier
 * @param key la propriété sur laquelle va s'opérer le tri
 * @param order l'ordre du tri (ascendant ou descendant)
 * @returns la liste triée
 * @see https://stackoverflow.com/a/47051217
 */
export const sortArrayOfResourcesBasedOnProp = (
  data: ResourceAndItsPath[],
  key: 'uuid' | 'id',
  order: 'asc' | 'desc' = 'asc',
): ResourceAndItsPath[] => {
  if (data.length === 0) {
    return data
  }
  const mapped = data.map((elt, i) => {
    const r = elt.resource
    let string: string
    if (isExerciceItemInReferentiel(r) && key === 'id') {
      string = transformAutomatismId(r[key])
      string = string.replace(/\d(?=[a-z])|[a-z](?=\.)/gi, '$&. .')
    } else if (isStaticType(r) && key === 'uuid') {
      string = r[key].replace(/\d(?=[a-z])|[a-z](?=\.)/gi, '$&. .')
    } else {
      throw new Error(`La clé ${key} n'existe pas dans les ressources à trier.`)
    }
    const regex = /(\d+)|([^0-9.]+)/g
    let m: RegExpExecArray | null
    const parts = []

    while ((m = regex.exec(string)) !== null) {
      parts.push(m[0])
    }
    return { index: i, value: parts, o: elt, s: string }
  })
  mapped.sort(customSortingForResources[order] || customSortingForResources.asc)
  return mapped.map(function (el) {
    return data[el.index]
  })
}

/**
 * Trie une liste de ressources suivant l'année et éventuellement le mois
 * @param data liste de ressources
 * @param order ordre de tri (ascendant ou descendant)
 * @returns la liste triée
 */
export const sortArrayOfResourcesBasedOnYearAndMonth = (
  data: ResourceAndItsPath[],
  order: 'asc' | 'desc' = 'asc',
): ResourceAndItsPath[] => {
  if (data.length === 0) {
    return data
  }
  return data.sort((a, b) => {
    // seuls les ressources de type examens ont des propriétés `annee` et des fois `mois`
    if (
      isExamItemInReferentiel(a.resource) &&
      isExamItemInReferentiel(b.resource)
    ) {
      const resourceAYear = parseInt(a.resource.annee)
      const resourceBYear = parseInt(b.resource.annee)
      if (resourceAYear !== resourceBYear) {
        switch (order) {
          case 'asc':
            return resourceAYear - resourceBYear
          case 'desc':
            return resourceBYear - resourceAYear
          default:
            return 0
        }
      }
      if (resourceHasMonth(a.resource) && resourceHasMonth(b.resource)) {
        const resourceAMonth = monthes.indexOf(a.resource.mois!)
        const resourceBMonth = monthes.indexOf(b.resource.mois!)
        switch (order) {
          case 'asc':
            return resourceAMonth - resourceBMonth
          case 'desc':
            return resourceBMonth - resourceAMonth
          default:
            return 0
        }
      } else {
        return 0
      }
    } else {
      return 0
    }
  })
}
/**
 * Trie selon l'ordre alphabétique ou numérique
 * @param a nombre ou chaîne de caractères
 * @param b nombre ou chaîne de caractères
 * @returns le résultat de la comparaison
 */
// Define a custom sorting function
export const customSortStringNumber = (
  a: number | string,
  b: number | string,
): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  } else {
    return String(a).localeCompare(String(b))
  }
}

type Order = 'asc' | 'desc' | 'ascStringdescNumber'

// Fonction qui divise une chaîne en parties numériques et non numériques (pour mettre dans l'ordre sujet1, sujet2 et sujet10)
function splitAlphaNumeric(str: string): (string | number)[] {
  return str
    .split(/(\d+)/)
    .map((part) => (isNaN(Number(part)) ? part : Number(part)))
}

// Fonction de comparaison prenant en compte les parties numériques et les majuscules accentuées
function compareAlphaNumeric(a: string, b: string, order: Order): number {
  const aParts = splitAlphaNumeric(a)
  const bParts = splitAlphaNumeric(b)

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] ?? ''
    const bPart = bParts[i] ?? ''

    if (typeof aPart === 'number' && typeof bPart === 'number') {
      if (aPart !== bPart) {
        // console.log(a +':' + b +'=>n' + aPart +':'+ bPart + ':' + (aPart - bPart))
        return order === 'asc' ? aPart - bPart : bPart - aPart
      }
    } else if (aPart !== bPart) {
      // Utiliser localeCompare pour comparer les chaînes de manière insensible aux accents et à la casse
      const comparison = (aPart as string)
        .normalize('NFD')
        .localeCompare((bPart as string).normalize('NFD'), undefined, {
          sensitivity: 'base',
        })
      if (comparison !== 0) {
        // console.log(a +':' + b +'=>s' + aPart +':'+ bPart + ':'+ (comparison))
        return order === 'asc' || order === 'ascStringdescNumber'
          ? comparison
          : -comparison
      }
    }
  }
  return 0
}

/**
 * Trie les annales selon le type (bac, brevet.... par thème ou par année) puis suivant l'année ou le thème puis suivant le nom (donc rangement alphabétique)
 * @param {ResourceAndItsPath[]} data liste de ressources
 * @param {'asc' | 'desc' | 'ascStringdescNumber'} order ordre de tri (ascendant ou descendant)
 * ascStringdescNumber : ascendant pour les strings et descandants pour les nombres (car les nombres sont des années)
 * @returns {ResourceAndItsPath[]} la liste triée
 * @author Eric Elter
 */

// Exemple d'utilisation : Ne pas supprimer car c'est pratique pour des tests.
/* const data: DataItem[] = [
  {
    pathToResource: ['Paris1', 'Agrandissement-réduction', 'dnb_2013_04_pondichery_5'],
    resource: { uuid: 'dnb_2013_04_pondichery_5', annee: '2013', lieu: 'Pondichéry' }
  },
  {
    pathToResource: ['Paris11', 'Agrandissement-réduction', 'dnb_2023_04_pondichery_5'],
    resource: { uuid: 'dnb_2023_04_pondichery_5', annee: '2023', lieu: 'Pondichéry' }
  },
  {
    pathToResource: ['Paris2', 'Agrandissement-réduction', 'dnb_2013_04_pondichery_5'],
    resource: { uuid: 'dnb_2013_04_pondichery_5', annee: '2013', lieu: 'Pondichéry' }
  }
] */
export const triAnnales = (
  data: ResourceAndItsPath[],
  order: Order = 'asc',
): ResourceAndItsPath[] => {
  if (data.length > 0) {
    data.sort((a, b) => {
      // Premier critère de tri : pathToResource[0]
      let result = compareAlphaNumeric(
        a.pathToResource[0],
        b.pathToResource[0],
        order,
      )
      if (result !== 0) return result

      // Deuxième critère de tri : pathToResource[1] (si disponible)
      if (a.pathToResource[1] && b.pathToResource[1]) {
        result = compareAlphaNumeric(
          a.pathToResource[1],
          b.pathToResource[1],
          order,
        )
        if (result !== 0) return result
      }

      // Troisième critère de tri : pathToResource[2] (si disponible)
      if (a.pathToResource[2] && b.pathToResource[2]) {
        result = compareAlphaNumeric(
          a.pathToResource[2],
          b.pathToResource[2],
          order,
        )
        if (result !== 0) return result
      }

      // Si tout est égal
      return 0
    })
  }
  return data
}
