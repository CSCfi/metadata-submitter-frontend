import React, { useState } from "react"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { Typography } from "@mui/material"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { TransitionGroup } from "react-transition-group"

import WizardAlert from "./WizardAlert"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setFocus } from "features/focusSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject, setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import draftAPIService from "services/draftAPI"
import objectAPIService from "services/objectAPI"
import { ObjectInsideSubmissionWithTags } from "types"
import { pathWithLocale } from "utils"

const StatusBadge = (props: { draft: boolean }) => {
  const { draft } = props
  const statusLabel = draft ? "Draft" : "Ready"

  return (
    <Typography
      align="center"
      sx={theme => ({
        fontWeight: "bold",
        fontSize: "1.4rem",
        border: `1px solid`,
        borderRadius: theme.spacing(0.4),
        padding: theme.spacing(0.1, 0),
        width: theme.spacing(7.3),
        backgroundColor: draft ? theme.palette.secondary.lightest : theme.palette.success.lightest,
        color: draft ? theme.palette.secondary.main : theme.palette.success.main,
      })}
    >
      {statusLabel}
    </Typography>
  )
}

const ActionButton = (props: { step: number; parent: string; buttonText: string; disabled: boolean }) => {
  const { step, parent, buttonText, disabled } = props
  const navigate = useNavigate()
  const submission = useAppSelector(state => state.submission)
  const formState = useAppSelector(state => state.submissionType)
  const draftStatus = useAppSelector(state => state.draftStatus)
  const dispatch = useAppDispatch()
  const [alert, setAlert] = useState(false)

  const unsavedSubmission = formState.trim().length > 0 && draftStatus === "notSaved"
  const pathname = pathWithLocale(submission.submissionId ? `submission/${submission.submissionId}` : `submission`)

  const handleClick = () => {
    if (unsavedSubmission) {
      setAlert(true)
    } else {
      handleNavigation()
    }
  }

  const handleNavigation = () => {
    dispatch(resetDraftStatus())
    dispatch(resetObjectType())
    dispatch(resetCurrentObject())
    dispatch(updateStep({ step: step, objectType: parent }))
    dispatch(setFocus())
    const stepParam = `step=${step}`
    switch (parent) {
      case "submissionDetails": {
        navigate({ pathname: pathname, search: stepParam })
        break
      }
      case "datasubmission": {
        navigate({ pathname: pathname, search: stepParam })
        break
      }
      case "publish": {
        navigate({ pathname: pathname, search: stepParam })
        break
      }
      default: {
        navigate({ pathname: pathname, search: stepParam })
        dispatch(setSubmissionType(ObjectSubmissionTypes.form))
        dispatch(setObjectType(parent))
      }
    }
  }

  const handleAlert = (navigate: boolean) => {
    setAlert(false)
    if (navigate) {
      handleNavigation()
    }
  }

  return (
    <React.Fragment>
      <Button
        role="button"
        disabled={disabled}
        variant="contained"
        onClick={() => handleClick()}
        sx={theme => ({ marginTop: theme.spacing(2.4) })}
      >
        {buttonText}
      </Button>
      {alert && (
        <WizardAlert onAlert={handleAlert} parentLocation="submission" alertType={ObjectSubmissionTypes.form} />
      )}
    </React.Fragment>
  )
}

/*
 * Render items belonging to step.
 * Step can host for example submission details and ready & draft objects.
 */
const StepItems = (props: {
  step: number
  objects: { id: string; displayTitle: string; objectData?: ObjectInsideSubmissionWithTags }[]
  draft: boolean
  submissionId: string
  objectType: string
}) => {
  const { step, objects, draft, submissionId, objectType } = props
  const dispatch = useAppDispatch()
  const formState = useAppSelector(state => state.submissionType)
  const draftStatus = useAppSelector(state => state.draftStatus)
  const navigate = useNavigate()
  const pathname = pathWithLocale(`submission/${submissionId}`)
  const [alert, setAlert] = useState(false)
  const [clickedItem, setClickedItem] = useState({ objectData: { accessionId: "", schema: "", tags: {} } })
  const unsavedSubmission = formState.trim().length > 0 && draftStatus === "notSaved"

  const handleClick = item => {
    setClickedItem(item)
    if (unsavedSubmission) {
      setAlert(true)
    } else {
      handleItemEdit(item)
    }
  }

  const handleItemEdit = formObject => {
    dispatch(updateStep({ step: step, objectType: objectType }))

    const editFormObject = async (item: ObjectInsideSubmissionWithTags) => {
      const service = draft ? draftAPIService : objectAPIService

      const response = await service.getObjectByAccessionId(objectType, item.accessionId)

      if (response.ok) {
        dispatch(setSubmissionType(ObjectSubmissionTypes.form))
        dispatch(setObjectType(objectType))
        dispatch(resetCurrentObject())
        dispatch(
          setCurrentObject({
            ...response.data,
            status: draft ? ObjectStatus.draft : ObjectStatus.submitted,
            ...(!draft && { tags: item.tags }),
            ...(!draft && { index: objects.findIndex(object => object.id === item.accessionId) }),
          })
        )
        dispatch(setFocus())
        navigate({ pathname: pathname, search: "step=2" })
      } else {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: response,
            helperText: `Error while fetching${draft && "draft"} object`,
          })
        )
      }
    }

    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: "step=1" })
        break
      }
      default: {
        editFormObject(formObject.objectData)
      }
    }
  }

  const handleAlert = (navigate: boolean) => {
    setAlert(false)
    if (navigate) {
      handleItemEdit(clickedItem)
    }
  }

  const ObjectItem = styled("div")(({ theme }) => ({
    paddingTop: theme.spacing(3),
  }))

  return (
    <React.Fragment>
      <TransitionGroup component={null}>
        {objects.map(item => {
          return (
            <Collapse component={"li"} key={item.id}>
              <ObjectItem>
                <Grid container spacing={2} justifyContent="space-around">
                  <Grid item xs={6}>
                    <Link
                      tabIndex={0} // "href with # target will cause Firefox to refresh the page"
                      onClick={() => handleClick(item)}
                      data-testid={`${draft ? "draft" : "submitted"}-${objectType}-list-item`}
                      aria-label={`Edit ${draft ? "draft" : "submitted"} ${objectType} object`}
                      sx={theme => ({
                        fontWeight: "300",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        cursor: "pointer",
                        color: theme.palette.primary.main,
                      })}
                    >
                      {item.displayTitle !== "" ? item.displayTitle : item.id}
                    </Link>
                  </Grid>
                  <Grid item>
                    <StatusBadge draft={draft} />
                  </Grid>
                </Grid>
              </ObjectItem>
            </Collapse>
          )
        })}
      </TransitionGroup>
      {alert && (
        <WizardAlert onAlert={handleAlert} parentLocation="submission" alertType={ObjectSubmissionTypes.form} />
      )}
    </React.Fragment>
  )
}

type stepItemObject = { id: string; displayTitle: string; objectData?: ObjectInsideSubmissionWithTags }

const ObjectWrapper = styled("div")(({ theme }) => {
  const treeBorder = `1px solid ${theme.palette.primary.main}`
  return {
    padding: theme.spacing(2.4),
    width: "100%",
    "&.activeObject": {
      backgroundColor: theme.palette.primary.light,
    },
    "& .stepItemHeader": {
      display: "flex",
      fontWeight: "bold",
    },
    "& .tree": {
      listStyle: "none",
      marginTop: theme.spacing(0.5),
      padding: 0,
      "& ul": {
        marginLeft: theme.spacing(1),
      },
      "& li": {
        position: "relative",
        marginLeft: theme.spacing(1),
        paddingLeft: theme.spacing(3),
        borderLeft: treeBorder,
      },
      "& li:last-of-type": {
        borderLeft: "none !important",
      },
      "& li:before": {
        position: "absolute",
        left: 0,
        width: theme.spacing(2),
        height: theme.spacing(4.25),
        verticalAlign: "top",
        borderBottom: treeBorder,
        content: "''",
      },
      "& li:last-of-type:before": {
        borderLeft: treeBorder,
      },
    },
  }
})

const WizardStep = (params: {
  step: number
  stepItems: {
    objectType: string
    label: string
    objects?: { ready?: stepItemObject[]; drafts?: stepItemObject[] }
  }[]
  actionButtonText: string
}) => {
  const { step, stepItems, actionButtonText } = params
  const submission = useAppSelector(state => state.submission)
  const currentStepObject = useAppSelector(state => state.stepObject)
  const singleObjectStepItems = [ObjectTypes.study]

  return (
    <React.Fragment>
      {stepItems.map((item, index) => {
        const objectType = item.objectType
        const label = item.label
        const objects = item.objects
        const isActive = currentStepObject.stepObjectType === objectType
        const hasObjects = !!(objects?.ready?.length || objects?.drafts?.length)

        return (
          <List key={objectType} disablePadding data-testid={`${objectType}-details`}>
            <ListItem divider={index !== stepItems?.length - 1} disableGutters disablePadding>
              <ObjectWrapper className={isActive ? "activeObject" : ""}>
                <div className="stepItemHeader">
                  {isActive && <ChevronRightIcon fontSize="large" />}
                  {label}
                </div>

                {objects && (
                  <ul className="tree" data-testid={`${objectType}-objects-list`}>
                    {objects.ready && (
                      <StepItems
                        step={step}
                        objects={objects.ready}
                        draft={false}
                        submissionId={submission.submissionId}
                        objectType={objectType}
                      />
                    )}
                    {objects.drafts && (
                      <StepItems
                        step={step}
                        objects={objects.drafts}
                        draft={true}
                        submissionId={submission.submissionId}
                        objectType={objectType}
                      />
                    )}
                  </ul>
                )}

                <ActionButton
                  step={step}
                  parent={step === 1 ? "submissionDetails" : objectType}
                  buttonText={
                    actionButtonText === "Add"
                      ? `Add ${objectType === ObjectTypes.dac ? "DAC" : objectType}`
                      : actionButtonText
                  }
                  disabled={hasObjects && singleObjectStepItems.indexOf(objectType) > -1}
                />
              </ObjectWrapper>
            </ListItem>
          </List>
        )
      })}
    </React.Fragment>
  )
}

export default WizardStep
