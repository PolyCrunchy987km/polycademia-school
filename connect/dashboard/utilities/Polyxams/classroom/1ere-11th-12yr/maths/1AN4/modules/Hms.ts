/**
 * Classe pour gérer les durées au format HMS (Heures, Minutes, Secondes)
 * @author Rémi Angot
 * @example const time = new Hms({hour: 2, minute: 5, second: 30})
 * @example const time = Hms.fromString('2 h 5 min 30 s')
 * @example const time = Hms.fromString('5min')
 * @example const time = Hms.fromString('14000s')
 * time.normalize().toString() // 3 h 53 min 20 s
 *
 */
class Hms {
  week: number
  day: number
  hour: number
  minute: number
  second: number
  sign: '' | '+' | '-'
  constructor({
    week = 0,
    day = 0,
    hour = 0,
    minute = 0,
    second = 0,
    sign = '',
  }: {
    week?: number
    day?: number
    hour?: number
    minute?: number
    second?: number
    sign?: '+' | '-' | ''
  } = {}) {
    this.week = week
    this.day = day
    this.hour = hour
    this.minute = minute
    this.second = second
    this.sign = sign
  }

  static fromString(text: string): Hms {
    const hms = new Hms()
    text = text.replaceAll(' ', '')
    text = text.replaceAll('&nbsp;', '')
    text = text.replaceAll('{\\:\\text{semaines}\\:}', 'semaines')
    text = text.replaceAll('\\text{semaines}', 'semaines')
    text = text.replaceAll('{\\:\\text{j}\\:}', 'j')
    text = text.replaceAll('\\text{j}', 'j')
    text = text.replaceAll('{\\:\\text{h}\\:}', 'h')
    text = text.replaceAll('\\text{h}', 'h')
    text = text.replaceAll('{\\:\\text{min}\\:}', 'min')
    text = text.replaceAll('\\text{min}', 'min')
    text = text.replaceAll('{\\:\\text{s}\\:}', 's')
    text = text.replaceAll('\\text{s}', 's')
    text = text.replaceAll('sem', 'semaines')
    // Format avec semaines et jours
    const regexComplete =
      /(?:(?<sign>[+,-]))?(?:(?<week>\d+)\s*semaines\s*)?(?:(?<day>\d+)\s*j\s*)?(?:(?<hour>\d+)\s*h\s*)?(?:(?<minute>\d+)\s*min\s*)?(?:(?<second>\d+)\s*s)?/gm
    for (const match of text.matchAll(regexComplete)) {
      if (match.groups !== undefined) {
        if (Number.isInteger(parseInt(match.groups.week)))
          hms.week = parseInt(match.groups.week)
        if (Number.isInteger(parseInt(match.groups.day)))
          hms.day = parseInt(match.groups.day)
        if (Number.isInteger(parseInt(match.groups.hour)))
          hms.hour = parseInt(match.groups.hour)
        if (Number.isInteger(parseInt(match.groups.minute)))
          hms.minute = parseInt(match.groups.minute)
        if (Number.isInteger(parseInt(match.groups.second)))
          hms.second = parseInt(match.groups.second)
        if (match.groups.sign === '+' || match.groups.sign === '-')
          hms.sign = match.groups.sign
      }
    }
    if (text.includes('min') && !text.endsWith('s')) {
      // Format sans le s pour les secondes 4min33, 5h3min15
      const regex =
        /(?:(?<sign>[+,-]))?(?:(?<week>\d+)\s*semaines\s*)?(?:(?<day>\d+)\s*j\s*)?(?:(?<hour>\d+)\s*h\s*)?(?:(?<minute>\d+)\s*min\s*)?(?:(?<second>\d+))?/gm
      for (const match of text.matchAll(regex)) {
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.week))
        )
          hms.week = parseInt(match.groups.week)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.day))
        )
          hms.day = parseInt(match.groups.day)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.hour))
        )
          hms.hour = parseInt(match.groups.hour)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.minute))
        )
          hms.minute = parseInt(match.groups.minute)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.second))
        )
          hms.second = parseInt(match.groups.second)
        if (
          match.groups !== undefined &&
          (match.groups.sign === '+' || match.groups.sign === '-')
        )
          hms.sign = match.groups.sign
      }
    } else if (
      text.includes('h') &&
      !text.includes('min') &&
      !text.endsWith('s')
    ) {
      // Format sans le min pour les minutes 5h13
      const regex =
        /(?:(?<sign>[+,-]))?(?:(?<week>\d+)\s*semaines\s*)?(?:(?<day>\d+)\s*j\s*)?(?:(?<hour>\d+)\s*h\s*)?(?:(?<minute>\d+))?/gm
      for (const match of text.matchAll(regex)) {
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.week))
        )
          hms.week = parseInt(match.groups.week)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.day))
        )
          hms.day = parseInt(match.groups.day)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.hour))
        )
          hms.hour = parseInt(match.groups.hour)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.minute))
        )
          hms.minute = parseInt(match.groups.minute)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.second))
        )
          hms.second = parseInt(match.groups.second)
        if (
          match.groups !== undefined &&
          (match.groups.sign === '+' || match.groups.sign === '-')
        )
          hms.sign = match.groups.sign
      }
    } else {
      // Format HMS classique
      const regex =
        /(?:(?<sign>[+,-]))?(?:(?<week>\d+)\s*semaines\s*)?(?:(?<day>\d+)\s*j\s*)?(?:(?<hour>\d+)\s*h\s*)?(?:(?<minute>\d+)\s*min\s*)?(?:(?<second>\d+)\s*s)?/gm
      for (const match of text.matchAll(regex)) {
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.week))
        )
          hms.week = parseInt(match.groups.week)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.day))
        )
          hms.day = parseInt(match.groups.day)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.hour))
        )
          hms.hour = parseInt(match.groups.hour)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.minute))
        )
          hms.minute = parseInt(match.groups.minute)
        if (
          match.groups !== undefined &&
          Number.isInteger(parseInt(match.groups.second))
        )
          hms.second = parseInt(match.groups.second)
        if (
          match.groups !== undefined &&
          (match.groups.sign === '+' || match.groups.sign === '-')
        )
          hms.sign = match.groups.sign
      }
    }
    return hms
  }

  toString(): string {
    let result = ''
    if (this.week > 0) {
      result += `${this.week} semaines `
      if (this.day > 0 || this.hour > 0 || this.minute > 0 || this.second > 0)
        result += ' '
    }
    if (this.day > 0) {
      result += `${this.day} jours `
      if (this.hour > 0 || this.minute > 0 || this.second > 0) result += ' '
    }
    if (this.hour > 0) {
      if (this.hour % 24 === 0) {
        result += '0 h'
      } else {
        result += `${this.hour} h`
      }
      if (this.minute > 0 || this.second > 0) result += ' '
    }
    if (this.minute > 0) {
      result += this.minute > 9 ? `${this.minute} min` : `0${this.minute} min`
      if (this.second > 0) result += ' '
    }
    if (this.second > 0) result += `${this.second} s`
    return result
  }

  /** Sortie string sans la dernière unité si elle n'est pas seule
   * Exemples : 4 h 12 ou 2 min 54
   */
  toString2(): string {
    if (this.hour > 0 && this.second === 0)
      return this.toString().replace(' min', '')
    else if (this.minute > 0) return this.toString().replace(' s', '')
    else return this.toString()
  }

  isGreaterThan(time: Hms): boolean {
    return this.toSeconds() > time.toSeconds()
  }

  /** Durées identiques */
  isEqual(time: Hms): boolean {
    return this.toSeconds() === time.toSeconds()
  }

  /** Durées identiques et écrites de la même manière
   * 1 min et 60 s => false
   */
  isTheSame(time: Hms): boolean {
    return (
      this.week === time.week &&
      this.day === time.day &&
      this.hour === time.hour &&
      this.minute === time.minute &&
      this.second === time.second
    )
  }

  /**
   * Durée identiques
   */
  isEquivalentToString(text: string): boolean {
    return Hms.fromString(text).toSeconds() === this.toSeconds()
  }

  toSecondsString(): string {
    return `${this.toSeconds()} s`
  }

  toSeconds(): number {
    return (
      this.week * 604800 +
      this.day * 86400 +
      this.hour * 3600 +
      this.minute * 60 +
      this.second
    )
  }

  /**
   * Normalise l'écriture au format HMS. Les secondes et les minutes seront inférieures à 60
   */
  normalize(): Hms {
    this.minute += Math.floor(this.second / 60)
    this.second = this.second % 60
    this.hour += Math.floor(this.minute / 60)
    this.minute = this.minute % 60
    return this
  }

  add(time: Hms): Hms {
    const result = new Hms()
    result.second = this.toSeconds() + time.toSeconds()
    result.normalize()
    return result
  }

  /**
   * Renvoie la valeur absolue de la différence des temps au format HMS
   * @param time HMS
   * @returns HMS
   */
  substract(time: Hms): Hms {
    const result = new Hms()
    result.second = Math.abs(this.toSeconds() - time.toSeconds())
    result.normalize()
    return result
  }
}

export default Hms
