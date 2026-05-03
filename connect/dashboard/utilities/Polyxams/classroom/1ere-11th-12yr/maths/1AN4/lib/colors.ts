// couleurs pour le texte
export const coopmathsCorpus = '#1F2429'
export const coopmathsCorpusLight = '#45505b'
export const coopmathsCorpusLightest = '#6a7c8d'
export const coopmathsCorpusDark = '#191d21'
export const coopmathsCorpusDarkest = '#131619'
// couleurs pour les liens, boutons,... et pour les résultats
export const coopmathsAction = '#F15929'
export const coopmathsActionLight = '#f47a54'
export const coopmathsActionLightest = '#f79b7f'
export const coopmathsActionDark = '#d43d0e'
export const coopmathsActionDarkest = '#9f2e0a'
export const coopmathsAction100 = '#feeeea'
export const coopmathsAction200 = '#fcded4'
export const coopmathsAction300 = '#fbcdbf'
export const coopmathsAction400 = '#f9bda9'
export const coopmathsAction500 = '#f8ac94'
export const coopmathsAction600 = '#f79b7f'
export const coopmathsAction700 = '#f58b69'
export const coopmathsAction800 = '#f47a54'
export const coopmathsAction900 = '#f26a3e'
// couleurs pour les mises en relief
export const coopmathsWarn = '#80D925'
export const coopmathsWarnLight = '#99e150'
export const coopmathsWarnLightest = '#b3e97c'
export const coopmathsWarnDark = '#66ae1e'
export const coopmathsWarnDarkest = '#4d8216'
export const coopmathsWarn50 = '#f3fced'
export const coopmathsWarn100 = '#e6f9db'
export const coopmathsWarn200 = '#daf5c9'
export const coopmathsWarn300 = '#cdf2b7'
export const coopmathsWarn400 = '#c1eea4'
export const coopmathsWarn500 = '#b4ea90'
export const coopmathsWarn600 = '#a8e67c'
export const coopmathsWarn700 = '#9be265'
export const coopmathsWarn800 = '#8edd4b'
export const coopmathsWarn900 = '#6ebc1f'
export const coopmathsWarn1000 = '#5da119'
export const coopmathsWarn1100 = '#4d8613'
// couleurs pour les éléments de structure (lignes, numérotation, cadres de tableau, etc)
export const coopmathsStruct = '#216D9A'
export const coopmathsStructLight = '#2c93cf'
export const coopmathsStructLightest = '#5faedd'
export const coopmathsStructDark = '#1a577b'
export const coopmathsStructDarkest = '#14415c'
// couleurs pour les fonds
export const coopmathsCanvas = '#ffffff'
export const coopmathsCanvasDark = '#f6f6f6'
export const coopmathsCanvasDarkest = '#e9e9e9'
export const coopmathsCanvasMoreDark = '#c8c8c8'
// alias
export const orangeMathalea = coopmathsAction
export const bleuMathalea = coopmathsStruct
export const vertMathalea = coopmathsWarn1100
export const noirMathalea = coopmathsCorpus

export function parseHexColor(
  input: string,
): null | {
  withHash: string
  withoutHash: string
  r: number
  g: number
  b: number
} {
  const regex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/
  const match = input.match(regex)
  if (!match) return null // Pas une couleur hex valide

  let hex = match[1]
  // Convertit les couleurs courtes (#abc → #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  return {
    withHash: `#${hex.toUpperCase()}`,
    withoutHash: `${hex.toUpperCase()}`,
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}
