import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { shuffle } from '../outils/arrayOutils'
import { miseEnEvidence } from '../outils/embellissements'
import { ppcmListe } from '../outils/primalite'
import MonomePlusieursVariables from './MonomePlusieursVariables'

class PolynomePlusieursVariables {
  monomes: MonomePlusieursVariables[]
  coefficients: FractionEtendue[]

  constructor(monomes: MonomePlusieursVariables[] | MonomePlusieursVariables) {
    this.monomes = Array.isArray(monomes) ? monomes : [monomes]
    this.coefficients = this.monomes.map((m) => m.coefficient.simplifie())
  }

  get degre(): number {
    if (this.monomes.length === 0) return 0
    return Math.max(...this.monomes.map((m) => m.degre))
  }

  get ppcm(): number {
    return ppcmListe(this.monomes.map((m) => m.coefficient.simplifie().den))
  }

  static PolynomeNonReduit(
    monomes: MonomePlusieursVariables[],
  ): PolynomePlusieursVariables {
    return new PolynomePlusieursVariables(monomes)
  }

  static PolynomeReduit(
    monomes: MonomePlusieursVariables[],
  ): PolynomePlusieursVariables {
    const monomesNew: MonomePlusieursVariables[] = []

    monomes.forEach((monome) => ajouterMonome(monome))

    function ajouterMonome(monome: MonomePlusieursVariables): void {
      const index = monomesNew.findIndex((m) => m.estSemblable(monome))
      if (index !== -1) {
        monomesNew[index] = monomesNew[index].somme(monome)
        if (monomesNew[index].coefficient.num === 0) {
          monomesNew.splice(index, 1)
        }
      } else {
        monomesNew.push(monome)
      }
    }
    // order the monomials by decreasing degree
    monomesNew.sort((a, b) => {
      return -(a.degre - b.degre)
    })

    return new PolynomePlusieursVariables(monomesNew)
  }

  // Créer un polynome aléatoire de degré donné avec le nombre de terme donné en paramètre. Il faudrait également ajouter un paramètre pour le type de coefficient, les variables et si on veut spécifier un ou plusieurs monômes (parties littérales) particuliers qui doivent être inclus dans le polynôme
  static createRandomPolynome(
    degMin: number,
    degMax: number,
    nbTermes: number,
    typeCoeff: string,
    variables: string[],
    monomes: MonomePlusieursVariables[] = [],
    coeffMax: number = 10,
  ): PolynomePlusieursVariables {
    const monomesListe = [
      MonomePlusieursVariables.createRandomMonome(
        randint(degMin, degMax),
        typeCoeff,
        variables,
        coeffMax,
      ),
    ]
    // Add a check to make sure that all the monomials have a different literal part
    while (monomesListe.length < nbTermes) {
      if (monomes.length > monomesListe.length) {
        monomesListe.push(
          MonomePlusieursVariables.createMonomeFromPartieLitterale(
            typeCoeff,
            monomes[monomesListe.length].partieLitterale,
            coeffMax,
          ),
        )
      } else {
        let isSemblable = false
        do {
          const m = MonomePlusieursVariables.createRandomMonome(
            randint(0, degMax),
            typeCoeff,
            variables,
            coeffMax,
          )
          isSemblable = false
          // check if m is not sembable with any of the monomes in monomesListe
          for (let j = 0; j < monomesListe.length; j++) {
            if (m.estSemblable(monomesListe[j])) {
              isSemblable = true
              break
            }
          }
          if (!isSemblable) {
            monomesListe.push(m)
          }
        } while (isSemblable)
      }
    }
    shuffle(monomesListe)
    return new PolynomePlusieursVariables(monomesListe)
  }

  static createPolynomeFromMonome(
    monome: MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    return new PolynomePlusieursVariables(monome)
  }

  static createPolynomeFromRoots(
    racines: (number | FractionEtendue)[],
    coeffDominant: FractionEtendue = new FractionEtendue(1, 1),
  ): PolynomePlusieursVariables {
    let polynome = new PolynomePlusieursVariables(
      new MonomePlusieursVariables(new FractionEtendue(1, 1), {
        variables: ['x'],
        exposants: [0],
      }),
    )
    racines.forEach((racine) => {
      const polynomeSimple = new PolynomePlusieursVariables([
        new MonomePlusieursVariables(new FractionEtendue(1, 1), {
          variables: ['x'],
          exposants: [1],
        }),
        new MonomePlusieursVariables(
          new FractionEtendue(-1, 1).produitFraction(racine),
          {
            variables: ['x'],
            exposants: [0],
          },
        ),
      ])
      polynome = polynome.produit(polynomeSimple)
    })
    return polynome
      .produit(
        new MonomePlusieursVariables(coeffDominant, {
          variables: ['x'],
          exposants: [0],
        }),
      )
      .reduire()
  }

  // Ajoute un monome au PolynomePlusieursVariables, en combinant avec les monomes semblables

  // Additionne deux PolynomePlusieursVariabless ou un PolynomePlusieursVariables et un monome
  somme(
    p: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    const nouveauxMonomes = [...this.monomes]

    if (p instanceof PolynomePlusieursVariables) {
      p.monomes.forEach((monome) => nouveauxMonomes.push(monome))
    } else {
      nouveauxMonomes.push(p)
    }

    return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
  }

  oppose(): PolynomePlusieursVariables {
    const nouveauxMonomes = this.monomes.map((monome) => monome.oppose())
    return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
  }

  melangerTermes(melange: boolean): PolynomePlusieursVariables {
    if (melange) {
      let nouveauxMonomes = shuffle(this.monomes)
      if (this.monomes.length === 1) {
        return this
      } else {
        do {
          nouveauxMonomes = shuffle(this.monomes)
        } while (
          nouveauxMonomes.map((m) => m.toString()).join('') ===
          this.monomes.map((m) => m.toString()).join('')
        )
        return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
      }
    } else {
      return this
    }
  }

  toStringSansLeTerme(index: number): string {
    if (this.monomes.length === 0) return '\\ldots\\ldots'
    if (index < 0 || index >= this.monomes.length) return this.toString()

    let result = ''
    let firstPieceAdded = false

    this.monomes.forEach((monome, i) => {
      if (monome.coefficient.num === 0 && i !== index) {
        return
      }

      if (i === index) {
        // Replace this term by ellipsis
        if (!firstPieceAdded) {
          // First position
          if (monome.coefficient.signe === -1) {
            result += '-\\ldots\\ldots'
          } else {
            result += '\\ldots\\ldots'
          }
        } else {
          if (monome.coefficient.signe === 1) {
            result += ' + \\ldots\\ldots'
          } else {
            result += ' - \\ldots\\ldots'
          }
        }
        firstPieceAdded = true
        return
      }

      const monomeStr = monome.toString()
      if (!firstPieceAdded) {
        result += monomeStr
      } else {
        if (monome.coefficient.signe === 1) {
          result += ' + ' + monomeStr
        } else {
          result += ' ' + monomeStr
        }
      }
      firstPieceAdded = true
    })

    if (!firstPieceAdded) {
      // Case where only the hidden term existed
      return '\\ldots\\ldots'
    }

    return result
  }

  toStringAvecTermeEnEvidence(index: number): string {
    if (this.monomes.length === 0) return ''
    if (index < 0 || index >= this.monomes.length) return this.toString()

    let result = ''
    let firstPieceAdded = false

    this.monomes.forEach((monome, i) => {
      if (monome.coefficient.num === 0) return

      const monomeStr = monome.toString()

      if (i === index) {
        // Mettre en évidence ce terme
        if (!firstPieceAdded) {
          // Premier terme
          if (monome.coefficient.signe === -1) {
            result += '-' + miseEnEvidence(monome.oppose().toString())
          } else {
            result += miseEnEvidence(monomeStr)
          }
        } else {
          // Terme suivant
          if (monome.coefficient.signe === 1) {
            result += ' + ' + miseEnEvidence(monomeStr)
          } else {
            result += ' - ' + miseEnEvidence(monome.oppose().toString())
          }
        }
        firstPieceAdded = true
      } else {
        // Terme normal (non mis en évidence)
        if (!firstPieceAdded) {
          result += monomeStr
        } else {
          if (monome.coefficient.signe === 1) {
            result += ' + ' + monomeStr
          } else {
            result += monomeStr
          }
        }
        firstPieceAdded = true
      }
    })

    return result
  }

  // Une méthode pour déterminer si un terme est un carré
  // Pas encore terminée
  contientCarre(): boolean {
    return this.monomes.some((monome) => monome.estCarre())
  }

  // Une méthode pour déterminer la mise en facteur commun
  miseEnFacteurCommun(): MonomePlusieursVariables {
    const monomes = this.monomes
    if (monomes.length === 0) {
      return new MonomePlusieursVariables(0, { variables: [], exposants: [] })
    }

    let pgcdMonome = monomes[0]
    for (let i = 1; i < monomes.length; i++) {
      pgcdMonome = pgcdMonome.pgcd(monomes[i])
    }
    return pgcdMonome
  }

  // une méthode pour diviser un polynome par un monome
  diviserParMonome(m: MonomePlusieursVariables): PolynomePlusieursVariables {
    // un nouveau polynome dont tous les termes sont divisés par le monome
    const nouveauxMonomes = this.monomes.map((monome) => monome.diviserPar(m))
    return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
  }

  /**
   * Divise ce polynôme par un autre polynôme (division euclidienne)
   * @param diviseur - Le polynôme diviseur
   * @returns Un objet contenant le quotient et le reste de la division
   */
  diviser(diviseur: PolynomePlusieursVariables): {
    quotient: PolynomePlusieursVariables
    reste: PolynomePlusieursVariables
  } {
    const dividende = this.reduire().ordonner()
    const div = diviseur.reduire().ordonner()

    // Vérifier que le diviseur n'est pas nul
    if (
      div.monomes.length === 0 ||
      div.monomes.every((m) => m.coefficient.num === 0)
    ) {
      throw new Error('Division par un polynôme nul impossible')
    }

    // Algorithme de division euclidienne de polynômes
    let reste = dividende
    const quotientMonomes: MonomePlusieursVariables[] = []

    const degreDiv = Math.max(...div.monomes.map((m) => m.degre))
    const monomeLeadingDiv = div.monomes.find((m) => m.degre === degreDiv)!

    while (reste.monomes.length > 0) {
      const resteOrdonne = reste.reduire().ordonner()
      if (resteOrdonne.monomes.length === 0) break

      const degreReste = Math.max(...resteOrdonne.monomes.map((m) => m.degre))
      if (degreReste < degreDiv) break

      const monomeLeadingReste = resteOrdonne.monomes.find(
        (m) => m.degre === degreReste,
      )!

      // Calculer le monôme du quotient
      const monomeQuotient = monomeLeadingReste.diviserPar(monomeLeadingDiv)
      quotientMonomes.push(monomeQuotient)

      // Calculer le produit monomeQuotient * diviseur
      const produit = div.produit(monomeQuotient).reduire()

      // Soustraire ce produit du reste
      const nouveauReste = reste.difference(produit).reduire()

      reste = nouveauReste
    }

    const quotient = PolynomePlusieursVariables.PolynomeReduit(quotientMonomes)

    return { quotient, reste }
  }

  // Générer des identités remarquables sans avoir de carré dans les termes de départ

  difference(
    p: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    const nouveauxMonomes = [...this.monomes]

    if (p instanceof PolynomePlusieursVariables) {
      // Negate each monomial in the polynomial and add to nouveauxMonomes
      p.monomes.forEach((monome) => {
        const negatedMonome = monome.produit(
          new MonomePlusieursVariables(new FractionEtendue(-1, 1), {
            variables: [],
            exposants: [],
          }),
        )
        nouveauxMonomes.push(negatedMonome)
      })
    } else {
      // Negate the single monomial and add to nouveauxMonomes
      const negatedMonome = p.produit(
        new MonomePlusieursVariables(new FractionEtendue(-1, 1), {
          variables: [],
          exposants: [],
        }),
      )
      nouveauxMonomes.push(negatedMonome)
    }

    // Return the non-reduced polynomial as per the original intent
    return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
  }

  // Multiplie deux PolynomePlusieursVariabless ou un PolynomePlusieursVariables et un monome
  produit(
    p: PolynomePlusieursVariables | MonomePlusieursVariables,
  ): PolynomePlusieursVariables {
    const nouveauxMonomes: MonomePlusieursVariables[] = []

    if (p instanceof PolynomePlusieursVariables) {
      this.monomes.forEach((monome1) => {
        p.monomes.forEach((monome2) => {
          nouveauxMonomes.push(monome1.produit(monome2))
        })
      })
    } else {
      this.monomes.forEach((monome) => {
        nouveauxMonomes.push(monome.produit(p))
      })
    }
    return PolynomePlusieursVariables.PolynomeNonReduit(nouveauxMonomes)
  }

  // Réduit le PolynomePlusieursVariables en combinant les monomes semblables
  reduire(): PolynomePlusieursVariables {
    const reduit = PolynomePlusieursVariables.PolynomeReduit(this.monomes)
    return reduit
  }

  ordonner(): PolynomePlusieursVariables {
    const monomes = this.monomes
    monomes.sort((a, b) => {
      return -a.degre + b.degre
    })
    return PolynomePlusieursVariables.PolynomeNonReduit(monomes)
  }

  evaluer(valeurs: { [key: string]: FractionEtendue }): FractionEtendue {
    return this.monomes.reduce(
      (acc, monome) => acc.sommeFraction(monome.evaluer(valeurs)),
      new FractionEtendue(0, 1),
    )
  }

  /**
   * Génère un tableau LaTeX avec les évaluations du polynôme pour une liste de valeurs candidates
   * et retourne la liste des racines (valeurs pour lesquelles P(x) = 0)
   * @param candidats - Tableau de FractionEtendue à tester
   * @param variable - Nom de la variable (par défaut 'x')
   * @param nbColonnes - Nombre de colonnes dans le tableau (par défaut 3)
   * @returns Object contenant le code LaTeX du tableau et le tableau des racines
   */
  tableauEvaluations(
    candidats: FractionEtendue[],
    variable: string = 'x',
    nbColonnes: number = 3,
  ): { tableauLatex: string; racines: FractionEtendue[] } {
    const racines: FractionEtendue[] = []
    const evaluations: Array<{
      valeur: FractionEtendue
      resultat: FractionEtendue
    }> = []

    // Calculer toutes les évaluations
    for (const candidat of candidats) {
      const resultat = this.evaluer({ [variable]: candidat })
      evaluations.push({ valeur: candidat, resultat })
      if (resultat.num === 0) {
        racines.push(candidat)
      }
    }

    // Construire le tableau LaTeX sans en-tête
    const nbLignes = Math.ceil(evaluations.length / nbColonnes)
    let tableauLatex = '\\begin{array}{'

    // Colonnes alignées à gauche
    for (let i = 0; i < nbColonnes; i++) {
      tableauLatex += 'l'
      if (i < nbColonnes - 1) tableauLatex += ' '
    }
    tableauLatex += '}\n'

    // Lignes de données
    for (let ligne = 0; ligne < nbLignes; ligne++) {
      for (let col = 0; col < nbColonnes; col++) {
        const index = ligne * nbColonnes + col
        if (index < evaluations.length) {
          const { valeur, resultat } = evaluations[index]
          tableauLatex += `P\\left(${valeur.toLatex()}\\right)=${resultat.toLatex()}`
        }
        if (col < nbColonnes - 1) tableauLatex += ' & '
      }
      tableauLatex += ' \\\\\n'
    }

    tableauLatex += '\\end{array}'

    return { tableauLatex, racines }
  }

  termes(): FractionEtendue[] {
    return this.reduire().monomes.map((m) => m.coefficient.simplifie())
  }

  // should do the same as to string, but with the values of the variables replaced by the values in the object valeurs
  toStringEvaluate(valeurs: { [key: string]: FractionEtendue }): string {
    if (this.monomes.length === 0) return '0'
    let result = ''
    this.monomes.forEach((monome, index) => {
      const monomeStr = monome.toStringEvaluate(valeurs) // Gets the string representation of the monomial

      if (monome.coefficient.num === 0) {
        return // Ignore zero terms
      }
      // Handle the first term separately
      if (index === 0) {
        result += monomeStr
      } else {
        if (monome.coefficient.signe === 1) {
          result += ' + ' + monomeStr
        } else {
          result += monomeStr
        }
      }
    })

    return result
  }

  // Convertit le polynome en une chaîne de caractères
  toString(avcParentheses: boolean = false): string {
    if (this.monomes.length === 0) return '0'
    let result = ''
    this.monomes.forEach((monome, index) => {
      const monomeStr = monome.toString() // Gets the string representation of the monomial

      if (monome.coefficient.num === 0) {
        return // Ignore zero terms
      }
      // Handle the first term separately
      if (index === 0) {
        result += monomeStr
      } else {
        if (monome.coefficient.signe === 1) {
          result += ' + ' + monomeStr
        } else {
          result += monomeStr
        }
      }
    })
    if (this.monomes.length > 1 && avcParentheses) {
      result = `\\left(${result}\\right)`
    }
    return result
  }

  toStringAlgebrique(): string {
    let result = this.toString(false)
    if (this.coefficients[0].signe !== -1 && this.coefficients[0].num !== 0) {
      result = `+${result}`
    }
    return result
  }

  /**
   * Converts the polynomial to a pgfplots-compatible expression using decimal coefficients
   * Only works for single-variable polynomials in x
   * @returns A string like "2.5*x^3 - 1.333*x^2 + 4*x - 2"
   */
  toPgfplots(): string {
    if (this.monomes.length === 0) return '0'

    let result = ''
    const polyOrdonne = this.reduire().ordonner()

    polyOrdonne.monomes.forEach((monome, index) => {
      if (monome.coefficient.num === 0) return // Skip zero terms

      const coeff = monome.coefficient.valeurDecimale
      const exposantX = monome.partieLitterale.exposants[0] || 0

      // Build the term
      let term = ''

      // Handle coefficient
      if (exposantX === 0) {
        // Constant term
        term = Math.abs(coeff).toString()
      } else if (Math.abs(coeff) === 1) {
        // Coefficient is ±1
        if (exposantX === 1) {
          term = 'x'
        } else {
          term = `x^${exposantX}`
        }
      } else {
        // General case
        if (exposantX === 1) {
          term = `${Math.abs(coeff)}*x`
        } else {
          term = `${Math.abs(coeff)}*x^${exposantX}`
        }
      }

      // Handle sign
      if (index === 0) {
        // First term
        if (coeff < 0) {
          result += '-' + term
        } else {
          result += term
        }
      } else {
        // Subsequent terms
        if (coeff < 0) {
          result += ' - ' + term
        } else {
          result += ' + ' + term
        }
      }
    })

    return result
  }

  // Note : KaTeX ne permet pas d'utiliser cline, donc l'affichage ne peut pas être aussi joli que dans LaTeX

  /**
   * Convertit le polynôme en chaîne avec espacement phantom pour alignement
   * @param degreMax - Le degré maximum pour l'alignement
   * @returns Le polynôme avec espacement
   */
  private toStringAvecEspacement(degreMax: number): string {
    if (this.monomes.length === 0) return '0'

    let result = ''
    const polyOrdonne = this.reduire().ordonner()

    polyOrdonne.monomes.forEach((monome, index) => {
      if (monome.coefficient.num === 0) return

      const monomeStr = monome.toString()

      if (index === 0) {
        result += monomeStr
      } else {
        if (monome.coefficient.signe === 1) {
          result += ' + ' + monomeStr
        } else {
          result += ' ' + monomeStr
        }
      }
    })

    return result
  }

  /**
   * Affiche la division euclidienne de ce polynôme par un diviseur
   * Utilise \polylongdiv pour LaTeX, ou un affichage manuel pour HTML
   * @param diviseur - Le polynôme diviseur
   * @returns Le code LaTeX de la division
   */
  afficherDivision(diviseur: PolynomePlusieursVariables): string {
    // Si le contexte est LaTeX, utiliser la commande \polylongdiv
    if (!context.isHtml) {
      const dividendeStr = this.toString().replace(/\\dfrac/g, '\\frac')
      const diviseurStr = diviseur.toString().replace(/\\dfrac/g, '\\frac')
      return `\\polylongdiv[style=D]{${dividendeStr}}{${diviseurStr}}`
    }

    // Pour HTML, construire l'affichage manuel avec un tableau LaTeX
    // D'abord, effectuer la division pour obtenir le quotient
    const dividende = this.reduire().ordonner()
    const div = diviseur.reduire().ordonner()

    // Vérifier que le diviseur n'est pas nul
    if (
      div.monomes.length === 0 ||
      div.monomes.every((m) => m.coefficient.num === 0)
    ) {
      return 'Division par zéro impossible'
    }

    // Algorithme de division euclidienne de polynômes
    let reste = dividende
    const quotientMonomes: MonomePlusieursVariables[] = []
    const etapes: Array<{
      quotientPartiel: MonomePlusieursVariables
      produit: PolynomePlusieursVariables
      nouveauReste: PolynomePlusieursVariables
    }> = []

    const degreDiv = Math.max(...div.monomes.map((m) => m.degre))
    const monomeLeadingDiv = div.monomes.find((m) => m.degre === degreDiv)!

    while (reste.monomes.length > 0) {
      const resteOrdonne = reste.reduire().ordonner()
      if (resteOrdonne.monomes.length === 0) break

      const degreReste = Math.max(...resteOrdonne.monomes.map((m) => m.degre))
      if (degreReste < degreDiv) break

      const monomeLeadingReste = resteOrdonne.monomes.find(
        (m) => m.degre === degreReste,
      )!

      // Calculer le monôme du quotient
      const monomeQuotient = monomeLeadingReste.diviserPar(monomeLeadingDiv)
      quotientMonomes.push(monomeQuotient)

      // Calculer le produit monomeQuotient * diviseur
      const produit = div.produit(monomeQuotient).reduire()

      // Soustraire ce produit du reste
      const nouveauReste = reste.difference(produit).reduire()

      etapes.push({
        quotientPartiel: monomeQuotient,
        produit,
        nouveauReste,
      })

      reste = nouveauReste
    }

    const quotient = PolynomePlusieursVariables.PolynomeReduit(quotientMonomes)

    // Déterminer le degré maximum pour l'alignement
    const degreMax = Math.max(...dividende.monomes.map((m) => m.degre))

    // Construire l'affichage LaTeX style phantom (like HPC100)
    let texte = `$\\begin{array}{r|l}`

    // Première ligne: dividende et diviseur
    texte += `${dividende.toStringAvecEspacement(degreMax)} & ${div.toString()}\\\\`

    // Construire les phantoms progressifs
    let phantomAccumule = ''

    // Déterminer la longueur de l'overline (max entre diviseur et quotient)
    const diviseurStr = div.toString()
    const quotientStr = quotient.toString()
    // Compare visual lengths and pad the shorter one
    let overlineContent = quotientStr
    // Simple heuristic: if quotient appears shorter, pad it to match divisor width
    if (quotientStr.length < diviseurStr.length) {
      overlineContent = `${quotientStr}\\phantom{\\qquad}`
    }

    // Pour chaque étape de division
    etapes.forEach((etape, index) => {
      // Ligne de soustraction avec underline
      const produitAvecEspacement =
        etape.produit.toStringAvecEspacement(degreMax)

      if (index === 0) {
        texte += `${phantomAccumule}\\underline{-(${produitAvecEspacement})} & \\overline{${overlineContent}}\\\\`
      } else {
        texte += `${phantomAccumule}\\underline{-(${produitAvecEspacement})} & \\\\`
      }

      // Ligne du reste
      const resteNonNul =
        etape.nouveauReste.monomes.length > 0 &&
        !etape.nouveauReste.monomes.every((m) => m.coefficient.num === 0)

      if (index === etapes.length - 1) {
        // Dernière étape - toujours afficher le reste (ou 0)
        if (resteNonNul) {
          const resteStr = etape.nouveauReste.toStringAvecEspacement(degreMax)
          texte += `${phantomAccumule}\\phantom{-(}${resteStr} & \\\\`
        } else {
          // Division exacte - afficher 0
          texte += `${phantomAccumule}\\phantom{-(}0 & \\\\`
        }
      } else if (resteNonNul) {
        // Pas la dernière étape - afficher le reste
        const resteStr = etape.nouveauReste.toStringAvecEspacement(degreMax)
        texte += `${phantomAccumule}\\phantom{-(}${resteStr} & \\\\`

        // Accumuler phantom pour la prochaine ligne basé sur le premier terme du produit
        if (etape.produit.monomes.length > 0) {
          const premierMonome = etape.produit.monomes[0]
          phantomAccumule += `\\phantom{-(${premierMonome.toString()})}`
        }
      }
    })

    texte += `\\end{array}$`

    return texte
  }
}

export default PolynomePlusieursVariables
