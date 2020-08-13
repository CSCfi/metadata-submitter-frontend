//@flow
import React from "react"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import { makeStyles } from "@material-ui/core/styles"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Home from "components/home"
import Login from "components/login"
import Nav from "components/nav"
import NewDraftWizard from "components/NewDraftWizard/NewDraftWizard"
import Page404 from "error_pages/Page404"
import Page500 from "error_pages/Page500"

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
}))

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
          <Route path="/error500">
            <Page500 />
          </Route>
          <Route exact path="/">
            <Container component="main" maxWidth="md" className={classes.content}>
              <Home />
            </Container>
          </Route>
          <Route exact path="/login">
            <Container component="main" maxWidth={false} className={classes.loginContent}>
              <Login />
            </Container>
          </Route>
          <Route path="*">
            <Page404 />
          </Route>
        </Switch>
      </React.Fragment>
    </Router>
  )
}

export default App
