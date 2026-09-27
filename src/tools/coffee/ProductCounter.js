import React from 'react'
import PropTypes from 'prop-types'
import './ProductCounter.css'
import {MdRemove, MdAdd} from 'react-icons/md'

const ProductCounter = (props) => {
  const [counter, setCounter] = React.useState(0)
  // Remise à zéro demandée par le parent : le compteur est ajusté pendant le rendu, sans effet
  const [lastReset, setLastReset] = React.useState(props.resetTimestamp)
  if (props.resetTimestamp !== lastReset) {
    setLastReset(props.resetTimestamp)
    setCounter(0)
  }

  const handleClickPlus = () => {
    setCounter(counter + 1)
  }

  const handleClickMinus = () => {
    setCounter(counter > 0 ? counter - 1 : 0)
  }

  return (
    <div className="product-counter">
      <div className="label">{props.label}</div>
      <div className="button" onClick={handleClickMinus}>
        <MdRemove/>
      </div>
      <div className="counter">{counter}</div>
      <div className="button" onClick={handleClickPlus}>
        <MdAdd/>
      </div>
    </div>
  )
}

ProductCounter.propTypes = {
  label: PropTypes.string,
  resetTimestamp: PropTypes.number,
}

export default ProductCounter