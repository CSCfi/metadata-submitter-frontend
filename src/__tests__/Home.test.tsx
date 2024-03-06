import React from "react"

import "@testing-library/jest-dom"
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import CSCtheme from "../theme"

import App from "App"
import { renderWithProviders } from "utils/test-utils"

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

describe("HomePage", () => {
  beforeEach(() => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/en/home"]}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <App />
          </ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>,
      {
        preloadedState: {
          user: {
            id: "001",
            name: "Test User",
            projects: [
              { projectId: "PROJECT1", projectNumber: "Project 1" },
              { projectId: "PROJECT2", projectNumber: "Project 2" },
            ],
          },
        },
      }
    )
  })

  test("should render its content correctly", () => {
    expect(screen.getByText("My submissions")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Drafts" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Published" })).toBeInTheDocument()
    expect(screen.getByTestId("link-create-submission")).toBeInTheDocument()
  })
})
