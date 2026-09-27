import React from 'react'

const usePeriodicTimestamp = (refreshRateMs, resetTimestamp) => {
  const [updateTimestamp, setUpdateTimestamp] = React.useState(Date.now())

  const tick = () => setUpdateTimestamp(Date.now())

  // When reset is triggered via resetTimestamp
  React.useEffect(() => {
    let result

    // 1st update whatever the rate is
    tick()

    // if rate is set
    if (refreshRateMs !== undefined && refreshRateMs !== null) {
      // schedule periodic refresh
      const intervalId = setInterval(tick, refreshRateMs)
      // cancel periodic refresh on unmount
      result = () => clearInterval(intervalId)
    }

    return result
  }, [refreshRateMs, resetTimestamp])

  return updateTimestamp
}

export default usePeriodicTimestamp
