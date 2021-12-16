declare module "@mui/material/styles" {
  interface Theme {
    errors: {
      yellowErrorBackground: string
      yellowErrorText: string
      redErrorBackground: string
      redErrorText: string
    }
    wizard: {
      cardHeader: any
      objectListItem: any
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
    errors?: {
      yellowErrorBackground?: string
      yellowErrorText?: string
      redErrorBackground?: string
      redErrorText?: string
    }
    wizard?: {
      cardHeader?: any
      objectListItem?: any
    }
    tooltip?: {
      backgroundColor?: string
      color?: string
      fontSize?: string
      boxShadow?: string
    }
    form?: Object
    props: any
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
  import type { Theme } from "@mui/material/styles"

  interface DefaultTheme extends Theme {}
}

export {} // Empty export is needed for Create-React-App to recognize module augmentationts from d.ts file extensions
