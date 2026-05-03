export function isLocalStorageAvailable() {
  try {
    window.localStorage.setItem('__test__', '__test__')
    window.localStorage.removeItem('__test__')
    return true
  } catch (e) {
    return false
  }
}
