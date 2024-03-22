/** The setting here is made following this instruction:
  https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
*/
import React, { PropsWithChildren } from "react"

import "@testing-library/jest-dom"
import { configureStore } from "@reduxjs/toolkit"
import { render } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"
import { Provider } from "react-redux"

import type { RootState } from "../rootReducer"
import type { AppStore } from "../store"

import rootReducer from "rootReducer"

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: rootReducer,
      preloadedState,
      middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false }),
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<object>): JSX.Element {
    return <Provider store={store}>{children}</Provider>
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
