// Abonnés à l'ancre de l'adresse : prévenus par hashchange, et par clearHash, qui n'en déclenche pas
const listeners = new Set<() => void>()

export const subscribeToHash = (notify: () => void) => {
  listeners.add(notify)
  window.addEventListener('hashchange', notify)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('hashchange', notify)
  }
}

export const hashId = (): string => {
  return location.hash.slice(1)
}

/** Retire l'ancre de l'adresse sans faire défiler la page ni ajouter d'entrée à l'historique */
export const clearHash = () => {
  history.replaceState(history.state, '', location.pathname + location.search)
  listeners.forEach(notify => notify())
}
