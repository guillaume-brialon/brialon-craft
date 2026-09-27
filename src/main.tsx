import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Workshop from './shell/Workshop.tsx'

// Page Artisanat : l'atelier remplace la liste de liens de secours du HTML
createRoot(document.getElementById('workshop')!).render(
  <StrictMode>
    <Workshop/>
  </StrictMode>,
)
