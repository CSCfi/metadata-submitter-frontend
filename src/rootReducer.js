//@flow

import { combineReducers } from "@reduxjs/toolkit"

import draftStatusReducer from "features/draftStatusSlice"
import draftObjectReducer from "features/wizardDraftObjectSlice"
import objectTypeReducer from "features/wizardObjectTypeSlice"
import wizardStatusMessageReducer from "features/wizardStatusMessageSlice"
import wizardStepReducer from "features/wizardStepSlice"
import submissionFolderReducer from "features/wizardSubmissionFolderSlice"
import submissionTypeReducer from "features/wizardSubmissionTypeSlice"

const rootReducer = combineReducers({
  statusDetails: wizardStatusMessageReducer,
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
  submissionFolder: submissionFolderReducer,
  submissionType: submissionTypeReducer,
  draftStatus: draftStatusReducer,
  draftObject: draftObjectReducer,
})

export default rootReducer
