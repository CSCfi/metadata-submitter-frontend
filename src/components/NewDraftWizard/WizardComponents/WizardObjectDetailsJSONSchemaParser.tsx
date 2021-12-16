import * as React from "react"

import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Paper from "@mui/material/Paper"
import { Variant } from "@mui/material/styles/createTypography"
import Typography from "@mui/material/Typography"
import { makeStyles, withStyles } from "@mui/styles"
import { get } from "lodash"

import { pathToName, traverseValues } from "utils/JSONSchemaUtils"

const useStyles = makeStyles(theme => ({
  sectionHeader: {
    margin: theme.spacing(1, 0),
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 600,
    lineHeight: "1.75",
    letterSpacing: "0.00938em",
    color: theme.palette.primary.main,
  },
}))

/*
 * Build object details based on given schema
 */
const buildDetails = (schema: any, objectValues: any) => {
  try {
    return traverseFields(schema, [], objectValues)
  } catch (error) {
    console.error(error)
  }
}

/*
 * Traverse fields recursively, return correct fields for given object or log error, if object type is not supported.
 */
const traverseFields = (object: any, path: string[], objectValues: any, nestedField?: any) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem

  const getValues = () => {
    return get(objectValues, name)
  }

  if (object.oneOf) return <OneOfField key={name} path={path} object={object} objectValues={objectValues} />

  // Enable initial traverse
  if (name.length === 0 || getValues()) {
    switch (object.type) {
      case "object": {
        const properties = object.properties
        return (
          <DetailsSection key={name} name={name} label={label} level={path.length + 1}>
            {Object.keys(properties).map(propertyKey => {
              const property = properties[propertyKey]

              return traverseFields(property, [...path, propertyKey], objectValues, nestedField)
            })}
          </DetailsSection>
        )
      }
      case "string":
      case "integer":
      case "number":
      case "boolean": {
        return label ? <ObjectDetailsListItem key={name} name={name} label={object.title} value={getValues()} /> : <></>
      }
      case "array": {
        return object.items.enum ? (
          <CheckboxArray key={name} name={name} label={object.title} values={getValues()}></CheckboxArray>
        ) : (
          <DetailsArray key={name} object={object} objectValues={objectValues} values={getValues()} path={path} />
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

const DetailsListItem = withStyles(() => ({
  root: {
    paddingTop: "0",
    paddingBottom: "0",
  },
}))(ListItem) as typeof ListItem

const ObjectDetailsListItem = ({ name, label, value }: { name: string; label: string; value: any }) => {
  return (
    <DetailsListItem data-testid={name}>
      <ListItemText disableTypography primary={`${label}: ${value}`}></ListItemText>
    </DetailsListItem>
  )
}

type DetailsSectionProps = {
  name: string
  label: string
  level: number
  children?: React.ReactNode
}

const DetailsSection = ({ name, label, level, children }: DetailsSectionProps) => {
  const classes = useStyles()

  return (
    <div className="detailsSection" key={`${name}-section`} data-testid="section">
      <Typography key={`${name}-header`} className={classes.sectionHeader} variant={`h${level}` as Variant}>
        {label}
      </Typography>
      {children}
    </div>
  )
}

type OneOfFieldProps = {
  path: string[]
  object: any
  objectValues: any
}

const OneOfField = ({ path, object, objectValues }: OneOfFieldProps) => {
  const name = pathToName(path)

  // Number & boolean field values are handled as string
  const stringTypes = ["number", "boolean"]
  const optionValue = stringTypes.includes(typeof get(objectValues, name)) ? "string" : get(objectValues, name)
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
  values: any
}

const CheckboxArray = ({ label, values }: CheckboxArrayProps) => {
  return (
    <List>
      <Typography color="primary">{label}</Typography>
      {values.map((item: any = null) => (
        <DetailsListItem key={item} data-testid="checkbox-item">
          <Checkbox checked={true} color="primary" disabled></Checkbox>
          {item}
        </DetailsListItem>
      ))}
    </List>
  )
}

type DetailsArrayProps = {
  object: any
  path: Array<string>
  objectValues: any
  values: any
}

const DetailsArray = ({ object, path, objectValues, values }: DetailsArrayProps) => {
  const classes = useStyles()
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const level = path.length + 1

  const items = traverseValues(object.items)

  return (
    <div className="array" key={`${name}-array`}>
      <Typography
        className={classes.sectionHeader}
        key={`${name}-header`}
        variant={`h${level}` as Variant}
        data-testid={name}
      >
        {label}
      </Typography>
      {values.map((field: any, index: number) => {
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
                  object={items}
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

                return traverseFields(properties[item], pathForThisIndex, objectValues)
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
