import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { createInstance } from "i18next"
import { I18nextProvider, initReactI18next } from "react-i18next"
import { MemoryRouter } from "react-router-dom" // Import MemoryRouter

import Footer from "../components/Footer"
import CSCtheme from "../theme"
import EnTranslation from "../translations/en/translation_en.json"
import FiTranslation from "../translations/fi/translation_fi.json"

describe("Footer", () => {
  beforeEach(() => {
    const i18nTestInstance = createInstance()

    i18nTestInstance.use(initReactI18next).init({
      resources: {
        en: {
          translation: EnTranslation,
        },
        fi: {
          translation: FiTranslation,
        },
      },
      lng: "en",
      fallbackLng: ["en", "fi"],
      interpolation: {
        escapeValue: false,
      },
    })

    render(
      <MemoryRouter initialEntries={["/"]}>
        {" "}
        {/* Wrap with MemoryRouter and set initialEntries */}
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={CSCtheme}>
            <I18nextProvider i18n={i18nTestInstance}>
              <Footer />
            </I18nextProvider>
          </ThemeProvider>
        </StyledEngineProvider>
      </MemoryRouter>
    )
  })

  test("should render its content correctly", () => {
    const footerNames = screen.getAllByTestId("footer-name")
    const footerLinks = screen.getAllByTestId("footer-link")

    expect(footerNames.length).toBe(2)
    expect(footerNames[0]).toHaveTextContent("SD Submit")
    expect(footerNames[1]).toHaveTextContent("CSC - IT Center for Science Ltd.")

    expect(footerLinks.length).toBe(5)
    expect(footerLinks[0]).toHaveTextContent("CSC - IT Center for Science Ltd.")
    expect(footerLinks[1]).toHaveTextContent("Service description")
    expect(footerLinks[2]).toHaveTextContent("Accessibility")
    expect(footerLinks[3]).toHaveTextContent("Privacy")
    expect(footerLinks[4]).toHaveTextContent("About Sensitive Data services")
  })
})
