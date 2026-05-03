import { writable } from 'svelte/store'
import type { InterfaceGlobalOptions } from '../types'

/**
 * * `v`: vue
 * * `z`: zoom
 * * `title` : titre pour la vue élève uniquement
 * * `presMode` : type d'affichage pour la vue eleve uniquement (page, exos, liste, questions)
 * * `setInteractive` : uniquement pour la vue eleve (0 : pas d'interactivité, 1 : tout interactif, 2 : au choix exercice par exercice)
 * * `isSolutionAccessible` : uniquement pour la vue eleve, pour savoir si les corrections sont disponibles ou pas
 * * `isInteractiveFree` : uniquement pour la vue eleve, pour savoir si l'élève peut changer l'interactivité ou pas
 * * `oneShot` : uniquement pour la vue eleve, pour savoir si l'élève peut répondre une ou plusieurs fois en interactif.
 * * `twoColumns` : dans les vues élèves avec tous les exercices/questions sur une même page, on adopte la présentation du texte sur deux colonnes
 *
 * `globalOptions` est utilisé dans `Mathalea.updateUrl()` et dans `Mathalea.loadExercicesFromUrl()`
 * Il permet de sauvegarder le type de vue (`v=...`)
 *
 * Le paramètre `es` est utilisé pour renseigner les réglages de la vue élève :
 * une unique chaîne de caractères contient dans l'ordre : titre + mode présentation + interactivité +  accès solutions + affichage deux colonnes
 */

export const globalOptions = writable<InterfaceGlobalOptions>({
  v: undefined,
  z: '1',
  title: 'Évaluation',
  presMode: 'liste_exos',
  setInteractive: '2',
  isSolutionAccessible: true,
  isInteractiveFree: true,
  isTitleDisplayed: true,
  isReferenceDisplayed: true,
  oneShot: false,
  twoColumns: false,
  beta: false,
  lang: 'fr-FR',
})
