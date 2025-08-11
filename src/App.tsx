import { useEffect } from "react"

import Container from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { Routes, Route, useLocation, Navigate } from "react-router"

import i18n from "./i18n"

import Footer from "components/Footer"
import Nav from "components/Nav"
import SecondaryNav from "components/SecondaryNav"
import StatusMessageHandler from "components/StatusMessageHandler"
import { Locale } from "constants/locale"
import { setLocale } from "features/localeSlice"
import { useAppSelector, useAppDispatch } from "hooks"
import Page400 from "views/ErrorPages/Page400"
import Page401 from "views/ErrorPages/Page401"
import Page403 from "views/ErrorPages/Page403"
import Page404 from "views/ErrorPages/Page404"
import Page500 from "views/ErrorPages/Page500"
import Home from "views/Home"
import Login from "views/Login"
import SubmissionWizard from "views/Submission"

const NavigationMenu = () => {
  const location = useLocation()
  return (
    <>
      <Nav isFixed={!location.pathname.includes("/submission")} />
      {location.pathname.includes("/home") && <SecondaryNav />}
    </>
  )
}

/**
 * Set up React router and app structure.
 * Routes should be in order from specific to general, root "/" and catcher "*" being the last ones.
 */
const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const locale = useAppSelector(state => state.locale)

  useEffect(() => {
    // Get locale from url and set application wide locale setting
    const getLocale = () => {
      let locale: string
      const locales = ["en", "fi"]
      const currentLocale = location.pathname.split("/")[1]
      if (locales.indexOf(currentLocale) > -1) {
        locale = currentLocale
      } else locale = Locale.defaultLocale

      i18n.changeLanguage(locale)

      dispatch(setLocale(locale))
    }
    getLocale()
  }, [dispatch])

  const setPath = (path: string) => {
    return `/:locale/${path}`
  }

  const submissionElement = (
    <Container
      component="main"
      maxWidth={false}
      sx={{
        padding: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <SubmissionWizard />
    </Container>
  )

  return (
    <>
      <CssBaseline />
      <NavigationMenu />
      <Routes>
        <Route path="/home" element={<Navigate replace to={`/${locale}/home`} />} />
        <Route
          path="/"
          element={
            <Container
              component="main"
              maxWidth={false}
              disableGutters
              sx={{
                padding: 0,
                margin: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Login />
            </Container>
          }
        />
        <Route
          path={setPath("home")}
          element={
            <Container
              component="main"
              maxWidth={false}
              disableGutters
              sx={{ bgcolor: "common.white" }}
            >
              <Home />
            </Container>
          }
        />
        <Route path={setPath("submission")}>
          <Route path=":submissionId" element={submissionElement} />
          <Route path="" element={submissionElement} />
        </Route>
        <Route path="/error401" element={<Page401 />} />
        <Route path="/error403" element={<Page403 />} />
        <Route path="/error500" element={<Page500 />} />
        <Route path="/error400" element={<Page400 />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
      <StatusMessageHandler />
      <Footer />
    </>
  )
}

export default App
