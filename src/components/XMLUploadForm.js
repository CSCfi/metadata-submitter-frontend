import React, { useState } from "react"
import { Formik, Form, Field } from "formik"
import { Button, LinearProgress } from "@material-ui/core"
import * as yup from "yup"
import { SimpleFileUpload } from "formik-material-ui"
import objectService from "../services/object"
import Notification from "./Notification"

const XMLUploadForm = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const typeErrorMessage =
    "The file format you attached to this form is not allowed."
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
              typeErrorMessage,
              value => value && value.type === "text/xml"
            ),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          console.log(values.file)
          const response = await objectService.createFromXML(
            "study",
            values.file
          )
          if (response.ok) {
            setErrorMessage(
              `Submitted with accessionid ${response.data.accessionId}`
            )
          } else {
            setErrorMessage(`Error: ${response.data}`)
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
      <div>
        <Notification message={errorMessage} />
      </div>
    </div>
  )
}

export default XMLUploadForm
