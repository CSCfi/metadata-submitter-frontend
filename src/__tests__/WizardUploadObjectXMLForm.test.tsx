import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardUploadObjectXMLForm from "../components/SubmissionWizard/WizardForms/WizardUploadObjectXMLForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

/*
 * The rest of the test will be modified according to the new design in another PR
 */
describe("WizardStepper", () => {
  const preloadedState = {
    submissionType: ObjectSubmissionTypes.form,
    submission: {
      submissionId: "",
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      drafts: [{ accessionId: "TESTID1234", schema: ObjectTypes.study, tags: {} }],
      metadataObjects: [],
      workflow: "",
      doiInfo: { creators: [], contributors: [], subjects: [] },
    },
  }

  it("should have send button disabled when there's no validated xml file", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardUploadObjectXMLForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )
    const button = await screen.getByText(/submit/i)
    expect(button).toHaveAttribute("disabled")
  })

  it("should have uploaded file in input", async () => {
    //const file = new File(["test"], "test.xml", { type: "text/xml" })
    //renderWithProviders(
    //  <StyledEngineProvider injectFirst>
    //    <ThemeProvider theme={CSCtheme}>
    //      <WizardUploadObjectXMLForm />
    //    </ThemeProvider>
    //  </StyledEngineProvider>,
    //  { preloadedState }
    //)
    //const input = (await screen.findByTestId("xml-upload")) as HTMLInputElement
    //await userEvent.upload(input, file)
    //if (input.files) expect(input.files[0]).toStrictEqual(file)
    //expect(input.files).toHaveLength(1)
  })
})
