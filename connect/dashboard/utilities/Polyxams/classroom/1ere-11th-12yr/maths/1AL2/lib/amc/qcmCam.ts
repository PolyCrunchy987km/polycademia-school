import type { IExercice, UneProposition } from '../../lib/types'
import { lettreDepuisChiffre } from '../outils/outilString'

export function shuffleJusquaWithIndexes(array: unknown[], lastChoice: number) {
  // Créer une copie du tableau d'entrée
  const newArray = array.map((item) => JSON.parse(JSON.stringify(item)))
  const indexes = Array.from({ length: array.length }, (_, i) => i)

  // Mélanger les éléments jusqu'à l'index lastChoice
  for (let i = lastChoice; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }

  // Retourner le tableau mélangé et les index
  return { shuffledArray: newArray, indexes }
}

export function qcmCamExport(
  exercice: IExercice,
): { question: string; reponse: string }[] {
  const questions: { question: string; reponse: string }[] = []
  if (exercice.autoCorrection.length !== exercice.listeQuestions.length)
    return []
  for (let j = 0; j < exercice.autoCorrection.length; j++) {
    const propositions = exercice.autoCorrection[j].propositions
    if (propositions == null) continue
    if (propositions.length > 4) continue
    const laConsigne =
      exercice.consigne.replaceAll(
        /\$([^$]*)\$/g,
        '<span class="math-tex">$1</span>',
      ) ?? ''
    const introduction =
      exercice.introduction.replaceAll(
        /\$([^$]*)\$/g,
        '<span class="math-tex">$1</span>',
      ) ?? ''
    const laQuestion = exercice.listeQuestions[j]
    const enonceBis = laQuestion
      .split('<div class="my-3">')[0]
      .replaceAll(/\$([^$]*)\$/g, '<span class="math-tex">$1</span>')
    let enonce: string
    if (
      exercice.autoCorrection[j].enonce != null &&
      exercice.autoCorrection[j].enonce !== ''
    ) {
      enonce = `${j === 0 || !laConsigne.startsWith('Parmi les') ? laConsigne : ''}${
        j === 0 && laConsigne !== '' ? '<br>' : ''
      }
        ${introduction != null ? introduction : ''}
          ${introduction != null && introduction !== '' ? '<br>' : ''}
            ${
              exercice.autoCorrection[j].enonce != null
                ? exercice.autoCorrection[j].enonce
                    ?.replaceAll(/&nbsp;/g, ' ')
                    .replaceAll(
                      /\$([^$]*)\$/g,
                      '<span class="math-tex">$1</span>',
                    )
                : ''
            }`
    } else {
      enonce = `${j === 0 ? laConsigne : ''}${
        j === 0 && laConsigne !== '' ? '<br>' : ''
      }
       ${introduction != null ? introduction : ''}
         ${introduction != null && introduction !== '' ? '<br>' : ''}
           ${enonceBis.replaceAll(/&nbsp;/g, ' ')}`
    }

    const props = propositions.map((prop: UneProposition) => prop.texte)
    const statuts = propositions.map((prop: UneProposition) => prop.statut)
    let question = `<h3 data-translate="{&quot;html&quot;:&quot;questions.defaultquestion&quot;}">${enonce?.replaceAll(/\$([^$]*)\$/g, '<span class="math-tex">$1</span>')}</h3><ol>`
    let reponse = ''
    for (let i = 0; i < props.length; i++) {
      const proposition = props[i]
      if (proposition == null) continue
      const prop = proposition.replaceAll(
        /\$([^$]*)\$/g,
        '<span class="math-tex">$1</span>',
      )
      const bonneReponse = statuts[i]
      question += `<li${bonneReponse ? ' class="rondvert"' : ''}>${prop}</li>`
      if (bonneReponse) reponse = lettreDepuisChiffre(i + 1)
    }
    question += '</ol>'
    questions.push({ question, reponse })
  }
  return questions
}

export function qcmCamExportAll(exercices: IExercice[]): string {
  const questionnaire = []
  const listExercices = exercices.slice() // exercices.filter(exo => exo.interactifType === 'qcm')
  let index = 0
  for (const exo of listExercices) {
    const materiel = qcmCamExport(exo)
    for (const { question, reponse } of materiel) {
      questionnaire.push([String(index++), { question, reponse }])
    }
  }
  const questions = questionnaire.map(
    ([index, exo]) => `"${index}":${JSON.stringify(exo)}`,
  )
  const leJson = `{${questions.join(',')}}`
  return leJson
}
