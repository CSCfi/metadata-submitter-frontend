//@flow
import React from "react"

import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { useSelector } from "react-redux"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardSavedObjectActions from "../WizardComponents/WizardSavedObjectActions"
import WizardStepper from "../WizardComponents/WizardStepper"

import type { ObjectInsideFolderWithTags } from "types"

const useStyles = makeStyles(theme => ({
  summary: {
    padding: theme.spacing(1),
    width: theme.spacing(100),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
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
  listGroup: {
    padding: "0",
  },
  objectListItems: {
    border: "solid 1px #ccc",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
    alignItems: "flex-start",
  },
}))

type Schema = "study" | "schema" | "experiment" | "run" | "analysis" | "dac" | "policy" | "dataset"

type GroupedBySchema = {| [Schema]: Array<ObjectInsideFolderWithTags> |}

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep = (): React$Element<any> => {
  const folder = useSelector(state => state.submissionFolder)
  const { metadataObjects } = folder
  const objectsArray = useSelector(state => state.objectsArray)
  const groupedObjects: Array<GroupedBySchema> = objectsArray.map((schema: string) => {
    return {
      [(schema: string)]: metadataObjects.filter(object => object.schema.toLowerCase() === schema.toLowerCase()),
    }
  })

  const classes = useStyles()

  return (
    <>
      <WizardHeader headerText="Create Submission" />
      <WizardStepper />
      <WizardHeader headerText="Summary" />
      <div className={classes.summary}>
        {groupedObjects.map(group => {
          const schema = Object.keys(group)[0]
          return (
            <List key={schema} aria-label={schema} className={classes.listGroup}>
              <div className={classes.schemaTitleRow}>
                <Typography variant="subtitle1" fontWeight="fontWeightBold">
                  {schema.charAt(0).toUpperCase() + schema.substring(1)}
                </Typography>
                <div className="objectAmount">{group[schema].length}</div>
              </div>
              <div>
                {group[schema].map(item => (
                  <ListItem button key={item.accessionId} dense className={classes.objectListItems}>
                    <ListItemText primary={item.accessionId} />
                    <ListItemSecondaryAction>
                      <WizardSavedObjectActions
                        submissions={metadataObjects}
                        objectType={schema}
                        objectId={item.accessionId}
                        submissionType={item.tags?.submissionType}
                        tags={item.tags}
                        summary={true}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </div>
            </List>
          )
        })}
      </div>
    </>
  )
}

export default WizardShowSummaryStep
