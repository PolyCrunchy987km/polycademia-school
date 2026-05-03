import { context } from '../../../modules/context'
import type { IExercice } from '../../types'
import '../svgSelection/SvgSelectionElement'

export type SvgWithValue = { svg: string; value: number }

export type SvgSelectionOptions = {
  gapX?: string
  gapY?: string
  itemPadding?: string
  style?: string
}

/**
 * Vérifie la réponse à une question avec sélection d'SVG
 * @param {object} exercice l'exercice appelant pour pouvoir atteindre ses propriétés.
 * @param {number} i le numéro de la question
 * @returns {string} 'OK' si la réponse est correcte, 'KO' sinon
 * @author Jean-claude Lhote
 */
export function verifQuestionSvgSelection(exercice: IExercice, i: number) {
  const spanReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  )
  if (spanReponseLigne == null) {
    window.notify(
      "l'exercice ayant appelé verifQuestionSvgSelection() n'a pas correctement défini le span pour le smiley",
      { exercice: JSON.stringify(exercice) },
    )
  }
  const selection = document.querySelector(
    `#svgSelectionEx${exercice.numeroExercice}Q${i}`,
  ) as any
  let value: string = ''

  if (selection) {
    value = String(selection.value) // Convertir en string pour comparaison
  }
  const reponse = exercice.autoCorrection[i]?.reponse?.valeur?.reponse?.value
  // Sauvegarde pour les exports Moodle, Capytale...
  if (exercice.answers === undefined) {
    exercice.answers = {}
  }
  if (selection) {
    exercice.answers[selection.id] = String(selection.value)
  }
  const resultat = Array.isArray(reponse)
    ? reponse.includes(value)
      ? 'OK'
      : 'KO'
    : value === reponse
      ? 'OK'
      : 'KO'
  if (resultat === 'OK') {
    if (spanReponseLigne) {
      spanReponseLigne.innerHTML = '😎'
    }
  } else {
    if (spanReponseLigne) {
      spanReponseLigne.innerHTML = '☹️'
    }
  }
  if (spanReponseLigne)
    (spanReponseLigne as HTMLElement).style.fontSize = 'large'
  return resultat
}

/**
 * Fonction pour créer une sélection d'SVG dans un exercice interactif.
 * @param {Exercice} exercice l'exercice appelant pour pouvoir atteindre ses propriétés.
 * @param {number} i le numéro de la question
 * @param {SvgWithValue[][] | string[][] | string[]} svgs les SVG à sélectionner.
 *   - SvgWithValue[][] : format natif avec valeurs personnalisées {svg: string, value: number}
 *   - string[][] : sera converti avec value = index global
 *   - string[] : sera converti en array 2D avec value = index
 * @param {SvgSelectionOptions} [options] options de configuration
 *   - gapX?: écart horizontal entre les éléments (ex: '0rem', '0.5rem')
 *   - gapY?: écart vertical entre les éléments (ex: '0rem', '0.5rem')
 *   - itemPadding?: espacement interne des boutons (ex: '0px', '2px')
 *   - style?: style CSS personnalisé pour le conteneur
 * @returns {string} le code HTML du conteneur de sélection SVG
 * @author Jean-claude Lhote
 */
export function selectionSvg(
  exercice: IExercice,
  i: number,
  svgs: SvgWithValue[][] | SvgWithValue[],
  options?: SvgSelectionOptions,
) {
  if (!context.isHtml) return ''

  const { gapX, gapY, itemPadding, style } = options || {}
  const styleStr = style ? ` style="${style}"` : ''
  let gapAttrs = ''
  if (gapX) gapAttrs += ` gap-x="${gapX}"`
  if (gapY) gapAttrs += ` gap-y="${gapY}"`
  if (itemPadding) gapAttrs += ` item-padding="${itemPadding}"`
  if (
    context.isHtml &&
    exercice?.autoCorrection[i]?.reponse?.param?.formatInteractif !==
      'svgSelection'
  ) {
    if (exercice?.autoCorrection == null) exercice.autoCorrection = []
    if (exercice?.autoCorrection[i] == null) exercice.autoCorrection[i] = {}
    if (exercice?.autoCorrection[i].reponse == null)
      exercice.autoCorrection[i].reponse = {}
    if (exercice.autoCorrection[i].reponse.param == null)
      exercice.autoCorrection[i].reponse.param = {}
    exercice.autoCorrection[i].reponse.param.formatInteractif = 'svgSelection'
  }
  let result =
    `<svg-selection class="mx-2 svgSelection" id="svgSelectionEx${exercice.numeroExercice}Q${i}"${styleStr}${gapAttrs} svgs="` +
    encodeURIComponent(JSON.stringify(svgs)) +
    `"></svg-selection>`
  result += `<span id="resultatCheckEx${exercice.numeroExercice}Q${i}"></span>`

  // Stocker la réponse correcte
  return result
}
