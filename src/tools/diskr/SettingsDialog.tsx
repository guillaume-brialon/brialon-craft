import { useState, type CSSProperties, type FormEvent } from 'react'
import { RADIUS_LIMITS, type Settings, type Theme } from './simulation.ts'

type RangeKey = 'radiusMin' | 'radiusMax' | 'speedMin' | 'speedMax'

interface Thumb {
  key: RangeKey
  /** Nom du curseur pour les lecteurs d'écran */
  label: string
}

interface Row {
  label: string
  unit: string
  min: number
  max: number
  /** Curseurs du minimum puis du maximum, sur la même piste */
  thumbs: [Thumb, Thumb]
  /** Vrai si les valeurs par défaut de la ligne suivent la taille de la surface (réglage `autoRadius`) */
  adaptive?: boolean
}

// Lignes à curseurs de la modale, dans l'ordre d'affichage : un minimum et son maximum partagent la même échelle
const ROWS: Row[] = [
  {
    label: 'Rayon', unit: 'px', adaptive: true, min: RADIUS_LIMITS.min, max: RADIUS_LIMITS.max,
    thumbs: [{ key: 'radiusMin', label: 'Rayon minimal' }, { key: 'radiusMax', label: 'Rayon maximal' }],
  },
  {
    label: 'Vitesse', unit: 'px/s', min: 1, max: 100,
    thumbs: [{ key: 'speedMin', label: 'Vitesse minimale' }, { key: 'speedMax', label: 'Vitesse maximale' }],
  },
]

const THEMES: { value: Theme, label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
]

/**
 * Réglages après la modification d'un curseur : un minimum poussé au-delà de son maximum l'entraîne, et inversement ;
 * des rayons réglés à la main cessent de suivre la taille de la surface
 */
const withValue = (settings: Settings, key: RangeKey, value: number): Settings => {
  const next = { ...settings, [key]: value }
  switch (key) {
    case 'radiusMin':
      next.radiusMax = Math.max(next.radiusMax, value)
      next.autoRadius = false
      break
    case 'radiusMax':
      next.radiusMin = Math.min(next.radiusMin, value)
      next.autoRadius = false
      break
    case 'speedMin':
      next.speedMax = Math.max(next.speedMax, value)
      break
    case 'speedMax':
      next.speedMin = Math.min(next.speedMin, value)
      break
  }
  return next
}

interface Props {
  /** Réglages en cours, repris à l'ouverture */
  settings: Settings
  /** Réglages par défaut pour la taille actuelle de la surface, repris par « Réinitialiser » */
  defaults: Settings
  onApply: (settings: Settings) => void
  onCancel: () => void
}

/** Modale des paramètres : rien n'est appliqué avant la validation */
const SettingsDialog = ({ settings, defaults, onApply, onCancel }: Props) => {
  const [draft, setDraft] = useState(settings)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    onApply(draft)
  }

  return (
    // Un clic sur le voile, hors de la modale, l'annule comme la touche Échap
    <div className="veil" onClick={event => event.target === event.currentTarget && onCancel()}
         onKeyDown={event => event.key === 'Escape' && onCancel()}>
      {/* tabIndex : un clic sur un texte de la modale y garde le focus, donc la touche Échap */}
      <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="diskr-settings-title" tabIndex={-1}
            onSubmit={submit}>
        <p className="title" id="diskr-settings-title">Paramètres</p>
        {ROWS.map(({ label, unit, min, max, thumbs, adaptive }, row) => {
          const [from, to] = thumbs.map(thumb => draft[thumb.key])
          const ratio = (value: number) => (value - min) / (max - min)
          // Partie colorée de la piste, entre les deux curseurs
          const span = { '--from': ratio(from), '--to': ratio(to) } as CSSProperties
          // Deux curseurs confondus : celui du minimum passe devant dans la moitié haute de la piste, celui du
          // maximum dans la moitié basse, pour que le curseur saisi soit celui qui peut encore s'écarter de l'autre
          const minInFront = ratio(from) > 0.5
          return (
            <div className="range" role="group" aria-label={label} key={label}>
              <span className="name">{label}</span>
              {/* « auto » : les rayons par défaut sont proportionnés à la surface, ils changent avec sa taille */}
              <output>{from} à {to} {unit}{adaptive && draft.autoRadius && ' (auto)'}</output>
              <div className="slider" style={span}>
                {thumbs.map((thumb, index) => (
                  <input key={thumb.key} type="range" min={min} max={max} value={draft[thumb.key]}
                         className={minInFront && index === 0 ? 'front' : undefined}
                         aria-label={thumb.label} autoFocus={row === 0 && index === 0}
                         onChange={event => setDraft(withValue(draft, thumb.key, Number(event.target.value)))}/>
                ))}
              </div>
            </div>
          )
        })}
        <label className="option">
          <input type="checkbox" checked={draft.bounded}
                 onChange={event => setDraft({ ...draft, bounded: event.target.checked })}/>
          Garder les disques dans le cadre
        </label>
        <div className="choice" role="group" aria-label="Thème">
          <span className="name">Thème</span>
          <div className="segmented">
            {THEMES.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={draft.theme === value}
                      onClick={() => setDraft({ ...draft, theme: value })}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="buttons">
          <button type="button" className="button ghost reset" onClick={() => setDraft(defaults)}>
            Réinitialiser
          </button>
          <button type="button" className="button ghost" onClick={onCancel}>Annuler</button>
          <button type="submit" className="button primary">Appliquer</button>
        </div>
      </form>
    </div>
  )
}

export default SettingsDialog
