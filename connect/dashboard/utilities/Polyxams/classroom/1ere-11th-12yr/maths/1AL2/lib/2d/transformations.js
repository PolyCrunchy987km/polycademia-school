import { egal } from '../../modules/outils';
import { Droite, droite } from './droites';
import { PointAbstrait, pointAbstrait } from './PointAbstrait';
import { Polygone, polygone } from './polygones';
import { Segment, segment } from './segmentsVecteurs';
import { Vecteur, vecteur } from './Vecteur';
/**
 * Convertit un angle en degrés vers des radians
 */
function degToRad(deg) {
    return (deg * Math.PI) / 180;
}
// Implémentation (type union d'interfaces, garde par propriétés)
export function translation(O, vecteurTranslation, // ← Renommer le paramètre
nom = '', positionLabel = 'above', color = 'black') {
    // Points (PointAbstrait ou PointAbstrait)
    if (O instanceof PointAbstrait || O instanceof PointAbstrait) {
        const x = O.x + vecteurTranslation.x;
        const y = O.y + vecteurTranslation.y;
        if (O instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if ('listePoints' in O) {
        const p2 = [];
        for (let i = 0; i < O.listePoints.length; i++) {
            const pi = translation(O.listePoints[i], vecteurTranslation);
            pi.nom = O.listePoints[i].nom + "'";
            p2[i] = pi;
        }
        return polygone(p2, color);
    }
    // Droite
    if ('pente' in O) {
        const M = translation(pointAbstrait(O.x1, O.y1), vecteurTranslation);
        const N = translation(pointAbstrait(O.x2, O.y2), vecteurTranslation);
        return droite(M, N, color);
    }
    // Segment
    if ('extremite1' in O && 'extremite2' in O) {
        const M = translation(O.extremite1, vecteurTranslation);
        const N = translation(O.extremite2, vecteurTranslation);
        const s = segment(M, N, color);
        s.styleExtremites = O.styleExtremites;
        return s;
    }
    if ('norme' in O) {
        // Vecteur: invariant par translation -> renvoyer un vecteur identique
        return vecteur(O.x, O.y);
    }
    return O;
}
// Implémentation
export function translation2Points(O, A, B, nom = '', positionLabel = 'above', color = 'black') {
    // Points (PointAbstrait ou PointAbstrait)
    if (O instanceof PointAbstrait || O instanceof PointAbstrait) {
        const x = O.x + B.x - A.x;
        const y = O.y + B.y - A.y;
        if (O instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if ('listePoints' in O) {
        const p2 = [];
        for (let i = 0; i < O.listePoints.length; i++) {
            const pi = translation2Points(O.listePoints[i], A, B);
            pi.nom = O.listePoints[i].nom + "'";
            p2[i] = pi;
        }
        return polygone(p2, color);
    }
    // Droite
    if ('pente' in O) {
        const M = translation2Points(pointAbstrait(O.x1, O.y1), A, B);
        const N = translation2Points(pointAbstrait(O.x2, O.y2), A, B);
        return droite(M, N, color);
    }
    // Segment
    if ('extremite1' in O && 'extremite2' in O) {
        const M = translation2Points(O.extremite1, A, B);
        const N = translation2Points(O.extremite2, A, B);
        const s = segment(M, N, color);
        s.styleExtremites = O.styleExtremites;
        return s;
    }
    // Vecteur (ne change pas par translation)
    if ('x' in O && 'y' in O) {
        return vecteur(O.x, O.y);
    }
    // Fallback
    return O;
}
// Implémentation (avec classes concrètes pour instanceof)
export function rotation(A, O, angle, nom = '', positionLabel = 'above', color = 'black') {
    if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
        const x = O.x +
            (A.x - O.x) * Math.cos((angle * Math.PI) / 180) -
            (A.y - O.y) * Math.sin((angle * Math.PI) / 180);
        const y = O.y +
            (A.x - O.x) * Math.sin((angle * Math.PI) / 180) +
            (A.y - O.y) * Math.cos((angle * Math.PI) / 180);
        if (A instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    if (A instanceof Polygone) {
        const p2 = [];
        for (let i = 0; i < A.listePoints.length; i++) {
            p2[i] = rotation(A.listePoints[i], O, angle);
            p2[i].nom = A.listePoints[i].nom + "'";
        }
        return polygone(p2, color);
    }
    if ('pente' in A) {
        const M = rotation(pointAbstrait(A.x1, A.y1), O, angle);
        const N = rotation(pointAbstrait(A.x2, A.y2), O, angle);
        return droite(M, N, '', color);
    }
    if (A instanceof Segment) {
        const M = rotation(A.extremite1, O, angle);
        const N = rotation(A.extremite2, O, angle);
        const s = segment(M, N, color);
        s.styleExtremites = A.styleExtremites;
        return s;
    }
    // Vecteur
    let x = 0;
    let y = 0;
    if ('x' in A && 'y' in A) {
        x =
            A.x * Math.cos((angle * Math.PI) / 180) -
                A.y * Math.sin((angle * Math.PI) / 180);
        y =
            A.x * Math.sin((angle * Math.PI) / 180) +
                A.y * Math.cos((angle * Math.PI) / 180);
    }
    return vecteur(x, y);
}
// Implémentation
export function homothetie(objet, O, k, nom = '', positionLabel = 'above', color = 'black') {
    // Points (PointAbstrait ou PointAbstrait)
    if (objet instanceof PointAbstrait || objet instanceof PointAbstrait) {
        const x = O.x + k * (objet.x - O.x);
        const y = O.y + k * (objet.y - O.y);
        if (objet instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if ('listePoints' in objet) {
        const p2 = [];
        for (let i = 0; i < objet.listePoints.length; i++) {
            p2[i] = homothetie(objet.listePoints[i], O, k);
            p2[i].nom = objet.listePoints[i].nom + "'";
        }
        return polygone(p2, color);
    }
    // Droite
    if ('pente' in objet) {
        const M = homothetie(pointAbstrait(objet.x1, objet.y1), O, k);
        const N = homothetie(pointAbstrait(objet.x2, objet.y2), O, k);
        return droite(M, N, '', color);
    }
    // Segment
    if ('extremite1' in objet && 'extremite2' in objet) {
        const M = homothetie(objet.extremite1, O, k);
        const N = homothetie(objet.extremite2, O, k);
        const s = segment(M, N, color);
        s.styleExtremites = objet.styleExtremites;
        return s;
    }
    // Vecteur
    return vecteur(objet.x * k, objet.y * k);
}
// Implémentation
export function symetrieAxiale(A, d, nom = '', positionLabel = 'above', color = 'black') {
    let x, y;
    const a = d.a;
    const b = d.b;
    const c = d.c;
    const k = 1 / (a * a + b * b);
    // Points (PointAbstrait ou PointAbstrait)
    if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
        if (a === 0) {
            x = A.x;
            y = -(A.y + (2 * c) / b);
        }
        else if (b === 0) {
            y = A.y;
            x = -(A.x + (2 * c) / a);
        }
        else {
            x = k * ((b * b - a * a) * A.x - 2 * a * b * A.y - 2 * a * c);
            y =
                k *
                    ((a * a - b * b) * A.y - 2 * a * b * A.x + (a * a * c) / b - b * c) -
                    c / b;
        }
        if (A instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if ('listePoints' in A) {
        const p2 = [];
        for (let i = 0; i < A.listePoints.length; i++) {
            p2[i] = symetrieAxiale(A.listePoints[i], d);
            p2[i].nom = A.listePoints[i].nom + "'";
        }
        return polygone(p2, color);
    }
    // Droite
    if (A instanceof Droite || 'pente' in A) {
        const M = symetrieAxiale(pointAbstrait(A.x1, A.y1), d);
        const N = symetrieAxiale(pointAbstrait(A.x2, A.y2), d);
        return droite(M, N, color);
    }
    // Segment
    if ('extremite1' in A && 'extremite2' in A) {
        const M = symetrieAxiale(A.extremite1, d);
        const N = symetrieAxiale(A.extremite2, d);
        const s = segment(M, N, color);
        s.styleExtremites = A.styleExtremites;
        return s;
    }
    // Vecteur
    let O;
    if (egal(b, 0)) {
        O = pointAbstrait(-c / a, 0);
    }
    else {
        O = pointAbstrait(0, -c / b);
    }
    const M = translation(O, A);
    const N = symetrieAxiale(M, d);
    const v = vecteur(N.x - O.x, N.y - O.y);
    return v;
}
// Implémentation
export function projectionOrtho(M, d, nom = '', positionLabel = 'above') {
    const a = d.a;
    const b = d.b;
    const c = d.c;
    const k = 1 / (a * a + b * b);
    let x, y;
    // Points (PointAbstrait ou PointAbstrait)
    if (M instanceof PointAbstrait || M instanceof PointAbstrait) {
        if (a === 0) {
            x = M.x;
            y = -c / b;
        }
        else if (b === 0) {
            y = M.y;
            x = -c / a;
        }
        else {
            x = k * (b * b * M.x - a * b * M.y - a * c);
            y = k * (-a * b * M.x + a * a * M.y + (a * a * c) / b) - c / b;
        }
        if (M instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Vecteur
    let O;
    if (egal(b, 0))
        O = pointAbstrait(-c / a, 0);
    else
        O = pointAbstrait(0, -c / b);
    const A = translation(O, M);
    const N = projectionOrtho(A, d);
    const v = vecteur(O, N);
    return v;
}
// Implémentation
export function affiniteOrtho(A, d, k, nom = '', positionLabel = 'above', color = 'black') {
    const a = d.a;
    const b = d.b;
    const c = d.c;
    const q = 1 / (a * a + b * b);
    let x, y;
    // Points (PointAbstrait ou PointAbstrait)
    if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
        if (a === 0) {
            x = A.x;
            y = k * A.y + (c * (k - 1)) / b;
        }
        else if (b === 0) {
            y = A.y;
            x = k * A.x + (c * (k - 1)) / a;
        }
        else {
            x = q * (b * b * A.x - a * b * A.y - a * c) * (1 - k) + k * A.x;
            y =
                q * (a * a * A.y - a * b * A.x + (a * a * c) / b) * (1 - k) +
                    (k * c) / b +
                    k * A.y -
                    c / b;
        }
        if (A instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if (A instanceof Polygone) {
        const p2 = [];
        for (let i = 0; i < A.listePoints.length; i++) {
            p2[i] = affiniteOrtho(A.listePoints[i], d, k);
            p2[i].nom = A.listePoints[i].nom + "'";
        }
        return polygone(p2, color);
    }
    // Droite
    if ('pente' in A) {
        const M = affiniteOrtho(pointAbstrait(A.x1, A.y1), d, k);
        const N = affiniteOrtho(pointAbstrait(A.x2, A.y2), d, k);
        return droite(M, N, color);
    }
    // Segment
    if (A instanceof Segment) {
        const M = affiniteOrtho(A.extremite1, d, k);
        const N = affiniteOrtho(A.extremite2, d, k);
        const s = segment(M, N, color);
        s.styleExtremites = A.styleExtremites;
        return s;
    }
    // Vecteur
    let O;
    if (egal(b, 0)) {
        O = pointAbstrait(-c / a, 0);
    }
    else {
        O = pointAbstrait(0, -c / b);
    }
    const M = translation(O, A);
    const N = affiniteOrtho(M, d, k);
    return new Vecteur(O, N);
}
// Implémentation
export function similitude(A, O, a, k, nom = '', positionLabel = 'above', color = 'black') {
    // Points (PointAbstrait ou PointAbstrait)
    if (A instanceof PointAbstrait || A instanceof PointAbstrait) {
        const ra = degToRad(a);
        const x = O.x + k * (Math.cos(ra) * (A.x - O.x) - Math.sin(ra) * (A.y - O.y));
        const y = O.y + k * (Math.cos(ra) * (A.y - O.y) + Math.sin(ra) * (A.x - O.x));
        if (A instanceof PointAbstrait) {
            return pointAbstrait(x, y, nom, positionLabel);
        }
        else {
            return pointAbstrait(x, y, nom, positionLabel);
        }
    }
    // Polygone
    if ('listePoints' in A) {
        const p2 = [];
        for (let i = 0; i < A.listePoints.length; i++) {
            p2[i] = similitude(A.listePoints[i], O, a, k);
            p2[i].nom = A.listePoints[i].nom + "'";
        }
        return polygone(p2, color);
    }
    // Droite
    if ('pente' in A) {
        const M = similitude(pointAbstrait(A.x1, A.y1), O, a, k);
        const N = similitude(pointAbstrait(A.x2, A.y2), O, a, k);
        return droite(M, N, color);
    }
    // Segment
    if ('extremite1' in A && 'extremite2' in A) {
        const M = similitude(A.extremite1, O, a, k);
        const N = similitude(A.extremite2, O, a, k);
        const s = segment(M, N, color);
        s.styleExtremites = A.styleExtremites;
        return s;
    }
    // Vecteur
    let v = A;
    const V = rotation(v, O, a);
    v = homothetie(V, O, k);
    return v;
}
