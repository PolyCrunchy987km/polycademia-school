import { UAParser } from 'ua-parser-js'

const minVersion = {
  // Mgu à ajouter en fonction des problèmes...
  Chrome: 80,
  Firefox: 75,
  Safari: 16,
  Edge: 80,
  Opera: 67,
  GSA: 387, // Google Search App (iOS)
  WebKit: 605, // Apple WebView (iOS)
  'MIUI Browser': 14, // Xiaomi MIUI, basé sur Chromium
  'Chrome WebView': 140, // WebView embarquée dans une app
  'Samsung Internet': 14,
  'Mobile Safari': 12,
  'Mobile Chrome': 63,
  'Chrome Headless': 80,
  'Mobile Firefox': 136,
  'Android Browser': 4,
  'Avast Secure Browser': 143,
  'Opera Touch': 6,
  Facebook: 544,
}

export function checkBrowserVersion() {
  const uap = new UAParser()
  const { browser, cpu, device, os, ua } = uap.getResult()

  // console.log(uap.getResult())
  // console.log(cpu)
  // console.log(device)

  const browserName = browser.name
  const browserVersion = browser.major ? parseInt(browser.major, 10) : 0
  let popupMessage = ''
  if (
    browserName &&
    minVersion[browserName as keyof typeof minVersion] &&
    browserVersion < minVersion[browserName as keyof typeof minVersion]
  ) {
    popupMessage = `Votre navigateur (${browserName} ${browserVersion}) est trop vieux. Veuillez mettre à jour votre navigateur pour une meilleure expérience.`
  }
  if (!minVersion[browserName as keyof typeof minVersion]) {
    window.notify('Navigateur inconnu', {
      browserName,
      browserVersion,
      browser,
      cpu,
      os,
      device,
      ua,
    })
  }
  const url = new URL(window.location.href)
  if (url.hostname === 'localhost' && url.searchParams.get('log') === '2') {
    popupMessage = Object.entries({
      browserName,
      browserVersion,
      browser,
      cpu,
      os,
      device,
      ua,
    })
      .map(([key, value]) => `${key}: ${value}`)
      .join('<br>')
  }
  return { popupMessage, browserName, browserVersion }
}
