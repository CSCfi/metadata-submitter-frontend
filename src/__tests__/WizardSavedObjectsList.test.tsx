import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen, within } from "@testing-library/react"
import { MemoryRouter as Router } from "react-router-dom"

import WizardSavedObjectsList from "../components/SubmissionWizard/WizardComponents/WizardSavedObjectsList"
import CSCtheme from "../theme"

import { ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"
import { ObjectInsideSubmissionWithTags } from "types"
import { renderWithProviders } from "utils/test-utils"

const submissions: ObjectInsideSubmissionWithTags[] = [
  {
    accessionId: "EDAG1",
    schema: ObjectTypes.sample,
    tags: { submissionType: ObjectSubmissionTypes.form, displayTitle: "Sample 1" },
  },
  {
    accessionId: "EDAG2",
    schema: ObjectTypes.sample,
    tags: { submissionType: ObjectSubmissionTypes.xml, fileName: "sample2.xml" },
  },
  {
    accessionId: "EDAG3",
    schema: ObjectTypes.sample,
    tags: { submissionType: ObjectSubmissionTypes.xml, fileName: "sample3.xml" },
  },
]

const drafts = [
  {
    accessionId: "EDAG1",
    schema: `draft-${ObjectTypes.sample}`,
    tags: { displayTitle: "Sample draft 1" },
  },
]

const preloadedState = {
  objectType: ObjectTypes.sample,
  submission: {
    submissionId: "",
    name: "submission name",
    description: "submission description",
    published: false,
    metadataObjects: [],
    id: "FOL12341234",
    drafts: drafts,
    workflow: "FEGA",
    doiInfo: { creators: [], contributors: [], subjects: [] },
  },
}

describe("WizardSavedObjectsList with submitted objects", () => {
  beforeEach(() => {
    renderWithProviders(
      <Router>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardSavedObjectsList objects={submissions} />
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>,
      { preloadedState }
    )
  })

  it("should have saved objects listed", () => {
    submissions.forEach(item => {
      expect(screen.getByText(item.accessionId)).toBeInTheDocument()
    })
  })

  it("should display correct submitted form' displayTitle", () => {
    submissions.forEach(item => {
      if (item.tags.submissionType === ObjectSubmissionTypes.form && item.tags.displayTitle) {
        expect(screen.getByText(item.tags.displayTitle)).toBeInTheDocument()
        expect(screen.getByText(item.tags.displayTitle)).toHaveTextContent("Sample 1")
      }
    })
  })

  it("should display correct submitted xml' displayTitle", () => {
    submissions.forEach(item => {
      if (item.tags.submissionType === ObjectSubmissionTypes.xml && item.tags.fileName) {
        expect(screen.getByText(item.tags.fileName)).toBeInTheDocument()
      }
    })
  })

  it("should have correct amount of submitted forms", () => {
    screen.getByText(/Submitted sample form/i)
    expect(screen.getByText(/Submitted sample form/i)).toBeInTheDocument()

    const formList = screen.getByRole("list", { name: ObjectSubmissionTypes.form })
    expect(formList).toBeInTheDocument()

    const { getAllByRole } = within(formList)
    const submittedForms = getAllByRole("listitem")
    expect(submittedForms.length).toBe(1)
  })

  it("should have correct amount of submitted xml", () => {
    screen.getByText(/Submitted sample xml/i)
    expect(screen.getByText(/Submitted sample xml/i)).toBeInTheDocument()

    const xmlList = screen.getByRole("list", { name: ObjectSubmissionTypes.xml })
    expect(xmlList).toBeInTheDocument()

    const { getAllByRole } = within(xmlList)
    const submittedXML = getAllByRole("listitem")
    expect(submittedXML.length).toBe(2)
  })
})

describe("WizardSavedObjectsList with drafts", () => {
  beforeEach(() => {
    renderWithProviders(
      <Router>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardSavedObjectsList objects={drafts} />
          </ThemeProvider>
        </StyledEngineProvider>
      </Router>,
      { preloadedState }
    )
  })

  it("should have draft objects listed", () => {
    drafts.forEach(item => {
      expect(screen.getByText(item.accessionId)).toBeInTheDocument()
    })
  })
})
