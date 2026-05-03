import loadjs from 'loadjs'
import { MathfieldElement } from 'mathlive'
import { get } from 'svelte/store'
import { keyboardState } from '../components/keyboard/stores/keyboardStore'
import { getKeyboardShortcusts } from '../lib/interactif/claviers/keyboard'
import { isMathfieldFocused } from '../lib/interactif/mathfieldFocus'
import { globalOptions } from '../lib/stores/globalOptions'
import { context } from './context'
import { UserFriendlyError } from './messages'
/**
 * Nos applis prédéterminées avec la liste des fichiers à charger
 * @type {Object}
 */
const apps = {
  scratchblocks: 'assets/externalJs/scratchblocks-v3.5-min',
  slick: [
    '/assets/externalJs/semantic-ui/semantic.min.css',
    '/assets/externalJs/semantic-ui/semantic.min',
    '/assets/externalJs/semantic-ui/components/state.min',
  ],
}

/**
 * Charge une appli listée dans apps (pour mutualiser l'appel de loadjs)
 * @private
 * @param {string} name
 * @return {Promise<undefined, Error>} promesse de chargement
 */
async function load(name) {
  // on est dans une fct async, si l'une de ces deux lignes plantent ça va retourner une promesse rejetée avec l'erreur
  if (!apps[name]) throw UserFriendlyError(`application ${name} inconnue`)
  // cf https://github.com/muicss/loadjs
  try {
    if (!loadjs.isDefined(name)) {
      await loadjs(apps[name], name, { returnPromise: true })
    }
  } catch (error) {
    console.error(error)
    throw new UserFriendlyError(`Le chargement de ${name} a échoué`)
  }
  // loadjs.ready veut une callback, on emballe ça dans une promesse
  return new Promise((resolve, reject) => {
    loadjs.ready(name, {
      success: resolve,
      // si le chargement précédent a réussi on voit pas trop comment on pourrait arriver là, mais ça reste plus prudent de gérer l'erreur éventuelle
      error: () =>
        reject(new UserFriendlyError(`Le chargement de ${name} a échoué`)),
    })
  })
}

/**
 * Charge prism
 * @return {Promise<undefined>}
 */
export function loadPrism() {
  return load('prism')
}

/**
 * Charge scratchblocks
 * @return {Promise} qui peut échouer…
 */
export function loadScratchblocks() {
  return load('scratchblocks')
}

/**
 * Charge MathLive et personnalise les réglages
 * MathLive est chargé dès qu'un tag math-field est créé
 */
export async function loadMathLive(divExercice) {
  await import('mathlive')
  let champs
  if (divExercice) {
    champs = divExercice.getElementsByTagName('math-field')
  } else {
    champs = document.getElementsByTagName('math-field')
  }
  if (champs != null) {
    for (const mf of champs) {
      if (mf instanceof MathfieldElement) {
        if (
          mf.classList.contains('fillInTheBlanks') ||
          mf.classList.contains('metaInteractif2d')
        ) {
          mf.classList.remove('invisible')
        }
        mf.classList.add('ml-1')
        mf.addEventListener('focus', handleFocusMathField)
        mf.addEventListener('focusout', handleFocusOutMathField)
        mf.addEventListener('input', () => {
          const content = mf.getValue()
          // Remplace les espaces consécutifs par un seul espace
          const filteredContent = content.replaceAll('\\,\\,', '\\,')
          mf.setValue(filteredContent)
        })
        if (mf.getAttribute('data-space') === 'true') {
          mf.mathModeSpace = '\\,'
        }

        if (mf.isConnected) {
          // mf is already in the DOM. You can check if it's ready by accessing a property.
          setMathfield(mf)
        } else {
          // Add a listener for the `mount` event in case it's not mounted yet.
          mf.addEventListener('mount', setMathfield, { once: true })
        }
      }
    }
    // On envoie la hauteur de l'iFrame après le chargement des champs MathLive
    if (context.vue === 'exMoodle') {
      const hauteurExercice =
        window.document.querySelector('section').scrollHeight
      window.parent.postMessage(
        {
          hauteurExercice,
          iMoodle: parseInt(
            new URLSearchParams(window.location.search).get('iMoodle'),
          ),
        },
        '*',
      )
      const domExerciceInteractifReady = new window.Event(
        'domExerciceInteractifReady',
        { bubbles: true },
      )
      document.dispatchEvent(domExerciceInteractifReady)
    }
  }
}

function handleFocusMathField(event) {
  const mf = event.target
  const isFillInTheBlanks =
    mf.classList.contains('fillInTheBlanks') ||
    mf.classList.contains('metaInteractif2d')
  const isNotFillInTheBlanksAndReadOnly = !isFillInTheBlanks && mf.readOnly
  const isCorrected =
    isNotFillInTheBlanksAndReadOnly || mf.classList.contains('corrected')
  getKeyboardShortcusts(mf)
  keyboardState.update((value) => {
    return {
      isVisible: true && !isCorrected, // Les fiilInTheBlanks sont toujours readOnly
      isInLine: value.isInLine,
      idMathField: event.target.id,
      alphanumericLayout: value.alphanumericLayout,
      blocks:
        'keyboard' in mf.dataset
          ? mf.dataset.keyboard.split(' ')
          : ['numbers', 'fullOperations', 'variables'],
    }
  })
}

function handleFocusOutMathField() {
  // Si le focus est sur un autre élément que mathfield, on cache le clavier
  // On utilise setTimeout pour être sûr que le focus soit bien sur le nouvel élément
  // car au focusout, le focus est sur body
  if (get(globalOptions).v === 'can') return
  setTimeout(() => {
    if (!isMathfieldFocused(document.activeElement)) {
      keyboardState.update((value) => {
        const newValue = value
        newValue.isVisible = false
        return newValue
      })
    }
  }, 200)
}

function setMathfield(mf) {
  if ('mathVirtualKeyboardPolicy' in mf) mf.mathVirtualKeyboardPolicy = 'manual'
  if ('menuItems' in mf) mf.menuItems = []
  if ('virtualKeyboardMode' in mf) mf.virtualKeyboardMode = 'manual'
  mf.removeEventListener('mount', setMathfield)
}
