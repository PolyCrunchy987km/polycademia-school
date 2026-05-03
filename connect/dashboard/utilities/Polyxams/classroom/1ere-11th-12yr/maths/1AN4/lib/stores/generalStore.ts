import { get, writable } from 'svelte/store'
import { statsPageTracker } from '../../modules/statsUtils'
import { buildDsParams } from '../components/buildDsParams'
import type {
  InterfaceParams,
  InterfaceResultExercice,
  bibliothequeExercise,
} from '../types'
import { type JSONReferentielEnding } from '../types/referentiels'
import type { VueType } from '../VueType'
import { canOptions } from './canStore'
import { globalOptions } from './globalOptions'

/**
 * Pour bloquer la mise à jour de l'url
 */
export const freezeUrl = writable<boolean>(false)

/**
 * Pour signaler que MathALÉA est dans une iframe
 */
export const isInIframe = writable<boolean>(false)

/**
 * exercicesParams est un tableau d'objets décrivant les exercices
 * {id, uuid, alea, interactif, cd, sup, sup2, sup3, sup4,sup5, n}
 */
export const exercicesParams = writable<InterfaceParams[]>([])

// tenir le compte des changements dans la liste : ajout/retrait -> +1
export const changes = writable<number>(0)

// pour indiquer qu'un réordonnancement est en cours (pour l'animation flip des exercices)
export const isReordering = writable<boolean>(false)

// pour la gestion du mode sombre
export const darkMode = writable({ isActive: false })

export const capytaleMode = writable<
  'none' | 'create' | 'assignment' | 'review' | 'view'
>('none')

export const capytaleStudentAssignment = writable<InterfaceResultExercice[]>()

// sauvegarde des résultats des exercices
export const resultsByExercice = writable<InterfaceResultExercice[]>([])

// vue Élève : détecter la nécessité d'un menu
export const isMenuNeededForExercises = writable<boolean>(false)
export const isMenuNeededForQuestions = writable<boolean>(false)
export const isSettingsMenuVisible = writable<boolean>(false)
export const isExportMenuVisible = writable<boolean>(false)

// pour garder trace du statut d'ouverture du menu de choix
export const isSideMenuVisible = writable<boolean>(true)

// pour garder trace de la page appelant l'export
export const previousView = writable<undefined | '' | VueType>(undefined)

// pour sauvegarder l'objet correspondant à la rubrique choisie pour les exos statiques
export const bibliothequeSectionContent = writable<bibliothequeExercise[]>([])
export const bibliothequeDisplayedContent =
  writable<Record<string, JSONReferentielEnding>>()
export const bibliothequePathToSection = writable<string[]>([])

/**
 * Déplace un exercice dans exercicesParams
 */
export function moveExercice(
  liste: InterfaceParams[],
  iDepart: number,
  iArrivee: number,
): InterfaceParams[] {
  liste.splice(iArrivee, 0, liste.splice(iDepart, 1)[0])
  return liste
}

let urlToWrite: URL
let timerId: ReturnType<typeof setTimeout> | undefined

/**
 * Complète l'URL courante avec les éléments relatifs au diaporama
 */
export function updateGlobalOptionsInURL(url: URL) {
  const options = get(globalOptions)
  const canStore = get(canOptions)
  if (options.v) {
    url.searchParams.append('v', options.v)
  } else {
    url.searchParams.delete('v')
  }
  if (options.z && options.z !== '1') {
    url.searchParams.append('z', options.z)
  } else {
    url.searchParams.delete('z')
  }
  if (options.durationGlobal) {
    url.searchParams.append('dGlobal', options.durationGlobal.toString())
  } else {
    url.searchParams.delete('dGlobal')
  }
  if (
    options.v === 'eleve' ||
    options.v === 'myriade' ||
    options.v === 'indices'
  ) {
    if (options.title != null && options.title.length > 0) {
      url.searchParams.append('title', options.title)
    } else {
      url.searchParams.delete('title')
    }
    if (options.iframe !== undefined && options.iframe.length > 0) {
      url.searchParams.append('iframe', options.iframe)
    } else {
      url.searchParams.delete('iframe')
    }
    if (options.answers !== undefined && options.answers.length > 0) {
      url.searchParams.append('answers', JSON.stringify(options.answers))
    } else {
      url.searchParams.delete('answers')
    }
    if (typeof options !== 'undefined') {
      let es = ''
      if (options.presMode != null) {
        es = presModeId.indexOf(options.presMode).toString()
      } else es = '1'
      es += options.setInteractive ?? '2'
      es += options.isSolutionAccessible ? '1' : '0'
      es += options.isInteractiveFree ? '1' : '0'
      es += options.oneShot ? '1' : '0'
      es += options.twoColumns ? '1' : '0'
      es += options.isTitleDisplayed ? '1' : '0'
      es += options.isReferenceDisplayed ? '1' : '0'
      url.searchParams.append('es', es)
    }
    if (options.done) {
      url.searchParams.append('done', options.done)
    } else {
      url.searchParams.delete('done')
    }
  } else {
    url.searchParams.delete('title')
    url.searchParams.delete('es')
    url.searchParams.delete('iframe')
    url.searchParams.delete('answers')
    url.searchParams.delete('recorder')
    url.searchParams.delete('done')
  }
  if (options.v === 'can') {
    if (canStore) {
      url.searchParams.append('canD', canStore.durationInMinutes.toString())
      url.searchParams.append('canTi', canStore.title)
      url.searchParams.append('canT', canStore.subTitle)
      url.searchParams.append('canSA', canStore.solutionsAccess ? '1' : '0')
      url.searchParams.append('canSM', canStore.solutionsMode)
      url.searchParams.append('canI', canStore.isInteractive ? '1' : '0')
    }
  }
  if (options.recorder) {
    url.searchParams.append('recorder', options.recorder)
  } else {
    url.searchParams.delete('recorder')
  }
  if (options.v === 'diaporama' || options.v === 'overview') {
    url.searchParams.append('ds', buildDsParams())
    if (
      options.select !== undefined &&
      options.select !== undefined &&
      options.select.length > 0 &&
      options.select.length < get(exercicesParams).length
    ) {
      url.searchParams.append('select', options.select.join('-'))
    }
    if (
      options.order !== undefined &&
      options.order.length > 0 &&
      options.shuffle
    ) {
      url.searchParams.append('order', options.order.join('-'))
    }
  } else {
    url.searchParams.delete('ds')
    url.searchParams.delete('select')
    url.searchParams.delete('order')
  }
  if (options.beta) {
    url.searchParams.append('beta', '1')
  }
  const currentUrl = new URL(window.location.href)
  if (currentUrl.searchParams.has('triche')) {
    url.searchParams.append('triche', '1')
  }
  const logParam = currentUrl.searchParams.get('log')
  if (logParam !== null && /^[0-9]$/.test(logParam)) {
    url.searchParams.append('log', logParam)
  }
  const pdfParam = currentUrl.searchParams.get('pdfParam')
  if (
    (options.v === 'latex' || options.v === 'pdf') &&
    pdfParam !== null &&
    /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      pdfParam,
    )
  ) {
    url.searchParams.append('pdfParam', pdfParam)
  }
  urlToWrite = url
  // On ne met à jour l'url qu'une fois toutes les 0,5 s
  // pour éviter l'erreur Attempt to use history.pushState() more than 100 times per 30 seconds
  if (timerId === undefined) {
    timerId = setTimeout(() => {
      const currentUrl = new URL(window.location.href)
      if (urlToWrite.href === currentUrl.href) {
        timerId = undefined
        return
      }
      window.history.pushState({}, '', urlToWrite)
      statsPageTracker()
      timerId = undefined
    }, 500)
  }
}

export const presModeId: [
  // sync with src/components/urls.ts presentationMode
  'liste_exos',
  'un_exo_par_page',
  'liste_exos',
  'une_question_par_page',
  'recto',
  'verso',
  // 'cartes'
] = [
  'liste_exos',
  'un_exo_par_page',
  'liste_exos',
  'une_question_par_page',
  'recto',
  'verso',
  // 'cartes'
]
