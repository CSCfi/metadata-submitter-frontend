import * as React from "react"

import AddIcon from "@mui/icons-material/Add"
import ClearIcon from "@mui/icons-material/Clear"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import LaunchIcon from "@mui/icons-material/Launch"
import RemoveIcon from "@mui/icons-material/Remove"
import { FormControl } from "@mui/material"
import Autocomplete from "@mui/material/Autocomplete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Checkbox from "@mui/material/Checkbox"
import Chip from "@mui/material/Chip"
import CircularProgress from "@mui/material/CircularProgress"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormGroup from "@mui/material/FormGroup"
import FormHelperText from "@mui/material/FormHelperText"
import Grid from "@mui/material/Grid"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import { styled } from "@mui/material/styles"
import { TypographyVariant } from "@mui/material/styles/createTypography"
import TextField from "@mui/material/TextField"
import Tooltip, { TooltipProps } from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { get, flatten, uniq, debounce } from "lodash"
import moment from "moment"
import { useFieldArray, useFormContext, useForm, Controller, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DisplayObjectTypes, ObjectTypes } from "constants/wizardObject"
import { setAutocompleteField } from "features/autocompleteSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import rorAPIService from "services/rorAPI"
import { ConnectFormChildren, ConnectFormMethods, FormObject, NestedField } from "types"
import { pathToName, traverseValues, getPathName } from "utils/JSONSchemaUtils"

/*
 * Highlight style for required fields
 */
const highlightStyle = theme => {
  return {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  }
}

const BaselineDiv = styled("div")({
  display: "flex",
  alignItems: "baseline",
})

const FieldTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  "& .MuiTooltip-tooltip": {
    padding: "2rem",
    backgroundColor: theme.palette.common.white,
    color: theme.palette.secondary.main,
    fontSize: "1.4rem",
    boxShadow: theme.shadows[1],
    border: `0.1rem solid ${theme.palette.primary.main}`,
    maxWidth: "25rem",
  },
  "& .MuiTooltip-arrow": {
    "&:before": {
      border: `0.1rem solid ${theme.palette.primary.main}`,
    },
    color: theme.palette.common.white,
  },
}))

const TooltipIcon = styled(HelpOutlineIcon)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginLeft: "1rem",
}))

/*
 * Clean up form values from empty strings and objects, translate numbers inside strings to numbers.
 */
const cleanUpFormValues = (data: unknown) => {
  const cleanedData = JSON.parse(JSON.stringify(data))
  return traverseFormValuesForCleanUp(cleanedData)
}

// Array is populated in traverseFields method.
const integerFields: Array<string> = []

const traverseFormValuesForCleanUp = (data: Record<string, unknown>) => {
  Object.keys(data).forEach(key => {
    const property = data[key] as Record<string, unknown> | string | null

    if (typeof property === "object" && !Array.isArray(property)) {
      if (property !== null) {
        data[key] = traverseFormValuesForCleanUp(property)
        if (Object.keys(property).length === 0) delete data[key]
      }
    }
    if (property === "") {
      delete data[key]
    }
    // Integer typed fields are considered as string like ID's which are numbers.
    // Therefore these fields need to be handled as string in the form and cast as number
    // for backend operations. Eg. "1234" is converted to 1234 so it passes backend validation
    else if (integerFields.indexOf(key) > -1) {
      data[key] = Number(data[key])
    }
  })
  return data
}

/*
 * Build react-hook-form fields based on given schema
 */
const buildFields = (schema: FormObject) => {
  try {
    return traverseFields(schema, [])
  } catch (error) {
    console.error(error)
  }
}

/*
 * Allow children components inside ConnectForm to pull react-hook-form objects and methods from context
 */
const ConnectForm = ({ children }: ConnectFormChildren) => {
  const methods = useFormContext()
  return children({ ...(methods as ConnectFormMethods) })
}

/*
 * Get defaultValue for options in a form. Used when rendering a saved/submitted form
 */
const getDefaultValue = (name: string, nestedField?: Record<string, unknown>) => {
  if (nestedField) {
    let result
    const path = name.split(".")
    // E.g. Case of DOI form - Formats's fields
    if (path[0] === "formats") {
      const k = path[0]
      if (k in nestedField) {
        result = nestedField[k]
      } else {
        return
      }
    } else {
      for (let i = 1, n = path.length; i < n; ++i) {
        const k = path[i]

        if (nestedField && k in nestedField) {
          result = nestedField[k]
        } else {
          return
        }
      }
    }
    return result
  } else {
    return ""
  }
}

/*
 * Traverse fields recursively, return correct fields for given object or log error, if object type is not supported.
 */
const traverseFields = (
  object: FormObject,
  path: string[],
  requiredProperties?: string[],
  requireFirst?: boolean,
  nestedField?: NestedField
) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const label = object.title ?? lastPathItem
  const required = !!requiredProperties?.includes(lastPathItem) || requireFirst || false
  const description = object.description
  const autoCompleteIdentifiers = ["organisation", "name of the place of affiliation"]

  if (object.oneOf)
    return (
      <FormSection key={name} name={name} label={label} level={path.length}>
        <FormOneOfField key={name} path={path} object={object} required={required} />
      </FormSection>
    )

  switch (object.type) {
    case "object": {
      const properties =
        label === DisplayObjectTypes.dataset && path.length === 0
          ? { title: object.properties["title"], description: object.properties["description"] }
          : object.properties

      return (
        <FormSection
          key={name}
          name={name}
          label={label}
          level={path.length}
          description={description}
          isTitleShown
        >
          {Object.keys(properties).map(propertyKey => {
            const property = properties[propertyKey] as FormObject
            const required = object?.else?.required ?? object.required
            let requireFirstItem = false

            if (
              path.length === 0 &&
              propertyKey === "title" &&
              !object.title.includes("DAC - Data Access Committee")
            ) {
              requireFirstItem = true
            }
            // Require first field of section if parent section is a required property
            if (
              requireFirst ||
              requiredProperties?.includes(name) ||
              requiredProperties?.includes(Object.keys(properties)[0])
            ) {
              const parentProperty = Object.values(properties)[0] as { title: string }
              requireFirstItem = parentProperty.title === property.title ? true : false
            }

            return traverseFields(
              property,
              [...path, propertyKey],
              required,
              requireFirstItem,
              nestedField
            )
          })}
        </FormSection>
      )
    }
    case "string": {
      return object["enum"] ? (
        <FormSection key={name} name={name} label={label} level={path.length}>
          <FormSelectField
            key={name}
            name={name}
            label={label}
            options={object.enum}
            required={required}
            description={description}
          />
        </FormSection>
      ) : object.title === "Date" ? (
        <FormDatePicker
          key={name}
          name={name}
          label={label}
          required={required}
          description={description}
        />
      ) : autoCompleteIdentifiers.some(value => label.toLowerCase().includes(value)) ? (
        <FormAutocompleteField
          key={name}
          name={name}
          label={label}
          required={required}
          description={description}
        />
      ) : name.includes("keywords") ? (
        <FormSection key={name} name={name} label={label} level={path.length}>
          <FormTagField
            key={name}
            name={name}
            label={label}
            required={required}
            description={description}
          />
        </FormSection>
      ) : (
        <FormSection key={name} name={name} label={label} level={path.length}>
          <FormTextField
            key={name}
            name={name}
            label={label}
            required={required}
            description={description}
            nestedField={nestedField}
          />
        </FormSection>
      )
    }
    case "integer": {
      // List fields with integer type in schema. List is used as helper when cleaning up fields for backend.
      const fieldName = name.split(".").pop()
      if (fieldName && integerFields.indexOf(fieldName) < 0) integerFields.push(fieldName)

      return (
        <FormSection key={name} name={name} label={label} level={path.length}>
          <FormTextField
            key={name}
            name={name}
            label={label}
            required={required}
            description={description}
          />
        </FormSection>
      )
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
      return (
        <FormBooleanField
          key={name}
          name={name}
          label={label}
          required={required}
          description={description}
        />
      )
    }
    case "array": {
      return object.items.enum ? (
        <FormSection key={name} name={name} label={label} level={path.length}>
          <FormCheckBoxArray
            key={name}
            name={name}
            label=""
            options={object.items.enum}
            required={required}
            description={description}
          />
        </FormSection>
      ) : (
        <FormArray
          key={name}
          object={object}
          path={path}
          required={required}
          description={description}
        />
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

const DisplayDescription = ({
  description,
  children,
}: {
  description: string
  children?: React.ReactElement<unknown>
}) => {
  const { t } = useTranslation()
  const [isReadMore, setIsReadMore] = React.useState(description.length > 60)

  const toggleReadMore = () => {
    setIsReadMore(!isReadMore)
  }

  const ReadmoreText = styled("span")(({ theme }) => ({
    fontWeight: 700,
    textDecoration: "underline",
    display: "block",
    marginTop: "0.5rem",
    color: theme.palette.primary.main,
    "&:hover": { cursor: "pointer" },
  }))

  return (
    <p>
      {isReadMore ? `${description.slice(0, 60)}...` : description}
      {!isReadMore && children}
      {description?.length >= 60 && (
        <ReadmoreText onClick={toggleReadMore}>
          {isReadMore ? t("showMore") : t("showLess")}
        </ReadmoreText>
      )}
    </p>
  )
}

type FormSectionProps = {
  name: string
  label: string
  level: number
  isTitleShown?: boolean
  children?: React.ReactNode
}

const FormSectionTitle = styled(Paper, { shouldForwardProp: prop => prop !== "level" })<{
  level: number
}>(({ theme, level }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  alignItems: "start",
  backgroundColor: level === 1 ? theme.palette.primary.light : theme.palette.common.white,
  height: "100%",
  marginLeft: level <= 1 ? "5rem" : 0,
  marginRight: "3rem",
  padding: level === 0 ? "4rem 0 3rem 0" : level === 1 ? "2rem" : 0,
}))

/*
 * FormSection is rendered for properties with type object
 */
const FormSection = ({
  name,
  label,
  level,
  children,
  description,
  isTitleShown,
}: FormSectionProps & { description?: string }) => {
  const splittedPath = name.split(".") // Have a fully splitted path for names such as "studyLinks.0", "dacLinks.0"

  const heading = (
    <Grid size={{ xs: 12, md: level === 0 ? 12 : level === 1 ? 4 : 8 }}>
      {(level <= 1 || ((level === 3 || level === 2) && isTitleShown)) && label && (
        <FormSectionTitle square={true} elevation={0} level={level}>
          <Typography
            key={`${name}-header`}
            variant={level === 0 ? "h4" : ("subtitle1" as TypographyVariant)}
            role="heading"
            color="secondary"
          >
            {label} {name.includes("keywords") ? "*" : ""}
            {description && level === 1 && (
              <FieldTooltip
                title={<DisplayDescription description={description} />}
                placement="top"
                arrow
                describeChild
              >
                <TooltipIcon />
              </FieldTooltip>
            )}
          </Typography>
        </FormSectionTitle>
      )}
    </Grid>
  )

  return (
    <ConnectForm>
      {({ errors }: ConnectFormMethods) => {
        const error = get(errors, name)
        return (
          <>
            <Grid
              container
              key={`${name}-section`}
              sx={{ mb: level <= 1 && splittedPath.length <= 1 ? "3rem" : 0 }}
            >
              {heading}
              <Grid size={{ xs: 12, md: level === 1 && label ? 8 : 12 }}>{children}</Grid>
            </Grid>
            <div>
              {error ? (
                <FormControl error>
                  <FormHelperText>
                    {label} {error?.message}
                  </FormHelperText>
                </FormControl>
              ) : null}
            </div>
          </>
        )
      }}
    </ConnectForm>
  )
}

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
  object: FormObject
  nestedField?: NestedField
  required?: boolean
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

  let fieldValue: string | number | undefined

  const flattenObject = (obj: { [x: string]: never }, prefix = "") =>
    Object.keys(obj).reduce(
      (acc, k) => {
        const pre = prefix.length ? prefix + "." : ""
        if (typeof obj[k] === "object") Object.assign(acc, flattenObject(obj[k], pre + k))
        else acc[pre + k] = obj[k]
        return acc
      },
      {} as Record<string, string>
    )

  if (Object.keys(values).length > 0 && lastPathItem !== "prevStepIndex") {
    for (const item of path) {
      if (values[item]) {
        const itemValues = values[item]
        const parentPath = Object.keys(itemValues) ? Object.keys(itemValues).toString() : ""
        // Match key from currentObject to option property.
        // Field key can be deeply nested and therefore we need to have multiple cases for finding correct value.
        if (isNaN(Number(parentPath[0]))) {
          fieldValue = (
            options.find(option => option.properties[parentPath])
              ? // Eg. Sample > Sample Names > Sample Data Type
                options.find(option => option.properties[parentPath])
              : // Eg. Run > Run Type > Reference Alignment
                options.find(
                  option =>
                    option.properties[
                      Object.keys(flattenObject(itemValues))[0].split(".").slice(-1)[0]
                    ]
                )
          )?.title as string
        } else {
          // Eg. Experiment > Expected Base Call Table > Processing > Single Processing
          if (typeof itemValues === "string") {
            fieldValue = options.find(option => option.type === "string")?.title
          }
          // Eg. Experiment > Expected Base Call Table > Processing > Complex Processing
          else {
            const fieldKey = Object.keys(values[item][0])[0]
            fieldValue = options?.find(option => option.items?.properties[fieldKey])?.title
          }
        }
      }
    }
  }

  // Eg. Study > Study Links
  if (nestedField) {
    for (const option of options) {
      option.required.every(
        (val: string) =>
          nestedField.fieldValues && Object.keys(nestedField.fieldValues).includes(val)
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

  type ChildObject = { properties: Record<string, unknown>; required: boolean }

  const getChildObjects = (obj?: ChildObject) => {
    if (obj) {
      let childProps
      for (const key in obj) {
        // Check if object has nested "properties"
        if (key === "properties") {
          childProps = obj.properties
          const childPropsValues = Object.values(childProps)[0]
          if (Object.hasOwnProperty.call(childPropsValues, "properties")) {
            getChildObjects(childPropsValues as ChildObject)
          }
        }
      }

      const firstProp = childProps ? Object.keys(childProps)[0] : ""
      return { obj, firstProp }
    }
    return {}
  }

  const [field, setField] = React.useState(fieldValue)
  const clearForm = useAppSelector(state => state.clearForm)

  return (
    <ConnectForm>
      {({ errors, unregister, setValue, getValues, reset }: ConnectFormMethods) => {
        if (clearForm) {
          // Clear the field and "clearForm" is true
          setField("")
          unregister(name)
        }

        const error = get(errors, name)
        // Option change handling
        const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
          const val = event.target.value
          setField(val)

          // Get fieldValues of current path
          const currentFieldValues = getValues(name)
          // Unregister if selecting "Complex Processing", "Null value" in Experiment form
          if (val === "Complex Processing") unregister(name)
          if (val === "Null value") setValue(name, null)
          // Remove previous values of the same path
          if (
            val !== "Complex Processing" &&
            val !== "Null value" &&
            currentFieldValues !== undefined
          ) {
            reset({ ...getValues(), [name]: "" })
          }
        }

        // Selected option
        const selectedOption =
          options?.filter((option: { title: string }) => option.title === field)[0]?.properties ||
          {}
        const selectedOptionValues = Object.values(selectedOption)

        let childObject
        let requiredProp: string

        // If selectedOption has many nested "properties"
        if (
          selectedOptionValues.length > 0 &&
          Object.hasOwnProperty.call(selectedOptionValues[0], "properties")
        ) {
          const { obj, firstProp } = getChildObjects(
            Object.values(selectedOption)[0] as ChildObject
          )
          childObject = obj
          requiredProp = firstProp || ""
        }
        // Else if selectedOption has no nested "properties"
        else {
          childObject = options?.filter((option: { title: string }) => option.title === field)[0]
          requiredProp = childObject?.required?.toString() || Object.keys(selectedOption)[0]
        }

        let child
        if (field) {
          const fieldObject = options?.filter(
            (option: { title: string }) => option.title === field
          )[0]
          child = traverseFields(
            { ...fieldObject, title: "" },
            path,
            required && requiredProp ? requiredProp.split(",") : [],
            childObject?.required ? false : true,
            nestedField
          )
        } else child = null

        return (
          <>
            <BaselineDiv>
              <TextField
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
                inputProps={{ "data-testid": name }}
                sx={{ mb: "1rem" }}
              >
                <option value="" disabled />
                {options?.map((optionObject: { title: string }) => {
                  const option = optionObject.title
                  return (
                    <option key={`${name}-${option}`} value={option}>
                      {option}
                    </option>
                  )
                })}
              </TextField>
              {description && (
                <FieldTooltip
                  title={<DisplayDescription description={description} />}
                  placement="right"
                  arrow
                  describeChild
                >
                  <TooltipIcon />
                </FieldTooltip>
              )}
            </BaselineDiv>
            {child}
          </>
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
 * FormTextField is the most usual type, rendered for strings, integers and numbers.
 */
const FormTextField = ({
  name,
  label,
  required,
  description,
  type = "string",
  nestedField,
}: FormFieldBaseProps & { description: string; type?: string; nestedField?: NestedField }) => {
  const objectType = useAppSelector(state => state.objectType)
  const isDOIForm = objectType === ObjectTypes.datacite
  const autocompleteField = useAppSelector(state => state.autocompleteField)
  const path = name.split(".")
  const [lastPathItem] = path.slice(-1)

  // Default Value of input
  const defaultValue = getDefaultValue(name, nestedField)
  // useWatch to watch any changes in form's fields
  const watchValues = useWatch()

  // Case: DOI form - Affilation identifier to be prefilled and hidden
  const prefilledHiddenFields = ["affiliationIdentifier"]
  const isPrefilledHiddenField = isDOIForm && prefilledHiddenFields.includes(lastPathItem)

  /*
   * Handle DOI form values
   */
  const { setValue, getValues } = useFormContext()
  const watchAutocompleteFieldName = isPrefilledHiddenField ? getPathName(path, "name") : null
  const prefilledValue = watchAutocompleteFieldName
    ? get(watchValues, watchAutocompleteFieldName)
    : null

  // Check value of current name path
  const val = getValues(name)

  React.useEffect(() => {
    if (!isPrefilledHiddenField) return
    if (prefilledValue && !val) {
      // Set value for prefilled field if autocompleteField exists
      setValue(name, autocompleteField)
    } else if (prefilledValue === undefined && val) {
      // Remove values if autocompleteField is deleted
      setValue(name, "")
    }
  }, [autocompleteField, prefilledValue])

  return (
    <ConnectForm>
      {({ control }: ConnectFormMethods) => {
        const multiLineRowIdentifiers = ["abstract", "description", "policy text"]

        return (
          <Controller
            render={({ field, fieldState: { error } }) => {
              const inputValue =
                (watchAutocompleteFieldName && typeof val !== "object" && val) ||
                (typeof field.value !== "object" && field.value) ||
                ""

              const handleChange = (e: { target: { value: string | number } }) => {
                const { value } = e.target
                const parsedValue =
                  type === "string" && typeof value === "number" ? value.toString() : value
                field.onChange(parsedValue) // Helps with Cypress change detection
                setValue(name, parsedValue) // Enables update of nested fields, eg. DAC contact
              }

              return (
                <div style={{ marginBottom: "1rem" }}>
                  <BaselineDiv style={isPrefilledHiddenField ? { display: "none" } : {}}>
                    <TextField
                      {...field}
                      slotProps={{ htmlInput: { "data-testid": name } }}
                      label={label}
                      id={name}
                      role="textbox"
                      error={!!error}
                      helperText={error?.message}
                      required={required}
                      type={type}
                      multiline={multiLineRowIdentifiers.some(value =>
                        label.toLowerCase().includes(value)
                      )}
                      rows={5}
                      value={inputValue}
                      onChange={handleChange}
                      disabled={defaultValue !== "" && name.includes("formats")}
                    />
                    {description && (
                      <FieldTooltip
                        title={<DisplayDescription description={description} />}
                        placement="right"
                        arrow
                        describeChild
                      >
                        <TooltipIcon />
                      </FieldTooltip>
                    )}
                  </BaselineDiv>
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
 * FormSelectField is rendered for selection from options where it's possible to choose many options
 */

const FormSelectField = ({
  name,
  label,
  required,
  options,
  description,
}: FormSelectFieldProps & { description: string }) => (
  <ConnectForm>
    {({ control }: ConnectFormMethods) => {
      return (
        <Controller
          name={name}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <BaselineDiv>
                <TextField
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
                  inputProps={{ "data-testid": name }}
                  sx={{ mb: "1rem" }}
                >
                  <option value="" disabled />
                  {options.map(option => (
                    <option key={`${name}-${option}`} value={option} data-testid={`${name}-option`}>
                      {option}
                    </option>
                  ))}
                </TextField>
                {description && (
                  <FieldTooltip
                    title={<DisplayDescription description={description} />}
                    placement="right"
                    arrow
                    describeChild
                  >
                    <TooltipIcon />
                  </FieldTooltip>
                )}
              </BaselineDiv>
            )
          }}
        />
      )
    }}
  </ConnectForm>
)

/*
 * FormDatePicker used for selecting date or date rage in DOI form
 */

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  "& .MuiIconButton-root": {
    color: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))

const FormDatePicker = ({
  name,
  required,
  description,
}: FormFieldBaseProps & { description: string }) => {
  const { t } = useTranslation()
  const { getValues } = useFormContext()
  const defaultValue = getValues(name) || ""

  const getStartEndDates = (date: string) => {
    const [startInput, endInput] = date?.split("/")
    if (startInput && endInput) return [moment(startInput), moment(endInput)]
    else if (startInput) return [moment(startInput), null]
    else if (endInput) return [null, moment(endInput)]
    else return [null, null]
  }

  const [startDate, setStartDate] = React.useState<moment.Moment | null>(
    getStartEndDates(defaultValue)[0]
  )
  const [endDate, setEndDate] = React.useState<moment.Moment | null>(
    getStartEndDates(defaultValue)[1]
  )
  const [startError, setStartError] = React.useState<string | null>(null)
  const [endError, setEndError] = React.useState<string | null>(null)
  const clearForm = useAppSelector(state => state.clearForm)

  React.useEffect(() => {
    if (clearForm) {
      setStartDate(null)
      setEndDate(null)
    }
  }, [clearForm])

  const format = "YYYY-MM-DD"
  const formatDate = (date: moment.Moment) => moment(date).format(format)

  const makeValidDateString = (start: moment.Moment | null, end: moment.Moment | null) => {
    let dateStr = ""
    if (start && start?.isValid()) {
      dateStr = formatDate(start)
      if (end && end?.isValid() && formatDate(end) !== dateStr) {
        dateStr += `/${formatDate(end)}`
      }
    }
    return dateStr
  }

  return (
    <ConnectForm>
      {({ setValue }: ConnectFormMethods) => {
        const handleChangeStartDate = (newValue: moment.Moment | null) => {
          setStartDate(newValue)
          setValue(name, makeValidDateString(newValue, endDate))
        }

        const handleChangeEndDate = (newValue: moment.Moment | null) => {
          setEndDate(newValue)
          setValue(name, makeValidDateString(startDate, newValue))
        }

        return (
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <Box
              sx={{
                width: "95%",
                display: "flex",
                flexDirection: "row",
                alignItems: "baseline",
                marginBottom: "1rem",
              }}
            >
              <StyledDatePicker
                label={t("datacite.startDate")}
                value={startDate}
                format={format}
                onChange={handleChangeStartDate}
                onError={setStartError}
                shouldDisableDate={day => !!endDate && moment(day).isAfter(endDate)}
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    required,
                    error: !!startError,
                    helperText: startError
                      ? startError === "shouldDisableDate"
                        ? t("datacite.error.range")
                        : t("datacite.error.date")
                      : "",
                  },
                  nextIconButton: { color: "primary" },
                  previousIconButton: { color: "primary" },
                  switchViewIcon: { color: "primary" },
                }}
              />
              <span>–</span>
              <StyledDatePicker
                label={t("datacite.endDate")}
                value={endDate}
                format={format}
                onChange={handleChangeEndDate}
                onError={setEndError}
                shouldDisableDate={day => !!startDate && moment(day).isBefore(startDate)}
                slotProps={{
                  field: { clearable: true },
                  textField: {
                    error: !!endError,
                    helperText: endError
                      ? endError === "shouldDisableDate"
                        ? t("datacite.error.range")
                        : t("datacite.error.date")
                      : "",
                  },
                  nextIconButton: { color: "primary" },
                  previousIconButton: { color: "primary" },
                  switchViewIcon: { color: "primary" },
                }}
              />
              {description && (
                <FieldTooltip
                  title={<DisplayDescription description={description} />}
                  placement="right"
                  arrow
                  describeChild
                >
                  <TooltipIcon />
                </FieldTooltip>
              )}
            </Box>
          </LocalizationProvider>
        )
      }}
    </ConnectForm>
  )
}

/*
 * FormAutocompleteField uses ROR API to fetch organisations
 */
type RORItem = {
  name: string
  id: string
}

const StyledAutocomplete = styled(Autocomplete)(() => ({
  flex: "auto",
  alignSelf: "flex-start",
  "& + svg": {
    marginTop: 1,
  },
})) as typeof Autocomplete

const FormAutocompleteField = ({
  name,
  label,
  required,
  description,
}: FormFieldBaseProps & { description: string }) => {
  const dispatch = useAppDispatch()

  const { setValue, control } = useFormContext()
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<RORItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const clearForm = useAppSelector(state => state.clearForm)

  // Watch the field value from RHF
  const fieldValue = useWatch({ name, control })
  const [inputValue, setInputValue] = React.useState(fieldValue || "")

  // Fetch organisations from ROR API
  const fetchOrganisations = async (searchTerm: string) => {
    const isContainingNonWordChar = searchTerm.match(/\W/g)
    const response =
      isContainingNonWordChar === null ? await rorAPIService.getOrganisations(searchTerm) : null

    if (response?.ok) {
      const mappedOrganisations = response.data.items.map((org: RORItem) => ({
        name: org.name,
        id: org.id,
      }))
      setOptions(mappedOrganisations)
    }
    setLoading(false)
  }

  const debouncedSearch = React.useMemo(
    () =>
      debounce((newInput: string) => {
        if (newInput.length > 0) {
          setLoading(true)
          fetchOrganisations(newInput)
        } else {
          setOptions([])
        }
      }, 150),
    []
  )
  // Sync inputValue with form value
  React.useEffect(() => {
    setInputValue(fieldValue || "")
  }, [fieldValue])

  React.useEffect(() => {
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
  }, [open, inputValue])

  // Clear on form clear
  React.useEffect(() => {
    if (clearForm) {
      setInputValue("")
      setOptions([])
      setValue(name, "")
    }
  }, [clearForm, setValue, name])

  // Fetch options when input changes
  React.useEffect(() => {
    if (open && inputValue) {
      debouncedSearch(inputValue)
    } else if (!inputValue) {
      setOptions([])
    }
  }, [inputValue, open, debouncedSearch])

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <StyledAutocomplete
          freeSolo
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          options={options}
          getOptionLabel={option =>
            typeof option === "object" && option !== null
              ? option.name
              : typeof option === "string"
                ? option
                : ""
          }
          loading={loading}
          disableClearable={inputValue.length === 0}
          renderInput={params => (
            <BaselineDiv>
              <TextField
                {...params}
                label={label}
                id={name}
                name={name}
                variant="outlined"
                error={false}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                inputProps={{ ...params.inputProps, "data-testid": `${name}-inputField` }}
                sx={[
                  {
                    "&.MuiAutocomplete-endAdornment": {
                      top: 0,
                    },
                  },
                ]}
              />
              {description && (
                <FieldTooltip
                  title={
                    <DisplayDescription description={description}>
                      <>
                        <br />
                        {"Organisations provided by "}
                        <a href="https://ror.org/" target="_blank" rel="noreferrer">
                          {"ror.org"}
                          <LaunchIcon sx={{ fontSize: "1rem", mb: -1 }} />
                        </a>
                      </>
                    </DisplayDescription>
                  }
                  placement="right"
                  arrow
                  describeChild
                >
                  <TooltipIcon />
                </FieldTooltip>
              )}
            </BaselineDiv>
          )}
          value={
            // Find the selected option object by name, or null if empty
            options.find(option => option.name === field.value) ||
            (field.value ? { name: field.value, id: "" } : null)
          }
          inputValue={inputValue}
          onChange={(_event, option) => {
            if (option && typeof option === "object" && "name" in option) {
              field.onChange(option.name)
              dispatch(setAutocompleteField(option.id))
            } else if (typeof option === "string") {
              field.onChange(option)
            } else {
              field.onChange("")
            }
          }}
          onInputChange={(_event, newInputValue) => setInputValue(newInputValue)}
        />
      )}
    />
  )
}

const ValidationTagField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root.MuiInputBase-root": { flexWrap: "wrap" },
  "& input": { flex: 1, minWidth: "2rem" },
  "& label": { color: theme.palette.primary.main },
  "& .MuiOutlinedInput-notchedOutline, div:hover .MuiOutlinedInput-notchedOutline":
    highlightStyle(theme),
}))

const FormTagField = ({
  name,
  label,
  description,
}: FormFieldBaseProps & { description: string }) => {
  const { control } = useFormContext()
  const [inputValue, setInputValue] = React.useState("")
  return (
    <Controller
      name={name}
      control={control}
      defaultValue=""
      render={({ field, fieldState: { error } }) => {
        const tags = field.value ? field.value.split(",").filter(Boolean) : []

        const handleAddTag = (tag: string) => {
          const trimmedTag = tag.trim()
          if (trimmedTag && !tags.includes(trimmedTag)) {
            const newTags = [...tags, trimmedTag]
            field.onChange(newTags.join(","))
          }
          setInputValue("")
        }

        const handleRemoveTag = (tagToRemove: string) => {
          const newTags = tags.filter(tag => tag !== tagToRemove)
          field.onChange(newTags.join(","))
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (["Enter", ","].includes(e.key) && inputValue.trim()) {
            e.preventDefault()
            handleAddTag(inputValue)
          }
        }

        return (
          <div style={{ marginBottom: "1rem" }}>
            <BaselineDiv>
              <ValidationTagField
                label={label}
                value={inputValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (inputValue.trim()) handleAddTag(inputValue)
                }}
                InputProps={{
                  startAdornment: tags.map(tag => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      deleteIcon={<ClearIcon fontSize="small" />}
                      sx={{ margin: "0.2rem" }}
                    />
                  )),
                }}
                error={!!error}
                helperText={error?.message}
                inputProps={{ "data-testid": name }}
              />

              {description && (
                <FieldTooltip
                  title={<DisplayDescription description={description} />}
                  placement="right"
                  arrow
                  describeChild
                >
                  <TooltipIcon />
                </FieldTooltip>
              )}
            </BaselineDiv>

            <input type="hidden" name={name} value={field.value} />
          </div>
        )
      }}
    />
  )
}
/*
 * Highlight required Checkbox
 */
const ValidationFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  label: {
    "& span": { color: theme.palette.primary.main },
  },
}))

const FormBooleanField = ({
  name,
  label,
  required,
  description,
}: FormFieldBaseProps & { description: string }) => {
  return (
    <ConnectForm>
      {({ register, errors, getValues }: ConnectFormMethods) => {
        const error = get(errors, name)

        const { ref, ...rest } = register(name)
        // DAC form: "values" of MainContact checkbox
        const values = getValues(name)
        return (
          <Box display="inline" px={1}>
            <FormControl error={!!error} required={required}>
              <FormGroup>
                <BaselineDiv>
                  <ValidationFormControlLabel
                    control={
                      <Checkbox
                        id={name}
                        {...rest}
                        name={name}
                        required={required}
                        inputRef={ref}
                        color="primary"
                        checked={values || false}
                        inputProps={
                          { "data-testid": name } as React.InputHTMLAttributes<HTMLInputElement>
                        }
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
                    <FieldTooltip
                      title={<DisplayDescription description={description} />}
                      placement="right"
                      arrow
                      describeChild
                    >
                      <TooltipIcon />
                    </FieldTooltip>
                  )}
                </BaselineDiv>

                <FormHelperText>{error?.message}</FormHelperText>
              </FormGroup>
            </FormControl>
          </Box>
        )
      }}
    </ConnectForm>
  )
}

const FormCheckBoxArray = ({
  name,
  label,
  required,
  options,
  description,
}: FormSelectFieldProps & { description: string }) => (
  <Box px={1}>
    <p>{label}</p>
    <ConnectForm>
      {({ register, errors, getValues }: ConnectFormMethods) => {
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
                        {...rest}
                        inputRef={ref}
                        name={name}
                        value={option}
                        checked={values && values?.includes(option) ? true : false}
                        color="primary"
                        defaultValue=""
                        inputProps={
                          { "data-testid": name } as React.InputHTMLAttributes<HTMLInputElement>
                        }
                      />
                    }
                    label={option}
                  />
                  {description && (
                    <FieldTooltip
                      title={<DisplayDescription description={description} />}
                      placement="right"
                      arrow
                      describeChild
                    >
                      <TooltipIcon />
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
  object: FormObject
  path: Array<string>
  required: boolean
}

const FormArrayTitle = styled(Paper, { shouldForwardProp: prop => prop !== "level" })<{
  level: number
}>(({ theme, level }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  alignItems: "start",
  backgroundColor: level < 2 ? theme.palette.primary.light : theme.palette.common.white,
  height: "100%",
  marginLeft: level < 2 ? "5rem" : 0,
  marginRight: "3rem",
  padding: level === 1 ? "2rem" : 0,
}))

const FormArrayChildrenTitle = styled(Paper)(() => ({
  width: "70%",
  display: "inline-block",
  marginBottom: "1rem",
  paddingLeft: "1rem",
  paddingTop: "1rem",
}))

/*
 * FormArray is rendered for arrays of objects. User is given option to choose how many objects to add to array.
 */
const FormArray = ({
  object,
  path,
  required,
  description,
}: FormArrayProps & { description: string }) => {
  const name = pathToName(path)
  const [lastPathItem] = path.slice(-1)
  const level = path.length
  const label = object.title ?? lastPathItem

  // Get currentObject and the values of current field
  const currentObject = useAppSelector(state => state.currentObject) || {}
  const fileTypes = useAppSelector(state => state.fileTypes)

  const fieldValues = get(currentObject, name)

  const items = traverseValues(object.items) as FormObject

  const { control } = useForm()

  const {
    unregister,
    getValues,
    setValue,
    formState: { isSubmitted },
    clearErrors,
  } = useFormContext()

  const { fields, append, remove } = useFieldArray({ control, name })

  const [formFields, setFormFields] = React.useState<Record<"id", string>[] | null>(null)
  const { t } = useTranslation()

  // Append the correct values to the equivalent fields when editing form
  // This applies for the case: "fields" does not get the correct data (empty array) although there are values in the fields
  // E.g. Study > StudyLinks or Experiment > Expected Base Call Table
  // Append only once when form is populated
  React.useEffect(() => {
    if (
      fieldValues?.length > 0 &&
      fields?.length === 0 &&
      typeof fieldValues === "object" &&
      !formFields
    ) {
      const fieldsArray: Record<string, unknown>[] = []
      for (let i = 0; i < fieldValues.length; i += 1) {
        fieldsArray.push({ fieldValues: fieldValues[i] })
      }
      append(fieldsArray)
    }
    // Create initial fields when editing object
    setFormFields(fields)
  }, [fields])

  // Get unique fileTypes from submitted fileTypes
  const uniqueFileTypes = uniq(
    flatten(fileTypes?.map((obj: { fileTypes: string[] }) => obj.fileTypes))
  )

  React.useEffect(() => {
    // Append fileType to formats' field
    if (name === "formats") {
      for (let i = 0; i < uniqueFileTypes.length; i += 1) {
        append({ formats: uniqueFileTypes[i] })
      }
    }
  }, [uniqueFileTypes.length])

  // Clear required field array error and append
  const handleAppend = () => {
    clearErrors([name])
    append({})
  }

  const handleRemove = (index: number) => {
    // Unregister field if removing last item: empty array isn't flagged as missing or invalid
    if (index === 0 && getValues(name)?.length <= 1) {
      remove()
      unregister(name)
      return
    }
    // Set the correct values according to the name path when removing a field
    const values = getValues(name)
    const filteredValues = values?.filter((_val: unknown, ind: number) => ind !== index)
    setValue(name, filteredValues)
    setFormFields(filteredValues)
    remove(index)
  }

  return (
    <Grid
      container
      key={`${name}-array`}
      aria-labelledby={name}
      data-testid={name}
      direction={level < 2 ? "row" : "column"}
      sx={{ mb: level === 1 ? "3rem" : 0 }}
    >
      <Grid size={{ xs: 12, md: 4 }}>
        {
          <FormArrayTitle square={true} elevation={0} level={level}>
            <Typography
              key={`${name}-header`}
              variant={"subtitle1"}
              data-testid={name}
              role="heading"
              color="secondary"
            >
              {label}
              {required ? "*" : null}
              {required && formFields?.length === 0 && isSubmitted && (
                <span>
                  <FormControl error>
                    <FormHelperText>{t("errors.form.empty")}</FormHelperText>
                  </FormControl>
                </span>
              )}
              {description && (
                <FieldTooltip
                  title={<DisplayDescription description={description} />}
                  placement="top"
                  arrow
                  describeChild
                >
                  <TooltipIcon />
                </FieldTooltip>
              )}
            </Typography>
          </FormArrayTitle>
        }
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        {formFields?.map((field, index) => {
          const pathWithoutLastItem = path.slice(0, -1)
          const lastPathItemWithIndex = `${lastPathItem}.${index}`

          if (items.oneOf) {
            const pathForThisIndex = [...pathWithoutLastItem, lastPathItemWithIndex]

            return (
              <Box
                key={field.id || index}
                data-testid={`${name}[${index}]`}
                display="flex"
                alignItems="center"
              >
                <FormArrayChildrenTitle elevation={2} square>
                  <FormOneOfField
                    key={field.id}
                    nestedField={field as NestedField}
                    path={pathForThisIndex}
                    object={items}
                  />
                </FormArrayChildrenTitle>
                <IconButton onClick={() => handleRemove(index)}>
                  <RemoveIcon />
                </IconButton>
              </Box>
            )
          }

          const properties = object.items.properties
          let requiredProperties =
            index === 0 && object.contains?.allOf
              ? object.contains?.allOf?.flatMap((item: FormObject) => item.required) // Case: DAC - Main Contact needs at least 1
              : object.items?.required

          // Force first array item as required field if array is required but none of the items are required
          if (required && !requiredProperties) requiredProperties = [Object.keys(items)[0]]

          return (
            <Box key={field.id || index} aria-labelledby={name} display="flex" alignItems="center">
              <FormArrayChildrenTitle elevation={2} square>
                {
                  items
                    ? Object.keys(items).map(item => {
                        const pathForThisIndex = [
                          ...pathWithoutLastItem,
                          lastPathItemWithIndex,
                          item,
                        ]
                        const requiredField = requiredProperties
                          ? requiredProperties.filter((prop: string) => prop === item)
                          : []
                        return traverseFields(
                          properties[item] as FormObject,
                          pathForThisIndex,
                          requiredField,
                          false,
                          field as NestedField
                        )
                      })
                    : traverseFields(
                        object.items,
                        [...pathWithoutLastItem, lastPathItemWithIndex],
                        [],
                        false,
                        field as NestedField
                      ) // special case for doiSchema's "sizes" and "formats"
                }
              </FormArrayChildrenTitle>
              <IconButton onClick={() => handleRemove(index)} size="large">
                <RemoveIcon />
              </IconButton>
            </Box>
          )
        })}

        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleAppend()}
          sx={{ mb: "1rem" }}
        >
          {t("formActions.addItem")}
        </Button>
      </Grid>
    </Grid>
  )
}

export default {
  buildFields,
  cleanUpFormValues,
}
