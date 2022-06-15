import React, { useEffect, useState } from "react"

import { Theme } from "@mui/material"
import { makeStyles } from "@mui/styles"
import Ajv from "ajv"
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

const useStyles = makeStyles((theme: Theme) => ({
  form: { ...theme.form },
}))

const DOIForm = ({ formId }: { formId: string }) => {
  const [dataciteSchema, setDataciteSchema] = useState({})
  const locale = useAppSelector(state => state.locale)

  useEffect(() => {
    let isMounted = true
    const getDataciteSchema = async () => {
      let dataciteSchema = sessionStorage.getItem(`cached_datacite_schema`)
      let parsedDataciteSchema: FormObject | undefined = undefined

      if (!dataciteSchema || !new Ajv().validateSchema(JSON.parse(dataciteSchema))) {
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
  const classes = useStyles()

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
      <form
        className={classes.form}
        id={formId}
        onSubmit={methods.handleSubmit(async data => onSubmit(data as DoiFormDetails))}
      >
        <div>
          {Object.keys(dataciteSchema)?.length > 0 ? JSONSchemaParser.buildFields(dataciteSchema as FormObject) : null}
        </div>
      </form>
    </FormProvider>
  )
}

export default DOIForm
