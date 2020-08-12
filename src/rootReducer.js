//@flow

import { combineReducers } from "@reduxjs/toolkit"

import objectTypeReducer from "features/objectTypeSlice"
import wizardStepReducer from "features/wizardStepSlice"
import submissionFolderReducer from "features/submissionFolderSlice"

const rootReducer = combineReducers({
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
  folder: submissionFolderReducer,
})

export default rootReducer
