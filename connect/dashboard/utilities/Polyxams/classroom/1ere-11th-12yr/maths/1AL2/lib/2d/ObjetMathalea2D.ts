export class ObjetMathalea2D {
  [x: string]: any
  positionLabel: string
  color: [string, string]
  style: string
  epaisseur: number
  opacite: number
  id: number | string
  pointilles: number
  bordures: [number, number, number, number]
  objets?: ObjetMathalea2D[]
  typeObjet?: string
  private static _nextId = 0

  constructor() {
    this.positionLabel = 'above'
    // Valeur par défaut simple (évite d'importer colorToLatexOrHTML ici)
    this.color = ['black', '{black}']
    this.style = ''
    this.epaisseur = 1
    this.opacite = 1
    this.pointilles = 0
    this.id = ObjetMathalea2D._nextId++
    this.bordures = [NaN, NaN, NaN, NaN]
  }

  svg(..._args: any[]): string | any {
    return ''
  }

  tikz(..._args: any[]): string | any {
    return ''
  }
}
