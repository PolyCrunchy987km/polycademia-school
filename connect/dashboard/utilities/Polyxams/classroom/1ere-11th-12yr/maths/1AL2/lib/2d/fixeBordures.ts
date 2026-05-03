/*
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%% LES FONCTIONS - FORMATAGE %%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
*/

import type { NestedObjetMathalea2dArray, ObjetDivLatex } from '../../types/2d'
import type { ObjetMathalea2D } from './ObjetMathalea2D'

/**
 * codeSvg(segment(A,B),polygone(D,E,F),labelPoints(A,B))
 *
 * @author Rémi Angot
 * @private
 */
// JSDOC Validee par EE Juin 2022
/* Ce code n'est plus utilisé : il l'était dans l'éditeur 2d

export function codeSvg (fenetreMathalea2d, pixelsParCm, mainlevee, ...objets) {
  let code
  const fenetrexmin = fenetreMathalea2d[0]
  const fenetreymin = -fenetreMathalea2d[3]
  const fenetrexmax = fenetreMathalea2d[2]
  const fenetreymax = -fenetreMathalea2d[1]

  code = `<svg width="${(fenetrexmax - fenetrexmin) * pixelsParCm}" height="${(fenetreymax - fenetreymin) * pixelsParCm}" viewBox="${fenetrexmin * pixelsParCm} ${fenetreymin * pixelsParCm} ${(fenetrexmax - fenetrexmin) * pixelsParCm} ${(fenetreymax - fenetreymin) * pixelsParCm}" xmlns="http://www.w3.org/2000/svg">\n`
  for (const objet of objets) {
    if (Array.isArray(objet)) {
      for (let i = 0; i < objet.length; i++) {
        try {
          if (!mainlevee || typeof objet[i].svgml === 'undefined') { code += '\t' + objet[i].svg(pixelsParCm) + '\n' } else {
            code += '\t' + objet[i].svgml(pixelsParCm, context.amplitude) + '\n'
          }
        } catch (error) {
          console.log(error.message)
        }
      }
    }
    try {
      if (!mainlevee || typeof objet.svgml === 'undefined') { code += '\t' + objet.svg(pixelsParCm) + '\n' } else code += '\t' + objet.svgml(pixelsParCm, context.amplitude) + '\n'
    } catch (error) {
      console.log(error.message)
    }
  }
  code += '</svg>'
  return code
}
*/

/**
 * codeTikz(segment(A,B),polygone(D,E,F),labelPoints(A,B))
 *
 * @author Rémi Angot
 * @private
 */
/* Ce code n'est plus utilisé : il l'était dans l'éditeur 2d
// JSDOC Validee par EE Juin 2022
export function codeTikz (fenetreMathalea2d, scale, mainlevee, ...objets) {
  let code = ''
  const fenetrexmin = fenetreMathalea2d[0]
  const fenetreymin = fenetreMathalea2d[3] * -1
  const fenetrexmax = fenetreMathalea2d[2]
  const fenetreymax = fenetreMathalea2d[1] * -1
  const sortie = context.isHtml

  context.isHtml = false
  if (scale === 1) {
    code += '\\begin{tikzpicture}[baseline]\n'
  } else {
    code += `\\begin{tikzpicture}[baseline,scale = ${scale.toFixed(2)}]\n`
  }
  code += `\\tikzset{
    point/.style={
      thick,
      draw,
      cross out,
      inner sep=0pt,
      minimum width=5pt,
      minimum height=5pt,
    },
  }
  \\clip (${fenetrexmin},${fenetreymin}) rectangle (${fenetrexmax},${fenetreymax});

  \n\n`

  for (const objet of objets) {
    if (Array.isArray(objet)) {
      for (let i = 0; i < objet.length; i++) {
        try {
          if (!mainlevee || typeof objet[i].tikzml === 'undefined') { code += '\t' + objet[i].tikz(scale) + '\n' } else code += '\t' + objet[i].tikzml(context.amplitude) + '\n'
        } catch (error) {
          console.log(error.message)
        }
      }
    }
    try {
      if (!mainlevee || typeof objet.tikzml === 'undefined') { code += '\t' + objet.tikz(scale) + '\n' } else code += '\t' + objet.tikzml(context.amplitude) + '\n'
    } catch (error) {
      console.log(error.message)
    }
  }
  code += '\\end{tikzpicture}\n'

  context.isHtml = sortie
  return code
}
*/

/**
 * @param {object} options
 * @param {number} [options.rxmin] marge à gauche 0.5 par défaut (peut être fixée à 0 si on veut)
 * @param {number} [options.rxmax] marge à droite 0.5 par défaut
 * @param {number} [options.rymin] marge en bas 0.5 par défaut (peut être fixée à 0 si on veut)
 * @param {number} [options.rymax] marge en haut 0.5 par défaut
 * @param {number} [options.rzoom] facteur multiplicatif des marges... implémenté en cas de problème avec le zoom ?
 * @param {object} objets // tableau contenant les objets à afficher
 * Les objets affichables doivent avoir un attribut this.bordures = [xmin, ymin, xmax, ymax] 4 nombres dans cet ordre.
 * Si this.bordures n'est pas défini ou n'est pas un tableau de 4 éléments, l'objet est ignoré
 * Si aucun objet passé en argument n'a de "bordures" alors la fonction retourne une zone inaffichable et un message d'erreur est créé
 * @return {{xmin: number, ymin:number, xmax:number, ymax:number}}
 */
export function fixeBordures(
  objets: NestedObjetMathalea2dArray,
  { rxmin = -0.5, rymin = -0.5, rxmax = 0.5, rymax = 0.5, rzoom = 1 } = {},
) {
  /**
   *
   * @param{number} xmin
   * @param{number} ymin
   * @param{number} xmax
   * @param{number} ymax
   * @param objets
   * @param bordures
   * @returns {[number,number,number,number,boolean]}
   */
  const majBordures: (
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    borduresTrouvees: boolean,
  ) => [number, number, number, number, boolean] = (
    xmin: number,
    ymin: number,
    xmax: number,
    ymax: number,
    objets: ObjetMathalea2D | NestedObjetMathalea2dArray | ObjetDivLatex,
    borduresTrouvees: boolean,
  ) => {
    if (objets == null) return [xmin, ymin, xmax, ymax, borduresTrouvees]
    if (!Array.isArray(objets)) {
      const bordures = objets.bordures ?? null
      if (bordures === null || isNaN(bordures[0])) {
        window.notify(
          `Ìl y a un problème avec les bordures de ${objets.constructor.name}... elles ne sont pas définies !`,
          { objets },
        )
      } else if (!Array.isArray(bordures)) {
        window.notify(
          `Les bordures de ${objets.constructor.name} ne sont pas un array : ${JSON.stringify(bordures)}`,
          { ...objets },
        )
      } else if (bordures.filter((el) => isNaN(el)).length > 0) {
        window.notify(
          `Les bordures de ${objets.constructor.name} sont bien un array mais contiennent autre chose que des nombres : ${bordures}`,
          { ...objets },
        )
      } else {
        xmin = Math.min(xmin, bordures[0])
        xmax = Math.max(xmax, bordures[2])
        ymin = Math.min(ymin, bordures[1])
        ymax = Math.max(ymax, bordures[3])
        borduresTrouvees = true
      }
    } else {
      for (const objet of objets) {
        ;[xmin, ymin, xmax, ymax, borduresTrouvees] = majBordures(
          xmin,
          ymin,
          xmax,
          ymax,
          objet,
          borduresTrouvees,
        )
      }
    }
    return [xmin, ymin, xmax, ymax, borduresTrouvees]
  }
  let xmin = 1000
  let ymin = 1000
  let xmax = -1000
  let ymax = -1000
  let borduresTrouvees = false
  ;[xmin, ymin, xmax, ymax, borduresTrouvees] = majBordures(
    xmin,
    ymin,
    xmax,
    ymax,
    objets,
    borduresTrouvees,
  )
  if (!borduresTrouvees) {
    window.notify('fixeBordures : aucun objet ne définit de bordures valides', {
      ...objets,
    })
  }
  return {
    xmin: xmin + rxmin * rzoom,
    xmax: xmax + rxmax * rzoom,
    ymin: ymin + rymin * rzoom,
    ymax: ymax + rymax * rzoom,
  }
}
