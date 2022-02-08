import { Dispatch } from "react"

import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import type { RootState } from "../rootReducer"
import type { AppDispatch } from "../store"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): Dispatch<AnyAction> &
  ThunkDispatch<unknown, null, AnyAction> &
  ThunkDispatch<unknown, undefined, AnyAction> => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
