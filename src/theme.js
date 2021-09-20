import { createTheme } from "@material-ui/core/styles"

const defaultTheme = createTheme()

const palette = {
  primary: {
    light: "#9b416b",
    main: "#8b1a4f",
  },
  secondary: {
    main: "#dfe1e3",
    dark: "#424242",
  },
  third: {
    main: "#006476",
  },
  background: {
    default: "#FFF",
  },
  success: {
    main: "#62c480",
  },
  button: {
    edit: "#025B96",
    delete: "#E71D32",
  },
  errors: {
    yellowErrorBackground: "#FFD534",
    yellowErrorText: "#6A4C15",
    redErrorBackground: "#E71D32",
    redErrorText: "#FFFFFF",
  },
  font: {
    main: "rgba(0, 0, 0, 0.87);",
  },
  common: {
    white: "#FFF",
    black: "#000",
  },
}

/**
 * Set up custom theme that follows CSC's design guidelines.
 */
const CSCtheme = createTheme({
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
  palette: palette,
  errors: palette.errors,
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
  wizard: {
    cardHeader: {
      backgroundColor: palette.primary.main,
      color: "#FFF",
      fontWeight: "bold",
      minHeight: defaultTheme.spacing(6.875),
    },
    objectListItem: {
      border: "none",
      borderRadius: 3,
      margin: defaultTheme.spacing(1, 0),
      boxShadow: "0px 3px 10px -5px rgba(0,0,0,0.49)",
      alignItems: "flex-start",
      padding: defaultTheme.spacing(1, 0, 1, 2),
    },
  },
  tooltip: {
    backgroundColor: palette.common.white,
    color: palette.common.black,
    fontSize: defaultTheme.typography.pxToRem(14),
    boxShadow: defaultTheme.shadows[1],
  },
  form: {
    margin: defaultTheme.spacing(3, 2),
    "& .MuiTextField-root > .Mui-required": {
      color: palette.primary.main,
    },
    "& .MuiTextField-root": {
      width: "48%",
      margin: defaultTheme.spacing(1),
    },
    "& .MuiTypography-root": {
      margin: defaultTheme.spacing(1),
      ...defaultTheme.typography.subtitle1,
      fontWeight: "bold",
    },
    "& .MuiTypography-h2": {
      width: "100%",
      color: palette.primary.light,
      borderBottom: `2px solid ${palette.secondary.main}`,
    },
    "& .MuiTypography-h3": {
      width: "100%",
    },
    "& .array": {
      margin: defaultTheme.spacing(1),

      "& .arrayRow": {
        display: "flex",
        alignItems: "center",
        marginBottom: defaultTheme.spacing(1),
        width: "100%",
        "& .MuiTextField-root": {
          width: "95%",
        },
      },
      "& h2, h3, h4, h5, h6": {
        margin: defaultTheme.spacing(1, 0),
      },
      "& .MuiPaper-elevation2": {
        paddingRight: defaultTheme.spacing(1),
        marginBottom: defaultTheme.spacing(1),
        width: "60%",
        "& .array": { margin: 0 },
        "& h3, h4": { margin: defaultTheme.spacing(1) },
        "& button": { margin: defaultTheme.spacing(1) },
      },
      "& .MuiSelect-outlined": {
        marginRight: 0,
      },
    },
  },
})

export default CSCtheme
