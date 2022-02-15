declare module "@mui/material/styles" {
  interface CustomTheme extends Theme {
    typography: {
      fontFamily: string
      pxToRem: (px: number) => string
      h1: { fontSize: string }
      h2: { fontSize: string }
      h3: { fontSize: string }
      h4: { fontSize: string }
      h5: { fontSize: string }
      h6: { fontSize: string }
      subtitle1: { fontSize: string }
      subtitle2: { fontSize: string }
      body1: { fontSize: string }
      body2: { fontSize: string }
    }
    error: {
      main: string
    }
    info: {
      main: string
    }
    success: { main: string }
    warning: { main: string }
    wizard: {
      cardHeader: Record<string, unknown>
      objectListItem: Record<string, unknown>
    }
    tooltip: {
      backgroundColor: string
      color: string
      fontSize: string
      boxShadow: string
    }
    form: Object
  }

  interface ThemeOptions {
    typography: {
      fontFamily: string
      fontSize: number
    }
    error: {
      main: string
    }
    info: {
      main: string
    }
    success: { main: string }
    warning: { main: string }
    wizard?: {
      cardHeader?: Record<string, unknown>
      objectListItem?: Record<string, unknown>
    }
    tooltip?: {
      backgroundColor?: string
      color?: string
      fontSize?: string
      boxShadow?: string
    }
    form?: Object
    props: Record<string, unknown>
  }
}

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    third: { main: string }
    button: { edit: string; delete: string }
  }
  interface PaletteOptions {
    third?: { main?: string }
    button?: { edit?: string; delete: string }
  }
}

declare module "@mui/private-theming" {
  import type { CustomTheme } from "@mui/material/styles"

  interface DefaultTheme extends CustomTheme {}
}
import type { Theme } from "@mui/material/styles"

declare module "@mui/styles/defaultTheme" {
  interface DefaultTheme extends Theme {}
}

export {} // Empty export is needed for Create-React-App to recognize module augmentationts from d.ts file extensions
