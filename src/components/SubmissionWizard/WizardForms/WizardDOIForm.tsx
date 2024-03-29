/* Breaking change for JSON schema version draft-2020-12:
 * https://ajv.js.org/json-schema.html#draft-2020-12
 */
import React, { useEffect, useState } from "react"

import { styled } from "@mui/system"
import Ajv2020 from "ajv/dist/2020"
import { useForm, FormProvider } from "react-hook-form"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"

import { ResponseStatus } from "constants/responseStatus"
import { resetAutocompleteField } from "features/autocompleteSlice"
import { setOpenedDoiForm } from "features/openedDoiFormSlice"
import { updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addDoiInfoToSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import { DoiFormDetails, FormObject } from "types"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const Form = styled("form")(({ theme }) => ({ ...theme.form }))

const DOIForm = ({ formId }: { formId: string }) => {
  const [dataciteSchema, setDataciteSchema] = useState({})
  const locale = useAppSelector(state => state.locale)

  useEffect(() => {
    let isMounted = true
    const getDataciteSchema = async () => {
      let dataciteSchema = sessionStorage.getItem(`cached_datacite_schema`)
      let parsedDataciteSchema: FormObject | undefined = undefined
      const ajv = new Ajv2020()

      if (!dataciteSchema || !ajv.validateSchema(JSON.parse(dataciteSchema))) {
        try {
          const response = await schemaAPIService.getSchemaByObjectType("datacite")
          dataciteSchema = JSON.stringify(response.data)
          sessionStorage.setItem(`cached_datacite_schema`, dataciteSchema)
        } catch (error) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: error,
              helperText: "Can't submit the DOI information",
            })
          )
        }
      }

      parsedDataciteSchema = JSON.parse(dataciteSchema as string)

      const dereferencedDataciteSchema: Promise<FormObject> = await dereferenceSchema(
        parsedDataciteSchema as FormObject
      )

      if (isMounted) {
        setDataciteSchema(dereferencedDataciteSchema)
      }
    }
    getDataciteSchema()
    return () => {
      isMounted = false
    }
  }, [])

  const currentSubmission = useAppSelector(state => state.submission)
  const resolver = WizardAjvResolver(dataciteSchema, locale)
  const methods = useForm({ mode: "onBlur", resolver })

  const dispatch = useAppDispatch()

  // Set form default values
  useEffect(() => {
    methods.reset(currentSubmission.doiInfo)
  }, [])

  const onSubmit = async (data: DoiFormDetails) => {
    dispatch(addDoiInfoToSubmission(currentSubmission.submissionId, data))
      .then(() => {
        dispatch(resetAutocompleteField())
        dispatch(setOpenedDoiForm(false))
        dispatch(resetCurrentObject())
        dispatch(
          updateStatus({
            status: ResponseStatus.success,
            helperText: "DOI form has been saved successfully",
          })
        )
      })
      .catch(error =>
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: error,
            helperText: "Can't submit information for DOI.",
          })
        )
      )
  }
  return (
    <FormProvider {...methods}>
      <Form id={formId} onSubmit={methods.handleSubmit(async data => onSubmit(data as DoiFormDetails))}>
        <div>
          {Object.keys(dataciteSchema)?.length > 0 ? JSONSchemaParser.buildFields(dataciteSchema as FormObject) : null}
        </div>
      </Form>
    </FormProvider>
  )
}

export default DOIForm
