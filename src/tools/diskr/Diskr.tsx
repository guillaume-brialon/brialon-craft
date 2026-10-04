import { useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import type { ToolProps } from '../registry.ts'
import { formatNumber, plural } from '../../shared/format.ts'
import { createSimulation, type Settings } from './simulation.ts'
import SettingsDialog from './SettingsDialog.tsx'
import Surface from './Surface.tsx'
import './diskr.css'

const Diskr = (_: ToolProps) => {
  const [simulation] = useState(createSimulation)
  const count = useSyncExternalStore(simulation.subscribe, simulation.getCount)
  const theme = useSyncExternalStore(simulation.subscribe, simulation.getTheme)
  // Modale ouverte : réglages en cours et réglages par défaut, relevés à l'ouverture pour la taille de la surface
  const [dialog, setDialog] = useState<{ settings: Settings, defaults: Settings }>()
  const open = dialog !== undefined
  const opener = useRef<HTMLButtonElement>(null)
  const surface = useRef<HTMLDivElement>(null)

  // On en sort par la touche Échap ou le geste du système ; un refus du navigateur laisse l'outil tel quel
  const enterFullscreen = () => {
    surface.current?.requestFullscreen().catch(() => {})
  }

  const close = () => {
    // Le bouton ne peut reprendre le focus qu'une fois la scène redevenue active
    flushSync(() => setDialog(undefined))
    opener.current?.focus()
  }

  const apply = (next: Settings) => {
    simulation.configure(next)
    close()
  }

  return (
    // Sans attribut, l'outil suit le thème de la page ; avec, il garde le sien (variables de tokens.css)
    <div className="app diskr" data-theme={theme === 'auto' ? undefined : theme}>
      <div className="stage" inert={open}>
        <div className="bar">
          <p className="count">{formatNumber(count)} {plural(count, 'disque')}</p>
          <div className="tools">
            {/* Absent là où le navigateur ne sait pas mettre un élément en plein écran (iPhone) */}
            {document.fullscreenEnabled && (
              <button type="button" className="button ghost" aria-label="Plein écran" onClick={enterFullscreen}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>
                </svg>
                <span>Plein écran</span>
              </button>
            )}
            <button ref={opener} type="button" className="button ghost"
                    onClick={() => setDialog({ settings: simulation.getSettings(), defaults: simulation.getDefaults() })}>
              Paramètres
            </button>
          </div>
        </div>
        <Surface simulation={simulation} ref={surface}/>
      </div>
      {dialog && <SettingsDialog {...dialog} onApply={apply} onCancel={close}/>}
    </div>
  )
}

export default Diskr
