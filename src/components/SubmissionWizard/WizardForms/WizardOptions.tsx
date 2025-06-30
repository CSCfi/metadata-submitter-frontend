/* XML upload is disabled for MVP */
import React from "react"

import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import { styled } from "@mui/material/styles"
import Typography from "@mui/material/Typography"
import { useTranslation } from "react-i18next"

import { ObjectTypes } from "constants/wizardObject"

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: "1.2rem",
  fontWeight: 700,
  "&.Mui-selected, &.Mui-selected:hover": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.light,
  },
  "&:hover": {
    color: theme.palette.primary.main,
  },
}))

type WizardOptionsProps = {
  objectType: string
  onClearForm: () => void
  //onOpenXMLModal: () => void
  onDeleteForm: () => void
  //disableUploadXML?: boolean
}

const WizardOptions: React.FC<WizardOptionsProps> = props => {
  //const { objectType, onClearForm, onOpenXMLModal, onDeleteForm, disableUploadXML } = props
  const { objectType, onClearForm, onDeleteForm } = props
  const { t } = useTranslation()

  const options =
    objectType !== ObjectTypes.datacite
      ? // ? [t("formActions.uploadXML"), t("formActions.clearForm"), t("formActions.deleteForm")]
        [t("formActions.clearForm"), t("formActions.deleteForm")]
      : [t("formActions.clearForm")]

  /*const shouldDisableXMLModal = [
    ObjectTypes.datacite,
    ObjectTypes.dacPolicies,
    ObjectTypes.file,
  ].includes(objectType)*/

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (e, option?: string) => {
    setAnchorEl(null)

    /*if (option === options[0]) {
      if (shouldDisableXMLModal) {
        onClearForm()
      } else {
        onOpenXMLModal()
      }
    }*/

    if (option === options[0]) {
      onClearForm()
    }

    if (option === options[1]) {
      onDeleteForm()
    }
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end">
      <Typography variant="subtitle2" color="primary" fontWeight={700}>
        {t("formActions.options")}
      </Typography>
      <IconButton
        aria-label="options-button"
        id="options-button"
        aria-controls={open ? "options" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        color="primary"
      >
        <MoreHorizIcon sx={{ fontSize: "2.5rem" }} />
      </IconButton>
      <Menu
        id="options"
        MenuListProps={{
          "aria-labelledby": "options-button",
          style: { padding: 0, width: "17rem" },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {options.map((option, index) => (
          <StyledMenuItem
            key={option}
            selected={index === 0}
            //disabled={index === 0 && disableUploadXML}
            onClick={e => handleClose(e, option)}
            data-testid={option}
          >
            {option}
          </StyledMenuItem>
        ))}
      </Menu>
    </Stack>
  )
}

export default WizardOptions
