import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardObjectIndex from "../components/SubmissionWizard/WizardComponents/WizardObjectIndex"
import CSCtheme from "../theme"

import { ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardObjectIndex", () => {
  it("should render badge with number correctly", async () => {
    const store = mockStore({
      objectTypesArray: [
        ObjectTypes.study,
        ObjectTypes.sample,
        ObjectTypes.experiment,
        ObjectTypes.run,
        ObjectTypes.analysis,
        ObjectTypes.dac,
        ObjectTypes.policy,
        ObjectTypes.dataset,
      ],
      submissionFolder: {
        drafts: [
          { accessionId: "TESTID1234", schema: `draft-${ObjectTypes.study}` },
          { accessionId: "TESTID5678", schema: `draft-${ObjectTypes.study}` },
          { accessionId: "TESTID0101", schema: `draft-${ObjectTypes.analysis}` },
          { accessionId: "TESTID0202", schema: `draft-${ObjectTypes.experiment}` },
        ],
        metadataObjects: [
          { accessionId: "TESTID1234", schema: ObjectTypes.study },
          { accessionId: "TESTID5678", schema: ObjectTypes.study },
          { accessionId: "TESTID0101", schema: ObjectTypes.analysis },
          { accessionId: "TESTID0202", schema: ObjectTypes.experiment },
        ],
      },
    })

    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardObjectIndex />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )

    const badge = await screen.queryAllByTestId("badge")
    expect(badge).toHaveLength(3)
    const studyBadge = screen.queryAllByTestId("badge")[0]
    expect(studyBadge).toHaveTextContent("2")
    const analysisBadge = screen.queryAllByTestId("badge")[1]
    expect(analysisBadge).toHaveTextContent("1")
    const experimentBadge = screen.queryAllByTestId("badge")[2]
    expect(experimentBadge).toHaveTextContent("1")
  })
})
