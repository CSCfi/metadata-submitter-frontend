import { createSlice } from "@reduxjs/toolkit"

import { ObjectDetails, ObjectTags } from "types"

const initialObject = {
  accessionId: "",
  objectId: "",
  lastModified: "",
  objectType: "",
  status: "",
  title: "",
  submissionType: "",
  fileSize: "",
  tags: {},
}

const initialState: ObjectDetails & {
  objectId: string
  tags: ObjectTags
  cleanedValues: ObjectDetails
  index: number
} = {
  ...initialObject,
  cleanedValues: initialObject,
  index: 0,
}

const wizardCurrentObjectSlice = createSlice({
  name: "currentObject",
  initialState,
  reducers: {
    setCurrentObject: (_state, action) => action.payload,
    resetCurrentObject: () => initialState,
  },
})

export const { setCurrentObject, resetCurrentObject } = wizardCurrentObjectSlice.actions
export default wizardCurrentObjectSlice.reducer
