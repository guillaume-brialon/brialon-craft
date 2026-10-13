import { useRef, useState, useSyncExternalStore } from 'react'
import type { ToolProps } from '../registry.ts'
import { MOODS } from './moods.ts'
import { createZoom } from './zoom.ts'
import './piet.css'

const Piet = (_: ToolProps) => {
  const [zoom] = useState(createZoom)
  const running = useSyncExternalStore(zoom.subscribe, zoom.isRunning)
  const mood = useSyncExternalStore(zoom.subscribe, zoom.getMood)
  const surface = useRef<HTMLDivElement>(null)

  // On en sort par la touche Échap ou le geste du système ; un refus du navigateur laisse l'outil tel quel
  const enterFullscreen = () => {
    surface.current?.requestFullscreen().catch(() => {})
  }

  return (
    <div className="app piet">
      <div className="bar">
        <div className="segmented" role="group" aria-label="Couleurs">
          {MOODS.map(({ value, label }) => (
            <button key={value} type="button" aria-pressed={mood === value} onClick={() => zoom.setMood(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="tools">
          <button type="button" className="button ghost" aria-label={running ? 'Pause' : 'Reprendre'} onClick={zoom.toggle}>
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d={running ? 'M5.5 3v10M10.5 3v10' : 'M4.5 2.5v11l9-5.5z'}/>
            </svg>
            <span>{running ? 'Pause' : 'Reprendre'}</span>
          </button>
          {/* Absent là où le navigateur ne sait pas mettre un élément en plein écran (iPhone) */}
          {document.fullscreenEnabled && (
            <button type="button" className="button ghost" aria-label="Plein écran" onClick={enterFullscreen}>
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4"/>
              </svg>
              <span>Plein écran</span>
            </button>
          )}
        </div>
      </div>
      {/* Le canevas remplit son cadre : le zoom suit sa taille, dans le cadre comme en plein écran */}
      <div className="surface" ref={surface}>
        <canvas aria-hidden="true" ref={zoom.attach}/>
      </div>
    </div>
  )
}

export default Piet
