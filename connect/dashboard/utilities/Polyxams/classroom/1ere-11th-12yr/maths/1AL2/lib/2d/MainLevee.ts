import rough from 'roughjs'
import type { RoughSVG } from 'roughjs/bin/svg'

class MainLevee {
  private roughSvg!: RoughSVG
  private div!: HTMLDivElement
  private svg: SVGSVGElement
  constructor(rs: RoughSVG, div: HTMLDivElement, svg: SVGSVGElement) {
    this.roughSvg = rs
    this.div = div
    this.svg = svg
  }

  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    { color = '#000', epaisseur = 2, roughness = 1 } = {},
  ) {
    return this.roughSvg.line(x1, y1, x2, y2, {
      roughness,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  arc(
    x: number,
    y: number,
    width: number,
    height: number,
    start: number,
    stop: number,
    closed: boolean,
    { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {},
  ) {
    return this.roughSvg.arc(x, y, width, height, start, stop, closed, {
      roughness,
      bowing,
      disableMultiStroke: true,
      strokeWidth: epaisseur,
      preserveVertices: true,
      seed: 10,
      stroke: color,
    }).outerHTML
  }

  circle(
    x: number,
    y: number,
    rayon: number,
    { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {},
  ) {
    return this.roughSvg.circle(x, y, rayon * 2, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  polygon(
    points: Array<[x: number, y: number]> = [],
    { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {},
  ) {
    return this.roughSvg.polygon(points, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  linearPath(
    points: Array<[x: number, y: number]> = [],
    { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {},
  ) {
    return this.roughSvg.linearPath(points, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  ellipse(
    x: number,
    y: number,
    width: number,
    height: number,
    start: number,
    stop: number,
    closed: boolean,
    { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {},
  ) {
    return this.roughSvg.ellipse(x, y, width, height, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    start: number,
    stop: number,
    closed: boolean,
    { color = '#000', epaisseur = 1, roughness = 1, bowing = 0.5 } = {},
  ) {
    return this.roughSvg.rectangle(x, y, width, height, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  curve(
    points: Array<[x: number, y: number]> = [],
    { color = '#000', epaisseur = 1, roughness = 1.5, bowing = 2.5 } = {},
  ) {
    return this.roughSvg.curve(points, {
      roughness,
      bowing,
      disableMultiStroke: true,
      preserveVertices: true,
      seed: 10,
      strokeWidth: epaisseur,
      stroke: color,
    }).outerHTML
  }

  destroy() {
    this.div.removeChild(this.svg)
  }

  static create() {
    const div: HTMLDivElement | null = document.querySelector('div#appMathalea')
    if (!div) return null
    const svg: SVGSVGElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    )
    svg.style.width = '1024'
    svg.style.height = '1024'
    svg.setAttribute('viewBox', '0 0 0 0')
    div.appendChild(svg)
    const roughSvg = rough.svg(svg)
    return new MainLevee(roughSvg, div, svg)
  }
}

export default MainLevee
