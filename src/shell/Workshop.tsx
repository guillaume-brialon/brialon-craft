import { Suspense, useEffect, useState } from 'react'
import { sourceHref, toolById, TOOLS } from '../tools/registry.ts'
import './workshop.css'

// L'outil affiché suit l'ancre de l'adresse ; les autres ancres (#contact) ne changent pas d'outil
function idFromHash(): string | undefined {
  return toolById(location.hash.slice(1))?.id
}

export default function Workshop() {
  const [id, setId] = useState(() => idFromHash() ?? TOOLS[0].id)
  const tool = toolById(id)!

  useEffect(() => {
    const onHashChange = () => {
      const next = idFromHash()
      if (next) setId(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = `${tool.title} · Artisanat`
  }, [tool])

  return (
    <div className="bench" data-orientation={tool.orientation}>
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
          <a className="btn btn-primary" href={tool.path} target="_blank" rel="noopener">Ouvrir seul ↗</a>
          <a className="btn btn-ghost" href={sourceHref(tool)} target="_blank" rel="noopener">Code source ↗</a>
        </div>
        <p className="address">brialon.com{tool.path}</p>
      </div>
    </div>
  )
}
