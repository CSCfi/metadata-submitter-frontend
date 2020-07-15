//@flow
import React from "react"

import TextField, {
  StandardTextFieldProps as TextFieldProps,
} from "@material-ui/core/TextField"

import { WidgetProps, utils } from "@rjsf/core"

const { getDisplayLabel } = utils

export type TextWidgetProps = WidgetProps & TextFieldProps

const TextWidget = ({
  formContext, // eslint-disable-line no-unused-vars
  id,
  required,
  readonly,
  disabled,
  type,
  label,
  value,
  onChange,
  onBlur,
  onFocus,
  autofocus,
  options,
  schema,
  uiSchema,
  rawErrors = [],
  name,
  ...textFieldProps
}: TextWidgetProps) => {
  const _onChange = (event: SyntheticEvent<>) => {
    const { target } = event
    if (target instanceof HTMLInputElement) {
      return onChange(target.value === "" ? options.emptyValue : target.value)
    }
  }
  const _onBlur = (event: SyntheticEvent<>) => {
    const { target } = event
    if (target instanceof HTMLInputElement) {
      return onBlur(id, target.value)
    }
  }
  const _onFocus = (event: SyntheticEvent<>) => {
    const { target } = event
    if (target instanceof HTMLInputElement) {
      return onFocus(id, target.value)
    }
  }

  const displayLabel = getDisplayLabel(schema, uiSchema)

  return (
    <TextField
      variant="outlined"
      id={id}
      label={displayLabel ? label || schema.title : false}
      autoFocus={autofocus}
      required={required}
      disabled={disabled || readonly}
      name={name}
      type={type || schema.type}
      value={value || value === 0 ? value : ""}
      error={rawErrors.length > 0}
      onChange={_onChange}
      onBlur={_onBlur}
      onFocus={_onFocus}
      {...textFieldProps}
    />
  )
}

export default TextWidget
