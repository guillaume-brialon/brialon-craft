import Sparkline from './Sparkline.tsx'
import { FIRST_YEAR, LAST_YEAR, type Measure } from './stats.ts'

interface Props {
  label: string
  measure: Measure
  /** Valeur mise en forme, avec son unité */
  format: (value: number) => string
  year: number | null
  onPreview: (year: number | null) => void
  onPin: (year: number | null) => void
}

/** Indicateur : sa valeur sur l'ensemble ou sur l'année choisie, et sa courbe année par année */
const Stat = ({ label, measure, format, year, onPreview, onPin }: Props) => {
  const point = measure.byYear.find(item => item.year === year)
  return (
    <div className="stat">
      <div className="figure">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{format(point?.value ?? measure.total)}</span>
        <span className="stat-scope">{point ? `en ${point.year}` : `de ${FIRST_YEAR} à ${LAST_YEAR}`}</span>
      </div>
      <div className="trend">
        <Sparkline label={label} points={measure.byYear} year={year} onPreview={onPreview} onPin={onPin}
                   describe={item => `${item.year} : ${format(item.value)}`}/>
        <span className="axis" aria-hidden="true"><span>{FIRST_YEAR}</span><span>{LAST_YEAR}</span></span>
      </div>
    </div>
  )
}

export default Stat
