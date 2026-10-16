import { Suspense } from 'react'
import { isTool, type Item } from './catalog.ts'

interface Props {
  item: Item
}

/** Vignette d'une carte : l'animation elle-même pour l'art génératif, la capture pour une extension */
const Preview = ({ item }: Props) => {
  if (!isTool(item)) {
    return (
      <div className="preview">
        <img src={item.capture} alt="" loading="lazy"/>
      </div>
    )
  }
  if (item.category !== 'art') return null

  return (
    <div className="preview" inert>
      <Suspense>
        <item.Component standalone={false}/>
      </Suspense>
    </div>
  )
}

export default Preview
