import React from 'react'
import {
  CircularProgressbar,
  buildStyles as buildCircularProgressStyle,
} from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import PropTypes from 'prop-types'
import './TimeProgress.css'

const BAR_STYLE = buildCircularProgressStyle({
  strokeLinecap: 'butt',
  pathTransition: 'none',
  textColor: '#9caaba',
  pathColor: '#9caaba',
  trailColor: '#262626',
})

const getRemainingTimeAsString = (timeMs) => {
  return new Date(timeMs + 1000).toISOString().slice(14, 19)
}

const getTimeAsString = (timeMs) => {
  return new Date(timeMs).toTimeString().substring(0, 5)
}

const TimeProgress = (props) => {
  const targetTime = props.toMin * 60 * 1000
  const isHourDivisor = 60 % props.toMin === 0
  const duration = isHourDivisor
    ? targetTime
    : 60 * 60 * 1000
  const remainingTime = (targetTime + duration - (props.date % duration)) % duration
  const targetDate = props.date + remainingTime
  const label = getRemainingTimeAsString(remainingTime)
  const elapsedTime = duration - remainingTime
  const ratio = elapsedTime / duration

  return (
    <>
      <div className="time-progress-subtitle">
        ➜{getTimeAsString(targetDate)}
      </div>
      <CircularProgressbar
        value={ratio * 100}
        text={label}
        styles={BAR_STYLE}
      />
    </>
  )
}

TimeProgress.propTypes = {
  date: PropTypes.number.isRequired,
  toMin: PropTypes.number.isRequired,
}

export default TimeProgress