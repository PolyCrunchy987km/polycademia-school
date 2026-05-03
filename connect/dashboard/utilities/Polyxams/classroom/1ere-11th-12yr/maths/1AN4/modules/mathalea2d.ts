import katex from 'katex'
import { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'
import { normaliseOrientation } from '../lib/2d/utilitairesGeometriques'
import {
  buildDataKeyboardFromStyle,
  convertClasseToString,
} from '../lib/interactif/claviers/keyboard'
import type {
  MetaInteractif2dData,
  NestedObjetMathalea2dArray,
  ObjetDivLatex,
} from '../types/2d'
import { context } from './context'
const buildDataKeyboardString = (style = '') => {
  const blocks = buildDataKeyboardFromStyle(style)
  return blocks.join(' ')
}
/*
  MathALEA2D
 @name      mathalea2d
 @author    Rémi Angot et Jean-claude Lhote
 @license   MIT License - CC-BY-SA
 @homepage  https://coopmaths.fr/mathalea2d.html
 */

// Remarque : la définition concrète de ObjetMathalea2D vit désormais dans
// src/lib/2d/ObjetMathalea2D.ts ; on n'effectue plus de réexport runtime ici
// (cela évite des dépendances circulaires).
// export { ObjetMathalea2D } from '../lib/2d/ObjetMathalea2D'

/**
 * mathalea2d(xmin,xmax,ymin,ymax,objets)
 *
 * @author Rémi Angot
 *
 *
 * Le paramètre optionsTikz est un tableau de strings contenant exclusivement des options Tikz à ajouter
 * si scale existe autre que 1 il faut que le code reste comme avant
 * sinon on ajoute scale quoi qu'il en soit quitte à ce que xscale et yscale viennent s'ajouter
 * de cette manière d'autres options Tikz pourront aussi être ajoutées
 * si il n'y a qu'une optionsTikz on peut passer un string
 * @param {object} options
 *  @param {number} [options.xmin = 0]
 *  @param {number} [options.ymin = 0]
 *  @param {number} [options.xmax = 15]
 *  @param {number} [options.ymax = 6]
 *  @param {number?} [options.pixelsParCm]
 *  @param {number?} [options.scale = 1]
 *  @param {number?} [options.zoom = 1]
 *  @param {string|string[]?} [options.optionsTikz = []]
 *  @param {boolean?} [options.mainlevee]
 *  @param {number?} [options.amplitude]
 *  @param {string?} [options.style = '']
 *  @param {string?} [options.id = '']
 * @param {(ObjetMathalea2D|ObjetMathalea2D[])[]} objets
 */
export function mathalea2d(
  {
    xmin = 0,
    ymin = 0,
    xmax = 15,
    ymax = 6,
    pixelsParCm = 20,
    scale = 1,
    zoom = 1,
    optionsTikz = [],
    mainlevee = false,
    amplitude = 1,
    style = 'display: block',
    id = '', // L'id peut-être utile pour des animations, c'est celui du svg. Le div englobant aura un id en M2D + id
    usePgfplots = false,
    centerLatex = false,
  }: {
    xmin?: number
    ymin?: number
    xmax?: number
    ymax?: number
    pixelsParCm?: number
    scale?: number
    zoom?: number
    optionsTikz?: string | string[]
    mainlevee?: boolean
    amplitude?: number
    style?: string
    id?: string
    usePgfplots?: boolean
    centerLatex?: boolean
  } = {},
  ...objets: NestedObjetMathalea2dArray
) {
  const ajouteCodeHtml = (
    mainlevee: boolean,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    divsLatex: string[],
    xmin: number,
    ymax: number,
  ) => {
    let codeSvg = ''
    // Dans le cas d'objets composites avec des objets Mathalea2d et des divLatex, il faut que ces objets exposent une propriété objets qui contient la liste des objets qui les composent.
    // Cette list est substituée à l'objet ici
    if (objets instanceof ObjetMathalea2D) {
      if (objets.objets != null) {
        objets = objets.objets as ObjetMathalea2D[]
      }
    } // c'est un objet composé d'objets. Exemple : Repere
    if (!Array.isArray(objets) && objets != null) {
      try {
        const objet = objets as ObjetMathalea2D
        if (!mainlevee || typeof objet?.svgml === 'undefined') {
          if (objet?.svg) {
            const code = objet.svg(pixelsParCm)
            if (typeof code === 'string') {
              codeSvg = '\t' + objet.svg(pixelsParCm) + '\n'
            } else {
              const codeLatex = code as ObjetDivLatex
              // on a à faire à un divLatex.
              if (typeof codeLatex !== 'object') {
                window.notify(
                  "Dans mathalea2d, la méthode svg() de l'objet a renvoyé quelque chose d'inconnu",
                  { codeLatex },
                )
                return codeSvg
              }

              const xSvg = (codeLatex.x - xmin) * pixelsParCm * zoom
              const ySvg = -(codeLatex.y - ymax) * pixelsParCm * zoom
              if ('letterSize' in codeLatex) {
                codeLatex.backgroundColor = codeLatex.backgroundColor
                  .replace('{', '')
                  .replace('}', '')
                codeLatex.color = codeLatex.color
                  .replace('{', '')
                  .replace('}', '')

                const divOuterHtml =
                  codeLatex.backgroundColor !== '' &&
                  codeLatex.backgroundColor !== 'none'
                    ? `<div class="divLatex" style="background-color: ${codeLatex.backgroundColor}; position: absolute; top: ${ySvg}px; left: ${xSvg}px; transform: translate(-50%,-50%) rotate(${-codeLatex.orientation}deg); opacity: ${codeLatex.opacity};" data-top=${ySvg} data-left=${xSvg}>${katex.renderToString('\\' + codeLatex.letterSize + ' {\\color{' + codeLatex.color + '}{' + (codeLatex.gras ? '\\textbf{' : '') + codeLatex.latex.replaceAll('color[HTML]', 'color') + (codeLatex.gras ? '}' : '') + '}}')}</div>`
                    : `<div class="divLatex" style="position: absolute; top: ${ySvg}px; left: ${xSvg}px; transform: translate(-50%,-50%) rotate(${normaliseOrientation(-codeLatex.orientation)}deg); opacity: ${codeLatex.opacity};" data-top=${ySvg} data-left=${xSvg}>${katex.renderToString('{\\color{' + codeLatex.color + '} \\' + codeLatex.letterSize + '{' + (codeLatex.gras ? '\\textbf{' : '') + codeLatex.latex.replaceAll('color[HTML]', 'color') + (codeLatex.gras ? '}' : '') + '}}')}</div>`
                divsLatex.push(divOuterHtml)
              } else if ('exercice' in codeLatex) {
                if ('inputs' in codeLatex) {
                  const code = codeLatex as unknown as MetaInteractif2dData
                  const inputs = code.inputs
                  const isInteractif = code.exercice.interactif
                  for (const input of inputs) {
                    const xSvgInput = (input.x - xmin) * pixelsParCm * zoom
                    const ySvgInput = -(input.y - ymax) * pixelsParCm * zoom
                    const dataKeyboard = buildDataKeyboardString(
                      convertClasseToString(input.classe),
                    )
                    const divOuterHtml = `<div class="divLatex" style="position: absolute; top: ${ySvgInput}px; left: ${xSvgInput}px; transform: translate(-50%,-50%); opacity: ${input.opacity};" data-top=${ySvgInput} data-left=${xSvgInput}>${
                      isInteractif
                        ? `<math-field data-keyboard="${dataKeyboard}" virtual-keyboard-mode=manual readonly class="${input.classe} metaInteractif2d" id="MetaInteractif2dEx${code.exercice.numeroExercice}Q${code.question}field${input.index}">${input.content.replace('%{champ1}', '\\placeholder[champ1]{}')}</math-field>`
                        : `$${input.content.replace('%{champ1}', input.blanc)}$`
                    }</div>`
                    divsLatex.push(divOuterHtml)
                  }
                }
              } else {
                window.notify(
                  "Dans mathalea2d, la méthode svg() de l'objet a renvoyé un objet inconnu",
                  { codeLatex },
                )
              }
            }
          }
        } else {
          if (objet?.svgml) {
            codeSvg = '\t' + objet.svgml(pixelsParCm, amplitude) + '\n'
          }
        }
      } catch (error: unknown) {
        window.notify(
          error instanceof Error ? (error as Error).message : String(error),
          { objet: JSON.stringify(objets) },
        )
      }
    } else {
      if (objets != null && Array.isArray(objets)) {
        for (const objet of objets) {
          codeSvg += ajouteCodeHtml(mainlevee, objet, divsLatex, xmin, ymax)
        }
      } else {
        window.notify(
          'Un problème avec ce mathalea2d, la liste des objets contient un truc louche',
          { objets: JSON.stringify(objets) },
        )
      }
    }
    return codeSvg
  }
  const ajouteCodeTikz = (
    mainlevee: boolean,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    skipRepere = false,
    axisYMin?: number,
    axisYMax?: number,
    axisXMin?: number,
    axisXMax?: number,
  ) => {
    let codeTikz = ''
    // Skip Repere objects when using pgfplots (pgfplots handles axis/grid)
    // Check BEFORE expanding objets.objets
    if (
      skipRepere &&
      objets instanceof ObjetMathalea2D &&
      (objets as any).isRepere === true
    ) {
      return codeTikz
    }
    // Don't expand Courbe objects when using pgfplots (they handle their own tikz output)
    // Check BEFORE expanding objets.objets
    const shouldNotExpand =
      objets instanceof ObjetMathalea2D && (objets as any).usePgfplots === true
    if (objets instanceof ObjetMathalea2D) {
      if (objets.objets != null && !shouldNotExpand) {
        objets = objets.objets as ObjetMathalea2D[]
      }
    } // c'est un objet composé d'objets. Exemple : Repere
    if (!Array.isArray(objets)) {
      try {
        // Only access tikz / tikzml on actual ObjetMathalea2D instances.
        if (objets instanceof ObjetMathalea2D) {
          if (!mainlevee || typeof objets.tikzml === 'undefined') {
            if (typeof objets.tikz === 'function') {
              // Pass axis bounds to Courbe's tikz method
              if ((objets as any).usePgfplots === true) {
                codeTikz =
                  '\t' +
                  objets.tikz(axisYMin, axisYMax, axisXMin, axisXMax) +
                  '\n'
              } else {
                codeTikz = '\t' + objets.tikz() + '\n'
              }
            }
          } else {
            if (typeof objets.tikzml === 'function') {
              codeTikz = '\t' + objets.tikzml(amplitude) + '\n'
            }
          }
        }
        // If objets is not an ObjetMathalea2D (e.g. ObjetDivLatex), do nothing for TikZ.
      } catch (error: unknown) {
        console.log(error instanceof Error ? error.message : String(error))
      }
    } else {
      for (const objet of objets) {
        codeTikz += ajouteCodeTikz(
          mainlevee,
          objet,
          skipRepere,
          axisYMin,
          axisYMax,
          axisXMin,
          axisXMax,
        )
      }
    }
    return codeTikz
  }
  // On prépare le code HTML
  const divsLatex: string[] = []
  let codeSvg = `<svg class="mathalea2d"  ${id !== '' ? `id="${id}"` : ''} width="${(xmax - xmin) * pixelsParCm * zoom}" height="${
    (ymax - ymin) * pixelsParCm * zoom
  }" viewBox="${xmin * pixelsParCm} ${-ymax * pixelsParCm} ${
    (xmax - xmin) * pixelsParCm
  } ${(ymax - ymin) * pixelsParCm}" xmlns="http://www.w3.org/2000/svg" >\n`
  codeSvg += ajouteCodeHtml(mainlevee, objets, divsLatex, xmin, ymax)
  codeSvg += '\n</svg>'
  codeSvg = codeSvg.replace(/\\thickspace/gm, ' ')
  const codeHTML = `<div class="svgContainer" ${style ? `style="${style}"` : ''}>
        <div ${id !== '' ? `id="M2D${id}"` : ''} style="position: relative;${style}">
          ${codeSvg}
          ${divsLatex.join('\n')}
        </div>
      </div>`
  // On prépare le code Latex
  // si scale existe autre que 1 il faut que le code reste comme avant
  // sinon on ajoute scale quoi qu'il en soit quitte à ce que xscale et yscale viennent s'ajouter
  // de cette manière d'autres options Tikz pourront aussi être ajoutées
  // si il n'y a qu'une optionsTikz on peut passer un string
  let codeTikz
  const listeOptionsTikz: string[] = []
  if (optionsTikz !== undefined) {
    if (typeof optionsTikz === 'string') {
      listeOptionsTikz.push(optionsTikz)
    } else {
      optionsTikz.forEach((e) => listeOptionsTikz.push(e))
    }
  }

  if (usePgfplots) {
    // Use pgfplots with axis environment instead of tikzpicture
    codeTikz = centerLatex ? '{\\centering\n' : ''
    codeTikz += '\\begin{tikzpicture}[baseline'
    for (let l = 0; l < listeOptionsTikz.length; l++) {
      codeTikz += `,${listeOptionsTikz[l]}`
    }
    if (scale !== 1) {
      codeTikz += `,scale = ${scale}`
    }
    codeTikz += ']\n'
    codeTikz += '\\begin{axis}[\n'
    codeTikz += `  xmin=${xmin}, xmax=${xmax},\n`
    codeTikz += `  ymin=${ymin}, ymax=${ymax},\n`
    codeTikz += '  axis lines=middle,\n'
    codeTikz += '  axis line style={-Stealth},\n'
    codeTikz += '  axis on top=false,\n'
    codeTikz += '  xlabel={},\n'
    codeTikz += '  ylabel={},\n'
    codeTikz += '  xtick distance=2,\n'
    codeTikz += '  ytick distance=2,\n'
    codeTikz += '  minor tick num=1,\n'
    codeTikz += '  grid=both,\n'
    codeTikz += '  grid style={line width=.1pt, draw=gray!30},\n'
    codeTikz += '  major grid style={line width=.2pt,draw=gray!50},\n'
    codeTikz += '  tick label style={font=\\scriptsize},\n'
    codeTikz += '  every axis plot/.append style={line width=1pt},\n'
    codeTikz += '  clip=true,\n'
    codeTikz += ']\n'
    // code += codeTikz(...objets)
    codeTikz += ajouteCodeTikz(mainlevee, objets, true, ymin, ymax, xmin, xmax) // Skip Repere when using pgfplots, pass axis bounds
    codeTikz += '\\end{axis}\n'
    codeTikz += '\\end{tikzpicture}'
    if (centerLatex) codeTikz += '\\par}'
  } else {
    // Standard tikzpicture behavior
    codeTikz = centerLatex ? '{\\centering\n' : ''
    if (scale === 1) {
      codeTikz += '\\begin{tikzpicture}[baseline'
      for (let l = 0; l < listeOptionsTikz.length; l++) {
        codeTikz += `,${listeOptionsTikz[l]}`
      }
      codeTikz += ']\n'
    } else {
      codeTikz += '\\begin{tikzpicture}[baseline'
      for (let l = 0; l < listeOptionsTikz.length; l++) {
        codeTikz += `,${listeOptionsTikz[l]}`
      }
      codeTikz += `,scale = ${scale}`
      codeTikz += ']\n'
    }

    codeTikz += `
    \\tikzset{
      point/.style={
        thick,
        draw,
        cross out,
        inner sep=0pt,
        minimum width=5pt,
        minimum height=5pt,
      },
    }
    \\clip (${xmin},${ymin}) rectangle (${xmax},${ymax});
    `
    // code += codeTikz(...objets)
    codeTikz += ajouteCodeTikz(mainlevee, objets)
    codeTikz += '\n\\end{tikzpicture}'
    if (centerLatex) codeTikz += '\\par}'
  }

  if (style.includes('display: block') && !centerLatex) codeTikz += '\\\\\n'
  if (context.isHtml) return codeHTML
  else return codeTikz
}
