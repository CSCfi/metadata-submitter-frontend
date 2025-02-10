import React, { useState, useEffect } from "react"

import { Button } from "@mui/material"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { Navigate } from "react-router"

import { GetCountdownTime } from "./ErrorPagesHelper"

import ErrorPageContainer from "components/ErrorPageContainer"

const StyledButton = styled(Button)(() => ({
  marginTop: "3.6rem",
  height: "5rem",
  width: "18rem",
}))

const Page401: React.FC = () => {
  const [redirect, setRedirect] = useState(false)

  const { t } = useTranslation()

  const countdownTime = GetCountdownTime(10, 1000)

  useEffect(() => {
    if (countdownTime === 0) {
      setRedirect(true)
    }
  }, [countdownTime])

  return redirect ? (
    <Navigate to="/" />
  ) : (
    <ErrorPageContainer title={t("errorPages.page401.errorTitle")} >
      <Typography variant="body1" paragraph={true} data-testid="401text">
        {t("errorPages.page401.errorText")}
      </Typography>
      <Typography variant="body1">{t("errorPages.page401.countDown", {countdownTime})}</Typography>
      <StyledButton variant="contained" href="/" color="primary" size="large">
        {t("errorPages.page401.buttonText")}
      </StyledButton>
    </ErrorPageContainer>
  )
}

export default Page401
