import { createSlice } from "@reduxjs/toolkit"

import userAPIService from "services/usersAPI"
import type { User, APIResponse, DispatchReducer } from "types"

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
