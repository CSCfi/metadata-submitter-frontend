//@flow
import React from "react"

import { useLocation } from "react-router-dom"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page404 = () => {
  const location = useLocation()

  return (
    <ErrorPageContainer title="404 Not Found">
      Oops! Page <code>{location.pathname}</code> could not be found.
    </ErrorPageContainer>
  )
}

export default Page404
