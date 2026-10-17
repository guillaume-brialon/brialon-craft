import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { formatNumber, formatWithUnit, plural } from '../../shared/format.ts'
import Ranking from './Ranking.tsx'
import Stat from './Stat.tsx'
import {
  COUNT, COUNTRIES, FIRST_YEAR, FRENCH_ONLY, LAST_YEAR, MEAN_DURATION, REPEAT_DIRECTORS, TOP_DIRECTORS,
  TOTAL_DURATION, TWICE_DIRECTORS, WITHOUT_FRANCE,
} from './stats.ts'
import './festival.css'

const films = (value: number) => `${formatNumber(value)} ${plural(value, 'film')}`

const Festival = (_: ToolProps) => {
  // Année mise en avant sur toutes les courbes ; null pour l'ensemble des éditions
  const [year, setYear] = useState<number | null>(null)

  return (
    <div className="app festival">
      <div className="heading">
        <span className="title">Festival du film court en plein air de Grenoble</span>
        <p className="lead">
          Les films en compétition de {FIRST_YEAR} à {LAST_YEAR}. Survolez ou touchez une courbe pour lire une année.
        </p>
      </div>

      <div className="year">
        <span>{year ?? `${FIRST_YEAR}–${LAST_YEAR}`}</span>
        <button type="button" className="button ghost" onClick={() => setYear(null)} disabled={year === null}>
          Toutes les éditions
        </button>
      </div>

      <div className="stats">
        <Stat label="Films" measure={COUNT} format={films} year={year} onSelect={setYear}/>
        <Stat label="Durée totale" measure={TOTAL_DURATION} format={value => formatWithUnit(value, 'h')}
              year={year} onSelect={setYear}/>
        <Stat label="Durée moyenne" measure={MEAN_DURATION} format={value => formatWithUnit(value, 'min')}
              year={year} onSelect={setYear}/>
        <Stat label="Productions françaises seules" measure={FRENCH_ONLY}
              format={value => formatWithUnit(100 * value, '%')} year={year} onSelect={setYear}/>
        <Stat label="Films sans la France" measure={WITHOUT_FRANCE} format={films} year={year} onSelect={setYear}/>
      </div>

      <Ranking title="Pays coproducteurs, hors France" entries={COUNTRIES}/>
      <Ranking title={`${REPEAT_DIRECTORS} réalisateurs sélectionnés plusieurs fois`} entries={TOP_DIRECTORS}>
        <p className="muted">Et {TWICE_DIRECTORS} autres sélectionnés deux fois.</p>
      </Ranking>

      <details>
        <summary>Définitions</summary>
        <ul>
          <li><strong>Films</strong> : nombre de films en compétition.</li>
          <li><strong>Durée totale</strong> : durée cumulée de la sélection ; <strong>durée moyenne</strong> : celle d'un film.</li>
          <li><strong>Productions françaises seules</strong> : part des films produits par la France sans coproduction étrangère.</li>
          <li><strong>Films sans la France</strong> : films dont aucun pays producteur n'est la France.</li>
          <li>
            <strong>Pays coproducteurs</strong> : chaque pays compte une fois par film où il apparaît, seul ou
            en coproduction.
          </li>
        </ul>
        <p>Liste des films établie d'après les programmes du festival.</p>
      </details>
    </div>
  )
}

export default Festival
