import React, { useState } from "react"

import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Grid from "@mui/material/Grid"
import Link from "@mui/material/Link"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useNavigate } from "react-router-dom"

import WizardAlert from "../WizardComponents/WizardAlert"
import WizardObjectStatusBadge from "../WizardComponents/WizardObjectStatusBadge"
import WizardDOIForm from "../WizardForms/WizardDOIForm"
import editObjectHook from "../WizardHooks/WizardEditObjectHook"
import saveDraftsAsTemplates from "../WizardHooks/WizardSaveTemplatesHook"

import { ResponseStatus } from "constants/responseStatus"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { resetFileTypes } from "features/fileTypesSlice"
import { setOpenedDoiForm } from "features/openedDoiFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { resetObjectType } from "features/wizardObjectTypeSlice"
import { updateStep } from "features/wizardStepObjectSlice"
import { publishFolderContent, resetFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import type { ObjectInsideFolderWithTags } from "types"
import { pathWithLocale } from "utils"

const StepContainer = styled(Container)(({ theme }) => {
  const itemBorder = `1px solid ${theme.palette.secondary.lightest}`
  return {
    "& .MuiGrid-container": { border: itemBorder, borderBottom: 0 },
    "& ul:last-child .MuiGrid-container:last-child": { borderBottom: itemBorder },
  }
})

const SummaryItem = styled(Grid)(({ theme }) => ({
  margin: 0,
  padding: theme.spacing(1.5, 2),
  "& .MuiGrid-item": { padding: theme.spacing(0, 1), alignSelf: "center" },
}))

const ButtonContainer = styled("div")(({ theme }) => ({
  marginTop: theme.spacing(3),
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
}))

const DraftHelperGridItem = styled(Grid)(({ theme }) => ({
  flexGrow: "2 !important",
  color: theme.palette.secondary.main,
}))

/**
 * Show summary of objects added to folder
 */
const WizardShowSummaryStep: React.FC = () => {
  const folder = useAppSelector(state => state.submissionFolder)
  const accordion = useAppSelector(state => state.accordion)
  const openedDoiForm = useAppSelector(state => state.openedDoiForm)
  const projectId = useAppSelector(state => state.projectId)

  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = useState(false)

  const DOIDialog = () => (
    <Dialog
      maxWidth="md"
      fullWidth
      open={openedDoiForm}
      onClose={() => dispatch(setOpenedDoiForm(false))}
      aria-labelledby="doi-dialog-title"
      aria-describedby="doi-dialog-description"
    >
      <DialogTitle id="doi-dialog-title">DOI information</DialogTitle>
      <DialogContent>
        <DialogContentText id="doi-dialog-description" data-testid="doi-dialog-content">
          Please fill in and save the information if you would like your submission to have DOI.
        </DialogContentText>
        <WizardDOIForm formId="doi-form" />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleCancelDoiDialog} color="secondary">
          Cancel
        </Button>
        <Button variant="contained" color="primary" type="submit" form="doi-form">
          Save DOI info
        </Button>
      </DialogActions>
    </Dialog>
  )

  const handleCancelDoiDialog = () => {
    dispatch(setOpenedDoiForm(false))
    dispatch(resetAutocompleteField())
    dispatch(resetCurrentObject())
  }

  const handleOpenDoiDialog = () => {
    dispatch(setOpenedDoiForm(true))
    dispatch(setCurrentObject(folder.doiInfo))
  }

  const handlePublishDialog = async (alertWizard: boolean, formData?: Array<ObjectInsideFolderWithTags>) => {
    const resetDispatch = () => {
      navigate(pathWithLocale("home"))
      dispatch(resetObjectType())
      dispatch(resetFolder())
    }

    if (alertWizard) {
      if (formData && formData?.length > 0) {
        await saveDraftsAsTemplates(projectId, formData, dispatch)
      }
      // Publish the folder
      dispatch(publishFolderContent(folder))
        .then(() => resetDispatch())
        .catch(error => {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: `Couldn't publish folder with id ${folder.folderId}`,
            })
          )
        })
      dispatch(resetFileTypes())
    } else {
      setDialogOpen(false)
    }
    setDialogOpen(false)
  }

  // console.log(folder)
  // console.log("accordion: ", accordion.slice(0, accordion.length - 1))

  const handleEdit = (draft, objectType, item, step, objects) => {
    dispatch(updateStep({ step: step, objectType: objectType }))
    const folderId = folder.folderId

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

  return (
    <Container sx={theme => ({ pt: theme.spacing(1) })}>
      <Typography variant="h4" color="secondary">
        Summary
      </Typography>

      {accordion.slice(0, accordion.length - 1).map((summaryItem, index) => {
        const step = index + 1
        return (
          <StepContainer key={summaryItem.label} disableGutters>
            <Typography variant="h5" color="secondary" sx={theme => ({ p: theme.spacing(3, 0) })}>
              {step}. {summaryItem.label}
            </Typography>

            {summaryItem.stepItems?.map(stepItem => {
              const objects = stepItem.objects

              if (objects) {
                const objectsList = Object.values(objects).flat()

                return (
                  <ul key={stepItem.objectType}>
                    {objectsList.map(item => {
                      const draft = item.objectData?.schema.includes("draft-")
                      return (
                        <SummaryItem key={item.id} container spacing={2}>
                          <Grid item xs={3} md sx={{ flexGrow: "0 !important", paddingRight: 0 }}>
                            <WizardObjectStatusBadge draft={draft || false} />
                          </Grid>
                          <Grid item md>
                            {item.displayTitle}
                          </Grid>
                          {draft && (
                            <DraftHelperGridItem item md>
                              Please mark your {stepItem.objectType} as ready.
                            </DraftHelperGridItem>
                          )}
                          <Grid item xs={2} md sx={{ textAlign: "right" }}>
                            <Link
                              href="#"
                              onClick={() => handleEdit(draft, stepItem.objectType, item.objectData, step, objectsList)}
                            >
                              Edit
                            </Link>
                          </Grid>
                        </SummaryItem>
                      )
                    })}
                  </ul>
                )
              } else {
                return <span>No added items. {step === 3 && "Datafolder feature not implemented."}</span>
              }
            })}
          </StepContainer>
        )
      })}

      <ButtonContainer>
        <Button variant="contained" color="secondary" onClick={handleOpenDoiDialog}>
          Add DOI information (optional)
        </Button>

        <Button variant="contained" onClick={() => setDialogOpen(true)} data-testid="summary-publish">
          Publish
        </Button>
      </ButtonContainer>

      {openedDoiForm && <DOIDialog />}

      {dialogOpen && (
        <WizardAlert onAlert={handlePublishDialog} parentLocation="footer" alertType={"publish"}></WizardAlert>
      )}
    </Container>
  )
}

export default WizardShowSummaryStep
