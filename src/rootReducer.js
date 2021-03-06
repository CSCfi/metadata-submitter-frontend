//@flow

import { combineReducers } from "@reduxjs/toolkit"

import draftStatusReducer from "features/draftStatusSlice"
import focusReducer from "features/focusSlice"
import objectsArrayReducer from "features/objectsArraySlice"
import publishedFoldersReducer from "features/publishedFoldersSlice"
import selectedFolderReducer from "features/selectedFolderSlice"
import unpublishedFoldersReducer from "features/unpublishedFoldersSlice"
import userReducer from "features/userSlice"
import wizardAlertReducer from "features/wizardAlertSlice"
import currentObjectReducer from "features/wizardCurrentObjectSlice"
import objectTypeReducer from "features/wizardObjectTypeSlice"
import wizardStatusMessageReducer from "features/wizardStatusMessageSlice"
import submissionFolderReducer from "features/wizardSubmissionFolderSlice"
import submissionTypeReducer from "features/wizardSubmissionTypeSlice"

const rootReducer: any = combineReducers({
  alert: wizardAlertReducer,
  focus: focusReducer,
  statusDetails: wizardStatusMessageReducer,
  objectType: objectTypeReducer,
  submissionFolder: submissionFolderReducer,
  submissionType: submissionTypeReducer,
  draftStatus: draftStatusReducer,
  currentObject: currentObjectReducer,
  user: userReducer,
  unpublishedFolders: unpublishedFoldersReducer,
  publishedFolders: publishedFoldersReducer,
  selectedFolder: selectedFolderReducer,
  objectsArray: objectsArrayReducer,
})

export default rootReducer
