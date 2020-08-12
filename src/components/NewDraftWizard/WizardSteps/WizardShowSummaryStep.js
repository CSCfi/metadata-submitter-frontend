//@flow
import React from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import type { ElementRef } from "react"
import { Formik } from "formik"
import { useSelector } from "react-redux"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"

const useStyles = makeStyles(theme => ({
  summary: {
    padding: theme.spacing(1),
    width: "30vw",
  },
  schemaTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    paddingTop: theme.spacing(1),
    "& .objectAmount": {
      marginRight: theme.spacing(1),
      fontWeight: "bold",
    },
  },
  objectListItems: {
    border: "solid 1px #ccc",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    alignItems: "flex-start",
  },
}))

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = ({ nextButtonRef }: nextButtonRefProp) => {
  const folder = useSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  const groupedObjects = ["Study", "Sample", "Experiment", "Run", "Analysis", "DAC", "Policy"].map(schema => {
    return { [schema]: metadataObjects.filter(object => object.schema.toLowerCase() === schema.toLowerCase()) }
  })
  const classes = useStyles()
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper nextButtonRef={nextButtonRef} />
      <WizardHeader headerText="Summary" />
      <div className={classes.summary}>
        {groupedObjects.map(group => {
          const schema = Object.keys(group)[0]
          return (
            <div key={schema}>
              <div className={classes.schemaTitleRow}>
                <Typography variant="subtitle1" fontWeight="fontWeightBold">
                  {schema}
                </Typography>
                <div className="objectAmount">{group[schema].length}</div>
              </div>
              <div>
                {group[schema].map(metadataObject => (
                  <ListItem button key={metadataObject.accessionId} dense className={classes.objectListItems}>
                    <ListItemText primary={metadataObject.accessionId} />
                  </ListItem>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default WizardShowSummaryStep
