//@flow
import React from "react"
import { useSelector } from "react-redux"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSteps from "../WizardComponents/WizardSteps"
import ObjectIndex from "../../ObjectIndex"
import ObjectAdd from "../../ObjectAdd"
import { makeStyles } from "@material-ui/core/styles"

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

const WizardAddObjectStep = () => {
  const classes = useStyles()
  const { objectType } = useSelector(state => state.objectType)
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardSteps />
      <div className={classes.formRow}>
        <ObjectIndex />
        <div className={classes.formBox}>
          {objectType === "" ? (
            <div className={classes.objectInfo}>
              <p>
                Add objects by clicking the name, then fill form or upload XML
                File.
              </p>
              <p>
                You can also add objects and edit them after saving your draft.
              </p>
            </div>
          ) : (
            <ObjectAdd />
          )}
        </div>
      </div>
    </>
  )
}

export default WizardAddObjectStep
