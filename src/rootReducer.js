//@flow

import { combineReducers } from "@reduxjs/toolkit"

import draftStatusReducer from "features/draftStatusSlice"
import focusReducer from "features/focusSlice"
import publishedFoldersReducer from "features/publishedFoldersSlice"
import selectedFolderReducer from "features/selectedFolderSlice"
import unpublishedFoldersReducer from "features/unpublishedFoldersSlice"
import userReducer from "features/userSlice"
import wizardAlertReducer from "features/wizardAlertSlice"
import draftObjectReducer from "features/wizardDraftObjectSlice"
import objectTypeReducer from "features/wizardObjectTypeSlice"
import wizardStatusMessageReducer from "features/wizardStatusMessageSlice"
import wizardStepReducer from "features/wizardStepSlice"
import submissionFolderReducer from "features/wizardSubmissionFolderSlice"
import submissionTypeReducer from "features/wizardSubmissionTypeSlice"

const rootReducer = combineReducers({
  alert: wizardAlertReducer,
  focus: focusReducer,
  statusDetails: wizardStatusMessageReducer,
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
  submissionFolder: submissionFolderReducer,
  submissionType: submissionTypeReducer,
  draftStatus: draftStatusReducer,
  draftObject: draftObjectReducer,
  user: userReducer,
  unpublishedFolders: unpublishedFoldersReducer,
  publishedFolders: publishedFoldersReducer,
  selectedFolder: selectedFolderReducer,
})

export default rootReducer
