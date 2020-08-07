//@flow
import * as React from "react"
import { FastField, FieldArray } from "formik"
import { CheckboxWithLabel } from "formik-material-ui"
import TextField from "@material-ui/core/TextField"
import AddIcon from "@material-ui/icons/Add"
import Typography from "@material-ui/core/Typography"
import IconButton from "@material-ui/core/IconButton"
import RemoveIcon from "@material-ui/icons/Remove"
import Button from "@material-ui/core/Button"
import Paper from "@material-ui/core/Paper"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import Checkbox from "@material-ui/core/Checkbox"

const buildFields = (schema: any, register: void) => {
  try {
    return traverseFields(schema, register, [])
  } catch (error) {
    console.error(error)
  }
}

const pathToName = (path: string[]) => path.join(".")

const traverseFields = (object: any, register: void, path: string[]) => {
  if (object["oneOf"]) return
  const name = pathToName(path)
  const label = object["title"] ? object["title"] : name
  switch (object["type"]) {
    case "object": {
      let components = []
      const properties = object["properties"]
      for (const propertyKey in properties) {
        const property = properties[propertyKey]
        components.push(traverseFields(property, register, [...path, propertyKey]))
      }
      return (
        <FormSection key={name} name={name} label={label} level={path.length + 1}>
          {components}
        </FormSection>
      )
    }
    case "string": {
      return object["enum"] ? (
        <FormSelectField key={name} name={name} label={label} options={object["enum"]} register={register} />
      ) : (
        <FormTextField key={name} name={name} label={label} register={register} />
      )
    }
    case "integer": {
      return <FormTextField key={name} name={name} label={label} register={register} />
    }
    case "number": {
      return <FormNumberField key={name} name={name} label={label} register={register} />
    }
    case "boolean": {
      return <FormBooleanField key={name} name={name} label={label} register={register} />
    }
    case "array": {
      return object["items"]["enum"] ? (
        <FormCheckBoxArray key={name} name={name} label={label} options={object["items"]["enum"]} register={register} />
      ) : (
        <div key={name}>Array not supported</div>
        //<FormArray key={name} object={object["items"]} values={values} path={path} />
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
  register: void,
}

const FormSection = (props: FormFieldBase & { level: number, children?: React.Node }) => {
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

const FormTextField = ({ name, label, register }: FormFieldBase) => (
  <TextField name={name} label={label} inputRef={register} />
)

const FormNumberField = ({ name, label, register }: FormFieldBase) => (
  <TextField name={name} label={label} type="number" inputRef={register} />
)

const FormSelectField = ({ name, label, options, register }: FormFieldBase & { options: string[] }) => {
  return (
    <TextField name={name} select label={label} SelectProps={{ native: true }} inputRef={register}>
      <option aria-label="None" value="" disabled />
      {options.map(option => (
        <option key={`${name}-${option}`} value={option}>
          {option}
        </option>
      ))}
    </TextField>
  )
}

const FormBooleanField = ({ name, label, register }: FormFieldBase) => (
  <FormControlLabel control={<Checkbox name={name} inputRef={register} />} label={label} />
)

const FormCheckBoxArray = ({ name, label, options, register }: FormFieldBase & { options: string[] }) => (
  <div>
    <p>
      <strong>{label}</strong> - check from following options
    </p>
    {options.map(option => (
      <FormControlLabel
        key={option}
        control={<Checkbox name={name} inputRef={register} value={option} color="primary" />}
        label={option}
      />
    ))}
  </div>
)

export default {
  buildFields,
}
