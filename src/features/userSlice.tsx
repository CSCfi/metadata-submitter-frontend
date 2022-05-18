import { createSlice } from "@reduxjs/toolkit"

import userAPIService from "services/usersAPI"
import type { User, APIResponse, DispatchReducer, ObjectInsideSubmissionWithTags } from "types"

const initialState: User = {
  id: "",
  name: "",
  projects: [],
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (_state, action) => action.payload,
    resetUser: () => initialState,
  },
})

export const { setUser, resetUser } = userSlice.actions
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
        }
        dispatch(setUser(user))
        resolve(response)
      } else {
        reject(JSON.stringify(response))
      }
    })
  }

export const addDraftsToUser =
  (userId: string, drafts: Array<ObjectInsideSubmissionWithTags>) => async (): Promise<APIResponse> => {
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
