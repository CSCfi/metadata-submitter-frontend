// For some reason there's a problem with importing TypedUseSelectorHook
// eslint-disable-next-line import/named
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import type { RootState } from "../rootReducer"
import type { AppDispatch } from "../store"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = (): any => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
