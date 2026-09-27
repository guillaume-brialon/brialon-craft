import React from 'react'
import {useParams, Navigate} from 'react-router-dom'
import RefreshedTimeProgress from './RefreshedTimeProgress'
import PropTypes from 'prop-types'
import './CountdownTo.css'

const DEFAULT_MIN = 15
const EASTER_EGG_MIN = 56

const getLowerHourDivisor = (number) => {
  let result = Math.min(number, 60)
  while (60 % result > 0) {
    result--
  }
  return result
}

const getGreaterHourDivisor = (number) => {
  let result = Math.min(number, 60)
  while (60 % result > 0) {
    result++
  }
  return result
}

const getClosestHourDivisor = (number) => {
  const lowerDivisor = getLowerHourDivisor(number)
  const greaterDivisor = getGreaterHourDivisor(number)
  const lowerDistance = number - lowerDivisor
  const greaterDistance = greaterDivisor - number
  return Math.min(lowerDistance, greaterDistance) === lowerDistance
    ? lowerDivisor
    : greaterDivisor
}

const getTitle = (toMin) => {
  let result
  switch (toMin) {
    case 15:
      result = 'quart d\'heure'
      break
    case 30:
      result = 'demi-heure'
      break
    case 60:
      result = 'heure'
      break
    case EASTER_EGG_MIN:
      result = `⭑${EASTER_EGG_MIN}⭑`
      break
    default:
      result = `${toMin} min`
  }
  return result
}

const CountdownTo = (props) => {
  let result
  const pathParams = useParams()
  const toMin = Number.parseInt(pathParams.min)
  const closestDivisor = getClosestHourDivisor(toMin)

  if (!toMin) {
    result = <Navigate to={`${props.path}/${DEFAULT_MIN}`}/>
  }
  else if (toMin !== closestDivisor && toMin !== EASTER_EGG_MIN) {
    result = <Navigate to={`${props.path}/${closestDivisor}`}/>
  }
  else {
    const title = getTitle(toMin)
    result = (
      <div className="countdown-to">
        <div className="title">
          {title}
        </div>
        <RefreshedTimeProgress toMin={toMin} rate={100}/>
      </div>
    )
  }

  return result
}

CountdownTo.propTypes = {
  path: PropTypes.string.isRequired,
}

export default CountdownTo