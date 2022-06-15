import type {} from "@mui/x-data-grid/themeAugmentation"

declare module "@mui/material/styles" {
  interface CustomTheme {
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
    secondary: { main: string; light: string; lightest: string }
    spacing: (factor) => string
    error: {
      main: string
    }
    info: {
      main: string
    }
    success: { main: string }
    warning: { main: string }
    components: {
      wizard?: {
        cardHeader?: Record<string, unknown>
        objectListItem?: Record<string, unknown>
      }
    }
    wizard: {
      cardHeader: Record<string, unknown>
      objectListItem: Record<string, unknown>
    }

    form: Object
    props: Record<string, unknown>
  }

  interface Theme extends CustomTheme {}
  interface ThemeOptions extends CustomTheme {}
}

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    third: { main: string }
    button: { edit: string; delete: string }
    wizard?: {
      cardHeader?: Record<string, unknown>
      objectListItem?: Record<string, unknown>
    }
  }
  interface PaletteOptions {
    third?: { main?: string }
    button?: { edit?: string; delete: string }
    wizard?: {
      cardHeader?: Record<string, unknown>
      objectListItem?: Record<string, unknown>
    }
  }

  interface PaletteColor {
    lighter: string
    lightest: string
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
