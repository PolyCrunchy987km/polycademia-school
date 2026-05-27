import rough from 'roughjs';
class MainLevee {
    constructor(rs, div, svg) {
        this.roughSvg = rs;
        this.div = div;
        this.svg = svg;
    }
    line(x1, y1, x2, y2, { color = '#000', epaisseur = 2, roughness = 1 } = {}) {
        return this.roughSvg.line(x1, y1, x2, y2, {
            roughness,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    arc(x, y, width, height, start, stop, closed, { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {}) {
        return this.roughSvg.arc(x, y, width, height, start, stop, closed, {
            roughness,
            bowing,
            disableMultiStroke: true,
            strokeWidth: epaisseur,
            preserveVertices: true,
            seed: 10,
            stroke: color,
        }).outerHTML;
    }
    circle(x, y, rayon, { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {}) {
        return this.roughSvg.circle(x, y, rayon * 2, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    polygon(points = [], { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {}) {
        return this.roughSvg.polygon(points, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    linearPath(points = [], { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {}) {
        return this.roughSvg.linearPath(points, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    ellipse(x, y, width, height, start, stop, closed, { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {}) {
        return this.roughSvg.ellipse(x, y, width, height, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    rectangle(x, y, width, height, start, stop, closed, { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {}) {
        return this.roughSvg.rectangle(x, y, width, height, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    curve(points = [], { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {}) {
        return this.roughSvg.curve(points, {
            roughness,
            bowing,
            disableMultiStroke: true,
            preserveVertices: true,
            seed: 10,
            strokeWidth: epaisseur,
            stroke: color,
        }).outerHTML;
    }
    destroy() {
        this.div.removeChild(this.svg);
    }
    static create() {
        const div = document.querySelector('div#appMathalea');
        if (!div)
            return null;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '1024';
        svg.style.height = '1024';
        svg.setAttribute('viewBox', '0 0 0 0');
        div.appendChild(svg);
        const roughSvg = rough.svg(svg);
        return new MainLevee(roughSvg, div, svg);
    }
}
export default MainLevee;
