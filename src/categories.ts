export type Category = 'time' | 'words' | 'practical' | 'figures' | 'art' | 'extensions'

export interface CategoryInfo {
  id: Category
  title: string
  /** Phrase d'introduction sous le titre de la section */
  intro: string
}

// Ordre des sections de la page Artisanat
export const CATEGORIES: CategoryInfo[] = [
  { id: 'time', title: 'Temps', intro: 'Mesurer, décompter, situer le jour.' },
  { id: 'words', title: 'Mots', intro: 'Jeux et générateurs autour des lettres.' },
  { id: 'practical', title: 'Pratique', intro: 'Petits services du quotidien.' },
  { id: 'figures', title: 'Chiffres', intro: 'Des données réunies à la main, mises en courbes et en palmarès.' },
  { id: 'art', title: 'Art génératif', intro: 'Compositions géométriques tirées au hasard, qui se dessinent et s\'animent sans fin.' },
  { id: 'extensions', title: 'Extensions Firefox', intro: 'Des modules pour le navigateur, publiés sur addons.mozilla.org.' },
]

export const categoryById = (id: Category): CategoryInfo => {
  return CATEGORIES.find(category => category.id === id)!
}
