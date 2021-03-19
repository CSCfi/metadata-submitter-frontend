//@flow
import React from "react"

import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import WizardAddObjectCard from "../WizardComponents/WizardAddObjectCard"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardObjectIndex from "../WizardComponents/WizardObjectIndex"
import WizardSavedObjectsList from "../WizardComponents/WizardSavedObjectsList"
import WizardStepper from "../WizardComponents/WizardStepper"

const useStyles = makeStyles(theme => ({
  formRow: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  },
  formBox: {
    display: "flex",
    justifyContent: "center",
    width: "60%",
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

  return (
    <>
      <WizardHeader headerText="Create Submission" />
      <WizardStepper />
      <div className={classes.formRow}>
        <WizardObjectIndex />
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
        {submissions?.length > 0 && <WizardSavedObjectsList submissions={submissions} />}
      </div>
    </>
  )
}

export default WizardAddObjectStep
