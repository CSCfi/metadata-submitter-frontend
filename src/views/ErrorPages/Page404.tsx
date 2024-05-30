import React from "react"

import { useLocation } from "react-router-dom"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page404: React.FC = () => {
  const errorLocation = useLocation()
  const searchParams = errorLocation.search!== "" ? errorLocation.search : ""
  const pathname: string = errorLocation.pathname === "/error404" ? "" : errorLocation.pathname + searchParams

  return (
    <ErrorPageContainer title="404 Not Found" errorType="warning">
      Oops! Page <code data-testid="location-pathname">{pathname}</code> could not be found.
    </ErrorPageContainer>
  )
}

export default Page404
