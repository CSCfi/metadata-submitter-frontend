//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page401 = () => {
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

  const ButtonToMainPage = <Button href="/">Main Page</Button>

  return redirect ? (
    <Redirect to="/" />
  ) : (
    <ErrorPageContainer title="401 Authorization Error">
      <Typography>You have attempted to access a page for which you are not authorized. </Typography>
      <Typography>You can go back to {ButtonToMainPage}</Typography>
      <Typography>Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page401
