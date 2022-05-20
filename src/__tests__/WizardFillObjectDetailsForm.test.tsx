import React from "react"

import "@testing-library/jest-dom/extend-expect"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import configureStore from "redux-mock-store"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"

const mockStore = configureStore([])

describe("WizardFillObjectDetailsForm", () => {
  const schema = {
    title: "Study",
    type: "object",
    required: ["descriptor"],
    properties: {
      descriptor: {
        type: "object",
        title: "Study Description",
        required: ["studyTitle"],
        properties: {
          studyTitle: {
            title: "Study Title",
            description: "Title of the study as would be used in a publication.",
            type: "string",
          },
          studyTestField: {
            title: "Study Test Field",
            description: "Study test field description.",
            type: "string",
          },
        },
      },
      center: {
        title: "Description for Center",
        description: "More for backwards compatibility, we might not need it.",
        type: "object",
        properties: {
          centerProjectName: {
            title: "Center Project Name",
            description:
              " Submitter defined project name. This field is intended for backward tracking of the study record to the submitter's LIMS.",
            type: "string",
          },
        },
      },
    },
  }

  const store = mockStore({
    objectType: ObjectTypes.study,
    submissionType: ObjectSubmissionTypes.form,
    submission: {
      description: "AWD",
      id: "FOL90524783",
      name: "Testname",
      published: false,
      metadataObjects: [
        { accessionId: "id1", schema: ObjectTypes.study },
        { accessionId: "id2", schema: ObjectTypes.sample },
      ],
    },
  })

  sessionStorage.setItem(`cached_study_schema`, JSON.stringify(schema))

  it("should create study form from schema in sessionStorage", async () => {
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    await waitFor(() => screen.getByText("Study Description"))
    expect(screen.getByText("Study Description")).toBeDefined()
  })

  it("should validate without errors on blur", async () => {
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    await waitFor(() => {
      const input = screen.getByTestId("descriptor.studyTitle")
      fireEvent.change(input, { target: { value: "Title" } })
      fireEvent.blur(input)
      expect(input).toBeVisible()
    })
  })

  test("should show tooltip on mouse over", async () => {
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )

    await waitFor(() => {
      const tooltip = screen.getByLabelText("Title of the study as would be used in a publication.")
      fireEvent.mouseOver(tooltip)
      expect(tooltip).toBeVisible()
    })
  })

  // Note: If this test runs before form creation, form creation fails because getItem spy messes sessionStorage init somehow
  test("should call sessionStorage", async () => {
    const spy = jest.spyOn(Storage.prototype, "getItem")
    render(
      <Provider store={store}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <WizardFillObjectDetailsForm />
          </ThemeProvider>
        </StyledEngineProvider>
      </Provider>
    )
    expect(spy).toBeCalledWith("cached_study_schema")

    await waitFor(() => {
      expect(spy.mock.calls.length).toBe(1)
    })
  })
})
