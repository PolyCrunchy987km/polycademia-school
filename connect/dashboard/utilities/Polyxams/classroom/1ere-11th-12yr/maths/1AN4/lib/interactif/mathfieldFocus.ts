export function isMathfieldFocused(activeElement: Element | null): boolean {
  if (activeElement == null) return false

  if (activeElement.tagName === 'MATH-FIELD') {
    return true
  }

  const shadowActiveElement = activeElement.shadowRoot?.activeElement ?? null
  if (shadowActiveElement != null) {
    return isMathfieldFocused(shadowActiveElement)
  }

  return false
}
