import { Matrix, round } from 'mathjs'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { egal } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import { pointAbstrait, PointAbstrait } from '../2d/PointAbstrait'
import { polygone } from '../2d/polygones'
import { representant } from '../2d/representantVecteur'
import { segment } from '../2d/segmentsVecteurs'
import { latex2d } from '../2d/textes'
import { translation } from '../2d/transformations'
import { vecteur } from '../2d/Vecteur'
import { stringNombre, texNombre } from '../outils/texNombre'
import { matrice } from './Matrice'

type TabInit0 = [string, number, number][]
type TabInit1 = (string | number)[]
type TabInit = [TabInit0, TabInit1]
type TabLine = (string | number)[]
type ColorsTableauDeVariation = {
  colorL?: string
  colorV?: string
  colorC?: string
  colorT?: string
}[]

/**
 * Classe TableauDeVariation Initiée par Sebastien Lozano, transformée par Jean-Claude Lhote
 * publié le 9/02/2021
 * tabInit est un tableau contenant sous forme de chaine les paramètres de la macro Latex \tabInit{}{}
 * tabLines est un tableau contenant sous forme de chaine les paramètres des différentes macro \tabLine{}
 * Voir le commentaire avant la fonction tableauDeVariation() qui crée une instance de cette classe avec des valeurs par défaut
 * exemple :
 * tabInit:[[[texte1,taille1,long1],[texte2,taille2,long2]...],[valeur1,long1,valeur2,long2,valeur3,long3...]]
 * tabLines:[[type,long0,codeL1C1,long1,codeL1C2,long2,codeL1C3,long3...],[type,long0,codeL2C1,long1,codeL2C2,long2,codeL2C3,long3...]]
 * Pour colors, c'est propre à Latex : color, colorC = blue!15, colorL = green!15
 * colorL (comme couleur de la ligne) pour la zone 1
 * colorV (comme couleur de la variable) pour la zone 2
 * colorC (comme couleur de la colonne) pour la zone 3
 * colorT (comme couleur du tableau) pour la zone 4.
 * espcl=taille en cm entre deux antécédents, deltacl=distance entre la bordure et les premiers et derniers antécédents
 * lgt = taille de la première colonne tout est en cm
 * tabInit contient 2 tableaux
 * le premier contient des triplets [chaine d'entête,hauteur de ligne,nombre de pixels de largeur estimée du texte pour le centrage]
 * le deuxième contient une succession de chaines et de largeurs en pixels : ce sont les antécédent de la ligne d'entête
 * tabLines contient des tableaux de la forme ['type',...]
 * type est 'Line' pour une ligne de signes et valeurs. Les valeurs sont données avec à la suite leur largeur estimée en pixels.
 * type est 'Var' pour une ligne de variations. Les variations sont des chaines respectant une syntaxe particulière.
 * On intercale une largeur estimée pour le texte éventuel
 * type est 'Ima' il faut 4 paramètres numériques : le 1er et le 2e sont les N° des antécédents entre lesquels on veut placer l'image
 * le 3e est la valeur de l'image et le 4e est la largeur estimée en pixels
 * type est 'Val' il faut 5 paramètres : Idem Ima pour les deux premiers, le 3e est l'antécédent à ajouter, le 4e son image et le 5e sa taille
 * Pour plus d'info sur le codage des variations, voir ce tuto : https://zestedesavoir.com/tutoriels/439/des-tableaux-de-variations-et-de-signes-avec-latex/
 * reste à faire les types  'Slope"
 * @param {Object} param0
 * @author Jean-Claude Lhote
 */
export function tableauDeVariation({
  tabInit = [[], []],
  tabLines = [],
  lgt = 3.5,
  espcl = 5,
  deltacl = 0.8,
  colors = [],
  scale = 0.75,
  hauteurLignes = [],
}: {
  tabInit?: TabInit
  tabLines?: TabLine[]
  lgt?: number
  espcl?: number
  deltacl?: number
  colors?: ColorsTableauDeVariation
  scale?: number
  hauteurLignes?: number[]
}) {
  if (context.isHtml) {
    const segments = creerTableauHtml({
      tabInit,
      tabLines,
      espcl,
      deltacl,
      lgt,
    })
    const svgCode = mathalea2d(
      Object.assign(
        {},
        fixeBordures(segments, {
          rxmin: -0.05,
          rymin: -0.1,
          rxmax: 0.1,
          rymax: 0.05,
        }),
      ),
      segments,
    )
    return svgCode
  }
  let codeLatex = `\\begin{tikzpicture}[baseline, scale=${scale}]
    \\tkzTabInit[lgt=${lgt},deltacl=${deltacl},espcl=${espcl}`
  for (let i = 0; i < colors.length; i++) {
    codeLatex += `,${colors[i]}`
  }
  codeLatex += ']{'
  const tabinit0 = tabInit[0]
  const tabinit1 = tabInit[1]
  let type

  for (let i = 0; i < tabinit0.length; i++) {
    let exp = tabinit0[i][0]
    const taille = String(tabinit0[i][1])
    if (
      typeof exp === 'string' &&
      exp[0] === '$' &&
      exp[exp.length - 1] === '$'
    ) {
      exp = exp.substring(1, exp.length - 1)
    }
    if (typeof exp === 'string' && exp.includes(',')) {
      exp = `\\numprint{${exp}}`
    }
    if (typeof exp === 'string') codeLatex += ` $${exp}$ / ${taille},`
    else codeLatex += ` $${String(exp)}$ / ${taille},`
  }
  codeLatex = codeLatex.substring(0, codeLatex.length - 1) // pour enlever la virgule du dernier élément ajouté.
  codeLatex += '}{'
  for (let i = 0; i < tabinit1.length / 2; i++) {
    let exp = tabinit1[i * 2]
    if (
      typeof exp === 'string' &&
      exp[0] === '$' &&
      exp[exp.length - 1] === '$'
    ) {
      exp = exp.substring(1, exp.length - 1)
    }
    if (typeof exp === 'string' && exp.includes(',')) {
      exp = `\\numprint{${exp}}`
    }
    codeLatex += ` $${exp}$,`
  }
  codeLatex = codeLatex.substring(0, codeLatex.length - 1) // on retire la virgule du dernier élément ajouté
  codeLatex += '}' + '\n\t'
  for (let i = 0; i < tabLines.length; i++) {
    type = tabLines[i][0]
    if (type === 'Val') {
      codeLatex += `\\tkzTab${type}`
      for (let j = 1; j < tabLines[i].length - 1; j++) {
        // pas de $ ici non plus, car il y a des paramètres qui sont autre chose que des expressions
        // les expressions à mettre sur les flèches ou au bout de celles-ci doivent avoir leur $ $
        if (
          typeof tabLines[i][j] === 'string' &&
          String(tabLines[i][j]).includes(',')
        ) {
          tabLines[i][j] = `{${tabLines[i][j]}}`
        }
        codeLatex += `{${tabLines[i][j]}},`
      }
      codeLatex += '\n\t'
    } else if (type === 'Ima') {
      codeLatex += `\\tkzTab${type}`
      for (let j = 1; j < tabLines[i].length; j++) {
        codeLatex += `{${tabLines[i][j]}}`
      }
      codeLatex += '\n\t'
    } else if (type === 'Var') {
      // pas de $ ajoutés ici car il y a des commandes... les expressions doivent avoir leur propres $ $
      codeLatex += `\\tkzTab${type}{ `
      for (let j = 2; j < tabLines[i].length; j += 2) {
        const exp = tabLines[i][j]
        codeLatex += ` ${exp},`
      }
      codeLatex = codeLatex.substring(0, codeLatex.length - 1)
      codeLatex += '}' + '\n\t'
    } else {
      // si c'est pas tabVal, tabIma ou tabVar, c'est un tabLine et ça ne contient que des codes !
      codeLatex += `\\tkzTab${type}{ `
      for (let j = 2; j < tabLines[i].length; j += 2) {
        if (String(tabLines[i][j]).indexOf(',') !== -1) {
          tabLines[i][j] = `{${tabLines[i][j]}}`
        }
        codeLatex += ` ${tabLines[i][j]},`
      }
      codeLatex = codeLatex.substring(0, codeLatex.length - 1)
      codeLatex += '}' + '\n\t'
    }
  }
  codeLatex += '\\end{tikzpicture}\n'
  return codeLatex
}

/**
 * Une fonction pour trouver les solutions de f(x)=y.
 * @param fonction
 * @param y
 * @param xMin
 * @param xMax
 * @param tolerance
 */
// export function solve (fonction, y, xMin, xMax, tolerance) {

// }
/**
 * renvoie les solutions (intervalles) de f(x) < y (ou f(x)<=y ou f(x)>y ou f(x)>=y)
 * @param {function} fonction une fonction x=>f(x)
 * @param {number} y la valeur de y à atteindre
 * @param {number|FractionEtendue} xMin la borne gauche du domaine de définition
 * @param {number|FractionEtendue} xMax la borne droite du domaine de définition
 * @param {boolean} inferieur si true < si false >
 * @param {boolean} strict si true < ou > sinon <= ou >=
 * @param {Object} [options]
 * @param {number|FractionEtendue} options.step le pas de recherche en x.
 * @return {{borneG: {x: number, included: boolean, y: number}, borneD: {x: number, included: boolean, y: number}}[]} le ou les intervalles dans une liste
 */
export function inferieurSuperieur(
  fonction: (x: FractionEtendue | number) => number,
  y: number,
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  inferieur = true,
  strict = false,
  { step = new FractionEtendue(1, 100) } = {},
) {
  const satisfy = (
    image: number,
    y: number,
    inferieur: boolean,
    strict: boolean,
  ) => {
    if (inferieur) {
      return strict ? y - image > 0 : y - image >= 0
    }
    return strict ? y - image < 0 : y - image <= 0
  }
  if (!(step instanceof FractionEtendue)) step = new FractionEtendue(step, 1)
  const solutions = []
  let borneG: {
    x: FractionEtendue | number
    y: number
    included: boolean
  } | null = null
  let borneD: {
    x: FractionEtendue | number
    y: number
    included: boolean
  } | null = null
  const xmin =
    xMin instanceof FractionEtendue ? xMin : new FractionEtendue(xMin, 1)
  let x
  let image
  try {
    for (x = xmin; x.inferieurlarge(xMax); ) {
      image = fonction(x)
      if (borneG?.x == null && satisfy(image, y, inferieur, strict)) {
        // c'est le premier x qui matche
        borneG = { x, y: image, included: !strict }
      } else if (satisfy(image, y, inferieur, strict)) {
        // les suivants qui matchent écrasent borneD
        borneD = { x, y: image, included: !strict }
      } else {
        // ça ne matche plus ou pas
        if (borneD?.x != null) {
          // il y a eu un intervalle, ça a matché et c'est terminé
          solutions.push({
            borneG: { x: borneG!.x, y: borneG!.y, included: borneG!.included },
            borneD: { x: borneD.x, y: borneD.y, included: borneD.included },
          })
          borneG = null
          borneD = null // on réinitialise pour le prochain intervalle
        } else if (borneG?.x != null) {
          // On n'a pas de borneD, mais on a une borneG, cas particulier du singleton
          solutions.push({
            borneG: { x: borneG.x, y: borneG.y, included: borneG.included },
            borneD: { x: borneG.x, y: borneG.y, included: borneG.included },
          })
          borneG = null
          borneD = null // on réinitialise pour le prochain intervalle
        }
      }
      x = x.sommeFraction(step) // dans tous les cas, on avance
    }
  } catch (e) {
    console.error(`e.message avec x = ${x} et image = ${image}`)
  }
  if (borneD?.x != null) {
    // le dernier intervalle n'a pas été mis dans les solutions car on est encore dedans
    solutions.push({
      borneG: { x: borneG!.x, y: borneG!.y, included: borneG!.included },
      borneD: { x: borneD.x, y: borneD.y, included: borneD.included },
    })
  }
  return solutions
}

export function racines({
  fonction,
  xMin,
  xMax,
  tol = 1e-13,
  maxIter = 100,
  precision = 3,
}: {
  fonction: (x: number) => number
  xMin: number
  xMax: number
  tol?: number
  maxIter?: number
  precision?: number
}) {
  const racines = []
  for (let x = xMin; x <= xMax - 0.2; x += 0.2) {
    if (fonction(x) * fonction(x + 0.2) < 0) {
      const { root } = brent(fonction, x, x + 0.2, tol, maxIter)
      if (root != null) racines.push(round(root, precision))
    } else {
      if (fonction(x) === 0) racines.push(round(x, precision))
      if (fonction(x + 0.2) === 0) racines.push(round(x + 0.2, precision))
    }
  }
  return Array.from(new Set(racines).values())
}
/**
 * Retourne un array avec les signes successifs de la fonction sur l'intervalle
 * @param {function} fonction du type (x)=>number
 * @param {number|FractionEtendue} xMin
 * @param {number|FractionEtendue} xMax
 * @returns {{xG: number, xD: number, signe: string}[]}
 */
export function signesFonction(
  fonction: (x: number) => number,
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  zeros: FractionEtendue[] = [],
) {
  const signes = []
  let zerosUtilises: FractionEtendue[] | number[] = []
  if (xMin instanceof FractionEtendue) {
    xMin = xMin.toNumber()
  }
  if (xMax instanceof FractionEtendue) {
    xMax = xMax.toNumber()
  }

  // On vérifie que les zeros donnés en paramètre sont autant que le nombre calculé de zéros
  const zerosCalcules = racines({ fonction, xMin, xMax })
  if (zeros.length !== 0 && zerosCalcules.length !== zeros.length) {
    zerosUtilises = zerosCalcules
    window.notify(
      "Le nombre de racines données à la fonction tableauSignesFonction ne correspond au nombre de racines de la fonction sur l'intervalle fourni.",
      { zeros, zerosCalcules },
    )
  } else if (zeros.length === 0) {
    zerosUtilises = zerosCalcules
  } else {
    // On classe les zéros donnés en paramètre par ordre croissant
    const tableauATrier = zeros.map((value, index) => ({
      valeur1: value.toNumber(),
      valeur2: value,
    }))
    tableauATrier.sort((a, b) => a.valeur1 - b.valeur1)
    zeros = tableauATrier.map((item) => item.valeur2)
    let zerosEgaux = true
    // On vérfie que les zeros donnés en paramètre sont égaux aux zéros calculés modulo un epsilon
    for (let ee = 0; ee < zeros.length; ee++) {
      zerosEgaux = Math.abs(zeros[ee].toNumber() - zerosCalcules[ee]) < 1e-12
      if (!zerosEgaux) {
        window.notify(
          "Les racines données à la fonction tableauSignesFonction n'ont pas les mêmes valeurs que celles de la fonction sur l'intervalle fourni.",
          { zeros, zerosCalcules },
        )
        zerosUtilises = zerosCalcules
        break
      }
    }
    if (zerosEgaux) zerosUtilises = zeros
  }
  if (zerosCalcules.length === 0) {
    return [
      {
        xG: xMin,
        xD: xMax,
        signe: fonction((xMin + xMax) / 2) > 0 ? '+' : '-',
      },
    ]
  }
  if (xMin !== zerosCalcules[0]) {
    signes.push({
      xG: xMin,
      xD: zerosUtilises[0],
      signe: fonction(xMin) > 0 ? '+' : '-',
    })
  }
  signes.push({ xG: zerosUtilises[0], xD: zerosUtilises[0], signe: 'z' })
  for (let i = 1; i < zerosCalcules.length; i++) {
    const y = fonction((zerosCalcules[i - 1] + zerosCalcules[i]) / 2)
    signes.push({
      xG: zerosUtilises[i - 1],
      xD: zerosUtilises[i],
      signe: y > 0 ? '+' : '-',
    })
    signes.push({ xG: zerosUtilises[i], xD: zerosUtilises[i], signe: 'z' })
  }
  if (zerosCalcules[zerosCalcules.length - 1] === xMax) return signes
  const y = fonction((zerosCalcules[zerosCalcules.length - 1] + xMax) / 2)
  signes.push({
    xG: zerosCalcules[zerosCalcules.length - 1],
    xD: xMax,
    signe: y > 0 ? '+' : '-',
  })
  return signes
}

/**
 * retourne un tableau décrivant les variations de la fonction
 * Attention, la fonction fournie doit avoir une methode derivee(x) qui retourne la valeur de la dérivée en x
 * @param {(x)=>number} derivee
 * @param {number|FractionEtendue} xMin
 * @param {number|FractionEtendue} xMax
 * @param {number|FractionEtendue} step // fournir un step adapté à l'intervalle pour ne pas louper les valeurs particulières et pour ne pas ralentir le navigateur
 * @param {number|FractionEtendue} tolerance // écart maximum à zéro pour assimiler f(x) à zéro
 * @returns {null|*[]}
 */
export function variationsFonction(
  derivee: (x: number) => number,
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  step: number | FractionEtendue,
  tolerance = 0.005,
) {
  if (derivee !== null && typeof derivee === 'function') {
    const signesDerivee = signesFonction(derivee, xMin, xMax)
    const variations = []
    for (const signe of signesDerivee) {
      if (signe.signe === '+') {
        variations.push({ xG: signe.xG, xD: signe.xD, variation: 'croissant' })
      } else if (signe.signe === '-') {
        variations.push({
          xG: signe.xG,
          xD: signe.xD,
          variation: 'decroissant',
        })
      } // on ne fait rien pour signe.signe==='z'
    }
    return variations.filter((variation) => variation.xG !== variation.xD)
  } else {
    window.notify(
      "variationsFonction() appelée avec autre chose qu'une fonction",
      { derivee },
    )
    return []
  }
}

/**
 * retourne les coefficients a et b de la fonction affine passant par (x1,y1) et (x2,y2)
 * @param x1
 * @param x2
 * @param y1
 * @param y2
 * @returns {[number,number]}
 */
export function trouveFonctionAffine(
  x1: number,
  x2: number,
  y1: number,
  y2: number,
) {
  if (x1 === x2) {
    window.notify('trouveFonctionAffine() appelée avec x1=x2', { x1, x2 })
    return [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  }
  const maMatrice = matrice([
    [x1, 1],
    [x2, 1],
  ])
  if (typeof maMatrice!.inverse()!.multiply([y1, y2]) === 'number') {
    window.notify('trouveFonctionAffine() retourne un nombre', {
      matrice: maMatrice,
      y1,
      y2,
    })
    return [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
  }
  if (maMatrice) {
    const inv = maMatrice.inverse()
    if (inv) {
      const coeffs = inv.multiply([y1, y2]) as unknown as Matrix
      return coeffs.toArray()
    }
  }
  window.notify('Pas de solution au système', { x1, x2, y1, y2 })
  return [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
}

/**
 * Fonction qui cherche les minimas et maximas d'une fonction polynomiale f(x)=ax^3 + bx² + cx + d
 * retourne [] si il n'y en a pas, sinon retourne [[x1,f(x1)],[x2,f(x2)] ne précise pas si il s'agit d'un minima ou d'un maxima.
 * @author Jean-Claude Lhote
 */
export function chercheMinMaxFonction([a, b, c, d]: [
  number,
  number,
  number,
  number,
]) {
  const delta = 4 * b * b - 12 * a * c
  if (delta <= 0) {
    return [
      [0, 10 ** 99],
      [0, 10 ** 99],
    ]
  }
  const x1 = (-2 * b - Math.sqrt(delta)) / (6 * a)
  const x2 = (-2 * b + Math.sqrt(delta)) / (6 * a)
  return [
    [x1, a * x1 ** 3 + b * x1 ** 2 + c * x1 + d],
    [x2, a * x2 ** 3 + b * x2 ** 2 + c * x2 + d],
  ]
}

export type Substitut = {
  antVal: number
  antTex: string
  imgVal?: number
  imgTex?: string
}

type ZeroValue = number | FractionEtendue

export type ZeroDefinition =
  | ZeroValue
  | (() => ZeroValue)
  | {
      valeur: ZeroValue | (() => ZeroValue)
      interdit?: boolean
    }
  | null
  | undefined
  | 'non'
  | 'none'

export type TableauSignesFacteur = {
  nom: string
  fonction: (x: number) => number
  zero?: ZeroDefinition
  zeros?: ZeroDefinition[]
  interdit?: boolean
}

export type TableauSignesFacteursOptions = {
  fractionTex?: boolean
  substituts?: Substitut[]
  nomVariable?: string
  nomFonction?: string
  espcl?: number
}
/**
 * renvoie le tableau de signes d'une fonction
 * EE : L'option zeros permet de passer les zéros à la fonction quand il y a des fractions sans valeur décimale nativement non trouvées par la fonction.
 * EE : Si on utilise l'option zeros, il sera pertinent de mettre l'option fractionTex à true.
 * @param fonction
 * @param {number|FractionEtendue} xMin
 * @param {number|FractionEtendue} xMax
 * @param {object} options
 * @param {{antVal:number, antTex:string, imgVal:number, imgTex:string}[]} [options.substituts] valeur à remplacer dans le tableau (valeur au centième)
 * @param {number|FractionEtendue} [options.step] // pas de balayage pour trouver les solutions de f(x)=0
 * @param {boolean} [options.fractionTex] // si true, les nombres sont affichés sous forme de fraction
 * @param {number|FractionEtendue} [options.tolerance] // écart maximum à zéro pour assimiler f(x) à zéro
 * @param {string} [options.nomVariable] // ce qui est écrit dans l'entête de la première ligne 'x' par défaut
 * @param {FractionEtendue[]} [options.zeros] // Pour rentrer en dur, les zeros de la fonction. Quand on a besoin d'avoir les valeurs exactes de zéros qui sont des fractions n'ayant de pas valeur décimale
 * @returns {string} [options.nomFonction] // ce  qui est écrit dans l'entête de la deuxième ligne 'f(x)' par défaut
 */
export function tableauSignesFonction(
  fonction: (x: number) => number,
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  {
    substituts = [],
    step = fraction(1, 1000),
    tolerance = 0.005,
    nomVariable = 'x',
    nomFonction = 'f(x)',
    fractionTex = false,
    zeros = [],
  }: {
    substituts?: Substitut[]
    step?: number | FractionEtendue
    tolerance?: number | FractionEtendue
    nomVariable?: string
    nomFonction?: string
    fractionTex?: boolean
    zeros?: FractionEtendue[]
  },
) {
  const signes = signesFonction(fonction, xMin, xMax, zeros)
  const premiereLigne: (string | number)[] = []
  for (let i = 0; i < signes.length; i++) {
    if (i === 0) {
      if (fractionTex === false) {
        if (signes[0].xG instanceof FractionEtendue)
          premiereLigne.push(texNombre(signes[0].xG.toNumber()), 10)
        else premiereLigne.push(stringNombre(signes[0].xG, 2), 10)
      } else {
        if (signes[0].xG instanceof FractionEtendue)
          premiereLigne.push(signes[0].xG.texFractionSimplifiee, 10)
        else
          premiereLigne.push(
            new FractionEtendue(signes[0].xG, 1).texFractionSimplifiee,
            10,
          )
      }
    }
    if (
      i > 0 &&
      (signes[i].xG instanceof FractionEtendue
        ? Number(signes[i].xG)
        : signes[i].xG) !==
        (signes[i - 1].xG instanceof FractionEtendue
          ? Number(signes[i - 1].xG)
          : signes[i - 1].xG)
    ) {
      if (fractionTex === false) {
        if (signes[i].xG instanceof FractionEtendue)
          premiereLigne.push(texNombre(Number(signes[i].xG)), 10)
        else premiereLigne.push(stringNombre(Number(signes[i].xG), 2), 10)
      } else {
        if (signes[i].xG instanceof FractionEtendue) {
          const fracSimp = (signes[i].xG as FractionEtendue)
            .texFractionSimplifiee
          premiereLigne.push(fracSimp, 10)
        } else
          premiereLigne.push(
            new FractionEtendue(Number(signes[i].xG), 1).texFractionSimplifiee,
            10,
          )
      }
    }
  }
  if (fractionTex === false) {
    if (signes[signes.length - 1].xD instanceof FractionEtendue)
      premiereLigne.push(texNombre(Number(signes[signes.length - 1].xD)), 10)
    else
      premiereLigne.push(
        stringNombre(Number(signes[signes.length - 1].xD), 2),
        10,
      )
  } else {
    if (signes[signes.length - 1].xD instanceof FractionEtendue) {
      const fracSimp = (signes[signes.length - 1].xD as FractionEtendue)
        .texFractionSimplifiee
      premiereLigne.push(fracSimp, 10)
    } else
      premiereLigne.push(
        new FractionEtendue(Number(signes[signes.length - 1].xD), 1)
          .texFractionSimplifiee,
        10,
      )
  }

  if (substituts && Array.isArray(substituts)) {
    for (let i = 0; i < premiereLigne.length; i += 2) {
      const nb: number = Number(
        String(premiereLigne[i]).replaceAll(/\s/g, '').replace(',', '.'),
      )
      const substitut: Substitut | undefined = substituts.find(
        (el: Substitut) => egal(el.antVal, nb, 0.01),
      )
      if (substitut) {
        premiereLigne[i] = substitut.antTex
      }
    }
  }
  const tabLine = ['Line', 30]
  if (egal(fonction(Number(xMin)), 0)) {
    tabLine.push('z', 10)
  } else {
    tabLine.push('', 10)
  }
  for (const signe of signes) {
    tabLine.push(signe.signe, 10)
  }
  return tableauDeVariation({
    tabInit: [
      [
        [nomVariable, 1.5, 10],
        [nomFonction, 1.5, 10],
      ],
      premiereLigne,
    ],
    tabLines: [tabLine],
    espcl: 2.1, // taille en cm entre deux antécédents
    deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
    lgt: 3, // taille de la première colonne en cm
  })
}

export function tableauSignesFacteurs(
  facteurs: TableauSignesFacteur[],
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  {
    fractionTex = false,
    substituts = [],
    nomVariable = 'x',
    nomFonction = 'f(x)',
    espcl,
  }: TableauSignesFacteursOptions = {},
) {
  const EPSILON = 1e-9
  const toNumberValue = (value: ZeroValue) =>
    value instanceof FractionEtendue ? value.toNumber() : value

  if (xMin == null || xMax == null) {
    window.notify('tableauSignesFacteurs() nécessite xMin et xMax.', {
      xMin,
      xMax,
    })
    return ''
  }

  let nMin = toNumberValue(xMin)
  let nMax = toNumberValue(xMax)
  let valeurMin: ZeroValue = xMin
  let valeurMax: ZeroValue = xMax

  if (nMin > nMax) {
    ;[nMin, nMax] = [nMax, nMin]
    ;[valeurMin, valeurMax] = [valeurMax, valeurMin]
  }

  const makeKey = (value: ZeroValue) => {
    const num = toNumberValue(value)
    return num.toFixed(12)
  }

  const preferDisplayValue = (current: ZeroValue, candidate: ZeroValue) => {
    if (current instanceof FractionEtendue) return current
    if (candidate instanceof FractionEtendue) return candidate
    return current
  }

  type NormalizedZero = { valeur: ZeroValue; interdit: boolean }

  const resolveZeroDefinition = (
    definition: ZeroDefinition,
    interditParDefaut: boolean,
  ): NormalizedZero | null => {
    if (definition == null) return null
    if (typeof definition === 'string') {
      const lowered = definition.trim().toLowerCase()
      if (lowered === 'non' || lowered === 'none') return null
    }
    if (typeof definition === 'function') {
      return resolveZeroDefinition(definition(), interditParDefaut)
    }
    if (
      typeof definition === 'object' &&
      !(definition instanceof FractionEtendue) &&
      'valeur' in definition
    ) {
      const definitionObjet = definition as {
        valeur: ZeroValue | (() => ZeroValue)
        interdit?: boolean
      }
      const valeurBrute = definitionObjet.valeur
      const interdit =
        typeof definitionObjet.interdit === 'boolean'
          ? definitionObjet.interdit
          : interditParDefaut
      return resolveZeroDefinition(valeurBrute, interdit)
    }
    if (
      typeof definition !== 'number' &&
      !(definition instanceof FractionEtendue)
    ) {
      window.notify(
        'tableauSignesFacteurs() a reçu une valeur de zéro non gérée.',
        { definition },
      )
      return null
    }
    return { valeur: definition, interdit: interditParDefaut }
  }

  type ZeroInfo = {
    valeur: ZeroValue
    interdit: boolean
    hasNumeratorZero: boolean
  }

  const zeroInfos = new Map<string, ZeroInfo>()
  const colonnesZeros = new Set<string>()
  const factorZeroSets: Set<string>[] = []

  facteurs.forEach((facteur) => {
    const zeroSet = new Set<string>()
    const zeroDefinitions: ZeroDefinition[] = []
    if (facteur.zero !== undefined) zeroDefinitions.push(facteur.zero)
    if (facteur.zeros) zeroDefinitions.push(...facteur.zeros)
    const interditParDefaut = facteur.interdit ?? false

    for (const zeroDefinition of zeroDefinitions) {
      const normalisee = resolveZeroDefinition(
        zeroDefinition,
        interditParDefaut,
      )
      if (!normalisee) continue
      const valeurNumeric = toNumberValue(normalisee.valeur)
      if (valeurNumeric < nMin - EPSILON || valeurNumeric > nMax + EPSILON) {
        continue
      }
      const key = makeKey(normalisee.valeur)
      zeroSet.add(key)
      const info = zeroInfos.get(key)
      if (info) {
        info.valeur = preferDisplayValue(info.valeur, normalisee.valeur)
        info.interdit = info.interdit || normalisee.interdit
        if (!normalisee.interdit) info.hasNumeratorZero = true
      } else {
        zeroInfos.set(key, {
          valeur: normalisee.valeur,
          interdit: normalisee.interdit,
          hasNumeratorZero: !normalisee.interdit,
        })
        colonnesZeros.add(key)
      }
    }
    factorZeroSets.push(zeroSet)
  })

  type BoundaryPoint = {
    key: string
    valeur: ZeroValue
    numeric: number
  }

  const boundaries = new Map<string, BoundaryPoint>()

  const pushBoundary = (value: ZeroValue) => {
    const numeric = toNumberValue(value)
    if (numeric < nMin - EPSILON || numeric > nMax + EPSILON) return
    const key = makeKey(value)
    const existing = boundaries.get(key)
    if (existing) {
      if (
        !(existing.valeur instanceof FractionEtendue) &&
        value instanceof FractionEtendue
      ) {
        boundaries.set(key, { key, valeur: value, numeric })
      }
    } else {
      boundaries.set(key, { key, valeur: value, numeric })
    }
  }

  pushBoundary(valeurMin)
  zeroInfos.forEach((info) => {
    pushBoundary(info.valeur)
  })
  pushBoundary(valeurMax)

  const points = Array.from(boundaries.values()).sort(
    (a, b) => a.numeric - b.numeric,
  )

  if (points.length < 2) {
    window.notify(
      'tableauSignesFacteurs() reçoit un intervalle sans points distincts.',
      { xMin, xMax, zeros: Array.from(zeroInfos.values()) },
    )
    return ''
  }

  const premiereLigne: (string | number)[] = []
  const largeurFraction = context.isHtml ? 28 : 22
  const largeurStandard = context.isHtml ? 16 : 12
  const largeurPremiereLigne = (
    valeur: string | number,
    point?: BoundaryPoint,
  ) => {
    const formatFraction =
      typeof valeur === 'string' &&
      (valeur.includes('\\frac') || valeur.includes('\\dfrac'))
    const valeurFraction =
      point?.valeur instanceof FractionEtendue &&
      point.valeur.denIrred !== 1 &&
      point.valeur.numIrred !== 0
    if (formatFraction || valeurFraction) return largeurFraction
    return largeurStandard
  }

  let fractionsDansEntete = fractionTex

  for (let index = 0; index < points.length; index++) {
    const point = points[index]
    let texte: string | number = ''
    if (index !== 0 && index !== points.length - 1) {
      if (fractionTex === false) {
        if (point.valeur instanceof FractionEtendue) {
          texte = texNombre(point.valeur.toNumber())
        } else {
          texte = stringNombre(point.valeur, 2)
        }
      } else if (point.valeur instanceof FractionEtendue) {
        texte = point.valeur.texFractionSimplifiee
      } else {
        texte = new FractionEtendue(point.valeur, 1).texFractionSimplifiee
      }
      if (
        point.valeur instanceof FractionEtendue &&
        point.valeur.denIrred !== 1 &&
        point.valeur.numIrred !== 0
      ) {
        fractionsDansEntete = true
      }
    }
    premiereLigne.push(texte, largeurPremiereLigne(texte, point))
  }

  if (substituts && Array.isArray(substituts)) {
    for (let i = 0; i < premiereLigne.length; i += 2) {
      if (premiereLigne[i] === '') continue
      const nb: number = Number(
        String(premiereLigne[i]).replaceAll(/\s/g, '').replace(',', '.'),
      )
      const substitut: Substitut | undefined = substituts.find(
        (el: Substitut) => egal(el.antVal, nb, 0.01),
      )
      if (substitut) {
        premiereLigne[i] = substitut.antTex
      }
    }
  }

  const segments = points.length - 1
  const lignes: (string | number)[][] = []
  const signesFacteurs: string[][] = []

  const valeurSurIntervalle = (
    f: (x: number) => number,
    gauche: number,
    droite: number,
  ) => {
    const milieu = (gauche + droite) / 2
    const image = f(milieu)
    const valeur = Number(image) ?? 0
    if (Number.isNaN(valeur)) return ''
    if (Math.abs(valeur) < EPSILON) return '0'
    return valeur > 0 ? '+' : '-'
  }

  const boundarySymbol = (zeroSet: Set<string>, key: string) => {
    if (zeroSet.has(key)) return 'z'
    if (colonnesZeros.has(key)) return 't'
    return ''
  }

  const xMinKey = points[0].key

  facteurs.forEach((facteur, index) => {
    if (typeof facteur.fonction !== 'function') {
      window.notify(
        'tableauSignesFacteurs() appelé avec un facteur sans fonction valide.',
        { facteur },
      )
      return
    }
    const zeroSet = factorZeroSets[index] ?? new Set<string>()
    const ligne: (string | number)[] = ['Line', 30]
    const signes: string[] = []
    ligne.push(boundarySymbol(zeroSet, xMinKey), 10)
    for (let i = 0; i < segments; i++) {
      const gauche = points[i].numeric
      const droite = points[i + 1].numeric
      const signe = valeurSurIntervalle(facteur.fonction, gauche, droite)
      signes.push(signe)
      ligne.push(signe, 10)
      ligne.push(boundarySymbol(zeroSet, points[i + 1].key), 10)
    }
    lignes.push(ligne)
    signesFacteurs.push(signes)
  })

  const produitDesSignes = (indexSegment: number) => {
    if (signesFacteurs.length === 0) return '+'
    let produit = 1
    let possedeSigne = false
    for (const signes of signesFacteurs) {
      const signe = signes[indexSegment]
      if (signe === '0') return '0'
      if (signe === '+' || signe === '-') {
        possedeSigne = true
        if (signe === '-') produit *= -1
      }
    }
    if (!possedeSigne) return ''
    return produit > 0 ? '+' : '-'
  }

  const symboleSynthese = (key: string) => {
    const info = zeroInfos.get(key)
    if (!info) return ''
    if (info.interdit) return '||'
    if (info.hasNumeratorZero) return 'z'
    return ''
  }

  const ligneFinale: (string | number)[] = ['Line', 30]
  ligneFinale.push(symboleSynthese(xMinKey), 10)
  for (let i = 0; i < segments; i++) {
    ligneFinale.push(produitDesSignes(i), 10)
    ligneFinale.push(symboleSynthese(points[i + 1].key), 10)
  }
  lignes.push(ligneFinale)

  const entetes: [string, number, number][] = [[nomVariable, 1.5, 10]]
  for (const facteur of facteurs) {
    entetes.push([facteur.nom, 1.5, 10])
  }
  entetes.push([nomFonction, 1.5, 10])

  const espacementColonnes =
    espcl ??
    (context.isHtml
      ? fractionsDansEntete
        ? 3.8
        : 3
      : fractionsDansEntete
        ? 2.9
        : 2.3)

  return tableauDeVariation({
    tabInit: [entetes, premiereLigne],
    tabLines: lignes,
    espcl: espacementColonnes,
    deltacl: 0.8,
    lgt: 3,
  })
}

/**
 *
 * @param {function} fonction
 * @param {function} derivee
 * @param {number|FractionEtendue} xMin
 * @param {number|FractionEtendue} xMax
 * @param {object} options
 * @param {{antVal: number, antTex: string, imgVal: number, imgTex: string}[]} [options.substituts]
 * @param {number|FractionEtendue} [options.step] // pas de balayage pour trouver les solutions de f'(x)=0
 * @param {number|FractionEtendue} [options.tolerance] // la valeur en dessous de laquelle les images sont considérées comme des zéros
 * @param {boolean} [options.ligneDerivee] Mettre à true pour faire apparaître la ligne de f'
 * @param {string} [options.nomVariable] 'x' par défaut
 * @param {string} [options.nomFonction] 'f(x)' par défaut
 * @param {string} [options.nomDerivee] 'f′(x)' par défaut
 * @param {number} [options.precisionImage] 2 par défaut = nombre de décimale des images approchées
 * @returns {string}
 */
export function tableauVariationsFonction(
  fonction: ((x: FractionEtendue | number) => number) | ((x: number) => number),
  derivee: ((x: FractionEtendue | number) => number) | ((x: number) => number),
  xMin: number | FractionEtendue,
  xMax: number | FractionEtendue,
  {
    substituts = [],
    step = fraction(1, 1000),
    tolerance = 0.005,
    ligneDerivee = false,
    nomVariable = 'x',
    nomFonction = 'f(x)',
    nomDerivee = 'f^{\\prime}(x)',
    precisionImage = 2,
  }: {
    substituts?: Substitut[]
    step?: number | FractionEtendue
    tolerance?: number | FractionEtendue
    ligneDerivee?: boolean
    nomVariable?: string
    nomFonction?: string
    nomDerivee?: string
    precisionImage?: number
  },
) {
  const signes = signesFonction(derivee, xMin, xMax).filter(
    (signe) => signe.xG !== signe.xD,
  )
  const premiereLigne = []
  const initalValue: (string | number)[] = []
  const imgSubstituts = []
  premiereLigne.push(
    ...signes.reduce(
      (previous, current) =>
        previous.concat([stringNombre(Number(current.xG), 3), 10]),
      initalValue,
    ),
  )
  premiereLigne.push(stringNombre(Number(signes[signes.length - 1].xD), 3), 10)
  if (substituts && Array.isArray(substituts)) {
    for (let i = 0; i < premiereLigne.length; i += 2) {
      const nb: number = Number(
        String(premiereLigne[i]).replaceAll(/\s/g, '').replace(',', '.'),
      )
      const substitut = substituts.find((el) =>
        egal(el.antVal, nb, Number(tolerance)),
      )
      if (substitut) {
        imgSubstituts.push({
          index: i + 2,
          antVal: substitut.antVal,
          imgTex: substitut.imgTex,
        })
        premiereLigne[i] =
          typeof substitut.antTex === 'string'
            ? substitut.antTex
            : String(substitut.antTex)
      }
    }
  }
  const tabLineDerivee = ['Line', 30]
  if (egal(derivee(Number(xMin)), 0)) {
    tabLineDerivee.push('z', 10)
  } else {
    tabLineDerivee.push('', 10)
  }
  for (const signe of signes) {
    tabLineDerivee.push(signe.signe, 10)
    tabLineDerivee.push('z', 10)
  }
  if (!egal(derivee(Number(xMax)), 0)) {
    tabLineDerivee.splice(-2, 2)
  }

  const variations = variationsFonction(
    derivee,
    xMin,
    xMax,
    step,
    Number(tolerance),
  )

  const tabLineVariations = ['Var', 10]
  const tabLinesImage = []
  let variationG = variations[0]
  let variationD
  if (variationG.variation === 'croissant') {
    tabLineVariations.push(
      `-/${stringNombre(fonction(Number(variationG.xG)), precisionImage)}`,
      30,
    )
  } else {
    tabLineVariations.push(
      `+/${stringNombre(fonction(Number(variationG.xG)), precisionImage)}`,
      30,
    )
  }
  for (let i = 0; i < variations.length - 1; i++) {
    variationG = variations[i]
    variationD = variations[i + 1]
    if (variationG.variation === variationD.variation) {
      tabLineVariations.push('R/', 10)
      tabLinesImage.push([
        'Ima',
        i + 1,
        i + 3,
        i + 2,
        stringNombre(fonction(Number(variationG.xD)), precisionImage),
      ])
    } else {
      tabLineVariations.push(
        `${variationG.variation === 'croissant' ? '+' : '-'}/${stringNombre(fonction(Number(variationG.xD)), precisionImage)}`,
        30,
      )
    }
  }
  if (variationD != null) {
    if (variationD.variation === 'croissant') {
      tabLineVariations.push(
        `+/${stringNombre(fonction(Number(variationD.xD)), precisionImage)}`,
        30,
      )
    } else {
      tabLineVariations.push(
        `-/${stringNombre(fonction(Number(variationD.xD)), precisionImage)}`,
        30,
      )
    }
  } else {
    tabLineVariations.push(
      `${variationG.variation === 'croissant' ? '+' : '-'}/${stringNombre(fonction(Number(variationG.xD)), precisionImage)}`,
      30,
    )
  }
  if (substituts && Array.isArray(substituts)) {
    for (let i = 2; i < tabLineVariations.length; i += 2) {
      const strChunks = String(tabLineVariations[i]).split('/')
      const substitut = imgSubstituts.find((el) => el.index === i)
      if (substitut) {
        if (substitut.imgTex)
          tabLineVariations[i] = `${strChunks[0]}/${substitut.imgTex}`
      }
    }
  }

  const tabLines = ligneDerivee ? [tabLineDerivee] : []
  tabLines.push(tabLineVariations)
  if (tabLinesImage.length > 0) {
    tabLines.push(...tabLinesImage)
  }
  return tableauDeVariation({
    tabInit: [
      ligneDerivee
        ? [
            [nomVariable, 1.5, 10],
            [nomDerivee, 2, 10],
            [nomFonction, 3, 10],
          ]
        : [
            [nomVariable, 1.5, 10],
            [nomFonction, 3, 10],
          ],
      premiereLigne,
    ],
    tabLines,
    espcl: 5, // taille en cm entre deux antécédents
    deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
    lgt: 3, // taille de la première colonne en cm
  })
}

export function brent(
  f: (x: number) => number,
  a: number,
  b: number,
  tol = 1e-5,
  maxIter = 100,
) {
  if (f(a) * f(b) >= 0) {
    throw new Error("La fonction doit changer de signe sur l'intervalle [a, b]")
  }

  let fa = f(a)
  let fb = f(b)
  let c = a
  let fc = fa
  let d = b - a
  let e = d

  for (let iter = 0; iter < maxIter; iter++) {
    if (fb * fc > 0) {
      c = a
      fc = fa
      d = e = b - a
    }

    if (Math.abs(fc) < Math.abs(fb)) {
      ;[a, b, c] = [b, c, b]
      ;[fa, fb, fc] = [fb, fc, fb]
    }

    const tol1 = 2.0 * tol * Math.abs(b) + 0.5 * tol
    const xm = 0.5 * (c - b)

    if (Math.abs(xm) <= tol1 || fb === 0.0) {
      return { root: b, iter }
    }

    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa
      let p, q
      if (a === c) {
        p = 2.0 * xm * s
        q = 1.0 - s
      } else {
        q = fa / fc
        const r = fb / fc
        p = s * (2.0 * xm * q * (q - r) - (b - a) * (r - 1.0))
        q = (q - 1.0) * (r - 1.0) * (s - 1.0)
      }
      if (p > 0) q = -q
      p = Math.abs(p)
      if (
        2.0 * p <
        Math.min(3.0 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))
      ) {
        e = d
        d = p / q
      } else {
        d = e = xm
      }
    } else {
      d = e = xm
    }

    a = b
    fa = fb
    if (Math.abs(d) > tol1) {
      b += d
    } else {
      b += xm >= 0 ? tol1 : -tol1
    }
    fb = f(b)
  }

  throw new Error('Maximum number of iterations exceeded')
}

export function creerTableauHtml({
  tabInit,
  tabLines,
  espcl,
  deltacl,
  lgt,
}: {
  tabInit: TabInit
  tabLines: TabLine[]
  espcl: number
  deltacl: number
  lgt: number
}): NestedObjetMathalea2dArray {
  if (!context.isHtml) return []
  const hauteurLignes = context.pixelsParCm
  const tabInit0 = tabInit[0]
  const tabInit1 = tabInit[1]
  let isTabInit0Valid = true
  if (!Array.isArray(tabInit0) || tabInit0.length === 0) {
    isTabInit0Valid = false
  } else {
    for (let i = 0; i < tabInit0.length; i++) {
      if (tabInit0[i].length !== 3) {
        isTabInit0Valid = false
        break
      }
      if (typeof tabInit0[i][0] !== 'string') {
        isTabInit0Valid = false
        break
      }
      if (typeof tabInit0[i][1] !== 'number') {
        isTabInit0Valid = false
        break
      }
      if (typeof tabInit0[i][2] !== 'number') {
        isTabInit0Valid = false
        break
      }
    }
  }
  if (!isTabInit0Valid) {
    window.notify('Dans TableauDeVariation(), tabInit[0] est invalide', {
      tabInit0,
    })
    return []
  }
  let isTabInit1Valid = true
  if (!Array.isArray(tabInit1) || tabInit1.length === 0) {
    isTabInit1Valid = false
  } else {
    for (let i = 0; i < tabInit1.length; i++) {
      if (typeof tabInit1[i] !== 'string' && typeof tabInit1[i] !== 'number') {
        isTabInit1Valid = false
        break
      }
    }
  }
  if (!isTabInit1Valid) {
    window.notify('Dans TableauDeVariation(), tabInit[1] est invalide', {
      tabInit1,
    })
    return []
  }
  let isTabLinesValid = true
  if (!Array.isArray(tabLines) || tabLines.length === 0) {
    isTabLinesValid = false
  } else {
    for (let i = 0; i < tabLines.length; i++) {
      if (!Array.isArray(tabLines[i]) || tabLines[i].length === 0) {
        isTabLinesValid = false
        break
      }
      if (
        typeof tabLines[i][0] !== 'string' ||
        !['Line', 'Var', 'Ima', 'Val', 'Slope'].includes(String(tabLines[i][0]))
      ) {
        isTabLinesValid = false
        break
      }
    }
  }
  if (!isTabLinesValid) {
    window.notify('Dans TableauDeVariation(), tabLines est invalide', {
      tabLines,
    })
    return []
  }
  let yLine = 0
  const segments = []
  let index = 0
  const textes = []
  let texte
  let long
  let s
  let p
  let v
  let fleches: {
    point: PointAbstrait
    margeGauche: number
    margeDroite: number
  }[] = []
  let codeVar = []
  let ZI = []
  let ZIon
  let zonesEstInterdit = []
  const longueurTotale = lgt + (tabInit1.length / 2 - 1) * espcl + 2 * deltacl
  const demiIntervalle = 1 / context.pixelsParCm / 2
  const intervalle = 2 * demiIntervalle
  /**
   * Retire les $ $ du début et de la fin de la chaine passée s'il y en a et retourne la chaine
   * @param {string } text
   * @returns {string}
   */
  const latexContent = (text: string) => {
    let txt = text
    if (txt == null || typeof txt !== 'string') {
      window.notify(
        `Dans TableauDeVariation(), sortieTexte() a reçu un drôle de texte : ${txt}, du coup je renvoie ''`,
        {},
      )
      txt = ''
    }
    if (txt[0] === '$') txt = txt.substring(1, txt.length - 1)
    return txt
  }
  const sortieTexte = (texte: string, x: number, y: number) => {
    let txt = texte
    if (typeof txt !== 'string') {
      window.notify(
        `Dans TableauDeVariation(), sortieTexte() a reçu un drôle de texte : ${txt}, du coup je renvoie ''`,
        {},
      )
      return { texte: '', x, y }
    }
    if (txt[0] === '$' && txt[txt.length - 1] === '$') {
      // on suprime les $ superflus, parce qu'il n'en faut pas !
      txt = txt.substring(1, txt.length - 2)
    }
    if (txt.length > 0) {
      return { texte: txt, x, y }
    }
    return { texte: '', x, y }
  }
  // On crée une ligne horizontale et les séparations verticales de base
  segments.push(segment(0, 0, longueurTotale, 0))
  segments.push(segment(0, 0, 0, -tabInit0[0][1] * hauteurLignes * intervalle))
  segments.push(
    segment(lgt, 0, lgt, 0 - tabInit0[0][1] * hauteurLignes * intervalle),
  )
  segments.push(
    segment(
      longueurTotale,
      0,
      longueurTotale,
      -tabInit0[0][1] * hauteurLignes * intervalle,
    ),
  )

  texte = tabInit0[0][0]
  long = tabInit0[0][2] //
  textes.push(
    sortieTexte(
      latexContent(texte),
      lgt / 2,
      -tabInit0[0][1] * hauteurLignes * demiIntervalle,
    ),
  )
  for (let j = 0; j < tabInit1.length / 2; j++) {
    texte = String(tabInit1[j * 2])
    long = tabInit1[j * 2 + 1]
    textes.push(
      sortieTexte(
        latexContent(texte),
        lgt + deltacl + espcl * j,
        -tabInit0[0][1] * hauteurLignes * demiIntervalle,
      ),
    )
  }
  yLine -= tabInit0[0][1] * hauteurLignes * intervalle

  for (let i = 0; i < tabInit0.length && index < tabLines.length; ) {
    // on s'arrête quand on dépasse le nombre de lignes prévues
    // Line et Var incrémente i de 1 et décrémente yLine de la hauteur de la ligne
    // Val, Ima et Slope incrémente index mais pas i
    switch (tabLines[index][0]) {
      case 'Line':
        i++
        long = tabInit0[i][2]
        textes.push(
          sortieTexte(
            latexContent(tabInit0[i][0]),
            lgt / 2,
            yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
          ),
        ) // hauteurLignes,colorBackground))

        for (let k = 1; k < tabLines[index].length / 2; k++) {
          if (tabLines[index][k * 2] !== '') {
            texte = String(tabLines[index][k * 2])
            long = tabLines[index][k * 2 + 1]
            if (texte.length === 1) {
              switch (texte[0]) {
                case 'z':
                  textes.push(
                    sortieTexte(
                      '0',
                      lgt + deltacl + (espcl / 2) * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
                    ),
                  )
                  s = segment(
                    lgt + deltacl + (espcl / 2) * (k - 1),
                    yLine,
                    lgt + deltacl + (espcl / 2) * (k - 1),
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  s.pointilles = 4
                  segments.push(s)
                  break
                case 'd':
                  segments.push(
                    segment(
                      lgt + deltacl + (espcl / 2) * (k - 1) - 0.05,
                      yLine,
                      lgt + deltacl + (espcl / 2) * (k - 1) - 0.05,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  segments.push(
                    segment(
                      lgt + deltacl + (espcl / 2) * (k - 1) + 0.05,
                      yLine,
                      lgt + deltacl + (espcl / 2) * (k - 1) + 0.05,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  break
                case 't':
                  s = segment(
                    lgt + deltacl + (espcl / 2) * (k - 1),
                    yLine,
                    lgt + deltacl + (espcl / 2) * (k - 1),
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  s.pointilles = 4
                  segments.push(s)
                  break
                case 'h':
                  p = polygone([
                    pointAbstrait(lgt + deltacl + (espcl / 2) * (k - 1), yLine),
                    pointAbstrait(lgt + deltacl + (espcl / 2) * k, yLine),
                    pointAbstrait(
                      lgt + deltacl + (espcl / 2) * k,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                    pointAbstrait(
                      lgt + deltacl + (espcl / 2) * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  ])
                  p.couleurDeRemplissage = colorToLatexOrHTML('gray')
                  segments.push(p)
                  break
                case '+':
                  textes.push(
                    sortieTexte(
                      '+',
                      lgt + deltacl + (espcl / 2) * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
                    ),
                  )

                  break
                case '-':
                  textes.push(
                    sortieTexte(
                      '-',
                      lgt + deltacl + (espcl / 2) * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
                    ),
                  )

                  break
              }
            } else if (texte === '||') {
              textes.push(
                sortieTexte(
                  latexContent(texte),
                  lgt + deltacl + (espcl / 2) * (k - 1),
                  yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
                ),
              )
              s = segment(
                lgt + deltacl + (espcl / 2) * (k - 1),
                yLine,
                lgt + deltacl + (espcl / 2) * (k - 1),
                yLine - tabInit0[i][1] * hauteurLignes * intervalle,
              )
              s.pointilles = 4
              segments.push(s)
            } else if (texte === 'R/') {
              // textes.push(sortieTexte(texte, lgt + deltacl + espcl/2 * (k - 0.6), yLine-tabInit0[i][1] / 2))
            } else {
              textes.push(
                sortieTexte(
                  latexContent(texte),
                  lgt + deltacl + (espcl / 2) * (k - 1),
                  yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
                ),
              )
            }
          }
        }
        // On crée une ligne horizontale et les séparations verticales de base
        segments.push(segment(0, yLine, longueurTotale, yLine))
        segments.push(
          segment(
            0,
            yLine,
            0,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        segments.push(
          segment(
            lgt,
            yLine,
            lgt,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        segments.push(
          segment(
            longueurTotale,
            yLine,
            longueurTotale,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        yLine -= tabInit0[i][1] * hauteurLignes * intervalle
        index++
        break
      case 'Var':
        i++ // index des lignes (ça démarre à -1 pour l'entête, ça passe à 0 pour la première ligne (celle sous l'entête) et c'est incrémenté à chaque nouvelle ligne)
        fleches = [] // les points qui marquent le départ et/ou l'arrivée d'une flèche (endroit où se situent les valeurs)
        ZI = [] // Liste de points (qui vont par deux : un sur la ligne du dessus, l'autre en dessous)
        ZIon = false // un booléen qui bascule à true si on entre dans une zone interdite et qui rebascule à false à la prochaine valeur
        // utilisé pour ajouter les deux points de droite servant à faire le rectangle hachuré/
        zonesEstInterdit = [] // Un tableau pour garder la trace des "zones interdites" où il ne doit pas y avoir de flèches
        for (let k = 1; k < tabLines[index].length / 2; k++) {
          textes.push(
            sortieTexte(
              latexContent(tabInit0[i][0]),
              lgt / 2,
              yLine - tabInit0[i][1] * hauteurLignes * demiIntervalle,
            ),
          )
          if (tabLines[index][k * 2] !== '') {
            texte = String(tabLines[index][k * 2])
            long = Number(tabLines[index][k * 2 - 1]) ?? 20
            codeVar = texte.split('/')
            if (codeVar.length === 1) {
              // il n'y a qu'un code
              // on ne fait rien, c'est la commande R/ ou un emplacement vide sans /
            } else if (codeVar.length === 2) {
              // Une seule expression (2 codes séparés par un seul /)
              switch (codeVar[0]) {
                case '+': // une expression
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-': // une expression
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+C': // une expression sur une double barre (prolongement par continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-C': // une expression sur une double barre (prolongement par continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+D': // une expression suivie d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-D': // une expression suivie d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+H': // une expression suivie d’une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  ZI.push(
                    pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
                case '-H': // une expression suivie d’une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  ZI.push(
                    pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
                case 'D-': // expression précédée d'une double barre discontinuité
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case 'D+': // expression précédée d'une double barre discontinuité
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-DH': // expression suivie d'une double barre discontinuité et d'une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  ZI.push(
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine,
                    ),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
                case '+DH': // expression suivie d'une double barre discontinuité et d'une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  ZI.push(
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine,
                    ),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
                case '-CH': // expression sur une double barre discontinuité et d'une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  ZI.push(
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine,
                    ),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
                case '+CH': // expression sur une double barre discontinuité et d'une zone interdite
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  ZI.push(
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine,
                    ),
                    pointAbstrait(
                      lgt + deltacl + espcl * (k - 1) + 0.06,
                      yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                    ),
                  )
                  ZIon = true
                  zonesEstInterdit.push(true)
                  break
              }
            } else {
              // 2 expressions sérarées par / /
              switch (
                codeVar[0] // on regarde le code
              ) {
                case '':
                  break
                case '-CD-': // une expression sur une double barre (continuité) et une expression après la double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+CD+': // une expression sur une double barre (continuité) et une expression après la double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) + long / 14,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-CD+': // une expression sur une double barre (continuité) et une expression après la double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+CD-': // une expression sur une double barre (continuité) et une expression après la double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-D-': // deux expressions de part et d’autre d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+D+': // deux expressions de part et d’autre d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-D+': // deux expressions de part et d’autre d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+D-': // deux expressions de part et d’autre d’une double barre (discontinuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-DC-': // une expression avant une double barre (discontinuité) et une expression sur la double barre (continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+DC+': // une expression avant une double barre (discontinuité) et une expression sur la double barre (continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-DC+': // une expression avant une double barre (discontinuité) et une expression sur la double barre (continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+DC-': // une expression avant une double barre (discontinuité) et une expression sur la double barre (continuité)
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * demiIntervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) - 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  s = segment(
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine,
                    lgt + deltacl + espcl * (k - 1) + 0.05,
                    yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                  )
                  segments.push(s)
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-V-': // deux expressions
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+V+': // deux expressions
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '-V+': // deux expressions
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine - 0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
                case '+V-': // deux expressions
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[1]),
                      lgt + deltacl + espcl * (k - 1) - long / 28,
                      yLine - 0.95,
                    ),
                  )
                  textes.push(
                    sortieTexte(
                      latexContent(codeVar[2]),
                      lgt + deltacl + espcl * (k - 1) + long / 28,
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                  )
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine - 0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  zonesEstInterdit.push(true)
                  fleches.push({
                    point: pointAbstrait(
                      lgt + deltacl + espcl * (k - 1),
                      yLine -
                        tabInit0[i][1] * hauteurLignes * intervalle +
                        0.95,
                    ),
                    margeGauche: -long / 20,
                    margeDroite: long / 20,
                  })
                  if (ZIon) {
                    ZI.push(
                      pointAbstrait(lgt + deltacl + espcl * (k - 1), yLine),
                      pointAbstrait(
                        lgt + deltacl + espcl * (k - 1),
                        yLine - tabInit0[i][1] * hauteurLignes * intervalle,
                      ),
                    )
                    ZIon = false
                  }
                  zonesEstInterdit.push(false)
                  break
              }
            }
          }
        }
        for (let n = 0; n < fleches.length - 1; n++) {
          const marge1 = fleches[n].margeDroite
          const marge2 = fleches[n + 1].margeGauche
          if (!zonesEstInterdit[n]) {
            v = representant(
              vecteur(
                translation(fleches[n].point, vecteur(marge1, 0)),
                translation(fleches[n + 1].point, vecteur(marge2, 0)),
              ),
              translation(fleches[n].point, vecteur(marge1, 0)),
            )
            v.styleExtremites = '->'
            segments.push(v)
          }
        }
        for (let n = 0; n <= ZI.length / 4 - 1; n++) {
          p = polygone(ZI[4 * n], ZI[4 * n + 2], ZI[4 * n + 3], ZI[4 * n + 1])
          p.opacite = 1
          p.hachures = 'north east lines'
          segments.push(p)
        }

        // On crée une ligne horizontale et les séparations verticales de base
        segments.push(segment(0, yLine, longueurTotale, yLine))
        segments.push(
          segment(
            0,
            yLine,
            0,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        segments.push(
          segment(
            lgt,
            yLine,
            lgt,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        segments.push(
          segment(
            longueurTotale,
            yLine,
            longueurTotale,
            yLine - tabInit0[i][1] * hauteurLignes * intervalle,
          ),
        )
        yLine -= tabInit0[i][1] * hauteurLignes * intervalle
        index++
        break
      case 'Val': // ajouter un antécédent et son image sur la flèche. 6 paramètres + 'Val'
        // ['Val',antécédent du début de la flèche, antécédent de la fin de la flèche, position sur la flèche entre 0 et 1, 'antécédent', 'image',long]
        if (tabLines[index][5] !== '') {
          long = tabLines[index][6]
          textes.push(
            sortieTexte(
              latexContent(String(tabLines[index][5])),
              lgt +
                deltacl +
                espcl * (Number(tabLines[index][1]) - 1) +
                1 +
                (espcl - 2) *
                  (Number(tabLines[index][2]) - Number(tabLines[index][1])) *
                  Number(tabLines[index][3]),
              yLine +
                1.1 +
                Number(tabLines[index][3]) *
                  tabInit0[i][1] *
                  hauteurLignes *
                  demiIntervalle,
            ),
          )
          textes.push(
            sortieTexte(
              latexContent(String(tabLines[index][4])),
              lgt +
                deltacl +
                espcl * (Number(tabLines[index][1]) - 1) +
                1 +
                (espcl - 2) *
                  (Number(tabLines[index][2]) - Number(tabLines[index][1])) *
                  Number(tabLines[index][3]),
              -tabInit0[0][1] * hauteurLignes * demiIntervalle,
            ),
          )
        }
        index++
        break
      case 'Ima': // ajouter des valeurs sur la flèche...
        if (tabLines[index][4] !== '') {
          texte = String(tabLines[index][4])
          long = Number(tabLines[index][3])
          textes.push(
            sortieTexte(
              latexContent(texte),
              lgt +
                deltacl +
                (espcl *
                  (Number(tabLines[index][1]) -
                    1 +
                    (Number(tabLines[index][2]) - 1))) /
                  2,
              yLine + tabInit0[i][1] * hauteurLignes * demiIntervalle,
            ),
          )
        }
        index++
        break
      case 'Slope':
        /****************************************************************************/
        // Slope n'est pas implémenté... reste à faire (si quelqu'un en a besoin).
        /****************************************************************************/
        for (let k = 1; k < tabLines[index].length / 2; k++) {
          if (tabLines[index][k * 2] !== '') {
            texte = tabLines[index][k * 2]
            long = tabLines[index][k * 2 + 1]
          }
        }
        break
    }
  }

  // On ferme le tableau en bas
  segments.push(segment(0, yLine, longueurTotale, yLine))
  for (const latex of textes) {
    segments.push(
      latex2d(latex.texte, latex.x, latex.y, { letterSize: 'normalsize' }),
    )
  }
  // Si l'on de définit pas rxmin, rymin, rxmax et rymax, ceux-ci sont fixés par défaut à -0.5 et +0.5, ce qui s'ajoute aux marges déjà prévues pour les segments de -0.2 et +0.2
  // voilà d'où vient le décallage de 0.7 enregistré sur la position des latex par rapport au cadre !
  return segments

  /* pour éviter d'avoir des containers imbriquées, util pour le zoom */
}
