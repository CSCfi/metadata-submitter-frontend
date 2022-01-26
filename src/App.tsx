import React, { useEffect } from "react"

import Container, { ContainerProps } from "@mui/material/Container"
import CssBaseline from "@mui/material/CssBaseline"
import { styled } from "@mui/material/styles"
import { makeStyles } from "@mui/styles"
import * as i18n from "i18next"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"

import SelectedFolderDetails from "components/Home/SelectedFolderDetails"
import SubmissionFolderList from "components/Home/SubmissionFolderList"
import Nav from "components/Nav"
import StatusMessageHandler from "components/StatusMessageHandler"
import { Locale } from "constants/locale"
import { ObjectTypes } from "constants/wizardObject"
import { setLocale } from "features/localeSlice"
import { setObjectTypesArray } from "features/objectTypesArraySlice"
import { useAppSelector, useAppDispatch } from "hooks"
import schemaAPIService from "services/schemaAPI"
import Page400 from "views/ErrorPages/Page400"
import Page401 from "views/ErrorPages/Page401"
import Page403 from "views/ErrorPages/Page403"
import Page404 from "views/ErrorPages/Page404"
import Page500 from "views/ErrorPages/Page500"
import Home from "views/Home"
import Login from "views/Login"
import NewDraftWizard from "views/NewDraftWizard"

const useStyles = makeStyles(theme => ({
  content: {
    padding: theme.spacing(8, 0, 6),
  },
  wizardContent: {
    padding: theme.spacing(0),
    margin: theme.spacing(8, 0, 0),
    width: "100%",
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  errorContent: {
    width: "100%",
    marginTop: theme.spacing(10),
  },
}))

const LoginContent: React.FC<ContainerProps & { component: "main" }> = styled(Container)(() => ({
  padding: 0,
  margin: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
}))

// paths that don't show navigation menu on top
const pathsWithoutNav = ["/error400", "/error401", "/error403", "/error500"]

const NavigationMenu = () => {
  const location = useLocation()
  if (pathsWithoutNav.indexOf(location.pathname) !== -1) {
    return null
  }
  return <Nav />
}

/**
 * Set up React router and app structure.
 * Routes should be in order from specific to general, root "/" and catcher "*" being the last ones.
 */
const App: React.FC = () => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const locale = useAppSelector(state => state.locale)

  // Fetch array of schemas from backend and store it in frontend
  // Fetch only if the initial array is empty
  // if there is any errors while fetching, it will return a manually created ObjectsArray instead
  // &&
  // Handle initial locale setting
  useEffect(() => {
    if (location.pathname === "/" || pathsWithoutNav.indexOf(location.pathname) !== -1) return
    let isMounted = true
    const getSchemas = async () => {
      const response = await schemaAPIService.getAllSchemas()

      if (isMounted) {
        if (response.ok) {
          const schemas = response.data
            .filter(
              (schema: { title: string }) =>
                schema.title !== "Project" && schema.title !== "Submission" && schema.title !== "Datacite DOI schema"
            )
            .map((schema: { title: string }) => schema.title.toLowerCase())
          dispatch(setObjectTypesArray(schemas))
        } else {
          dispatch(
            setObjectTypesArray([
              ObjectTypes.study,
              ObjectTypes.sample,
              ObjectTypes.experiment,
              ObjectTypes.run,
              ObjectTypes.analysis,
              ObjectTypes.dac,
              ObjectTypes.policy,
              ObjectTypes.dataset,
            ])
          )
        }
      }
    }

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

    getSchemas()
    getLocale()
    return () => {
      isMounted = false
    }
  }, [dispatch])

  const setPath = (path: string) => {
    return `/:locale/${path}`
  }

  const newDraftElement = (
    <Container component="main" maxWidth={false} className={classes.wizardContent}>
      <NewDraftWizard />
    </Container>
  )

  return (
    <React.Fragment>
      <CssBaseline />
      <NavigationMenu />
      <Routes>
        <Route path="/home" element={<Navigate replace to={`/${locale}/home`} />} />
        <Route
          path="/"
          element={
            <LoginContent component="main" maxWidth={false} disableGutters>
              <Login />
            </LoginContent>
          }
        />
        <Route
          path={setPath("home")}
          element={
            <Container component="main" maxWidth="lg" className={classes.content}>
              <Home />
            </Container>
          }
        />
        <Route
          path={setPath("home/drafts")}
          element={
            <Container component="main" maxWidth="md" className={classes.content}>
              <SubmissionFolderList />
            </Container>
          }
        />
        <Route
          path={setPath("home/drafts/:folderId")}
          element={
            <Container component="main" maxWidth="md" className={classes.content}>
              <SelectedFolderDetails />
            </Container>
          }
        />
        <Route
          path={setPath("home/published")}
          element={
            <Container component="main" maxWidth="md" className={classes.content}>
              <SubmissionFolderList />
            </Container>
          }
        />
        <Route
          path={setPath("home/published/:folderId")}
          element={
            <Container component="main" maxWidth="md" className={classes.content}>
              <SelectedFolderDetails />
            </Container>
          }
        />
        <Route path={setPath("newdraft")}>
          <Route path=":folderId" element={newDraftElement} />
          <Route path="" element={newDraftElement} />
        </Route>
        <Route path="/error401" element={<Page401 />} />
        <Route path="/error403" element={<Page403 />} />
        <Route path="/error500" element={<Page500 />} />
        <Route path="/error400" element={<Page400 />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
      {/* Centralized status message handler */}
      <StatusMessageHandler />
    </React.Fragment>
  )
}

export default App
