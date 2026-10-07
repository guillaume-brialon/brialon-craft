interface Props {
  label: string
  /** Part remplie, de −100 à 100 */
  value: number
}

/** Nombre arrondi et signé : « +24 % », « −24 % », et « 0 % » de part et d'autre du zéro */
const signed = (value: number): string => {
  const rounded = Math.round(value)
  if (rounded === 0) return '0 %'
  return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} %`
}

/**
 * Jauge titrée de −100 à 100 %, le zéro au milieu : la barre part du milieu, vers la droite si la valeur est
 * positive, vers la gauche sinon. Elle suit la valeur exacte, le nombre affiché est arrondi.
 */
const Gauge = ({ label, value }: Props) => (
  <div className="gauge">
    <span className="gauge-label">{label}</span>
    <span className="gauge-value">{signed(value)}</span>
    <div className="track" role="meter" aria-label={label} aria-valuemin={-100} aria-valuemax={100}
         aria-valuenow={Math.round(value)} aria-valuetext={signed(value)}>
      <div className="fill" style={{ left: `${50 + Math.min(0, value) / 2}%`, width: `${Math.abs(value) / 2}%` }}/>
    </div>
  </div>
)

export default Gauge
