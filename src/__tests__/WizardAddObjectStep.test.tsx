/* XML upload is disabled for MVP */
import { act } from "react"

import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/SubmissionWizard/WizardSteps/WizardAddObjectStep"

import { SDObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  /* This test needs to be changed in the future when we afford XML object.
   * Currently we narrows down to only have form object.
   */

  test("should render appropriate card", async () => {
    act(() =>
      renderWithProviders(
        <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=4" }]}>
          <Routes>
            <Route path="/submission" element={<WizardAddObjectStep />} />
          </Routes>
        </MemoryRouter>,
        {
          preloadedState: {
            objectType: SDObjectTypes.publicMetadata,
          },
        }
      )
    )
    expect(screen.getByTestId("form1")).toBeInTheDocument()
  })
})
