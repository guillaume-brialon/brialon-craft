import type { ReactNode } from 'react'
import { plural } from '../../shared/format.ts'
import type { Entry } from './stats.ts'

interface Props {
  title: string
  entries: Entry[]
  /** Ligne ajoutée sous la liste */
  children?: ReactNode
}

/** Palmarès : noms et nombre de films, du plus fréquent au plus rare */
const Ranking = ({ title, entries, children }: Props) => (
  <section className="ranking">
    <h3>{title}</h3>
    <ol>
      {entries.map(entry => (
        <li key={entry.name}>
          <span>{entry.name}</span>
          <span className="count">{entry.count} {plural(entry.count, 'film')}</span>
        </li>
      ))}
    </ol>
    {children}
  </section>
)

export default Ranking
