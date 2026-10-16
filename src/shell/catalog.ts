import type { Category } from '../categories.ts'
import { EXTENSIONS, type Extension } from '../extensions/registry.ts'
import { TOOLS, type Tool } from '../tools/registry.ts'

// Ce que montre la page Artisanat : les outils, qui tournent dans un cadre, et les extensions, montrées en capture
export type Item = Tool | Extension

const ITEMS: Item[] = [...TOOLS, ...EXTENSIONS]

export const isTool = (item: Item): item is Tool => {
  return 'Component' in item
}

export const itemsOf = (category: Category): Item[] => {
  return ITEMS.filter(item => item.category === category)
}

export const itemById = (id: string): Item | undefined => {
  return ITEMS.find(item => item.id === id)
}
