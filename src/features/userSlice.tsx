import { createSlice } from "@reduxjs/toolkit"
import _reject from "lodash/reject"

import userAPIService from "services/usersAPI"
import type { User, APIResponse, DispatchReducer, ObjectInsideFolderWithTags, ObjectTags } from "types"

const initialState: User = {
  id: "",
  name: "",
  templates: [],
  folders: [],
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
          templates: response.data.templates,
          folders: response.data.folders,
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

export const replaceTemplate =
  (index: number, displayTitle: string, accessionId: string) =>
  async (dispatch: (reducer: DispatchReducer) => void): Promise<APIResponse> => {
    const tags: ObjectTags = { displayTitle: displayTitle }

    const changes = [{ op: "replace", path: `/templates/${index}/tags`, value: tags }]
    const response = await userAPIService.patchUserById("current", changes)

    return new Promise((resolve, reject) => {
      if (response.ok) {
        dispatch(updateTemplateDisplayTitle({ accessionId: accessionId, displayTitle: displayTitle }))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }
