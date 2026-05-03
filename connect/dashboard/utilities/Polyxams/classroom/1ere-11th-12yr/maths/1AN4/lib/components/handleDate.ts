/**
 * En théorie, indique si moins d'un mois s'est écoulé depuis la date passée
 * en paramètre et aujourd'hui.
 * /!\ ATTENTION : En réalité, la fonction est bancale car elle présuppose une type de chaîne pour désigner la date : YYYY/MM/DD
 * On lui préfèrera `isLessThanAMonth` de `lib\types\dates.ts`
 * @param dateString chaine représentant la date
 * @returns `true` si aujourd'hui - date < un mois
 */
export function isRecent(dateString: string) {
  if (dateString === undefined) return false
  const [jour, mois, annee] = dateString.split('/').map((s) => parseInt(s))
  const date = new Date(annee, mois - 1, jour)
  const elapsedTime = Date.now() - date.getTime()
  const unMois = 3600 * 24 * 30 * 1000
  return elapsedTime < unMois
}

export const monthes = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]
