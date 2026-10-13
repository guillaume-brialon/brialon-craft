// Humeurs du tableau : les couleurs de ses traits et de ses rectangles

export type Mood = 'brialon' | 'mondrian'

export interface Palette {
  /** Couleur des traits et du cadre */
  line: string
  /** Couleur du fond, puis des TONES couleurs que reçoivent les rectangles (painting.ts) */
  tones: string[]
}

// Les deux humeurs gardent leur fond blanc en thème sombre, comme une image
export const PALETTES: Record<Mood, Palette> = {
  // Les bleus de brialon.com
  brialon: { line: '#003261', tones: ['#ffffff', '#245b8f', '#5a88c0', '#a3bcdc'] },
  // Les couleurs de Mondrian, en plus vif
  mondrian: { line: '#0a0a0a', tones: ['#ffffff', '#ffd600', '#f5121d', '#0b35e6'] },
}

// Humeurs dans l'ordre du sélecteur, celle par défaut en premier
export const MOODS: { value: Mood, label: string }[] = [
  { value: 'brialon', label: 'Brialon' },
  { value: 'mondrian', label: 'Mondrian' },
]
