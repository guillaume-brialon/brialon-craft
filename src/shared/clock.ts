import { useMemo, useSyncExternalStore } from 'react'

type Stop = () => void

/** Horloge à laquelle un composant s'abonne : `schedule` appelle `tick` à son rythme et renvoie de quoi l'arrêter */
const createClock = (schedule: (tick: () => void) => Stop) => {
  let timestamp = Date.now()
  return {
    subscribe: (notify: () => void): Stop => schedule(() => {
      timestamp = Date.now()
      notify()
    }),
    getSnapshot: () => timestamp,
  }
}

/** Horodatage rafraîchi toutes les `rateMs` millisecondes */
export const usePeriodicTimestamp = (rateMs: number): number => {
  const clock = useMemo(() => createClock(tick => {
    const id = setInterval(tick, rateMs)
    return () => clearInterval(id)
  }), [rateMs])
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot)
}

/** Horodatage rafraîchi à chaque image tant que `active` est vrai, figé sinon */
export const useFrameTimestamp = (active: boolean): number => {
  const clock = useMemo(() => createClock(tick => {
    if (!active) return () => {}
    let frame = 0
    const loop = () => {
      tick()
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }), [active])
  return useSyncExternalStore(clock.subscribe, clock.getSnapshot)
}
