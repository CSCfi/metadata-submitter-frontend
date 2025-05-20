import React from "react"

import { Button, Typography, styled } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router"

import ErrorPageContainer from "components/ErrorPageContainer"

const StyledButton = styled(Button)(() => ({
  marginTop: "3.6rem",
  height: "5rem",
  minWidth: "18rem",
}))

const Page404: React.FC = () => {
  const navigate = useNavigate()
  const errorLocation = useLocation()
  const searchParams = errorLocation.search !== "" ? errorLocation.search : ""
  const pathname: string =
    errorLocation.pathname === "/error404" ? "" : "'" + errorLocation.pathname + searchParams + "'"

  const { t } = useTranslation()

  return (
    <ErrorPageContainer title={t("errorPages.page404.errorTitle")}>
      <Typography variant="body1" data-testid="404text">
        {t("errorPages.page404.errorText", { path: pathname })}
      </Typography>
      <StyledButton variant="contained" onClick={() => navigate(-1)} color="primary" size="large">
        {t("errorPages.page404.erroGoBack")}
      </StyledButton>
    </ErrorPageContainer>
  )
}

export default Page404
