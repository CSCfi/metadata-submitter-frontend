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
import { addObjectToFolder, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: 0,
  },
  cardHeader: theme.wizard.cardHeader,
  cardHeaderAction: {
    margin: theme.spacing(-0.5, 0),
  },
  root: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(5, "auto"),
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
    width: null,
    height: null,
    flex: 1,
    backgroundColor: theme.palette.success.main,
    border: "2px dashed #51A808",
  },
}))

/*
 * Return React Hook Form based form for uploading xml files. Handles form submitting, validating and error/success alerts.
 */
const WizardUploadObjectXMLForm: React.FC = () => {
  const [isSubmitting, setSubmitting] = useState(false)
  const objectType = useAppSelector(state => state.objectType)
  const { folderId } = useAppSelector(state => state.submissionFolder)
  const dispatch = useAppDispatch()
  const classes = useStyles()
  const currentObject = useAppSelector(state => state.currentObject)
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({ mode: "onChange" })
  const [placeHolder, setPlaceHolder] = useState("Name")
  const [validDropFile, setvalidDropFile] = useState(false)

  const watchFile = watch("fileUpload")
  const watchDrop = watch("fileDrop")

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

  useEffect(() => {
    if (watchDrop) {
      setPlaceHolder(watchDrop[0])
    } else setPlaceHolder(currentObject?.tags?.fileName || "Name")
  }, [currentObject, watchDrop])

  const onDrop = async (acceptedFiles, fileRejections) => {
    const filelist = new DataTransfer()
    clearErrors()
    if (acceptedFiles.length > 0) {
      //clearErrors()
      setvalidDropFile(true)
      filelist.items.add(acceptedFiles[0])
      setValue("fileUpload", filelist.files)
    } else {
      filelist.items.add(fileRejections[0].file)
      setError("fileUpload", { type: "dropXML", message: "Please attached filebshould be type XML." })
    }
    currentObject?.status === ObjectStatus.submitted ? "Replace" : "Submit"
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    accept: "text/xml",
    onDrop: onDrop,
  })

  const resetForm = () => {
    reset()
    setPlaceHolder("Name")
  }

  const fileName = watchFile && watchFile[0] ? watchFile[0].name : "No file name"
  const onSubmit = async (data: { fileUpload: FileList }) => {
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
          replaceObjectInFolder(
            folderId,
            currentObject.accessionId,
            currentObject.index,
            {
              submissionType: ObjectSubmissionTypes.xml,
              fileName: fileName,
              displayTitle: fileName,
            },
            ObjectStatus.submitted
          )
        )
          .then(() => {
            dispatch(updateStatus({ status: ResponseStatus.success, response: response }))
            dispatch(resetCurrentObject())
            resetForm()
          })
          .catch(() => {
            dispatch(updateStatus({ status: ResponseStatus.error, response: response }))
          })
      } else {
        dispatch(updateStatus({ status: ResponseStatus.error, response: response }))
      }
    } else {
      const response = await objectAPIService.createFromXML(objectType, file)

      if (response.ok) {
        dispatch(updateStatus({ status: ResponseStatus.success, response: response }))
        dispatch(
          addObjectToFolder(folderId, {
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
    validDropFile && setvalidDropFile(false)
  }

  const handleButton = () => {
    const fileSelect = document && document.getElementById("file-select-button")
    if (fileSelect && fileSelect.click()) {
      fileSelect.click()
    }
    dispatch(resetFocus())
  }

  const submitButton = (
    <Button
      variant="contained"
      className={classes.submitButton}
      size="small"
      disabled={isSubmitting || !watchFile || watchFile.length === 0 || errors.fileUpload != null || !validDropFile}
      onClick={handleSubmit(onSubmit)}
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl className={classes.root}>
          <div className={classes.fileField}>
            <input {...register("fileDrop")} {...getInputProps()} hidden />
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
                    const response = await submissionAPIService.validateXMLFile(objectType, value[0])

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
          {/* Helper text for drag and drop */}
          {isDragActive ? (
            <p>Drag and drop some files here</p>
          ) : validDropFile ? (
            <p>Use Submit button to upload the file</p>
          ) : (
            <p>Drag and drop some files here, or click Choose file button.</p>
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
