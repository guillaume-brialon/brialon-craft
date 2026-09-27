import React from 'react'

/** Horloge à laquelle un composant s'abonne : sans cadence, elle garde l'heure de sa création */
const createClock = (refreshRateMs) => {
  let timestamp = Date.now()
  return {
    subscribe: (notify) => {
      if (refreshRateMs === undefined || refreshRateMs === null) return () => {}
      const intervalId = setInterval(() => {
        timestamp = Date.now()
        notify()
      }, refreshRateMs)
      return () => clearInterval(intervalId)
    },
    getSnapshot: () => timestamp,
  }
}

/** Horodatage rafraîchi toutes les `refreshRateMs` millisecondes, et dès que `resetTimestamp` change */
const usePeriodicTimestamp = (refreshRateMs, resetTimestamp) => {
  // Une nouvelle horloge, à l'heure courante, à chaque changement de cadence ou de `resetTimestamp`
  const clock = React.useMemo(() => createClock(refreshRateMs), [refreshRateMs, resetTimestamp])
  return React.useSyncExternalStore(clock.subscribe, clock.getSnapshot)
}

export default usePeriodicTimestamp
