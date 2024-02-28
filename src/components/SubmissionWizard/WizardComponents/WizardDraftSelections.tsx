import React from "react"

import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import FormControl from "@mui/material/FormControl"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormLabel from "@mui/material/FormLabel"
import ListItemText from "@mui/material/ListItemText"
import { styled } from "@mui/system"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { useNavigate } from "react-router-dom"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus, ObjectSubmissionStepsList } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import draftAPIService from "services/draftAPI"
import type {
  ConnectFormChildren,
  ConnectFormMethods,
  ObjectInsideSubmissionWithTags,
  ObjectInsideSubmissionWithTagsBySchema,
} from "types"
import { getItemPrimaryText, getDraftObjects, getOrigObjectType, pathWithLocale } from "utils"

const Form = styled("form")({
  margin: 2,
  padding: 0,
  overflowY: "auto",
})

const Label = styled("div")({
  margin: 0,
  padding: 0,
})

const ButtonGroup = styled("div")(({ theme }) => ({
  marginTop: 2,
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  position: "sticky",
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  bottom: 0,
}))

const ConnectForm = ({ children }: ConnectFormChildren) => {
  const methods = useFormContext()

  return children({ ...(methods as ConnectFormMethods) })
}

type WizardDraftSelectionsProps = {
  onHandleDialog: (status: boolean, data?: Array<ObjectInsideSubmissionWithTags>) => void
}

const WizardDraftSelections = (props: WizardDraftSelectionsProps) => {
  const dispatch = useAppDispatch()
  const submission = useAppSelector(state => state.submission)
  const objectsArray = useAppSelector(state => state.objectTypesArray)
  const navigate = useNavigate()

  const draftObjects = getDraftObjects(submission.drafts, objectsArray)

  const methods = useForm()

  const onSubmit = (data: Record<string, unknown>) => {
    const checkedBoxValues = Object.values(data).filter(data => data)

    const selectedDrafts: Array<ObjectInsideSubmissionWithTags> = checkedBoxValues.map(
      item =>
        submission.drafts.find(
          (draft: { accessionId: string }) => draft.accessionId === item
        ) as ObjectInsideSubmissionWithTags
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
      const objectStepNumber = ObjectSubmissionStepsList.find(step =>
        step.objectTypes.find(item => item === objectType)
      )?.stepNumber
      navigate({ pathname: pathWithLocale("submission"), search: `step=${objectStepNumber}` })
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
      <Form onSubmit={methods.handleSubmit(onSubmit)}>
        {draftObjects.map((draft: ObjectInsideSubmissionWithTagsBySchema) => {
          const schema = Object.keys(draft)[0]
          return (
            <ConnectForm key={schema}>
              {({ register }: ConnectFormMethods) => {
                return (
                  <FormControl sx={{ marginBottom: 1 }} fullWidth>
                    <FormLabel
                      sx={theme => ({
                        fontWeight: "bold",
                        color: theme.palette.grey[900],
                        p: 1,
                        borderBottom: `3px solid ${theme.palette.primary.main}`,
                        textTransform: "capitalize",
                      })}
                    >
                      {schema}
                    </FormLabel>
                    <FormGroup>
                      {draft[schema].map(item => {
                        const { ref, ...rest } = register(`${item.accessionId}`)
                        return (
                          <MuiFormControlLabel
                            sx={{
                              width: "100%",
                              padding: 0,
                              margin: 1,
                              borderBottom: theme => `solid 1px ${theme.palette.secondary.main}`,
                            }}
                            key={item.accessionId}
                            control={
                              <Checkbox
                                color="primary"
                                value={item.accessionId}
                                {...rest}
                                inputRef={ref}
                                name={item.accessionId}
                              />
                            }
                            label={
                              <Label>
                                <ListItemText
                                  sx={{
                                    float: "left",
                                    maxWidth: "50%",
                                    "& span, & p": {
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      maxWidth: "50vw",
                                    },
                                  }}
                                  primary={getItemPrimaryText(item)}
                                  secondary={item.accessionId}
                                  data-schema={item.schema}
                                />
                                <Button
                                  sx={{ color: theme => theme.palette.primary.main, m: 1, float: "right" }}
                                  aria-label="View draft"
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleViewButton(item.schema, item.accessionId)}
                                >
                                  View
                                </Button>
                              </Label>
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
        <ButtonGroup>
          <Button
            variant="contained"
            aria-label="Cancel publishing submission contents"
            color="secondary"
            onClick={() => props.onHandleDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            aria-label="Publish submission contents and move to frontpage"
            color="primary"
            type="submit"
            data-testid="confirm-publish-submission"
          >
            Publish
          </Button>
        </ButtonGroup>
      </Form>
    </FormProvider>
  )
}

export default WizardDraftSelections
