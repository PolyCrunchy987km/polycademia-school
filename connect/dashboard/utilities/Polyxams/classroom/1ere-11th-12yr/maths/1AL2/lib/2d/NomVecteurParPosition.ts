import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { point } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { latex2d, texteParPosition } from './textes'
import { rotation, similitude, translation } from './transformations'
import { vecteur } from './Vecteur'

/**
 * @author Jean-Claude Lhote le 31/01/2021
 * crée un nom de vecteur avec sa petite flèche
 * l'angle formé par avec l'horizontale est à donner comme argument, par défaut c'est 0
 * la taille impactera le nom et la flèche en proportion.
 * (x,y) sont les coordonnées du centre du nom.
 */
export class NomVecteurParPosition extends ObjetMathalea2D {
  nom: string
  x: number
  y: number
  angle: number
  taille: number
  constructor(
    nom: string,
    x: number,
    y: number,
    taille = 1,
    angle = 0,
    color = 'black',
  ) {
    super()
    this.nom = nom
    this.x = x
    this.y = y
    this.color = colorToLatexOrHTML(color)
    this.angle = angle
    this.taille = taille
    // @todo créer deux objets : vecteurI et vecteurJ pour ça.
    // if (this.nom === 'i') return latex2d('\\vec \\imath', this.x, this.y, { color })
    // if (this.nom === 'j') return latex2d('\\vec \\jmath', this.x, this.y, { color })
    const t = texteParPosition(
      this.nom,
      this.x,
      this.y,
      -this.angle,
      color,
      this.taille,
      'milieu',
      true,
    )
    const M = point(this.x, this.y)
    const P = point(M.x + 0.25 * this.nom.length, M.y)
    const M0 = similitude(P, M, 90 + this.angle, 1.5)
    const M1 = rotation(translation(M0, vecteur(P, M)), M0, this.angle)
    const M2 = similitude(M1, M0, 180, 1.5)
    const s = segment(M1, M2, color)
    s.styleExtremites = '->'
    s.tailleExtremites = 3
    this.objets = [t, s]
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.tikz()
    }
    return code
  }
}

export function nomVecteurParPosition(
  nom: string,
  x: number,
  y: number,
  taille = 1,
  angle = 0,
  color = 'black',
) {
  // Katex ne reconnais pas \\vec qui est une commande définie ailleurs.
  if (nom === 'i') return latex2d('\\vec{\\imath}', x, y, { color })
  if (nom === 'j') return latex2d('\\vec{\\jmath}', x, y, { color })
  return new NomVecteurParPosition(nom, x, y, taille, angle, color)
}
