//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Divider from "@material-ui/core/Divider"
import Grid from "@material-ui/core/Grid"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import { useDispatch } from "react-redux"

import { increment } from "../../../features/wizardStepSlice"

const useStyles = makeStyles(theme => ({
  newDraftButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
  submitNewObjectRow: {
    display: "flex",
    flexDirection: "row",
  },
  submitNewObjectTip: {
    marginLeft: theme.spacing(2),
  },
}))

const NewObjectTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: theme.typography.pxToRem(14),
    boxShadow: theme.shadows[1],
  },
}))(Tooltip)

/**
 * Show selection to create new folder or add single metadata object
 */
const WizardFrontpageStep = (): React$Element<typeof Grid> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const submitObjectHelpText =
    "Objects are usually part of some folder, but if you don't yet know whether to put your object into a folder, you can submit it individually"
  return (
    <Grid container direction="row" justify="space-around" alignItems="center" spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h6" align="center">
          Create New Submission
        </Typography>
      </Grid>
      <Grid item xs={5}>
        <Button
          variant="contained"
          color="primary"
          className={classes.newDraftButton}
          disableElevation
          onClick={() => dispatch(increment())}
        >
          New folder
        </Button>
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs={5}>
        <div className={classes.submitNewObjectRow}>
          <Typography component="h2" variant="subtitle2">
            Or do you want to submit object?
          </Typography>
          <NewObjectTooltip title={submitObjectHelpText} arrow>
            <HelpOutlineIcon className={classes.submitNewObjectTip} />
          </NewObjectTooltip>
        </div>
      </Grid>
    </Grid>
  )
}

export default WizardFrontpageStep
