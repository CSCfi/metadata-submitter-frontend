import React, { useState, useRef, useEffect } from "react"

import { Theme } from "@mui/material"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import CardHeader from "@mui/material/CardHeader"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import LinearProgress from "@mui/material/LinearProgress"
import TextField from "@mui/material/TextField"
import { makeStyles } from "@mui/styles"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { resetFocus } from "features/focusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { resetStatusDetails, updateStatus } from "features/statusMessageSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addObject, replaceObjectInSubmission } from "features/wizardSubmissionSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import xmlSubmissionAPIService from "services/xmlSubmissionAPI"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: 0,
  },
  cardHeader: theme.wizard.cardHeader,
  cardHeaderAction: {
    margin: -1,
  },
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: 5,
    },
  },
  hiddenInput: {
    border: "0",
    clip: "rect(0, 0, 0, 0)",
    height: "1px",
    overflow: "hidden",
    padding: "0",
    position: "absolute !important" as "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
  fileField: {
    display: "inline-flex",
  },
  submitButton: {
    backgroundColor: "#FFF",
    color: theme.palette.primary.main,
  },
  dropzone: {
    flex: 1,
    backgroundColor: theme.palette.primary.light,
    border: "2px dashed #51A808",
  },
}))

/*
 * Return React Hook Form based form for uploading xml files. Handles form submitting, validating and error/success alerts.
 */
const WizardUploadObjectXMLForm: React.FC = () => {
  const [isSubmitting, setSubmitting] = useState(false)
  const objectType = useAppSelector(state => state.objectType)
  const { submissionId } = useAppSelector(state => state.submission)
  const dispatch = useAppDispatch()
  const classes = useStyles()
  const currentObject = useAppSelector(state => state.currentObject)
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValidating },
    handleSubmit,
    reset,
  } = useForm({ mode: "onChange" })
  const [placeHolder, setPlaceHolder] = useState("Name")

  const watchFile = watch("fileUpload")

  const focusTarget = useRef<HTMLLabelElement | null>(null)
  const shouldFocus = useAppSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  useEffect(() => {
    if (watchFile && watchFile[0] && watchFile[0].name) {
      setPlaceHolder(watchFile[0].name)
    } else {
      setPlaceHolder(currentObject?.tags?.fileName || "Name")
    }
  }, [currentObject, watchFile])

  const onDrop = async (acceptedFiles: File[]) => {
    const filelist = new DataTransfer()
    // Accept all file types. Validation is done in file upload form by React Hook Form.
    filelist.items.add(acceptedFiles[0])
    setValue("fileUpload", filelist.files, { shouldValidate: true })
  }

  const { getRootProps, isDragActive } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: onDrop,
  })

  const resetForm = () => {
    reset()
    setPlaceHolder("Name")
  }

  type FileUpload = { fileUpload: FileList }

  const fileName = watchFile && watchFile[0] ? watchFile[0].name : "No file name"
  const onSubmit = async (data: FileUpload) => {
    dispatch(resetStatusDetails())
    setSubmitting(true)
    dispatch(setLoading())
    const file = data.fileUpload[0] || {}
    const waitForServertimer = setTimeout(() => {
      dispatch(updateStatus({ status: ResponseStatus.info }))
    }, 5000)

    if (currentObject.accessionId) {
      const response = await objectAPIService.replaceXML(objectType, currentObject.accessionId, file)

      if (response.ok) {
        dispatch(
          replaceObjectInSubmission(
            currentObject.accessionId,

            {
              submissionType: ObjectSubmissionTypes.xml,
              fileName: fileName,
              displayTitle: fileName,
            },
            ObjectStatus.submitted
          )
        )
        dispatch(updateStatus({ status: ResponseStatus.success, response: response }))
        dispatch(resetCurrentObject())
        resetForm()
      } else {
        dispatch(updateStatus({ status: ResponseStatus.error, response: response }))
      }
    } else {
      const response = await objectAPIService.createFromXML(objectType, submissionId, file)

      if (response.ok) {
        dispatch(updateStatus({ status: ResponseStatus.success, response: response }))
        dispatch(
          addObject({
            accessionId: response.data.accessionId,
            schema: objectType,
            tags: { submissionType: ObjectSubmissionTypes.xml, fileName, displayTitle: fileName },
          })
        )
        resetForm()
      } else {
        dispatch(updateStatus({ status: ResponseStatus.error, response: response }))
      }
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
    dispatch(resetLoading())
  }

  const handleButton = () => {
    const fileSelect = document && document.getElementById("file-select-button")
    if (fileSelect) {
      fileSelect.click()
    }
    dispatch(resetFocus())
  }

  const submitButton = (
    <Button
      variant="contained"
      className={classes.submitButton}
      size="small"
      disabled={isSubmitting || !watchFile || watchFile.length === 0 || errors.fileUpload != null || isValidating}
      onClick={handleSubmit(async data => onSubmit(data as FileUpload))}
    >
      {currentObject?.status === ObjectStatus.submitted ? "Replace" : "Submit"}
    </Button>
  )

  return (
    <Container maxWidth={false} className={isDragActive ? classes.dropzone : classes.container} {...getRootProps()}>
      <CardHeader
        title="Upload XML File"
        titleTypographyProps={{ variant: "inherit" }}
        classes={{
          root: classes.cardHeader,
          action: classes.cardHeaderAction,
        }}
        action={submitButton}
      />
      {/* React Hook Form */}
      <form onSubmit={handleSubmit(async data => onSubmit(data as FileUpload))}>
        <FormControl className={classes.root}>
          <div className={classes.fileField}>
            <TextField
              placeholder={placeHolder}
              inputProps={{ readOnly: true, tabIndex: -1 }}
              data-testid="xml-file-name"
            />
            <Button
              ref={focusTarget}
              variant="contained"
              color="primary"
              component="label"
              onClick={() => handleButton()}
              onBlur={() => dispatch(resetFocus())}
            >
              Choose file
            </Button>
            <input
              type="file"
              id="file-select-button"
              data-testid="xml-upload"
              hidden
              {...register("fileUpload", {
                validate: {
                  isFile: value => value.length > 0,
                  isXML: value => value[0]?.type === "text/xml",
                  isValidXML: async value => {
                    const response = await xmlSubmissionAPIService.validateXMLFile(objectType, value[0])

                    if (!response.data.isValid) {
                      return `The file you attached is not valid ${objectType},
                      our server reported following error:
                      ${response.data.detail.reason}.`
                    }
                  },
                },
              })}
            />
          </div>
          {/* Helper text for selecting / submitting file */}
          {!watchFile || watchFile.length === 0 || errors.fileUpload != null ? (
            <p>Choose a file or drag it here.</p>
          ) : (
            <p>Use Submit button to upload the file.</p>
          )}
          {/* Errors */}
          {errors.fileUpload?.type === "isFile" && <Alert severity="error">Please attach a file.</Alert>}
          {errors.fileUpload?.type === "isXML" && <Alert severity="error">Please attach an XML file.</Alert>}
          {errors.fileUpload?.type === "isValidXML" && <Alert severity="error">{errors?.fileUpload?.message}</Alert>}
          {/* Progress bar */}
          {isSubmitting && <LinearProgress />}
        </FormControl>
      </form>
    </Container>
  )
}

export default WizardUploadObjectXMLForm
