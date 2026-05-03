import { renderMathInElement } from 'mathlive'

type EventListener = (event?: Event) => void
type KeyboardEventListener = (event: KeyboardEvent) => void

interface CHoiceValue {
  latex?: string
  image?: string
  label?: string
  value: string
  svg?: string
}

/**
 * Vide chaque Element (html ou svg) passé en paramètre de tout son contenu.
 * On peut passer autant de paramètres que l'on veut, les null|undefined seront ignorés silencieusement
 * @param {...Element} elts
 */
function empty(...elts: Element[]): void {
  for (const elt of elts) {
    if (elt == null) continue
    while (elt?.lastChild != null) elt.removeChild(elt.lastChild)
  }
}

// Trois types de choix : simple string, {label: string, value: string} ou {latex?: string, image?: string, text?: string, value: string}
// C'est redondant : pour le type string, label et value prennent la valeur de la string, pour le type {label, value} c'est directement les valeurs utilisées (parfois le label affiché peut être un peu long et on peut avoir envie de résumer  à un mot la value), pour le troisième latex permet de fournir du latex en math-inline sans délimiteurs, image, c'est l'url d'une image (absolue ? ou relative au dossier courant donc src/lib/outils/listeDeroulante), text, c'est pareil que label, donc en fait, n'a pas beaucoup d'intérêt, on peut fondre le deuxième dans le troisième...
// On peut mixer les différentes formes :
// choices: AllChoicesType = [{image: 'src/section/datasExemple/firefox.png', value: 'firefox'},
//            {latex: '\\frac{\\sqrt{3}}{2}',value: 'sinusPiSur3'},
//            {label: "n'est pas définie en zéro", value: 'noF0'}
//            'Je ne sais pas']
export type AllChoiceType = CHoiceValue
export type AllChoicesType = AllChoiceType[]

// @todo faire évoluer cette fonction vers un renderToString() directement dans le li lorsque mathlive sera en version 1.0 ou plus.
function renderLatexToHTMLFragment(
  li: HTMLLIElement | HTMLSpanElement,
  latex: string,
): void {
  li.innerHTML = `$$${latex}$$`
  renderMathInElement(li)
  const spanToInvisible = li.querySelectorAll('span')
  if (spanToInvisible.length > 2) {
    spanToInvisible[2].style.display = 'none'
  }
}

// Usage :

/**
 * La fonction qui affiche l'un des choix, que ce soit du texte, du latex ou une image.
 * @param {HTMLLIElement} li l'élément de liste qui doit contenir le choix
 * @param {AllChoiceType} choice le choix en question
 */
function afficheChoice(
  li: HTMLLIElement | HTMLSpanElement,
  choice: AllChoiceType | undefined,
) {
  // Les textes sont naturellement alignés avec li.textAlign, mais pas les images ou les math-field
  if (choice == null) return
  if (typeof choice === 'object') {
    if ('latex' in choice) {
      renderLatexToHTMLFragment(li, choice.latex ?? '')
    } else if ('image' in choice) {
      const image = document.createElement('img')
      image.src = choice.image ?? choice.value
      image.style.width = '30px'
      image.style.height = '30px'
      li.appendChild(image)
    } else if ('label' in choice) {
      const span = document.createElement('span')
      span.innerHTML = choice.label ?? choice.value
      li.appendChild(span)
    } else if ('svg' in choice) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '-10 -10 20 20') // Valeur par défaut, peut être ajustée
      svg.classList.add('svgChoice')
      svg.style.display = 'block'
      svg.style.width = '20px'
      svg.style.height = '20px'
      svg.style.verticalAlign = 'middle'
      svg.innerHTML = choice.svg ?? ''
      li.appendChild(svg)
    }
  } else {
    throw Error(`Type de choix inconnu : ${choice}`)
  }
}

/**
 * L'outil listeDeroulante créé un "select" like où on peut mettre dans chaque item du LaTex, une image, etc.
 * Il faut passer par ListeDeroulante.create() et pas new ListeDeroulante(…)
 * @class
 */
class ListeDeroulante {
  disabled: boolean = false
  choices: AllChoicesType // La liste des choix
  givenChoices?: AllChoicesType // Je ne vois pas pourquoi on aurait ça...
  private _kbIndex: number = -1 // L'index du choix sélectionné au clavier
  changed: boolean = false // Passe à true dès qu'on a fait une sélection (ou dès le départ si le choix initial est sélectionnable)
  readonly _offset: number = 0 // Décalage éventuel d'index entre le tableau de choix fourni et celui qu'on manipule (0 ou 1 suivant que le premier choix est sélectionnable ou pas)
  reponse: string = ''

  private _elts: HTMLLIElement[] = [] // Liste des elts contenant les choix (les &lt;li&gt;)
  private _clickListener?: EventListener
  private _keydownListener?: KeyboardEventListener

  container?: HTMLElement
  spanSelected?: HTMLSpanElement
  ulContainer?: HTMLUListElement
  initialChoice?: AllChoiceType
  width?: number

  /**
   * @constructor
   * @param options
   * @param choices
   * @param options.choix0
   */
  constructor(
    choices: AllChoicesType,
    {
      choix0,
    }: {
      choix0?: boolean
    } = { choix0: false },
  ) {
    if (arguments.length > 2) throw Error('nombre d’arguments invalides')
    if (!Array.isArray(choices))
      throw Error('Il faut passer une liste de choix')
    this.disabled = false // mettre à true pour désactiver la liste
    this.choices = [...choices] // La liste des choix
    this.givenChoices = [...choices] // idem, mais celle-là restera complète avec l'entête de liste si le choix0 retire cet élément de choices lors de l'init.

    this._kbIndex = -1 // L'index du choix sélectionné au clavier
    this.changed = false // Passe à true dès qu'on a fait une sélection (ou dès le départ si le choix initial est sélectionnable)
    this._offset = choix0 ? 0 : 1 // permet d'atteindre le 1er élément sélectionnable de la liste
    this.reponse = '' // Le choix courant
    this._elts = [] // Liste des elts contenant les choix (les <li>)
  }

  /**
   * Crée les éléments dans le DOM (appelé par create) et ajoute les listeners
   * @private
   */
  _init(
    {
      conteneur,
      sansFleche,
      select,
    }: { conteneur?: HTMLElement; sansFleche?: boolean; select?: number } = {
      sansFleche: false,
      select: 0,
    },
  ) {
    /**
     * Le span qui va contenir la liste (tous les éléments que l'on crée, enfant de conteneur)
     * @type {HTMLSpanElement}
     */
    if (!conteneur)
      throw Error('Le conteneur est obligatoire pour la liste déroulante !')
    this.container = conteneur
    this.container.classList.add('listeDeroulante')
    const char = '˅'
    this.spanSelected = document.createElement('span') // Le span de l'élément sélectionné
    this.container.appendChild(this.spanSelected)
    this.spanSelected.className = 'currentChoice'
    this.spanSelected.role = 'listbox'
    this.spanSelected.tabIndex = 0

    // les listeners sur container, faut les mettre en propriété pour pouvoir les retirer dans disable()
    // click
    this._clickListener = (event) => {
      event?.stopPropagation()
      this.toggle()
    }
    this.container.onclick = this._clickListener

    /**
     * listener de keydown sur spanSelected, pour sélection au clavier
     * @param {KeyboardEvent} event
     */
    this._keydownListener = (event: KeyboardEvent): void => {
      const { code, key } = event
      if (code === 'Tab' || key === 'Tab') {
        // on sort du menu au clavier, faut le refermer
        this.hide()
      } else if (code === 'ArrowDown' || key === 'ArrowDown') {
        event.preventDefault()
        if (this._kbIndex < this.choices.length - 1) {
          this._kbIndex++
          if (!this.isVisible()) this.show()
          this._kbSelect()
        }
      } else if (code === 'ArrowUp' || key === 'ArrowUp') {
        event.preventDefault()
        if (this._kbIndex === -1) this._kbIndex = this.choices.length // 1er clic sur arrowUp, on part de la fin
        if (this._kbIndex > 0) {
          this._kbIndex--
          if (!this.isVisible()) this.show()
          this._kbSelect()
        }
      } else if (
        code === 'Space' ||
        key === 'Space' ||
        code === 'Enter' ||
        key === 'Enter'
      ) {
        if (this.isVisible()) {
          this.select(this._kbIndex, { withoutOffset: true })
        } else {
          this.show()
        }
      }
    }
    if (!sansFleche) {
      const fleche = document.createElement('span')
      fleche.className = 'trigger'
      fleche.textContent = char
      if (this._clickListener) fleche.onclick = this._clickListener
      this.container.appendChild(fleche)
    }
    // la liste qui peut être masquée (il doit passer au-dessus du reste, les boutons sont à 50, les modales à 90)
    this.ulContainer = document.createElement('ul')
    this.container.appendChild(this.ulContainer)

    // si le premier élément de la liste n'est pas sélectionnable, on le sort de la liste
    this.initialChoice = this._offset ? this.choices.shift() : this.choices[0]
    // les choix
    for (const [index, choice] of this.choices.entries()) {
      const li = document.createElement('li')
      li.role = 'option'
      this.ulContainer?.appendChild(li)
      afficheChoice(li, choice)
      li.addEventListener('click', (event) => {
        event.stopPropagation() // faut pas propager à container sinon il va rouvrir la liste après select()
        this.select(index, { withoutOffset: true })
      })
      this._elts.push(li)
    }
    // Il faut faire ça pour récupérer this.width à l'init ce qui permet de fixer la largeur minimum du spanSelected et d'aligner la liste à droite du spanSelected
    this.show() // fixe le this.width car il est undefined.
    this.hide()

    this.spanSelected.addEventListener('keydown', this._keydownListener)
    // pour refermer le menu si on sort au clavier,
    // on a essayé de refermer le menu au focusout sur container (avec un timeout sinon ça ferme avant de déclencher
    // le clic sur un li et on se retrouve à cliquer dessous), mais ça pose plus de pb que ça n'en résoud
    // (le clic sur la flèche referme parfois le menu aussitôt)
    // => on gère le tab sortant dans _keydownListener

    // et un listener pour refermer la liste si on clique ailleurs
    document.body.addEventListener('click', ({ target }) => {
      // si on trouve un .listeDeroulante dans un parent on ne fait rien
      /** @type {null|HTMLElement} */
      let parent: EventTarget | null = target
      while (parent && parent instanceof HTMLElement) {
        if (parent.classList.contains('listeDeroulante')) return
        parent = parent.parentElement
      }
      // sinon on cache
      this.hide()
    })
    // et le choix initial, on passe par select/reset pour éviter de dupliquer du code, mais ils ne doivent pas appeler le listener à l'init
    // (y'a des sections qui nous filent en listener  un truc qui n'est pas encore prêt, faut pas l'appeler tout de suite)
    if (select) this.select(select)
    // si choix0, on considère ça comme une réponse déjà mise
    else if (this._offset === 0) this.select(0)
    // sinon reset
    else this.reset()
    this._replace()
  }

  /**
   * met le focus sur l'élément sélectionné
   */
  focus() {
    if (this.spanSelected) this.spanSelected.focus()
  }

  /**
   * positionne le ul par rapport au spanSelected
   * @private
   */
  _replace() {
    if (this.container) {
      const height = this.container.offsetHeight
      const widthSpan = this.spanSelected?.offsetWidth ?? 0
      if (this.ulContainer) {
        this.ulContainer.style.top = `${height}px`
        this.ulContainer.style.left = `${widthSpan - (this.width ?? 0)}px`
      }
    }
  }

  /**
   * Remet la liste dans son état initial
   */
  reset() {
    this.hide()
    if (this.spanSelected) {
      empty(this.spanSelected)
      afficheChoice(this.spanSelected, this.initialChoice)
      this.spanSelected.style.fontStyle = 'italic'
      this.spanSelected.style.color = 'Grey'
      this._kbIndex = -1
      this.reponse = ''
      this.changed = false
      this._replace() // au cas où la hauteur de spanSelected aurait changé
    }
  }

  /**
   * Sélectionne le choix index (dans le tableau fourni initialement)
   * @param {number} index index dans choices
   * @param {Object} [options]
   * @param {boolean} [options.withoutOffset] Passer true si l'index est celui du tableau après avoir éventuellement retiré son 1er élément (à priori usage interne seulement)
   */
  select(
    index: number,
    {
      withoutOffset,
    }: {
      withoutOffset?: boolean
    } = {},
  ) {
    if (this.spanSelected != null) {
      if (this.disabled) return
      this.spanSelected.style.fontStyle = ''
      this.spanSelected.style.color = ''
      if (!Number.isInteger(index)) return Error(`index non entier : ${index}`)
      // faut décaler l'index si on a viré le 1er elt à l'init
      const realIndex = withoutOffset ? index : index - this._offset
      if (realIndex < 0 || realIndex >= this.choices.length) {
        if (withoutOffset)
          return console.error(
            `index invalide : ${index} non compris entre 0 et ${this.choices.length - 1}`,
          )
        return console.error(
          `index invalide : ${index} non compris entre ${this._offset} et ${this.choices.length - 1 + this._offset}`,
        )
      }
      empty(this.spanSelected)
      const choix = this.choices[realIndex]
      afficheChoice(this.spanSelected, choix)
      this.reponse = String(
        typeof choix === 'string'
          ? choix
          : typeof choix === 'object'
            ? choix?.value
            : 'undefined',
      )
      if (this.reponse === 'undefined')
        throw Error(`Un problème avec la valeur de ce choix : ${choix}`)
      this.changed = true
      this._kbIndex = index
      for (const [i, li] of this._elts.entries()) {
        if (i === index) li.classList.add('selected')
        else li.classList.remove('selected')
      }
      this._replace() // la hauteur de spanSelected peut changer
      this.focus()
      this.hide()
    }
  }

  /**
   * Marque un élément comme étant sélectionné au clavier (sera ensuite vraiment sélectionné si on appuie ensuite sur entrée)
   */
  _kbSelect() {
    for (const [i, li] of this._elts.entries()) {
      if (this._kbIndex === i) li.classList.add('selected')
      else li.classList.remove('selected')
    }
  }

  hide() {
    if (this.ulContainer) this.ulContainer.classList.remove('visible')
  }

  show() {
    if (this.disabled) return
    // il faut d'abord masquer toutes les autres listes qui pourraient être ouverte (pour éviter des chevauchements)
    for (const ul of document.querySelectorAll('.listeDeroulante ul.visible')) {
      ul.classList.remove('visible')
    }
    if (this.ulContainer) this.ulContainer.classList.add('visible')
    // Si this.width n'est pas défini (ça veut dire que c'est l'init qui l'appelle) on le renseigne et on replace la liste à droite et en dessous du spanSelected.
    if (!this.width) {
      this.width = this.ulContainer?.offsetWidth
      this._replace()
    }
    this.focus() // pour usage au clavier
  }

  /**
   * Pour changer l'état 'visible' de la liste
   */
  toggle() {
    if (this.disabled) return
    if (this.isVisible()) this.hide()
    else this.show()
  }

  /**
   * Comme son nom l'indique, dit si la liste est visible
   */
  isVisible() {
    if (this.ulContainer) return this.ulContainer.classList.contains('visible')
    else return false
  }

  getSelectedIndex() {
    return this._kbIndex
  }

  /**
   * Ajoute la liste dans le dom et retourne l'objet ListeDeroulante qu'elle a créé
   * @name ListeDeroulante
   * @param {HTMLElement|string} conteneur
   * @param {CHoiceValue[]} choices la liste des choix
   * @param {Object} [parametres]  Les paramètres de cette liste
   * @param {boolean} [parametres.sansFleche=false] passer true pour ne pas mettre la flèche permettant le déroulement
   * @param {number} [parametres.select=0] index de choices à sélectionner dès le départ (ignoré si choix est précisé)
   * @return {ListeDeroulante}
   */
  static create(
    conteneur: HTMLElement,
    choices: AllChoicesType,
    {
      choix0,
      sansFleche,
      select,
    }: {
      choix0?: boolean
      sansFleche?: boolean
      select?: number
    } = {
      choix0: false,
      sansFleche: false,
      select: 0,
    },
  ): ListeDeroulante {
    const ld = new ListeDeroulante(choices, {
      choix0,
    })
    if (!conteneur)
      throw Error('Impossible de créer la liste déroulante, pas de conteneur')
    ld._init({ conteneur, sansFleche, select })
    return ld
  }
}

export default ListeDeroulante
