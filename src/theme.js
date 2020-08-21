import { createMuiTheme } from "@material-ui/core/styles"

/**
 * Set up custom theme that follows CSC's design guidelines.
 */
const CSCtheme = createMuiTheme({
  overrides: {
    MuiButton: {
      root: {
        textTransform: "none",
        fontWeight: "bold",
        paddingLeft: "32px",
        paddingRight: "32px",
      },
    },
    MuiTypography: {
      subtitle1: {
        fontWeight: 600,
      },
    },
  },
  palette: {
    primary: {
      main: "#8b1a4f",
    },
    secondary: {
      main: "#dfe1e3",
    },
    third: {
      main: "#006476",
    },
    background: {
      default: "white",
    },
  },
  props: {
    MuiTextField: {
      variant: "outlined",
      size: "small",
    },
    MuiFormControl: {
      variant: "outlined",
      size: "small",
    },
  },
})

export default CSCtheme
