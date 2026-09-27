import { useEffect, useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { usePeriodicTimestamp } from '../../shared/usePeriodicTimestamp.ts'
import '../../shared/app.css'
import './countdown.css'

const DEFAULT_MINUTES = 15
const EASTER_EGG_MINUTES = 56
const CHOICES = [15, 30, 60]
const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Diviseur de 60 le plus proche : le décompte retombe toujours sur une heure pile */
function closestHourDivisor(minutes: number): number {
  let lower = Math.min(minutes, 60)
  while (60 % lower > 0) lower--
  let greater = Math.min(minutes, 60)
  while (60 % greater > 0) greater++
  return minutes - lower <= greater - minutes ? lower : greater
}

function normalize(minutes: number): number {
  if (!minutes || minutes < 1) return DEFAULT_MINUTES
  return minutes === EASTER_EGG_MINUTES ? minutes : closestHourDivisor(minutes)
}

function title(minutes: number): string {
  switch (minutes) {
    case 15: return 'quart d\'heure'
    case 30: return 'demi-heure'
    case 60: return 'heure'
    case EASTER_EGG_MINUTES: return `⭑${EASTER_EGG_MINUTES}⭑`
    default: return `${minutes} min`
  }
}

// Page seule : /to/<minutes> (adresse publique) ou ?min=<minutes>
function minutesFromLocation(): number {
  const fromPath = /\/to\/(\d+)\/?$/.exec(location.pathname)?.[1]
  const fromQuery = new URLSearchParams(location.search).get('min')
  return normalize(Number(fromPath ?? fromQuery))
}

function writeLocation(minutes: number) {
  const url = new URL(location.href)
  if (/^\/to(\/|$)/.test(url.pathname)) url.pathname = `/to/${minutes}`
  else url.searchParams.set('min', String(minutes))
  history.replaceState(null, '', url)
}

export default function Countdown({ standalone }: ToolProps) {
  const [minutes, setMinutes] = useState(() => standalone ? minutesFromLocation() : DEFAULT_MINUTES)
  const now = usePeriodicTimestamp(100)

  useEffect(() => {
    if (standalone) writeLocation(minutes)
  }, [standalone, minutes])

  // Avec un diviseur de 60, un tour dure `minutes` ; sinon (56), il vise la minute de l'heure
  const target = minutes * 60_000
  const period = 60 % minutes === 0 ? target : 3_600_000
  const remaining = (target + period - (now % period)) % period
  const ratio = (period - remaining) / period
  const label = new Date(remaining + 1000).toISOString().slice(14, 19)
  const at = new Date(now + remaining).toTimeString().slice(0, 5)

  return (
    <div className="app countdown">
      <div className="heading">
        <span className="title">{title(minutes)}</span>
        <span className="muted">➜ {at}</span>
      </div>
      <svg viewBox="0 0 100 100" role="timer" aria-label={`${label} avant ${at}`}>
        <circle className="trail" cx="50" cy="50" r={RADIUS}/>
        <circle className="path" cx="50" cy="50" r={RADIUS}
                strokeDasharray={CIRCUMFERENCE} strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}/>
        <text x="50" y="50">{label}</text>
      </svg>
      <div className="segmented" role="group" aria-label="Durée">
        {CHOICES.map(choice => (
          <button key={choice} type="button" aria-pressed={minutes === choice} onClick={() => setMinutes(choice)}>
            {choice} min
          </button>
        ))}
      </div>
    </div>
  )
}
