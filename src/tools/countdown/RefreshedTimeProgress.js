import React from 'react'
import TimeProgress from './TimeProgress'
import usePeriodicTimestamp from './usePeriodicTimestamp'
import PropTypes from 'prop-types'

const RefreshedTimeProgress = (props) => {
  const timestamp = usePeriodicTimestamp(props.rate)
  return <TimeProgress date={timestamp} toMin={props.toMin}/>
}

RefreshedTimeProgress.propTypes = {
  toMin: PropTypes.number,
}

export default RefreshedTimeProgress