import jspreadsheet from 'jspreadsheet-ce'
import 'jspreadsheet-ce/src/jspreadsheet.css'

export class MySpreadsheetElement extends HTMLElement {
  private _spreadsheet: any = null
  private _buttonListener?: EventListener
  private _customListeners: { [eventName: string]: EventListener } = {}
  private showVerifyButton: boolean = true

  constructor() {
    super()
    this._spreadsheet = null
  }

  /**
   * Ajoute un listener sur l'élément et le mémorise pour suppression ultérieure
   */
  public addListener(eventName: string, callback: EventListener) {
    this.addEventListener(eventName, callback)
    this._customListeners[eventName] = callback
  }

  /**
   * Méthode statique pour créer et configurer un MySpreadsheetElement
   */
  static create({
    id,
    data = [],
    minDimensions = [5, 5],
    style = {},
    columns = [],
    interactif = false,
    showVerifyButton = true,
    readOnlyCells = [],
  }: {
    id?: string
    data?: (string | number)[][]
    minDimensions?: [number, number]
    style?: any
    columns?: any[]
    interactif?: boolean
    showVerifyButton?: boolean
    readOnlyCells?: string[]
  } = {}) {
    const elt = new MySpreadsheetElement()
    if (id) elt.id = id
    elt.setAttribute('data', JSON.stringify(data))
    elt.setAttribute('min-dimensions', JSON.stringify(minDimensions))
    elt.setAttribute('style', JSON.stringify(style))
    elt.setAttribute('columns', JSON.stringify(columns))
    elt.setAttribute('interactif', interactif ? 'true' : 'false')
    if (readOnlyCells.length > 0) {
      elt.setAttribute('readonly-cells', JSON.stringify(readOnlyCells))
    }
    if (showVerifyButton !== undefined) {
      elt.setAttribute(
        'show-verify-button',
        showVerifyButton ? 'true' : 'false',
      )
    }
    return elt
  }

  connectedCallback() {
    this.innerHTML = '<div></div>'
    const container = (this.firstElementChild ??
      document.createElement('div')) as HTMLDivElement

    let data: (number | string)[][] = []
    let minDimensions = [5, 5]
    let style = {}
    let columns = []
    let nbLignesCachees = 0
    let nbColonnesCachees = 0
    let readOnlyCells: string[] = []
    try {
      if (this.getAttribute('data'))
        data = JSON.parse(this.getAttribute('data') ?? '') as (
          | string
          | number
        )[][]
    } catch {}
    try {
      if (this.getAttribute('min-dimensions'))
        minDimensions = JSON.parse(this.getAttribute('min-dimensions') ?? '')
    } catch {}
    try {
      if (this.getAttribute('style'))
        style = JSON.parse(this.getAttribute('style') ?? '')
    } catch {}
    try {
      if (this.getAttribute('columns'))
        columns = JSON.parse(this.getAttribute('columns') ?? '[]')
    } catch {}
    try {
      if (this.getAttribute('nb-lignes-cachees'))
        nbLignesCachees = Number(this.getAttribute('nb-lignes-cachees') ?? '0')
    } catch {}
    try {
      if (this.getAttribute('nb-colonnes-cachees'))
        nbColonnesCachees = Number(
          this.getAttribute('nb-colonnes-cachees') ?? '0',
        )
    } catch {}
    try {
      if (this.getAttribute('readonly-cells'))
        readOnlyCells = JSON.parse(this.getAttribute('readonly-cells') ?? '[]')
    } catch {}
    const expandReadOnlyCells = (cells: string[]) => {
      const toIndex = (letters: string) => {
        let index = 0
        for (const char of letters.toUpperCase()) {
          index = index * 26 + (char.charCodeAt(0) - 64)
        }
        return index - 1
      }
      const toLetters = (index: number) => {
        let n = index + 1
        let letters = ''
        while (n > 0) {
          const rem = (n - 1) % 26
          letters = String.fromCharCode(65 + rem) + letters
          n = Math.floor((n - 1) / 26)
        }
        return letters
      }
      const parseRef = (ref: string) => {
        const match = ref.toUpperCase().match(/^([A-Z]+)(\d+)$/)
        if (!match) return null
        return { col: toIndex(match[1]), row: Number(match[2]) - 1 }
      }
      const expanded: string[] = []
      cells.forEach((cellRef) => {
        const trimmed = cellRef.trim()
        if (!trimmed) return
        if (!trimmed.includes(':')) {
          const parsed = parseRef(trimmed)
          if (parsed) expanded.push(trimmed.toUpperCase())
          return
        }
        const [startRef, endRef] = trimmed.split(':')
        const start = parseRef(startRef)
        const end = parseRef(endRef)
        if (!start || !end) return
        const colStart = Math.min(start.col, end.col)
        const colEnd = Math.max(start.col, end.col)
        const rowStart = Math.min(start.row, end.row)
        const rowEnd = Math.max(start.row, end.row)
        for (let row = rowStart; row <= rowEnd; row++) {
          for (let col = colStart; col <= colEnd; col++) {
            expanded.push(`${toLetters(col)}${row + 1}`)
          }
        }
      })
      return expanded
    }
    this._spreadsheet = jspreadsheet(container, {
      tabs: false,
      toolbar: false,
      worksheets: [
        {
          data,
          minDimensions,
          tableOverflow: true,
          tableHeight: '300px',
          style,
          columns,
        } as any,
      ],
    })[0]
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    if (readOnlyCells.length > 0) {
      expandReadOnlyCells(readOnlyCells).forEach((cellRef) => {
        this._spreadsheet.setReadOnly(cellRef, true)
      })
    }
    for (let i = 0; i < nbLignesCachees; i++) {
      this.hideRow(i)
    }
    for (let j = 0; j < nbColonnesCachees; j++) {
      this.hideColumn(j)
    }
    let numeroExercice = 0
    let question = 0
    const idMatch = this.id.match(/sheet-Ex(\d+)Q(\d+)$/)
    if (idMatch) {
      numeroExercice = Number(idMatch[1])
      question = Number(idMatch[2])
    }

    const feedBackElt = document.createElement('div')
    feedBackElt.id = 'message-faux'
    container.appendChild(feedBackElt)
    const resultCheck = document.createElement('span')
    resultCheck.id = `resultatCheckEx${numeroExercice}Q${question}`
    container.appendChild(resultCheck)
    const divFeedback = document.createElement('div')
    divFeedback.id = `feedbackEx${numeroExercice}Q${question}`
    divFeedback.className =
      'italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest'
    container.appendChild(divFeedback)

    if (this.getAttribute('show-verify-button') === 'false') {
      this.showVerifyButton = false
    }
    const bouton = document.createElement('button')
    bouton.id = 'runCode'
    bouton.textContent = 'Vérifier'
    bouton.style.boxSizing = 'border-box'
    bouton.style.position = 'relative'
    bouton.style.zIndex = '10'
    bouton.style.marginTop = '10px'
    // Styles personnalisés
    bouton.style.backgroundColor = '#2b6cb0' // Bleu coopmaths
    bouton.style.color = 'white' // Texte blanc
    bouton.style.border = 'none' // Pas de bordure
    bouton.style.borderRadius = '6px' // Bords arrondis
    bouton.style.padding = '8px 20px' // Espacement interne
    bouton.style.fontSize = '1rem' // Taille du texte
    bouton.style.fontWeight = 'bold' // Texte en gras
    bouton.style.cursor = 'pointer' // Curseur main au survol
    bouton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)' // Ombre légère

    // Effet au survol
    bouton.onmouseover = () => {
      bouton.style.backgroundColor = '#174ea6'
    }
    bouton.onmouseout = () => {
      bouton.style.backgroundColor = '#2b6cb0'
    }
    bouton.style.display =
      this.getAttribute('interactif') === 'true' ||
      this.showVerifyButton === false
        ? 'none'
        : 'block'
    container.appendChild(bouton)
    if (idMatch) {
      const numeroExercice = Number(idMatch[1])
      const question = Number(idMatch[2])
      if (this.showVerifyButton) {
        this._setupButton(bouton, numeroExercice, question)
      }
    }
    this.dispatchEvent(new CustomEvent('spreadsheet-ready'))
  }

  disconnectedCallback() {
    if (this._spreadsheet) {
      this._spreadsheet = null
    }
    // Retire le listener personnalisé
    const bouton = this.querySelector('#runCode')
    if (bouton && this._buttonListener) {
      bouton.removeEventListener('click', this._buttonListener)
    }
    // Retire tous les listeners ajoutés via addListener
    Object.entries(this._customListeners).forEach(([eventName, callback]) => {
      this.removeEventListener(eventName, callback)
    })
    this._customListeners = {}
  }

  _setupButton(
    bouton: HTMLButtonElement,
    numeroExercice: number,
    question: number,
  ) {
    const eventName = `checkEx${numeroExercice}Q${question}`
    this._buttonListener = () => {
      this.dispatchEvent(
        new CustomEvent(eventName, { detail: { sheet: this } }),
      )
    }
    bouton.addEventListener('click', this._buttonListener)
  }

  getCellValue(column: number, row: number) {
    return this._spreadsheet.getValueFromCoords(column, row, true)
  }

  getCellFormula(column: number, row: number) {
    return String(
      this._spreadsheet.getValueFromCoords(column, row, false),
    ).toUpperCase()
  }

  getData() {
    // Retourne les données de la première worksheet
    return this._spreadsheet.getData() ?? []
  }

  setCellValue(column: number, row: number, value: string | number) {
    this._spreadsheet.setValueFromCoords(column, row, value, true)
  }

  setCellFormula(column: number, row: number, formula: string) {
    if (!formula.startsWith('=')) formula = '=' + formula.toUpperCase()
    this._spreadsheet.setValueFromCoords(column, row, formula, true)
  }

  setData(data: any[]) {
    this._spreadsheet.setData(data)
  }

  isMounted() {
    return this._spreadsheet !== null
  }

  getMinDimensions() {
    return this._spreadsheet.minDimensions ?? [5, 5]
  }

  getStyle() {
    return this._spreadsheet.style ?? {}
  }

  setCellStyle(style: Record<string, string>) {
    this._spreadsheet.setStyle(style)
  }

  getColumns() {
    return this._spreadsheet.columns ?? []
  }

  showRow(rowIndex: number) {
    this._spreadsheet.showRow(rowIndex)
  }

  hideRow(rowIndex: number) {
    this._spreadsheet.hideRow(rowIndex)
  }

  showColumn(colIndex: number) {
    this._spreadsheet.showColumn(colIndex)
  }

  hideColumn(colIndex: number) {
    this._spreadsheet.hideColumn(colIndex)
  }
}

customElements.define('my-spreadsheet', MySpreadsheetElement)
