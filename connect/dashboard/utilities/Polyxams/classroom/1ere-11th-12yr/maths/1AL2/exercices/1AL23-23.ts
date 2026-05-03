import { expand } from '@cortex-js/compute-engine'
import { createList } from '../../lib/format/lists'
import { texteGras } from '../../lib/format/style'

import ce from '../../lib/interactif/comparisonFunctions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import type FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

export const titre =
  "Déterminer le nombre de solutions d'une équation du second degré selon un paramètre"
export const dateDePublication = '30/10/2021' // exercice original de Éric Schraffstetter complètement refondu par Jean-Claude Lhote
export const dateDeModificationImportante = '05/10/2025' // ajout de cas de figure 2 et 3 et grosse refactorisation

export const uuid = 'fe4dg'

export const refs = {
  'fr-fr': ['1AL23-23'],
  'fr-ch': [],
}

interface CoefficientsEquation {
  a: string // coefficient de x² en fonction de m
  b: string // coefficient de x en fonction de m
  c: string // terme constant en fonction de m
}

interface CoefficientsDiscriminant {
  coeffAA: number // coefficient de m² dans Delta
  coeffBB: number // coefficient de m dans Delta
  coeffCC: number // terme constant dans Delta
}

// Ajout: paramètres numériques utiles pour traiter le cas a(m)=0
interface ParametresEquation {
  typeQuestion: number
  valeurAjustementDeltaA: number
  coefMB: number
  constB: number
  coefMC: number
  constC: number
}

export default class EquationDuSecondDegreAvecUnParametre extends Exercice {
  constructor() {
    super()
    this.consigne = `Déterminer, suivant la valeur du paramètre $m$, le ${texteGras('nombre de solutions')} de l'équation du second degré.`
    this.nbQuestions = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets\n1 : Coefficient de x^2 constant\n2 : Coefficient de x^2 avec en a.m\n3 : Coefficient de x^2 en m+a\n4 : Mélange',
    ]
    this.sup = '1'
    context.isHtml ? (this.spacingCorr = 2) : (this.spacingCorr = 1)
  }

  /**
   * Génère les coefficients de l'équation selon le type choisi
   */
  private genererCoefficients(typeQuestion: number): {
    equation: string
    coefficients: CoefficientsEquation
    coeffsDiscriminant: CoefficientsDiscriminant
    params: ParametresEquation
  } {
    const valeurAjustementDeltaA = randint(-5, 5, 0)
    const coefficientDeMDansDeltaB = randint(-2, 2, 0)
    const coefficientConstantDansDeltaB = randint(-3, 3, 0)
    const coefficientDeMDansDeltaC = randint(-2, 2, 0)
    const coefficientConstantDansDeltaC = randint(-3, 3, 0)

    let equation: string
    let coefficients: CoefficientsEquation
    let coeffsDiscriminant: CoefficientsDiscriminant
    switch (typeQuestion) {
      case 1: // Coefficient de x² constant
        equation = `${coefficientDeMDansDeltaB}mx${ecritureAlgebrique(valeurAjustementDeltaA)}x^2${ecritureAlgebriqueSauf1(coefficientDeMDansDeltaC)}m${ecritureAlgebriqueSauf1(coefficientConstantDansDeltaB)}x${ecritureAlgebrique(coefficientConstantDansDeltaC)}`
        coefficients = {
          a: `${valeurAjustementDeltaA}`,
          b: `${rienSi1(coefficientDeMDansDeltaB)}m${ecritureAlgebrique(coefficientConstantDansDeltaB)}`,
          c: `${rienSi1(coefficientDeMDansDeltaC)}m${ecritureAlgebrique(coefficientConstantDansDeltaC)}`,
        }
        coeffsDiscriminant = {
          coeffAA: coefficientDeMDansDeltaB * coefficientDeMDansDeltaB,
          coeffBB:
            2 * coefficientDeMDansDeltaB * coefficientConstantDansDeltaB -
            4 * valeurAjustementDeltaA * coefficientDeMDansDeltaC,
          coeffCC:
            -4 * valeurAjustementDeltaA * coefficientConstantDansDeltaC +
            coefficientConstantDansDeltaB * coefficientConstantDansDeltaB,
        }
        break

      case 2: // Coefficient de x² avec a.m
        equation = `${coefficientDeMDansDeltaB}mx${ecritureAlgebriqueSauf1(valeurAjustementDeltaA)}mx^2${ecritureAlgebriqueSauf1(coefficientDeMDansDeltaC)}m${ecritureAlgebriqueSauf1(coefficientConstantDansDeltaB)}x${ecritureAlgebrique(coefficientConstantDansDeltaC)}`
        coefficients = {
          a: `${rienSi1(valeurAjustementDeltaA)}m`,
          b: `${rienSi1(coefficientDeMDansDeltaB)}m${ecritureAlgebrique(coefficientConstantDansDeltaB)}`,
          c: `${rienSi1(coefficientDeMDansDeltaC)}m${ecritureAlgebrique(coefficientConstantDansDeltaC)}`,
        }
        coeffsDiscriminant = {
          coeffAA:
            coefficientDeMDansDeltaB * coefficientDeMDansDeltaB -
            4 * valeurAjustementDeltaA * coefficientDeMDansDeltaC,
          coeffBB:
            2 * coefficientDeMDansDeltaB * coefficientConstantDansDeltaB -
            4 * valeurAjustementDeltaA * coefficientConstantDansDeltaC,
          coeffCC:
            coefficientConstantDansDeltaB * coefficientConstantDansDeltaB,
        }
        break

      case 3: // Coefficient de x² en m+a
      default:
        equation = `(m${ecritureAlgebrique(valeurAjustementDeltaA)})x^2${ecritureAlgebriqueSauf1(coefficientDeMDansDeltaB)}mx${ecritureAlgebriqueSauf1(coefficientDeMDansDeltaC)}m${ecritureAlgebriqueSauf1(coefficientConstantDansDeltaB)}x${ecritureAlgebrique(coefficientConstantDansDeltaC)}`
        coefficients = {
          a: `m${ecritureAlgebriqueSauf1(valeurAjustementDeltaA)}`,
          b: `${rienSi1(coefficientDeMDansDeltaB)}m${ecritureAlgebrique(coefficientConstantDansDeltaB)}`,
          c: `${rienSi1(coefficientDeMDansDeltaC)}m${ecritureAlgebrique(coefficientConstantDansDeltaC)}`,
        }
        coeffsDiscriminant = {
          coeffAA:
            coefficientDeMDansDeltaB * coefficientDeMDansDeltaB -
            4 * coefficientDeMDansDeltaC,
          coeffBB:
            2 * coefficientDeMDansDeltaB * coefficientConstantDansDeltaB -
            4 * coefficientDeMDansDeltaC * valeurAjustementDeltaA -
            4 * coefficientConstantDansDeltaC,
          coeffCC:
            -4 * valeurAjustementDeltaA * coefficientConstantDansDeltaC +
            coefficientConstantDansDeltaB * coefficientConstantDansDeltaB,
        }
        break
    }

    const params: ParametresEquation = {
      typeQuestion,
      valeurAjustementDeltaA,
      coefMB: coefficientDeMDansDeltaB,
      constB: coefficientConstantDansDeltaB,
      coefMC: coefficientDeMDansDeltaC,
      constC: coefficientConstantDansDeltaC,
    }

    return { equation, coefficients, coeffsDiscriminant, params }
  }

  /**
   * Analyse le discriminant et génère la correction correspondante
   */
  private analyserDiscriminant(
    coefficients: CoefficientsEquation,
    coeffsDiscriminant: CoefficientsDiscriminant,
  ): string {
    const parenthesesSiSommeOuDifference = (s: string) =>
      s.includes('+') || s.includes('-') ? `(${s})` : s
    const { coeffAA, coeffBB, coeffCC } = coeffsDiscriminant
    const deltaPrime = coeffBB * coeffBB - 4 * coeffAA * coeffCC
    let texteCorr = ''
    texteCorr += "Écrivons l'équation sous la forme $ax^2+bx+c=0$ :<br>"
    const expr1 = `${parenthesesSiSommeOuDifference(coefficients.a)}x^2+(${coefficients.b})x+(${coefficients.c})`
    texteCorr += `$${expr1}=0$<br>`
    texteCorr += `On a donc $a=${coefficients.a}$, $b=${coefficients.b}$ et $c=${coefficients.c}$<br>`

    const deltaExpr = `(${coefficients.b})^2-4\\times ${parenthesesSiSommeOuDifference(coefficients.a)}\\times ${parenthesesSiSommeOuDifference(coefficients.c)}`
    texteCorr += `Le discriminant vaut $\\Delta=b^2-4\\times a\\times c = ${deltaExpr}$.<br>`

    const delta2 = expand(deltaExpr).simplify().latex
    texteCorr += `Ou encore, sous forme développée : $\\Delta = ${delta2}$<br>`

    // Cas où le discriminant est du premier degré
    if (coeffAA === 0) {
      return this.analyserDiscriminantPremierDegre(texteCorr, coeffBB, coeffCC)
    }

    // Cas où le discriminant est du second degré
    return this.analyserDiscriminantSecondDegre(
      texteCorr,
      coeffAA,
      coeffBB,
      coeffCC,
      deltaPrime,
    )
  }

  /**
   * Analyse le cas où Delta est une fonction affine de m
   */
  private analyserDiscriminantPremierDegre(
    texteCorr: string,
    coeffBB: number,
    coeffCC: number,
  ): string {
    if (coeffBB === 0) {
      // Delta est constant
      if (coeffCC === 0) {
        texteCorr +=
          "Quel que soit $m$ réel, on a $\\Delta$ qui est nul. L'équation du départ admet donc toujours une unique solution.<br>"
      } else if (coeffCC > 0) {
        texteCorr +=
          "Quel que soit $m$ réel, on a $\\Delta$ qui est strictement positif. L'équation du départ admet donc toujours 2 solutions.<br>"
      } else {
        texteCorr +=
          "Quel que soit $m$ réel, on a $\\Delta$ qui est strictement négatif. L'équation du départ n'admet jamais de solution réelle.<br>"
      }
    } else {
      const m1 = fraction(-coeffCC, coeffBB).texFractionSimplifiee
      texteCorr += `Cherchons la valeur de $m$ qui annule cette expression du premier degré : $m=${m1}$<br>`

      if (coeffBB > 0) {
        texteCorr += `$\\Delta$ est une droite croissante de coefficient directeur $${coeffBB}$.<br>`
        texteCorr += `Elle est donc négative avant $m_1=${m1}$ et positive après.<br>`
        texteCorr += '$\\underline{\\text{Conclusion}}$ :<br>'
        texteCorr += createList({
          items: [
            `Si $m < ${m1}$, l'équation n'a pas de solution réelle;`,
            `Si $m = ${m1}$, l'équation a une unique solution réelle;`,
            `Si $m > ${m1}$, l'équation a 2 solutions réelles.`,
          ],
          style: 'fleches',
        })
      } else {
        texteCorr += `$\\Delta$ est une droite décroissante de coefficient directeur $${coeffBB}$.<br>`
        texteCorr += `Elle est donc positive avant $m_1=${m1}$ et négative après.<br>`
        texteCorr += '$\\underline{\\text{Conclusion}}$ :<br>'
        texteCorr += createList({
          items: [
            `Si $m < ${m1}$, l'équation a 2 solutions réelles;`,
            `Si $m = ${m1}$, l'équation a une unique solution réelle;`,
            `Si $m > ${m1}$, l'équation n'a pas de solution réelle.`,
          ],
          style: 'fleches',
        })
      }
    }
    return texteCorr
  }

  /**
   * Analyse le cas où Delta est une fonction du second degré de m
   */
  private analyserDiscriminantSecondDegre(
    texteCorr: string,
    coeffAA: number,
    coeffBB: number,
    coeffCC: number,
    deltaPrime: number,
  ): string {
    texteCorr +=
      'Cherchons les valeurs de $m$ qui annulent cette expression du second degré :<br>'
    texteCorr += `Le discriminant $\\Delta^\\prime$ vaut $${deltaPrime}$.<br>`

    const trinom = new Trinome(coeffAA, coeffBB, coeffCC)
    const f = trinom.discriminant
    if (f.superieurLarge(0) && f.estParfaite) {
      const racine = f.racineCarree() as FractionEtendue
      texteCorr += ` (Remarquons que $\\sqrt{\\Delta^\\prime} =${racine.texFractionSimplifiee}$)<br>`
    }

    if (deltaPrime < 0) {
      return this.gererDiscriminantNegatif(texteCorr, coeffAA)
    } else if (deltaPrime === 0) {
      return this.gererDiscriminantNul(texteCorr, coeffAA, trinom)
    } else {
      return this.gererDiscriminantPositif(texteCorr, coeffAA, trinom)
    }
  }

  private gererDiscriminantNegatif(texteCorr: string, coeffAA: number): string {
    texteCorr +=
      "Celui-ci étant strictement négatif, l'équation n'a pas de solution et $\\Delta$ ne change pas de signe.<br>"
    if (coeffAA > 0) {
      texteCorr +=
        'Comme le coefficient devant $m^2$ est positif, $\\Delta > 0$.<br>'
      texteCorr +=
        "$\\underline{\\text{Conclusion}}$ : L'équation du départ admet toujours 2 solutions.<br>"
    } else {
      texteCorr +=
        'Comme le coefficient devant $m^2$ est négatif, $\\Delta < 0$.<br>'
      texteCorr +=
        "$\\underline{\\text{Conclusion}}$ : L'équation du départ n'a pas de solution réelle.<br>"
    }
    return texteCorr
  }

  private gererDiscriminantNul(
    texteCorr: string,
    coeffAA: number,
    trinom: Trinome,
  ): string {
    const racine = trinom.x1 as FractionEtendue
    const m1 = racine.texFractionSimplifiee
    texteCorr += `Celui-ci étant nul, l'équation $\\Delta = 0$ a une unique solution $m=\\dfrac{-b}{2a}=${m1}$.<br>`

    if (coeffAA > 0) {
      texteCorr += `De plus le coefficient $${coeffAA}$ devant $m^2$ étant positif, $\\Delta > 0$ si $m\\neq${m1}$.<br>`
      texteCorr += `$\\underline{\\text{Conclusion}}$ : Si $m=${m1}$ l'équation admet une unique solution, sinon l'équation admet 2 solutions.<br>`
    } else {
      texteCorr += `De plus le coefficient $${coeffAA}$ devant $m^2$ étant négatif, $\\Delta < 0$ si $m\\neq${m1}$.<br>`
      texteCorr += `$\\underline{\\text{Conclusion}}$ : Si $m=${m1}$ l'équation admet une unique solution, sinon l'équation n'admet pas de solution.<br>`
    }
    return texteCorr
  }

  private gererDiscriminantPositif(
    texteCorr: string,
    coeffAA: number,
    trinom: Trinome,
  ): string {
    const m1 = trinom.texX1
    const m2 = trinom.texX2
    const x1 = trinom.x1
    const x2 = trinom.x2

    texteCorr +=
      "Celui-ci étant strictement positif, l'équation $\\Delta = 0$ a 2 solutions :<br>"

    if (m1.includes('sqrt')) {
      texteCorr += `$m_1=${m1}\\approx${texNombre(Number(x1), 4)}$ et $m_2=${m2}\\approx${texNombre(Number(x2), 4)}$<br>`
    } else {
      texteCorr += `$m_1=${m1}$ et $m_2=${m2}$<br>`
    }

    if (coeffAA > 0) {
      texteCorr +=
        'De plus le coefficient devant $m^2$ est positif, $\\Delta$ est donc une parabole avec ses branches dirigées vers le haut.<br>'
      texteCorr +=
        "$\\Delta$ est donc positif à l'extérieur des racines et négatif à l'intérieur.<br>"
      texteCorr += `$\\underline{\\text{Conclusion}}$ :<br>
        ${createList({
          items: [
            `Si $m=${m1}$ ou $m=${m2}$, l'équation admet une unique solution;`,
            `Si $m\\in {\\Large]}${m1},${m2}{\\Large[}$, l'équation n'a pas de solution réelle;`,
            `Si $m\\in {\\Large]}-\\infty,${m1}{\\Large[\\cup]}${m2},+\\infty{\\Large[}$, l'équation admet 2 solutions réelles.`,
          ],
          style: 'fleches',
        })}`
    } else {
      texteCorr +=
        'De plus le coefficient devant $m^2$ est négatif, $\\Delta$ est donc une parabole avec ses branches dirigées vers le bas.<br>'
      texteCorr +=
        "$\\Delta$ est donc négatif à l'extérieur des racines et positif à l'intérieur.<br>"
      texteCorr += `$\\underline{\\text{Conclusion}}$ :<br>
        ${createList({
          items: [
            `Si $m=${m1}$ ou $m=${m2}$, l'équation admet une unique solution;`,
            `Si $m\\in {\\Large ]}${m1},${m2}{\\Large [}$, l'équation admet 2 solutions réelles;`,
            `Si $m\\in {\\Large]}-\\infty,${m1}{\\Large[} {\\Large\\cup} {\\Large]}${m2},+\\infty{\\Large[}$, l'équation n'a pas de solution réelle.`,
          ],
          style: 'fleches',
        })}`
    }
    return texteCorr
  }

  /**
   * Cas particuliers: si a(m)=0 (types 2 et 3), traiter l'équation linéaire b(m0)x+c(m0)=0
   * avant d'enchaîner avec le cas général.
   */
  private genererCorrectionCasParticulier(params: ParametresEquation): string {
    const {
      typeQuestion,
      valeurAjustementDeltaA,
      coefMB,
      constB,
      coefMC,
      constC,
    } = params

    let m0: number | null = null
    if (typeQuestion === 2) {
      m0 = 0
    } else if (typeQuestion === 3) {
      m0 = -valeurAjustementDeltaA
    } else {
      return '' // pas de cas particulier pour le type 1
    }

    // Évalue b(m0) et c(m0)
    const b0 = coefMB * (m0 as number) + constB
    const c0 = coefMC * (m0 as number) + constC

    // Formattage de l'équation linéaire
    const eqLin =
      b0 === 0 ? `${c0}` : `${rienSi1(b0)}x${ecritureAlgebrique(c0)}`

    let texte = ''
    texte += `${texteEnCouleurEtGras('Cas particulier :', 'black')} si $m=${m0}$, alors le coefficient de $x^2$ est nul et l'équation n'est plus du second degré.<br>`
    texte += `Elle devient l'équation linéaire $${eqLin}=0$.<br>`

    if (b0 === 0 && c0 === 0) {
      texte +=
        "Il s'agit d'une identité vraie ($0=0$) : l'équation admet une infinité de solutions réelles.<br>"
    } else if (b0 === 0 && c0 !== 0) {
      texte +=
        "Il s'agit d'une contradiction : l'équation n'admet aucune solution réelle.<br>"
    } else {
      const x0 = fraction(-c0, b0).texFractionSimplifiee
      texte += `On obtient une unique solution réelle : $x=${x0}$.<br>`
    }

    texte += `Pour $m\\ne ${m0}$, on retrouve une équation du second degré : on étudie alors le discriminant comme ci-dessous.<br>`
    return texte
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const { equation, coefficients, coeffsDiscriminant, params } =
        this.genererCoefficients(typesDeQuestions[i])
      const expr0 = ce.parse(equation).simplify().latex
      const texte = `$${expr0}=0$`

      // Cas particuliers avant la correction générale
      const introCasParticulier = this.genererCorrectionCasParticulier(params)

      const texteCorrGeneral = this.analyserDiscriminant(
        coefficients,
        coeffsDiscriminant,
      )

      const texteCorr = introCasParticulier + texteCorrGeneral

      if (this.questionJamaisPosee(i, equation)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
