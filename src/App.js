//@flow
import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import { makeStyles } from "@material-ui/core/styles"

import Nav from "components/nav"
import Home from "components/home"
import NewDraftCard from "components/newDraftCard"

const useStyles = makeStyles(theme => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
}))

const App = () => {
  const classes = useStyles()
  return (
    <Router>
      <React.Fragment>
        <CssBaseline />
        <Nav />
        <Container className={classes.cardGrid} maxWidth="md">
          <Switch>
            <Route path="/newdraft">
              <NewDraftCard />
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
