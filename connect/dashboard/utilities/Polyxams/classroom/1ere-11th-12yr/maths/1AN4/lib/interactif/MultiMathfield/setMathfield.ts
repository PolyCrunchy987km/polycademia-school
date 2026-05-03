import { MathfieldElement } from 'mathlive'
import { get } from 'svelte/store'
import { keyboardState } from '../../../components/keyboard/stores/keyboardStore'
import type { BlockForKeyboard } from '../../../components/keyboard/types/keyboardContent'
import { globalOptions } from '../../stores/globalOptions'
import { getKeyboardShortcusts } from '../claviers/keyboard'
import { isMathfieldFocused } from '../mathfieldFocus'
export const setMathfieldListener = (e: Event) =>
  setMathfield(e.currentTarget as MathfieldElement)
export function setMathfield(mf: MathfieldElement) {
  if ('mathVirtualKeyboardPolicy' in mf) mf.mathVirtualKeyboardPolicy = 'manual'
  if ('menuItems' in mf) mf.menuItems = []
  if ('virtualKeyboardMode' in mf) mf.virtualKeyboardMode = 'manual'
  mf.classList.add('ml-1')
  mf.addEventListener('focus', (event) => {
    handleFocusMathField(event)
  })
  mf.addEventListener('focusout', (event) => {
    handleFocusOutMathField(event)
  })
  mf.addEventListener('input', () => {
    const content = mf.getValue()
    // Remplace les espaces consécutifs par un seul espace
    const filteredContent = content.replaceAll('\\,\\,', '\\,')
    mf.setValue(filteredContent)
  })
  mf.dataset.listenerAdded = 'true'
  if (mf.getAttribute('data-space') === 'true') {
    mf.mathModeSpace = '\\,'
  }
  mf.removeEventListener('mount', setMathfieldListener)
}

function handleFocusMathField(event: FocusEvent) {
  const mf = event.target as MathfieldElement
  const isCorrected = mf.classList.contains('corrected')
  getKeyboardShortcusts(mf)
  keyboardState.update((value) => {
    return {
      isVisible: true && !isCorrected,
      isInLine: value.isInLine,
      idMathField: (event.target as MathfieldElement)?.id ?? '',
      alphanumericLayout: value.alphanumericLayout,
      blocks:
        'keyboard' in mf.dataset
          ? ((mf.dataset.keyboard || '').split(' ') as BlockForKeyboard[])
          : (['numbers', 'fullOperations', 'variables'] as BlockForKeyboard[]),
    }
  })
}

function handleFocusOutMathField(event: FocusEvent) {
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
