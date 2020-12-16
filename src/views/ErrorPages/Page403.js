//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

import ErrorPageContainer from "../../components/ErrorPageContainer"

import { getCountdownTime } from "./ErrorPagesHelper"

const Page403 = () => {
  const [redirect, setRedirect] = useState(false)

  let countdownTime = getCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  })

  const ButtonToHomePage = (
    <Button href="/home" color="primary">
      Home Page
    </Button>
  )

  return redirect ? (
    <Redirect to="/home" />
  ) : (
    <ErrorPageContainer title="403 Forbidden Error">
      <Typography variant="body2">Sorry, this page is currently not valid. </Typography>
      <Typography variant="body2">Please go back to {ButtonToHomePage}</Typography>
      <Typography variant="body2">Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page403
