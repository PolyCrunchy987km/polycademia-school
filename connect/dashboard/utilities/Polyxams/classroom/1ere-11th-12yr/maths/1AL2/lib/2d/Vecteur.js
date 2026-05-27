export class Vecteur {
    constructor(a, b, nom = '') {
        this.nom = nom !== null && nom !== void 0 ? nom : '';
        const isPointLike = (v) => typeof v === 'object' &&
            v != null &&
            'x' in v &&
            'y' in v;
        if (typeof a === 'number' && typeof b === 'number') {
            // Construction par composantes
            this.x = a;
            this.y = b;
            return;
        }
        if (isPointLike(a) && isPointLike(b)) {
            // Construction par deux points A -> B
            this.x = b.x - a.x;
            this.y = b.y - a.y;
            return;
        }
        // Cas invalide
        window.notify('Vecteur : utilisez (x: number, y: number) ou (A, B) pour construire un vecteur.', { a, b, nom });
        this.x = 0;
        this.y = 0;
    }
    norme() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    oppose() {
        this.x = -this.x;
        this.y = -this.y;
    }
    xSVG(coeff) {
        return this.x * coeff;
    }
    ySVG(coeff) {
        return -this.y * coeff;
    }
}
export function vecteur(a, b, nom = '') {
    return new Vecteur(a, b, nom);
}
