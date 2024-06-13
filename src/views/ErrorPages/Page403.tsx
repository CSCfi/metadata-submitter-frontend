import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page403: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const { t } = useTranslation()

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const ButtonToHomePage = (
    <Button href="/" color="primary" size="large">
     {t("errorPages.page403.buttonText")}
    </Button>
  )

  return redirect ? (
    <Navigate to="/home" />
  ) : (
    <ErrorPageContainer title= {t("errorPages.page403.errorTitle")} errorType="error">
      <Typography variant="body2" paragraph={true} data-testid="403text">
        {t("errorPages.page403.errorText")}
      </Typography>
      <Typography variant="body2">{t("errorPages.page403.countDown", {countdownTime})}</Typography>
      {ButtonToHomePage}
    </ErrorPageContainer>
  )
}

export default Page403
