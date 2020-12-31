//@flow
import { createSlice } from "@reduxjs/toolkit"

import userAPIService from "services/usersAPI"

const initialState = {}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => action.payload,
    resetUser: () => initialState,
  },
})

export const { setUser, resetUser } = userSlice.actions
export default userSlice.reducer

type User = {
  id: string,
  name: string,
  drafts: Array<string>,
  folders: Array<string>,
}

export const fetchUserById = (userId: string) => async (dispatch: any => void) => {
  const response = await userAPIService.getUserID(userId)
  return new Promise((resolve, reject) => {
    if (response.ok) {
      const user: User = {
        id: response.data.userId,
        name: response.data.name,
        drafts: response.data.drafts,
        folders: response.data.folders,
      }
      dispatch(setUser(user))
      resolve(response)
    } else {
      reject(JSON.stringify(response))
    }
  })
}
