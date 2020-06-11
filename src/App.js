//@flow
import React, { useState } from "react"
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
import ListItemText from "@material-ui/core/ListItemText"
import ListItem from "@material-ui/core/ListItem"

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

const UploadCard = (objectType: string, changeObject: Function) => {
  return (
    <Card>
      <CardHeader
        title={`Submit ${objectType}`}
        subheader={"Upload an XML file"}
        titleTypographyProps={{ align: "center" }}
        subheaderTypographyProps={{ align: "center" }}
      />
      <CardContent>
        <XMLUploadForm />
      </CardContent>
      <Button onClick={() => changeObject("")}>
        Back to choosing a submission
      </Button>
    </Card>
  )
}

const SubmitObjectCard = (changeObject: Function) => {
  const objectTypes = [
    "study",
    "project",
    "sample",
    "experiment",
    "run",
    "analysis",
    "dac",
    "policy",
    "dataset",
  ]

  return (
    <Card>
      <CardHeader title="Submit an object" />
      <CardContent>
        {objectTypes.map((type, index) => {
          const typeCapitalized = type[0].toUpperCase() + type.substring(1)
          return (
            <ListItem button onClick={() => changeObject(type)} key={index}>
              <ListItemText primary={typeCapitalized} />
            </ListItem>
          )
        })}
      </CardContent>
    </Card>
  )
}

const App = () => {
  const classes = useStyles()
  const [objectType, setObjectType] = useState("")

  const changeObject = (type: string) => setObjectType(type)

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
      <Container component="main" justify="center">
        <Grid container direction="row" justify="center" alignItems="center">
          <Grid item>
            {objectType === "" ? (
              <SubmitObjectCard changeObject={changeObject} />
            ) : (
              //$FlowFixMe
              <UploadCard objectType={objectType} changeObject={changeObject} />
            )}
          </Grid>
        </Grid>
      </Container>
    </React.Fragment>
  )
}

export default App
