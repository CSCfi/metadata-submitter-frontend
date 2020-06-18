//@flow
import React from "react"
import Container from "@material-ui/core/Container"
import CssBaseline from "@material-ui/core/CssBaseline"
import Grid from "@material-ui/core/Grid"
import Nav from "components/nav"
import UploadCard from "components/uploadCard"

const App = () => (
  <React.Fragment>
    <CssBaseline />
    <Nav />
    <Container component="main" justify="center">
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item>
          <UploadCard />
        </Grid>
      </Grid>
    </Container>
  </React.Fragment>
)

export default App
