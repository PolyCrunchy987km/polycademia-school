import type { IExercice, ResultOfExerciceInteractif } from '../../lib/types'

export function afficheScore(
  exercice: IExercice,
  nbBonnesReponses: number,
  nbMauvaisesReponses: number,
  divScore?: HTMLDivElement,
  divButton?: HTMLButtonElement,
): ResultOfExerciceInteractif {
  if (divButton != null) {
    divButton.classList.add(
      'cursor-not-allowed',
      'opacity-50',
      'pointer-events-none',
    )
  }
  if (divScore != null) {
    divScore.innerHTML = `${nbBonnesReponses} / ${nbBonnesReponses + nbMauvaisesReponses}`
    divScore.style.color = '#f15929'
    divScore.style.fontWeight = 'bold'
    divScore.style.fontSize = 'x-large'
    divScore.style.display = 'inline'
  }
  return {
    numberOfPoints: nbBonnesReponses,
    numberOfQuestions: nbBonnesReponses + nbMauvaisesReponses,
  }
}
