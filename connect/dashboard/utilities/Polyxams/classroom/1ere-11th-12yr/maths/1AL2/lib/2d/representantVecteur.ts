import { nomVecteurParPosition } from './NomVecteurParPosition'
import { PointAbstrait, pointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { similitude, translation } from './transformations'
import { milieu } from './utilitairesPoint'
import type { Vecteur } from './Vecteur'

export function representant(v: Vecteur, A: PointAbstrait, color = 'black') {
  const B = pointAbstrait(A.x + v.x, A.y + v.y)
  const s = segment(A, B, color, '->')
  s.tailleExtremites = 5
  return s
}

export function representantNomme(
  v: Vecteur,
  A: PointAbstrait,
  nom: string,
  taille = 1,
  color = 'black',
) {
  let s
  let vTransformed
  const B = pointAbstrait(A.x + v.x, A.y + v.y)
  const M = milieu(A, B)
  s = segment(A, B, color)
  const angle = s.angleAvecHorizontale
  vTransformed = similitude(v, A, 90, 0.5 / v.norme())
  if (Math.abs(angle) > 90) {
    s = segment(B, A, color)
    vTransformed = similitude(v, A, -90, 0.5 / v.norme())
  }
  const N = translation(M, vTransformed)
  return nomVecteurParPosition(nom, N.x, N.y, taille, 0, color)
}
