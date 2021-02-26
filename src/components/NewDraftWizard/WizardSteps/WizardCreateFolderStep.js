//@flow
import React, { useState } from "react"

import { makeStyles } from "@material-ui/core/styles"
import MuiTextField from "@material-ui/core/TextField"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"

import { WizardStatus } from "constants/wizardStatus"
import { increment } from "features/wizardStepSlice"
import { createNewDraftFolder, updateNewDraftFolder } from "features/wizardSubmissionFolderSlice"
import type { FolderDataFromForm, CreateFolderFormRef } from "types"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
    padding: theme.spacing(2),
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
  const { register, errors, handleSubmit, formState } = useForm()
  const { isSubmitting } = formState

  const onSubmit = (data: FolderDataFromForm) => {
    setConnError(false)
    if (folder && folder?.folderId) {
      dispatch(updateNewDraftFolder(folder.folderId, Object.assign({ ...data, folder })))
        .then(() => dispatch(increment()))
        .catch(() => setConnError(true))
    } else {
      dispatch(createNewDraftFolder(data))
        .then(() => dispatch(increment()))
        .catch(error => {
          setConnError(true)
          setResponseError(JSON.parse(error))
        })
    }
  }

  return (
    <>
      <form className={classes.root} onSubmit={handleSubmit(onSubmit)} ref={createFolderFormRef}>
        <MuiTextField
          name="name"
          label="Folder Name *"
          variant="outlined"
          fullWidth
          inputRef={register({ required: true, validate: { name: value => value.length > 0 } })}
          helperText={errors.name ? "Please give a name for folder." : null}
          error={errors.name ? true : false}
          disabled={isSubmitting}
          defaultValue={folder ? folder.name : ""}
        ></MuiTextField>
        <MuiTextField
          name="description"
          label="Folder Description *"
          variant="outlined"
          fullWidth
          multiline
          rows={5}
          inputRef={register({ required: true, validate: { description: value => value.length > 0 } })}
          helperText={errors.description ? "Please give a description for folder." : null}
          error={errors.description ? true : false}
          disabled={isSubmitting}
          defaultValue={folder ? folder.description : ""}
        ></MuiTextField>
      </form>
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
    <WizardHeader headerText="Create New Folder" />
    <WizardStepper createFolderFormRef={createFolderFormRef} />
    <CreateFolderForm createFolderFormRef={createFolderFormRef} />
  </>
)

export default WizardCreateFolderStep
