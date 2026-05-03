import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { egalOuApprox, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Convertir des degrés en radians et inversement'
export const dateDePublication = '13/11/2025'
export const dateDeModifImportante = '13/11/2025'
export const uuid = '03179'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = {
  'fr-fr': ['1AN44'],
  'fr-ch': [],
}

/**
 * Convertir des degrés en radians et inversement
 * @author Claire Rousset

 */

export default class ConvDegRad extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.spacingCorr = 3
    this.correctionDetailleeDisponible = true

    // Formulaire texte : choix du type de conversion
    this.besoinFormulaireTexte = [
      'Type de conversion (nombre séparés par des tirets)',
      '1 : Conversion de degré en radians\n2 : Conversion de radians en degrés\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Uniquement des valeurs remarquables ']
    this.sup = '1' // par défaut : degrés → radians
    this.sup2 = false // par défaut : valeurs non remarquables
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
    })

    const degRemarquables = [
      0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
      360,
    ]

    const radRemarquables = [
      { k: 1, d: 6 }, // π/6 = 30°
      { k: 1, d: 4 }, // π/4 = 45°
      { k: 1, d: 3 }, // π/3 = 60°
      { k: 1, d: 2 }, // π/2 = 90°
      { k: 2, d: 3 }, // 2π/3 = 120°
      { k: 3, d: 4 }, // 3π/4 = 135°
      { k: 5, d: 6 }, // 5π/6 = 150°
      { k: 1, d: 1 }, // π = 180°
      { k: 7, d: 6 }, // 7π/6 = 210°
      { k: 5, d: 4 }, // 5π/4 = 225°
      { k: 4, d: 3 }, // 4π/3 = 240°
      { k: 3, d: 2 }, // 3π/2 = 270°
      { k: 5, d: 3 }, // 5π/3 = 300°
      { k: 7, d: 4 }, // 7π/4 = 315°
      { k: 11, d: 6 }, // 11π/6 = 330°
      { k: 2, d: 1 }, // 2π = 360°
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      // Nombre de questions à changer pour cas remarquable
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      let degre: number
      let texteApres = ''
      const seulementRemarquables = this.sup2

      switch (listeTypeQuestions[i]) {
        case 1: // deg2rad
          texteApres = `$\\text{ rad}$ `
          if (seulementRemarquables) {
            const index = randint(0, degRemarquables.length - 1)
            degre = degRemarquables[index]
          } else {
            degre = randint(1, 360)
          }

          if (degre === 0) {
            reponse = '0'
          } else {
            const rad = new FractionEtendue(degre, 180)
            if (rad.d === 1) {
              reponse = `${rienSi1(rad.n)}\\pi`
            } else {
              reponse = `\\dfrac{${rienSi1(rad.n)}\\pi}{${rad.d}}`
            }
          }

          texte = `Convertir $${degre}^\\circ$ en radians.`

          if (degre === 180) {
            texteCorr = `On sait que $360^\\circ = 2 \\pi \\text{ rad}$. Donc, en divisant par $2$, $180 ^\\circ= ${miseEnEvidence(reponse)} \\text{ rad}$.`
          } else {
            if (this.correctionDetaillee) {
              texteCorr = `Puisque $180^\\circ = \\pi \\text{ rad}$, alors $1^\\circ = \\dfrac{\\pi}{180} \\text{ rad}$.<br>`
              texteCorr += `Ainsi, $${texNombre(degre, 0)} ^\\circ = ${texNombre(degre, 0)} \\times \\dfrac{\\pi}{180} \\text{ rad} = ${miseEnEvidence(reponse)} \\text{ rad}$.`
            } else {
              texteCorr = 'On sait que $180^\\circ = \\pi \\text{ rad}$.<br>'
              texteCorr += `Donc, pour convertir des degrés en radians, on multiplie par $\\dfrac{\\pi}{180}$.<br>`
              texteCorr += `$${texNombre(degre, 0)} \\times \\dfrac{\\pi}{180} = ${reponse}$<br>`
              texteCorr += `Ainsi, $${texNombre(degre, 0)} ^\\circ = ${miseEnEvidence(reponse)} \\text{ rad}$.`
            }
          }

          break
        default: // rad2deg
          texteApres = `$^\\circ$ `
          if (seulementRemarquables) {
            const index = randint(0, radRemarquables.length - 1)
            const { k, d } = radRemarquables[index]
            const deg = (k * 180) / d
            reponse = `${deg}`
            const reponseInter = k * 180

            let valRadRemarquable: string
            if (d === 1) {
              valRadRemarquable = `${rienSi1(k)}\\pi`
            } else {
              valRadRemarquable = `\\dfrac{${rienSi1(k)}\\pi}{${d}}`
            }

            texte = `Convertir $${valRadRemarquable} \\text{ rad}$ en degrés.`
            if (k === 1 && d === 1) {
              texteCorr = `On sait que $2 \\pi \\text{ rad} = 360^\\circ$. Donc, en divisant par $2$, $\\pi \\text{ rad} = ${miseEnEvidence(reponse)} ^\\circ $.<br>`
            } else {
              if (this.correctionDetaillee) {
                if (d === 1) {
                  texteCorr = `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $${k} \\pi \\text{ rad} = ${k} \\times 180 ^\\circ = ${miseEnEvidence(reponse)} ^\\circ$.<br>`
                } else {
                  if (k === 1) {
                    texteCorr += `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $${valRadRemarquable} \\text{ rad} = \\dfrac{${reponseInter} ^\\circ}{${d}} = ${miseEnEvidence(reponse)} ^\\circ $. `
                  } else {
                    texteCorr = `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $${k} \\pi \\text{ rad} = ${k} \\times 180 ^\\circ = ${reponseInter} ^\\circ$.<br>`
                    texteCorr += `Ainsi, $${valRadRemarquable} \\text{ rad}= \\dfrac{${reponseInter} ^\\circ}{${d}} = ${miseEnEvidence(reponse)} ^\\circ $. `
                  }
                }
              } else {
                texteCorr = `On sait que $\\pi \\text{ rad}= 180^\\circ$.<br>`
                texteCorr += `Donc, pour convertir des radians en degrés, on multiplie par $\\dfrac{180}{\\pi}$.<br>`
                texteCorr += `$${valRadRemarquable} \\times \\dfrac{180}{\\pi} = ${reponse}.$ <br>`
                texteCorr += `Ainsi, $${valRadRemarquable} \\text{ rad}= ${miseEnEvidence(reponse)} ^\\circ $.`
              }
            }
          } else {
            const a = randint(1, 50)
            const b = randint(1, 50)
            const valRad = new FractionEtendue(a, b)
            let valRadsimp: string
            if (valRad.d === 1) {
              valRadsimp = `${rienSi1(valRad.n)}\\pi`
            } else {
              valRadsimp = `\\dfrac{${rienSi1(valRad.n)}\\pi}{${valRad.d}}`
            }

            const deg2 = valRad.valeurDecimale * 180
            reponse = `${texNombre(deg2, 1)}`

            texte = `Convertir $${valRadsimp} \\text{ rad}$ en degrés. Arrondir au dixième de degré près si nécessaire.`
            if (valRad.n === 1 && valRad.d === 1) {
              texteCorr = `On sait que $2 \\pi \\text{ rad} = 360^\\circ$. Donc, en divisant par $2$, $\\pi \\text{ rad} = ${miseEnEvidence(reponse)} ^\\circ $.<br>`
            } else {
              const symbole = egalOuApprox(deg2, 1)
              const reponseInter = valRad.n * 180

              if (this.correctionDetaillee) {
                if (valRad.d === 1) {
                  texteCorr = `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $${valRad.n} \\pi \\text{ rad} = ${valRad.n} \\times 180 ^\\circ = ${miseEnEvidence(reponse)} ^\\circ$.<br>`
                } else {
                  if (valRad.n === 1) {
                    texteCorr = `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $ \\dfrac{\\pi}{${valRad.d}} \\text{ rad} = \\dfrac{180 ^\\circ} {${valRad.d}} ${symbole} ${miseEnEvidence(reponse)}  ^\\circ $. `
                  } else {
                    texteCorr = `Puisque $\\pi \\text{ rad} = 180^\\circ$, alors $${valRad.n} \\pi \\text{ rad} = ${valRad.n} \\times 180 ^\\circ = ${reponseInter} ^\\circ.$ <br>`
                    texteCorr += `Ainsi, $${valRadsimp} \\text{ rad} = \\dfrac{${reponseInter}}{${valRad.d}}^\\circ  ${symbole} ${miseEnEvidence(reponse)}  ^\\circ $.`
                  }
                }
              } else {
                texteCorr = `On sait que $\\pi \\text{ rad} = 180^\\circ$.<br>`
                texteCorr += `Donc, pour convertir des radians en degrés, on multiplie par $\\dfrac{180}{\\pi}$.<br>`
                texteCorr += `$${valRadsimp} \\times \\dfrac{180}{\\pi}  ${symbole} ${reponse}$. <br>`
                texteCorr += `Ainsi, $${valRadsimp} \\text{ rad}  ${symbole} ${miseEnEvidence(reponse)} ^\\circ . $`
              }
            }
          }
          break
      }

      if (this.interactif) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        texte += `<br>`
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.grecTrigo, {
          texteApres,
        })
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
