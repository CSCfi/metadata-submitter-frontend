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
  borderTop: `0.25rem solid ${theme.palette.secondary.light}`,
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
  color: theme.palette.secondary.main,
  alignItems: "center",
}))

const APIKeysModal = ({ open, onClose }: APIKeyModalProps) => {
  // Store only the names of the keys
  const [apiKeys, setApikeys] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [newKey, setNewKey] = useState({ keyName: "", keyValue: "" })
  const [isEmptyName, setIsEmptyName] = useState(false)
  const [isUnique, setIsUnique] = useState(true)

  const { t } = useTranslation()

  useEffect(() => {
    const getApiKeys = async () => {
      const response = await apiKeysService.getAPIKeys()
      if (response.ok) {
        setApikeys(response.data.map(key => key.key_id))
      } else {
        console.log("OOPS", response)
      }
    }
    getApiKeys()
    setIsLoading(false)
  }, [open])

  const handleClose = () => {
    setNewKey({ keyName: "", keyValue: "" })
    setApikeys([])
    setIsEmptyName(false)
    setIsUnique(true)
    onClose()
  }

  const handleGetName = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewKey({ ...newKey, keyName: e.target.value })
    setIsEmptyName(false)
    setIsUnique(true)
  }

  const handleCreateKey = async () => {
    if (newKey.keyName === "") setIsEmptyName(true)
    else if (!apiKeys.includes(newKey.keyName)) {
      const response = await apiKeysService.addAPIKey(newKey.keyName)
      if (response.ok) {
        setNewKey({ keyName: newKey.keyName, keyValue: response.data })
        setApikeys(apiKeys.concat([newKey.keyName]))
      } else {
        console.log("OOPS", response)
      }
    } else setIsUnique(false)
  }

  const handleDelete = async (key: string) => {
    const response = await apiKeysService.deleteAPIKey(key)
    if (response.ok) {
      setApikeys(apiKeys.filter(item => item !== key))
      setNewKey({ keyName: "", keyValue: "" })
    } else {
      console.log("OOPS deletion failed with key ", key, response)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="API-key-modal">
      <StyledContainer>
        <Box>
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
            value={newKey.keyName}
            helperText={!isUnique && t("apiKeys.keyMustBeUnique")}
          />

          <Button
            sx={{ my: "1.5rem" }}
            size="medium"
            variant="contained"
            type="submit"
            aria-label="Create API key"
            data-testid="apikey"
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
                    <TableCell width="60%" sx={{ wordWrap: "break-word" }}>
                      {newKey.keyValue}
                    </TableCell>
                    <TableCell align="right" sx={{ p: 0 }}>
                      <Button
                        sx={{ m: 0 }}
                        size="small"
                        type="submit"
                        aria-label="Create API key"
                        data-testid="apikey"
                        onClick={() => navigator.clipboard.writeText(newKey.keyValue)}
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
            <KeyTable size="small" aria-label="key table">
              <TableBody>
                {apiKeys.map(akey => (
                  <TableRow key={akey}>
                    <TableCell>{akey}</TableCell>
                    <TableCell align="right">
                      <Button onClick={() => handleDelete(akey)}>
                        <DeleteOutlineIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </KeyTable>
          ) : (
            <KeyTable>
              <TableBody>
                <TableRow sx={{ bgcolor: theme => theme.palette.primary.lightest }}>
                  <TableCell>{t("apiKeys.noAPIKeys")}</TableCell>
                </TableRow>
              </TableBody>
            </KeyTable>
          )}
          {/* } */}
        </Box>
      </StyledContainer>
    </Modal>
  )
}

export default APIKeysModal
