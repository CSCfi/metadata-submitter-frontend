//@flow
import React from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"

import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"

import Nav from "components/nav"
import Page404 from "error_pages/Page404"
import Page500 from "error_pages/Page500"
import Home from "components/home"
import NewDraft from "components/newDraft"

const App = () => {
  return (
    <Router>
      <React.Fragment>
        <CssBaseline />
        <Nav />
        <Switch>
          <Route path="/newdraft">
            <Container>
              <NewDraft />
            </Container>
          </Route>
          <Route path="/error500">
            <Page500 />
          </Route>
          <Route exact path="/">
            <Container>
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
