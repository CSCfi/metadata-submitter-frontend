//@flow
import React from "react"
import Form from "@rjsf/material-ui"
import studySchema from "schemas/study_schema"
import TextWidget from "./form_components/TextWidget"
import SelectWidget from "./form_components/SelectWidget"

const FillObjectDetailsForm = () => (
  <Form
    liveValidate
    onSubmit={() => console.log("test")}
    schema={studySchema}
    showErrorList={false}
    widgets={{ TextWidget, SelectWidget }}
  />
)

export default FillObjectDetailsForm
