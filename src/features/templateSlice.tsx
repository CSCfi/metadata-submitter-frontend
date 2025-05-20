import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import templateAPIService from "services/templateAPI"
import { ObjectInsideSubmissionWithTags, APIResponse, DispatchReducer } from "types"

const initialState: Array<ObjectInsideSubmissionWithTags> | [] = []

const templateSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setTemplates: (_state, action) => action.payload,
    updateTemplateDisplayTitle: (state, action) => {
      const selectedTemplate = state.find(item => item.accessionId === action.payload.accessionId)
      if (selectedTemplate) {
        selectedTemplate.tags.displayTitle = action.payload.displayTitle
      }
    },
    deleteTemplateByAccessionId: (state, action) => {
      state = _reject(state, (template: { accessionId: string }) => {
        return template.accessionId === action.payload
      })
    },
    resetTemplates: () => initialState,
  },
})
export const {
  setTemplates,
  updateTemplateDisplayTitle,
  deleteTemplateByAccessionId,
  resetTemplates,
} = templateSlice.actions
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
