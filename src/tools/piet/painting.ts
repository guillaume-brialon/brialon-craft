// Un tableau a les proportions du canevas : ses coordonnées vont de -0,5 à 0,5 dans chaque sens, l'origine au centre.
// Il est découpé en rectangles sur une grille ; le tableau suivant, RATIO fois plus petit, apparaîtra dans son
// rectangle central.

// La grille, la taille des rectangles et la part de couleur sont calées sur mondriangenerator.io, réglé sur
// « Complexity Low » et « Color amount High » : 6 cases par côté, des blocs de 3 cases au plus, 65 % de blocs en couleur.

// Cases par côté de la grille sur laquelle tombent les traits
const GRID = 6
// Côté du rectangle central, en cases
const CORE = 2
// Lignes de la grille qui bordent le rectangle central
const NEAR = (GRID - CORE) / 2
const FAR = NEAR + CORE
// Rapport de taille entre un tableau et celui qui apparaît dans son rectangle central
export const RATIO = CORE / GRID
// Plus grand côté d'un rectangle, en cases : une zone plus longue est toujours recoupée
const MAX_SIDE = 3
// Aire, en cases, à laquelle est rapportée celle d'une zone pour donner sa probabilité d'être recoupée
const SPLIT_AREA = 20

export const WHITE = '#ffffff'
// Couleur des traits
export const BLACK = '#0a0a0a'
// Couleurs vives, tirées à parts égales
const COLORS = ['#ffd600', '#f5121d', '#0b35e6']
// Part des rectangles d'un tableau qui reçoivent une couleur ; les autres restent blancs
const COLOR_SHARE = 0.65

/** Rectangle d'un tableau */
export interface Cell {
  x: number
  y: number
  width: number
  height: number
  color: string
  /** Moment où sa couleur se pose quand le tableau apparaît, de 0 (la première) à 1 (la dernière) */
  delay: number
}

/** Trait noir d'un tableau, tracé de son premier point vers le second quand le tableau apparaît */
export interface Line {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Rang dans le tracé : un trait relie deux traits de rang inférieur, ou le bord du tableau */
  rank: number
}

export interface Painting {
  /** Rectangles qui entourent le rectangle central */
  cells: Cell[]
  /** Rectangle central, tant que le tableau suivant ne le recouvre pas en entier */
  core: Cell | undefined
  lines: Line[]
  /** Nombre de rangs de traits */
  ranks: number
}

/** Zone de la grille, d'une ligne de la grille à une autre dans chaque sens */
interface Zone {
  left: number
  top: number
  right: number
  bottom: number
}

/** Découpage d'une partie de la grille : des zones, et les traits qui les séparent */
interface Layout {
  zones: Zone[]
  lines: Line[]
}

/** Entier tiré au hasard de `min` à `max` compris */
const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/** Position d'une ligne de la grille dans le repère du tableau */
const place = (line: number) => line / GRID - 0.5

/** Vrai si le point, donné en lignes de la grille, est sur le bord du tableau */
const onEdge = (x: number, y: number) => x === 0 || x === GRID || y === 0 || y === GRID

/** Trait entre deux points : il part du bord du tableau si un seul des deux s'y trouve, d'un bout tiré au hasard sinon */
const stroke = (x1: number, y1: number, x2: number, y2: number, rank: number): Line => {
  const forward = onEdge(x1, y1) === onEdge(x2, y2) ? Math.random() < 0.5 : onEdge(x1, y1)
  return forward ? { x1, y1, x2, y2, rank } : { x1: x2, y1: y2, x2: x1, y2: y1, rank }
}

/**
 * Les quatre bandes qui entourent le rectangle central : chaque coin du tableau revient, au hasard, à la bande
 * horizontale ou à la bande verticale qui s'y rejoignent
 */
const ring = (): Layout => {
  // Vrai si le coin revient à la bande horizontale
  const [topLeft, topRight, bottomLeft, bottomRight] = Array.from({ length: 4 }, () => Math.random() < 0.5)
  const north = { left: topLeft ? 0 : NEAR, top: 0, right: topRight ? GRID : FAR, bottom: NEAR }
  const south = { left: bottomLeft ? 0 : NEAR, top: FAR, right: bottomRight ? GRID : FAR, bottom: GRID }
  const west = { left: 0, top: topLeft ? NEAR : 0, right: NEAR, bottom: bottomLeft ? FAR : GRID }
  const east = { left: FAR, top: topRight ? NEAR : 0, right: GRID, bottom: bottomRight ? FAR : GRID }
  return {
    zones: [north, south, west, east],
    // Le bord intérieur d'une bande la sépare du rectangle central et des bandes voisines. Celui d'une bande sans
    // coin relie les bords intérieurs de ses deux voisines : il se trace après eux.
    lines: [
      stroke(north.left, NEAR, north.right, NEAR, topLeft || topRight ? 0 : 1),
      stroke(south.left, FAR, south.right, FAR, bottomLeft || bottomRight ? 0 : 1),
      stroke(NEAR, west.top, NEAR, west.bottom, topLeft && bottomLeft ? 1 : 0),
      stroke(FAR, east.top, FAR, east.bottom, topRight && bottomRight ? 1 : 0),
    ],
  }
}

/**
 * Découpe une zone en rectangles par des traits qui la traversent de part en part, sur les lignes de la grille ;
 * `rank` est le rang du premier de ces traits
 */
const split = (zone: Zone, rank: number): Layout => {
  const width = zone.right - zone.left
  const height = zone.bottom - zone.top
  const area = width * height
  // Une case ne se coupe pas ; une zone trop longue l'est toujours, les autres d'autant moins qu'elles sont petites
  if (area === 1 || (Math.max(width, height) <= MAX_SIDE && Math.random() >= area / SPLIT_AREA)) {
    return { zones: [zone], lines: [] }
  }
  // Le trait est tiré parmi toutes les lignes de la grille qui traversent la zone : il coupe plutôt le grand côté
  const vertical = Math.random() < (width - 1) / (width + height - 2)
  const at = vertical ? randomInt(zone.left + 1, zone.right - 1) : randomInt(zone.top + 1, zone.bottom - 1)
  const line = vertical ? stroke(at, zone.top, at, zone.bottom, rank) : stroke(zone.left, at, zone.right, at, rank)
  const halves = vertical ? [{ ...zone, right: at }, { ...zone, left: at }] : [{ ...zone, bottom: at }, { ...zone, top: at }]
  const [first, second] = halves.map(half => split(half, rank + 1))
  return { zones: [...first.zones, ...second.zones], lines: [line, ...first.lines, ...second.lines] }
}

/** Nouveau tableau tiré au hasard */
export const createPainting = (): Painting => {
  const frame = ring()
  const bands = frame.zones.map(zone => split(zone, 1))
  // Le rectangle central vient en dernier
  const zones = [...bands.flatMap(band => band.zones), { left: NEAR, top: NEAR, right: FAR, bottom: FAR }]
  const lines = [...frame.lines, ...bands.flatMap(band => band.lines)]
  // Rectangles qu'il reste à colorer : leur nombre est fixé, seule leur place est tirée au hasard
  let colored = Math.floor(zones.length * COLOR_SHARE)
  const cells = zones.map((zone, index) => {
    // Tirage sans remise parmi les rectangles restants
    const inColor = Math.random() < colored / (zones.length - index)
    if (inColor) colored--
    return {
      x: place(zone.left),
      y: place(zone.top),
      width: (zone.right - zone.left) / GRID,
      height: (zone.bottom - zone.top) / GRID,
      color: inColor ? COLORS[randomInt(0, COLORS.length - 1)] : WHITE,
      delay: Math.random(),
    }
  })
  return {
    cells: cells.slice(0, -1),
    core: cells.at(-1),
    lines: lines.map(line => ({ ...line, x1: place(line.x1), y1: place(line.y1), x2: place(line.x2), y2: place(line.y2) })),
    ranks: 1 + Math.max(...lines.map(line => line.rank)),
  }
}
