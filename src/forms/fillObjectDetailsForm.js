//@flow
import React, { useState } from "react"
import Form from "@rjsf/material-ui"
import studySchema from "schemas/study_schema"
import TextWidget from "./form_components/TextWidget"
import SelectWidget from "./form_components/SelectWidget"

const FillObjectDetailsForm = () => {
  const [formData, setFormData] = useState(null)

  return (
    <Form
      liveValidate
      onSubmit={() => console.log("test")}
      schema={studySchema}
      formData={formData}
      onChange={event => setFormData(event.formData)}
      showErrorList={false}
      widgets={{ TextWidget, SelectWidget }}
    />
  )
}
export default FillObjectDetailsForm
