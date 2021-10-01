//@flow
import React, { useState } from "react"

import Accordion from "@material-ui/core/Accordion"
import AccordionDetails from "@material-ui/core/AccordionDetails"
import AccordionSummary from "@material-ui/core/AccordionSummary"
import { makeStyles } from "@material-ui/core/styles"
import MuiTextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
// import { omit } from "lodash"
import { useForm, Controller } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import WizardStatusMessageHandler from "../WizardForms/WizardStatusMessageHandler"
// import saveDraftHook from "../WizardHooks/WizardSaveDraftHook"

import UserDraftTemplates from "components/Home/UserDraftTemplates"
// import { OmitObjectValues } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { createNewDraftFolder, updateNewDraftFolder } from "features/wizardSubmissionFolderSlice"
import draftAPIService from "services/draftAPI"
import templateAPIService from "services/templateAPI"
import type { FolderDataFromForm, CreateFolderFormRef } from "types"
import { getOrigObjectType, getObjectDisplayTitle } from "utils"

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
  const user = useSelector(state => state.user)
  const templateAccessionIds = useSelector(state => state.templateAccessionIds)
  const [connError, setConnError] = useState(false)
  const [responseError, setResponseError] = useState({})
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm()

  const history = useHistory()

  const onSubmit = async (data: FolderDataFromForm) => {
    setConnError(false)
    if (folder && folder?.folderId) {
      dispatch(updateNewDraftFolder(folder.folderId, Object.assign({ ...data, folder })))
        .then(() => history.push({ pathname: "/newdraft", search: "step=1" }))
        .catch(() => setConnError(true))
    } else {
      const userTemplates = user.templates.map(template => ({
        ...template,
        schema: getOrigObjectType(template.schema),
      }))

      const templateDetails = userTemplates?.filter(item => templateAccessionIds.includes(item.accessionId))

      let draftsArray = []
      for (let i = 0; i < templateDetails.length; i += 1) {
        try {
          // Get full details of template
          const templateResponse = await templateAPIService.getTemplateByAccessionId(
            templateDetails[i].schema,
            templateDetails[i].accessionId
          )
          // Create a draft based on the selected template
          const draftResponse = await draftAPIService.createFromJSON(templateDetails[i].schema, templateResponse.data)

          // Draft details to be added when creating a new folder
          const draftDetails = {
            accessionId: draftResponse.data.accessionId,
            schema: "draft-" + templateDetails[i].schema,
            tags: { displayTitle: getObjectDisplayTitle(templateDetails[i].schema, templateResponse.data) },
          }
          draftsArray.push(draftDetails)
        } catch (err) {
          dispatch(
            updateStatus({
              successStatus: WizardStatus.err,
              response: err,
              errorPrefix: "Error fetching the template(s)",
            })
          )
        }
      }
      // Create a new folder with selected templates as drafts
      dispatch(createNewDraftFolder(data, draftsArray))
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
