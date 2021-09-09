//@flow
import * as React from "react"

import $RefParser from "@apidevtools/json-schema-ref-parser"
import Box from "@material-ui/core/Box"
import Checkbox from "@material-ui/core/Checkbox"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Paper from "@material-ui/core/Paper"
import { makeStyles, withStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import { get } from "lodash"

const useStyles = makeStyles(theme => ({
  sectionHeader: {
    margin: theme.spacing(1, 0),
    fontSize: theme.typography.pxToRem(16),
    fontWeight: "600",
    lineHeight: "1.75",
    letterSpacing: "0.00938em",
    color: theme.palette.primary.main,
  },
}))

/*
 * Solve $ref -references in schema, return new schema instead of modifying passed in-place.
 */
const dereferenceSchema = async (schema: any): Promise<any> => {
  let dereferenced = JSON.parse(JSON.stringify(schema))
  await $RefParser.dereference(dereferenced)
  delete dereferenced["definitions"]
  return dereferenced
}

/*
 * Parse initial values from given object
 */
const traverseValues = (object: any) => {
  if (object["oneOf"]) return object
  switch (object["type"]) {
    case "object": {
      let values = {}
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        values[propertyKey] = traverseValues(property)
      }

      return ((values: any): typeof object)
    }
    case "string": {
      return ""
    }
    case "integer": {
      return ""
    }
    case "number": {
      return 0
    }
    case "boolean": {
      return false
    }
    case "array": {
      return []
    }
    case "null": {
      return null
    }
    default: {
      console.error(`
      No initial value parsing support for type ${object["type"]} yet.

      Pretty printed version of object with unsupported type:
      ${JSON.stringify(object, null, 2)}
      `)
      break
    }
  }
}

/*
 * Build object details based on given schema
 */

const buildDetails = (schema: any, objectValues: any): ?React.Node => {
  try {
    return traverseFields(schema, [], objectValues)
  } catch (error) {
    console.error(error)
  }
}

/*
 * Translate array of path object levels (such as ["descriptor", "studyType"]) to unique name ("descriptor.studyType")
 */
const pathToName = (path: string[]) => path.join(".")

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
        return <ObjectDetailsListItem key={name} name={name} label={object.title} value={getValues()} />
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
}))(ListItem)

const ObjectDetailsListItem = ({ name, label, value }: { name: string, label: string, value: any }) => {
  return (
    label && (
      <DetailsListItem data-testid={name}>
        <ListItemText disableTypography primary={`${label}: ${value}`}></ListItemText>
      </DetailsListItem>
    )
  )
}

type DetailsSectionProps = {
  name: string,
  label: string,
  level: number,
  children?: React.Node,
}

const DetailsSection = ({ name, label, level, children }: DetailsSectionProps) => {
  const classes = useStyles()

  return (
    <div className="detailsSection" key={`${name}-section`} data-testid="section">
      <Typography key={`${name}-header`} className={classes.sectionHeader} variant={`h${level}`}>
        {label}
      </Typography>
      {children}
    </div>
  )
}

type OneOfFieldProps = {
  path: string[],
  object: any,
  objectValues: any,
}

const OneOfField = ({ path, object, objectValues }: OneOfFieldProps) => {
  const name = pathToName(path)

  // Number & boolean field values are handled as string
  const stringTypes = ["number", "boolean"]
  const optionValue = stringTypes.includes(typeof get(objectValues, name)) ? "string" : get(objectValues, name)
  const optionType = Array.isArray(optionValue) ? "array" : typeof optionValue
  const options = object.oneOf

  let currentOption = options.find(item => item.type === optionType)

  // Find option when options share type
  if (options.filter(option => option.type === optionType).length > 1) {
    const optionValueKeys = Object?.keys(optionValue)
    for (let option of options) {
      // Find option details in array of values by comparing required fields. E.g. Study > Study Links
      if (option.required) {
        if (option.required.every(val => optionValueKeys.includes(val))) {
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
  name: string,
  label: string,
  values: any,
}

const CheckboxArray = ({ label, values }: CheckboxArrayProps) => {
  return (
    <List>
      <Typography color="primary">{label}</Typography>
      {values.map(item => (
        <DetailsListItem key={item} data-testid="checkbox-item">
          <Checkbox checked={true} color="primary" disabled></Checkbox>
          {item}
        </DetailsListItem>
      ))}
    </List>
  )
}

type DetailsArrayProps = {
  object: any,
  path: Array<string>,
  objectValues: any,
  values: any,
}

const DetailsArray = ({ object, path, objectValues, values }: DetailsArrayProps) => {
  const classes = useStyles()
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const level = path.length + 1

  const items = (traverseValues(object.items): any)

  return (
    <div className="array" key={`${name}-array`}>
      <Typography className={classes.sectionHeader} key={`${name}-header`} variant={`h${level}`} data-testid={name}>
        {label}
      </Typography>
      {values.map((field, index) => {
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
  dereferenceSchema,
  buildDetails,
}
