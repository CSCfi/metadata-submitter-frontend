import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import Typography from "@mui/material/Typography"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page403: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const ButtonToHomePage = (
    <Button href="/home" color="primary">
      Home Page
    </Button>
  )

  return redirect ? (
    <Navigate to="/home" />
  ) : (
    <ErrorPageContainer title="403 Forbidden Error" errorType="error">
      <Typography variant="body2">Sorry, this page is currently not valid. </Typography>
      <Typography variant="body2">Please go back to {ButtonToHomePage}</Typography>
      <Typography variant="body2">Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page403
