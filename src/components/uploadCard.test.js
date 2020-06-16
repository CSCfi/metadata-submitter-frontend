import React from "react"
import "@testing-library/jest-dom/extend-expect"
import { render, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import UploadCard from "./uploadCard"
const mockStore = configureStore([])

test("All categories are rendered when objectType is not set", () => {
  const store = mockStore({
    objectType: {
      objectType: "",
    },
  })
  const { getByText } = render(
    <Provider store={store}>
      <UploadCard />
    </Provider>
  )
  const types = [
    "Study",
    "Project",
    "Sample",
    "Experiment",
    "Run",
    "Analysis",
    "Dac",
    "Policy",
    "Dataset",
  ]
  types.forEach(type => {
    const headerElement = getByText("Submit an object")
    expect(headerElement).toBeInTheDocument()
    const typeElement = getByText(`${type}`)
    expect(typeElement).toBeInTheDocument()
  })
})

test("Individual upload card is rendered when objectType is set", () => {
  const store = mockStore({
    objectType: {
      objectType: "sample",
    },
  })
  const { getByText } = render(
    <Provider store={store}>
      <UploadCard />
    </Provider>
  )
  const typeElement = getByText("Submit sample")
  expect(typeElement).toBeInTheDocument()
})

test("Correct dispatch action is sent when link button is clicked", () => {
  const store = mockStore({
    objectType: {
      objectType: "",
    },
  })
  store.dispatch = jest.fn()

  const { getByText } = render(
    <Provider store={store}>
      <UploadCard />
    </Provider>
  )
  const button = getByText("Sample").closest("div")
  fireEvent.click(button)
  expect(store.dispatch).toHaveBeenCalledTimes(1)
  expect(store.dispatch).toHaveBeenCalledWith({
    payload: "sample",
    type: "objectType/setObjectType",
  })
})
