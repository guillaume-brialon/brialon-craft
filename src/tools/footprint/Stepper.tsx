interface Props {
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
const Stepper = ({ id, label, value, min, max, onChange, less, more }: Props) => (
  <div className="field">
    <span className="stepper-label" id={id}>{label}</span>
    <div className="stepper" role="group" aria-labelledby={id}>
      <button type="button" aria-label={less} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <span className="count" aria-live="polite">{value}</span>
      <button type="button" aria-label={more} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>
)

export default Stepper
