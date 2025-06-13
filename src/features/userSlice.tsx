import { createSlice } from "@reduxjs/toolkit"

import userAPIService from "services/usersAPI"
import type { User, DispatchReducer } from "types"

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

export const fetchUser = () => async (dispatch: (reducer: DispatchReducer) => void) => {
  try {
    const response = await userAPIService.getUser()
    const user: User = {
      id: response.data["user_id"],
      name: response.data["user_name"],
      projects: response.data["projects"].map(project => ({ projectId: project["project_id"] })),
    }
    dispatch(setUser(user))
  } catch (error) {
    console.error(error)
  }
}
