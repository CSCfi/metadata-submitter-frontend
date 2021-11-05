//@flow
import * as React from "react"
import { useState, useEffect, useCallback } from "react"

import { FormControl } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Button from "@material-ui/core/Button"
import Checkbox from "@material-ui/core/Checkbox"
import CircularProgress from "@material-ui/core/CircularProgress"
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
import LaunchIcon from "@material-ui/icons/Launch"
import RemoveIcon from "@material-ui/icons/Remove"
import Autocomplete from "@material-ui/lab/Autocomplete"
import { get, flatten, uniqBy, debounce } from "lodash"
import { useFieldArray, useFormContext, useForm, Controller, useWatch } from "react-hook-form"
import { useSelector, useDispatch } from "react-redux"

import { setAutocompleteField } from "features/autocompleteSlice"
import rorAPIService from "services/rorAPI"
import { pathToName, traverseValues } from "utils/JSONSchemaUtils"

/*
 * Highlight style for required fields
 */
const highlightStyle = theme => {
  return {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }
}

const useStyles = makeStyles(theme => ({
  fieldTip: {
    color: theme.palette.secondary.main,
    marginLeft: theme.spacing(0),
  },
  sectionTip: {
    fontSize: "inherit",
    marginLeft: theme.spacing(0.5),
  },
  divBaseline: {
    display: "flex",
    flexDirection: "row",
    alignItems: "baseline",
    "& label": {
      marginRight: theme.spacing(0),
    },
  },
  autocomplete: {
    flex: "auto",
    alignSelf: "flex-start",
    "& + svg": {
      marginTop: theme.spacing(1),
    },
  },
  autocompleteInput: {
    "& .MuiAutocomplete-endAdornment": {
      top: 0,
    },
  },
  externalLink: {
    fontSize: "1rem",
    marginBottom: theme.spacing(-0.5),
  },
}))

const FieldTooltip = withStyles(theme => ({
  tooltip: theme.tooltip,
}))(Tooltip)

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
      if (data[key] !== null) {
        data[key] = traverseFormValuesForCleanUp(data[key])
        if (Object.keys(data[key]).length === 0) delete data[key]
      }
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
 * Get defaultValue for options in a form. Used when rendering a saved/submitted form
 */
const getDefaultValue = (nestedField?: any, name: string) => {
  if (nestedField) {
    const path = name.split(".")
    // E.g. Case of DOI form - Formats's fields
    if (path[0] === "formats") {
      const k = path[0]
      if (k in nestedField) {
        nestedField = nestedField[k]
      } else {
        return
      }
    } else {
      for (var i = 1, n = path.length; i < n; ++i) {
        var k = path[i]

        if (k in nestedField) {
          nestedField = nestedField[k]
        } else {
          return
        }
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
  const autoCompleteIdentifiers = ["organisation", "name of the place of affiliation"]

  if (object.oneOf) return <FormOneOfField key={name} path={path} object={object} required={required} />

  switch (object.type) {
    case "object": {
      const properties = object.properties
      return (
        <FormSection key={name} name={name} label={label} level={path.length + 1} description={description}>
          {Object.keys(properties).map(propertyKey => {
            const property = properties[propertyKey]
            let required = object?.else?.required ?? object.required
            let requireFirstItem = false

            if (path.length === 0 && propertyKey === "title" && !object.title.includes("DAC - Data Access Committee")) {
              requireFirstItem = true
            }
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
        />
      ) : autoCompleteIdentifiers.some(value => label.toLowerCase().includes(value)) ? (
        <FormAutocompleteField
          key={name}
          name={name}
          label={label}
          required={required}
          nestedField={nestedField}
          description={description}
        />
      ) : (
        <FormTextField
          key={name}
          name={name}
          label={label}
          required={required}
          description={description}
          nestedField={nestedField}
        />
      )
    }
    case "integer": {
      return <FormTextField key={name} name={name} label={label} required={required} description={description} />
    }
    case "number": {
      return (
        <FormTextField
          key={name}
          name={name}
          label={label}
          required={required}
          description={description}
          type="number"
        />
      )
    }
    case "boolean": {
      return <FormBooleanField key={name} name={name} label={label} required={required} description={description} />
    }
    case "array": {
      return object.items.enum ? (
        <FormCheckBoxArray
          key={name}
          name={name}
          label={label}
          options={object.items.enum}
          required={required}
          description={description}
        />
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
const FormSection = ({ name, label, level, children, description }: FormSectionProps & { description: string }) => {
  const classes = useStyles()

  return (
    <ConnectForm>
      {({ errors }) => {
        const error = get(errors, name)
        return (
          <div>
            <div className="formSection" key={`${name}-section`}>
              <Typography key={`${name}-header`} variant={`h${level}`} role="heading">
                {label}
                {description && level == 2 && (
                  <FieldTooltip title={description} placement="top" arrow>
                    <HelpOutlineIcon className={classes.sectionTip} />
                  </FieldTooltip>
                )}
              </Typography>
              {children}
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

type FormSelectFieldProps = FormFieldBaseProps & { options: string[] }

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
          fieldValue = (
            options.find(option => option.properties[parentPath])
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
      option.required.every(val => nestedField.fieldValues && Object.keys(nestedField.fieldValues).includes(val))
        ? (fieldValue = option.title)
        : ""
    }
  }

  // Special handling for Expected Base Call Table > Processing > Complex Processing > Pipeline > Pipe Section > Prev Step Index
  // Can be extended to other fields if needed
  const itemValue = get(currentObject, pathToName(path))

  if (itemValue) {
    switch (lastPathItem) {
      case "prevStepIndex":
        {
          fieldValue = "String value"
        }
        break
    }
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
          if (Object.hasOwnProperty.call(childPropsValues, "properties")) {
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
      {({ errors, unregister, setValue, getValues, reset }) => {
        const error = get(errors, name)
        // Option change handling
        const [field, setField] = useState(fieldValue)

        const handleChange = event => {
          const val = event.target.value
          setField(val)

          // Get fieldValues of current path
          const currentFieldValues = getValues(name)
          // Unregister if selecting "Complex Processing", "Null value" in Experiment form
          if (val === "Complex Processing") unregister(name)
          if (val === "Null value") setValue(name, null)
          // Remove previous values of the same path
          if (val !== "Complex Processing" && val !== "Null value" && currentFieldValues !== undefined) {
            reset({ ...getValues(), [name]: "" })
          }
        }

        const classes = useStyles()
        // Selected option
        const selectedOption = options?.filter(option => option.title === field)[0]?.properties || {}
        const selectedOptionValues = Object.values(selectedOption)

        let childObject: any
        let requiredProp: string

        // If selectedOption has many nested "properties"
        if (selectedOptionValues.length > 0 && Object.hasOwnProperty.call(selectedOptionValues[0], "properties")) {
          const { obj, firstProp } = getChildObjects(Object.values(selectedOption)[0])
          childObject = obj
          requiredProp = firstProp
        }
        // Else if selectedOption has no nested "properties"
        else {
          childObject = options?.filter(option => option.title === field)[0]
          requiredProp = childObject?.required?.toString() || Object.keys(selectedOption)[0]
        }

        const clearForm = useSelector(state => state.clearForm)

        useEffect(() => {
          if (clearForm) {
            // Clear the field and "clearForm" is true
            setField("")
            unregister(name)
          }
        }, [clearForm])

        return (
          <div>
            <div className={classes.divBaseline}>
              <ValidationSelectField
                name={name}
                label={label}
                id={name}
                role="listbox"
                value={field || ""}
                select
                SelectProps={{ native: true }}
                onChange={event => {
                  handleChange(event)
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
              {description && (
                <FieldTooltip title={description} placement="top" arrow>
                  <HelpOutlineIcon className={classes.fieldTip} />
                </FieldTooltip>
              )}
            </div>
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
}: FormFieldBaseProps & { description: string, type?: string, nestedField?: any }) => {
  const openedDoiForm = useSelector(state => state.openedDoiForm)
  const autocompleteField = useSelector(state => state.autocompleteField)
  const path = name.split(".")
  const [lastPathItem] = path.slice(-1)

  // Default Value of input
  const defaultValue = getDefaultValue(nestedField, name)

  // Case: DOI form - Affilation fields to be prefilled
  const prefilledFields = ["affiliationIdentifier", "schemeUri", "affiliationIdentifierScheme"]
  let watchAutocompleteFieldName = ""
  let watchFieldValue = null
  if (openedDoiForm) {
    watchAutocompleteFieldName =
      name.includes("affiliation") && prefilledFields.includes(lastPathItem)
        ? path.slice(0, -1).join(".").concat(".", "name")
        : ""
    // useWatch to watch any changes in form's fields
    const watchValues = useWatch()
    // check changes of value of autocompleteField from watchValues
    watchFieldValue = watchAutocompleteFieldName ? get(watchValues, watchAutocompleteFieldName) : null
  }

  // Conditions to disable input field: disable editing option if the field is prefilled
  const disabled =
    (prefilledFields.includes(lastPathItem) && watchFieldValue !== null) ||
    (defaultValue !== "" && name.includes("formats"))

  return (
    <ConnectForm>
      {({ control, setValue, getValues }) => {
        const classes = useStyles()
        const multiLineRowIdentifiers = ["description", "abstract", "policy text"]

        // Check value of current name path
        const val = getValues(name)

        if (openedDoiForm) {
          // Set values for Affiliations' fields if autocompleteField exists
          useEffect(() => {
            if (watchFieldValue && !val) {
              lastPathItem === prefilledFields[0] ? setValue(name, autocompleteField) : null
              lastPathItem === prefilledFields[1] ? setValue(name, "https://ror.org") : null
              lastPathItem === prefilledFields[2] ? setValue(name, "ROR") : null
            }
          }, [autocompleteField, watchFieldValue])

          // Remove values for Affiliations' <location of affiliation identifier> field if autocompleteField is deleted
          useEffect(() => {
            if (watchFieldValue === undefined && val && lastPathItem === prefilledFields[0]) setValue(name, "")
          }, [watchFieldValue])
        }

        return (
          <Controller
            render={({ field, fieldState: { error } }) => {
              const inputValue =
                (watchAutocompleteFieldName && typeof val !== "object" && val) ||
                (typeof field.value !== "object" && field.value) ||
                ""

              const handleChange = e => {
                const { value } = e.target
                field.onChange(type === "string" && !isNaN(value) ? value.toString() : value)
              }

              return (
                <div className={classes.divBaseline}>
                  <ValidationTextField
                    {...field}
                    inputProps={{ "data-testid": name }}
                    label={label}
                    id={name}
                    role="textbox"
                    error={!!error}
                    helperText={error?.message}
                    required={required}
                    type={type}
                    multiline={multiLineRowIdentifiers.some(value => label.toLowerCase().includes(value))}
                    rows={5}
                    value={inputValue}
                    onChange={handleChange}
                    disabled={disabled}
                  />
                  {description && (
                    <FieldTooltip title={description} placement="top" arrow>
                      <HelpOutlineIcon className={classes.fieldTip} />
                    </FieldTooltip>
                  )}
                </div>
              )
            }}
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={{ required: required }}
          />
        )
      }}
    </ConnectForm>
  )
}

/*
 * FormAutocompleteField uses ROR API to fetch organisations
 */
const FormAutocompleteField = ({
  name,
  label,
  required,
  description,
}: FormFieldBaseProps & { type?: string, nestedField?: any, description: string }) => {
  const dispatch = useDispatch()

  return (
    <ConnectForm>
      {({ errors, getValues, control, setValue }) => {
        const error = get(errors, name)
        const classes = useStyles()
        const defaultValue = getValues(name) || ""
        const [selection, setSelection] = useState(null)
        const [open, setOpen] = useState(false)
        const [options, setOptions] = useState([])
        const [inputValue, setInputValue] = useState("")
        const [loading, setLoading] = useState(false)

        const fetchOrganisations = async searchTerm => {
          // Check if searchTerm includes non-word char, for e.g. "(", ")", "-" because the api does not work with those chars
          const isContainingNonWordChar = searchTerm.match(/\W/g)
          const response = isContainingNonWordChar === null ? await rorAPIService.getOrganisations(searchTerm) : null

          if (response) setLoading(false)

          if (response?.ok) {
            const mappedOrganisations = response.data.items.map(org => ({ name: org.name, id: org.id }))
            setOptions(mappedOrganisations)
          }
        }

        const debouncedSearch = useCallback(
          debounce(newInput => {
            if (newInput.length > 0) fetchOrganisations(newInput)
          }, 150),
          []
        )

        useEffect(() => {
          let active = true

          if (inputValue === "") {
            setOptions([])
            return undefined
          }

          if (active && open) {
            setLoading(true)
            debouncedSearch(inputValue)
          }

          return () => {
            active = false
            setLoading(false)
          }
        }, [selection, inputValue])

        // const fieldsToBePrefilled = ["schemeUri", "affiliationIdentifier", "affiliationIdentifierScheme"]

        const handleAutocompleteValueChange = (event, option) => {
          setSelection(option)
          setValue(name, option?.name)
          option?.id ? dispatch(setAutocompleteField(option.id)) : null
        }

        const handleInputChange = (event, newInputValue, reason) => {
          setInputValue(newInputValue)
          switch (reason) {
            case "input":
            case "clear":
              setInputValue(newInputValue)
              break
            case "reset":
              selection ? setInputValue(selection?.name) : null
              break
            default:
              break
          }
        }

        return (
          <Controller
            render={() => (
              <div className={classes.divBaseline}>
                <Autocomplete
                  freeSolo
                  className={classes.autocomplete}
                  open={open}
                  onOpen={() => {
                    setOpen(true)
                  }}
                  onClose={() => {
                    setOpen(false)
                  }}
                  options={options}
                  getOptionLabel={option => option.name || ""}
                  data-testid={name}
                  disableClearable={inputValue.length === 0}
                  renderInput={params => (
                    <TextField
                      {...params}
                      className={classes.autocompleteInput}
                      label={label}
                      id={name}
                      name={name}
                      variant="outlined"
                      error={!!error}
                      required={required}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {loading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                  onChange={handleAutocompleteValueChange}
                  onInputChange={handleInputChange}
                  value={defaultValue}
                  inputValue={inputValue || defaultValue}
                />
                {description && (
                  <FieldTooltip
                    title={
                      <React.Fragment>
                        {description}
                        <br />
                        {"Organisations provided by "}
                        <a href="https://ror.org/" target="_blank" rel="noreferrer">
                          {"ror.org"}
                          <LaunchIcon className={classes.externalLink} />
                        </a>
                        {"."}
                      </React.Fragment>
                    }
                    placement="top"
                    arrow
                    interactive
                  >
                    <HelpOutlineIcon className={classes.fieldTip} />
                  </FieldTooltip>
                )}
              </div>
            )}
            name={name}
            control={control}
          />
        )
      }}
    </ConnectForm>
  )
}

/*
 * FormSelectField is rendered for choosing one from many options
 */
const FormSelectField = ({
  name,
  label,
  required,
  options,
  description,
}: FormSelectFieldProps & { description: string }) => (
  <ConnectForm>
    {({ control }) => {
      const classes = useStyles()
      return (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <div className={classes.divBaseline}>
                <ValidationSelectField
                  {...field}
                  label={label}
                  id={name}
                  value={field.value || ""}
                  error={!!error}
                  helperText={error?.message}
                  required={required}
                  select
                  SelectProps={{ native: true }}
                  onChange={e =>
                    field.onChange(() => {
                      const val = e.target.value
                      // Case: linkingAccessionIds which include "AccessionId + Form's title", we need to return only accessionId as value
                      if (val?.includes("Title")) {
                        const hyphenIndex = val.indexOf("-")
                        return val.slice(0, hyphenIndex - 1)
                      }
                      return val
                    })
                  }
                >
                  <option aria-label="None" value="" disabled />
                  {options.map(option => (
                    <option key={`${name}-${option}`} value={option} data-testid={`${name}-option`}>
                      {option}
                    </option>
                  ))}
                </ValidationSelectField>
                {description && (
                  <FieldTooltip title={description} placement="top" arrow>
                    <HelpOutlineIcon className={classes.fieldTip} />
                  </FieldTooltip>
                )}
              </div>
            )
          }}
        />
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
const FormBooleanField = ({ name, label, required, description }: FormFieldBaseProps & { description: string }) => (
  <ConnectForm>
    {({ register, errors, getValues }) => {
      const error = get(errors, name)
      const classes = useStyles()
      const { ref, ...rest } = register(name)
      // DAC form: "values" of MainContact checkbox
      const values = getValues(name)
      return (
        <Box display="inline" px={1}>
          <FormControl error={!!error} required={required}>
            <FormGroup className={classes.divBaseline}>
              <ValidationFormControlLabel
                control={
                  <Checkbox
                    name={name}
                    id={name}
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
              {description && (
                <FieldTooltip title={description} placement="bottom" arrow>
                  <HelpOutlineIcon className={classes.fieldTip} />
                </FieldTooltip>
              )}
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
const FormCheckBoxArray = ({
  name,
  label,
  required,
  options,
  description,
}: FormSelectFieldProps & { description: string }) => (
  <Box px={1}>
    <p>
      <strong id={name}>{label}</strong> - check from following options
    </p>
    <ConnectForm>
      {({ register, errors, getValues }) => {
        const values = getValues()[name]

        const error = get(errors, name)
        const classes = useStyles()
        const { ref, ...rest } = register(name)

        return (
          <FormControl error={!!error} required={required}>
            <FormGroup aria-labelledby={name}>
              {options.map(option => (
                <React.Fragment key={option}>
                  <FormControlLabel
                    key={option}
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
                  {description && (
                    <FieldTooltip title={description} placement="bottom" arrow>
                      <HelpOutlineIcon className={classes.fieldTip} />
                    </FieldTooltip>
                  )}
                </React.Fragment>
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
const FormArray = ({ object, path, required, description }: FormArrayProps & { description: string }) => {
  const classes = useStyles()
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const level = path.length + 1

  // Get currentObject and the values of current field
  const currentObject = useSelector(state => state.currentObject) || {}
  const fileTypes = useSelector(state => state.fileTypes)

  const fieldValues = get(currentObject, name)
  const items = (traverseValues(object.items): any)

  const { control } = useForm()

  const {
    register,
    getValues,
    setValue,
    unregister,
    formState: { errors },
    clearErrors,
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({ control, name })

  const [isValid, setValid] = React.useState(false)

  // Append the correct values to the equivalent fields when editing form
  // This applies for the case: "fields" does not get the correct data (empty array) although there are values in the fields
  // E.g. Study > StudyLinks or Experiment > Expected Base Call Table
  useEffect(() => {
    if (fieldValues?.length > 0 && fields?.length === 0 && typeof fieldValues === "object") {
      const fieldsArray = []
      for (let i = 0; i < fieldValues.length; i += 1) {
        fieldsArray.push({ fieldValues: fieldValues[i] })
      }
      append(fieldsArray)
    }
  }, [fields])

  // Get unique fileTypes from submitted fileTypes
  const uniqueFileTypes = uniqBy(flatten(fileTypes?.map(obj => obj.fileTypes)))

  useEffect(() => {
    // Append fileType to formats' field
    if (name === "formats") {
      for (let i = 0; i < uniqueFileTypes.length; i += 1) {
        append({ formats: uniqueFileTypes[i] })
      }
    }
  }, [uniqueFileTypes.length])

  // Clear required field array error and append
  const handleAppend = () => {
    unregister(name)
    setValid(true)
    clearErrors([name])
    append({})
  }

  const handleRemove = index => {
    // Re-register hidden input if all field arrays are removed
    if (index === 0) setValid(false)
    // Set the correct values according to the name path when removing a field
    const values = getValues(name)
    const filteredValues = values.filter((val, ind) => ind !== index)
    setValue(name, filteredValues)
    remove(index)
  }

  return (
    <div className="array" key={`${name}-array`} aria-labelledby={name}>
      {required && !isValid && <input hidden={true} value="form-array-required" {...register(name)} />}
      <Typography key={`${name}-header`} variant={`h${level}`} data-testid={name} role="heading">
        <span id={name}>{label}</span> {required ? "*" : null}
        {required && !isValid && errors[name] && (
          <span>
            <FormControl error>
              <FormHelperText>must have at least 1 item</FormHelperText>
            </FormControl>
          </span>
        )}
        {description && (
          <FieldTooltip title={description} placement="top" arrow>
            <HelpOutlineIcon className={classes.sectionTip} />
          </FieldTooltip>
        )}
      </Typography>

      {fields.map((field, index) => {
        const pathWithoutLastItem = path.slice(0, -1)
        const lastPathItemWithIndex = `${lastPathItem}.${index}`

        if (items.oneOf) {
          const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex]

          return (
            <div className="arrayRow" key={field.id} data-testid={`${name}[${index}]`}>
              <Paper elevation={2}>
                <FormOneOfField key={field.id} nestedField={field} path={pathForThisIndex} object={items} />
              </Paper>
              <IconButton onClick={() => handleRemove(index)}>
                <RemoveIcon />
              </IconButton>
            </div>
          )
        }

        const properties = object.items.properties
        let requiredProperties =
          index === 0 && object.contains?.allOf
            ? object.contains?.allOf?.flatMap(item => item.required) // Case: DAC - Main Contact needs at least 1
            : object.items?.required

        // Force first array item as required field if array is required but none of the items are required
        if (required && !requiredProperties) requiredProperties = [Object.keys(items)[0]]

        return (
          <Box px={1} className="arrayRow" key={field.id} aria-labelledby={name} data-testid={name}>
            <Paper elevation={2}>
              {
                items
                  ? Object.keys(items).map(item => {
                      const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex, item]
                      const requiredField = requiredProperties ? requiredProperties.filter(prop => prop === item) : []
                      return traverseFields(properties[item], pathForThisIndex, requiredField, false, field)
                    })
                  : traverseFields(object.items, [...pathWithoutLastItem, lastPathItemWithIndex], [], false, field) // special case for doiSchema's "sizes" and "formats"
              }
            </Paper>
            <IconButton onClick={() => handleRemove(index)}>
              <RemoveIcon />
            </IconButton>
          </Box>
        )
      })}

      <Button variant="contained" color="primary" size="small" startIcon={<AddIcon />} onClick={() => handleAppend()}>
        Add new item
      </Button>
    </div>
  )
}

export default {
  buildFields,
  cleanUpFormValues,
}
