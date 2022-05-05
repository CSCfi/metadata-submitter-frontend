import { createSlice } from "@reduxjs/toolkit"

import { DispatchReducer, ObjectInsideFolderWithTags } from "types"

type stepItemObject = { id: string; displayTitle: string; objectData?: ObjectInsideFolderWithTags }

const initialState: {
  label: string
  stepItems?: {
    objectType: string
    label: string
    objects?: { ready?: stepItemObject[]; drafts?: stepItemObject[] }
  }[]
  actionButtonText?: string
}[] = [
  { label: "Submission details" },
  { label: "Study, DAC and policy" },
  { label: "Datafolder" },
  { label: "Describe" },
  { label: "Identifier and publish" },
]

const wizardAccordionObjectsSlice = createSlice({
  name: "accordion",
  initialState,
  reducers: {
    setAccordion: (_state, action) => action.payload,
    resetAccordion: () => initialState,
  },
})

export const { setAccordion, resetAccordion } = wizardAccordionObjectsSlice.actions
export default wizardAccordionObjectsSlice.reducer

export const updateAccordionItems =
  accordion =>
  (dispatch: (reducer: DispatchReducer) => void): void => {
    // console.log("set accordion: ", accordion)
    dispatch(setAccordion(accordion))
  }
