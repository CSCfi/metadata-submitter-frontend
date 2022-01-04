import { createSlice } from "@reduxjs/toolkit"

import { Locale } from "constants/locale"

const initialState: string = localStorage.getItem("locale") || Locale.defaultLocale

const localeSlice = createSlice({
  name: "localeSlice",
  initialState,
  reducers: {
    setAppLocale: (state, action) => action.payload,
  },
})

export const { setAppLocale } = localeSlice.actions
export default localeSlice.reducer

export const setLocale =
  (locale: string) =>
  (dispatch: (reducer: any) => void): any => {
    localStorage.setItem("locale", locale)
    dispatch(setAppLocale(locale))
  }
