import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import MuseoSans_100 from "./fonts/MuseoSans_100.otf"
import MuseoSans_300 from "./fonts/MuseoSans_300.otf"
import MuseoSans_500 from "./fonts/MuseoSans_500.otf"
import MuseoSans_700 from "./fonts/MuseoSans_700.otf"

const defaultTheme = createTheme()

const palette = {
  primary: {
    // green colors
    main: "#006778",
    light: "#c2dbdf",
    lighter: "#d8e8ea",
    lightest: "#e5eff1",
  },
  secondary: {
    // grey colors
    main: "#595959",
    light: "#b1b2b2",
    lightest: "#dfe1e3",
  },
  background: {
    default: "#d8e8ea",
    paper: "#fff",
  },
  success: {
    main: "#3A7A06",
    light: "#51a808",
    lightest: "#e5f2da",
  },
  error: {
    // red & orange
    main: "#b90729",
    light: "#c74600",
    lightest: "#fff7e3",
  },
  info: {
    main: "#006778",
  },
  warning: { main: "#ff5800" },
  common: {
    white: "#FFF",
    black: "#000",
  },
}

export const fontSizeBreakpoints = {
  [defaultTheme.breakpoints.down("sm")]: {
    fontSize: "1.25rem",
  },
  [defaultTheme.breakpoints.between("sm", "lg")]: {
    fontSize: "1.4rem",
  },
  [defaultTheme.breakpoints.up("lg")]: {
    fontSize: "1.6rem",
  },
}

/**
 * Set up custom theme that follows CSC's design guidelines.
 */
let CSCtheme = createTheme({
  typography: {
    fontFamily: "Museo Sans, Arial, sans-serif",
    h1: { fontSize: "9.6rem" },
    h2: { fontSize: "6rem" },
    h3: { fontSize: "4.8rem" },
    h4: { fontSize: "3.2rem" },
    h5: { fontSize: "2rem" },
    h6: { fontSize: "1.25rem" },
    subtitle1: { fontSize: "1.6rem" },
    subtitle2: { fontSize: "1.4rem" },
    body1: { fontSize: "1.6rem" },
    body2: { fontSize: "1.4rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Museo Sans';
          font-style: normal;
          font-weight: 100;
          src: url(${MuseoSans_100}) format("opentype");          
        }
        @font-face {
          font-family: 'Museo Sans';
          font-style: normal;
          font-weight: 300;
          src: url(${MuseoSans_300}) format("opentype");          
        }
        @font-face {
          font-family: 'Museo Sans';
          font-style: normal;
          font-weight: 500;
          src: url(${MuseoSans_500}) format("opentype");          
        }
        @font-face {
          font-family: 'Museo Sans';
          font-style: normal;
          font-weight: 700;
          src: url(${MuseoSans_700}) format("opentype");          
        }
      `,
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
        },
        contained: fontSizeBreakpoints,
        outlined: fontSizeBreakpoints,
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: 0,
          fontSizeBreakpoints,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        cell: { minWidth: "none !important", maxWidth: "none !important" },
        columnHeader: { minWidth: "none !important", maxWidth: "none !important", fontSizeBreakpoints },
        row: { minWidth: "none !important", maxWidth: "none !important", fontSizeBreakpoints },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { padding: 0, fontSizeBreakpoints },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: fontSizeBreakpoints,
        menuItem: {
          backgroundColor: "white",
          color: palette.secondary.main,
          "&:hover": {
            backgroundColor: palette.primary.light,
            color: palette.primary.main,
          },
          "&.MuiMenuItem-gutters.Mui-selected": {
            backgroundColor: palette.common.white,
            color: palette.primary.main,
          },
        },
      },
    },
  },

  spacing: factor => `${factor}rem`,
  palette: palette,
  secondary: palette.secondary,
  error: palette.error,
  info: palette.info,
  success: palette.success,
  warning: palette.warning,
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
      backgroundColor: palette.common.white,
      position: "sticky",
      top: 8,
      zIndex: 2,
      borderBottom: `0.1rem solid ${palette.primary.light}`,
      paddingTop: "1.5rem",
      paddingBottom: "1.5rem",
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

  form: {
    "& .MuiTextField-root": {
      width: "70%",
    },
    "& .MuiTypography-root": {
      fontWeight: "bold",
    },
    "& .MuiTypography-h2": {
      width: "100%",
      color: palette.secondary.main,
      borderBottom: `2px solid ${palette.secondary.light}`,
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

CSCtheme = responsiveFontSizes(CSCtheme)

export default CSCtheme
