import React, { useEffect, useState } from "react"

import CloseIcon from "@mui/icons-material/Close"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import WarningIcon from "@mui/icons-material/Warning"
import {
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Modal from "@mui/material/Modal"
import MuiTextField from "@mui/material/TextField"
import { Container, styled } from "@mui/system"
import { useTranslation } from "react-i18next"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { useAppDispatch } from "hooks"
import apiKeysService from "services/apiKeysAPI"

type APIKeyModalProps = {
  open: boolean
  onClose: () => void
}

const StyledContainer = styled(Container)(({ theme }) => ({
  position: "absolute",
  backgroundColor: theme.palette.common.white,
  top: "50%",
  left: "50%",
  width: "70%",
  padding: "3rem !important",
  transform: "translate(-50%, -50%)",
  borderRadius: "0.375rem",
  boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25)",
}))

const TextField = styled(MuiTextField)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  "& fieldset": {
    border: "1px solid",
    borderColor: theme.palette.secondary.main,
  },
  input: {
    color: theme.palette.common.black,
    "&::placeholder": {
      opacity: 0.8,
    },
  },
  width: "100%",
}))

const KeyTable = styled(Table)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `0.10rem solid ${theme.palette.secondary.light}`,
  borderTop: `0.35rem solid ${theme.palette.secondary.light}`,
  borderRight: `0.10rem solid ${theme.palette.secondary.light}`,
  borderBottom: `0.10rem solid ${theme.palette.secondary.light}`,
  color: theme.palette.secondary.main,
  width: "100%",
  tableLayout: "fixed",
}))

const APIKeyAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1.25rem solid ${theme.palette.warning.main}`,
  borderTop: `0.15rem solid ${theme.palette.warning.main}`,
  borderRight: `0.15rem solid ${theme.palette.warning.main}`,
  borderBottom: `0.15rem solid ${theme.palette.warning.main}`,
  color: theme.palette.text.primary,
  alignItems: "center",
}))

const APIKeysModal = ({ open, onClose }: APIKeyModalProps) => {
  // Store only the names of the keys
  const [apiKeys, setApikeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [newKey, setNewKey] = useState({ keyName: "", keyValue: "" })
  const [keyInput, setKeyInput] = useState("")
  const [isEmptyName, setIsEmptyName] = useState(false)
  const [isUnique, setIsUnique] = useState(true)

  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getApiKeys = async () => {
      const response = await apiKeysService.getAPIKeys()
      if (response.ok) {
        setApikeys(response.data.map(item => item.key_id))
      } else {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: response,
          })
        )
      }
    }
    getApiKeys()
    setIsLoading(false)
  }, [open])

  const handleClose = () => {
    setNewKey({ keyName: "", keyValue: "" })
    setApikeys([])
    setKeyInput("")
    setIsEmptyName(false)
    setIsUnique(true)
    onClose()
  }

  const handleGetName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setKeyInput(e.target.value)
    setIsEmptyName(false)
    setIsUnique(true)
  }

  const handleCreateKey = async () => {
    if (keyInput === "") setIsEmptyName(true)
    else if (!apiKeys.includes(keyInput)) {
      const response = await apiKeysService.addAPIKey(keyInput)
      if (response.ok) {
        setNewKey({ keyName: keyInput, keyValue: response.data })
        setApikeys(apiKeys.concat([keyInput]))
        setKeyInput("")
      } else {
        dispatch(
          updateStatus({
            status: ResponseStatus.error,
            response: response,
          })
        )
      }
    } else setIsUnique(false)
  }

  const handleDelete = async (key: string) => {
    const response = await apiKeysService.deleteAPIKey(key)
    if (response.ok) {
      setApikeys(apiKeys.filter(item => item !== key))
      if (key === newKey.keyName) setNewKey({ keyName: "", keyValue: "" })
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
        })
      )
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(newKey.keyValue)
    dispatch(
      updateStatus({
        status: ResponseStatus.success,
        helperText: "snackbarMessages.success.apikey.copied",
      })
    )
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="API-key-modal">
      <StyledContainer>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h5"
            role="heading"
            color="secondary"
            sx={{ mb: "2rem", fontWeight: 700 }}
          >
            {t("apiKeys.createAPIKeysTitle", { serviceTitle: t("serviceTitle") })}
          </Typography>

          <Button onClick={handleClose} startIcon={<CloseIcon />} sx={{ pt: 0, mt: 0 }}>
            <Typography variant={"subtitle1"}>{t("close")}</Typography>
          </Button>
        </Box>
        <Typography variant="subtitle1">{t("apiKeys.nameAPIKey")}</Typography>

        <TextField
          error={!isUnique || isEmptyName}
          size="small"
          placeholder={t("apiKeys.keyName")}
          required={true}
          margin="dense"
          onChange={e => handleGetName(e)}
          value={keyInput}
          helperText={!isUnique && t("apiKeys.keyMustBeUnique")}
        />

        <Button
          sx={{ my: "1.5rem" }}
          size="medium"
          variant="contained"
          type="submit"
          aria-label="Create API key"
          data-testid="api-key-create-button"
          onClick={() => handleCreateKey()}
        >
          {t("apiKeys.createKey")}
        </Button>

        {newKey.keyValue !== "" && (
          <>
            <Typography variant="subtitle2" sx={{ px: "2rem", my: "1rem" }}>
              {t("apiKeys.latestKey")}
            </Typography>
            <KeyTable size="small">
              <TableBody>
                <TableRow>
                  <TableCell width="25%">{newKey.keyName}</TableCell>
                  <TableCell
                    width="60%"
                    data-testid="new-key-value"
                    sx={{ wordWrap: "break-word" }}
                  >
                    {newKey.keyValue}
                  </TableCell>
                  <TableCell align="right" sx={{ p: 0 }}>
                    <Button
                      sx={{ m: 0 }}
                      size="small"
                      type="submit"
                      aria-label="Create API key"
                      data-testid="api-key-copy"
                      onClick={() => handleCopy()}
                      startIcon={<ContentCopyIcon fontSize="large" />}
                    >
                      <Typography variant={"subtitle1"}>{t("copy")}</Typography>
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </KeyTable>
            <APIKeyAlert
              icon={<WarningIcon fontSize="large" />}
              variant="outlined"
              severity="warning"
              sx={{ my: "1.5rem", py: "0.5rem", pl: "2rem", pr: "4rem" }}
            >
              {t("apiKeys.keyStoreWarning")}
            </APIKeyAlert>
          </>
        )}
        <Typography variant="subtitle2" sx={{ px: "2rem", pt: "1.5rem", my: "1rem" }}>
          {t("apiKeys.activeKeys")}
        </Typography>
        {isLoading ? (
          <CircularProgress color="primary" />
        ) : apiKeys?.length > 0 ? (
          <KeyTable size="small" aria-label="key table" data-testid="api-key-table">
            <TableBody>
              {apiKeys.map(apikey => (
                <TableRow key={apikey}>
                  <TableCell>{apikey}</TableCell>
                  <TableCell align="right">
                    <Button
                      data-testid="api-key-delete"
                      sx={{ pt: 0, mt: 0 }}
                      onClick={() => handleDelete(apikey)}
                    >
                      <DeleteOutlineIcon fontSize="large" sx={{ mr: "1rem" }} />
                      <Typography variant={"subtitle1"}>{t("delete")}</Typography>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </KeyTable>
        ) : (
          <KeyTable aria-label="no keys table" data-testid="no-api-keys">
            <TableBody>
              <TableRow sx={{ bgcolor: theme => theme.palette.primary.lightest }}>
                <TableCell>{t("apiKeys.noAPIKeys")}</TableCell>
              </TableRow>
            </TableBody>
          </KeyTable>
        )}
      </StyledContainer>
    </Modal>
  )
}

export default APIKeysModal
