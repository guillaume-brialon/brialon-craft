import { useSyncExternalStore } from 'react'
import { CATEGORIES } from '../categories.ts'
import Bench from './Bench.tsx'
import { itemById } from './catalog.ts'
import { hashId, subscribeToHash } from './hash.ts'
import Shelf from './Shelf.tsx'
import '../shared/button.css'
import './workshop.css'

const Workshop = () => {
  // L'outil ouvert suit l'ancre de l'adresse ; les autres ancres (#contact) n'ouvrent rien
  const item = itemById(useSyncExternalStore(subscribeToHash, hashId))

  return (
    <>
      <div className="catalogue">
        {CATEGORIES.map(category => <Shelf key={category.id} category={category}/>)}
      </div>
      {item && <Bench key={item.id} item={item}/>}
    </>
  )
}

export default Workshop
