/**
 * Grille de cases carrées couvrant la surface : chaque élément y est rangé dans toutes les cases que touche
 * son carré englobant, si bien que deux éléments qui se touchent partagent toujours une case
 */
export const createGrid = (width: number, height: number, cell: number) => {
  const columns = Math.max(1, Math.ceil(width / cell))
  const rows = Math.max(1, Math.ceil(height / cell))
  const cells: number[][] = Array.from({ length: columns * rows }, () => [])
  // Ce qui dépasse de la surface est rangé dans les cases du bord
  const column = (x: number) => Math.min(columns - 1, Math.max(0, Math.floor(x / cell)))
  const row = (y: number) => Math.min(rows - 1, Math.max(0, Math.floor(y / cell)))

  return {
    clear: () => {
      for (const items of cells) items.length = 0
    },
    // Range l'élément `item` dans les cases du carré de centre (x, y) et de demi-côté `reach`
    add: (item: number, x: number, y: number, reach: number) => {
      const lastColumn = column(x + reach)
      const lastRow = row(y + reach)
      for (let r = row(y - reach); r <= lastRow; r++) {
        for (let c = column(x - reach); c <= lastColumn; c++) cells[r * columns + c].push(item)
      }
    },
    // Vrai si `test` accepte tous les éléments rangés dans les cases de ce même carré ; le parcours s'arrête
    // au premier refus. Un élément à cheval sur plusieurs cases est présenté plusieurs fois.
    every: (x: number, y: number, reach: number, test: (item: number) => boolean): boolean => {
      const lastColumn = column(x + reach)
      const lastRow = row(y + reach)
      for (let r = row(y - reach); r <= lastRow; r++) {
        for (let c = column(x - reach); c <= lastColumn; c++) {
          for (const item of cells[r * columns + c]) if (!test(item)) return false
        }
      }
      return true
    },
  }
}

export type Grid = ReturnType<typeof createGrid>
