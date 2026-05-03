/**
 * @class
 * Crée un objet qui contient les propriétés suivantes : degres, cos, sin, tan et radians.
 */

export class Angle {
  /**
   * @constructor
   * @param {object} param
   * @param {string} [param.degres] mesure de l'angle en degrés sous forme de string
   * @param {string} [param.cos] valeur du cosinus sous forme de string
   * @param {string} [param.sin] valeur du sinus sous forme de string
   * @param {string} [param.tan] valeur de la tangente sous forme de string
   * @param {string} [param.radians] mesure de l'angle en radians sous forme de string
   * @example const a = new Angle({ degres: '90', radians: '\\dfrac{5\\pi}{2}' }) => {degres: '90', cos: '0', sin: '1', tan: '\\infin', radians: '\\dfrac{5\\pi}{2}'}
   * @author Jean-claude Lhote
   */
  degres: string
  cos: string | string[]
  sin: string | string[]
  tan: string | string[]
  radians: string

  constructor({
    degres,
    cos = undefined,
    sin = undefined,
    tan = undefined,
    radians = undefined,
  }: {
    degres: string
    cos?: string | string[]
    sin?: string | string[]
    tan?: string | string[]
    radians?: string
  }) {
    // il faut au moins fournir la mesure en degrés
    this.degres = degres
    const anglesDeBase = [
      {
        degres: '90',
        cos: '0',
        sin: '1',
        tan: '\\infin',
        radians: '\\dfrac{\\pi}{2}',
      },
      {
        degres: '45',
        cos: '\\dfrac{\\sqrt{2}}{2}',
        sin: '\\dfrac{\\sqrt{2}}{2}',
        tan: '1',
        radians: '\\dfrac{\\pi}{4}',
      },
      {
        degres: '60',
        cos: ['\\dfrac{1}{2}', '0.5'],
        sin: '\\dfrac{\\sqrt{3}}{2}',
        tan: '\\sqrt{3}',
        radians: '\\dfrac{\\pi}{3}',
      },
      {
        degres: '30',
        sin: ['\\dfrac{1}{2}', '0.5'],
        cos: '\\dfrac{\\sqrt{3}}{2}',
        tan: '\\dfrac{\\sqrt{3}}{3}',
        radians: '\\dfrac{\\pi}{6}',
      },
      { degres: '0', cos: '1', sin: '0', tan: '0', radians: '0' },
    ]
    const angle = anglesDeBase.find(
      (el) => el.degres === (parseInt(degres) % 360).toString(),
    )
    if (angle === undefined) {
      // si ce n'est pas un des anglesDeBase, alors il faut les autres arguments.
      if (
        cos === undefined ||
        sin === undefined ||
        tan === undefined ||
        radians === undefined
      ) {
        window.notify(
          'Il faut fournir les valeurs du cosinus, du sinus, de la tangente et de la mesure en radians',
          { cos, sin, tan, radians },
        )
      }
      this.cos = cos ?? ''
      this.sin = sin ?? ''
      this.tan = tan ?? ''
      this.radians = radians ?? ''
    } else {
      // si l'angle en degré est fourni, on aura par défaut les valeurs de l'angle de base si les paramètres ne sont pas donnés
      this.cos = cos ?? angle.cos
      this.sin = sin ?? angle.sin
      this.tan = tan ?? angle.tan
      this.radians = radians ?? angle.radians
    }
  }
}

export const anglesDeBase = [
  new Angle({
    degres: '90',
    cos: '0',
    sin: '1',
    tan: '\\infin',
    radians: '\\dfrac{\\pi}{2}',
  }),
  new Angle({
    degres: '45',
    cos: '\\dfrac{\\sqrt{2}}{2}',
    sin: '\\dfrac{\\sqrt{2}}{2}',
    tan: '1',
    radians: '\\dfrac{\\pi}{4}',
  }),
  new Angle({
    degres: '60',
    cos: ['\\dfrac{1}{2}', '0.5'],
    sin: '\\dfrac{\\sqrt{3}}{2}',
    tan: '\\sqrt{3}',
    radians: '\\dfrac{\\pi}{3}',
  }),
  new Angle({
    degres: '30',
    sin: ['\\dfrac{1}{2}', '0.5'],
    cos: '\\dfrac{\\sqrt{3}}{2}',
    tan: '\\dfrac{\\sqrt{3}}{3}',
    radians: '\\dfrac{\\pi}{6}',
  }),
  new Angle({ degres: '0', cos: '1', sin: '0', tan: '0', radians: '0' }),
]
export function moduloDeg(angleEnDegre: string, k: number) {
  const coef = 360 / parseInt(angleEnDegre)
  if (angleEnDegre === '0') {
    return (2 * k * 180).toString()
  } else return ((coef * k + 1) * parseInt(angleEnDegre)).toString()
}

export function moduloRad(angleEnDegre: string, k: number) {
  const coef = 360 / parseInt(angleEnDegre)
  if (angleEnDegre === '0') {
    return `${2 * k}\\pi`
  } else return `\\dfrac{${coef * k + 1}\\pi}{${coef / 2}}`
}
/**
 *
 * @param {Angle} angle
 * @param {number} k On part de l'objet angle et on ajoute 2 * k * pi
 * @returns {Angle}
 */

export function angleModulo(angle: Angle, k: number) {
  return new Angle({
    degres: moduloDeg(angle.degres, k),
    cos: angle.cos,
    sin: angle.sin,
    tan: angle.tan,
    radians: moduloRad(angle.degres, k),
  })
}
/**
 * @param {object} param
 * @param {number[]} [param.modulos] liste des k à utiliser pour ajouter les angles modulo 2k*Pi
 * @returns {{liste1: string[], liste2: string[], liste3: string[]}} liste1, liste2, liste3 les listes (niveau2 contient niveau1 et niveau3 contient niveau2)
 * @author Jean-claude Lhote
 */

export function valeursTrigo({ modulos = [-1, 1] }) {
  let mesAngles = anglesDeBase.slice()
  const mesAnglesNiv1 = mesAngles.slice()
  const nombreAnglesDeBase = mesAngles.length

  // ici on complète la liste avec tous les angles associés en faisant attention de ne pas ajouter deux fois les mêmes.
  for (let i = 0; i < nombreAnglesDeBase; i++) {
    mesAngles.push(
      angleOppose(mesAngles[i]),
      angleComplementaire(mesAngles[i]),
      angleSupplementaire(mesAngles[i]),
    )
  }
  // On supprime les doublons en comparant la mesure en degrés
  mesAngles = [
    ...new Map(mesAngles.map((item) => [item.degres, item])).values(),
  ]
  const mesAnglesNiv2 = mesAngles.slice()

  for (let i = 0; i < nombreAnglesDeBase; i++) {
    for (const k of modulos) {
      if (k !== 0)
        mesAngles.push(angleModulo(mesAngles[i % nombreAnglesDeBase], k))
    }
  }
  const mesAnglesNiv3 = mesAngles.slice()
  return { liste1: mesAnglesNiv1, liste2: mesAnglesNiv2, liste3: mesAnglesNiv3 }
}

export function angleComplementaire(angle: Angle) {
  // retourne l'angle complémentaire d'un angle du premier cadrant
  return new Angle({
    degres: (90 - parseInt(angle.degres)).toString(),
    cos: angle.sin,
    sin: angle.cos,
    tan: inverseTan(angle),
    radians: complementaireRad(angle.radians),
  })
}

export function angleSupplementaire(angle: Angle) {
  // retourne l'angle supplémentaire d'un angle du premier cadrant
  return new Angle({
    degres: (180 - parseInt(angle.degres)).toString(),
    cos: angle.cos === '0' ? '0' : (opposeStringArray(angle.cos) as string),
    sin: angle.sin,
    tan: angle.tan === '\\infin' ? '\\infin' : '-' + angle.tan,
    radians: supplementaireRad(angle.radians),
  })
}
export function angleOppose(angle: Angle) {
  // retourne l'angle opposé d'un angle du premier cadrant (sinon, on pourrait avoir plusieurs signe '-' collés ensemble)
  if (angle.degres === '0') {
    return angle
  } else {
    return new Angle({
      degres: '-' + angle.degres,
      cos: angle.cos,
      sin:
        angle.sin === '0'
          ? angle.sin
          : (opposeStringArray(angle.sin) as string),
      tan: angle.tan === '0' ? angle.tan : '-' + angle.tan,
      radians: '-' + angle.radians,
    })
  }
}

export function complementaireRad(angleEnRadian: string) {
  // retourne la mesure en radians du complémentaire d'un angle du premier quadrant donné également en radians
  switch (angleEnRadian) {
    case '\\dfrac{\\pi}{4}':
      return angleEnRadian
    case '\\dfrac{\\pi}{6}':
      return '\\dfrac{\\pi}{3}'
    case '\\dfrac{\\pi}{3}':
      return '\\dfrac{\\pi}{6}'
    case '\\dfrac{\\pi}{2}':
      return '0'
    case '0':
      return '\\dfrac{\\pi}{2}'
  }
}

export function supplementaireRad(angleEnRadian: string) {
  // retourne la mesure en radians du supplémentaire d'un angle du premier quadrant donné également en radians
  switch (angleEnRadian) {
    case '\\dfrac{\\pi}{4}':
      return '\\dfrac{3\\pi}{4}'
    case '\\dfrac{\\pi}{6}':
      return '\\dfrac{5\\pi}{6}'
    case '\\dfrac{\\pi}{3}':
      return '\\dfrac{2\\pi}{3}'
    case '\\dfrac{\\pi}{2}':
      return '\\dfrac{\\pi}{2}'
    case '0':
      return '\\pi'
  }
}
export function inverseTan(angle: Angle) {
  switch (angle.tan) {
    case '\\infin':
    case '-\\infin':
      return '0'
    case '1':
      return '1'
    case '\\sqrt{3}':
      return '\\dfrac{\\sqrt{3}}{3}'
    case '\\dfrac{\\sqrt{3}}{3}':
      return '\\sqrt{3}'
  }
}

function opposeStringArray(value: string[] | string): string[] | string {
  if (Array.isArray(value)) {
    const result = []
    for (const e of value) {
      result.push('-' + e)
    }
    return result
  } else return '-' + value
}
