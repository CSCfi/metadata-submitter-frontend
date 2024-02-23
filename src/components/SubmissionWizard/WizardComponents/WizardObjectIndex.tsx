import React, { useState } from "react"

import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded"
import MuiAccordion from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary from "@mui/material/AccordionSummary"
import Badge from "@mui/material/Badge"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/system"

import WizardAlert from "./WizardAlert"

import { ObjectSubmissionTypes, ObjectSubmissionsArray } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setFocus } from "features/focusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import { formatDisplayObjectType } from "utils"

const Index = styled("div")({
  alignSelf: "flex-start",
  marginBottom: 2,
  width: 300,
})

const SkipLink = styled("a")(({ theme }) => ({
  color: theme.palette.primary.main,
  "&:hover, &:focus": {
    textDecoration: "underline",
  },
}))

/*
 * Customized accordion from https://material-ui.com/components/accordion/#customized-accordions
 */
const Accordion = styled(MuiAccordion)({
  "&.MuiAccordion-root": {
    borderTop: "1px solid rgba(0, 0, 0, .125)",
    boxShadow: "none",
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
    "&:first-of-type": {
      borderTop: "none",
    },
  },
  expanded: {},
})

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  "&.MuiAccordionSummary-root": {
    height: 56,
    marginBottom: -1,
    "&$expanded": {
      minHeight: 56,
    },
  },
  "&.MuiAccordionSummary-content": {
    color: "#FFF",
    fontWeight: "bold",
    "&$expanded": {
      margin: `${theme.spacing(2)}px 0`,
    },
    "& .MuiSvgIcon-root": {
      height: "auto",
    },
    "& .MuiTypography-subtitle1": {
      alignSelf: "center",
    },
    "&:not(.MuiBadge-root) > .MuiSvgIcon-root": {
      marginRight: theme.spacing(2),
    },
  },
  expanded: {},
}))

const AccordionDetails = styled(MuiAccordionDetails)({
  "&.MuiAccordionDetails-root": {
    display: "inherit",
    padding: 0,
  },
})

const ObjectCountBadge = styled(Badge)(({ theme }) => ({
  "&.MuiBadge-badge": {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: 700,
  },
  "&.MuiBadge-anchorOriginTopRight": {
    padding: theme.spacing(0, 1),
    borderRadius: "50%",
  },
}))

type SubmissionTypeListProps = {
  handleSubmissionTypeChange: (submissionType: string) => void
  isCurrentObjectType: boolean
  currentSubmissionType: string
}

/*
 * Render list of submission types to be used in accordions
 */
const SubmissionTypeList = (props: SubmissionTypeListProps) => {
  const { handleSubmissionTypeChange, isCurrentObjectType, currentSubmissionType } = props

  const submissionTypeMap = {
    [ObjectSubmissionTypes.form]: "Fill Form",
    [ObjectSubmissionTypes.xml]: "Upload XML File",
  }

  const [showSkipLink, setSkipLinkVisible] = useState(false)
  const dispatch = useAppDispatch()

  const handleSkipLink = (event: React.SyntheticEvent, submissionType: string) => {
    if ((event as React.KeyboardEvent).key === "Enter") {
      if (submissionType === ObjectSubmissionTypes.existing) {
        setSkipLinkVisible(false)
      } else {
        setSkipLinkVisible(true)
      }
    }
  }

  const toggleFocusWithEnter = (event: React.SyntheticEvent) => {
    if ((event as React.KeyboardEvent).key === "Enter") {
      dispatch(setFocus())
    }
  }

  const skipToSubmissionLink = () => {
    let target = ""
    switch (currentSubmissionType) {
      case ObjectSubmissionTypes.form: {
        target = "form"
        break
      }
      case ObjectSubmissionTypes.xml: {
        target = "XML upload"
        break
      }
      default: {
        target = "main content"
      }
    }
    return (
      <SkipLink
        role="button"
        tabIndex={0}
        onBlur={() => setSkipLinkVisible(false)}
        onClick={() => dispatch(setFocus())}
        onKeyDown={event => toggleFocusWithEnter(event)}
      >
        Skip to {target}
      </SkipLink>
    )
  }

  return (
    <List sx={{ p: 0 }} dense>
      {ObjectSubmissionsArray.map(submissionType => (
        <ListItem
          sx={theme => ({
            bgcolor: theme.palette.secondary.main,
            "&.Mui-selected": {
              bgcolor: theme.palette.secondary.main,
              boxShadow: `inset 10px 0px 0px 0px ${theme.palette.primary.main}`,
            },
          })}
          selected={isCurrentObjectType && currentSubmissionType === submissionType}
          divider
          key={submissionType}
          button
          onClick={event => {
            handleSkipLink(event, submissionType)
            handleSubmissionTypeChange(submissionType)
          }}
        >
          <ListItemText
            primary={submissionTypeMap[submissionType]}
            primaryTypographyProps={{ variant: "subtitle1" }}
            secondary={
              showSkipLink && isCurrentObjectType && currentSubmissionType === submissionType && skipToSubmissionLink()
            }
          />
        </ListItem>
      ))}
    </List>
  )
}

/**
 * Render accordion for choosing object type and submission type
 */
const WizardObjectIndex: React.FC = () => {
  const dispatch = useAppDispatch()

  const [expandedObjectType, setExpandedObjectType] = useState<string | boolean>("")
  const [clickedSubmissionType, setClickedSubmissionType] = useState("")
  const [cancelFormOpen, setCancelFormOpen] = useState(false)

  const objectsArray = useAppSelector(state => state.objectTypesArray)
  const currentObjectType = useAppSelector(state => state.objectType)
  const currentSubmissionType = useAppSelector(state => state.submissionType)
  const draftStatus = useAppSelector(state => state.draftStatus)
  const submission = useAppSelector(state => state.submission)

  const savedObjects = submission.metadataObjects
    ?.map((draft: { schema: string }) => draft.schema)
    .reduce((acc: { [x: string]: number }, val: string | number) => ((acc[val] = (acc[val] || 0) + 1), acc), {})

  const handlePanelChange = (panel: string) => (_event: unknown, newExpanded: boolean) => {
    setExpandedObjectType(newExpanded ? panel : false)
  }

  const getSavedObjectCount = (objectType: string) => {
    return savedObjects && savedObjects[objectType] ? savedObjects[objectType] : 0
  }

  const handleSubmissionTypeChange = (submissionType: string) => {
    if (currentSubmissionType === "") {
      dispatch(setSubmissionType(submissionType))
      dispatch(setObjectType(expandedObjectType))
    } else {
      if (draftStatus === "notSaved") {
        setClickedSubmissionType(submissionType)
        setCancelFormOpen(true)
      } else {
        dispatch(resetCurrentObject())
        dispatch(resetDraftStatus())
        dispatch(setSubmissionType(submissionType))
        dispatch(setObjectType(expandedObjectType))
      }
    }
  }

  const handleCancelling = (cancel: boolean) => {
    setClickedSubmissionType("")
    setCancelFormOpen(false)
    if (cancel) {
      dispatch(resetDraftStatus())
      dispatch(setSubmissionType(clickedSubmissionType))
      dispatch(setObjectType(expandedObjectType))
      dispatch(resetCurrentObject())
    }
  }

  return (
    <Index data-testid="wizard-objects">
      {objectsArray.map((objectType: string) => {
        const typeCapitalized = formatDisplayObjectType(objectType)
        const isCurrentObjectType = objectType === currentObjectType
        return (
          <Accordion
            key={objectType}
            square
            expanded={expandedObjectType === objectType}
            onChange={handlePanelChange(objectType)}
          >
            <AccordionSummary
              sx={theme => ({
                bgcolor: isCurrentObjectType ? theme.palette.primary.main : theme.palette.grey["800"],
              })}
              aria-controls="type-content"
              id="type-header"
            >
              <Typography variant="subtitle1">{typeCapitalized}</Typography>
              {getSavedObjectCount(objectType) > 0 && (
                <Tooltip title="Submitted objects">
                  <ObjectCountBadge
                    sx={{ m: 2, zIndex: 0 }}
                    badgeContent={getSavedObjectCount(objectType)}
                    data-testid="badge"
                  >
                    <DescriptionRoundedIcon />
                  </ObjectCountBadge>
                </Tooltip>
              )}
            </AccordionSummary>
            <AccordionDetails>
              <SubmissionTypeList
                handleSubmissionTypeChange={handleSubmissionTypeChange}
                isCurrentObjectType={isCurrentObjectType}
                currentSubmissionType={currentSubmissionType}
              />
            </AccordionDetails>
          </Accordion>
        )
      })}
      {cancelFormOpen && (
        <WizardAlert
          onAlert={handleCancelling}
          parentLocation="submission"
          alertType={currentSubmissionType}
        ></WizardAlert>
      )}
    </Index>
  )
}

export default WizardObjectIndex
