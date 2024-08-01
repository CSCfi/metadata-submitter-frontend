import React, { useEffect, useState } from "react"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"

import WizardMapObjectsToStepHook from "../WizardHooks/WizardMapObjectsToStepsHook"

import WizardStep from "./WizardStep"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetStepObject, updateStep } from "features/wizardStepObjectSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import workflowAPIService from "services/workflowAPI"
import type { FormRef, Workflow } from "types"

// Top & bottom borders for first and last disabled elements
const AccordionWrapper = styled("div")(({ theme }) => ({
  "& > .Mui-disabled > .MuiAccordionSummary-root": {
    borderTop: `1px solid ${theme.palette.secondary.light}`,
  },
  "& .MuiAccordion-root:last-of-type > .Mui-disabled": {
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
  },
}))

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(() => ({
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary {...props} />
))(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  borderBottom: `1px solid ${theme.palette.primary.light}`,
  "& .MuiTypography-root": {
    fontWeight: "bold",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "3rem",
    color: theme.palette.common.white,
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
  "&.Mui-disabled": {
    backgroundColor: theme.palette.secondary.lightest,
    opacity: 1,
    color: theme.palette.secondary.light,
  },
  "&.Mui-disabled .MuiSvgIcon-root": {
    color: theme.palette.secondary.light,
  },
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  backgroundColor: theme.palette.primary.lightest,
  color: theme.palette.primary.main,
  padding: 0,
}))

/**
 * Show info about wizard steps to user.
 * If createSubmissionForm is passed as reference it is used to trigger correct form when clicking next.
 */

const WizardStepper = ({ formRef }: { formRef?: FormRef }) => {
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const submission = useAppSelector(state => state.submission)
  const currentStepObject = useAppSelector(state => state.stepObject)
  const workflowType = useAppSelector(state => state.workflowType)

  const dispatch = useAppDispatch()

  const location = useLocation()

  const { t } = useTranslation()

  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | Record<string, unknown>>({})

  // Fetch workflow based on workflowType
  useEffect(() => {
    const getWorkflow = async () => {
      if (workflowType) {
        const response = await workflowAPIService.getWorkflowByType(workflowType)
        setCurrentWorkflow(response.data)
      }
    }
    getWorkflow()
  }, [workflowType])

  const { mappedSteps } = WizardMapObjectsToStepHook(
    submission,
    objectTypesArray,
    currentWorkflow,
    t
  )

  // Set step on initialization based on query paramater in url
  // Steps with single step item (Submission details, datafolder & summary) should have only step item as active item
  useEffect(() => {
    if (location.search.includes("step")) {
      const stepInUrl = Number(location.search.split("step=")[1].slice(0, 1))
      const currentStep = mappedSteps[stepInUrl - 1]

      if (currentStep && currentStep.schemas?.length) {
        dispatch(
          updateStep({
            step: Number(stepInUrl),
            objectType: currentStep.schemas.length > 0 ? currentStep.schemas[0].objectType : "",
          })
        )
      }
    }
  }, [mappedSteps.length])

  // Reset object type state on component destroy
  useEffect(
    () => () => {
      dispatch(resetStepObject())
      dispatch(resetObjectType())
    },
    []
  )

  const [expandedPanels, setExpandedPanels] = useState<number[]>([0]) // Open first panel on init

  const handlePanelChange = (stepIndex: number) => {
    setExpandedPanels(
      expandedPanels.includes(stepIndex)
        ? expandedPanels.filter(i => i !== stepIndex)
        : [...expandedPanels, stepIndex]
    )
  }

  // Open panel when navigating to next step and close others
  useEffect(() => {
    const change = [
      ...expandedPanels.filter(i => i === currentStepObject.step),
      currentStepObject.step,
    ]

    setExpandedPanels(change)
  }, [currentStepObject.step])

  return (
    <AccordionWrapper data-testid="wizard-stepper">
      {mappedSteps.map((step, index) => {
        const stepNumber = index + 1
        return (
          <Accordion
            key={index}
            disabled={step.disabled}
            expanded={expandedPanels.includes(stepNumber)}
            onChange={() => handlePanelChange(stepNumber)}
            data-testid={`${stepNumber}-step-${step.disabled ? "disabled" : "enabled"}`}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {stepNumber}. {step.title}
              </Typography>
            </AccordionSummary>
            {step.schemas && (
              <AccordionDetails>
                <WizardStep step={stepNumber} schemas={step.schemas} formRef={formRef} />
              </AccordionDetails>
            )}
          </Accordion>
        )
      })}
    </AccordionWrapper>
  )
}

export default WizardStepper
