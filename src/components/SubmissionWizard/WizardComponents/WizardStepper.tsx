import React, { useEffect, useState } from "react"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useLocation } from "react-router"

import WizardStep from "./WizardStep"

import { resetObjectTypesArray } from "features/objectTypesArraySlice"
import { resetWizardMappedSteps } from "features/wizardMappedStepsSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { resetStepObject, updateStep } from "features/wizardStepObjectSlice"
import { resetWorkflowType } from "features/workflowTypeSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import type { HandlerRef } from "types"

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
    backgroundColor: theme.palette.secondary.light,
    opacity: 1,
    color: theme.palette.secondary.main,
  },
  "&.Mui-disabled .MuiSvgIcon-root": {
    color: theme.palette.secondary.main,
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

const WizardStepper = ({ ref }: { ref?: HandlerRef }) => {
  const objectType = useAppSelector(state => state.objectType)
  const currentStepObject = useAppSelector(state => state.stepObject)
  const mappedSteps = useAppSelector(state => state.wizardMappedSteps)

  const dispatch = useAppDispatch()

  const location = useLocation()

  // Set step on initialization based on query paramater in url
  // Steps with single step item (dataset details, data bucket & summary) should have only step item as active item
  useEffect(() => {
    if (location.search.includes("step")) {
      const stepInUrl = Number(location.search.split("step=")[1].slice(0, 1))
      const currentStep = mappedSteps[stepInUrl - 1]

      if (currentStep?.schemas?.length) {
        dispatch(
          updateStep({
            step: Number(stepInUrl),
            objectType: objectType ? objectType : currentStep.schemas[0]?.objectType,
          })
        )

        dispatch(setObjectType(objectType ? objectType : currentStep.schemas[0]?.objectType))
      }
    }
  }, [mappedSteps.length, location.search])

  // Reset object type, workflow, and mappedSteps' states on component destroy
  useEffect(
    () => () => {
      dispatch(resetStepObject())
      dispatch(resetObjectType())
      dispatch(resetWorkflowType())
      dispatch(resetObjectTypesArray())
      dispatch(resetWizardMappedSteps())
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
            expanded={expandedPanels.includes(stepNumber)}
            onChange={() => handlePanelChange(stepNumber)}
            data-testid={`step-${stepNumber}`}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                {stepNumber}. {step.title}
              </Typography>
            </AccordionSummary>
            {step.schemas && (
              <AccordionDetails>
                <WizardStep step={stepNumber} schemas={step.schemas} ref={ref} />
              </AccordionDetails>
            )}
          </Accordion>
        )
      })}
    </AccordionWrapper>
  )
}

export default WizardStepper
