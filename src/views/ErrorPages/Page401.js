//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

import ErrorPageContainer from "../../components/ErrorPageContainer"

import { getCountdownTime } from "./ErrorPagesHelper"

const Page401 = (): React$Element<any> => {
  const [redirect, setRedirect] = useState(false)

  let countdownTime = getCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  })

  const ButtonToMainPage = (
    <Button href="/" color="primary">
      Main Page
    </Button>
  )

  return redirect ? (
    <Redirect to="/" />
  ) : (
    <ErrorPageContainer title="401 Authorization Error" errorType="warning">
      <Typography variant="body2">You have attempted to access a page for which you are not authorized. </Typography>
      <Typography variant="body2">You can go back to {ButtonToMainPage}</Typography>
      <Typography variant="body2">Automatically redirect in {countdownTime}s.</Typography>
    </ErrorPageContainer>
  )
}

export default Page401
