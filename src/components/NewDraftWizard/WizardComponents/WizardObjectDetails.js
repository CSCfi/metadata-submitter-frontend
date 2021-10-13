//@flow
import React, { useEffect, useState } from "react"

import Box from "@material-ui/core/Box"
import CircularProgress from "@material-ui/core/CircularProgress"
import { makeStyles } from "@material-ui/core/styles"
import Ajv from "ajv"
import { useDispatch } from "react-redux"

import JSONSchemaParser from "./WizardObjectDetailsJSONSchemaParser"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import schemaAPIService from "services/schemaAPI"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const useStyles = makeStyles(theme => ({
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
  objectType: string,
  objectData: any,
}

/*
 * Fetch and render object details
 */
const WizardObjectDetails = (props: ObjectDetailsType): React$Element<any> => {
  const { objectType, objectData } = props
  const classes = useStyles()
  const dispatch = useDispatch()

  const [states, setStates] = useState({
    objectData: null,
    schema: null,
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true

    const fetchSchema = async () => {
      if (isMounted) {
        let schema = sessionStorage.getItem(`cached_${objectType}_schema`)

        if (!schema || !new Ajv().validateSchema(JSON.parse(schema))) {
          const schemaResponse = await schemaAPIService.getSchemaByObjectType(objectType)
          if (schemaResponse.ok) {
            schema = schemaResponse.data
            sessionStorage.setItem(`cached_${objectType}_schema`, JSON.stringify(schema))
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
          schema = JSON.parse(schema)
        }

        let dereferencedSchema: Promise<any> = await dereferenceSchema(schema)

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
      {states.schema && states.objectData && (
        <div className={classes.detailComponents}>
          {JSONSchemaParser.buildDetails(states.schema, states.objectData)}
        </div>
      )}
    </Box>
  )
}

export default WizardObjectDetails
