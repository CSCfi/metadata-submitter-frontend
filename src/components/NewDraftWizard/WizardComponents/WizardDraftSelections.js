//@flow
import React from "react"

import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import FormControl from "@material-ui/core/FormControl"
import MuiFormControlLabel from "@material-ui/core/FormControlLabel"
import FormGroup from "@material-ui/core/FormGroup"
import FormLabel from "@material-ui/core/FormLabel"
import ListItemText from "@material-ui/core/ListItemText"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"
import { useHistory } from "react-router-dom"

import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { updateStatus } from "features/wizardStatusMessageSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import draftAPIService from "services/draftAPI"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText } from "utils"

const useStyles = makeStyles(theme => ({
  formComponent: {
    margin: theme.spacing(2, 0),
    padding: 0,
  },
  formControl: { marginBottom: theme.spacing(1) },
  formLabel: {
    fontWeight: "bold",
    color: theme.palette.grey[900],
    padding: theme.spacing(1),
    borderBottom: `3px solid ${theme.palette.primary.main}`,
  },
  formControlLabel: {
    margin: 0,
    borderBottom: `solid 1px ${theme.palette.secondary.main}`,
    padding: 0,
  },
  label: {
    display: "flex",
    flexDirection: "row",
  },
  viewButton: {
    color: theme.palette.button.edit,
    margin: theme.spacing(1.5, 0),
  },
  publishButton: {
    marginTop: theme.spacing(2),
    float: "right",
  },
}))

const FormControlLabel = withStyles({
  label: {
    width: "100%",
  },
})(MuiFormControlLabel)

const ConnectForm = ({ children }) => {
  const methods = useFormContext()

  return children({ ...methods })
}

type WizardDraftSelectionsProps = {
  onHandleDialog: (boolean, data?: Array<ObjectInsideFolderWithTags>) => void,
}

const WizardDraftSelections = (props: WizardDraftSelectionsProps): React$Element<any> => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const folder = useSelector(state => state.submissionFolder)
  const objectsArray = useSelector(state => state.objectsArray)
  const history = useHistory()

  // draftObjects contains an array of objects and each has a schema and the related draft(s) array if there is any
  const draftObjects = objectsArray.flatMap((schema: string) => {
    const draftSchema = `draft-${schema}`
    const draftArray = folder.drafts.filter(draft => draft.schema.toLowerCase() === draftSchema.toLowerCase())
    return draftArray.length > 0 ? [{ [`draft-${schema}`]: draftArray }] : []
  })

  const methods = useForm()

  const onSubmit = data => {
    const checkedBoxValues = Object.values(data).filter(data => data)

    if (checkedBoxValues.length > 0) {
      const checkedDrafts: Array<ObjectInsideFolderWithTags> = checkedBoxValues.map(item =>
        folder.drafts.find(draft => draft.accessionId === item)
      )
      props.onHandleDialog(true, checkedDrafts)
    }
  }

  const handleViewButton = async (draftSchema: string, draftId: string) => {
    const objectType = draftSchema.slice(draftSchema.indexOf("-") + 1)
    const response = await draftAPIService.getObjectByAccessionId(objectType, draftId)

    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, status: ObjectStatus.draft }))
      dispatch(setSubmissionType(ObjectSubmissionTypes.form))
      props.onHandleDialog(false)
      history.push({ pathname: "/newdraft", search: "step=1" })
    } else {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Error fetching current draft",
        })
      )
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={classes.formComponent}>
        {draftObjects.map(draft => {
          const schema = Object.keys(draft)[0]
          return (
            <ConnectForm key={schema} className={classes.connectionForm}>
              {({ register }) => (
                <FormControl className={classes.formControl} fullWidth>
                  <FormLabel className={classes.formLabel}>{schema}</FormLabel>
                  <FormGroup>
                    {draft[schema].map(item => (
                      <FormControlLabel
                        key={item.accessionId}
                        className={classes.formControlLabel}
                        control={
                          <Checkbox
                            color="primary"
                            name={item.accessionId}
                            value={item.accessionId}
                            inputRef={register}
                          />
                        }
                        label={
                          <div className={classes.label}>
                            <ListItemText
                              primary={getItemPrimaryText(item)}
                              secondary={item.accessionId}
                              data-schema={item.schema}
                            />
                            <Button
                              className={classes.viewButton}
                              aria-label="View draft"
                              variant="outlined"
                              size="small"
                              onClick={() => handleViewButton(item.schema, item.accessionId)}
                            >
                              View
                            </Button>
                          </div>
                        }
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              )}
            </ConnectForm>
          )
        })}
        <Button
          className={classes.publishButton}
          variant="contained"
          aria-label="Publish folder contents and move to frontpage"
          color="primary"
          type="submit"
        >
          Publish
        </Button>
      </form>
    </FormProvider>
  )
}

export default WizardDraftSelections
