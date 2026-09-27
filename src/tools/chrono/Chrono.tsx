import { useEffect, useRef, useState } from 'react'
import { toolById, type ToolProps } from '../registry.ts'
import { formatNumber, plural } from '../../shared/format.ts'
import '../../shared/app.css'
import './chrono.css'

const MARK = { running: '▶', paused: '❚❚' }
const pad = (n: number) => String(n).padStart(2, '0')

export default function Chrono({ standalone }: ToolProps) {
  // Temps cumulé des périodes terminées, et début de la période en cours (null à l'arrêt)
  const [stacked, setStacked] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(() => standalone ? Date.now() : null)
  const [now, setNow] = useState(Date.now)
  const [name, setName] = useState('Chrono')
  const frame = useRef(0)

  const running = startedAt !== null
  const elapsed = stacked + (running ? now - startedAt : 0)

  useEffect(() => {
    if (!running) return
    const tick = () => {
      setNow(Date.now())
      frame.current = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame.current)
  }, [running])

  // Page seule : l'onglet du navigateur montre l'état et le sujet, un onglet par sujet
  useEffect(() => {
    if (standalone) document.title = `${running ? MARK.running : MARK.paused} ${name}`
  }, [standalone, running, name])

  const toggle = () => {
    const at = Date.now()
    if (startedAt !== null) {
      setStacked(stacked + at - startedAt)
      setStartedAt(null)
    } else {
      setStartedAt(at)
    }
    setNow(at)
  }

  const reset = () => {
    setStacked(0)
    setStartedAt(running ? Date.now() : null)
    setNow(Date.now())
  }

  const hours = Math.floor(elapsed / 3_600_000)
  const minutes = Math.floor(elapsed / 60_000) % 60
  const seconds = Math.floor(elapsed / 1000) % 60
  const hundredths = Math.floor(elapsed / 10) % 100
  const decimalHours = Math.floor(elapsed / 36_000) / 100
  const totalMinutes = Math.floor(elapsed / 60_000)

  return (
    <div className="app chrono">
      <p className="time" role="timer">
        {hours}h {pad(minutes)}m {pad(seconds)}s<span className="hundredths"> {pad(hundredths)}</span>
      </p>
      <p className="muted">
        soit {formatNumber(decimalHours, 2)} {plural(decimalHours, 'heure')}
        <br/>soit {formatNumber(totalMinutes)} {plural(totalMinutes, 'minute')}
      </p>
      <div className="field">
        <label htmlFor="chrono-name">Sujet</label>
        <input id="chrono-name" type="text" value={name} onChange={e => setName(e.target.value)}/>
      </div>
      <div className="controls">
        <button type="button" className="button primary" onClick={toggle}>{running ? 'Arrêter' : 'Démarrer'}</button>
        <button type="button" className="button ghost" onClick={reset} disabled={elapsed === 0}>Remettre à zéro</button>
      </div>
      <a className="new" href={toolById('chrono')!.path} target="_blank" rel="noopener">
        Nouveau chronomètre dans un onglet ↗
      </a>
    </div>
  )
}
