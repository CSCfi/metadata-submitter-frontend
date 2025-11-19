import { createSlice } from "@reduxjs/toolkit"

import { Locale } from "constants/translation"
import { DispatchReducer } from "types"

const initialState: string = localStorage.getItem("locale") || Locale.defaultLocale

const localeSlice = createSlice({
  name: "localeSlice",
  initialState,
  reducers: {
    setAppLocale: (_state, action) => action.payload,
  },
})

export const { setAppLocale } = localeSlice.actions
export default localeSlice.reducer

export const setLocale =
  (locale: string) =>
  (dispatch: (reducer: DispatchReducer) => void): void => {
    localStorage.setItem("locale", locale)
    dispatch(setAppLocale(locale))
  }
