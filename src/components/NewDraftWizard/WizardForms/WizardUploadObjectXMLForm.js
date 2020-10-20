//@flow
import React, { useState } from "react"

import Button from "@material-ui/core/Button"
import FormControl, { FormControlProps } from "@material-ui/core/FormControl"
import Input from "@material-ui/core/Input"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Alert from "@material-ui/lab/Alert"
import { Field, FieldProps, Form, Formik, getIn } from "formik"
import { useDispatch, useSelector } from "react-redux"

import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { setDraftStatus } from "features/draftStatusSlice"
import { resetErrorMessage } from "features/wizardErrorMessageSlice"
import { addObjectToFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(2),
    },
  },
  hiddenInput: {
    border: "0",
    clip: "rect(0, 0, 0, 0)",
    height: "1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute !important",
    whiteSpace: "nowrap",
    width: "1px",
  },
  fileField: {
    display: "inline-flex",
  },
}))

type FileUploadProps = FieldProps & {
  label: string,
  disabled?: boolean,
  FormControlProps?: FormControlProps,
}

/*
 * Custom file component for Formik field.
 */
const FileUpload = ({
  field,
  form: { isSubmitting, touched, errors, values, setFieldValue, setFieldTouched },
  label,
  disabled = false,
  FormControlProps: formControlProps,
}: FileUploadProps) => {
  const error = getIn(touched, field.name) && getIn(errors, field.name)
  const classes = useStyles()
  const dispatch = useDispatch()

  return (
    <FormControl {...formControlProps} className={classes.root}>
      <div className={classes.fileField}>
        <TextField placeholder={values.file ? values.file.name : "Name"} inputProps={{ readOnly: true }} />
        <Button htmlFor="file-select-button" variant="contained" color="primary" component="label">
          {label}
        </Button>
        <Input
          className={classes.hiddenInput}
          error={!!error}
          inputProps={{
            accept: "text/xml",
            type: "file",
            id: "file-select-button",
            disabled: disabled || isSubmitting,
            name: field.name,
            onChange: event => {
              event.preventDefault()
              const file = event.currentTarget.files[0]
              setFieldValue(field.name, file)
              setFieldTouched(field.name, true, false)
              dispatch(setDraftStatus("notSaved"))
            },
          }}
        />
      </div>
      {error && <Alert severity="error">{error}</Alert>}
    </FormControl>
  )
}

/*
 * Return formik based form for uploading xml files. Handles form submitting, validating and error/success alerts.
 */
const WizardUploadObjectXMLForm = () => {
  const [successStatus, setSuccessStatus] = useState("")
  const [responseStatus, setResponseStatus] = useState([])
  const objectType = useSelector(state => state.objectType)
  const { id: folderId } = useSelector(state => state.submissionFolder)
  const dispatch = useDispatch()
  const classes = useStyles()
  const errorMessage = useSelector(state => state.errorMessage)
  return (
    <div>
      <Formik
        initialValues={{ file: null }}
        validate={async values => {
          const errors = {}
          if (!values.file) {
            errors.file = "Please attach a file."
          } else if (values.file.type !== "text/xml") {
            errors.file = "Please attach an XML file."
          } else {
            const response = await submissionAPIService.validateXMLFile(objectType, values.file)
            setResponseStatus(response)
            if (!response.ok) {
              errors.file = errorMessage
            } else if (!response.data.isValid) {
              errors.file = `The file you attached is not valid ${objectType}, 
              our server reported following error:
              ${response.data.detail.reason}.`
            }
          }
          return errors
        }}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          const waitForServertimer = setTimeout(() => {
            setSuccessStatus("info")
          }, 5000)

          const response = await objectAPIService.createFromXML(objectType, values.file)
          setResponseStatus(response)
          if (response.ok) {
            setSuccessStatus("success")
            dispatch(
              addObjectToFolder(folderId, {
                accessionId: response.data.accessionId,
                schema: objectType,
              })
            )
            dispatch(resetErrorMessage())
            dispatch(setDraftStatus("saved"))
          } else {
            setFieldError("file")
            setSuccessStatus("error")
          }
          clearTimeout(waitForServertimer)
          setSubmitting(false)
        }}
      >
        {({ touched, errors, submitForm, isSubmitting }) => (
          <Form>
            <Field component={FileUpload} name="file" label="Choose file" />
            {isSubmitting && <LinearProgress />}
            <Button
              variant="outlined"
              color="primary"
              className={classes.submitButton}
              disabled={isSubmitting || touched.file == null || errors.file != null}
              onClick={submitForm}
            >
              Save
            </Button>
          </Form>
        )}
      </Formik>
      {successStatus && (
        <WizardStatusMessageHandler
          successStatus={successStatus}
          response={responseStatus}
          prefixText=""
        ></WizardStatusMessageHandler>
      )}
    </div>
  )
}

export default WizardUploadObjectXMLForm
