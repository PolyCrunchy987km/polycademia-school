/**
 * Devine les options de comparaison adaptées selon la nature des réponses proposées.
 * Exemples :
 * - intervalles : { intervalle: true }
 * - ensembles : { ensembleDeNombres: true }
 * - fractions : { fractionEgale: true }
 * - puissances : { puissance: true }
 * - suites : { suiteDeNombres: true }
 * - coordonnées : { coordonnees: true }
 * - expressions : { egaliteExpression: true }
 */
import ExerciceQcm from '../../exercices/ExerciceQcm'
import type {
  IExercice,
  OptionsComparaisonType,
  UneProposition,
} from '../../lib/types'
import { context } from '../../modules/context'
import Grandeur, { USI } from '../../modules/Grandeur'
import { messageFeedback } from '../../modules/messages'
import { shuffleJusquaWithIndexes } from '../amc/qcmCam'
import { get } from '../html/dom'
import {
  barreTexte,
  miseEnEvidence,
  texteEnCouleurEtGras,
  texteGras,
} from '../outils/embellissements'
import { lettreDepuisChiffre } from '../outils/outilString'
import type { ButtonWithMathaleaListener } from '../types/can'
import { afficheScore } from './afficheScore'
import { generateCleaner } from './cleaners'
import ce, { fonctionComparaison } from './comparisonFunctions'

export function guessOptionsForReponses(
  reponses: string[],
): OptionsComparaisonType {
  if (!Array.isArray(reponses) || reponses.length === 0) return {}
  // Cas spécial : plusieurs blocs $...$ ou séparateur 'ou' → comparer comme du texte
  const hasMultiLatexOrOu = reponses.some((r) => {
    // Compte le nombre de $ dans la chaîne
    const dollarCount = (r.match(/\$/g) || []).length
    return dollarCount > 0 || /\bou\b/i.test(r) // Les $ ont déjà été enlevés aux extrémités dans la fonction compteLesReponsesDifferentes, donc on regarde s'il en reste à l'intérieur de la chaîne. Si oui, on suppose que c'est du texte à comparer tel quel. De même, la présence de "ou" est un indice que la réponse contient plusieurs possibilités à comparer telles quelles.
  })
  if (hasMultiLatexOrOu) {
    return { texteSansCasse: true }
  }
  // Cas spécial : réponse  alphabétique (hors espaces) sur les 8 premiers caractères ("On ne peux pas savoir")
  const isAlpha = reponses
    .map((r) => r.replaceAll('\\%', 'pourcent'))
    .some((r) => {
      if (r.includes('pourcent')) return true
      if (r.includes('centime')) return true
      const s = r.replace(/\s+/g, '').slice(0, 8) // On se limite aux 5 premiers caractères pour éviter la fallback si un chiffre se balade plus loin dans la réponse
      return /^[A-Za-zÀ-ÿ]+$/.test(s)
    })

  // Utilise le premier élément comme heuristique principale
  const reponse = reponses[0]

  // Test grandeur (unité physique) : on nettoie le latex et on tente Grandeur.fromString
  const cleaned = reponse
    .replace(/^\$/g, '') // retire $ de début
    .replace(/\$$/g, '') // retire $ de fin
    .replace(/\\text\{([^}]*)\}/g, ' $1') // remplace \text{...} par ...
    .replace(/\\,/g, '') // retire les virgules latex
    .replace(/~/g, '') // retire les espaces insécables latex
    .replace(/\\ /g, ' ') // retire les espaces latex
    .replace(/\s+/g, ' ') // espaces multiples
    .trim()
  try {
    const grandeur = Grandeur.fromString(cleaned)
    // Vérifie que la mesure est un nombre fini et que l'unité contient au moins un caractère non alphabétique
    if (
      typeof grandeur.mesure === 'number' &&
      isFinite(grandeur.mesure) &&
      grandeur.unite &&
      USI.includes(grandeur.uniteDeReference) &&
      !isNaN(grandeur.puissancePrefixe) &&
      /[^A-Za-zÀ-ÿ]/.test(grandeur.unite)
    ) {
      return { unite: true }
    }
    // Sinon, ce n'est pas une grandeur valide
  } catch (e) {
    // pas une grandeur reconnue, on continue
  }

  if (
    /\[.*;.*\]/.test(reponse) ||
    /\]/.test(reponse) ||
    /\[/.test(reponse) ||
    /\\emptyset/.test(reponse)
  ) {
    // Intervalles ou réunion d'intervalles
    return { intervalle: true }
  }
  if (/\{.*[;].*\}/.test(reponse) || /\\emptyset/.test(reponse)) {
    // Ensembles de nombres
    return { ensembleDeNombres: true }
  }
  if (reponses.some((r) => /\\dfrac\{.*\}\{.*\}/.test(r))) {
    // Fractions
    return { fractionEgale: true }
  }
  if (/\^|\*/.test(reponse)) {
    // Puissances ou expressions avec exposant
    return { puissance: true }
  }
  if (/;/.test(reponse)) {
    // Suites de nombres
    return { suiteDeNombres: true }
  }
  if (/^\(.*;.*\)$/.test(reponse)) {
    // Coordonnées
    return { coordonnees: true }
  }
  if (/=/.test(reponse) || /\\approx/.test(reponse)) {
    // Expressions avec égalité
    // Vérification stricte : chaque membre autour du = doit être une expression mathématique valide
    const parts = reponse.includes('=')
      ? reponse.split('=')
      : reponse.includes('\\approx')
        ? reponse.split('\\approx')
        : []
    if (parts.length === 2) {
      try {
        ce.parse(parts[0])
        ce.parse(parts[1])
        return { egaliteExpression: true }
      } catch (e) {
        // Parsing échoué, fallback texte
        return { texteSansCasse: true }
      }
    } else {
      // Pas deux membres, fallback texte
      return { texteSansCasse: true }
    }
  }
  if (isAlpha) {
    return { texteSansCasse: true }
  }
  // Par défaut, aucune option spéciale
  return {}
}

export function verifQuestionQcm(exercice: IExercice, i: number) {
  let resultat
  let feedback = ''
  // i est l'indice de la question
  let nbBonnesReponses = 0
  let nbMauvaisesReponses = 0
  let nbBonnesReponsesAttendues = 0
  if (exercice.answers == null) {
    exercice.answers = {}
  }
  // Compte le nombre de réponses justes attendues
  const nbReps = exercice.autoCorrection[i].propositions?.length ?? 0
  for (let k = 0; k < nbReps; k++) {
    if (exercice.autoCorrection[i]!.propositions![k].statut) {
      nbBonnesReponsesAttendues++
    }
  }
  const divReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLDivElement
  exercice.autoCorrection[i]!.propositions!.forEach((proposition, indice) => {
    // La liste de question peut être plus courte que autoCorrection si on n'a pas réussi à générer suffisamment de questions différentes
    // if (exercice.listeQuestions[i] !== undefined) {
    // On a des exercices comme 6S10-1 où il y a 2 questions... mais 6 qcm !
    const label = document.querySelector(
      `#labelEx${exercice.numeroExercice}Q${i}R${indice}`,
    ) as HTMLLabelElement
    const check = document.querySelector(
      `#checkEx${exercice.numeroExercice}Q${i}R${indice}`,
    ) as HTMLInputElement
    if (check != null) {
      if (check.checked) {
        // Sauvegarde pour les exports Moodle, Capytale...
        exercice.answers![`Ex${exercice.numeroExercice}Q${i}R${indice}`] = '1'
        // Gestion du feedback de toutes les cases cochées
        if (exercice.autoCorrection[i].propositions![indice].feedback) {
          // Modification le 5 avril 2026 (JCL) : Les feedbacks décalent les case à cocher,
          //  on les regroupent dans verifQuestionQcm avec le feedback global de la question pour éviter ce problème d'affichage.
          //  On garde cependant la possibilité d'avoir un feedback spécifique à chaque proposition qui s'affiche dans le feedback global de la question.
          /* messageFeedback({
            id: `feedbackEx${exercice.numeroExercice}Q${i}R${indice}`,
            message: exercice.autoCorrection[i].propositions![indice].feedback,
            type: proposition.statut ? 'positive' : 'error',
          }) */
          feedback +=
            exercice.autoCorrection[i].propositions![indice].feedback &&
            exercice.autoCorrection[i].propositions![indice].feedback !== ''
              ? exercice.autoCorrection[i].propositions![indice].feedback +
                '<br>'
              : ''
        }
      } else {
        exercice.answers![`Ex${exercice.numeroExercice}Q${i}R${indice}`] = '0'
      }
      if (proposition.statut) {
        if (check.checked === true) {
          nbBonnesReponses++
          label.classList.add('bg-coopmaths-warn-100', 'rounded-lg', 'p-1')
        } else {
          // Bonnes réponses non cochées
          label.classList.add('bg-coopmaths-warn-100', 'rounded-lg', 'p-1')
        }
      } else if (check.checked === true) {
        label.classList.add('bg-coopmaths-action-200', 'rounded-lg', 'p-1')
        nbMauvaisesReponses++
      }
      check.disabled = true
    }
  })
  let typeFeedback = 'positive'
  if (
    nbMauvaisesReponses === 0 &&
    nbBonnesReponses === nbBonnesReponsesAttendues
  ) {
    if (divReponseLigne) divReponseLigne.innerHTML = '😎'
    resultat = 'OK'
  } else {
    if (divReponseLigne) divReponseLigne.innerHTML = '☹️'
    typeFeedback = 'error'
    resultat = 'KO'
  }
  // Gestion du feedback global de la question
  if (divReponseLigne) divReponseLigne.style.fontSize = 'large'
  const eltFeedback = get(`feedbackEx${exercice.numeroExercice}Q${i}`, false)
  let message = feedback
  if (eltFeedback) {
    eltFeedback.innerHTML = ''
  }
  if (resultat === 'KO') {
    // Juste mais incomplet
    if (
      nbBonnesReponses > 0 &&
      nbMauvaisesReponses === 0 &&
      nbBonnesReponses < nbBonnesReponsesAttendues
    ) {
      message += `${nbBonnesReponses} bonne${nbBonnesReponses > 1 ? 's' : ''} réponse${nbBonnesReponses > 1 ? 's' : ''}`
    } else if (nbBonnesReponses > 0 && nbMauvaisesReponses > 0) {
      // Du juste et du faux
      message += `${nbMauvaisesReponses} erreur${nbMauvaisesReponses > 1 ? 's' : ''}`
    } else if (nbBonnesReponses === 0 && nbMauvaisesReponses > 0) {
      // Que du faux
      message += `${nbMauvaisesReponses} erreur${nbMauvaisesReponses > 1 ? 's' : ''}`
    }
  } else {
    message = ''
  }
  if (nbBonnesReponsesAttendues > nbBonnesReponses) {
    message += ` ${nbBonnesReponsesAttendues - nbBonnesReponses} bonne${nbBonnesReponsesAttendues - nbBonnesReponses > 1 ? 's' : ''} réponse${nbBonnesReponsesAttendues - nbBonnesReponses > 1 ? 's' : ''} manquante${nbBonnesReponsesAttendues - nbBonnesReponses > 1 ? 's' : ''}`
  }
  if (message !== '') {
    messageFeedback({
      id: `resultatCheckEx${exercice.numeroExercice}Q${i}`,
      message,
      type: typeFeedback,
    })
  }
  return resultat
}

/**
 * @param {exercice}
 * @param {number} i indice de la question
 * @param {{style: string, format: string}} [options]
 * @returns {{texte: string, texteCorr: string}} {texte, texteCorr} le texte à ajouter pour la question traitée
 */
export function propositionsQcm(
  exercice: IExercice,
  i: number,
  options: { style: string; format: string } = { style: '', format: 'case' },
) {
  /**
   * Mélange les éléments d'un tableau jusqu'à un certain index et laisse les suivants inchangés.
   * @param {Array} array - Le tableau à mélanger.
   * @param {number} lastChoice - L'index jusqu'auquel mélanger les éléments.
   * @returns {{shuffledArray: Array, indexes: Array}} - Le tableau mélangé et les index des anciens éléments dans le nouvel ordre.
   */
  const indexes = []
  let texte = ''
  let texteCorr = ''
  let espace = ''
  let nbCols = 1
  let vertical = false
  const classCss =
    options?.style != null && options.style !== ''
      ? `class="ml-2" style="${options.style};" `
      : 'class="ml-2"'
  if (context.isAmc) return { texte: '', texteCorr: '' }
  if (exercice?.autoCorrection[i]?.propositions === undefined) {
    window.notify(
      'propositionsQcm a reçu une liste de propositions undefined',
      {
        autoCrorrection: exercice?.autoCorrection[i],
        propositions: exercice?.autoCorrection[i].propositions,
        exercise: exercice,
      },
    )
    return { texte: '', texteCorr: '' }
  } else if (exercice.autoCorrection[i].propositions.length === 0) {
    window.notify('propositionsQcm a reçu une liste de propositions vide', {
      autoCrorrection: exercice.autoCorrection[i],
      propositions: exercice.autoCorrection[i].propositions,
      exercise: exercice,
    })
    return { texte: '', texteCorr: '' }
  } else if (exercice.autoCorrection[i].propositions.length === 1) {
    window.notify(
      'propositionsQcm a reçu une liste de propositions de taille 1',
      {
        autoCrorrection: exercice.autoCorrection[i],
        propositions: exercice.autoCorrection[i].propositions,
        exercise: exercice,
      },
    )
    return { texte: '', texteCorr: '' }
  }

  // On regarde si il n'y a pas de doublons dans les propositions de réponse. Si c'est le cas, on enlève les mauvaises réponses en double.
  elimineDoublons(exercice.autoCorrection[i].propositions)
  if (context.isHtml) {
    espace = '&emsp;'
    if (exercice?.autoCorrection[i].reponse == null) {
      exercice.autoCorrection[i].reponse = {}
    }
    if (exercice.autoCorrection[i].reponse.param == null) {
      exercice.autoCorrection[i].reponse.param = {}
    }
    exercice.autoCorrection[i].reponse.param.formatInteractif = 'qcm'
  } else {
    espace = '\\qquad '
  }
  // Mélange les propositions du QCM sauf celles à partir de lastchoice (inclus)
  const lastChoice = Math.min(
    exercice.autoCorrection[i].options?.lastChoice ??
      exercice.autoCorrection[i].propositions.length,
    exercice.autoCorrection[i].propositions.length - 1,
  )
  vertical = exercice.autoCorrection[i].options?.vertical ?? false // est-ce qu'on veut une présentation en colonnes ?
  nbCols = Math.min(exercice.autoCorrection[i].options?.nbCols ?? 1, 1)
  const isTrueFalse =
    exercice.autoCorrection[i].propositions.some(
      (prop) => prop.texte === 'Vrai',
    ) &&
    exercice.autoCorrection[i].propositions.some(
      (prop) => prop.texte === 'Faux',
    )
  if (isTrueFalse) {
    // Si on a les réponses Vrai et Faux, on les met en premier
    const vrai = exercice.autoCorrection[i].propositions.findIndex(
      (prop) => prop.texte === 'Vrai',
    )
    const faux = exercice.autoCorrection[i].propositions.findIndex(
      (prop) => prop.texte === 'Faux',
    )
    if (vrai !== -1 && faux !== -1) {
      // On les met en premier
      const vraiProp = exercice.autoCorrection[i].propositions[vrai]
      const fauxProp = exercice.autoCorrection[i].propositions[faux]
      exercice.autoCorrection[i].propositions.splice(vrai, 1)
      exercice.autoCorrection[i].propositions.splice(faux - 1, 1)
      exercice.autoCorrection[i].propositions.unshift(fauxProp)
      exercice.autoCorrection[i].propositions.unshift(vraiProp)
    }
  }
  if (!exercice.autoCorrection[i].options?.ordered && !isTrueFalse) {
    const melange = shuffleJusquaWithIndexes(
      exercice.autoCorrection[i].propositions,
      lastChoice,
    )
    exercice.autoCorrection[i].propositions = melange.shuffledArray
    indexes.push(...melange.indexes)
  }
  if (!context.isHtml) {
    const formateQ = (format: string, rep: number) => {
      if (format == null || format === 'case') return '$\\square\\;$'
      if (format === 'lettre') {
        return `${texteGras(lettreDepuisChiffre(rep + 1))}.`
      }
      return `${texteGras(lettreDepuisChiffre(rep + 1))}$\\square\\;$`
    }
    const formateRV = (format: string, rep: number) => {
      if (format == null || format === 'case') return '$\\blacksquare\\;$'
      if (format === 'lettre') {
        return `${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}.`
      }
      return `${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}$\\blacksquare\\;$`
    }
    const formateRF = (format: string, rep: number) => {
      if (format == null || format === 'case') return '$\\square\\;$'
      if (format === 'lettre') {
        return `$${miseEnEvidence(`\\cancel{\\text{${lettreDepuisChiffre(rep + 1)}}}`, 'black')}$.`
      }
      return `$${miseEnEvidence(`\\cancel{\\text{${lettreDepuisChiffre(rep + 1)}}}`, 'black')}\\square\\;$`
    }
    texte += nbCols === 1 ? '\t' : `\n\n\\begin{multicols}{${nbCols}}\n\t`
    texteCorr += nbCols === 1 ? '\t' : `\n\n\\begin{multicols}{${nbCols}}\n\t`
    for (
      let rep = 0;
      rep < exercice.autoCorrection[i].propositions.length;
      rep++
    ) {
      texte += `${formateQ(options?.format, rep)} ${exercice.autoCorrection[i].propositions[rep].texte}`
      if (exercice.autoCorrection[i].propositions[rep].statut) {
        texteCorr += `${formateRV(options?.format, rep)} ${exercice.autoCorrection[i].propositions[rep].texte}`
      } else {
        texteCorr += `${formateRF(options?.format, rep)} ${exercice.autoCorrection[i].propositions[rep].texte}`
      }
      if (vertical) {
        texte += '\\\\\n\t'
        texteCorr += '\\\\\n\t'
      } else {
        texte += '\\qquad '
        texteCorr += '\\qquad '
      }
    }
    texte += nbCols === 1 ? (vertical ? '\n' : '\\\\\n') : '\\end{multicols}'
    texteCorr += nbCols === 1 ? '\\\\\n' : '\\end{multicols}'
  }
  if (context.isHtml) {
    const isRadio = exercice.autoCorrection[i].options?.radio ?? false
    const formateQ = (format: string, rep: number) => {
      if (format == null || format === 'case') {
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" id="checkEx${exercice.numeroExercice}Q${i}R${rep}">`
      }
      if (format === 'lettre') {
        return `<label ${classCss} >${texteGras(lettreDepuisChiffre(rep + 1))}.</label>`
      }
      return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" id="checkEx${exercice.numeroExercice}Q${i}R${rep}"><label ${classCss} >${lettreDepuisChiffre(rep + 1)}.</label>`
    }
    const formateRV = (format: string, rep: number) => {
      if (format == null || format === 'case') {
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" checked>`
      }
      if (format === 'lettre') {
        return `<label ${classCss} >${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}.</label>`
      }
      return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default" checked><label ${classCss} >${texteEnCouleurEtGras(lettreDepuisChiffre(rep + 1))}.</label>`
    }
    const formateRF = (format: string, rep: number) => {
      if (format == null || format === 'case') {
        return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default">`
      }
      if (format === 'lettre') {
        return `<label ${classCss} >${texteGras(`${barreTexte(lettreDepuisChiffre(rep + 1))}`)}.</label>`
      }
      return `<input type="${isRadio ? 'radio' : 'checkbox'}" name="checkEx${exercice.numeroExercice}Q${i}" ${exercice.interactif ? '' : 'disabled'} tabindex="0" style="height: 1rem; width: 1rem;" class="disabled:cursor-default"><label ${classCss} >$${miseEnEvidence(`\\cancel{${lettreDepuisChiffre(rep + 1)}}`, 'black')}$.</label>`
    }

    texte = '<div class="my-3">'
    texteCorr = '<div class="my-3">'
    for (
      let rep = 0;
      rep < exercice.autoCorrection[i].propositions.length;
      rep++
    ) {
      if (nbCols > 1 && rep % nbCols === 0) texte += '<br>'
      texte += `<div class="ex${exercice.numeroExercice} ${vertical ? '' : 'inline-block'} my-2 align-center">
      ${formateQ(options?.format, rep)}
      <label id="labelEx${exercice.numeroExercice}Q${i}R${rep}" ${classCss} >${exercice.autoCorrection[i].propositions[rep].texte + espace}</label>
      </div>`
      texteCorr += `<div class="${vertical ? '' : 'inline-block'}">
    ${
      exercice.autoCorrection[i].propositions[rep].statut
        ? formateRV(options?.format, rep)
        : formateRF(options?.format, rep)
    }
      <label id="labelEx${exercice.numeroExercice}Q${i}R${rep}" ${classCss} >${exercice.autoCorrection[i].propositions[rep].texte + espace}</label>
      </div>`
    }
    /* for (
      let rep = 0;
      rep < exercice.autoCorrection[i].propositions.length;
      rep++
    ) {
      texte += `<div class="m-2" id="feedbackEx${exercice.numeroExercice}Q${i}R${rep}"></div>`
    } */
    texte += `</div><div class="m-2" id="resultatCheckEx${exercice.numeroExercice}Q${i}"></div>`
    texteCorr += '</div><div class="m-2"></div>'
  }
  if (!context.isHtml) {
    texte =
      ` 
    
    ` + texte
    texteCorr =
      ` 
    
    ` + texteCorr
  }
  return { texte, texteCorr, indexes }
}

/**
 * Lorsque l'évènement 'exercicesAffiches' est lancé par mathalea.js
 * on vérifie la présence du bouton de validation d'id btnValidationEx{i} créé par listeQuestionsToContenu
 * et on y ajoute un listenner pour vérifier les réponses cochées
 * @param {object} exercice
 */
export function exerciceQcm(exercice: IExercice) {
  document.addEventListener('exercicesAffiches', () => {
    // On vérifie le type si jamais il a été changé après la création du listenner (voir 5R20)
    if (exercice.interactifType === 'qcm') {
      const button = document.querySelector(
        `#btnValidationEx${exercice.numeroExercice}-${exercice.id}`,
      ) as ButtonWithMathaleaListener
      if (button) {
        if (!button.hasMathaleaListener) {
          button.addEventListener('click', () => {
            let nbQuestionsValidees = 0
            let nbQuestionsNonValidees = 0
            for (let i = 0; i < exercice.autoCorrection.length; i++) {
              const resultat = verifQuestionQcm(exercice, i)
              resultat === 'OK'
                ? nbQuestionsValidees++
                : nbQuestionsNonValidees++
            }
            const uichecks = document.querySelectorAll(
              `.ui.checkbox.ex${exercice.numeroExercice}`,
            )
            for (const uicheck of uichecks) {
              uicheck.classList.add('read-only')
            }
            button.classList.add('disabled')
            afficheScore(exercice, nbQuestionsValidees, nbQuestionsNonValidees)
          })
          button.hasMathaleaListener = true
        }
      }
    }
  })
}

/**
 * prend un tableau de propositions [{texte: 'prop1', statut: true, feedback: 'Correct !'}, {texte: 'prop2', statut: false, ....}
 * élimine en cas de doublon la proposition fausse ou la deuxième proposition si elle sont toutes les deux fausses.
 * @author Jean-claude Lhote
 */
export function elimineDoublons(propositions: UneProposition[]) {
  // fonction qui va éliminer les doublons si il y en a
  let doublonsTrouves = false
  for (let i = 0; i < propositions.length - 1; i++) {
    for (let j = i + 1; j < propositions.length; ) {
      if (propositions[i].texte === propositions[j].texte) {
        // les réponses i et j sont les mêmes
        doublonsTrouves = true
        if (propositions[i].statut) {
          // si la réponse i est bonne, on vire la j
          propositions.splice(j, 1)
        } else if (propositions[j].statut) {
          // si la réponse i est mauvaise et la réponse j bonne,
          // comme ce sont les mêmes réponses, on vire la j mais on met la i bonne
          propositions.splice(j, 1)
          propositions[i].statut = true
        } else {
          // Les deux réponses sont mauvaises
          propositions.splice(j, 1)
        }
      } else {
        j++
      }
    }
  }
  return doublonsTrouves
}
/**
 * Une fonction pour vérifier que l'on a bien le nombre de réponses différentes souhaité dans les propositions d'un exercice de type qcm. Utile pour vérifier que les distracteurs sont bien différents de la bonne réponse et entre eux.
 * @param exercice
 * @param nombreSouhaite
 * @param test
 * @param options
 * @returns
 */
export function aLeBonNombreDePropsDifferentes(
  exercice: any,
  nombreSouhaite: number, // le nombre de réponses différentes que l'on devrait avoir (bonne réponse + distracteurs)
  test = true, // Mettre à true pour ne pas afficher de notifications, utilisé dans l'exo pour tester l'aléatoire sans alerter l'utilisateur à chaque fois que ça ne marche pas
  options?: OptionsComparaisonType,
): boolean {
  let reponses: string[]
  if (exercice instanceof ExerciceQcm) {
    reponses = exercice.reponses
  } else if (exercice.distracteurs != null && exercice.reponse != null) {
    reponses = [String(exercice.reponse), ...exercice.distracteurs.map(String)]
  } else {
    if (!test)
      window.notify(
        `l'exercice ne comporte pas les éléments pour fabriquer un qcm`,
        { exercice: JSON.stringify(exercice) },
      )
    return false
  }
  if (reponses == null) {
    if (!test)
      window.notify(
        'compteLesReponsesDifferentes a reçu un exercice sans réponses',
        { exercice },
      )
    return false
  }
  reponses = reponses.map((s: string) =>
    s.startsWith('$') && s.endsWith('$') ? s.slice(1, -1) : s,
  )
  if (nombreSouhaite > reponses.length) {
    if (!test)
      window.notify(
        'Il y a un nombre insuffisant de réponses dans this.reponses',
        { exercice },
      )
    return false
  }
  // Si options n'est pas fourni, on tente de le deviner automatiquement

  const cleaner = generateCleaner([
    'virgules',
    'espaceNormal',
    'fractions',
    'parentheses',
    'mathrm',
    'operatorName',
    'accolades',
  ])

  reponses = reponses
    .map((s: string) =>
      cleaner(s)
        .replace(/\\,/g, '')
        .replaceAll(/\\backslash/g, '\\')
        .replace('S=', '')
        .replace('S = ', '')
        .replace('x\\longmapsto', ''),
    )
    .map((s: string) =>
      options && 'texteAvecCasse' in options ? s : s.toLowerCase(),
    )
  const opts =
    options && Object.keys(options).length > 0
      ? options
      : exercice.optionsDeComparaison || guessOptionsForReponses(reponses)

  const doublons = []
  // On compare des expressions littérales qui peuvent être différentes mais équivalentes
  let doublonsTrouvés = false
  for (let i = 0; i < reponses.length - 1; i++) {
    let reponse = reponses[i]
    if (opts.unite) {
      try {
        const g = Grandeur.fromString(reponse)
        reponse = `${g.mesure} \\operatorname{${g.uniteDeReference}}`
      } catch (e) {
        // Si on n'arrive pas à parser la grandeur, on laisse la réponse telle quelle et on verra si elle est considérée comme un doublon ou pas. Mieux vaut risquer un faux positif de doublon que de rater un doublon parce qu'on n'a pas réussi à parser la grandeur.
      }
    }
    for (let j = i + 1; j < reponses.length; j++) {
      const compare = exercice.compare || fonctionComparaison
      const result = compare(
        reponse,
        opts.unite
          ? reponses[j].replace(/\\text\{([^}]*)\}/g, ' $1') // Virer les \text{} qui peuvent gêner la comparaison des unités, par exemple "\text{ m}" -> m
          : reponses[j],
        opts,
      )
      if (result.isOk) {
        doublons.push(
          `à l'indice ${i} j'ai ${reponse} et à l'indice ${j} j'ai ${reponses[j]}`,
        )
        doublonsTrouvés = true
      }
    }
  }
  if (doublonsTrouvés) {
    if (!test)
      window.notify(
        `CompteLesReponsesDifferentes : J'ai du éliminer ${reponses.length - nombreSouhaite} réponses`,
        {
          doublons: doublons.join(' ; '),
        },
      )
  }
  return !doublonsTrouvés
}
