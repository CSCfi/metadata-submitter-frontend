import { createSlice } from "@reduxjs/toolkit"
import { assign, reject } from "lodash"

import type { StepObject } from "types"

const initialState: StepObject[] = []

const stepObjectSlice = createSlice({
  name: "stepObjects",
  initialState,
  reducers: {
    setObjects: (_state, action) => action.payload,
    upsertObject: (state, action) => {
      const existingObj = state.find(obj => obj.id === action.payload.accessionId)
      if (existingObj) {
        assign(existingObj, action.payload)
      } else {
        state.push(action.payload)
      }
    },
    deleteObject: (state, action) => {
      if (state)
        state = reject(state, function (o: { accessionId: string }) {
          return o.accessionId === action.payload
        })
    },
    resetObjects: () => initialState,
  },
})

export const { setObjects, upsertObject, deleteObject, resetObjects } = stepObjectSlice.actions
export default stepObjectSlice.reducer
