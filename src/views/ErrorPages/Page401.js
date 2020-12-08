//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

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

  const RedirectToMainPage = <Redirect to="/" />
  const ButtonToMainPage = <Button href="/">Main Page</Button>

  return redirect ? (
    RedirectToMainPage
  ) : (
    <Grid container direction="row" justify="center" alignItems="stretch">
      <Grid item xs={6}>
        <Card>
          <CardHeader title="401 Authorization Error" />
          <CardContent>
            <Typography>You have attempted to access a page for which you are not authorized. </Typography>
            <Typography>
              You can go back to the main page by clicking this {ButtonToMainPage} or it will automatically redirect in{" "}
              {countdownTime}s.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Page401
