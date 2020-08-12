//@flow
import React, { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Field, FieldProps, Form, Formik, getIn } from "formik"
import FormControl, { FormControlProps } from "@material-ui/core/FormControl"
import Input from "@material-ui/core/Input"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"
import { makeStyles } from "@material-ui/core/styles"
import { addObjectToFolder } from "features/submissionFolderSlice"

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

interface FileUploadProps extends FieldProps {
  label: string;
  disabled?: boolean;
  FormControlProps?: FormControlProps;
}

const FileUpload = ({
  field,
  form: { isSubmitting, touched, errors, values, setFieldValue, setFieldTouched },
  label,
  disabled = false,
  FormControlProps: formControlProps,
}: FileUploadProps) => {
  const error = getIn(touched, field.name) && getIn(errors, field.name)
  const classes = useStyles()
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
            },
          }}
        />
      </div>
      {error && <Alert severity="error">{error}</Alert>}
    </FormControl>
  )
}

const checkResponseError = response => {
  switch (response.status) {
    case 504:
      return `Unfortunately we couldn't connect to our server to validate your 
        file.`
    case 400:
      return `Unfortunately an error happened when saving your file to our 
        servers, details: ${response.data}`
    default:
      return "Unfortunately an unexpected error happened on our servers"
  }
}

const UploadObjectXMLForm = () => {
  const [successMessage, setSuccessMessage] = useState("")
  const [successStatus, setSuccessStatus] = useState("info")
  const objectType = useSelector(state => state.objectType)
  const dispatch = useDispatch()
  const classes = useStyles()

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

            if (!response.ok) {
              errors.file = checkResponseError(response)
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
            setSuccessMessage(`For some reason, your file is still being saved
            to our database, please wait. If saving doesn't go through in two
            minutes, please try saving the file again.`)
          }, 5000)

          const response = await objectAPIService.createFromXML(objectType, values.file)

          if (response.ok) {
            setSuccessStatus("success")
            setSuccessMessage(`Submitted with accessionid ${response.data.accessionId}`)
            dispatch(
              addObjectToFolder({
                accessionId: response.data.accessionId,
                schema: objectType,
              })
            )
          } else {
            setFieldError("file", checkResponseError(response))
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
      {successMessage && (
        <Alert
          severity={successStatus}
          onClose={() => {
            setSuccessMessage("")
          }}
        >
          {successMessage}
        </Alert>
      )}
    </div>
  )
}

export default UploadObjectXMLForm
