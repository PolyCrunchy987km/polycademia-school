import uuidToUrl from '../../json/uuidsToUrlFR.json'

/**
 * Détermine si l'uuid a un préfixe d'exercice statique
 * @param uuid
 * @returns boolean
 */

export function isStatic(uuid: string | undefined) {
  if (uuid === undefined) {
    return false
  }
  return (
    uuid.startsWith('crpe') ||
    uuid.startsWith('dnb_') ||
    uuid.startsWith('dnbpro_') ||
    uuid.startsWith('e3c_') ||
    uuid.startsWith('bac_') ||
    uuid.startsWith('sti2d_') ||
    uuid.startsWith('evacom_') ||
    uuid.startsWith('eam_') ||
    uuid.startsWith('stl_') ||
    uuid.startsWith('sti2d_') ||
    uuid.startsWith('2nd_')
  )
}

export function isSvelte(uuid: string) {
  const urlExercice = uuidToUrl[uuid as keyof typeof uuidToUrl]
  return urlExercice && urlExercice.includes('.svelte')
}
