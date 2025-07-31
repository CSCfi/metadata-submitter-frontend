import ClearIcon from "@mui/icons-material/Clear"
import SearchIcon from "@mui/icons-material/Search"
import IconButton from "@mui/material/IconButton"
import { styled } from "@mui/material/styles"
import MuiTextField from "@mui/material/TextField"
import { useTranslation } from "react-i18next"

type WizardSearchBoxProps = {
  placeholder: string
  filteringText: string
  handleChangeFilteringText: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClearFilteringText: () => void
}

const TextField = styled(MuiTextField)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  "& fieldset": {
    border: "1px solid",
  },
  input: {
    color: theme.palette.secondary.main,
    "&::placeholder": {
      opacity: 0.8,
    },
  },
  width: "30%",
}))

const WizardSearchBox: React.FC<WizardSearchBoxProps> = props => {
  const { placeholder, filteringText, handleChangeFilteringText, handleClearFilteringText } = props
  const { t } = useTranslation()

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChangeFilteringText(e)
  }

  return (
    <TextField
      variant="outlined"
      value={filteringText}
      onChange={handleOnChange}
      placeholder={placeholder}
      inputProps={{ "data-testid": "wizard-search-box" }}
      InputProps={{
        startAdornment: (
          <SearchIcon
            fontSize="large"
            color="secondary"
            sx={{ mr: "0.75rem" }}
            className="search-icon"
          />
        ),
        endAdornment: (
          <IconButton
            title="Clear"
            aria-label={t("ariaLabels.clear")}
            size="medium"
            sx={{ visibility: filteringText ? "visible" : "hidden" }}
            onClick={handleClearFilteringText}
          >
            <ClearIcon fontSize="large" color="secondary" />
          </IconButton>
        ),
      }}
    />
  )
}

export default WizardSearchBox
