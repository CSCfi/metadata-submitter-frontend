import React from "react"
import PropTypes from "prop-types"

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return <div className="error">{message}</div>
}

Notification.propTypes = {
  message: PropTypes.string.isRequired,
}

export default Notification
