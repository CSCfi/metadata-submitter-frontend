import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { FastField, FieldArray } from "formik"
import { CheckboxWithLabel, TextField } from "formik-material-ui"
import AddIcon from "@material-ui/icons/Add"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import RemoveIcon from "@material-ui/icons/Remove"
import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"

const dereferenceSchema = async schema => {
  await $RefParser.dereference(schema)
  delete schema["definitions"]
}

const buildYupSchema = async schema => {
  try {
    const config = {}
    return buildYup(schema, config)
  } catch (error) {
    console.error(error)
  }
}

const buildInitialValues = schema => {
  try {
    return traverseValues(schema)
  } catch (error) {
    console.error(error)
  }
}

const traverseValues = object => {
  if (object["oneOf"]) return
  switch (object["type"]) {
    case "object": {
      let values = {}
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        values[propertyKey] = traverseValues(property)
      }
      return values
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

const buildFields = (schema, values) => {
  try {
    return traverseFields(schema, values, [])
  } catch (error) {
    console.error(error)
  }
}

const pathToName = path => path.join(".")

const traverseFields = (object, values, path) => {
  if (object["oneOf"]) return
  const name = pathToName(path)
  const label = object["title"] ? object["title"] : name
  switch (object["type"]) {
    case "object": {
      let components = []
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        components.push(traverseFields(property, values[propertyKey], [...path, propertyKey]))
      }
      return components
    }
    case "string": {
      return object["enum"] ? FormSelectField(name, label, object["enum"]) : FormTextField(name, label)
    }
    case "integer": {
      return FormTextField(name, label)
    }
    case "number": {
      return FormNumberField(name, label)
    }
    case "boolean": {
      return FormBooleanField(name, label)
    }
    case "array": {
      return object["items"]["enum"]
        ? FormCheckBoxArray(name, object["items"]["enum"])
        : FormArray(object["items"], values, path)
    }
    default: {
      console.error(`
      No field parsing support for type ${object["type"]} yet.
      
      Pretty printed version of object with unsupported type:
      ${JSON.stringify(object, null, 2)}
      `)
      return null
    }
  }
}

const FormHeader = (text, name, level) => {
  const variant = level > 6 ? "body1" : `h${level}`
  return (
    <Typography variant={variant} key={`${name}-header`}>
      {text}
    </Typography>
  )
}

const FormTextField = (name, label) => <FastField name={name} key={name} label={label} component={TextField} />

const FormNumberField = (name, label) => (
  <FastField name={name} key={name} label={label} type="number" component={TextField} />
)

const FormSelectField = (name, label, options) => {
  return (
    <FastField name={name} key={name} component={TextField} select label={label} SelectProps={{ native: true }}>
      <option aria-label="None" value="" disabled />
      {options.map(option => (
        <option key={`${name}-${option}`} value={option}>
          {option}
        </option>
      ))}
    </FastField>
  )
}

const FormBooleanField = (name, label) => (
  <FastField name={name} key={name} type="checkbox" component={CheckboxWithLabel} Label={{ label: label }} />
)

const FormCheckBoxArray = (name, options) => (
  <div key={name}>
    {options.map(option => (
      <FastField
        key={`${name}-${option}`}
        component={CheckboxWithLabel}
        name={name}
        Label={{ label: option }}
        type="checkbox"
        value={option}
      />
    ))}
  </div>
)

const FormArray = (object, values, path) => {
  const name = pathToName(path)
  const items = traverseValues(object)
  return (
    <FieldArray name={name} key={`${name}-array`}>
      {({ remove, push }) => (
        <div className="array">
          {values.length > 0 &&
            values.map((_, index) => (
              <div className="arrayRow" key={`${name}.${index}`}>
                <Paper elevation={2}>
                  {Object.keys(items).map(item => {
                    const [lastPathItem] = path.slice(-1)
                    const lastPathItemWithIndex = `${lastPathItem}[${index}]`
                    const newPath = [path.slice(0, -1), lastPathItemWithIndex, item]
                    return traverseFields(object["properties"][item], values[index][item], newPath)
                  })}
                </Paper>
                <IconButton key={`${name}.${index}-removeButton`} onClick={() => remove(index)}>
                  <RemoveIcon />
                </IconButton>
              </div>
            ))}
          <Button
            key={`${name}-addButton`}
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => push(items)}
          >
            Add new item
          </Button>
        </div>
      )}
    </FieldArray>
  )
}

export default {
  dereferenceSchema,
  buildInitialValues,
  buildFields,
  buildYupSchema,
}

//case "object": {
//  return [FormHeader(label, name, level), ...traverseFields(property["properties"], `${path}${name}.`, level + 1)]
//}
//switch (property["type"]) {
//  case "object": {
//    components.push(FormHeader(label, name, level))
//    components.push(...traverseFields(property["properties"], `${path}${propertyKey}.`, level + 1))
//    break
//  }
//  case "array": {
//    components.push(FormHeader(label, name, level))
//    const component = property["items"]["enum"]
//      ? FormCheckBoxArray(name, property["items"]["enum"])
//      : FormArray(name, label, property, path, level)
//    components.push(component)
//    break
//  }
//  default: {
//    //const component = SolveSuitableComponent(name, label, property)
//    //if (component) components.push(component)
//    break
//  }
//}
