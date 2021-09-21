//@flow

import React, { useEffect, useState } from "react"

import { makeStyles } from "@material-ui/core/styles"
import { useForm, FormProvider } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"

import { WizardAjvResolver } from "./WizardAjvResolver"
import JSONSchemaParser from "./WizardJSONSchemaParser"

import folderSchema from "constants/folder.json"
import { WizardStatus } from "constants/wizardStatus"
import { updateStatus } from "features/wizardStatusMessageSlice"
import folderAPIService from "services/folderAPI"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles(theme => ({
  form: theme.form,
}))

const DOIForm = ({ formId }: { formId: string }): React$Element<typeof FormProvider> => {
  const [doiSchema, setDoiSchema] = useState({})

  useEffect(() => {
    const getDoiSchema = async () => {
      const loadData = await dereferenceSchema(folderSchema)
      const doiData = loadData?.properties?.doiInfo
      setDoiSchema(doiData)
    }
    getDoiSchema()
  }, [])

  const resolver = WizardAjvResolver(doiSchema)
  const methods = useForm({ mode: "onBlur", resolver })

  const currentFolder = useSelector(state => state.submissionFolder)
  const dispatch = useDispatch()
  const classes = useStyles()

  const onSubmit = async data => {
    const changes = [{ op: "add", path: "/doiInfo", value: data }]
    const response = await folderAPIService.patchFolderById(currentFolder.folderId, changes)
    if (!response.ok) {
      dispatch(
        updateStatus({
          successStatus: WizardStatus.error,
          response: response,
          errorPrefix: "Can't submit the DOI information",
        })
      )
    }
  }
  return (
    <FormProvider {...methods}>
      <form className={classes.form} id={formId} onSubmit={methods.handleSubmit(onSubmit)}>
        <div>{Object.keys(doiSchema)?.length > 0 ? JSONSchemaParser.buildFields(doiSchema) : null}</div>
      </form>
    </FormProvider>
  )
}

export default DOIForm
