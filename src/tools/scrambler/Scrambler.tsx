import { useMemo, useState } from 'react'
import type { ToolProps } from '../registry.ts'
import '../../shared/app.css'

const INITIAL_TEXT = 'Êtes-vous capable de lire ce texte même avec les lettres en désordre ? Essayez votre propre phrase.'
const WORD = /[\p{L}\p{N}]+/gu

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Mélange les lettres intérieures d'un mot, en évitant de le rendre intact quand c'est possible */
export const scrambleWord = (word: string): string => {
  const letters = [...word]
  if (letters.length < 4) return word
  const inner = letters.slice(1, -1)
  const canChange = new Set(inner).size > 1
  let result = word
  for (let attempt = 0; attempt < 10 && (result === word && canChange || attempt === 0); attempt++) {
    result = letters[0] + shuffle(inner).join('') + letters[letters.length - 1]
  }
  return result
}

const Scrambler = (_: ToolProps) => {
  const [text, setText] = useState(INITIAL_TEXT)
  const scrambled = useMemo(() => text.replace(WORD, scrambleWord), [text])

  return (
    <div className="app scrambler">
      <p className="lead">Vérifiez les capacités cognitives de votre cerveau.</p>
      <div className="field">
        <label htmlFor="scrambler-text">Votre texte</label>
        <textarea id="scrambler-text" value={text} onChange={e => setText(e.target.value)} rows={3}/>
      </div>
      <p className="result" aria-live="polite">{scrambled}</p>
    </div>
  )
}

export default Scrambler
