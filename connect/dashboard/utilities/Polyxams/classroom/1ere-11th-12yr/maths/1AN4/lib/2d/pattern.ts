import { context } from '../../modules/context'

/**
 *
 * @param {number} index Choix du motif
 * le nom du motif sert dans la fonction pattern
 * @author Jean-claude Lhote
 */

export function motifs(index: number) {
  switch (index) {
    case 0:
      return 'north east lines'
    case 1:
      return 'horizontal lines'
    case 2:
      return 'vertical lines'
    case 3:
      return 'dots'
    case 4:
      return 'crosshatch dots'
    case 5:
      return 'fivepointed stars'
    case 6:
      return 'sixpointed stars'
    case 7:
      return 'bricks'
    case 8:
      return 'checkerboard'
    case 9:
      return 'grid'
    case 10:
      return 'crosshatch'
    default:
      return 'north east lines'
  }
}
/**
 * Génère du code TikZ pour dessiner un motif de hachures personnalisé dans un rectangle.
 *
 * @param params - Objet contenant les paramètres de dessin.
 * @param params.x0 - Coordonnée x du coin inférieur gauche.
 * @param params.y0 - Coordonnée y du coin inférieur gauche.
 * @param params.x1 - Coordonnée x du coin supérieur droit.
 * @param params.y1 - Coordonnée y du coin supérieur droit.
 * @param params.distanceDesHachures - Espacement entre les éléments du motif (hachures, points...).
 * @param params.couleurDesHachures - Couleur utilisée pour dessiner le motif.
 * @param params.motif - Type de motif à dessiner. Valeurs possibles :
 *   - "north east lines" : lignes diagonales à 45°
 *   - "horizontal lines" : hachures horizontales
 *   - "vertical lines" : hachures verticales
 *   - "dots" : points réguliers (taille fixe ~0.05cm)
 *   - "crosshatch" : superposition de hachures horizontales et verticales
 *   - "grid" : identique à "crosshatch"
 *   - "checkerboard" : damier avec des carrés de côté `distanceDesHachures`
 *   - "crosshatch dots" : grille de points superposée à un quadrillage
 *   - "fivepointed stars" : étoiles à 5 branches disposées en grille.
 *       → Modifier `minimum size` dans le code pour ajuster la taille des étoiles (par défaut : 5pt)
 *   - "sixpointed stars" : étoiles à 6 branches, même principe que ci-dessus.
 *       → Modifier `minimum size` ou `star point ratio` pour ajuster style/taille
 *   - "bricks" : motif de briques horizontales décalées.
 *       → La largeur est `2 × distanceDesHachures` et la hauteur est `distanceDesHachures`
 *       → Pour des briques plus grandes, augmenter `distanceDesHachures`
 *
 * @author Éric Elter
 * @returns Une chaîne contenant le code TikZ généré, ou une chaîne vide si le motif est inconnu.
 *
 * @deprecated Cette fonction n'est pas recommandée pour créer des motifs au sein d'une surface quelconque en tikz
 * car elle ne fait qu'une surface rectangulaire et le fait en ajoutant un clip et un code très long.
 * Le même résultat (hachures, points, étoiles...) peut être obtenu la propriété hachures de l'objet Polygone.
 * les hachures sont gérées par la fonction pattern() et retourne une option pour la commande draw qui est plus efficace.
 * Il est donc préférable d'utiliser la propriété hachures des objets Polygone. (Jean-claude Lhote)
 */

export function patternTikZ(params: {
  x0: number
  y0: number
  x1: number
  y1: number
  distanceDesHachures: number
  couleurDesHachures: string
  motif: string
}): string {
  const { x0, y0, x1, y1, distanceDesHachures, couleurDesHachures, motif } =
    params

  const lignes: string[] = []
  const hauteur = y1 - y0

  lignes.push('\\begin{scope}')
  lignes.push(`\\clip (${x0},${y0}) rectangle (${x1},${y1});`)

  switch (motif) {
    case 'horizontal lines': {
      for (let y = y0; y <= y1; y += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x0},${y.toFixed(2)}) -- (${x1},${y.toFixed(2)});`,
        )
      }
      break
    }

    case 'vertical lines': {
      for (let x = x0; x <= x1; x += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x.toFixed(2)},${y0}) -- (${x.toFixed(2)},${y1});`,
        )
      }
      break
    }

    case 'dots': {
      for (let x = x0; x <= x1; x += distanceDesHachures) {
        for (let y = y0; y <= y1; y += distanceDesHachures) {
          lignes.push(
            `\\fill[${couleurDesHachures}] (${x.toFixed(2)},${y.toFixed(2)}) circle (0.05);`,
          )
        }
      }
      break
    }

    case 'crosshatch': {
      // Combine horizontal + vertical
      for (let y = y0; y <= y1; y += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x0},${y.toFixed(2)}) -- (${x1},${y.toFixed(2)});`,
        )
      }
      for (let x = x0; x <= x1; x += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x.toFixed(2)},${y0}) -- (${x.toFixed(2)},${y1});`,
        )
      }
      break
    }

    case 'grid': {
      // Quadrillage = idem crosshatch
      const side = distanceDesHachures / 5
      for (let y = y0; y <= y1; y += side) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x0},${y.toFixed(2)}) -- (${x1},${y.toFixed(2)});`,
        )
      }
      for (let x = x0; x <= x1; x += side) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x.toFixed(2)},${y0}) -- (${x.toFixed(2)},${y1});`,
        )
      }
      break
    }

    case 'checkerboard': {
      const side = distanceDesHachures / 3
      let toggle = false
      for (let y = y0; y < y1; y += side) {
        toggle = !toggle
        for (let x = x0 + (toggle ? 0 : side); x < x1; x += 2 * side) {
          lignes.push(
            `\\fill[${couleurDesHachures}] (${x.toFixed(2)},${y.toFixed(2)}) rectangle (${(x + side).toFixed(2)},${(y + side).toFixed(2)});`,
          )
        }
      }
      break
    }

    case 'fivepointed stars': {
      const side = distanceDesHachures / 3
      for (let x = x0; x <= x1; x += side) {
        for (let y = y0; y <= y1; y += side) {
          lignes.push(
            `\\node[star,star points=5,star point ratio=2.25,fill=${couleurDesHachures},inner sep=0pt,minimum size=5pt] at (${x.toFixed(2)},${y.toFixed(2)}) {};`,
          )
        }
      }
      break
    }

    case 'sixpointed stars': {
      const side = distanceDesHachures / 2
      for (let x = x0; x <= x1; x += side) {
        for (let y = y0; y <= y1; y += side) {
          lignes.push(
            `\\node[star,star points=6,star point ratio=2.25,fill=${couleurDesHachures},inner sep=0pt,minimum size=5pt] at (${x.toFixed(2)},${y.toFixed(2)}) {};`,
          )
        }
      }
      break
    }

    case 'crosshatch dots': {
      // Grille de points
      const side = distanceDesHachures / 5
      for (let x = x0; x <= x1; x += side) {
        for (let y = y0; y <= y1; y += side) {
          lignes.push(
            `\\fill[${couleurDesHachures}] (${x.toFixed(2)},${y.toFixed(2)}) circle (0.05);`,
          )
        }
      }
      // Hachures horizontales
      for (let y = y0; y <= y1; y += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x0},${y.toFixed(2)}) -- (${x1},${y.toFixed(2)});`,
        )
      }
      // Hachures verticales
      for (let x = x0; x <= x1; x += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x.toFixed(2)},${y0}) -- (${x.toFixed(2)},${y1});`,
        )
      }
      break
    }

    case 'bricks': {
      const brickWidth = distanceDesHachures * 2
      const brickHeight = distanceDesHachures
      for (let y = y0; y < y1; y += brickHeight) {
        const isOddRow = Math.floor((y - y0) / brickHeight) % 2 === 1
        const xStart = isOddRow ? x0 - brickWidth / 2 : x0
        for (let x = xStart; x < x1; x += brickWidth) {
          const xLeft = Math.max(x, x0)
          const xRight = Math.min(x + brickWidth, x1)
          const yTop = Math.min(y + brickHeight, y1)
          if (xRight > x0 && xLeft < x1) {
            lignes.push(
              `\\draw(${xLeft.toFixed(2)},${y.toFixed(2)}) rectangle (${xRight.toFixed(2)},${yTop.toFixed(2)});`,
            )
          }
        }
      }
      break
    }

    case 'north east lines':
    default: {
      const xmin = x0 - hauteur
      const xmax = x1 + hauteur
      for (let x = xmin; x <= xmax; x += distanceDesHachures) {
        lignes.push(
          `\\draw[${couleurDesHachures}] (${x.toFixed(2)},${y0}) -- ++(${hauteur},${hauteur});`,
        )
      }
      break
    }
  }

  lignes.push('\\end{scope};')
  return lignes.join('\n')
}
/**
 *
 * @param {object} param0 paramètres de définition du motif de remplissage
 * définit un motif de remplissage pour les polygones, les rectangles... ou tout élément SVG qui se remplit.
 * @author Jean-claude Lhote
 */

export function pattern({
  motif = 'north east lines',
  id = '0',
  distanceDesHachures = 10,
  epaisseurDesHachures = 1,
  couleurDesHachures = 'black',
  couleurDeRemplissage = 'none',
  opaciteDeRemplissage = 0.5,
}) {
  let myPattern = ''
  if (context.isHtml) {
    if (couleurDeRemplissage.length < 1) {
      couleurDeRemplissage = 'none'
    }
    switch (motif) {
      case 'north east lines':
        myPattern += `<pattern id="pattern${id}" width="${distanceDesHachures}" height="${distanceDesHachures}"  patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="${distanceDesHachures}" height="${distanceDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"/>
            <line x1="0" y1="0" x2="0" y2="${distanceDesHachures}" style="stroke:${couleurDesHachures}; stroke-width:${epaisseurDesHachures}" />
            </pattern>`
        break
      case 'horizontal lines':
        myPattern += `<pattern id="pattern${id}" width="${distanceDesHachures}" height="${distanceDesHachures}"  patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="${distanceDesHachures}" height="${distanceDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"/>
            <line x1="0" y1="${distanceDesHachures / 2}" x2="${distanceDesHachures}" y2="${distanceDesHachures / 2}" style="stroke:${couleurDesHachures}; stroke-width:${epaisseurDesHachures}" />
            </pattern>`
        break
      case 'vertical lines':
        myPattern += `<pattern id="pattern${id}" width="${distanceDesHachures}" height="${distanceDesHachures}"  patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="${distanceDesHachures}" height="${distanceDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"/>
            <line x1="0" y1="0" x2="0" y2="${distanceDesHachures}" style="stroke:${couleurDesHachures}; stroke-width:${epaisseurDesHachures}" />
            </pattern>`
        break
      case 'dots':
        myPattern += `<pattern id="pattern${id}" width="${distanceDesHachures}" height="${distanceDesHachures}"  patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
            <circle cx="8" cy="3" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
            <circle cx="3" cy="8" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
            <circle cx="8" cy="8" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
            </pattern>`
        break
      case 'crosshatch dots':
        myPattern += `<pattern id="pattern${id}" width="12" height="12" x="12" y="12" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="8" cy="2" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="5" cy="5" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="2" cy="8" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="8" cy="8" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="5" cy="11" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="11" cy="5" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          <circle cx="11" cy="11" r="${epaisseurDesHachures}" fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}"/>
          </pattern>`
        break
      case 'fivepointed stars':
        myPattern += `<pattern id="pattern${id}" width="12" height="12" x="10" y="10" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <polygon points="10,5 6.2,4.2 6.6,0.2 4.6,3.6 1,2 3.6,5 1,8 4.6,6.4 6.6,9.8 6.2,5.8 " stroke="${couleurDesHachures}"  fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}" />
          </pattern>`
        break
      case 'sixpointed stars':
        myPattern += `<pattern id="pattern${id}"  width="12" height="12" x="10" y="10" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
        <polygon points="10,5 7.6,3.4 7.6,0.6 5,2 2.6,0.6 2.4,3.4 0,5 2.4,6.4 2.6,9.4 5,8 7.6,9.4 7.6,6.4 " stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}" />
        </pattern>`
        break
      case 'crosshatch':
        myPattern += `<pattern id="pattern${id}" width="12" height="12" x="10" y="10" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <polygon points="2,2 7.6,7.6 7,8.4 9.8,8.4 9.8,5.6 9,6.2 3.4,0.6 " stroke="${couleurDesHachures}"  fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}" />
          </pattern>`
        break
      case 'bricks':
        myPattern += `<pattern id="pattern${id}" width="18" height="16" x="18" y="16" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <line x1="4" y1="2" x2="4" y2="4" stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"  />
          <line x1="0" y1="4" x2="16" y2="4" stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"   />
          <line x1="14" y1="4" x2="14" y2="12" stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"   />
          <line x1="16" y1="12" x2="0" y2="12" stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"   />
          <line x1="4" y1="12" x2="4" y2="16" stroke="${couleurDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"   />
          </pattern>`
        break
      case 'grid':
        myPattern += `<pattern id="pattern${id}" width="10" height="10" x="10" y="10" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <polyline points="8,8 0,8 0,0 " fill="none" stroke="${couleurDesHachures}" />
          </pattern>`
        break
      case 'checkerboard':
        myPattern += `<pattern id="pattern${id}" width="8" height="8" x="8" y="8" patternTransform="rotate(0 0 0)" patternUnits="userSpaceOnUse">
          <polygon points="4,4 8,4 8,0 4,0 "  fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}" />
          <polygon points="0,4 4,4 4,8 0,8 "  fill="${couleurDesHachures}" fill-opacity="${opaciteDeRemplissage}" />
        
          </pattern>`
        break
      default:
        myPattern += `<pattern id="pattern${id}" width="${distanceDesHachures}" height="${distanceDesHachures}"  patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="${distanceDesHachures}" height="${distanceDesHachures}" fill="${couleurDeRemplissage}" fill-opacity="${opaciteDeRemplissage}"/>
        <line x1="0" y1="0" x2="0" y2="${distanceDesHachures}" style="stroke:${couleurDesHachures}; stroke-width:${epaisseurDesHachures}" />
        </pattern>`
        break
    }
    return myPattern
  } else if (context.issortieNB) {
    switch (motif) {
      case 'north east lines':
        myPattern = `pattern = {Lines[angle=45, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'horizontal lines':
        myPattern = `pattern = {Lines[angle=0, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'vertical lines':
        myPattern = `pattern = {Lines[angle=90, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'dots':
        myPattern = `pattern = ${motif}`
        break
      case 'crosshatch dots':
        myPattern = `pattern = ${motif}`
        break
      case 'fivepointed stars':
        myPattern = `pattern = ${motif}`
        break
      case 'sixpointed stars':
        myPattern = `pattern = ${motif}`
        break
      case 'crosshatch':
        myPattern = `pattern = ${motif}`
        break
      case 'bricks':
        myPattern = `pattern = ${motif}`
        break
      case 'grid':
        myPattern = `pattern = ${motif}`
        break
      case 'checkerboard':
        myPattern = `pattern = ${motif}`
        break
      default:
        myPattern = `pattern = {Lines[angle=45, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
    }
    return myPattern
  } else {
    // Sortie Latex
    switch (motif) {
      case 'north east lines':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = {Lines[angle=45, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'horizontal lines':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = {Lines[angle=0, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'vertical lines':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = {Lines[angle=90, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
      case 'dots':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'crosshatch dots':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'fivepointed stars':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'sixpointed stars':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'crosshatch':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'bricks':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'grid':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      case 'checkerboard':
        myPattern = `pattern color = ${couleurDesHachures}, pattern = ${motif}`
        break
      default:
        myPattern = `pattern color = ${couleurDesHachures}, pattern = {Lines[angle=45, distance=${distanceDesHachures}pt, line width=0.3pt]}`
        break
    }
    return `${myPattern}`
  }
}
