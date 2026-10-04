import { useSyncExternalStore, type RefObject } from 'react'
import type { Simulation } from './simulation.ts'

interface Props {
  simulation: Simulation
  /** Cadre de la surface, que le bouton « Plein écran » étend à tout l'écran */
  ref: RefObject<HTMLDivElement | null>
}

/** Surface des disques, seule à être redessinée à chaque image */
const Surface = ({ simulation, ref }: Props) => {
  const disks = useSyncExternalStore(simulation.subscribe, simulation.getDisks)

  return (
    <div className="surface" ref={ref}>
      {/* Le dessin remplit son cadre : la simulation suit sa taille, dans le cadre comme en plein écran */}
      <svg aria-hidden="true" ref={simulation.observe}>
        {disks.map(disk => (
          <circle key={disk.id} className={`tone-${disk.tone}`} cx={disk.x} cy={disk.y} r={disk.radius}/>
        ))}
      </svg>
    </div>
  )
}

export default Surface
