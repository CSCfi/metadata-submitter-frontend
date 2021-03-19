//@flow
import React, { useState, useRef, useEffect } from "react"

import Button from "@material-ui/core/Button"
import CardHeader from "@material-ui/core/CardHeader"
import Container from "@material-ui/core/Container"
import FormControl from "@material-ui/core/FormControl"
import LinearProgress from "@material-ui/core/LinearProgress"
import { makeStyles } from "@material-ui/core/styles"
import TextField from "@material-ui/core/TextField"
import Alert from "@material-ui/lab/Alert"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"

import WizardStatusMessageHandler from "./WizardStatusMessageHandler"

import { ObjectSubmissionTypes, ObjectStatus } from "constants/wizardObject"
import { WizardStatus } from "constants/wizardStatus"
import { resetFocus } from "features/focusSlice"
import { resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { addObjectToFolder, replaceObjectInFolder } from "features/wizardSubmissionFolderSlice"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

const useStyles = makeStyles(theme => ({
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
    position: "absolute !important",
    whiteSpace: "nowrap",
    width: "1px",
  },
  fileField: {
    display: "inline-flex",
  },
  submitButton: {
    backgroundColor: "#FFF",
  },
}))

/*
 * Return React Hook Form based form for uploading xml files. Handles form submitting, validating and error/success alerts.
 */
const WizardUploadObjectXMLForm = (): React$Element<typeof Container> => {
  const [successStatus, setSuccessStatus] = useState("")
  const [isSubmitting, setSubmitting] = useState(false)
  const [responseStatus, setResponseStatus] = useState([])
  const objectType = useSelector(state => state.objectType)
  const { folderId } = useSelector(state => state.submissionFolder)
  const dispatch = useDispatch()
  const classes = useStyles()
  const currentObject = useSelector(state => state.currentObject)
  const { register, errors, watch, handleSubmit, reset } = useForm({ mode: "onChange" })
  const [placeHolder, setPlaceHolder] = useState("Name")

  const watchFile = watch("fileUpload")

  const focusTarget = useRef(null)
  const shouldFocus = useSelector(state => state.focus)

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

  const resetForm = () => {
    reset()
    setPlaceHolder("Name")
  }

  const fileName = watchFile && watchFile[0] ? watchFile[0].name : "No file name"

  const onSubmit = async data => {
    setSuccessStatus(undefined)
    setSubmitting(true)
    const file = data.fileUpload[0] || {}
    const waitForServertimer = setTimeout(() => {
      setSuccessStatus(WizardStatus.info)
    }, 5000)

    if (currentObject.accessionId) {
      const response = await objectAPIService.replaceXML(objectType, currentObject.accessionId, file)
      setResponseStatus(response)
      if (response.ok) {
        dispatch(
          replaceObjectInFolder(folderId, currentObject.accessionId, currentObject.index, {
            submissionType: ObjectSubmissionTypes.xml,
            fileName: fileName,
          })
        )
          .then(() => {
            setSuccessStatus(WizardStatus.success)
            resetForm()
            dispatch(resetCurrentObject())
          })
          .catch(() => {
            setSuccessStatus(WizardStatus.error)
          })
      } else {
        setSuccessStatus(WizardStatus.error)
      }
    } else {
      const response = await objectAPIService.createFromXML(objectType, file)
      setResponseStatus(response)
      if (response.ok) {
        setSuccessStatus(WizardStatus.success)
        dispatch(
          addObjectToFolder(folderId, {
            accessionId: response.data.accessionId,
            schema: objectType,
            tags: { submissionType: ObjectSubmissionTypes.xml, fileName },
          })
        )
        resetForm()
      } else {
        setSuccessStatus(WizardStatus.error)
      }
    }
    clearTimeout(waitForServertimer)
    setSubmitting(false)
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
      disabled={isSubmitting || !watchFile || watchFile.length === 0 || errors.fileUpload != null}
      onClick={handleSubmit(onSubmit)}
    >
      {currentObject?.status === ObjectStatus.submitted ? "Replace" : "Submit"}
    </Button>
  )

  return (
    <Container maxWidth={false} className={classes.container}>
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
            <TextField placeholder={placeHolder} inputProps={{ readOnly: true, tabIndex: -1 }} />
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
              name="fileUpload"
              id="file-select-button"
              hidden
              ref={register({
                validate: {
                  isFile: value => value.length > 0,
                  isXML: value => value[0]?.type === "text/xml",
                  isValidXML: async value => {
                    const response = await submissionAPIService.validateXMLFile(objectType, value[0])
                    setResponseStatus(response)
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
          {/* Errors */}
          {errors.fileUpload?.type === "isFile" && <Alert severity="error">Please attach a file.</Alert>}
          {errors.fileUpload?.type === "isXML" && <Alert severity="error">Please attach an XML file.</Alert>}
          {errors.fileUpload?.type === "isValidXML" && <Alert severity="error">{errors?.fileUpload?.message}</Alert>}
          {/* Progress bar */}
          {isSubmitting && <LinearProgress />}
        </FormControl>
      </form>

      {successStatus && (
        <WizardStatusMessageHandler
          successStatus={successStatus}
          response={responseStatus}
          prefixText=""
        ></WizardStatusMessageHandler>
      )}
    </Container>
  )
}

export default WizardUploadObjectXMLForm
