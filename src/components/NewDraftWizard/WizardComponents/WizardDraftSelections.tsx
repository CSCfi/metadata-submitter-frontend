import React from "react"

import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import ListItemText from "@mui/material/ListItemText"
import { makeStyles, withStyles } from "@mui/styles"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import draftAPIService from "services/draftAPI"
import type { ObjectInsideFolderWithTags } from "types"
import { getItemPrimaryText, getDraftObjects, getOrigObjectType, pathWithLocale } from "utils"

const useStyles = makeStyles(theme => ({
  formComponent: {
    margin: theme.spacing(2),
    padding: 0,
    overflowY: "auto",
  },
  formControl: {
    marginBottom: theme.spacing(1),
  },
  formLabel: {
    fontWeight: "bold",
    color: theme.palette.grey[900],
    padding: theme.spacing(1),
    borderBottom: `3px solid ${theme.palette.primary.main}`,
    textTransform: "capitalize",
  },
  formControlLabel: {
    padding: 0,
    margin: theme.spacing(1, 0),
    borderBottom: `solid 1px ${theme.palette.secondary.main}`,
  },
  label: {
    margin: 0,
    padding: 0,
  },
  listItemText: {
    float: "left",
    maxWidth: "50%",
    "& span, & p": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      maxWidth: "50vw",
    },
  },
  viewButton: {
    color: theme.palette.primary.main,
    margin: theme.spacing(1.5, 0),
    float: "right",
  },
  buttonGroup: {
    marginTop: theme.spacing(2),
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "sticky",
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
    bottom: 0,
  },
}))

const FormControlLabel = withStyles({
  label: {
    width: "100%",
  },
})(MuiFormControlLabel)

const ConnectForm = ({ children }: { children: any }) => {
  const methods = useFormContext()

  return children({ ...methods })
}

type WizardDraftSelectionsProps = {
  onHandleDialog: (status: boolean, data?: Array<ObjectInsideFolderWithTags>) => void
}

const WizardDraftSelections = (props: WizardDraftSelectionsProps): any => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const folder = useAppSelector(state => state.submissionFolder)
  const objectsArray = useAppSelector(state => state.objectTypesArray)
  const navigate = useNavigate()

  const draftObjects = getDraftObjects(folder.drafts, objectsArray)

  const methods = useForm()

  const onSubmit = (data: any) => {
    const checkedBoxValues = Object.values(data).filter(data => data)

    const selectedDrafts: Array<ObjectInsideFolderWithTags> = checkedBoxValues.map(item =>
      folder.drafts.find((draft: { accessionId: string }) => draft.accessionId === item)
    )
    props.onHandleDialog(true, selectedDrafts)
  }

  const handleViewButton = async (draftSchema: string, draftId: string) => {
    const objectType = getOrigObjectType(draftSchema)
    const response = await draftAPIService.getObjectByAccessionId(objectType, draftId)

    if (response.ok) {
      dispatch(setCurrentObject({ ...response.data, status: ObjectStatus.draft }))
      dispatch(setSubmissionType(ObjectSubmissionTypes.form))
      dispatch(setObjectType(objectType))
      props.onHandleDialog(false)
      navigate({ pathname: pathWithLocale("newdraft"), search: "step=1" })
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Error fetching current draft",
        })
      )
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={classes.formComponent}>
        {draftObjects.map((draft: { [x: string]: any[] }) => {
          const schema = Object.keys(draft)[0]
          return (
            <ConnectForm key={schema}>
              {({ register }: { register: any }) => {
                return (
                  <FormControl className={classes.formControl} fullWidth>
                    <FormLabel className={classes.formLabel}>{schema}</FormLabel>
                    <FormGroup>
                      {draft[schema].map(item => {
                        const { ref, ...rest } = register(`${item.accessionId}`)
                        return (
                          <FormControlLabel
                            key={item.accessionId}
                            className={classes.formControlLabel}
                            control={
                              <Checkbox
                                color="primary"
                                name={item.accessionId}
                                value={item.accessionId}
                                {...rest}
                                inputRef={ref}
                              />
                            }
                            label={
                              <div className={classes.label}>
                                <ListItemText
                                  className={classes.listItemText}
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
                        )
                      })}
                    </FormGroup>
                  </FormControl>
                )
              }}
            </ConnectForm>
          )
        })}
        <div className={classes.buttonGroup}>
          <Button
            variant="contained"
            aria-label="Cancel publishing folder contents"
            color="secondary"
            onClick={() => props.onHandleDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            aria-label="Publish folder contents and move to frontpage"
            color="primary"
            type="submit"
            data-testid="confirm-publish-folder"
          >
            Publish
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default WizardDraftSelections
