import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { formatNumber, formatWithUnit } from '../../shared/format.ts'
import '../../shared/app.css'
import './footprint.css'

// Données de 2022, dernière année mesurée par le Global Footprint Network (édition 2026) ; revenus Insee (ERFS 2022)
const DATA = {
  year: 2022,
  worldPopulation: 8.02141,           // milliards (biocapacité totale / biocapacité par habitant)
  bioCapacity: 1.51002370147279,      // hag par habitant, Monde
  nationalFootprint: 4.6660284698747, // hag par habitant, France, empreinte de consommation
  householdIncome: 42850,             // € par an, revenu déclaré moyen par ménage
  livingStandard: 27730,              // € par an, niveau de vie moyen par unité de consommation
}

// Comparaison avec la version 2014 de l'outil
const CHANGES: [string, string, string][] = [
  ['Biocapacité mondiale', '1,68', '1,51'],
  ['Empreinte française', '4,70', '4,67'],
  ['Nombre de Terres', '2,80', '3,09'],
  ['Revenu moyen mensuel', '3 048', '3 571'],
  ['Revenu éco-compatible', '1 089', '1 156'],
  ['Population mondiale', '7,3', '8,0'],
]

type Mode = 'household' | 'living'

const overconsumption = DATA.nationalFootprint / DATA.bioCapacity
const averageMonthly = (mode: Mode) => (mode === 'household' ? DATA.householdIncome : DATA.livingStandard) / 12

// Curseur logarithmique de 200 € à 50 000 € par mois : chaque cran multiplie le revenu par le même facteur,
// le revenu moyen tombe au milieu. Au-delà, le revenu se saisit au clavier.
const SLIDER_MAX = 1000
const INCOME_MIN = Math.log(200)
const INCOME_MAX = Math.log(50_000)
const START_INCOME = 3000

/** Arrondi selon l'ordre de grandeur : des montants ronds et des pas réguliers en proportion */
const roundIncome = (value: number) => {
  const step = value < 1000 ? 10 : value < 5000 ? 50 : value < 10_000 ? 100 : 1000
  return Math.round(value / step) * step
}
const incomeAt = (position: number) =>
  roundIncome(Math.exp(INCOME_MIN + (INCOME_MAX - INCOME_MIN) * position / SLIDER_MAX))
const positionOf = (income: number) => {
  const position = (Math.log(Math.max(1, income)) - INCOME_MIN) / (INCOME_MAX - INCOME_MIN) * SLIDER_MAX
  return Math.min(SLIDER_MAX, Math.max(0, Math.round(position)))
}

/** Échelle de l'OCDE modifiée (Insee) : 1 pour le premier adulte, 0,5 par personne de 14 ans ou plus, 0,3 par enfant */
const consumptionUnits = (adults: number, children: number) => 1 + 0.5 * (adults - 1) + 0.3 * children

// Au-delà de 20 pastilles, le reste est indiqué en nombre
const MAX_PLANETS = 20

interface StepperProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  less: string
  more: string
}

/** Compteur borné, réglé par − et + */
const Stepper = ({ id, label, value, min, max, onChange, less, more }: StepperProps) => (
  <div className="field">
    <span className="stepper-label" id={id}>{label}</span>
    <div className="stepper" role="group" aria-labelledby={id}>
      <button type="button" aria-label={less} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <span className="count" aria-live="polite">{value}</span>
      <button type="button" aria-label={more} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>
)

const Footprint = (_: ToolProps) => {
  const [mode, setMode] = useState<Mode>('household')
  // Texte du champ (il peut être vide pendant la saisie) et position du curseur, tenue à part :
  // arrondir le revenu ne doit pas déplacer la poignée
  const [incomeText, setIncomeText] = useState(String(START_INCOME))
  const [position, setPosition] = useState(() => positionOf(START_INCOME))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(1)

  const income = Math.max(0, Number(incomeText) || 0)
  const units = consumptionUnits(adults, children)
  const average = averageMonthly(mode)
  const perUnit = mode === 'household' ? income : income / units
  const planets = overconsumption * perUnit / average
  const ecoIncome = average / overconsumption
  const digits = planets < 1 ? 2 : planets < 10 ? 1 : 0
  const rounded = Number(planets.toFixed(digits))
  const discs = Math.min(Math.ceil(planets), MAX_PLANETS)

  // Changer de base garde la même position par rapport à la moyenne
  const changeMode = (next: Mode) => {
    if (next === mode) return
    const relative = perUnit / average * averageMonthly(next)
    const nextIncome = roundIncome(next === 'living' ? relative * units : relative)
    setIncomeText(String(nextIncome))
    setPosition(positionOf(nextIncome))
    setMode(next)
  }

  const typeIncome = (text: string) => {
    setIncomeText(text)
    setPosition(positionOf(Number(text) || 0))
  }

  const slideIncome = (next: number) => {
    setPosition(next)
    setIncomeText(String(incomeAt(next)))
  }

  return (
    <div className="app footprint">
      <p className="lead">Combien de planètes votre revenu vous permet-il de consommer ?</p>

      <div className="field">
        <div className="segmented" role="group" aria-label="Base de calcul">
          <button type="button" aria-pressed={mode === 'household'} onClick={() => changeMode('household')}>
            Revenu du ménage
          </button>
          <button type="button" aria-pressed={mode === 'living'} onClick={() => changeMode('living')}>
            Niveau de vie
          </button>
        </div>
        <p className="hint">
          {mode === 'household'
            ? "Méthode d'origine : revenu déclaré à l'impôt, comparé au revenu déclaré moyen des ménages."
            : 'Revenu après impôts et prestations, divisé par les unités de consommation du foyer, comparé au niveau de vie moyen.'}
        </p>
      </div>

      <div className="field">
        <div className="label-row">
          <label htmlFor="footprint-income-text" id="footprint-income-label">
            {mode === 'household' ? 'Revenu déclaré mensuel du foyer' : 'Revenu disponible mensuel du foyer'}
          </label>
          <span className="amount">
            <input id="footprint-income-text" type="number" min="0" step="1" inputMode="numeric"
                   value={incomeText} onChange={e => typeIncome(e.target.value)}/> €
          </span>
        </div>
        <input type="range" min="0" max={SLIDER_MAX} value={position} aria-labelledby="footprint-income-label"
               aria-valuetext={formatWithUnit(income, '€')} onChange={e => slideIncome(Number(e.target.value))}/>
      </div>

      {mode === 'living' && (
        <div className="household">
          <Stepper id="footprint-adults" label="14 ans ou plus" value={adults} min={1} max={12} onChange={setAdults}
                   less="Une personne de 14 ans ou plus en moins" more="Une personne de 14 ans ou plus en plus"/>
          <Stepper id="footprint-children" label="Moins de 14 ans" value={children} min={0} max={12}
                   onChange={setChildren}
                   less="Un enfant de moins de 14 ans en moins" more="Un enfant de moins de 14 ans en plus"/>
          <span className="units">{formatWithUnit(units, 'UC', 1)}</span>
        </div>
      )}

      <div className="outcome" aria-live="polite">
        <p className="big">
          <span className="n">{formatNumber(planets, digits)}</span>
          <span className="u">{rounded >= 2 ? 'planètes' : 'planète'}</span>
        </p>
        <div className="planets" aria-hidden="true">
          {Array.from({ length: discs }, (_, i) => (
            <span key={i} className={i === 0 ? 'planet' : 'planet extra'}>
              <i style={{ width: `${Math.min(1, planets - i) * 100}%` }}/>
            </span>
          ))}
          {Math.ceil(planets) > MAX_PLANETS && (
            <span className="more">+ {formatNumber(Math.ceil(planets) - MAX_PLANETS)}</span>
          )}
        </div>
        <p>
          pour les {formatNumber(DATA.worldPopulation, 1)} milliards d'humains, si chacun avait le même pouvoir d'achat
          que {mode === 'household' ? 'votre ménage' : 'vous'}. Seuil éco-compatible :
          {' '}<strong>{formatWithUnit(ecoIncome, '€')}</strong> par mois
          {mode === 'household'
            ? ' pour le foyer.'
            : <> par unité de consommation, soit <strong>{formatWithUnit(ecoIncome * units, '€')}</strong> pour le foyer.</>}
        </p>
      </div>

      <details>
        <summary>Méthode de calcul ({DATA.year})</summary>
        <p>
          Le raisonnement de Vincent Bruyère : la surconsommation moyenne des Français par rapport à la biocapacité
          mondiale, rapportée au revenu moyen. Données de {DATA.year}, dernière année mesurée par le Global Footprint
          Network.
        </p>
        <dl className="steps">
          <dt>Biocapacité mondiale par habitant</dt>
          <dd>{formatWithUnit(DATA.bioCapacity, 'hag', 2)}</dd>
          <dt>Empreinte française par habitant</dt>
          <dd>{formatWithUnit(DATA.nationalFootprint, 'hag', 2)}</dd>
          <dt>Nombre de Terres (moyenne française)</dt>
          <dd>
            {formatNumber(overconsumption, 2)}
            <small>{formatNumber(DATA.nationalFootprint, 2)} / {formatNumber(DATA.bioCapacity, 2)}</small>
          </dd>
          <dt>{mode === 'household' ? 'Revenu déclaré moyen par ménage (mensuel)' : 'Niveau de vie moyen (mensuel)'}</dt>
          <dd>
            {formatWithUnit(average, '€')}
            <small>{formatWithUnit(average * 12, '€')} / 12</small>
          </dd>
          <dt className="key">
            {mode === 'household' ? 'Revenu déclaré éco-compatible (mensuel)' : 'Niveau de vie éco-compatible (mensuel)'}
          </dt>
          <dd className="key">
            {formatWithUnit(ecoIncome, '€')}
            <small>{formatWithUnit(average, '€')} / {formatNumber(overconsumption, 2)}</small>
          </dd>
        </dl>
        <p>
          hag : <a href="https://fr.wikipedia.org/wiki/Hectare_global">hectare global</a>. Le rapport entre empreinte
          et biocapacité donne un nombre de Terres.
        </p>
      </details>

      <details>
        <summary>Ce qui a changé depuis 2014</summary>
        <div className="table">
          <table>
            <thead><tr><th></th><th>2014</th><th>{DATA.year}</th></tr></thead>
            <tbody>
              {CHANGES.map(([label, before, after]) => (
                <tr key={label}><td>{label}</td><td>{before}</td><td>{after}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>Biocapacité et empreinte en hag par habitant, revenus en euros, population en milliards.</p>
      </details>

      <details>
        <summary>Limites</summary>
        <ul>
          <li>
            <strong>Ménage ou personne.</strong> Avec le revenu du ménage, une personne seule et une famille de cinq
            obtiennent le même résultat. Le niveau de vie corrige ce biais avec l'échelle de l'Insee : 1 unité de
            consommation pour le premier adulte, 0,5 par personne de 14 ans ou plus, 0,3 par enfant.
          </li>
          <li>
            <strong>Champs.</strong> L'Insee couvre la France métropolitaine, le Global Footprint Network la France
            entière : l'écart est faible.
          </li>
          <li>
            <strong>Seuil optimiste.</strong> La biocapacité mondiale ne réserve rien aux espèces sauvages : une planète
            reste une borne haute.
          </li>
        </ul>
      </details>

      <details>
        <summary>Sources</summary>
        <ul>
          <li>
            Empreinte et biocapacité : Global Footprint Network, <a href="https://data.footprintnetwork.org/">National
            Footprint and Biocapacity Accounts</a>, édition 2026, année {DATA.year}.
          </li>
          <li>
            Revenus : Insee, <a href="https://www.insee.fr/fr/statistiques/8278896?sommaire=8278909">« Revenu, niveau
            de vie et pauvreté en 2022 »</a>, enquête ERFS, tableau T05.
          </li>
          <li>
            Lien revenu-écologie : <a href="https://www.universite-si.org/IMG/pdf/samedi_9_-_revenu_eco-compatible.pdf">étude
            de Vincent Bruyère</a>.
          </li>
        </ul>
      </details>
    </div>
  )
}

export default Footprint
