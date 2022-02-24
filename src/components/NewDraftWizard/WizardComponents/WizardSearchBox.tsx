import React from "react"

import ClearIcon from "@mui/icons-material/Clear"
import SearchIcon from "@mui/icons-material/Search"
import IconButton from "@mui/material/IconButton"
import { styled } from "@mui/material/styles"
import MuiTextField from "@mui/material/TextField"

type WizardSearchBoxProps = {
  placeholder: string
  handleFilterTextChange: (filterText: string) => void
}

const TextField = styled(MuiTextField)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.light,
  "& .MuiOutlinedInput-root.MuiInputBase-root": {
    fontSize: "1em",
  },
  "& fieldset": {
    border: 0,
  },
  input: {
    color: theme.palette.secondary.main,
    "&::placeholder": {
      opacity: 1,
    },
  },
}))

const WizardSearchBox: React.FC<WizardSearchBoxProps> = props => {
  const { placeholder, handleFilterTextChange } = props

  const [filterText, setFilterText] = React.useState<string>("")

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    setFilterText(text)
    handleFilterTextChange(text)
  }

  const clearFilterText = () => {
    setFilterText("")
    handleFilterTextChange("")
  }

  return (
    <TextField
      variant="outlined"
      value={filterText}
      onChange={handleOnChange}
      placeholder={placeholder}
      InputProps={{
        startAdornment: <SearchIcon fontSize="large" color="secondary" sx={{ mr: "0.75rem" }} />,
        endAdornment: (
          <IconButton
            title="Clear"
            aria-label="Clear"
            size="medium"
            sx={{ visibility: filterText ? "visible" : "hidden" }}
            onClick={clearFilterText}
          >
            <ClearIcon fontSize="large" color="secondary" />
          </IconButton>
        ),
      }}
    />
  )
}

export default WizardSearchBox
