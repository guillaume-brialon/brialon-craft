import { MOODS, PALETTES, type Mood } from './moods.ts'
import { createPainting, RATIO, type Cell, type Painting } from './painting.ts'

// Durée d'un doublement de taille, en millisecondes
const DOUBLING_MS = 6000
// Au retour d'un onglet en arrière-plan, le temps écoulé est plafonné pour éviter un saut
const MAX_STEP_MS = 100
// Taille, en proportion du canevas, à laquelle un tableau apparaît dans le rectangle central du précédent : celui-ci
// remplit alors tout juste le canevas, si bien qu'on ne voit que deux tableaux à la fois
const BIRTH = RATIO
// Durée du tracé des traits d'un nouveau tableau, puis de la pose de ses couleurs, en millisecondes de zoom
const TRACE_MS = 750
const COLOR_MS = 300
// Durée du fondu d'une couleur
const FADE_MS = 100
// Épaisseur des traits, en proportion du petit côté du canevas : la même pour tous les tableaux, quel que soit le zoom
const LINE = 0.012

type Stop = () => void

/** Âge d'un tableau de taille `scale` : le temps de zoom écoulé depuis son apparition, en millisecondes */
const ageAt = (scale: number): number => DOUBLING_MS * Math.log2(scale / BIRTH)

/** Vrai si le rectangle donné par ses bords touche le carré de demi-côté `reach` centré sur l'origine */
const touches = (left: number, top: number, right: number, bottom: number, reach: number): boolean => {
  return left < reach && right > -reach && top < reach && bottom > -reach
}

/** Valeur ramenée entre 0 et 1 */
const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** Zoom sans fin vers le centre de tableaux emboîtés, dessiné sur un canevas tant qu'il n'est pas en pause */
export const createZoom = () => {
  // Du plus grand tableau au plus petit : chacun occupe le rectangle central du précédent
  const paintings: Painting[] = [createPainting()]
  // Taille du plus grand tableau, en proportion du canevas : à 1, il le remplit tout juste
  let span = 1
  let mood = MOODS[0].value
  let canvas: HTMLCanvasElement | undefined
  let running = !matchMedia('(prefers-reduced-motion: reduce)').matches
  let frame = 0
  let last = 0
  const listeners = new Set<() => void>()

  const publish = () => listeners.forEach(notify => notify())

  // Accorde les tableaux au zoom : en ajoute un au centre, supprime ce qui ne se verra plus
  const settle = () => {
    while (span * RATIO ** paintings.length >= BIRTH) paintings.push(createPainting())
    paintings.forEach((painting, index) => {
      const scale = span * RATIO ** index
      // Un tableau achevé recouvre pour de bon le rectangle central du précédent
      if (index > 0 && ageAt(scale) >= TRACE_MS + COLOR_MS) paintings[index - 1].core = undefined
      // Seul un tableau plus grand que le canevas peut en dépasser
      if (scale <= 1) return
      // Le champ est le canevas, de demi-côté `reach` dans le repère du tableau, quelles que soient ses proportions.
      // Le zoom ne faisant que grossir les tableaux, ce qui en sort n'y revient jamais.
      const reach = 0.5 / scale
      painting.cells = painting.cells.filter(cell => {
        return touches(cell.x, cell.y, cell.x + cell.width, cell.y + cell.height, reach)
      })
      // Un trait dépasse de sa ligne d'une demi-épaisseur, soit au plus LINE fois le demi-côté du champ
      painting.lines = painting.lines.filter(line => {
        return touches(Math.min(line.x1, line.x2), Math.min(line.y1, line.y2), Math.max(line.x1, line.x2),
          Math.max(line.y1, line.y2), reach * (1 + LINE))
      })
    })
    // Un tableau vide a disparu en entier : le suivant devient le plus grand
    while (paintings.length > 1 && !paintings[0].core && paintings[0].cells.length + paintings[0].lines.length === 0) {
      paintings.shift()
      span *= RATIO
    }
  }

  const draw = (target: HTMLCanvasElement) => {
    const context = target.getContext('2d')
    if (!context) return
    const { width, height } = target
    const palette = PALETTES[mood]
    context.fillStyle = palette.tones[0]
    context.fillRect(0, 0, width, height)
    // Couleurs, du plus grand tableau au plus petit : chacun recouvre peu à peu le rectangle central du précédent
    paintings.forEach((painting, index) => {
      const scale = span * RATIO ** index
      // Temps écoulé depuis la fin du tracé, quand les couleurs commencent à se poser
      const since = ageAt(scale) - TRACE_MS
      const fill = (cell: Cell) => {
        const opacity = clamp((since - cell.delay * (COLOR_MS - FADE_MS)) / FADE_MS)
        if (opacity === 0) return
        context.globalAlpha = opacity
        context.fillStyle = palette.tones[cell.tone]
        context.fillRect(width * (0.5 + cell.x * scale), height * (0.5 + cell.y * scale),
          width * cell.width * scale, height * cell.height * scale)
      }
      painting.cells.forEach(fill)
      if (painting.core) fill(painting.core)
    })
    context.globalAlpha = 1
    // Traits, par-dessus toutes les couleurs : un tableau borde ainsi celui qu'il contient
    context.beginPath()
    paintings.forEach((painting, index) => {
      const scale = span * RATIO ** index
      // Rangs de traits déjà tracés ; le dernier ne l'est qu'en partie
      const traced = ageAt(scale) / TRACE_MS * painting.ranks
      for (const line of painting.lines) {
        const progress = clamp(traced - line.rank)
        if (progress === 0) continue
        context.moveTo(width * (0.5 + line.x1 * scale), height * (0.5 + line.y1 * scale))
        context.lineTo(width * (0.5 + (line.x1 + (line.x2 - line.x1) * progress) * scale),
          height * (0.5 + (line.y1 + (line.y2 - line.y1) * progress) * scale))
      }
    })
    const thickness = Math.max(1, LINE * Math.min(width, height))
    context.strokeStyle = palette.line
    context.lineWidth = thickness
    context.stroke()
    // Cadre de la couleur et de l'épaisseur des traits, dont la moitié extérieure tombe hors du canevas ;
    // en plein écran, les bords de l'écran en tiennent lieu
    if (!document.fullscreenElement) {
      context.lineWidth = 2 * thickness
      context.strokeRect(0, 0, width, height)
    }
  }

  // Avance le zoom de `elapsedMs` et redessine ; sans surface à remplir, rien ne bouge
  const render = (elapsedMs: number) => {
    if (!canvas || canvas.width === 0 || canvas.height === 0) return
    span *= 2 ** (elapsedMs / DOUBLING_MS)
    settle()
    draw(canvas)
  }

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop)
    render(Math.min(now - last, MAX_STEP_MS))
    last = now
  }

  const play = () => {
    last = performance.now()
    frame = requestAnimationFrame(loop)
  }

  return {
    subscribe: (notify: () => void): Stop => {
      listeners.add(notify)
      return () => listeners.delete(notify)
    },
    isRunning: () => running,
    getMood: () => mood,
    // Change les couleurs des tableaux déjà dessinés comme des suivants, même en pause
    setMood: (next: Mood) => {
      mood = next
      render(0)
      publish()
    },
    // Dessine sur le canevas (fonction `ref` de React) et suit sa taille, dans le cadre comme en plein écran :
    // les tableaux prennent ses proportions
    attach: (element: HTMLCanvasElement | null): Stop | undefined => {
      if (!element) return
      canvas = element
      const observer = new ResizeObserver(([entry]) => {
        // Un pixel du canevas par pixel de l'écran, pour des traits nets
        element.width = Math.round(entry.contentRect.width * devicePixelRatio)
        element.height = Math.round(entry.contentRect.height * devicePixelRatio)
        render(0)
      })
      observer.observe(element)
      if (running) play()
      return () => {
        observer.disconnect()
        cancelAnimationFrame(frame)
        canvas = undefined
      }
    },
    toggle: () => {
      running = !running
      if (!running) cancelAnimationFrame(frame)
      else if (canvas) play()
      publish()
    },
  }
}
