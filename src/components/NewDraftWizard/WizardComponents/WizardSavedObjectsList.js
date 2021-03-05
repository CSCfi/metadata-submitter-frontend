//@flow
import React, { useEffect, useRef } from "react"

import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import WizardSavedObjectActions from "./WizardSavedObjectActions"

import { ObjectSubmissionTypes } from "constants/wizardObject"
import type { ObjectInsideFolderWithTags } from "types"

const useStyles = makeStyles(theme => ({
  objectList: {
    padding: "0 1rem",
    width: "25%",
  },
  header: {
    marginBlockEnd: "0",
  },
  objectListItems: {
    border: "none",
    borderRadius: 3,
    margin: theme.spacing(1, 0),
    boxShadow: "0px 3px 10px -5px rgba(0,0,0,0.49)",
    alignItems: "flex-start",
    padding: ".5rem",
  },
  listItemText: {
    display: "inline-block",
    maxWidth: "50%",
    "& span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  buttonEdit: {
    color: "#007bff",
  },
  buttonDelete: {
    color: "#dc3545",
  },
}))

/**
 * List objects by submission type. Enables deletion of objects
 */

type WizardSavedObjectsListProps = { submissions: Array<ObjectInsideFolderWithTags> }

const WizardSavedObjectsList = ({ submissions }: WizardSavedObjectsListProps): React$Element<any> => {
  const ref = useRef()
  useEffect(() => {
    ref.current = submissions
  })

  const classes = useStyles()
  const objectType = useSelector(state => state.objectType)

  // filter submissionTypes that exist in current submissions & sort them according to alphabetical order
  const submissionTypes = submissions
    .map(obj => obj.tags.submissionType)
    .filter((val, ind, arr) => arr.indexOf(val) === ind)
    .sort()

  // group submissions according to their submissionType
  const groupedSubmissions = submissionTypes.map(submissionType => ({
    submissionType,
    submittedItems: submissions.filter(obj => obj.tags.submissionType === submissionType),
  }))

  const displayObjectType = (objectType: string) => {
    return `${objectType.charAt(0).toUpperCase()}${objectType.slice(1)}`
  }

  const displaySubmissionType = (submission: {
    submissionType: string,
    submittedItems: Array<ObjectInsideFolderWithTags>,
  }) => {
    switch (submission.submissionType) {
      case ObjectSubmissionTypes.form:
        return submission.submittedItems.length >= 2 ? "Forms" : "Form"
      case ObjectSubmissionTypes.xml:
        return submission.submittedItems.length >= 2 ? "XML files" : "XML file"
      default:
        break
    }
  }

  return (
    <div className={classes.objectList}>
      {groupedSubmissions.map(group => (
        <List key={group.submissionType} aria-label={group.submissionType}>
          <h3 className={classes.header}>
            Submitted {displayObjectType(objectType)} {displaySubmissionType(group)}
          </h3>
          {group.submittedItems.map(item => (
            <ListItem key={item.accessionId} className={classes.objectListItems}>
              <ListItemText className={classes.listItemText} primary={item.accessionId} />
              <ListItemSecondaryAction>
                <WizardSavedObjectActions
                  submissions={submissions}
                  objectType={objectType}
                  objectId={item.accessionId}
                  submissionType={group?.submissionType}
                  tags={item.tags}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ))}
    </div>
  )
}

export default WizardSavedObjectsList
