const formatters = new Map<number, Intl.NumberFormat>()

/** Nombre au format français avec `digits` décimales */
export function formatNumber(value: number, digits = 0): string {
  let formatter = formatters.get(digits)
  if (!formatter) {
    formatter = new Intl.NumberFormat('fr', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    formatters.set(digits, formatter)
  }
  return formatter.format(value)
}

export function formatWithUnit(value: number, unit: string, digits = 0): string {
  return `${formatNumber(value, digits)} ${unit}`
}

/** Accord simple : « 2 heures », « 1,5 heure » */
export function plural(value: number, word: string): string {
  return value >= 2 ? word + 's' : word
}
