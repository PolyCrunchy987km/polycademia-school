/**
 * Le type NumberRange<T, U> qu'on peut trouver dans src/lib/types.ts est très bien pour définir un intervalle de nombres,
 * mais il n'est pas "type guardable". C'est-à-dire qu'on ne peut pas créer de fonction qui permet dire à typescript
 * que la valeur passée en argument est bien un NumberRange<T, U>.
 * Il est même probable que ce soit impossible à faire avec la version de typescript actuelle.
 * En attendant, je propose d'utiliser ce fichier pour créer les intervalles de nombres dont on a besoin au fur et à mesure avec les type guards qui vont avec.
 */

export type IntegerInRange0to2 = 0 | 1 | 2
export function isIntegerInRange0to2(obj: unknown): obj is IntegerInRange0to2 {
  return obj === 0 || obj === 1 || obj === 2
}

export type IntegerInRange0to3 = 0 | 1 | 2 | 3
export function isIntegerInRange0to3(obj: unknown): obj is IntegerInRange0to3 {
  return obj === 0 || obj === 1 || obj === 2 || obj === 3
}

export type IntegerInRange0to4 = 0 | 1 | 2 | 3 | 4
export function isIntegerInRange0to4(obj: unknown): obj is IntegerInRange0to4 {
  return obj === 0 || obj === 1 || obj === 2 || obj === 3 || obj === 4
}

export type IntegerInRange1to4 = 1 | 2 | 3 | 4
export function isIntegerInRange1to4(obj: unknown): obj is IntegerInRange1to4 {
  return obj === 1 || obj === 2 || obj === 3 || obj === 4
}
