import { get, writable } from 'svelte/store'
import { isLanguage, type Language } from '../types/languages'
import { decrypt } from '../components/urls'
import refToUuidFR from '../../json/refToUuidFR.json'
import refToUuidCH from '../../json/refToUuidCH.json'

export const localisedIDToUuid: Record<Language, Record<string, string>> = {
  'fr-CH': { ...refToUuidCH },
  'fr-FR': { ...refToUuidFR },
}

export const referentielLocale = writable<Language>('fr-FR')

export const updateReferentielLocaleFromURL = (
  urlString = window.location.href,
) => {
  let url: URL
  try {
    url = new URL(urlString)
  } catch {
    return {}
  }
  url = decrypt(url)
  const params = url.searchParams
  const lang = params.get('lang')
  if (lang) {
    if (isLanguage(lang) && lang !== get(referentielLocale)) {
      referentielLocale.set(lang)
    }
  } else if (get(referentielLocale) !== 'fr-FR') {
    referentielLocale.set('fr-FR')
  }
}

export const updateURLFromReferentielLocale = (url: URL) => {
  const locale = get(referentielLocale)
  const params = url.searchParams
  if (locale === 'fr-FR') {
    params.delete('lang')
  } else {
    params.set('lang', locale)
  }
}

export function getLang() {
  return get(referentielLocale)
}
