//@flow
import React from "react"
import { Formik, Form, Field } from "formik"
import Button from "@material-ui/core/Button"
import TextField from "@material-ui/core/TextField"
import { makeStyles } from "@material-ui/core/styles"

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(2),
    },
  },
}))

const FillObjectDetailsForm = () => {
  const classes = useStyles()
  return (
    <Formik
      initialValues={{
        studyTitle: "",
        studyType: "",
        studyAbstract: "",
      }}
      validate={() => {
        return {}
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          setSubmitting(false)
          console.log(JSON.stringify(values, null, 2))
        }, 500)
      }}
    >
      {({ submitForm, isSubmitting }) => (
        <Form className={classes.root}>
          <Field
            name="studyTitle"
            label="Study title"
            component={TextField}
            fullWidth
            variant="outlined"
          />
          <Field
            name="studyType"
            label="Study type"
            select
            as="select"
            SelectProps={{
              native: true,
            }}
            component={TextField}
            fullWidth
            variant="outlined"
          >
            <option value="Whole Genome Sequencing">
              Whole Genome Sequencing
            </option>
            <option value="Transcriptome Analysis">
              Transcriptome Analysis
            </option>
            <option value="Metagenomics">Metagenomics</option>
            <option value="Resequencing">Resequencing</option>
            <option value="Epigenetics">Epigenetics</option>
            <option value="Synthetic Genomics">Synthetic Genomics</option>
          </Field>
          <Field
            name="studyAbstract"
            label="Study abstract"
            component={TextField}
            fullWidth
            variant="outlined"
          />
          <Button
            variant="outlined"
            color="primary"
            disabled={isSubmitting}
            onClick={submitForm}
          >
            Save
          </Button>
        </Form>
      )}
    </Formik>
  )
}

export default FillObjectDetailsForm
