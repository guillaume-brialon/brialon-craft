import type { KeyboardEvent, PointerEvent } from 'react'
import type { Point } from './stats.ts'

interface Props {
  label: string
  points: Point[]
  /** Valeur d'une année en toutes lettres, pour les lecteurs d'écran */
  describe: (point: Point) => string
  /** Année mise en avant, commune à toutes les courbes ; null pour l'ensemble */
  year: number | null
  onSelect: (year: number | null) => void
}

const WIDTH = 200
const HEIGHT = 56
// Marge autour du tracé, pour que le point mis en avant ne soit pas coupé
const PAD = 6

/** Courbe d'un indicateur année par année ; survol, toucher ou flèches du clavier choisissent une année */
const Sparkline = ({ label, points, describe, year, onSelect }: Props) => {
  const values = points.map(point => point.value)
  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const xOf = (index: number) => PAD + (index / (points.length - 1)) * (WIDTH - 2 * PAD)
  const yOf = (value: number) => HEIGHT - PAD - ((value - min) / range) * (HEIGHT - 2 * PAD)
  const path = `M${points.map((point, index) => `${xOf(index).toFixed(1)},${yOf(point.value).toFixed(1)}`).join('L')}`

  const index = points.findIndex(point => point.year === year)
  const selected = points[index]

  // Année la plus proche du pointeur
  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const ratio = ((event.clientX - box.left) / box.width * WIDTH - PAD) / (WIDTH - 2 * PAD)
    const nearest = Math.round(Math.min(1, Math.max(0, ratio)) * (points.length - 1))
    onSelect(points[nearest].year)
  }

  // À la souris, l'année suit le survol ; au doigt, elle reste choisie après le toucher
  const leave = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType === 'mouse') onSelect(null)
  }

  const step = (event: KeyboardEvent<SVGSVGElement>) => {
    const last = points.length - 1
    const moves: Record<string, number> = {
      ArrowLeft: index < 0 ? last : Math.max(0, index - 1),
      ArrowRight: index < 0 ? 0 : Math.min(last, index + 1),
      Home: 0,
      End: last,
    }
    if (event.key === 'Escape') onSelect(null)
    else if (event.key in moves) onSelect(points[moves[event.key]].year)
    else return
    event.preventDefault()
  }

  return (
    <svg className="sparkline" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
         tabIndex={0} role="slider" aria-label={label}
         aria-valuemin={points[0].year} aria-valuemax={points.at(-1)!.year} aria-valuenow={selected?.year}
         aria-valuetext={selected ? describe(selected) : 'Toutes les années'}
         onPointerMove={pick} onPointerDown={pick} onPointerLeave={leave} onKeyDown={step}>
      {selected && <line className="cursor" x1={xOf(index)} y1="0" x2={xOf(index)} y2={HEIGHT}/>}
      <path d={path}/>
      {selected && <circle cx={xOf(index)} cy={yOf(selected.value)} r="3.5"/>}
    </svg>
  )
}

export default Sparkline
