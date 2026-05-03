// import { addElement, get, setStyles } from '../html/dom'
import type { IExercice } from '../../lib/types'
import { context } from '../../modules/context'
import type { AllChoicesType } from './listeDeroulante/ListeDeroulante'
import './listeDeroulante/ListeDeroulanteElement'

/**
 * Vérifie la réponse à une question à liste déroulante
 * @param {object} exercice l'exercice appelant pour pouvoir atteindre ses propriétés.
 * @param {number} i le numéro de la question
 * @returns {string} 'OK' si la réponse est correcte, 'KO' sinon
 */
export function verifQuestionListeDeroulante(exercice: IExercice, i: number) {
  /* // Le get est non strict car on sait que l'élément n'existe pas à la première itération de l'exercice
  const eltFeedback = document.querySelector(`resultatCheckEx${exercice.numeroExercice}Q${i}`)
  // On ajoute le div pour le feedback
  setStyles(eltFeedback, 'marginBottom: 20px')
  if (eltFeedback) eltFeedback.innerHTML = ''
   */
  const spanReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  )
  if (spanReponseLigne == null) {
    window.notify(
      "l'exercice ayant appelé verifQuestionListeDeroulante() n'a pas correctement défini le span pour le smiley",
      { exercice: JSON.stringify(exercice) },
    )
  }
  const liste = document.querySelector(`#ex${exercice.numeroExercice}Q${i}`)
  let value

  if (liste) {
    value = (liste as any).value
  }
  const reponse = exercice.autoCorrection[i]?.reponse?.valeur?.reponse?.value
  // Sauvegarde pour les exports Moodle, Capytale...
  if (exercice.answers === undefined) {
    exercice.answers = {}
  }
  if (liste) {
    exercice.answers[liste.id] = value
  }
  const resultat = value === reponse ? 'OK' : 'KO'
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
 *
 * Fonction pour créer une liste déroulante dans un exercice interactif.
 * @param {Exercice} exercice l'exercice appelant pour pouvoir atteindre ses propriétés.
 * @param {number} i le numéro de la question
 * @param {AllChoicesType} choix les choix possibles dans la liste déroulante
 * @param {boolean} [choix0] true si on veut un choix sélectionnable en premier (pas d'entête) par défaut false
 * @param {string} [style] le style à appliquer à la liste déroulante (en plus ou en remplacement de celui par défaut))
 * @returns {string} le code HTML de la liste déroulante
 */
export function choixDeroulant(
  exercice: IExercice,
  i: number,
  choix: AllChoicesType,
  choix0?: boolean,
  style?: string,
) {
  if (!exercice.interactif || !context.isHtml) return ''

  choix0 = choix0 !== undefined ? Boolean(choix0) : false
  style = style ? ` style="${style}"` : ''
  if (
    context.isHtml &&
    exercice?.autoCorrection[i]?.reponse?.param?.formatInteractif !==
      'listeDeroulante'
  ) {
    if (exercice?.autoCorrection == null) exercice.autoCorrection = []
    if (exercice?.autoCorrection[i] == null) exercice.autoCorrection[i] = {}
    if (exercice?.autoCorrection[i].reponse == null)
      exercice.autoCorrection[i].reponse = {}
    if (exercice.autoCorrection[i].reponse.param == null)
      exercice.autoCorrection[i].reponse.param = {}
    exercice.autoCorrection[i].reponse.param.formatInteractif =
      'listeDeroulante'
  }
  let result =
    `<liste-deroulante class="mx-2 listeDeroulante" id="ex${exercice.numeroExercice}Q${i}"${style} choices="` +
    encodeURIComponent(JSON.stringify(choix)) +
    `" choix0="${choix0}"></liste-deroulante>`
  /* let result = `<select class="mx-2 listeDeroulante" id="Ex${exercice.numeroExercice}Q${i}" ${style}>
      <option> Choisir ${type === 'nombre' ? 'un nombre' : type} </option>`

  for (const a of choix) {
    result += `<option>${a}</option>`
  }
    */
  result += `<span id="resultatCheckEx${exercice.numeroExercice}Q${i}"></span>`
  return result
}

/**
 * Fonction pour transformer une liste déroulante en QCM (pour AMC, la version interactive n'a que peu d'intérêt)
 * @param {Exercice} exercice
 * @param {number} question
 * @param {string[]} choix
 * @param {string} reponse
 * @param {object} options // options.vertical pour présenter les réponses, options.ordered pour modifier l'ordre
 * passer toutes les options possibles pour AMC (lastChoice par exemple utile si pas ordonné pour dire où s'arrête le mélange voir le wiki concernant AMC).
 */
export function listeDeroulanteToQcm(
  exercice: IExercice,
  question: number,
  choix: AllChoicesType,
  reponse: string,
  options: any,
) {
  if (exercice == null || choix == null || reponse == null) {
    window.notify(
      'Il manque des paramètres pour transformer la liste déroulante en qcm',
      { exercice, question, choix, reponse },
    )
    return
  }
  if (!choix.some((el) => el.value === reponse)) {
    window.notify('La réponse doit faire partie de la liste !', {
      choix,
      reponse,
    })
    return
  }
  const vertical = options?.vertical ?? true // Par défaut c'est vertical comme une liste déroulante mais on peut passer vertical = false
  const ordered = options?.ordered ?? true // Par défaut ce sera le même ordre que la liste déroulante
  if (
    exercice.autoCorrection == null ||
    !Array.isArray(exercice.autoCorrection)
  ) {
    exercice.autoCorrection = []
  }
  if (exercice.autoCorrection[question] == null)
    exercice.autoCorrection[question] = {}
  exercice.autoCorrection[question] = {}
  exercice.autoCorrection[question].options = { vertical, ordered, ...options }
  exercice.autoCorrection[question].propositions = []
  for (let j = 0; j < choix.length; j++) {
    if (choix[j].value === '') continue
    if (choix[j].label != null) {
      exercice.autoCorrection[question].propositions.push({
        texte: choix[j].label,
        statut: choix[j].value === reponse, // il n'y a qu'une bonne réponse, et elle doit correspondre à l'un des choix.
      })
    } else if (choix[j].latex != null) {
      exercice.autoCorrection[question].propositions.push({
        texte: `$${choix[j].latex}$`,
        statut: choix[j].value === reponse, // il n'y a qu'une bonne réponse, et elle doit correspondre à l'un des choix.
      })
    } else if (choix[j].svg != null) {
      const body = document.querySelector('body')
      if (body == null) {
        window.notify(
          "Impossible de créer le QCM à partir de la liste déroulante car le body n'existe pas",
          {},
        )
        return
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      body.appendChild(svg)
      svg.setAttribute('viewBox', '-10 -10 20 20') // Valeur par défaut, peut être ajustée
      svg.classList.add('svgChoice')
      svg.style.display = 'inline-block'
      svg.style.width = '20px'
      svg.style.height = '20px'
      svg.style.verticalAlign = 'middle'
      svg.innerHTML = choix[j].svg ?? ''
      exercice.autoCorrection[question].propositions.push({
        texte: svg.outerHTML,
        statut: choix[j].value === reponse,
      })
      setTimeout(() => {
        if (svg) body.removeChild(svg)
      }, 0)
    } else if (choix[j].image != null) {
      const image = document.createElement('img')
      image.src = choix[j].image ?? choix[j].value
      image.style.width = '30px'
      image.style.height = '30px'
      exercice.autoCorrection[question].propositions.push({
        texte: image.outerHTML,
        statut: choix[j].value === reponse,
      })
    } else {
      console.warn(
        'La liste déroulante à convertir en qcm contient un choix de type inconnu',
        JSON.stringify(choix[j]),
      )
    }
  }
}
