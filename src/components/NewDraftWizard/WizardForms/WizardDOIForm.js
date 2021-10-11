//@flow

import React, { useEffect, useState } from "react"

import { makeStyles } from "@material-ui/core/styles"
import Ajv from "ajv"
import { useForm, FormProvider } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"

import { WizardStatus } from "constants/wizardStatus"
import { updateStatus } from "features/wizardStatusMessageSlice"
import folderAPIService from "services/folderAPI"
import schemaAPIService from "services/schemaAPI"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles(theme => ({
  form: theme.form,
}))

const DOIForm = ({ formId }: { formId: string }): React$Element<typeof FormProvider> => {
  const [dataciteSchema, setDataciteSchema] = useState({})

  useEffect(() => {
    const getDataciteSchema = async () => {
      let dataciteSchema = sessionStorage.getItem(`cached_datacite_schema`)
      if (!dataciteSchema || !new Ajv().validateSchema(JSON.parse(dataciteSchema))) {
        try {
          const response = await schemaAPIService.getSchemaByObjectType("datacite")
          dataciteSchema = response.data
          sessionStorage.setItem(`cached_datacite_schema`, JSON.stringify(dataciteSchema))
        } catch (err) {
          dispatch(
            updateStatus({
              successStatus: WizardStatus.error,
              response: err,
              errorPrefix: "Can't submit the DOI information",
            })
          )
        }
      } else {
        dataciteSchema = JSON.parse(dataciteSchema)
      }
      const dereferencedDataciteSchema = await dereferenceSchema(dataciteSchema)
      setDataciteSchema(dereferencedDataciteSchema)
    }
    getDataciteSchema()
  }, [])

  const resolver = WizardAjvResolver(dataciteSchema)
  const methods = useForm({ mode: "onBlur", resolver })

  const currentFolder = useSelector(state => state.submissionFolder)
  const dispatch = useDispatch()
  const classes = useStyles()

  const onSubmit = async data => {
    try {
      const changes = [{ op: "add", path: "/doiInfo", value: data }]
      await folderAPIService.patchFolderById(currentFolder.folderId, changes)
    } catch (err) {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: err,
          errorPrefix: "Can't submit information for DOI.",
        })
      )
    }
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
