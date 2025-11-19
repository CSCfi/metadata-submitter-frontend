import { act } from "react"

import { fireEvent, screen, waitFor } from "@testing-library/react"
import { vi } from "vitest"

import WizardFillObjectDetailsForm from "../components/SubmissionWizard/WizardForms/WizardFillObjectDetailsForm"

import { SDObjectTypes } from "constants/wizardObject"
import { renderWithProviders } from "utils/test-utils"

describe("WizardFillObjectDetailsForm", () => {
  vi.mock("../schemas/submission.json", () => ({
    default: {
      title: "Submission",
      type: "object",
      properties: {
        metadata: {
          type: "object",
          title: "Public metadata of your dataset",
          properties: {
            creators: {
              type: "array",
              title: "Creators",
              description:
                "The main researcher(s) involved in producing the data, or the author(s) of the publication.",
              items: {
                type: "object",
                title: "Main researcher(s) involved with data or the author(s) of the publication.",
                required: ["givenName", "familyName", "affiliation"],
                properties: {
                  givenName: {
                    type: "string",
                    title: "Given Name",
                  },
                  familyName: {
                    type: "string",
                    title: "Family Name",
                  },
                  affiliation: {
                    type: "array",
                    title: "Affiliations",
                    description:
                      "The organizational or institutional affiliation of the creator. Upon filling the form with the organization or institution suggestion will be made from Research Organization Registry (ROR) Community API.",
                    items: {
                      type: "object",
                      title: "Affiliation Details",
                      required: ["name"],
                      properties: {
                        name: {
                          type: "string",
                          title: "Name of the place of affiliation",
                        },
                      },
                    },
                  },
                },
              },
            },
            keywords: {
              type: "string",
              title: "Keywords",
              description: "A list of keywords or tags describing the resources.",
            },
          },
        },
      },
    },
  }))

  const state = {
    objectType: SDObjectTypes.publicMetadata,
    submission: {
      projectId: "Project1",
      description: "Testdescription",
      submissionId: "FOL90524783",
      name: "Testname",
      title: "TestTitle",
      published: false,
      workflow: "SD",
      metadata: { creators: [], keywords: "" },
    },
  }

  test("should create metadata form from submission json schema", async () => {
    renderWithProviders(
      <WizardFillObjectDetailsForm />,

      { preloadedState: state }
    )
    const text = await waitFor(() => screen.getByText("Creators"))
    expect(text).toBeDefined()
  })

  test("should validate without errors on blur", async () => {
    renderWithProviders(<WizardFillObjectDetailsForm />, { preloadedState: state })

    const input = await waitFor(() => screen.getByTestId("keywords"))
    await waitFor(() => {
      fireEvent.change(input, { target: { value: "key1,key2" } })
      fireEvent.blur(input)
    })
    await waitFor(() => expect(input).toBeVisible())
  })

  test("should show partly tooltip with Read more/Expand option on mouse over if the text length is > 60 chars", async () => {
    renderWithProviders(<WizardFillObjectDetailsForm />, { preloadedState: state })

    // For description with length more than 60, the tooltip should display Read more/Expand
    const tooltipIcon = await waitFor(() => screen.getAllByTestId("HelpOutlineIcon")[0])

    act(() => {
      fireEvent.mouseOver(tooltipIcon)
    })

    const tooltipBox = await waitFor(() => screen.getByRole("tooltip"))
    expect(tooltipBox).toBeVisible()
    expect(tooltipBox).toHaveTextContent("Show more")

    const showmoreLink = await waitFor(() => screen.getByText("Show more"))

    act(() => {
      fireEvent.click(showmoreLink)
    })
    await waitFor(() =>
      expect(tooltipBox).toHaveTextContent(
        "The main researcher(s) involved in producing the data, or the author(s) of the publication."
      )
    )

    const showlessLink = await waitFor(() => screen.getByText("Show less"))

    act(() => {
      fireEvent.click(showlessLink)
    })

    await waitFor(() =>
      expect(tooltipBox).toHaveTextContent(
        "The main researcher(s) involved in producing the data, or th...Show more"
      )
    )
  })

  test("should show full tooltip on mouse over if the text length is <= 60 chars", async () => {
    renderWithProviders(<WizardFillObjectDetailsForm />, { preloadedState: state })

    // For description with length equal or less than 60, the tooltip should display all content
    const TooltipIcon = await waitFor(() => screen.getAllByTestId("HelpOutlineIcon")[1])

    act(() => {
      fireEvent.mouseOver(TooltipIcon)
    })

    const tooltipBox = await waitFor(() => screen.getByRole("tooltip"))
    expect(tooltipBox).toBeVisible()
    expect(tooltipBox).toHaveTextContent("A list of keywords or tags describing the resources.")
  })
})
