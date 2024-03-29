import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import Typography from "@mui/material/Typography"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page401: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const ButtonToMainPage = (
    <Button href="/" color="primary" size="large">
      Main Page
    </Button>
  )

  return redirect ? (
    <Navigate to="/" />
  ) : (
    <ErrorPageContainer title="401 Authorization Error" errorType="warning">
      <Typography variant="body2">You have attempted to access a page for which you are not authorized. </Typography>
      <Typography variant="body2">You can go back to {ButtonToMainPage}</Typography>
      <Typography variant="body2">Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page401
