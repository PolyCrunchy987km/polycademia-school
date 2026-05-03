export function ripple(node: HTMLElement, color: string = 'rgba(255, 255, 255, 0.4)') {
  function handleClick(event: MouseEvent) {
    const rect = node.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const rippleEl = document.createElement('span')
    rippleEl.style.cssText = `
      position: absolute;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      width: 100px;
      height: 100px;
      transform: translate(-50%, -50%) scale(0);
      animation: ripple-animation 0.6s ease-out forwards;
      left: ${x}px;
      top: ${y}px;
    `

    // Ensure parent has position relative
    const computedStyle = window.getComputedStyle(node)
    if (computedStyle.position === 'static') {
      node.style.position = 'relative'
    }
    node.style.overflow = 'hidden'

    node.appendChild(rippleEl)

    rippleEl.addEventListener('animationend', () => {
      rippleEl.remove()
    })
  }

  node.addEventListener('click', handleClick)

  return {
    destroy() {
      node.removeEventListener('click', handleClick)
    },
    update(newColor: string) {
      color = newColor
    }
  }
}
