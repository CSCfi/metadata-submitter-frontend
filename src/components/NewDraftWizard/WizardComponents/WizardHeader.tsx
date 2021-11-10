import React from "react"

import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"

const useStyles = makeStyles(theme => ({
  paperTitle: {
    fontWeight: "bold",
    color: "#FFF",
    width: "100%",
    padding: theme.spacing(3),
    backgroundColor: theme.palette.primary.light,
  },
}))

type DraftHeaderProps = {
  headerText: string
}

/**
 * Render header component for wizards.
 */
const WizardHeader: React.FC<any> = ({ headerText }: DraftHeaderProps) => {
  const classes = useStyles()
  return (
    <Typography component="h1" variant="h6" align="center" className={classes.paperTitle}>
      {headerText}
    </Typography>
  )
}

export default WizardHeader
