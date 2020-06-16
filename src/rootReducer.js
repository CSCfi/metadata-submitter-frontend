//@flow

import { combineReducers } from "@reduxjs/toolkit"

import objectTypeReducer from "features/objectTypeSlice"

const rootReducer = combineReducers({
  objectType: objectTypeReducer,
})

export default rootReducer
