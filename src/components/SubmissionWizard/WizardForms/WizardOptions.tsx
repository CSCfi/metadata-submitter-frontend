import React from "react"

import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

const options = ["Upload XML", "Clear form"]

const WizardOptions = ({ onClearForm, onOpenXMLModal }: { onClearForm: () => void; onOpenXMLModal: () => void }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = (e, option?: string) => {
    setAnchorEl(null)
    option === options[0] ? onOpenXMLModal() : null
    option === options[1] ? onClearForm() : null
  }
  return (
    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mt: "4rem", pr: "6rem" }}>
      <Typography variant="subtitle2" color="primary" fontWeight={700}>
        Options
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
        <MoreHorizIcon fontSize="large" />
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
        {options.map(option => (
          <MenuItem
            key={option}
            selected={option === "Upload XML"}
            onClick={e => handleClose(e, option)}
            sx={{
              p: "1.2rem",
              "&.Mui-selected": { backgroundColor: "primary.lighter", color: "primary.main" },
              color: "secondary.main",
              fontWeight: 700,
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  )
}

export default WizardOptions
