//@flow
import React, { useState } from "react"
import { useSelector } from "react-redux"
import { Field, FieldProps, Form, Formik, getIn } from "formik"
import FormControl, { FormControlProps } from "@material-ui/core/FormControl"
import Input, { InputProps } from "@material-ui/core/Input"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(2),
    },
  },
  hiddenInput: {
    display: "none",
  },
  fileField: {
    display: "inline-flex",
  },
}))

interface FileUploadProps extends FieldProps {
  label: string;
  disabled?: boolean;
  InputProps?: Omit<InputProps, "name" | "type" | "label">;
  FormControlProps?: FormControlProps;
}

const FileUpload = ({
  field,
  form: { isSubmitting, touched, errors, setFieldValue, values, setTouched },
  label,
  disabled = false,
  FormControlProps: formControlProps,
}: FileUploadProps) => {
  const error = getIn(touched, field.name) && getIn(errors, field.name)
  const classes = useStyles()
  return (
    <FormControl {...formControlProps} className={classes.root}>
      <div className={classes.fileField}>
        <TextField
          placeholder={values.file ? values.file.name : "Name"}
          inputProps={{ readOnly: true }}
        />
        <label htmlFor="file-select-button">
          <Button variant="contained" color="primary" component="span">
            {label}
          </Button>
        </label>
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
              setTouched({ file: true }, false)
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
      return "Unfortunately couldn't connect to our server to validate your file."
    case 400:
      return `Unfortunately an error happened when saving your file to our servers, details: ${response.data}`
    default:
      return `Unfortunately an unexpected error on our servers, details: ${response.data}`
  }
}

const UploadXMLForm = () => {
  const [successMessage, setSuccessMessage] = useState("")
  const { objectType } = useSelector(state => state.objectType)
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
            const response = await submissionAPIService.validateXMLFile(
              objectType,
              values.file
            )
            if (!response.ok) {
              errors.file = checkResponseError(response)
            } else if (!response.data.isValid) {
              errors.file = `The file you attached is not valid ${objectType}, please check file for errors.`
            }
          }
          return errors
        }}
        onSubmit={async (values, { setSubmitting, setFieldError }) => {
          const response = await objectAPIService.createFromXML(
            objectType,
            values.file
          )
          if (response.ok) {
            setSuccessMessage(
              `Submitted with accessionid ${response.data.accessionId}`
            )
          } else {
            setFieldError("file", checkResponseError(response))
          }
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
              disabled={
                isSubmitting || touched.file == null || errors.file != null
              }
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      {successMessage && (
        <Alert
          severity="success"
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

export default UploadXMLForm
