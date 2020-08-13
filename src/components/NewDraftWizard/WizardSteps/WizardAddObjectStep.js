//@flow
import React from "react"

import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import AddObjectCard from "../WizardComponents/AddObjectCard"
import ObjectIndex from "../WizardComponents/ObjectIndex"
import WizardHeader from "../WizardComponents/WizardHeader"
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
    width: "100%",
  },
  objectInfo: {
    margin: theme.spacing(2),
  },
}))

/**
 * Show selection for object and submission types and correct form based on users choice.
 */

const WizardAddObjectStep = () => {
  const classes = useStyles()
  const objectType = useSelector(state => state.objectType)
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper />
      <div className={classes.formRow}>
        <ObjectIndex />
        <div className={classes.formBox}>
          {objectType === "" ? (
            <div className={classes.objectInfo}>
              <p>Add objects by clicking the name, then fill form or upload XML File.</p>
              <p>You can also add objects and edit them after saving your draft.</p>
            </div>
          ) : (
            <AddObjectCard />
          )}
        </div>
      </div>
    </>
  )
}

export default WizardAddObjectStep
