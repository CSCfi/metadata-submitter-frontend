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
  form: {
    margin: theme.spacing(3, 2),
    "& .MuiTextField-root > .Mui-required": {
      color: theme.palette.primary.main,
    },
    "& .MuiTextField-root": {
      width: "48%",
      margin: theme.spacing(1),
    },
    "& .MuiTypography-root": {
      margin: theme.spacing(1),
      ...theme.typography.subtitle1,
      fontWeight: "bold",
    },
    "& .MuiTypography-h2": {
      width: "100%",
      color: theme.palette.primary.light,
      borderBottom: `2px solid ${theme.palette.secondary.main}`,
    },
    "& .MuiTypography-h3": {
      width: "100%",
    },
    "& .array": {
      margin: theme.spacing(1),

      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        width: "100%",
        "& .MuiTextField-root": {
          width: "95%",
        },
      },
      "& h2, h3, h4, h5, h6": {
        margin: theme.spacing(1, 0),
      },
      "& .MuiPaper-elevation2": {
        paddingRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        width: "60%",
        "& .array": { margin: 0 },
        "& h3, h4": { margin: theme.spacing(1) },
        "& button": { margin: theme.spacing(1) },
      },
      "& .MuiSelect-outlined": {
        marginRight: 0,
      },
    },
  },
}))

const DOIForm = ({ formId }: { formId: string }) => {
  const [doiSchema, setDoiSchema] = useState({})

  useEffect(async () => {
    const loadData = await dereferenceSchema(folderSchema)
    const doiData = loadData?.properties?.doiInfo
    setDoiSchema(doiData)
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
