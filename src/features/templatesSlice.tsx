import { createSlice } from "@reduxjs/toolkit"

const initialState: string[] = []

const templates = createSlice({
  name: "templates",
  initialState,
  reducers: {
    setTemplateAccessionIds: (_state, action) => action.payload,
    resetTemplateAccessionIds: () => initialState,
  },
})

export const { setTemplateAccessionIds, resetTemplateAccessionIds } = templates.actions
export default templates.reducer
