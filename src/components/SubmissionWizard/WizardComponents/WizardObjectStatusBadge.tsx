import React from "react"

import { Typography } from "@mui/material"
import { useTranslation } from "react-i18next"

const WizardObjectStatusBadge = (props: { draft: boolean }) => {
  const { t } = useTranslation()
  const { draft } = props
  const statusLabel = draft ? t("draft") : t("ready")

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
        backgroundColor: draft ? theme.palette.warning.light : theme.palette.success.light,
        color: draft ? theme.palette.warning.dark : theme.palette.success.dark,
      })}
    >
      {statusLabel}
    </Typography>
  )
}

export default WizardObjectStatusBadge
