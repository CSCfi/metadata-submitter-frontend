import React, { useEffect, useState } from "react"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion"
import MuiAccordionDetails from "@mui/material/AccordionDetails"
import MuiAccordionSummary, { AccordionSummaryProps } from "@mui/material/AccordionSummary"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useLocation } from "react-router-dom"

import WizardStep from "./WizardStep"

import { DisplayObjectTypes, ObjectTypes } from "constants/wizardObject"
import { updateAccordionItems } from "features/wizardAccordionObjects"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { resetStepObject, updateStep } from "features/wizardStepObjectSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import { Schema } from "types"

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
  const objectsArray = useAppSelector(state => state.objectTypesArray)
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

  // Group objects by schema and status of the object
  const groupedObjects = objectsArray
    .map((schema: Schema) => {
      const mapItem = item => ({ id: item.accessionId, displayTitle: item.tags.displayTitle, objectData: { ...item } })
      return {
        [schema]: {
          drafts: folder.drafts
            .filter((object: { schema: string }) => object.schema.toLowerCase() === `draft-${schema.toLowerCase()}`)
            .map(item => mapItem(item)),
          ready: folder.metadataObjects
            .filter((object: { schema: string }) => object.schema.toLowerCase() === schema.toLowerCase())
            .map(item => mapItem(item)),
        },
      }
    })
    .reduce((map, obj) => {
      const key = Object.keys(obj)[0]
      map[key] = obj[key]
      return map
    }, {})

  // Test if object type has ready or draft objects
  const allStepItemsReady = (objectTypes: string[]) => {
    const foundObjects: string[] = []

    objectTypes.forEach(type => {
      if (groupedObjects[type]?.drafts.length || groupedObjects[type]?.ready.length) {
        foundObjects.push(type)
      }
    })

    return foundObjects.length === objectTypes.length
  }

  /*
   * List of accordion steps and configurations.
   * Steps are disabled by checking if previous step has been filled.
   * First step is always enabled.
   */
  const accordionSteps = [
    {
      label: "Submission details",
      stepItems: [
        {
          objectType: "submissionDetails",
          label: "Name your submission",
          objects: {
            ready: folder.folderId ? [{ id: folder.folderId, displayTitle: folder.name }] : [],
          },
        },
      ],
      actionButtonText: "Edit",
    },
    {
      label: "Study, DAC and policy",
      stepItems: [
        {
          objectType: ObjectTypes.study,
          label: DisplayObjectTypes[ObjectTypes.study],
          objects: groupedObjects[ObjectTypes.study],
        },
        {
          objectType: ObjectTypes.dac,
          label: DisplayObjectTypes[ObjectTypes.dac],
          objects: groupedObjects[ObjectTypes.dac],
        },
        {
          objectType: ObjectTypes.policy,
          label: DisplayObjectTypes[ObjectTypes.policy],
          objects: groupedObjects[ObjectTypes.policy],
        },
      ],
      actionButtonText: "Add",
      disabled: folder.folderId === "",
    },
    {
      label: "Datafolder",
      stepItems: [
        {
          objectType: "datafolder",
          label: "Datafolder",
        },
      ],
      actionButtonText: "Link datafolder",
      disabled: !allStepItemsReady([ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy]), // Placeholder rule until feature is ready
    },
    {
      label: "Describe",
      stepItems: [
        {
          objectType: ObjectTypes.sample,
          label: DisplayObjectTypes[ObjectTypes.sample],
          objects: groupedObjects[ObjectTypes.sample],
        },
        {
          objectType: ObjectTypes.experiment,
          label: DisplayObjectTypes[ObjectTypes.experiment],
          objects: groupedObjects[ObjectTypes.experiment],
        },
        {
          objectType: ObjectTypes.run,
          label: DisplayObjectTypes[ObjectTypes.run],
          objects: groupedObjects[ObjectTypes.run],
        },
        {
          objectType: ObjectTypes.analysis,
          label: DisplayObjectTypes[ObjectTypes.analysis],
          objects: groupedObjects[ObjectTypes.analysis],
        },
        {
          objectType: ObjectTypes.dataset,
          label: DisplayObjectTypes[ObjectTypes.dataset],
          objects: groupedObjects[ObjectTypes.dataset],
        },
      ],
      actionButtonText: "Add",
      disabled: !allStepItemsReady([ObjectTypes.study, ObjectTypes.dac, ObjectTypes.policy]),
    },
    {
      label: "Identifier and publish",
      stepItems: [
        {
          objectType: "summary",
          label: "Summary",
        },
      ],
      actionButtonText: "View summary",
      disabled: !allStepItemsReady([
        ObjectTypes.sample,
        ObjectTypes.run,
        ObjectTypes.experiment,
        ObjectTypes.dataset,
        ObjectTypes.analysis,
      ]),
    },
  ]

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

  // Update accordion to state
  useEffect(() => {
    dispatch(updateAccordionItems(accordionSteps))
  }, [accordionSteps])

  return (
    <AccordionWrapper data-testid="wizard-stepper">
      {accordionSteps.map((step, index) => {
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
            <AccordionDetails>
              <WizardStep step={stepNumber} stepItems={step.stepItems} actionButtonText={step.actionButtonText} />
            </AccordionDetails>
          </Accordion>
        )
      })}
    </AccordionWrapper>
  )
}

export default WizardStepper
