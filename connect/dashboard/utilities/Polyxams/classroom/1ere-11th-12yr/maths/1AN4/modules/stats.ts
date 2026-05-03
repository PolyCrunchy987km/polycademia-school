import { get } from 'svelte/store'
import { capytaleMode, exercicesParams } from '../lib/stores/generalStore'
import { globalOptions } from '../lib/stores/globalOptions'
import type { InterfaceParams } from '../lib/types'
import { getIntrus, log, logDebug } from './statsUtils'

declare global {
  interface Window {
    _paq: any[]
    logDebug: number
  }
}

// pour pour pouvoir le déactiver en mode debug...
// eslint-disable-next-line prefer-const
let activeStats = document.location.hostname !== 'localhost'

if (activeStats) {
  const _paq = (window._paq = window._paq || [])
  const privateUrl = '//ynh.coopmaths.fr/matomo/'
  const forgeUrl = 'https://wa.phm.education.gouv.fr/snp/'
  _paq.push(['setTrackerUrl', privateUrl + 'matomo.php'])
  _paq.push(['setSiteId', '1'])
  _paq.push(['addTracker', forgeUrl + 'matomo.php', '17'])
  _paq.push(['disableCookies'])
  _paq.push(['trackPageView'])
  _paq.push(['enableLinkTracking'])
  ;(function () {
    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]
    g.async = true
    g.src = privateUrl + 'matomo.js'
    if (s.parentNode) {
      s.parentNode.insertBefore(g, s)
    }
  })()
}

logDebug('Matomo loaded')

const paramExos: string[] = []
const uuids: string[] = []
const vueUuids: string[] = []
const vue: string[] = ['']
const recorder: string[] = ['']

function paraConvert(param: InterfaceParams) {
  const par: {
    nb?: number
    uuid: string
    t?: string
    e?: string | number
    c?: string
    et?: string | number
    s1?: string
    s2?: string
    s3?: string
    s4?: string
    s5?: string
    a?: string
    i?: string
    s?: number
  } = { uuid: param.uuid }
  if (param.nbQuestions) par.nb = param.nbQuestions
  if (param.type) par.t = param.type
  if (param.exo) par.e = param.exo
  if (param.exoType) par.et = param.exoType
  if (param.cd) par.c = param.cd
  if (param.sup) par.s1 = param.sup.replace('true', 't').replace('false', 'f')
  if (param.sup2) par.s2 = param.sup2.replace('true', 't').replace('false', 'f')
  if (param.sup3) par.s3 = param.sup3.replace('true', 't').replace('false', 'f')
  if (param.sup4) par.s4 = param.sup4.replace('true', 't').replace('false', 'f')
  if (param.sup5) par.s5 = param.sup5.replace('true', 't').replace('false', 'f')
  if (param.alea) par.a = param.alea
  if (param.interactif) par.i = param.interactif
  if (param.bestScore) par.s = param.bestScore
  return par
}

globalOptions.subscribe((options) => {
  logDebug('globalOptions', options)

  if (options) {
    if (options.v === undefined) return // chargement du site
    if (options.recorder === 'capytale' && get(capytaleMode) === 'none') return // capytale pas encore chargé
    if (vue[0] === (options.v || 'prof')) {
      logDebug('Pas de changement de vue')
      return
    }
    // nouvelle vue
    vue[0] = options.v || 'prof'
    log('vue', vue[0])
    if (window._paq) window._paq.push(['trackEvent', 'Vue', vue[0]])
    // if (window._paq) window._paq.push(['setCustomDimension', 1, vue[0]])
    if (options.recorder) recorder[0] = options.recorder
    log('recorder', recorder[0])
    // if (window._paq) window._paq.push(['setCustomDimension', 2, recorder[0]])
    if (window._paq && options.recorder)
      window._paq.push(['setCustomDimension', 1, options.recorder])

    // changement de vue
    const vueUuids1: string[] = []
    for (let i = 0; i < paramExos.length; i++) {
      const parsedExo = JSON.parse(paramExos[i])
      // if (window._paq) window._paq.push(['trackEvent', 'VueExo', vue[0] + '-' + parsedExo.uuid, paramExos[i]])
      log(vue[0] + '-' + parsedExo.uuid, 'par:', paramExos[i])
      if (vue[0] !== '')
        vueUuids1.push(
          vue[0] +
            '-' +
            parsedExo.uuid +
            (recorder[0] ? '-' + recorder[0] : ''),
        )
    }

    // changement de vue pour les exercices
    getIntrus(vueUuids1, vueUuids).forEach((intrus) => {
      if (intrus.difference > 0) {
        for (let j = 0; j < intrus.difference; j++) {
          vueUuids.push(intrus.value)
          log('Ajout de', intrus.value, 'dans vueUuids')
          if (window._paq)
            window._paq.push(['trackEvent', 'VueUuid', intrus.value])
        }
      } else if (intrus.difference < 0) {
        for (let j = 0; j < Math.abs(intrus.difference); j++) {
          const index = vueUuids.lastIndexOf(intrus.value)
          if (index > -1) {
            vueUuids.splice(index, 1)
            log('Suppression de', intrus.value, 'de vueUuids')
          }
        }
      }
    })
    logDebug('vueUuids:', vueUuids)
  }
})

exercicesParams.subscribe((params) => {
  logDebug('exercicesParams', params)
  if (params) {
    const vueUuids1: string[] = []
    params.forEach((param) => {
      // on met à jour la liste des exercices
      if (uuids.includes(param.uuid)) {
        logDebug('Uuid déjà chargé:', param.uuid)
      } else {
        uuids.push(param.uuid)
        if (window._paq) window._paq.push(['trackEvent', 'Uuid', param.uuid])
        log('Uuids-' + param.uuid)
      }
      // on met à jour la liste des paramètres avec la vue et le recorder:
      if (vue[0] !== '')
        vueUuids1.push(
          vue[0] + '-' + param.uuid + (recorder[0] ? '-' + recorder[0] : ''),
        )
      const par = paraConvert(param)
      if (paramExos.includes(JSON.stringify(par))) {
        logDebug('déjà chargé:', param.uuid)
      } else {
        paramExos.push(JSON.stringify(par))
        // if (window._paq && vue[0] !== '') window._paq.push(['trackEvent', 'VueExo', vue[0] + '-' + par.uuid, JSON.stringify(par)])
        if (vue[0] !== '')
          log(vue[0] + '-' + par.uuid, 'par:', JSON.stringify(par))
      }
    })
    // Supprimer les éléments qui ne sont pas dans la référence
    for (let i = paramExos.length - 1; i >= 0; i--) {
      if (
        !params.some(
          (param) => JSON.stringify(paraConvert(param)) === paramExos[i],
        )
      ) {
        const ele = paramExos.splice(i, 1)
        log('exercice supprimé', ele)
      }
    }
    logDebug('paramExos:', paramExos)
    for (let i = uuids.length - 1; i >= 0; i--) {
      if (!params.some((param) => param.uuid === uuids[i])) {
        const ele = uuids.splice(i, 1)
        log('uuid supprimé', ele)
      }
    }
    logDebug('uuids:', uuids)
    getIntrus(vueUuids1, vueUuids).forEach((intrus) => {
      if (intrus.difference > 0) {
        for (let j = 0; j < intrus.difference; j++) {
          vueUuids.push(intrus.value)
          log('Ajout de', intrus.value, 'dans vueUuids')
          if (window._paq)
            window._paq.push(['trackEvent', 'VueUuid', intrus.value])
        }
      } else if (intrus.difference < 0) {
        for (let j = 0; j < Math.abs(intrus.difference); j++) {
          const index = vueUuids.lastIndexOf(intrus.value)
          if (index > -1) {
            vueUuids.splice(index, 1)
            log('Suppression de', intrus.value, 'de vueUuids')
          }
        }
      }
    })
    logDebug('vueUuids:', vueUuids)
  }
})

export function statsCanTracker(recorder: string, vue: string) {
  logDebug('Tracking can stats...')
  for (let i = 0; i < vueUuids.length; i++) {
    const uuid = vueUuids[i].split('-')[1]
    if (window._paq) {
      window._paq.push([
        'trackEvent',
        'CheckCan',
        vue + '-' + uuid + (recorder ? '-' + recorder : ''),
      ])
    }
    log(vue + '-' + uuid, 'CheckCan', recorder ? '-' + recorder : '')
  }
}
