import React from 'react'
import PropTypes from 'prop-types'
import './ResetButton.css'
import {MdDelete} from 'react-icons/md'

const ResetButton = (props) => {
  return (
    <div className="reset-button">
      <div className="button" onClick={props.onClick}>
        <MdDelete/>
      </div>
    </div>
  )
}

ResetButton.propTypes = {
  onClick: PropTypes.func,
}

export default ResetButton