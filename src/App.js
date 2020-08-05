//@flow
import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"

import Nav from "components/nav"
import Page404 from "error_pages/Page404"
import Page500 from "error_pages/Page500"
import Home from "components/home"
import NewDraftWizard from "components/NewDraftWizard/NewDraftWizard"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(8, 0, 6),
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
            <Container component="main" className={classes.content}>
              <NewDraftWizard />
            </Container>
          </Route>
          <Route path="/error500">
            <Page500 />
          </Route>
          <Route exact path="/">
            <Container
              component="main"
              maxWidth="md"
              className={classes.content}
            >
              <Home />
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
