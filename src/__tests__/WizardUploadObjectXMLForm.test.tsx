import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardUploadObjectXMLForm from "../components/SubmissionWizard/WizardForms/WizardUploadObjectXMLForm"
import CSCtheme from "../theme"

import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

/*
 * The rest of the test will be modified according to the new design in another PR
 */
describe("WizardStepper", () => {
  it("should have send button disabled when there's no validated xml file", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardUploadObjectXMLForm />
        </ThemeProvider>
      </StyledEngineProvider>
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
