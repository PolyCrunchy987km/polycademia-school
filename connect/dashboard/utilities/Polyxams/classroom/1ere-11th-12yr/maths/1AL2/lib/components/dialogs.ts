/**
 * Afficher un écran (élément <dialog>) pendant un nombre de millisecondes
 * @param {string} dialogId id de l'élément <dialog> à activer
 * @param {number} nbOfMilliseconds durée de l'affichage en ms
 */
export async function showDialogForLimitedTime(
  dialogId: string,
  nbOfMilliseconds: number,
  innerHTML = '',
) {
  const dialog = document.getElementById(dialogId) as HTMLDialogElement
  if (dialog) {
    if (innerHTML !== '') dialog.innerHTML = innerHTML
    dialog.showModal()
    await sleep(nbOfMilliseconds)
    dialog.close()
  }
}

/**
 * Affiche un dialog temporaire avec un message
 */
export async function showDialogStringMessageForLimitedTime(
  message: string,
  duration = 2000,
) {
  const dialog = document.createElement('dialog')

  dialog.innerHTML = `
    <div style="
      padding:16px;
      min-width:200px;
      text-align:center;
    ">
      ${message}
    </div>
  `

  Object.assign(dialog.style, {
    border: 'none',
    borderRadius: '10px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
  })

  document.body.appendChild(dialog)

  dialog.showModal()
  await sleep(duration)
  dialog.close()
  dialog.remove()
}

/**
 * Faire une pause pendant l'exécution d'un programme
 * {@link https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep?page=1&tab=scoredesc#tab-top | Source}
 * @param {number} ms nb de millisecondes de la pause
 * @author sylvain
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * popup pour demander à l'utilisateur de rafraîchir la page
 * car le serveur a été mis à jour.
 */
export function showPopupAndWait(): Promise<void> {
  return new Promise((resolve) => {
    const popup = document.createElement('div')
    popup.style.position = 'fixed'
    popup.style.top = '50%'
    popup.style.left = '50%'
    popup.style.transform = 'translate(-50%, -50%)'
    popup.style.padding = '20px'
    popup.style.backgroundColor = 'white'
    popup.style.border = '1px solid black'
    popup.style.zIndex = '10000'

    const message = document.createElement('p')
    message.textContent =
      'Le serveur a été mis à jour. Veuillez actualiser la page.'
    popup.appendChild(message)

    const refreshButton = document.createElement('button')
    refreshButton.textContent = 'Actualiser'
    refreshButton.style.marginRight = '10px'
    refreshButton.style.padding = '10px 20px'
    refreshButton.style.backgroundColor = '#f0f0f0'
    refreshButton.style.border = '1px solid #ccc'
    refreshButton.style.borderRadius = '5px'
    refreshButton.style.cursor = 'pointer'
    refreshButton.onclick = () => {
      window.location.reload()
    }
    popup.appendChild(refreshButton)

    const closeButton = document.createElement('button')
    closeButton.textContent = 'Fermer'
    closeButton.style.marginRight = '10px'
    closeButton.style.padding = '10px 20px'
    closeButton.style.backgroundColor = '#f0f0f0'
    closeButton.style.border = '1px solid #ccc'
    closeButton.style.borderRadius = '5px'
    closeButton.style.cursor = 'pointer'
    closeButton.onclick = () => {
      document.body.removeChild(popup)
      resolve()
    }
    popup.appendChild(closeButton)
    document.body.appendChild(popup)
  })
}
