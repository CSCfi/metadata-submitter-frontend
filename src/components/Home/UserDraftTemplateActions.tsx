import React, { useState } from "react"

import MoreVertIcon from "@mui/icons-material/MoreVert"
import Dialog from "@mui/material/Dialog"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"

import WizardFillObjectDetailsForm from "components/NewDraftWizard/WizardForms/WizardFillObjectDetailsForm"
import { ResponseStatus } from "constants/responseStatus"
import { ObjectStatus } from "constants/wizardObject"
import { updateStatus } from "features/statusMessageSlice"
import { deleteTemplateByAccessionId } from "features/userSlice"
import { setCurrentObject, resetCurrentObject } from "features/wizardCurrentObjectSlice"
import { setObjectType, resetObjectType } from "features/wizardObjectTypeSlice"
import { setFolder } from "features/wizardSubmissionFolderSlice"
import { useAppDispatch } from "hooks"
import templateAPI from "services/templateAPI"

const FormDialog = (props: { open: boolean; onClose: any }) => {
  const { open, onClose } = props

  return (
    <Dialog open={open} onClose={onClose} fullWidth={true}>
      <WizardFillObjectDetailsForm closeDialog={onClose} />
    </Dialog>
  )
}

const UserDraftTemplateActions = (props: { item: { schema: string; accessionId: string } }): any => {
  const { item } = props
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = (event: any) => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    dispatch(resetObjectType())
    dispatch(resetCurrentObject())
  }

  const getObjectType = (schema: string) => schema.split("template-")[1]

  const editTemplate = async (schema: string, accessionId: string) => {
    const objectType = getObjectType(schema)

    dispatch(setFolder({}))
    dispatch(setObjectType(objectType))

    setDialogOpen(true)

    handleCloseMenu()

    const response = await templateAPI.getTemplateByAccessionId(objectType, accessionId)

    if (response.ok) {
      dispatch(resetCurrentObject())
      dispatch(
        setCurrentObject({
          ...response.data,
          status: ObjectStatus.template,
        })
      )
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Template fetching error",
        })
      )
    }
  }

  const deleteTemplate = async (schema: string, accessionId: string) => {
    const response = await templateAPI.deleteTemplateByAccessionId(getObjectType(schema), accessionId)

    if (response.ok) {
      dispatch(deleteTemplateByAccessionId(accessionId))
    } else {
      dispatch(
        updateStatus({
          status: ResponseStatus.error,
          response: response,
          helperText: "Unable to delete template",
        })
      )
    }
  }

  return (
    <React.Fragment>
      <IconButton
        aria-label="more"
        id={`template-more-button-${item.accessionId}`}
        aria-controls="template-menu"
        aria-expanded={menuOpen ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleMenuClick}
        size="large"
      >
        <MoreVertIcon />
      </IconButton>

      <Menu
        id="template-menu"
        MenuListProps={{
          "aria-labelledby": "template-more-button",
        }}
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => editTemplate(item.schema, item.accessionId)} data-testid="edit-template">
          Edit
        </MenuItem>
        <MenuItem onClick={() => deleteTemplate(item.schema, item.accessionId)} data-testid="delete-template">
          Delete
        </MenuItem>
      </Menu>
      <FormDialog open={dialogOpen} onClose={handleDialogClose}></FormDialog>
    </React.Fragment>
  )
}

export default UserDraftTemplateActions
