//@flow
import * as React from "react"
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

const pathToName = ({ path }: { path: Array<string> }) => path.join(".")

const traverseFields = (object, values, path) => {
  if (object["oneOf"]) return
  const name = pathToName({ path })
  const label = object["title"] ? object["title"] : name
  switch (object["type"]) {
    case "object": {
      let components = []
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        components.push(traverseFields(property, values[propertyKey], [...path, propertyKey]))
      }
      return (
        <FormSection name={name} label={label} level={path.length + 1}>
          {components}
        </FormSection>
      )
    }
    case "string": {
      return object["enum"] ? (
        <FormSelectField name={name} label={label} options={object["enum"]} />
      ) : (
        <FormTextField name={name} label={label} />
      )
    }
    case "integer": {
      return <FormTextField name={name} label={label} />
    }
    case "number": {
      return <FormNumberField name={name} label={label} />
    }
    case "boolean": {
      return <FormBooleanField name={name} label={label} />
    }
    case "array": {
      return object["items"]["enum"] ? (
        <FormCheckBoxArray name={name} label={label} options={object["items"]["enum"]} />
      ) : (
        <FormArray object={object["items"]} values={values} path={path} />
      )
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

type FormFieldBase = {
  name: string,
  label: string,
}

const FormSection = (props: FormFieldBase & { level: Number, children?: React.Node }) => {
  const { name, label, level } = props
  return (
    <div className="formSection" key={`${name}-section`}>
      <Typography key={`${name}-header`} variant={`h${level}`}>
        {label}
      </Typography>
      {props.children}
    </div>
  )
}

const FormTextField = ({ name, label }: FormFieldBase) => (
  <FastField name={name} key={name} label={label} component={TextField} />
)

const FormNumberField = ({ name, label }: FormFieldBase) => (
  <FastField name={name} key={name} label={label} type="number" component={TextField} />
)

const FormSelectField = ({ name, label, options }: FormFieldBase & { options: Array<string> }) => {
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

const FormBooleanField = ({ name, label }: FormFieldBase) => (
  <FastField name={name} key={name} type="checkbox" component={CheckboxWithLabel} Label={{ label: label }} />
)

const FormCheckBoxArray = ({ name, label, options }: FormFieldBase & { options: Array<string> }) => (
  <div key={name}>
    {label} - check from following options
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

type FormArrayProps = {
  object: any,
  values: any,
  path: Array<string>,
}

const FormArray = ({ object, values, path }: FormArrayProps) => {
  const name = pathToName({ path })
  const items = traverseValues(object)
  return (
    <FieldArray name={name} key={`${name}-array`}>
      {({ remove, push }) => (
        <div className="array" key={name}>
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
