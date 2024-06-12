import React from "react"

import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles"
import { render, screen } from "@testing-library/react"
import { createInstance } from "i18next"
import { I18nextProvider, initReactI18next } from "react-i18next"

import Footer from "../components/Footer"
import CSCtheme from "../theme"
import EnTranslation from "../translations/en/translation_en.json"
import FiTranslation from "../translations/fi/translation_fi.json"

describe("Footer", () => {
  beforeEach(() => {
    // Create a new instance of i18n
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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={CSCtheme}>
          <I18nextProvider i18n={i18nTestInstance}>
            <Footer />
          </I18nextProvider>
        </ThemeProvider>
      </StyledEngineProvider>
    )
  })

  test("should render its content correctly", () => {
    const footerNames = screen.getAllByTestId("footer-name")
    const footerLinks = screen.getAllByTestId("footer-link")

    expect(footerNames.length).toBe(3)
    expect(footerNames[0]).toHaveTextContent("SD Submit")
    expect(footerNames[1]).toHaveTextContent("Service Provider")
    expect(footerNames[2]).toHaveTextContent("CSC - IT Center for Science Ltd.")

    expect(footerLinks.length).toBe(4)
    expect(footerLinks[0]).toHaveTextContent("Service description")
    expect(footerLinks[1]).toHaveTextContent("Accessibility")
    expect(footerLinks[2]).toHaveTextContent("Privacy")
    expect(footerLinks[3]).toHaveTextContent("About Sensitive Data services")
  })
})
