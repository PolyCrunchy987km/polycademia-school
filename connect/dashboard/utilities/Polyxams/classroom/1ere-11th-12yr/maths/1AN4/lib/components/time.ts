/**
 * Retourne une chaîne formattée pour afficher une durée en (XXh XXmin XXs)
 * @param {number} nbOfSeconds durée en secondes
 * @return {string} durée en h min s
 */
export function formattedTimeStamp(nbOfSeconds: number): string {
  const nbOfHours = Math.floor(nbOfSeconds / 3600)
  const nbOfMinutes = Math.floor((nbOfSeconds - nbOfHours * 3600) / 60)
  const nbOfSecondsLeft = nbOfSeconds - nbOfHours * 3600 - nbOfMinutes * 60
  if (nbOfHours > 0) {
    return `${nbOfHours}h ${nbOfMinutes}min ${nbOfSecondsLeft}s`
  } else {
    if (nbOfMinutes > 0) {
      if (nbOfSecondsLeft === 0) {
        return `${nbOfMinutes}min`
      } else {
        return `${nbOfMinutes}min ${nbOfSecondsLeft}s`
      }
    } else {
      return `${nbOfSecondsLeft}s`
    }
  }
}

/**
 * Gestion du message dans le modal de réglage de la durée de projection
 * @param duree valeur de la durée en secondes retournée par le curseur
 */
export function setPhraseDuree(duree: number) {
  if (duree >= 2) return duree + ' secondes'
  else if (duree === 0) return 'Défilement manuel'
  else return duree + ' seconde'
}

/**
 * Fabriquer une chaîne de caractères unique basée sur un time stamp.
 * @param {string} prefix Préfixe à ajouter devant la chaîne de caractères unique (vide par défaut)
 * @returns {string} La chaîne de caractère unique
 * @author sylvain
 */
export function getUniqueStringBasedOnTimeStamp(prefix: string = '') {
  // /!\ ATTENTION new Date().getTime() est en ms et n'est pas assez précis pour donner des chaînes uniques
  // Mais utiliser Math.random peut interférer avec d'autres usages de Math.random dans l'application et gêner la génération de valeurs aléatoires reproductibles
  const timeStamp = String(new Date().getTime())
  // const timeStamp = String(
  //   performance.now().toString().replace('.', '') + Math.random(),
  // ).replace('.', '')
  return `${prefix}${timeStamp}`
}

/**
 * Permet de retarder l'appel d'une fonction. Utiliser pour les frappes au clavier par exemple
 * pour ne pas activer la recherche immédiatement après qu'un caractère ait été saisi.
 * @see https://stackoverflow.com/a/72207078/6625987
 * @param callback fonction à appeler lorsque le délai est passé
 * @param delay délais (en millisecondes)
 * @param immediate flag pour court-circuiter le délai
 * @returns {void}
 */
export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 20,
  immediate: boolean = false,
) {
  let timeout: ReturnType<typeof setTimeout> | null

  return function <U>(this: U, ...args: Parameters<typeof callback>) {
    const later = () => {
      timeout = null

      if (!immediate) {
        callback.apply(this, args)
      }
    }
    const callNow = immediate && !timeout

    if (typeof timeout === 'number') {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, delay)

    if (callNow) {
      callback.apply(this, args)
    }
  }
}

/**
 * Compte à rebours
 * @param time {number} le temps à décompter en ms
 * @returns promise
 */
export function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

/**
 * Calcule le nombre de minnutes et de secondes dans une durée donnée en millisecondes
 * et renvoie ces deux nombres dans un objet.
 * @param milliseconds durée en millisecondes
 * @returns un objet constitué du nombre de minutes et du nombre de secondes
 */
export function millisecondToMinSec(milliseconds: number): {
  minutes: number
  seconds: number
} {
  const seconds = Math.floor((milliseconds / 1000) % 60)
  const minutes = Math.floor((milliseconds / 1000 / 60) % 60)
  return { minutes, seconds }
}
