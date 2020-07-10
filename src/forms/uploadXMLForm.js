//@flow
import React, { useState } from "react"
import { useSelector } from "react-redux"
import { Formik, Form, Field } from "formik"
import { FieldProps, getIn } from "formik"
import FormControl, { FormControlProps } from "@material-ui/core/FormControl"
import Input, { InputProps } from "@material-ui/core/Input"
import FormHelperText from "@material-ui/core/FormHelperText"
import Button from "@material-ui/core/Button"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"
import * as yup from "yup"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"
import { makeStyles } from "@material-ui/core/styles"

// Input stylings from: https://benmarshall.me/styling-file-inputs/
const useStyles = makeStyles(theme => ({
  root: {
    "& > *": {
      margin: theme.spacing(1),
    },
  },
  input: {
    border: "0",
    clip: "rect(0, 0, 0, 0)",
    height: "1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute !important",
    whiteSpace: "nowrap",
    width: "1px",
  },
}))

interface SimpleFileUploadProps extends FieldProps {
  label: string;
  disabled?: boolean;
  InputProps?: Omit<InputProps, "name" | "type" | "label">;
  FormControlProps?: FormControlProps;
}

const FileUpload = ({
  field,
  form: { isSubmitting, touched, errors, setFieldValue },
  label,
  disabled = false,
  InputProps: inputProps,
  FormControlProps: formControlProps,
}: SimpleFileUploadProps) => {
  const error = getIn(touched, field.name) && getIn(errors, field.name)
  const classes = useStyles()

  return (
    <FormControl {...formControlProps}>
      {label && (
        <label htmlFor="file-select-button">
          <Button variant="contained" color="primary" component="span">
            {label}
          </Button>
        </label>
      )}
      <Input
        error={!!error}
        inputProps={{
          accept: "text/xml",
          type: "file",
          className: classes.input,
          id: "file-select-button",
          disabled: disabled || isSubmitting,
          name: field.name,
          onChange: event => {
            if (inputProps?.onChange) {
              inputProps.onChange(event)
            } else {
              const file = event.currentTarget.files[0]
              setFieldValue(field.name, file)
            }
          },
        }}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  )
}

const UploadXMLForm = () => {
  const [errorMessage, setErrorMessage] = useState("")
  const [errorType, setErrorType] = useState("")
  const { objectType } = useSelector(state => state.objectType)

  return (
    <div>
      <Formik
        initialValues={{ file: null }}
        validationSchema={yup.object().shape({
          file: yup
            .mixed()
            .required("Please attach a file before submitting.")
            .test(
              "fileType",
              "The file format you attached to this form is not allowed.",
              value => value && value.type === "text/xml"
            )
            .test(
              "validateXML",
              `The file you attachent is not valid ${objectType}`,
              async value => {
                const response = await submissionAPIService.validateXMLFile(
                  objectType,
                  value
                )
                return response.ok && response.data.isValid
              }
            ),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const response = await objectAPIService.createFromXML(
            objectType,
            values.file
          )
          console.log(response)
          if (response.ok) {
            setErrorMessage(
              `Submitted with accessionid ${response.data.accessionId}`
            )
            setErrorType("success")
          } else {
            if (response.status === 504) {
              setErrorMessage(
                `Couldn't connect to metadata server, details: ${response.data}`
              )
              setErrorType("error")
            } else {
              setErrorMessage(`Error: ${response.data.detail}`)
              setErrorType("error")
            }
          }
          setSubmitting(false)
        }}
      >
        {({ submitForm, isSubmitting }) => (
          <Form>
            <Field
              component={FileUpload}
              name="file"
              placeholder="name"
              label="Choose file"
            />
            {isSubmitting && <LinearProgress />}
            <br />
            <Button
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              onClick={submitForm}
            >
              Submit
            </Button>
          </Form>
        )}
      </Formik>
      {errorMessage && errorType && (
        <Alert
          severity={errorType}
          onClose={() => {
            setErrorMessage("")
            setErrorType("")
          }}
        >
          {errorMessage}
        </Alert>
      )}
    </div>
  )
}

export default UploadXMLForm
