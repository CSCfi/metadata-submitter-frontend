import React, { useEffect, useState } from "react"

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
import { addDoiInfoToFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles(theme => ({
  form: { ...theme.form },
}))

const DOIForm = ({ formId }: { formId: string }): any => {
  const [dataciteSchema, setDataciteSchema] = useState({})
  const locale = useAppSelector(state => state.locale)

  useEffect(() => {
    let isMounted = true
    const getDataciteSchema = async () => {
      let dataciteSchema = sessionStorage.getItem(`cached_datacite_schema`)
      if (!dataciteSchema || !new Ajv().validateSchema(JSON.parse(dataciteSchema))) {
        try {
          const response = await schemaAPIService.getSchemaByObjectType("datacite")
          dataciteSchema = response.data
          sessionStorage.setItem(`cached_datacite_schema`, JSON.stringify(dataciteSchema))
        } catch (err: any) {
          dispatch(
            updateStatus({
              status: ResponseStatus.error,
              response: err,
              helperText: "Can't submit the DOI information",
            })
          )
        }
      } else {
        dataciteSchema = JSON.parse(dataciteSchema)
      }
      const dereferencedDataciteSchema = await dereferenceSchema(dataciteSchema)
      if (isMounted) {
        setDataciteSchema(dereferencedDataciteSchema)
      }
    }
    getDataciteSchema()
    return () => {
      isMounted = false
    }
  }, [])

  const currentFolder = useAppSelector(state => state.submissionFolder)
  const resolver = WizardAjvResolver(dataciteSchema, locale)
  const methods = useForm({ mode: "onBlur", resolver })

  const dispatch = useAppDispatch()
  const classes = useStyles()

  // Set form default values
  useEffect(() => {
    methods.reset(currentFolder.doiInfo)
  }, [])

  const onSubmit = async (data: any) => {
    dispatch(addDoiInfoToFolder(currentFolder.folderId, data))
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
      .catch((err: any) =>
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: err,
            helperText: "Can't submit information for DOI.",
          })
        )
      )
  }
  return (
    <FormProvider {...methods}>
      <form className={classes.form} id={formId} onSubmit={methods.handleSubmit(onSubmit)}>
        <div>{Object.keys(dataciteSchema)?.length > 0 ? JSONSchemaParser.buildFields(dataciteSchema) : null}</div>
      </form>
    </FormProvider>
  )
}

export default DOIForm
