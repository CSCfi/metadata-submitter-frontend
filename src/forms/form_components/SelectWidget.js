//@flow
import React from "react"

import TextField from "@material-ui/core/TextField"

import { WidgetProps } from "@rjsf/core"
import { utils } from "@rjsf/core"

const { asNumber, guessType } = utils

const nums = new Set(["number", "integer"])

/**
 * This is a silly limitation in the DOM where option change event values are
 * always retrieved as strings.
 */
const processValue = (schema: any, value: any) => {
  // "enum" is a reserved word, so only "type" and "items" can be destructured
  const { type, items } = schema
  if (value === "") {
    return undefined
  } else if (type === "array" && items && nums.has(items.type)) {
    return value.map(asNumber)
  } else if (type === "boolean") {
    return value === "true"
  } else if (type === "number") {
    return asNumber(value)
  }

  // If type is undefined, but an enum is present, try and infer the type from
  // the enum values
  if (schema.enum) {
    if (schema.enum.every((x: any) => guessType(x) === "number")) {
      return asNumber(value)
    } else if (schema.enum.every((x: any) => guessType(x) === "boolean")) {
      return value === "true"
    }
  }

  return value
}

const SelectWidget = ({
  schema,
  id,
  options,
  label,
  required,
  disabled,
  readonly,
  value,
  multiple,
  autofocus,
  onChange,
  onBlur,
  onFocus,
  rawErrors = [],
  name,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options

  const emptyValue = multiple ? [] : ""

  const _onChange = (event: SyntheticEvent<>) => {
    const {target} = event
    if (target instanceof HTMLInputElement) {
      return onChange(processValue(schema, target.value))
    }
  }
  const _onBlur = (event: SyntheticEvent<>) => {
    const {target} = event
    if (target instanceof HTMLInputElement) {
      return onBlur(id, processValue(schema, target.value))
    }
  }
  const _onFocus = (event: SyntheticEvent<>) => {
    const {target} = event
    if (target instanceof HTMLInputElement) {
      return onFocus(id, processValue(schema, target.value))
    }
  }

  return (
    <TextField
      variant="outlined"
      id={id}
      label={label || schema.title}
      name={name}
      select
      value={typeof value === "undefined" ? emptyValue : value}
      required={required}
      disabled={disabled || readonly}
      autoFocus={autofocus}
      error={rawErrors.length > 0}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      InputLabelProps={{
        shrink: true,
      }}
      SelectProps={{
        native: true,
      }}
    >
      {enumOptions.map(({ value, label }: any, i: number) => {
        const disabled: any = enumDisabled && enumDisabled.indexOf(value) !== -1
        return (
          <option key={i} value={value} disabled={disabled}>
            {label}
          </option>
        )
      })}
    </TextField>
  )
}

export default SelectWidget
