/** The setting here is made following this instruction:
  https://redux.js.org/usage/writing-tests#setting-up-a-reusable-test-render-function
*/
import React, { PropsWithChildren } from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { configureStore } from "@reduxjs/toolkit"
import { render } from "@testing-library/react"
import type { RenderOptions } from "@testing-library/react"
import { Provider } from "react-redux"

import type { RootState } from "../rootReducer"
import type { AppStore } from "../store"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import rootReducer from "rootReducer"
import { Schema } from "types"

import "../i18n"

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<RootState>
  store?: AppStore
}

export const mockState = {
  user: {
    id: "001",
    name: "Test User",
    projects: [
      { projectId: "PROJECT1", projectNumber: "Project 1" },
      { projectId: "PROJECT2", projectNumber: "Project 2" },
    ],
  },
  objectType: ObjectTypes.dac,
  submissionType: ObjectSubmissionTypes.form,
  objectTypesArray: Object.keys(ObjectTypes) as Schema[],
  submission: {
    description: "Test desciption",
    submissionId: "FOL90524783",
    name: "Test name",
    published: false,
    workflow: "FEGA",
    drafts: [],
    metadataObjects: [],
    doiInfo: { creators: [], contributors: [], subjects: [] },
  },
  openedXMLModal: false,
  currentObject: {
    objectId: "",
    tags: {
      fileName: "Test XML file",
      fileSize: "1",
    },
    accessionId: "TESTID0000",
    lastModified: "",
    objectType: "",
    status: "",
    title: "",
    submissionType: "",
    cleanedValues: {
      accessionId: "TESTID0000",
      lastModified: "",
      objectType: "",
      status: "",
      title: "",
      submissionType: "",
    },
    index: 1,
  },
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = mockState,
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
    return (
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}> {children}</ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}
