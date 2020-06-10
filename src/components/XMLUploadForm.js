import React from "react"
import { Formik, Form, Field } from "formik"
import { Button, LinearProgress } from "@material-ui/core"
import * as yup from "yup"
import { SimpleFileUpload } from "formik-material-ui"

const XMLUploadForm = () => {
  const typeErrorMessage =
    "The file format you attached to this form is not allowed."
  return (
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
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          console.log(values.file)
          setSubmitting(false)
        }, 1000)
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
  )
}

export default XMLUploadForm
