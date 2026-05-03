import type Figure from 'apigeom/src/Figure'
import Decimal from 'decimal.js'
import type { MathfieldElement } from 'mathlive'
import type {
  AutoCorrection,
  ClickFigures,
  IExercice,
  LegacyReponse,
  LegacyReponses,
  MathaleaSVG,
  ReponseParams,
  ResultOfExerciceInteractif,
  Valeur,
  ValeurNormalized,
} from '../../lib/types'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import { addElement, get, setStyles } from '../html/dom'
import { Complexe } from '../mathFonctions/Complexe'
import { verifQuestionTableur } from '../tableur/outilsTableur'
import { afficheScore } from './afficheScore'
import { fonctionComparaison } from './comparisonFunctions'
import { verifDragAndDrop } from './DragAndDrop'
import { toutPourUnPoint, verifQuestionMathLive } from './mathLive'
import { verifQuestionQcm } from './qcm'
import { verifQuestionListeDeroulante } from './questionListeDeroulante'
import { verifQuestionSvgSelection } from './questionSvgSelection/questionSvgSelection'

export function isClickFiguresArray(
  figures: Figure[] | ClickFigures[],
): figures is ClickFigures[] {
  return figures.length > 0 && Array.isArray(figures[0])
}

/**
 * Pour positionner le formatInteractif d'une question sur 'cliqueFigure'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setCliqueFigure(objetReponse: AutoCorrection) {
  objetReponse.reponse = {
    ...objetReponse.reponse,
    param: { formatInteractif: 'cliqueFigure' },
  }
}
/**
 * Pour positionner le formatInteractif d'une question sur 'qcm'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setQcm(objetReponse: AutoCorrection) {
  objetReponse.reponse = {
    ...objetReponse.reponse,
    param: { formatInteractif: 'qcm' },
  }
}
/**
 * Pour positionner le formatInteractif d'une question sur 'listeDeroulante'
 * On passe this.autoCorrection[i] c'est à dire l'objet réponse de la question.
 * à appeler après avoir rempli l'objet réponse qvec enonce et propositions
 * @param objetReponse
 */
export function setListeDeroulante(objetReponse: AutoCorrection) {
  objetReponse.reponse = {
    ...objetReponse.reponse,
    param: { formatInteractif: 'listeDeroulante' },
  }
}
// Garde structurel pour éviter d'importer MetaExercice et créer un cycle
const isMetaExercice = (
  x: unknown,
): x is {
  Exercices: unknown[]
  correctionInteractives: Array<(i: number) => string | string[]>
} =>
  typeof x === 'object' &&
  x !== null &&
  Array.isArray((x as any).Exercices) &&
  Array.isArray((x as any).correctionInteractives)
/**
 * Cette fonction vérifie les réponses de chaque question en appelant la fonction associée à son formatInteractif ('mathlive', 'listeDeroulante', 'cliqueFigure', 'qcm')
 * @param {Exercice} exercice
 * @param {HTMLDivElement} divScore
 * @param {HTMLButtonElement} buttonScore
 * @returns {{numberOfPoints: number, numberOfQuestions: number}}
 */
export function exerciceInteractif(
  exercice: IExercice,
  divScore: HTMLDivElement,
  buttonScore: HTMLButtonElement,
): ResultOfExerciceInteractif {
  let nbQuestionsValidees = 0
  let nbQuestionsNonValidees = 0
  exercice.answers = {}

  if (exercice.interactifType === 'custom') {
    return verifExerciceCustom(exercice, divScore, buttonScore)
  }

  for (let i = 0; i < exercice.autoCorrection.length; i++) {
    const format = exercice.autoCorrection[i]?.reponse?.param?.formatInteractif
    let resultat: string
    switch (format) {
      case 'svgSelection':
        {
          const result = verifQuestionSvgSelection(exercice, i)
          if (result == null) {
            window.notify('erreur dans la correction de la question', {
              exercice,
              i,
            })
          } else {
            result === 'OK' ? nbQuestionsValidees++ : nbQuestionsNonValidees++
          }
        }
        break
      case 'MetaInteractif2d':
        {
          const result = verifQuestionMetaInteractif2d(exercice, i)
          if (result == null) {
            window.notify('erreur dans la correction de la question', {
              exercice,
              i,
            })
          } else {
            nbQuestionsValidees += result.score.nbBonnesReponses
            nbQuestionsNonValidees +=
              result.score.nbReponses - result.score.nbBonnesReponses
            if (result.feedback && result.feedback !== '') {
              const divFeedback = document.querySelector(
                `#feedbackEx${exercice.numeroExercice}Q${i}`,
              )
              if (divFeedback != null) {
                divFeedback.innerHTML = `💡 ${result.feedback}`
                divFeedback.classList.add(
                  'py-2',
                  'italic',
                  'text-coopmaths-warn-darkest',
                  'dark:text-coopmathsdark-warn-darkest',
                )
                ;(divFeedback as HTMLDivElement).style.display = 'block'
              }
            }
          }
        }
        break

      case 'tableur': {
        const result = verifQuestionTableur(exercice, i)
        if (result == null) {
          window.notify('erreur dans la correction de la question', {
            exercice,
            i,
          })
        } else {
          nbQuestionsValidees += result.score.nbBonnesReponses
          nbQuestionsNonValidees +=
            result.score.nbReponses - result.score.nbBonnesReponses
          if (result.feedback && result.feedback !== '') {
            const divFeedback = document.querySelector(
              `#feedbackEx${exercice.numeroExercice}Q${i}`,
            )
            if (divFeedback != null) {
              divFeedback.innerHTML = `💡 ${result.feedback}`
              divFeedback.classList.add(
                'py-2',
                'italic',
                'text-coopmaths-warn-darkest',
                'dark:text-coopmathsdark-warn-darkest',
              )
              ;(divFeedback as HTMLDivElement).style.display = 'block'
            }
          }
        }
        break
      }
      case 'custom': {
        if (isMetaExercice(exercice)) {
          const result = exercice.correctionInteractives[i](i)
          result === 'OK' ? nbQuestionsValidees++ : nbQuestionsNonValidees++
        }
        break
      }
      case 'dnd': {
        const result = verifDragAndDrop(exercice, i)
        nbQuestionsValidees += result.score.nbBonnesReponses
        nbQuestionsNonValidees +=
          result.score.nbReponses - result.score.nbBonnesReponses
        if (result.feedback !== '') {
          const spanFeedback = document.querySelector(
            `#feedbackEx${exercice.numeroExercice}Q${i}`,
          )
          if (spanFeedback != null) {
            spanFeedback.innerHTML = `💡 ${result.feedback}`
            spanFeedback.classList.add(
              'py-2',
              'italic',
              'text-coopmaths-warn-darkest',
              'dark:text-coopmathsdark-warn-darkest',
            )
          }
        }
        break
      }
      case 'qcm':
        resultat = verifQuestionQcm(exercice, i)
        resultat === 'OK' ? nbQuestionsValidees++ : nbQuestionsNonValidees++
        break
      case 'listeDeroulante': {
        resultat = verifQuestionListeDeroulante(exercice, i)
        resultat === 'OK' ? nbQuestionsValidees++ : nbQuestionsNonValidees++
        break
      }
      case 'cliqueFigure':
        if ('callback' in exercice && typeof exercice.callback === 'function') {
          resultat = verifQuestionCliqueFigure(
            exercice,
            i,
            exercice.callback as (exercice: IExercice, i: number) => void,
          )
        } else {
          resultat = verifQuestionCliqueFigure(exercice, i)
        }
        resultat === 'OK' ? nbQuestionsValidees++ : nbQuestionsNonValidees++
        break
      case 'multiMathfield':
        {
          const result = verifQuestionMultiMathfield(exercice, i)
          if (result == null) {
            window.notify('erreur dans la correction de la question', {
              exercice,
              i,
            })
          } else {
            nbQuestionsValidees += result.score.nbBonnesReponses
            nbQuestionsNonValidees +=
              result.score.nbReponses - result.score.nbBonnesReponses
            if (result.feedback && result.feedback !== '') {
              const divFeedback = document.querySelector(
                `#feedbackEx${exercice.numeroExercice}Q${i}`,
              )
              if (divFeedback != null) {
                divFeedback.innerHTML = `💡 ${result.feedback}`
                divFeedback.classList.add(
                  'py-2',
                  'italic',
                  'text-coopmaths-warn-darkest',
                  'dark:text-coopmathsdark-warn-darkest',
                )
                ;(divFeedback as HTMLDivElement).style.display = 'block'
              }
            }
          }
        }
        break
      default:
        {
          const result = verifQuestionMathLive(exercice, i)
          if (result == null) {
            window.notify('erreur dans la correction de la question', {
              exercice,
              i,
            })
          } else {
            nbQuestionsValidees += result.score.nbBonnesReponses
            nbQuestionsNonValidees +=
              result.score.nbReponses - result.score.nbBonnesReponses
            if (result.feedback && result.feedback !== '') {
              const divFeedback = document.querySelector(
                `#feedbackEx${exercice.numeroExercice}Q${i}`,
              )
              if (divFeedback != null) {
                divFeedback.innerHTML = `💡 ${result.feedback}`
                divFeedback.classList.add(
                  'py-2',
                  'italic',
                  'text-coopmaths-warn-darkest',
                  'dark:text-coopmathsdark-warn-darkest',
                )
                ;(divFeedback as HTMLDivElement).style.display = 'block'
              }
            }
          }
        }
        break
    }
  }
  return afficheScore(
    exercice,
    nbQuestionsValidees,
    nbQuestionsNonValidees,
    divScore,
    buttonScore,
  )
}

/**
 * Le cas à part : un exercice custom fournit une fonction correctionInteractive qui doit corriger toutes les questions et s'occuper du feedback
 * @param exercice
 * @param divScore
 * @param buttonScore
 * @return {{numberOfPoints, numberOfQuestions: *}}
 */
function verifExerciceCustom(
  exercice: IExercice,
  divScore: HTMLDivElement,
  buttonScore: HTMLButtonElement,
) {
  let nbBonnesReponses = 0
  let nbMauvaisesReponses = 0
  // Le get est non strict car on sait que l'élément n'existe pas à la première itération de l'exercice
  let eltFeedback = get(`feedbackEx${exercice.numeroExercice}`, false)
  // On ajoute le div pour le feedback
  if (!eltFeedback) {
    const eltExercice = get(
      `exercice${exercice.numeroExercice}`,
    ) as HTMLDivElement
    eltFeedback = addElement(
      eltExercice,
      'div',
      {
        id: `feedbackEx${exercice.numeroExercice}`,
      },
      '',
    )
  }
  setStyles(eltFeedback, 'marginBottom: 20px')
  if (eltFeedback) eltFeedback.innerHTML = ''
  // On utilise la correction définie dans l'exercice
  if (exercice.exoCustomResultat) {
    for (let i = 0; i < exercice.nbQuestions; i++) {
      if (exercice.correctionInteractive != null) {
        const correction = exercice.correctionInteractive(i)
        if (Array.isArray(correction)) {
          for (const result of correction) {
            if (result === 'OK') nbBonnesReponses++
            else nbMauvaisesReponses++
          }
        } else {
          correction === 'OK' ? nbBonnesReponses++ : nbMauvaisesReponses++
        }
      }
    }
  } else {
    for (let i = 0; i < exercice.nbQuestions; i++) {
      if (exercice.correctionInteractive != null) {
        exercice.correctionInteractive(i) === 'OK'
          ? nbBonnesReponses++
          : nbMauvaisesReponses++
      }
    }
  }
  return afficheScore(
    exercice,
    nbBonnesReponses,
    nbMauvaisesReponses,
    divScore,
    buttonScore,
  )
}

export function prepareExerciceCliqueFigure(exercice: IExercice) {
  // Dès que l'exercice est affiché, on rajoute des listenners sur chaque éléments de this.figures.
  for (let i = 0; i < exercice.nbQuestions; i++) {
    if (
      exercice.figures != null &&
      exercice.figures[i] != null &&
      isClickFiguresArray(exercice.figures)
    ) {
      const figures = exercice.figures[i]
      for (const objetFigure of figures) {
        const figSvg: unknown = document.getElementById(objetFigure.id)
        if (figSvg != null) {
          const fig = figSvg as MathaleaSVG
          if (!fig.hasMathaleaListener) {
            fig.addEventListener('mouseenter', mouseOverSvgEffect)
            fig.addEventListener('mouseleave', mouseOutSvgEffect)
            fig.addEventListener('click', mouseSvgClick)
            if (fig.etat === true) {
              // MGu : si l'état est true, c'est que ca a été coché par capytale
              // il faudrait revoir le système de figure cliquable avec un customelement
            } else {
              fig.etat = false
            }
            // modification le 6/04/2026 suite à un signalement :
            // ces marges et ce border décallent tous les divLatex.
            // Un gros soucis pour les repères !
            // fig.style.margin = '10px'
            //   fig.style.border = '3px solid transparent'
            fig.hasMathaleaListener = true
            // On enregistre que l'élément a déjà un listenner pour ne pas lui remettre le même à l'appui sur "Nouvelles Données"
          }
        }
      }
    }
  }
}

// callback est une fonction facultative qui sera appelée avant de vérifier la question
// elle permet de faire des actions avant la vérification, comme par exemple mettre à jour la correction affichée (voir 6G45)
function verifQuestionCliqueFigure(
  exercice: IExercice,
  i: number,
  callback?: (exercice: IExercice, i: number) => void,
): string {
  // si il y a une callback, on l'appelle
  if (callback != null) {
    callback(exercice, i)
  }
  // suite du code habituel de verifQuestionCliqueFigure
  // Le get est non strict car on sait que l'élément n'existe pas à la première itération de l'exercice
  let eltFeedback = get(`resultatCheckEx${exercice.numeroExercice}Q${i}`, false)
  // On ajoute le div pour le feedback
  if (!eltFeedback) {
    const eltExercice = get(
      `exercice${exercice.numeroExercice}`,
    ) as HTMLDivElement
    eltFeedback = addElement(
      eltExercice,
      'div',
      {
        id: `resultatCheckEx${exercice.numeroExercice}Q${i}`,
      },
      '',
    )
  }
  setStyles(eltFeedback, 'marginBottom: 20px')
  if (eltFeedback) eltFeedback.innerHTML = ''
  const figures = []
  let erreur = false // Aucune erreur détectée
  let nbFiguresCliquees = 0
  if (
    exercice.figures != null &&
    exercice.figures[i] != null &&
    Array.isArray(exercice.figures[i])
  ) {
    for (const objetFigure of exercice.figures[i]) {
      const eltFigure: unknown = document.getElementById(objetFigure.id)
      if (eltFigure != null) {
        figures.push(eltFigure)
        const fig = eltFigure as MathaleaSVG
        fig.removeEventListener('mouseenter', mouseOverSvgEffect)
        fig.removeEventListener('mouseleave', mouseOutSvgEffect)
        fig.removeEventListener('click', mouseSvgClick)
        fig.hasMathaleaListener = false
        if (fig.etat) {
          nbFiguresCliquees++
          // Sauvegarde des reponses
          if (exercice.answers) exercice.answers[objetFigure.id] = '1'
        }
        if (fig.etat !== objetFigure.solution) erreur = true
      }
    }
  }

  if (nbFiguresCliquees > 0 && !erreur) {
    eltFeedback.innerHTML = '😎'
    return 'OK'
  }
  eltFeedback.innerHTML = '☹️'
  return 'KO'
}

function mouseOverSvgEffect(event: MouseEvent) {
  const elt = event.currentTarget as MathaleaSVG
  elt.style.border = '3px solid #1DA962'
}

function mouseOutSvgEffect(event: MouseEvent) {
  const elt = event.currentTarget as MathaleaSVG
  elt.style.border = '3px solid transparent'
}

function mouseSvgClick(event: MouseEvent) {
  const elt = event.currentTarget as MathaleaSVG
  if (elt.etat) {
    // Déja choisi, donc on le réinitialise
    elt.style.border = '3px solid transparent'
    elt.addEventListener('mouseenter', mouseOverSvgEffect)
    elt.addEventListener('mouseleave', mouseOutSvgEffect)
    elt.addEventListener('click', mouseSvgClick)
    elt.etat = false
  } else {
    // Passe à l'état choisi donc on désactive les listenners pour over et pour out
    elt.removeEventListener('mouseenter', mouseOverSvgEffect)
    elt.removeEventListener('mouseleave', mouseOutSvgEffect)
    elt.style.border = '3px solid #f15929'
    elt.etat = true
  }
}

/**
 * Précise la réponse attendue
 * Cette fonction est dépréciée : elle est remplacée par la fonction handleAnswers qu'elle appelle pour les anciens exercices
 * C'est donc maintenant un wrapper de handleAnswers.
 * @param {Exercice} exercice = this
 * @param {number} i numéro de la question
 * @param {any} valeurs Attention à ce que vous mettez ici : ça doit être en accord avec le formatInteractif ! pas de texNombre ou de stringNombre !
 * @param {ReponseParams} params
 * @deprecated Dans la mesure du possible, utiliser handleAnswers après avoir consulter la doc
 * @see https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/Rendre-un-exercice-interactif
 */
export function setReponse(
  exercice: IExercice,
  i: number,
  valeurs: LegacyReponses,
  params: ReponseParams = {},
) {
  const url = new URL(window.location.href)
  // if (Array.isArray(valeurs) && !url.searchParams.has('testCI')) window.notifyLocal('setReponse a reçu un Array de reponses, il faut en finir avec ça', { valeurs })
  if (exercice.formatInteractif === 'qcm') return
  let formatInteractif = params?.formatInteractif
  let precision = params?.precision
  let signe = params?.signe
  if (formatInteractif === undefined) formatInteractif = 'calcul'
  let reponses: Array<LegacyReponse>
  if (url.hostname === 'localhost' && url.searchParams.has('triche')) {
    console.info(
      `Réponses de l'exercice ${(exercice.numeroExercice ?? 0) + 1} - question ${i + 1} : `,
      valeurs,
    )
  }
  if (
    typeof valeurs === 'object' &&
    (formatInteractif === 'tableauMathlive' ||
      formatInteractif === 'fillInTheBlank')
  ) {
    throw Error(
      'setReponse ne doit pas être utilisé pour tableauMathlive ni fillInTheBlank, il faut utiliser handleAnswers',
    )
  }
  if (Array.isArray(valeurs)) {
    // il peut y avoir une liste de valeurs de réponses à tester, on transfert dans reponses
    reponses = [...valeurs] // reponses contient donc directement le tableau valeurs
    // si valeur est un tableau on prend le signe de la première valeur
    if (valeurs[0] instanceof FractionEtendue) {
      signe = (valeurs[0] as FractionEtendue).signe === -1 // si c'est une fraction, alors on regarde son signe (valeur -1, 0 ou 1)
    } else {
      if (typeof valeurs[0] === 'number') {
        signe = signe ?? valeurs[0] < 0 // on teste si elle est négative, si oui, on force la case signe pour AMC
      } else {
        signe = signe ?? Number(valeurs[0]) < 0
      }
    }
  } else {
    // Il n'y a qu'une valeur, on uniformise le format : reponses est une liste de une seule valeur
    reponses = [valeurs] // ici, valeurs n'est pas un tableau mais on le met dans reponses sous forme de tableau
    if (valeurs instanceof FractionEtendue) {
      signe = valeurs.signe === -1 ? true : Boolean(signe) // si c'est une fraction, alors on regarde son signe (valeur -1, 0 ou 1)
    } else {
      signe = Number(valeurs) < 0 ? true : Boolean(signe) // on teste si elle est négative, si oui, on force la case signe pour AMC
    }
  }
  params.signe = signe

  // @fixme reponses est un array ! toujours. Normalement, il ne devrait y avoir qu'une seule goodAnswer dedans, mais avant, on n'avait pas d'autres moyens pour verifier les saisies diverses
  const reponse: LegacyReponse = (
    reponses as Array<LegacyReponse>
  )[0] as LegacyReponse // reponse est la première d'entre elles (ou la seule)

  // en contexte d'export AMC, on ne touche pas à l'existant
  if (context.isAmc) {
    let laReponseDemandee: LegacyReponse
    switch (formatInteractif) {
      case 'tableauMathlive':
        //   if (reponses.filter((cellule) => Object.keys(cellule)[0].match(/L\dC\d/).length === 0).length !== 0) {
        //    window.notify('setReponse : type "tableauMathlive" les objets proposés n\'ont pas tous une clé de la forme L$C$', { reponses, exercice: exercice.uuid })
        //  }
        break
      case 'fillInTheBlank':
        break
      case 'Num':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Num" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        break
      case 'Den':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Den" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        break
      case 'calcul':
        laReponseDemandee = reponse
        if (typeof laReponseDemandee === 'string') {
          laReponseDemandee = laReponseDemandee.replaceAll('dfrac', 'frac')
        }
        if (
          typeof laReponseDemandee === 'number' ||
          typeof laReponseDemandee === 'string'
        ) {
          laReponseDemandee = laReponseDemandee
            .toString()
            .replace(/\s/g, '')
            .replace(',', '.')
        }
        break
      /* case 'nombreDecimal':
        if (!(reponse instanceof Decimal)) {
          window.notify(
            'setReponse : type "nombreDecimal" un nombre est attendu !',
            { reponses, exercice: exercice.uuid }
          )
        }
        break */
      /* case 'ecritureScientifique':
        if (!(typeof reponse === 'string')) {
          window.notify(
            'setReponse : type "ecritureScientifique" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid }
          )
        }
        // ToFix : vérifier que la chaine est au bon format
        break */

      case 'texte':
        if (!(typeof reponse === 'string')) {
          window.notify(
            'setReponse : type "texte" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break

      case 'ignorerCasse':
        if (!(typeof reponse === 'string')) {
          window.notify(
            'setReponse : type "ignorerCasse" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break

      case 'fractionEgale':
        if (!(reponse instanceof FractionEtendue))
          window.notify(
            'setReponse : type "fractionEgale" une fraction est attendue !',
            { reponses, exercice: exercice.uuid },
          )
        else if (isNaN(reponse.num) || isNaN(reponse.den))
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        break

      case 'unites': // Pour les exercices où l'on attend une mesure avec une unité au choix
        if (!(reponse instanceof Grandeur)) {
          window.notify(
            'setReponse : type "longueur" la réponse n\'est pas une instance de Grandeur !',
            { reponses, exercice: exercice.uuid },
          )
        }
        break
      case 'intervalleStrict': // Pour les exercice où la saisie doit être dans un intervalle
        // ToFix : vérifier que la réponse est bien un intervalle valide
        break
      case 'intervalle':
        // ToFix : vérifier que la réponse est bien un intervalle valide
        break
      case 'puissance':
        // ToFix : vérifier que la réponse est bien l'écriture d'une puissance ou en tout cas une réponse acceptable pour ce format
        break
      case 'canonicalAdd':
        // à priori ce format ne concerne pas AMC
        break
    }

    if (exercice.autoCorrection[i] === undefined) {
      exercice.autoCorrection[i] = {}
    }
    if (exercice.autoCorrection[i].reponse === undefined) {
      exercice.autoCorrection[i].reponse = {}
    }
    const rep = exercice.autoCorrection[i].reponse
    if (rep != null) {
      rep.param = params
      // @ts-expect-error Pour AMC on ne change pas le format de réponse
      rep.valeur = reponses // On n'a rien changé pour AMC, on continue de passer un array dont seule la première valeur est utile
    }
    return // La réponse est prête pour AMC
  }
  // Ici on est en context non Amc, donc s'il y a un setReponse, c'est pour html interactif.
  // On va transformer le l'objetReponse pour handleAnswers(), il n'y
  let laReponseDemandee: LegacyReponse
  if (exercice != null) {
    params.formatInteractif = 'mathlive'
    switch (formatInteractif) {
      case 'listeDeroulante': {
        if (exercice.autoCorrection == null) exercice.autoCorrection = []
        if (exercice.autoCorrection[i] == null) exercice.autoCorrection[i] = {}
        if (exercice.autoCorrection[i].reponse == null) {
          exercice.autoCorrection[i].reponse = {}
        }
        const rep = exercice.autoCorrection[i].reponse
        if (rep != null) {
          if (rep.valeur == null) rep.valeur = {}
          if (rep.valeur.reponse == null) rep.valeur.reponse = { value: '' }
          if (rep.param == null) rep.param = {}
          rep.param.formatInteractif = 'listeDeroulante'
          Object.assign(rep.valeur.reponse.value, reponses)
        }
        return
      }
      case 'Num':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Num" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String((reponse as FractionEtendue).num),
            },
          },
          params,
        )

      case 'Den':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify('setReponse : type "Den" une fraction est attendue !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String((reponse as FractionEtendue).den),
            },
          },
          params,
        )

      case 'calcul': {
        if (reponses.length === 1) {
          laReponseDemandee = reponse
          if (typeof laReponseDemandee === 'string') {
            laReponseDemandee = laReponseDemandee
              .replaceAll('dfrac', 'frac')
              .replace(/\s/g, '')
              .replace(',', '.')
          }
          // Ceci n'est plus nécessaire avec le wrapper de hanfleAnswer
          /* else if (typeof laReponseDemandee === 'number') {
            laReponseDemandee = String(laReponseDemandee)
          } else if (laReponseDemandee instanceof FractionEtendue) {
            laReponseDemandee = laReponseDemandee.texFraction.replaceAll(
              'dfrac',
              'frac'
            )
          } else if (laReponseDemandee instanceof Decimal) {
            laReponseDemandee = laReponseDemandee.toString()
          } */
          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: laReponseDemandee,
              },
            },
            params,
          )
        }
        const value: string[] = []
        for (let i = 0; i < reponses.length; i++) {
          laReponseDemandee = reponses[i]
          if (typeof laReponseDemandee === 'string') {
            laReponseDemandee = laReponseDemandee
              .replaceAll('dfrac', 'frac')
              .replace(/\s/g, '')
              .replace(',', '.')
          } else if (typeof laReponseDemandee === 'number') {
            laReponseDemandee = String(laReponseDemandee)
          } else if (laReponseDemandee instanceof FractionEtendue) {
            laReponseDemandee = laReponseDemandee.texFraction.replaceAll(
              'dfrac',
              'frac',
            )
          } else if (laReponseDemandee instanceof Decimal) {
            laReponseDemandee = laReponseDemandee.toString()
          }
          value.push(laReponseDemandee as string)
        }

        return handleAnswers(exercice, i, { reponse: { value } }, params)
      }

      case 'texte':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "texte" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: Array.isArray(reponses)
                ? reponses.map(String)
                : String(reponses),
              options: { texteAvecCasse: true },
            },
          },
          params,
        )

      case 'ignorerCasse':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "ignorerCasse" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: Array.isArray(reponses)
                ? reponses.map((el) => String(el).toLowerCase())
                : String(reponses).toLowerCase(),
              options: { texteSansCasse: true },
            },
          },
          params,
        )

      case 'fractionEgale':
        if (!(reponse instanceof FractionEtendue)) {
          window.notify(
            'setReponse : type "fractionEgale" une fraction est attendue !',
            { reponses, exercice: exercice.uuid },
          )
        } else if (Number.isNaN(reponse.num) || Number.isNaN(reponse.den)) {
          window.notify('setReponse : La fraction ne convient pas !', {
            reponses,
            exercice: exercice.uuid,
          })
        }
        if (Array.isArray(reponse)) {
          window.notify(
            "setReponse a reçu une liste de réponse pour le format fractionEgale, c'est incohérent !",
            { reponses, exercice: exercice.uuid },
          )
        }
        if (reponse instanceof FractionEtendue) {
          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: reponse, // reponse.texFraction.replace('dfrac', 'frac') plus nécessaire : le wrapper de handleAnswers s'en occupe
              },
            },
            params,
          )
        }
        break

      case 'unites': // Pour les exercices où l'on attend une mesure avec une unité au choix
        if (precision == null) precision = 0 // Des exercices utilisent le format 'unites' mais ne définissent pas la précision
        if (!(reponse instanceof Grandeur)) {
          window.notify(
            'setReponse : type "longueur" la réponse n\'est pas une instance de Grandeur !',
            { reponses, exercice: exercice.uuid },
          )
        }
        if (reponse instanceof Grandeur) {
          return handleAnswers(
            exercice,
            i,
            {
              reponse: {
                value: reponse, // .toString().replace('\u202f', '') plus nécessaire grâce au wrapper de handleAnswers
                options: {
                  unite: true,
                  precisionUnite:
                    10 ** precision *
                    10 ** (reponse.puissanceUnite * reponse.puissancePrefixe),
                },
              },
            },
            params,
          )
        }
        break
      case 'intervalleStrict': // Pour les exercice où la saisie doit être dans un intervalle
        if (
          reponses.length !== 2 ||
          reponses.filter((el) => typeof el !== 'number').length !== 0
        ) {
          window.notify(
            'setReponse : type "intervalle" la réponse n\'est pas un tupple [number,number] !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: `]${reponses[0]};${reponses[1]}[`,
              options: { estDansIntervalle: true },
            },
          },
          params,
        )
      case 'intervalle':
        if (
          !Array.isArray(reponses) ||
          reponses.length !== 2 ||
          reponses.filter((el) => typeof el !== 'number').length !== 0
        ) {
          window.notify(
            'setReponse : type "intervalle" la réponse n\'est pas un tupple [number,number] !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: `[${reponses[0]};${reponses[1]}]`,
              options: { estDansIntervalle: true },
            },
          },
          params,
        )
      case 'puissance':
        if (typeof reponse !== 'string') {
          window.notify(
            'setReponse : type "puissance" la réponse n\'est pas un string !',
            { reponses, exercice: exercice.uuid },
          )
        }
        return handleAnswers(
          exercice,
          i,
          {
            reponse: {
              value: String(reponse),
              options: { puissance: true },
            },
          },
          params,
        )
    }
  }

  if (exercice.autoCorrection[i] === undefined) {
    exercice.autoCorrection[i] = {}
  }
  if (exercice.autoCorrection[i].reponse === undefined) {
    exercice.autoCorrection[i].reponse = {}
  }
  const rep = exercice.autoCorrection[i].reponse
  if (rep != null) {
    rep.param = params
    rep.valeur = reponses as unknown as ValeurNormalized
  }
}

// La solution est-elle un nombre ? Si oui, on force l'option nombreDecimalSeulement.
function isValidNumber(value: any): boolean {
  // Convertir la valeur en chaîne et remplacer les séparateurs de milliers (par exemple, '{,}')
  const cleanedValue = String(value)
    .replace(/{,}/g, '') // Enlève les caractères '{,}' (séparateurs de milliers comme dans "1{,}5")
    .replace(',', '.') // Remplace la virgule par un point pour les décimales
  // Vérifier que la chaîne ne contient que des chiffres et un seul séparateur décimal (point ou virgule)
  // Ou un nombre javascript écrit dans tous les formats supportés
  // const validNumberPattern = /^[+-]?(\d*(\.\d*)?([eE][+-]?\d*)?|0[xX][0-9a-fA-F]*|0[bB][01]*)$/
  const validNumberPattern = /^[+-]?\d+(.\d+)?$/

  // Vérifier si la chaîne nettoyée correspond à un nombre valide
  return validNumberPattern.test(cleanedValue)
}

function handleDefaultValeur(reponse: Valeur): ValeurNormalized {
  for (const [, val] of Object.entries(reponse)) {
    if (val !== undefined) {
      if (val?.value !== undefined) {
        if (Array.isArray(val.value)) {
          for (let i = 0; i < val.value.length; i++) {
            if (typeof val.value[i] === 'string') continue
            if (
              val.value[i] instanceof Decimal ||
              val.value[i] instanceof Grandeur ||
              val.value[i] instanceof Hms ||
              typeof val.value[i] === 'number'
            ) {
              val.value[i] = val.value[i].toString()
            }
            if (val.value[i] instanceof Complexe) {
              val.value[i] = val.value[i].tex()
            }
            if (val.value[i] instanceof FractionEtendue)
              val.value[i] = val.value[i].texFraction
          }
        } else {
          if (typeof val.value === 'string') continue
          if (
            val.value instanceof Decimal ||
            val.value instanceof Grandeur ||
            val.value instanceof Hms ||
            typeof val.value === 'number'
          ) {
            val.value = val.value.toString()
          }
          if (val.value instanceof Complexe) {
            val.value = val.value.tex()
          }
          if (val.value instanceof FractionEtendue)
            val.value = val.value.texFraction
        }
      }

      if (val.compare === undefined) val.compare = fonctionComparaison
      if (val.options === undefined || Object.keys(val.options).length === 0) {
        let reponseAttendueEstUnNombre: boolean
        if (Array.isArray(val.value)) {
          reponseAttendueEstUnNombre = true
          for (let ee = 0; ee < val.value.length; ee++) {
            reponseAttendueEstUnNombre &&= isValidNumber(val.value[ee])
          }
        } else {
          reponseAttendueEstUnNombre = isValidNumber(val.value)
        }
        const options = reponseAttendueEstUnNombre
          ? { nombreDecimalSeulement: true }
          : {}
        val.options = options
      }
    }
  }
  return reponse as ValeurNormalized // La normalisation consiste à transformer toute value en string et c'est fait maintenant par cette fonction
}

/**
 * La fonction à privilégier à partir de maintenant.
 * @param {Exercice} exercice
 * @param {number} question
 * @param {AnswerType} reponses
 * @param {ReponseParams} params
 */
export function handleAnswers(
  exercice: IExercice,
  question: number,
  reponses: Valeur,
  params: ReponseParams | undefined = {},
) {
  if (context.isAmc) {
    // handleAnswer ne s'occupe pas de l'export AMC
    return
  }
  let formatInteractif =
    params?.formatInteractif ??
    exercice.autoCorrection[question]?.reponse?.param?.formatInteractif ??
    'mathlive'
  if (exercice.autoCorrection == null) exercice.autoCorrection = []
  if (!(reponses instanceof Object)) {
    window.notify(`handleAnswer() reponses doit être un objet : ${reponses}`, {
      reponses,
      exercice: exercice.uuid,
    })
  }

  if (exercice.autoCorrection[question] === undefined) {
    exercice.autoCorrection[question] = {}
  }
  if (exercice.autoCorrection[question].reponse === undefined) {
    exercice.autoCorrection[question].reponse = {}
  }
  const rep = exercice.autoCorrection[question].reponse
  if (rep != null) {
    rep.param = params ?? { formatInteractif }
    if (formatInteractif === undefined) formatInteractif = 'mathlive'
    rep.param.formatInteractif = formatInteractif
    rep.valeur = handleDefaultValeur(reponses)
  }
  const url = new URL(window.location.href)

  if (url.hostname === 'localhost' && url.searchParams.has('triche')) {
    console.info(
      `Réponses de l'exercice ${(exercice.numeroExercice ?? 0) + 1} - question ${question + 1} : `,
      rep.valeur,
    )
  }
}

export function verifQuestionMetaInteractif2d(
  exercice: IExercice,
  i: number,
): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  const eltFeedback = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLSpanElement
  if (eltFeedback) {
    setStyles(eltFeedback, 'marginBottom: 20px')
    eltFeedback.innerHTML = ''
  }
  if (exercice.autoCorrection[i]?.reponse == null) {
    throw Error(
      `verifQuestionMetaInteractif2d appelé sur une question sans réponse: ${JSON.stringify(
        {
          exercice,
          question: i,
          autoCorrection: exercice.autoCorrection[i],
        },
      )}`,
    )
  }
  const reponses = exercice.autoCorrection[i].reponse.valeur
  if (reponses == null) {
    window.notify(
      `verifQuestionMetaInteractif2d: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
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
  const variables = Object.entries(reponses).filter(
    ([key]) => key !== 'bareme' && key !== 'feedback',
  )
  const points = []
  const saisies: Record<string, string> = {}
  let feedback = ''
  let compteurSaisiesVides = 0
  let compteurBonnesReponses = 0
  let noFeedback = false
  for (const [field, reponse] of variables) {
    const options = reponse.options
    noFeedback = noFeedback || Boolean(options?.noFeedback)
    const compareFunction = reponse.compare ?? fonctionComparaison
    const index = parseInt(field.replace('field', ''), 10)
    const mf = document.querySelector(
      `#MetaInteractif2dEx${exercice.numeroExercice}Q${i}field${index}`,
    ) as MathfieldElement
    const saisie = mf.getPromptValue('champ1')
    if (saisie === '') {
      compteurSaisiesVides++
      mf.classList.add('corrected')
      points.push(0)
      continue
    }
    saisies[`MetaInteractif2dEx${exercice.numeroExercice}Q${i}${field}`] =
      saisie
    let result
    if (Array.isArray(reponse.value)) {
      let ii = 0
      while (!result?.isOk && ii < reponse.value.length) {
        result = compareFunction(saisie, reponse.value[ii], options)
        ii++
      }
    } else {
      result = compareFunction(saisie, reponse.value, options)
    }
    if (result.isOk) {
      compteurBonnesReponses++
      points.push(1)
      mf.setPromptState('champ1', 'correct', true)
    } else {
      points.push(0)
      mf.setPromptState('champ1', 'incorrect', true)
      if (result.feedback === 'saisieVide') result.feedback = null
      else {
        result = {
          isOk: false,
          feedback: '',
        }
      }
    }
    mf.classList.add('corrected')
    if (result.feedback != null) feedback += result.feedback
  }

  if (compteurBonnesReponses === variables.length) {
    feedback = ''
  } else {
    if (compteurSaisiesVides > 0) {
      feedback = `Il manque ${compteurSaisiesVides} réponse(s).`
    } else {
      feedback = `Certaines réponses sont incorrectes.`
    }
  }

  const [nbBonnesReponses, nbReponses] = bareme(points)
  const spanReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLSpanElement
  if (spanReponseLigne != null) {
    spanReponseLigne.innerHTML = nbBonnesReponses === nbReponses ? '😎' : '☹️'
  }
  if (typeof exercice.answers === 'object' && exercice.answers !== null) {
    exercice.answers[`MetaInteractif2dEx${exercice.numeroExercice}Q${i}`] =
      JSON.stringify(saisies)
  }

  // le feedback est déjà assuré par la fonction feedback(), donc on le met à ''
  return {
    isOk: nbBonnesReponses === nbReponses,
    feedback: noFeedback ? '' : feedback,
    score: { nbBonnesReponses, nbReponses },
  }
}

export function verifQuestionMultiMathfield(
  exercice: IExercice,
  i: number,
): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  if (exercice.autoCorrection[i]?.reponse == null) {
    throw Error(
      `verifQuestionMultiMathfield appelé sur une question sans réponse: ${JSON.stringify(
        {
          exercice,
          question: i,
          autoCorrection: exercice.autoCorrection[i],
        },
      )}`,
    )
  }
  const multi = document.getElementById(
    `multiMathfieldEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLElement
  const template = multi?.getAttribute('data-template')
  const reponses = exercice.autoCorrection[i].reponse.valeur
  if (reponses == null) {
    window.notify(
      `verifQuestionMultiMathfield: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
      { exercice, i },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  } else if (typeof reponses !== 'object') {
    window.notify(
      `verifQuestionMultiMathfield: reponses n'est pas un objet pour la question ${i} de l'exercice ${exercice.id}`,
      { exercice, i, reponses },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  const bareme: (arg: number[]) => [number, number] =
    reponses.bareme ?? toutPourUnPoint
  const feedbackFunction = reponses.feedback ?? undefined
  const variables = Object.entries(reponses).filter(
    ([key]) => key !== 'bareme' && key !== 'feedback',
  )
  const points = []
  const saisies: Record<string, string> = {}
  let compteurSaisiesVides = 0
  let compteurBonnesReponses = 0
  let noFeedback = false
  let feedback = ''
  for (const [field, reponse] of variables) {
    const options = reponse.options
    noFeedback = noFeedback || Boolean(options?.noFeedback)
    const compareFunction = reponse.compare ?? fonctionComparaison
    // Récupère le composant MultiMathfield puis le Mathfield dans son shadowRoot

    const mf = multi?.shadowRoot?.querySelector(
      `#multiMathfieldEx${exercice.numeroExercice}Q${i}-${field}`,
    ) as MathfieldElement
    const saisie = mf.getValue()
    mf.readOnly = true
    mf.classList.add('corrected')
    if (saisie === '') {
      compteurSaisiesVides++
      points.push(0)
      continue
    }
    const eltFeedback = multi?.shadowRoot?.querySelector(
      `#check-multiMathfieldEx${exercice.numeroExercice}Q${i}-${field}`,
    ) as HTMLSpanElement
    if (eltFeedback) {
      setStyles(eltFeedback, 'marginBottom: 20px')
      eltFeedback.innerHTML = ''
    }
    saisies[`${field}`] = saisie
    let result
    if (Array.isArray(reponse.value)) {
      let ii = 0
      while (!result?.isOk && ii < reponse.value.length) {
        result = compareFunction(saisie, reponse.value[ii], options)
        ii++
      }
    } else {
      result = compareFunction(saisie, reponse.value, options)
    }

    if (result.isOk) {
      compteurBonnesReponses++
      points.push(1)
      eltFeedback.innerHTML = '😎'
    } else {
      points.push(0)
      eltFeedback.innerHTML = '☹️'
      if (result.feedback === 'saisieVide') result.feedback = null
      else {
        result = {
          isOk: false,
          feedback: '',
        }
      }
    }
    mf.classList.add('corrected')

    if (result.feedback != null) feedback += result.feedback
  }

  if (compteurBonnesReponses === variables.length) {
    feedback = ''
  } else {
    if (compteurSaisiesVides > 0) {
      feedback = `Il manque ${compteurSaisiesVides} réponse(s).`
    } else {
      feedback = `Certaines réponses sont incorrectes.`
    }
  }
  if (feedbackFunction != null) {
    const feedbackFunctionResult = feedbackFunction(saisies)
    if (typeof feedbackFunctionResult === 'string') {
      feedback += feedbackFunctionResult
    }
  }
  const [nbBonnesReponses, nbReponses] = bareme(points)
  const spanReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLSpanElement
  if (spanReponseLigne != null) {
    spanReponseLigne.innerHTML =
      compteurBonnesReponses === variables.length ? '😎' : '☹️'
  }
  if (typeof exercice.answers === 'object' && exercice.answers !== null) {
    let filledTemplate = template ?? ''
    Object.entries(saisies).forEach(([champ, valeur]) => {
      // Remplace toutes les occurrences de %{champ} par %{champ:"valeur"}
      const regex = new RegExp(`%\\{${champ}\\}`, 'g')
      filledTemplate = filledTemplate.replace(regex, `%{${champ}:"${valeur}"}`)
    })
    exercice.answers[`multiMathfieldEx${exercice.numeroExercice}Q${i}`] =
      filledTemplate
  }

  // le feedback est déjà assuré par la fonction feedback(), donc on le met à ''
  return {
    isOk: compteurBonnesReponses === variables.length,
    feedback: noFeedback ? '' : feedback,
    score: {
      nbBonnesReponses,
      nbReponses,
    },
  }
}
