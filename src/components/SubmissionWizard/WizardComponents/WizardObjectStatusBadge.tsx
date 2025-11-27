import { Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

const WizardObjectStatusBadge = () => {
  const { t } = useTranslation()
  const statusLabel = t("ready")

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
        backgroundColor: theme.palette.success.light,
        color: theme.palette.success.dark,
      })}
      data-testid={`${statusLabel.toLowerCase()}-status-badge`}
    >
      {statusLabel}
    </Typography>
  )
}

export default WizardObjectStatusBadge
