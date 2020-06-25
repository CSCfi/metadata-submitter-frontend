//@flow
import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Grid from "@material-ui/core/Grid"
import Card from "@material-ui/core/Card"
import CardHeader from "@material-ui/core/CardHeader"
import CardContent from "@material-ui/core/CardContent"
import Skeleton from "@material-ui/lab/Skeleton"
import { makeStyles } from "@material-ui/core/styles"

import Nav from "components/nav"
import UploadCard from "components/uploadCard"
import Home from "components/home"

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardContent: {
    flexGrow: 1,
  },
}))

const Submit = () => {
  const classes = useStyles()
  return (
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={4}>
        <Card className={classes.card}>
          <CardHeader title="Create new submission" />
          <CardContent className={classes.cardContent}>
            <Skeleton variant="text" width={220} height={20} />
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={2} sm={2} md={2} align="center">
        <h3>or</h3>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <UploadCard />
      </Grid>
    </Grid>
  )
}

const App = () => {
  const classes = useStyles()
  return (
    <Router>
      <React.Fragment>
        <CssBaseline />
        <Nav />
        <Container className={classes.cardGrid} maxWidth="md">
          <Switch>
            <Route path="/submit">
              <Submit />
            </Route>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Container>
      </React.Fragment>
    </Router>
  )
}

export default App
