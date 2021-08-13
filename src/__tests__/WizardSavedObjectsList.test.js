import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider } from "@material-ui/core/styles"
import { render, screen, within } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardSavedObjectsList from "../components/NewDraftWizard/WizardComponents/WizardSavedObjectsList"
import CSCtheme from "../theme"

import { ObjectTypes, ObjectSubmissionTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardStepper", () => {
  const store = mockStore({
    objectType: ObjectTypes.sample,
    wizardStep: 1,
    submissionFolder: {
      name: "folder name",
      description: "folder description",
      published: false,
      metadataObjects: [],
      id: "FOL12341234",
      drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.sample }],
    },
  })

  const submissions = [
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

  beforeEach(() => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={CSCtheme}>
          <WizardSavedObjectsList objects={submissions} />
        </ThemeProvider>
      </Provider>
    )
  })

  it("should have saved objects listed", () => {
    submissions.forEach(item => {
      expect(screen.getByText(item.accessionId)).toBeInTheDocument()
    })
  })

  it("should display correct submitted form' displayTitle", () => {
    submissions.forEach(item => {
      if (item.tags.submissionType === ObjectSubmissionTypes.form) {
        expect(screen.getByText(item.tags.displayTitle)).toBeInTheDocument()
        expect(screen.getByText(item.tags.displayTitle)).toHaveTextContent("Sample 1")
      }
    })
  })

  it("should display correct submitted xml' displayTitle", () => {
    submissions.forEach(item => {
      if (item.tags.submissionType === ObjectSubmissionTypes.xml) {
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
