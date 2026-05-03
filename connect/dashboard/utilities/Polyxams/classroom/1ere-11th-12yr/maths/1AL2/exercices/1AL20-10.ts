import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  contraindreValeur,
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { setReponse } from '../../lib/interactif/gestionInteractif'

export const titre = "Calculer le discriminant d'un polynôme du second degré"
export const interactifReady = true
export const interactifType = 'mathLive'
export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '5/11/2023'
export const uuid = '731f0'

export const refs = {
  'fr-fr': ['1AL20-10'],
  'fr-ch': ['11FA10-8'],
}
export default class CalculerDiscriminant extends Exercice {
  constructor() {
    super()

    this.besoinFormulaireNumerique = [
      'Niveaux de difficulté',
      4,
      '1 : Coefficients entiers positifs\n2 : Coefficients entiers relatifs\n3 : Coefficients rationnels\n4 : Mélange',
    ]
    this.nbQuestions = 5
    this.sup = 2
    this.listeAvecNumerotation = false
  }

  nouvelleVersion() {
    this.sup = contraindreValeur(1, 4, this.sup, 1)

    if (this.nbQuestions > 1)
      this.consigne = 'Calculer le discriminant de chacune de ces expressions.'
    else this.consigne = "Calculer le discriminant de l'expression suivante."
    let listeTypesDeQuestions
    if (this.sup < 4)
      listeTypesDeQuestions = combinaisonListes([this.sup], this.nbQuestions)
    else listeTypesDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions)
    let a, b, c
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      switch (listeTypesDeQuestions[i]) {
        case 1:
          a = randint(1, 5)
          b = randint(0, 5)
          c = randint(0, 5)
          break
        case 2:
          a = randint(-5, 5, 0)
          b = randint(-5, 5)
          c = randint(-5, 5)
          break
        case 3:
        default:
          a = new FractionEtendue(randint(-9, 9), choice([2, 3, 5]))
          b = new FractionEtendue(randint(-9, 9), choice([2, 3, 5]))
          c = new FractionEtendue(randint(-9, 9), choice([2, 3, 5]))
          break
      }
      const p = new Trinome(a, b, c)

      texte = `$${lettreDepuisChiffre(i + 1)}(x) = ${p.tex}$.`
      if (this.interactif) {
        texte +=
          '<br><br>' +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers, {
            texteAvant: '$\\Delta = $',
          })
        setReponse(this, i, p.discriminant)
      }
      texteCorr = `$\\Delta_${lettreDepuisChiffre(i + 1)} = ${p.texCalculDiscriminantSansResultat}$`
      texteCorr += `<br><br>$\\Delta_${lettreDepuisChiffre(i + 1)} = ${miseEnEvidence(p.discriminant.texFractionSimplifiee)}$`
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
