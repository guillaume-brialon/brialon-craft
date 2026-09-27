import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { formatNumber, formatWithUnit } from '../../shared/format.ts'
import '../../shared/app.css'
import './footprint.css'

// Données de 2014 : population mondiale (milliards), biocapacité et empreinte (hectares globaux par habitant),
// revenu fiscal net moyen annuel en France (euros)
const DATA = { year: 2014, worldPopulation: 7.274627449, bioCapacity: 1.68, nationalFootprint: 4.7, yearlyIncome: 36570 }

// Curseur logarithmique de 50 € à 200 000 € par mois, arrondi à 50 €
const SLIDER_MAX = 1000
const INCOME_MIN = Math.log(50)
const INCOME_MAX = Math.log(200_000)
const incomeAt = (position: number) =>
  Math.round(Math.exp(INCOME_MIN + (INCOME_MAX - INCOME_MIN) * position / SLIDER_MAX) / 50) * 50

const overconsumption = DATA.nationalFootprint / DATA.bioCapacity
const monthlyIncome = DATA.yearlyIncome / 12
const ecoMonthlyIncome = monthlyIncome / overconsumption

export default function Footprint(_: ToolProps) {
  // Position de départ proche du revenu moyen français
  const [position, setPosition] = useState(500)
  const income = incomeAt(position)
  const planets = income / ecoMonthlyIncome
  const digits = planets < 1 ? 2 : planets < 10 ? 1 : 0
  const rounded = Number(planets.toFixed(digits))

  return (
    <div className="app footprint">
      <p className="lead">Combien de planètes votre revenu vous permet-il de consommer ?</p>

      <div className="field">
        <label htmlFor="footprint-income">
          Revenu net fiscal mensuel du foyer : <strong className="amount">{formatWithUnit(income, '€')}</strong>
        </label>
        <input id="footprint-income" type="range" min="0" max={SLIDER_MAX} value={position}
               onChange={e => setPosition(Number(e.target.value))}/>
      </div>

      <p className="result">
        Il faudrait {formatNumber(planets, digits)} {rounded >= 2 ? 'planètes' : 'planète'}
      </p>
      <p>
        pour supporter la consommation des {formatNumber(DATA.worldPopulation, 1)} milliards d'humains
        si chacun avait le même pouvoir d'achat que vous.
      </p>

      <details>
        <summary>Méthode de calcul ({DATA.year})</summary>
        <ul>
          <li>Biocapacité mondiale par habitant : <strong>{formatWithUnit(DATA.bioCapacity, 'hag', 2)}</strong>*</li>
          <li>Empreinte écologique française par habitant : <strong>{formatWithUnit(DATA.nationalFootprint, 'hag', 2)}</strong>*</li>
          <li>
            Surconsommation française par rapport à la biocapacité mondiale :
            {' '}<strong>{formatWithUnit(overconsumption, 'pu', 2)}</strong>*
          </li>
          <li>Revenu fiscal net moyen en France (mensuel) : <strong>{formatWithUnit(monthlyIncome, '€')}</strong></li>
          <li>
            Revenu fiscal net éco-compatible (mensuel) : <strong>{formatWithUnit(ecoMonthlyIncome, '€')}</strong>
            {' '}(revenu moyen ÷ surconsommation)
          </li>
        </ul>
        <p>
          * hag : <a href="https://fr.wikipedia.org/wiki/Hectare_global">hectare global</a>,
          pu : <a href="https://fr.wikipedia.org/wiki/Unit%C3%A9_r%C3%A9duite">per unit</a>
        </p>
      </details>

      <details>
        <summary>Données sources</summary>
        <ul>
          <li>
            Lien revenu-écologie : <a href="https://www.universite-si.org/IMG/pdf/samedi_9_-_revenu_eco-compatible.pdf">étude
            de Vincent Bruyère</a>
          </li>
          <li>Empreintes écologiques par pays : <a href="https://data.footprintnetwork.org">footprintnetwork.org</a></li>
          <li>
            Revenu fiscal : <a href="https://www.insee.fr/fr/statistiques/2966817?sommaire=2966826">INSEE,
            « Revenu, niveau de vie et pauvreté »</a>
          </li>
        </ul>
      </details>
    </div>
  )
}
