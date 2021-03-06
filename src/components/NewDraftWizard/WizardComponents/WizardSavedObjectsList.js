//@flow
import React, { useEffect, useRef } from "react"

import Box from "@material-ui/core/Box"
import CardHeader from "@material-ui/core/CardHeader"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles } from "@material-ui/core/styles"
import { useSelector } from "react-redux"

import WizardSavedObjectActions from "./WizardSavedObjectActions"

import { ObjectSubmissionTypes } from "constants/wizardObject"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText } from "utils"

const useStyles = makeStyles(theme => ({
  objectList: {
    paddingLeft: theme.spacing(2),
    width: "25%",
    flex: "auto",
  },
  header: {
    marginBlockEnd: "0",
  },
  cardHeader: theme.wizard.cardHeader,
  objectListItem: theme.wizard.objectListItem,
  listItemText: {
    display: "inline-block",
    maxWidth: "50%",
    "& span, & p": {
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
    .map(obj => (obj.tags.submissionType ? obj.tags.submissionType : ""))
    .filter((val, ind, arr) => arr.indexOf(val) === ind)
    .sort()

  // group submissions according to their submissionType
  const groupedSubmissions =
    submissionTypes.length > 0 &&
    submissionTypes.map(submissionType => ({
      submissionType,
      submittedItems: submissions.filter(obj => obj.tags.submissionType && obj.tags.submissionType === submissionType),
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
        return ""
    }
  }

  return (
    <div className={classes.objectList}>
      {groupedSubmissions &&
        groupedSubmissions.map(group => (
          <Box pt={0} key={group.submissionType}>
            <CardHeader
              title={`Submitted ${displayObjectType(objectType)} ${displaySubmissionType(group)}`}
              titleTypographyProps={{ variant: "inherit" }}
              className={classes.cardHeader}
            />
            <List aria-label={group.submissionType}>
              {group.submittedItems.map(item => (
                <ListItem key={item.accessionId} className={classes.objectListItem}>
                  <ListItemText
                    className={classes.listItemText}
                    primary={getItemPrimaryText(item)}
                    secondary={item.accessionId}
                    data-schema={item.schema}
                  />
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
          </Box>
        ))}
    </div>
  )
}

export default WizardSavedObjectsList
