import type Decimal from 'decimal.js'
import FractionEtendue, { rationnalise } from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { pgcd } from '../outils/primalite'

type numberOrFraction = number | FractionEtendue | Decimal

type partieLitterale = {
  variables: string[]
  exposants: number[]
}

class MonomePlusieursVariables {
  coefficient: FractionEtendue
  partieLitterale: partieLitterale
  degre: number

  constructor(coefficient: numberOrFraction, partieLitterale: partieLitterale) {
    this.coefficient = rationnalise(coefficient)
    this.partieLitterale = { ...partieLitterale } // Clone to avoid mutations
    this.degre = this.partieLitterale.exposants.reduce(
      (acc, exposant) => acc + exposant,
      0,
    )
    const sortedPartieLitterale = this.partieLitterale.variables
      .map((variable, index) => {
        return { variable, exposant: this.partieLitterale.exposants[index] }
      })
      .sort((a, b) => a.variable.localeCompare(b.variable))
    this.partieLitterale.variables = sortedPartieLitterale.map(
      (part) => part.variable,
    )
    this.partieLitterale.exposants = sortedPartieLitterale.map(
      (part) => part.exposant,
    )
  }

  static genereCoefficients(
    typeofCoeff: string,
    coeffMax: number = 10,
  ): FractionEtendue {
    let randomCoefficient: FractionEtendue
    let numerateur: number
    let denominateur: number
    if (typeofCoeff === 'entier') {
      denominateur = 1
    } else {
      denominateur = randint(-coeffMax, coeffMax, [0, 1, -1])
    }
    do {
      numerateur = randint(-coeffMax, coeffMax)
      randomCoefficient = new FractionEtendue(numerateur, denominateur)
    } while (
      numerateur === 0 ||
      (randomCoefficient.estEntiere && typeofCoeff !== 'entier')
    )

    return rationnalise(randomCoefficient)
  }

  // Static method pour créer un monome à partir d'une partie littérale existante
  static createMonomeFromPartieLitterale(
    typeofCoeff: string,
    partieLitterale: partieLitterale,
    coeffMax: number = 10,
  ): MonomePlusieursVariables {
    const coefficient = this.genereCoefficients(typeofCoeff, coeffMax)
    return new MonomePlusieursVariables(coefficient, partieLitterale)
  }

  // Static method to create a monome with random values
  static createRandomMonome(
    degree: number,
    typeofCoeff: string,
    variables: string[],
    coeffMax: number = 10,
  ): MonomePlusieursVariables {
    // Generate a random coefficient
    const randomPartieLitterale: partieLitterale = {
      variables: [],
      exposants: [],
    }
    let remainingDegree = degree
    const minExponents = Array(variables.length).fill(0)

    const n = Math.min(variables.length, degree)
    // Ensure that at least n-1 variables have non-zero degrees
    const requiredIndices = Array.from(
      { length: variables.length },
      (_, i) => i,
    )
    for (let i = 0; i < n - 1; i++) {
      const randomIndex = requiredIndices.splice(
        Math.floor(Math.random() * requiredIndices.length),
        1,
      )[0]
      minExponents[randomIndex] = 1
      remainingDegree -= 1
    }

    // Distribute the remaining degree randomly across all variables
    while (remainingDegree > 0) {
      const randomIndex = Math.floor(Math.random() * variables.length)
      minExponents[randomIndex] += 1
      remainingDegree -= 1
    }

    // Assign the computed exponents to the variables
    for (let i = 0; i < variables.length; i++) {
      randomPartieLitterale.variables.push(variables[i])
      randomPartieLitterale.exposants.push(minExponents[i])
    }
    return new MonomePlusieursVariables(
      this.genereCoefficients(typeofCoeff, coeffMax),
      randomPartieLitterale,
    )
  }

  // Vérifie si deux monômes sont semblables (même partie littérale)
  estSemblable(m: MonomePlusieursVariables): boolean {
    const { variables, exposants } = this.partieLitterale
    const mVariables = m.partieLitterale.variables
    const mExposants = m.partieLitterale.exposants

    if (variables.length !== mVariables.length) return false

    for (let i = 0; i < variables.length; i++) {
      if (variables[i] !== mVariables[i] || exposants[i] !== mExposants[i]) {
        return false
      }
    }
    return true
  }

  // Additionne deux monômes semblables
  somme(m: MonomePlusieursVariables): MonomePlusieursVariables {
    if (this.estSemblable(m)) {
      const nouveauCoefficient = this.coefficient.sommeFractions(m.coefficient)
      return new MonomePlusieursVariables(
        nouveauCoefficient,
        this.partieLitterale,
      )
    } else {
      throw new Error("Impossible d'additionner deux monômes non semblables")
    }
  }

  oppose(): MonomePlusieursVariables {
    return new MonomePlusieursVariables(
      this.coefficient.oppose(),
      this.partieLitterale,
    )
  }

  // Déterminer si un monôme est un carré
  estCarre(): boolean {
    if (this.coefficient.estParfaite) {
      if (
        this.partieLitterale.exposants.every((exposant) => exposant % 2 === 0)
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  // we are working with the class fractionEtendue
  evaluer(variables: { [key: string]: FractionEtendue }): FractionEtendue {
    let resultat = this.coefficient
    this.partieLitterale.variables.forEach((variable, index) => {
      if (variables[variable]) {
        resultat = resultat.produitFraction(
          variables[variable].puissanceFraction(
            this.partieLitterale.exposants[index],
          ),
        )
      } else {
        throw new Error(
          `Impossible d'évaluer le monôme avec les variables fournies. Variable manquante : ${variable}`,
        )
      }
    })
    return resultat
  }

  // Déterminer le pgdc de deux monômes (cela va fonction seulement si les coefficients sont entiers)
  pgcd(m: MonomePlusieursVariables): MonomePlusieursVariables {
    if (this.coefficient.estEntiere && m.coefficient.estEntiere) {
      const a = this.coefficient.num
      const b = m.coefficient.num
      const pgcdCoefficient = pgcd(a, b)
      // Les variables qui apparaissent dans les deux monômes avec un exposant minimum de 1
      const variables = this.partieLitterale.variables.filter((variable) =>
        m.partieLitterale.variables.includes(variable),
      )
      const nouvellePartieLitterale: partieLitterale = {
        variables: [],
        exposants: [],
      }
      variables.forEach((variable) => {
        const indexThis = this.partieLitterale.variables.indexOf(variable)
        const indexM = m.partieLitterale.variables.indexOf(variable)
        const exposant = Math.min(
          this.partieLitterale.exposants[indexThis],
          m.partieLitterale.exposants[indexM],
        )
        nouvellePartieLitterale.variables.push(variable)
        nouvellePartieLitterale.exposants.push(exposant)
      })

      return new MonomePlusieursVariables(
        pgcdCoefficient,
        nouvellePartieLitterale,
      )
    } else {
      throw new Error(
        'Impossible de calculer le pgcd de deux monômes avec des coefficients non entiers',
      )
    }
  }

  // diviser deux monômes (supporte maintenant les fractions)
  diviserPar(m: MonomePlusieursVariables): MonomePlusieursVariables {
    // Calculer le quotient des coefficients (peut être une fraction)
    const quotientCoefficient = this.coefficient.diviseFraction(m.coefficient)

    // Les variables qui apparaissent dans les deux monômes avec un exposant minimum de 1
    const variables = this.partieLitterale.variables.filter((variable) =>
      m.partieLitterale.variables.includes(variable),
    )
    const nouvellePartieLitterale: partieLitterale = {
      variables: [],
      exposants: [],
    }
    variables.forEach((variable) => {
      // throw an error if the variable is not in the monome or if the variable is in the monome but with an exponent of 0 or if the difference of the exponents is negative
      if (
        !this.partieLitterale.variables.includes(variable) ||
        !m.partieLitterale.variables.includes(variable) ||
        this.partieLitterale.exposants[
          this.partieLitterale.variables.indexOf(variable)
        ] <
          m.partieLitterale.exposants[
            m.partieLitterale.variables.indexOf(variable)
          ]
      ) {
        throw new Error(
          'Impossible de diviser deux monômes avec des variables qui ne sont pas semblables',
        )
      } else {
        const indexThis = this.partieLitterale.variables.indexOf(variable)
        const indexM = m.partieLitterale.variables.indexOf(variable)
        const exposant =
          this.partieLitterale.exposants[indexThis] -
          m.partieLitterale.exposants[indexM]
        nouvellePartieLitterale.variables.push(variable)
        nouvellePartieLitterale.exposants.push(exposant)
      }
    })
    return new MonomePlusieursVariables(
      quotientCoefficient,
      nouvellePartieLitterale,
    )
  }

  // Multiplie deux monômes
  produit(m: MonomePlusieursVariables): MonomePlusieursVariables {
    const nouveauCoefficient = this.coefficient.produitFraction(m.coefficient)

    const nouvellePartieLitterale: partieLitterale = {
      variables: [...this.partieLitterale.variables],
      exposants: [...this.partieLitterale.exposants],
    }

    m.partieLitterale.variables.forEach((variable, index) => {
      const existingIndex = nouvellePartieLitterale.variables.indexOf(variable)

      if (existingIndex !== -1) {
        nouvellePartieLitterale.exposants[existingIndex] +=
          m.partieLitterale.exposants[index]
      } else {
        nouvellePartieLitterale.variables.push(variable)
        nouvellePartieLitterale.exposants.push(
          m.partieLitterale.exposants[index],
        )
      }
    })

    return new MonomePlusieursVariables(
      nouveauCoefficient,
      nouvellePartieLitterale,
    )
  }

  // this function will be a to string, but replacing the variables with a value fractionEtendue with \\left and \\right subsituting the actual variable in the expression by the fractionetendue specified in the argument. i.e it should get the string from the toString method and replace the variables with the values in the argument
  toStringEvaluate(variables: { [key: string]: FractionEtendue }): string {
    const partieLitteraleString = this.partieLitterale.variables
      .map((variable, index) => {
        const exposant = this.partieLitterale.exposants[index]
        // Only include the variable if its exponent is not 0
        if (exposant === 0) {
          return ''
        } else if (exposant === 1) {
          if (variables[variable].signe === -1) {
            return `\\left(${variables[variable].texFractionSimplifiee}\\right)`
          } else {
            return `${variables[variable].texFractionSimplifiee}`
          }
        } else {
          return `\\left(${variables[variable].texFractionSimplifiee}\\right)^{${exposant}}`
        }
      })
      .filter((part) => part !== '') // Exclude any empty strings from the result
      .join(' ')
    if (this.coefficient.num === 0) {
      return '0'
    } else if (this.coefficient.texFractionSimplifiee === '1') {
      if (partieLitteraleString === '') {
        return '1'
      } else {
        return partieLitteraleString
      }
    } else if (this.coefficient.texFractionSimplifiee === '-1') {
      if (partieLitteraleString === '') {
        return '-1'
      } else {
        return `-${partieLitteraleString}`
      }
    } else {
      return `${this.coefficient.texFractionSimplifiee}${partieLitteraleString === '' ? '' : '\\times'} ${partieLitteraleString}`
    }
  }

  // Convertit le monôme en une chaîne de caractères
  toString(): string {
    const partieLitteraleString = this.partieLitterale.variables
      .map((variable, index) => {
        const exposant = this.partieLitterale.exposants[index]
        // Only include the variable if its exponent is not 0
        if (exposant === 0) {
          return ''
        } else if (exposant === 1) {
          return `${variable}`
        } else {
          return `${variable}^${exposant}`
        }
      })
      .filter((part) => part !== '') // Exclude any empty strings from the result
      .join(' ')
    if (this.coefficient.num === 0) {
      return '0'
    } else if (this.coefficient.texFractionSimplifiee === '1') {
      if (partieLitteraleString === '') {
        return '1'
      } else {
        return partieLitteraleString
      }
    } else if (this.coefficient.texFractionSimplifiee === '-1') {
      if (partieLitteraleString === '') {
        return '-1'
      } else {
        return `-${partieLitteraleString}`
      }
    } else {
      return `${this.coefficient.texFractionSimplifiee} ${partieLitteraleString}`
    }
  }

  // Convertit le monôme en une chaîne de caractères
  toStringAvecSigne(): string {
    const partieLitteraleString = this.partieLitterale.variables
      .map((variable, index) => {
        const exposant = this.partieLitterale.exposants[index]
        // Only include the variable if its exponent is not 0
        if (exposant === 0) {
          return ''
        } else if (exposant === 1) {
          return `${variable}`
        } else {
          return `${variable}^${exposant}`
        }
      })
      .filter((part) => part !== '') // Exclude any empty strings from the result
      .join(' ')
    if (this.coefficient.num === 0) {
      return '0'
    } else if (this.coefficient.texFractionSimplifiee === '1') {
      if (partieLitteraleString === '') {
        return '+1'
      } else {
        return `+${partieLitteraleString}`
      }
    } else if (this.coefficient.texFractionSimplifiee === '-1') {
      if (partieLitteraleString === '') {
        return '-1'
      } else {
        return `-${partieLitteraleString}`
      }
    } else if (this.coefficient.signe === -1) {
      return `${this.coefficient.texFractionSimplifiee} ${partieLitteraleString}`
    } else {
      return `+${this.coefficient.texFractionSimplifiee} ${partieLitteraleString}`
    }
  }

  toStringAvecParentheses(): string {
    const partieLitteraleString = this.partieLitterale.variables
      .map((variable, index) => {
        const exposant = this.partieLitterale.exposants[index]
        // Only include the variable if its exponent is not 0
        if (exposant === 0) {
          return ''
        } else if (exposant === 1) {
          return `${variable}`
        } else {
          return `${variable}^${exposant}`
        }
      })
      .filter((part) => part !== '') // Exclude any empty strings from the result
      .join(' ')
    if (this.coefficient.num === 0) {
      return '0'
    } else if (this.coefficient.num === 1 && this.coefficient.den === 1) {
      if (partieLitteraleString === '') {
        return '1'
      } else {
        return partieLitteraleString
      }
    } else if (this.coefficient.texFractionSimplifiee === '-1') {
      return `\\left(-${partieLitteraleString}\\right)`
    } else if (this.coefficient.signe === -1) {
      return `\\left(${this.coefficient.texFractionSimplifiee} ${partieLitteraleString}\\right)`
    } else {
      return `${this.coefficient.texFractionSimplifiee} ${partieLitteraleString}`
    }
  }
}

export default MonomePlusieursVariables
