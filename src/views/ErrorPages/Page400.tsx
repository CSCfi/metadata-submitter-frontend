import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page400: React.FC = () => {
  const { t } = useTranslation()

  return (
    <ErrorPageContainer title={t("errorPages.page400.errorTitle")}>
      <Typography variant="body1" data-testid="400text">
        {t("errorPages.page400.errorText")}
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page400
