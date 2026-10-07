export const DAY_MS = 86_400_000
export const YEAR_MS = 365 * DAY_MS
// Inclinaison de l'axe de la Terre en degrés : la déclinaison du soleil ne la dépasse jamais
export const OBLIQUITY = 23.44

// Origine des formules : le 1er janvier 2000 à midi, temps universel
const EPOCH_MS = Date.UTC(2000, 0, 1, 12)
const RADIANS = Math.PI / 180
// Avance moyenne du soleil sur l'écliptique, en degrés par jour
const DEGREES_PER_DAY = 0.9856474

export interface Milestone {
  /** Instant où le soleil franchit ce quart de tour */
  at: number
  /** Quart de tour franchi : 0 en mars, 1 en juin, 2 en septembre, 3 en décembre */
  quarter: number
}

/**
 * Longitude du soleil sur l'écliptique, en degrés de 0 à 360 : formule courte de l'Astronomical Almanac,
 * juste à 0,01° près jusqu'en 2050
 */
const solarLongitude = (ms: number): number => {
  const days = (ms - EPOCH_MS) / DAY_MS
  const anomaly = (357.528 + 0.9856003 * days) * RADIANS
  const longitude = 280.46 + DEGREES_PER_DAY * days + 1.915 * Math.sin(anomaly) + 0.02 * Math.sin(2 * anomaly)
  return ((longitude % 360) + 360) % 360
}

/** Déclinaison du soleil en degrés : positive quand il est au nord de l'équateur */
export const solarDeclination = (ms: number): number => {
  return Math.asin(Math.sin(OBLIQUITY * RADIANS) * Math.sin(solarLongitude(ms) * RADIANS)) / RADIANS
}

/** Premier équinoxe ou solstice après l'instant donné */
const nextMilestone = (after: number): Milestone => {
  const quarter = (Math.floor(solarLongitude(after) / 90) + 1) % 4
  let at = after
  // Le soleil avance d'un degré par jour environ : chaque tour divise l'écart restant par trente
  for (let turn = 0; turn < 4; turn++) {
    // Écart à la longitude visée, ramené entre −180° et 180°
    const gap = ((quarter * 90 - solarLongitude(at) + 540) % 360) - 180
    at += (gap / DEGREES_PER_DAY) * DAY_MS
  }
  return { at, quarter }
}

/** Équinoxes et solstices entre deux instants, dans l'ordre */
export const milestonesBetween = (from: number, to: number): Milestone[] => {
  const milestones: Milestone[] = []
  let milestone = nextMilestone(from)
  while (milestone.at <= to) {
    milestones.push(milestone)
    // Un jour plus tard, le soleil a passé ce quart de tour : le suivant est le prochain
    milestone = nextMilestone(milestone.at + DAY_MS)
  }
  return milestones
}
