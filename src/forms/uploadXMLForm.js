//@flow
import React, { useState } from "react"
import { useSelector } from "react-redux"
import { Formik, Form, Field } from "formik"
import Button from "@material-ui/core/Button"
import LinearProgress from "@material-ui/core/LinearProgress"
import Alert from "@material-ui/lab/Alert"
import * as yup from "yup"
import { SimpleFileUpload } from "formik-material-ui"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

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
            <Field component={SimpleFileUpload} name="file" />
            {isSubmitting && <LinearProgress />}
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
