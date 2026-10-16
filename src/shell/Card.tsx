import { isTool, type Item } from './catalog.ts'
import Preview from './Preview.tsx'

interface Props {
  item: Item
}

/** Carte d'un outil : toute la carte ouvre l'outil, par le lien de son titre */
const Card = ({ item }: Props) => (
  <article className="card">
    <Preview item={item}/>
    <h3>
      {!isTool(item) && <img src={item.icon} alt="" width="20" height="20"/>}
      <a href={`#${item.id}`}>{item.title}</a>
    </h3>
    <p>{item.description}</p>
  </article>
)

export default Card
