import React, { useState, useEffect } from "react"

import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router-dom"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page403: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  const { t } = useTranslation()

  return redirect ? (
    <Navigate to="/home" />
  ) : (
    <ErrorPageContainer title= {t("errorPages.page403.errorTitle")} errorType="error">
      <Typography variant="body2" data-testid="403text"> {t("errorPages.page403.errorText")}</Typography>
      <Typography variant="body2">{t("errorPages.page401.countDown", {countdownTime})}</Typography>
    </ErrorPageContainer>
  )
}

export default Page403
