import type { VueType } from '../VueType'

export const ALLOWED_LANGUAGES = ['fr-FR', 'fr-CH'] as const
export type Language = (typeof ALLOWED_LANGUAGES)[number]
export type LanguageDisplay = Record<
  Language,
  { short: string; long: string; country: string }
>
export const isLanguage = (obj: unknown): obj is Language =>
  obj !== null &&
  typeof obj === 'string' &&
  ALLOWED_LANGUAGES.includes(obj as Language)
export const VUES_WITH_LANG_STATUS_ONLY: VueType[] = [
  'confeleve',
  'amc',
  'anki',
  'can',
  'diaporama',
  'eleve',
  'latex',
  'moodle',
]
