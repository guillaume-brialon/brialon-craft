// Un tableau est un carré de côté 1, centré sur l'origine et découpé en rectangles sur une grille. Son carré central
// reste libre : il reçoit le tableau suivant, RATIO fois plus petit.

// La grille, la taille des rectangles et la part de couleur sont calées sur mondriangenerator.io, réglé sur
// « Complexity Low » et « Color amount High » : 6 cases par côté, des blocs de 3 cases au plus, 65 % de blocs en couleur.

// Cases par côté de la grille sur laquelle tombent les traits
const GRID = 6
// Côté du carré central, en cases
const CORE = 2
// Rapport de taille entre un tableau et celui que contient son carré central
export const RATIO = CORE / GRID
// Épaisseur d'un trait, en proportion du côté du tableau
export const LINE = 0.012
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

/** Rectangle d'un tableau, dans le repère du tableau */
export interface Cell {
  x: number
  y: number
  width: number
  height: number
  color: string
}

export type Painting = Cell[]

/** Zone de la grille, d'une ligne de la grille à une autre dans chaque sens */
interface Zone {
  left: number
  top: number
  right: number
  bottom: number
}

/** Entier tiré au hasard de `min` à `max` compris */
const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

/**
 * Les quatre bandes qui entourent le carré central : chaque coin du tableau revient, au hasard, à la bande
 * horizontale ou à la bande verticale qui s'y rejoignent
 */
const ring = (): Zone[] => {
  const near = (GRID - CORE) / 2
  const far = near + CORE
  // Vrai si le coin revient à la bande horizontale
  const [topLeft, topRight, bottomLeft, bottomRight] = Array.from({ length: 4 }, () => Math.random() < 0.5)
  return [
    { left: topLeft ? 0 : near, top: 0, right: topRight ? GRID : far, bottom: near },
    { left: bottomLeft ? 0 : near, top: far, right: bottomRight ? GRID : far, bottom: GRID },
    { left: 0, top: topLeft ? near : 0, right: near, bottom: bottomLeft ? far : GRID },
    { left: far, top: topRight ? near : 0, right: GRID, bottom: bottomRight ? far : GRID },
  ]
}

/** Découpe une zone en rectangles par des traits qui la traversent de part en part, sur les lignes de la grille */
const split = (zone: Zone): Zone[] => {
  const width = zone.right - zone.left
  const height = zone.bottom - zone.top
  const area = width * height
  // Une case ne se coupe pas ; une zone trop longue l'est toujours, les autres d'autant moins qu'elles sont petites
  if (area === 1 || (Math.max(width, height) <= MAX_SIDE && Math.random() >= area / SPLIT_AREA)) return [zone]
  // Le trait est tiré parmi toutes les lignes de la grille qui traversent la zone : il coupe plutôt le grand côté
  if (Math.random() < (width - 1) / (width + height - 2)) {
    const x = randomInt(zone.left + 1, zone.right - 1)
    return [...split({ ...zone, right: x }), ...split({ ...zone, left: x })]
  }
  const y = randomInt(zone.top + 1, zone.bottom - 1)
  return [...split({ ...zone, bottom: y }), ...split({ ...zone, top: y })]
}

/** Nouveau tableau tiré au hasard : les rectangles qui entourent son carré central */
export const createPainting = (): Painting => {
  const zones = ring().flatMap(split)
  // Rectangles qu'il reste à colorer : leur nombre est fixé, seule leur place est tirée au hasard
  let colored = Math.floor(zones.length * COLOR_SHARE)
  return zones.map((zone, index) => {
    // Tirage sans remise parmi les rectangles restants
    const inColor = Math.random() < colored / (zones.length - index)
    if (inColor) colored--
    return {
      x: zone.left / GRID - 0.5,
      y: zone.top / GRID - 0.5,
      width: (zone.right - zone.left) / GRID,
      height: (zone.bottom - zone.top) / GRID,
      color: inColor ? COLORS[randomInt(0, COLORS.length - 1)] : WHITE,
    }
  })
}
