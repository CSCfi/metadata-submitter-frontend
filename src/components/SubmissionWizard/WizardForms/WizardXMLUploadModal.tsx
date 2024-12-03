import React, { useRef, useEffect } from "react"

import CancelIcon from "@mui/icons-material/Cancel"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import Modal from "@mui/material/Modal"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useDropzone } from "react-dropzone"
import { useForm } from "react-hook-form"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus, ObjectSubmissionTypes } from "constants/wizardObject"
import { resetFocus } from "features/focusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { resetStatusDetails, updateStatus } from "features/statusMessageSlice"
import { setCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType } from "features/wizardObjectTypeSlice"
import { addObject, replaceObjectInSubmission } from "features/wizardSubmissionSlice"
import { setSubmissionType } from "features/wizardSubmissionTypeSlice"
import { resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import objectAPIService from "services/objectAPI"
import xmlSubmissionAPIService from "services/xmlSubmissionAPI"
import { ObjectDetails, ObjectTags } from "types"

type WizardXMLUploadModalProps = {
  open: boolean
  currentObject?: ObjectDetails & ObjectTags
  handleClose: () => void
}

const StyledContainer = styled(Container)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.common.white,
  top: "50%",
  left: "50%",
  width: "92rem",
  height: "42rem",
  padding: "5rem !important",
  transform: "translate(-50%, -50%)",
  borderRadius: "0.375rem",
  boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25)",
}))

const StyledFormControl = styled(FormControl, {
  shouldForwardProp: prop => prop !== "isDragActive",
})<{
  isDragActive: boolean
}>(({ theme, isDragActive }) => ({
  width: "100%",
  height: "19rem",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "4rem",
  marginBottom: "2.5rem",
  border: isDragActive
    ? `2px dashed ${theme.palette.primary.main}`
    : `2px dashed ${theme.palette.secondary.lightest}`,
}))

const StyledButton = styled(Button)(() => ({
  width: "12rem",
  height: "5rem",
}))

const CustomAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1.25rem solid ${theme.palette.error.main}`,
  borderTop: `0.25rem solid ${theme.palette.error.main}`,
  borderRight: `0.25rem solid ${theme.palette.error.main}`,
  borderBottom: `0.25rem solid ${theme.palette.error.main}`,
  color: theme.palette.secondary.main,
  lineHeight: "1.75",
  boxShadow: "0 0.25rem 0.625rem rgba(0, 0, 0, 0.2)",
  position: "relative",
  padding: "1rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "1.75rem !important",
}))

const WizardXMLUploadModal = ({ open, handleClose, currentObject }: WizardXMLUploadModalProps) => {
  const dispatch = useAppDispatch()
  const objectType = useAppSelector(state => state.objectType)
  const { submissionId } = useAppSelector(state => state.submission)
  const loading = useAppSelector(state => state.loading)
  const focusTarget = useRef<HTMLButtonElement | null>(null)
  const shouldFocus = useAppSelector(state => state.focus)

  useEffect(() => {
    if (shouldFocus && focusTarget.current) focusTarget.current.focus()
  }, [shouldFocus])

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
    reset,
  } = useForm({ mode: "onChange" })

  const resetForm = () => {
    reset()
  }

  type FileUpload = { fileUpload: FileList }

  const onSubmit = async (data: FileUpload) => {
    if (data.fileUpload.length > 0 && errors.fileUpload === undefined) {
      dispatch(resetStatusDetails())
      dispatch(setLoading())
      const file = data.fileUpload[0] || {}

      if (currentObject?.accessionId) {
        const response = await objectAPIService.replaceXML(
          objectType,
          currentObject.accessionId,
          file
        )

        if (response.ok) {
          dispatch(
            replaceObjectInSubmission(
              currentObject.accessionId,
              {
                submissionType: ObjectSubmissionTypes.xml,
                fileName: file.name,
                fileSize: file.size,
              },
              ObjectStatus.submitted
            )
          )
          dispatch(updateStatus({ status: ResponseStatus.success, response: response }))
          dispatch(
            setCurrentObject({
              ...response.data,
              status: ObjectStatus.submitted,
              tags: {
                submissionType: ObjectSubmissionTypes.xml,
                fileName: file.name,
                fileSize: file.size,
              },
            })
          )
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
              tags: {
                submissionType: ObjectSubmissionTypes.xml,
                fileName: file.name,
                fileSize: file.size,
              },
            })
          )
          dispatch(setSubmissionType(ObjectSubmissionTypes.xml))
          dispatch(setObjectType(objectType))
          dispatch(
            setCurrentObject({
              ...response.data,
              status: ObjectStatus.submitted,
              tags: {
                submissionType: ObjectSubmissionTypes.xml,
                fileName: file.name,
                fileSize: file.size,
              },
            })
          )
          resetForm()
        } else {
          dispatch(updateStatus({ status: ResponseStatus.error, response: response }))
        }
      }
      dispatch(resetLoading())
      dispatch(resetXMLModalOpen())
    }
  }

  const handleButton = () => {
    const fileSelect = document && document.getElementById("file-select-button")

    if (fileSelect) {
      fileSelect.click()
    }
    dispatch(resetFocus())
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const filelist = new DataTransfer()

    // Accept all file types. Validation is done in file upload form by React Hook Form.
    filelist.items.add(acceptedFiles[0])
    setValue("fileUpload", filelist.files, { shouldValidate: true })
    handleSubmit(async data => onSubmit(data as FileUpload))()
  }

  const { getRootProps, isDragActive } = useDropzone({
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop: onDrop,
  })

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="xml-modal" {...getRootProps()}>
      <StyledContainer>
        <Typography
          variant="h4"
          role="heading"
          color="secondary"
          sx={{ pb: "2.5rem", fontWeight: 700 }}
        >
          Upload XML File
        </Typography>
        <form>
          <StyledFormControl isDragActive={isDragActive}>
            <Typography variant="body1" color="secondary">
              Drag and drop the file here or
            </Typography>
            <StyledButton
              ref={focusTarget}
              variant="contained"
              color="primary"
              onClick={() => handleButton()}
              onBlur={() => dispatch(resetFocus())}
              sx={{ ml: "1rem" }}
              data-testid="select-xml-file"
            >
              Select file
            </StyledButton>
            <input
              type="file"
              id="file-select-button"
              data-testid="xml-upload"
              hidden
              {...register("fileUpload", {
                validate: {
                  isFile: value => value?.length > 0,
                  isXML: value => value[0]?.type === "text/xml",
                  isValidXML: async value => {
                    const response = await xmlSubmissionAPIService.validateXMLFile(
                      objectType,
                      value[0]
                    )
                    if (!response.ok) {
                      const errors = response.data.errors.map(
                        error =>
                          ` ${error.reason} Position: ${error.position}, pointer: ${error.pointer}`
                      )
                      return `The file you attached is not valid ${objectType},
                      our server reported following error: ${response.data.detail} Detail: ${errors}`
                      // TODO: replace this MUI Alert with StatusMessageHanlder
                    }
                  },
                },
                onChange: () => handleSubmit(async data => onSubmit(data as FileUpload))(),
              })}
            />
          </StyledFormControl>
        </form>
        <StyledButton
          variant="outlined"
          color="primary"
          sx={{ "&.MuiButton-root, &:hover": { border: "2px solid" } }}
          onClick={() => dispatch(resetXMLModalOpen())}
        >
          Cancel
        </StyledButton>
        <Stack position="absolute" bottom="-45%" left="0" right="0">
          {errors.fileUpload?.type === "isFile" && (
            <CustomAlert
              severity="error"
              icon={
                <CancelIcon sx={{ fontSize: "2rem", marginRight: "1rem", marginTop: "2rem" }} />
              }
            >
              <Typography sx={{ margin: "0.75rem" }}>Please attach a file.</Typography>
            </CustomAlert>
          )}
          {errors.fileUpload?.type === "isXML" && (
            <CustomAlert
              severity="error"
              icon={<CancelIcon sx={{ fontSize: "2rem", marginRight: "1rem" }} />}
            >
              <Typography sx={{ margin: "0.75rem" }}>Please attach an XML file.</Typography>
            </CustomAlert>
          )}
          {errors.fileUpload?.type === "isValidXML" && (
            <CustomAlert
              severity="error"
              icon={<CancelIcon sx={{ fontSize: "2rem", marginRight: "1rem" }} />}
            >
              <Typography sx={{ margin: "0.75rem" }}>
                {errors?.fileUpload?.message?.toString()}
              </Typography>
            </CustomAlert>
          )}
        </Stack>

        {loading && (
          <Stack
            width="100%"
            height="100%"
            position="absolute"
            top="0"
            left="0"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(0, 0, 0, 0.5)"
          >
            <CircularProgress />
          </Stack>
        )}
      </StyledContainer>
    </Modal>
  )
}

export default WizardXMLUploadModal
