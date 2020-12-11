//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page403 = () => {
  const [countdownTime, setCountdownTime] = useState(10)
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    let timer
    if (countdownTime > 0) {
      timer = setInterval(() => setCountdownTime(countdownTime - 1), 1000)
      return () => clearInterval(timer)
    }
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const ButtonToHomePage = <Button href="/home">Home Page</Button>

  return redirect ? (
    <Redirect to="/home" />
  ) : (
    <ErrorPageContainer title="403 Forbidden Error">
      <Typography>Sorry, this page is currently not valid. </Typography>
      <Typography>Please go back to {ButtonToHomePage}</Typography>
      <Typography>Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page403
