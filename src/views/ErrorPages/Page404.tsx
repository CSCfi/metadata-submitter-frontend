import React from "react"

import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import ErrorPageContainer from "components/ErrorPageContainer"

const Page404: React.FC = () => {
  const errorLocation = useLocation()
  const searchParams = errorLocation.search!== "" ? errorLocation.search : ""
  const pathname: string = errorLocation.pathname === "/error404" ? "" : "'" + errorLocation.pathname + searchParams + "'"

  const { t } = useTranslation()

    return (
      <ErrorPageContainer title={t("errorPages.page404.errorTitle")} errorType="warning">
        {t("errorPages.page404.errorText", {path: pathname})}
      </ErrorPageContainer>
    )
}

export default Page404
