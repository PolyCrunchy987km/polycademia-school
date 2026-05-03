import type { Language, LanguageDisplay } from '../types/languages'
import refToUuidCH from '../../json/refToUuidCH.json'
import refToUuidFR from '../../json/refToUuidFR.json'

type ValueOf<T> = T[keyof T]
const REFERENCES_TO_UUIDS_CH = { ...refToUuidCH } as const
const REFERENCES_TO_UUIDS_FR = { ...refToUuidFR } as const
type ReferencesCH = keyof typeof REFERENCES_TO_UUIDS_CH
type UuidsCH = ValueOf<typeof REFERENCES_TO_UUIDS_CH> // on devrait avoir des uuid mais on a que des string :-(
type ReferencesFR = keyof typeof REFERENCES_TO_UUIDS_FR
type UuidsFR = ValueOf<typeof REFERENCES_TO_UUIDS_FR>
type RefUuidPairs =
  | Record<ReferencesCH, UuidsCH>
  | Record<ReferencesFR, UuidsFR>

const allReferencesToUuids: Record<Language, RefUuidPairs> = {
  'fr-FR': REFERENCES_TO_UUIDS_FR,
  'fr-CH': REFERENCES_TO_UUIDS_CH,
}

/**
 * Objet pour associer les éléments à afficher au langage sélectionné
 */
export const languages: LanguageDisplay = {
  'fr-FR': {
    short: 'FR',
    long: 'français',
    country: 'France',
  },
  'fr-CH': {
    short: 'CH',
    long: 'suisse',
    country: 'Suisse',
  },
}

/**
 * Retourne le drapeau correspondant à une langue (symbole alpha ISO du pays)
 * @param country langue sélectionnée
 * @returns le chemin vers le drapeau correspondant à une langue
 */
export const buildLangIconPath = (country: string): string => {
  if (country.length !== 2) {
    throw new Error(
      `ISO country name "${country}" should have exactly two characters.`,
    )
  } else {
    return `assets/svg/flags/${country.toLowerCase()}.svg`
  }
}

/**
 * Recherche dans le référentiel de la langue sélectionnée si un UUID existe.
 * - si oui, on renvoie la référence correspondante
 * - si non, on renvoie la référence française
 * - si aucune correspondance n'est trouvée, on renvoie une chaîne vide.
 * @param uuid uuid à cherche
 * @param locale langue sélectionnée sur le site
 * @returns la référence correspondant à l'UUID dans le référentiel local/français
 */
export const uuidToLocaleRef = (
  uuid: string,
  locale: Language = 'fr-FR',
): string => {
  let reference = ''
  if (locale !== 'fr-FR') {
    // on regarde si la référence existe dans le référentiel local
    const values = Object.fromEntries(
      Object.entries(allReferencesToUuids[locale]).map(([k, v]) => [v, k]),
    )
    reference = values[uuid] // undefined si la référence n'existe pas
  }
  if (reference === undefined || locale === 'fr-FR') {
    // la recherche précédente n'a rien donné : on cherche dans le référentiel français
    const values = Object.fromEntries(
      Object.entries(allReferencesToUuids['fr-FR']).map(([k, v]) => [v, k]),
    )
    reference = values[uuid]
  }
  return reference || ''
}
