import React, { useEffect, useState } from "react"

import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { makeStyles } from "@mui/styles"
import Ajv from "ajv"
import { isEmpty } from "lodash"

import JSONSchemaParser from "./WizardObjectDetailsJSONSchemaParser"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import { FormObject, ObjectDetails } from "types"
import CSCtheme from "theme"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles((theme: typeof CSCtheme) => ({
  detailComponents: {
    "& .MuiTextField-root > .Mui-required": {
      color: theme.palette.primary.main,
    },
    "& .MuiTypography-root": {
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
        "& .array": { margin: 0 },
        "& h2": { padding: theme.spacing(0, 1) },
        "& h3, h4": { margin: theme.spacing(1) },
        "& button": { margin: theme.spacing(0, 1) },
      },
    },
  },
}))

type ObjectDetailsType = {
  objectType: string
  objectData: Record<string, unknown>
}

/*
 * Fetch and render object details
 */
const WizardObjectDetails: React.FC<ObjectDetailsType> = props => {
  const { objectType, objectData } = props
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const [states, setStates] = useState({
    objectData: {} as Record<string, unknown>,
    schema: {},
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true

    const fetchSchema = async () => {
      if (isMounted) {
        const schema = sessionStorage.getItem(`cached_${objectType}_schema`)
        let parsedSchema: FormObject

        if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
          const schemaResponse = await schemaAPIService.getSchemaByObjectType(objectType)
          if (schemaResponse.ok) {
            parsedSchema = schemaResponse.data
            sessionStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(parsedSchema))
          } else {
            dispatch(
              updateStatus({
                status: ResponseStatus.error,
                response: schemaResponse,
                helperText: "Can't fetch schema",
              })
            )
            setStates({
              ...states,
              isLoading: false,
            })
            return
          }
        } else {
          parsedSchema = JSON.parse(schema)
        }

        const dereferencedSchema: Promise<FormObject> = await dereferenceSchema(parsedSchema as FormObject)

        setStates({
          ...states,
          objectData: objectData,
          schema: dereferencedSchema,
          isLoading: false,
        })
      }
    }

    fetchSchema()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Box py={1}>
      {states.isLoading && <CircularProgress color="primary"></CircularProgress>}
      {!isEmpty(states.schema) && states.schema && states.objectData && (
        <div className={classes.detailComponents}>
          {JSONSchemaParser.buildDetails(states.schema as FormObject, states.objectData as ObjectDetails)}
        </div>
      )}
    </Box>
  )
}

export default WizardObjectDetails
