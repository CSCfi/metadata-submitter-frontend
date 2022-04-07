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
    width: "30rem",
  },
  [theme.breakpoints.between("sm", "md")]: {
    backgroundPosition: "85% 0",
    width: "70rem",
  },
  [theme.breakpoints.between("md", "lg")]: {
    backgroundPosition: "90% 0",
    width: "80rem",
  },
  [theme.breakpoints.up("lg")]: {
    backgroundPosition: "90% 0",
    width: "90rem",
  },
  height: "55vh",
  margin: "15rem auto auto auto",
  padding: "12rem 0 12rem 8rem",
  borderRadius: "0.375rem",
  boxShadow: "0.2rem 0.2rem 1.2rem 0.2rem #00000029",
}))

const LoginButton = styled(Button)(() => ({
  marginTop: "3.6rem",
  height: "5rem",
  width: "17rem",
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
        <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
          SD Submit
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: "3.6rem", color: "secondary.main" }}>
          Tool for submitting metadata.
        </Typography>
        <LoginButton variant="contained" color="primary" href={loginRoute} data-testid="login-button">
          Login
        </LoginButton>
      </LoginBanner>
      <Footer container justifyContent="center">
        <FooterItem item xs={12} md={4}>
          <Typography variant="subtitle2" fontWeight="700">
            CSC - IT Center for Science Ltd.
          </Typography>
          <Typography variant="body2">P.O. Box 405 FI-02101 Espoo, Finland</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhoneIcon color="secondary" fontSize="medium" />
            <Typography variant="body2" component="span">
              +358 9 457 2001
            </Typography>
          </Box>
        </FooterItem>
        <FooterItem item xs={12} md={4}>
          <Typography variant="subtitle2" fontWeight="700">
            Service Desk
          </Typography>
          <Typography variant="body2">Open Monday to Friday from 8.30 a.m. to 4 p.m.</Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PhoneIcon color="secondary" fontSize="small" />
            <Typography variant="h6" component="span">
              +358 9 457 2821
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
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
