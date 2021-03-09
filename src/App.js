//@flow
import React from "react"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import { makeStyles } from "@material-ui/core/styles"
import { Switch, Route, useLocation } from "react-router-dom"

import Nav from "components/Nav"
import Page401 from "views/ErrorPages/Page401"
import Page403 from "views/ErrorPages/Page403"
import Page404 from "views/ErrorPages/Page404"
import Page500 from "views/ErrorPages/Page500"
import Home from "views/Home"
import Login from "views/Login"
import NewDraftWizard from "views/NewDraftWizard"
// import Submissions from "views/Submissions"

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

// paths that don't show navigation menu on top
const pathsWithoutNav = ["/error401", "/error403", "/error500"]

const NavigationMenu = () => {
  let location = useLocation()
  if (pathsWithoutNav.indexOf(location.pathname) !== -1) {
    return null
  }
  return <Nav />
}

/**
 * Set up React router and app structure.
 * Routes should be in order from specific to general, root "/" and catcher "*" being the last ones.
 */
const App = (): React$Element<typeof React.Fragment> => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <NavigationMenu />
      <Switch>
        <Route path="/newdraft">
          <Container component="main" maxWidth={false} className={classes.wizardContent}>
            <NewDraftWizard />
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
        <Route exact path="/home/drafts">
          <Container component="main" maxWidth="md" className={classes.content}>
            <Home />
          </Container>
        </Route>
        <Route exact path="/home/published">
          <Container component="main" maxWidth="md" className={classes.content}>
            <Home />
          </Container>
        </Route>
        <Route path="/error401">
          <Page401 />
        </Route>
        <Route path="/error403">
          <Page403 />
        </Route>
        <Route path="/error500">
          <Page500 />
        </Route>
        <Route path="*">
          <Page404 />
        </Route>
      </Switch>
    </React.Fragment>
  )
}

export default App
