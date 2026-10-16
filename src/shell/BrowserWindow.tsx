import type { Extension } from '../extensions/registry.ts'

interface Props {
  extension: Extension
}

/** Cadre façon fenêtre de navigateur, autour de la capture d'une extension */
const BrowserWindow = ({ extension }: Props) => (
  <div className="device">
    <figure className="browser">
      <div className="browser-bar" aria-hidden="true">
        <span className="dots"><i/><i/><i/></span>
        <span className="url">{extension.site}</span>
        <img src={extension.icon} alt="" width="18" height="18"/>
      </div>
      <img src={extension.capture} alt={`Capture de ${extension.site} avec l'extension`}/>
    </figure>
  </div>
)

export default BrowserWindow
