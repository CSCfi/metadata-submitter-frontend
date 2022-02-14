import React from "react"

import MailOutlineIcon from "@mui/icons-material/MailOutline"
import PhoneIcon from "@mui/icons-material/Phone"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"

import CSCBannerLogin from "../images/csc_banner_login.png"

const LoginContainer = styled(Container)(() => ({
  display: "flex",
  minHeight: "100vh",
  flexDirection: "column",
  justifyContent: "space-between",
}))

const LoginBanner = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  backgroundImage: `url(${CSCBannerLogin})`,
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  [theme.breakpoints.down("sm")]: {
    backgroundPosition: "90% 10vh",
  },
  [theme.breakpoints.between("sm", "md")]: {
    backgroundPosition: "85% 0",
  },
  [theme.breakpoints.between("md", "lg")]: {
    backgroundPosition: "90% 0",
  },
  width: "53vw",
  height: "55vh",
  margin: "16vh auto auto auto",
  padding: "14vh 5vw 5vh 5vw",
  borderRadius: "0.375em",
  boxShadow: "2px 2px 12px 2px #00000029",
}))

const LoginButton = styled(Button)(() => ({
  marginTop: "3.6rem",
  height: "6.5vh",
  width: "10.5vw",
  paddingLeft: "2em",
  paddingRight: "2em",
}))

const Footer = styled(Grid)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  width: "100%",
}))

const FooterItem = styled(Grid)(({ theme }) => ({
  color: theme.palette.secondary.main,
  paddingTop: "2vh",
  paddingBottom: "2vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}))

const Login: React.FC = () => {
  let loginRoute = "/aai"
  if (process.env.NODE_ENV === "development") {
    loginRoute = "http://localhost:5430/aai"
  }

  return (
    <LoginContainer disableGutters maxWidth={false}>
      <LoginBanner elevation={0}>
        <Typography variant="h2" sx={{ color: "primary.main", fontWeight: 700 }}>
          SD Submit
        </Typography>
        <Typography variant="h5" sx={{ mt: "3.6rem", color: "secondary.main" }}>
          Tool for submitting metadata.
        </Typography>
        <LoginButton variant="contained" color="primary" href={loginRoute} data-testid="login-button">
          Login
        </LoginButton>
      </LoginBanner>
      <Footer container justifyContent="center">
        <FooterItem item xs={12} md={4}>
          <Typography variant="h5">CSC - IT Center for Science Ltd.</Typography>
          <Typography variant="h6">P.O. Box 405 FI-02101 Espoo, Finland</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhoneIcon color="secondary" fontSize="medium" />
            <Typography variant="h6" component="span">
              +358 9 457 2001
            </Typography>
          </Box>
        </FooterItem>
        <FooterItem item xs={12} md={4}>
          <Typography variant="h5">Service Desk</Typography>
          <Typography variant="h6">Open Monday to Friday from 8.30 a.m. to 4 p.m.</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhoneIcon color="secondary" fontSize="small" />
            <Typography variant="h6" component="span">
              +358 9 457 2821
            </Typography>
          </Box>
          <Box sx={{ display: "flex" }}>
            <MailOutlineIcon fontSize="small" />
            <Typography variant="body2" component="span">
              servicedesk@csc.fi
            </Typography>
          </Box>
        </FooterItem>
      </Footer>
    </LoginContainer>
  )
}

export default Login
