//@flow
import React from "react"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles({
  paperTitle: {
    fontWeight: "bold",
  },
})

type DraftHeaderProps = {
  headerText: string,
}

/**
 * Render header component for wizards.
 * @param headerText: Text to render inside heading tag
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
