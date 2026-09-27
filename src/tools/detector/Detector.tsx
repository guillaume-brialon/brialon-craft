import { useEffect, useState } from 'react'
import type { ToolProps } from '../registry.ts'
import '../../shared/app.css'
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

export default function Detector(_: ToolProps) {
  const [pauses, setPauses] = useState<Pause[]>([])
  const [since] = useState(Date.now)

  useEffect(() => {
    let id: number
    const wait = () => {
      const start = Date.now()
      id = window.setTimeout(() => {
        const lost = Date.now() - start - DELAY_MS
        if (lost > DELAY_MS) {
          setPauses(current => [{ at: Date.now(), lostMs: lost }, ...current].slice(0, MAX_ENTRIES))
        }
        wait()
      }, DELAY_MS)
    }
    wait()
    return () => clearTimeout(id)
  }, [])

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
