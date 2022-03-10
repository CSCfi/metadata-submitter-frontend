import { createSlice } from "@reduxjs/toolkit"

import templateAPIService from "services/templateAPI"
import { APIResponse, DispatchReducer } from "types"

const initialState = []

const templateSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setTemplates: (_state, action) => action.payload,
    resetTemplates: () => initialState,
  },
})
export const { setTemplates, resetTemplates } = templateSlice.actions
export default templateSlice.reducer

export const getTemplates =
  (projectId: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await templateAPIService.getTemplates({ projectId })

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(setTemplates(response.data))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
