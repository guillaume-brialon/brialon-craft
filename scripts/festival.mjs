// Convertit la liste des films en compétition (tableau séparé par des tabulations : Année, Date, Heure séance,
// Titre, Réalisateur, Pays, Durée) en src/tools/festival/films.json
// Usage : node scripts/festival.mjs [../festival/competition.csv]
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SOURCE = resolve(process.argv[2] ?? resolve(ROOT, '../festival/competition.csv'))
const TARGET = resolve(ROOT, 'src/tools/festival/films.json')

// Noms de pays harmonisés : accents, et une région remplacée par son pays
const COUNTRIES = {
  'Angleterre': 'Royaume-Uni',
  'Egypte': 'Égypte',
  'Etats-Unis': 'États-Unis',
  'Québec': 'Canada',
  'République Tchèque': 'République tchèque',
}

/** Liste séparée par des virgules, sans doublon */
const list = (text, names = {}) => {
  return [...new Set(text.split(',').map(item => item.trim()).filter(Boolean).map(item => names[item] ?? item))]
}

/** Durée « mm:ss » en secondes */
const seconds = (text) => {
  const [minutes, rest] = text.split(':').map(Number)
  return minutes * 60 + rest
}

const films = readFileSync(SOURCE, 'utf8')
  .split(/\r?\n/)
  .slice(1)
  .filter(line => line.trim())
  .map(line => {
    const [year, , , title, directors, countries, duration] = line.split('\t')
    return {
      year: Number(year),
      title: title.trim(),
      directors: list(directors),
      countries: list(countries, COUNTRIES),
      seconds: seconds(duration.trim()),
    }
  })
  .sort((a, b) => a.year - b.year || a.title.localeCompare(b.title, 'fr'))

const invalid = films.filter(film => !film.year || !film.title || !film.directors.length || !film.countries.length
  || !(film.seconds > 0))
if (invalid.length) throw new Error(`Lignes incomplètes : ${invalid.map(film => film.title).join(', ')}`)

// Un film par ligne : un ajout annuel reste lisible dans l'historique
writeFileSync(TARGET, `[\n${films.map(film => JSON.stringify(film)).join(',\n')}\n]\n`)
console.log(`${films.length} films, de ${films[0].year} à ${films.at(-1).year} : ${TARGET}`)
