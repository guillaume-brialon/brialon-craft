import { memo, type CSSProperties, type MouseEvent } from 'react'

// Mots par bloc de la liste : multiple de 2 à 6, pour des blocs sans ligne incomplète quel que soit le nombre de colonnes
const CHUNK_SIZE = 240

/** Liste des mots, en blocs que le navigateur ne met en page qu'à l'approche de l'écran (voir quordle.css) */
const WordList = memo(({ words, onRemove }: { words: string[], onRemove: (word: string) => void }) => {
  const chunks = Array.from(
    { length: Math.ceil(words.length / CHUNK_SIZE) },
    (_, index) => words.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE),
  )

  // Un seul écouteur pour toute la liste, qui peut compter des milliers de mots
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const word = (event.target as HTMLElement).closest('button')?.textContent
    if (word) onRemove(word)
  }

  return (
    <div className="list" role="group" aria-label="Mots possibles : un clic retire le mot de la liste" onClick={onClick}>
      {chunks.map((chunk, index) => (
        <ul key={index} style={{ '--count': chunk.length } as CSSProperties}>
          {chunk.map(word => <li key={word}><button type="button">{word}</button></li>)}
        </ul>
      ))}
    </div>
  )
})

export default WordList
