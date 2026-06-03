import { createSlice } from "@reduxjs/toolkit"

//import bucketsAPIService from "services/bucketsAPI"
import type { Bucket } from "types"

const initialState: Bucket[] = []

const bucketsSlice = createSlice({
  name: "buckets",
  initialState,
  reducers: {
    setBuckets: (state, action) => {
      console.log("REDUCER", action.payload)
      return action.payload.map(bucket => ({
        bucketName: bucket,
        files: [],
      }))
    },
    addFiles: (state, action) => {
      console.log("TODO! REDUCER add FILES", action.payload)
    },
    resetBuckets: () => initialState,
  },
})

export const { setBuckets, addFiles, resetBuckets } = bucketsSlice.actions
export default bucketsSlice.reducer
