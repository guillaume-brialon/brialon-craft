import FILMS from './films.json'

/** Film en compétition, une ligne de films.json */
export interface Film {
  year: number
  title: string
  directors: string[]
  countries: string[]
  /** Durée du film */
  seconds: number
}

/** Valeur d'un indicateur pour une année */
export interface Point {
  year: number
  value: number
}

/** Indicateur calculé sur tous les films et année par année */
export interface Measure {
  total: number
  byYear: Point[]
}

/** Nom et nombre de films, pour les palmarès */
export interface Entry {
  name: string
  count: number
}

const films: Film[] = FILMS

export const YEARS = [...new Set(films.map(film => film.year))].sort((a, b) => a - b)
export const FIRST_YEAR = YEARS[0]
export const LAST_YEAR = YEARS.at(-1)!

const filmsOf = (year: number): Film[] => films.filter(film => film.year === year)

/** Applique un calcul à tous les films, puis à ceux de chaque année */
const measure = (compute: (selection: Film[]) => number): Measure => {
  return {
    total: compute(films),
    byYear: YEARS.map(year => ({ year, value: compute(filmsOf(year)) })),
  }
}

const isFrenchOnly = (film: Film): boolean => film.countries.length === 1 && film.countries[0] === 'France'
const isWithoutFrance = (film: Film): boolean => !film.countries.includes('France')
const totalSeconds = (selection: Film[]): number => selection.reduce((sum, film) => sum + film.seconds, 0)

export const COUNT = measure(selection => selection.length)
// En heures
export const TOTAL_DURATION = measure(selection => totalSeconds(selection) / 3600)
// En minutes
export const MEAN_DURATION = measure(selection => totalSeconds(selection) / 60 / selection.length)
// Part des films produits par la France seule, de 0 à 1
export const FRENCH_ONLY = measure(selection => selection.filter(isFrenchOnly).length / selection.length)
export const WITHOUT_FRANCE = measure(selection => selection.filter(isWithoutFrance).length)

/** Nombre de films par nom, du plus fréquent au plus rare, puis par ordre alphabétique */
const tally = (names: string[]): Entry[] => {
  const counts = new Map<string, number>()
  for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
}

/** Les `size` premiers, prolongés des ex aequo du dernier */
const podium = (entries: Entry[], size: number): Entry[] => {
  const threshold = entries[size - 1]?.count ?? 0
  return entries.filter((entry, index) => index < size || entry.count === threshold)
}

// Pays coproducteurs autres que la France, comptés une fois par film où ils apparaissent
export const COUNTRIES = podium(tally(films.flatMap(film => film.countries).filter(country => country !== 'France')), 5)

const directors = tally(films.flatMap(film => film.directors)).filter(entry => entry.count >= 2)
// Réalisateurs sélectionnés au moins deux fois ; les plus fréquents sont nommés
export const REPEAT_DIRECTORS = directors.length
export const TOP_DIRECTORS = directors.filter(entry => entry.count >= 3)
export const TWICE_DIRECTORS = directors.filter(entry => entry.count === 2).length
