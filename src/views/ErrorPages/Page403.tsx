import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const StyledButton = styled(Button)(() => ({
  marginTop: "3.6rem",
  height: "5rem",
  width: "17rem",
}))

const Page403: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const { t } = useTranslation()

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  return redirect ? (
    <Navigate to="/home" />
  ) : (
    <ErrorPageContainer title= {t("errorPages.page403.errorTitle")}>
      <Typography variant="body2" paragraph={true} data-testid="403text">
        {t("errorPages.page403.errorText")}
      </Typography>
      <Typography variant="body2">{t("errorPages.page403.countDown", {countdownTime})}</Typography>
      <StyledButton variant="contained" href="/home" color="primary" size="large">
        {t("errorPages.page403.buttonText")}
      </StyledButton>
    </ErrorPageContainer>
  )
}

export default Page403
