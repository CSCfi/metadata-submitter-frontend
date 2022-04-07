import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardUploadObjectXMLForm from "../components/NewDraftWizard/WizardForms/WizardUploadObjectXMLForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

expect.extend({ toMatchDiffSnapshot })

describe("WizardStepper", () => {
  const store = mockStore({
    submissionType: ObjectSubmissionTypes.form,
    submissionFolder: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study }],
    },
  })

  it("should have send button disabled when there's no validated xml file", async () => {
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardUploadObjectXMLForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    const button = await screen.getByText(/submit/i)
    expect(button).toHaveAttribute("disabled")
  })

  it("should have uploaded file in input", async () => {
    const file = new File(["test"], "test.xml", { type: "text/xml" })
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardUploadObjectXMLForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    const input = (await screen.findByTestId("xml-upload")) as HTMLInputElement
    userEvent.upload(input, file)

    if (input.files) expect(input.files[0]).toStrictEqual(file)
    expect(input.files).toHaveLength(1)
  })
})
