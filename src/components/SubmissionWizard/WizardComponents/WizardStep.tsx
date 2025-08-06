import React, { useState } from "react"

import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { TransitionGroup } from "react-transition-group"

import editObjectHook from "../WizardHooks/WizardEditObjectHook"

import WizardAlert from "./WizardAlert"
import WizardObjectStatusBadge from "./WizardObjectStatusBadge"

import { ObjectTypes } from "constants/wizardObject"
import { setFocus } from "features/focusSlice"
import { resetCurrentObject, setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import type { DoiFormDetails, HandlerRef, StepObject } from "types"
import { hasDoiInfo, pathWithLocale } from "utils"

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
  const dispatch = useAppDispatch()
  const [alert, setAlert] = useState(false)

  const pathname = pathWithLocale(
    submission.submissionId ? `submission/${submission.submissionId}` : `submission`
  )

  const handleClick = () => {
    handleNavigation()
  }

  const handleNavigation = () => {
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
      case "publish": {
        navigate({ pathname: pathname, search: stepParam })
        break
      }
      default: {
        navigate({ pathname: pathname, search: stepParam })
        dispatch(setObjectType(parent))
        if (ref?.current) ref.current?.dispatchEvent(new Event("reset", { bubbles: true }))
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
      <Grid
        container
        alignItems="center"
        style={{
          marginTop: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "inline-block", marginRight: 8 }}>
          {" "}
          <Button
            role="button"
            disabled={disabled}
            variant="contained"
            onClick={() => handleClick()}
            style={{ height: 40 }}
            form="hook-form"
            type="reset"
            data-testid={`${buttonText} ${parent}`}
          >
            {buttonText}
          </Button>
        </div>
      </Grid>
      {alert && (
        <WizardAlert
          onAlert={handleAlert}
          parentLocation="submission"
          alertType={ObjectSubmissionTypes.form}
        />
      )}
    </React.Fragment>
  )
}

/*
 * Render items belonging to step.
 * Step can host for example submission details and its objects.
 */
const StepItems = (props: {
  step: number
  objects: StepObject[]
  submissionId: string
  doiInfo?: (Record<string, unknown> & DoiFormDetails) | undefined
  objectType: string
}) => {
  const { step, objects, submissionId, doiInfo, objectType } = props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(false)
  const [clickedItem, setClickedItem] = useState({})
  const { t } = useTranslation()

  const handleClick = (item: StepObject) => {
    setClickedItem(item)
    handleItemEdit(item)
  }

  const handleItemEdit = formObject => {
    dispatch(updateStep({ step: step, objectType: objectType }))

    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({
          pathname: pathWithLocale(`submission/${submissionId}`),
          search: "step=1",
        })
        break
      }
      case 5: {
        dispatch(resetCurrentObject())
        dispatch(setCurrentObject(doiInfo))
        navigate({
          pathname: pathWithLocale(`submission/${submissionId}`),
          search: "step=5",
        })
        dispatch(setObjectType(objectType))
        break
      }
      default: {
        if (objectType === ObjectTypes.dacPolicies) {
          dispatch(resetCurrentObject())
          navigate({ pathname: pathWithLocale(`submission/${submissionId}`), search: "step=2" })
          dispatch(setObjectType(objectType))
        } else {
          editObjectHook(objectType, formObject, step, submissionId, dispatch, navigate)
        }
        break
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
                      tabIndex={0} // "href with # target will cause Firefox to refresh the page"
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
                    <WizardObjectStatusBadge status={draft ? "draft" : "ready"} />
                  </Grid>
                </Grid>
              </ObjectItem>
            </Collapse>
          )
        })}
      </TransitionGroup>
      {alert && <WizardAlert onAlert={handleAlert} parentLocation="submission" />}
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
      "& .stepItemHeader": {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(1),
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
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const getLinkedFolderName = (): string => {
    return submission.linkedFolder || "Datafolder"
  }

  return (
    <React.Fragment>
      {schemas.map((item, index) => {
        const { objectType, name, objects, allowMultipleObjects } = item
        const isActive = currentStepObject.stepObjectType === objectType
        const buttonText =
          step === 1
            ? t("edit")
            : objectType === ObjectTypes.file || objectType === "Summary"
              ? t("view")
              : objectType === t("summaryPage.publish") || hasDoiInfo(submission.doiInfo)
                ? t("edit")
                : t("add")

        return (
          <List key={objectType} disablePadding data-testid={`${objectType}-details`}>
            <ListItem divider={index !== schemas?.length - 1} disableGutters disablePadding>
              <ObjectWrapper className={isActive ? "activeObject" : ""}>
                <div className="stepItemHeader">
                  {isActive && <ChevronRightIcon fontSize="large" />}
                  <Typography component="span">{name}</Typography>
                </div>

                {/* Add Datafolder link structure like other steps */}
                {objectType === ObjectTypes.file && submission.filesStatus === "linked" && (
                  <ul className="tree">
                    <li>
                      <div style={{ paddingTop: "20px" }}>
                        <Grid container justifyContent="space-between">
                          <Grid display="flex" alignItems="center" size={{ xs: 6 }}>
                            <Link
                              tabIndex={0}
                              onClick={() => {
                                dispatch(updateStep({ step: step, objectType: objectType }))
                                navigate({
                                  pathname: pathWithLocale(`submission/${submission.submissionId}`),
                                  search: `step=${step}`,
                                })
                                dispatch(setSubmissionType(ObjectSubmissionTypes.form))
                                dispatch(setObjectType(objectType))
                              }}
                              data-testid={`linked-${objectType}-list-item`}
                              aria-label={`View ${objectType} step`}
                              sx={theme => ({
                                fontWeight: "300",
                                textDecoration: "underline",
                                wordBreak: "break-all",
                                cursor: "pointer",
                                color: theme.palette.primary.main,
                              })}
                            >
                              {getLinkedFolderName()}
                            </Link>
                          </Grid>
                          <Grid>
                            <WizardObjectStatusBadge status="linked" />
                          </Grid>
                        </Grid>
                      </div>
                    </li>
                  </ul>
                )}

                {objects && (
                  <ul className="tree" data-testid={`${objectType}-objects-list`}>
                    {objects && (
                      <StepItems
                        step={step}
                        objects={objects}
                        submissionId={submission.submissionId}
                        doiInfo={submission.doiInfo}
                        objectType={objectType}
                      />
                    )}
                  </ul>
                )}

                <ActionButton
                  step={step}
                  parent={step === 1 ? "submissionDetails" : objectType}
                  buttonText={buttonText}
                  disabled={!!objects.length && !allowMultipleObjects}
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
