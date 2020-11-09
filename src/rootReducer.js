//@flow

import { combineReducers } from "@reduxjs/toolkit"

import draftStatusReducer from "features/draftStatusSlice"
import wizardErrorMessageReducer from "features/wizardErrorMessageSlice"
import objectTypeReducer from "features/wizardObjectTypeSlice"
import wizardStepReducer from "features/wizardStepSlice"
import submissionFolderReducer from "features/wizardSubmissionFolderSlice"
import submissionTypeReducer from "features/wizardSubmissionTypeSlice"

const rootReducer = combineReducers({
  errorMessage: wizardErrorMessageReducer,
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
  submissionFolder: submissionFolderReducer,
  submissionType: submissionTypeReducer,
  draftStatus: draftStatusReducer,
})

export default rootReducer
