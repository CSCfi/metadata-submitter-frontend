import React from "react"

import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500: React.FC = () => {
  const { t } = useTranslation()

  return (
    <ErrorPageContainer title={t("errorPages.page500.errorTitle")} errorType="error">
      <Typography variant="body2" data-testid="500text">
        {t("errorPages.page500.errorText")}
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page500
