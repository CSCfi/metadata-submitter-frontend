import React from "react"

import { screen } from "@testing-library/react"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardUploadObjectXMLForm from "../components/SubmissionWizard/WizardForms/WizardUploadObjectXMLForm"

import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

/*
 * The rest of the test will be modified according to the new design in another PR
 */
describe("WizardStepper", () => {
  it("should have send button disabled when there's no validated xml file", async () => {
    renderWithProviders(<WizardUploadObjectXMLForm />)
    const button = await screen.getByText(/submit/i)
    expect(button).toHaveAttribute("disabled")
  })

  it("should have uploaded file in input", async () => {
    //const file = new File(["test"], "test.xml", { type: "text/xml" })
    //renderWithProviders(
    //      <WizardUploadObjectXMLForm />
    //  { preloadedState }
    //)
    //const input = (await screen.findByTestId("xml-upload")) as HTMLInputElement
    //await userEvent.upload(input, file)
    //if (input.files) expect(input.files[0]).toStrictEqual(file)
    //expect(input.files).toHaveLength(1)
  })
})
