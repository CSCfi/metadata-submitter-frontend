//@flow
import React from "react"

import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"

const useStyles = makeStyles(theme => ({
  paperTitle: {
    fontWeight: "bold",
    color: "#FFF",
    width: "100%",
    padding: theme.spacing(3),
    backgroundColor: "#9b416b",
  },
}))

type DraftHeaderProps = {
  headerText: string,
}

/**
 * Render header component for wizards.
 */
const WizardHeader = ({ headerText }: DraftHeaderProps) => {
  const classes = useStyles()
  return (
    <Typography component="h1" variant="h6" align="center" className={classes.paperTitle}>
      {headerText}
    </Typography>
  )
}

export default WizardHeader
