import { BLACK, createPainting, LINE, RATIO, WHITE, type Cell, type Painting } from './painting.ts'

// Durée d'un doublement de taille, en millisecondes
const DOUBLING_MS = 3000
// Au retour d'un onglet en arrière-plan, le temps écoulé est plafonné pour éviter un saut
const MAX_STEP_MS = 100
// Côté, en pixels du canevas, à partir duquel un carré central reçoit son tableau
const MIN_CORE_PX = 2

type Stop = () => void

/**
 * Vrai tant qu'un rectangle, traits compris, touche le carré de demi-côté `reach` centré sur l'origine. Le zoom ne
 * faisant que grossir les tableaux, un rectangle sorti de ce carré n'y revient jamais.
 */
const inView = (cell: Cell, reach: number): boolean => {
  const margin = LINE / 2
  return cell.x - margin < reach && cell.x + cell.width + margin > -reach
    && cell.y - margin < reach && cell.y + cell.height + margin > -reach
}

/** Zoom sans fin vers le centre de tableaux emboîtés, dessiné sur un canevas tant qu'il n'est pas en pause */
export const createZoom = () => {
  // Du plus grand tableau au plus petit : chacun occupe le carré central du précédent
  const paintings: Painting[] = [createPainting()]
  // Côté du plus grand tableau, en proportion du grand côté de la surface ; au départ, son bord est juste hors champ
  let span = 1 + LINE
  let canvas: HTMLCanvasElement | undefined
  let running = !matchMedia('(prefers-reduced-motion: reduce)').matches
  let frame = 0
  let last = 0
  const listeners = new Set<() => void>()

  const publish = () => listeners.forEach(notify => notify())

  // Accorde les tableaux au zoom, pour une surface dont le grand côté fait `unit` pixels
  const settle = (unit: number) => {
    // Un carré central devient visible : un nouveau tableau y apparaît
    for (let core = span * RATIO ** paintings.length * unit; core >= MIN_CORE_PX; core *= RATIO) {
      paintings.push(createPainting())
    }
    // Le champ est le carré qui contient la surface : ce qui en sort ne reviendrait pas, même si elle changeait de
    // forme (plein écran, téléphone tourné). Seuls les tableaux plus grands que lui peuvent en dépasser.
    for (let index = 0, side = span; index < paintings.length && side > 1; index++, side *= RATIO) {
      const reach = 0.5 / side
      if (!paintings[index].every(cell => inView(cell, reach))) {
        paintings[index] = paintings[index].filter(cell => inView(cell, reach))
      }
    }
    // Un tableau sans rectangle a disparu en entier : le suivant devient le plus grand
    while (paintings.length > 1 && paintings[0].length === 0) {
      paintings.shift()
      span *= RATIO
    }
  }

  const draw = (target: HTMLCanvasElement, unit: number) => {
    const context = target.getContext('2d')
    if (!context) return
    const { width, height } = target
    context.resetTransform()
    // Fond du dernier carré central, encore vide
    context.fillStyle = WHITE
    context.fillRect(0, 0, width, height)
    context.strokeStyle = BLACK
    context.lineWidth = LINE
    // Du plus petit tableau au plus grand : les traits d'un tableau recouvrent le bord de celui qu'il contient
    for (let index = paintings.length - 1; index >= 0; index--) {
      const side = span * RATIO ** index * unit
      context.setTransform(side, 0, 0, side, width / 2, height / 2)
      context.beginPath()
      for (const cell of paintings[index]) {
        context.fillStyle = cell.color
        context.fillRect(cell.x, cell.y, cell.width, cell.height)
        context.rect(cell.x, cell.y, cell.width, cell.height)
      }
      context.stroke()
    }
  }

  // Avance le zoom de `elapsedMs` et redessine ; sans surface à remplir, rien ne bouge
  const render = (elapsedMs: number) => {
    const unit = canvas ? Math.max(canvas.width, canvas.height) : 0
    if (!canvas || unit === 0) return
    span *= 2 ** (elapsedMs / DOUBLING_MS)
    settle(unit)
    draw(canvas, unit)
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
    // Dessine sur le canevas (fonction `ref` de React) et suit sa taille, dans le cadre comme en plein écran
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
