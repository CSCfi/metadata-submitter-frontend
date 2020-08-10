//@flow
import * as React from "react"
import { useState } from "react"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import AddIcon from "@material-ui/icons/Add"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import IconButton from "@material-ui/core/IconButton"
import Paper from "@material-ui/core/Paper"
import RemoveIcon from "@material-ui/icons/Remove"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import { useFieldArray, useFormContext } from "react-hook-form"
import * as _ from "lodash"
import FormHelperText from "@material-ui/core/FormHelperText"
import FormGroup from "@material-ui/core/FormGroup"
import { FormControl } from "@material-ui/core"

const dereferenceSchema = async (schema: any) => {
  let dereferenced = JSON.parse(JSON.stringify(schema))
  await $RefParser.dereference(dereferenced)
  delete dereferenced["definitions"]
  return dereferenced
}

const traverseValues = (object: any) => {
  if (object["oneOf"]) return
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

const buildFields = (schema: any) => {
  try {
    return traverseFields(schema, [])
  } catch (error) {
    console.error(error)
  }
}

const ConnectForm = ({ children }: { children: any }) => {
  const methods = useFormContext()
  return children({ ...methods })
}

const pathToName = (path: string[]) => path.join(".")

const traverseFields = (object: any, path: string[], requiredProperties?: string[]) => {
  const name = pathToName(path)
  if (object.oneOf) return <FormOneOfField key={name} path={path} object={object} />
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? name
  const required = !!requiredProperties?.includes(lastPathItem)
  switch (object.type) {
    case "object": {
      const properties = object.properties
      return (
        <FormSection key={name} name={name} label={label} level={path.length + 1}>
          {Object.keys(properties).map(propertyKey => {
            const property = properties[propertyKey]
            const required = object?.else?.required ?? object.required
            return traverseFields(property, [...path, propertyKey], required)
          })}
        </FormSection>
      )
    }
    case "string": {
      return object["enum"] ? (
        <FormSelectField key={name} name={name} label={label} options={object.enum} required={required} />
      ) : (
        <FormTextField key={name} name={name} label={label} required={required} />
      )
    }
    case "integer": {
      return <FormTextField key={name} name={name} label={label} required={required} />
    }
    case "number": {
      return <FormTextField key={name} name={name} label={label} required={required} type="number" />
    }
    case "boolean": {
      return <FormBooleanField key={name} name={name} label={label} required={required} />
    }
    case "array": {
      return object.items.enum ? (
        <FormCheckBoxArray key={name} name={name} label={label} options={object.items.enum} required={required} />
      ) : (
        <FormArray key={name} object={object.items} path={path} />
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

type FormSectionProps = {
  name: string,
  label: string,
  level: number,
  children?: React.Node,
}

const FormSection = (props: FormSectionProps) => {
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

type FormFieldBaseProps = {
  name: string,
  label: string,
  required: boolean,
}

type FormSelectFieldProps = FormFieldBaseProps & { options: string[] }

const FormOneOfField = ({ path, object }: { path: string[], object: any }) => {
  const [field, setField] = useState("")
  const handleChange = event => setField(event.target.value)
  const name = pathToName(path)
  const label = object.title ?? name
  const options = object.oneOf
  return (
    <div>
      <TextField
        name={name}
        label={label}
        defaultValue=""
        select
        SelectProps={{ native: true }}
        onChange={handleChange}
      >
        <option aria-label="None" value="" disabled />
        {options.map(optionObject => {
          const option = optionObject.title
          return (
            <option key={`${name}-${option}`} value={option}>
              {option}
            </option>
          )
        })}
      </TextField>
      {field ? traverseFields(options.filter(option => option.title === field)[0], path) : null}
    </div>
  )
}

const FormTextField = ({ name, label, required, type = "string" }: FormFieldBaseProps & { type?: string }) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      return (
        <TextField
          name={name}
          label={label}
          inputRef={register}
          defaultValue=""
          error={!!error}
          helperText={error?.message}
          required={required}
          type={type}
        />
      )
    }}
  </ConnectForm>
)

const FormSelectField = ({ name, label, required, options }: FormSelectFieldProps) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      return (
        <TextField
          name={name}
          label={label}
          inputRef={register}
          defaultValue=""
          error={!!error}
          helperText={error?.message}
          required={required}
          select
          SelectProps={{ native: true }}
        >
          <option aria-label="None" value="" disabled />
          {options.map(option => (
            <option key={`${name}-${option}`} value={option}>
              {option}
            </option>
          ))}
        </TextField>
      )
    }}
  </ConnectForm>
)

const FormBooleanField = ({ name, label, required }: FormFieldBaseProps) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      return (
        <FormControl error={!!error} required={required}>
          <FormGroup>
            <FormControlLabel control={<Checkbox name={name} inputRef={register} defaultValue="" />} label={label} />
            <FormHelperText>{error?.message}</FormHelperText>
          </FormGroup>
        </FormControl>
      )
    }}
  </ConnectForm>
)

const FormCheckBoxArray = ({ name, label, required, options }: FormSelectFieldProps) => (
  <div>
    <p>
      <strong>{label}</strong> - check from following options
    </p>
    <ConnectForm>
      {({ register, errors }) => {
        const error = _.get(errors, name)
        return (
          <FormControl error={!!error} required={required}>
            <FormGroup>
              {options.map<React.Element<typeof FormControlLabel>>(option => (
                <FormControlLabel
                  key={option}
                  control={<Checkbox name={name} inputRef={register} value={option} color="primary" defaultValue="" />}
                  label={option}
                />
              ))}
              <FormHelperText>{error?.message}</FormHelperText>
            </FormGroup>
          </FormControl>
        )
      }}
    </ConnectForm>
  </div>
)

type FormArrayProps = {
  object: any,
  path: Array<string>,
}

const FormArray = ({ object, path }: FormArrayProps) => {
  const name = pathToName(path)
  const items = (traverseValues(object): any)
  const { fields, append, remove } = useFieldArray({ name })
  return (
    <div className="array" key={`${name}-array`}>
      {fields.map((field, index) => {
        const [lastPathItem] = path.slice(-1)
        const pathWithoutLastItem = path.slice(0, -1)
        const lastPathItemWithIndex = `${lastPathItem}[${index}]`
        return (
          <div className="arrayRow" key={`${name}[${index}]`}>
            <Paper elevation={2}>
              {Object.keys(items).map(item => {
                const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex, item]
                const required = object?.else?.required ?? object.required
                return traverseFields(object["properties"][item], pathForThisIndex, required)
              })}
            </Paper>
            <IconButton onClick={() => remove(index)}>
              <RemoveIcon />
            </IconButton>
          </div>
        )
      })}
      <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={() => append(items)}>
        Add new item
      </Button>
    </div>
  )
}

export default {
  dereferenceSchema,
  buildFields,
}
