import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

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

const Login: React.FC = () => {
  const { t } = useTranslation()

  let loginRoute = "/aai"
  if (import.meta.env.NODE_ENV === "development") {
    loginRoute = "http://localhost:5430/aai"
  }

  return (
    <LoginContainer disableGutters maxWidth={false}>
      <LoginBanner elevation={0}>
        <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>
          {t("serviceTitle")}
        </Typography>
        <div style={{ width: "60%" }}>
          <Typography variant="subtitle1" sx={{ mt: "3.6rem" }}>
            {t("serviceIntro")}
          </Typography>
        </div>
        <LoginButton
          variant="contained"
          color="primary"
          href={loginRoute}
          data-testid="login-button"
        >
          {t("login")}
        </LoginButton>
      </LoginBanner>
    </LoginContainer>
  )
}

export default Login
