import { createGrid, type Grid } from './grid.ts'

// Tons de bleu du site, un par classe .tone-<n> de diskr.css
export const TONES = 4
// Tirages infructueux à la suite avant de considérer la surface comme pleine
const MAX_TRIES = 1000
// Au retour d'un onglet en arrière-plan, le temps écoulé est plafonné pour éviter un saut
const MAX_STEP_MS = 100
// Durée minimale entre deux images calculées : 30 par seconde suffisent à des disques lents. Le seuil reste un peu
// sous 1000 / 30 ms pour retenir une image sur deux d'un écran à 60 Hz malgré les écarts de son horloge.
const MIN_FRAME_MS = 30
// Côté minimal d'une case de la grille des voisins, en pixels
const MIN_CELL = 24

// Bornes des rayons réglables, en pixels
export const RADIUS_LIMITS = { min: 5, max: 300 }
// Rayon minimal par défaut, en proportion du côté du carré de même aire que la surface : 19 px dans le cadre de la
// page Artisanat (fenêtre de 1920 × 945, surface de 339 × 578 px), 63 px en plein écran 1920 × 1080
const DEFAULT_RADIUS_MIN_RATIO = 19 / 432
// Le rayon maximal par défaut vaut quatre fois le minimal
const DEFAULT_RADIUS_SPREAD = 4

export type Theme = 'auto' | 'light' | 'dark'

export interface Settings {
  /** Thème de l'outil : celui de la page (`auto`), ou clair ou sombre quel que soit celui de la page */
  theme: Theme
  /** Vrai tant que les rayons suivent la taille de la surface, faux dès qu'ils sont réglés à la main */
  autoRadius: boolean
  /** Plus petit rayon d'un disque, en pixels */
  radiusMin: number
  /** Plus grand rayon d'un disque, en pixels */
  radiusMax: number
  /** Vitesse la plus lente, en pixels par seconde */
  speedMin: number
  /** Vitesse la plus rapide, en pixels par seconde */
  speedMax: number
  /** Vrai si les disques restent entiers dans la surface, faux s'ils peuvent en sortir */
  bounded: boolean
}

interface Point {
  x: number
  y: number
}

interface Circle extends Point {
  radius: number
}

export interface Disk extends Circle {
  id: number
  /** Ton de bleu, de 0 à TONES - 1 */
  tone: number
  /** Direction du déplacement, en radians */
  direction: number
  /** Vitesse, en pixels par seconde */
  speed: number
}

interface Size {
  width: number
  height: number
}

type Stop = () => void

/** Rayons par défaut d'une surface : proportionnés à sa taille, ils gardent la même densité de disques du cadre au plein écran */
const defaultRadii = (size: Size): Pick<Settings, 'radiusMin' | 'radiusMax'> => {
  const side = Math.sqrt(size.width * size.height)
  const fit = (radius: number) => Math.min(RADIUS_LIMITS.max, Math.max(RADIUS_LIMITS.min, Math.round(radius)))
  const radiusMin = fit(side * DEFAULT_RADIUS_MIN_RATIO)
  return { radiusMin, radiusMax: fit(radiusMin * DEFAULT_RADIUS_SPREAD) }
}

const defaultSettings = (size: Size): Settings => {
  return { theme: 'auto', autoRadius: true, ...defaultRadii(size), speedMin: 1, speedMax: 10, bounded: true }
}

const random = (min: number, max: number) => min + Math.random() * (max - min)
const randomDirection = () => random(0, 2 * Math.PI)
const randomSpeed = (settings: Settings) => random(settings.speedMin, settings.speedMax)

/** Grille des voisins d'une surface : ses cases sont à la mesure des plus petits disques */
const gridFor = (settings: Settings, size: Size): Grid => {
  return createGrid(size.width, size.height, Math.max(2 * settings.radiusMin, MIN_CELL))
}

/** Distance d'un point au bord le plus proche de la surface */
const borderRoom = (point: Point, bounds: Size): number => {
  return Math.min(point.x, bounds.width - point.x, point.y, bounds.height - point.y)
}

/**
 * Rayon disponible autour d'un point, jusqu'à `reach`, avant de toucher un disque ou, s'il est donné, le bord :
 * négatif à l'intérieur d'un disque. Le calcul s'arrête dès que la place passe sous `floor`.
 */
const roomAt = (point: Point, reach: number, floor: number, disks: Disk[], grid: Grid, bounds: Size | undefined): number => {
  let room = bounds ? Math.min(reach, borderRoom(point, bounds)) : reach
  grid.every(point.x, point.y, reach, index => {
    const disk = disks[index]
    room = Math.min(room, Math.hypot(disk.x - point.x, disk.y - point.y) - disk.radius)
    return room >= floor
  })
  return room
}

/** Nouveau disque logé dans la place libre, ou rien si MAX_TRIES tirages n'en trouvent pas */
const drawDisk = (settings: Settings, size: Size, disks: Disk[], grid: Grid): Disk | undefined => {
  const { radiusMin, radiusMax } = settings
  const bounds = settings.bounded ? size : undefined
  for (let tries = 0; tries < MAX_TRIES; tries++) {
    const point = { x: random(0, size.width), y: random(0, size.height) }
    // Un regard aux voisins immédiats écarte vite un centre sans place : c'est le cas courant quand la surface se remplit
    if (roomAt(point, radiusMin, radiusMin, disks, grid, bounds) < radiusMin) continue
    return {
      ...point,
      id: disks.length,
      // Un disque trop grand pour sa place est réduit jusqu'à toucher son voisin
      radius: roomAt(point, random(radiusMin, radiusMax), radiusMin, disks, grid, bounds),
      tone: Math.floor(random(0, TONES)),
      direction: randomDirection(),
      speed: randomSpeed(settings),
    }
  }
}

/** Remplit la surface de disques qui ne se chevauchent pas, jusqu'à ne plus trouver de place */
const fill = (settings: Settings, size: Size, grid: Grid): Disk[] => {
  const disks: Disk[] = []
  if (size.width <= 0 || size.height <= 0) return disks
  grid.clear()
  for (let disk = drawDisk(settings, size, disks, grid); disk; disk = drawDisk(settings, size, disks, grid)) {
    grid.add(disk.id, disk.x, disk.y, disk.radius)
    disks.push(disk)
  }
  return disks
}

const overlaps = (a: Circle, b: Circle): boolean => {
  const reach = a.radius + b.radius
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 < reach ** 2
}

/**
 * Direction d'un disque après son rebond sur un appui dont la normale (nx, ny) pointe vers lui : il repart en miroir,
 * comme une bille sur une bande. La direction reste la même s'il s'en éloigne déjà.
 */
const bounce = (direction: number, nx: number, ny: number): number => {
  const vx = Math.cos(direction)
  const vy = Math.sin(direction)
  const toward = (vx * nx + vy * ny) / (nx * nx + ny * ny)
  // Négatif quand le disque va vers l'appui ; sans valeur quand les deux centres sont confondus
  if (!(toward < 0)) return direction
  return Math.atan2(vy - 2 * toward * ny, vx - 2 * toward * nx)
}

/**
 * Disques après `elapsedMs` : chacun avance s'il ne chevauche alors ni un autre disque ni le bord ; sinon il reste
 * sur place et rebondit sur ce qu'il allait toucher, sans changer de vitesse. Les disques sont déplacés l'un après
 * l'autre, si bien que deux voisins ne se croisent jamais.
 */
const move = (disks: Disk[], elapsedMs: number, settings: Settings, grid: Grid, bounds: Size | undefined): Disk[] => {
  const seconds = elapsedMs / 1000
  // Chaque disque est rangé avec la marge de son plus grand pas : la grille reste juste une fois ses voisins déplacés
  const margin = settings.speedMax * seconds
  grid.clear()
  disks.forEach((disk, index) => grid.add(index, disk.x, disk.y, disk.radius + margin))

  const moved = disks.slice()
  for (let i = 0; i < moved.length; i++) {
    const disk = moved[i]
    const next = {
      ...disk,
      x: disk.x + Math.cos(disk.direction) * disk.speed * seconds,
      y: disk.y + Math.sin(disk.direction) * disk.speed * seconds,
    }
    let free = true
    let direction = disk.direction
    // Plusieurs appuis touchés au même pas (un coin, deux voisins) : les rebonds s'enchaînent
    const hit = (nx: number, ny: number) => {
      free = false
      direction = bounce(direction, nx, ny)
    }
    if (bounds) {
      if (next.x < next.radius) hit(1, 0)
      if (next.x > bounds.width - next.radius) hit(-1, 0)
      if (next.y < next.radius) hit(0, 1)
      if (next.y > bounds.height - next.radius) hit(0, -1)
    }
    grid.every(next.x, next.y, next.radius, index => {
      const other = moved[index]
      // La normale d'un disque voisin va de son centre à celui du disque déplacé
      if (index !== i && overlaps(next, other)) hit(disk.x - other.x, disk.y - other.y)
      return true
    })
    moved[i] = free ? next : { ...disk, direction }
  }
  return moved
}

/** Simulation à laquelle les composants s'abonnent : les disques avancent 30 fois par seconde tant qu'il reste un abonné */
export const createSimulation = () => {
  let size: Size = { width: 0, height: 0 }
  let settings = defaultSettings(size)
  let grid = gridFor(settings, size)
  let disks: Disk[] = []
  let frame = 0
  let last = 0
  const listeners = new Set<() => void>()

  const publish = () => listeners.forEach(notify => notify())

  const refill = () => {
    if (settings.autoRadius) settings = { ...settings, ...defaultRadii(size) }
    grid = gridFor(settings, size)
    disks = fill(settings, size, grid)
  }

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop)
    // L'écran peut rafraîchir plus vite que la cadence visée : les images en trop sont sautées, sans calcul ni dessin
    if (now - last < MIN_FRAME_MS) return
    disks = move(disks, Math.min(now - last, MAX_STEP_MS), settings, grid, settings.bounded ? size : undefined)
    last = now
    publish()
  }

  return {
    subscribe: (notify: () => void): Stop => {
      listeners.add(notify)
      if (listeners.size === 1) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      }
      return () => {
        listeners.delete(notify)
        if (listeners.size === 0) cancelAnimationFrame(frame)
      }
    },
    getDisks: () => disks,
    getCount: () => disks.length,
    getTheme: () => settings.theme,
    // Réglages en cours, avec les rayons en pixels même quand ils suivent la surface
    getSettings: () => settings,
    // Réglages par défaut pour la taille actuelle de la surface
    getDefaults: () => defaultSettings(size),
    // Suit la taille du dessin (fonction `ref` de React) : chaque changement tire de nouveaux disques
    observe: (surface: Element | null): Stop | undefined => {
      if (!surface) return
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect
        if (width === size.width && height === size.height) return
        size = { width, height }
        refill()
        publish()
      })
      observer.observe(surface)
      return () => observer.disconnect()
    },
    // Applique de nouveaux réglages : seuls ceux qui changent la place des disques en tirent de nouveaux
    configure: (next: Settings) => {
      const previous = settings
      // La surface a pu changer de taille pendant le réglage : les rayons qui la suivent sont recalculés
      settings = next.autoRadius ? { ...next, ...defaultRadii(size) } : next
      if (settings.radiusMin !== previous.radiusMin || settings.radiusMax !== previous.radiusMax || next.bounded !== previous.bounded) {
        refill()
      } else if (next.speedMin !== previous.speedMin || next.speedMax !== previous.speedMax) {
        disks = disks.map(disk => ({ ...disk, speed: randomSpeed(settings) }))
      }
      publish()
    },
  }
}

export type Simulation = ReturnType<typeof createSimulation>
