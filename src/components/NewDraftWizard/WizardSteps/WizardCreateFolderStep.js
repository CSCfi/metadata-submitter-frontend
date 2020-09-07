//@flow
import React from "react"
import type { ElementRef } from "react"

import { makeStyles } from "@material-ui/core/styles"
import MuiTextField, { TextFieldProps } from "@material-ui/core/TextField"
import { Field, Form, Formik, FieldProps, getIn } from "formik"
import { useDispatch, useSelector } from "react-redux"

import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"

import { createNewDraftFolder } from "features/submissionFolderSlice"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
    padding: theme.spacing(2),
  },
}))

/**
 * Translate Formik field props to props that Material UI TextField can use,
 * inspired by: https://github.com/stackworx/formik-material-ui/blob/master/packages/formik-material-ui/src/TextField.tsx
 */
const fieldToTextField = ({
  disabled,
  field,
  form: { isSubmitting, touched, errors },
  ...props
}: FieldProps): TextFieldProps => {
  const fieldError = getIn(errors, field.name)
  const showError = getIn(touched, field.name) && !!fieldError
  return {
    ...props,
    ...field,
    error: showError,
    helperText: showError ? fieldError : props.helperText,
    disabled: disabled ?? isSubmitting,
    variant: props.variant,
  }
}

/**
 * Wrap Material UI TextField inside custom component
 */
const TextField = ({ children, ...props }: FieldProps) => (
  <>
    <MuiTextField {...fieldToTextField(props)}>{children}</MuiTextField>
  </>
)

export type CreateFolderFormRef = ElementRef<typeof Formik>

/**
 * Define Formik form for adding new folder. Ref is added to Formik so submission can be triggered outside this component.
 */
const CreateFolderForm = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const folder = useSelector(state => state.submissionFolder)
  if (folder) {
    return (
      <form className={classes.root}>
        <MuiTextField label="Folder Name" variant="outlined" fullWidth required disabled defaultValue={folder.name} />
        <MuiTextField
          label="Folder Description"
          variant="outlined"
          fullWidth
          required
          disabled
          defaultValue={folder.description}
          multiline
          rows={5}
        />
      </form>
    )
  }
  return (
    <Formik
      innerRef={createFolderFormRef}
      initialValues={{
        name: "",
        description: "",
      }}
      validate={values => {
        const errors = {}
        if (!values.name) errors.name = "Please give a name for folder."
        if (!values.description) errors.description = "Please give a description for folder."
        return errors
      }}
      onSubmit={(values, { setSubmitting }) => {
        dispatch(createNewDraftFolder(values))
        setSubmitting(false)
      }}
    >
      {() => (
        <Form className={classes.root}>
          <Field name="name" label="Folder Name" component={TextField} variant="outlined" fullWidth required />
          <Field
            name="description"
            label="Folder Description"
            component={TextField}
            variant="outlined"
            fullWidth
            multiline
            rows={5}
            required
          />
        </Form>
      )}
    </Formik>
  )
}

/**
 * Show form to create folder as first step of new draft wizard
 */

const WizardCreateFolderStep = ({ createFolderFormRef }: { createFolderFormRef: CreateFolderFormRef }) => (
  <>
    <WizardHeader headerText="Creat New Folder" />
    <WizardStepper createFolderFormRef={createFolderFormRef} />
    <CreateFolderForm createFolderFormRef={createFolderFormRef} />
  </>
)

export default WizardCreateFolderStep
