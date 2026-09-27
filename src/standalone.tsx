import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { toolById } from './tools/registry.ts'
import './shared/standalone.css'

// Page seule d'un outil : <div id="root" data-tool="<id>">
const root = document.getElementById('root')!
const tool = toolById(root.dataset.tool)
if (!tool) throw new Error(`Outil inconnu : ${root.dataset.tool}`)

createRoot(root).render(
  <StrictMode>
    <Suspense>
      <tool.Component standalone/>
    </Suspense>
  </StrictMode>,
)
