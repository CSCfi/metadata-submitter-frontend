import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import App from "./App"
import configureStore from "redux-mock-store"
const mockStore = configureStore([])

test.each([
  "Study",
  "Project",
  "Sample",
  "Experiment",
  "Run",
  "Analysis",
  "Dac",
  "Policy",
  "Dataset",
])("All categories are rendered when objectType is not set", type => {
  const store = mockStore({
    objectType: {
      objectType: "",
    },
  })
  const { getByText } = render(
    <Provider store={store}>
      <App />
    </Provider>
  )
  const typeElement = getByText(`${type}`)
  expect(typeElement).toBeInTheDocument()
})
