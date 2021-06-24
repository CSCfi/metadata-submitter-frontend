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
import { makeStyles, withStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Tooltip from "@material-ui/core/Tooltip"
import Typography from "@material-ui/core/Typography"
import AddIcon from "@material-ui/icons/Add"
import HelpOutlineIcon from "@material-ui/icons/HelpOutline"
import RemoveIcon from "@material-ui/icons/Remove"
import * as _ from "lodash"
import { get } from "lodash"
import { useFieldArray, useFormContext, useForm, Controller } from "react-hook-form"
import { useSelector } from "react-redux"

/*
 * Highlight style for required fields
 */
const highlightStyle = theme => {
  return {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }
}

const helpIconStyle = makeStyles(theme => ({
  fieldTip: {
    color: theme.palette.secondary.main,
    marginLeft: theme.spacing(0),
  }
}))

const FieldTooltip = withStyles(theme => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
    fontSize: theme.typography.pxToRem(14),
    boxShadow: theme.shadows[1],
  },
}))(Tooltip)

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
    } else if (typeof data[key] === "string" && !isNaN(data[key]) && key !== "telephoneNumber") {
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
  if (nestedField) {
    const path = name.split(".")
    for (var i = 1, n = path.length; i < n; ++i) {
      var k = path[i]
      if (k in nestedField) {
        nestedField = nestedField[k]
      } else {
        return
      }
    }
    return nestedField
  } else {
    return ""
  }
}

/*
 * Traverse fields recursively, return correct fields for given object or log error, if object type is not supported.
 */
const traverseFields = (
  object: any,
  path: string[],
  requiredProperties?: string[],
  requireFirst?: boolean,
  nestedField?: any
) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const required = !!requiredProperties?.includes(lastPathItem) || requireFirst || false
  const description = object.description

  if (object.oneOf) return <FormOneOfField key={name} path={path} object={object} required={required} />

  switch (object.type) {
    case "object": {
      const properties = object.properties
      return (
        <FormSection key={name} name={name} label={label} level={path.length + 1}>
          {Object.keys(properties).map(propertyKey => {
            const property = properties[propertyKey]
            let required = object?.else?.required ?? object.required
            let requireFirstItem = false

            // Require first field of section if parent section is a required property
            if (
              requireFirst ||
              requiredProperties?.includes(name) ||
              requiredProperties?.includes((Object.keys(properties): any)[0])
            ) {
              requireFirstItem = (Object.values(properties): any)[0].title === property.title ? true : false
            }

            return traverseFields(property, [...path, propertyKey], required, requireFirstItem, nestedField)
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
          description={description}
          nestedField={nestedField}
        />
      ) : (
        <FormTextField key={name} name={name} label={label} required={required} description={description} nestedField={nestedField} />
      )
    }
    case "integer": {
      return <FormTextField key={name} name={name} label={label} required={required} description={description} />
    }
    case "number": {
      return <FormTextField key={name} name={name} label={label} required={required} description={description} type="number" />
    }
    case "boolean": {
      return <FormBooleanField key={name} name={name} label={label} required={required} description={description} />
    }
    case "array": {
      return object.items.enum ? (
        <FormCheckBoxArray key={name} name={name} label={label} options={object.items.enum} required={required} description={description} />
      ) : (
        <FormArray key={name} object={object} path={path} required={required} description={description} />
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
 * Highlight required oneOf and select fields
 */
const ValidationSelectField = withStyles(theme => ({
  root: {
    "& select:required:not(:valid) + svg + fieldset": highlightStyle(theme),
  },
}))(TextField)

/*
 * FormOneOfField is rendered if property can be choosed from many possible.
 */

const FormOneOfField = ({
  path,
  object,
  nestedField,
  required,
}: {
  path: string[],
  object: any,
  nestedField?: any,
  required?: any,
}) => {
  const options = object.oneOf
  const [lastPathItem] = path.slice(-1)
  const description = object.description

  // Get the fieldValue when rendering a saved/submitted form
  // For e.g. obj.required is ["label", "url"] and nestedField is {id: "sth1", label: "sth2", url: "sth3"}
  // Get object from state and set default values if child of oneOf field has values
  // Fetching current object values from state rather than via getValues() method gets values on first call. The getValues method results in empty object on first call
  const currentObject = useSelector(state => state.currentObject) || {}

  const values = currentObject[path]
    ? currentObject
    : currentObject[Object.keys(currentObject).filter(item => path.includes(item))] || {}

  let fieldValue = ""

  const flattenObject = (obj, prefix = "") =>
    Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : ""
      if (typeof obj[k] === "object") Object.assign(acc, flattenObject(obj[k], pre + k))
      else acc[pre + k] = obj[k]
      return acc
    }, {})

  if (Object.keys(values).length > 0) {
    for (const item of path) {
      if (values[item]) {
        const itemValues = values[item]
        const parentPath = Object.keys(itemValues) ? Object.keys(itemValues) : ""

        // Match key from currentObject to option property.
        // Field key can be deeply nested and therefore we need to have multiple cases for finding correct value.
        if (isNaN(parentPath[0])) {
          fieldValue = (options.find(option => option.properties[parentPath])
            ? // Eg. Sample > Sample Names > Sample Data Type
              options.find(option => option.properties[parentPath])
            : // Eg. Run > Run Type > Reference Alignment
              options.find(
                option => option.properties[Object.keys(flattenObject(itemValues))[0].split(".").slice(-1)[0]]
              )
          )?.title
        } else {
          // Eg. Experiment > Expected Base Call Table > Processing > Single Processing
          if (typeof itemValues === "string") {
            fieldValue = options.find(option => option.type === "string").title
          }
          // Eg. Experiment > Expected Base Call Table > Processing > Complex Processing
          else {
            const fieldKey = Object.keys(values[item][0])[0]
            fieldValue = options.find(option => option.items?.properties[fieldKey]).title
          }
        }
      }
    }
  }

  // Eg. Study > Study Links
  if (nestedField) {
    for (let option of options) {
      option.required.every(val => Object.keys(nestedField).includes(val)) ? (fieldValue = option.title) : ""
    }
  }

  // Special handling for Expected Base Call Table > Processing > Complex Processing > Pipeline > Pipe Section > Prev Step Index
  // Can be extended to other fields if needed
  const itemValue = get(currentObject, pathToName(path))

  if (itemValue) {
    switch (lastPathItem) {
      case "prevStepIndex": {
        fieldValue = "String value"
      }
    }
  }

  // Option change handling
  const [field, setField] = useState(fieldValue)
  const handleChange = event => {
    setField(event.target.value)
  }
  const name = pathToName(path)

  const label = object.title ?? lastPathItem

  const getChildObjects = (obj?: any) => {
    if (obj) {
      let childProps
      for (const key in obj) {
        // Check if object has nested "properties"
        if (key === "properties") {
          childProps = obj.properties
          const childPropsValues = Object.values(childProps)[0]
          if (Object.prototype.hasOwnProperty.call(childPropsValues, "properties")) {
            getChildObjects(childPropsValues)
          }
        }
      }

      const firstProp = childProps ? Object.keys(childProps)[0] : ""
      return { obj, firstProp }
    }
    return {}
  }

  return (
    <ConnectForm>
      {({ errors, unregister }) => {
        const error = _.get(errors, name)
        const classes = helpIconStyle()

        // Selected option
        const selectedOption = options?.filter(option => option.title === field)[0]?.properties || {}
        const selectedOptionValues = Object.values(selectedOption)

        let childObject: any
        let requiredProp: string

        // If selectedOption has many nested "properties"
        if (
          selectedOptionValues.length > 0 &&
          Object.prototype.hasOwnProperty.call(selectedOptionValues[0], "properties")
        ) {
          const { obj, firstProp } = getChildObjects(Object.values(selectedOption)[0])
          childObject = obj
          requiredProp = firstProp
        }
        // Else if selectedOption has no nested "properties"
        else {
          childObject = options?.filter(option => option.title === field)[0]
          requiredProp = childObject?.required?.toString() || Object.keys(selectedOption)[0]
        }

        return (
          <div>
              <ValidationSelectField
                name={name}
                label={label}
                defaultValue={field}
                select
                SelectProps={{ native: true }}
                onChange={event => {
                  handleChange(event)
                  // Unregister if nullable field
                  if (event.target.value === "Null value") unregister(name)
                }}
                error={!!error}
                helperText={error?.message}
                required={required}
              >
                <option aria-label="None" value="" disabled />
                {options?.map(optionObject => {
                  const option = optionObject.title
                  return (
                    <option key={`${name}-${option}`} value={option}>
                      {option}
                    </option>
                  )
                })}
              </ValidationSelectField>
              {description && <FieldTooltip title={description} placement="bottom" arrow><HelpOutlineIcon className={classes.fieldTip } /></FieldTooltip>}
            {field
              ? traverseFields(
                  options?.filter(option => option.title === field)[0],
                  path,
                  required && requiredProp ? requiredProp.split(",") : [],
                  childObject?.required ? false : true,
                  nestedField
                )
              : null}
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
    "& input:invalid:not(:valid) + fieldset, textarea:invalid:not(:valid) + fieldset": highlightStyle(theme),
  },
}))(TextField)

/*
 * FormTextField is the most usual type, rendered for strings, integers and numbers.
 */
const FormTextField = ({
  name,
  label,
  required,
  description,
  type = "string",
  nestedField,
}: FormFieldBaseProps & { description: string, type?: string, nestedField?: any }) => (
  <ConnectForm>
    {({ control }) => {
      const classes = helpIconStyle()
      const multiLineRowIdentifiers = ["description", "abstract", "policy text"]
      return (
        <Controller
            render={({ field, fieldState: { error } }) => {
            return (
              <div>
                <ValidationTextField
                  {...field}
                  inputProps={{ "data-testid": name }}
                  label={label}
                  role="textbox"
                  error={!!error}
                  helperText={error?.message}
                  required={required}
                  type={type}
                  multiline={multiLineRowIdentifiers.some(value => label.toLowerCase().includes(value))}
                  rows={5}
                  value={field.value || ""}
                  onChange={e => {
                    const val = e.target.value
                    field.onChange(type === "string" && !isNaN(val) ? val.toString() : val)
                  }}
                />
                {description && <FieldTooltip title={description} placement="bottom" arrow><HelpOutlineIcon className={classes.fieldTip } /></FieldTooltip>}
              </div>
            )
          }}
          name={name}
          control={control}
          defaultValue={getDefaultValue(nestedField, name)}
          rules={{ required: required }}
         />
      )
    }}
  </ConnectForm>
)

/*
 * FormSelectField is rendered for choosing one from many options
 */
const FormSelectField = ({ name, label, required, options, nestedField, description }: FormSelectFieldProps & {description: string}) => (
  <ConnectForm>
    {({ register, errors }) => {
      const error = _.get(errors, name)
      const classes = helpIconStyle()
      const { ref, ...rest } = register(name)

      return (
        <div>
          <ValidationSelectField
            name={name}
            label={label}
            {...rest}
            inputRef={ref}
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
          
          {description && <FieldTooltip title={description} placement="bottom" arrow><HelpOutlineIcon className={classes.fieldTip } /></FieldTooltip>}
        </div>
      )
    }}
  </ConnectForm>
)

/*
 * Highlight required Checkbox
 */
const ValidationFormControlLabel = withStyles(theme => ({
  label: {
    "& span": { color: theme.palette.primary.main },
  },
}))(FormControlLabel)

/*
 * FormSelectField is rendered for checkboxes
 */
const FormBooleanField = ({ name, label, required,description }: FormFieldBaseProps & {description: string}) => (
  <ConnectForm>
    {({ register, errors, getValues }) => {
      const error = _.get(errors, name)
      const classes = helpIconStyle()
      const { ref, ...rest } = register(name)
      // DAC form: "values" of MainContact checkbox
      const values = getValues(name)
      return (
        <Box display="inline" px={1}>
          <FormControl error={!!error} required={required}>
            <FormGroup>
              <ValidationFormControlLabel
                control={
                  <Checkbox
                    name={name}
                    {...rest}
                    required={required}
                    inputRef={ref}
                    color="primary"
                    checked={values || false}
                  />
                }
                label={
                  <label>
                    {label}
                    <span>{required ? ` * ` : ""}</span>
                  </label>
                }
              />
              {description && <FieldTooltip title={description} placement="bottom" arrow><HelpOutlineIcon className={classes.fieldTip } /></FieldTooltip>}
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
const FormCheckBoxArray = ({ name, label, required, options ,description }: FormSelectFieldProps & {description: string}) => (
  <Box px={1}>
    <p>
      <strong>{label}</strong> - check from following options
    </p>
    <ConnectForm>
      {({ register, errors, getValues }) => {
        const values = getValues()[name]

        const error = _.get(errors, name)
        const classes = helpIconStyle()
        const { ref, ...rest } = register(name)

        return (
          <FormControl error={!!error} required={required}>
            <FormGroup>
              {options.map<React.Element<typeof FormControlLabel>>(option => (
                <div key={option}>
                  <FormControlLabel
                    
                    control={
                      <Checkbox
                      name={name}
                      {...rest}
                      inputRef={ref}
                      value={option}
                      checked={values && values?.includes(option) ? true : false}
                      color="primary"
                      defaultValue=""
                    />
                    }
                    label={option}
                  />
                  {description && <FieldTooltip title={description} placement="bottom" arrow><HelpOutlineIcon className={classes.fieldTip } /></FieldTooltip>}
                </div>
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
  required: boolean,
}

/*
 * FormArray is rendered for arrays of objects. User is given option to choose how many objects to add to array.
 */
const FormArray = ({ object, path, required }: FormArrayProps) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const level = path.length + 1

  // Get currentObject and the values of current field
  const currentObject = useSelector(state => state.currentObject) || {}
  const fieldValues = get(currentObject, name)

  const items = (traverseValues(object.items): any)

  // Needs to use "control" from useForm()
  const { control, setValue } = useForm()

  const { fields, append, remove } = useFieldArray({ control, name })

  // Set the correct values to the equivalent fields when editing form
  // This applies for the case: "fields" does not get the correct data (empty array) although there are values in the fields
  React.useEffect(() => {
    if (fieldValues?.length > 0 && fields?.length === 0 && typeof fieldValues === "object") {
      setValue(name, fieldValues)
    }
  }, [setValue, fields])

  return (
    <div className="array" key={`${name}-array`}>
      <Typography key={`${name}-header`} variant={`h${level}`}>
        {label} {required ? "*" : null}
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
        const requiredProperties =
          index === 0 ? object.contains?.allOf?.flatMap(item => item.required) : object.items?.required

        return (
          <Box px={1} className="arrayRow" key={`${name}[${index}]`}>
            <Paper elevation={2}>
              {Object.keys(items).map(item => {
                const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex, item]
                const requiredField = requiredProperties ? requiredProperties.filter(prop => prop === item) : []
                return traverseFields(properties[item], pathForThisIndex, requiredField, false, field)
              })}
            </Paper>
            <IconButton onClick={() => remove(index)}>
              <RemoveIcon />
            </IconButton>
          </Box>
        )
      })}

      <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={() => append({})}>
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
