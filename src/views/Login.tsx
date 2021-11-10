import React from "react"

import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles(theme => ({
  banner: {
    width: "100%",
    backgroundColor: theme.palette.third.main,
  },
  bannerContainer: {
    width: "50%",
    margin: "0 auto",
    backgroundColor: theme.palette.third.main,
    minHeight: "450px",
  },
  container: {
    flex: "1 0 auto",
    padding: 0,
    width: "100%",
  },
  whiteBanner: {
    backgroundColor: theme.palette.background.default,
    color: "#000",
    padding: "15px",
  },
  whiteBanner2: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.primary.main,
    padding: "15px",
  },
  purpleBanner: {
    backgroundColor: theme.palette.primary.main,
    color: "#FFF",
    padding: "15px",
  },
  login: {
    width: "20%",
    minWidth: "200px",
    padding: theme.spacing(2),
    marginLeft: "auto",
    marginRight: "50px",
    marginTop: "-70px",
    minHeight: "300px",
    "& img": {
      width: "100%",
      margin: theme.spacing(10, 0, 0),
    },
  },
}))

const Login: React.FC = () => {
  const classes = useStyles()
  let loginRoute = "/aai"
  if (process.env.NODE_ENV === "development") {
    loginRoute = "http://localhost:5430/aai"
  }

  return (
    <Container maxWidth={false} className={classes.container}>
      <Paper elevation={0} className={classes.banner}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="flex-end"
          className={classes.bannerContainer}
        >
          <Grid item xs={12} className={classes.whiteBanner}>
            <Typography variant="h3" component="h2" align="right">
              CSC Metadata Submission Tool
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.purpleBanner}>
            <Typography variant="h4" component="h3" align="right">
              Add, Store and Publish
            </Typography>
          </Grid>
          <Grid item xs={12} className={classes.whiteBanner2}>
            <Typography variant="h4" component="h4" align="right">
              Your Research Metadata
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      <Paper className={classes.login}>
        <Typography variant="h5" component="h5" align="center">
          Login
        </Typography>
        <Link href={loginRoute}>
          <img alt="CSC Login" src="https://user-auth.csc.fi/idp/images/Password.png"></img>
        </Link>
      </Paper>
    </Container>
  )
}

export default Login
