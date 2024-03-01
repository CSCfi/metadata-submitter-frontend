/* Breaking change for JSON schema version draft-2020-12:
 * https://ajv.js.org/json-schema.html#draft-2020-12
 */
import React, { useEffect, useState } from "react"

import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import { styled } from "@mui/system"
import Ajv2020 from "ajv/dist/2020"
import { isEmpty } from "lodash"

import JSONSchemaParser from "./WizardObjectDetailsJSONSchemaParser"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import { FormObject, ObjectDetails } from "types"
import { dereferenceSchema } from "utils/JSONSchemaUtils"

const DetailComponents = styled("div")(({ theme }) => ({
  "& .MuiTextField-root > .Mui-required": {
    color: theme.palette.primary.main,
  },
  "& .MuiTypography-root": {
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
      marginBottom: 1,
      width: "100%",
      "& .MuiTextField-root": {
        width: "95%",
      },
    },
    "& h2, h3, h4, h5, h6": {
      margin: "1 0",
    },
    "& .MuiPaper-elevation2": {
      "& .array": { margin: 0 },
      "& h2": { padding: "0 1" },
      "& h3, h4": { margin: 1 },
      "& button": { margin: "0 1" },
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
        const ajv = new Ajv2020()

        if (!schema || !ajv.validateSchema(JSON.parse(schema))) {
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
        <DetailComponents>
          {JSONSchemaParser.buildDetails(states.schema as FormObject, states.objectData as ObjectDetails)}
        </DetailComponents>
      )}
    </Box>
  )
}

export default WizardObjectDetails
