export class ObjetMathalea2D {
    constructor() {
        this.positionLabel = 'above';
        // Valeur par défaut simple (évite d'importer colorToLatexOrHTML ici)
        this.color = ['black', '{black}'];
        this.style = '';
        this.epaisseur = 1;
        this.opacite = 1;
        this.pointilles = 0;
        this.id = ObjetMathalea2D._nextId++;
        this.bordures = [NaN, NaN, NaN, NaN];
    }
    svg(..._args) {
        return '';
    }
    tikz(..._args) {
        return '';
    }
}
ObjetMathalea2D._nextId = 0;
