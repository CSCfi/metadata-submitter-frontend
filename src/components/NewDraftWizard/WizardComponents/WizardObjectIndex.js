//@flow
import React, { useState } from "react"

import MuiAccordion from "@material-ui/core/Accordion"
import MuiAccordionDetails from "@material-ui/core/AccordionDetails"
import MuiAccordionSummary from "@material-ui/core/AccordionSummary"
import MuiBadge from "@material-ui/core/Badge"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import DescriptionRoundedIcon from "@material-ui/icons/DescriptionRounded"
import { useDispatch, useSelector } from "react-redux"

import WizardAlert from "./WizardAlert"

import { ObjectSubmissionTypes, ObjectSubmissionsArray } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setFocus } from "features/focusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { formatDisplayObjectType } from "utils"

const useStyles = makeStyles(theme => ({
  index: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing(2),
    width: theme.spacing(30),
  },
  submissionTypeList: {
    padding: 0,
  },
  submissionTypeListItem: {
    backgroundColor: theme.palette.secondary.main,
    "&.Mui-selected": {
      backgroundColor: theme.palette.secondary.main,
      boxShadow: `inset 10px 0px 0px 0px ${theme.palette.primary.main}`,
    },
  },
  nonSelectedAccordion: {
    backgroundColor: theme.palette.grey["800"],
  },
  selectedAccordion: {
    backgroundColor: theme.palette.primary.main,
  },
  badge: {
    margin: theme.spacing(2, 2, 2, "auto"),
    zIndex: 0,
  },
  skipLink: {
    color: theme.palette.primary.main,
    "&:hover, &:focus": {
      textDecoration: "underline",
    },
  },
}))

/*
 * Customized accordion from https://material-ui.com/components/accordion/#customized-accordions
 */
const Accordion = withStyles({
  root: {
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
})(MuiAccordion)

const AccordionSummary = withStyles(theme => ({
  root: {
    height: 56,
    marginBottom: -1,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
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
}))(MuiAccordionSummary)

const AccordionDetails = withStyles({
  root: {
    display: "inherit",
    padding: 0,
  },
})(MuiAccordionDetails)

const ObjectCountBadge = withStyles(theme => ({
  badge: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontWeight: theme.typography.fontWeightBold,
  },
}))(MuiBadge)

/*
 * Render list of submission types to be used in accordions
 */
const SubmissionTypeList = ({
  handleSubmissionTypeChange,
  isCurrentObjectType,
  currentSubmissionType,
}: {
  handleSubmissionTypeChange: string => void,
  isCurrentObjectType: boolean,
  currentSubmissionType: string,
}) => {
  const submissionTypeMap = {
    [ObjectSubmissionTypes.form]: "Fill Form",
    [ObjectSubmissionTypes.xml]: "Upload XML File",
  }

  const classes = useStyles()
  const [showSkipLink, setSkipLinkVisible] = useState(false)
  const dispatch = useDispatch()

  const handleSkipLink = (event, submissionType) => {
    if (event.key === "Enter") {
      if (submissionType === ObjectSubmissionTypes.existing) {
        setSkipLinkVisible(false)
      } else {
        setSkipLinkVisible(true)
      }
    }
  }

  const toggleFocusWithEnter = event => {
    if (event.key === "Enter") {
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
      <a
        className={classes.skipLink}
        role="button"
        tabIndex="0"
        onBlur={() => setSkipLinkVisible(false)}
        onClick={() => dispatch(setFocus())}
        onKeyDown={event => toggleFocusWithEnter(event)}
      >
        Skip to {target}
      </a>
    )
  }

  return (
    <List dense className={classes.submissionTypeList}>
      {ObjectSubmissionsArray.map(submissionType => (
        <ListItem
          selected={isCurrentObjectType && currentSubmissionType === submissionType}
          divider
          key={submissionType}
          button
          onClick={event => {
            handleSkipLink(event, submissionType)
            handleSubmissionTypeChange(submissionType)
          }}
          className={classes.submissionTypeListItem}
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
const WizardObjectIndex = (): React$Element<any> => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [expandedObjectType, setExpandedObjectType] = useState("")
  const [clickedSubmissionType, setClickedSubmissionType] = useState("")
  const [cancelFormOpen, setCancelFormOpen] = useState(false)

  const objectsArray = useSelector(state => state.objectsArray)
  const currentObjectType = useSelector(state => state.objectType)
  const currentSubmissionType = useSelector(state => state.submissionType)
  const draftStatus = useSelector(state => state.draftStatus)
  const folder = useSelector(state => state.submissionFolder)

  const savedObjects = folder.metadataObjects
    ?.map(draft => draft.schema)
    .reduce((acc, val) => ((acc[val] = (acc[val] || 0) + 1), acc), {})

  const handlePanelChange = panel => (event, newExpanded) => {
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
    <div className={classes.index}>
      {objectsArray.map(objectType => {
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
              className={isCurrentObjectType ? classes.selectedAccordion : classes.nonSelectedAccordion}
              aria-controls="type-content"
              id="type-header"
            >
              <Typography variant="subtitle1">{typeCapitalized}</Typography>
              {getSavedObjectCount(objectType) > 0 && (
                <Tooltip title="Submitted objects">
                  <ObjectCountBadge
                    badgeContent={getSavedObjectCount(objectType)}
                    className={classes.badge}
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
    </div>
  )
}

export default WizardObjectIndex
