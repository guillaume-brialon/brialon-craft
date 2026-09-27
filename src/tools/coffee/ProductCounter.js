import React from 'react'
import PropTypes from 'prop-types'
import './ProductCounter.css'
import {MdRemove, MdAdd} from 'react-icons/md'

const ProductCounter = (props) => {
  const [counter, setCounter] = React.useState(0)

  const handleClickPlus = () => {
    setCounter(counter + 1)
  }

  const handleClickMinus = () => {
    setCounter(counter > 0 ? counter - 1 : 0)
  }

  React.useEffect(() => {
    setCounter(0)
  }, [props.resetTimestamp])

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