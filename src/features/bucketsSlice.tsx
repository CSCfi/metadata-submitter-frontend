import { createSlice, PayloadAction } from "@reduxjs/toolkit"

//import bucketsAPIService from "services/bucketsAPI"
import type { Bucket } from "types"

const initialState: Bucket[] = []

const bucketsSlice = createSlice({
  name: "buckets",
  initialState,
  reducers: {
    setBuckets: (state, action) => {
      return action.payload.map(bucket => ({
        bucketName: bucket,
        files: [],
      }))
    },
    addFiles: (state, action: PayloadAction<Bucket>) => {
      return state.map(element => {
        if (element.bucketName !== action.payload.bucketName) {
          return element
        }

        return {
          bucketName: element.bucketName,
          files: action.payload.files,
        }
      })
    },
    resetBuckets: () => initialState,
  },
})

export const { setBuckets, addFiles, resetBuckets } = bucketsSlice.actions
export default bucketsSlice.reducer
