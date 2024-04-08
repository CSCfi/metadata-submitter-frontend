import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"

import WizardObjectIndex from "../components/SubmissionWizard/WizardComponents/WizardObjectIndex"
import CSCtheme from "../theme"

import { ObjectTypes } from "constants/wizardObject"
import { mockState, renderWithProviders } from "utils/test-utils"

describe("WizardObjectIndex", () => {
  it("should render badge with number correctly", async () => {
    const state = {
      ...mockState,
      submission: {
        name: "submission name",
        description: "submission description",
        published: false,
        submissionId: "FOL12341234",
        drafts: [
          { accessionId: "TESTID1234", schema: `draft-${ObjectTypes.study}`, tags: {} },
          { accessionId: "TESTID5678", schema: `draft-${ObjectTypes.study}`, tags: {} },
          { accessionId: "TESTID0101", schema: `draft-${ObjectTypes.analysis}`, tags: {} },
          { accessionId: "TESTID0202", schema: `draft-${ObjectTypes.experiment}`, tags: {} },
        ],
        metadataObjects: [
          { accessionId: "TESTID1234", schema: ObjectTypes.study, tags: {} },
          { accessionId: "TESTID5678", schema: ObjectTypes.study, tags: {} },
          { accessionId: "TESTID0101", schema: ObjectTypes.analysis, tags: {} },
          { accessionId: "TESTID0202", schema: ObjectTypes.experiment, tags: {} },
        ],
        doiInfo: { creators: [], contributors: [], subjects: [] },
        workflow: "FEGA",
      },
    }

    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardObjectIndex />
        </ThemeProvider>
      </StyledEngineProvider>,
      {
        preloadedState: state,
      }
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
