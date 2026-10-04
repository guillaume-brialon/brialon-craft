import { useState, useSyncExternalStore } from 'react'
import type { ToolProps } from '../registry.ts'
import './detector.css'

// Une minuterie de 100 ms qui arrive avec plus du double de retard trahit une mise en veille
const DELAY_MS = 100
const MAX_ENTRIES = 50

interface Pause {
  at: number
  lostMs: number
}

const time = (ms: number) => new Date(ms).toLocaleTimeString('fr')
const seconds = (ms: number) => new Intl.NumberFormat('fr', { maximumFractionDigits: 1 }).format(ms / 1000)

/** Journal des mises en veille, tenu tant qu'un composant y est abonné */
const createPauseLog = () => {
  let pauses: Pause[] = []
  return {
    subscribe: (notify: () => void) => {
      let id: number
      // En arrière-plan, le navigateur retarde chaque minuterie : les retards successifs forment une seule pause,
      // enregistrée au premier tour revenu à l'heure
      let pausedSince: number | undefined
      let lastLate = 0
      const wait = () => {
        const start = Date.now()
        id = window.setTimeout(() => {
          const now = Date.now()
          if (now - start - DELAY_MS > DELAY_MS) {
            pausedSince ??= start + DELAY_MS
            lastLate = now
          } else if (pausedSince !== undefined) {
            pauses = [{ at: lastLate, lostMs: lastLate - pausedSince }, ...pauses].slice(0, MAX_ENTRIES)
            pausedSince = undefined
            notify()
          }
          wait()
        }, DELAY_MS)
      }
      wait()
      return () => clearTimeout(id)
    },
    getSnapshot: () => pauses,
  }
}

const Detector = (_: ToolProps) => {
  const [log] = useState(createPauseLog)
  const pauses = useSyncExternalStore(log.subscribe, log.getSnapshot)
  const [since] = useState(Date.now)

  return (
    <div className="app detector">
      <p className="watch"><span className="dot" aria-hidden="true"/>Je détecte si vous me mettez en arrière-plan…</p>
      <p className="muted">
        Changez d'onglet, réduisez la fenêtre ou verrouillez l'écran, puis revenez.
      </p>
      {pauses.length === 0
        ? <p className="muted">Aucune mise en arrière-plan depuis {time(since)}.</p>
        : (
          <ol aria-live="polite">
            {pauses.map(pause => (
              <li key={pause.at}>
                <span>{time(pause.at)}</span>
                <span>retour après {seconds(pause.lostMs)} s</span>
              </li>
            ))}
          </ol>
        )}
    </div>
  )
}

export default Detector
