//@flow
import React, { useState } from "react"

import Accordion from "@material-ui/core/Accordion"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import { makeStyles } from "@material-ui/core/styles"
import MuiTextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import { useForm, Controller } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import UserDraftTemplates from "components/Home/UserDraftTemplates"
import { WizardStatus } from "constants/wizardStatus"
import { createNewDraftFolder, updateNewDraftFolder } from "features/wizardSubmissionFolderSlice"
import type { FolderDataFromForm, CreateFolderFormRef } from "types"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
    padding: theme.spacing(2),
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
    // border: "1px solid #bdbdbd",
    boxShadow: "0 0.1875rem 0.375rem rgba(0, 0, 0, 0.16)",
  },
}))

/**
 * Define React Hook Form for adding new folder. Ref is added to RHF so submission can be triggered outside this component.
 */
const CreateFolderForm = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const folder = useSelector(state => state.submissionFolder)
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const history = useHistory()

  const onSubmit = (data: FolderDataFromForm) => {
    setConnError(false)
    if (folder && folder?.folderId) {
      dispatch(updateNewDraftFolder(folder.folderId, Object.assign({ ...data, folder })))
        .then(() => history.push({ pathname: "/newdraft", search: "step=1" }))
        .catch(() => setConnError(true))
    } else {
      dispatch(createNewDraftFolder(data))
        .then(() => history.push({ pathname: "/newdraft", search: "step=1" }))
        .catch(error => {
          setConnError(true)
          setResponseError(JSON.parse(error))
        })
    }
  }

  return (
    <>
      <form className={classes.root} onSubmit={handleSubmit(onSubmit)} ref={createFolderFormRef}>
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
        >
          <Typography align="center" variant="subtitle1">
            Saved Draft Templates
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <UserDraftTemplates />
        </AccordionDetails>
      </Accordion>
      {connError && (
        <WizardStatusMessageHandler successStatus={WizardStatus.error} response={responseError} prefixText="" />
      )}
    </>
  )
}

/**
 * Show form to create folder as first step of new draft wizard
 */

const WizardCreateFolderStep = ({
  createFolderFormRef,
}: {
  createFolderFormRef: CreateFolderFormRef,
}): React$Element<any> => (
  <>
    <WizardHeader headerText="Create Submission" />
    <WizardStepper createFolderFormRef={createFolderFormRef} />
    <CreateFolderForm createFolderFormRef={createFolderFormRef} />
  </>
)

export default WizardCreateFolderStep
