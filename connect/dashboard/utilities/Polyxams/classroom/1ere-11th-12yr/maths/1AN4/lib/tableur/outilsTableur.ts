import { randint } from '../../modules/outils'
import { toutPourUnPoint } from '../interactif/mathLive'
import type { GoodAnswersFormulas, IExercice, SheetTestDatas } from '../types'
import { MySpreadsheetElement } from './MySpreadSheet'

export function compareSheetFunction(
  exercice: IExercice,
  question: number,
  goodAnswers: GoodAnswersFormulas,
  sheetTestDatas: SheetTestDatas,
  userSheet: MySpreadsheetElement,
): { isOk: boolean; messages: string } {
  // 1. Récupère les données de l'utilisateur
  const userData = userSheet.getData()
  // D'abord contrôler que des formules sont bien présentes aux bons endroits
  const messages: string[] = []
  let testFormulas = true
  let goodFormulas = 0
  goodAnswers.forEach((cellData) => {
    const cellRef = cellData.ref
    const col = cellRef.charCodeAt(0) - 65
    const row = parseInt(cellRef.slice(1)) - 1
    if (cellData.formula && cellData.value === undefined) {
      const userFormula = userSheet.getCellFormula(col, row)
      if (!userFormula.startsWith('=')) {
        messages.push(
          `La cellule ${cellRef} devrait contenir une formule mais elle ne contient pas de formule.<br>`,
        )
        testFormulas = false
        const style: Record<string, string> = {}
        style[cellRef] =
          'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
        userSheet.setCellStyle(style)
        return
      }
      if (
        String(userFormula).toUpperCase() === cellData.formula.toUpperCase()
      ) {
        const style: Record<string, string> = {}
        style[cellRef] =
          'background-color: #ccffcc; border: 2px solid #008000; border-radius: 8px; padding: 4px;'
        userSheet.setCellStyle(style)
        goodFormulas++
      }
    } else if (cellData.value !== undefined) {
      const userValue = userSheet.getCellValue(col, row)
      if (userValue === cellData.value) {
        const style: Record<string, string> = {}
        style[cellRef] =
          'background-color: #ccffcc; border: 2px solid #008000; border-radius: 8px; padding: 4px;'
        userSheet.setCellStyle(style)
        goodFormulas++
      }
    } else {
      window.notify(
        `compareSheetFunction: cellData invalide ${JSON.stringify(
          cellData,
        )} pour la question ${question} de l'exercice ${exercice.id}`,
        { exercice, question, cellData },
      )
    }
  })
  if (testFormulas && goodFormulas === goodAnswers.length) {
    return {
      isOk: true,
      messages:
        goodAnswers.length === 1
          ? '✅ La saisie est correcte !'
          : '✅ Toutes les saisies sont correctes !',
    }
  }
  let maxMessages = ''
  // sinon contrôler que les résultats sont corrects pour différentes valeurs avec les formules saisies par l'utilisateur

  const testSheetForGoodAnswers = MySpreadsheetElement.create({
    data: userData,
    minDimensions: userSheet.getMinDimensions(),
    style: userSheet.getStyle(),
    columns: userSheet.getColumns(),
    interactif: false,
    id: 'testSheet',
  })

  const testSheetForUserResponses = MySpreadsheetElement.create({
    data: userData,
    minDimensions: userSheet.getMinDimensions(),
    style: userSheet.getStyle(),
    columns: userSheet.getColumns(),
    interactif: false,
    id: 'testSheetUser',
  })
  testSheetForGoodAnswers.style.position = 'absolute'
  testSheetForGoodAnswers.style.left = '-9999px'
  document.body.appendChild(testSheetForGoodAnswers)
  goodAnswers.forEach((cellData) => {
    const cellRef = cellData.ref
    const col = cellRef.charCodeAt(0) - 65
    const row = parseInt(cellRef.slice(1)) - 1
    // Remettre les bonnes formules
    if (cellData.formula) {
      testSheetForGoodAnswers.setCellFormula(col, row, cellData.formula)
    } else if (cellData.value !== undefined) {
      testSheetForGoodAnswers.setCellValue(col, row, cellData.value)
    }
  })
  testSheetForUserResponses.style.position = 'absolute'
  testSheetForUserResponses.style.left = '-5999px'
  document.body.appendChild(testSheetForUserResponses)
  const messagesPerTest: string[][] = []
  goodAnswers.forEach(() => {
    messagesPerTest.push([])
  })
  goodAnswers.forEach((cellData, answerIndex) => {
    const cellRef = cellData.ref
    const col = cellRef.charCodeAt(0) - 65
    const row = parseInt(cellRef.slice(1)) - 1
    sheetTestDatas.forEach((testData) => {
      // Appliquer les valeurs de test
      const testCellRef = testData.ref
      if (testCellRef.includes(':')) {
        const [startRef, endRef] = testCellRef.split(':')
        const startCol = startRef.charCodeAt(0) - 65
        const startRow = parseInt(startRef.slice(1)) - 1
        const endCol = endRef.charCodeAt(0) - 65
        const endRow = parseInt(endRef.slice(1)) - 1
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const [min, max] = testData.rangeValues
            const randomValue = randint(min, max)
            testSheetForGoodAnswers.setCellValue(c, r, randomValue)
            testSheetForUserResponses.setCellValue(c, r, randomValue)
          }
        }
        // Recalculer les deux feuilles
        const goodAnswerValue = testSheetForGoodAnswers.getCellValue(col, row)
        const userAnswerValue = testSheetForUserResponses.getCellValue(col, row)
        if (goodAnswerValue !== userAnswerValue) {
          const style: Record<string, string> = {}
          style[cellRef] =
            'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
          userSheet.setCellStyle(style)
          messagesPerTest[answerIndex].push(
            `La saisie de la cellule ${cellRef} [${userSheet.getCellFormula(col, row)}] est incorrecte .<br>`,
          )
        }
      } else {
        const testCol = testCellRef.charCodeAt(0) - 65
        const testRow = parseInt(testCellRef.slice(1)) - 1
        const [min, max] = testData.rangeValues
        const randomValue = randint(min, max)
        testSheetForGoodAnswers.setCellValue(testCol, testRow, randomValue)
        testSheetForUserResponses.setCellValue(testCol, testRow, randomValue)
        // Recalculer les deux feuilles
        const goodAnswerValue = testSheetForGoodAnswers.getCellValue(col, row)
        const userAnswerValue = testSheetForUserResponses.getCellValue(col, row)
        if (goodAnswerValue !== userAnswerValue) {
          const style: Record<string, string> = {}
          style[cellRef] =
            'background-color: #ffcccc; border: 2px solid #ff0000; border-radius: 8px; padding: 4px;'
          userSheet.setCellStyle(style)
          messagesPerTest[answerIndex].push(
            `La saisie de la cellule ${cellRef} [${userSheet.getCellFormula(col, row)}] est incorrecte .<br>`,
          )
        }
      }
    })
  })
  // Consolider les messages
  messages.push(...messagesPerTest.flat())

  maxMessages = messages.sort((a, b) => b.length - a.length)[0] ?? ''

  document.body.removeChild(testSheetForGoodAnswers)
  document.body.removeChild(testSheetForUserResponses)
  const feedback =
    maxMessages.length === 0
      ? '✅ Toutes les saisies sont correctes !'
      : '❌ Des erreurs ont été détéctées.'
  return {
    isOk: maxMessages.length === 0,
    messages: maxMessages + feedback,
  }
}

export function verifQuestionTableur(
  exercice: IExercice,
  questionIndex: number,
): {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
} {
  if (exercice.autoCorrection[questionIndex]?.reponse == null) {
    throw Error(
      `verifQuestionMathlive appelé sur une question sans réponse: ${JSON.stringify(
        {
          exercice,
          question: questionIndex,
          autoCorrection: exercice.autoCorrection[questionIndex],
        },
      )}`,
    )
  }
  if (exercice.autoCorrection[questionIndex].reponse.param == null) {
    window.notify(
      `verifQuestionTableur appelé sur une question sans param : ${JSON.stringify(
        {
          exercice,
          question: questionIndex,
          param: exercice.autoCorrection[questionIndex].reponse,
        },
      )}`,
      { exercice, questionIndex },
    )
  }

  if (exercice.answers === undefined) exercice.answers = {}
  const reponses = exercice.autoCorrection[questionIndex].reponse.valeur
  if (reponses == null) {
    window.notify(
      `verifQuestionTableur: reponses est null pour la question ${questionIndex} de l'exercice ${exercice.id}`,
      { exercice, questionIndex },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  const bareme: (arg: number[]) => [number, number] =
    reponses.bareme ?? toutPourUnPoint
  const sheetAnswer = reponses.sheetAnswer
  if (sheetAnswer == null) {
    window.notify(
      `verifQuestionTableur: sheetAnswer est null pour la question ${questionIndex} de l'exercice ${exercice.id}`,
      { exercice, questionIndex },
    )
    return {
      isOk: false,
      feedback: 'erreur dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }
  let result: string[] = []
  const goodAnswersFormulas = sheetAnswer.goodAnswerFormulas
  const sheetTestDatas = sheetAnswer.sheetTestDatas

  const sheetElement = document.getElementById(
    `sheet-Ex${exercice.numeroExercice}Q${questionIndex}`,
  ) as MySpreadsheetElement
  if (!sheetElement) {
    if (!sheetElement) {
      console.error(
        `sheet-Ex${exercice.numeroExercice}Q${questionIndex} not found`,
      )
      result = goodAnswersFormulas.map(() => 'KO')
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: result.length },
      }
    }
  }
  if (sheetElement && sheetElement.isMounted()) {
    exercice.answers[`sheet-Ex${exercice.numeroExercice}Q${questionIndex}`] =
      JSON.stringify(sheetElement.getData())
    const spanResultat = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const divFeedback = document.querySelector<HTMLElement>(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const { isOk, messages } = compareSheetFunction(
      exercice,
      questionIndex,
      goodAnswersFormulas,
      sheetTestDatas,
      sheetElement,
    )
    if (messages.length > 0 && spanResultat && divFeedback) {
      divFeedback.innerHTML = messages
      if (!isOk) {
        if (spanResultat) spanResultat.innerHTML = '☹️'
        result = goodAnswersFormulas.map(() => 'KO')
      } else {
        if (spanResultat) spanResultat.innerHTML = '😎'
        result = goodAnswersFormulas.map(() => 'OK')
      }
    }
  } else {
    console.error(
      `sheet-Ex${exercice.numeroExercice}Q${questionIndex} is not mounted`,
    )
    result = goodAnswersFormulas.map(() => 'KO')
  }
  const [nbBonnesReponses, nbReponses] = bareme(
    result.map((res) => (res === 'OK' ? 1 : 0)),
  )
  return {
    isOk: nbBonnesReponses === nbReponses,
    feedback: '', // feedback géré dans compareSheetFunction
    score: { nbBonnesReponses, nbReponses },
  }
}

export function createTableurLatex(
  rowNbr: number,
  colNbr: number,
  data: any,
  styles: any,
  options: {
    formule?: boolean
    formuleTexte?: string
    formuleCellule?: string
    firstColHeaderWidth?: string
  } = {},
) {
  let output = `\\begin{tabularx}{0.9\\linewidth}
  {|>{\\cellcolor{lightgray}}c|
  ${options.firstColHeaderWidth ? `>{\\centering \\arraybackslash}p{${options.firstColHeaderWidth}}|` : '>{\\centering \\arraybackslash}X|'}
  *{${colNbr - 1}}{>{\\centering \\arraybackslash}X|}}\\hline\n`

  if (options.formule) {
    output += `\\multicolumn{1}{|l}{${options.formuleCellule}}&\\multicolumn{1}{r|}{▼}&\\multicolumn{${colNbr - 1}}{l|}{${options.formuleTexte}}\\\\ \\hline\n`
  }
  // en-tête
  output += '\\rowcolor{lightgray} &'
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let colIndex = 0; colIndex < colNbr - 1; colIndex++) {
    output += `\\textbf{\\sffamily ${alphabet[colIndex]}}  & `
  }
  output += `\\textbf{\\sffamily ${alphabet[colNbr - 1]}} \\\\ \\hline\n`

  for (let rowIndex = 0; rowIndex < rowNbr; rowIndex++) {
    const rowData = data[rowIndex] || {}
    output += `\\textbf{\\sffamily ${rowIndex + 1}} &`
    for (let colIndex = 0; colIndex < colNbr; colIndex++) {
      const cell = rowData[colIndex] || {}
      const styleCell = styles[cell.s ?? ''] || {}
      let color = ''
      if (styleCell.bg?.startsWith('#')) {
        color = `\\cellcolor[HTML]{${styleCell.bg.replace('#', '')}}`
      } else if (styleCell.bg) {
        color = `\\cellcolor{${styleCell.bg}}`
      }
      if (cell?.t === 1) {
        // texte
        output += `\\raggedright ${color} ${cell.v || ''}  &`
      } else if (cell?.t === 2) {
        // number
        output += `\\raggedleft ${color} ${cell.v || ''}  &`
      } else if (cell?.t === 3) {
        // boolean
        output += `\\centering ${color} ${cell.v ? 'VRAI' : 'FAUX'}  &`
      } else {
        output += `${color} ${cell.v || ''}  &`
      }
    }
    output = output.slice(0, -1) // enlever le dernier &
    output += '\\\\ \\hline\n'
  }
  output += '\\end{tabularx}\n'
  return output
}

export function addSheet({
  numeroExercice,
  question,
  data,
  minDimensions,
  style,
  columns,
  interactif,
  showVerifyButton,
  nbLignesCachees,
  nbColonnesCachees,
  readOnlyCells,
}: {
  numeroExercice: number
  question: number
  data: any[][]
  minDimensions: [number, number]
  style?: any
  columns: any[]
  interactif: boolean
  showVerifyButton: boolean
  nbLignesCachees?: number
  nbColonnesCachees?: number
  readOnlyCells?: string[]
}): string {
  return (
    `<my-spreadsheet
  id="sheet-Ex${numeroExercice}Q${question}"
  data='${JSON.stringify(data)}'
  min-dimensions='${JSON.stringify(minDimensions)}'
  ${style ? `style='${JSON.stringify(style)}'` : ''}
  columns='${JSON.stringify(columns)}'
  interactif='${interactif}'
    ${showVerifyButton !== undefined ? `show-verify-button='${showVerifyButton}'` : ''}
    ${nbLignesCachees !== undefined ? `nb-lignes-cachees='${nbLignesCachees}'` : ''}
    ${nbColonnesCachees !== undefined ? `nb-colonnes-cachees='${nbColonnesCachees}'` : ''}
    ${readOnlyCells && readOnlyCells.length > 0 ? `readonly-cells='${JSON.stringify(readOnlyCells)}'` : ''}
>` +
    (interactif
      ? `<div class="ml-2 py-2" id="resultatCheckEx${numeroExercice}Q${question}"></div>
<div class ="ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${numeroExercice}Q${question}"}></div>`
      : '') +
    '</my-spreadsheet>'
  )
}
