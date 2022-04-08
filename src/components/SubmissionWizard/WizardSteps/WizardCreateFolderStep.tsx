import React, { RefObject } from "react"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import MuiTextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { makeStyles } from "@mui/styles"
import { useForm, Controller } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"

import UserDraftTemplates from "components/Home/UserDraftTemplates"
import transformTemplatesToDrafts from "components/SubmissionWizard/WizardHooks/WizardTransformTemplatesToDrafts"
import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"

import { resetTemplateAccessionIds } from "features/templateAccessionIdsSlice"
import { createSubmissionFolder, updateSubmissionFolder } from "features/wizardSubmissionFolderSlice"

import { useAppSelector, useAppDispatch } from "hooks"
import type { FolderDataFromForm, CreateFolderFormRef } from "types"
import { pathWithLocale } from "utils"

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiTextField-root": {
      margin: 1,
    },
    padding: 2,
  },
  accordion: {
    "&.MuiAccordion-root": {
      "&:before": {
        display: "none",
        border: "none",
      },
      marginTop: "1rem",
    },
    "&.MuiPaper-elevation1": {
      boxShadow: "none",
    },
    width: "100%",
  },
  accordionSummary: {
    width: "20%",
    margin: "0 auto",
    borderRadius: "0.375rem",
    border: "1px solid #bdbdbd",
    marginBottom: "1rem",
  },
  accordionDetails: {
    width: "70%",
    margin: "0 auto",
    borderRadius: "0.375rem",
    boxShadow: "0 0.1875rem 0.375rem rgba(0, 0, 0, 0.16)",
  },
}))

/**
 * Define React Hook Form for adding new folder. Ref is added to RHF so submission can be triggered outside this component.
 */
const CreateFolderForm = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(state => state.projectId)
  const folder = useAppSelector(state => state.submissionFolder)
  const templates = useAppSelector(state => state.templates)
  const templateAccessionIds = useAppSelector(state => state.templateAccessionIds)

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const navigate = useNavigate()

  const onSubmit = async (data: FolderDataFromForm) => {
    // Transform the format of templates to drafts with proper values to be added to current folder or new folder
    const selectedDraftsArray =
      templates && folder?.folderId
        ? await transformTemplatesToDrafts(templateAccessionIds, templates, folder.folderId, dispatch)
        : []

    if (folder && folder?.folderId) {
      dispatch(updateSubmissionFolder(folder.folderId, Object.assign({ ...data, folder, selectedDraftsArray })))
        .then(() => {
          navigate({ pathname: pathWithLocale(`submission/${folder.folderId}`), search: "step=1" })
          dispatch(resetTemplateAccessionIds())
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    } else {
      // Create a new folder with selected templates as drafts

      dispatch(createSubmissionFolder(projectId, data, selectedDraftsArray))
        .then(response => {
          const folderId = response.data.folderId
          navigate({ pathname: pathWithLocale(`submission/${folderId}`), search: "step=1" })
          dispatch(resetTemplateAccessionIds())
        })
        .catch((error: string) => {
          dispatch(updateStatus({ status: ResponseStatus.error, response: JSON.parse(error) }))
        })
    }
  }

  return (
    <React.Fragment>
      <form
        className={classes.root}
        onSubmit={handleSubmit(async data => onSubmit(data as FolderDataFromForm))}
        ref={createFolderFormRef as RefObject<HTMLFormElement>}
      >
        <Controller
          control={control}
          name="name"
          defaultValue={folder ? folder.name : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Folder Name *"
              variant="outlined"
              fullWidth
              error={!!error}
              helperText={error ? "Please give a name for folder." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "folderName" }}
            />
          )}
          rules={{ required: true, validate: { name: value => value.length > 0 } }}
        />
        <Controller
          control={control}
          name="description"
          defaultValue={folder ? folder.description : ""}
          render={({ field, fieldState: { error } }) => (
            <MuiTextField
              {...field}
              label="Folder Description *"
              variant="outlined"
              fullWidth
              multiline
              rows={5}
              error={!!error}
              helperText={error ? "Please give a description for folder." : null}
              disabled={isSubmitting}
              inputProps={{ "data-testid": "folderDescription" }}
            />
          )}
          rules={{ required: true, validate: { description: value => value.length > 0 } }}
        />
      </form>
      <Accordion className={classes.accordion} TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary
          className={classes.accordionSummary}
          expandIcon={<ExpandMoreIcon />}
          aria-controls="user-drafts-content"
          id="user-drafts-header"
          data-testid="toggle-user-drafts"
        >
          <Typography align="center" variant="subtitle1">
            Saved Draft Templates
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <UserDraftTemplates />
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  )
}

/**
 * Show form to create folder as first step of new draft wizard
 */

const WizardCreateFolderStep = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => (
  <>
    <WizardHeader headerText="Create submission" />
    <WizardStepper createFolderFormRef={createFolderFormRef} />
    <CreateFolderForm createFolderFormRef={createFolderFormRef} />
  </>
)

export default WizardCreateFolderStep
