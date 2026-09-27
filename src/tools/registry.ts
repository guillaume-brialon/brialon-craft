import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/** Propriétés communes à tous les outils */
export interface ToolProps {
  /** Vrai sur la page seule de l'outil, faux dans le cadre de la page Artisanat */
  standalone: boolean
}

export type Orientation = 'portrait' | 'landscape'

export interface Tool {
  /** Dossier dans src/tools/, page seule et ancre dans la page Artisanat */
  id: string
  label: string
  title: string
  description: string
  /** Portrait 9:16 ou paysage 16:9 dans le cadre */
  orientation: Orientation
  /** Adresse de la page seule, réécrite vers /craft/<id>/ par le serveur (.htaccess du site) */
  path: string
  Component: LazyExoticComponent<ComponentType<ToolProps>>
}

export const REPO_URL = 'https://github.com/guillaume-brialon/brialon-craft'

// Ordre d'affichage dans la page Artisanat ; chaque outil n'est chargé qu'à l'ouverture
export const TOOLS: Tool[] = [
  {
    id: 'coffee',
    label: 'Utilitaire',
    title: 'Commande de cafés',
    description: 'Notez la commande de toute la tablée, boisson par boisson, puis remettez à zéro.',
    orientation: 'portrait',
    path: '/coffee',
    Component: lazy(() => import('./coffee/Coffee.tsx')),
  },
  {
    id: 'countdown',
    label: 'Minuteur',
    title: 'Décompte perpétuel',
    description: 'Le temps restant jusqu\'au prochain quart d\'heure, demi-heure ou heure pile, pour caler une pause ou une time-box.',
    orientation: 'portrait',
    path: '/to/15',
    Component: lazy(() => import('./countdown/Countdown.tsx')),
  },
  {
    id: 'chrono',
    label: 'Utilitaire',
    title: 'Chronomètre',
    description: 'Comptabilisez le temps passé sur vos tâches : ouvrez un chronomètre par sujet, l\'onglet du navigateur montre s\'il tourne.',
    orientation: 'portrait',
    path: '/chrono',
    Component: lazy(() => import('./chrono/Chrono.tsx')),
  },
  {
    id: 'footprint',
    label: 'Calculateur',
    title: 'Revenu éco-compatible',
    description: 'Combien de planètes votre revenu vous permet-il de consommer ?',
    orientation: 'portrait',
    path: '/footprint',
    Component: lazy(() => import('./footprint/Footprint.tsx')),
  },
  {
    id: 'scrambler',
    label: 'Jeu de lecture',
    title: 'Lecture cryptée',
    description: 'Vérifiez les capacités cognitives de votre cerveau sur un texte aux lettres mélangées.',
    orientation: 'portrait',
    path: '/scrambler',
    Component: lazy(() => import('./scrambler/Scrambler.tsx')),
  },
  {
    id: 'facts',
    label: 'Générateur',
    title: 'Anecdotes xkcd',
    description: 'Générez un fait aléatoire (en anglais) d\'après un diagramme de xkcd.',
    orientation: 'portrait',
    path: '/facts',
    Component: lazy(() => import('./facts/Facts.tsx')),
  },
  {
    id: 'detector',
    label: 'Expérience',
    title: 'Détecteur d\'arrière-plan',
    description: 'Détecte quand le navigateur met la page en veille, en mesurant le retard pris par ses minuteries.',
    orientation: 'portrait',
    path: '/detector',
    Component: lazy(() => import('./detector/Detector.tsx')),
  },
]

export function toolById(id: string | undefined): Tool | undefined {
  return TOOLS.find(tool => tool.id === id)
}

export function sourceHref(tool: Tool): string {
  return `${REPO_URL}/tree/main/src/tools/${tool.id}`
}
