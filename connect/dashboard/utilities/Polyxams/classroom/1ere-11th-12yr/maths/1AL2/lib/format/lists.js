import { context } from '../../modules/context';
// const unorderedListTypes: string[] = ['puces', 'carres', 'qcm', 'fleches']
const orderedListTypes = [
    'nombres',
    'alpha',
    'Alpha',
    'roman',
    'Roman',
];
const labelsByStyle = new Map([
    ['puces', '$\\bullet$'],
    ['carres', '\\tiny$\\blacksquare$'],
    ['qcm', '$\\square$'],
    ['fleches', '\\tiny$\\blacktriangleright$'],
    ['nombres', '\\arabic*.'],
    ['alpha', '\\alph*.'],
    ['Alpha', '\\Alph*.'],
    ['roman', '\\roman*.'],
    ['Roman', '\\Roman*.'],
]);
/**
 * Vérifier si le type d'un objet est bien `DescriptionItem`
 * (`typeof` ne fonctionnant pas pour les types maison)
 * @see https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 * @param item Objet à controller
 * @returns `true` si l'objet est de type `DescriptionItem`
 */
export function isDescriptionItem(item) {
    return item.description !== undefined;
}
/**
 * Contruit une liste formattée suivant un style à partir d'un tableau de chaînes de caractères comme entrées.
 * @param {NestedList} list Objet décrivant la liste
 * @param {number} startWith Numéro de départ pour les listes numérotées
 * @returns {string} chaîne représentant le code HTML ou LaTeX à afficher suivant la variable `context.isHtml`
 * @author sylvain, Jean-Léon Henry
 * @link https://forge.apps.education.fr/coopmaths/mathalea/-/wikis/Numérotation-et-listes
 */
export function createList(list, shift = '', startWith = 1, nestedLevel = 0) {
    var _a, _b, _c;
    const isOrdered = orderedListTypes.includes(list.style);
    let lineStart = list.style === 'none' ? '' : '\t\\item ';
    let lineEnd = list.style === 'none' ? '\\par' : '';
    const lineBreak = '\n';
    const label = (_a = labelsByStyle.get(list.style)) !== null && _a !== void 0 ? _a : ''; // only used in latex output
    const HTMLCorrection = startWith > 1 ? ` start='${startWith}'` : '';
    const LaTeXCorrection = startWith > 1
        ? ` \\setcounter{enum${'i'.repeat(nestedLevel + 1)}}{${startWith - 1}}`
        : '';
    let openingTagOrdered = '\\begin{enumerate}';
    let openingTagUnordered = '\\begin{itemize}';
    let closingTagOrdered = '\\end{enumerate}';
    let closingTagUnordered = '\\end{itemize}';
    let openingTagLine;
    let output = '';
    if (context.isHtml) {
        lineStart = list.style === 'none' ? '<li>' : '\t<li>';
        lineEnd = '</li>';
        let classOptionsFormatted = (_b = list.classOptions) !== null && _b !== void 0 ? _b : '';
        if (classOptionsFormatted !== '') {
            classOptionsFormatted = ' ' + classOptionsFormatted;
        }
        openingTagOrdered = `<ol class='${list.style}${classOptionsFormatted}'${HTMLCorrection}>`;
        openingTagUnordered = `<ul class='${list.style}${classOptionsFormatted}'>`;
        closingTagOrdered = '</ol>';
        closingTagUnordered = '</ul>';
    }
    const openingTag = isOrdered ? openingTagOrdered : openingTagUnordered;
    const closingTag = isOrdered ? closingTagOrdered : closingTagUnordered;
    openingTagLine = lineBreak + shift + openingTag;
    const closingTagLine = shift + closingTag + lineBreak;
    if (!context.isHtml && label.length !== 0) {
        openingTagLine += `[label=${label}]` + LaTeXCorrection;
    }
    else {
        openingTagLine += !context.isHtml ? LaTeXCorrection : '';
    }
    openingTagLine += lineBreak;
    output += openingTagLine;
    function lineFactory(inside, before = shift + lineStart, after = lineEnd + lineBreak) {
        return before + inside + after;
    }
    for (const item of list.items) {
        let liContent = '';
        if (typeof item === 'string') {
            liContent = item;
        }
        else if (isDescriptionItem(item)) {
            if (!context.isHtml) {
                output += lineFactory(item.text, shift + `\t\\item[\\textbf{${item.description}}] `);
                continue;
            }
            const span = `<span>${item.description}</span>`;
            liContent = span + item.text;
        }
        else {
            // item is neither a string or a DescriptionItem, it's probably a sublist
            liContent =
                ((_c = item.introduction) !== null && _c !== void 0 ? _c : '') +
                    createList(item, shift + '\t', 1, nestedLevel++);
        }
        output += lineFactory(liContent);
    }
    output += closingTagLine;
    return output;
}
