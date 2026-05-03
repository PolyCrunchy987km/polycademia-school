import type { IExerciceQcmOptions } from '../lib/types'
import Exercice from './Exercice'

export default class ExerciceSimple extends Exercice {
  distracteurs: (string | number)[]
  typeExercice: 'simple'
  versionQcmDisponible?: boolean // Pour les exercices de type simple, si des distracteurs sont définis, on peut proposer une version QCM
  versionQcm?: boolean // Seulement pour les exercices de type simple, version QCM activée si 'true'
  versionQcmOptions?: IExerciceQcmOptions
  constructor() {
    super()
    this.distracteurs = []
    this.typeExercice = 'simple'
  }

  get key(): string {
    return [
      this.nbQuestions,
      this.interactif,
      this.sup,
      this.sup2,
      this.sup3,
      this.sup4,
      this.sup5,
      this.seed,
      this.correctionDetaillee,
      this.versionQcm,
    ].join('_')
  }
}
