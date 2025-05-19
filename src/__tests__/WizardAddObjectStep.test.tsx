import { act } from "react"

import { screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { toMatchDiffSnapshot } from "snapshot-diff"

import WizardAddObjectStep from "../components/SubmissionWizard/WizardSteps/WizardAddObjectStep"

import { ObjectSubmissionsArray, ObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

expect.extend({ toMatchDiffSnapshot })

describe("WizardAddObjectStep", () => {
  it("should not render any cards if no selected object type", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
        <Routes>
          <Route path="/submission" element={<WizardAddObjectStep />} />
        </Routes>
      </MemoryRouter>,
      {
        preloadedState: {
          objectType: "",
        },
      }
    )
    expect(
      screen.getByText("Add objects by clicking the name, then fill form or upload XML File.")
    ).toBeInTheDocument()
  })

  test("should render appropriate card", async () => {
    ObjectSubmissionsArray.forEach(typeName => {
      act(() =>
        renderWithProviders(
          <MemoryRouter initialEntries={[{ pathname: "/submission", search: "step=1" }]}>
            <Routes>
              <Route path="/submission" element={<WizardAddObjectStep />} />
            </Routes>
          </MemoryRouter>,
          {
            preloadedState: {
              objectType: ObjectTypes.study,
              submissionType: typeName,
            },
          }
        )
      )
      expect(screen.getByTestId(typeName)).toBeInTheDocument()
    })
  })
})
