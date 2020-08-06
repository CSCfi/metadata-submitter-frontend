import React from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import { buildYup } from "schema-to-yup"
import { FastField, FieldArray, useField } from "formik"
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
    return traverseValues(schema["properties"])
  } catch (error) {
    console.error(error)
  }
}

const traverseValues = properties => {
  let values = {}
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    if (property["oneOf"]) continue
    switch (property["type"]) {
      case "object": {
        values[propertyKey] = traverseValues(property["properties"])
        break
      }
      case "string": {
        values[propertyKey] = ""
        break
      }
      case "integer": {
        values[propertyKey] = ""
        break
      }
      case "number": {
        values[propertyKey] = 0
        break
      }
      case "boolean": {
        values[propertyKey] = false
        break
      }
      case "array": {
        values[propertyKey] = []
        break
      }
      default: {
        console.error(`No parsing support for type ${property["type"]} yet`)
        break
      }
    }
  }
  return values
}

const buildFields = schema => {
  try {
    let components = [FormHeader(`New ${schema["title"].toLowerCase()}`, `${schema["title"]}-header`, 1)]
    components.push(...traverseFields(schema["properties"]))
    return components
  } catch (error) {
    console.error(error)
  }
}

const traverseFields = (properties, path = "", level = 2) => {
  let components = []
  for (const propertyKey in properties) {
    const property = properties[propertyKey]
    const name = `${path}${propertyKey}`
    const label = property["title"] ? property["title"] : propertyKey
    if (property["oneOf"]) {
      components.push(OneOfSelectField)
      continue
    }
    switch (property["type"]) {
      case "object": {
        components.push(FormHeader(label, name, level))
        components.push(...traverseFields(property["properties"], `${path}${propertyKey}.`, level + 1))
        break
      }
      case "array": {
        components.push(FormHeader(label, name, level))
        const component = property["items"]["enum"]
          ? FormCheckBoxArray(name, property["items"]["enum"])
          : FormArray(name, label, property, path, level)
        components.push(component)
        break
      }
      default: {
        const component = SolveSuitableComponent(name, label, property)
        if (component) components.push(component)
        break
      }
    }
  }
  return components
}

const OneOfSelectField = () => (
  <TextField id="joujou" select label="Select" value="jou" onChange={() => console.log("newvalue")}>
    <option value="mage">Mage</option>
    <option value="gema">Gema</option>
  </TextField>
)

const SolveSuitableComponent = (name, label, property, path, level) => {
  switch (property["type"]) {
    case "string": {
      return property["enum"] ? FormSelectField(name, label, property["enum"]) : FormTextField(name, label)
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
    case "object": {
      return [FormHeader(label, name, level), ...traverseFields(property["properties"], `${path}${name}.`, level + 1)]
    }
    case "array": {
      console.error("Arrays inside arrays are not supported")
      return null
    }
    default: {
      console.error(`
        No parsing support for type ${property["type"]} yet. 
        Details about this object: 
        `)
      console.error(JSON.stringify(property))
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
    <FastField
      name={name}
      key={name}
      component={TextField}
      select
      label={label}
      SelectProps={{
        native: true,
      }}
    >
      <option aria-label="None" value="" disabled />
      {options.map(option => (
        <option key={`${name}.${option}`} value={option}>
          {option}
        </option>
      ))}
    </FastField>
  )
}

const FormBooleanField = (name, label) => (
  <FastField name={name} key={name} type="checkbox" component={CheckboxWithLabel} Label={{ label: label }} />
)

const FormCheckBoxArray = (name, items) => (
  <div key={name}>
    {items.map(item => (
      <FastField
        key={`${name}-${item}`}
        component={CheckboxWithLabel}
        name={name}
        Label={{ label: item }}
        type="checkbox"
        value={item}
      />
    ))}
  </div>
)

const FormArray = (name, label, property, path, level) => {
  const itemStructure = traverseValues(property["items"]["properties"])
  const [, meta] = useField(name)
  const { value } = meta
  return (
    <FieldArray name={name} key={`${name}-array`}>
      {({ remove, push }) => (
        <div className="array">
          {value.length > 0 &&
            value.map((_, index) => (
              <div className="arrayRow" key={`${name}.${index}`}>
                <Paper elevation={2}>
                  {Object.keys(itemStructure).map(item => {
                    const innerName = `${name}.${index}.${item}`
                    const innerLabel = item
                    const innerProperty = property["items"]["properties"][item]
                    return SolveSuitableComponent(innerName, innerLabel, innerProperty, path, level)
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
            onClick={() => push(itemStructure)}
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
