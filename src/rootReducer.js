//@flow

import { combineReducers } from "@reduxjs/toolkit"

import objectTypeReducer from "features/objectTypeSlice"
import wizardStepReducer from "features/wizardStepSlice"

const rootReducer = combineReducers({
  objectType: objectTypeReducer,
  wizardStep: wizardStepReducer,
})

export default rootReducer
