import { Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

import { FormStatus } from "constants/wizardObject"

const WizardObjectStatusBadge = ({ status }: { status: string }) => {
  const { t } = useTranslation()

  return (
    <Typography
      align="center"
      sx={theme => ({
        fontWeight: "bold",
        fontSize: "1.4rem",
        border: `1px solid`,
        borderRadius: theme.spacing(0.4),
        padding: theme.spacing(0.1, 0),
        width: theme.spacing(7.3),
        backgroundColor: `${status === FormStatus.missing ? theme.palette.warning.light : theme.palette.success.light}`,
        color: `${status === FormStatus.missing ? theme.palette.warning.dark : theme.palette.success.dark}`,
      })}
      data-testid={`${statusLabel.toLowerCase()}-status-badge`}
    >
      {t(`${status}`)}
    </Typography>
  )
}

export default WizardObjectStatusBadge
