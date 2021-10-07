//@flow
import { createSlice } from "@reduxjs/toolkit"

import userAPIService from "services/usersAPI"
import type { ObjectInsideFolderWithTags } from "types"

type User = {
  id: string,
  name: string,
  templates: Array<ObjectInsideFolderWithTags>,
  folders: Array<string>,
}

const initialState: {} | User = {}

const userSlice: any = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => action.payload,
    resetUser: () => initialState,
  },
})

export const { setUser, resetUser } = userSlice.actions
export default userSlice.reducer

export const fetchUserById =
  (userId: string): ((dispatch: (any) => void) => Promise<any>) =>
  async (dispatch: any => void) => {
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
  (userId: string, drafts: any): ((dispatch: (any) => void) => Promise<any>) =>
  async () => {
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
