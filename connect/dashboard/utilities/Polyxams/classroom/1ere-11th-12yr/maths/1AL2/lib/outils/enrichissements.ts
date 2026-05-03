import { context } from '../../modules/context'

type optionsAide = {
  texteAvant?: string
  iconeBxIcon?: string
  titreAide?: string
}

/**
 * Affiche une aide au survol en HTML et en note de bas de page en LaTeX
 * @param contenu Contenu à afficher lors du survol en HTML et en note de bas de page en LaTeX
 * @param options
 * @param options.texteAvant texte à afficher avant l'icône
 * @param options.iconeBxIcon Si non précisé, une icône de point d'interrogation est affichée. Chercher sur https://boxicons.com/ une chaîne de caractère de type bx-sun pour afficher une autre icône.
 * @param options.titreAide En HTML : titre de la modale. En LaTeX : texte en gras avant le contenu dans la note de bas de page
 * @returns le code HTML ou LaTeX pour afficher l'aide
 */
export function ajouterAide(contenu: string, options: optionsAide = {}) {
  if (context.isHtml) {
    let HTML = ''
    HTML = `<div class="aide group inline
    text-coopmaths-warn-dark dark:text-coopmathsdark-warn-light"
    >
      ${options.texteAvant ?? ''}
      ${
        options.iconeBxIcon
          ? `<i class="bx ${options.iconeBxIcon}"></i>`
          : '<div class="h-[1em] w-[1em] inline-flex justify-center items-center rounded-full font-bold text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-warn-dark dark:bg-coopmathsdark-warn-light">?</div>'
      }
      <div class="fixed w-5/6 md:w-2/3 lg:w-1/3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden group-hover:flex flex-col items-start justify-start z-10 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark p-2 md:p-4 rounded-xl shadow-lg">
      ${
        options.titreAide
          ? `<div class="text-coopmaths-struct dark:text-coopmathsdark-struct font-semibold text-base md:text-lg">${options.titreAide}</div>
           <div class="text-coopmaths-corpus dark:text-coopmathsdark-corpus font-light pt-2 pl-0 md:pl-2">${contenu}</div>`
          : contenu
      }
      </div>
    </div>`
    return HTML
  } else {
    return `\\textbf{${options.texteAvant ?? ''}} \\anote{\\textbf{${options.titreAide ?? ''}} ${contenu}}`
  }
}

/**
 * Ajoute un hyperlien en HTML et en LaTeX
 * @param url url du lien
 * @param text texte à afficher. Si non précisé, l'url est affichée
 * @returns code HTML ou LaTeX pour afficher le lien
 */
export function ajouterLien(url: string, text?: string) {
  if (context.isHtml) {
    return `<a href="${url}" target="_blank" class="text-coopmaths-action">${text ?? url}</a>`
  }
  return `\\href{${url}}{{${text ?? url}}}`
}

export function ajouterBoutonMathalea2d(
  numeroExercice: number | string,
  fonction: string,
  labelBouton = 'Aide',
  icone = 'info circle',
) {
  return `<button class="group inline-block px-6 py-2.5 mr-10 my-5 ml-6 bg-coopmaths text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-coopmaths-dark hover:shadow-lg focus:bg-coopmaths-dark focus:shadow-lg focus:outline-none focus:ring-0 active:bg-coopmaths-dark active:shadow-lg transition duration-150 ease-in-out" id = "btnMathALEA2d_${numeroExercice}" onclick="${fonction}"><span class="inline-flex items-center gap-1 transform-gpu origin-center will-change-transform transition duration-150 ease-in-out group-hover:scale-110"><i class="large ${icone} icon"></i>${labelBouton}</span></button>`
}

/**
 * Ajoute une image en HTML et en LaTeX
 * @param urlImage du type balancoire_trebuchet.png. Mettre les images dans le dossier public/images. Les svg ne sont pas supportés en LaTeX.
 * @returns le code HTML ou LaTeX pour afficher l'image
 * @author Guillaume Valmont
 */
export function ajouterImage(urlImage: string) {
  if (context.isHtml) {
    return `<img class="inline" src="images/${urlImage}">`
  } else {
    return `\\begin{figure}
    \\includegraphics[width=0.4\\textwidth]{images/${urlImage}}
    \\end{figure}`
  }
}
