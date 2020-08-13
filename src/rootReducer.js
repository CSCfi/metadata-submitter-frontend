//@flow

import { combineReducers } from "@reduxjs/toolkit"

import objectTypeReducer from "features/objectTypeSlice"
import submissionFolderReducer from "features/submissionFolderSlice"
import submissionTypeReducer from "features/submissionTypeSlice"
import wizardStepReducer from "features/wizardStepSlice"

const rootReducer = combineReducers({
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
  submissionFolder: submissionFolderReducer,
  submissionType: submissionTypeReducer,
})

export default rootReducer
