import { context } from '../../modules/context'

/**
 * Renvoie le html ou le latex qui met les 2 chaines de caractères fournies sur 2 colonnes différentes
 * @author Rémi Angot
 * @param {string} cont1 - Contenu de la première colonne
 * @param {string} cont2 - Contenu de la deuxième colonne
 * @param {number} [largeur1=50] Largeur de la première colonne
 * @return {string}
 */
export function deuxColonnes(cont1, cont2, largeur1 = 50) {
  if (context.isHtml) {
    return `
    <div>
    <div class="question" style="float:left;max-width: ${largeur1}%;margin-right: 30px">
    ${cont1}
   </div>
   <div style="float:left; max-width: ${90 - largeur1}%">
    ${cont2}
   </div>
   <div style="clear:both"></div>
   <div class="ui hidden divider"></div>
   </div>
`
  } else {
    return `\\begin{multicols}{2}
    ${cont1.replaceAll('<br>', '\\\\\n')}

    ${cont2.replaceAll('<br>', '\\\\\n')}
    \\end{multicols}
`
  }
}

/**
 * Renvoie le html ou le latex qui met les 2 chaines de caractères fournies sur 2 colonnes différentes
 * @author Nathan Scheinmann
 * @param {string} cont1 - Contenu de la première colonne
 * @param {string} cont2 - Contenu de la deuxième colonne
 * @param {string} cont3 - Contenu de la deuxième colonne
 * @param {number} [largeur1=33] Largeur de la première colonne
 * @param {number} [largeur2=33] Largeur de la première colonne
 * @return {string}
 */
export function troisColonnes(
  cont1,
  cont2,
  cont3,
  largeur1 = 33,
  largeur2 = 33,
) {
  if (context.isHtml) {
    return `
    <div>
      <div class="question" style="float:left;max-width: ${largeur1}%;margin-right: 10px;">
        ${cont1}
      </div>
      <div style="float:left; max-width: ${largeur2}%;margin-right: 10px;">
        ${cont2}
      </div>
      <div style="float:left; max-width: ${100 - largeur1 - largeur2}%;margin-right: 10px;">
        ${cont3}
      </div>
      <div style="clear:both"></div>
      <div class="ui hidden divider"></div>
    </div>
    `
  } else {
    return `\\begin{multicols}{3}
    ${cont1.replaceAll('<br>', '\\\\\n')}

    ${cont2.replaceAll('<br>', '\\\\\n')}

    ${cont3.replaceAll('<br>', '\\\\\n')}
    \\end{multicols}
    `
  }
}
/**
 * Renvoie le html ou le latex qui met les 2 chaines de caractères fournies sur 2 colonnes différentes
 * Si en sortie html, il n'y a pas assez de places alors on passe en momocolonne !
 * @author Mickael Guironnet
 * @param {string} cont1 - Contenu de la première colonne
 * @param {string} cont2 - Contenu de la deuxième colonne
 * @param {{eleId?: string, largeur1: number, widthmincol1: string, widthmincol2: string, stylecol1?: string, stylecol2?: string}} options
 *          eleId : identifiant ID pour retrouver la colonne
 *          largeur1 : largeur de la première colonne en latex en pourcentage
 *          widthmincol1 : largeur de la première minimum en html en px
 *          widthmincol2 : largeur de la deuxième minimum en html en px
 *  ex : deuxColonnesResp (enonce, correction, {eleId : '1_1', largeur1:50, widthmincol1: '400px', widthmincol2: '200px'})
 * @return {string}
 */
export function deuxColonnesResp(cont1, cont2, options) {
  if (options === undefined) {
    options = { largeur1: 50 }
  } else if (typeof options === 'number') {
    options = { largeur1: options }
  }
  if (options.largeur1 === undefined) {
    options.largeur1 = 50
  }
  if (options.stylecol1 === undefined) {
    options.stylecol1 = ''
  }
  if (options.stylecol2 === undefined) {
    options.stylecol2 = ''
  }
  if (options.widthmincol1 === undefined) {
    options.widthmincol1 = '0px'
  }
  if (options.widthmincol2 === undefined) {
    options.widthmincol2 = '0px'
  }

  if (context.isHtml) {
    return `
    <style>
    .cols-responsive {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-gap: 1rem;
    }
    /* Screen larger than 900px? 2 column */
    @media (min-width: 900px) {
      .cols-responsive { grid-template-columns: repeat(2, 1fr); }
    }
    </style>
    <div class='cols-responsive'>
      <div id='cols-responsive1-${options.eleId}'style='min-width:${options.widthmincol1};${options.stylecol1}' >
      ${cont1}
      </div>
      <div id='cols-responsive2-${options.eleId}' style='min-width:${options.widthmincol2};${options.stylecol2}' >
      ${cont2}
      </div>
    </div>
`
  } else {
    return `\\begin{minipage}{${options.largeur1 / 100}\\linewidth}
    ${cont1.replaceAll('<br>', '\\\\\n')}
    \\end{minipage}
    \\begin{minipage}{${(100 - options.largeur1) / 100}\\linewidth}
    ${cont2.replaceAll('<br>', '\\\\\n')}
    \\end{minipage}
    `
  }
}

/**
 *
 * @param {string} texte
 * @returns le texte centré dans la page selon le contexte.
 * @author Jean-Claude Lhote
 */
export function centrage(texte) {
  return context.isHtml
    ? `<center>${texte}</center>`
    : `\\begin{center}\n \t${texte}\n \\end{center}\n`
}

/**
 * Renvoie un environnent LaTeX multicolonnes
 * @author Rémi Angot
 */
export function texMulticols(texte, nbCols = 2) {
  let result
  if (nbCols > 1) {
    result =
      '\\begin{multicols}{' + nbCols + '}\n' + texte + '\n\\end{multicols}'
  } else {
    result = texte
  }
  return result
}

/**
 * Centre un texte
 *
 * @author Rémi Angot
 */
export function texteCentre(texte) {
  if (context.isHtml) {
    return `<p style="text-align: center">${texte}</p>`
  } else {
    return `\\begin{center}
${texte}
\\end{center}`
  }
}
