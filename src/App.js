//@flow
import React from "react"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import { makeStyles } from "@material-ui/core/styles"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Nav from "components/Nav"
import Page401 from "views/ErrorPages/Page401"
import Page403 from "views/ErrorPages/Page403"
import Page404 from "views/ErrorPages/Page404"
import Page500 from "views/ErrorPages/Page500"
import Home from "views/Home"
import Login from "views/Login"
import NewDraftWizard from "views/NewDraftWizard"

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(8, 0, 6),
  },
  wizardContent: {
    padding: theme.spacing(0),
    margin: theme.spacing(8, 0, 0),
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  loginContent: {
    padding: theme.spacing(0),
    margin: theme.spacing(8, 0, 0),
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  errorContent: {
    width: "100%",
    marginTop: theme.spacing(10),
  },
}))

/**
 * Set up React router and app structure.
 * Routes should be in order from specific to general, root "/" and catcher "*" being the last ones.
 */
const App = () => {
  const classes = useStyles()
  return (
    <Router>
      <React.Fragment>
        <CssBaseline />
        <Nav />
        <Switch>
          <Route path="/newdraft">
            <Container component="main" maxWidth={false} className={classes.wizardContent}>
              <NewDraftWizard />
            </Container>
          </Route>
          <Route path="/error401">
            <Container component="main" maxWidth={false} className={classes.errorContent}>
              <Page401 />
            </Container>
          </Route>
          <Route path="/error403">
            <Container component="main" maxWidth={false} className={classes.errorContent}>
              <Page403 />
            </Container>
          </Route>
          <Route path="/error500">
            <Container component="main" maxWidth={false} className={classes.errorContent}>
              <Page500 />
            </Container>
          </Route>
          <Route exact path="/">
            <Container component="main" maxWidth={false} className={classes.loginContent}>
              <Login />
            </Container>
          </Route>
          <Route exact path="/home">
            <Container component="main" maxWidth="md" className={classes.content}>
              <Home />
            </Container>
          </Route>
          <Route path="*">
            <Container component="main" maxWidth={false} className={classes.errorContent}>
              <Page404 />
            </Container>
          </Route>
        </Switch>
      </React.Fragment>
    </Router>
  )
}

export default App
