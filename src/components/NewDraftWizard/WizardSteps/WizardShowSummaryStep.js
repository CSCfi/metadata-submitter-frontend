//@flow
import React from "react"

import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useSelector } from "react-redux"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"

const useStyles = makeStyles(theme => ({
  summary: {
    padding: theme.spacing(1),
    width: theme.spacing(100),
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

type Schema = "Study" | "Sample" | "Experiment" | "Run" | "Analysis" | "DAC" | "Policy"

type GroupedBySchema = {| [Schema]: string[] |}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = () => {
  const folder = useSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  const groupedObjects: Array<GroupedBySchema> = [
    "Study",
    "Sample",
    "Experiment",
    "Run",
    "Analysis",
    "DAC",
    "Policy",
  ].map((schema: string) => {
    return {
      [(schema: string)]: metadataObjects
        .filter(object => object.schema.toLowerCase() === schema.toLowerCase())
        .map(object => object.accessionId),
    }
  })
  const classes = useStyles()
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper />
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
                {group[schema].map(accessionId => (
                  <ListItem button key={accessionId} dense className={classes.objectListItems}>
                    <ListItemText primary={accessionId} />
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
