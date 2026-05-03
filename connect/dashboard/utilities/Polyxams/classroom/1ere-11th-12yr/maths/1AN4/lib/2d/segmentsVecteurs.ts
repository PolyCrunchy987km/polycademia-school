import { context } from '../../modules/context'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import MainLevee from './MainLevee'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { point, PointAbstrait } from './PointAbstrait'
import {
  angleOriente,
  estSecant as estSecantUtil,
} from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Rotation d'un point M autour d'un centre O d'un angle en degrés
 */
function rotationPoint(
  M: PointAbstrait,
  O: PointAbstrait,
  angleDeg: number,
): PointAbstrait {
  const angleRad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  const dx = M.x - O.x
  const dy = M.y - O.y
  return point(O.x + dx * cos - dy * sin, O.y + dx * sin + dy * cos)
}

/**
 * Similitude : rotation + homothétie
 * Point M' = O + k * rotation(M - O, angle)
 */
function similitudePoint(
  centre: PointAbstrait,
  M: PointAbstrait,
  angleDeg: number,
  rapport: number,
): PointAbstrait {
  const angleRad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  const dx = M.x - centre.x
  const dy = M.y - centre.y
  return point(
    centre.x + rapport * (dx * cos - dy * sin),
    centre.y + rapport * (dx * sin + dy * cos),
  )
}

/**
 * s = segment(A, B) //Segment d'extrémités A et B
 * s = segment(A,B,'blue') //Segment d'extrémités A et B et de couleur bleue
 * s = segment(x1,y1,x2,y2) //Segment défini par les coordonnées des deux extrémités
 * s = segment(x1,y1,x2,y2,'blue') //Segment défini par les coordonnées des deux extrémités et de couleur bleue
 * @class
 * @author Rémi Angot
 */
export class Segment extends ObjetMathalea2D {
  tailleExtremites: number
  styleExtremites: string
  angleAvecHorizontale: number
  x1: number
  y1: number
  x2: number
  y2: number
  extremite1: PointAbstrait
  extremite2: PointAbstrait
  longueur: number

  // Surcharges
  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    color?: string,
    styleExtremites?: string,
  )
  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color?: string,
    styleExtremites?: string,
  )
  constructor(
    a: number | PointAbstrait,
    b: number | PointAbstrait,
    colorOrX2?: string | number,
    styleOrY2?: string | number,
    color?: string,
    styleExtremites?: string,
  ) {
    super()
    this.bordures = [0, 0, 0, 0]
    this.typeObjet = 'segment'
    this.tailleExtremites = 4

    const isPoint = (v: unknown): v is PointAbstrait =>
      v instanceof PointAbstrait

    if (isPoint(a) && isPoint(b)) {
      // Construction par deux points (A, B, color?, styleExtremites?)
      this.x1 = a.x
      this.y1 = a.y
      this.x2 = b.x
      this.y2 = b.y
      this.color = colorToLatexOrHTML(
        typeof colorOrX2 === 'string' ? colorOrX2 : 'black',
      )
      this.styleExtremites = typeof styleOrY2 === 'string' ? styleOrY2 : ''
    } else if (
      typeof a === 'number' &&
      typeof b === 'number' &&
      typeof colorOrX2 === 'number' &&
      typeof styleOrY2 === 'number'
    ) {
      // Construction par coordonnées (x1, y1, x2, y2, color?, styleExtremites?)
      if (
        Number.isNaN(a) ||
        Number.isNaN(b) ||
        Number.isNaN(colorOrX2) ||
        Number.isNaN(styleOrY2)
      ) {
        window.notify(
          'Segment : (attendus : x1, y1, x2, y2 et "couleur") les arguments ne sont pas des nombres valides',
          { a, b, colorOrX2, styleOrY2 },
        )
        this.x1 = 0
        this.y1 = 0
        this.x2 = 0
        this.y2 = 0
        this.color = colorToLatexOrHTML('black')
        this.styleExtremites = ''
      } else {
        this.x1 = a
        this.y1 = b
        this.x2 = colorOrX2
        this.y2 = styleOrY2
        this.color = colorToLatexOrHTML(color || 'black')
        this.styleExtremites = styleExtremites || ''
      }
    } else {
      // Cas invalide
      window.notify(
        'Segment : utilisez (A, B, color?, style?) ou (x1, y1, x2, y2, color?, style?)',
        { a, b, colorOrX2, styleOrY2 },
      )
      this.x1 = 0
      this.y1 = 0
      this.x2 = 0
      this.y2 = 0
      this.color = colorToLatexOrHTML('black')
      this.styleExtremites = ''
    }

    this.x1 = Number(this.x1.toFixed(2))
    this.y1 = Number(this.y1.toFixed(2))
    this.x2 = Number(this.x2.toFixed(2))
    this.y2 = Number(this.y2.toFixed(2))

    this.epaisseur = 1
    this.opacite = 1
    this.pointilles = 0

    this.bordures = [
      Number(Math.min(this.x1, this.x2)),
      Number(Math.min(this.y1, this.y2)),
      Number(Math.max(this.x1, this.x2)),
      Number(Math.max(this.y1, this.y2)),
    ]
    this.extremite1 = point(this.x1, this.y1)
    this.extremite2 = point(this.x2, this.y2)
    this.longueur = Math.sqrt(
      (this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2,
    )
    // utiliser les fonctions de calcul d'angle avec un segment de longueur nulle est une erreur ! Je blinde en retournant un angle nul
    this.angleAvecHorizontale =
      this.longueur < 1e-8
        ? 0
        : angleOriente(
            point(this.x1 + 1, this.y1),
            this.extremite1,
            this.extremite2,
            5,
          )
    if (this.longueur < 1e-8) {
      window.notify(
        "Création d'un segment de longueur nulle, les opérations géométriques peuvent être erronées",
        { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 },
      )
    }
  }

  svg(coeff: number) {
    if (this.epaisseur !== 1) {
      this.style += ` stroke-width="${this.epaisseur}" `
    }
    switch (this.pointilles) {
      case 1:
        this.style += ' stroke-dasharray="6 10" '
        break
      case 2:
        this.style += ' stroke-dasharray="6 3" '
        break
      case 3:
        this.style += ' stroke-dasharray="3 2 6 2 " '
        break
      case 4:
        this.style += ' stroke-dasharray="1 2" '
        break
      case 5:
        this.style += ' stroke-dasharray="5 5" '
        break
    }

    if (this.opacite !== 1) {
      this.style += ` stroke-opacity="${this.opacite}" `
    }
    let code = this.codeExtremitesSVG(coeff)
    const A = point(this.x1, this.y1)
    const B = point(this.x2, this.y2)

    code += `\n\t<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(coeff)}" x2="${B.xSVG(
      coeff,
    )}" y2="${B.ySVG(coeff)}" stroke="${this.color[0]}" ${this.style} />`

    if (this.styleExtremites.length > 0) {
      code = `<g id="${this.id}">${code}</g>`
    } else {
      code = code.replace('/>', `id="${this.id}" />`)
    }

    return code
  }

  tikz() {
    let optionsDraw = ''
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color =${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }
    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    switch (this.pointilles) {
      case 1:
        tableauOptions.push(' dash dot ')
        break
      case 2:
        tableauOptions.push(' densely dash dot dot ')
        break
      case 3:
        tableauOptions.push(' dash dot dot ')
        break

      case 4:
        tableauOptions.push(' dotted ')
        break
      case 5:
        tableauOptions.push(' dashed ')
        break
    }
    let arrowsOption = ''
    if (this.styleExtremites.length > 0) {
      // Map des styles
      const map: { [key: string]: string } = {
        '|': 'Bar',
        '>': 'Stealth',
        '<': 'Stealth',
      }
      // Taille des pointes
      const width = Math.max(2, Math.round(this.tailleExtremites))
      let left = ''
      let right = ''
      if (this.styleExtremites.length === 3) {
        left = map[this.styleExtremites[0]] || ''
        right = map[this.styleExtremites[2]] || ''
      } else if (this.styleExtremites.length === 2) {
        if (this.styleExtremites[0] in map) left = map[this.styleExtremites[0]]
        if (this.styleExtremites[1] in map) right = map[this.styleExtremites[1]]
      } else if (this.styleExtremites.length === 1) {
        if (this.styleExtremites[0] in map) right = map[this.styleExtremites[0]]
      }
      // Ajout des tailles personnalisées
      const leftTip = left ? `{${left}[width=${width}mm]}` : ''
      const rightTip = right ? `{${right}[width=${width}mm]}` : ''
      if (leftTip && rightTip) {
        arrowsOption = `${leftTip}-${rightTip}`
      } else if (leftTip) {
        arrowsOption = `${leftTip}-`
      } else if (rightTip) {
        arrowsOption = `-${rightTip}`
      }
      if (arrowsOption) {
        tableauOptions.push(arrowsOption)
      }
    }
    if (tableauOptions.length > 0) {
      optionsDraw = '[' + tableauOptions.join(',') + ']'
    }
    return `\\draw${optionsDraw} (${this.x1},${this.y1})--(${this.x2},${this.y2});`
  }

  svgml(coeff: number, amplitude: number) {
    const mainLevee = MainLevee.create() // mainLevee permet d'accéder aux méthodes pour créer les objets roughjs
    if (mainLevee != null) {
      const A = point(this.x1, this.y1)
      const B = point(this.x2, this.y2)
      let code = this.codeExtremitesSVG(coeff)
      code += mainLevee.line(
        A.xSVG(coeff),
        A.ySVG(coeff),
        B.xSVG(coeff),
        B.ySVG(coeff),
        {
          color: this.color[0],
          epaisseur: this.epaisseur,
          roughness: amplitude * 2,
        },
      )
      if (this.styleExtremites.length > 0) {
        code = `<g id="${this.id}">${code}</g>`
      } else {
        code = code.replace('/>', `id="${this.id}" />`)
      }
      mainLevee.destroy() // ne pas oublier de faire ça, sinon, il va trainer un svg qui ne sert à rien dans le DOM
      return code
    } else return ''
  }

  tikzml(amp: number) {
    const A = point(this.x1, this.y1)
    const B = point(this.x2, this.y2)
    let optionsDraw = ''
    const tableauOptions = []
    if (this.color[1].length > 1 && this.color[1] !== 'black') {
      tableauOptions.push(`color =${this.color[1]}`)
    }
    if (this.epaisseur !== 1) {
      tableauOptions.push(`line width = ${this.epaisseur}`)
    }

    if (this.opacite !== 1) {
      tableauOptions.push(`opacity = ${this.opacite}`)
    }
    if (this.styleExtremites.length > 1) {
      if (
        this.styleExtremites.includes('[') ||
        this.styleExtremites.includes(']')
      ) {
        tableauOptions.push('{' + this.styleExtremites + '}')
      } else {
        tableauOptions.push(this.styleExtremites)
      }
    }
    tableauOptions.push(
      `decorate,decoration={random steps, amplitude = ${amp}pt}`,
    )
    optionsDraw = '[' + tableauOptions.join(',') + ']'

    const code = `\\draw${optionsDraw} (${A.x},${A.y})--(${B.x},${B.y});`
    return code
  }

  codeExtremitesSVG(coeff: number) {
    let code = ''
    const A = point(this.x1, this.y1)
    const B = point(this.x2, this.y2)
    // On ne peut pas coder des extrémités si le segment est de longueur nulle
    if (this.longueur < 1e-8) return code // éviter les divisions par zéro
    const h = this.tailleExtremites
    if (this.styleExtremites.length > 1) {
      const fin = this.styleExtremites.slice(-1)
      if (fin === '|') {
        // si ça termine par | on le rajoute en B
        const M = pointSurSegment(B, A, h / context.pixelsParCm)
        const B1 = rotationPoint(M, B, 90)
        const B2 = rotationPoint(M, B, -90)
        code += `<line x1="${B1.xSVG(coeff)}" y1="${B1.ySVG(
          coeff,
        )}" x2="${B2.xSVG(coeff)}" y2="${B2.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
      }
      if (fin === '>') {
        // si ça termine par > on rajoute une flèche en B
        const M = pointSurSegment(B, A, h / context.pixelsParCm)
        const B1 = similitudePoint(B, M, 45, 1.1)
        const B2 = similitudePoint(B, M, -45, 1.1)
        code += `<line x1="${B.xSVG(coeff)}" y1="${B.ySVG(
          coeff,
        )}" x2="${B1.xSVG(coeff)}" y2="${B1.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
        code += `\n\t<line x1="${B.xSVG(coeff)}" y1="${B.ySVG(
          coeff,
        )}" x2="${B2.xSVG(coeff)}" y2="${B2.ySVG(coeff)}" stroke="${this.color[0]}" stroke-width="${this.epaisseur}" />`
      }
      if (fin === '<') {
        // si ça termine par < on rajoute une flèche inversée en B
        const M = pointSurSegment(B, A, -h / context.pixelsParCm)
        const B1 = similitudePoint(B, M, 45, 1.1)
        const B2 = similitudePoint(B, M, -45, 1.1)
        code += `<line x1="${B.xSVG(coeff)}" y1="${B.ySVG(
          coeff,
        )}" x2="${B1.xSVG(coeff)}" y2="${B1.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
        code += `\n\t<line x1="${B.xSVG(coeff)}" y1="${B.ySVG(
          coeff,
        )}" x2="${B2.xSVG(coeff)}" y2="${B2.ySVG(coeff)}" stroke="${this.color[0]}" stroke-width="${this.epaisseur}" />`
      }
      if (fin === '[') {
        // si ça termine par | on le rajoute en B
        const M = pointSurSegment(B, A, h / context.pixelsParCm)
        const B1 = similitudePoint(M, B, 90, 1)
        const B2 = similitudePoint(M, B, -90, 1)
        const C1 = similitudePoint(B, B1, -90, 0.3)
        const C2 = similitudePoint(B, B2, 90, 0.3)
        code += `<polyline points="${C2.xSVG(coeff)},${C2.ySVG(coeff)} ${B2.xSVG(coeff)},${B2.ySVG(coeff)} ${B1.xSVG(coeff)},${B1.ySVG(coeff)} ${C1.xSVG(coeff)},${C1.ySVG(coeff)}" fill="none" stroke="${this.color[0]}" ${this.style} id="${this.id}" stroke-width="${this.epaisseur}" />`
      }
      if (fin === ']') {
        // si ça termine par | on le rajoute en B
        const M = pointSurSegment(B, A, h / context.pixelsParCm)
        const B1 = similitudePoint(M, B, 90, 1)
        const B2 = similitudePoint(M, B, -90, 1)
        const C1 = similitudePoint(B, B1, 90, 0.3)
        const C2 = similitudePoint(B, B2, -90, 0.3)
        code += `<polyline points="${C2.xSVG(coeff)},${C2.ySVG(coeff)} ${B2.xSVG(coeff)},${B2.ySVG(coeff)} ${B1.xSVG(coeff)},${B1.ySVG(coeff)} ${C1.xSVG(coeff)},${C1.ySVG(coeff)}" fill="none" stroke="${this.color[0]}" ${this.style} id="${this.id}" stroke-width="${this.epaisseur}" />`
      }
      const debut = this.styleExtremites[0]
      if (debut === '[') {
        // si ça termine par | on le rajoute en B
        const M = pointSurSegment(A, B, h / context.pixelsParCm)
        const B1 = similitudePoint(M, A, 90, 1)
        const B2 = similitudePoint(M, A, -90, 1)
        const C1 = similitudePoint(A, B1, 90, 0.3)
        const C2 = similitudePoint(A, B2, -90, 0.3)
        code += `<polyline points="${C2.xSVG(coeff)},${C2.ySVG(coeff)} ${B2.xSVG(coeff)},${B2.ySVG(coeff)} ${B1.xSVG(coeff)},${B1.ySVG(coeff)} ${C1.xSVG(coeff)},${C1.ySVG(coeff)}" fill="none" stroke="${this.color[0]}" ${this.style} id="${this.id}" stroke-width="${this.epaisseur}" />`
      }
      if (debut === ']') {
        // si ça termine par | on le rajoute en B
        const M = pointSurSegment(A, B, h / context.pixelsParCm)
        const B1 = similitudePoint(M, A, 90, 1)
        const B2 = similitudePoint(M, A, -90, 1)
        const C1 = similitudePoint(A, B1, -90, 0.3)
        const C2 = similitudePoint(A, B2, 90, 0.3)
        code += `<polyline points="${C2.xSVG(coeff)},${C2.ySVG(coeff)} ${B2.xSVG(coeff)},${B2.ySVG(coeff)} ${B1.xSVG(coeff)},${B1.ySVG(coeff)} ${C1.xSVG(coeff)},${C1.ySVG(coeff)}" fill="none" stroke="${this.color[0]}" ${this.style} id="${this.id}" stroke-width="${this.epaisseur}" />`
      }
      if (debut === '<') {
        // si ça commence par < on rajoute une flèche en A
        const M = pointSurSegment(A, B, h / context.pixelsParCm)
        const A1 = similitudePoint(A, M, 45, 1.1)
        const A2 = similitudePoint(A, M, -45, 1.1)
        code += `<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(
          coeff,
        )}" x2="${A1.xSVG(coeff)}" y2="${A1.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
        code += `\n\t<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(
          coeff,
        )}" x2="${A2.xSVG(coeff)}" y2="${A2.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
      }
      if (debut === '>') {
        // si ça commence par > on rajoute une flèche inversée en A
        const M = pointSurSegment(A, B, -h / context.pixelsParCm)
        const A1 = similitudePoint(A, M, 45, 1.1)
        const A2 = similitudePoint(A, M, -45, 1.1)
        code += `<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(
          coeff,
        )}" x2="${A1.xSVG(coeff)}" y2="${A1.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
        code += `\n\t<line x1="${A.xSVG(coeff)}" y1="${A.ySVG(
          coeff,
        )}" x2="${A2.xSVG(coeff)}" y2="${A2.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
      }
      if (debut === '|') {
        // si ça commence par | on le rajoute en A
        const N = pointSurSegment(A, B, h / context.pixelsParCm)
        const A1 = rotationPoint(N, A, 90)
        const A2 = rotationPoint(N, A, -90)
        code += `<line x1="${A1.xSVG(coeff)}" y1="${A1.ySVG(
          coeff,
        )}" x2="${A2.xSVG(coeff)}" y2="${A2.ySVG(coeff)}" stroke="${
          this.color[0]
        }" stroke-width="${this.epaisseur}" />`
      }
    }
    return code
  }

  /**
   * Teste si un segment coupe un cercle, une droite, une demi-cercle ou un autre segment
   * @memberof Segment
   * @param {Segment | Droite | DemiDroite | Cercle} objet Objet géométrique dont on veut tester l'intersection avec le segment
   * @example s1.estSecant(d1) // Renvoie true si s1 est sécant avec d1, false sinon
   * @author Jean-claude Lhote
   * @return {boolean}
   */
  // JSDOC Validee par EE Aout 2022
  estSecant(objet: any) {
    return estSecantUtil(this, objet)
  }
}

/**
 * @param {...any} args Points ou coordonnées + couleur facultative en dernier
 * @return {Segment}
 * @example segment(A,B,'blue') // Segment [AB] de couleur bleu
 * @example segment(x1,y1,x2,y2,'#f15929') // Segment dont les extrémités sont respectivement (x1,y1) et (x2,y2), de couleur orange (#f15929)
 * @author Rémi Angot
 */
// Surcharges pour la fabrique
export function segment(
  A: PointAbstrait,
  B: PointAbstrait,
  color?: string,
  styleExtremites?: string,
): Segment
export function segment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color?: string,
  styleExtremites?: string,
): Segment
export function segment(
  a: number | PointAbstrait,
  b: number | PointAbstrait,
  colorOrX2?: string | number,
  styleOrY2?: string | number,
  color?: string,
  styleExtremites?: string,
) {
  return new Segment(
    a as any,
    b as any,
    colorOrX2 as any,
    styleOrY2 as any,
    color,
    styleExtremites,
  )
}

/**
 * @param {...args} args Points ou coordonnées
 * @param {string} color Facultatif
 * @example segmentAvecExtremites(A,B,'blue')
 * @example segmentAvecExtremites(x1,y1,x2,y2,'#f15929')
 * @author Rémi Angot
 */
export function segmentAvecExtremites(
  ...args:
    | [PointAbstrait, PointAbstrait, string?, string?]
    | [number, number, number, number, string?, string?]
) {
  const s =
    typeof args[0] === 'number' && typeof args[1] === 'number'
      ? segment(
          args[0],
          args[1],
          args[2] as number,
          args[3] as number,
          args[4] as string,
          args[5] as string,
        )
      : segment(
          args[0] as PointAbstrait,
          args[1] as PointAbstrait,
          args[2] as string,
          args[3] as string,
        )
  s.styleExtremites = '|-|'
  return s
}
