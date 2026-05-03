import katex from 'katex'

const regexp = /(['$])(.*?)\1/g

export function renderKatex(title: string) {
  const matchs = title.match(regexp)
  matchs?.forEach((match) => {
    title = title.replace(
      match,
      katex.renderToString(match.replaceAll('$', '')),
    )
  })
  return title
}
