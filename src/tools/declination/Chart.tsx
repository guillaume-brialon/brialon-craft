import { DAY_MS, OBLIQUITY, solarDeclination, YEAR_MS, type Milestone } from './sun.ts'

interface Props {
  /** Instant affiché, au milieu de la courbe */
  moment: number
  /** Équinoxes et solstices de l'année qui entoure cet instant */
  milestones: Milestone[]
  /** Celui d'entre eux qui arrive le premier, mis en avant */
  next: Milestone | undefined
}

const WIDTH = 320
const HEIGHT = 260
// Hauteur laissée aux dates, au-dessus et au-dessous de la courbe
const MARGIN = 36
// Segments de chaque moitié de la courbe, passée et à venir
const HALF_SEGMENTS = 73
// Une date d'équinoxe plus proche que cela du bord droit s'écrit à gauche de son repère
const LABEL_WIDTH = 60
// Demi-largeur d'une date de solstice, gardée entière près des bords
const LABEL_REACH = 24

const dayAndMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

const xOf = (ms: number, moment: number): number => WIDTH / 2 + ((ms - moment) / YEAR_MS) * WIDTH
const yOf = (declination: number): number => HEIGHT / 2 - (declination / OBLIQUITY) * (HEIGHT / 2 - MARGIN)

/** Tracé de la déclinaison entre deux segments, comptés depuis l'instant affiché */
const curve = (moment: number, from: number, to: number): string => {
  const points: string[] = []
  for (let segment = from; segment <= to; segment++) {
    const ms = moment + (segment / HALF_SEGMENTS) * (YEAR_MS / 2)
    points.push(`${xOf(ms, moment).toFixed(1)},${yOf(solarDeclination(ms)).toFixed(1)}`)
  }
  return `M${points.join('L')}`
}

/** Place de la date d'un repère : au-dessus ou au-dessous d'un solstice, du côté libre de la courbe à un équinoxe */
const labelPlace = (quarter: number, x: number, y: number) => {
  if (quarter % 2 === 1) {
    const inside = Math.min(WIDTH - LABEL_REACH, Math.max(LABEL_REACH, x))
    return { x: inside, y: quarter === 1 ? y - 10 : y + 18, textAnchor: 'middle' as const }
  }
  // La courbe monte en mars et descend en septembre : la place libre à droite est dessous, puis dessus
  const right = x < WIDTH - LABEL_WIDTH
  const below = (quarter === 0) === right
  return { x: right ? x + 7 : x - 7, y: below ? y + 14 : y - 7, textAnchor: right ? 'start' as const : 'end' as const }
}

/** Courbe de la déclinaison du soleil sur un an, l'instant affiché au milieu */
const Chart = ({ moment, milestones, next }: Props) => (
  <svg className="chart" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img"
       aria-label="Courbe de la déclinaison du soleil sur un an, le jour affiché au milieu">
    <line className="equator" x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2}/>
    <path className="past" d={curve(moment, -HALF_SEGMENTS, 0)}/>
    <path className="future" d={curve(moment, 0, HALF_SEGMENTS)}/>
    {milestones.map(milestone => {
      const x = xOf(milestone.at, moment)
      const y = yOf(solarDeclination(milestone.at))
      return (
        <g key={Math.round(milestone.at / DAY_MS)} className={milestone === next ? 'milestone next' : 'milestone'}>
          <circle cx={x} cy={y} r="3.5"/>
          <text {...labelPlace(milestone.quarter, x, y)}>{dayAndMonth.format(milestone.at)}</text>
        </g>
      )
    })}
    <circle className="day" cx={WIDTH / 2} cy={yOf(solarDeclination(moment))} r="6"/>
  </svg>
)

export default Chart
