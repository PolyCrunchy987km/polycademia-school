import type { InterfaceParams } from '../types'

/**
 * Compte le nombre d'apparitions de chaque UUIDs dans un tableau d'exercices (`InterfaceParams`)
 * @param {InterfaceParams[]} exosParams Un tableau des exercices
 * @returns Objet contenant toutes les UUIDs avec le nombres d'apparition
 */
export function uuidCount(
  exosParams: InterfaceParams[],
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const ex of exosParams) {
    counts[ex.uuid] = counts[ex.uuid] ? counts[ex.uuid] + 1 : 1
  }
  return counts
}

export function exercisesUuidRanking(exosParams: InterfaceParams[]): number[] {
  const codesList: string[] = exosParams.map((p) => p.uuid)
  const ranks: number[] = []
  for (const [i, ex] of exosParams.entries()) {
    const rank: number = codesList.slice(0, i + 1).filter((c) => {
      return c === ex.uuid
    }).length
    ranks.push(rank)
  }
  return ranks
}
