import { screen } from "@testing-library/react"
import { MemoryRouter as Router } from "react-router"

import { renderWithProviders } from "utils/test-utils"
import Page404 from "views/ErrorPages/Page404"

describe("Page404", () => {
  test("renders Page404", () => {
    renderWithProviders(
      <Router initialEntries={["/example-route"]}>
        <Page404 />
      </Router>
    )
    expect(screen.getByText("404 – PAGE NOT FOUND")).toBeInTheDocument()
  })
})
