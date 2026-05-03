let localVersion: string = ''

fetchServerVersion()
  .then((version) => {
    localVersion = version
  })
  .catch((error) => {
    console.error('Error fetching local version:', error)
  })

// Fonction pour récupérer la version du serveur
export async function fetchServerVersion(): Promise<string> {
  // const path = window.location.href.startsWith('http://localhost') ? '' : '/alea'
  // const response = await fetch(path + '/version.txt')
  const path = import.meta.env.DEV ? '' : '/alea'
  const response = await fetch(`${path}/version.txt`)
  if (!response.ok) {
    throw new Error('Failed to fetch server version')
  }

  const data = await response.json()
  return data.version
}

export function getLocalVersion(): string {
  return localVersion
}

/** à ne pas utiliser: pour les tests... */
export function forceLocalVersion(): void {
  localVersion = localVersion + '1'
}

// Fonction pour vérifier si le serveur a été mis à jour
export async function checkForServerUpdate(): Promise<boolean> {
  try {
    const serverVersion = await fetchServerVersion()
    // console.log('Server updated from', localVersion, 'to', serverVersion)
    if (serverVersion !== localVersion) {
      return true // Le serveur a été mis à jour
    }
    return false // Le serveur n'a pas été mis à jour
  } catch (error) {
    console.error('Error checking for server update:', error)
    return false
  }
}
