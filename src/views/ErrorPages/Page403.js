//@flow
import React, { useState, useEffect } from "react"

import { Button } from "@material-ui/core"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import { Redirect } from "react-router-dom"

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
    <Grid container direction="row" justify="center" alignItems="stretch">
      <Grid item xs={6}>
        <Card>
          <CardHeader title="403 Forbidden Error" />
          <CardContent>
            <Typography>Sorry, this page is currently not valid. </Typography>
            <Typography>Please go back to {ButtonToHomePage}</Typography>
            <Typography>Automatically redirect in {countdownTime}s.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Page403
