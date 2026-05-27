import { ObjetMathalea2D } from './ObjetMathalea2D';
export class Vide2d extends ObjetMathalea2D {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.bordures = [x, y, x, y];
        this.tikz = () => '';
        this.svg = () => '';
    }
}
/**
 * Un objet pour rien mettre à la place de quelque chose.
 * @param x
 * @param y
 * @returns {Vide2d}
 */
export function vide2d(x = 0, y = 0) {
    return new Vide2d(x, y);
}
