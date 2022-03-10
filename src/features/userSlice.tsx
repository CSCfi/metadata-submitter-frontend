import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import userAPIService from "services/usersAPI"
import type { User, APIResponse, DispatchReducer, ObjectInsideFolderWithTags } from "types"

const initialState: User = {
  id: "",
  name: "",
  projects: [],
  templates: [],
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action) => action.payload,
    updateTemplateDisplayTitle: (state: { templates: ObjectInsideFolderWithTags[] }, action) => {
      const selectedTemplate = state.templates.find(
        (item: { accessionId: string }) => item.accessionId === action.payload.accessionId
      )
      if (selectedTemplate) {
        selectedTemplate.tags.displayTitle = action.payload.displayTitle
      }
    },
    deleteTemplateByAccessionId: (state, action) => {
      state.templates = _reject(state.templates, (template: { accessionId: string }) => {
        return template.accessionId === action.payload
      })
    },
    resetUser: () => initialState,
  },
})

export const { setUser, resetUser, updateTemplateDisplayTitle, deleteTemplateByAccessionId } = userSlice.actions
export default userSlice.reducer

export const fetchUserById =
  (userId: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const response = await userAPIService.getUserById(userId)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        const user: User = {
          id: response.data.userId,
          name: response.data.name,
          projects: response.data.projects,
          templates: [],
        }
        dispatch(setUser(user))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addDraftsToUser =
  (userId: string, drafts: Array<ObjectInsideFolderWithTags>) => async (): Promise<APIResponse> => {
    const changes = [{ op: "add", path: "/templates/-", value: drafts }]
    const response = await userAPIService.patchUserById("current", changes)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
