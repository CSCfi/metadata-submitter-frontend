import React from "react"

import Box from "@mui/material/Box"
import CardHeader from "@mui/material/CardHeader"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction"
import ListItemText from "@mui/material/ListItemText"
import { styled } from "@mui/system"

import WizardSavedObjectActions from "./WizardSavedObjectActions"

import { ObjectSubmissionTypes } from "constants/wizardObject"
import { useAppSelector } from "hooks"
import type { ObjectInsideSubmissionWithTags } from "types"
import { getItemPrimaryText, formatDisplayObjectType } from "utils"

const ObjectList = styled("div")({
  flex: "auto",
})

/**
 * List objects by submission type. Enables deletion of objects
 */

type WizardSavedObjectsListProps = { objects: Array<ObjectInsideSubmissionWithTags> }

const WizardSavedObjectsList = ({ objects }: WizardSavedObjectsListProps) => {
  const objectType = useAppSelector(state => state.objectType)

  // filter submissionTypes that exist in current submissions & sort them according to alphabetical order
  const submissionTypes = objects
    .map(obj => (obj.tags.submissionType ? obj.tags.submissionType : ""))
    .filter((val, ind, arr) => arr.indexOf(val) === ind)
    .sort()

  // group submissions according to their submissionType
  const groupedSubmissions =
    submissionTypes.length > 0 &&
    submissionTypes.map(submissionType => ({
      submissionType,
      items: objects.filter(obj => obj.tags.submissionType && obj.tags.submissionType === submissionType),
    }))

  const draftObjects = [
    {
      submissionType: "Draft",
      items: objects.filter(object => object.schema.includes("draft-")),
    },
  ]

  const draftList = !!draftObjects[0].items.length
  const listItems = draftList ? draftObjects : groupedSubmissions

  const displaySubmissionType = (submission: {
    submissionType: string
    items: Array<ObjectInsideSubmissionWithTags>
  }) => {
    switch (submission.submissionType) {
      case ObjectSubmissionTypes.form:
        return submission.items.length >= 2 ? "Forms" : "Form"
      case ObjectSubmissionTypes.xml:
        return submission.items.length >= 2 ? "XML files" : "XML file"
      default:
        return submission.items.length >= 2 ? "drafts" : "draft"
    }
  }

  return (
    <ObjectList>
      {listItems &&
        listItems.map(group => (
          <Box pt={0} key={group.submissionType}>
            <CardHeader
              sx={theme => {
                return draftList
                  ? { ...theme.wizard.cardHeader, backgroundColor: theme.palette.secondary.dark }
                  : { ...theme.wizard.cardHeader }
              }}
              title={`${draftList ? "" : "Submitted "}${formatDisplayObjectType(objectType)} ${displaySubmissionType(
                group
              )}`}
              titleTypographyProps={{ variant: "inherit" }}
            />
            <List aria-label={group.submissionType} data-testid={`${group.submissionType}-objects`}>
              {group.items.map(item => (
                <ListItem sx={theme => ({ ...theme.wizard.objectListItem })} key={item.accessionId}>
                  <ListItemText
                    sx={{
                      display: "inline-block",
                      maxWidth: "50%",
                      "& span, & p": {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                    primary={getItemPrimaryText(item)}
                    secondary={item.accessionId}
                    data-schema={item.schema}
                  />
                  <ListItemSecondaryAction>
                    <WizardSavedObjectActions
                      submissions={objects}
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
    </ObjectList>
  )
}

export default WizardSavedObjectsList
