//@flow
import React from "react"

import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import CardHeader from "@material-ui/core/CardHeader"
import Container from "@material-ui/core/Container"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"

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
          <Card>
            <CardHeader title={title} />
            <CardContent>{children}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default ErrorPage
