//@flow
import React from "react"
import { useSelector } from "react-redux"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import ObjectIndex from "../WizardComponents/ObjectIndex"
import AddObjectCard from "../WizardComponents/AddObjectCard"
import { makeStyles } from "@material-ui/core/styles"
import type { ElementRef } from "react"
import { Formik } from "formik"

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

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Show info about object adding, render card with object adding featured if
 * objectType is set.
 */

const WizardAddObjectStep = ({ nextButtonRef }: nextButtonRefProp) => {
  const classes = useStyles()
  const objectType = useSelector(state => state.objectType)
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper nextButtonRef={nextButtonRef} />
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
