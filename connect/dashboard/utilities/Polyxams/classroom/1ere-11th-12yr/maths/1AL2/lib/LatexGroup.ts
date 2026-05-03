import type { ExerciceConfig } from './LatexTypes'
import { isIExercice, type IExercice, type IExerciceStatique } from './types'

/**
 * Décode une chaîne de regroupement d'exercices
 *
 * Règles :
 * - "-" sépare les groupes
 * - ";" concatène des exos dans un groupe
 * - ":" définit une plage jusqu'à
 *
 * Exemple :
 *   "1;3-4:7" -> [[0,2],[3,4,5,6]]
 *
 * decodeExosGrouping('1;3-4:7', 10)
 * [[0,2],[3,4,5,6]]
 *
 * decodeExosGrouping('2-5:6', 10)
 * [[1],[4,5]]
 *
 * decodeExosGrouping('1;2;3-4:4', 10)
 * [[0,1,2],[3]]
 *
 * decodeExosGrouping('4:7', 10)
 * [[3,4,5,6]]
 *
 */
export function decodeExosGrouping(value: string, maxExos: number): number[][] {
  if (!value?.trim()) return []

  return value
    .split('-') // ⬅️ groupes
    .map((groupStr) => {
      const set = new Set<number>()

      groupStr.split(';').forEach((part) => {
        console.log('part', part)
        if (part.includes(':')) {
          const [a, b] = part.split(':').map(Number)
          console.log('a', a, 'b', b)
          if (!Number.isFinite(a) || !Number.isFinite(b)) return

          const start = Math.max(1, a)
          const end = Math.min(maxExos, b)

          for (let i = start; i <= end; i++) {
            set.add(i - 1) // 1-based → 0-based
          }
        } else {
          const n = Number(part)
          if (Number.isFinite(n) && n >= 1 && n <= maxExos) {
            set.add(n - 1) // 1-based → 0-based
          }
        }
      })
      console.log('set', set)
      return Array.from(set).sort((a, b) => a - b)
    })
    .filter((group) => group.length > 0)
}

/**
 * Retrouve le groupe et la position d'un exercice
 *
 * @param groups tableau de groupes d'exercices [[0,1,2],[3]]
 * @param exo numéro de l'exercice
 * @returns { groupIndex, position } ou null
 */
export function findExoPosition(
  groups: number[][],
  exo: number,
): { groupIndex: number; position: number } | null {
  for (let g = 0; g < groups.length; g++) {
    const index = groups[g].indexOf(exo)
    if (index !== -1) {
      return {
        groupIndex: g,
        position: index,
      }
    }
  }
  return null
}

export function getPoints(exercice: IExercice | IExerciceStatique) {
  let points = 0
  if (isIExercice(exercice)) {
    for (let i = 0; i < exercice.listeQuestions.length; i++) {
      points++
    }
  } else {
    points = 1
  }
  return points
}

export function buildExamExercices(
  exercices: (IExercice | IExerciceStatique)[],
  latexFileInfos?: { exosGrouping?: string },
): ExerciceConfig[] {
  const grouping = latexFileInfos?.exosGrouping

  if (!grouping) {
    // Pas de grouping → 1 exercice = 1 entrée
    return exercices.map((e) => ({ points: getPoints(e) }))
  }

  const groups = decodeExosGrouping(grouping, exercices.length)

  return groups.map((group) => {
    const indices = group

    const totalPoints = indices.reduce((sum, i) => {
      if (i >= 0 && i < exercices.length) {
        return sum + getPoints(exercices[i])
      }
      return sum
    }, 0)

    return { points: totalPoints }
  })
}
