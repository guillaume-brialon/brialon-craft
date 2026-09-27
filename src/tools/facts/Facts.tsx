import { useState } from 'react'
import type { ToolProps } from '../registry.ts'
import { FACTS, type FactNode } from './facts-data.ts'
import '../../shared/app.css'
import './facts.css'

function generate(node: FactNode): string {
  if (typeof node === 'string') return node
  if ('seq' in node) return node.seq.map(generate).join(' ')
  return generate(node.alt[Math.floor(Math.random() * node.alt.length)])
}

// Ponctuation collée au mot précédent, à l'anglaise
const fact = () => generate(FACTS).replace(/ \?/g, '?')

export default function Facts(_: ToolProps) {
  const [text, setText] = useState(fact)

  return (
    <div className="app facts">
      <p className="lead">
        Un fait aléatoire (en anglais) d'après ce diagramme de <a href="https://xkcd.com/1930/">xkcd</a>.
      </p>
      <p className="result" lang="en" aria-live="polite">{text}</p>
      <button type="button" className="button primary" onClick={() => setText(fact())}>Un autre fait</button>
      <a className="diagram" href="https://xkcd.com/1930/">
        <img src="https://imgs.xkcd.com/comics/calendar_facts.png" loading="lazy"
             alt="Diagramme xkcd « Calendar facts » : les enchaînements de mots qui composent chaque fait"/>
      </a>
    </div>
  )
}
