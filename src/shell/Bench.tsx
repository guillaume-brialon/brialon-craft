import { categoryById } from '../categories.ts'
import { sourceHref } from '../tools/registry.ts'
import BrowserWindow from './BrowserWindow.tsx'
import { isTool, type Item } from './catalog.ts'
import Device from './Device.tsx'
import { clearHash } from './hash.ts'

interface Props {
  item: Item
}

/** Ouvre la fenêtre dès son ajout à la page ; la retirer de la page la referme */
const showModal = (dialog: HTMLDialogElement | null) => {
  if (dialog && !dialog.open) dialog.showModal()
}

/** Fenêtre d'un outil : son cadre et sa fiche ; la fermer retire l'ancre de l'adresse */
const Bench = ({ item }: Props) => (
  <dialog
    className="bench"
    ref={showModal}
    aria-labelledby="bench-title"
    data-orientation={isTool(item) ? item.orientation : 'landscape'}
    onClose={clearHash}
    // Un clic hors du contenu, sur le fond, referme la fenêtre
    onClick={event => event.target === event.currentTarget && event.currentTarget.close()}
  >
    <title>{`${item.title} · Artisanat`}</title>
    <div className="bench-body">
      {/* Premier élément de la fenêtre : il reçoit le focus à l'ouverture */}
      <form method="dialog" className="close">
        <button className="button ghost">Fermer ✕</button>
      </form>

      {isTool(item) ? <Device tool={item}/> : <BrowserWindow extension={item}/>}

      <div className="tool-info">
        <span className="label">{categoryById(item.category).title}</span>
        <h2 id="bench-title">{item.title}</h2>
        <p>{item.description}</p>
        {isTool(item) ? (
          <>
            <div className="actions">
              <a className="button primary" href={item.path} target="_blank" rel="noopener">Ouvrir seul ↗</a>
              <a className="button ghost" href={sourceHref(item)} target="_blank" rel="noopener">Code source ↗</a>
            </div>
            <p className="address">brialon.com{item.path}</p>
          </>
        ) : (
          <>
            <div className="actions">
              <a className="button primary" href={item.store} target="_blank" rel="noopener">Ajouter à Firefox ↗</a>
              <a className="button ghost" href={item.source} target="_blank" rel="noopener">Code source ↗</a>
            </div>
            <ul className="notes">
              {item.notes.map(note => <li key={note}>{note}</li>)}
            </ul>
          </>
        )}
      </div>
    </div>
  </dialog>
)

export default Bench
