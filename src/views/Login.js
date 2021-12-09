//@flow
import React from "react"

import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"

import CSCBannerLogin from "../images/csc_banner_login.png"

const LoginBanner = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  backgroundImage: `url(${CSCBannerLogin})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  width: "53vw",
  height: "65vh",
  margin: "8.5vh auto",
  paddingTop: "14vh",
  paddingLeft: "5vw",
  borderRadius: "0.375em",
  boxShadow: "2px 2px 12px 2px #00000029",
}))

const LoginButton = styled(Button)(() => ({
  marginTop: "2.5vh",
  paddingTop: "1.5em",
  paddingBottom: "1.5em",
  height: "6.5vh",
  width: "10vw",
}))

const Login = (): React$Element<typeof Container> => {
  let loginRoute = "/aai"
  if (process.env.NODE_ENV === "development") {
    loginRoute = "http://localhost:5430/aai"
  }

  return (
    <Container maxWidth={false} sx={{ flex: "1 0 auto", padding: 0, width: "100%" }}>
      <LoginBanner elevation={0}>
        <Typography variant="h3" sx={{ color: "primary.main", fontWeight: 700 }}>
          SD Submit
        </Typography>
        <Typography sx={{ mt: "4vh", color: "secondary.main" }}>Tool for submitting metadata.</Typography>
        <LoginButton variant="contained" color="primary" href={loginRoute}>
          Login
        </LoginButton>
      </LoginBanner>
    </Container>
  )
}

export default Login
