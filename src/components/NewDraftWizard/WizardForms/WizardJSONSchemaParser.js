//@flow
import * as React from "react"
import { useState } from "react"

import $RefParser from "@apidevtools/json-schema-ref-parser"
import { FormControl } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"
import FormGroup from "@material-ui/core/FormGroup"
import FormHelperText from "@material-ui/core/FormHelperText"
import IconButton from "@material-ui/core/IconButton"
import Paper from "@material-ui/core/Paper"
import { withStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Typography from "@material-ui/core/Typography"
import AddIcon from "@material-ui/icons/Add"
import RemoveIcon from "@material-ui/icons/Remove"
import * as _ from "lodash"
import { useFieldArray, useFormContext } from "react-hook-form"

/*
 * Highlight style for required fields
 */
const highlightStyle = theme => {
  return {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }
}

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
 * Clean up form values from empty strings and objects, translate numbers inside strings to numbers.
 */
const cleanUpFormValues = (data: any): {} => {
  const cleanedData = JSON.parse(JSON.stringify(data))
  return traverseFormValuesForCleanUp(cleanedData)
}

const traverseFormValuesForCleanUp = (data: any) => {
  Object.keys(data).forEach(key => {
    if (typeof data[key] === "object") {
      data[key] = traverseFormValuesForCleanUp(data[key])
      if (Object.keys(data[key]).length === 0) delete data[key]
    }
    if (data[key] === "") {
      delete data[key]
    } else if (typeof data[key] === "string" && !isNaN(data[key])) {
      data[key] = Number(data[key])
    }
  })
  return data
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
 * Build react-hook-form fields based on given schema
 */

const buildFields = (schema: any): ?React.Node => {
  try {
    return traverseFields(schema, [])
  } catch (error) {
    console.error(error)
  }
}

/*
 * Allow children components inside ConnectForm to pull react-hook-form objects and methods from context
 */
const ConnectForm = ({ children }: { children: any }) => {
  const methods = useFormContext()
  return children({ ...methods })
}

/*
 * Translate array of path object levels (such as ["descriptor", "studyType"]) to unique name ("descriptor.studyType")
 */
const pathToName = (path: string[]) => path.join(".")

/*
 * Get defaultValue for options in a form. Used when rendering a saved/submitted form
 */
const getDefaultValue = (nestedField?: any, name: string) => {
  return nestedField ? nestedField[name.split(".")[1]] : ""
}

/*
 * Traverse fields recursively, return correct fields for given object or log error, if object type is not supported.
 */
const traverseFields = (object: any, path: string[], requiredProperties?: string[], nestedField?: any) => {
  const name = pathToName(path)

  if (object.oneOf) return <FormOneOfField key={name} path={path} object={object} />
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const required = !!requiredProperties?.includes(lastPathItem)
  switch (object.type) {
    case "object": {
      const properties = object.properties
      return (
        <FormSection key={name} name={name} label={label} level={path.length + 1}>
          {Object.keys(properties).map(propertyKey => {
            const property = properties[propertyKey]
            const required = object?.else?.required ?? object.required
            return traverseFields(property, [...path, propertyKey], required, nestedField)
          })}
        </FormSection>
      )
    }
    case "string": {
      return object["enum"] ? (
        <FormSelectField
          key={name}
          name={name}
          label={label}
          options={object.enum}
          required={required}
          nestedField={nestedField}
        />
      ) : (
        <FormTextField key={name} name={name} label={label} required={required} nestedField={nestedField} />
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
        <FormArray key={name} object={object} path={path} />
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

/*
 * FormSection is rendered for properties with type object
 */
const FormSection = (props: FormSectionProps) => {
  const { name, label, level } = props
  return (
    <ConnectForm>
      {({ errors }) => {
        const error = _.get(errors, name)
        return (
          <div>
            <div className="formSection" key={`${name}-section`}>
              <Typography key={`${name}-header`} variant={`h${level}`}>
                {label}
              </Typography>
              {props.children}
            </div>
            <div>
              {error ? (
                <FormControl error>
                  <FormHelperText>
                    {label} {error?.message}
                  </FormHelperText>
                </FormControl>
              ) : null}
            </div>
          </div>
        )
      }}
    </ConnectForm>
  )
}

type FormFieldBaseProps = {
  name: string,
  label: string,
  required: boolean,
}

type FormSelectFieldProps = FormFieldBaseProps & { options: string[], nestedField?: any }

/*
 * FormOneOfField is rendered if property can be choosed from many possible.
 */
const FormOneOfField = ({ path, object, nestedField }: { path: string[], object: any, nestedField?: any }) => {
  const options = object.oneOf
  // Get the fieldValue when rendering a saved/submitted form
  // For e.g. obj.required is ["label", "url"] and nestedField is {id: "sth1", label: "sth2", url: "sth3"}
  let fieldValue = ""
  if (nestedField) {
    for (let obj of options) {
      obj.required.every(val => Object.keys(nestedField).includes(val)) ? (fieldValue = obj.title) : ""
    }
  }
  const [field, setField] = useState(fieldValue)

  const handleChange = event => setField(event.target.value)
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem

  return (
    <ConnectForm>
      {({ errors }) => {
        const error = _.get(errors, name)
        return (
          <div>
            <TextField
              name={name}
              label={label}
              defaultValue={field}
              select
              SelectProps={{ native: true }}
              onChange={handleChange}
              error={!!error}
              helperText={error?.message}
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
            {field ? traverseFields(options.filter(option => option.title === field)[0], path, [], nestedField) : null}
          </div>
        )
      }}
    </ConnectForm>
  )
}

/*
 * Highlight required input fields
 */
const ValidationTextField = withStyles(theme => ({
  root: {
    "& input:invalid:not(:valid) + fieldset": highlightStyle(theme),
  },
}))(TextField)

/*
 * FormTextField is the most usual type, rendered for strings, integers and numbers.
 */
const FormTextField = ({
  name,
  label,
  required,
  type = "string",
  nestedField,
}: FormFieldBaseProps & { type?: string, nestedField?: any }) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      const multiLineRowIdentifiers = ["description", "abstract", "policy text"]

      return (
        <ValidationTextField
          name={name}
          inputProps={{ "data-testid": name }}
          label={label}
          role="textbox"
          inputRef={register}
          defaultValue={getDefaultValue(nestedField, name)}
          error={!!error}
          helperText={error?.message}
          required={required}
          type={type}
          multiline={multiLineRowIdentifiers.some(value => label.toLowerCase().includes(value))}
          rows={5}
        />
      )
    }}
  </ConnectForm>
)

/*
 * Highlight required select fields
 */
const ValidationSelectField = withStyles(theme => ({
  root: {
    "& select:required:not(:valid) + svg + fieldset": highlightStyle(theme),
  },
}))(TextField)

/*
 * FormSelectField is rendered for choosing one from many options
 */
const FormSelectField = ({ name, label, required, options, nestedField }: FormSelectFieldProps) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      return (
        <ValidationSelectField
          name={name}
          label={label}
          inputRef={register}
          defaultValue={getDefaultValue(nestedField, name)}
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
        </ValidationSelectField>
      )
    }}
  </ConnectForm>
)

/*
 * FormSelectField is rendered for checkboxes
 */
const FormBooleanField = ({ name, label, required }: FormFieldBaseProps) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      return (
        <Box display="inline" px={1}>
          <FormControl error={!!error} required={required}>
            <FormGroup>
              <FormControlLabel control={<Checkbox name={name} inputRef={register} defaultValue="" />} label={label} />
              <FormHelperText>{error?.message}</FormHelperText>
            </FormGroup>
          </FormControl>
        </Box>
      )
    }}
  </ConnectForm>
)

/*
 * FormSelectField is rendered for selection from options where it's possible to choose many options
 */
const FormCheckBoxArray = ({ name, label, required, options }: FormSelectFieldProps) => (
  <Box px={1}>
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
  </Box>
)

type FormArrayProps = {
  object: any,
  path: Array<string>,
}

/*
 * FormArray is rendered for arrays of objects. User is given option to choose how many objects to add to array.
 */
const FormArray = ({ object, path }: FormArrayProps) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const items = (traverseValues(object.items): any)
  const level = path.length + 1
  const { fields, append, remove } = useFieldArray({ name })

  return (
    <div className="array" key={`${name}-array`}>
      <Typography key={`${name}-header`} variant={`h${level}`}>
        {label}
      </Typography>
      {fields.map((field, index) => {
        const [lastPathItem] = path.slice(-1)
        const pathWithoutLastItem = path.slice(0, -1)
        const lastPathItemWithIndex = `${lastPathItem}[${index}]`
        if (items.oneOf) {
          const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex]

          return (
            <div className="arrayRow" key={`${name}[${index}]`}>
              <Paper elevation={2}>
                <FormOneOfField key={`${name}[${index}]`} nestedField={field} path={pathForThisIndex} object={items} />
              </Paper>
              <IconButton onClick={() => remove(index)}>
                <RemoveIcon />
              </IconButton>
            </div>
          )
        }
        const properties = object.items.properties

        return (
          <div className="arrayRow" key={`${name}[${index}]`}>
            <Paper name="asd" elevation={2}>
              {Object.keys(items).map(item => {
                const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex, item]
                return traverseFields(properties[item], pathForThisIndex, [], field)
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
  cleanUpFormValues,
}
