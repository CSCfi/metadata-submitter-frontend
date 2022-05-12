import React, { useState } from "react"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { styled } from "@mui/material/styles"
import { useNavigate } from "react-router-dom"
import { TransitionGroup } from "react-transition-group"

import editObjectHook from "../WizardHooks/WizardEditObjectHook"

import WizardAlert from "./WizardAlert"
import WizardObjectStatusBadge from "./WizardObjectStatusBadge"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { resetDraftStatus } from "features/draftStatusSlice"
import { setFocus } from "features/focusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { ObjectInsideFolderWithTags } from "types"
import { pathWithLocale } from "utils"

const ActionButton = (props: { step: number; parent: string; buttonText: string; disabled: boolean }) => {
  const { step, parent, buttonText, disabled } = props
  const navigate = useNavigate()
  const folder = useAppSelector(state => state.submissionFolder)
  const formState = useAppSelector(state => state.submissionType)
  const draftStatus = useAppSelector(state => state.draftStatus)
  const dispatch = useAppDispatch()
  const [alert, setAlert] = useState(false)

  const unsavedSubmission = formState.trim().length > 0 && draftStatus === "notSaved"
  const pathname = pathWithLocale(folder.folderId ? `submission/${folder.folderId}` : `submission`)

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
      case "datafolder": {
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
 * Step can host for example folder details and ready & draft objects.
 */
const StepItems = (props: {
  step: number
  objects: { id: string; displayTitle: string; objectData?: ObjectInsideFolderWithTags }[]
  draft: boolean
  folderId: string
  objectType: string
}) => {
  const { step, objects, draft, folderId, objectType } = props
  const dispatch = useAppDispatch()
  const formState = useAppSelector(state => state.submissionType)
  const draftStatus = useAppSelector(state => state.draftStatus)
  const navigate = useNavigate()
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

    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=1" })
        break
      }
      default: {
        const item = formObject.objectData
        editObjectHook(
          draft,
          objectType,
          item,
          step,
          folderId,
          dispatch,
          navigate,
          objects.findIndex(object => object.id === item.accessionId)
        )
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
                    <WizardObjectStatusBadge draft={draft} />
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

type stepItemObject = { id: string; displayTitle: string; objectData?: ObjectInsideFolderWithTags }

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
  const folder = useAppSelector(state => state.submissionFolder)
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
                    {objects.drafts && (
                      <StepItems
                        step={step}
                        objects={objects.drafts}
                        draft={true}
                        folderId={folder.folderId}
                        objectType={objectType}
                      />
                    )}
                    {objects.ready && (
                      <StepItems
                        step={step}
                        objects={objects.ready}
                        draft={false}
                        folderId={folder.folderId}
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
