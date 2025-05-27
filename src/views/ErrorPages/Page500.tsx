import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import ErrorPageContainer from "../../components/ErrorPageContainer"

const Page500: React.FC = () => {
  const { t } = useTranslation()

  const errorLink = "https://research.csc.fi/service-breaks"
  const linkname = t("errorPages.page500.errorLink")

  return (
    <ErrorPageContainer title={t("errorPages.page500.errorTitle")}>
      <Typography variant="body1" paragraph={true} data-testid="500text">
        {t("errorPages.page500.errorText")}
      </Typography>
      <Typography variant="body1" data-testid="500text2">
        {t("errorPages.page500.errorText2")}
        <Link href={errorLink} target="_blank">
          {linkname}
          <OpenInNewIcon />
        </Link>
        .
      </Typography>
    </ErrorPageContainer>
  )
}

export default Page500
