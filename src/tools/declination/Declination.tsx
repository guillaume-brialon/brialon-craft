import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { useFrameTimestamp } from '../../shared/clock.ts'
import Chart from './Chart.tsx'
import Gauge from './Gauge.tsx'
import { DAY_MS, milestonesBetween, OBLIQUITY, solarDeclination, YEAR_MS } from './sun.ts'
import './declination.css'

// Durée d'un jour pendant le défilement : un an passe en 36 secondes
const ANIMATED_DAY_MS = 100
// Noms des repères dans l'hémisphère nord, dans l'ordre des quarts de tour du soleil
const NAMES = ['équinoxe de printemps', 'solstice d\'été', 'équinoxe d\'automne', 'solstice d\'hiver']

const fullDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const dayAndMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' })

const startOfDay = (ms: number): number => new Date(ms).setHours(0, 0, 0, 0)

/** Délai entre deux jours, en toutes lettres pour les plus proches */
const delay = (days: number): string => {
  if (days === 0) return 'ce jour même'
  return days === 1 ? 'le lendemain' : `dans ${days} jours`
}

const Declination = (_: ToolProps) => {
  const [today] = useState(Date.now)
  // Jours déjà défilés depuis aujourd'hui, et début du défilement en cours (null à l'arrêt)
  const [stacked, setStacked] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  const running = startedAt !== null
  const now = useFrameTimestamp(running)
  // L'horloge peut retarder d'une image sur un départ tout juste donné
  const days = stacked + (running ? Math.max(0, now - startedAt) / ANIMATED_DAY_MS : 0)
  const moment = today + days * DAY_MS

  const toggle = () => {
    const at = Date.now()
    if (startedAt !== null) {
      setStacked(stacked + (at - startedAt) / ANIMATED_DAY_MS)
      setStartedAt(null)
    } else {
      setStartedAt(at)
    }
  }

  const reset = () => {
    setStacked(0)
    setStartedAt(null)
  }

  const milestones = milestonesBetween(moment - YEAR_MS / 2, moment + YEAR_MS / 2)
  // Un repère reste le prochain jusqu'à la fin de son jour
  const day = startOfDay(moment)
  const next = milestones.find(milestone => milestone.at >= day)

  return (
    <div className="app declination">
      <div className="heading">
        <span className="title">{fullDate.format(moment)}</span>
        <Gauge label="Déclinaison solaire" value={(100 * solarDeclination(moment)) / OBLIQUITY}/>
      </div>
      <Chart moment={moment} milestones={milestones} next={next}/>
      {next && (
        <p>
          Prochain repère : <strong>{NAMES[next.quarter]}</strong>, le {dayAndMonth.format(next.at)},{' '}
          {delay(Math.round((startOfDay(next.at) - day) / DAY_MS))}.
        </p>
      )}
      <div className="controls">
        <button type="button" className="button primary" onClick={toggle}>{running ? 'Arrêter' : 'Animer l\'année'}</button>
        <button type="button" className="button ghost" onClick={reset} disabled={days === 0}>Aujourd'hui</button>
      </div>
      <details>
        <summary>Lire la courbe</summary>
        <p>
          La déclinaison est l'angle entre les rayons du soleil et le plan de l'équateur. Nulle aux équinoxes, elle
          atteint son maximum, {OBLIQUITY.toLocaleString('fr')}°, aux solstices. La jauge en montre la part
          atteinte : à droite quand le soleil est au nord de l'équateur, à gauche quand il est au sud. C'est elle
          qui fait la longueur des jours et les saisons.
        </p>
        <p>La courbe couvre un an autour du jour affiché : le passé à gauche, l'avenir à droite.</p>
      </details>
    </div>
  )
}

export default Declination
