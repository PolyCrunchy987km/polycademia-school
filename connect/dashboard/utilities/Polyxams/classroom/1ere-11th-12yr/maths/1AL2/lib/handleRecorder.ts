import { get } from 'svelte/store'
import { buildMathAleaURL } from './components/urls'
import { mathaleaGetExercicesFromParams } from './mathalea'
import { exercicesParams } from './stores/generalStore'
import { globalOptions } from './stores/globalOptions'
import { isIExercice } from './types'

export async function sendActivityParams() {
  const exercices = []
  const exoParams = get(exercicesParams)
  const exo = await mathaleaGetExercicesFromParams(exoParams)
  let i = 0
  for (const param of exoParams) {
    const exercice = exo[i]
    let paramUrl = ''
    for (const key of Object.keys(param)) {
      if (key === 'sup') {
        paramUrl += `s=${param[key]}&`
      } else if (key === 'sup2') {
        paramUrl += `s2=${param[key]}&`
      } else if (key === 'sup3') {
        paramUrl += `s3=${param[key]}&`
      } else if (key === 'sup4') {
        paramUrl += `s4=${param[key]}&`
      } else if (key === 'sup5') {
        paramUrl += `s5=${param[key]}&`
      } else if (key === 'nbQuestions') {
        paramUrl += `n=${param[key]}&`
      } else if (key === 'versionQcm') {
        paramUrl += `qcm\\=${param[key]}&`
      } else if (key !== 'alea' && key !== 'id') {
        paramUrl += `${key}=${param[key]}&`
      }
    }
    paramUrl = paramUrl.slice(0, -1)
    let titre = exoParams[i].uuid
    if (isIExercice(exercice)) {
      titre = exercice.titre
    }
    exercices.push({
      titre,
      url: paramUrl,
    })
    i++
  }
  const options = get(globalOptions)
  const url = buildMathAleaURL({
    view: 'eleve',
    mode: 'un_exo_par_page',
    removeSeed: true,
    recorder: 'Moodle',
  }).toString()
  console.info(url)
  window.parent.postMessage(
    {
      exercices,
      action: 'mathalea:activityParams',
      url,
      globalOptions: options,
    },
    '*',
  )
}
