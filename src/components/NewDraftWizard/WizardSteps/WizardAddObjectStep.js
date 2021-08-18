//@flow
import React from "react"

import CircularProgress from "@material-ui/core/CircularProgress"
import Grid from "@material-ui/core/Grid"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardObjectIndex from "../WizardComponents/WizardObjectIndex"
import WizardSavedObjectsList from "../WizardComponents/WizardSavedObjectsList"
import WizardStepper from "../WizardComponents/WizardStepper"

const useStyles = makeStyles(theme => ({
  gridContainer: {
    width: "100%",
    "& > :first-child": {
      paddingLeft: 0,
    },
    "& > :last-child": {
      paddingRight: 0,
    },
  },
  formBox: {
    display: "flex",
    justifyContent: "center",
  },
  objectList: {
    width: "40%",
  },
  objectInfo: {
    margin: theme.spacing(2),
  },
}))

/**
 * Show selection for object and submission types and correct form based on users choice.
 */
const WizardAddObjectStep = (): React$Element<any> => {
  const classes = useStyles()
  const objectType = useSelector(state => state.objectType)
  const folder = useSelector(state => state.submissionFolder)
  const submissions = folder?.metadataObjects?.filter(obj => obj.schema === objectType)
  const draftObjects = folder?.drafts?.filter(obj => obj.schema === `draft-${objectType}`)
  const loading = useSelector(state => state.loading)

  return (
    <>
      <WizardHeader headerText="Create Submission" />
      <WizardStepper />

      <Grid container spacing={2} className={classes.gridContainer}>
        <Grid item>
          <WizardObjectIndex />
        </Grid>
        <Grid item xs={7}>
          <div className={classes.formBox}>
            {objectType === "" ? (
              <div className={classes.objectInfo}>
                <p>Add objects by clicking the name, then fill form or upload XML File.</p>
                <p>You can also add objects and edit them after saving your draft.</p>
              </div>
            ) : (
              <WizardAddObjectCard />
            )}
          </div>
        </Grid>

        <Grid item xs>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              {submissions?.length > 0 && <WizardSavedObjectsList objects={submissions} />}
            </Grid>
            <Grid item xs={12}>
              {draftObjects?.length > 0 && <WizardSavedObjectsList objects={draftObjects} />}
            </Grid>
          </Grid>
          {loading && (
            <Grid container justify="center">
              <CircularProgress />
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  )
}

export default WizardAddObjectStep
