import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page401: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const { t } = useTranslation()

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const ButtonToMainPage = (
    <Button href="/" color="primary" size="large">
      Main Page
    </Button>
  )

  return redirect ? (
    <Navigate to="/" />
  ) : (
    <ErrorPageContainer title={t("errorPages.page401.errorTitle")} errorType="warning">
      <Typography variant="body2" paragraph={true} data-testid="401text">
        {t("errorPages.page401.errorText")}
      </Typography>
      <Typography variant="body2">{t("errorPages.page401.countDown", {countdownTime})}</Typography>
      {ButtonToMainPage}
    </ErrorPageContainer>
  )
}

export default Page401
