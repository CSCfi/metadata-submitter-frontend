import React from "react"

import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"

import CSCBannerLogin from "../images/csc_banner_login.png"

const useStyles = makeStyles(theme => ({
  banner: {
    backgroundColor: theme.palette.common.white,
    backgroundImage: `url(${CSCBannerLogin})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "56.7rem",
    height: "35.4rem",
    margin: "4rem auto",
    paddingTop: "7rem",
    boxShadow: "2px 2px 12px 2px #00000029",
    borderRadius: "0.375rem",
  },
  bannerContainer: {
    margin: "0 auto",
    paddingLeft: "5rem",
    // width: "50%",
    // margin: "0 auto",
    // // backgroundColor: theme.palette.third.main,
    // minHeight: "450px",
    // border: "2px solid red",
  },
  container: {
    flex: "1 0 auto",
    padding: 0,
    width: "100%",
  },
  heading: {
    padding: 0,
    color: "#006778",
    fontWeight: 700,
    fontSize: "2rem",
  },
  introText: {
    marginTop: "1rem",
    width: "50%",
    color: theme.palette.darkGrey,
    fontWeight: 500,
  },
  loginLink: {
    marginTop: "2rem",
  },
  loginButton: {
    fontSize: "1rem",
    backgroundColor: "#006778",
    color: theme.palette.common.white,
    textDecoration: "none",
    fontWeight: 700,
  },
  whiteBanner: {
    // backgroundColor: theme.palette.background.default,
    // color: "#000",
    // padding: "15px",
    // border: "2px solid red",
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
  console.log("loginRoute :>> ", loginRoute)

  return (
    <Container maxWidth={false} className={classes.container}>
      <Paper elevation={0} className={classes.banner}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          // alignItems="flex-end"
          className={classes.bannerContainer}
        >
          <Typography variant="h1" className={classes.heading}>
            SD SUBMIT
          </Typography>
          <Typography className={classes.introText}>Tool for submitting metadata.</Typography>
          <Link href={loginRoute} className={classes.loginLink}>
            <Button variant="contained" className={classes.loginButton}>
              Login
            </Button>
          </Link>
        </Grid>
      </Paper>
      {/* <Paper className={classes.login}>
        <Typography variant="h5" component="h5" align="center">
          Login
        </Typography>
        <Link href={loginRoute}>
          <img alt="CSC Login" src="https://user-auth.csc.fi/idp/images/Password.png"></img>
        </Link>
      </Paper> */}
    </Container>
  )
}

export default Login
