import * as React from "react"

import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import { TypographyVariant } from "@mui/material/styles/createTypography"
import Typography from "@mui/material/Typography"
import { styled } from "@mui/system"
import { get } from "lodash"

import { FormObject, NestedField, ObjectDetails } from "types"
import { pathToName, traverseValues } from "utils/JSONSchemaUtils"

const SectionHeader = styled(Typography)(({ theme }) => ({
  margin: 1,
  fontWeight: 600,
  lineHeight: "1.75",
  letterSpacing: "0.00938em",
  color: theme.palette.primary.main,
}))

/*
 * Build object details based on given schema
 */
const buildDetails = (schema: FormObject, objectValues: ObjectDetails) => {
  try {
    return traverseFields(schema, [], objectValues)
  } catch (error) {
    console.error(error)
  }
}

/*
 * Traverse fields recursively, return correct fields for given object or log error, if object type is not supported.
 */
const traverseFields = (
  object: FormObject,
  path: string[],
  objectValues: ObjectDetails,
  nestedField?: NestedField,
) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem

  const getValues = () => {
    return get(objectValues, name)
  }

  if (object.oneOf)
    return <OneOfField key={name} path={path} object={object} objectValues={objectValues} />

  // Enable initial traverse
  if (name.length === 0 || getValues()) {
    switch (object.type) {
      case "object": {
        const properties = object.properties
        return (
          <DetailsSection key={name} name={name} label={label} level={path.length + 1}>
            {Object.keys(properties).map(propertyKey => {
              const property = properties[propertyKey] as FormObject

              return traverseFields(property, [...path, propertyKey], objectValues, nestedField)
            })}
          </DetailsSection>
        )
      }
      case "string":
      case "integer":
      case "number":
      case "boolean": {
        return label ? (
          <ObjectDetailsListItem key={name} name={name} label={object.title} value={getValues()} />
        ) : (
          <></>
        )
      }
      case "array": {
        return object.items.enum ? (
          <CheckboxArray
            key={name}
            name={name}
            label={object.title}
            values={getValues()}
          ></CheckboxArray>
        ) : (
          <DetailsArray
            key={name}
            object={object}
            objectValues={objectValues}
            values={getValues()}
            path={path}
          />
        )
      }
      case "null": {
        return null
      }
      default: {
        console.error(`
          No field parsing support for type ${object.type} yet.

          Pretty printed version of object with unsupported type:
          ${JSON.stringify(object, null, 2)}
          `)
        return null
      }
    }
  }
}

const ObjectDetailsListItem = ({
  name,
  label,
  value,
}: {
  name: string
  label: string
  value: string | number
}) => {
  return (
    <ListItem
      sx={{
        "&.MuiListItem-root": {
          pt: "0",
          pb: "0",
        },
      }}
      data-testid={name}
    >
      <ListItemText disableTypography primary={`${label}: ${value}`}></ListItemText>
    </ListItem>
  )
}

type DetailsSectionProps = {
  name: string
  label: string
  level: number
  children?: React.ReactNode
}

const DetailsSection = ({ name, label, level, children }: DetailsSectionProps) => (
  <div className="detailsSection" key={`${name}-section`} data-testid="section">
    <SectionHeader key={`${name}-header`} variant={`h${level}` as TypographyVariant}>
      {label}
    </SectionHeader>
    {children}
  </div>
)

type OneOfFieldProps = {
  path: string[]
  object: FormObject
  objectValues: ObjectDetails
}

const OneOfField = ({ path, object, objectValues }: OneOfFieldProps) => {
  const name = pathToName(path)

  // Number & boolean field values are handled as string
  const stringTypes = ["number", "boolean"]
  const optionValue = stringTypes.includes(typeof get(objectValues, name))
    ? "string"
    : get(objectValues, name)
  const optionType = Array.isArray(optionValue) ? "array" : typeof optionValue
  const options = object.oneOf

  let currentOption = options.find((item: { type: string }) => item.type === optionType)

  // Find option when options share type
  if (options.filter((option: { type: string }) => option.type === optionType).length > 1) {
    const optionValueKeys = Object?.keys(optionValue)
    for (const option of options) {
      // Find option details in array of values by comparing required fields. E.g. Study > Study Links
      if (option.required) {
        if (option.required.every((val: string) => optionValueKeys.includes(val))) {
          currentOption = option
        }
      }
      // Find option by comparing properties
      else if (Object.keys(option.properties)?.some(val => optionValueKeys.includes(val))) {
        currentOption = option
      }
    }
  }

  return <div key={name}>{currentOption && traverseFields(currentOption, path, objectValues)}</div>
}

type CheckboxArrayProps = {
  name: string
  label: string
  values: string[]
}

const CheckboxArray = ({ label, values }: CheckboxArrayProps) => {
  return (
    <List>
      <Typography color="primary">{label}</Typography>
      {values.map((item: string) => (
        <ListItem
          sx={{
            "&.MuiListItem-root": {
              pt: "0",
              pb: "0",
            },
          }}
          key={item}
          data-testid="checkbox-item"
        >
          <Checkbox checked={true} color="primary" disabled></Checkbox>
          {item}
        </ListItem>
      ))}
    </List>
  )
}

type DetailsArrayProps = {
  object: FormObject
  path: Array<string>
  objectValues: ObjectDetails
  values: Record<string, unknown>[]
}

const DetailsArray = ({ object, path, objectValues, values }: DetailsArrayProps) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const level = path.length + 1

  const items = traverseValues(object.items) as Record<string, unknown>
  return (
    <div className="array" key={`${name}-array`}>
      <SectionHeader
        key={`${name}-header`}
        variant={`h${level}` as TypographyVariant}
        data-testid={name}
      >
        {label}
      </SectionHeader>

      {values.map((_field: unknown, index: number) => {
        const [lastPathItem] = path.slice(-1)
        const pathWithoutLastItem = path.slice(0, -1)
        const lastPathItemWithIndex = `${lastPathItem}[${index}]`

        if (items.oneOf) {
          const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex]

          return (
            <div className="arrayRow" key={`${name}[${index}]`}>
              <Paper elevation={2}>
                <OneOfField
                  key={`${name}[${index}]`}
                  path={pathForThisIndex}
                  object={items as FormObject}
                  objectValues={objectValues}
                />
              </Paper>
            </div>
          )
        }

        const properties = object.items.properties

        return (
          <Box px={1} className="arrayRow" key={`${name}[${index}]`}>
            <Paper elevation={2}>
              {Object.keys(items).map(item => {
                const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex, item]

                return traverseFields(
                  properties[item] as FormObject,
                  pathForThisIndex,
                  objectValues,
                )
              })}
            </Paper>
          </Box>
        )
      })}
    </div>
  )
}

export default {
  buildDetails,
}
