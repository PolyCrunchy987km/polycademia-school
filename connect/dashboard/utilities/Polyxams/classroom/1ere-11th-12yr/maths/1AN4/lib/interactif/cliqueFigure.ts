import { addElement, get, setStyles } from '../html/dom'
import type { ClickFigures, IExercice } from '../types'
import { afficheScore } from './afficheScore'
export type FigureClicable = HTMLElement & {
  etat: boolean
  hasMathaleaListener: boolean
}

export function mouseOverSvgEffect(this: HTMLElement) {
  this.style.border = '1px solid #1DA962'
}

export function mouseOutSvgEffect(this: HTMLElement) {
  this.style.border = 'none'
}

export function mouseSvgClick(this: FigureClicable) {
  if (this.etat) {
    // Déja choisi, donc on le réinitialise
    this.style.border = 'none'
    this.addEventListener('mouseover', mouseOverSvgEffect)
    this.addEventListener('mouseout', mouseOutSvgEffect)
    this.addEventListener('click', mouseSvgClick)
    this.etat = false
  } else {
    // Passe à l'état choisi donc on désactive les listenners pour over et pour out
    this.removeEventListener('mouseover', mouseOverSvgEffect)
    this.removeEventListener('mouseout', mouseOutSvgEffect)
    // this.style.border = '3px solid #f15929'
    this.etat = true
  }
}

/**
 * Retrouve les numéros des figures cliquées dans une question de type "cliqueFigure"
 */
export function indexQuestionCliqueFigure(exercice: IExercice, i: number) {
  const elementArray: (HTMLElement | null)[] = []
  for (let j = 0; j < (exercice.figures![i] as ClickFigures).length; j++) {
    const eltFigure = document.getElementById(
      (exercice.figures! as ClickFigures[])[i][j].id,
    )
    elementArray.push(eltFigure)
  }

  // On filtre les nulls
  const filteredElements = elementArray.filter(
    (elt): elt is HTMLElement => elt !== null,
  )

  type sortResult = 0 | 1 | -1
  function documentPositionComparator(
    a: HTMLElement,
    b: HTMLElement,
  ): sortResult {
    if (a === b) {
      return 0 as const
    }
    const position = a.compareDocumentPosition(b) as number

    if (
      position & Node.DOCUMENT_POSITION_FOLLOWING ||
      position & Node.DOCUMENT_POSITION_CONTAINED_BY
    ) {
      return -1 as sortResult
    } else if (
      position & Node.DOCUMENT_POSITION_PRECEDING ||
      position & Node.DOCUMENT_POSITION_CONTAINS
    ) {
      return 1 as sortResult
    } else {
      return 0 as sortResult
    }
  }
  const figs = filteredElements.sort(documentPositionComparator)
  const numbs = []
  for (let j = 0; j < figs.length; j++) {
    if ((figs[j] as any).etat) numbs.push((j + 1).toString())
  }
  return numbs.join(';')
}

export function verifQuestionCliqueFigure(exercice: IExercice, i: number) {
  // Le get est non strict car on sait que l'élément n'existe pas à la première itération de l'exercice
  let eltFeedback = get(`resultatCheckEx${exercice.numeroExercice}Q${i}`, false)
  // On ajoute le div pour le feedback
  if (!eltFeedback) {
    const eltExercice = get(`exercice${exercice.numeroExercice}`)
    if (eltExercice != null) {
      eltFeedback = addElement(
        eltExercice,
        'div',
        {
          id: `resultatCheckEx${exercice.numeroExercice}Q${i}`,
        },
        '',
      )
    }
  }
  if (exercice.answers === undefined) {
    exercice.answers = {}
  }
  setStyles(eltFeedback!, 'marginBottom: 20px')
  if (eltFeedback) eltFeedback.innerHTML = ''
  let erreur = false // Aucune erreur détectée
  let nbFiguresCliquees = 0
  for (const objetFigure of (exercice.figures! as ClickFigures[])[i]) {
    const eltFigure = document.getElementById(
      objetFigure.id,
    ) as FigureClicable | null
    if (!eltFigure) {
      continue
    }
    eltFigure.removeEventListener('mouseover', mouseOverSvgEffect)
    eltFigure.removeEventListener('mouseout', mouseOutSvgEffect)
    eltFigure.removeEventListener('click', mouseSvgClick)
    eltFigure.hasMathaleaListener = false
    if (eltFigure.etat) nbFiguresCliquees++
    if (eltFigure.etat) exercice.answers[objetFigure.id] = '1'
    if (eltFigure.etat !== objetFigure.solution) erreur = true
  }
  if (nbFiguresCliquees > 0 && !erreur) {
    eltFeedback!.innerHTML = '😎'
    return 'OK'
  } else {
    eltFeedback!.innerHTML = '☹️'
    return 'KO'
  }
}

export function questionCliqueFigure(figSvg: FigureClicable) {
  if (figSvg) {
    if (!figSvg.hasMathaleaListener) {
      figSvg.addEventListener('mouseover', mouseOverSvgEffect)
      figSvg.addEventListener('mouseout', mouseOutSvgEffect)
      figSvg.addEventListener('click', mouseSvgClick)
      figSvg.etat = false
      figSvg.hasMathaleaListener = true
      // Pas de margin ! ça décalle les divLatex !
      //  figSvg.style.margin = '10px'
      // On enregistre que l'élément a déjà un listenner pour ne pas lui remettre le même à l'appui sur "Nouvelles Données"
    }
  }
}

export function exerciceCliqueFigure(exercice: IExercice) {
  document.addEventListener('exercicesAffiches', () => {
    // Dès que l'exercice est affiché, on rajoute des listenners sur chaque éléments de this.figures.
    for (let i = 0; i < exercice.nbQuestions; i++) {
      for (const objetFigure of (exercice.figures! as ClickFigures[])[i]) {
        const figSvg = document.getElementById(
          objetFigure.id,
        ) as FigureClicable | null
        if (!figSvg) {
          continue
        }

        questionCliqueFigure(figSvg)
      }
    }
    // Gestion de la correction
    const button = document.querySelector(
      `#btnValidationEx${exercice.numeroExercice}-${exercice.id}`,
    )
    if (button) {
      if (!('hasMathaleaListener' in button)) {
        button.addEventListener('click', (event) => {
          let nbBonnesReponses = 0
          let nbMauvaisesReponses = 0
          for (let i = 0; i < exercice.nbQuestions; i++) {
            verifQuestionCliqueFigure(exercice, i) === 'OK'
              ? nbBonnesReponses++
              : nbMauvaisesReponses++
          }
          afficheScore(exercice, nbBonnesReponses, nbMauvaisesReponses)
        })
      }
      ;(
        button as HTMLElement & { hasMathaleaListener: boolean }
      ).hasMathaleaListener = true
    }
  })
}
