import React, { useEffect, useState } from "react"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useLocation } from "react-router-dom"

import WizardMapObjectsToStepHook from "../WizardHooks/WizardMapObjectsToStepsHook"

import WizardStep from "./WizardStep"

import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetStepObject, updateStep } from "features/wizardStepObjectSlice"
import { useAppDispatch, useAppSelector } from "hooks"

// Top & bottom borders for first and last disabled elements
const AccordionWrapper = styled("div")(({ theme }) => ({
  "& > .Mui-disabled > .MuiAccordionSummary-root": {
    borderTop: `1px solid ${theme.palette.secondary.light}`,
  },
  "& .MuiAccordion-root:last-of-type > .Mui-disabled": {
    borderBottom: `1px solid ${theme.palette.secondary.light}`,
  },
}))

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
  () => ({
    "&:not(:last-child)": {
      borderBottom: 0,
    },
    "&:before": {
      display: "none",
    },
  })
)

const AccordionSummary = styled((props: AccordionSummaryProps) => <MuiAccordionSummary {...props} />)(({ theme }) => ({
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
 * If createFolderForm is passed as reference it is used to trigger correct form when clicking next.
 */

const WizardStepper = () => {
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const folder = useAppSelector(state => state.submissionFolder)
  const currentStepObject = useAppSelector(state => state.stepObject)
  const dispatch = useAppDispatch()
  const location = useLocation()

  // Set step on initialization based on query paramater in url
  useEffect(() => {
    if (location.search.includes("step")) {
      const stepInUrl = location.search.split("step=")[1].slice(0, 1)
      dispatch(updateStep({ step: Number(stepInUrl), objectType: "submissionDetails" }))
    }
  }, [])

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
      expandedPanels.includes(stepIndex) ? expandedPanels.filter(i => i !== stepIndex) : [...expandedPanels, stepIndex]
    )
  }

  // Open panel when navigating to next step and close others
  useEffect(() => {
    const change = [...expandedPanels.filter(i => i === currentStepObject.step), currentStepObject.step]
    setExpandedPanels(change)
  }, [currentStepObject.step])

  return (
    <AccordionWrapper data-testid="wizard-stepper">
      {WizardMapObjectsToStepHook(folder, objectTypesArray).map((step, index) => {
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
                {stepNumber}. {step.label}
              </Typography>
            </AccordionSummary>
            {step.stepItems && step.actionButtonText && (
              <AccordionDetails>
                <WizardStep step={stepNumber} stepItems={step.stepItems} actionButtonText={step.actionButtonText} />
              </AccordionDetails>
            )}
          </Accordion>
        )
      })}
    </AccordionWrapper>
  )
}

export default WizardStepper
