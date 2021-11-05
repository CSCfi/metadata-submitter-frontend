//@flow
import React, { useState } from "react"

import IconButton from "@material-ui/core/IconButton"
import Menu from "@material-ui/core/Menu"
import MenuItem from "@material-ui/core/MenuItem"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { useDispatch } from "react-redux"

import { ResponseStatus } from "constants/responseStatus"
import { updateStatus } from "features/statusMessageSlice"
import { deleteTemplateByAccessionId } from "features/userSlice"
import templateAPI from "services/templateAPI"

const UserDraftTemplateActions = (props: { item: { schema: string, accessionId: string } }): React$Element<any> => {
  const { item } = props
  const dispatch = useDispatch()
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)

  const handleMenuClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
  }

  const deleteTemplate = async (schema, accessionId) => {
    const objectType = schema.split("template-")[1]

    const response = await templateAPI.deleteTemplateByAccessionId(objectType, accessionId)

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
        <MenuItem onClick={() => deleteTemplate(item.schema, item.accessionId)} data-testid="delete-template">
          Delete
        </MenuItem>
      </Menu>
    </React.Fragment>
  )
}

export default UserDraftTemplateActions
