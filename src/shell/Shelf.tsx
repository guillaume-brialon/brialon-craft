import type { CategoryInfo } from '../categories.ts'
import Card from './Card.tsx'
import { itemsOf } from './catalog.ts'

interface Props {
  category: CategoryInfo
}

/** Section d'une catégorie : titre, introduction et cartes de ses outils */
const Shelf = ({ category }: Props) => {
  const items = itemsOf(category.id)
  if (items.length === 0) return null

  return (
    <section className="shelf" aria-labelledby={`shelf-${category.id}`}>
      <h2 id={`shelf-${category.id}`}>
        {category.title}
        <small>{items.length}</small>
      </h2>
      <p>{category.intro}</p>
      <ul className="cards" data-category={category.id}>
        {items.map(item => (
          <li key={item.id}>
            <Card item={item}/>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Shelf
