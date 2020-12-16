//@flow
import React from "react"

import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import Alert from "@material-ui/lab/Alert"
import AlertTitle from "@material-ui/lab/AlertTitle"

type ErrorPageProps = {
  children: any,
  title: string,
}

const useStyles = makeStyles(theme => ({
  errorContent: {
    width: "100%",
    marginTop: theme.spacing(10),
  },
}))

const ErrorPage = ({ title, children }: ErrorPageProps) => {
  const classes = useStyles()
  return (
    <Container component="main" maxWidth={false} className={classes.errorContent}>
      <Grid container direction="row" justify="center" alignItems="stretch">
        <Grid item xs={6}>
          <Alert severity="error">
            <AlertTitle>{title}</AlertTitle>
            {children}
          </Alert>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ErrorPage
