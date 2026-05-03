import { get } from 'svelte/store'
import { globalOptions } from '../stores/globalOptions'

export function buildDsParams(): string {
  let ds = ''
  const options = get(globalOptions)
  ds += options.nbVues?.toString() ?? '1'
  ds += options.flow?.toString() ?? '0'
  ds += options.screenBetweenSlides ? '1' : '0'
  ds += options.sound?.toString() ?? '0'
  ds += options.shuffle ? '1' : '0'
  ds += options.manualMode ? '1' : '0'
  ds += options.pauseAfterEachQuestion ? '1' : '0'
  ds += options.isImagesOnSides ? '1' : '0'
  return ds
}
