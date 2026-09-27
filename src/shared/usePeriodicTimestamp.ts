import { useEffect, useState } from 'react'

/** Horodatage rafraîchi toutes les `rateMs` millisecondes */
export function usePeriodicTimestamp(rateMs: number): number {
  const [timestamp, setTimestamp] = useState(Date.now)

  useEffect(() => {
    const id = setInterval(() => setTimestamp(Date.now()), rateMs)
    return () => clearInterval(id)
  }, [rateMs])

  return timestamp
}
