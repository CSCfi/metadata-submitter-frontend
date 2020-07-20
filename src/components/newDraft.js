import React from "react"
import { withStyles, makeStyles } from "@material-ui/core/styles"
import Paper from "@material-ui/core/Paper"
import Typography from "@material-ui/core/Typography"
import Container from "@material-ui/core/Container"
import Button from "@material-ui/core/Button"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import Tooltip from "@material-ui/core/Tooltip"

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(8),
  },
  paperTitle: {
    fontWeight: "bold",
    marginBottom: theme.spacing(8),
  },
  paperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  newDraftButton: {
    textTransform: "none",
    fontWeight: "bold",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(8),
    paddingRight: theme.spacing(8),
    marginBottom: theme.spacing(4),
  },
  submitNewObjectRow: {
    display: "inline-flex",
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

const NewDraft = () => {
  const classes = useStyles()
  const maxWidth = "md"
  const submitObjectHelpText =
    "Objects are usually part of some folder, but if you don't yet know whether to put your object into a folder, you can submit it individually"
  return (
    <Container maxWidth={maxWidth}>
      <Paper className={classes.paper}>
        <div className={classes.paperContent}>
          <Typography
            component="h1"
            variant="subtitle1"
            className={classes.paperTitle}
          >
            Create new draft
          </Typography>
          <Button
            variant="contained"
            color="primary"
            className={classes.newDraftButton}
            disableElevation
          >
            New folder
          </Button>
          <div className={classes.submitNewObjectRow}>
            <Typography
              component="h2"
              variant="subtitle1"
              className={classes.paperTitle}
            >
              Or do you want to submit object?
            </Typography>
            <NewObjectTooltip title={submitObjectHelpText} arrow>
              <HelpOutlineIcon className={classes.submitNewObjectTip} />
            </NewObjectTooltip>
          </div>
        </div>
      </Paper>
    </Container>
  )
}

export default NewDraft
