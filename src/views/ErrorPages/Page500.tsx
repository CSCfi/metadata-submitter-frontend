import React from "react"

import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500: React.FC = () => {
  const { t } = useTranslation()

  const errorLink = "#"
  const linkname = t("errorPages.page500.errorLink")

  return (
    <ErrorPageContainer title={t("errorPages.page500.errorTitle")} errorType="error">
      <Typography variant="body2" paragraph={true} data-testid="500text">
        {t("errorPages.page500.errorText")}
      </Typography>
      <Typography variant="body2" data-testid="500text2">
        {t("errorPages.page500.errorText2")}  <a href={errorLink}>{linkname}</a>.
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page500
