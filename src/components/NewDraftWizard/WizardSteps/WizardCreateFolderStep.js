//@flow
import React from "react"
import type { ElementRef } from "react"
import WizardHeader from "../WizardComponents/WizardHeader"
import WizardStepper from "../WizardComponents/WizardStepper"
import { Field, Form, Formik } from "formik"
import MuiTextField, { TextFieldProps } from "@material-ui/core/TextField"
import { FieldProps, getIn } from "formik"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
    padding: theme.spacing(2),
  },
}))

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

const TextField = ({ children, ...props }: FieldProps) => (
  <>
    <MuiTextField {...fieldToTextField(props)}>{children}</MuiTextField>
  </>
)

interface nextButtonRefProp {
  nextButtonRef: ElementRef<typeof Formik>;
}

/**
 * Define Formik form for adding new folder
 * @param nextButtonRef: Mutable ref object from useRef-hook
 */
const CreateFolderForm = ({ nextButtonRef }: nextButtonRefProp) => {
  const classes = useStyles()
  return (
    <Formik
      innerRef={nextButtonRef}
      initialValues={{
        name: "",
        description: "",
      }}
      validate={values => {
        const errors = {}
        if (!values.name) errors.name = "Please give a name for folder."
        if (!values.description)
          errors.description = "Please give a description for folder."
        return errors
      }}
      onSubmit={(values, { setSubmitting }) => {
        console.log("Successfully submitted!")
        setSubmitting(false)
      }}
    >
      {() => (
        <Form className={classes.root}>
          <Field
            name="name"
            label="Name"
            component={TextField}
            variant="outlined"
            fullWidth
            required
          />
          <Field
            name="description"
            label="Description"
            component={TextField}
            variant="outlined"
            fullWidth
            multiline
            rowsMax={4}
            required
          />
        </Form>
      )}
    </Formik>
  )
}

/**
 * Show form to create folder as first step of new draft wizard
 * @param nextButtonRef: Mutable ref object from useRef-hook
 */

const WizardCreateFolderStep = ({ nextButtonRef }: nextButtonRefProp) => {
  return (
    <>
      <WizardHeader headerText="Create new draft folder" />
      <WizardStepper />
      <CreateFolderForm nextButtonRef={nextButtonRef} />
    </>
  )
}

export default WizardCreateFolderStep
