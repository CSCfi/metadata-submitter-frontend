import { createTheme, responsiveFontSizes } from "@mui/material/styles"

import MuseoSans_100 from "./fonts/MuseoSans_100.otf"
import MuseoSans_300 from "./fonts/MuseoSans_300.otf"
import MuseoSans_500 from "./fonts/MuseoSans_500.otf"
import MuseoSans_700 from "./fonts/MuseoSans_700.otf"

const defaultTheme = createTheme()

/*
  Colour reference https://design-system.csc.fi/design-tokens/color
  lightest 100, light 200, main 600, dark 800, darkest 900
*/

const palette = {
  primary: {
    // green colors
    lightest: "#e6f0f2", // active table row, unselected side nav item
    light: "#cce1e4",
    mediumLight: "#c2dbdf", // only for active side navigation
    main: "#006778",
    dark: "#003e48",
    darkest: "#002930",
  },
  secondary: {
    // grey colors (tertiary in csc-ui)
    lightest: "#eff0f1",
    light: "#dfe1e3",
    main: "#5e6a71",
    dark: "#384044",
  },
  background: {
    default: "#cce1e4",
    paper: "#fff",
  },
  success: {
    light: "#dceece",
    main: "#51a808",
    dark: "#316505",
  },
  error: {
    light: "#f8cece",
    main: "#dd0c0c",
    dark: "#7e0707",
  },
  warning: {
    light: "#ffdecc",
    main: "#ff5800",
    dark: "#993500",
  },
  info: {
    light: "#cce6f1",
    main: "#0082bb",
    dark: "#004e70",
  },
  accent: {
    light: "#CCF4F0", // link hover
    main: "#00c7b2",
    dark: "#00776b",
  },
  common: {
    white: "#FFF",
    black: "#000",
  },
  text: {
    primary: "#002930", // primary darkest
    secondary: "#006778", // primary main
  },
  action: {
    hover: "#cce1e4",
  },
  DataGrid: {
    bg: "none",
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
          padding: "0 !important",
          fontSizeBreakpoints,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: fontSizeBreakpoints,
        cell: { flex: "1 1 auto", textAlign: "left" },
        columnHeader: {
          minWidth: "none !important",
          maxWidth: "none !important",
          width: "100% !important",
        },
        row: { minWidth: "none !important", maxWidth: "none !important" },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: { paddingLeft: "0.5rem", fontSizeBreakpoints },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "capitalize",
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
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
          "&.MuiMenuItem-gutters": {
            fontSize: "small",
          },
          "&.MuiMenuItem-gutters.Mui-selected": {
            backgroundColor: palette.primary.light,
            color: palette.primary.main,
          },
        },
        select: {
          fontSize: "small",
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
      zIndex: 1200,
      height: "8rem",
      borderBottom: `0.1rem solid ${palette.primary.light}`,
      top: 0,
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
      color: palette.primary.main,
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
