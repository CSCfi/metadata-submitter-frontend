import { combineReducers } from "@reduxjs/toolkit"

import autocompleteReducer from "features/autocompleteSlice"
import clearFormReducer from "features/clearFormSlice"
import draftStatusReducer from "features/draftStatusSlice"
import fileTypesReducer from "features/fileTypesSlice"
import focusReducer from "features/focusSlice"
import loadingReducer from "features/loadingSlice"
import localeReducer from "features/localeSlice"
import objectTypesArrayReducer from "features/objectTypesArraySlice"
import openedDoiFormReducer from "features/openedDoiFormSlice"
import openedRowsReducer from "features/openedRowsSlice"
import publishedFoldersReducer from "features/publishedFoldersSlice"
import selectedFolderReducer from "features/selectedFolderSlice"
import statusMessageReducer from "features/statusMessageSlice"
import templatesReducer from "features/templatesSlice"
import totalFoldersReducer from "features/totalFoldersSlice"
import unpublishedFoldersReducer from "features/unpublishedFoldersSlice"
import userReducer from "features/userSlice"
import wizardAlertReducer from "features/wizardAlertSlice"
import currentObjectReducer from "features/wizardCurrentObjectSlice"
import objectTypeReducer from "features/wizardObjectTypeSlice"
import submissionFolderReducer from "features/wizardSubmissionFolderSlice"
import submissionTypeReducer from "features/wizardSubmissionTypeSlice"

const rootReducer: any = combineReducers({
  locale: localeReducer,
  alert: wizardAlertReducer,
  focus: focusReducer,
  loading: loadingReducer,
  statusDetails: statusMessageReducer,
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
  openedRows: openedRowsReducer,
  totalFolders: totalFoldersReducer,
  clearForm: clearFormReducer,
  templateAccessionIds: templatesReducer,
  autocompleteField: autocompleteReducer,
  fileTypes: fileTypesReducer,
  openedDoiForm: openedDoiFormReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
