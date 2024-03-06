import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { act, fireEvent, screen, waitFor } from "@testing-library/react"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"
import CSCtheme from "../theme"

import { ObjectSubmissionTypes, ObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

describe("WizardFillObjectDetailsForm", () => {
  const schema = {
    title: "Study",
    type: "object",
    required: ["descriptor"],
    properties: {
      descriptor: {
        type: "object",
        title: "Study Details",
        required: ["studyTitle"],
        properties: {
          studyTitle: {
            title: "Study Title",
            description: "Title of the study",
            type: "string",
          },
          studyDescription: {
            title: "Study Description",
            description: "Study Description should provide additional information about the study.",
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

  const preloadedState = {
    objectType: ObjectTypes.study,
    submissionType: ObjectSubmissionTypes.form,
    submission: {
      description: "AWD",
      submissionId: "FOL90524783",
      name: "Testname",
      published: false,
      metadataObjects: [
        { accessionId: "id1", schema: ObjectTypes.study, tags: {} },
        { accessionId: "id2", schema: ObjectTypes.sample, tags: {} },
      ],
      drafts: [],
      workflow: "",
      doiInfo: { creators: [], contributors: [], subjects: [] },
    },
    openedXMLModal: false,
  }

  sessionStorage.setItem(`cached_study_schema`, JSON.stringify(schema))

  it("should create study form from schema in sessionStorage", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )
    await waitFor(() => screen.getByText("Study Details"))
    expect(screen.getByText("Study Details")).toBeDefined()
  })

  it("should validate without errors on blur", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )
    await waitFor(() => {
      const input = screen.getByTestId("descriptor.studyTitle")
      fireEvent.change(input, { target: { value: "Title" } })
      fireEvent.blur(input)
      expect(input).toBeVisible()
    })
  })

  test("should show full tooltip on mouse over if the text length is <= 60 chars", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )

    // For description with length equal or less than 60, the tooltip should display all content
    const TooltipIcon = await waitFor(() => screen.getAllByTestId("HelpOutlineIcon")[0])

    act(() => {
      fireEvent.mouseOver(TooltipIcon)
    })

    const tooltipBox = await waitFor(() => screen.getByRole("tooltip"))
    expect(tooltipBox).toBeVisible()
    expect(tooltipBox).toHaveTextContent("Title of the study")
  })

  test("should show partly tooltip with Read more/Expand option on mouse over if the text length is > 60 chars", async () => {
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )

    // For description with length more than 60, the tooltip should display Read more/Expand
    const tooltipIcon = await waitFor(() => screen.getAllByTestId("HelpOutlineIcon")[1])

    act(() => {
      fireEvent.mouseOver(tooltipIcon)
    })

    const tooltipBox = await waitFor(() => screen.getByRole("tooltip"))
    expect(tooltipBox).toBeVisible()
    expect(tooltipBox).toHaveTextContent("Read more/Expand")

    const showmoreLink = await waitFor(() => screen.getByText("Read more/Expand"))

    act(() => {
      fireEvent.click(showmoreLink)
    })

    expect(tooltipBox).toHaveTextContent("Study Description should provide additional information about the study.")

    const showlessLink = await waitFor(() => screen.getByText("Show less"))

    act(() => {
      fireEvent.click(showlessLink)
    })

    expect(tooltipBox).toHaveTextContent("Read more/Expand")
  })

  // Note: If this test runs before form creation, form creation fails because getItem spy messes sessionStorage init somehow
  test("should call sessionStorage", async () => {
    const spy = jest.spyOn(Storage.prototype, "getItem")
    renderWithProviders(
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <WizardFillObjectDetailsForm />
        </ThemeProvider>
      </StyledEngineProvider>,
      { preloadedState }
    )
    expect(spy).toBeCalledWith("cached_study_schema")

    await waitFor(() => {
      expect(spy.mock.calls.length).toBe(1)
    })
  })
})
