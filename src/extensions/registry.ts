import zimbraCapture from './zimbra/capture.png'
import zimbraIcon from './zimbra/icon.svg'

// Les extensions vivent dans leur propre dépôt : la page Artisanat n'en montre qu'une capture et la fiche

export interface Extension {
  /** Ancre dans la page Artisanat */
  id: string
  category: 'extensions'
  title: string
  description: string
  /** Fiche sur addons.mozilla.org */
  store: string
  /** Dépôt des sources */
  source: string
  /** Adresse du site modifié, affichée dans la barre du cadre */
  site: string
  icon: string
  /** Capture du site avec l'extension, publiée aussi sur addons.mozilla.org */
  capture: string
  /** Conditions d'emploi, en pastilles sous la fiche */
  notes: string[]
}

export const EXTENSIONS: Extension[] = [
  {
    id: 'zimbra',
    category: 'extensions',
    title: 'Relooking pour le Zimbra de Free',
    description: 'Modernise l\'apparence du webmail Zimbra de Free : couleurs, typographie, icônes, espacements. Extension non officielle, sans lien avec Free ni Zimbra.',
    store: 'https://addons.mozilla.org/addon/relooking-pour-zimbra-de-free/',
    source: 'https://github.com/guillaume-brialon/zimbra-free-relooke',
    site: 'zimbra.free.fr/zimbra/',
    icon: zimbraIcon,
    capture: zimbraCapture,
    notes: ['Firefox 128 ou plus récent', 'Thème « Simple » de Zimbra', 'Aucune donnée collectée'],
  },
]
