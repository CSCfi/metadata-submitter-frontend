import { createSlice } from "@reduxjs/toolkit"

const initialState: [] = []

const templates: any = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTemplateAccessionIds: (state, action) => action.payload,
    resetTemplateAccessionIds: () => initialState,
  },
})

export const { setTemplateAccessionIds, resetTemplateAccessionIds } = templates.actions
export default templates.reducer
