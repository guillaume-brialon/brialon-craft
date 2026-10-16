import { Suspense } from 'react'
import type { Tool } from '../tools/registry.ts'

interface Props {
  tool: Tool
}

/** Cadre façon écran de téléphone, dans lequel tourne l'outil */
const Device = ({ tool }: Props) => (
  <div className="device">
    <div className="bezel">
      <section className="screen" aria-label={tool.title}>
        <Suspense fallback={<p className="loading">Chargement…</p>}>
          <tool.Component standalone={false}/>
        </Suspense>
      </section>
    </div>
  </div>
)

export default Device
