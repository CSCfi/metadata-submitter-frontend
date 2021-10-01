//@flow

import { combineReducers } from "@reduxjs/toolkit"

import clearFormReducer from "features/clearFormSlice"
import draftStatusReducer from "features/draftStatusSlice"
import focusReducer from "features/focusSlice"
import loadingReducer from "features/loadingSlice"
import objectTypesArrayReducer from "features/objectTypesArraySlice"
import publishedFoldersReducer from "features/publishedFoldersSlice"
import templatesReducer from "features/templatesSlice"
import selectedFolderReducer from "features/selectedFolderSlice"
import totalFoldersReducer from "features/totalFoldersSlice"
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
  loading: loadingReducer,
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
  objectTypesArray: objectTypesArrayReducer,
  totalFolders: totalFoldersReducer,
  clearForm: clearFormReducer,
  templateAccessionIds: templatesReducer,
})

export default rootReducer
