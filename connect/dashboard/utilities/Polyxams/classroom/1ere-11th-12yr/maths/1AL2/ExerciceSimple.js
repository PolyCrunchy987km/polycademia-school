import Exercice from './Exercice';
export default class ExerciceSimple extends Exercice {
    constructor() {
        super();
        this.distracteurs = [];
        this.typeExercice = 'simple';
    }
    get key() {
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
        ].join('_');
    }
}
