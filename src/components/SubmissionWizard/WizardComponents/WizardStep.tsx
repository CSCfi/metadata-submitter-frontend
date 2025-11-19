import React, { useState } from "react"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { styled } from "@mui/material/styles"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { TransitionGroup } from "react-transition-group"

import editObjectHook from "../WizardHooks/WizardEditObjectHook"

import WizardAlert from "./WizardAlert"
import WizardObjectStatusBadge from "./WizardObjectStatusBadge"

import { SDObjectTypes, ExtraObjectTypes } from "constants/wizardObject"
import { setFocus } from "features/focusSlice"
import { resetUnsavedForm } from "features/unsavedFormSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import type { HandlerRef, StepObject } from "types"
import { hasMetadata, pathWithLocale } from "utils"

const ActionButton = (props: {
  step: number
  parent: string
  buttonText?: string
  disabled: boolean
  ref?: HandlerRef
}) => {
  const { step, parent, buttonText, disabled, ref } = props

  const navigate = useNavigate()
  const submission = useAppSelector(state => state.submission)
  const unsavedForm = useAppSelector(state => state.unsavedForm)
  const dispatch = useAppDispatch()
  const [alert, setAlert] = useState(false)

  const pathname = pathWithLocale(
    submission.submissionId ? `submission/${submission.submissionId}` : `submission`
  )

  const handleClick = () => {
    if (unsavedForm) {
      setAlert(true)
    } else {
      // no data to lose, navigate
      handleNavigation()
    }
  }

  const handleNavigation = () => {
    dispatch(resetUnsavedForm())
    dispatch(resetObjectType())
    dispatch(resetCurrentObject())
    dispatch(updateStep({ step: step, objectType: parent }))
    dispatch(setFocus())

    const stepParam = `step=${step}`
    navigate({ pathname: pathname, search: stepParam })
    dispatch(setObjectType(parent))
    // resets only hook-form
    if (ref?.current) ref.current?.dispatchEvent(new Event("reset", { bubbles: true }))
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
        data-testid={`${buttonText} ${parent}`}
      >
        {buttonText}
      </Button>
      {alert && <WizardAlert onAlert={handleAlert} parentLocation="submission" alertType="exit" />}
    </React.Fragment>
  )
}

/*
 * Render items belonging to step.
 * Step can host for example submission details and its objects.
 */
const StepItems = (props: {
  step: number
  objectType: string
  objects: StepObject[]
  submissionId?: string
}) => {
  const { step, objects, submissionId, objectType } = props
  const dispatch = useAppDispatch()
  const unsavedForm = useAppSelector(state => state.unsavedForm)
  const navigate = useNavigate()
  const [alert, setAlert] = useState(false)
  const [clickedItem, setClickedItem] = useState({})
  const { t } = useTranslation()

  const handleClick = (item: StepObject) => {
    setClickedItem(item)
    if (unsavedForm) {
      setAlert(true)
    } else {
      handleItemEdit(item)
    }
  }

  const handleItemEdit = formObject => {
    dispatch(updateStep({ step, objectType }))

    if (!submissionId) return

    // objects belong to ExtraObjectTypes and SDObjectTypes don't need to be fetched from backend
    const isNotFetchableTypes = SDObjectTypes[objectType] || ExtraObjectTypes[objectType]

    if (isNotFetchableTypes) {
      dispatch(resetCurrentObject())
      dispatch(setObjectType(objectType))
      navigate({
        pathname: pathWithLocale(`submission/${submissionId}`),
        search: `step=${step}`,
      })
      return
    }
    editObjectHook(objectType, formObject, step, submissionId, dispatch, navigate)
  }

  const handleAlert = (navigate: boolean) => {
    setAlert(false)
    if (navigate) {
      handleItemEdit(clickedItem)
    }
  }

  const ObjectItem = styled("div")(({ theme }) => ({
    paddingTop: theme.spacing(2.5),
  }))

  return (
    <React.Fragment>
      <TransitionGroup component={null}>
        {objects.map(item => {
          return (
            <Collapse component={"li"} key={item.id}>
              <ObjectItem>
                <Grid container justifyContent="space-between">
                  <Grid display="flex" alignItems="center" size={{ xs: 6 }}>
                    <Link
                      tabIndex={0}
                      onClick={() => handleClick(item)}
                      data-testid={`${objectType}-list-item`}
                      aria-label={t("ariaLabels.editObject")}
                      sx={theme => ({
                        fontWeight: "300",
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        cursor: "pointer",
                        color: theme.palette.primary.main,
                      })}
                    >
                      {item.displayTitle}
                    </Link>
                  </Grid>
                  <Grid>
                    <WizardObjectStatusBadge />
                  </Grid>
                </Grid>
              </ObjectItem>
            </Collapse>
          )
        })}
      </TransitionGroup>
      {alert && <WizardAlert onAlert={handleAlert} parentLocation="submission" alertType="exit" />}
    </React.Fragment>
  )
}

const ObjectWrapper = styled("div")(({ theme }) => {
  const treeBorder = `1px solid ${theme.palette.primary.main}`
  return {
    padding: theme.spacing(2.4),
    width: "100%",
    "&.activeObject": {
      backgroundColor: theme.palette.primary.mediumLight,
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

type WizardStepProps = {
  step: number
  schemas: {
    objectType: string
    name: string
    required?: boolean
    allowMultipleObjects?: boolean
    objects: StepObject[]
  }[]
  ref?: HandlerRef
}

/*
 * Render a single step inside WizardStepper in the Accordion
 */
const WizardStep = (props: WizardStepProps) => {
  const { step, schemas, ref } = props

  const submission = useAppSelector(state => state.submission)
  const currentStepObject = useAppSelector(state => state.stepObject)
  const { t } = useTranslation()

  return (
    <React.Fragment>
      {schemas.map((item, index) => {
        const { objectType, name, objects, allowMultipleObjects } = item
        const isActive = currentStepObject.stepObjectType === objectType
        // Define buttonText based on objectType
        const viewTypes = new Set([SDObjectTypes.linkBucket, SDObjectTypes.summary])
        const editTypes = new Set([
          SDObjectTypes.publishSubmission,
          ExtraObjectTypes.submissionDetails,
        ])
        const buttonText = viewTypes.has(objectType as SDObjectTypes)
          ? t("view")
          : editTypes.has(objectType as SDObjectTypes) || hasMetadata(submission.metadata)
            ? t("edit")
            : t("add")

        return (
          <List key={objectType} disablePadding data-testid={`${objectType}-details`}>
            <ListItem divider={index !== schemas?.length - 1} disableGutters disablePadding>
              <ObjectWrapper className={isActive ? "activeObject" : ""}>
                <div className="stepItemHeader">
                  {isActive && <ChevronRightIcon fontSize="large" />}
                  {name}
                </div>

                {objects && (
                  <ul className="tree" data-testid={`${objectType}-objects-list`}>
                    {objects && (
                      <StepItems
                        step={step}
                        objects={objects}
                        submissionId={submission.submissionId}
                        objectType={objectType}
                      />
                    )}
                  </ul>
                )}

                <ActionButton
                  step={step}
                  parent={objectType}
                  buttonText={buttonText}
                  disabled={!!objects?.length && !allowMultipleObjects}
                  ref={ref}
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
