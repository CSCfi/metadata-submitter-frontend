import React, { useEffect, useState } from "react"

import { AppBar, Toolbar } from '@mui/material'
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
//import Dialog from "@mui/material/Dialog"
//import DialogActions from "@mui/material/DialogActions"
//import DialogContent from "@mui/material/DialogContent"
//import DialogContentText from "@mui/material/DialogContentText"
//import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

//import WizardAlert from "../WizardComponents/WizardAlert"
import WizardObjectStatusBadge from "../WizardComponents/WizardObjectStatusBadge"
// import WizardDOIForm from "../WizardForms/WizardDOIForm"
import editObjectHook from "../WizardHooks/WizardEditObjectHook"
import WizardMapObjectsToStepHook from "../WizardHooks/WizardMapObjectsToStepsHook"
// import saveDraftsAsTemplates from "../WizardHooks/WizardSaveTemplatesHook"

// import { ResponseStatus } from "constants/responseStatus"
import { DisplayObjectTypes } from "constants/wizardObject"
// import { resetAutocompleteField } from "features/autocompleteSlice"
// import { resetFileTypes } from "features/fileTypesSlice"
// import { setOpenedDoiForm } from "features/openedDoiFormSlice"
// import { updateStatus } from "features/statusMessageSlice"
// import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
// import { publishSubmissionContent, resetSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import workflowAPIService from "services/workflowAPI"
// import type { ObjectInsideSubmissionWithTags, Workflow } from "types"
import type { Workflow } from "types"
import { pathWithLocale } from "utils"

const SummaryBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.common.white,
  borderTop: `1rem solid ${theme.palette.primary.lightest}`,
  borderBottom: `0.5rem solid ${theme.palette.primary.lightest}`,
  marginBottom: "2rem",
}))

const StepContainer = styled(Container)(({ theme }) => {
  const itemBorder = `1px solid ${theme.palette.secondary.lightest}`
  return {
    "& .MuiGrid-container": { border: itemBorder, borderBottom: 0 },
    "& .MuiGrid-container:last-child": { borderBottom: itemBorder },
    "& ul:first-of-type p:first-of-type": { paddingTop: "0 !important" },
  }
})

const SummaryItem = styled(Grid)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5, 2),
  "& .MuiGrid-item": { padding: theme.spacing(0, 1), alignSelf: "center" },
}))

const DraftHelperGridItem = styled(Grid)(({ theme }) => ({
  flexGrow: "2 !important",
  color: theme.palette.secondary.main,
}))

// const ButtonContainer = styled("div")(({ theme }) => ({
//   marginTop: theme.spacing(3),
//   display: "flex",
//   width: "100%",
//   justifyContent: "space-between",
// }))

///**
// * Show summary of objects added to submission
// */
const WizardShowSummaryStep: React.FC = () => {
  const submission = useAppSelector(state => state.submission)
  const workflowType = useAppSelector(state => state.workflowType)
  //const openedDoiForm = useAppSelector(state => state.openedDoiForm)
  //const projectId = useAppSelector(state => state.projectId)
  const objectTypesArray = useAppSelector(state => state.objectTypesArray)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  //const [dialogOpen, setDialogOpen] = useState(false)

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

  // const DOIDialog = () => (
  //   <Dialog
  //     maxWidth="md"
  //     fullWidth
  //     open={openedDoiForm}
  //     onClose={() => dispatch(setOpenedDoiForm(false))}
  //     aria-labelledby="doi-dialog-title"
  //     aria-describedby="doi-dialog-description"
  //   >
  //     <DialogTitle id="doi-dialog-title">DOI information</DialogTitle>
  //     <DialogContent>
  //       <DialogContentText id="doi-dialog-description" data-testid="doi-dialog-content">
  //         Please fill in and save the information if you would like your submission to have DOI.
  //       </DialogContentText>
  //       <WizardDOIForm formId="doi-form" />
  //     </DialogContent>
  //     <DialogActions>
  //       <Button variant="contained" onClick={handleCancelDoiDialog} color="secondary">
  //         Cancel
  //       </Button>
  //       <Button variant="contained" color="primary" type="submit" form="doi-form">
  //         Save DOI info
  //       </Button>
  //     </DialogActions>
  //   </Dialog>
  // )
  // const handleCancelDoiDialog = () => {
  //   dispatch(setOpenedDoiForm(false))
  //   dispatch(resetAutocompleteField())
  //   dispatch(resetCurrentObject())
  // }
  // const handleOpenDoiDialog = () => {
  //   dispatch(setOpenedDoiForm(true))
  //   dispatch(setCurrentObject(submission.doiInfo))
  // }
  // const handlePublishDialog = async (
  //   alertWizard: boolean,
  //   formData?: Array<ObjectInsideSubmissionWithTags>
  // ) => {
  //   const resetDispatch = () => {
  //     navigate(pathWithLocale("home"))
  //     dispatch(resetObjectType())
  //     dispatch(resetSubmission())
  //   }
  //   if (alertWizard) {
  //     if (formData && formData?.length > 0) {
  //       await saveDraftsAsTemplates(projectId, formData, dispatch)
  //     }
  //     // Publish the submission
  //     dispatch(publishSubmissionContent(submission))
  //       .then(() => resetDispatch())
  //       .catch(error => {
  //         dispatch(
  //           updateStatus({
  //             status: ResponseStatus.error,
  //             response: error,
  //             helperText: `Couldn't publish submission with id ${submission.submissionId}`,
  //           })
  //         )
  //       })
  //     dispatch(resetFileTypes())
  //   } else {
  //     setDialogOpen(false)
  //   }
  //   setDialogOpen(false)
  // }

  useEffect(() => {
    WizardMapObjectsToStepHook(submission, objectTypesArray, currentWorkflow, t)
  })

  const handleEdit = (draft, objectType, item, step, objects) => {
    dispatch(updateStep({ step: step, objectType: objectType }))
    const folderId = submission.submissionId
    switch (step) {
      case 1: {
        dispatch(resetObjectType())
        navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=1" })
        break
      }
      default: {
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
  // Display other steps than last (summary)

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

  const summarySteps = mappedSteps.slice(0, mappedSteps.length - 1)

  // THIS IS A WRAPPER for monitoring scrolling to hide borderTop of publish/release bar
  // const HideAtScroll = (props: props) => {
  //   const  scrollTrigger = useScrollTrigger({ target: scrollTarget })
  // }

  return (
    <Container sx={theme => ({ pt: theme.spacing(1) })}>
      <SummaryBar  position="sticky" elevation={0}>
        <Toolbar sx={{ ml: "auto", border: "1px solid red" }}>
          <Button color="inherit" sx={{ bgcolor: theme => theme.palette.primary.main }}>
            <Typography>
              { workflowType === "SDSX" ? t("summaryPage.publish") : t("summaryPage.setReleaseDate")}
            </Typography>
          </Button>
        </Toolbar>
      </SummaryBar>
      <Typography component="h1" variant="h4" color="secondary">
        {t("summaryPage.title")}
      </Typography>
      {summarySteps.map((summaryItem, index) => {
        const step = index + 1
        return (
          <StepContainer
            key={summaryItem.title}
            disableGutters
            data-testid={`summary-step-${step}`}
            sx={theme => ({ p: theme.spacing(1, 0) })}
          >
            <Typography
              component="h2"
              variant="h5"
              color="secondary"
            >
              {step}. {summaryItem.title}
            </Typography>
            {summaryItem.schemas?.map(stepItem => {
              const objects = stepItem.objects
              if (objects) {
                const objectsList = Object.values(objects).flat()
                return (
                  <ul key={stepItem.objectType}>
                    {DisplayObjectTypes[stepItem.objectType] && (
                      <Typography
                        component="h3"
                        color="secondary"
                        sx={theme => ({ p: theme.spacing(1, 0), fontWeight: "bold" })}
                      >
                        {DisplayObjectTypes[stepItem.objectType]}
                      </Typography>
                    )}
                    {objectsList.map(item => {
                      const draft = item.objectData?.schema.includes("draft-")
                      return (
                        <SummaryItem key={item.id} container spacing={2} data-testid="summary-item">
                          <Grid item xs={3} md sx={{ flexGrow: "0 !important", paddingRight: 0 }}>
                            <WizardObjectStatusBadge draft={draft || false} />
                          </Grid>
                          <Grid item md>
                            <Typography color="secondary">{item.displayTitle}</Typography>
                          </Grid>
                          {draft && (
                            <DraftHelperGridItem item md>
                              Please mark {stepItem.objectType} as ready.
                            </DraftHelperGridItem>
                          )}
                          <Grid item xs={2} md sx={{ textAlign: "right" }}>
                            <Link
                              href="#"
                              onClick={() =>
                                handleEdit(
                                  draft,
                                  stepItem.objectType,
                                  item.objectData,
                                  step,
                                  objectsList
                                )
                              }
                            >
                              {t("edit")}
                            </Link>
                          </Grid>
                        </SummaryItem>
                      )
                    })}
                  </ul>
                )
              } else {
                return (
                  <span key={stepItem.objectType}>
                   {t("summaryPage.noAddedItems")} {step === 3 && "Datafolder feature not implemented."}
                  </span>
                )
              }
            })}
          </StepContainer>
        )
      })}
      {/* <ButtonContainer>
        <Button variant="contained" color="secondary" onClick={handleOpenDoiDialog}>
          Add DOI information (optional)
        </Button>
        <Button
          variant="contained"
          onClick={() => setDialogOpen(true)}
          data-testid="summary-publish"
        >
          Publish
        </Button>
      </ButtonContainer>
      {openedDoiForm && <DOIDialog />}
      {dialogOpen && (
        <WizardAlert
          onAlert={handlePublishDialog}
          parentLocation="footer"
          alertType={"publish"}
        ></WizardAlert>
      )} */}
    </Container>
  )
}

export default WizardShowSummaryStep
