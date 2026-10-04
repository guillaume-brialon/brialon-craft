import { use, useCallback, useDeferredValue, useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { ToolProps } from '../registry.ts'
import { formatNumber, plural } from '../../shared/format.ts'
import WordList from './WordList.tsx'
import './quordle.css'

// Dictionnaire servi par le site : il n'est pas dans ce dépôt (voir le README)
const DICTIONARY_URL = '/assets/data/words-fr-5.json'
const WORD_LENGTH = 5
// Case sans lettre connue ; l'espace garde la case non vide, si bien qu'un retour arrière se voit toujours
const UNKNOWN = ' '

let dictionaryRequest: Promise<string[] | null> | undefined

/** Dictionnaire en capitales, demandé une seule fois ; `null` s'il est indisponible */
const loadDictionary = (): Promise<string[] | null> => {
  dictionaryRequest ??= fetch(DICTIONARY_URL)
    .then(response => response.ok ? response.json() : Promise.reject(response.status))
    .then((words: string[]) => words.map(word => word.toUpperCase()))
    .catch(() => null)
  return dictionaryRequest
}

const emptyCells = (): string[] => Array(WORD_LENGTH).fill(UNKNOWN)

/** Lettres de A à Z en capitales, sans accent ; `kept` désigne les autres caractères conservés */
const toLetters = (text: string, kept = ''): string => {
  return text.normalize('NFD').toUpperCase().replace(new RegExp(`[^A-Z${kept}]`, 'g'), '')
}

/** Mots conformes au motif (une lettre ou un espace par case), avec toutes les lettres de `required` et aucune de `excluded` */
export const filterWords = (words: string[], pattern: string, required: string, excluded: string): string[] => {
  const regex = new RegExp(`^${pattern.replaceAll(UNKNOWN, '.')}$`)
  const requiredLetters = [...new Set(required)]
  const excludedLetters = [...new Set(excluded)]
  return words.filter(word => regex.test(word)
    && requiredLetters.every(letter => word.includes(letter))
    && !excludedLetters.some(letter => word.includes(letter)))
}

const Quordle = ({ standalone }: ToolProps) => {
  // Le chargement suspend le composant : l'outil ne s'affiche qu'une fois le dictionnaire reçu
  const dictionary = use(loadDictionary())
  const [cells, setCells] = useState(emptyCells)
  const [required, setRequired] = useState('')
  const [excluded, setExcluded] = useState('')
  // Mots retirés de la liste à la main, masqués jusqu'à l'effacement
  const [removed, setRemoved] = useState<Set<string>>(() => new Set())
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const words = useMemo(
    () => filterWords(dictionary ?? [], cells.join(''), required, excluded).filter(word => !removed.has(word)),
    [dictionary, cells, required, excluded, removed],
  )
  // La liste suit avec un léger différé : les champs réagissent sans attendre son rendu
  const listedWords = useDeferredValue(words)
  const untouched = cells.every(cell => cell === UNKNOWN) && !required && !excluded && removed.size === 0

  // Pastille +n / −n : variation du nombre de mots depuis le rendu précédent ; `id` relance son animation
  const [change, setChange] = useState({ count: words.length, delta: 0, id: 0 })
  if (change.count !== words.length) {
    setChange({ count: words.length, delta: words.length - change.count, id: change.id + 1 })
  }

  const onCellChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const typed = toLetters((event.nativeEvent as InputEvent).data ?? '', UNKNOWN).slice(0, WORD_LENGTH - index)
    if (typed) {
      // Lettre ou espace : la case est remplie et la saisie passe à la suivante (plusieurs cases pour un texte collé)
      setCells(current => current.toSpliced(index, typed.length, ...typed))
      inputs.current[Math.min(index + typed.length, WORD_LENGTH - 1)]?.focus()
    } else if (event.target.value === '') {
      // Retour arrière : vide la case et la précédente, où la saisie revient
      const previous = Math.max(index - 1, 0)
      setCells(current => current.with(index, UNKNOWN).with(previous, UNKNOWN))
      inputs.current[previous]?.focus()
    }
  }

  const remove = useCallback((word: string) => setRemoved(current => new Set(current).add(word)), [])

  const reset = () => {
    setCells(emptyCells())
    setRequired('')
    setExcluded('')
    setRemoved(new Set())
    inputs.current[0]?.focus()
  }

  return (
    <div className="app quordle">
      <div className="field">
        <span className="caption" id="quordle-placed">Lettres bien placées</span>
        <div className="cells" role="group" aria-labelledby="quordle-placed">
          {cells.map((cell, index) => (
            <input
              key={index}
              ref={element => {
                inputs.current[index] = element
              }}
              type="text"
              value={cell}
              aria-label={`Lettre ${index + 1}`}
              // En page seule, la saisie démarre sans clic ; dans le cadre, la page Artisanat garde le focus
              autoFocus={standalone && index === 0}
              autoCapitalize="characters"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={event => onCellChange(index, event)}
              onFocus={event => event.target.setSelectionRange(event.target.value.length, event.target.value.length)}
            />
          ))}
        </div>
      </div>

      <div className="filters">
        <label htmlFor="quordle-required">Avec</label>
        <input id="quordle-required" type="text" value={required} autoCapitalize="characters" autoComplete="off"
               autoCorrect="off" spellCheck={false} onChange={event => setRequired(toLetters(event.target.value))}/>
        <label htmlFor="quordle-excluded">Sans</label>
        <input id="quordle-excluded" type="text" value={excluded} autoCapitalize="characters" autoComplete="off"
               autoCorrect="off" spellCheck={false} onChange={event => setExcluded(toLetters(event.target.value))}/>
      </div>

      <button type="button" className="button ghost" disabled={untouched} onClick={reset}>Tout effacer</button>

      <div className="words">
        {dictionary ? (
          <p className="count" aria-live="polite">
            <span>
              {formatNumber(words.length)} {plural(words.length, 'mot')}
              {removed.size > 0 && `, ${formatNumber(removed.size)} ${plural(removed.size, 'retiré')}`}
            </span>
            {change.delta !== 0 && (
              <span key={change.id} className={`delta ${change.delta > 0 ? 'more' : 'fewer'}`} aria-hidden="true">
                {change.delta > 0 ? '+' : '−'}{formatNumber(Math.abs(change.delta))}
              </span>
            )}
          </p>
        ) : (
          <p className="muted">Impossible de charger le dictionnaire.</p>
        )}
        <WordList words={listedWords} onRemove={remove}/>
      </div>
    </div>
  )
}

export default Quordle
