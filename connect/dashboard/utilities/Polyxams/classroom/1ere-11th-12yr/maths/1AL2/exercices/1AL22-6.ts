import {
  tableauSignesFonction,
  tableauVariationsFonction,
} from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import type FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre =
  "Étudier le sens de variations d'une fonction polynôme du second degré"
export const dateDePublication = '04/08/2024'
export const interactifReady = false
export const uuid = '16f97'
export const refs = {
  'fr-fr': ['1AL22-6'],
  'fr-ch': ['1mF3-4'],
}

/**
 *
 * @author Gilles Mora
 */

export default class variationPol2 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Forme développée sur R\n2 : Forme développée sur un intervalle borné\n3 : Forme canonique sur R\n4 : Forme canonique sur un intervalle borné\n5 : Forme factorisée sur R \n6 : Forme factorisée sur un interavlle borné\n7 : Tableau de signes sur R\n8 : Mélange',
    ]
    this.sup = '8'
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 8,
      defaut: 8,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''

      let xMin // La borne gauche de l'intervalle d'étude (prévoir une valeur de remplacement pour les infinis + et -)
      let xMax // La borne droite de l'intervalle d'étude
      let substituts = [] // les valeur de substitution pour xMin ou xMax...
      let tolerance // la tolérance doit être réglée au cas par cas, car pour la dérivée de 1/x entre 17 et 19 par exemple, il y a trop peu de différence avec zéro !
      const nomF = choice(['f']) //, 'g', 'h'
      const a = randint(-5, 5, 0)
      const b = a * randint(-10, 10, 0)
      const c = randint(-10, 10, 0)
      const p = new Trinome(a, b, c)
      const fonction = (x: number | FractionEtendue) =>
        a * Number(x) ** 2 + b * Number(x) + c // forme développée
      const derivee = (x: number | FractionEtendue) => 2 * a * Number(x) + b // Sa dérivée
      const a1 = randint(-3, 3, [-1, 0, 1])
      const rac1 = randint(-5, 5, 0)
      const rac2 = rac1 + 2 * randint(1, 4)
      const q = new Trinome(a1, -rac1 - rac2, rac1 * rac2)
      q.defFormeFactorisee(a1, rac1, rac2) //
      const fonctionFactorisee = (x: number | FractionEtendue) =>
        a1 * Number(x) ** 2 -
        a1 * rac1 * Number(x) -
        a1 * rac2 * Number(x) +
        a1 * rac1 * rac2 // Forme factorisée
      const deriveeFactorisee = (x: number | FractionEtendue) =>
        2 * a1 * Number(x) - a1 * rac1 - a1 * rac2 // Sa dérivée
      const borneInf = randint(-5, 5, Math.floor(-b / (2 * a)))
      const borneSup = randint(borneInf + 1, 10, Math.floor(-b / (2 * a)))
      const intervalle =
        listeDeQuestions[i] === 1 ||
        listeDeQuestions[i] === 3 ||
        listeDeQuestions[i] === 5 ||
        listeDeQuestions[i] === 7
          ? '\\mathbb{R}'
          : `[${borneInf}\\,;\\,${borneSup}]`
      const texte1 = `On considère la fonction $${nomF}$ définie sur $${intervalle}$ par : `
      const texte2 = `Dresser le tableau de  variations de la fonction $${nomF}$ sur $${intervalle}$.`
      const CorrFormeD1 = `On reconnaît la forme développée d'une fonction polynôme du second degré $ax^2+bx+c$ avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
            Comme $a ${a > 0 ? '>' : '<'} 0$, la fonction est d'abord ${a > 0 ? 'décroissante' : 'croissante'} puis ${a > 0 ? 'croissante' : 'décroissante'}.<br>
            Le changement de variation s'opère en $\\alpha=-\\dfrac{b}{2a}=\\dfrac{-${ecritureParentheseSiNegatif(b)}}{2\\times ${ecritureParentheseSiNegatif(a)}}
            =${p.alpha.simplifie().texFSD}$.<br><br>` // forme développée
      const CorrFormeD2 = `De plus, $${nomF}\\left(${p.alpha.simplifie().texFSD}\\right)=${p.texCalculImage(p.alpha.simplifie())}$.<br><br>
           ` // forme développée
      const CorrFormeD3 = `Comme $${p.alpha.simplifie().texFSD} \\notin [${borneInf}\\,;\\,${borneSup}]$, la fonction $${nomF}$ ne change pas de variation sur $[${borneInf}\\,;\\,${borneSup}]$.<br><br>
           `
      const CorrCalcImages = `On a $${nomF}(${borneInf})=${p.texCalculImage(borneInf)}$ et $${nomF}(${borneSup})=${p.texCalculImage(borneSup)}$.<br><br>`
      const CorrCalcImagesF = `On a $${nomF}(${borneInf})=${q.texCalculImage(borneInf)}$ et $${nomF}(${borneSup})=${q.texCalculImage(borneSup)}$.<br><br>`
      const CorrToutesFormes = `On en déduit le tableau de variations de $${nomF}$ sur $${intervalle}$ : <br><br>`
      const CorrFormeC = `On reconnaît la forme canonique d'une fonction polynôme du second degré $a(x-\\alpha)^2+\\beta$, avec $a=${a}$, $\\alpha=${p.alpha.simplifie().texFSD}$ et $\\beta=${p.beta.simplifie().texFSD}$.<br>
         Comme $a ${a > 0 ? '>' : '<'} 0$, la fonction est d'abord ${a > 0 ? 'décroissante' : 'croissante'} puis ${a > 0 ? 'croissante' : 'décroissante'}.<br>
          Le changement de variation s'opère en $\\alpha$ et l'extremum vaut  $\\beta$.<br><br>`
      const CorrFormeF = `On reconnaît la forme factorisée d'une fonction polynôme du second degré $a(x-x_1)(x-x_2)$ avec $a=${a1}$, $x_1=${rac1}$ et $x_2=${rac2}$.<br>
         Comme $a ${a1 > 0 ? '>' : '<'} 0$, la fonction est d'abord ${a1 > 0 ? 'décroissante' : 'croissante'} puis ${a1 > 0 ? 'croissante' : 'décroissante'}.<br>
          Le changement de variation s'opère en $\\alpha=\\dfrac{x_1+x_2}{2}$ et l'extremum vaut $\\beta=${nomF}(\\alpha)$.<br><br>
          $\\alpha=\\dfrac{${rac1}+${ecritureParentheseSiNegatif(rac2)}}{2}=${q.alpha.simplifie().texFSD}$ et $${nomF}\\left(${q.alpha.simplifie().texFSD}\\right)
          =${a1}\\left(${q.alpha.simplifie().texFSD}${ecritureAlgebrique(-rac1)}\\right)\\left(${q.alpha.simplifie().texFSD}${ecritureAlgebrique(-rac2)}\\right)
          =${q.beta.simplifie().texFSD}$.<br><br>`
      const CorrTableauSignes = `Le tableau de signes donne les racines de la fonction $${nomF}$ : $x_1=${rac1}$ et $x_2=${rac2}$.<br>
                   Le signe de $a$ est donné par le signe dans le tableau à l'extérieur des racines.<br>
                  On en déduit $a ${a1 > 0 ? '>' : '<'} 0$.<br>
                   Ainsi,  la fonction est d'abord ${a1 > 0 ? 'décroissante' : 'croissante'} puis ${a1 > 0 ? 'croissante' : 'décroissante'}.<br><br>
           Le changement de variation s'opère en $\\alpha=\\dfrac{x_1+x_2}{2}$ et l'extremum vaut $\\beta=${nomF}(\\alpha)$.<br><br>
           $\\alpha=\\dfrac{${rac1}+${rac2}}{2}=${q.alpha.simplifie().texFSD}$ et $${nomF}\\left(${q.alpha.simplifie().texFSD}\\right)
           =${q.beta.simplifie().texFSD}$ (donné dans l'énoncé).<br><br>`
      switch (listeDeQuestions[i]) {
        case 1: // cas forme développée
          tolerance = 0.005
          xMin = -100
          xMax = 100
          substituts = [
            { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
            {
              antVal: -b / (2 * a),
              antTex: p.alpha.simplifie().texFSD,
              imgVal: fonction(-b / (2 * a)),
              imgTex: `$${p.beta.simplifie().texFSD}$`,
            },
            { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
          ]
          texte = `${texte1}`
          texte += `$${nomF}(x)=${p}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeD1}`
          texteCorr += `${CorrFormeD2}`
          texteCorr += `${CorrToutesFormes}`
          texteCorr += tableauVariationsFonction(
            fonction,
            derivee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 0.5, tolerance },
          )
          break

        case 2: // forme développée sur un intervalle
          tolerance = 0.005
          xMin = borneInf
          xMax = borneSup
          substituts = [
            {
              antVal: borneInf,
              antTex: `$${borneInf}$`,
              imgVal: Number(p.image(borneInf)),
              imgTex: `$${p.image(borneInf).texFraction}$`,
            },
            {
              antVal: -b / (2 * a),
              antTex: p.alpha.simplifie().texFSD,
              imgVal: fonction(-b / (2 * a)),
              imgTex: `$${p.beta.simplifie().texFSD}$`,
            },
            {
              antVal: borneSup,
              antTex: `${borneSup}`,
              imgVal: Number(p.image(borneSup)),
              imgTex: `$${p.image(borneSup).texFraction}$`,
            },
          ]
          texte = `${texte1}`
          texte += `$${nomF}(x)=${p}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeD1}`
          if (-b / (2 * a) <= borneInf || -b / (2 * a) >= borneSup) {
            texteCorr += `${CorrFormeD3}`
            texteCorr += ` ${CorrCalcImages}`
            texteCorr += `${CorrToutesFormes}`
          } else {
            texteCorr += `De plus, $${nomF}\\left(${p.alpha.simplifie().texFSD}\\right)=${p.texCalculImage(p.alpha.simplifie())}$.<br><br>`
            texteCorr += ` ${CorrCalcImages}`
            texteCorr += `${CorrToutesFormes}`
          }
          texteCorr += tableauVariationsFonction(
            fonction,
            derivee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 0.5, tolerance },
          )
          break

        case 3: // Forme canonique sur R
          tolerance = 0.005
          xMin = -100
          xMax = 100
          substituts = [
            { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
            {
              antVal: -b / (2 * a),
              antTex: p.alpha.simplifie().texFSD,
              imgVal: fonction(-b / (2 * a)),
              imgTex: `$${p.beta.simplifie().texFSD}$`,
            },
            { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
          ]
          texte = `${texte1}`
          texte += `$${nomF}(x)=${p.texFormeCanonique}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeC}`
          texteCorr += `${CorrToutesFormes}`
          texteCorr += tableauVariationsFonction(
            fonction,
            derivee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 0.5, tolerance },
          )
          break

        case 4: // Forme canonique sur un intervalle
          tolerance = 0.005
          xMin = borneInf
          xMax = borneSup
          substituts = [
            {
              antVal: borneInf,
              antTex: `$${borneInf}$`,
              imgVal: Number(p.image(borneInf)),
              imgTex: `$${p.image(borneInf).texFraction}$`,
            },
            {
              antVal: -b / (2 * a),
              antTex: p.alpha.simplifie().texFSD,
              imgVal: fonction(-b / (2 * a)),
              imgTex: `$${p.beta.simplifie().texFSD}$`,
            },
            {
              antVal: borneSup,
              antTex: `${borneSup}`,
              imgVal: Number(p.image(borneSup)),
              imgTex: `$${p.image(borneSup).texFraction}$`,
            },
          ]

          texte = `${texte1}`
          texte += `$${nomF}(x)=${p.texFormeCanonique}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeC}`
          if (-b / (2 * a) <= borneInf || -b / (2 * a) >= borneSup) {
            texteCorr += `${CorrFormeD3}`
            texteCorr += ` ${CorrCalcImages}`
            texteCorr += `${CorrToutesFormes}`
          } else {
            texteCorr += ` ${CorrCalcImages}`
            texteCorr += `${CorrToutesFormes}`
          }
          texteCorr += tableauVariationsFonction(
            fonction,
            derivee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 0.5, tolerance },
          )
          break
        case 5: // Forme factorisée sur R
          tolerance = 0.005
          xMin = -100
          xMax = 100
          substituts = [
            { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
            {
              antVal: (rac1 + rac2) / 2,
              antTex: q.alpha.simplifie().texFSD,
              imgVal: fonctionFactorisee((rac1 + rac2) / 2),
              imgTex: `$${q.beta.simplifie().texFSD}$`,
            },
            { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
          ]
          texte = `${texte1}`
          texte += `$${nomF}(x)=${q.texFormeFactorisee}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeF}`
          texteCorr += `${CorrToutesFormes}`
          texteCorr += tableauVariationsFonction(
            fonctionFactorisee,
            deriveeFactorisee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 1, tolerance },
          )
          break
        case 6: // Forme factorisée sur intervalle
          tolerance = 0.005
          xMin = borneInf
          xMax = borneSup
          substituts = [
            {
              antVal: borneInf,
              antTex: `$${borneInf}$`,
              imgVal: Number(q.image(borneInf)),
              imgTex: `$${q.image(borneInf).texFraction}$`,
            },
            {
              antVal: (rac1 + rac2) / 2,
              antTex: q.alpha.simplifie().texFSD,
              imgVal: fonction((rac1 + rac2) / 2),
              imgTex: `$${q.beta.simplifie().texFSD}$`,
            },
            {
              antVal: borneSup,
              antTex: `${borneSup}`,
              imgVal: Number(q.image(borneSup)),
              imgTex: `$${q.image(borneSup).texFraction}$`,
            },
          ]

          texte = `${texte1}`
          texte += `$${nomF}(x)=${q.texFormeFactorisee}$.<br>`
          texte += `${texte2}`
          texteCorr = `${CorrFormeF}`
          if ((rac1 + rac2) / 2 <= borneInf || (rac1 + rac2) / 2 >= borneSup) {
            texteCorr += `Comme $${q.alpha.simplifie().texFSD} \\notin [${borneInf}\\,;\\,${borneSup}]$, la fonction $${nomF}$ ne change pas de variation sur $[${borneInf}\\,;\\,${borneSup}]$.<br><br>
           `
            texteCorr += ` ${CorrCalcImagesF}`
            texteCorr += `${CorrToutesFormes}`
          } else {
            texteCorr += ` ${CorrCalcImagesF}`
            texteCorr += `${CorrToutesFormes}`
          }
          texteCorr += tableauVariationsFonction(
            fonctionFactorisee,
            deriveeFactorisee,
            xMin,
            xMax,
            { ligneDerivee: false, substituts, step: 0.5, tolerance },
          )
          break
        case 7: // avec tableau de signes sur R
          tolerance = 0.005
          xMin = -100
          xMax = 100
          texte =
            "Le tableau suivant est le tableau de signes d'une fonction polynôme du second degré.<br><br>" +
            tableauSignesFonction(fonctionFactorisee, -100, 100, {
              step: 0.1,
              tolerance: 0.001,
              substituts: [
                { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
                { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
              ],
            })
          texte += `<br>Dresser le tableau de variations de la fonction $${nomF}$ sur $\\mathbb{R}$ sachant que son extrémum vaut $${q.beta.simplifie().texFSD}$.`
          texteCorr = `${CorrTableauSignes}`
          texteCorr += `${CorrToutesFormes}`
          texteCorr += tableauVariationsFonction(
            fonctionFactorisee,
            deriveeFactorisee,
            xMin,
            xMax,
            {
              ligneDerivee: false,
              substituts: [
                { antVal: -100, antTex: '$-\\infty$', imgTex: ' ' },
                {
                  antVal: (rac1 + rac2) / 2,
                  antTex: q.alpha.simplifie().texFSD,
                  imgVal: fonctionFactorisee((rac1 + rac2) / 2),
                  imgTex: `$${q.beta.simplifie().texFSD}$`,
                },
                { antVal: 100, antTex: '$+\\infty$', imgTex: ' ' },
              ],
              step: 0.5,
              tolerance: 0.001,
            },
          )
          break
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
