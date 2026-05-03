import type { MathfieldElement } from 'mathlive'
import type { IExercice } from '../../lib/types'
import { fonctionComparaison } from './comparisonFunctions'

// Un barème qui ne met qu'un point si tout est juste
export function toutPourUnPoint(listePoints: number[]): [number, number] {
  return [Math.min(...listePoints), 1]
}
// le barème par défaut un point pour chaque réponse
export function toutAUnPoint(listePoints: number[]) {
  return [
    listePoints.reduce((prev, current) => prev + current),
    listePoints.length,
  ] as [number, number]
}

/**
 * fonction générale de vérification qui utilise le contenu de exercice.autoCorrection pour comparer la saisie utilisateur avec la réponse attendue
 * @param {Exercice} exercice
 * @param {number} i
 * @param {boolean} writeResult // inutilisé ! toujours true ! @fixme à quoi sert cette variable ??? JCL le 5/03/2024
 * @returns {{feedback: string, score: {nbBonnesReponses: (number|number), nbReponses: (number|number)}, isOk: string}|{feedback: string, score: {nbBonnesReponses: number, nbReponses: number}, resultat: string}|{feedback: string, score: {nbBonnesReponses: number, nbReponses: number}, isOk: string}|*|{feedback: string, score: {nbBonnesReponses: (number), nbReponses: number}, resultat: string}}
 */
export function verifQuestionMathLive(
  exercice: IExercice,
  i: number,
  writeResult = true,
) {
  let noFeedback = false
  let champTexte: HTMLInputElement | MathfieldElement | null = null
  const getCustomFeedback =
    exercice.autoCorrection[i]?.reponse?.valeur?.feedback
  if (exercice.autoCorrection[i]?.reponse == null) {
    throw Error(
      `verifQuestionMathlive appelé sur une question sans réponse: ${JSON.stringify(
        {
          exercice,
          question: i,
          autoCorrection: exercice.autoCorrection[i],
        },
      )}`,
    )
  }
  if (exercice.autoCorrection[i].reponse.param == null) {
    throw Error(
      `verifQuestionMathlive appelé sur une question sans param : ${JSON.stringify(
        {
          exercice,
          question: i,
          param: exercice.autoCorrection[i].reponse,
        },
      )}`,
    )
  }
  const formatInteractif =
    exercice.autoCorrection[i].reponse.param.formatInteractif ?? 'mathlive'
  const spanReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLSpanElement
  // On compare le texte avec la réponse attendue en supprimant les espaces pour les deux
  const reponses = exercice.autoCorrection[i].reponse.valeur
  if (reponses == null) {
    window.notify(
      `verifQuestionMathlive: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
      { exercice, i },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  const bareme: (arg: number[]) => [number, number] =
    reponses.bareme ?? toutPourUnPoint
  const callback = reponses.callback
  try {
    const variables = Object.entries(reponses).filter(
      ([key]) => key !== 'callback' && key !== 'bareme' && key !== 'feedback',
    )
    if (callback != null && typeof callback === 'function') {
      // Là c'est une correction custom ! Celui qui passe une callback doit savoir ce qu'il fait !
      // La fonction de callback gère le score et le feedback
      // Ici, on sauvegarde les réponses dans l'objet exercice.answers
      const mfe = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${i}`,
      ) as MathfieldElement
      if (mfe != null) {
        if (mfe.getValue().length > 0 && typeof exercice.answers === 'object') {
          exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.getValue()
        }
        if (mfe.value.length > 0 && typeof exercice.answers === 'object') {
          exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.value
        }
      }
      return callback(exercice, i, variables, bareme)
    }
    if (variables.length > 1 || variables[0][0] !== 'reponse') {
      if (variables[0][0].match(/L\dC\d/)) {
        // un tableau avec Lignes (L) et Colonnes (L)
        // Je traîte le cas des tableaux à part : une question pour de multiples inputs mathlive !
        // on pourra faire d'autres formats interactifs sur le même modèle
        const points = []
        let resultat = 'OK'
        const table = document.querySelector(
          `table#tabMathliveEx${exercice.numeroExercice}Q${i}`,
        )
        if (table == null) {
          throw Error(
            `verifQuestionMathlive: type tableauMathlive ne trouve pas le tableau dans le dom${JSON.stringify({ selecteur: `table#tabMathliveEx${exercice.numeroExercice}Q${i}` })}`,
          )
        }
        const cellules = Object.entries(reponses).filter(
          ([key]) => key.match(/L\dC\d/) != null,
        )
        for (let k = 0; k < cellules.length; k++) {
          const [key, reponse] = cellules[k]
          const options = reponse.options
          noFeedback = noFeedback || Boolean(options?.noFeedback)
          const compareFunction = reponse.compare ?? fonctionComparaison
          const inputs = Array.from(table.querySelectorAll('math-field'))
          const input = inputs.find(
            (el) =>
              el.id === `champTexteEx${exercice.numeroExercice}Q${i}${key}`,
          ) as MathfieldElement
          let result
          const spanFedback = table.querySelector(
            `span#resultatCheckEx${exercice.numeroExercice}Q${i}${key}`,
          )
          if (input == null || input.value === '') {
            result = {
              isOk: false,
              feedback: noFeedback
                ? ''
                : `Vous devez saisir une réponse dans la cellule ${key}.<br>`,
            }
          } else {
            if (Array.isArray(reponse.value)) {
              let ii = 0
              while (!result?.isOk && ii < reponse.value.length) {
                result = compareFunction(
                  input.value,
                  reponse.value[ii],
                  options,
                )
                ii++
              }
            } else {
              result = compareFunction(input.value, reponse.value, options)
            }
          }
          // On ne nettoie plus les input et les réponses, c'est la fonction de comparaison qui doit s'en charger !
          if (result.isOk) {
            points.push(1)
            if (spanFedback != null) spanFedback.innerHTML = '😎'
          } else {
            points.push(0)
            resultat = 'KO'
            if (spanFedback != null) spanFedback.innerHTML = '☹️'
          }
          if (input.value.length > 0 && typeof exercice.answers === 'object') {
            exercice.answers[`Ex${exercice.numeroExercice}Q${i}${key}`] =
              input.value
          }
        }
        const [nbBonnesReponses, nbReponses] = bareme(points)
        return {
          isOk: resultat,
          feedback: '',
          score: { nbBonnesReponses, nbReponses },
        }
      }
      if (
        variables[0][0].match(/champ\d/) ||
        formatInteractif === 'fillInTheBlank'
      ) {
        // on n'aurait plus besoin de formatInteractif si on respecte la convention de nommage champ1, champ2...
        // Le format fillInTheBlank requiert un "objetReponse" avec le format objet.
        // cet objet contient des propriétés (autant que de blancs, et ont le même nom que les blancs créés avec la fonction remplisLesBlanc())
        // chaque propriété a une valeur : de la forme {value: string, compare: ComparaisonFonction} c'est la valeur attendue et sa méthode de comparaison facultatitve
        // La reponse pourrait contenir aussi une propriété callback facultative (non implémenté pour l'instant car pas de besoin)
        // c'est une fonction qui serait utilisée à la place de la procédure normale de traitement ci-dessous
        // en fait ce serait la fonction de correctionInteractive 'custom' qui se trouverait avant dans l'exo et qui permet, par exemple, de réaliser des traitements spéciaux
        const mfe = document.querySelector(
          `#champTexteEx${exercice.numeroExercice}Q${i}`,
        ) as MathfieldElement
        if (mfe == null) {
          throw Error(
            `verifQuestionMathlive: type fillInTheBlank ne trouve pas le mathfieldElement dans le dom : ${JSON.stringify({ selecteur: `math-field#champTexteEx${exercice.numeroExercice}Q${i}` })}`,
          )
        }
        const points = []
        const saisies: Record<string, string> = {}
        let feedback = ''
        let compteurSaisiesVides = 0
        let compteurBonnesReponses = 0
        let noFeedback = false
        for (let k = 0; k < variables.length; k++) {
          const [key, reponse] = variables[k]
          if (key === 'feedback' || key === 'bareme') continue
          const saisie = mfe.getPromptValue(key)
          saisies[key] = saisie
          const compareFunction = reponse.compare ?? fonctionComparaison
          const options = reponse.options
          noFeedback = noFeedback || Boolean(options?.noFeedback)
          let result
          // On ne nettoie plus les input et les réponses, c'est la fonction de comparaison qui doit s'en charger !
          if (saisie == null || saisie === '') {
            compteurSaisiesVides++
            result = { isOk: false, feedback: 'saisieVide' }
            // result = { isOk: false, feedback: ` Pas de réponse dans la zone de saisie${variables.length > 1 ? ` N°${key.charAt(key.length - 1)}` : ''}.<br>` }
          } else {
            if (Array.isArray(reponse.value)) {
              let ii = 0
              while (!result?.isOk && ii < reponse.value.length) {
                result = compareFunction(saisie, reponse.value[ii], options)
                if (result.feedback) {
                  feedback = result.feedback
                }
                ii++
              }
            } else {
              result = compareFunction(saisie, reponse.value, options)
            }
          }
          if (result.isOk) {
            compteurBonnesReponses++
            points.push(1)
            mfe.setPromptState(key, 'correct', true)
          } else {
            points.push(0)
            mfe.setPromptState(key, 'incorrect', true)
            if (result.feedback === 'saisieVide') result.feedback = null
            else {
              const fieldNumber =
                variables.length > 1
                  ? ` Champ ${key.charAt(key.length - 1)} : `
                  : ''
              result.feedback = feedback
              feedback = ''
              if (!result.feedback) {
                // On n'écrase le feedback que s'il n'y en a pas déjà un spécifique
                result = {
                  isOk: false,
                  feedback: `${fieldNumber}Le résultat est incorrect.<br>`,
                }
              } else {
                // On ajoute le numéro du champ avant le feedback existant
                const firstChar = result.feedback.charAt(0)
                const lowerFirst = /[a-zA-Z]/.test(firstChar)
                  ? firstChar.toLowerCase()
                  : firstChar
                result.feedback = `${fieldNumber}${lowerFirst + result.feedback.slice(1)}<br>`
              }
            }
          }
          mfe.classList.add('corrected')
          if (result.feedback != null) feedback += result.feedback
        }
        if (compteurBonnesReponses === variables.length) {
          // Si tout est correct mais qu'il y a déjà un feedback spécifique, on le garde
          if (!feedback || feedback.trim() === '') feedback = ''
        } else if (
          compteurBonnesReponses === 0 &&
          compteurSaisiesVides === 0 &&
          !feedback
        ) {
          // On n'ajoute un feedback générique que s'il n'y en a pas déjà un spécifique
          feedback =
            variables.length === 1
              ? " Le résultat n'est pas correct."
              : " Aucun résultat n'est correct."
        }

        if (compteurSaisiesVides === 1) {
          feedback += ` Il manque une réponse dans ${variables.length === 1 ? 'la' : 'une'} zone de saisie.<br>`
        } else if (compteurSaisiesVides > 1) {
          feedback += ` Il manque une réponse dans ${compteurSaisiesVides} zones de saisie.<br>`
        }

        if (typeof reponses.feedback === 'function') {
          feedback += reponses.feedback(saisies)
          const spanFeedback = document.querySelector(
            `#feedbackEx${exercice.numeroExercice}Q${i}`,
          )
          if (feedback != null && spanFeedback != null && feedback.length > 0) {
            spanFeedback.innerHTML = `💡 ${feedback}`
            spanFeedback.classList.add(
              'py-2',
              'italic',
              'text-coopmaths-warn-darkest',
              'dark:text-coopmathsdark-warn-darkest',
            )
          }
        }
        const [nbBonnesReponses, nbReponses] = bareme(points)
        if (mfe.getValue().length > 0 && typeof exercice.answers === 'object') {
          /*    const prompts = mfe.getPrompts()
            const answers = []
            for (const prompt of prompts) {
              answers.push([prompt, mfe.getPromptValue(prompt)])
            }
            exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = Object.assign({}, Object.fromEntries(answers))
         */
          exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = mfe.getValue()
        }
        if (spanReponseLigne != null) {
          spanReponseLigne.innerHTML =
            nbBonnesReponses === nbReponses ? '😎' : '☹️'
        }
        // le feedback est déjà assuré par la fonction feedback(), donc on le met à ''
        return {
          isOk: nbBonnesReponses === nbReponses,
          feedback: noFeedback ? '' : feedback,
          score: { nbBonnesReponses, nbReponses },
        }
      }
    }
    // ici, il n'y a qu'un seul input une seule saisie (même si la réponse peut contenir des variantes qui seront toutes comparées à la saisie
    champTexte = document.getElementById(
      `champTexteEx${exercice.numeroExercice}Q${i}`,
    ) as MathfieldElement | HTMLInputElement
    if (champTexte == null) {
      throw Error(
        `verifQuestionMathlive: type ${formatInteractif} ne trouve pas le champ de saisie dans le dom ${JSON.stringify({ selecteur: `champTexteEx${String(exercice.numeroExercice)}Q${String(i)}` })}`,
      )
    }
    if (champTexte.value.length > 0 && typeof exercice.answers === 'object') {
      exercice.answers[`Ex${exercice.numeroExercice}Q${i}`] = champTexte.value
    }
    const saisie = champTexte.value
    let customFeedback = ''
    if (getCustomFeedback != null) {
      customFeedback = getCustomFeedback({ saisie })
    }
    const objetReponse = reponses.reponse
    if (objetReponse == null) {
      window.notify(
        `verifQuestionMathlive: objetReponse est null pour la question ${i} de l'exercice ${exercice.id}`,
        { exercice, i },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const options = objetReponse.options ?? {}
    noFeedback = options.noFeedback ?? false
    if (saisie == null || saisie === '') {
      return {
        isOk: false,
        feedback: noFeedback ? '' : 'Vous devez saisir une réponse.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    let isOk = false
    let ii = 0
    let reponse
    let feedback = ''
    const compareFunction = objetReponse.compare ?? fonctionComparaison

    if (Array.isArray(objetReponse.value)) {
      while (!isOk && ii < objetReponse.value.length) {
        reponse = objetReponse.value[ii]
        const check = compareFunction(saisie, reponse, options)
        if (check.isOk) {
          isOk = true
          feedback = ''
          break
        }
        if (check.feedback) {
          feedback = check.feedback
        }
        ii++
      }
    } else {
      reponse = objetReponse.value
      const check = compareFunction(saisie, reponse, options)
      if (check.isOk) {
        isOk = true
        feedback = check.feedback ?? ''
      } else if (check.feedback) {
        feedback = check.feedback ?? ''
      }
    }

    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML = ''
      if (customFeedback.length > 0) {
        feedback = `${feedback} ${feedback.length > 0 ? '<br>' : ''} ${customFeedback}`
      }
      if (isOk) {
        spanReponseLigne.innerHTML = '😎'
        spanReponseLigne.style.fontSize = 'large'
        champTexte.readOnly = true
        return {
          isOk,
          feedback: noFeedback ? '' : feedback,
          score: { nbBonnesReponses: 1, nbReponses: 1 },
        }
      }
      if (writeResult) {
        spanReponseLigne.innerHTML = '☹️'
        spanReponseLigne.style.fontSize = 'large'
        champTexte.readOnly = true
        return {
          isOk,
          feedback: noFeedback ? '' : feedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
      return {
        isOk,
        feedback: noFeedback ? '' : feedback,
        score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
      } // ce code n'est jamais exécuté vu que writeResult est toujours true
    }
  } catch (error) {
    console.error('Erreur dans verifQuestionMathLive', error)

    window.notify(
      `Erreur dans verif QuestionMathLive : ${error}\n Avec les métadonnées : `,
      {
        champTexteValue: champTexte?.value ?? null,
        exercice: exercice?.id,
        i,
        autoCorrection: exercice?.autoCorrection[i],
        formatInteractif,
        spanReponseLigne,
        errorMessage: error instanceof Error ? error.message : '',
        errorStack: error instanceof Error ? error.stack : '',
      },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
}

// # sourceMappingURL=mathLive.js.map
