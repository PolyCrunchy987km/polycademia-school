import {
  addDependencies,
  create,
  detDependencies,
  divideDependencies,
  fractionDependencies,
  indexDependencies,
  invDependencies,
  matrixDependencies,
  multiplyDependencies,
  parseDependencies,
  subsetDependencies,
  transposeDependencies,
  zerosDependencies,
} from 'mathjs'

import { rangeMinMax } from '../outils/nombres'

const config = {
  epsilon: 1e-12,
  matrix: 'Array',
  number: 'Fraction',
  precision: 64,
  predictable: false,
  randomSeed: null,
  legacySubset: true,
}

const math = create(
  {
    addDependencies,
    detDependencies,
    divideDependencies,
    indexDependencies,
    invDependencies,
    matrixDependencies,
    multiplyDependencies,
    parseDependencies,
    subsetDependencies,
    transposeDependencies,
    zerosDependencies,
    fractionDependencies,
  },
  config,
)

/**
 *
 * Classe MatriceCarree
 *  Cette classe a été crée à une époque où nous n'utilisions pas encore la librairie mathjs !
 *  Vous avez le choix d'utiliser ce code ou d'utiliser mathjs et toutes ses possibilités de calcul matriciel
 * Générateur de Matrice :
 * Si l'argument est un nombre, alors on s'en sert pour définir la taille de la matrice carrée qu'on rempli de zéros.
 * Sinon, c'est le tableau qui sert à remplir la Matrice
 * // Créer une matrice
 * const A = new Matrice([
 *   [2, 3],
 *  [1, 4],
 * ])
 *
 * console.log('A =', A._data)
 * console.log('det(A) =', A.determinant())
 * const B = A.inverse()
 * console.log('A⁻¹ =', B._data)
 * const C = A.multiply(B)
 * console.log('A × A⁻¹ =', C._data)
 * // Affichage LaTeX (par exemple pour KaTeX ou MathJax)
 * console.log('LaTeX de A :', A.toTex())
 * console.log('Déterminant LaTeX :', A.texDet())
 *
 * Refactoring par Mickael Guironnet 10/2025 pour éviter de charger tout MATHJS
 *  @author Jean-Claude Lhote & Mickael Guironnet
 */
export class Matrice {
  constructor(table) {
    this._data = Array.isArray(table)
      ? table
      : math.zeros(table, table).valueOf()
    this.dim = this._data.length
  }

  determinant() {
    return math.det(this._data)
  }

  inverse() {
    return math.det(this._data) !== 0
      ? matrice(math.inv(this._data))
      : new Matrice(math.zeros(this.dim, this.dim).valueOf())
  }

  /**
   * Extraction d'une sous-matrice ou un element
   * @param {Array|number} lignes indices de lignes à garder
   * @param {Array|number} colonnes indices de colonnes à garder
   */
  subset(lignes, colonnes) {
    const sub = math.subset(this._data, math.index(lignes, colonnes))
    return typeof sub === 'number' ? sub : matrice(sub)
  }

  // ✅ Récupérer un élément spécifique
  getValue(i, j) {
    return math.subset(this._data, math.index(i, j))
  }

  transpose() {
    return matrice(math.transpose(this._data))
  }

  multiply(v) {
    // On récupère toujours les données réelles
    const vData = v._data ?? v // si v._data existe, on l'utilise, sinon v lui-même

    const produit = math.multiply(this._data, vData)

    // Si le résultat n'est pas une matrice (ex: scalaire), on retourne tel quel
    if (!Array.isArray(produit)) return produit

    // Sinon on retourne une nouvelle instance de Matrice
    return matrice(produit)
  }

  add(m) {
    return matrice(math.add(this._data, m))
  }

  divide(k) {
    return matrice(math.divide(this._data, k))
  }

  toTex() {
    return math.parse(this.toString()).toTex().replaceAll('bmatrix', 'pmatrix')
  }

  toArray() {
    return this._data
  }

  // Retourne la matrice sous forme de chaîne mathjs-compatible
  toString() {
    return (
      '[' + this._data.map((row) => '[' + row.join(',') + ']').join(',') + ']'
    )
  }

  texDet() {
    let content = ''
    for (let arrIndex = 0; arrIndex < this._data.length; arrIndex++) {
      content += `${this._data[arrIndex].join(' & ')}`
      if (arrIndex < this._data.length - 1) content += '\\\\'
    }
    return `\\begin{vmatrix}\n${content}\n\\end{vmatrix}`
  }

  reduite(l, c) {
    const lignes = rangeMinMax(0, this.dim - 1, l)
    const colonnes = rangeMinMax(0, this.dim - 1, c)
    return matrice(math.subset(this._data, math.index(lignes, colonnes)))
  }
}

export function matrice(table) {
  if (Array.isArray(table) || typeof table === 'number') {
    return new Matrice(table)
  } else if (table._data != null) {
    return new Matrice(table._data)
  }
  // on doit jamais arriver ici normalement
  throw new Error('Invalid argument for matrice()')
}
