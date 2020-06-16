//@flow
import React from "react"
import { Container, CssBaseline, Grid } from "@material-ui/core"
import Nav from "./components/nav"
import UploadCard from "./components/uploadCard"

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
