import MonomePlusieursVariables from '../lib/mathFonctions/MonomePlusieursVariables'
import PolynomePlusieursVariables from '../lib/mathFonctions/PolynomePlusieursVariables'
import { shuffle2tableauxSansModif } from '../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../lib/outils/calculs'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../lib/outils/ecritures'
import { miseEnEvidence } from '../lib/outils/embellissements'
import { pgcd } from '../lib/outils/primalite'
import { getLang } from '../lib/stores/languagesStore'
import FractionEtendue from './FractionEtendue'
import { randint } from './outils'

interface Options {
  format: string
  variable: string
  // other properties if needed
}

// créer une fonction qui construit une équation du second degré. On peut la créer à partir de solutions, à partir des coefficients ou simplement donner des conditions sur la solution et les coefficients pour la créer.
class EquationSecondDegre {
  coefficients: FractionEtendue[]
  coefficientsEqReduite: FractionEtendue[]
  delta: FractionEtendue
  nombreSolutions: number
  solutionsListeTex: string[]
  solutionsListeTexOppose: string[]
  ensembleDeSolutionsTex: string
  natureDesSolutions: string
  natureDelEquation: string
  equationTex: string
  correctionDetailleeTex: string
  correctionTex: string
  variable: string
  fonctionEvaluer: (x: number | FractionEtendue) => number
  constructor(
    a: FractionEtendue,
    b: FractionEtendue,
    c: FractionEtendue,
    d: FractionEtendue,
    e: FractionEtendue,
    f: FractionEtendue,
    options = { format: 'initial', variable: 'x' },
  ) {
    const lang = getLang()
    this.coefficients = [a, b, c, d, e, f]
    this.fonctionEvaluer = (x: number | FractionEtendue) =>
      (this.coefficients[0].num / this.coefficients[0].den) *
        Number(x) *
        Number(x) +
      (this.coefficients[1].num / this.coefficients[1].den) * Number(x) +
      this.coefficients[2].num / this.coefficients[2].den
    let melange = true
    this.variable = options.variable
    this.natureDelEquation = options.format
    this.natureDesSolutions = ''
    const nomValDefault = [
      `${this.variable}^2`,
      this.variable,
      '',
      `${this.variable}^2`,
      this.variable,
      '',
    ]
    this.coefficientsEqReduite = [
      a.differenceFraction(d).simplifie(),
      b.differenceFraction(e).simplifie(),
      c.differenceFraction(f).simplifie(),
      new FractionEtendue(0, 1),
      new FractionEtendue(0, 1),
      new FractionEtendue(0, 1),
    ]
    this.equationTex = ''
    if (options.format === 'reduit') {
      melange = false
      this.equationTex = this.printToLatexEq(this.coefficientsEqReduite)
    } else if (options.format === 'melangeReduit') {
      const tabMelange = shuffle2tableauxSansModif(
        this.coefficientsEqReduite.slice(0, 3),
        nomValDefault.slice(0, 3),
      )
      this.equationTex = this.printToLatexEq(
        tabMelange[0].concat(this.coefficientsEqReduite.slice(3)),
        tabMelange[1].concat(nomValDefault.slice(3)),
      )
    } else if (options.format === 'melangeSimple') {
      const coefficientsRevus = this.complexifyCoefficients(this.coefficients)
      this.equationTex = this.printToLatexEq(coefficientsRevus, nomValDefault)
    } else if (options.format === 'melangeComplique') {
      const coefficientsRevus = this.complexifyCoefficients(this.coefficients)
      const tabMelange1 = shuffle2tableauxSansModif(
        coefficientsRevus.slice(0, 3),
        nomValDefault.slice(0, 3),
      )
      const tabMelange2 = shuffle2tableauxSansModif(
        coefficientsRevus.slice(3),
        nomValDefault.slice(3),
      )
      const tabMelange = [
        tabMelange1[0].concat(tabMelange2[0]),
        tabMelange1[1].concat(tabMelange2[1]),
      ]
      this.equationTex = this.printToLatexEq(
        tabMelange[0] as FractionEtendue[],
        tabMelange[1] as string[],
      )
    } else if (options.format === 'initial') {
      this.equationTex = this.printToLatexEq(this.coefficients, nomValDefault)
    }
    this.delta = this.coefficientsEqReduite[1]
      .produitFraction(this.coefficientsEqReduite[1])
      .differenceFraction(
        this.coefficientsEqReduite[0]
          .produitFraction(this.coefficientsEqReduite[2])
          .produitFraction(4),
      )
    this.nombreSolutions = 0
    if (this.delta.num > 0) {
      this.nombreSolutions = 2
    } else if (this.delta.num === 0) {
      this.nombreSolutions = 1
    } else {
      this.nombreSolutions = 0
    }
    this.solutionsListeTex = []
    this.solutionsListeTexOppose = []
    this.natureDesSolutions = ''
    if (this.nombreSolutions > 0) {
      if (this.delta.estParfaite) {
        if (
          this.coefficientsEqReduite[1]
            .multiplieEntier(-1)
            .differenceFraction(
              new FractionEtendue(
                Math.sqrt(this.delta.num) as number,
                Math.sqrt(this.delta.den) as number,
              ),
            )
            .produitFraction(a.multiplieEntier(2).inverse()).denIrred === 1
        ) {
          this.natureDesSolutions = 'entier'
        } else {
          this.natureDesSolutions = 'fractionnaire'
        }
      } else {
        this.natureDesSolutions = 'irrationnel'
      }
      if (
        this.natureDesSolutions === 'entier' ||
        this.natureDesSolutions === 'fractionnaire'
      ) {
        this.solutionsListeTex = [
          `${
            this.coefficientsEqReduite[1]
              .multiplieEntier(-1)
              .differenceFraction(this.delta.racineCarree() as FractionEtendue)
              .produitFraction(
                this.coefficientsEqReduite[0].multiplieEntier(2).inverse(),
              ).texFractionSimplifiee
          }`,
          `${
            this.coefficientsEqReduite[1]
              .multiplieEntier(-1)
              .sommeFraction(this.delta.racineCarree() as FractionEtendue)
              .produitFraction(
                this.coefficientsEqReduite[0].multiplieEntier(2).inverse(),
              ).texFractionSimplifiee
          }`,
        ]
        this.solutionsListeTexOppose = [
          `${
            this.coefficientsEqReduite[1]
              .multiplieEntier(-1)
              .differenceFraction(this.delta.racineCarree() as FractionEtendue)
              .produitFraction(
                this.coefficientsEqReduite[0].multiplieEntier(2).inverse(),
              )
              .oppose().texFractionSimplifiee
          }`,
          `${
            this.coefficientsEqReduite[1]
              .multiplieEntier(-1)
              .sommeFraction(this.delta.racineCarree() as FractionEtendue)
              .produitFraction(
                this.coefficientsEqReduite[0].multiplieEntier(2).inverse(),
              )
              .oppose().texFractionSimplifiee
          }`,
        ]
        // parse la réponse latex en CE qui la simplifie et l'imprime
      } else if (this.natureDesSolutions === 'irrationnel') {
        const sol1Tex = `\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}+\\sqrt{${this.delta.texFSD}}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}`
        const sol2Tex = `\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}-\\sqrt{${this.delta.texFSD}}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}`
        const sol1TexOppose = '-' + sol1Tex
        const sol2TexOppose = '-' + sol2Tex
        const racineDelta = extraireRacineCarree(this.delta.num)
        if (this.delta.estEntiere) {
          if (this.delta.num === 0) {
            const sol1 = new FractionEtendue(
              -this.coefficientsEqReduite[1],
              2,
            ).produitFraction(this.coefficientsEqReduite[0].inverse())
            this.solutionsListeTex = [
              sol1.texFractionSimplifiee,
              sol1.texFractionSimplifiee,
            ]
          } else if (racineDelta[1] === 1) {
            const sol1 = new FractionEtendue(
              -this.coefficientsEqReduite[1] + racineDelta[0],
              2,
            ).produitFraction(this.coefficientsEqReduite[0].inverse())
            const sol2 = new FractionEtendue(
              -this.coefficientsEqReduite[1] - racineDelta[0],
              2,
            ).produitFraction(this.coefficientsEqReduite[0].inverse())
            this.solutionsListeTex = [
              sol1.texFractionSimplifiee,
              sol2.texFractionSimplifiee,
            ]
            this.solutionsListeTexOppose = [
              sol1.oppose().texFractionSimplifiee,
              sol2.oppose().texFractionSimplifiee,
            ]
          } else {
            let pgcdRacines = pgcd(
              2 *
                this.coefficientsEqReduite[0].num *
                this.coefficientsEqReduite[1].den,
              this.coefficientsEqReduite[1].num *
                this.coefficientsEqReduite[0].den,
            )
            pgcdRacines = pgcd(
              pgcdRacines,
              this.coefficientsEqReduite[0].den *
                this.coefficientsEqReduite[1].den *
                racineDelta[0],
            )
            // s = (a - b*sqrt(c))/d
            const a =
              (-this.coefficientsEqReduite[1].num *
                this.coefficientsEqReduite[0].den) /
              pgcdRacines
            const b =
              (this.coefficientsEqReduite[0].den *
                this.coefficientsEqReduite[1].den *
                racineDelta[0]) /
              pgcdRacines
            const c = racineDelta[1]
            const d =
              (2 *
                this.coefficientsEqReduite[0].num *
                this.coefficientsEqReduite[1].den) /
              pgcdRacines
            let sol1RevisiteeTex = `\\dfrac{${a} - ${b === 1 ? '' : b}\\sqrt{${c}}}{${d}}`
            let sol2RevisiteeTex = `\\dfrac{${a} + ${b === 1 ? '' : b}\\sqrt{${c}}}{${d}}`
            let sol1RevisiteeTexOppose = `-\\dfrac{${a} - ${b === 1 ? '' : b}\\sqrt{${c}}}{${d}}`
            let sol2RevisiteeTexOppose = `-\\dfrac{${a} + ${b === 1 ? '' : b}\\sqrt{${c}}}{${d}}`
            if (d === 1) {
              sol1RevisiteeTex = `${a} - ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol2RevisiteeTex = `${a} + ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol1RevisiteeTexOppose = `-${a} - ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol2RevisiteeTexOppose = `-${a} + ${b === 1 ? '' : b}\\sqrt{${c}}`
            } else if (d === -1) {
              sol1RevisiteeTex = `-${a} + ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol2RevisiteeTex = `-${a} - ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol1RevisiteeTexOppose = `${a} - ${b === 1 ? '' : b}\\sqrt{${c}}`
              sol2RevisiteeTexOppose = `${a} + ${b === 1 ? '' : b}\\sqrt{${c}}`
            }
            this.solutionsListeTex = [sol1RevisiteeTex, sol2RevisiteeTex]
            this.solutionsListeTexOppose = [
              sol1RevisiteeTexOppose,
              sol2RevisiteeTexOppose,
            ]
          }
        } else {
          this.solutionsListeTex = [sol1Tex, sol2Tex]
          this.solutionsListeTexOppose = [sol1TexOppose, sol2TexOppose]
        }
      }
    }
    this.ensembleDeSolutionsTex =
      this.delta.num < 0
        ? 'S=\\emptyset'
        : this.delta.num > 0
          ? 'S = \\left\\{' +
            this.solutionsListeTex.join('\\,;\\,') +
            '\\right\\}'
          : `S=\\left\\{${this.solutionsListeTex[0]}\\right\\}`
    if (this.nombreSolutions === 0) {
      this.correctionTex = `On a que $\\Delta=${this.delta.texFSD}$, l'équation n'a pas de solution réelle, $${this.ensembleDeSolutionsTex}$.`
    } else {
      this.correctionTex =
        `On a que $\\Delta=${this.delta.texFSD}$, donc l'équation a ${this.nombreSolutions} solution` +
        (this.nombreSolutions > 1 ? 's' : '') +
        `, ${this.ensembleDeSolutionsTex}.`
    }
    this.correctionDetailleeTex = ''
    if (melange) {
      this.correctionDetailleeTex += `On commence par mettre l'équation sous la forme réduite : \\[${this.printToLatexEq(this.coefficientsEqReduite)}\\]`
    }
    this.correctionDetailleeTex += `On calcule le discriminant : \\[\\Delta=\\left(${this.coefficientsEqReduite[1].texFractionSimplifiee}\\right)^2-4\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}\\times${this.coefficientsEqReduite[2].ecritureParentheseSiNegatif}=${this.delta.texFractionSimplifiee}.\\] On a $\\Delta=${this.delta.texFractionSimplifiee}$, donc `
    if (this.nombreSolutions > 1) {
      this.correctionDetailleeTex +=
        "l'équation a deux solutions. Les solutions sont"
      if (lang === 'fr-CH') {
        this.correctionDetailleeTex += `\\[${this.variable}_{1,2}=\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}\\pm\\sqrt{${this.delta.texFSD}}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}\\]`
      } else {
        this.correctionDetailleeTex += `\\[${this.variable}_{1}=\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}+\\sqrt{${this.delta.texFSD}}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}\\quad`
        this.correctionDetailleeTex += ` ${this.variable}_{2}=\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}-\\sqrt{${this.delta.texFSD}}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}\\]`
      }
      if (
        this.natureDesSolutions === 'entier' ||
        this.natureDesSolutions === 'fractionnaire'
      ) {
        this.correctionDetailleeTex += `En calculant, on obtient $${miseEnEvidence(this.ensembleDeSolutionsTex)}$.`
      } else {
        this.correctionDetailleeTex += `Ainsi, $${miseEnEvidence(this.ensembleDeSolutionsTex)}$.`
      }
    } else if (this.nombreSolutions === 1) {
      this.correctionDetailleeTex += `l'équation a une solution donnée par
    \\[s=\\dfrac{-${this.coefficientsEqReduite[1].ecritureParentheseSiNegatif}}{2\\times${this.coefficientsEqReduite[0].ecritureParentheseSiNegatif}}\\]
    Ainsi, $${miseEnEvidence(this.ensembleDeSolutionsTex)}$.`
    } else {
      this.correctionDetailleeTex += ` l'équation n'a pas de solution réelle, $${miseEnEvidence(this.ensembleDeSolutionsTex)}$.`
    }
  }

  // Méthode pour créer une équation à partir des coefficients
  static aPartirDesCoefficients(
    a: FractionEtendue,
    b: FractionEtendue,
    c: FractionEtendue,
    d: FractionEtendue,
    e: FractionEtendue,
    f: FractionEtendue,
    options: Options,
  ): EquationSecondDegre {
    return new EquationSecondDegre(a, b, c, d, e, f, options)
  }

  // Méthode pour créer une équation à partir des solutions
  static aPartirDesSolutions(
    sol1: FractionEtendue,
    sol2: FractionEtendue,
    coeffLead: FractionEtendue,
    options: Options,
  ): EquationSecondDegre {
    const a = coeffLead
    const b = sol1
      .sommeFraction(sol2)
      .multiplieEntier(-1)
      .produitFraction(coeffLead)
    const c = sol1.produitFraction(sol2).produitFraction(coeffLead)
    const d = new FractionEtendue(0, 1)
    const e = new FractionEtendue(0, 1)
    const f = new FractionEtendue(0, 1)
    return new EquationSecondDegre(a, b, c, d, e, f, options)
  }

  // Méthode pour créer une équation à partir des coefficients d'un PolynomePlusieursVariables
  static aPartirDuPolynome(
    polynome: PolynomePlusieursVariables,
    options: Options = { format: 'reduit', variable: 'x' },
  ): EquationSecondDegre {
    // Reduce polynomial to combine like terms
    const polynomeReduit = polynome.reduire()

    // Initialize coefficients
    let coeffX2 = new FractionEtendue(0, 1)
    let coeffX1 = new FractionEtendue(0, 1)
    let coeffX0 = new FractionEtendue(0, 1)

    const variable = options.variable

    // Extract coefficients from reduced polynomial
    for (const monome of polynomeReduit.monomes) {
      const varIndex = monome.partieLitterale.variables.indexOf(variable)
      const degree =
        varIndex !== -1 ? monome.partieLitterale.exposants[varIndex] : 0

      if (degree === 2) {
        coeffX2 = monome.coefficient
      } else if (degree === 1) {
        coeffX1 = monome.coefficient
      } else if (degree === 0) {
        coeffX0 = monome.coefficient
      }
    }

    // Check that it's a quadratic equation
    if (coeffX2.num === 0) {
      throw new Error(
        "Le coefficient de x² est nul. Ce n'est pas une équation du second degré.",
      )
    }

    // Create equation: ax² + bx + c = 0
    const d = new FractionEtendue(0, 1)
    const e = new FractionEtendue(0, 1)
    const f = new FractionEtendue(0, 1)

    return new EquationSecondDegre(coeffX2, coeffX1, coeffX0, d, e, f, options)
  }

  // Méthode pour créer une équation à partir du type de jeu de coefficients
  // static aPartirDuTypeDesCoefficients (type: string): EquationSecondDegre {
  //   const fractionNulle = new FractionEtendue(0, 1)
  //   let coefficients: FractionEtendue[] = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Initialiser avec tous les coefficients à 0

  //   switch (type) {
  //     case 'naturels':
  //       // Définir les coefficients pour les nombres naturels
  //       coefficients = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Exemple de coefficients
  //       break
  //     case 'entiers':
  //       // Définir les coefficients pour les entiers
  //       coefficients = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Exemple de coefficients
  //       break
  //     case 'décimaux':
  //       // Définir les coefficients pour les nombres décimaux
  //       coefficients = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Exemple de coefficients
  //       break
  //     case 'fraction':
  //       // Définir les coefficients pour les fractions
  //       coefficients = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Exemple de coefficients
  //       break
  //     default:
  //       // Par défaut, utiliser les nombres naturels si le type n'est pas reconnu
  //       coefficients = [fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle, fractionNulle] // Exemple de coefficients
  //   }

  //   return new EquationSecondDegre(coefficients[0], coefficients[1], coefficients[2], coefficients[3], coefficients[4], coefficients[5])
  // }
  // Si tous les coefficients sont de fractions entières, alors on ajoute de part et d'autre aléatoire des entiers pour complexifier l'équation et si une des fractions n'est pas entière, on ajoute des fractions entières pour complexifier l'équation
  private complexifyCoefficients(
    coefficients: FractionEtendue[],
  ): FractionEtendue[] {
    const newCoefficients = coefficients
    let checkFractionEntiere = true
    for (let i = 0; i < 6; i++) {
      if (!(coefficients[i].den === 1)) {
        checkFractionEntiere = false
        break
      }
    }
    if (this.natureDelEquation === 'melangeComplique') {
      if (checkFractionEntiere) {
        for (let i = 0; i < 3; i++) {
          const ajout = new FractionEtendue(randint(-10, 10), 1)
          newCoefficients[i] = newCoefficients[i].sommeFraction(ajout)
          newCoefficients[i + 3] = newCoefficients[i + 3].sommeFraction(ajout)
        }
      } else {
        for (let i = 0; i < 3; i++) {
          const ajout = new FractionEtendue(
            randint(-4, 4, [0]),
            randint(-3, 3, [0]),
          )
          newCoefficients[i] = newCoefficients[i].sommeFraction(ajout)
          newCoefficients[i + 3] = newCoefficients[i + 3].sommeFraction(ajout)
        }
      }
    } else if (this.natureDelEquation === 'melangeSimple') {
      for (let i = 0; i < 3; i++) {
        if (randint(0, 1) === 1) {
          const ajout = coefficients[i].oppose()
          newCoefficients[i] = newCoefficients[i].sommeFraction(ajout)
          newCoefficients[i + 3] = newCoefficients[i + 3].sommeFraction(ajout)
        }
      }
    }
    return newCoefficients
  }

  private printToLatexEq(
    coeff: FractionEtendue[],
    nomVal: string[] = [
      `${this.variable}^2`,
      this.variable,
      '',
      `${this.variable}^2`,
      this.variable,
      '',
    ],
  ): string {
    let expr = ''
    let checkPreviousNull = true
    for (let i = 0; i < 3; i++) {
      if (coeff.slice(0, 3).every((item) => item.num === 0) && i === 0) {
        expr = expr + '0'
      } else if (!(coeff[i].num === 0) && checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${coeff[i].texFSD}${nomVal[i]}`
        } else {
          expr = expr + `${rienSi1(coeff[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      } else if (!(coeff[i].num === 0) && !checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${ecritureAlgebrique(coeff[i])}${nomVal[i]}`
        } else {
          expr = expr + `${ecritureAlgebriqueSauf1(coeff[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      }
    }
    expr = expr + '='
    checkPreviousNull = true
    for (let i = 3; i < 6; i++) {
      if (coeff.slice(3).every((item) => item.num === 0) && i === 3) {
        expr = expr + '0'
      } else if (!(coeff[i].num === 0) && checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${coeff[i].texFSD}${nomVal[i]}`
        } else {
          expr = expr + `${rienSi1(coeff[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      } else if (!(coeff[i].num === 0) && !checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${ecritureAlgebrique(coeff[i])}${nomVal[i]}`
        } else {
          expr = expr + `${ecritureAlgebriqueSauf1(coeff[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      }
    }
    return expr
  }

  // Méthode pour construire le polynomePlusieursVariables à partir de la forme réduite
  polynomeFormeReduite(): PolynomePlusieursVariables {
    const m1 = new MonomePlusieursVariables(this.coefficients[0], {
      variables: [this.variable],
      exposants: [2],
    })
    const m2 = new MonomePlusieursVariables(this.coefficients[1], {
      variables: [this.variable],
      exposants: [1],
    })
    const m3 = new MonomePlusieursVariables(this.coefficients[2], {
      variables: [this.variable],
      exposants: [0],
    })
    return new PolynomePlusieursVariables([m1, m2, m3])
  }

  formeCanonique(): string {
    const alpha = this.coefficients[1]
      .oppose()
      .diviseFraction(this.coefficients[0].multiplieEntier(2).simplifie())
    const beta = this.polynomeFormeReduite().evaluer({ x: alpha }).simplifie()
    return `${rienSi1(this.coefficients[0])}\\left(${this.variable}${alpha.oppose().simplifie().texFractionSignee}\\right)^2${beta.texFractionSignee}`
  }

  solutionFrac(): FractionEtendue[] | string {
    if (this.nombreSolutions === 0) {
      return 'Pas de solution'
    } else {
      if (this.solutionsListeTex[0].includes('sqrt')) {
        return 'Les solutions ne peuvent pas être exprimées sous forme de fraction'
      } else {
        const solListe = []
        for (let j = 0; j < this.solutionsListeTex.length; j++) {
          let solution = new FractionEtendue(0, 1)
          let numDen1 = [0, 1]
          if (!this.solutionsListeTex[j].includes('\\dfrac')) {
            numDen1 = [Number(this.solutionsListeTex[j]), Number('1')]
          } else if (this.solutionsListeTex[j].includes('\\dfrac')) {
            numDen1 = [
              Number(
                this.solutionsListeTex[j]
                  .match(/\\dfrac{(\d+)}{(\d+)}/)
                  ?.slice(1)[0],
              ),
              Number(
                this.solutionsListeTex[j]
                  .match(/\\dfrac{(\d+)}{(\d+)}/)
                  ?.slice(1)[1],
              ),
            ]
            if (this.solutionsListeTex[j].includes('-')) {
              numDen1[0] = -numDen1[0]
            }
          }
          solution = new FractionEtendue(Number(numDen1[0]), Number(numDen1[1]))
          solListe.push(solution)
        }
        return solListe
      }
    }
  }

  printToLatexFormeFactorisee(): string {
    if (this.nombreSolutions === 0) {
      return '\\left (' + this.printToLatexMDG() + '\\right )'
    } else if (this.nombreSolutions === 1) {
      return `${rienSi1(this.coefficients[0])}\\left(${this.variable}${this.solutionsListeTex[0][0] === '-' ? '' : '+'}${this.solutionsListeTexOppose[0]}\\right)^2`
    } else {
      return `${rienSi1(this.coefficients[0])}\\left(${this.variable}${this.solutionsListeTexOppose[1]}\\right)\\left(${this.variable}${this.solutionsListeTexOppose[0]}\\right)`
    }
  }

  printToLatex(): string {
    let expr = ''
    let checkPreviousNull = true
    const nomVal = [
      `${this.variable}^2`,
      this.variable,
      '',
      `${this.variable}^2`,
      this.variable,
      '',
    ]
    for (let i = 0; i < 3; i++) {
      if (
        this.coefficients.slice(0, 3).every((item) => item.num === 0) &&
        i === 0
      ) {
        expr = expr + '0'
      } else if (!(this.coefficients[i].num === 0) && checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${this.coefficients[i].texFSD}`
        } else {
          expr = expr + `${rienSi1(this.coefficients[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      } else if (!(this.coefficients[i].num === 0) && !checkPreviousNull) {
        if (nomVal[i] === '') {
          expr += `${ecritureAlgebrique(this.coefficients[i].simplifie())}`
        } else {
          expr += `${ecritureAlgebriqueSauf1(this.coefficients[i].simplifie())}${nomVal[i]}`
        }
        checkPreviousNull = false
      }
    }
    expr = expr + '='
    checkPreviousNull = true
    for (let i = 3; i < 6; i++) {
      if (
        this.coefficients.slice(3).every((item) => item.num === 0) &&
        i === 3
      ) {
        expr = expr + '0'
      } else if (!(this.coefficients[i].num === 0) && checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${this.coefficients[i].texFSD}`
        } else {
          expr = expr + `${rienSi1(this.coefficients[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      } else if (!(this.coefficients[i].num === 0) && !checkPreviousNull) {
        if (nomVal[i] === '') {
          expr = expr + `${this.coefficients[i].texFSD}`
        } else {
          expr =
            expr +
            `${ecritureAlgebriqueSauf1(this.coefficients[i])}${nomVal[i]}`
        }
        checkPreviousNull = false
      }
    }
    return expr
  }

  printToLatexMDG(option = { indice: -1, couleur: 'black' }): string {
    let expr = ''
    let suiteExpr = ''
    let checkPreviousNull = true
    const nomVal = [
      `${this.variable}^2`,
      this.variable,
      '',
      `${this.variable}^2`,
      this.variable,
      '',
    ]
    for (let i = 0; i < 3; i++) {
      suiteExpr = ''
      if (
        this.coefficients.slice(0, 3).every((item) => item.num === 0) &&
        i === 0
      ) {
        suiteExpr = '0'
      } else if (!(this.coefficients[i].num === 0) && checkPreviousNull) {
        if (nomVal[i] === '') {
          suiteExpr = `${this.coefficients[i].simplifie().texFSD}${nomVal[i]}`
        } else {
          suiteExpr = `${rienSi1(this.coefficients[i].simplifie())}${nomVal[i]}`
        }
        checkPreviousNull = false
      } else if (!(this.coefficients[i].num === 0) && !checkPreviousNull) {
        if (nomVal[i] === '') {
          suiteExpr = `${ecritureAlgebrique(this.coefficients[i].simplifie())}`
        } else {
          suiteExpr = `${ecritureAlgebriqueSauf1(this.coefficients[i].simplifie())}${nomVal[i]}`
        }
        checkPreviousNull = false
      }
      if (i === option.indice) {
        if (
          suiteExpr.split(this.variable)[0] === '+' ||
          suiteExpr.split(this.variable)[0] === '-'
        ) {
          suiteExpr =
            miseEnEvidence(
              suiteExpr.split(this.variable)[0] + '1',
              option.couleur,
            ) +
            this.variable +
            suiteExpr.split(this.variable)[1]
        }
        if (suiteExpr.split(this.variable).length !== 1) {
          suiteExpr =
            miseEnEvidence(suiteExpr.split(this.variable)[0], option.couleur) +
            this.variable +
            suiteExpr.split(this.variable)[1]
        } else {
          suiteExpr = miseEnEvidence(
            suiteExpr.split(this.variable)[0],
            option.couleur,
          )
        }
        suiteExpr = '\\,' + suiteExpr
      }
      expr = expr + suiteExpr
    }
    return expr
  }
}

export default EquationSecondDegre
