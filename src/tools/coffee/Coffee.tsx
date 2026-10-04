import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import './coffee.css'

const DRINKS = [
  'Expresso', 'Allongé', 'Double', 'Ristretto', 'Déca', 'Noisette', 'Café au lait', 'Cappuccino', 'Viennois',
  'Chocolat', 'Thé Merveilles', 'Thé Rooïbos', 'Thé Fruits Rouges', 'Thé Menthe', 'Thé Darjeeling',
  'Thé Earl Grey', 'Thé Jasmin',
]

type Counts = Record<string, number>

const Coffee = (_: ToolProps) => {
  const [counts, setCounts] = useState<Counts>({})
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const add = (drink: string, delta: number) =>
    setCounts(current => ({ ...current, [drink]: Math.max(0, (current[drink] ?? 0) + delta) }))

  return (
    <div className="app coffee">
      <ul>
        {DRINKS.map(drink => {
          const count = counts[drink] ?? 0
          return (
            <li key={drink} className={count > 0 ? 'ordered' : undefined}>
              <span className="drink">{drink}</span>
              <button type="button" aria-label={`Retirer : ${drink}`} disabled={count === 0} onClick={() => add(drink, -1)}>−</button>
              <output aria-label={`${drink} : ${count}`}>{count}</output>
              <button type="button" aria-label={`Ajouter : ${drink}`} onClick={() => add(drink, 1)}>+</button>
            </li>
          )
        })}
      </ul>
      <div className="summary">
        <span>{total} {total >= 2 ? 'boissons' : 'boisson'}</span>
        <button type="button" className="button ghost" disabled={total === 0} onClick={() => setCounts({})}>
          Remettre à zéro
        </button>
      </div>
    </div>
  )
}

export default Coffee
