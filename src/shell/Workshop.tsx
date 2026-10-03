import { Suspense, useState, useSyncExternalStore } from 'react'
import { sourceHref, toolById, TOOLS } from '../tools/registry.ts'
import '../shared/button.css'
import './workshop.css'

/** Outil désigné par l'ancre de l'adresse, s'il y en a un */
const idFromHash = (): string | undefined => {
  return toolById(location.hash.slice(1))?.id
}

const subscribeToHash = (notify: () => void) => {
  window.addEventListener('hashchange', notify)
  return () => window.removeEventListener('hashchange', notify)
}

const Workshop = () => {
  // L'outil affiché suit l'ancre de l'adresse ; les autres ancres (#contact) ne changent pas d'outil
  const hashId = useSyncExternalStore(subscribeToHash, idFromHash)
  const [id, setId] = useState(hashId ?? TOOLS[0].id)
  if (hashId && hashId !== id) setId(hashId)
  const tool = toolById(id)!

  return (
    <div className="bench" data-orientation={tool.orientation}>
      <title>{`${tool.title} · Artisanat`}</title>
      <nav className="tool-list" aria-label="Outils">
        <ul>
          {TOOLS.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} aria-current={item.id === id ? 'page' : undefined}>
                <span className="label">{item.label}</span>
                <strong>{item.title}</strong>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="device">
        <div className="bezel">
          <section className="screen" key={tool.id} aria-label={tool.title}>
            <Suspense fallback={<p className="loading">Chargement…</p>}>
              <tool.Component standalone={false}/>
            </Suspense>
          </section>
        </div>
      </div>

      <div className="tool-info">
        <span className="label">{tool.label}</span>
        <h2>{tool.title}</h2>
        <p>{tool.description}</p>
        <div className="actions">
          <a className="button primary" href={tool.path} target="_blank" rel="noopener">Ouvrir seul ↗</a>
          <a className="button ghost" href={sourceHref(tool)} target="_blank" rel="noopener">Code source ↗</a>
        </div>
        <p className="address">brialon.com{tool.path}</p>
      </div>
    </div>
  )
}

export default Workshop
