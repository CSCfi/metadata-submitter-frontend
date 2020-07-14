import React from "react"
import "@testing-library/jest-dom/extend-expect"
import { render, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import NewDraftCard from "./newDraftCard"
const mockStore = configureStore([])

describe("NewDraftCard", () => {
  test("has all categories rendered when objectType is not set", () => {
    const store = mockStore({
      objectType: {
        objectType: "",
      },
    })
    const { getByText } = render(
      <Provider store={store}>
        <NewDraftCard />
      </Provider>
    )
    const types = [
      "Study",
      "Sample",
      "Experiment",
      "Run",
      "Analysis",
      "Dac",
      "Policy",
      "Dataset",
    ]
    types.forEach(type => {
      const headerElement = getByText("Create new draft")
      expect(headerElement).toBeInTheDocument()
      const typeElement = getByText(`${type}`)
      expect(typeElement).toBeInTheDocument()
    })
  })

  test("show single upload card when objectType is set", () => {
    const store = mockStore({
      objectType: {
        objectType: "sample",
      },
    })
    const { getByText } = render(
      <Provider store={store}>
        <NewDraftCard />
      </Provider>
    )
    const header = getByText("sample")
    expect(header).toBeInTheDocument()
    const subHeader = getByText("Choose type of submission")
    expect(subHeader).toBeInTheDocument()
  })

  test("sends correct dispatch action when link button is clicked", () => {
    const store = mockStore({
      objectType: {
        objectType: "",
      },
    })
    store.dispatch = jest.fn()

    const { getByText } = render(
      <Provider store={store}>
        <NewDraftCard />
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
})
