import React, { useState } from "react"

import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import FormControl from "@mui/material/FormControl"
import Modal from "@mui/material/Modal"
import { styled } from "@mui/material/styles"
import Table from "@mui/material/Table"
// import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"
import { useForm } from "react-hook-form"

import { ResponseStatus } from "constants/responseStatus"
import { ObjectSubmissionTypes } from "constants/wizardObject"
import { resetFocus } from "features/focusSlice"
import { setLoading, resetLoading } from "features/loadingSlice"
import { resetStatusDetails, updateStatus } from "features/statusMessageSlice"
import { addObject } from "features/wizardSubmissionFolderSlice"
import { resetXMLModalOpen } from "features/wizardXMLModalSlice"
import { useAppDispatch, useAppSelector } from "hooks"
import objectAPIService from "services/objectAPI"
import submissionAPIService from "services/submissionAPI"

type WizardUploadXMLModalProps = {
  open: boolean
  handleClose: () => void
}

const StyledContainer = styled(Container)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.common.white,
  top: "50%",
  left: "50%",
  width: "92rem",
  height: "42rem",
  padding: "5rem",
  bgcolor: "white",
  transform: "translate(-50%, -50%)",
  borderRadius: "0.375rem",
  boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25)",
}))

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "100%",
  height: "14rem",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  padding: "4rem",
  border: `1px solid ${theme.palette.secondary.light}`,
}))

const StyledButton = styled(Button)(() => ({
  width: "17rem",
  height: "5rem",
}))

const WizardUploadXMLModal = ({ open, handleClose }: WizardUploadXMLModalProps) => {
  const dispatch = useAppDispatch()
  const objectType = useAppSelector(state => state.objectType)
  const { folderId } = useAppSelector(state => state.submissionFolder)
  const [isSubmitting, setSubmitting] = useState(false)

  const {
    watch,
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm({ mode: "onChange" })

  const resetForm = () => {
    reset()
  }

  const watchFile = watch("fileUpload")

  const fileName = watchFile && watchFile[0] ? watchFile[0].name : "No file name"
  console.log("isSubmitting :>> ", isSubmitting)
  type FileUpload = { fileUpload: FileList }
  const onSubmit = async (data: FileUpload) => {
    dispatch(resetStatusDetails())
    setSubmitting(true)
    dispatch(setLoading())
    const file = data.fileUpload[0] || {}
    const waitForServertimer = setTimeout(() => {
      dispatch(updateStatus({ status: ResponseStatus.info }))
    }, 5000)
    const response = await objectAPIService.createFromXML(objectType, folderId, file)

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
    clearTimeout(waitForServertimer)
    setSubmitting(false)
    dispatch(resetLoading())
  }

  const handleButton = () => {
    const fileSelect = document && document.getElementById("file-select-button")
    if (fileSelect && fileSelect.click()) {
      fileSelect.click()
    }
    dispatch(resetFocus())
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <StyledContainer>
        <Typography variant="h4" role="heading" color="secondary" sx={{ pb: "2.5rem", fontWeight: 700 }}>
          Upload XML File
        </Typography>
        <TableContainer component={Box}>
          <Table>
            <TableHead>
              <TableRow
                sx={theme => ({
                  border: `1px solid ${theme.palette.secondary.light}`,
                  "& th": {
                    px: "3.2rem",
                    py: "1.6rem",
                    color: theme.palette.secondary.main,
                  },
                })}
              >
                <TableCell width={"25%"}>Name</TableCell>
                <TableCell width={"25%"}>Size</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
        <form onSubmit={handleSubmit(async data => onSubmit(data as FileUpload))}>
          <StyledFormControl>
            <Typography variant="body1" color="secondary">
              Drag and drop the file here or
            </Typography>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => handleButton()}
              onBlur={() => dispatch(resetFocus())}
              sx={{ ml: "1rem" }}
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
          </StyledFormControl>
        </form>
        <StyledButton
          variant="outlined"
          color="primary"
          sx={{ border: "2px solid", mt: "2.5rem" }}
          onClick={() => dispatch(resetXMLModalOpen())}
        >
          Cancel
        </StyledButton>
        <Box position="absolute" bottom="-30%" left="0" right="0">
          {errors.fileUpload?.type === "isFile" && <Alert severity="error">Please attach a file.</Alert>}
          {errors.fileUpload?.type === "isXML" && <Alert severity="error">Please attach an XML file.</Alert>}
          {errors.fileUpload?.type === "isValidXML" && <Alert severity="error">{errors?.fileUpload?.message}</Alert>}
        </Box>
      </StyledContainer>
    </Modal>
  )
}

export default WizardUploadXMLModal
