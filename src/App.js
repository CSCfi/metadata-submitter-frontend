// @flow
import React from "react"
import PropTypes from "prop-types"
import Container from "@material-ui/core/Container"
import HomeIcon from "@material-ui/icons/Home"
import CssBaseline from "@material-ui/core/CssBaseline"

import {
  AppBar,
  Toolbar,
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  Link,
  IconButton,
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"

import XMLUploadForm from "./components/XMLUploadForm"

const useStyles = makeStyles(theme => ({
  appBar: {
    position: "relative",
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: "flex-end",
    color: "rgb(72,72,72)",
    backgroundColor: "white",
  },
  link: {
    margin: theme.spacing(1, 1.5),
    color: "inherit",
  },
  linkButton: {
    margin: theme.spacing(1, 1.5),
    color: "white",
    padding: "10px 20px",
    backgroundColor: "rgb(121, 131, 204)",
    borderRadius: "20px",
  },
}))

const UploadCard = props => {
  return (
    <Card>
      <CardHeader
        title={`Submit ${props.objectType}`}
        subheader={"Upload an XML file"}
        titleTypographyProps={{ align: "center" }}
        subheaderTypographyProps={{ align: "center" }}
      />
      <CardContent>
        <XMLUploadForm />
      </CardContent>
    </Card>
  )
}

UploadCard.propTypes = {
  objectType: PropTypes.string.isRequired,
}

const App = () => {
  const classes = useStyles()

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar className={classes.appBar} elevation={1}>
        <Toolbar>
          <IconButton
            className={classes.HomeIcon}
            aria-label="go to frontpage"
            color="inherit"
          >
            <HomeIcon />
          </IconButton>
          <nav className={classes.nav}>
            <Link href="#" className={classes.link}>
              Open submissions
            </Link>
            <Link href="#" className={classes.link}>
              Submissions
            </Link>
            <Button>
              <Link href="#" className={classes.linkButton}>
                New submission
              </Link>
            </Button>
          </nav>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" component="main" justify="center">
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item>
            <UploadCard objectType="study" />
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  )
}

export default App
