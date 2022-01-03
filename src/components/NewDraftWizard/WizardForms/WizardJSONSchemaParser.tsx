import * as React from "react"
import { useState, useEffect, useCallback } from "react"

import AddIcon from "@mui/icons-material/Add"
import ClearIcon from "@mui/icons-material/Clear"
import EventIcon from "@mui/icons-material/Event"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import LaunchIcon from "@mui/icons-material/Launch"
import RemoveIcon from "@mui/icons-material/Remove"
import DateAdapter from "@mui/lab/AdapterMoment"
import DatePicker from "@mui/lab/DatePicker"
import LocalizationProvider from "@mui/lab/LocalizationProvider"
import { FormControl, InputAdornment } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import CircularProgress from "@mui/material/CircularProgress"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormHelperText from "@mui/material/FormHelperText"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import { Variant } from "@mui/material/styles/createTypography"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { makeStyles, withStyles } from "@mui/styles"
import { get, flatten, uniq, debounce } from "lodash"
import moment from "moment"
import { useFieldArray, useFormContext, useForm, Controller, useWatch } from "react-hook-form"

import { setAutocompleteField } from "features/autocompleteSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import rorAPIService from "services/rorAPI"
import CSCtheme from "theme"
import { pathToName, traverseValues, getPathName } from "utils/JSONSchemaUtils"

/*
 * Highlight style for required fields
 */
const highlightStyle = (theme: typeof CSCtheme) => {
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
    width: "100%",
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

const DatePickerWrapper = styled(Grid)(({ theme }) => ({
  paddingLeft: theme.spacing(1),
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  "& > span:first-of-type": {
    fontSize: "0.875rem",
    color: theme.palette.primary.main,
    fontWeight: "bold",
    width: "3rem",
  },
  "& div": {
    padding: 0,
    margin: 0,
    height: "auto",
    "& input": {
      padding: 0,
      margin: 0,
    },
    "& > button": {
      color: theme.palette.primary.light,
    },
  },
}))

const DateCheckboxLabel = styled("span")(({ theme }) => ({
  fontSize: "0.8125rem",
  color: theme.palette.secondary.dark,
}))

/*
 * Clean up form values from empty strings and objects, translate numbers inside strings to numbers.
 */
const cleanUpFormValues = (data: unknown): void => {
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
const buildFields = (schema: unknown): any => {
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
const getDefaultValue = (name: string, nestedField?: any) => {
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
      for (let i = 1, n = path.length; i < n; ++i) {
        const k = path[i]

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
            const property = (properties as any)[propertyKey]
            const required = object?.else?.required ?? object.required
            let requireFirstItem = false

            if (path.length === 0 && propertyKey === "title" && !object.title.includes("DAC - Data Access Committee")) {
              requireFirstItem = true
            }
            // Require first field of section if parent section is a required property
            if (
              requireFirst ||
              requiredProperties?.includes(name) ||
              requiredProperties?.includes(Object.keys(properties)[0])
            ) {
              requireFirstItem = Object.values<any>(properties)[0].title === property.title ? true : false
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
      ) : object.title === "Date" ? (
        <FormDatePicker key={name} name={name} label={label} required={required} description={description} />
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
  name: string
  label: string
  level: number
  children?: React.ReactNode
}

/*
 * FormSection is rendered for properties with type object
 */
const FormSection = ({ name, label, level, children, description }: FormSectionProps & { description: string }) => {
  const classes = useStyles()

  return (
    <ConnectForm>
      {({ errors }: { errors: any }) => {
        const error = get(errors, name)
        return (
          <div>
            <div key={`${name}-section`}>
              <Typography key={`${name}-header`} variant={`h${level}` as Variant} role="heading">
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
  name: string
  label: string
  required: boolean
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
  path: string[]
  object: any
  nestedField?: any
  required?: any
}) => {
  const options = object.oneOf
  const [lastPathItem] = path.slice(-1)
  const description = object.description
  // Get the fieldValue when rendering a saved/submitted form
  // For e.g. obj.required is ["label", "url"] and nestedField is {id: "sth1", label: "sth2", url: "sth3"}
  // Get object from state and set default values if child of oneOf field has values
  // Fetching current object values from state rather than via getValues() method gets values on first call. The getValues method results in empty object on first call
  const currentObject = useAppSelector(state => state.currentObject) || {}
  const values = currentObject[path.toString()]
    ? currentObject
    : currentObject[
        Object.keys(currentObject)
          .filter(item => path.includes(item))
          .toString()
      ] || {}

  let fieldValue = ""

  const flattenObject = (obj: { [x: string]: any }, prefix = "") =>
    Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : ""
      if (typeof obj[k] === "object") Object.assign(acc, flattenObject(obj[k], pre + k))
      else acc[pre + k] = obj[k]
      return acc
    }, {} as Record<string, string>)

  if (Object.keys(values).length > 0) {
    for (const item of path) {
      if (values[item]) {
        const itemValues = values[item]
        const parentPath = Object.keys(itemValues) ? Object.keys(itemValues).toString() : ""
        // Match key from currentObject to option property.
        // Field key can be deeply nested and therefore we need to have multiple cases for finding correct value.
        if (isNaN(Number(parentPath[0]))) {
          fieldValue = (
            options.find((option: any) => option.properties[parentPath])
              ? // Eg. Sample > Sample Names > Sample Data Type
                options.find((option: any) => option.properties[parentPath])
              : // Eg. Run > Run Type > Reference Alignment
                options.find(
                  (option: any) => option.properties[Object.keys(flattenObject(itemValues))[0].split(".").slice(-1)[0]]
                )
          )?.title
        } else {
          // Eg. Experiment > Expected Base Call Table > Processing > Single Processing
          if (typeof itemValues === "string") {
            fieldValue = options.find((option: any) => option.type === "string").title
          }
          // Eg. Experiment > Expected Base Call Table > Processing > Complex Processing
          else {
            const fieldKey = Object.keys(values[item][0])[0]
            fieldValue = options.find((option: any) => option.items?.properties[fieldKey]).title
          }
        }
      }
    }
  }

  // Eg. Study > Study Links
  if (nestedField) {
    for (const option of options) {
      option.required.every(
        (val: string) => nestedField.fieldValues && Object.keys(nestedField.fieldValues).includes(val)
      )
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

  const classes = useStyles()
  const [field, setField] = useState(fieldValue)
  const clearForm = useAppSelector(state => state.clearForm)

  return (
    <ConnectForm>
      {({
        errors,
        unregister,
        setValue,
        getValues,
        reset,
      }: {
        errors: any
        unregister: any
        setValue: any
        getValues: any
        reset: any
      }) => {
        if (clearForm) {
          // Clear the field and "clearForm" is true
          setField("")
          unregister(name)
        }

        const error = get(errors, name)
        // Option change handling
        const handleChange = (event: any) => {
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

        // Selected option
        const selectedOption =
          options?.filter((option: { title: string }) => option.title === field)[0]?.properties || {}
        const selectedOptionValues = Object.values(selectedOption)

        let childObject: any
        let requiredProp: string

        // If selectedOption has many nested "properties"
        if (selectedOptionValues.length > 0 && Object.hasOwnProperty.call(selectedOptionValues[0], "properties")) {
          const { obj, firstProp } = getChildObjects(Object.values(selectedOption)[0])
          childObject = obj
          requiredProp = firstProp || ""
        }
        // Else if selectedOption has no nested "properties"
        else {
          childObject = options?.filter((option: { title: string }) => option.title === field)[0]
          requiredProp = childObject?.required?.toString() || Object.keys(selectedOption)[0]
        }

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
                {options?.map((optionObject: { title: any }) => {
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
                  options?.filter((option: { title: string }) => option.title === field)[0],
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
    "& input:invalid:not(:valid) + fieldset, input:invalid:not(:valid) + button + fieldset, textarea:invalid:not(:valid) + fieldset":
      highlightStyle(theme),
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
}: FormFieldBaseProps & { description: string; type?: string; nestedField?: any }) => {
  const classes = useStyles()
  const openedDoiForm = useAppSelector(state => state.openedDoiForm)
  const autocompleteField = useAppSelector(state => state.autocompleteField)
  const path = name.split(".")
  const [lastPathItem] = path.slice(-1)

  // Default Value of input
  const defaultValue = getDefaultValue(name, nestedField)

  // Case: DOI form - Affilation fields to be prefilled
  const prefilledFields = ["affiliationIdentifier", "schemeUri", "affiliationIdentifierScheme"]
  let watchAutocompleteFieldName = ""
  let prefilledValue: null | undefined = null

  let fullNameValue = "" // Case: DOI form - Creators and Contributors' FullName

  let disabled = false // boolean if inputValue is disabled

  // useWatch to watch any changes in form's fields
  const watchValues = useWatch()

  if (openedDoiForm) {
    watchAutocompleteFieldName =
      name.includes("affiliation") && prefilledFields.includes(lastPathItem) ? getPathName(path, "name") : ""

    // check changes of value of autocompleteField from watchValues
    prefilledValue = watchAutocompleteFieldName ? get(watchValues, watchAutocompleteFieldName) : null

    // If it's <creators>'s and <contributors>'s FullName field, watch the values of GivenName and FamilyName
    const isFullNameField = (path[0] === "creators" || path[0] === "contributors") && path[2] === "name"

    if (isFullNameField) {
      const givenName = getPathName(path, "givenName")
      const givenNameValue = get(watchValues, givenName) || ""
      const familyName = getPathName(path, "familyName")
      const familyNameValue = get(watchValues, familyName)?.length > 0 ? get(watchValues, familyName).concat(",") : ""
      // Return value for FullName field
      fullNameValue = `${familyNameValue}${givenNameValue}`
    }

    // Conditions to disable input field: disable editing option if the field is rendered as prefilled
    disabled =
      (prefilledFields.includes(lastPathItem) && prefilledValue !== null) ||
      isFullNameField ||
      (defaultValue !== "" && name.includes("formats"))
  }

  /*
   * Handle DOI form values
   */

  const { setValue, getValues } = useFormContext()

  // Check value of current name path
  const val = getValues(name)

  // Set values for Affiliations' fields if autocompleteField exists
  useEffect(() => {
    if (prefilledValue && !val && openedDoiForm) {
      lastPathItem === prefilledFields[0] ? setValue(name, autocompleteField) : null
      lastPathItem === prefilledFields[1] ? setValue(name, "https://ror.org") : null
      lastPathItem === prefilledFields[2] ? setValue(name, "ROR") : null
    }
  }, [autocompleteField, prefilledValue])

  // Remove values for Affiliations' <location of affiliation identifier> field if autocompleteField is deleted
  useEffect(() => {
    if (prefilledValue === undefined && val && lastPathItem === prefilledFields[0] && openedDoiForm) setValue(name, "")
  }, [prefilledValue])

  return (
    <ConnectForm>
      {({ control }: { control: any }) => {
        const multiLineRowIdentifiers = ["description", "abstract", "policy text"]

        return (
          <Controller
            render={({ field, fieldState: { error } }) => {
              const inputValue =
                (watchAutocompleteFieldName && typeof val !== "object" && val) ||
                fullNameValue ||
                (typeof field.value !== "object" && field.value) ||
                ""

              const handleChange = (e: { target: { value: any } }) => {
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
 * FormDatePicker used for selecting date or date rage in DOI form
 */

const FormDatePicker = ({ name, label, required, description }: FormFieldBaseProps & { description: string }) => {
  const classes = useStyles()
  const dateCheckboxStyles = {
    padding: 0,
    margin: 0,
    "& span.MuiTypography-root.MuiFormControlLabel-label": {
      margin: 0,
    },
    "& span.MuiCheckbox-root": {
      padding: 0,
    },
  }

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const [unknownDates, setUnknownDates] = useState({ checkedStartDate: false, checkedEndDate: false })
  // Control calendar dialog opened
  const [openStartCalendar, setOpenStartCalendar] = useState(false)
  const [openEndCalendar, setOpenEndCalendar] = useState(false)

  return (
    <ConnectForm>
      {({ errors, getValues, setValue }: { errors: any; getValues: any; setValue: any }) => {
        const dateInputValues = getValues(name)

        const formatDate = date => {
          const format = "YYYY-MM-DD"
          return moment(date).format(format)
        }

        const getDateValues = (start, end) => {
          if (start === end) return start
          if (start || end) return `${start}/${end}`
          else return ""
        }

        const handleChangeStartDate = e => {
          const start = formatDate(e)
          setStartDate(start)
          const dateValues = getDateValues(start, endDate)
          setValue(name, dateValues)
        }

        const handleChangeEndDate = e => {
          const end = formatDate(e)
          setEndDate(end)
          const dateValues = getDateValues(startDate, end)
          setValue(name, dateValues)
        }

        const handleChangeUnknownDates = e => {
          setUnknownDates({ ...unknownDates, [e.target.name]: e.target.checked })
          if (e.target.name === "checkedStartDate") {
            setStartDate("")
            const dateValues = getDateValues("", endDate)
            setValue(name, dateValues)
          } else {
            setEndDate("")
            const dateValues = getDateValues(startDate, "")
            setValue(name, dateValues)
          }
        }

        const handleClearDates = () => {
          setStartDate("")
          setEndDate("")
          setValue(name, "")
        }

        const DateSelection = (props: any) => (
          <Box sx={{ display: "flex", alignItems: "center" }} data-testid={props.label}>
            <input ref={props.inputRef} {...props.inputProps} style={{ border: "none", width: 0 }} />
            {props.InputProps?.endAdornment}
          </Box>
        )

        const DatePickerComponent = () => (
          <LocalizationProvider dateAdapter={DateAdapter}>
            <Box
              sx={{
                width: "95%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <div className={classes.divBaseline}>
                <ValidationTextField
                  inputProps={{ "data-testid": name }}
                  label={label}
                  id={name}
                  role="textbox"
                  error={!!errors}
                  helperText={errors?.message}
                  placeholder="YYYY-MM-DD"
                  required={required}
                  type="text"
                  defaultValue={dateInputValues}
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={handleClearDates}
                        sx={theme => ({ position: "absolute", right: `-${theme.spacing(1)}`, padding: 0 })}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
                {description && (
                  <FieldTooltip title={description} placement="bottom" arrow>
                    <HelpOutlineIcon className={classes.fieldTip} />
                  </FieldTooltip>
                )}
              </div>
              <Grid container direction="column">
                <DatePickerWrapper item xs="auto">
                  <span>Start</span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={unknownDates.checkedStartDate}
                        onChange={handleChangeUnknownDates}
                        name="checkedStartDate"
                        value="UnknownStartDate"
                        color="primary"
                      />
                    }
                    label={<DateCheckboxLabel>Unknown</DateCheckboxLabel>}
                    sx={{ ...dateCheckboxStyles }}
                    disabled={unknownDates.checkedEndDate}
                  />
                  <DatePicker
                    label="Start"
                    renderInput={params => (
                      <DateSelection
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end" onClick={() => setOpenStartCalendar(true)}>
                              <IconButton disabled={unknownDates.checkedStartDate}>
                                <EventIcon color="primary" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    value={startDate}
                    onChange={handleChangeStartDate}
                    minDate={moment("0001-01-01")}
                    shouldDisableDate={day => moment(day).isAfter(endDate)}
                    open={openStartCalendar}
                    disableCloseOnSelect={false}
                    onOpen={() => setOpenStartCalendar(true)}
                    onClose={() => setOpenStartCalendar(false)}
                  />
                </DatePickerWrapper>
                <DatePickerWrapper item xs="auto">
                  <span>End</span>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={unknownDates.checkedEndDate}
                        onChange={handleChangeUnknownDates}
                        name="checkedEndDate"
                        value="UnknownEndDate"
                        color="primary"
                      />
                    }
                    label={<DateCheckboxLabel>Unknown</DateCheckboxLabel>}
                    sx={{ ...dateCheckboxStyles }}
                    disabled={unknownDates.checkedStartDate}
                  />
                  <DatePicker
                    label="End"
                    renderInput={params => (
                      <DateSelection
                        {...params}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end" onClick={() => setOpenEndCalendar(true)}>
                              <IconButton disabled={unknownDates.checkedEndDate}>
                                <EventIcon color="primary" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    value={endDate}
                    onChange={handleChangeEndDate}
                    shouldDisableDate={day => moment(day).isBefore(startDate)}
                    disableCloseOnSelect={false}
                    open={openEndCalendar}
                    onOpen={() => setOpenEndCalendar(true)}
                    onClose={() => setOpenEndCalendar(false)}
                  />
                </DatePickerWrapper>
              </Grid>
            </Box>
          </LocalizationProvider>
        )

        return <DatePickerComponent />
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
}: FormFieldBaseProps & { type?: string; nestedField?: any; description: string }) => {
  const dispatch = useAppDispatch()

  const { setValue, getValues } = useFormContext()

  const classes = useStyles()
  const defaultValue = getValues(name) || ""
  const [selection, setSelection] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchOrganisations = async (searchTerm: string) => {
    // Check if searchTerm includes non-word char, for e.g. "(", ")", "-" because the api does not work with those chars
    const isContainingNonWordChar = searchTerm.match(/\W/g)
    const response = isContainingNonWordChar === null ? await rorAPIService.getOrganisations(searchTerm) : null

    if (response) setLoading(false)

    if (response?.ok) {
      const mappedOrganisations = response.data.items.map((org: { name: any; id: any }) => ({
        name: org.name,
        id: org.id,
      }))
      setOptions(mappedOrganisations)
    }
  }

  // Disable warning when using external function as callback
  // https://stackoverflow.com/questions/62834368/react-usecallback-linting-error-missing-dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <ConnectForm>
      {({ errors, control }: { errors: any; control: any }) => {
        const error = get(errors, name)

        // const fieldsToBePrefilled = ["schemeUri", "affiliationIdentifier", "affiliationIdentifierScheme"]

        const handleAutocompleteValueChange = (event: any, option: any) => {
          setSelection(option)
          setValue(name, option?.name)
          option?.id ? dispatch(setAutocompleteField(option.id)) : null
        }

        const handleInputChange = (event: any, newInputValue: any, reason: any) => {
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
}: FormSelectFieldProps & { description: string }) => {
  const classes = useStyles()

  return (
    <ConnectForm>
      {({ control }: { control: any }) => {
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
                    onChange={e => {
                      let val = e.target.value
                      // Case: linkingAccessionIds which include "AccessionId + Form's title", we need to return only accessionId as value
                      if (val?.includes("Title")) {
                        const hyphenIndex = val.indexOf("-")
                        val = val.slice(0, hyphenIndex - 1)
                      }
                      return field.onChange(val)
                    }}
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
}

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
const FormBooleanField = ({ name, label, required, description }: FormFieldBaseProps & { description: string }) => {
  const classes = useStyles()

  return (
    <ConnectForm>
      {({ register, errors, getValues }: { register: any; errors: any; getValues: any }) => {
        const error = get(errors, name)

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
}

/*
 * FormSelectField is rendered for selection from options where it's possible to choose many options
 */
const FormCheckBoxArray = ({
  name,
  label,
  required,
  options,
  description,
}: FormSelectFieldProps & { description: string }) => {
  const classes = useStyles()

  return (
    <Box px={1}>
      <p>
        <strong id={name}>{label}</strong> - check from following options
      </p>
      <ConnectForm>
        {({ register, errors, getValues }: { register: any; errors: any; getValues: any }) => {
          const values = getValues()[name]

          const error = get(errors, name)

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
}

type FormArrayProps = {
  object: any
  path: Array<string>
  required: boolean
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
  const currentObject = useAppSelector(state => state.currentObject) || {}
  const fileTypes = useAppSelector(state => state.fileTypes)

  const fieldValues = get(currentObject, name)
  const items = traverseValues(object.items)

  const { control } = useForm()

  const {
    register,
    getValues,
    setValue,
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
      const fieldsArray = [] as any
      for (let i = 0; i < fieldValues.length; i += 1) {
        fieldsArray.push({ fieldValues: fieldValues[i] })
      }
      append(fieldsArray)
    }
  }, [fields])

  // Get unique fileTypes from submitted fileTypes
  const uniqueFileTypes = uniq(flatten(fileTypes?.map((obj: { fileTypes: any }) => obj.fileTypes)))

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
    setValid(true)
    clearErrors([name])
    append({})
  }

  const handleRemove = (index: number) => {
    // Re-register hidden input if all field arrays are removed
    if (index === 0) setValid(false)
    // Set the correct values according to the name path when removing a field
    const values = getValues(name)
    const filteredValues = values.filter((val: any, ind: any) => ind !== index)
    setValue(name, filteredValues)
    remove(index)
  }

  return (
    <div className="array" key={`${name}-array`} aria-labelledby={name}>
      {required && !isValid && <input hidden={true} value="form-array-required" {...register(name)} />}
      <Typography key={`${name}-header`} variant={`h${level}` as Variant} data-testid={name} role="heading">
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
            ? object.contains?.allOf?.flatMap((item: { required: boolean }) => item.required) // Case: DAC - Main Contact needs at least 1
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
                      const requiredField = requiredProperties
                        ? requiredProperties.filter((prop: string) => prop === item)
                        : []
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
